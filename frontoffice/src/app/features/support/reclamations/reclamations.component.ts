import { Component, OnInit } from '@angular/core';
import { ReviewService } from '../../../core/services/review.service';
import { AuthService } from '../../../core/services/auth.service';
import {
  ReclamationResponse, ReclamationRequest,
  ReviewResponse, StatusReclamation, MotifReclamation
} from '../../../core/models/review.model';

@Component({
  selector: 'app-reclamations',
  templateUrl: './reclamations.component.html',
  styleUrls: ['./reclamations.component.css']
})
export class ReclamationsComponent implements OnInit {

  // ── Données ──────────────────────────────────────────────────────────────
  reclamations: ReclamationResponse[] = [];
  myReviews: ReviewResponse[] = [];
  selectedReclamation: ReclamationResponse | null = null;
  selectedStatus: StatusReclamation | 'All' = 'All';

  loading = true;
  error = false;

  // ── Formulaire de signalement ─────────────────────────────────────────────
  showForm = false;
  submitting = false;
  submitSuccess = false;
  submitError = false;

  form: ReclamationRequest = {
    reviewId: 0,
    reportedByUserId: 0,
motif: 'FAKE_REVIEW',
    description: ''
  };

  readonly motifs: { value: MotifReclamation; label: string }[] = [
  { value: 'FAKE_REVIEW',       label: 'Avis faux ou trompeur' },
  { value: 'SPAM',              label: 'Spam' },
  { value: 'ABUSIVE_LANGUAGE',  label: 'Langage abusif' },
  { value: 'IRRELEVANT',        label: 'Hors sujet' },
  { value: 'OTHER',             label: 'Autre' }
];

  readonly statusFilters: Array<StatusReclamation | 'All'> = [
    'All', 'PENDING', 'IN_REVIEW', 'CONFIRMED', 'REJECTED'
  ];

  private currentUserId = 0;

  constructor(
    private reviewService: ReviewService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentAuthUser();
    if (user?.userId) {
      this.currentUserId = user.userId;
      this.form.reportedByUserId = user.userId;
    }
    this.loadData();
  }

  private loadData(): void {
    this.loading = true;
    // Charger en parallèle mes reclamations et mes reviews (pour le formulaire)
    this.reviewService.getAllReclamations().subscribe({
      next: (all) => {
        this.reclamations = all.filter(r => r.reportedByUserId === this.currentUserId);
        if (this.reclamations.length > 0) this.selectedReclamation = this.reclamations[0];
        this.loading = false;
      },
      error: () => { this.error = true; this.loading = false; }
    });

    this.reviewService.getAllReviews().subscribe({
      next: (all) => {
        // Reviews que j'ai reçues = je peux les signaler
        this.myReviews = all.filter(r => r.reviewedUserId === this.currentUserId && !r.isDeleted);
      }
    });
  }

  // ── Filtrage ──────────────────────────────────────────────────────────────
  get filteredReclamations(): ReclamationResponse[] {
    if (this.selectedStatus === 'All') return this.reclamations;
    return this.reclamations.filter(r => r.status === this.selectedStatus);
  }

  selectStatus(s: StatusReclamation | 'All'): void {
    this.selectedStatus = s;
    const visible = this.filteredReclamations;
    if (visible.length > 0 && !visible.find(r => r.id === this.selectedReclamation?.id)) {
      this.selectedReclamation = visible[0];
    }
  }

  selectReclamation(r: ReclamationResponse): void {
    this.selectedReclamation = r;
  }

  // ── Formulaire ────────────────────────────────────────────────────────────
  openForm(): void {
    this.showForm = true;
    this.submitSuccess = false;
    this.submitError = false;
    this.form = { reviewId: 0, reportedByUserId: this.currentUserId, motif: 'FAKE_REVIEW', description: '' };
  }

  closeForm(): void {
    this.showForm = false;
  }

  submitReclamation(): void {
    if (!this.form.reviewId || !this.form.description.trim()) return;
    this.submitting = true;
    this.submitError = false;

    this.reviewService.createReclamation(this.form).subscribe({
      next: (created) => {
        this.reclamations = [created, ...this.reclamations];
        this.selectedReclamation = created;
        this.submitting = false;
        this.submitSuccess = true;
        setTimeout(() => { this.showForm = false; this.submitSuccess = false; }, 1800);
      },
      error: () => { this.submitting = false; this.submitError = true; }
    });
  }

  // ── Helpers CSS ───────────────────────────────────────────────────────────
  getStatusClass(status: StatusReclamation): string {
    const map: Record<StatusReclamation, string> = {
      PENDING:   'status-open',
      IN_REVIEW: 'status-review',
      CONFIRMED: 'status-resolved',
      REJECTED:  'status-urgent'
    };
    return map[status] ?? '';
  }

  getStatusLabel(status: StatusReclamation): string {
    const map: Record<StatusReclamation, string> = {
      PENDING:   'En attente',
      IN_REVIEW: 'En cours',
      CONFIRMED: 'Confirmée',
      REJECTED:  'Rejetée'
    };
    return map[status] ?? status;
  }

  formatDate(d: string): string {
    if (!d) return '';
    return new Date(d).toLocaleDateString('fr-TN', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  getMotifLabel(m: MotifReclamation): string {
    return this.motifs.find(x => x.value === m)?.label ?? m;
  }

  trackById(_: number, r: ReclamationResponse): number { return r.id; }
}
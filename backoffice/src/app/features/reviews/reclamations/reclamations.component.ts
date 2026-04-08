import { Component, OnInit } from '@angular/core';
import { ReviewService } from '../../../core/services/review.service';
import { ReclamationResponse, StatusReclamation, MotifReclamation } from '../../../core/models/review.model';

@Component({
  selector: 'app-reclamations',
  templateUrl: './reclamations.component.html',
  styleUrl: './reclamations.component.css'
})
export class ReclamationsComponent implements OnInit {

  reclamations: ReclamationResponse[] = [];
  filtered: ReclamationResponse[] = [];
  selected: ReclamationResponse | null = null;

  loading = true;
  error = false;
  processing = false;

  selectedStatus: StatusReclamation | 'ALL' = 'ALL';

  // Modal action
  showModal = false;
  modalAction: 'in-review' | 'confirm' | 'reject' | null = null;
  adminComment = '';
  readonly ADMIN_ID = 1; // ID admin connecté

  readonly statusOptions: Array<StatusReclamation | 'ALL'> = [
    'ALL', 'PENDING', 'IN_REVIEW', 'CONFIRMED', 'REJECTED'
  ];

  constructor(private reviewService: ReviewService) {}

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.reviewService.getAllReclamations().subscribe({
      next: (data) => {
        this.reclamations = data;
        this.applyFilter();
        if (this.filtered.length > 0) this.selected = this.filtered[0];
        this.loading = false;
      },
      error: () => { this.error = true; this.loading = false; }
    });
  }

  applyFilter(): void {
    this.filtered = this.selectedStatus === 'ALL'
      ? [...this.reclamations]
      : this.reclamations.filter(r => r.status === this.selectedStatus);
  }

  setFilter(s: StatusReclamation | 'ALL'): void {
    this.selectedStatus = s;
    this.applyFilter();
    if (this.filtered.length > 0 &&
        !this.filtered.find(r => r.id === this.selected?.id)) {
      this.selected = this.filtered[0];
    }
  }

  select(r: ReclamationResponse): void { this.selected = r; }

  // ── Actions workflow ─────────────────────────────────────
  openAction(action: 'in-review' | 'confirm' | 'reject'): void {
    this.modalAction = action;
    this.adminComment = '';
    this.showModal = true;
  }

  closeModal(): void { this.showModal = false; this.modalAction = null; }

  executeAction(): void {
    if (!this.selected || !this.modalAction) return;
    this.processing = true;

    const id = this.selected.id;
    const comment = this.adminComment || undefined;
    let obs$;

    if (this.modalAction === 'in-review') {
      obs$ = this.reviewService.markInReview(id, this.ADMIN_ID, comment);
    } else if (this.modalAction === 'confirm') {
      obs$ = this.reviewService.confirmReclamation(id, this.ADMIN_ID, comment);
    } else {
      obs$ = this.reviewService.rejectReclamation(id, this.ADMIN_ID, comment);
    }

    obs$.subscribe({
      next: (updated) => {
        const idx = this.reclamations.findIndex(r => r.id === id);
        if (idx !== -1) this.reclamations[idx] = updated;
        this.selected = updated;
        this.applyFilter();
        this.processing = false;
        this.closeModal();
      },
      error: () => { this.processing = false; }
    });
  }

  deleteReclamation(id: number): void {
    this.reviewService.deleteReclamation(id).subscribe({
      next: () => {
        this.reclamations = this.reclamations.filter(r => r.id !== id);
        this.applyFilter();
        this.selected = this.filtered[0] ?? null;
      }
    });
  }

  // ── Helpers ──────────────────────────────────────────────
  get pendingCount(): number { return this.reclamations.filter(r => r.status === 'PENDING').length; }
  get inReviewCount(): number { return this.reclamations.filter(r => r.status === 'IN_REVIEW').length; }
  get resolvedCount(): number { return this.reclamations.filter(r => r.status === 'CONFIRMED').length; }

  getStatusClass(s: StatusReclamation): string {
    const m: Record<StatusReclamation, string> = {
      PENDING: 'status-pending', IN_REVIEW: 'status-review',
      CONFIRMED: 'status-confirmed', REJECTED: 'status-rejected'
    };
    return m[s] ?? '';
  }

  getStatusLabel(s: StatusReclamation): string {
    const m: Record<StatusReclamation, string> = {
      PENDING: 'En attente', IN_REVIEW: 'En cours',
      CONFIRMED: 'Confirmée', REJECTED: 'Rejetée'
    };
    return m[s] ?? s;
  }

  getMotifLabel(m: MotifReclamation): string {
    const map: Record<MotifReclamation, string> = {
      FAKE_REVIEW: 'Avis faux', SPAM: 'Spam',
      ABUSIVE_LANGUAGE: 'Langage abusif',
      IRRELEVANT: 'Hors sujet', OTHER: 'Autre'
    };
    return map[m] ?? m;
  }

  formatDate(d: string): string {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('fr-TN', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  getActionLabel(): string {
    if (this.modalAction === 'in-review') return 'Prendre en charge';
    if (this.modalAction === 'confirm')   return 'Confirmer';
    return 'Rejeter';
  }

  getActionClass(): string {
    if (this.modalAction === 'confirm') return 'btn-action--success';
    if (this.modalAction === 'reject')  return 'btn-action--danger';
    return 'btn-action--accent';
  }

  canTakeAction(r: ReclamationResponse): boolean {
    return r.status === 'PENDING' || r.status === 'IN_REVIEW';
  }

  trackById(_: number, r: ReclamationResponse): number { return r.id; }
}
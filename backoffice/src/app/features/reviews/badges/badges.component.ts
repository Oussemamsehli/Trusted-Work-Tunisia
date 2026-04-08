import { Component, OnInit } from '@angular/core';
import { ReviewService } from '../../../core/services/review.service';
import { BadgeResponse, BadgeRequest, CategorieBadge, Rarete } from '../../../core/models/review.model';

@Component({
  selector: 'app-badges',
  templateUrl: './badges.component.html',
  styleUrl: './badges.component.css'
})
export class BadgesComponent implements OnInit {

  badges: BadgeResponse[] = [];
  loading = true;
  error = false;

  showForm = false;
  editingId: number | null = null;
  submitting = false;
  deleteConfirmId: number | null = null;

  form: BadgeRequest = { name: '', description: '', categorie: 'PERFORMANCE', rarete: 'COMMON', points: 100 };

 // Ligne raretes[]
readonly raretes: Rarete[] = ['COMMON', 'RARE', 'EPIC', 'LEGENDARY'];

// Ligne categories[]
readonly categories: CategorieBadge[] = ['TRUST', 'ACTIVITY', 'PERFORMANCE'];

  constructor(private reviewService: ReviewService) {}

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.reviewService.getAllBadges().subscribe({
      next: (data) => { this.badges = data; this.loading = false; },
      error: () => { this.error = true; this.loading = false; }
    });
  }

  openCreate(): void {
    this.editingId = null;
    this.form = { name: '', description: '', categorie: 'PERFORMANCE', rarete: 'COMMON', points: 100 };
    this.showForm = true;
  }

  openEdit(b: BadgeResponse): void {
    this.editingId = b.id;
    this.form = { name: b.name, description: b.description, categorie: b.categorie, rarete: b.rarete, points: b.points };
    this.showForm = true;
  }

  closeForm(): void { this.showForm = false; this.editingId = null; }

  submit(): void {
    if (!this.form.name.trim()) return;
    this.submitting = true;

    const obs$ = this.editingId
      ? this.reviewService.updateBadge(this.editingId, this.form)
      : this.reviewService.createBadge(this.form);

    obs$.subscribe({
      next: (saved) => {
        if (this.editingId) {
          const idx = this.badges.findIndex(b => b.id === this.editingId);
          if (idx !== -1) this.badges[idx] = saved;
        } else {
          this.badges = [saved, ...this.badges];
        }
        this.submitting = false;
        this.closeForm();
      },
      error: () => { this.submitting = false; }
    });
  }

  confirmDelete(id: number): void { this.deleteConfirmId = id; }
  cancelDelete(): void { this.deleteConfirmId = null; }

  executeDelete(): void {
    if (!this.deleteConfirmId) return;
    this.reviewService.deleteBadge(this.deleteConfirmId).subscribe({
      next: () => {
        this.badges = this.badges.filter(b => b.id !== this.deleteConfirmId);
        this.deleteConfirmId = null;
      }
    });
  }

  // Méthode getRareteClass — clés exactes
getRareteClass(r: Rarete): string {
  const m: Record<Rarete, string> = {
    COMMON:    'r-common',
    RARE:      'r-rare',
    EPIC:      'r-epic',
    LEGENDARY: 'r-legendary'
  };
  return m[r] ?? '';
}

// Méthode getCategorieClass — clés exactes
getCategorieClass(c: CategorieBadge): string {
  const m: Record<CategorieBadge, string> = {
    TRUST:       'c-trust',
    ACTIVITY:    'c-activity',
    PERFORMANCE: 'c-perf'
  };
  return m[c] ?? '';
}

  trackById(_: number, b: BadgeResponse): number { return b.id; }
}
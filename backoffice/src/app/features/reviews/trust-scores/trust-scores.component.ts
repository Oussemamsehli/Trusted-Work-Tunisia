import { Component, OnInit } from '@angular/core';
import { ReviewService } from '../../../core/services/review.service';
import { TrustScoreResponse, CategorieConfiance } from '../../../core/models/review.model';

@Component({
  selector: 'app-trust-scores',
  templateUrl: './trust-scores.component.html',
  styleUrl: './trust-scores.component.css'
})
export class TrustScoresComponent implements OnInit {

  scores: TrustScoreResponse[] = [];
  filtered: TrustScoreResponse[] = [];
  loading = true;
  error = false;

  selectedCategorie: CategorieConfiance | 'ALL' = 'ALL';
  deleteConfirmId: number | null = null;

  readonly categories: Array<CategorieConfiance | 'ALL'> = ['ALL', 'FAIBLE', 'MOYENNE', 'ELEVEE'];

  constructor(private reviewService: ReviewService) {}

  ngOnInit(): void {
    this.reviewService.getAllTrustScores().subscribe({
      next: (data) => { this.scores = data; this.applyFilter(); this.loading = false; },
      error: () => { this.error = true; this.loading = false; }
    });
  }

  applyFilter(): void {
    this.filtered = this.selectedCategorie === 'ALL'
      ? [...this.scores]
      : this.scores.filter(s => s.categorie === this.selectedCategorie);
  }

  confirmDelete(id: number): void { this.deleteConfirmId = id; }
  cancelDelete(): void { this.deleteConfirmId = null; }
  executeDelete(): void {
    if (!this.deleteConfirmId) return;
    this.reviewService.deleteTrustScore(this.deleteConfirmId).subscribe({
      next: () => {
        this.scores = this.scores.filter(s => s.id !== this.deleteConfirmId);
        this.applyFilter();
        this.deleteConfirmId = null;
      }
    });
  }

  get avgScore(): string {
    if (!this.scores.length) return '0';
    return (this.scores.reduce((a, s) => a + s.score, 0) / this.scores.length).toFixed(1);
  }

  getCatClass(c: CategorieConfiance): string {
    return { FAIBLE: 'cat-faible', MOYENNE: 'cat-moyenne', ELEVEE: 'cat-elevee' }[c] ?? '';
  }

  getTendClass(t: string): string {
    return { EN_HAUSSE: 'tend-up', STABLE: 'tend-stable', EN_BAISSE: 'tend-down' }[t] ?? '';
  }

  getTendIcon(t: string): string {
    return { EN_HAUSSE: 'fa-arrow-trend-up', STABLE: 'fa-minus', EN_BAISSE: 'fa-arrow-trend-down' }[t] ?? 'fa-minus';
  }

  formatDate(d: string): string {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('fr-TN', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  trackById(_: number, s: TrustScoreResponse): number { return s.id; }
}
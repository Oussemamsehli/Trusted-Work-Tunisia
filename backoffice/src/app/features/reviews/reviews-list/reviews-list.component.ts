import { Component, OnInit } from '@angular/core';
import { ReviewService } from '../../../core/services/review.service';
import { ReviewResponse } from '../../../core/models/review.model';

@Component({
  selector: 'app-reviews-list',
  templateUrl: './reviews-list.component.html',
  styleUrl: './reviews-list.component.css'
})
export class ReviewsListComponent implements OnInit {

  reviews: ReviewResponse[] = [];
  filtered: ReviewResponse[] = [];
  loading = true;
  error = false;

  searchTerm = '';
  selectedType: string = 'ALL';
  selectedRating: string = 'ALL';

  deleteConfirmId: number | null = null;
  deleting = false;

  constructor(private reviewService: ReviewService) {}

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.loading = true;
    this.reviewService.getAllReviews().subscribe({
      next: (data) => {
        this.reviews = data.filter(r => !r.isDeleted);
        this.applyFilters();
        this.loading = false;
      },
      error: () => { this.error = true; this.loading = false; }
    });
  }

  applyFilters(): void {
    let result = [...this.reviews];

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(r =>
        r.comment?.toLowerCase().includes(term) ||
        r.reviewerId.toString().includes(term) ||
        r.reviewedUserId.toString().includes(term)
      );
    }

    if (this.selectedType !== 'ALL') {
      result = result.filter(r => r.reviewType === this.selectedType);
    }

    if (this.selectedRating !== 'ALL') {
      const rating = parseInt(this.selectedRating);
      result = result.filter(r => r.overallRating === rating);
    }

    this.filtered = result;
  }

  confirmDelete(id: number): void {
    this.deleteConfirmId = id;
  }

  cancelDelete(): void {
    this.deleteConfirmId = null;
  }

  executeDelete(): void {
    if (!this.deleteConfirmId) return;
    this.deleting = true;

    this.reviewService.deleteReview(this.deleteConfirmId).subscribe({
      next: () => {
        this.reviews = this.reviews.filter(r => r.id !== this.deleteConfirmId);
        this.applyFilters();
        this.deleteConfirmId = null;
        this.deleting = false;
      },
      error: () => { this.deleting = false; }
    });
  }

  get totalReviews(): number { return this.reviews.length; }

  get avgRating(): string {
    if (!this.reviews.length) return '0.0';
    const sum = this.reviews.reduce((a, r) => a + r.overallRating, 0);
    return (sum / this.reviews.length).toFixed(1);
  }

  get positiveCount(): number {
    return this.reviews.filter(r => r.overallRating >= 4).length;
  }

  getRatingClass(r: number): string {
    if (r >= 4) return 'rating-good';
    if (r === 3) return 'rating-mid';
    return 'rating-bad';
  }

  formatDate(d: string): string {
    if (!d) return '';
    return new Date(d).toLocaleDateString('fr-TN', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  trackById(_: number, r: ReviewResponse): number { return r.id; }
}
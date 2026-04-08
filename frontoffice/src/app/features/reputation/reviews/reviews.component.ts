import { Component, OnInit } from '@angular/core';
import { ReviewService } from '../../../core/services/review.service';
import { AuthService } from '../../../core/services/auth.service';
import { ReviewResponse } from '../../../core/models/review.model';

type SentimentLabel = 'Positive' | 'Neutral' | 'Flagged';
type FilterOption = 'All' | SentimentLabel;

@Component({
  selector: 'app-reviews',
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.css']
})
export class ReviewsComponent implements OnInit {

  reviews: ReviewResponse[] = [];
  loading = true;
  error = false;

  selectedFilter: FilterOption = 'All';
  currentPage = 1;
  readonly pageSize = 4;

  stats = {
    averageRating: 0,
    totalReviews: 0,
    positiveRate: 0,
    verifiedRate: 0
  };

  private currentUserId: number = 0;

  constructor(
    private reviewService: ReviewService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentAuthUser();
    if (user?.userId) {
      this.currentUserId = user.userId;
    }
    this.loadReviews();
  }

  private loadReviews(): void {
    this.loading = true;
    this.error = false;

    this.reviewService.getAllReviews().subscribe({
      next: (all) => {
        // Garder uniquement les reviews où je suis le reviewedUser (reçues)
        this.reviews = all.filter(
          r => r.reviewedUserId === this.currentUserId && !r.isDeleted && r.isVisible
        );
        this.computeStats();
        this.loading = false;
      },
      error: () => {
        this.error = true;
        this.loading = false;
      }
    });
  }

  private computeStats(): void {
    const total = this.reviews.length;
    if (total === 0) {
      this.stats = { averageRating: 0, totalReviews: 0, positiveRate: 0, verifiedRate: 0 };
      return;
    }
    const sum = this.reviews.reduce((acc, r) => acc + r.overallRating, 0);
    const avg = Math.round((sum / total) * 10) / 10;
    const positive = this.reviews.filter(r => r.overallRating >= 4).length;
    this.stats = {
      averageRating: avg,
      totalReviews: total,
      positiveRate: Math.round((positive / total) * 100),
      verifiedRate: 100 // toutes les reviews passées par le backend sont vérifiées
    };
  }

  // ── Sentiment ────────────────────────────────────────────────────────────────
  getSentiment(r: ReviewResponse): SentimentLabel {
    if (r.overallRating >= 4) return 'Positive';
    if (r.overallRating === 3) return 'Neutral';
    return 'Flagged';
  }

  getSentimentClass(r: ReviewResponse): string {
    const s = this.getSentiment(r);
    if (s === 'Positive') return 'sentiment-positive';
    if (s === 'Neutral')  return 'sentiment-neutral';
    return 'sentiment-flagged';
  }

  // ── Filtrage & pagination ─────────────────────────────────────────────────
  get filteredReviews(): ReviewResponse[] {
    if (this.selectedFilter === 'All') return this.reviews;
    return this.reviews.filter(r => this.getSentiment(r) === this.selectedFilter);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredReviews.length / this.pageSize));
  }

  get paginatedReviews(): ReviewResponse[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredReviews.slice(start, start + this.pageSize);
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  setFilter(f: FilterOption): void {
    this.selectedFilter = f;
    this.currentPage = 1;
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) this.currentPage = page;
  }

  // ── Helpers template ──────────────────────────────────────────────────────
  getStars(rating: number): number[] {
    return Array.from({ length: rating });
  }

  getEmptyStars(rating: number): number[] {
    return Array.from({ length: 5 - rating });
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-TN', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  getAvatar(userId: number): string {
    return `U${userId}`;
  }

  getAverageDetailRating(r: ReviewResponse): number {
    return Math.round(
      ((r.qualityRating + r.communicationRating + r.deadlineRating + r.professionalismRating) / 4) * 10
    ) / 10;
  }

  trackById(_: number, r: ReviewResponse): number {
    return r.id;
  }
}
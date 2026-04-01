import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ReviewService, ReviewResponse } from '../../services/review.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-my-reviews',
  standalone: false,
  templateUrl: './my-reviews.component.html',
  styleUrls: ['./my-reviews.component.css']
})
export class MyReviewsComponent implements OnInit {
  reviews: ReviewResponse[] = [];
  loading = true;
  averageRating = 0;
  roundedAvg = 0;
  positiveCount = 0;

  constructor(
    private reviewService: ReviewService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadReviews();
  }

  loadReviews(): void {
    this.loading = true;
    const userId = this.authService.getUserId();
    this.reviewService.getAllReviews().subscribe({
      next: (data) => {
        this.reviews = (data ?? []).filter(r => r.reviewedUserId === userId);
        this.calculateStats();
        this.loading = false;
      },
      error: () => {
        this.reviews = [];
        this.loading = false;
      }
    });
  }

  calculateStats(): void {
    if (this.reviews.length === 0) return;
    const total = this.reviews.reduce((sum, r) => sum + r.rating, 0);
    this.averageRating = total / this.reviews.length;
    this.roundedAvg = Math.round(this.averageRating);
    this.positiveCount = this.reviews.filter(r => r.rating >= 4).length;
  }

  formatType(type: string): string {
    return type === 'CLIENT_TO_FREELANCER' ? 'Par un client' : 'Par un freelancer';
  }

  reportReview(reviewId: number): void {
    this.router.navigate(['/report-review'], { queryParams: { reviewId } });
  }
}

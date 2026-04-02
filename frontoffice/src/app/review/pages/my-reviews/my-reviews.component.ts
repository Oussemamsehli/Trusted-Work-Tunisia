import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ReviewService } from '../../services/review.service';
import { ReviewResponse } from '../../models/review.model';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-my-reviews',
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

    if (!userId) {
      this.reviews = [];
      this.loading = false;
      return;
    }

    this.reviewService.getAllReviews().subscribe({
      next: (data) => {
        this.reviews = (data ?? []).filter(
          review =>
            review.reviewedUserId === Number(userId) &&
            review.isDeleted === false &&
            review.isVisible === true
        );

        this.calculateStats();
        this.loading = false;
      },
      error: () => {
        this.reviews = [];
        this.averageRating = 0;
        this.roundedAvg = 0;
        this.positiveCount = 0;
        this.loading = false;
      }
    });
  }

  calculateStats(): void {
    if (this.reviews.length === 0) {
      this.averageRating = 0;
      this.roundedAvg = 0;
      this.positiveCount = 0;
      return;
    }

    const total = this.reviews.reduce(
      (sum, review) => sum + review.overallRating,
      0
    );

    this.averageRating = total / this.reviews.length;
    this.roundedAvg = Math.round(this.averageRating);
    this.positiveCount = this.reviews.filter(
      review => review.overallRating >= 4
    ).length;
  }

  formatType(type: string): string {
    return type === 'CLIENT_TO_FREELANCER'
      ? 'Par un client'
      : 'Par un freelancer';
  }

  formatDate(date: string): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString();
  }

  reportReview(reviewId: number): void {
    this.router.navigate(['/reviews/report'], {
      queryParams: { reviewId }
    });
  }
}
import { Component, OnInit } from '@angular/core';
import { FreelancerProfileService } from '../../../core/services/freelancer-profile.service';
import { AuthService } from '../../../core/services/auth.service';
import { ProfileReview } from '../../../core/models/freelancer.model';

/**
 * Composant Reviews — avis clients sur le profil freelancer
 */
@Component({
  selector: 'app-reviews',
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.css']
})
export class ReviewsComponent implements OnInit {
  reviews: ProfileReview[] = [];
  averageRating = 0;
  profileId: number | null = null;

  isLoading = false;
  isSaving = false;

  errorMessage = '';
  successMessage = '';
  showForm = false;

  newReview = {
    clientId: 0,
    rating: 5,
    comment: ''
  };

  stars = [1, 2, 3, 4, 5];

  constructor(
    private profileService: FreelancerProfileService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  get currentUserId(): number {
    return this.authService.getCurrentAuthUser()!.userId;
  }

  get canSubmit(): boolean {
    return !!this.profileId && this.newReview.rating >= 1 && this.newReview.rating <= 5 && !this.isSaving;
  }

  get latestRating(): number {
    return this.reviews.length ? this.reviews[0].rating : 0;
  }

  loadProfile(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.profileService.getProfileByUserId(this.currentUserId).subscribe({
      next: (profile) => {
        this.profileId = profile.id;
        this.loadReviews();
        this.loadAverageRating();
      },
      error: () => {
        this.errorMessage = 'Profil introuvable.';
        this.isLoading = false;
        this.autoClearMessages();
      }
    });
  }

  loadReviews(): void {
    if (!this.profileId) return;

    this.profileService.getReviews(this.profileId).subscribe({
      next: (reviews) => {
        this.reviews = reviews || [];
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Erreur lors du chargement des avis.';
        this.isLoading = false;
        this.autoClearMessages();
      }
    });
  }

  loadAverageRating(): void {
    if (!this.profileId) return;

    this.profileService.getAverageRating(this.profileId).subscribe({
      next: (avg) => {
        this.averageRating = avg || 0;
      },
      error: () => {
        this.averageRating = this.calculateAverage();
      }
    });
  }

  submitReview(): void {
    if (!this.profileId || !this.canSubmit) return;

    this.clearMessages();
    this.isSaving = true;

    const payload = {
      clientId: this.newReview.clientId || this.currentUserId,
      rating: this.newReview.rating,
      comment: this.newReview.comment.trim()
    };

    this.profileService.addReview(this.profileId, payload).subscribe({
      next: (review) => {
        this.reviews.unshift(review);
        this.averageRating = this.calculateAverage();
        this.isSaving = false;
        this.resetForm();
        this.showForm = false;
        this.successMessage = 'Avis ajouté avec succès.';
        this.autoClearMessages();
      },
      error: (err) => {
        this.isSaving = false;
        this.errorMessage = err.error?.message || 'Erreur lors de l’ajout de l’avis.';
        this.autoClearMessages();
      }
    });
  }

  setRating(star: number): void {
    this.newReview.rating = star;
  }

  calculateAverage(): number {
    if (this.reviews.length === 0) return 0;
    const sum = this.reviews.reduce((acc, r) => acc + r.rating, 0);
    return Math.round((sum / this.reviews.length) * 10) / 10;
  }

  getStarArray(rating: number): string[] {
    return Array.from({ length: 5 }, (_, i) =>
      i < Math.floor(rating) ? 'full' : 'empty'
    );
  }

  getRatingLabel(rating: number): string {
    if (rating >= 5) return 'Excellent';
    if (rating >= 4) return 'Très bien';
    if (rating >= 3) return 'Bien';
    if (rating >= 2) return 'Moyen';
    return 'Faible';
  }

  getReviewerInitial(clientId: number): string {
    return `U${clientId}`;
  }

  resetForm(): void {
    this.newReview = {
      clientId: 0,
      rating: 5,
      comment: ''
    };
  }

  clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  autoClearMessages(): void {
    setTimeout(() => {
      this.errorMessage = '';
      this.successMessage = '';
    }, 3500);
  }

  trackByReview(index: number, review: ProfileReview): number {
    return review.id;
  }
}
import { Component, OnInit } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { FreelancerProfileService } from '../../../core/services/freelancer-profile.service';
import { AuthService } from '../../../core/services/auth.service';
import { ApiService } from '../../../core/services/api.service';
import { ProfileReview } from '../../../core/models/freelancer.model';

interface ReviewViewModel extends ProfileReview {
  reviewerFullName: string;
  reviewerRoleLabel: string;
  reviewerInitials: string;
}

@Component({
  selector: 'app-reviews',
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.css']
})
export class ReviewsComponent implements OnInit {
  reviews: ReviewViewModel[] = [];
  averageRating = 0;
  profileId: number | null = null;

  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private profileService: FreelancerProfileService,
    private authService: AuthService,
    private api: ApiService
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  get currentUserId(): number {
    return this.authService.getCurrentAuthUser()!.userId;
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
        const safeReviews = reviews || [];

        if (safeReviews.length === 0) {
          this.reviews = [];
          this.isLoading = false;
          return;
        }

        const enrichedRequests = safeReviews.map((review) =>
          this.api.get<any>(`/users/${review.clientId}`).pipe(
            catchError(() =>
              of({
                firstName: '',
                lastName: '',
                role: 'CLIENT'
              })
            )
          )
        );

        forkJoin(enrichedRequests).subscribe({
          next: (users) => {
            this.reviews = safeReviews.map((review, index) => {
              const user = users[index] || {};

              const firstName = (user.firstName || user.firstname || user.prenom || '').trim();
              const lastName = (user.lastName || user.lastname || user.nom || '').trim();
              const fullName = `${firstName} ${lastName}`.trim();

              return {
                ...review,
                reviewerFullName: fullName || 'Utilisateur',
                reviewerRoleLabel: this.getRoleLabel(user.role),
                reviewerInitials: this.getInitials(firstName, lastName, fullName)
              };
            });

            this.isLoading = false;
          },
          error: () => {
            this.reviews = safeReviews.map((review) => ({
              ...review,
              reviewerFullName: 'Utilisateur',
              reviewerRoleLabel: 'Client',
              reviewerInitials: 'U'
            }));
            this.isLoading = false;
          }
        });
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

  getRoleLabel(role?: string): string {
    const normalized = (role || '').toUpperCase();

    if (normalized === 'CLIENT') return 'Client';
    if (normalized === 'FREELANCER') return 'Freelancer';
    if (normalized === 'ADMIN') return 'Admin';

    return 'Utilisateur';
  }

  getInitials(firstName?: string, lastName?: string, fallback?: string): string {
    const first = (firstName || '').trim();
    const last = (lastName || '').trim();

    if (first && last) {
      return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
    }

    if (first) {
      return first.charAt(0).toUpperCase();
    }

    if (fallback && fallback.trim()) {
      const parts = fallback.trim().split(' ').filter(Boolean);
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      }
      return parts[0][0].toUpperCase();
    }

    return 'U';
  }

  autoClearMessages(): void {
    setTimeout(() => {
      this.errorMessage = '';
      this.successMessage = '';
    }, 3500);
  }

  trackByReview(index: number, review: ReviewViewModel): number {
    return review.id;
  }
}
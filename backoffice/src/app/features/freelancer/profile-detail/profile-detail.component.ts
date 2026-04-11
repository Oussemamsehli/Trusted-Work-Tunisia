import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  FreelancerProfile,
  ProfileReview,
  CompletenessResponse,
  CareerPathResponse
} from '../../../core/models/freelancer.model';
import { FreelancerProfileService } from '../../../core/services/freelancer-profile.service';

@Component({
  selector: 'app-profile-detail',
  templateUrl: './profile-detail.component.html',
  styleUrls: ['./profile-detail.component.css']
})
export class ProfileDetailComponent implements OnInit {

  profile: FreelancerProfile | null = null;
  reviews: ProfileReview[] = [];
  averageRating: number = 0;
  completeness: CompletenessResponse | null = null;
  careerPath: CareerPathResponse | null = null;

  loading = true;
  errorMsg = '';

  constructor(
    private route: ActivatedRoute,
    private profileService: FreelancerProfileService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.loadProfile(id);
    }
  }

  loadProfile(profileId: number): void {
    this.loading = true;

    // 1) Charger le profil
    this.profileService.getProfileById(profileId).subscribe({
      next: (data) => {
        this.profile = data;
        this.loading = false;

        // 2) Charger les reviews
        this.profileService.getReviewsByProfile(profileId).subscribe({
          next: (r) => this.reviews = r,
          error: () => this.reviews = []
        });

        // 3) Note moyenne
        this.profileService.getAverageRating(profileId).subscribe({
          next: (avg) => this.averageRating = avg,
          error: () => this.averageRating = 0
        });

        // 4) Score de complétude
        this.profileService.getCompleteness(data.userId).subscribe({
          next: (c) => this.completeness = c,
          error: () => this.completeness = null
        });

        // 5) Career path
        this.profileService.getCareerPath(data.userId).subscribe({
          next: (cp) => this.careerPath = cp,
          error: () => this.careerPath = null
        });
      },
      error: (err) => {
        this.errorMsg = 'Erreur lors du chargement du profil';
        this.loading = false;
        console.error(err);
      }
    });
  }

  // Générer les étoiles pour l'affichage
  getStars(rating: number): string[] {
    const stars: string[] = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= Math.floor(rating)) {
        stars.push('fas fa-star');
      } else if (i - rating < 1) {
        stars.push('fas fa-star-half-alt');
      } else {
        stars.push('far fa-star');
      }
    }
    return stars;
  }

  getStatusBadge(status: string): string {
    switch (status) {
      case 'AVAILABLE':   return 'badge-success';
      case 'BUSY':        return 'badge-warning';
      case 'UNAVAILABLE': return 'badge-danger';
      default:            return 'badge-muted';
    }
  }

  getProficiencyBadge(level: string): string {
    switch (level) {
      case 'EXPERT':       return 'badge-accent';
      case 'ADVANCED':     return 'badge-success';
      case 'INTERMEDIATE': return 'badge-warning';
      default:             return 'badge-muted';
    }
  }

  getScoreClass(score: number): string {
    if (score >= 80) return 'text-success';
    if (score >= 50) return 'text-warning';
    return 'text-danger';
  }
}
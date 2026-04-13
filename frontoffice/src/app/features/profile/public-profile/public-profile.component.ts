import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import { FreelancerProfileService } from '../../../core/services/freelancer-profile.service';
import { AuthService } from '../../../core/services/auth.service';
import {
  FreelancerProfile,
  Skill,
  PortfolioItem,
  Certification,
  WorkExperience,
  ProfileReview
} from '../../../core/models/freelancer.model';

type ToastType = 'success' | 'error' | 'info';

@Component({
  selector: 'app-public-profile',
  templateUrl: './public-profile.component.html',
  styleUrls: ['./public-profile.component.css']
})
export class PublicProfileComponent implements OnInit {
  targetUserId!: number;
  targetProfileId!: number;

  profile: FreelancerProfile | null = null;
  skills: Skill[] = [];
  portfolio: PortfolioItem[] = [];
  certifications: Certification[] = [];
  experiences: WorkExperience[] = [];
  reviews: ProfileReview[] = [];
  averageRating = 0;

  isLoading = true;
  errorMessage = '';
  successMessage = '';

  endorsingSkillId: number | null = null;
  endorseComment = '';

  showReviewForm = false;
  newReview = { rating: 5, comment: '' };

  showReportForm = false;
  reportReason = '';

  submittingEndorsement = false;
  submittingReview = false;
  submittingReport = false;

  toastVisible = false;
  toastType: ToastType = 'success';
  toastTitle = '';
  toastMessage = '';
  private toastTimeout: any;

  constructor(
    private route: ActivatedRoute,
    private profileService: FreelancerProfileService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.targetUserId = Number(this.route.snapshot.paramMap.get('userId'));
    this.loadPublicProfile();
  }

  get isOwner(): boolean {
    return this.authService.getCurrentAuthUser()?.userId === this.targetUserId;
  }

  get currentUserId(): number {
    return this.authService.getCurrentAuthUser()!.userId;
  }

  get profileInitial(): string {
    return this.profile?.headline?.charAt(0)?.toUpperCase() || 'F';
  }

  get availabilityLabel(): string {
    if (!this.profile) return 'Non défini';

    switch (this.profile.availabilityStatus) {
      case 'AVAILABLE':
        return 'Disponible';
      case 'BUSY':
        return 'Occupé';
      default:
        return 'En vacances';
    }
  }

  get availabilityClass(): string {
    if (!this.profile) return 'status-neutral';

    switch (this.profile.availabilityStatus) {
      case 'AVAILABLE':
        return 'status-available';
      case 'BUSY':
        return 'status-busy';
      default:
        return 'status-vacation';
    }
  }

  get totalEndorsements(): number {
    return this.skills.reduce((sum, skill) => sum + (skill.endorsementCount || 0), 0);
  }

  get averageAuthenticity(): number {
    if (!this.skills.length) return 0;
    const total = this.skills.reduce((sum, skill) => sum + ((skill.authenticityScore || 0) * 100), 0);
    return total / this.skills.length;
  }

  loadPublicProfile(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.profileService.getProfileByUserId(this.targetUserId).subscribe({
      next: (profile) => {
        this.profile = profile;
        this.targetProfileId = profile.id;
        this.loadProfileDetails();
      },
      error: () => {
        this.errorMessage = 'Profil introuvable.';
        this.showToast('error', 'Profil introuvable', 'Impossible de charger ce profil public.');
        this.isLoading = false;
      }
    });
  }

  loadProfileDetails(): void {
    forkJoin({
      skills: this.profileService.getMySkills(this.targetUserId),
      portfolio: this.profileService.getMyPortfolio(this.targetUserId),
      certifications: this.profileService.getMyCertifications(this.targetUserId),
      experiences: this.profileService.getMyWorkExperiences(this.targetUserId),
      reviews: this.profileService.getReviews(this.targetProfileId),
      average: this.profileService.getAverageRating(this.targetProfileId)
    }).subscribe({
      next: (data) => {
        this.skills = (data.skills || []).map((skill: Skill) => ({
          ...skill,
          endorsementCount: skill.endorsementCount || 0,
          authenticityScore: skill.authenticityScore || 0
        }));
        this.portfolio = data.portfolio || [];
        this.certifications = data.certifications || [];
        this.experiences = data.experiences || [];
        this.reviews = data.reviews || [];
        this.averageRating = Number(data.average || 0);
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Erreur lors du chargement des informations du profil.';
        this.showToast('error', 'Chargement échoué', 'Certaines informations du profil n’ont pas pu être récupérées.');
        this.isLoading = false;
      }
    });
  }

  toggleEndorse(skillId: number): void {
    if (this.submittingEndorsement) return;
    this.endorsingSkillId = this.endorsingSkillId === skillId ? null : skillId;
    this.endorseComment = '';
  }

  submitEndorsement(skillId: number): void {
    if (this.submittingEndorsement) return;

    const payload = {
      endorserId: this.currentUserId,
      comment: this.endorseComment?.trim() || ''
    };

    this.submittingEndorsement = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.profileService.addEndorsement(skillId, payload).subscribe({
      next: () => {
        const skill = this.skills.find(s => s.id === skillId);
        if (skill) {
          skill.endorsementCount = (skill.endorsementCount || 0) + 1;
        }

        this.endorsingSkillId = null;
        this.endorseComment = '';
        this.successMessage = 'Compétence validée avec succès.';
        this.showToast(
          'success',
          'Endorsement envoyé',
          'Votre validation a bien été prise en compte.'
        );
        this.submittingEndorsement = false;
      },
      error: (err) => {
        this.submittingEndorsement = false;

        if (err?.status === 409) {
          this.errorMessage = 'Vous avez déjà validé cette compétence.';
          this.showToast(
            'info',
            'Déjà validée',
            'Vous avez déjà envoyé un endorsement pour cette compétence.'
          );
          this.endorsingSkillId = null;
          this.endorseComment = '';
          return;
        }

        if (err?.status === 400) {
          this.errorMessage = err.error?.message || 'Action invalide.';
          this.showToast(
            'error',
            'Action refusée',
            this.errorMessage
          );
          return;
        }

        this.errorMessage = err.error?.message || 'Erreur lors de l’endorsement.';
        this.showToast(
          'error',
          'Échec de l’envoi',
          this.errorMessage
        );
      }
    });
  }

  submitReview(): void {
    if (this.submittingReview) return;

    const comment = this.newReview.comment?.trim() || '';
    const rating = Number(this.newReview.rating);

    if (!comment) {
      this.showToast('error', 'Commentaire requis', 'Veuillez saisir un commentaire avant de publier votre avis.');
      return;
    }

    if (rating < 1 || rating > 5) {
      this.showToast('error', 'Note invalide', 'La note doit être comprise entre 1 et 5.');
      return;
    }

    const payload = {
      clientId: this.currentUserId,
      rating,
      comment
    };

    this.submittingReview = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.profileService.addReview(this.targetProfileId, payload).subscribe({
      next: (review) => {
        this.reviews.unshift(review);
        this.showReviewForm = false;
        this.newReview = { rating: 5, comment: '' };
        this.successMessage = 'Avis ajouté avec succès.';
        this.showToast(
          'success',
          'Avis publié',
          'Votre retour a bien été ajouté au profil.'
        );
        this.submittingReview = false;
        this.refreshAverageRating();
      },
      error: (err) => {
        this.submittingReview = false;
        this.errorMessage = err.error?.message || 'Erreur lors de l’ajout de l’avis.';
        this.showToast(
          'error',
          'Publication impossible',
          this.errorMessage
        );
      }
    });
  }

  submitReport(): void {
    if (this.submittingReport) return;

    const reason = this.reportReason?.trim() || '';
    if (!reason) {
      this.showToast('error', 'Raison requise', 'Veuillez préciser la raison du signalement.');
      return;
    }

    this.submittingReport = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.profileService.reportProfile(this.targetProfileId, {
      reporterId: this.currentUserId,
      reason
    }).subscribe({
      next: () => {
        this.showReportForm = false;
        this.reportReason = '';
        this.successMessage = 'Signalement envoyé à l’administration.';
        this.showToast(
          'success',
          'Signalement envoyé',
          'Votre signalement a bien été transmis à l’équipe de modération.'
        );
        this.submittingReport = false;
      },
      error: (err) => {
        this.submittingReport = false;
        this.errorMessage = err.error?.message || 'Erreur lors du signalement.';
        this.showToast(
          'error',
          'Envoi impossible',
          this.errorMessage
        );
      }
    });
  }

  refreshAverageRating(): void {
    this.profileService.getAverageRating(this.targetProfileId).subscribe({
      next: (avg) => {
        this.averageRating = Number(avg || 0);
      }
    });
  }

  showToast(type: ToastType, title: string, message: string): void {
    clearTimeout(this.toastTimeout);
    this.toastType = type;
    this.toastTitle = title;
    this.toastMessage = message;
    this.toastVisible = true;

    this.toastTimeout = setTimeout(() => {
      this.toastVisible = false;
    }, 3500);
  }

  closeToast(): void {
    this.toastVisible = false;
    clearTimeout(this.toastTimeout);
  }

  getStars(rating: number): number[] {
    return Array(Math.round(rating)).fill(0);
  }

  trackBySkill(index: number, skill: Skill): number {
    return skill.id;
  }

  trackByPortfolio(index: number, item: PortfolioItem): number {
    return item.id;
  }

  trackByReview(index: number, review: ProfileReview): number {
    return review.id;
  }
}
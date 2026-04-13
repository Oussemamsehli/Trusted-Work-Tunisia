import { Component, OnInit } from '@angular/core';
import { FreelancerProfileService } from '../../../core/services/freelancer-profile.service';
import { AuthService } from '../../../core/services/auth.service';
import { WorkExperience } from '../../../core/models/freelancer.model';

@Component({
  selector: 'app-work-experience',
  templateUrl: './work-experience.component.html',
  styleUrls: ['./work-experience.component.css']
})
export class WorkExperienceComponent implements OnInit {
  experiences: WorkExperience[] = [];
  isLoading = false;
  isSaving = false;
  deletingId: number | null = null;

  errorMessage = '';
  successMessage = '';
  showForm = false;

  newExp: {
    jobTitle: string;
    company: string;
    description: string;
    startDate: string;
    endDate: string | undefined;
    isCurrent: boolean;
  } = {
    jobTitle: '',
    company: '',
    description: '',
    startDate: '',
    endDate: undefined,
    isCurrent: false
  };

  constructor(
    private profileService: FreelancerProfileService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadExperiences();
  }

  get currentUserId(): number {
    return this.authService.getCurrentAuthUser()!.userId;
  }

  get hasExperiences(): boolean {
    return this.experiences.length > 0;
  }

  get canSave(): boolean {
    return !!this.newExp.jobTitle.trim() &&
           !!this.newExp.company.trim() &&
           !!this.newExp.startDate &&
           !this.isSaving;
  }

  loadExperiences(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.profileService.getMyWorkExperiences(this.currentUserId).subscribe({
      next: (data) => {
        this.experiences = data || [];
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Erreur lors du chargement des expériences.';
        this.isLoading = false;
      }
    });
  }

  openForm(): void {
    this.clearMessages();
    this.showForm = true;
  }

  closeForm(): void {
    this.showForm = false;
    this.resetForm();
  }

  addExperience(): void {
    if (!this.canSave) return;

    this.clearMessages();
    this.isSaving = true;

    const payload = {
      ...this.newExp,
      endDate: this.newExp.isCurrent ? undefined : this.newExp.endDate
    };

    this.profileService.addWorkExperience(this.currentUserId, payload).subscribe({
      next: (exp) => {
        this.experiences.unshift(exp);
        this.isSaving = false;
        this.successMessage = 'Expérience ajoutée avec succès.';
        this.closeForm();
        this.autoClearMessages();
      },
      error: () => {
        this.isSaving = false;
        this.errorMessage = 'Erreur lors de l’ajout de l’expérience.';
        this.autoClearMessages();
      }
    });
  }

  deleteExperience(expId: number): void {
    if (!confirm('Supprimer cette expérience ?')) return;

    this.clearMessages();
    this.deletingId = expId;

    this.profileService.deleteWorkExperience(expId, this.currentUserId).subscribe({
      next: () => {
        this.experiences = this.experiences.filter(e => e.id !== expId);
        this.deletingId = null;
        this.successMessage = 'Expérience supprimée avec succès.';
        this.autoClearMessages();
      },
      error: () => {
        this.deletingId = null;
        this.errorMessage = 'Erreur lors de la suppression.';
        this.autoClearMessages();
      }
    });
  }

  resetForm(): void {
    this.newExp = {
      jobTitle: '',
      company: '',
      description: '',
      startDate: '',
      endDate: undefined,
      isCurrent: false
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

  getDuration(exp: WorkExperience): string {
    if (!exp.startDate) return '';

    const start = new Date(exp.startDate);
    const end = exp.isCurrent ? new Date() : new Date(exp.endDate as string);

    const totalMonths =
      (end.getFullYear() - start.getFullYear()) * 12 +
      (end.getMonth() - start.getMonth());

    if (totalMonths <= 0) return 'Moins d’un mois';
    if (totalMonths < 12) return `${totalMonths} mois`;

    const years = Math.floor(totalMonths / 12);
    const remainingMonths = totalMonths % 12;

    if (remainingMonths > 0) {
      return `${years} an(s) ${remainingMonths} mois`;
    }

    return `${years} an(s)`;
  }

  trackByExperience(index: number, exp: WorkExperience): number {
    return exp.id;
  }
}
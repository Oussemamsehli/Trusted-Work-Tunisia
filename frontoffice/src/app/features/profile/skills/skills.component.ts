import { Component, OnInit } from '@angular/core';
import { FreelancerProfileService } from '../../../core/services/freelancer-profile.service';
import { AuthService } from '../../../core/services/auth.service';
import { Skill } from '../../../core/models/freelancer.model';

@Component({
  selector: 'app-skills',
  templateUrl: './skills.component.html',
  styleUrls: ['./skills.component.css']
})
export class SkillsComponent implements OnInit {
  skills: Skill[] = [];
  isLoading = false;
  isSaving = false;

  errorMessage = '';
  successMessage = '';
  showForm = false;

  deletingSkillId: number | null = null;
  refreshingSkillId: number | null = null;

  newSkill: { name: string; examScore: number } = {
    name: '',
    examScore: 0
  };

  constructor(
    private profileService: FreelancerProfileService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadSkills();
  }

  private get currentUserId(): number {
    return this.authService.getCurrentAuthUser()!.userId;
  }

  get canSave(): boolean {
    return !!this.newSkill.name.trim() &&
           this.newSkill.examScore >= 0 &&
           this.newSkill.examScore <= 100 &&
           !this.isSaving;
  }

  get averageAuthenticity(): number {
    if (!this.skills.length) return 0;
    const total = this.skills.reduce((sum, skill) => sum + (skill.authenticityScore || 0), 0);
    return (total / this.skills.length) * 100;
  }

  get totalEndorsements(): number {
    return this.skills.reduce((sum, skill) => sum + (skill.endorsementCount || 0), 0);
  }

  loadSkills(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.profileService.getMySkills(this.currentUserId).subscribe({
      next: (data) => {
        this.skills = data || [];
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Impossible de charger les compétences.';
        this.isLoading = false;
        this.autoClearMessages();
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

  addSkill(): void {
    if (!this.canSave) return;

    this.clearMessages();
    this.isSaving = true;

    const payload = {
      name: this.newSkill.name.trim(),
      examScore: this.newSkill.examScore / 100
    };

    this.profileService.addSkill(this.currentUserId, payload).subscribe({
      next: () => {
        this.isSaving = false;
        this.successMessage = 'Compétence ajoutée avec succès.';
        this.resetForm();
        this.showForm = false;
        this.loadSkills();
        this.autoClearMessages();
      },
      error: () => {
        this.isSaving = false;
        this.errorMessage = 'Erreur lors de l’ajout du skill.';
        this.autoClearMessages();
      }
    });
  }

  deleteSkill(skillId: number): void {
    if (!confirm('Supprimer ce skill ?')) return;

    this.clearMessages();
    this.deletingSkillId = skillId;

    this.profileService.deleteSkill(skillId, this.currentUserId).subscribe({
      next: () => {
        this.deletingSkillId = null;
        this.successMessage = 'Compétence supprimée avec succès.';
        this.loadSkills();
        this.autoClearMessages();
      },
      error: () => {
        this.deletingSkillId = null;
        this.errorMessage = 'Erreur lors de la suppression.';
        this.autoClearMessages();
      }
    });
  }

  refreshAuthenticity(skillId: number): void {
    this.clearMessages();
    this.refreshingSkillId = skillId;

    this.profileService.getSkillAuthenticity(skillId).subscribe({
      next: () => {
        this.refreshingSkillId = null;
        this.successMessage = 'Score d’authenticité recalculé.';
        this.loadSkills();
        this.autoClearMessages();
      },
      error: () => {
        this.refreshingSkillId = null;
        this.errorMessage = 'Erreur lors du calcul d’authenticité.';
        this.autoClearMessages();
      }
    });
  }

  resetForm(): void {
    this.newSkill = {
      name: '',
      examScore: 0
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

  getLevelLabel(level: string): string {
    const labels: Record<string, string> = {
      JUNIOR: 'Junior',
      CONFIRMED: 'Confirmé',
      EXPERT: 'Expert'
    };
    return labels[level] ?? level;
  }

  getLevelClass(level: string): string {
    const classes: Record<string, string> = {
      JUNIOR: 'level-junior',
      CONFIRMED: 'level-confirmed',
      EXPERT: 'level-expert'
    };
    return classes[level] ?? '';
  }

  getAuthenticityClass(score: number): string {
    if (score >= 0.75) return 'auth-high';
    if (score >= 0.4) return 'auth-medium';
    return 'auth-low';
  }

  trackBySkill(index: number, skill: Skill): number {
    return skill.id;
  }
}
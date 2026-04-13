import { Component, OnInit } from '@angular/core';
import { FreelancerProfileService } from '../../../core/services/freelancer-profile.service';
import { AuthService } from '../../../core/services/auth.service';
import { Skill, Endorsement } from '../../../core/models/freelancer.model';

/**
 * Composant Endorsements — validations reçues sur les compétences du freelancer
 * Vue propriétaire uniquement : consultation des endorsements reçus
 */
@Component({
  selector: 'app-endorsements',
  templateUrl: './endorsements.component.html',
  styleUrls: ['./endorsements.component.css']
})
export class EndorsementsComponent implements OnInit {
  skills: Skill[] = [];
  endorsementsBySkill: { [skillId: number]: Endorsement[] } = {};

  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private profileService: FreelancerProfileService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadSkills();
  }

  get currentUserId(): number {
    return this.authService.getCurrentAuthUser()!.userId;
  }

  get totalEndorsements(): number {
    return this.skills.reduce((sum, skill) => sum + this.getEndorsementCount(skill.id), 0);
  }

  get averageAuthenticity(): number {
    if (!this.skills.length) return 0;
    const total = this.skills.reduce((sum, skill) => sum + (skill.authenticityScore || 0), 0);
    return (total / this.skills.length) * 100;
  }

  get endorsedSkillsCount(): number {
    return this.skills.filter(skill => this.getEndorsementCount(skill.id) > 0).length;
  }

  loadSkills(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.profileService.getMySkills(this.currentUserId).subscribe({
      next: (skills) => {
        this.skills = skills || [];
        this.isLoading = false;

        this.skills.forEach(skill => this.loadEndorsements(skill.id));
      },
      error: () => {
        this.errorMessage = 'Erreur lors du chargement des compétences.';
        this.isLoading = false;
        this.autoClearMessages();
      }
    });
  }

  loadEndorsements(skillId: number): void {
    this.profileService.getEndorsementsBySkill(skillId).subscribe({
      next: (endorsements) => {
        this.endorsementsBySkill[skillId] = endorsements || [];
      },
      error: () => {
        this.endorsementsBySkill[skillId] = [];
      }
    });
  }

  getEndorsementCount(skillId: number): number {
    return this.endorsementsBySkill[skillId]?.length || 0;
  }

  getLevelClass(level: string): string {
    const classes: Record<string, string> = {
      EXPERT: 'level-expert',
      CONFIRMED: 'level-confirmed',
      JUNIOR: 'level-junior'
    };
    return classes[level] ?? 'level-junior';
  }

  getLevelLabel(level: string): string {
    const labels: Record<string, string> = {
      EXPERT: 'Expert',
      CONFIRMED: 'Confirmé',
      JUNIOR: 'Junior'
    };
    return labels[level] ?? level;
  }

  getAuthenticityClass(score: number): string {
    if (score >= 0.75) return 'auth-high';
    if (score >= 0.4) return 'auth-medium';
    return 'auth-low';
  }

  getEndorserInitial(endorserId: number): string {
    return `F${endorserId}`;
  }

  trackBySkill(index: number, skill: Skill): number {
    return skill.id;
  }

  trackByEndorsement(index: number, endorsement: Endorsement): number {
    return endorsement.id;
  }

  autoClearMessages(): void {
    setTimeout(() => {
      this.errorMessage = '';
      this.successMessage = '';
    }, 3500);
  }
}
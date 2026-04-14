import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { FreelancerProfileService } from '../../../core/services/freelancer-profile.service';
import { AuthService } from '../../../core/services/auth.service';
import { ApiService } from '../../../core/services/api.service';
import { Skill, Endorsement } from '../../../core/models/freelancer.model';

/**
 * Endorsement enrichi avec le nom de l'endorseur — résolu depuis user-service
 * /identity/users/{endorserId} → PublicUserDTO { firstName, lastName, role }
 */
interface EndorsementViewModel extends Endorsement {
  endorserName: string;
  endorserInitials: string;
  endorserRole: string;
}

/**
 * Composant Endorsements — validations reçues sur les compétences du freelancer
 * Intégration inter-services : freelancer-profile-service (8082) + user-service (8081)
 */
@Component({
  selector: 'app-endorsements',
  templateUrl: './endorsements.component.html',
  styleUrls: ['./endorsements.component.css']
})
export class EndorsementsComponent implements OnInit {

  skills: Skill[] = [];
  endorsementsBySkill: { [skillId: number]: EndorsementViewModel[] } = {};

  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private profileService: FreelancerProfileService,
    private authService: AuthService,
    private api: ApiService,
    private cdr: ChangeDetectorRef
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

        if (this.skills.length > 0) {
          this.loadAllEndorsements();
        }
      },
      error: () => {
        this.errorMessage = 'Erreur lors du chargement des compétences.';
        this.isLoading = false;
        this.autoClearMessages();
      }
    });
  }

  /**
   * Stratégie optimisée en 4 étapes :
   * 1. Charger tous les endorsements de tous les skills en parallèle
   * 2. Collecter les endorserIds uniques
   * 3. Résoudre tous les noms en un seul batch parallèle
   * 4. Enrichir les endorsements et forcer le re-render
   */
  loadAllEndorsements(): void {

    // Étape 1 — charger les endorsements de chaque skill
    const skillRequests = this.skills.map(skill =>
      this.profileService.getEndorsementsBySkill(skill.id).pipe(
        catchError(() => of([] as Endorsement[]))
      )
    );

    forkJoin(skillRequests).subscribe({
      next: (allEndorsements) => {

        // Étape 2 — collecter tous les endorserIds uniques
        const allFlat    = allEndorsements.flat();
        const uniqueIds  = [...new Set(allFlat.map(e => e.endorserId))];

        if (uniqueIds.length === 0) {
          this.skills.forEach((skill, i) => {
            this.endorsementsBySkill[skill.id] = [];
          });
          this.cdr.detectChanges();
          return;
        }

        // Étape 3 — résoudre les noms de tous les endorseurs en parallèle
        const userRequests = uniqueIds.map(userId =>
          this.api.get<any>(`/identity/users/${userId}`).pipe(
            catchError(() => of({ firstName: '', lastName: '', role: 'FREELANCER' }))
          )
        );

        forkJoin(userRequests).subscribe({
          next: (users) => {

            // Construire un map userId → user pour accès O(1)
            const userMap: { [id: number]: any } = {};
            uniqueIds.forEach((id, index) => {
              userMap[id] = users[index];
            });

            // Étape 4 — enrichir chaque endorsement avec le nom résolu
            this.skills.forEach((skill, skillIndex) => {
              const endorsements = allEndorsements[skillIndex] || [];

              this.endorsementsBySkill[skill.id] = endorsements.map(e => {
                const user      = userMap[e.endorserId] || {};
                const firstName = (user.firstName || '').trim();
                const lastName  = (user.lastName  || '').trim();
                const fullName  = `${firstName} ${lastName}`.trim();

                return {
                  ...e,
                  endorserName:     fullName || `Freelancer #${e.endorserId}`,
                  endorserInitials: this.buildInitials(firstName, lastName, e.endorserId),
                  endorserRole:     this.getRoleLabel(user.role)
                };
              });
            });

            // Forcer Angular à re-render avec les nouvelles données
            this.cdr.detectChanges();
          },
          error: () => {
            this.skills.forEach((skill, skillIndex) => {
              const endorsements = allEndorsements[skillIndex] || [];
              this.endorsementsBySkill[skill.id] = endorsements.map(e => ({
                ...e,
                endorserName:     `Freelancer #${e.endorserId}`,
                endorserInitials: `F${e.endorserId}`,
                endorserRole:     'Freelancer'
              }));
            });
            this.cdr.detectChanges();
          }
        });
      },
      error: () => {
        this.skills.forEach(skill => {
          this.endorsementsBySkill[skill.id] = [];
        });
      }
    });
  }

  getEndorsementCount(skillId: number): number {
    return this.endorsementsBySkill[skillId]?.length || 0;
  }

  getLevelClass(level: string): string {
    const classes: Record<string, string> = {
      EXPERT:    'level-expert',
      CONFIRMED: 'level-confirmed',
      JUNIOR:    'level-junior'
    };
    return classes[level] ?? 'level-junior';
  }

  getLevelLabel(level: string): string {
    const labels: Record<string, string> = {
      EXPERT:    'Expert',
      CONFIRMED: 'Confirmé',
      JUNIOR:    'Junior'
    };
    return labels[level] ?? level;
  }

  getAuthenticityClass(score: number): string {
    if (score >= 0.75) return 'auth-high';
    if (score >= 0.4)  return 'auth-medium';
    return 'auth-low';
  }

  getRoleLabel(role?: string): string {
    const normalized = (role || '').toUpperCase();
    if (normalized === 'CLIENT')     return 'Client';
    if (normalized === 'FREELANCER') return 'Freelancer';
    if (normalized === 'ADMIN')      return 'Admin';
    return 'Utilisateur';
  }

  buildInitials(firstName: string, lastName: string, fallbackId: number): string {
    const f = (firstName || '').trim();
    const l = (lastName  || '').trim();
    if (f && l) return `${f.charAt(0)}${l.charAt(0)}`.toUpperCase();
    if (f)      return f.charAt(0).toUpperCase();
    return `F${fallbackId}`;
  }

  trackBySkill(index: number, skill: Skill): number {
    return skill.id;
  }

  trackByEndorsement(index: number, endorsement: EndorsementViewModel): number {
    return endorsement.id;
  }

  autoClearMessages(): void {
    setTimeout(() => {
      this.errorMessage   = '';
      this.successMessage = '';
    }, 3500);
  }
}
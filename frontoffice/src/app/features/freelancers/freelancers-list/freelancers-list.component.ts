import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { FreelancerProfileService } from '../../../core/services/freelancer-profile.service';
import { AuthService } from '../../../core/services/auth.service';
import { ApiService } from '../../../core/services/api.service';
import { FreelancerProfile } from '../../../core/models/freelancer.model';

/**
 * Profil freelancer enrichi avec le nom résolu depuis user-service
 * /identity/users/{userId} → PublicUserDTO { firstName, lastName }
 */
interface FreelancerViewModel extends FreelancerProfile {
  fullName: string;
  initials: string;
}

/**
 * Liste des profils publics — permet de naviguer vers le profil public
 * d'un freelancer pour l'endorser ou lui laisser un avis
 * Intégration inter-services : freelancer-profile-service (8082) + user-service (8081)
 */
@Component({
  selector: 'app-freelancers-list',
  templateUrl: './freelancers-list.component.html',
  styleUrls: ['./freelancers-list.component.css']
})
export class FreelancersListComponent implements OnInit {

  freelancers: FreelancerViewModel[] = [];
  isLoading = false;
  errorMessage = '';

  constructor(
    private profileService: FreelancerProfileService,
    private authService: AuthService,
    private api: ApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadFreelancers();
  }

  get currentUserId(): number {
    return this.authService.getCurrentAuthUser()!.userId;
  }

  /**
   * Charge les profils publics puis résout le nom de chaque freelancer
   * via /identity/users/{userId} du user-service
   */
  loadFreelancers(): void {
    this.isLoading = true;

    this.profileService.getAllPublicProfiles().subscribe({
      next: (data) => {
        // Exclure son propre profil de la liste
        const others = data.filter(f => f.userId !== this.currentUserId);

        if (others.length === 0) {
          this.freelancers = [];
          this.isLoading = false;
          return;
        }

        // Résoudre le nom de chaque freelancer en parallèle
        const userRequests = others.map(f =>
          this.api.get<any>(`/identity/users/${f.userId}`).pipe(
            catchError(() => of({ firstName: '', lastName: '' }))
          )
        );

        forkJoin(userRequests).subscribe({
          next: (users) => {
            this.freelancers = others.map((f, index) => {
              const user      = users[index] || {};
              const firstName = (user.firstName || '').trim();
              const lastName  = (user.lastName  || '').trim();
              const fullName  = `${firstName} ${lastName}`.trim();

              return {
                ...f,
                fullName:  fullName || f.headline || 'Freelancer',
                initials:  this.buildInitials(firstName, lastName, f.headline)
              };
            });
            this.isLoading = false;
          },
          error: () => {
            // Fail-open — afficher avec headline comme fallback
            this.freelancers = others.map(f => ({
              ...f,
              fullName:  f.headline || 'Freelancer',
              initials:  f.headline?.charAt(0)?.toUpperCase() || 'F'
            }));
            this.isLoading = false;
          }
        });
      },
      error: () => {
        this.errorMessage = 'Impossible de charger les freelancers.';
        this.isLoading = false;
      }
    });
  }

  buildInitials(firstName: string, lastName: string, fallback?: string): string {
    const f = (firstName || '').trim();
    const l = (lastName  || '').trim();
    if (f && l) return `${f.charAt(0)}${l.charAt(0)}`.toUpperCase();
    if (f)      return f.charAt(0).toUpperCase();
    return fallback?.charAt(0)?.toUpperCase() || 'F';
  }

  viewProfile(userId: number): void {
    this.router.navigate(['/app/profile/public', userId]);
  }
}
import { Component, OnInit, OnDestroy } from '@angular/core';
import { forkJoin, of, Subject } from 'rxjs';
import { takeUntil, catchError } from 'rxjs/operators';
import { ProfileReport } from '../../../core/models/freelancer.model';
import { FreelancerProfileService } from '../../../core/services/freelancer-profile.service';
import { UserResolutionService } from '../../../core/services/user-resolution.service';

interface ReportViewModel extends ProfileReport {
  reporterFullName: string;
  reporterInitials: string;
  freelancerFullName: string;
  freelancerInitials: string;
}

interface ReasonEntry {
  key: string;
  value: number;
}

@Component({
  selector: 'app-reports-management',
  templateUrl: './reports-management.component.html',
  styleUrls: ['./reports-management.component.css']
})
export class ReportsManagementComponent implements OnInit, OnDestroy {

  reports: ReportViewModel[] = [];
  loading = true;
  errorMsg = '';
  successMsg = '';

  expandedId: number | null = null;
  confirmingId: number | null = null;
  pendingAction: 'RESOLVED' | 'REJECTED' | null = null;

  private resolving = new Set<number>();
  private destroy$ = new Subject<void>();
  private successTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private profileService: FreelancerProfileService,
    private userResolution: UserResolutionService
  ) {}

  ngOnInit(): void {
    this.loadReports();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.clearSuccessTimer();
  }

  // ───────────────────────────────────────
  // Computed
  // ───────────────────────────────────────

  get reasonBreakdown(): ReasonEntry[] {
    const map: Record<string, number> = {};
    for (const r of this.reports) {
      const key = r.reason || 'OTHER';
      map[key] = (map[key] || 0) + 1;
    }
    return Object.entries(map)
      .map(([key, value]) => ({ key, value }))
      .sort((a, b) => b.value - a.value);
  }

  // ───────────────────────────────────────
  // Loading
  // ───────────────────────────────────────

  loadReports(): void {
    this.loading = true;
    this.errorMsg = '';
    this.successMsg = '';
    this.expandedId = null;
    this.confirmingId = null;
    this.pendingAction = null;

    this.profileService.getPendingReports()
      .pipe(
        takeUntil(this.destroy$),
        catchError(() => {
          this.errorMsg = 'Erreur lors du chargement des signalements';
          this.loading = false;
          return of(null);
        })
      )
      .subscribe(data => {
        if (!data || data.length === 0) {
          this.reports = [];
          this.loading = false;
          return;
        }

        const reporterObs = data.map(r =>
          this.safeName(() => this.userResolution.getFullName(r.reporterId))
        );

        // ───────────────────────────────────────
        // FIX: Type narrowing pour userId
        // ───────────────────────────────────────
        const freelancerObs = data.map(r => {
          const userId = r.profile?.userId;
          
          return userId
            ? this.safeName(() => this.userResolution.getFullName(userId))
            : of('Profil supprimé');
        });

        forkJoin([forkJoin(reporterObs), forkJoin(freelancerObs)])
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: ([reporterNames, freelancerNames]) => {
              this.reports = data.map((report, i) => ({
                ...report,
                reporterFullName: reporterNames[i],
                reporterInitials: this.userResolution.getInitials(reporterNames[i]),
                freelancerFullName: freelancerNames[i],
                freelancerInitials: this.userResolution.getInitials(freelancerNames[i])
              }));
              this.loading = false;
            },
            error: () => {
              // ───────────────────────────────────────
              // FIX PRO: Suppression des IDs (#123) dans l'affichage
              // ───────────────────────────────────────
              this.reports = data.map(report => ({
                ...report,
                reporterFullName: 'Utilisateur inconnu', // Plus de User #{id}
                reporterInitials: 'U',
                freelancerFullName: 'Profil introuvable', // Plus de User #{id}
                freelancerInitials: 'P'
              }));
              this.loading = false;
            }
          });
      });
  }

  private safeName(fn: () => any): any {
    return fn().pipe(catchError(() => of('Utilisateur inconnu')));
  }

  // ───────────────────────────────────────
  // Expand / Confirm / Resolve
  // ───────────────────────────────────────

  toggleExpand(id: number): void {
    const opening = this.expandedId !== id;
    this.expandedId = opening ? id : null;
    if (opening) {
      this.confirmingId = null;
      this.pendingAction = null;
    }
  }

  confirmAction(id: number, action: 'RESOLVED' | 'REJECTED'): void {
    this.confirmingId = id;
    this.pendingAction = action;
  }

  cancelConfirm(): void {
    this.confirmingId = null;
    this.pendingAction = null;
  }

  resolve(reportId: number, status: 'RESOLVED' | 'REJECTED'): void {
    if (this.resolving.has(reportId) || !this.pendingAction) return;
    this.resolving.add(reportId);

    this.profileService.resolveReport(reportId, status)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.resolving.delete(reportId);
          this.confirmingId = null;
          this.pendingAction = null;
          if (this.expandedId === reportId) this.expandedId = null;
          this.reports = this.reports.filter(r => r.id !== reportId);
          this.showSuccess(
            `Signalement → ${status === 'RESOLVED' ? 'Résolu' : 'Rejeté'}`
          );
        },
        error: (err) => {
          this.resolving.delete(reportId);
          // ───────────────────────────────────────
          // FIX PRO: Message d'erreur générique sans ID technique
          // ───────────────────────────────────────
          this.errorMsg = 'Une erreur est survenue lors du traitement du signalement.';
          console.error(err);
        }
      });
  }

  // ───────────────────────────────────────
  // Display helpers
  // ───────────────────────────────────────

  getReasonLabel(reason: string): string {
    const map: Record<string, string> = {
      SPAM: 'Spam',
      FAKE_PROFILE: 'Profil fictif',
      INAPPROPRIATE_CONTENT: 'Contenu inapproprié',
      HARASSMENT: 'Harcèlement',
      SCAM: 'Arnaque',
      DUPLICATE: 'Doublon',
      OTHER: 'Autre'
    };
    return map[reason] || reason || 'Autre';
  }

  getReasonSeverity(reason: string): string {
    const map: Record<string, string> = {
      SPAM: 'warning',
      FAKE_PROFILE: 'danger',
      INAPPROPRIATE_CONTENT: 'danger',
      HARASSMENT: 'danger',
      SCAM: 'danger',
      DUPLICATE: 'muted',
      OTHER: 'muted'
    };
    return map[reason] || 'muted';
  }

  getReasonColor(reason: string): string {
    const map: Record<string, string> = {
      SPAM: '#D97706',
      FAKE_PROFILE: '#E11D48',
      INAPPROPRIATE_CONTENT: '#E11D48',
      HARASSMENT: '#E11D48',
      SCAM: '#E11D48',
      DUPLICATE: '#64748B',
      OTHER: '#64748B'
    };
    return map[reason] || '#64748B';
  }

  getReasonIcon(reason: string): string {
    const map: Record<string, string> = {
      SPAM: 'fa-ban',
      FAKE_PROFILE: 'fa-user-slash',
      INAPPROPRIATE_CONTENT: 'fa-flag',
      HARASSMENT: 'fa-hand',
      SCAM: 'fa-mask',
      DUPLICATE: 'fa-clone',
      OTHER: 'fa-ellipsis'
    };
    return map[reason] || 'fa-ellipsis';
  }

  getProfileId(report: ProfileReport): number | null {
    return report.profile?.id ?? null;
  }

  // ───────────────────────────────────────
  // Internal
  // ───────────────────────────────────────

  private showSuccess(msg: string): void {
    this.clearSuccessTimer();
    this.successMsg = msg;
    this.successTimer = setTimeout(() => {
      this.successMsg = '';
      this.successTimer = null;
    }, 3000);
  }

  private clearSuccessTimer(): void {
    if (this.successTimer) {
      clearTimeout(this.successTimer);
      this.successTimer = null;
    }
  }
}
import { Component, OnInit } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { ProfileReport } from '../../../core/models/freelancer.model';
import { FreelancerProfileService } from '../../../core/services/freelancer-profile.service';

interface ReportViewModel extends ProfileReport {
  reporterFullName: string;
  reporterInitials: string;
}

@Component({
  selector: 'app-reports-management',
  templateUrl: './reports-management.component.html',
  styleUrls: ['./reports-management.component.css']
})
export class ReportsManagementComponent implements OnInit {

  reports: ReportViewModel[] = [];
  loading = true;
  errorMsg = '';
  successMsg = '';

  private userServiceUrl = 'http://localhost:8081/api';

  constructor(
    private profileService: FreelancerProfileService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadReports();
  }

  loadReports(): void {
    this.loading = true;
    this.errorMsg = '';
    this.successMsg = '';

    this.profileService.getPendingReports().subscribe({
      next: (data) => {
        if (!data || data.length === 0) {
          this.reports = [];
          this.loading = false;
          return;
        }

        // Appel user-service pour chaque reporter
        const userRequests = data.map(report =>
          this.http.get<any>(`${this.userServiceUrl}/users/${report.reporterId}`).pipe(
            catchError(() => of({ firstName: '', lastName: '' }))
          )
        );

        forkJoin(userRequests).subscribe({
          next: (users) => {
            this.reports = data.map((report, index) => {
              const user = users[index] || {};
              const firstName = (user.firstName || user.firstname || user.prenom || '').trim();
              const lastName  = (user.lastName  || user.lastname  || user.nom   || '').trim();
              const fullName  = `${firstName} ${lastName}`.trim() || `User #${report.reporterId}`;
              const initials  = firstName && lastName
                ? `${firstName[0]}${lastName[0]}`.toUpperCase()
                : fullName[0]?.toUpperCase() || 'U';

              return {
                ...report,
                reporterFullName: fullName,
                reporterInitials: initials
              };
            });
            this.loading = false;
          },
          error: () => {
            // Fallback si user-service indisponible
            this.reports = data.map(report => ({
              ...report,
              reporterFullName: `User #${report.reporterId}`,
              reporterInitials: 'U'
            }));
            this.loading = false;
          }
        });
      },
      error: (err) => {
        this.errorMsg = 'Erreur lors du chargement des signalements';
        this.loading = false;
        console.error(err);
      }
    });
  }

  resolve(reportId: number, status: 'RESOLVED' | 'REJECTED'): void {
    this.profileService.resolveReport(reportId, status).subscribe({
      next: () => {
        this.reports = this.reports.filter(r => r.id !== reportId);
        this.successMsg = `Signalement #${reportId} → ${status === 'RESOLVED' ? 'Résolu' : 'Rejeté'}`;
        setTimeout(() => this.successMsg = '', 3000);
      },
      error: (err) => {
        this.errorMsg = `Erreur lors du traitement du signalement #${reportId}`;
        console.error(err);
      }
    });
  }

  getProfileId(report: ProfileReport): number | null {
    return report.profile?.id ?? null;
  }
}
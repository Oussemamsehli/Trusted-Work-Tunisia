import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { ProfileReport } from '../../../core/models/freelancer.model';
import { FreelancerProfileService } from '../../../core/services/freelancer-profile.service';
import { UserResolutionService } from '../../../core/services/user-resolution.service';

interface ReportViewModel extends ProfileReport {
  reporterFullName: string;
  reporterInitials: string;
  freelancerFullName: string;
  freelancerInitials: string;
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

  constructor(
    private profileService: FreelancerProfileService,
    private userResolution: UserResolutionService
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

        const reporterRequests = data.map(report =>
          this.userResolution.getFullName(report.reporterId)
        );

        const freelancerRequests = data.map(report =>
          report.profile?.userId
            ? this.userResolution.getFullName(report.profile.userId)
            : this.userResolution.getFullName(-1)
        );

        forkJoin([
          forkJoin(reporterRequests),
          forkJoin(freelancerRequests)
        ]).subscribe({
          next: ([reporterNames, freelancerNames]) => {
            this.reports = data.map((report, index) => {
              const reporterFullName = reporterNames[index];
              const freelancerFullName = freelancerNames[index];

              return {
                ...report,
                reporterFullName,
                reporterInitials: this.userResolution.getInitials(reporterFullName),
                freelancerFullName,
                freelancerInitials: this.userResolution.getInitials(freelancerFullName)
              };
            });

            this.loading = false;
          },
          error: () => {
            this.reports = data.map(report => ({
              ...report,
              reporterFullName: `User #${report.reporterId}`,
              reporterInitials: 'U',
              freelancerFullName: report.profile?.userId ? `User #${report.profile.userId}` : '—',
              freelancerInitials: 'F'
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
import { Component, OnInit } from '@angular/core';
import { ProfileReport } from '../../../core/models/freelancer.model';
import { FreelancerProfileService } from '../../../core/services/freelancer-profile.service';

@Component({
  selector: 'app-reports-management',
  templateUrl: './reports-management.component.html',
  styleUrls: ['./reports-management.component.css']
})
export class ReportsManagementComponent implements OnInit {

  reports: ProfileReport[] = [];
  loading = true;
  errorMsg = '';

  // Pour afficher un message de succès temporaire
  successMsg = '';

  constructor(private profileService: FreelancerProfileService) {}

  ngOnInit(): void {
    this.loadReports();
  }

  loadReports(): void {
    this.loading = true;
    this.errorMsg = '';
    this.profileService.getPendingReports().subscribe({
      next: (data) => {
        this.reports = data;
        this.loading = false;
      },
      error: (err) => {
        this.errorMsg = 'Erreur lors du chargement des signalements';
        this.loading = false;
        console.error(err);
      }
    });
  }

  /** Résoudre un signalement — status = RESOLVED ou REJECTED */
  resolve(reportId: number, status: string): void {
    this.profileService.resolveReport(reportId, status).subscribe({
      next: () => {
        // Retirer le signalement traité de la liste
        this.reports = this.reports.filter(r => r.reportId !== reportId);
        this.successMsg = `Signalement #${reportId} → ${status}`;
        // Masquer le message après 3 secondes
        setTimeout(() => this.successMsg = '', 3000);
      },
      error: (err) => {
        this.errorMsg = `Erreur lors du traitement du signalement #${reportId}`;
        console.error(err);
      }
    });
  }
}
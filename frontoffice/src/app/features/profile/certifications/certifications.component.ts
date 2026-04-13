import { Component, OnInit } from '@angular/core';
import { FreelancerProfileService } from '../../../core/services/freelancer-profile.service';
import { AuthService } from '../../../core/services/auth.service';
import { Certification } from '../../../core/models/freelancer.model';

/**
 * Composant Certifications — diplômes et certifications externes du freelancer
 * Types supportés : EXTERNAL (AWS, PMP, etc.) et ACADEMIC (Licence, Master, etc.)
 * Les certifications internes plateforme = Module 04, hors scope de ce composant
 */
@Component({
  selector: 'app-certifications',
  templateUrl: './certifications.component.html',
  styleUrls: ['./certifications.component.css']
})
export class CertificationsComponent implements OnInit {
  certifications: Certification[] = [];
  isLoading = false;
  isSaving = false;
  deletingCertId: number | null = null;

  errorMessage = '';
  successMessage = '';
  showForm = false;

  newCert: {
    title: string;
    issuer: string;
    type: 'EXTERNAL' | 'ACADEMIC';
    issueDate: string;
    expiryDate: string;
    certificateUrl: string;
  } = {
    title: '',
    issuer: '',
    type: 'EXTERNAL',
    issueDate: '',
    expiryDate: '',
    certificateUrl: ''
  };

  constructor(
    private profileService: FreelancerProfileService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadCertifications();
  }

  private get currentUserId(): number {
    return this.authService.getCurrentAuthUser()!.userId;
  }

  get canSave(): boolean {
    return !!this.newCert.title.trim() &&
           !!this.newCert.issuer.trim() &&
           !this.isSaving;
  }

  get validCount(): number {
    return this.certifications.filter(c => !c.isExpired).length;
  }

  get expiredCount(): number {
    return this.certifications.filter(c => c.isExpired).length;
  }

  get academicCount(): number {
    return this.certifications.filter(c => c.type === 'ACADEMIC').length;
  }

  get externalCount(): number {
    return this.certifications.filter(c => c.type === 'EXTERNAL').length;
  }

  loadCertifications(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.profileService.getMyCertifications(this.currentUserId).subscribe({
      next: (data) => {
        this.certifications = data || [];
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Impossible de charger les certifications.';
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

  addCertification(): void {
    if (!this.canSave) return;

    this.clearMessages();
    this.isSaving = true;

    const payload: Partial<Certification> = {
      title: this.newCert.title.trim(),
      issuer: this.newCert.issuer.trim(),
      type: this.newCert.type,
      issueDate: this.newCert.issueDate || undefined,
      expiryDate: this.newCert.expiryDate || undefined,
      certificateUrl: this.newCert.certificateUrl.trim() || undefined
    };

    this.profileService.addCertification(this.currentUserId, payload).subscribe({
      next: () => {
        this.isSaving = false;
        this.successMessage = 'Certification ajoutée avec succès.';
        this.resetForm();
        this.showForm = false;
        this.loadCertifications();
        this.autoClearMessages();
      },
      error: () => {
        this.isSaving = false;
        this.errorMessage = 'Erreur lors de l’ajout de la certification.';
        this.autoClearMessages();
      }
    });
  }

  deleteCertification(certId: number): void {
    if (!confirm('Supprimer cette certification ?')) return;

    this.clearMessages();
    this.deletingCertId = certId;

    this.profileService.deleteCertification(certId, this.currentUserId).subscribe({
      next: () => {
        this.deletingCertId = null;
        this.successMessage = 'Certification supprimée avec succès.';
        this.loadCertifications();
        this.autoClearMessages();
      },
      error: () => {
        this.deletingCertId = null;
        this.errorMessage = 'Erreur lors de la suppression.';
        this.autoClearMessages();
      }
    });
  }

  resetForm(): void {
    this.newCert = {
      title: '',
      issuer: '',
      type: 'EXTERNAL',
      issueDate: '',
      expiryDate: '',
      certificateUrl: ''
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

  getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      EXTERNAL: 'Externe',
      ACADEMIC: 'Académique'
    };
    return labels[type] ?? type;
  }

  getTypeClass(type: string): string {
    const classes: Record<string, string> = {
      EXTERNAL: 'type-external',
      ACADEMIC: 'type-academic'
    };
    return classes[type] ?? '';
  }

  trackByCertification(index: number, cert: Certification): number {
    return cert.id;
  }
}
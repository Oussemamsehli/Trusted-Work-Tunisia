import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import {
  FreelancerProfile, Skill, PortfolioItem, Certification,
  WorkExperience, Education, ProfileReview, Endorsement,
  CompletenessResponse, CareerPathResponse, SkillGapResponse, SkillGapRecommendation
} from '../../../core/models/freelancer.model';
import { FreelancerProfileService } from '../../../core/services/freelancer-profile.service';
import { UserResolutionService } from '../../../core/services/user-resolution.service';

interface ReviewViewModel extends ProfileReview {
  clientFullName: string;
  clientInitials: string;
}

interface EndorsementViewModel extends Endorsement {
  endorserFullName: string;
  endorserInitials: string;
}

@Component({
  selector: 'app-profile-detail',
  templateUrl: './profile-detail.component.html',
  styleUrls: ['./profile-detail.component.css']
})
export class ProfileDetailComponent implements OnInit {

  profile: FreelancerProfile | null = null;
  profileOwnerName = '';

  skills: Skill[] = [];
  portfolio: PortfolioItem[] = [];
  certifications: Certification[] = [];
  workExperiences: WorkExperience[] = [];
  educations: Education[] = [];

  showAddEduForm = false;
  newEdu = { degree: '', institution: '', fieldOfStudy: '', graduationYear: null as number | null };
  editingEduId: number | null = null;
  editEduForm = { degree: '', institution: '', fieldOfStudy: '', graduationYear: null as number | null };
  eduYears: number[] = Array.from(
    { length: new Date().getFullYear() - 1949 },
    (_, i) => new Date().getFullYear() - i
  );

  showAddCertForm = false;
  editingCertId: number | null = null;
  newCert = this.getEmptyCert();
  editCert = this.getEmptyCert();

  showAddWorkForm = false;
  editingWorkId: number | null = null;
  newWork = this.getEmptyWork();
  editWork = this.getEmptyWork();

  reviews: ReviewViewModel[] = [];
  averageRating = 0;

  completeness: CompletenessResponse | null = null;
  careerPath: CareerPathResponse | null = null;
  skillGapDiagnostic: SkillGapResponse | null = null;
  skillGapRecommendations: SkillGapRecommendation | null = null;

  loading = true;
  errorMsg = '';
  successMsg = '';
  showDeleteConfirm = false;

  selectedSkill: Skill | null = null;
  endorsements: EndorsementViewModel[] = [];
  endorsementsLoading = false;
  endorsementsError = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private profileService: FreelancerProfileService,
    private userResolution: UserResolutionService
  ) {}

  get pinnedPortfolio(): PortfolioItem[] {
    return this.portfolio.filter(item => item.pinned);
  }

  get regularPortfolio(): PortfolioItem[] {
    return this.portfolio.filter(item => !item.pinned);
  }

  get pinnedPortfolioCount(): number {
    return this.pinnedPortfolio.length;
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.loadProfile(id);
    } else {
      this.loading = false;
      this.errorMsg = 'Identifiant de profil invalide.';
    }
  }

  loadProfile(profileId: number): void {
    this.loading = true;
    this.errorMsg = '';
    this.successMsg = '';

    this.profileService.getProfileById(profileId).subscribe({
      next: (data) => {
        this.profile = data;
        this.loading = false;
        const userId = data.userId;

        this.userResolution.getFullName(userId).subscribe(
          name => this.profileOwnerName = name
        );

        this.profileService.getSkillsByUserId(userId).subscribe({
          next: (s) => this.skills = s,
          error: () => this.skills = []
        });

        this.profileService.getPortfolio(userId).subscribe({
          next: (p) => {
            this.portfolio = this.sortPortfolioItems(p || []);
          },
          error: () => this.portfolio = []
        });

        this.profileService.getCertifications(userId).subscribe({
          next: (c) => {
            this.certifications = (c || []).sort((a, b) =>
              this.getSortableDateValue(b.issueDate) - this.getSortableDateValue(a.issueDate)
            );
          },
          error: () => this.certifications = []
        });

        this.profileService.getWorkExperiences(userId).subscribe({
          next: (w) => {
            this.workExperiences = (w || []).sort((a, b) => {
              if (!!b.isCurrent !== !!a.isCurrent) {
                return Number(!!b.isCurrent) - Number(!!a.isCurrent);
              }
              return this.getSortableDateValue(b.startDate) - this.getSortableDateValue(a.startDate);
            });
          },
          error: () => this.workExperiences = []
        });

        this.profileService.getEducations(userId).subscribe({
          next: (e) => this.educations = e,
          error: () => this.educations = []
        });

        this.profileService.getReviewsByProfile(profileId).subscribe({
          next: (rawReviews) => {
            if (!rawReviews || rawReviews.length === 0) {
              this.reviews = [];
              return;
            }

            forkJoin(rawReviews.map(r => this.userResolution.getFullName(r.clientId))).subscribe({
              next: (names) => {
                this.reviews = rawReviews.map((r, i) => ({
                  ...r,
                  clientFullName: names[i],
                  clientInitials: this.userResolution.getInitials(names[i])
                }));
              },
              error: () => {
                this.reviews = rawReviews.map(r => ({
                  ...r,
                  clientFullName: `User #${r.clientId}`,
                  clientInitials: 'U'
                }));
              }
            });
          },
          error: () => this.reviews = []
        });

        this.profileService.getAverageRating(profileId).subscribe({
          next: (avg) => this.averageRating = avg,
          error: () => this.averageRating = 0
        });

        this.profileService.getCompleteness(userId).subscribe({
          next: (c) => this.completeness = c,
          error: () => this.completeness = null
        });

        this.profileService.getCareerPath(userId).subscribe({
          next: (cp) => this.careerPath = cp,
          error: () => this.careerPath = null
        });

        this.profileService.getSkillGaps(userId).subscribe({
          next: (diag) => this.skillGapDiagnostic = diag,
          error: () => this.skillGapDiagnostic = null
        });

        this.profileService.getSkillGapRecommendations(userId).subscribe({
          next: (rec) => this.skillGapRecommendations = rec,
          error: () => this.skillGapRecommendations = null
        });
      },
      error: (err) => {
        this.errorMsg = 'Erreur lors du chargement du profil';
        this.loading = false;
        console.error(err);
      }
    });
  }

  private showSuccess(msg: string): void {
    this.successMsg = msg;
    setTimeout(() => this.successMsg = '', 3000);
  }

  confirmDeleteProfile(): void {
    if (!this.profile) return;

    this.profileService.deleteProfile(this.profile.userId).subscribe({
      next: () => this.router.navigate(['/admin/freelancers']),
      error: (err) => {
        this.errorMsg = 'Erreur lors de la suppression du profil';
        console.error(err);
      }
    });
  }

  changeAvailability(status: 'AVAILABLE' | 'BUSY' | 'ON_VACATION'): void {
    if (!this.profile) return;

    this.profileService.updateAvailability(this.profile.userId, status).subscribe({
      next: (updated) => {
        this.profile = updated;
        this.showSuccess('Disponibilité changée → ' + this.getAvailabilityLabel(status));
      },
      error: (err) => {
        this.errorMsg = 'Erreur lors du changement de disponibilité';
        console.error(err);
      }
    });
  }

  deleteSkill(skillId: number): void {
    if (!this.profile) return;

    this.profileService.deleteSkill(skillId, this.profile.userId).subscribe({
      next: () => {
        this.skills = this.skills.filter(s => s.id !== skillId);
        this.showSuccess('Compétence supprimée');
      },
      error: (err) => {
        this.errorMsg = 'Erreur lors de la suppression de la compétence';
        console.error(err);
      }
    });
  }

  private getEmptyCert() {
    return {
      title: '',
      issuer: '',
      type: 'EXTERNAL',
      issueDate: '',
      expiryDate: '',
      certificateUrl: ''
    };
  }

  private getEmptyWork() {
    return {
      jobTitle: '',
      company: '',
      location: '',
      description: '',
      startDate: '',
      endDate: '',
      isCurrent: false
    };
  }

  addCertification(): void {
    if (!this.profile || !this.newCert.title.trim() || !this.newCert.issuer.trim()) {
      this.errorMsg = 'Le titre et l’organisme émetteur sont obligatoires.';
      return;
    }

    if (!this.validateCertDates(this.newCert.issueDate, this.newCert.expiryDate)) {
      this.errorMsg = 'La date d’expiration doit être postérieure ou égale à la date d’obtention.';
      return;
    }

    const payload = {
      title: this.newCert.title.trim(),
      issuer: this.newCert.issuer.trim(),
      type: this.newCert.type,
      issueDate: this.newCert.issueDate || undefined,
      expiryDate: this.newCert.expiryDate || undefined,
      certificateUrl: this.newCert.certificateUrl.trim() || undefined
    };

    this.profileService.addCertification(this.profile.userId, payload).subscribe({
      next: (cert) => {
        this.certifications = [cert, ...this.certifications].sort((a, b) =>
          this.getSortableDateValue(b.issueDate) - this.getSortableDateValue(a.issueDate)
        );
        this.newCert = this.getEmptyCert();
        this.showAddCertForm = false;
        this.showSuccess('Certification ajoutée');
      },
      error: (err) => {
        this.errorMsg = err?.error?.message || err?.error || "Erreur lors de l'ajout de la certification";
      }
    });
  }

  startEditCert(c: Certification): void {
    this.editingCertId = c.id;
    this.editCert = {
      title: c.title || '',
      issuer: c.issuer || '',
      type: c.type || 'EXTERNAL',
      issueDate: this.toDateInputValue(c.issueDate),
      expiryDate: this.toDateInputValue(c.expiryDate),
      certificateUrl: c.certificateUrl || ''
    };
  }

  cancelEditCert(): void {
    this.editingCertId = null;
    this.editCert = this.getEmptyCert();
  }

  saveEditCert(certId: number): void {
    if (!this.profile) return;

    if (!this.editCert.title.trim() || !this.editCert.issuer.trim()) {
      this.errorMsg = 'Le titre et l’organisme émetteur sont obligatoires.';
      return;
    }

    if (!this.validateCertDates(this.editCert.issueDate, this.editCert.expiryDate)) {
      this.errorMsg = 'La date d’expiration doit être postérieure ou égale à la date d’obtention.';
      return;
    }

    const payload = {
      title: this.editCert.title.trim(),
      issuer: this.editCert.issuer.trim(),
      type: this.editCert.type,
      issueDate: this.editCert.issueDate || undefined,
      expiryDate: this.editCert.expiryDate || undefined,
      certificateUrl: this.editCert.certificateUrl.trim() || undefined
    };

    this.profileService.updateCertification(certId, this.profile.userId, payload).subscribe({
      next: (updated) => {
        this.certifications = this.certifications
          .map(c => c.id === certId ? updated : c)
          .sort((a, b) => this.getSortableDateValue(b.issueDate) - this.getSortableDateValue(a.issueDate));
        this.editingCertId = null;
        this.editCert = this.getEmptyCert();
        this.showSuccess('Certification modifiée');
      },
      error: (err) => {
        this.errorMsg = err?.error?.message || err?.error || 'Erreur lors de la modification';
      }
    });
  }

  deleteCertification(certId: number): void {
    if (!this.profile) return;

    this.profileService.deleteCertification(certId, this.profile.userId).subscribe({
      next: () => {
        this.certifications = this.certifications.filter(c => c.id !== certId);
        this.showSuccess('Certification supprimée');
      },
      error: (err) => {
        this.errorMsg = 'Erreur lors de la suppression de la certification';
        console.error(err);
      }
    });
  }

  validateCertDates(issueDate?: string, expiryDate?: string): boolean {
    if (!issueDate || !expiryDate) return true;
    return new Date(expiryDate) >= new Date(issueDate);
  }

  isCertExpiringSoon(expiryDate: string | Date | undefined, isExpired?: boolean): boolean {
    if (!expiryDate || isExpired) return false;

    const today = new Date();
    const expiry = new Date(expiryDate);

    today.setHours(0, 0, 0, 0);
    expiry.setHours(0, 0, 0, 0);

    const diffMs = expiry.getTime() - today.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    return diffDays > 0 && diffDays <= 30;
  }

  getCertStatusClass(cert: Certification): string {
    if (cert.isExpired) return 'badge-danger';
    if (this.isCertExpiringSoon(cert.expiryDate, cert.isExpired)) return 'badge-warning';
    return 'badge-success';
  }

  getCertStatusLabel(cert: Certification): string {
    if (cert.isExpired) return 'Expirée';
    if (this.isCertExpiringSoon(cert.expiryDate, cert.isExpired)) return 'Expire bientôt';
    return 'Valide';
  }

  addWorkExperience(): void {
    if (!this.profile) return;

    if (!this.newWork.jobTitle.trim() || !this.newWork.company.trim() || !this.newWork.startDate) {
      this.errorMsg = 'Le titre, l’entreprise et la date de début sont obligatoires.';
      return;
    }

    if (!this.validateWorkDates(this.newWork.startDate, this.newWork.endDate, this.newWork.isCurrent)) {
      this.errorMsg = 'La date de fin doit être postérieure ou égale à la date de début.';
      return;
    }

    const payload = {
      jobTitle: this.newWork.jobTitle.trim(),
      company: this.newWork.company.trim(),
      location: this.newWork.location.trim() || undefined,
      description: this.newWork.description.trim() || undefined,
      startDate: this.newWork.startDate,
      endDate: this.newWork.isCurrent ? undefined : (this.newWork.endDate || undefined),
      isCurrent: this.newWork.isCurrent
    };

    this.profileService.addWorkExperience(this.profile.userId, payload).subscribe({
      next: (exp) => {
        this.workExperiences = [exp, ...this.workExperiences].sort((a, b) => {
          if (!!b.isCurrent !== !!a.isCurrent) {
            return Number(!!b.isCurrent) - Number(!!a.isCurrent);
          }
          return this.getSortableDateValue(b.startDate) - this.getSortableDateValue(a.startDate);
        });
        this.newWork = this.getEmptyWork();
        this.showAddWorkForm = false;
        this.showSuccess('Expérience ajoutée');
      },
      error: (err) => {
        this.errorMsg = err?.error?.message || err?.error || "Erreur lors de l'ajout de l'expérience";
      }
    });
  }

  startEditWork(w: WorkExperience): void {
    this.editingWorkId = w.id;
    this.editWork = {
      jobTitle: w.jobTitle || '',
      company: w.company || '',
      location: w.location || '',
      description: w.description || '',
      startDate: this.toDateInputValue(w.startDate),
      endDate: this.toDateInputValue(w.endDate),
      isCurrent: !!w.isCurrent
    };
  }

  cancelEditWork(): void {
    this.editingWorkId = null;
    this.editWork = this.getEmptyWork();
  }

  saveEditWork(expId: number): void {
    if (!this.profile) return;

    if (!this.editWork.jobTitle.trim() || !this.editWork.company.trim() || !this.editWork.startDate) {
      this.errorMsg = 'Le titre, l’entreprise et la date de début sont obligatoires.';
      return;
    }

    if (!this.validateWorkDates(this.editWork.startDate, this.editWork.endDate, this.editWork.isCurrent)) {
      this.errorMsg = 'La date de fin doit être postérieure ou égale à la date de début.';
      return;
    }

    const payload = {
      jobTitle: this.editWork.jobTitle.trim(),
      company: this.editWork.company.trim(),
      location: this.editWork.location.trim() || undefined,
      description: this.editWork.description.trim() || undefined,
      startDate: this.editWork.startDate,
      endDate: this.editWork.isCurrent ? undefined : (this.editWork.endDate || undefined),
      isCurrent: this.editWork.isCurrent
    };

    this.profileService.updateWorkExperience(expId, this.profile.userId, payload).subscribe({
      next: (updated) => {
        this.workExperiences = this.workExperiences
          .map(w => w.id === expId ? updated : w)
          .sort((a, b) => {
            if (!!b.isCurrent !== !!a.isCurrent) {
              return Number(!!b.isCurrent) - Number(!!a.isCurrent);
            }
            return this.getSortableDateValue(b.startDate) - this.getSortableDateValue(a.startDate);
          });
        this.editingWorkId = null;
        this.editWork = this.getEmptyWork();
        this.showSuccess('Expérience modifiée');
      },
      error: (err) => {
        this.errorMsg = err?.error?.message || err?.error || 'Erreur lors de la modification';
      }
    });
  }

  validateWorkDates(start?: string, end?: string, isCurrent?: boolean): boolean {
    if (isCurrent) return true;
    if (!start || !end) return true;
    return new Date(end) >= new Date(start);
  }

  onCurrentWorkChange(formType: 'add' | 'edit'): void {
    if (formType === 'add' && this.newWork.isCurrent) {
      this.newWork.endDate = '';
    }

    if (formType === 'edit' && this.editWork.isCurrent) {
      this.editWork.endDate = '';
    }
  }

  addEducation(): void {
    if (!this.profile || !this.newEdu.degree.trim() || !this.newEdu.institution.trim()) return;

    const payload = {
      degree: this.newEdu.degree.trim(),
      institution: this.newEdu.institution.trim(),
      fieldOfStudy: this.newEdu.fieldOfStudy.trim() || undefined,
      graduationYear: this.newEdu.graduationYear ?? undefined
    };

    this.profileService.addEducation(this.profile.userId, payload).subscribe({
      next: (edu) => {
        this.educations = [...this.educations, edu].sort((a, b) => (b.graduationYear ?? 0) - (a.graduationYear ?? 0));
        this.newEdu = { degree: '', institution: '', fieldOfStudy: '', graduationYear: null };
        this.showAddEduForm = false;
        this.showSuccess('Formation ajoutée');
      },
      error: (err) => {
        this.errorMsg = err.error || "Erreur lors de l'ajout de la formation";
      }
    });
  }

  startEditEdu(edu: Education): void {
    this.editingEduId = edu.id;
    this.editEduForm = {
      degree: edu.degree,
      institution: edu.institution,
      fieldOfStudy: edu.fieldOfStudy || '',
      graduationYear: edu.graduationYear ?? null
    };
  }

  cancelEditEdu(): void {
    this.editingEduId = null;
  }

  saveEditEdu(eduId: number): void {
    if (!this.profile) return;

    const payload = {
      degree: this.editEduForm.degree.trim(),
      institution: this.editEduForm.institution.trim(),
      fieldOfStudy: this.editEduForm.fieldOfStudy.trim() || undefined,
      graduationYear: this.editEduForm.graduationYear ?? undefined
    };

    this.profileService.updateEducation(eduId, this.profile.userId, payload).subscribe({
      next: (updated) => {
        this.educations = this.educations
          .map(e => e.id === eduId ? updated : e)
          .sort((a, b) => (b.graduationYear ?? 0) - (a.graduationYear ?? 0));
        this.editingEduId = null;
        this.showSuccess('Formation mise à jour');
      },
      error: (err) => {
        this.errorMsg = err.error || 'Erreur lors de la mise à jour';
      }
    });
  }

  deleteEducation(eduId: number): void {
    if (!this.profile) return;

    this.profileService.deleteEducation(eduId, this.profile.userId).subscribe({
      next: () => {
        this.educations = this.educations.filter(e => e.id !== eduId);
        this.showSuccess('Formation supprimée');
      },
      error: (err) => {
        this.errorMsg = 'Erreur lors de la suppression de la formation';
        console.error(err);
      }
    });
  }

  pinPortfolioItem(itemId: number): void {
    if (!this.profile) return;

    this.profileService.pinPortfolioItem(itemId, this.profile.userId).subscribe({
      next: (updated) => {
        this.portfolio = this.sortPortfolioItems(
          this.portfolio.map(item => item.id === itemId ? updated : item)
        );
        this.showSuccess('Projet épinglé');
      },
      error: (err) => {
        this.errorMsg = err?.error?.message || 'Erreur lors de l’épinglage du projet';
        console.error(err);
      }
    });
  }

  unpinPortfolioItem(itemId: number): void {
    if (!this.profile) return;

    this.profileService.unpinPortfolioItem(itemId, this.profile.userId).subscribe({
      next: (updated) => {
        this.portfolio = this.sortPortfolioItems(
          this.portfolio.map(item => item.id === itemId ? updated : item)
        );
        this.showSuccess('Projet désépinglé');
      },
      error: (err) => {
        this.errorMsg = err?.error?.message || 'Erreur lors du désépinglage du projet';
        console.error(err);
      }
    });
  }

  deletePortfolioItem(itemId: number): void {
    if (!this.profile) return;

    this.profileService.deletePortfolioItem(itemId, this.profile.userId).subscribe({
      next: () => {
        this.portfolio = this.portfolio.filter(p => p.id !== itemId);
        this.showSuccess('Projet portfolio supprimé');
      },
      error: (err) => {
        this.errorMsg = 'Erreur lors de la suppression du projet portfolio';
        console.error(err);
      }
    });
  }

  deleteWorkExperience(expId: number): void {
    if (!this.profile) return;

    this.profileService.deleteWorkExperience(expId, this.profile.userId).subscribe({
      next: () => {
        this.workExperiences = this.workExperiences.filter(w => w.id !== expId);
        this.showSuccess('Expérience supprimée');
      },
      error: (err) => {
        this.errorMsg = "Erreur lors de la suppression de l'expérience";
        console.error(err);
      }
    });
  }

  openEndorsements(skill: Skill): void {
    if (this.selectedSkill?.id === skill.id) {
      this.closeEndorsements();
      return;
    }

    this.selectedSkill = skill;
    this.endorsements = [];
    this.endorsementsLoading = true;
    this.endorsementsError = '';

    this.profileService.getEndorsementsBySkill(skill.id).subscribe({
      next: (rawList) => {
        if (!rawList || rawList.length === 0) {
          this.endorsements = [];
          this.endorsementsLoading = false;
          return;
        }

        forkJoin(rawList.map(e => this.userResolution.getFullName(e.endorserId))).subscribe({
          next: (names) => {
            this.endorsements = rawList.map((e, i) => ({
              ...e,
              endorserFullName: names[i],
              endorserInitials: this.userResolution.getInitials(names[i])
            }));
            this.endorsementsLoading = false;
          },
          error: () => {
            this.endorsements = rawList.map(e => ({
              ...e,
              endorserFullName: `User #${e.endorserId}`,
              endorserInitials: 'U'
            }));
            this.endorsementsLoading = false;
          }
        });
      },
      error: () => {
        this.endorsementsError = 'Impossible de charger les endorsements.';
        this.endorsementsLoading = false;
      }
    });
  }

  closeEndorsements(): void {
    this.selectedSkill = null;
    this.endorsements = [];
    this.endorsementsError = '';
  }

  getTechArray(technologies: string | undefined | null): string[] {
    if (!technologies) return [];
    return technologies
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);
  }

  getProjectScoreClass(score: number | undefined | null): string {
    const value = score ?? 0;
    if (value >= 80) return 'badge-success';
    if (value >= 60) return 'badge-warning';
    return 'badge-danger';
  }

  getProjectScoreLabel(score: number | undefined | null): string {
    const value = score ?? 0;
    if (value >= 100) return 'Excellent';
    if (value >= 80) return 'Très bon';
    if (value >= 60) return 'Bon';
    if (value >= 40) return 'Moyen';
    return 'À compléter';
  }

  getStars(rating: number): string[] {
    const stars: string[] = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= Math.floor(rating)) stars.push('fas fa-star');
      else if (i - rating < 1) stars.push('fas fa-star-half-alt');
      else stars.push('far fa-star');
    }
    return stars;
  }

  getStatusBadge(status: string): string {
    switch (status) {
      case 'AVAILABLE': return 'badge-success';
      case 'BUSY': return 'badge-warning';
      case 'ON_VACATION': return 'badge-danger';
      default: return 'badge-muted';
    }
  }

  getAvailabilityLabel(status: string): string {
    switch (status) {
      case 'AVAILABLE': return 'Disponible';
      case 'BUSY': return 'Occupé';
      case 'ON_VACATION': return 'En vacances';
      default: return status || '—';
    }
  }

  getVisibilityLabel(value: string): string {
    switch (value) {
      case 'PUBLIC': return 'Public';
      case 'PRIVATE': return 'Privé';
      case 'CONNECTIONS_ONLY': return 'Connexions uniquement';
      default: return value || '—';
    }
  }

  getProjectTypeLabel(value: string): string {
    switch (value) {
      case 'SHORT_TERM': return 'Court terme';
      case 'LONG_TERM': return 'Long terme';
      case 'BOTH': return 'Les deux';
      default: return value || '—';
    }
  }

  getScoreClass(score: number): string {
    if (score >= 80) return 'text-success';
    if (score >= 50) return 'text-warning';
    return 'text-danger';
  }

  getCompletenessValue(value: number | null | undefined): number {
    return value ?? 0;
  }

  getWorkDurationLabel(work: WorkExperience): string {
    if (work.durationLabel) return work.durationLabel;

    const start = work.startDate ? new Date(work.startDate) : null;
    const end = work.isCurrent ? new Date() : (work.endDate ? new Date(work.endDate) : null);

    if (!start || !end || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return '';
    }

    const totalMonths =
      (end.getFullYear() - start.getFullYear()) * 12 +
      (end.getMonth() - start.getMonth());

    if (totalMonths <= 0) return 'Moins d’un mois';
    if (totalMonths < 12) return `${totalMonths} mois`;

    const years = Math.floor(totalMonths / 12);
    const months = totalMonths % 12;

    if (months > 0) {
      return `${years} ${years === 1 ? 'an' : 'ans'} ${months} mois`;
    }

    return `${years} ${years === 1 ? 'an' : 'ans'}`;
  }

  private toDateInputValue(date: string | Date | undefined | null): string {
    if (!date) return '';

    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return '';

    const year = d.getFullYear();
    const month = `${d.getMonth() + 1}`.padStart(2, '0');
    const day = `${d.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private getSortableDateValue(date: string | Date | undefined | null): number {
    if (!date) return 0;
    const d = new Date(date);
    return Number.isNaN(d.getTime()) ? 0 : d.getTime();
  }

  private sortPortfolioItems(items: PortfolioItem[]): PortfolioItem[] {
    return [...items].sort((a, b) => {
      if (!!a.pinned !== !!b.pinned) {
        return Number(!!b.pinned) - Number(!!a.pinned);
      }
      return this.getSortableDateValue(b.completionDate) - this.getSortableDateValue(a.completionDate);
    });
  }
}
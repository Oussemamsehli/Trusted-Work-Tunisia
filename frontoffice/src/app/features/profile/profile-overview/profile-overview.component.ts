import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs/operators';
import { forkJoin } from 'rxjs';
import { UserService, UserProfileResponse } from '../../../core/services/user.service';
import { ApiService } from '../../../core/services/api.service';
import { FreelancerProfileService } from '../../../core/services/freelancer-profile.service';
import { Skill, CompletenessResponse, FreelancerProfile } from '../../../core/models/freelancer.model';

const API_BASE = 'http://localhost:8081/api';
const DEFAULT_AVATAR = 'data:image/svg+xml;utf8,' + encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160">
  <rect width="160" height="160" rx="24" fill="#1e293b"/>
  <circle cx="80" cy="60" r="28" fill="#94a3b8"/>
  <path d="M40 128c8-22 28-34 40-34s32 12 40 34" fill="#94a3b8"/>
</svg>
`);

interface ProfileModel {
  fullName: string;
  firstName: string;
  lastName: string;
  headline: string;
  location: string;
  bio: string;
  phone: string;
  photo: string;
  avatar: string;
  cin: number | null;
  trustLevel: number;
  kycStatus: string;
  twoFactorEnabled: boolean;
  portfolioAttached: boolean;
  certificationsAdded: boolean;
  trustPassportCompleted: boolean;
}

interface FreelancerDraft {
  headline: string;
  bio: string;
  hourlyRate: number | null;
  region: string;
  availabilityStatus: 'AVAILABLE' | 'BUSY' | 'ON_VACATION';
  visibility: 'PUBLIC' | 'PRIVATE' | 'CONNECTIONS_ONLY';
  projectType: 'SHORT_TERM' | 'LONG_TERM' | 'BOTH';
}

@Component({
  selector: 'app-profile-overview',
  templateUrl: './profile-overview.component.html',
  styleUrls: ['./profile-overview.component.css']
})
export class ProfileOverviewComponent implements OnInit {
  loading = true;
  saving = false;
  error = '';
  successMessage = '';
  editMode = false;
  selectedAvatarFile: File | null = null;

  private userId: number | null = null;

  skills: Skill[] = [];
  completeness: CompletenessResponse | null = null;
  freelancerProfile: FreelancerProfile | null = null;

  freelancerDraft: FreelancerDraft = {
    headline: '',
    bio: '',
    hourlyRate: null,
    region: '',
    availabilityStatus: 'AVAILABLE',
    visibility: 'PUBLIC',
    projectType: 'BOTH'
  };

  regions = [
    'Tunis', 'Sfax', 'Sousse', 'Kairouan', 'Bizerte',
    'Gabès', 'Ariana', 'Gafsa', 'Monastir', 'Ben Arous',
    'Kasserine', 'Médenine', 'Nabeul', 'Tataouine', 'Béja',
    'Jendouba', 'Mahdia', 'Sidi Bouzid', 'Siliana', 'Kébili',
    'Le Kef', 'Manouba', 'Zaghouan', 'Tozeur'
  ];

  profile: ProfileModel = {
    fullName: '',
    firstName: '',
    lastName: '',
    headline: '',
    location: 'Tunisie',
    bio: '',
    phone: '',
    photo: '',
    avatar: '',
    cin: null,
    trustLevel: 1,
    kycStatus: 'PENDING',
    twoFactorEnabled: false,
    portfolioAttached: false,
    certificationsAdded: false,
    trustPassportCompleted: false
  };

  draftProfile: ProfileModel = { ...this.profile };

  constructor(
    private userService: UserService,
    private api: ApiService,
    private freelancerService: FreelancerProfileService
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  private resolvePhotoUrl(photo?: string): string {
    if (!photo) return DEFAULT_AVATAR;
    if (
      photo.startsWith('http://') ||
      photo.startsWith('https://') ||
      photo.startsWith('data:')
    ) {
      return photo;
    }
    return `${API_BASE}${photo}`;
  }

  loadProfile(): void {
    this.loading = true;
    this.error = '';
    this.successMessage = '';

    this.userService.getMyProfile()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (data: UserProfileResponse) => {
          const photoUrl = this.resolvePhotoUrl((data as any).photo);
          this.userId = (data as any).id ?? (data as any).userId ?? null;

          this.profile = {
            fullName: `${data.firstName || ''} ${data.lastName || ''}`.trim(),
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            headline: (data as any).headline || '',
            location: (data as any).location || 'Tunisie',
            bio: (data as any).bio || '',
            phone: (data as any).phone || '',
            photo: photoUrl,
            avatar: photoUrl,
            cin: typeof (data as any).cin === 'number'
              ? (data as any).cin
              : Number((data as any).cin) || null,
            trustLevel: (data as any).trustLevel ?? 1,
            kycStatus: (data as any).kycStatus || 'PENDING',
            twoFactorEnabled: !!(data as any).twoFactorEnabled,
            portfolioAttached: false,
            certificationsAdded: (data as any).kycStatus === 'APPROVED',
            trustPassportCompleted: ((data as any).trustLevel ?? 1) >= 3
          };

          this.draftProfile = { ...this.profile };

          if (this.userId) {
            this.loadFreelancerData(this.userId);
          }
        },
        error: (err: HttpErrorResponse) => {
          this.error =
            err?.error?.error ||
            err?.error?.message ||
            'Impossible de charger le profil.';
        }
      });
  }

  private loadFreelancerData(userId: number): void {
    forkJoin({
      profile: this.freelancerService.getProfileByUserId(userId),
      skills: this.freelancerService.getMySkills(userId),
      completeness: this.freelancerService.getCompleteness(userId)
    }).subscribe({
      next: ({ profile, skills, completeness }) => {
        this.freelancerProfile = profile;
        this.skills = skills || [];
        this.completeness = completeness;

        this.freelancerDraft = {
          headline: profile?.headline || '',
          bio: profile?.bio || '',
          hourlyRate: profile?.hourlyRate || null,
          region: profile?.region || '',
          availabilityStatus: profile?.availabilityStatus || 'AVAILABLE',
          visibility: profile?.visibility || 'PUBLIC',
          projectType: profile?.projectType || 'BOTH'
        };

        if (!this.draftProfile.headline && this.freelancerDraft.headline) {
          this.draftProfile.headline = this.freelancerDraft.headline;
        }

        if (!this.profile.headline && this.freelancerDraft.headline) {
          this.profile.headline = this.freelancerDraft.headline;
        }
      },
      error: () => {
        this.skills = [];
        this.completeness = null;
        this.freelancerProfile = null;
      }
    });
  }

  get completion(): number {
    if (this.completeness) return this.completeness.score;

    const checks = [
      !!this.profile.fullName,
      !!this.profile.phone,
      this.profile.kycStatus === 'APPROVED',
      this.profile.twoFactorEnabled,
      this.profile.trustLevel >= 3,
      this.skills.length > 0
    ];

    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }

  get completionItems(): { label: string; done: boolean }[] {
    return [
      { label: 'Informations de base', done: !!this.profile.fullName },
      { label: 'Téléphone', done: !!this.profile.phone },
      { label: 'KYC approuvé', done: this.profile.kycStatus === 'APPROVED' },
      { label: '2FA activé', done: this.profile.twoFactorEnabled },
      { label: 'Trust Level ≥ 3', done: this.profile.trustLevel >= 3 },
      { label: 'Compétences ajoutées', done: this.skills.length > 0 }
    ];
  }

  get completionSuggestions(): string[] {
    return this.completeness?.suggestions ?? [];
  }

  get availabilityLabel(): string {
    switch (this.freelancerDraft.availabilityStatus) {
      case 'AVAILABLE':
        return 'Disponible';
      case 'BUSY':
        return 'Occupé';
      default:
        return 'En vacances';
    }
  }

  toggleEdit(): void {
    this.error = '';
    this.successMessage = '';

    if (!this.editMode) {
      this.draftProfile = { ...this.profile };
      this.selectedAvatarFile = null;

      if (this.freelancerProfile) {
        this.freelancerDraft = {
          headline: this.freelancerProfile.headline || '',
          bio: this.freelancerProfile.bio || '',
          hourlyRate: this.freelancerProfile.hourlyRate || null,
          region: this.freelancerProfile.region || '',
          availabilityStatus: this.freelancerProfile.availabilityStatus || 'AVAILABLE',
          visibility: this.freelancerProfile.visibility || 'PUBLIC',
          projectType: this.freelancerProfile.projectType || 'BOTH'
        };
      }
    }

    this.editMode = !this.editMode;
  }

  cancelEdit(): void {
    this.draftProfile = { ...this.profile };
    this.selectedAvatarFile = null;

    if (this.freelancerProfile) {
      this.freelancerDraft = {
        headline: this.freelancerProfile.headline || '',
        bio: this.freelancerProfile.bio || '',
        hourlyRate: this.freelancerProfile.hourlyRate || null,
        region: this.freelancerProfile.region || '',
        availabilityStatus: this.freelancerProfile.availabilityStatus || 'AVAILABLE',
        visibility: this.freelancerProfile.visibility || 'PUBLIC',
        projectType: this.freelancerProfile.projectType || 'BOTH'
      };
    }

    this.editMode = false;
    this.error = '';
    this.successMessage = '';
  }

  saveProfile(): void {
    if (!this.profile.cin) {
      this.error = 'CIN introuvable.';
      return;
    }

    if (!this.userId) {
      this.error = 'User ID introuvable.';
      return;
    }

    this.saving = true;
    this.error = '';
    this.successMessage = '';

    const normalizedHeadline = this.freelancerDraft.headline?.trim() || this.draftProfile.headline?.trim() || '';

    const formData = new FormData();
    formData.append('firstName', this.draftProfile.firstName || '');
    formData.append('lastName', this.draftProfile.lastName || '');
    formData.append('phone', this.draftProfile.phone || '');
    formData.append('headline', normalizedHeadline);
    formData.append('location', this.draftProfile.location || '');
    formData.append('bio', this.draftProfile.bio || '');
    if (this.selectedAvatarFile) {
      formData.append('photo', this.selectedAvatarFile);
    }

    const saveUser$ = this.api.put(`/users/${this.profile.cin}`, formData);

    const freelancerPayload: Partial<FreelancerProfile> = {
      headline: normalizedHeadline,
      bio: this.freelancerDraft.bio?.trim() || '',
      hourlyRate: this.freelancerDraft.hourlyRate ?? undefined,
      region: this.freelancerDraft.region || '',
      availabilityStatus: this.freelancerDraft.availabilityStatus,
      visibility: this.freelancerDraft.visibility,
      projectType: this.freelancerDraft.projectType
    };

    const saveFreelancer$ = this.freelancerService.updateProfile(this.userId, freelancerPayload);

    forkJoin({ user: saveUser$, freelancer: saveFreelancer$ })
      .pipe(finalize(() => (this.saving = false)))
      .subscribe({
        next: () => {
          this.successMessage = 'Profil mis à jour avec succès.';
          this.editMode = false;
          this.selectedAvatarFile = null;
          this.loadProfile();
        },
        error: (err: HttpErrorResponse) => {
          this.error =
            err?.error?.error ||
            err?.error?.message ||
            'Erreur lors de la sauvegarde.';
        }
      });
  }

  onAvatarSelected(event: Event): void {
    this.error = '';

    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      this.error = 'Avatar : format invalide.';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.error = 'Avatar : fichier trop volumineux (max 5MB).';
      return;
    }

    this.selectedAvatarFile = file;

    const reader = new FileReader();
    reader.onload = () => {
      this.draftProfile.avatar = String(reader.result);
      this.draftProfile.photo = String(reader.result);
    };
    reader.readAsDataURL(file);
  }

  trackBySkill(index: number, skill: Skill): number {
    return skill.id;
  }
}
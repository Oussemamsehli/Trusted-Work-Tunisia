import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { UserService, UserDTO } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  user: UserDTO | null = null;
  editForm: FormGroup;
  passwordForm: FormGroup;

  editing = false;
  loading = true;

  saveSuccess = '';
  saveError = '';

  passwordSuccess = '';
  passwordError = '';
  passwordLoading = false;

  constructor(
    private userService: UserService,
    private auth: AuthService,
    private fb: FormBuilder
  ) {
    this.editForm = this.fb.group({
      firstName: [''],
      lastName: [''],
      phoneNumber: ['']
    });

    this.passwordForm = this.fb.group({
      currentPassword: [''],
      newPassword: ['']
    });
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.loading = true;

    this.userService.getMyProfile().subscribe({
      next: (data) => {
        this.user = data;
        this.editForm.patchValue({
          firstName: data.firstName,
          lastName: data.lastName,
          phoneNumber: data.phoneNumber || ''
        });
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  toggleEdit(): void {
    this.editing = !this.editing;
    this.saveSuccess = '';
    this.saveError = '';
  }

  saveProfile(): void {
    if (!this.user) return;

    this.saveSuccess = '';
    this.saveError = '';

    this.userService.updateProfile(this.user.id, this.editForm.value).subscribe({
      next: (updated) => {
        this.user = updated;
        this.editing = false;
        this.saveSuccess = 'Profil mis à jour avec succès';
        setTimeout(() => this.saveSuccess = '', 3000);
      },
      error: (err: any) => {
        this.saveError =
          err?.error?.message || 'Erreur lors de la mise à jour du profil.';
      }
    });
  }

  changePassword(): void {
    this.passwordSuccess = '';
    this.passwordError = '';

    const currentPassword = this.passwordForm.value.currentPassword;
    const newPassword = this.passwordForm.value.newPassword;

    if (!currentPassword || !newPassword) {
      this.passwordError = 'Veuillez remplir tous les champs du mot de passe.';
      return;
    }

    this.passwordLoading = true;

    this.auth.changePassword(currentPassword, newPassword).subscribe({
      next: (res: any) => {
        this.passwordLoading = false;
        this.passwordSuccess = res?.message || 'Mot de passe modifié avec succès.';
        this.passwordForm.reset();
        setTimeout(() => this.passwordSuccess = '', 3000);
      },
      error: (err: any) => {
        this.passwordLoading = false;
        this.passwordError =
          err?.error?.message || 'Erreur lors du changement du mot de passe.';
      }
    });
  }

  getStatusColor(status: string): string {
    const map: Record<string, string> = {
      'ACTIVE': '#34D399',
      'SUSPENDED': '#F87171',
      'DELETED': '#9496a6',
      'PENDING': '#FBBF24',
      'IN_REVIEW': '#A78BFA',
      'APPROVED': '#34D399',
      'REJECTED': '#F87171'
    };
    return map[status] || '#9496a6';
  }
}
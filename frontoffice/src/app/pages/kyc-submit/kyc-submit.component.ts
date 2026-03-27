import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService, UserDTO } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-kyc-submit',
  templateUrl: './kyc-submit.component.html',
  styleUrls: ['./kyc-submit.component.css']
})
export class KycSubmitComponent implements OnInit {

  form: FormGroup;
  user: UserDTO | null = null;
  loading = true;
  submitting = false;
  success = '';
  error = '';

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private auth: AuthService
  ) {
    this.form = this.fb.group({
      cinNumber: ['', [Validators.required, Validators.minLength(8)]],
      cinDocumentPath: ['', Validators.required],
      diplomaDocumentPath: ['']
    });
  }

  ngOnInit(): void {
    this.loadStatus();
  }

  loadStatus(): void {
    this.loading = true;
    this.userService.getMyProfile().subscribe({
      next: (data) => {
        this.user = data;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  submit(): void {
    if (this.form.invalid || !this.user) return;

    this.submitting = true;
    this.error = '';
    this.success = '';

    this.userService.submitKyc(this.user.id, this.form.value).subscribe({
      next: () => {
        this.submitting = false;
        this.success = 'KYC soumis avec succès ! En attente de validation.';
        this.loadStatus();
      },
      error: (err) => {
        this.submitting = false;
        this.error = err.error?.error || 'Erreur lors de la soumission';
      }
    });
  }

  canSubmit(): boolean {
    return this.user?.kycStatus === 'PENDING' || this.user?.kycStatus === 'REJECTED';
  }
}
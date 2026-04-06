import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Component({
    selector: 'app-forgot-password',
    templateUrl: './forgot-password.component.html',
    styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {

    email = '';
    loading = false;
    successMessage = '';
    errorMessage = '';
    resetToken = '';

    constructor(private authService: AuthService) {}

    submit(): void {
        this.successMessage = '';
        this.errorMessage = '';
        this.resetToken = '';

        if (!this.email || !this.email.trim()) {
            this.errorMessage = 'Veuillez entrer votre email.';
            return;
        }

        this.loading = true;

        this.authService.forgotPassword(this.email.trim()).subscribe({
            next: (res: any) => {
                this.loading = false;
                this.successMessage = res?.message || 'Demande envoyée avec succès.';
                if (res?.token) {
                    this.resetToken = res.token;
                }
            },
            error: (err: any) => {
                this.loading = false;
                this.errorMessage = err?.error?.error || 'Erreur lors de la demande.';
            }
        });
    }
}

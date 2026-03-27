import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
    selector: 'app-reset-password',
    templateUrl: './reset-password.component.html',
    styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {

    token = '';
    newPassword = '';
    confirmPassword = '';
    loading = false;
    successMessage = '';
    errorMessage = '';

    constructor(private authService: AuthService, private route: ActivatedRoute) {}

    ngOnInit(): void {
        this.token = this.route.snapshot.queryParamMap.get('token') || '';
    }

    submit(): void {
        this.successMessage = '';
        this.errorMessage = '';

        if (!this.token) { this.errorMessage = 'Token invalide ou manquant.'; return; }
        if (!this.newPassword || !this.confirmPassword) { this.errorMessage = 'Veuillez remplir tous les champs.'; return; }
        if (this.newPassword.length < 8) { this.errorMessage = 'Le mot de passe doit contenir au moins 8 caractères.'; return; }
        if (this.newPassword !== this.confirmPassword) { this.errorMessage = 'Les mots de passe ne correspondent pas.'; return; }

        this.loading = true;

        this.authService.resetPassword(this.token, this.newPassword).subscribe({
            next: (res: any) => {
                this.loading = false;
                this.successMessage = res?.message || 'Mot de passe réinitialisé avec succès.';
            },
            error: (err: any) => {
                this.loading = false;
                this.errorMessage = err?.error?.error || 'Token invalide ou expiré.';
            }
        });
    }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

export enum UserRole {
    ADMIN = 'ADMIN',
    FREELANCER = 'FREELANCER',
    ENTREPRISE = 'ENTREPRISE',
    JURY = 'JURY'
}

export interface MenuItem {
    id: string;
    label: string;
    icon: string;
    section: 'menu' | 'support';
    route?: string;
}

export interface RoleInfo {
    role: UserRole;
    label: string;
    description: string;
    color: string;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    userId: number;
    email: string;
    role: string;
    message: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
    private apiUrl = 'http://localhost:8081/api';
    private roleSubject = new BehaviorSubject<UserRole>(UserRole.ADMIN);
    currentRole$ = this.roleSubject.asObservable();

    readonly roles: RoleInfo[] = [
        { role: UserRole.ADMIN, label: 'Administrateur', description: 'Accès complet', color: '#22D3EE' },
        { role: UserRole.FREELANCER, label: 'Freelancer', description: 'Espace freelance', color: '#34D399' },
        { role: UserRole.ENTREPRISE, label: 'Entreprise', description: 'Gestion des offres', color: '#FBBF24' },
        { role: UserRole.JURY, label: 'Jury', description: 'Évaluation & litiges', color: '#A78BFA' },
    ];

    constructor(private http: HttpClient, private router: Router) {}

    // ==================== AUTH ====================

    login(email: string, password: string): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, { email, password })
            .pipe(tap(res => {
                localStorage.setItem('admin_token', res.accessToken);
                localStorage.setItem('admin_email', res.email);
                localStorage.setItem('admin_role', res.role);
                this.roleSubject.next(res.role as UserRole);
            }));
    }

    logout(): void {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_email');
        localStorage.removeItem('admin_role');
        this.router.navigate(['/login']);
    }

    // ==================== PASSWORD RESET ====================

    forgotPassword(email: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/auth/forgot-password`, { email });
    }

    resetPassword(token: string, newPassword: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/auth/reset-password`, { token, newPassword });
    }

    isLoggedIn(): boolean {
        return !!localStorage.getItem('admin_token');
    }

    getEmail(): string {
        return localStorage.getItem('admin_email') || 'Admin';
    }

    // ==================== ROLE ====================

    get currentRole(): UserRole {
        return this.roleSubject.value;
    }

    setRole(role: UserRole): void {
        this.roleSubject.next(role);
    }

    getRoleInfo(role?: UserRole): RoleInfo {
        const r = role || this.currentRole;
        return this.roles.find(ri => ri.role === r) || this.roles[0];
    }

    getMenuItems(role?: UserRole): MenuItem[] {
        const r = role || this.currentRole;

        switch (r) {
            case UserRole.ADMIN:
                return [
                    { id: 'dashboard', label: 'Tableau de bord', icon: 'grid', section: 'menu', route: '/' },
                    { id: 'users', label: 'Utilisateurs', icon: 'users', section: 'menu', route: '/users' },
                    { id: 'kyc', label: 'KYC Vérification', icon: 'file-text', section: 'menu', route: '/kyc' },
                    { id: 'contracts', label: 'Contrats', icon: 'file-text', section: 'menu' },
                    { id: 'payments', label: 'Paiements', icon: 'credit-card', section: 'menu' },
                    { id: 'reports', label: 'Rapports', icon: 'bar-chart', section: 'menu' },
                    { id: 'help', label: 'Aide', icon: 'help-circle', section: 'support' },
                    { id: 'settings', label: 'Paramètres', icon: 'settings', section: 'support' },
                ];

            case UserRole.FREELANCER:
                return [
                    { id: 'dashboard', label: 'Tableau de bord', icon: 'grid', section: 'menu', route: '/' },
                    { id: 'missions', label: 'Mes Missions', icon: 'briefcase', section: 'menu' },
                    { id: 'applications', label: 'Mes Candidatures', icon: 'send', section: 'menu' },
                    { id: 'contracts', label: 'Mes Contrats', icon: 'file-text', section: 'menu' },
                    { id: 'payments', label: 'Mes Paiements', icon: 'credit-card', section: 'menu' },
                    { id: 'profile', label: 'Mon Profil', icon: 'user', section: 'support' },
                    { id: 'settings', label: 'Paramètres', icon: 'settings', section: 'support' },
                ];

            case UserRole.ENTREPRISE:
                return [
                    { id: 'dashboard', label: 'Tableau de bord', icon: 'grid', section: 'menu', route: '/' },
                    { id: 'post-offer', label: 'Publier Offre', icon: 'plus-circle', section: 'menu' },
                    { id: 'my-offers', label: 'Mes Offres', icon: 'list', section: 'menu' },
                    { id: 'candidates', label: 'Candidatures', icon: 'users', section: 'menu' },
                    { id: 'contracts', label: 'Contrats', icon: 'file-text', section: 'menu' },
                    { id: 'payments', label: 'Paiements', icon: 'credit-card', section: 'menu' },
                    { id: 'company', label: 'Mon Entreprise', icon: 'building', section: 'support' },
                    { id: 'settings', label: 'Paramètres', icon: 'settings', section: 'support' },
                ];

            case UserRole.JURY:
                return [
                    { id: 'dashboard', label: 'Tableau de bord', icon: 'grid', section: 'menu', route: '/' },
                    { id: 'evaluations', label: 'Évaluations', icon: 'clipboard', section: 'menu' },
                    { id: 'freelancers', label: 'Freelancers', icon: 'users', section: 'menu' },
                    { id: 'disputes', label: 'Litiges', icon: 'alert-triangle', section: 'menu' },
                    { id: 'reports', label: 'Rapports', icon: 'bar-chart', section: 'menu' },
                    { id: 'settings', label: 'Paramètres', icon: 'settings', section: 'support' },
                ];
        }
    }
}
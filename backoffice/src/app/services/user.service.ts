import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// URL de base vers le dossier htdocs/images (XAMPP/WAMP)
export const IMAGES_BASE_URL = 'http://localhost/images';

export interface UserDTO {
    id: number;
    cin: number;                // ← AJOUT
    firstName: string;
    lastName: string;
    email: string;
    phone: string;              // ← AJOUT (backend renvoie "phone", pas "phoneNumber")
    photo: string | null;       // ← AJOUT : nom du fichier uniquement (ex: "avatar.jpg")
    role: string;
    accountStatus: string;
    kycStatus: string;
    twoFactorEnabled: boolean;
    createdAt: string;
}

export interface AdminCreateUserRequest {
    cin: number;                // ← AJOUT
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phoneNumber?: string;
    photo?: string | null;      // ← AJOUT : nom du fichier image
    role: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {

    private apiUrl = 'http://localhost:8081/api';

    constructor(private http: HttpClient) {}

    // ================= HELPERS =================

    /**
     * Retourne l'URL complète vers l'image stockée dans htdocs/images.
     * Si la photo est null/vide, retourne null (le template affichera les initiales).
     */
    getPhotoUrl(photoName: string | null | undefined): string | null {
        if (!photoName || photoName.trim() === '') return null;
        return `${IMAGES_BASE_URL}/${photoName}`;
    }

    // ================= USERS =================

    getAllUsers(): Observable<UserDTO[]> {
        return this.http.get<UserDTO[]>(`${this.apiUrl}/admin/users`);
    }

    createUser(data: AdminCreateUserRequest): Observable<UserDTO> {
        return this.http.post<UserDTO>(`${this.apiUrl}/admin/users`, data);
    }

    suspendUser(id: number): Observable<any> {
        return this.http.put(`${this.apiUrl}/admin/users/${id}/suspend`, {});
    }

    activateUser(id: number): Observable<any> {
        return this.http.put(`${this.apiUrl}/admin/users/${id}/activate`, {});
    }

    deleteUser(cin: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/admin/users/${cin}`);
    }

    // ================= KYC =================

    getPendingKyc(): Observable<UserDTO[]> {
        return this.http.get<UserDTO[]>(`${this.apiUrl}/kyc/review/pending`);
    }

    reviewKyc(cin: number, decision: string, rejectReason?: string): Observable<UserDTO> {
        return this.http.put<UserDTO>(`${this.apiUrl}/kyc/review/${cin}`, {
            decision,
            rejectReason: rejectReason || null
        });
    }

    // ================= AUDIT =================

    getAuditLogs(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/admin/audit-logs`);
    }

    // ================= DASHBOARD STATS =================

    getDashboardStats(): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/admin/stats`);
    }
}
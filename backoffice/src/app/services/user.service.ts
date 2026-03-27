import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UserDTO {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    role: string;
    accountStatus: string;
    kycStatus: string;
    twoFactorEnabled: boolean;
    createdAt: string;
}

export interface AdminCreateUserRequest {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phoneNumber?: string;
    role: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {

    private apiUrl = 'http://localhost:8081/api';

    constructor(private http: HttpClient) {}

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

    deleteUser(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/admin/users/${id}`);
    }

    // ================= KYC =================

    getPendingKyc(): Observable<UserDTO[]> {
        return this.http.get<UserDTO[]>(`${this.apiUrl}/kyc/review/pending`);
    }

    reviewKyc(userId: number, decision: string, rejectReason?: string): Observable<UserDTO> {
        return this.http.put<UserDTO>(`${this.apiUrl}/kyc/review/${userId}`, {
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
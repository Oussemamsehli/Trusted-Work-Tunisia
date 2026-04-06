import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UserDTO {
  id: number;
  cin: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  photo: string;
  role: string;
  accountStatus: string;
  kycStatus: string;
  twoFactorEnabled: boolean;
  createdAt: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalFreelancers: number;
  totalClients: number;
  activeUsers: number;
  suspendedUsers: number;
  kycPending: number;
  kycApproved: number;
  kycRejected: number;
}

@Injectable({ providedIn: 'root' })
export class UserService {

private baseUrl = 'http://localhost:8081/api';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  // ── ADMIN ──
  getAllUsers(): Observable<UserDTO[]> {
    return this.http.get<UserDTO[]>(`${this.baseUrl}/admin/users`,
      { headers: this.getHeaders() });
  }

  getUsersByRole(role: string): Observable<UserDTO[]> {
    return this.http.get<UserDTO[]>(`${this.baseUrl}/admin/users/role/${role}`,
      { headers: this.getHeaders() });
  }

  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.baseUrl}/admin/stats`,
      { headers: this.getHeaders() });
  }

  suspendUser(id: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/admin/users/${id}/suspend`, {},
      { headers: this.getHeaders() });
  }

  activateUser(id: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/admin/users/${id}/activate`, {},
      { headers: this.getHeaders() });
  }

  // ── KYC ──
  getPendingKyc(): Observable<UserDTO[]> {
    return this.http.get<UserDTO[]>(`${this.baseUrl}/kyc/review/pending`,
      { headers: this.getHeaders() });
  }

  reviewKyc(cin: number, decision: string, notes: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/kyc/review/${cin}`,
      { decision, notes },
      { headers: this.getHeaders() });
  }
}
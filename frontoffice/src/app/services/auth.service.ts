import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  userId: number;
  email: string;
  role: string;
  message: string;
  twoFactorRequired: boolean;
}

@Injectable({ providedIn: 'root' })
export class AuthService {

  private apiUrl = 'http://localhost:8081/api';

  constructor(private http: HttpClient, private router: Router) {}

  // ================= LOGIN =================

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, { email, password })
      .pipe(
        tap(res => {
          this.saveAuthData(res);
        })
      );
  }

  // ================= REGISTER =================

  register(data: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, data)
      .pipe(
        tap(res => {
          this.saveAuthData(res);
        })
      );
  }

  // ================= FORGOT PASSWORD =================

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/forgot-password`, {
      email: email
    });
  }

  // ================= RESET PASSWORD =================

  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/reset-password`, {
      token: token,
      newPassword: newPassword
    });
  }

  // ================= CHANGE PASSWORD =================

  changePassword(currentPassword: string, newPassword: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/auth/change-password`, {
      currentPassword: currentPassword,
      newPassword: newPassword
    });
  }

  // ================= STORAGE =================

  private saveAuthData(res: AuthResponse): void {
    localStorage.setItem('token', res.accessToken);
    localStorage.setItem('refreshToken', res.refreshToken);
    localStorage.setItem('userId', res.userId.toString());
    localStorage.setItem('email', res.email);
    localStorage.setItem('role', res.role);
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUserId(): number {
    return Number(localStorage.getItem('userId'));
  }

  getEmail(): string {
    return localStorage.getItem('email') || '';
  }

  getRole(): string {
    return localStorage.getItem('role') || '';
  }
}
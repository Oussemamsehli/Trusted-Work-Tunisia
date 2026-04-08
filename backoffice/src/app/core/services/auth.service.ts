import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private baseUrl = 'http://localhost:8081/api';

  constructor(private http: HttpClient, private router: Router) {}

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/auth/login`, { email, password }).pipe(
      tap(res => {
        if (res.accessToken) {
          localStorage.setItem('token',   res.accessToken);
          localStorage.setItem('role',    res.role    || '');
          localStorage.setItem('email',   res.email   || email);
          localStorage.setItem('userId',  String(res.userId || ''));
        }
      })
    );
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getRole(): string {
    return localStorage.getItem('role') || '';
  }

  getEmail(): string {
    return localStorage.getItem('email') || '';
  }

  // ← Nouveau : userId directement disponible
  getUserId(): number {
    return parseInt(localStorage.getItem('userId') || '0', 10);
  }
}
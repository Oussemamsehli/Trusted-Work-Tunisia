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

@Injectable({ providedIn: 'root' })
export class UserService {

  private apiUrl = 'http://localhost:8081/api';

  constructor(private http: HttpClient) {}

  // ================= PROFILE =================

  getMyProfile(): Observable<UserDTO> {
    return this.http.get<UserDTO>(`${this.apiUrl}/users/me`);
  }

  updateProfile(id: number, data: any): Observable<UserDTO> {
    return this.http.put<UserDTO>(`${this.apiUrl}/users/${id}`, data);
  }

  // ================= KYC =================

  submitKyc(userId: number, data: any): Observable<UserDTO> {
    return this.http.post<UserDTO>(`${this.apiUrl}/kyc/submit/${userId}`, data);
  }

  getKycStatus(userId: number): Observable<UserDTO> {
    return this.http.get<UserDTO>(`${this.apiUrl}/kyc/status/${userId}`);
  }
}
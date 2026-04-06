import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ReviewResponse, ReviewRequest,
  TrustScoreResponse,
  BadgeResponse, BadgeRequest,
  UserBadgeResponse,
  GrowthProfileResponse,
  ReclamationResponse, ReclamationRequest,
  StatusReclamation
} from '../models/review.model';

const REVIEW_API = 'http://localhost:8085/api';

@Injectable({ providedIn: 'root' })
export class ReviewService {

  constructor(private http: HttpClient) {}

  private headers(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  // ── Reviews ────────────────────────────────────────────────────────────────
  createReview(body: ReviewRequest): Observable<ReviewResponse> {
    return this.http.post<ReviewResponse>(`${REVIEW_API}/reviews`, body, { headers: this.headers() });
  }

  getAllReviews(): Observable<ReviewResponse[]> {
    return this.http.get<ReviewResponse[]>(`${REVIEW_API}/reviews`, { headers: this.headers() });
  }

  getReviewById(id: number): Observable<ReviewResponse> {
    return this.http.get<ReviewResponse>(`${REVIEW_API}/reviews/${id}`, { headers: this.headers() });
  }

  updateReview(id: number, body: ReviewRequest): Observable<ReviewResponse> {
    return this.http.put<ReviewResponse>(`${REVIEW_API}/reviews/${id}`, body, { headers: this.headers() });
  }

  deleteReview(id: number): Observable<void> {
    return this.http.delete<void>(`${REVIEW_API}/reviews/${id}`, { headers: this.headers() });
  }

  // ── TrustScore ─────────────────────────────────────────────────────────────
  getAllTrustScores(): Observable<TrustScoreResponse[]> {
    return this.http.get<TrustScoreResponse[]>(`${REVIEW_API}/trustscores`, { headers: this.headers() });
  }

  getTrustScoreByUserId(userId: number): Observable<TrustScoreResponse> {
    return this.http.get<TrustScoreResponse>(`${REVIEW_API}/trustscores/user/${userId}`, { headers: this.headers() });
  }

  deleteTrustScore(id: number): Observable<void> {
    return this.http.delete<void>(`${REVIEW_API}/trustscores/${id}`, { headers: this.headers() });
  }

  // ── Badges ─────────────────────────────────────────────────────────────────
  getAllBadges(): Observable<BadgeResponse[]> {
    return this.http.get<BadgeResponse[]>(`${REVIEW_API}/badges`, { headers: this.headers() });
  }

  createBadge(body: BadgeRequest): Observable<BadgeResponse> {
    return this.http.post<BadgeResponse>(`${REVIEW_API}/badges`, body, { headers: this.headers() });
  }

  updateBadge(id: number, body: BadgeRequest): Observable<BadgeResponse> {
    return this.http.put<BadgeResponse>(`${REVIEW_API}/badges/${id}`, body, { headers: this.headers() });
  }

  deleteBadge(id: number): Observable<void> {
    return this.http.delete<void>(`${REVIEW_API}/badges/${id}`, { headers: this.headers() });
  }

  // ── UserBadges ─────────────────────────────────────────────────────────────
  getAllUserBadges(): Observable<UserBadgeResponse[]> {
    return this.http.get<UserBadgeResponse[]>(`${REVIEW_API}/userbadges`, { headers: this.headers() });
  }

  getUserBadgesByUser(userId: number): Observable<UserBadgeResponse[]> {
    return this.http.get<UserBadgeResponse[]>(`${REVIEW_API}/userbadges/user/${userId}`, { headers: this.headers() });
  }

  deleteUserBadge(id: number): Observable<void> {
    return this.http.delete<void>(`${REVIEW_API}/userbadges/${id}`, { headers: this.headers() });
  }

  // ── GrowthProfile ──────────────────────────────────────────────────────────
  getAllGrowthProfiles(): Observable<GrowthProfileResponse[]> {
    return this.http.get<GrowthProfileResponse[]>(`${REVIEW_API}/growthprofiles`, { headers: this.headers() });
  }

  getGrowthProfileByUserId(userId: number): Observable<GrowthProfileResponse> {
    return this.http.get<GrowthProfileResponse>(`${REVIEW_API}/growthprofiles/user/${userId}`, { headers: this.headers() });
  }

  // ── Reclamations ───────────────────────────────────────────────────────────
  getAllReclamations(): Observable<ReclamationResponse[]> {
    return this.http.get<ReclamationResponse[]>(`${REVIEW_API}/reclamations`, { headers: this.headers() });
  }

  getReclamationsByStatus(status: StatusReclamation): Observable<ReclamationResponse[]> {
    return this.http.get<ReclamationResponse[]>(`${REVIEW_API}/reclamations/status/${status}`, { headers: this.headers() });
  }

  createReclamation(body: ReclamationRequest): Observable<ReclamationResponse> {
    return this.http.post<ReclamationResponse>(`${REVIEW_API}/reclamations`, body, { headers: this.headers() });
  }

  markInReview(id: number, adminId: number, adminComment?: string): Observable<ReclamationResponse> {
    let url = `${REVIEW_API}/reclamations/${id}/in-review?adminId=${adminId}`;
    if (adminComment) url += `&adminComment=${encodeURIComponent(adminComment)}`;
    return this.http.put<ReclamationResponse>(url, {}, { headers: this.headers() });
  }

  confirmReclamation(id: number, adminId: number, adminComment?: string): Observable<ReclamationResponse> {
    let url = `${REVIEW_API}/reclamations/${id}/confirm?adminId=${adminId}`;
    if (adminComment) url += `&adminComment=${encodeURIComponent(adminComment)}`;
    return this.http.put<ReclamationResponse>(url, {}, { headers: this.headers() });
  }

  rejectReclamation(id: number, adminId: number, adminComment?: string): Observable<ReclamationResponse> {
    let url = `${REVIEW_API}/reclamations/${id}/reject?adminId=${adminId}`;
    if (adminComment) url += `&adminComment=${encodeURIComponent(adminComment)}`;
    return this.http.put<ReclamationResponse>(url, {}, { headers: this.headers() });
  }

  deleteReclamation(id: number): Observable<void> {
    return this.http.delete<void>(`${REVIEW_API}/reclamations/${id}`, { headers: this.headers() });
  }
}
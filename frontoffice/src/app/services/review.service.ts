import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// ==================== INTERFACES ====================

export interface ReviewResponse {
  id: number;
  contractId: number;
  reviewerId: number;
  reviewedUserId: number;
  reviewType: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface ReviewRequest {
  contractId: number;
  reviewerId: number;
  reviewedUserId: number;
  reviewType: string;
  rating: number;
  comment?: string;
}

export interface ReclamationResponse {
  id: number;
  reviewId: number;
  reportedByUserId: number;
  motif: string;
  description: string;
  status: string;
  createdAt: string;
  resolvedAt: string;
}

export interface ReclamationRequest {
  reviewId: number;
  reportedByUserId: number;
  motif: string;
  description?: string;
}

export interface BadgeResponse {
  id: number;
  name: string;
  description: string;
  categorie: string;
  rarete: string;
  points: number;
}

export interface TrustScoreResponse {
  id: number;
  userId: number;
  score: number;
  averageRating: number;
  totalReviews: number;
  categorie: string;
  tendance: string;
  updatedAt: string;
}

export interface GrowthProfileResponse {
  id: number;
  userId: number;
  xp: number;
  level: number;
  niveau: string;
  streakDays: number;
  longestStreak: number;
  lastActivityDate: string;
  badgesCount: number;
  profileCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserBadgeResponse {
  id: number;
  userId: number;
  badgeId: number;
  badgeName: string;
  awardedAt: string;
}

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private apiUrl = 'http://localhost:8085/api';

  constructor(private http: HttpClient) {}

  // ==================== REVIEWS ====================

  getAllReviews(): Observable<ReviewResponse[]> {
    return this.http.get<ReviewResponse[]>(`${this.apiUrl}/reviews`);
  }

  getReviewById(id: number): Observable<ReviewResponse> {
    return this.http.get<ReviewResponse>(`${this.apiUrl}/reviews/${id}`);
  }

  createReview(data: ReviewRequest): Observable<ReviewResponse> {
    return this.http.post<ReviewResponse>(`${this.apiUrl}/reviews`, data);
  }

  deleteReview(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/reviews/${id}`);
  }

  // ==================== RECLAMATIONS ====================

  createReclamation(data: ReclamationRequest): Observable<ReclamationResponse> {
    return this.http.post<ReclamationResponse>(`${this.apiUrl}/reclamations`, data);
  }

  // ==================== TRUST SCORES ====================

  getTrustScoreByUserId(userId: number): Observable<TrustScoreResponse> {
    return this.http.get<TrustScoreResponse>(`${this.apiUrl}/trustscores/user/${userId}`);
  }

  // ==================== GROWTH PROFILES ====================

  getGrowthProfileByUserId(userId: number): Observable<GrowthProfileResponse> {
    return this.http.get<GrowthProfileResponse>(`${this.apiUrl}/growthprofiles/user/${userId}`);
  }

  // ==================== USER BADGES ====================

  getUserBadgesByUserId(userId: number): Observable<UserBadgeResponse[]> {
    return this.http.get<UserBadgeResponse[]>(`${this.apiUrl}/userbadges/user/${userId}`);
  }
}
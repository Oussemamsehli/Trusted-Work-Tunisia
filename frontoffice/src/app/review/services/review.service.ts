import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ReviewRequest, ReviewResponse } from '../models/review.model';
import {
  ReclamationRequest,
  ReclamationResponse,
  StatusReclamation
} from '../models/reclamation.model';
import { TrustScoreResponse } from '../models/trust-score.model';
import { GrowthProfileResponse } from '../models/growth-profile.model';
import { UserBadgeResponse } from '../models/badge.model';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private readonly apiUrl = 'http://localhost:8085/api';

  constructor(private http: HttpClient) {}

  createReview(payload: ReviewRequest): Observable<ReviewResponse> {
    return this.http.post<ReviewResponse>(`${this.apiUrl}/reviews`, payload);
  }

  getAllReviews(): Observable<ReviewResponse[]> {
    return this.http.get<ReviewResponse[]>(`${this.apiUrl}/reviews`);
  }

  getReviewById(id: number): Observable<ReviewResponse> {
    return this.http.get<ReviewResponse>(`${this.apiUrl}/reviews/${id}`);
  }

  updateReview(id: number, payload: ReviewRequest): Observable<ReviewResponse> {
    return this.http.put<ReviewResponse>(`${this.apiUrl}/reviews/${id}`, payload);
  }

  deleteReview(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/reviews/${id}`);
  }

  createReclamation(payload: ReclamationRequest): Observable<ReclamationResponse> {
    return this.http.post<ReclamationResponse>(`${this.apiUrl}/reclamations`, payload);
  }

  getAllReclamations(): Observable<ReclamationResponse[]> {
    return this.http.get<ReclamationResponse[]>(`${this.apiUrl}/reclamations`);
  }

  getReclamationsByStatus(status: StatusReclamation): Observable<ReclamationResponse[]> {
    return this.http.get<ReclamationResponse[]>(`${this.apiUrl}/reclamations/status/${status}`);
  }

  getTrustScoreByUserId(userId: number): Observable<TrustScoreResponse> {
    return this.http.get<TrustScoreResponse>(`${this.apiUrl}/trustscores/user/${userId}`);
  }

  getGrowthProfileByUserId(userId: number): Observable<GrowthProfileResponse> {
    return this.http.get<GrowthProfileResponse>(`${this.apiUrl}/growthprofiles/user/${userId}`);
  }

  getUserBadgesByUserId(userId: number): Observable<UserBadgeResponse[]> {
    return this.http.get<UserBadgeResponse[]>(`${this.apiUrl}/userbadges/user/${userId}`);
  }
}
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ReviewDTO {
  id: number;
  contractId: number;
  reviewerId: number;
  reviewedUserId: number;
  reviewType: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface ReclamationDTO {
  id: number;
  reviewId: number;
  reportedByUserId: number;
  motif: string;
  description: string;
  status: string;
  createdAt: string;
  resolvedAt?: string | null;
}

export interface BadgeDTO {
  id: number;
  name: string;
  description: string;
  categorie: string;
  rarete: string;
  points: number;
}

export interface BadgeRequest {
  name: string;
  description: string;
  categorie: string;
  rarete: string;
  points: number;
}

export interface TrustScoreDTO {
  id: number;
  userId: number;
  score: number;
  averageRating: number;
  totalReviews: number;
  categorie: string;
  tendance: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReviewService {

  private reviewApiUrl = 'http://localhost:8085/api/reviews';
  private reclamationApiUrl = 'http://localhost:8085/api/reclamations';
  private badgeApiUrl = 'http://localhost:8085/api/badges';
  private trustScoreApiUrl = 'http://localhost:8085/api/trustscores';

  constructor(private http: HttpClient) {}

  // ==================== REVIEWS ====================

  getAllReviews(): Observable<ReviewDTO[]> {
    return this.http.get<ReviewDTO[]>(this.reviewApiUrl);
  }

  deleteReview(id: number): Observable<void> {
    return this.http.delete<void>(`${this.reviewApiUrl}/${id}`);
  }

  // ==================== RECLAMATIONS ====================

  getAllReclamations(): Observable<ReclamationDTO[]> {
    return this.http.get<ReclamationDTO[]>(this.reclamationApiUrl);
  }

  resolveReclamation(id: number): Observable<ReclamationDTO> {
    return this.http.put<ReclamationDTO>(`${this.reclamationApiUrl}/${id}/resolve`, {});
  }

  deleteReclamation(id: number): Observable<void> {
    return this.http.delete<void>(`${this.reclamationApiUrl}/${id}`);
  }

  // ==================== BADGES ====================

  getAllBadges(): Observable<BadgeDTO[]> {
    return this.http.get<BadgeDTO[]>(this.badgeApiUrl);
  }

  createBadge(payload: BadgeRequest): Observable<BadgeDTO> {
    return this.http.post<BadgeDTO>(this.badgeApiUrl, payload);
  }

  deleteBadge(id: number): Observable<void> {
    return this.http.delete<void>(`${this.badgeApiUrl}/${id}`);
  }

  // ==================== TRUST SCORES ====================

  getAllTrustScores(): Observable<TrustScoreDTO[]> {
    return this.http.get<TrustScoreDTO[]>(this.trustScoreApiUrl);
  }
}
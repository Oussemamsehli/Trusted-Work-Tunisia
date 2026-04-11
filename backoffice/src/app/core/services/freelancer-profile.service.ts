import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  FreelancerProfile,
  Skill,
  PortfolioItem,
  ProfileReview,
  ProfileReport,
  CompletenessResponse,
  CareerPathResponse,
  SkillGapResponse
} from '../models/freelancer.model';



@Injectable({ providedIn: 'root' })
export class FreelancerProfileService {

  // URL de base du backend freelancer-profile-service
  private baseUrl = 'http://localhost:8082/api';

  constructor(private http: HttpClient) {}

  // ────────────────── PROFILS ──────────────────

  /** Récupérer tous les profils publics */
  getAllProfiles(): Observable<FreelancerProfile[]> {
    return this.http.get<FreelancerProfile[]>(`${this.baseUrl}/profiles`);
  }

  /** Récupérer un profil par son profileId */
  getProfileById(profileId: number): Observable<FreelancerProfile> {
    return this.http.get<FreelancerProfile>(`${this.baseUrl}/profiles/${profileId}`);
  }

  /** Récupérer un profil par userId */
  getProfileByUserId(userId: number): Observable<FreelancerProfile> {
    return this.http.get<FreelancerProfile>(`${this.baseUrl}/profiles/user/${userId}`);
  }

  /** Classement régional des profils */
  getRankingByRegion(region: string): Observable<FreelancerProfile[]> {
    return this.http.get<FreelancerProfile[]>(`${this.baseUrl}/profiles/ranking/${region}`);
  }

  /** Score de complétude d'un profil */
  getCompleteness(userId: number): Observable<CompletenessResponse> {
    return this.http.get<CompletenessResponse>(`${this.baseUrl}/profiles/user/${userId}/completeness`);
  }

  // ────────────────── SKILLS ──────────────────

  /** Skills d'un utilisateur */
  getSkillsByUserId(userId: number): Observable<Skill[]> {
    return this.http.get<Skill[]>(`${this.baseUrl}/skills/user/${userId}`);
  }

  /** Analyse des lacunes en compétences */
  getSkillGaps(userId: number): Observable<SkillGapResponse> {
    return this.http.get<SkillGapResponse>(`${this.baseUrl}/skills/user/${userId}/gaps`);
  }

  // ────────────────── PORTFOLIO ──────────────────

  /** Portfolio d'un utilisateur */
  getPortfolio(userId: number): Observable<PortfolioItem[]> {
    return this.http.get<PortfolioItem[]>(`${this.baseUrl}/portfolio/user/${userId}`);
  }

  // ────────────────── REVIEWS ──────────────────

  /** Avis sur un profil */
  getReviewsByProfile(profileId: number): Observable<ProfileReview[]> {
    return this.http.get<ProfileReview[]>(`${this.baseUrl}/reviews/profile/${profileId}`);
  }

  /** Note moyenne d'un profil */
  getAverageRating(profileId: number): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/reviews/profile/${profileId}/average`);
  }

  // ────────────────── REPORTS (ADMIN) ──────────────────

  /** Signalements en attente de traitement */
  getPendingReports(): Observable<ProfileReport[]> {
    return this.http.get<ProfileReport[]>(`${this.baseUrl}/reports/pending`);
  }

  /** Résoudre un signalement (RESOLVED ou REJECTED) */
  resolveReport(reportId: number, status: string): Observable<ProfileReport> {
    const params = new HttpParams().set('status', status);
    return this.http.patch<ProfileReport>(
      `${this.baseUrl}/reports/${reportId}/resolve`,
      null,
      { params }
    );
  }

  // ────────────────── RECOMMENDATIONS ──────────────────

  /** Parcours de carrière recommandé */
  getCareerPath(userId: number): Observable<CareerPathResponse> {
    return this.http.get<CareerPathResponse>(`${this.baseUrl}/recommendations/user/${userId}/career-path`);
  }

  /** Analyse des skill gaps avec recommandations */
  getSkillGapRecommendations(userId: number): Observable<SkillGapResponse> {
    return this.http.get<SkillGapResponse>(`${this.baseUrl}/recommendations/user/${userId}/skill-gap`);
  }
}
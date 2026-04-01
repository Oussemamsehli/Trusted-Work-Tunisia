import { Component, OnInit } from '@angular/core';
import { ReviewService, TrustScoreResponse, GrowthProfileResponse, UserBadgeResponse } from '../../services/review.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-my-progress',
  standalone: false,
  templateUrl: './my-progress.component.html',
  styleUrls: ['./my-progress.component.css']
})
export class MyProgressComponent implements OnInit {
  trustScore: TrustScoreResponse | null = null;
  growthProfile: GrowthProfileResponse | null = null;
  userBadges: UserBadgeResponse[] = [];
  loading = true;

  constructor(
    private reviewService: ReviewService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.loading = true;
    const userId = this.authService.getUserId();
    let completed = 0;
    const checkDone = () => { completed++; if (completed >= 3) this.loading = false; };

    this.reviewService.getTrustScoreByUserId(userId).subscribe({
      next: (data) => { this.trustScore = data; checkDone(); },
      error: () => { this.trustScore = null; checkDone(); }
    });

    this.reviewService.getGrowthProfileByUserId(userId).subscribe({
      next: (data) => { this.growthProfile = data; checkDone(); },
      error: () => { this.growthProfile = null; checkDone(); }
    });

    this.reviewService.getUserBadgesByUserId(userId).subscribe({
      next: (data) => { this.userBadges = data ?? []; checkDone(); },
      error: () => { this.userBadges = []; checkDone(); }
    });
  }

  getScoreDisplay(): string {
    return this.trustScore ? this.trustScore.score.toFixed(0) : '0';
  }

  getAvgDisplay(): string {
    return this.trustScore ? this.trustScore.averageRating.toFixed(1) : '0.0';
  }

  getRoundedAvg(): number {
    return Math.round(this.trustScore?.averageRating ?? 0);
  }

  formatCategorie(cat: string): string {
    const map: Record<string, string> = { 'FAIBLE': 'Faible', 'MOYENNE': 'Moyenne', 'ELEVEE': 'Elevee' };
    return map[cat] || cat;
  }

  formatTendance(tend: string): string {
    const map: Record<string, string> = { 'EN_HAUSSE': 'En hausse', 'STABLE': 'Stable', 'EN_BAISSE': 'En baisse' };
    return map[tend] || tend;
  }

  formatNiveau(niveau: string): string {
    const map: Record<string, string> = { 'DEBUTANT': 'Debutant', 'INTERMEDIAIRE': 'Intermediaire', 'AVANCE': 'Avance', 'EXPERT': 'Expert' };
    return map[niveau] || niveau;
  }

  getCategorieClass(): string {
    if (!this.trustScore) return '';
    return 'conf-' + this.trustScore.categorie;
  }

  getTendanceClass(): string {
    if (!this.trustScore) return '';
    return 'tend-' + this.trustScore.tendance;
  }

  getNiveauClass(): string {
    if (!this.growthProfile) return '';
    return 'niv-' + this.growthProfile.niveau;
  }

  getScoreColor(): string {
    const score = this.trustScore?.score ?? 0;
    if (score >= 70) return '#10b981';
    if (score >= 40) return '#f59e0b';
    return '#ef4444';
  }

  getCircleDash(): string {
    const score = this.trustScore?.score ?? 0;
    const circumference = 2 * Math.PI * 52;
    const filled = (score / 100) * circumference;
    return filled + ' ' + circumference;
  }

  getXpPercent(): number {
    if (!this.growthProfile) return 0;
    const nextXp = this.getNextLevelXp();
    return Math.min((this.growthProfile.xp / nextXp) * 100, 100);
  }

  getNextLevelXp(): number {
    if (!this.growthProfile) return 100;
    return this.growthProfile.level * 100;
  }
}

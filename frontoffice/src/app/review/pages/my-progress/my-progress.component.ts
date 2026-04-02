import { Component, OnInit } from '@angular/core';
import { ReviewService } from '../../services/review.service';
import { TrustScoreResponse } from '../../models/trust-score.model';
import { GrowthProfileResponse } from '../../models/growth-profile.model';
import { UserBadgeResponse } from '../../models/badge.model';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-my-progress',
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

    if (!userId) {
      this.trustScore = null;
      this.growthProfile = null;
      this.userBadges = [];
      this.loading = false;
      return;
    }

    let completed = 0;

    const checkDone = (): void => {
      completed++;
      if (completed >= 3) {
        this.loading = false;
      }
    };

    this.reviewService.getTrustScoreByUserId(Number(userId)).subscribe({
      next: (data) => {
        this.trustScore = data;
        checkDone();
      },
      error: () => {
        this.trustScore = null;
        checkDone();
      }
    });

    this.reviewService.getGrowthProfileByUserId(Number(userId)).subscribe({
      next: (data) => {
        this.growthProfile = data;
        checkDone();
      },
      error: () => {
        this.growthProfile = null;
        checkDone();
      }
    });

    this.reviewService.getUserBadgesByUserId(Number(userId)).subscribe({
      next: (data) => {
        this.userBadges = data ?? [];
        checkDone();
      },
      error: () => {
        this.userBadges = [];
        checkDone();
      }
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
    const map: Record<string, string> = {
      FAIBLE: 'Faible',
      MOYENNE: 'Moyenne',
      ELEVEE: 'Elevee'
    };
    return map[cat] || cat;
  }

  formatTendance(tend: string): string {
    const map: Record<string, string> = {
      EN_HAUSSE: 'En hausse',
      STABLE: 'Stable',
      EN_BAISSE: 'En baisse'
    };
    return map[tend] || tend;
  }

  formatNiveau(niveau: string): string {
    const map: Record<string, string> = {
      DEBUTANT: 'Debutant',
      INTERMEDIAIRE: 'Intermediaire',
      AVANCE: 'Avance',
      EXPERT: 'Expert'
    };
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
    return `${filled} ${circumference}`;
  }

  getXpPercent(): number {
    if (!this.growthProfile) return 0;

    const currentLevelBaseXp = Math.max((this.growthProfile.level - 1) * 100, 0);
    const nextLevelXp = this.getNextLevelXp();
    const xpInCurrentLevel = this.growthProfile.xp - currentLevelBaseXp;
    const xpNeededForLevel = nextLevelXp - currentLevelBaseXp;

    if (xpNeededForLevel <= 0) return 0;

    return Math.min((xpInCurrentLevel / xpNeededForLevel) * 100, 100);
  }

  getNextLevelXp(): number {
    if (!this.growthProfile) return 100;
    return this.growthProfile.level * 100;
  }
}
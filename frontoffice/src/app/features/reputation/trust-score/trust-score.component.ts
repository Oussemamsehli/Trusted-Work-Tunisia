import { Component, OnInit } from '@angular/core';
import { ReviewService } from '../../../core/services/review.service';
import { AuthService } from '../../../core/services/auth.service';
import { TrustScoreResponse } from '../../../core/models/review.model';

@Component({
  selector: 'app-trust-score',
  templateUrl: './trust-score.component.html',
  styleUrls: ['./trust-score.component.css']
})
export class TrustScoreComponent implements OnInit {

  trustScore: TrustScoreResponse | null = null;
  loading = true;
  error = false;

  constructor(
    private reviewService: ReviewService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentAuthUser();
    if (user?.userId) {
      this.loadTrustScore(user.userId);
    } else {
      this.loading = false;
      this.error = true;
    }
  }

  private loadTrustScore(userId: number): void {
    this.reviewService.getTrustScoreByUserId(userId).subscribe({
      next: (data) => {
        this.trustScore = data;
        this.loading = false;
      },
      error: () => {
        this.error = true;
        this.loading = false;
      }
    });
  }

  get scorePercent(): number {
    return this.trustScore ? Math.min(100, Math.round(this.trustScore.score)) : 0;
  }
get categorieLabel(): string {
  if (!this.trustScore) return '';
  const map: Record<string, string> = {
    FAIBLE:  'Faible',
    MOYENNE: 'Moyen',
    ELEVEE:  'Élevé'
  };
  return map[this.trustScore.categorie] ?? this.trustScore.categorie;
}

get tendanceIcon(): string {
  if (!this.trustScore) return 'fa-minus';
  const map: Record<string, string> = {
    EN_HAUSSE: 'fa-arrow-trend-up',
    STABLE:    'fa-minus',
    EN_BAISSE: 'fa-arrow-trend-down'
  };
  return map[this.trustScore.tendance] ?? 'fa-minus';
}

get tendanceLabel(): string {
  if (!this.trustScore) return '';
  const map: Record<string, string> = {
    EN_HAUSSE: 'Tendance positive',
    STABLE:    'Score stable',
    EN_BAISSE: 'Tendance en baisse'
  };
  return map[this.trustScore.tendance] ?? '';
}

  get positiveRate(): number {
    if (!this.trustScore || this.trustScore.totalReviews === 0) return 0;
    return Math.round((this.trustScore.positiveReviews / this.trustScore.totalReviews) * 100);
  }

  formatDate(d: string): string {
    if (!d) return '';
    return new Date(d).toLocaleDateString('fr-TN', { day: '2-digit', month: 'short', year: 'numeric' });
  }
}
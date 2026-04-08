import { Component, OnInit } from '@angular/core';
import { ReviewService } from '../../../core/services/review.service';
import { GrowthProfileResponse, Niveau } from '../../../core/models/review.model';

@Component({
  selector: 'app-growth-profiles',
  templateUrl: './growth-profiles.component.html',
  styleUrl: './growth-profiles.component.css'
})
export class GrowthProfilesComponent implements OnInit {

  profiles: GrowthProfileResponse[] = [];
  loading = true;
  error = false;
  selectedNiveau: Niveau | 'ALL' = 'ALL';

  readonly niveaux: Array<Niveau | 'ALL'> = ['ALL', 'DEBUTANT', 'INTERMEDIAIRE', 'AVANCE', 'EXPERT'];

  constructor(private reviewService: ReviewService) {}

  ngOnInit(): void {
    this.reviewService.getAllGrowthProfiles().subscribe({
      next: (data) => { this.profiles = data; this.loading = false; },
      error: () => { this.error = true; this.loading = false; }
    });
  }

  get filtered(): GrowthProfileResponse[] {
    return this.selectedNiveau === 'ALL'
      ? this.profiles
      : this.profiles.filter(p => p.niveau === this.selectedNiveau);
  }

  get totalXp(): number {
    return this.profiles.reduce((a, p) => a + p.xp, 0);
  }

  get avgLevel(): string {
    if (!this.profiles.length) return '0';
    return (this.profiles.reduce((a, p) => a + p.level, 0) / this.profiles.length).toFixed(1);
  }

  getNiveauClass(n: Niveau): string {
    const m: Record<Niveau, string> = {
      DEBUTANT: 'n-debutant', INTERMEDIAIRE: 'n-inter',
      AVANCE: 'n-avance', EXPERT: 'n-expert'
    };
    return m[n] ?? '';
  }

  getXpBarWidth(xp: number): number {
    const max = Math.max(...this.profiles.map(p => p.xp), 1);
    return Math.round((xp / max) * 100);
  }

  formatDate(d: string): string {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('fr-TN', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  trackById(_: number, p: GrowthProfileResponse): number { return p.id; }
}
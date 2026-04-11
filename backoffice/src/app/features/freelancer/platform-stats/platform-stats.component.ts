import { Component, OnInit } from '@angular/core';
import { FreelancerProfile } from '../../../core/models/freelancer.model';
import { FreelancerProfileService } from '../../../core/services/freelancer-profile.service';

@Component({
  selector: 'app-platform-stats',
  templateUrl: './platform-stats.component.html',
  styleUrls: ['./platform-stats.component.css']
})
export class PlatformStatsComponent implements OnInit {

  profiles: FreelancerProfile[] = [];
  loading = true;
  errorMsg = '';

  // Stats calculées
  totalProfiles = 0;
  avgCompleteness = 0;
  availableCount = 0;
  busyCount = 0;
  unavailableCount = 0;

  // Top skills (nom + nombre d'occurrences)
  topSkills: { name: string; count: number }[] = [];

  // Répartition par région
  regionStats: { region: string; count: number }[] = [];

  // Répartition par niveau d'expérience
  levelStats: { level: string; count: number }[] = [];

  constructor(private profileService: FreelancerProfileService) {}

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.loading = true;
    this.profileService.getAllProfiles().subscribe({
      next: (data) => {
        this.profiles = data;
        this.totalProfiles = data.length;
        this.computeStats(data);
        this.loading = false;
      },
      error: (err) => {
        this.errorMsg = 'Erreur lors du chargement des statistiques';
        this.loading = false;
        console.error(err);
      }
    });
  }

  private computeStats(profiles: FreelancerProfile[]): void {
    if (profiles.length === 0) return;

    // Moyenne de complétude
    const totalScore = profiles.reduce((sum, p) => sum + (p.completenessScore || 0), 0);
    this.avgCompleteness = Math.round(totalScore / profiles.length);

    // Comptage par statut de disponibilité
    this.availableCount = profiles.filter(p => p.availabilityStatus === 'AVAILABLE').length;
    this.busyCount = profiles.filter(p => p.availabilityStatus === 'BUSY').length;
    this.unavailableCount = profiles.filter(p => p.availabilityStatus === 'UNAVAILABLE').length;

    // Top skills — compter les occurrences de chaque skill
    const skillMap = new Map<string, number>();
    profiles.forEach(p => {
      if (p.skills) {
        p.skills.forEach(s => {
          const name = s.skillName;
          skillMap.set(name, (skillMap.get(name) || 0) + 1);
        });
      }
    });
    this.topSkills = Array.from(skillMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Répartition par région
    const regionMap = new Map<string, number>();
    profiles.forEach(p => {
      const region = p.region || 'Non définie';
      regionMap.set(region, (regionMap.get(region) || 0) + 1);
    });
    this.regionStats = Array.from(regionMap.entries())
      .map(([region, count]) => ({ region, count }))
      .sort((a, b) => b.count - a.count);

    // Répartition par niveau d'expérience
    const levelMap = new Map<string, number>();
    profiles.forEach(p => {
      const level = p.experienceLevel || 'Non défini';
      levelMap.set(level, (levelMap.get(level) || 0) + 1);
    });
    this.levelStats = Array.from(levelMap.entries())
      .map(([level, count]) => ({ level, count }))
      .sort((a, b) => b.count - a.count);
  }

  // Pourcentage pour les barres de progression
  getPercent(count: number): number {
    if (this.totalProfiles === 0) return 0;
    return Math.round((count / this.totalProfiles) * 100);
  }

  getScoreClass(score: number): string {
    if (score >= 80) return 'text-success';
    if (score >= 50) return 'text-warning';
    return 'text-danger';
  }
}
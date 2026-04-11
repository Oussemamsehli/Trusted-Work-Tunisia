import { Component, OnInit } from '@angular/core';
import { FreelancerProfile } from '../../../core/models/freelancer.model';
import { FreelancerProfileService } from '../../../core/services/freelancer-profile.service';

@Component({
  selector: 'app-profiles-list',
  templateUrl: './profiles-list.component.html',
  styleUrls: ['./profiles-list.component.css']
})
export class ProfilesListComponent implements OnInit {

  profiles: FreelancerProfile[] = [];
  filteredProfiles: FreelancerProfile[] = [];
  loading = true;
  errorMsg = '';

  // Filtres
  searchTerm = '';
  selectedRegion = '';
  selectedStatus = '';

  // Liste des régions pour le filtre (extraite dynamiquement)
  regions: string[] = [];

  constructor(private profileService: FreelancerProfileService) {}

  ngOnInit(): void {
    this.loadProfiles();
  }

  loadProfiles(): void {
    this.loading = true;
    this.profileService.getAllProfiles().subscribe({
      next: (data) => {
        this.profiles = data;
        this.filteredProfiles = data;
        // Extraire les régions uniques pour le filtre
        this.regions = [...new Set(data.map(p => p.region).filter(r => r))];
        this.loading = false;
      },
      error: (err) => {
        this.errorMsg = 'Erreur lors du chargement des profils';
        this.loading = false;
        console.error(err);
      }
    });
  }

  applyFilters(): void {
    let result = this.profiles;

    // Filtre par recherche (headline, bio)
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(p =>
        (p.headline || '').toLowerCase().includes(term) ||
        (p.bio || '').toLowerCase().includes(term)
      );
    }

    // Filtre par région
    if (this.selectedRegion) {
      result = result.filter(p => p.region === this.selectedRegion);
    }

    // Filtre par statut de disponibilité
    if (this.selectedStatus) {
      result = result.filter(p => p.availabilityStatus === this.selectedStatus);
    }

    this.filteredProfiles = result;
  }

  // Couleur du badge selon le statut de disponibilité
  getStatusBadge(status: string): string {
    switch (status) {
      case 'AVAILABLE':   return 'badge-success';
      case 'BUSY':        return 'badge-warning';
      case 'UNAVAILABLE': return 'badge-danger';
      default:            return 'badge-muted';
    }
  }

  // Couleur du score de complétude
  getScoreClass(score: number): string {
    if (score >= 80) return 'text-success';
    if (score >= 50) return 'text-warning';
    return 'text-danger';
  }
}
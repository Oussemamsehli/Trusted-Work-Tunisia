import { Component, OnInit } from '@angular/core';
import { FreelancerProfileService } from '../../../core/services/freelancer-profile.service';
import { AuthService } from '../../../core/services/auth.service';
import { PortfolioItem } from '../../../core/models/freelancer.model';

/**
 * Composant Portfolio — affichage et gestion des projets réalisés
 */
@Component({
  selector: 'app-portfolio',
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.css']
})
export class PortfolioComponent implements OnInit {
  portfolioItems: PortfolioItem[] = [];
  isLoading = false;
  errorMessage = '';
  showForm = false;

  newItem = {
    title: '',
    description: '',
    projectUrl: '',
    imageUrl: '',
    technologies: '',
    completionDate: ''
  };

  constructor(
    private profileService: FreelancerProfileService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadPortfolio();
  }

  get currentUserId(): number {
    return this.authService.getCurrentAuthUser()!.userId;
  }

  get projectsCountLabel(): string {
    return `${this.portfolioItems.length} projet(s)`;
  }

  get hasItems(): boolean {
    return this.portfolioItems.length > 0;
  }

  get titleLength(): number {
    return this.newItem.title.trim().length;
  }

  loadPortfolio(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.profileService.getMyPortfolio(this.currentUserId).subscribe({
      next: (items) => {
        this.portfolioItems = items;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Erreur lors du chargement du portfolio.';
        this.isLoading = false;
      }
    });
  }

  addItem(): void {
    if (!this.newItem.title.trim()) {
      this.errorMessage = 'Le titre du projet est obligatoire.';
      return;
    }

    this.errorMessage = '';

    this.profileService.addPortfolioItem(this.currentUserId, this.newItem).subscribe({
      next: (item) => {
        this.portfolioItems = [item, ...this.portfolioItems];
        this.resetForm();
        this.showForm = false;
      },
      error: () => {
        this.errorMessage = 'Erreur lors de l’ajout du projet.';
      }
    });
  }

  deleteItem(itemId: number): void {
    if (!confirm('Supprimer ce projet ?')) return;

    this.profileService.deletePortfolioItem(itemId, this.currentUserId).subscribe({
      next: () => {
        this.portfolioItems = this.portfolioItems.filter(i => i.id !== itemId);
      },
      error: () => {
        this.errorMessage = 'Erreur lors de la suppression.';
      }
    });
  }

  resetForm(): void {
    this.newItem = {
      title: '',
      description: '',
      projectUrl: '',
      imageUrl: '',
      technologies: '',
      completionDate: ''
    };
  }

  getTechArray(technologies: string): string[] {
    if (!technologies) return [];
    return technologies.split(',').map(t => t.trim()).filter(t => t.length > 0);
  }

  trackByProjectId(index: number, item: PortfolioItem): number {
    return item.id;
  }
}
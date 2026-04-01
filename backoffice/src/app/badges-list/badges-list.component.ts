import { Component, OnInit } from '@angular/core';
import { BadgeDTO, BadgeRequest, ReviewService } from '../services/review.service';

@Component({
  selector: 'app-badges-list',
  templateUrl: './badges-list.component.html',
  styleUrls: ['./badges-list.component.css']
})
export class BadgesListComponent implements OnInit {

  badges: BadgeDTO[] = [];

  newBadge: BadgeRequest = {
    name: '',
    description: '',
    categorie: 'TRUST',
    rarete: 'COMMON',
    points: 100
  };

  loading = false;
  errorMessage = '';

  constructor(private reviewService: ReviewService) {}

  ngOnInit(): void {
    this.loadBadges();
  }

  loadBadges(): void {
    this.loading = true;

    this.reviewService.getAllBadges().subscribe({
      next: (data) => {
        this.badges = data;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Erreur chargement badges';
        this.loading = false;
      }
    });
  }

  createBadge(): void {
    this.reviewService.createBadge(this.newBadge).subscribe({
      next: () => {
        this.newBadge = {
          name: '',
          description: '',
          categorie: 'TRUST',
          rarete: 'COMMON',
          points: 100
        };
        this.loadBadges();
      },
      error: (err) => {
        console.error(err);
        alert('Erreur création badge');
      }
    });
  }

  deleteBadge(id: number): void {
    if (!confirm('Supprimer ce badge ?')) return;

    this.reviewService.deleteBadge(id).subscribe({
      next: () => {
        this.badges = this.badges.filter(b => b.id !== id);
      },
      error: (err) => {
        console.error(err);
        alert('Erreur suppression');
      }
    });
  }
}
import { Component, OnInit } from '@angular/core';
import { ReviewDTO, ReviewService } from '../services/review.service';

@Component({
  selector: 'app-reviews-list',
  templateUrl: './reviews-list.component.html',
  styleUrls: ['./reviews-list.component.css']
})
export class ReviewsListComponent implements OnInit {

  reviews: ReviewDTO[] = [];
  loading = false;
  errorMessage = '';

  constructor(private reviewService: ReviewService) {}

  ngOnInit(): void {
    this.loadReviews();
  }

  loadReviews(): void {
    this.loading = true;
    this.errorMessage = '';

    this.reviewService.getAllReviews().subscribe({
      next: (data) => {
        this.reviews = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des reviews', error);
        this.errorMessage = 'Impossible de charger les reviews.';
        this.loading = false;
      }
    });
  }

  deleteReview(id: number): void {
    const confirmed = window.confirm('Voulez-vous vraiment supprimer cette review ?');
    if (!confirmed) {
      return;
    }

    this.reviewService.deleteReview(id).subscribe({
      next: () => {
        this.reviews = this.reviews.filter(review => review.id !== id);
      },
      error: (error) => {
        console.error('Erreur lors de la suppression de la review', error);
        alert('La suppression a échoué.');
      }
    });
  }
}
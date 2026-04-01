import { Component, OnInit } from '@angular/core';
import { ReviewService, TrustScoreDTO } from '../services/review.service';

@Component({
  selector: 'app-trust-scores',
  templateUrl: './trust-scores.component.html',
  styleUrls: ['./trust-scores.component.css']
})
export class TrustScoresComponent implements OnInit {

  scores: TrustScoreDTO[] = [];
  loading = false;
  errorMessage = '';

  constructor(private reviewService: ReviewService) {}

  ngOnInit(): void {
    this.loadScores();
  }

  loadScores(): void {
    this.loading = true;

    this.reviewService.getAllTrustScores().subscribe({
      next: (data) => {
        this.scores = data;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Erreur chargement TrustScores';
        this.loading = false;
      }
    });
  }
}
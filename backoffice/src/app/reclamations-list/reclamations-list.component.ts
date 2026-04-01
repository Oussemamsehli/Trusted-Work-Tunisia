import { Component, OnInit } from '@angular/core';
import { ReclamationDTO, ReviewService } from '../services/review.service';

@Component({
  selector: 'app-reclamations-list',
  templateUrl: './reclamations-list.component.html',
  styleUrls: ['./reclamations-list.component.css']
})
export class ReclamationsListComponent implements OnInit {

  reclamations: ReclamationDTO[] = [];
  loading = false;
  errorMessage = '';

  constructor(private reviewService: ReviewService) {}

  ngOnInit(): void {
    this.loadReclamations();
  }

  loadReclamations(): void {
    this.loading = true;
    this.errorMessage = '';

    this.reviewService.getAllReclamations().subscribe({
      next: (data) => {
        this.reclamations = data;
        this.loading = false;
      },
      error: (error) => {
        console.error(error);
        this.errorMessage = 'Erreur lors du chargement des réclamations';
        this.loading = false;
      }
    });
  }

  resolve(id: number): void {
    this.reviewService.resolveReclamation(id).subscribe({
      next: () => {
        this.loadReclamations(); // refresh
      },
      error: (error) => {
        console.error(error);
        alert('Erreur lors de la résolution');
      }
    });
  }

  delete(id: number): void {
    if (!confirm('Supprimer cette réclamation ?')) return;

    this.reviewService.deleteReclamation(id).subscribe({
      next: () => {
        this.reclamations = this.reclamations.filter(r => r.id !== id);
      },
      error: (error) => {
        console.error(error);
        alert('Erreur suppression');
      }
    });
  }
}
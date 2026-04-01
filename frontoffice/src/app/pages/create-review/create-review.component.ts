import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReviewService } from '../../services/review.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-create-review',
  templateUrl: './create-review.component.html',
  styleUrls: ['./create-review.component.css']
})
export class CreateReviewComponent implements OnInit {
  reviewForm!: FormGroup;
  selectedRating = 0;
  hoveredRating = 0;
  loading = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private reviewService: ReviewService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.reviewForm = this.fb.group({
      contractId: [null, [Validators.required, Validators.min(1)]],
      reviewedUserId: [null, [Validators.required, Validators.min(1)]],
      reviewType: ['CLIENT_TO_FREELANCER', Validators.required],
      rating: [null, [Validators.required, Validators.min(1), Validators.max(5)]],
      comment: ['', Validators.maxLength(1000)]
    });
  }

  setRating(value: number): void {
    this.selectedRating = value;
    this.reviewForm.patchValue({ rating: value });
  }

  getRatingLabel(rating: number): string {
    const labels: Record<number, string> = {
      1: 'Tres mauvais',
      2: 'Mauvais',
      3: 'Moyen',
      4: 'Bon',
      5: 'Excellent'
    };
    return labels[rating] || '';
  }

  submitReview(): void {
    this.successMessage = '';
    this.errorMessage = '';

    if (this.reviewForm.invalid) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires et donner une note.';
      return;
    }

    this.loading = true;
    const formVal = this.reviewForm.value;

    const payload = {
      contractId: formVal.contractId,
      reviewerId: this.authService.getUserId(),
      reviewedUserId: formVal.reviewedUserId,
      reviewType: formVal.reviewType,
      rating: formVal.rating,
      comment: formVal.comment || ''
    };

    this.reviewService.createReview(payload).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = 'Votre avis a ete envoye avec succes !';
        this.resetForm();
      },
      error: (err: any) => {
        this.loading = false;
        this.errorMessage = err?.error?.message || 'Erreur lors de l envoi de l avis.';
      }
    });
  }

  resetForm(): void {
    this.reviewForm.reset({ reviewType: 'CLIENT_TO_FREELANCER' });
    this.selectedRating = 0;
    this.hoveredRating = 0;
  }
}
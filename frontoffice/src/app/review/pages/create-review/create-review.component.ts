import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReviewService } from '../../services/review.service';
import { AuthService } from '../../../services/auth.service';
import { ReviewRequest } from '../../models/review.model';

@Component({
  selector: 'app-create-review',
  templateUrl: './create-review.component.html',
  styleUrls: ['./create-review.component.css']
})
export class CreateReviewComponent implements OnInit {
  reviewForm!: FormGroup;
  loading = false;
  successMessage = '';
  errorMessage = '';

  ratingOptions = [1, 2, 3, 4, 5];

  constructor(
    private fb: FormBuilder,
    private reviewService: ReviewService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.reviewForm = this.fb.group({
      contractId: [null, [Validators.required, Validators.min(1)]],
      recruitmentId: [null, [Validators.required, Validators.min(1)]],
      reviewedUserId: [null, [Validators.required, Validators.min(1)]],
      phaseId: [null],
      reviewType: ['CLIENT_TO_FREELANCER', Validators.required],

      overallRating: [null, [Validators.required, Validators.min(1), Validators.max(5)]],
      qualityRating: [null, [Validators.required, Validators.min(1), Validators.max(5)]],
      communicationRating: [null, [Validators.required, Validators.min(1), Validators.max(5)]],
      deadlineRating: [null, [Validators.required, Validators.min(1), Validators.max(5)]],
      professionalismRating: [null, [Validators.required, Validators.min(1), Validators.max(5)]],

      comment: ['', [Validators.maxLength(1000)]]
    });
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
      this.reviewForm.markAllAsTouched();
      this.errorMessage = 'Veuillez remplir correctement tous les champs obligatoires.';
      return;
    }

    const reviewerId = this.authService.getUserId();

    if (!reviewerId) {
      this.errorMessage = 'Utilisateur non connecte.';
      return;
    }

    this.loading = true;

    const formValue = this.reviewForm.value;

    const payload: ReviewRequest = {
      reviewerId: Number(reviewerId),
      reviewedUserId: Number(formValue.reviewedUserId),
      contractId: Number(formValue.contractId),
      recruitmentId: Number(formValue.recruitmentId),
      phaseId: formValue.phaseId ? Number(formValue.phaseId) : null,
      reviewType: formValue.reviewType,
      comment: formValue.comment || '',

      overallRating: Number(formValue.overallRating),
      qualityRating: Number(formValue.qualityRating),
      communicationRating: Number(formValue.communicationRating),
      deadlineRating: Number(formValue.deadlineRating),
      professionalismRating: Number(formValue.professionalismRating)
    };

    this.reviewService.createReview(payload).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = 'Votre avis a ete envoye avec succes.';
        this.resetForm();
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage =
          err?.error?.message ||
          err?.error?.error ||
          'Erreur lors de l envoi de l avis.';
      }
    });
  }

  resetForm(): void {
    this.reviewForm.reset({
      contractId: null,
      recruitmentId: null,
      reviewedUserId: null,
      phaseId: null,
      reviewType: 'CLIENT_TO_FREELANCER',
      overallRating: null,
      qualityRating: null,
      communicationRating: null,
      deadlineRating: null,
      professionalismRating: null,
      comment: ''
    });

    this.successMessage = '';
    this.errorMessage = '';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.reviewForm.get(fieldName);
    return !!(field && field.invalid && (field.touched || field.dirty));
  }
}
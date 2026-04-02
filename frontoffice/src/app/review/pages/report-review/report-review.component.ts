import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ReviewService } from '../../services/review.service';
import { ReclamationRequest, MotifReclamation } from '../../models/reclamation.model';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-report-review',
  templateUrl: './report-review.component.html',
  styleUrls: ['./report-review.component.css']
})
export class ReportReviewComponent implements OnInit {
  reportForm!: FormGroup;
  loading = false;
  successMessage = '';
  errorMessage = '';
  initialReviewId: number | null = null;

  motifs: MotifReclamation[] = [
    'SPAM',
    'FAKE_REVIEW',
    'ABUSIVE_LANGUAGE',
    'IRRELEVANT',
    'OTHER'
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private reviewService: ReviewService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.reportForm = this.fb.group({
      reviewId: [null, [Validators.required, Validators.min(1)]],
      motif: ['', Validators.required],
      description: ['', [Validators.maxLength(1000)]]
    });

    this.route.queryParams.subscribe(params => {
      if (params['reviewId']) {
        this.initialReviewId = Number(params['reviewId']);
        this.reportForm.patchValue({ reviewId: this.initialReviewId });
      }
    });
  }

  submitReport(): void {
    this.successMessage = '';
    this.errorMessage = '';

    if (this.reportForm.invalid) {
      this.reportForm.markAllAsTouched();
      this.errorMessage = 'Veuillez remplir correctement les champs obligatoires.';
      return;
    }

    const reportedByUserId = this.authService.getUserId();

    if (!reportedByUserId) {
      this.errorMessage = 'Utilisateur non connecte.';
      return;
    }

    this.loading = true;

    const formValue = this.reportForm.value;

    const payload: ReclamationRequest = {
      reviewId: Number(formValue.reviewId),
      reportedByUserId: Number(reportedByUserId),
      motif: formValue.motif,
      description: formValue.description || ''
    };

    this.reviewService.createReclamation(payload).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = 'Votre signalement a ete envoye. Notre equipe va l examiner.';
        this.resetForm();
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage =
          err?.error?.message ||
          err?.error?.error ||
          'Erreur lors de l envoi du signalement.';
      }
    });
  }

  resetForm(): void {
    this.reportForm.reset({
      reviewId: this.initialReviewId,
      motif: '',
      description: ''
    });

    this.successMessage = '';
    this.errorMessage = '';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.reportForm.get(fieldName);
    return !!(field && field.invalid && (field.touched || field.dirty));
  }

  getMotifLabel(motif: MotifReclamation): string {
    const labels: Record<MotifReclamation, string> = {
      SPAM: 'Spam',
      FAKE_REVIEW: 'Faux avis',
      ABUSIVE_LANGUAGE: 'Langage abusif',
      IRRELEVANT: 'Hors sujet',
      OTHER: 'Autre'
    };

    return labels[motif];
  }
}
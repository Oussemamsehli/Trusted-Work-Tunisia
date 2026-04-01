import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ReviewService } from '../../services/review.service';
import { AuthService } from '../../services/auth.service';

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
      description: ['']
    });

    this.route.queryParams.subscribe(params => {
      if (params['reviewId']) {
        this.reportForm.patchValue({ reviewId: +params['reviewId'] });
      }
    });
  }

  submitReport(): void {
    this.successMessage = '';
    this.errorMessage = '';

    if (this.reportForm.invalid) {
      this.errorMessage = 'Veuillez remplir l ID de l avis et le motif.';
      return;
    }

    this.loading = true;
    const formVal = this.reportForm.value;

    const payload = {
      reviewId: formVal.reviewId,
      reportedByUserId: this.authService.getUserId(),
      motif: formVal.motif,
      description: formVal.description || ''
    };

    this.reviewService.createReclamation(payload).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = 'Votre signalement a ete envoye. Notre equipe va l examiner.';
        this.resetForm();
      },
      error: (err: any) => {
        this.loading = false;
        this.errorMessage = err?.error?.message || 'Erreur lors de l envoi du signalement.';
      }
    });
  }

  resetForm(): void {
    this.reportForm.reset();
  }
}

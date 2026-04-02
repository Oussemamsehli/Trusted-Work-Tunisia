export type MotifReclamation =
  | 'SPAM'
  | 'FAKE_REVIEW'
  | 'ABUSIVE_LANGUAGE'
  | 'IRRELEVANT'
  | 'OTHER';

export type StatusReclamation =
  | 'PENDING'
  | 'IN_REVIEW'
  | 'CONFIRMED'
  | 'REJECTED';

export interface ReclamationRequest {
  reviewId: number;
  reportedByUserId: number;
  motif: MotifReclamation;
  description?: string;
}

export interface ReclamationResponse {
  id: number;
  reviewId: number;
  reportedByUserId: number;
  motif: MotifReclamation;
  description?: string;
  status: StatusReclamation;

  adminComment?: string;
  processedByAdminId?: number;
  processedAt?: string;

  createdAt: string;
  resolvedAt?: string;
}
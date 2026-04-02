export type ReviewType = 'FREELANCER_TO_CLIENT' | 'CLIENT_TO_FREELANCER';

export interface ReviewRequest {
  reviewerId: number;
  reviewedUserId: number;
  contractId: number;
  recruitmentId: number;
  phaseId?: number | null;
  reviewType: ReviewType;
  comment?: string;

  overallRating: number;
  qualityRating: number;
  communicationRating: number;
  deadlineRating: number;
  professionalismRating: number;
}

export interface ReviewResponse {
  id: number;
  reviewerId: number;
  reviewedUserId: number;
  contractId: number;
  recruitmentId: number;
  phaseId?: number | null;
  reviewType: ReviewType;
  comment?: string;

  overallRating: number;
  qualityRating: number;
  communicationRating: number;
  deadlineRating: number;
  professionalismRating: number;

  isVisible: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}
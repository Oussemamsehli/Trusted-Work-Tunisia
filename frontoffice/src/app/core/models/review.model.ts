export type ReviewType = 'CLIENT_TO_FREELANCER' | 'FREELANCER_TO_CLIENT';
export type CategorieConfiance = 'FAIBLE' | 'MOYENNE' | 'ELEVEE';
export type Tendance = 'EN_HAUSSE' | 'STABLE' | 'EN_BAISSE';
export type StatusReclamation = 'PENDING' | 'IN_REVIEW' | 'CONFIRMED' | 'REJECTED';
export type MotifReclamation = 'SPAM' | 'FAKE_REVIEW' | 'ABUSIVE_LANGUAGE' | 'IRRELEVANT' | 'OTHER';
export type CategorieBadge = 'TRUST' | 'ACTIVITY' | 'PERFORMANCE';
export type Rarete = 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
export type Niveau = 'DEBUTANT' | 'INTERMEDIAIRE' | 'AVANCE' | 'EXPERT';

export interface ReviewResponse {
  id: number;
  reviewerId: number;
  reviewedUserId: number;
  contractId: number;
  recruitmentId: number;
  phaseId?: number;
  reviewType: ReviewType;
  comment: string;
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

export interface ReviewRequest {
  reviewerId: number;
  reviewedUserId: number;
  contractId: number;
  recruitmentId: number;
  phaseId?: number;
  reviewType: ReviewType;
  comment: string;
  overallRating: number;
  qualityRating: number;
  communicationRating: number;
  deadlineRating: number;
  professionalismRating: number;
  isVisible: boolean;
}

export interface TrustScoreResponse {
  id: number;
  userId: number;
  score: number;
  averageRating: number;
  totalReviews: number;
  positiveReviews: number;
  negativeReviews: number;
  categorie: CategorieConfiance;
  tendance: Tendance;
  createdAt: string;
  updatedAt: string;
}

export interface BadgeResponse {
  id: number;
  name: string;
  description: string;
  categorie: CategorieBadge;
  rarete: Rarete;
  points: number;
}

export interface BadgeRequest {
  name: string;
  description: string;
  categorie: CategorieBadge;
  rarete: Rarete;
  points: number;
}

export interface UserBadgeResponse {
  id: number;
  userId: number;
  badge: BadgeResponse;
  reason: string;
  awardedAt: string;
}

export interface UserBadgeRequest {
  userId: number;
  badgeId: number;
  reason: string;
}

export interface GrowthProfileResponse {
  id: number;
  userId: number;
  xp: number;
  level: number;
  niveau: Niveau;
  streakDays: number;
  longestStreak: number;
  lastActivityDate?: string;
  badgesCount: number;
  profileCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReclamationResponse {
  id: number;
  review: ReviewResponse;
  reportedByUserId: number;
  motif: MotifReclamation;
  description: string;
  status: StatusReclamation;
  adminComment?: string;
  processedByAdminId?: number;
  processedAt?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface ReclamationRequest {
  reviewId: number;
  reportedByUserId: number;
  motif: MotifReclamation;
  description: string;
}
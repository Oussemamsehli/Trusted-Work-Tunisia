export type ReviewType = 'CLIENT_TO_FREELANCER' | 'FREELANCER_TO_CLIENT';
export type CategorieConfiance = 'FAIBLE' | 'MOYEN' | 'ELEVÉ' | 'EXCELLENT';
export type Tendance = 'HAUSSE' | 'STABLE' | 'BAISSE';
export type StatusReclamation = 'PENDING' | 'IN_REVIEW' | 'CONFIRMED' | 'REJECTED';
export type MotifReclamation =
  | 'FAUX_AVIS'
  | 'CONTENU_INAPPROPRIE'
  | 'CONFLIT_INTERET'
  | 'SPAM'
  | 'AUTRE';
export type CategorieBadge =
  | 'PERFORMANCE'
  | 'COMMUNICATION'
  | 'LIVRAISON'
  | 'EXPERTISE'
  | 'CONFIANCE';
export type Rarete = 'COMMUN' | 'RARE' | 'EPIQUE' | 'LEGENDAIRE';
export type Niveau = 'JUNIOR' | 'CONFIRME' | 'EXPERT' | 'MASTER';

// ── Review ──────────────────────────────────────────────────────────────────
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

// ── TrustScore ───────────────────────────────────────────────────────────────
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

// ── Badge ────────────────────────────────────────────────────────────────────
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

// ── UserBadge ────────────────────────────────────────────────────────────────
export interface UserBadgeResponse {
  id: number;
  userId: number;
  badge: BadgeResponse;
  earnedAt: string;
}

// ── GrowthProfile ────────────────────────────────────────────────────────────
export interface GrowthProfileResponse {
  id: number;
  userId: number;
  totalXp: number;
  currentLevel: number;
  niveau: Niveau;
  streakDays: number;
  weeklyXpGain: number;
  updatedAt: string;
}

// ── Reclamation ──────────────────────────────────────────────────────────────
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
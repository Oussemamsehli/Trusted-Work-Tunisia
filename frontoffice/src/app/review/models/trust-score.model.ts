export type CategorieConfiance = 'FAIBLE' | 'MOYENNE' | 'ELEVEE';
export type Tendance = 'EN_HAUSSE' | 'STABLE' | 'EN_BAISSE';

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
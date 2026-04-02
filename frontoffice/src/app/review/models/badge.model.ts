export type CategorieBadge =
  | 'TRUST'
  | 'ACTIVITY'
  | 'SPECIAL'
  | 'ENGAGEMENT'
  | 'PERFORMANCE';

export type Rarete = 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';

export interface UserBadgeResponse {
  id: number;
  userId: number;
  badgeId: number;
  reason?: string;
  awardedAt: string;
  badgeName: string;
}
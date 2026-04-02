export type Niveau = 'DEBUTANT' | 'INTERMEDIAIRE' | 'AVANCE' | 'EXPERT';

export interface GrowthProfileResponse {
  id: number;
  userId: number;
  xp: number;
  level: number;
  niveau: Niveau;
  streakDays: number;
  longestStreak: number;
  lastActivityDate: string;
  badgesCount: number;
  profileCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}
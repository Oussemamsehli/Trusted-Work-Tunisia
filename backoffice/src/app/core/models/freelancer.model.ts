

// --- Profil principal du freelancer ---
export interface FreelancerProfile {
  profileId: number;
  userId: number;
  headline: string;
  bio: string;
  region: string;
  availabilityStatus: string;       // AVAILABLE, BUSY, UNAVAILABLE
  hourlyRate: number;
  experienceLevel: string;          // JUNIOR, MID, SENIOR, EXPERT
  profilePictureUrl: string;
  completenessScore: number;        // 0–100
  trustLevel: string;
  createdAt: string;
  updatedAt: string;
  skills: Skill[];
  portfolio: PortfolioItem[];
  certifications: Certification[];
  endorsements: Endorsement[];
  workExperiences: WorkExperience[];
  educations: Education[];
}

// --- Compétence ---
export interface Skill {
  skillId: number;
  userId: number;
  skillName: string;
  category: string;
  proficiencyLevel: string;         // BEGINNER, INTERMEDIATE, ADVANCED, EXPERT
  yearsOfExperience: number;
  verified: boolean;
}

// --- Élément du portfolio ---
export interface PortfolioItem {
  portfolioId: number;
  userId: number;
  title: string;
  description: string;
  projectUrl: string;
  imageUrl: string;
  tags: string;
  createdAt: string;
}

// --- Certification ---
export interface Certification {
  certificationId: number;
  name: string;
  issuingOrganization: string;
  issueDate: string;
  expiryDate: string;
  credentialUrl: string;
}

// --- Endorsement (recommandation) ---
export interface Endorsement {
  endorsementId: number;
  endorserId: number;
  endorsedUserId: number;
  skillName: string;
  comment: string;
  createdAt: string;
}

// --- Avis sur un profil ---
export interface ProfileReview {
  reviewId: number;
  profileId: number;
  reviewerUserId: number;
  rating: number;                   // 1–5
  comment: string;
  createdAt: string;
}

// --- Signalement de profil (admin) ---
export interface ProfileReport {
  reportId: number;
  profileId: number;
  reporterUserId: number;
  reason: string;
  description: string;
  status: string;                   // PENDING, RESOLVED, REJECTED
  createdAt: string;
  resolvedAt: string;
}

// --- Expérience professionnelle ---
export interface WorkExperience {
  experienceId: number;
  title: string;
  company: string;
  startDate: string;
  endDate: string;
  description: string;
  current: boolean;
}

// --- Formation ---
export interface Education {
  educationId: number;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
}

// --- Réponse score de complétude ---
export interface CompletenessResponse {
  completenessScore: number;
  suggestions: string[];
}

// --- Réponse parcours de carrière ---
export interface CareerPathResponse {
  currentLevel: string;
  nextLevel: string;
  recommendations: string[];
  estimatedTimeMonths: number;
}

// --- Réponse analyse des lacunes en compétences ---
export interface SkillGapResponse {
  missingSkills: string[];
  recommendedCourses: string[];
  marketDemand: { [skill: string]: number };
}
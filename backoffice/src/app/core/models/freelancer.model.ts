// --- ProfileResponse ---
export interface FreelancerProfile {
  id: number;
  userId: number;
  headline: string;
  bio: string;
  avatarUrl: string;
  hourlyRate: number;
  availabilityStatus: 'AVAILABLE' | 'BUSY' | 'ON_VACATION';
  visibility: 'PUBLIC' | 'PRIVATE' | 'CONNECTIONS_ONLY';
  projectType: 'SHORT_TERM' | 'LONG_TERM' | 'BOTH';
  completenessScore: number;
  region: string;
  regionalRank: number;
  totalViews: number;
  createdAt: string;
  updatedAt: string;
}

// --- SkillResponse ---
export interface Skill {
  id: number;
  name: string;
  normalizedName?: string;
  category?: string;
  level: string;
  authenticityScore: number;
  examScore: number;
  endorsementCount: number;
}

// --- PortfolioResponse ---
export interface PortfolioItem {
  id: number;
  title: string;
  description: string;
  projectUrl: string;
  imageUrl: string;
  technologies: string;
  completionDate: string;
  pinned: boolean;
  projectScore: number;
}

// --- CertificationResponse ---
export interface Certification {
  id: number;
  title: string;
  issuer: string;
  type: string;
  issueDate: string;
  expiryDate: string;
  certificateUrl: string;
  isExpired: boolean;
}

// --- EndorsementResponse ---
export interface Endorsement {
  id: number;
  endorserId: number;
  comment: string;
  endorsedAt: string;
}

// --- ReviewResponse ---
export interface ProfileReview {
  id: number;
  clientId: number;
  rating: number;
  comment: string;
  freelancerReply?: string | null;
  flagged?: boolean;
  flagReason?: string | null;
  status: 'VISIBLE' | 'HIDDEN' | 'FLAGGED'; // CORRIGÉ : union type strict
  reviewedAt: string;
  updatedAt?: string | null;
}

// NOUVEAU : Summary avec distribution des notes
export interface ProfileReviewSummary {
  profileId: number;
  averageRating: number;
  totalReviews: number;
  fiveStarCount: number;
  fourStarCount: number;
  threeStarCount: number;
  twoStarCount: number;
  oneStarCount: number;
}

// --- ProfileReport ---
export interface ProfileReport {
  id: number;
  reporterId: number;
  reason: string;
  status: 'PENDING' | 'RESOLVED' | 'REJECTED';
  reportedAt: string;
  resolvedAt: string | null;
  profile?: {
    id: number;
    userId: number;
    headline: string;
    region: string;
  };
}

export interface WorkExperience {
  id: number;
  jobTitle: string;
  company: string;
  location?: string;
  description?: string;
  startDate: string;
  endDate?: string | null;
  isCurrent: boolean;
  periodLabel?: string;
  durationLabel?: string;
  durationInMonths?: number;
  createdAt?: string;
  updatedAt?: string;
}

// --- EducationResponse ---
export interface Education {
  id: number;
  degree: string;
  institution: string;
  fieldOfStudy: string;
  graduationYear: number;
}

// --- CompletenessResponse ---
export interface CompletenessResponse {
  score: number;
  bioScore: number;
  avatarScore: number;
  skillsScore: number;
  portfolioScore: number;
  certifScore: number;
  workExpScore: number;
  suggestions: string[];
}

// --- CareerPathResponse ---
export interface CareerPathResponse {
  detectedPath: string;
  description: string;
  nextSteps: string[];
  currentSkills: string[];
  missingSkills: string[];
}

// --- SkillGapResponse ---
export interface SkillGapResponse {
  mySkills: string[];
  topSkills: string[];
  gapSkills: string[];
  gapCount: number;
}

// --- SkillGapRecommendation ---
export interface SkillGapRecommendation {
  missingSkills: string[];
  recommendedCourses: string[];
  marketDemand: { [skill: string]: number };
}
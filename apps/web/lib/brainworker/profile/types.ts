// apps/web/lib/brainworker/profile/types.ts
// BrainWorker Profile & Portfolio Management Types (BW-005, Item 2.7)
// Authoritative Domain Specifications & Types

export const RECOGNIZED_NIGERIAN_LANGUAGES = [
  'English',
  'Nigerian Pidgin',
  'Yoruba',
  'Hausa',
  'Igbo',
  'Edo',
  'Tiv',
  'Ibibio',
] as const;

export type NigerianLanguage = (typeof RECOGNIZED_NIGERIAN_LANGUAGES)[number];

export const MAX_PORTFOLIO_ITEMS = 20;

export interface BrainWorkerProfileInput {
  headline: string;
  bio: string;
  yearsOfExperience: number;
  spokenLanguages: NigerianLanguage[];
  avatarUrl?: string | null | undefined;
}

export interface BrainWorkerProfile extends BrainWorkerProfileInput {
  brainWorkerId: string;
  avatarUrl: string | null;
  updatedAt: string;
}

export interface PortfolioItemInput {
  title: string;
  description: string;
  category: string;
  beforeImageUrl?: string | null | undefined;
  afterImageUrl: string;
  completedDate: string;
}

export interface PortfolioItem extends PortfolioItemInput {
  id: string;
  brainWorkerId: string;
  beforeImageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export type CustomerReviewStatus = 'PUBLISHED' | 'PENDING' | 'REJECTED' | 'HIDDEN';

export interface ReviewCounterResponse {
  reviewId: string;
  brainWorkerId: string;
  responseText: string;
  respondedAt: string;
}

export interface CustomerReview {
  id: string;
  bookingId: string;
  customerId: string;
  brainWorkerId: string;
  customerName?: string | undefined;
  rating: number;
  criteriaScores?: Record<string, number> | undefined;
  reviewBody: string;
  status: CustomerReviewStatus;
  artisanResponse?: ReviewCounterResponse | null | undefined;
  createdAt: string;
}

export interface IBrainWorkerProfileRepository {
  getProfile(workerId: string): Promise<BrainWorkerProfile | null>;
  saveProfile(
    workerId: string,
    updates: Partial<BrainWorkerProfile>
  ): Promise<BrainWorkerProfile>;
  getPortfolio(workerId: string): Promise<PortfolioItem[]>;
  addPortfolioItem(
    workerId: string,
    item: Omit<PortfolioItem, 'id' | 'createdAt'>
  ): Promise<PortfolioItem>;
  deletePortfolioItem(workerId: string, itemId: string): Promise<boolean>;
  getReviews(workerId: string): Promise<CustomerReview[]>;
  submitReviewCounterResponse(
    workerId: string,
    reviewId: string,
    responseText: string
  ): Promise<CustomerReview>;
}

export type ProfileCompletenessMilestoneKey =
  | 'headline'
  | 'bio'
  | 'experience'
  | 'languages'
  | 'headshot'
  | 'portfolio_min_1';

export interface ProfileCompletenessResult {
  percentage: number;
  isComplete: boolean;
  missingMilestones: ProfileCompletenessMilestoneKey[];
}

export interface ValidationSuccess<T> {
  success: true;
  data: T;
}

export interface ValidationFailure {
  success: false;
  errors: string[];
}

export type DomainValidationResult<T> = ValidationSuccess<T> | ValidationFailure;

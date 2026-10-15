// apps/web/lib/brainworker/profile/domain.ts
// BrainWorker Profile & Portfolio Domain Functions (BW-005, Item 2.7)
// Phase 1 GREEN: Pure domain logic, validation rules, completeness engine, and financial decoupling

import {
  MAX_PORTFOLIO_ITEMS,
  RECOGNIZED_NIGERIAN_LANGUAGES,
  type BrainWorkerProfile,
  type BrainWorkerProfileInput,
  type CustomerReview,
  type NigerianLanguage,
  type PortfolioItem,
  type PortfolioItemInput,
  type ProfileCompletenessMilestoneKey,
  type ProfileCompletenessResult,
  type ReviewCounterResponse,
} from './types';

/**
 * Strips HTML and script tags from text inputs to prevent XSS.
 */
function stripHtmlTags(input: string): string {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .trim();
}

/**
 * Validates and sanitizes artisan profile schema.
 */
export function validateProfileSchema(input: unknown): BrainWorkerProfileInput {
  if (!input || typeof input !== 'object') {
    throw new Error('Profile input must be an object');
  }

  const raw = input as Record<string, unknown>;

  if (typeof raw.headline !== 'string') {
    throw new Error('Headline is required and must be text');
  }
  const cleanHeadline = stripHtmlTags(raw.headline);
  if (cleanHeadline.length === 0) {
    throw new Error('Headline is required');
  }
  if (cleanHeadline.length > 100) {
    throw new Error('Headline cannot exceed 100 characters');
  }

  if (typeof raw.bio !== 'string') {
    throw new Error('Bio is required and must be text');
  }
  const cleanBio = stripHtmlTags(raw.bio);
  if (cleanBio.length === 0) {
    throw new Error('Bio is required');
  }
  if (cleanBio.length > 1000) {
    throw new Error('Bio cannot exceed 1000 characters');
  }

  if (typeof raw.yearsOfExperience !== 'number' || !Number.isInteger(raw.yearsOfExperience)) {
    throw new Error('Years of experience must be an integer');
  }
  if (raw.yearsOfExperience < 0 || raw.yearsOfExperience > 50) {
    throw new Error('Years of experience must be between 0 and 50');
  }

  const spokenLanguages = validateSpokenLanguages(raw.spokenLanguages);
  const avatarUrl = validateAvatarUrl(raw.avatarUrl);

  return {
    headline: cleanHeadline,
    bio: cleanBio,
    yearsOfExperience: raw.yearsOfExperience,
    spokenLanguages,
    avatarUrl,
  };
}

/**
 * Validates spoken Nigerian languages array.
 */
export function validateSpokenLanguages(languages: unknown): NigerianLanguage[] {
  if (!Array.isArray(languages)) {
    throw new Error('Spoken languages must be an array');
  }
  if (languages.length === 0) {
    throw new Error('Profile must include at least one language');
  }

  const seen = new Set<string>();
  const recognizedSet = new Set<string>(RECOGNIZED_NIGERIAN_LANGUAGES);

  for (const lang of languages) {
    if (typeof lang !== 'string') {
      throw new Error('Each language must be a string');
    }
    if (!recognizedSet.has(lang)) {
      throw new Error(`Unrecognized language specified: ${lang}`);
    }
    if (seen.has(lang)) {
      throw new Error(`Duplicate language specified: ${lang}`);
    }
    seen.add(lang);
  }

  return languages as NigerianLanguage[];
}

/**
 * Validates avatar headshot URL or storage path.
 */
export function validateAvatarUrl(url: unknown): string | null {
  if (url === null || url === undefined || url === '') {
    return null;
  }
  if (typeof url !== 'string') {
    throw new Error('Avatar URL must be a string');
  }

  const trimmed = url.trim();

  if (trimmed.startsWith('http://')) {
    throw new Error('Insecure HTTP image URLs are not allowed');
  }
  if (trimmed.startsWith('javascript:')) {
    throw new Error('Invalid URL protocol');
  }

  if (trimmed.startsWith('data:')) {
    // 500 KB ceiling for inline data URIs
    if (trimmed.length > 500 * 1024) {
      throw new Error('Avatar image size exceeds the maximum allowed payload size');
    }
    return trimmed;
  }

  if (trimmed.startsWith('https://') || trimmed.startsWith('/')) {
    return trimmed;
  }

  throw new Error('Avatar must be an HTTPS URL or relative upload path');
}

/**
 * Validates an individual portfolio item input and enforces the 20-item cap.
 */
export function validatePortfolioItem(
  item: unknown,
  existingItemsCount = 0
): PortfolioItemInput {
  if (existingItemsCount >= MAX_PORTFOLIO_ITEMS) {
    throw new Error(`Artisan portfolio has reached the maximum of ${MAX_PORTFOLIO_ITEMS} portfolio items`);
  }

  if (!item || typeof item !== 'object') {
    throw new Error('Portfolio item must be an object');
  }

  const raw = item as Record<string, unknown>;

  if (typeof raw.title !== 'string') {
    throw new Error('Portfolio title is required');
  }
  const cleanTitle = stripHtmlTags(raw.title);
  if (cleanTitle.length < 3) {
    throw new Error('Portfolio title must be at least 3 characters');
  }
  if (cleanTitle.length > 80) {
    throw new Error('Portfolio title cannot exceed 80 characters');
  }

  if (typeof raw.description !== 'string') {
    throw new Error('Portfolio description is required');
  }
  const cleanDesc = stripHtmlTags(raw.description);
  if (cleanDesc.length > 500) {
    throw new Error('Portfolio description cannot exceed 500 characters');
  }

  if (typeof raw.category !== 'string' || raw.category.trim().length === 0) {
    throw new Error('Trade category is required');
  }

  if (typeof raw.afterImageUrl !== 'string' || raw.afterImageUrl.trim().length === 0) {
    throw new Error('Portfolio after image is required');
  }
  const validAfterUrl = validateAvatarUrl(raw.afterImageUrl);
  if (!validAfterUrl) {
    throw new Error('Portfolio after image is required');
  }

  const validBeforeUrl = raw.beforeImageUrl
    ? validateAvatarUrl(raw.beforeImageUrl)
    : null;

  validateBeforeAfterPairing(validBeforeUrl, validAfterUrl);

  if (typeof raw.completedDate !== 'string' || isNaN(Date.parse(raw.completedDate))) {
    throw new Error('Valid completion date is required');
  }

  return {
    title: cleanTitle,
    description: cleanDesc,
    category: raw.category.trim(),
    beforeImageUrl: validBeforeUrl,
    afterImageUrl: validAfterUrl,
    completedDate: raw.completedDate,
  };
}

/**
 * Validates that before and after image URLs are distinct.
 */
export function validateBeforeAfterPairing(
  beforeUrl: string | null | undefined,
  afterUrl: string
): boolean {
  if (!beforeUrl) {
    return true;
  }
  if (beforeUrl.trim() === afterUrl.trim()) {
    throw new Error('Portfolio before and after images must be distinct URLs');
  }
  return true;
}

/**
 * Validates whether a customer review can receive an artisan counter-response.
 */
export function assertReviewCounterResponseEligibility(review: CustomerReview): void {
  if (review.status !== 'PUBLISHED') {
    throw new Error('Only published reviews can receive an artisan counter-response');
  }
  if (review.artisanResponse) {
    throw new Error('This review already has an artisan response');
  }
}

/**
 * Creates an artisan counter-response adhering to length and timestamp rules.
 */
export function createCounterResponse(
  review: CustomerReview,
  brainWorkerId: string,
  responseText: string,
  now?: Date
): { review: CustomerReview; counterResponse: ReviewCounterResponse } {
  assertReviewCounterResponseEligibility(review);

  if (typeof responseText !== 'string') {
    throw new Error('Counter-response text must be a string');
  }

  const cleanText = stripHtmlTags(responseText);
  if (cleanText.length < 10) {
    throw new Error('Counter-response text must be at least 10 characters');
  }
  if (cleanText.length > 500) {
    throw new Error('Counter-response text cannot exceed a maximum of 500 characters');
  }

  const counterResponse: ReviewCounterResponse = {
    reviewId: review.id,
    brainWorkerId,
    responseText: cleanText,
    respondedAt: (now ?? new Date()).toISOString(),
  };

  const updatedReview: CustomerReview = {
    ...review,
    artisanResponse: counterResponse,
  };

  return { review: updatedReview, counterResponse };
}

/**
 * Calculates profile completeness score and detects missing milestones.
 */
export function calculateProfileCompleteness(
  profile: BrainWorkerProfile | null,
  portfolioItems: PortfolioItem[]
): ProfileCompletenessResult {
  const missingMilestones: ProfileCompletenessMilestoneKey[] = [];
  let score = 0;

  if (!profile) {
    return {
      percentage: 0,
      isComplete: false,
      missingMilestones: [
        'headline',
        'bio',
        'experience',
        'languages',
        'headshot',
        'portfolio_min_1',
      ],
    };
  }

  if (profile.headline && profile.headline.trim().length >= 3) {
    score += 15;
  } else {
    missingMilestones.push('headline');
  }

  if (profile.bio && profile.bio.trim().length >= 10) {
    score += 15;
  } else {
    missingMilestones.push('bio');
  }

  if (typeof profile.yearsOfExperience === 'number' && profile.yearsOfExperience >= 0) {
    score += 15;
  } else {
    missingMilestones.push('experience');
  }

  if (Array.isArray(profile.spokenLanguages) && profile.spokenLanguages.length > 0) {
    score += 15;
  } else {
    missingMilestones.push('languages');
  }

  if (profile.avatarUrl && profile.avatarUrl.trim().length > 0) {
    score += 20;
  } else {
    missingMilestones.push('headshot');
  }

  if (Array.isArray(portfolioItems) && portfolioItems.length >= 1) {
    score += 20;
  } else {
    missingMilestones.push('portfolio_min_1');
  }

  return {
    percentage: Math.min(100, score),
    isComplete: score >= 80,
    missingMilestones,
  };
}

const FINANCIAL_KEYS_REGEX =
  /wallet|balance|bank|payout|escrow|earnings|accountnumber|ngn|kobo/i;

/**
 * Recursively removes financial attributes from profile domain objects.
 */
export function sanitizeFinancialExclusion<T extends Record<string, unknown>>(
  data: T
): T {
  if (!data || typeof data !== 'object') {
    return data;
  }

  const cleaned: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data)) {
    if (FINANCIAL_KEYS_REGEX.test(key)) {
      continue;
    }
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      cleaned[key] = sanitizeFinancialExclusion(value as Record<string, unknown>);
    } else {
      cleaned[key] = value;
    }
  }

  return cleaned as T;
}

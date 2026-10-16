// apps/web/lib/brainworker/profile/repository.ts
// BrainWorker Profile & Portfolio Repository (BW-005, Item 2.7)
// Phase 2 GREEN: In-memory repository with physical partitioning, sanitization, and sorting

import {
  createCounterResponse,
  sanitizeFinancialExclusion,
  validateAvatarUrl,
  validatePortfolioItem,
  validateSpokenLanguages,
} from './domain';
import {
  MAX_PORTFOLIO_ITEMS,
  type BrainWorkerProfile,
  type CustomerReview,
  type IBrainWorkerProfileRepository,
  type PortfolioItem,
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

export class BrainWorkerProfileRepository
  implements IBrainWorkerProfileRepository
{
  private readonly profiles = new Map<string, BrainWorkerProfile>();
  private readonly portfolio = new Map<string, PortfolioItem[]>();
  private readonly reviews = new Map<string, CustomerReview[]>();

  /**
   * Retrieves profile for given worker ID, returning safe seeded default if not yet customized.
   */
  async getProfile(workerId: string): Promise<BrainWorkerProfile | null> {
    const existing = this.profiles.get(workerId);
    if (existing) {
      return sanitizeFinancialExclusion({ ...existing });
    }

    const defaultProfile: BrainWorkerProfile = {
      brainWorkerId: workerId,
      headline: '',
      bio: '',
      yearsOfExperience: 0,
      spokenLanguages: ['English'],
      avatarUrl: null,
      updatedAt: new Date().toISOString(),
    };

    return sanitizeFinancialExclusion({ ...defaultProfile });
  }

  /**
   * Persists sanitized profile updates for given worker ID.
   */
  async saveProfile(
    workerId: string,
    updates: Partial<BrainWorkerProfile>
  ): Promise<BrainWorkerProfile> {
    const existing = await this.getProfile(workerId);

    let headline = existing?.headline ?? '';
    if (updates.headline !== undefined) {
      if (typeof updates.headline !== 'string') {
        throw new Error('Headline must be text');
      }
      const cleanHeadline = stripHtmlTags(updates.headline);
      if (cleanHeadline.length === 0) {
        throw new Error('Headline is required');
      }
      if (cleanHeadline.length > 100) {
        throw new Error('Headline cannot exceed 100 characters');
      }
      headline = cleanHeadline;
    }

    let bio = existing?.bio ?? '';
    if (updates.bio !== undefined) {
      if (typeof updates.bio !== 'string') {
        throw new Error('Bio must be text');
      }
      const cleanBio = stripHtmlTags(updates.bio);
      if (cleanBio.length === 0) {
        throw new Error('Bio is required');
      }
      if (cleanBio.length > 1000) {
        throw new Error('Bio cannot exceed 1000 characters');
      }
      bio = cleanBio;
    }

    let yearsOfExperience = existing?.yearsOfExperience ?? 0;
    if (updates.yearsOfExperience !== undefined) {
      if (
        typeof updates.yearsOfExperience !== 'number' ||
        !Number.isInteger(updates.yearsOfExperience) ||
        updates.yearsOfExperience < 0 ||
        updates.yearsOfExperience > 50
      ) {
        throw new Error('Years of experience must be an integer between 0 and 50');
      }
      yearsOfExperience = updates.yearsOfExperience;
    }

    let spokenLanguages = existing?.spokenLanguages ?? ['English'];
    if (updates.spokenLanguages !== undefined) {
      const normalized = Array.isArray(updates.spokenLanguages)
        ? updates.spokenLanguages.map((lang: string) =>
            typeof lang === 'string' && lang.toLowerCase() === 'pidgin'
              ? 'Nigerian Pidgin'
              : lang
          )
        : updates.spokenLanguages;
      spokenLanguages = validateSpokenLanguages(normalized);
    }

    let avatarUrl = existing?.avatarUrl ?? null;
    if (updates.avatarUrl !== undefined) {
      avatarUrl = validateAvatarUrl(updates.avatarUrl);
    }

    const merged: BrainWorkerProfile = {
      brainWorkerId: workerId,
      headline,
      bio,
      yearsOfExperience,
      spokenLanguages,
      avatarUrl,
      updatedAt: new Date().toISOString(),
    };

    const sanitized = sanitizeFinancialExclusion(merged);
    this.profiles.set(workerId, sanitized);

    return sanitizeFinancialExclusion({ ...sanitized });
  }

  /**
   * Retrieves portfolio items strictly scoped to worker ID, sorted by completedDate descending.
   */
  async getPortfolio(workerId: string): Promise<PortfolioItem[]> {
    const items = this.portfolio.get(workerId) ?? [];
    const sorted = [...items].sort(
      (a, b) =>
        new Date(b.completedDate).getTime() - new Date(a.completedDate).getTime()
    );
    return sorted.map((item) => sanitizeFinancialExclusion({ ...item }));
  }

  /**
   * Adds a portfolio item after schema and cap validation.
   */
  async addPortfolioItem(
    workerId: string,
    item: Omit<PortfolioItem, 'id' | 'createdAt'>
  ): Promise<PortfolioItem> {
    const currentList = this.portfolio.get(workerId) ?? [];
    if (currentList.length >= MAX_PORTFOLIO_ITEMS) {
      throw new Error(
        `Artisan portfolio has reached the maximum of ${MAX_PORTFOLIO_ITEMS} portfolio items`
      );
    }

    const validatedInput = validatePortfolioItem(item, currentList.length);
    const now = new Date().toISOString();
    const id =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `port-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    const newItem: PortfolioItem = {
      id,
      brainWorkerId: workerId,
      title: validatedInput.title,
      description: validatedInput.description,
      category: validatedInput.category,
      beforeImageUrl: validatedInput.beforeImageUrl ?? null,
      afterImageUrl: validatedInput.afterImageUrl,
      completedDate: validatedInput.completedDate,
      createdAt: now,
      updatedAt: now,
    };

    const sanitized = sanitizeFinancialExclusion(newItem);
    this.portfolio.set(workerId, [...currentList, sanitized]);

    return sanitizeFinancialExclusion({ ...sanitized });
  }

  /**
   * Deletes a portfolio item belonging to the worker, rejecting cross-tenant attempts.
   */
  async deletePortfolioItem(
    workerId: string,
    itemId: string
  ): Promise<boolean> {
    for (const [ownerId, items] of this.portfolio.entries()) {
      if (ownerId !== workerId) {
        const crossItem = items.find((i) => i.id === itemId);
        if (crossItem) {
          throw new Error('Forbidden: portfolio item belongs to another artisan');
        }
      }
    }

    const currentList = this.portfolio.get(workerId) ?? [];
    const itemIndex = currentList.findIndex((i) => i.id === itemId);
    if (itemIndex === -1) {
      throw new Error('Portfolio item not found');
    }

    currentList.splice(itemIndex, 1);
    this.portfolio.set(workerId, currentList);
    return true;
  }

  /**
   * Retrieves customer reviews assigned to the worker, seeding defaults if needed.
   */
  async getReviews(workerId: string): Promise<CustomerReview[]> {
    let reviews = this.reviews.get(workerId);
    if (!reviews || reviews.length === 0) {
      reviews = [
        {
          id: `rev-${workerId}-default`,
          bookingId: `bk-${workerId}-001`,
          customerId: 'cust-demo-1',
          customerName: 'Chidi Okafor',
          brainWorkerId: workerId,
          rating: 5,
          criteriaScores: { punctuality: 5, craftsmanship: 5, communication: 5 },
          reviewBody:
            'Punctual, professional, and very thorough with diagnostic checks.',
          status: 'PUBLISHED',
          createdAt: '2026-10-01T10:00:00.000Z',
        },
      ];
      this.reviews.set(workerId, reviews);
    }

    return reviews.map((r) => sanitizeFinancialExclusion({ ...r }));
  }

  /**
   * Submits an artisan counter-response without mutating original customer review content.
   */
  async submitReviewCounterResponse(
    workerId: string,
    reviewId: string,
    responseText: string
  ): Promise<CustomerReview> {
    const reviews = await this.getReviews(workerId);
    const targetIndex = reviews.findIndex((r) => r.id === reviewId);
    if (targetIndex === -1) {
      throw new Error('Review not found or not assigned to artisan');
    }

    const targetReview = reviews[targetIndex]!;
    const { review: updatedReview } = createCounterResponse(
      targetReview,
      workerId,
      responseText
    );

    reviews[targetIndex] = updatedReview;
    this.reviews.set(workerId, reviews);

    return sanitizeFinancialExclusion({ ...updatedReview });
  }

  /**
   * Resets all in-memory state for test isolation.
   */
  reset(): void {
    this.profiles.clear();
    this.portfolio.clear();
    this.reviews.clear();
  }
}

let defaultRepository: IBrainWorkerProfileRepository | null = null;

export function createBrainWorkerProfileRepository(): BrainWorkerProfileRepository {
  return new BrainWorkerProfileRepository();
}

export function getBrainWorkerProfileRepository(): IBrainWorkerProfileRepository {
  if (!defaultRepository) {
    defaultRepository = createBrainWorkerProfileRepository();
  }
  return defaultRepository;
}

export function resetBrainWorkerProfileRepository(): void {
  if (defaultRepository instanceof BrainWorkerProfileRepository) {
    defaultRepository.reset();
  }
  defaultRepository = null;
}

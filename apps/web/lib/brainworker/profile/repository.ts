// apps/web/lib/brainworker/profile/repository.ts
// BrainWorker Profile & Portfolio Repository (BW-005, Item 2.7)
// Phase 2 RED: Repository stub throwing intentional contract errors

import type {
  BrainWorkerProfile,
  CustomerReview,
  IBrainWorkerProfileRepository,
  PortfolioItem,
} from './types';

export class BrainWorkerProfileRepository
  implements IBrainWorkerProfileRepository
{
  async getProfile(_workerId: string): Promise<BrainWorkerProfile | null> {
    throw new Error('RED: not implemented');
  }

  async saveProfile(
    _workerId: string,
    _updates: Partial<BrainWorkerProfile>
  ): Promise<BrainWorkerProfile> {
    throw new Error('RED: not implemented');
  }

  async getPortfolio(_workerId: string): Promise<PortfolioItem[]> {
    throw new Error('RED: not implemented');
  }

  async addPortfolioItem(
    _workerId: string,
    _item: Omit<PortfolioItem, 'id' | 'createdAt'>
  ): Promise<PortfolioItem> {
    throw new Error('RED: not implemented');
  }

  async deletePortfolioItem(
    _workerId: string,
    _itemId: string
  ): Promise<boolean> {
    throw new Error('RED: not implemented');
  }

  async getReviews(_workerId: string): Promise<CustomerReview[]> {
    throw new Error('RED: not implemented');
  }

  async submitReviewCounterResponse(
    _workerId: string,
    _reviewId: string,
    _responseText: string
  ): Promise<CustomerReview> {
    throw new Error('RED: not implemented');
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
  defaultRepository = null;
}

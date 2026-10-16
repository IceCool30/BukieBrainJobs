// apps/web/components/brainworker/profile/types.ts
// BrainWorker Profile & Portfolio UI Component Types (BW-005, Item 2.7)

import type {
  BrainWorkerProfile,
  CustomerReview,
  PortfolioItem,
} from '../../../lib/brainworker/profile/types';

export interface ProfileEditorFormProps {
  profile: BrainWorkerProfile | null;
  portfolioItems?: PortfolioItem[];
  isSaving?: boolean;
  onSaveProfile: (
    updates: Partial<BrainWorkerProfile>
  ) => Promise<void> | void;
}

export interface PortfolioGalleryManagerProps {
  portfolioItems: PortfolioItem[];
  onAddPortfolioItem?: (
    item: Omit<PortfolioItem, 'id' | 'createdAt'>
  ) => Promise<void> | void;
  onDeletePortfolioItem?: (itemId: string) => Promise<void> | void;
}

export interface ReviewsCounterResponseTabProps {
  reviews: CustomerReview[];
  onSubmitCounterResponse?: (
    reviewId: string,
    responseText: string
  ) => Promise<void> | void;
}

export interface ProfileManagementWorkspaceProps {
  profile: BrainWorkerProfile | null;
  portfolioItems: PortfolioItem[];
  reviews: CustomerReview[];
  isSaving?: boolean;
  onSaveProfile?: (
    updates: Partial<BrainWorkerProfile>
  ) => Promise<void> | void;
  onAddPortfolioItem?: (
    item: Omit<PortfolioItem, 'id' | 'createdAt'>
  ) => Promise<void> | void;
  onDeletePortfolioItem?: (itemId: string) => Promise<void> | void;
  onSubmitCounterResponse?: (
    reviewId: string,
    responseText: string
  ) => Promise<void> | void;
}

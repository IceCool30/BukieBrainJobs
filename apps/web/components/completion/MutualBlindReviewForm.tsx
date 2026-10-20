// apps/web/components/completion/MutualBlindReviewForm.tsx
// BW-009: Post-Job Completion & Escrow Release
// Phase 3 RED Component Stub

'use client';

import React from 'react';
import type {
  MutualRatingSubmissionInput,
  MutualReviewRecord,
  MutualReviewStatus,
} from '../../lib/completion/types';

export interface MutualBlindReviewFormProps {
  role: 'customer' | 'brainworker';
  reviewStatus: MutualReviewStatus;
  currentUserSubmitted: boolean;
  customerReview?: MutualReviewRecord | null;
  workerReview?: MutualReviewRecord | null;
  onSubmitReview: (ratings: MutualRatingSubmissionInput) => void | Promise<void>;
  isSubmitting?: boolean;
}

export function MutualBlindReviewForm(
  _props: MutualBlindReviewFormProps
): React.ReactElement {
  return <div data-testid="mutual-blind-review-form" />;
}

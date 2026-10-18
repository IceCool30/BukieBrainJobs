// apps/web/components/onsite/CustomerScopeReviewCard.tsx
// BW-008: On-Site Work & In-Progress Verification
// Phase 3 RED Component Stub

'use client';

import React from 'react';
import type { ScopeAdjustmentRequest } from '../../lib/onsite/types';

export interface CustomerScopeReviewCardProps {
  adjustment: ScopeAdjustmentRequest;
  baseQuoteKobo: number;
  onApprove: () => void | Promise<void>;
  onDecline: (reason?: string | undefined) => void | Promise<void>;
  isSubmitting?: boolean | undefined;
}

export function CustomerScopeReviewCard(
  _props: CustomerScopeReviewCardProps
): React.ReactElement {
  throw new Error('Not implemented: Phase 3 RED stub');
}

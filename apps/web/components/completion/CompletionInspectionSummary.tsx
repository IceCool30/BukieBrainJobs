// apps/web/components/completion/CompletionInspectionSummary.tsx
// BW-009: Post-Job Completion & Escrow Release
// Phase 3 RED Component Stub

'use client';

import React from 'react';
import type { JobStatus } from '@bukiebrainjobs/api-types';

export interface CompletionInspectionSummaryProps {
  baseQuoteKobo: number;
  approvedAdjustmentKobo: number;
  totalSettlementKobo: number;
  jobStatus: JobStatus;
  photoProofUrls?: string[];
  completionSummaryNote?: string;
  className?: string;
}

export function CompletionInspectionSummary(
  _props: CompletionInspectionSummaryProps
): React.ReactElement {
  return <div data-testid="completion-inspection-summary" />;
}

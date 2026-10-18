// apps/web/components/onsite/CompletionSubmissionForm.tsx
// BW-008: On-Site Work & In-Progress Verification
// Phase 3 RED Component Stub

'use client';

import React from 'react';

export interface CompletionSubmissionFormProps {
  bookingId: string;
  hasPendingScopeAdjustment?: boolean | undefined;
  onSubmitCompletion: (payload: {
    photoProofUrls: string[];
    summaryNote: string;
  }) => void | Promise<void>;
  isSubmitting?: boolean | undefined;
}

export function CompletionSubmissionForm(
  _props: CompletionSubmissionFormProps
): React.ReactElement {
  throw new Error('Not implemented: Phase 3 RED stub');
}

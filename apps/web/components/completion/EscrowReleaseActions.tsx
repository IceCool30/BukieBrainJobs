// apps/web/components/completion/EscrowReleaseActions.tsx
// BW-009: Post-Job Completion & Escrow Release
// Phase 3 RED Component Stub

'use client';

import React from 'react';
import type { JobStatus } from '@bukiebrainjobs/api-types';
import type { CompletionEscrowStatus } from '../../lib/completion/types';

export interface EscrowReleaseActionsProps {
  jobStatus: JobStatus;
  escrowStatus: CompletionEscrowStatus;
  onConfirmSatisfaction: () => void | Promise<void>;
  onRaiseDispute?: () => void;
  isSubmitting?: boolean;
}

export function EscrowReleaseActions(
  _props: EscrowReleaseActionsProps
): React.ReactElement {
  return <div data-testid="escrow-release-actions" />;
}

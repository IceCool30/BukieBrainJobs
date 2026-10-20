// apps/web/components/completion/AutoReleaseCountdownCard.tsx
// BW-009: Post-Job Completion & Escrow Release
// Phase 3 RED Component Stub

'use client';

import React from 'react';
import type { CompletionEscrowStatus } from '../../lib/completion/types';

export interface AutoReleaseCountdownCardProps {
  submittedAt: string;
  autoReleaseDeadline: string;
  isDisputed?: boolean;
  escrowStatus: CompletionEscrowStatus;
  now?: string;
  onTriggerAutoRelease?: () => void | Promise<void>;
  isSubmitting?: boolean;
}

export function AutoReleaseCountdownCard(
  _props: AutoReleaseCountdownCardProps
): React.ReactElement {
  return <div data-testid="auto-release-countdown-card" />;
}

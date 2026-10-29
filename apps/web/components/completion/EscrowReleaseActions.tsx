// apps/web/components/completion/EscrowReleaseActions.tsx
// BW-009: Post-Job Completion & Escrow Release
// Phase 3 GREEN: Escrow Release Actions Component

'use client';

import React from 'react';
import type { JobStatus } from '@bukiebrainjobs/api-types';
import type { CompletionEscrowStatus } from '../../lib/completion/types';

export interface EscrowReleaseActionsProps {
  jobStatus: JobStatus;
  escrowStatus: CompletionEscrowStatus;
  onConfirmSatisfaction: () => void | Promise<void>;
  onRaiseDispute?: (() => void) | undefined;
  isSubmitting?: boolean | undefined;
}

export function EscrowReleaseActions({
  jobStatus,
  escrowStatus,
  onConfirmSatisfaction,
  onRaiseDispute,
  isSubmitting = false,
}: EscrowReleaseActionsProps): React.ReactElement {
  const isEligible =
    jobStatus === 'PENDING_COMPLETION' && escrowStatus === 'ESCROW_HELD';

  return (
    <div
      data-testid="escrow-release-actions"
      className="flex flex-col gap-3 rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <h3 className="text-base font-semibold text-zinc-100">
          Customer Satisfaction and Escrow Release
        </h3>
        <p className="mt-1 text-sm text-zinc-400">
          Review delivered results and authorize payout to the artisan, or raise a dispute if unsatisfied.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={onRaiseDispute}
          disabled={isSubmitting}
          className="flex min-h-[48px] items-center justify-center rounded-full border border-red-500/30 bg-red-500/10 px-5 text-sm font-semibold text-red-400 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Raise Dispute
        </button>

        <button
          type="button"
          onClick={() => void onConfirmSatisfaction()}
          disabled={!isEligible || isSubmitting}
          className="flex min-h-[48px] items-center justify-center outlier-pill-button rounded-full bg-[var(--amber)] px-6 text-sm font-semibold text-[#001A41] shadow-lg transition hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500"
        >
          {isSubmitting ? 'Releasing Escrow...' : 'Inspect & Release Escrow'}
        </button>
      </div>
    </div>
  );
}

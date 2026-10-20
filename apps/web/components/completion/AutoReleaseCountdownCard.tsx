// apps/web/components/completion/AutoReleaseCountdownCard.tsx
// BW-009: Post-Job Completion & Escrow Release
// Phase 3 GREEN: Auto-Release Countdown Card Component

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

export function AutoReleaseCountdownCard({
  submittedAt: _submittedAt,
  autoReleaseDeadline,
  isDisputed = false,
  escrowStatus,
  now,
  onTriggerAutoRelease,
  isSubmitting = false,
}: AutoReleaseCountdownCardProps): React.ReactElement {
  const nowMs = now ? new Date(now).getTime() : Date.now();
  const deadlineMs = new Date(autoReleaseDeadline).getTime();
  const remainingMs = deadlineMs - nowMs;
  const remainingHours = Math.max(0, Math.ceil(remainingMs / (1000 * 60 * 60)));

  const isFrozen = isDisputed || escrowStatus === 'DISPUTED';
  const isEligible = !isFrozen && remainingMs <= 0;

  return (
    <div
      data-testid="auto-release-countdown-card"
      className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 text-zinc-100 shadow-xl"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-3">
        <h3 className="text-base font-semibold text-zinc-100">
          72-Hour Inspection and Auto-Release Window
        </h3>
        {isFrozen ? (
          <span className="rounded-md border border-red-800 bg-red-950/80 px-2.5 py-1 text-xs font-semibold text-red-400">
            Dispute Active: Escrow Frozen
          </span>
        ) : isEligible ? (
          <span className="rounded-md border border-emerald-800 bg-emerald-950/80 px-2.5 py-1 text-xs font-semibold text-emerald-400">
            Auto-Release Eligible
          </span>
        ) : (
          <span className="rounded-md border border-zinc-700 bg-zinc-800 px-2.5 py-1 text-xs font-medium text-zinc-300">
            Inspection Active
          </span>
        )}
      </div>

      <div className="mt-4">
        {isFrozen ? (
          <div className="rounded-lg border border-red-900/50 bg-red-950/30 p-4 text-sm text-red-300">
            <p className="font-medium">
              Escrow hold engaged during dispute review.
            </p>
            <p className="mt-1 text-xs text-red-400">
              Funds remain held until customer satisfaction is resolved or dispute mediation concludes.
            </p>
          </div>
        ) : isEligible ? (
          <div className="flex flex-col gap-3 rounded-lg border border-emerald-900/50 bg-emerald-950/30 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-300">
                The 72-hour customer inspection window has concluded.
              </p>
              <p className="mt-1 text-xs text-zinc-400">
                Inspection completed: payout may now be dispatched to the technician.
              </p>
            </div>
            {onTriggerAutoRelease && (
              <button
                type="button"
                onClick={() => void onTriggerAutoRelease()}
                disabled={isSubmitting}
                className="flex min-h-[48px] items-center justify-center rounded-lg bg-emerald-600 px-5 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50"
              >
                {isSubmitting ? 'Processing...' : 'Trigger Auto-Release'}
              </button>
            )}
          </div>
        ) : (
          <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
            <div className="flex items-baseline justify-between">
              <span className="text-xs uppercase tracking-wider text-zinc-400">
                Time Remaining
              </span>
              <span className="font-mono text-lg font-bold text-amber-400">
                {remainingHours} hours remaining ({remainingHours}h remaining)
              </span>
            </div>
            <p className="mt-2 text-xs text-zinc-500">
              Customer has 72 hours to inspect completed work. Escrow releases automatically at deadline if no dispute is opened.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

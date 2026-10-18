// apps/web/components/onsite/CustomerScopeReviewCard.tsx
// BW-008: On-Site Work & In-Progress Verification
// Customer Scope Review & Approval Card

'use client';

import React, { useState } from 'react';
import type { ScopeAdjustmentRequest } from '../../lib/onsite/types';

export interface CustomerScopeReviewCardProps {
  adjustment: ScopeAdjustmentRequest;
  baseQuoteKobo: number;
  onApprove: () => void | Promise<void>;
  onDecline: (reason?: string | undefined) => void | Promise<void>;
  isSubmitting?: boolean | undefined;
}

export function CustomerScopeReviewCard({
  adjustment,
  baseQuoteKobo,
  onApprove,
  onDecline,
  isSubmitting = false,
}: CustomerScopeReviewCardProps): React.ReactElement {
  const [declineReason, setDeclineReason] = useState('');

  const newTotalKobo = baseQuoteKobo + adjustment.totalAdditionalKobo;

  const handleDeclineClick = () => {
    const trimmedReason = declineReason.trim();
    void onDecline(trimmedReason.length > 0 ? trimmedReason : undefined);
  };

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 text-zinc-100 shadow-xl">
      <div className="mb-4 flex items-center justify-between border-b border-zinc-800 pb-3">
        <div>
          <span className="inline-block rounded bg-amber-500/10 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-amber-400">
            Action Required
          </span>
          <h3 className="mt-1 text-lg font-semibold text-zinc-100">
            On-Site Scope Adjustment Request
          </h3>
        </div>
        <span className="rounded-md border border-amber-800 bg-amber-950 px-2.5 py-1 text-xs font-medium text-amber-400">
          Pending Approval
        </span>
      </div>

      <div className="mb-4 rounded-lg border border-zinc-800 bg-zinc-950 p-4">
        <div className="text-xs font-medium uppercase tracking-wider text-zinc-400">
          Technician Notes
        </div>
        <p className="mt-1 text-sm text-zinc-200">{adjustment.description}</p>
        <div className="mt-2 flex gap-4 text-xs text-zinc-500">
          <span>
            Labor:{' '}
            <strong className="text-zinc-300">
              ₦{(adjustment.additionalLaborKobo / 100).toLocaleString()}
            </strong>
          </span>
          <span>
            Parts:{' '}
            <strong className="text-zinc-300">
              ₦{(adjustment.additionalMaterialsKobo / 100).toLocaleString()}
            </strong>
          </span>
        </div>
      </div>

      <div className="mb-4 space-y-2 rounded-lg border border-zinc-800 bg-zinc-950 p-4">
        <div className="flex justify-between text-sm text-zinc-400">
          <span>Base Quote</span>
          <span data-testid="base-quote-amount" className="font-mono text-zinc-200">
            ₦{(baseQuoteKobo / 100).toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between text-sm text-amber-400">
          <span>Additional Scope</span>
          <span data-testid="additional-amount" className="font-mono font-medium">
            +₦{(adjustment.totalAdditionalKobo / 100).toLocaleString()}
          </span>
        </div>
        <div className="border-t border-zinc-800 pt-2 flex justify-between text-base font-semibold text-zinc-100">
          <span>Updated Total Settlement</span>
          <span data-testid="new-total-amount" className="font-mono text-amber-400">
            ₦{(newTotalKobo / 100).toLocaleString()}
          </span>
        </div>
      </div>

      <div className="mb-4">
        <label
          htmlFor="decline-reason"
          className="mb-1 block text-xs font-medium uppercase tracking-wider text-zinc-400"
        >
          Optional Decline Reason
        </label>
        <input
          id="decline-reason"
          type="text"
          aria-label="Decline reason"
          placeholder="e.g. Prefer to stick to the original agreed quote"
          value={declineReason}
          onChange={(e) => setDeclineReason(e.target.value)}
          className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
        />
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          aria-label="Decline adjustment"
          disabled={isSubmitting}
          onClick={handleDeclineClick}
          className="flex-1 min-h-[44px] rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-zinc-300 transition hover:bg-zinc-800 hover:text-zinc-100 disabled:opacity-50"
        >
          Decline Adjustment
        </button>
        <button
          type="button"
          aria-label="Approve adjustment"
          disabled={isSubmitting}
          onClick={() => void onApprove()}
          className="flex-1 min-h-[44px] rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500"
        >
          {isSubmitting ? 'Approving...' : 'Approve Adjustment'}
        </button>
      </div>
    </div>
  );
}

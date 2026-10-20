// apps/web/components/completion/DisputeInitiationModal.tsx
// BW-009: Post-Job Completion & Escrow Release
// Phase 3 GREEN: Dispute Initiation Modal Component

'use client';

import React, { useState } from 'react';

export interface DisputeInitiationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitDispute: (reason: string, details: string) => void | Promise<void>;
  isSubmitting?: boolean;
}

const DISPUTE_REASONS = [
  { value: 'INCOMPLETE_WORK', label: 'Incomplete Work' },
  { value: 'POOR_QUALITY', label: 'Poor Quality' },
  { value: 'DAMAGE_INCIDENT', label: 'Property Damage' },
  { value: 'UNAUTHORIZED_EXTRA_CHARGES', label: 'Unauthorized Extra Charges' },
  { value: 'OTHER', label: 'Other' },
];

export function DisputeInitiationModal({
  isOpen,
  onClose,
  onSubmitDispute,
  isSubmitting = false,
}: DisputeInitiationModalProps): React.ReactElement | null {
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');

  if (!isOpen) return null;

  const isValid = reason.trim().length > 0 && details.trim().length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || isSubmitting) return;
    void onSubmitDispute(reason, details.trim());
  };

  return (
    <div
      data-testid="dispute-initiation-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dispute-modal-title"
    >
      <div className="w-full max-w-lg rounded-xl border border-zinc-800 bg-zinc-900 p-6 text-zinc-100 shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <h2 id="dispute-modal-title" className="text-lg font-bold text-zinc-100">
            Raise Dispute
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label
              htmlFor="dispute-reason"
              className="block text-xs font-semibold uppercase tracking-wider text-zinc-300"
            >
              Dispute Reason
            </label>
            <select
              id="dispute-reason"
              aria-label="Dispute Reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={isSubmitting}
              className="mt-1 block min-h-[48px] w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100 focus:border-red-500 focus:outline-none"
            >
              <option value="">Select a reason</option>
              {DISPUTE_REASONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="dispute-details"
              className="block text-xs font-semibold uppercase tracking-wider text-zinc-300"
            >
              Dispute Details
            </label>
            <textarea
              id="dispute-details"
              aria-label="Dispute Details"
              rows={4}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              disabled={isSubmitting}
              placeholder="Describe the issue specifically (what was left unfinished or damaged)..."
              className="mt-1 block w-full rounded-lg border border-zinc-700 bg-zinc-950 p-3 text-sm text-zinc-100 placeholder-zinc-500 focus:border-red-500 focus:outline-none"
            />
          </div>

          <div className="rounded-lg border border-amber-900/40 bg-amber-950/20 p-3 text-xs text-amber-300">
            Submitting a dispute freezes the escrow funds immediately and pauses the 72-hour auto-release clock.
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex min-h-[48px] items-center justify-center rounded-lg border border-zinc-700 px-5 text-sm font-medium text-zinc-300 hover:bg-zinc-800 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isValid || isSubmitting}
              className="flex min-h-[48px] items-center justify-center rounded-lg bg-red-600 px-5 text-sm font-semibold text-white shadow-lg transition hover:bg-red-500 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Dispute'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { X, AlertCircle, RefreshCw } from 'lucide-react';

interface DisputeModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  isOffline?: boolean | undefined;
  onSubmitDispute: (reason: string, description: string) => Promise<void>;
}

export function DisputeModal({
  isOpen,
  onClose,
  bookingId,
  isOffline = false,
  onSubmitDispute,
}: DisputeModalProps) {
  const [reason, setReason] = useState('Work incomplete or abandoned');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isOffline) return;
    if (!description.trim()) {
      setErrorMessage('Please provide a brief description of the issue.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await onSubmitDispute(reason, description);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Dispute could not be opened.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      data-booking-id={bookingId}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--bg)] p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dispute-modal-title"
    >
      <div className="w-full max-w-md rounded-2xl bg-[var(--card-bg)] p-6 shadow-2xl border border-[var(--lead)] space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 id="dispute-modal-title" className="text-base font-display font-bold text-[var(--text-main)]">
              Open BukieGuarantee Dispute
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              Escrow funds will be immediately frozen pending review.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close modal"
            className="p-1 rounded-lg text-[var(--text-muted)] hover:text-slate-600 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="rounded-xl bg-[var(--amber-dim)] p-3 border border-[var(--amber)]/30 text-xs text-[var(--amber)] flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-[var(--amber)] shrink-0 mt-0.5" />
          <span>
            Opening a dispute freezes payout to the BrainWorker and prevents automated release. A mediation specialist will review your claim within 24 hours.
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label htmlFor="dispute-reason-select" className="block font-semibold text-[var(--text-muted)] mb-1">
              Nature of Issue
            </label>
            <select
              id="dispute-reason-select"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={isSubmitting}
              className="w-full px-3 py-2.5 rounded-xl border border-[var(--lead)] text-xs bg-[var(--card-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--amber)]"
            >
              <option value="Work incomplete or abandoned">Work incomplete or abandoned by technician</option>
              <option value="Poor craftsmanship or damage caused">Poor craftsmanship or property damage</option>
              <option value="BrainWorker failed to show up">BrainWorker did not show up</option>
              <option value="Billing or scope disagreement">Disagreement over agreed job scope</option>
            </select>
          </div>

          <div>
            <label htmlFor="dispute-description-input" className="block font-semibold text-[var(--text-muted)] mb-1">
              Describe the Issue in Detail
            </label>
            <textarea
              id="dispute-description-input"
              rows={4}
              placeholder="Explain what went wrong, what was agreed upon, and what resolution you expect..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
              className="w-full px-3 py-2 rounded-xl border border-[var(--lead)] text-xs focus:outline-none focus:ring-2 focus:ring-[var(--amber)]"
            />
          </div>

          {errorMessage && (
            <div className="p-3 rounded-lg bg-[var(--danger-dim)] border border-[var(--danger-border)] text-[var(--danger)] text-xs">
              {errorMessage}
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl border border-[var(--rule)] text-[var(--text-muted)] text-xs font-semibold hover:bg-[var(--card-hover)] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isOffline}
              className="px-4 py-2 rounded-xl bg-[var(--amber)] hover:bg-[var(--amber-hover)] text-[#001A41] text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>Submitting claim...</span>
                </>
              ) : (
                <span>Submit Dispute & Freeze Escrow</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

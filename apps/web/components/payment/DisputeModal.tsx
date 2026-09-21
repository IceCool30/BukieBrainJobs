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
  bookingId: _bookingId,
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dispute-modal-title"
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 id="dispute-modal-title" className="text-base font-display font-bold text-[#001A41]">
              Open BukieGuarantee Dispute
            </h3>
            <p className="text-xs text-slate-500">
              Escrow funds will be immediately frozen pending review.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close modal"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="rounded-xl bg-amber-50 p-3 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <span>
            Opening a dispute freezes payout to the BrainWorker and prevents automated release. A mediation specialist will review your claim within 24 hours.
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label htmlFor="dispute-reason-select" className="block font-semibold text-slate-700 mb-1">
              Nature of Issue
            </label>
            <select
              id="dispute-reason-select"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={isSubmitting}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#001A41]"
            >
              <option value="Work incomplete or abandoned">Work incomplete or abandoned by technician</option>
              <option value="Poor craftsmanship or damage caused">Poor craftsmanship or property damage</option>
              <option value="BrainWorker failed to show up">BrainWorker did not show up</option>
              <option value="Billing or scope disagreement">Disagreement over agreed job scope</option>
            </select>
          </div>

          <div>
            <label htmlFor="dispute-description-input" className="block font-semibold text-slate-700 mb-1">
              Describe the Issue in Detail
            </label>
            <textarea
              id="dispute-description-input"
              rows={4}
              placeholder="Explain what went wrong, what was agreed upon, and what resolution you expect..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#001A41]"
            />
          </div>

          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs">
              {errorMessage}
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isOffline}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
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

'use client';

import React, { useState } from 'react';
import { X, AlertTriangle, Clock, RefreshCw } from 'lucide-react';

interface RefundRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  amountNaira: number;
  isOffline?: boolean | undefined;
  onSubmitRefund: (reason: string, notes?: string) => Promise<void>;
}

export function RefundRequestModal({
  isOpen,
  onClose,
  bookingId,
  amountNaira,
  isOffline = false,
  onSubmitRefund,
}: RefundRequestModalProps) {
  const [reason, setReason] = useState('BrainWorker unable to attend');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isOffline) return;
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await onSubmitRefund(reason, notes);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Refund request failed.';
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
      aria-labelledby="refund-modal-title"
    >
      <div className="w-full max-w-md rounded-2xl bg-[var(--card-bg)] p-6 shadow-2xl border border-[var(--lead)] space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 id="refund-modal-title" className="text-base font-display font-bold text-[var(--text-main)]">
              Request Escrow Refund
            </h3>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Eligible refund amount: <span className="font-mono font-semibold">₦{amountNaira.toLocaleString()}</span>
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

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* Reason Selection */}
          <div>
            <label htmlFor="refund-reason-select" className="block font-semibold text-[var(--text-muted)] mb-1">
              Primary Reason for Cancellation
            </label>
            <select
              id="refund-reason-select"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={isSubmitting}
              className="w-full px-3 py-2.5 rounded-xl border border-[var(--lead)] text-xs bg-[var(--card-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--amber)]"
            >
              <option value="BrainWorker unable to attend">BrainWorker unable to attend scheduled time</option>
              <option value="Mutual agreement to cancel">Mutual agreement to cancel service</option>
              <option value="Work incomplete or unsatisfactory">Work incomplete or unsatisfactory</option>
              <option value="Emergency or change of plans">Personal emergency or change of plans</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="refund-notes" className="block font-semibold text-[var(--text-muted)] mb-1">
              Additional Details (Optional)
            </label>
            <textarea
              id="refund-notes"
              rows={3}
              placeholder="Provide any helpful context regarding your cancellation..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isSubmitting}
              className="w-full px-3 py-2 rounded-xl border border-[var(--lead)] text-xs focus:outline-none focus:ring-2 focus:ring-[var(--amber)]"
            />
          </div>

          {/* Indicative Timeline Notice */}
          <div className="rounded-xl bg-[var(--amber-dim)] p-3.5 border border-[var(--amber)]/30 space-y-1 text-[var(--amber)]">
            <div className="flex items-center gap-1.5 font-bold">
              <Clock className="h-3.5 w-3.5 text-[var(--amber)]" />
              <span>Indicative Banking Settlement Timeline</span>
            </div>
            <p className="text-[11px] text-[var(--amber)] leading-relaxed">
              Card refunds typically process within 3 to 5 business days depending on your bank. Bank transfer refunds process within 24 to 48 hours.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-lg bg-[var(--danger-dim)] border border-[var(--danger-border)] text-[var(--danger)] text-xs flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-[var(--danger)]" />
              <span>{errorMessage}</span>
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
              className="px-4 py-2 rounded-xl bg-[var(--danger)] hover:opacity-90 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>Submitting request...</span>
                </>
              ) : (
                <span>Submit Refund Request</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

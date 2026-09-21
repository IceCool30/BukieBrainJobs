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
  bookingId: _bookingId,
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="refund-modal-title"
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 id="refund-modal-title" className="text-base font-display font-bold text-[#001A41]">
              Request Escrow Refund
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Eligible refund amount: ₦{amountNaira.toLocaleString()}
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

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* Reason Selection */}
          <div>
            <label htmlFor="refund-reason-select" className="block font-semibold text-slate-700 mb-1">
              Primary Reason for Cancellation
            </label>
            <select
              id="refund-reason-select"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={isSubmitting}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#001A41]"
            >
              <option value="BrainWorker unable to attend">BrainWorker unable to attend scheduled time</option>
              <option value="Mutual agreement to cancel">Mutual agreement to cancel service</option>
              <option value="Work incomplete or unsatisfactory">Work incomplete or unsatisfactory</option>
              <option value="Emergency or change of plans">Personal emergency or change of plans</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="refund-notes" className="block font-semibold text-slate-700 mb-1">
              Additional Details (Optional)
            </label>
            <textarea
              id="refund-notes"
              rows={3}
              placeholder="Provide any helpful context regarding your cancellation..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isSubmitting}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#001A41]"
            />
          </div>

          {/* Indicative Timeline Notice */}
          <div className="rounded-xl bg-amber-50 p-3.5 border border-amber-200 space-y-1 text-amber-900">
            <div className="flex items-center gap-1.5 font-bold">
              <Clock className="h-3.5 w-3.5 text-amber-600" />
              <span>Indicative Banking Settlement Timeline</span>
            </div>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              Card refunds typically process within 3 to 5 business days depending on your bank. Bank transfer refunds process within 24 to 48 hours.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{errorMessage}</span>
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
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
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

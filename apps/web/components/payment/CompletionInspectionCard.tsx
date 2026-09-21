'use client';

import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, AlertCircle, RefreshCw, Star, X } from 'lucide-react';

interface CompletionInspectionCardProps {
  bookingId: string;
  workerName: string;
  serviceTitle: string;
  amountNaira: number;
  isOffline?: boolean | undefined;
  onReleaseEscrow: (feedback?: string, rating?: number) => Promise<void>;
  onOpenDisputeModal: () => void;
}

export function CompletionInspectionCard({
  bookingId,
  workerName,
  serviceTitle,
  amountNaira,
  isOffline = false,
  onReleaseEscrow,
  onOpenDisputeModal,
}: CompletionInspectionCardProps) {
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customerRating, setCustomerRating] = useState(5);
  const [customerFeedback, setCustomerFeedback] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleConfirmRelease = async () => {
    if (isOffline) return;
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await onReleaseEscrow(customerFeedback, customerRating);
      setIsConfirmModalOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Release could not complete.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      data-booking-id={bookingId}
      className="rounded-2xl border-2 border-emerald-500/40 bg-emerald-50/40 p-5 sm:p-6 shadow-xs space-y-4"
      role="region"
      aria-label="Work Completion Inspection"
    >
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-[#296A4B] text-white">
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-[#296A4B]">
              Action Required • Inspection
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-display font-bold text-[#001A41]">
            {workerName} Marked This Job as Complete
          </h3>
          <p className="text-xs text-slate-600">
            {serviceTitle} • Funds of ₦{amountNaira.toLocaleString()} remain locked in escrow until your approval.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 border border-emerald-200/80 space-y-2 text-xs text-slate-700">
        <p className="font-semibold text-slate-900">Before releasing payment, verify that:</p>
        <ul className="space-y-1.5 list-disc pl-4 text-slate-600">
          <li>All requested work items have been fully executed.</li>
          <li>Repaired systems, appliances, or installations have been tested in your presence.</li>
          <li>Your premises are clean and free of leftover debris.</li>
        </ul>
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-1">
        <button
          type="button"
          onClick={() => setIsConfirmModalOpen(true)}
          disabled={isOffline}
          className="min-h-[48px] px-5 py-2.5 rounded-xl bg-[#296A4B] hover:bg-[#20543B] text-white font-semibold text-xs transition inline-flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
        >
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          <span>Inspect & Release Funds</span>
        </button>

        <button
          type="button"
          onClick={onOpenDisputeModal}
          disabled={isOffline}
          className="min-h-[48px] px-4 py-2.5 rounded-xl border border-amber-300 bg-white text-amber-900 hover:bg-amber-50 font-semibold text-xs transition inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <AlertCircle className="h-4 w-4 text-amber-600" aria-hidden="true" />
          <span>Report an Issue / Open Dispute</span>
        </button>
      </div>

      {isOffline && (
        <p className="text-[11px] text-amber-800 font-medium">
          You are offline. Releasing escrow or filing disputes requires an active connection.
        </p>
      )}

      {/* Release Confirmation Dialog */}
      {isConfirmModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="release-modal-title"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h4 id="release-modal-title" className="text-base font-display font-bold text-[#001A41]">
                  Authorize Escrow Release
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Confirm payout of ₦{amountNaira.toLocaleString()} to {workerName}.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(false)}
                disabled={isSubmitting}
                aria-label="Close modal"
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200 space-y-1 text-slate-600">
                <p className="font-semibold text-slate-800">Final Settlement Notice</p>
                <p>
                  Releasing escrow authorizes an irrevocable payout to the BrainWorker and closes the job as completed.
                </p>
              </div>

              {/* Rating */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Rate the BrainWorker</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setCustomerRating(star)}
                      aria-label={`Rate ${star} stars`}
                      className="p-1 text-amber-400 hover:scale-110 transition cursor-pointer"
                    >
                      <Star className={`h-5 w-5 ${star <= customerRating ? 'fill-amber-400' : 'text-slate-300'}`} />
                    </button>
                  ))}
                  <span className="text-xs font-semibold text-slate-700 ml-1">{customerRating} / 5</span>
                </div>
              </div>

              {/* Feedback */}
              <div>
                <label htmlFor="release-feedback" className="block text-slate-700 font-semibold mb-1">
                  Optional Feedback
                </label>
                <textarea
                  id="release-feedback"
                  rows={2}
                  placeholder="Share details about the quality of service..."
                  value={customerFeedback}
                  onChange={(e) => setCustomerFeedback(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#001A41]"
                />
              </div>

              {errorMessage && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                  {errorMessage}
                </div>
              )}
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(false)}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
              >
                Go Back
              </button>
              <button
                type="button"
                onClick={handleConfirmRelease}
                disabled={isSubmitting || isOffline}
                className="px-4 py-2 rounded-xl bg-[#296A4B] hover:bg-[#20543B] text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Authorizing...</span>
                  </>
                ) : (
                  <span>Approve & Release</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

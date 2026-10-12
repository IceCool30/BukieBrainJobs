'use client';

import React, { useState, useEffect } from 'react';
import { X, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import type { AbuseReportReason } from '../../lib/review/types';
import { getCustomerReviewRepository } from '../../lib/review/repository';
import { getMockAuthenticatedUser } from '../../lib/auth/storage';

export interface ReportReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  reviewId: string;
  onRequireAuth?: (() => void) | undefined;
}

const ABUSE_REASONS: Array<{ value: AbuseReportReason; label: string }> = [
  { value: 'inappropriate_language', label: 'Inappropriate or abusive language' },
  { value: 'false_information', label: 'False or fabricated information' },
  { value: 'harassment', label: 'Harassment or personal attack' },
  { value: 'spam_or_advertising', label: 'Spam, promotional, or advertising content' },
  { value: 'privacy_violation', label: 'Privacy violation (contains personal contact details)' },
  { value: 'other', label: 'Other issue' },
];

export function ReportReviewModal({
  isOpen,
  onClose,
  reviewId,
  onRequireAuth,
}: ReportReviewModalProps) {
  const [selectedReason, setSelectedReason] = useState<AbuseReportReason | null>(null);
  const [details, setDetails] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isAlreadySubmitted, setIsAlreadySubmitted] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Auth gate check
  useEffect(() => {
    if (isOpen) {
      const user = getMockAuthenticatedUser();
      const customerId = user?.id?.trim();
      if (!customerId) {
        if (onRequireAuth) {
          onRequireAuth();
        }
      }
    }
  }, [isOpen, onRequireAuth]);

  // Reset state on open
  useEffect(() => {
    if (isOpen) {
      setSelectedReason(null);
      setDetails('');
      setIsSubmitting(false);
      setIsSuccess(false);
      setIsAlreadySubmitted(false);
      setErrorMessage(null);
      setValidationError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const user = getMockAuthenticatedUser();
  const customerId = user?.id?.trim();

  if (!customerId && onRequireAuth) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || isAlreadySubmitted) return;

    if (!customerId) {
      setErrorMessage('You must be signed in to report a review.');
      return;
    }

    if (!selectedReason) {
      setValidationError('Please select a reason for reporting this review.');
      return;
    }

    // Safety checks for null bytes and control characters
    if (details.includes('\0') || details.includes('\u0000')) {
      setValidationError('Additional details must not contain null bytes.');
      return;
    }

    setValidationError(null);
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const repository = getCustomerReviewRepository();
      const result = await repository.reportReview(customerId, {
        reviewId,
        reason: selectedReason,
        details: details.trim() || undefined,
      });

      if (result.status === 'report_already_submitted') {
        setIsAlreadySubmitted(true);
      } else if (result.success) {
        setIsSuccess(true);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to submit report. Please try again.';
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#0B1528]/80 backdrop-blur-xs p-0 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Report a customer review"
    >
      <div className="relative w-full max-w-lg rounded-t-lg sm:rounded-lg bg-white dark:bg-[#111927] p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-[#001A41] dark:text-[#F8FAFC]">
              Report a customer review
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Tell us why you believe this review should be reviewed.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Dismiss report modal"
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success View */}
        {isSuccess ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-[#001A41] dark:text-[#F8FAFC]">
              Report received
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 max-w-sm mx-auto">
              Our moderation team has received your report and will review it promptly to ensure community standards are upheld.
            </p>
            <div className="pt-4">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-[#001A41] dark:bg-emerald-600 text-white font-semibold text-sm hover:bg-[#00265e] dark:hover:bg-emerald-500 transition-colors min-h-[44px]"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          /* Report Form */
          <form onSubmit={handleSubmit} className="py-5 space-y-5">
            {isAlreadySubmitted && (
              <div
                role="status"
                className="p-3.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 text-sm flex items-start gap-2.5"
              >
                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <p>You have already submitted a report for this review. Our team is reviewing it.</p>
              </div>
            )}

            {errorMessage && (
              <div
                role="alert"
                className="p-3.5 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 text-rose-900 dark:text-rose-200 text-sm flex items-start gap-2.5"
              >
                <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <p>{errorMessage}</p>
              </div>
            )}

            {/* Reasons Radiogroup */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#001A41] dark:text-[#F8FAFC]">
                Reason for reporting
              </label>

              <div role="radiogroup" className="space-y-2">
                {ABUSE_REASONS.map((reason) => (
                  <label
                    key={reason.value}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedReason === reason.value
                        ? 'border-[#001A41] dark:border-emerald-500 bg-slate-50/70 dark:bg-slate-800/60'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50/40 dark:hover:bg-slate-800/30'
                    }`}
                  >
                    <input
                      type="radio"
                      name="abuseReason"
                      value={reason.value}
                      checked={selectedReason === reason.value}
                      onChange={() => {
                        setSelectedReason(reason.value);
                        setValidationError(null);
                      }}
                      className="mt-1 w-4 h-4 text-[#001A41] dark:text-emerald-500 border-slate-300 dark:border-slate-700 focus:ring-emerald-500/20"
                    />
                    <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                      {reason.label}
                    </span>
                  </label>
                ))}
              </div>

              {validationError && (
                <p className="text-xs text-rose-600 dark:text-rose-400 font-medium pt-1">
                  {validationError}
                </p>
              )}
            </div>

            {/* Optional Details */}
            <div className="space-y-1.5">
              <label htmlFor="report-details" className="text-sm font-semibold text-[#001A41] dark:text-[#F8FAFC]">
                Additional details (optional)
              </label>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Provide any additional context that will assist our moderation team.
              </p>
              <textarea
                id="report-details"
                rows={3}
                value={details}
                aria-label="Additional details"
                placeholder="Add any helpful details..."
                onChange={(e) => setDetails(e.target.value)}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1528] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 p-3 text-sm focus:border-[#001A41] dark:focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-hidden"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors min-h-[44px]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isAlreadySubmitted}
                className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-[#001A41] dark:bg-emerald-600 text-white text-sm font-semibold hover:bg-[#00265e] dark:hover:bg-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Submitting report...</span>
                  </>
                ) : (
                  <span>Submit report</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

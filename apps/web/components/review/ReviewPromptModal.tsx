'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import type { ReviewBookingSummary, ReviewRatings, ReviewRating } from '../../lib/review/types';
import { getCustomerReviewRepository } from '../../lib/review/repository';
import { getMockAuthenticatedUser } from '../../lib/auth/storage';
import { countUnicodeCharacters, MAX_REVIEW_COMMENT_LENGTH } from '../../lib/review/validation';
import { StarRatingGroup } from './StarRatingGroup';
import { CharacterCountTextarea } from './CharacterCountTextarea';

export interface ReviewPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingSummary: ReviewBookingSummary;
  triggerRef?: React.RefObject<HTMLElement | null>;
  onSuccess?: () => void;
}

export function ReviewPromptModal({
  isOpen,
  onClose,
  bookingSummary,
  triggerRef,
  onSuccess,
}: ReviewPromptModalProps) {
  // 4 mandatory ratings start strictly unselected (null)
  const [punctuality, setPunctuality] = useState<ReviewRating | null>(null);
  const [quality, setQuality] = useState<ReviewRating | null>(null);
  const [communication, setCommunication] = useState<ReviewRating | null>(null);
  const [overall, setOverall] = useState<ReviewRating | null>(null);

  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const modalRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setPunctuality(null);
      setQuality(null);
      setCommunication(null);
      setOverall(null);
      setComment('');
      setIsSubmitting(false);
      setIsSuccess(false);
      setErrorMessage(null);
      setValidationErrors({});
    }
  }, [isOpen]);

  const handleDismiss = useCallback(() => {
    onClose();
    if (triggerRef?.current) {
      triggerRef.current.focus();
    }
  }, [onClose, triggerRef]);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape' && !isSubmitting) {
        handleDismiss();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, handleDismiss]);

  // Trap focus within modal
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Tab' || !modalRef.current) return;

    const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0]!;
    const lastElement = focusableElements[focusableElements.length - 1]!;

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  };

  if (!isOpen) return null;

  const charCount = countUnicodeCharacters(comment);
  const isCommentOverflow = charCount > MAX_REVIEW_COMMENT_LENGTH;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const errors: Record<string, string> = {};
    if (!punctuality) errors.punctuality = "Rating criterion 'punctuality' is required.";
    if (!quality) errors.quality = "Rating criterion 'quality' is required.";
    if (!communication) errors.communication = "Rating criterion 'communication' is required.";
    if (!overall) errors.overall = "Rating criterion 'overall' is required.";

    if (isCommentOverflow) {
      errors.comment = 'Written feedback cannot exceed 1,000 characters.';
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors({});
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const user = getMockAuthenticatedUser();
      const customerId = user?.id || '';

      const ratings: ReviewRatings = {
        punctuality: punctuality!,
        quality: quality!,
        communication: communication!,
        overall: overall!,
      };

      const repository = getCustomerReviewRepository();
      await repository.submitReview(customerId, {
        bookingId: bookingSummary.bookingId,
        ratings,
        comment: comment.trim() || undefined,
      });

      setIsSuccess(true);
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to submit review. Please try again.';
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/60 backdrop-blur-xs p-0 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="review-modal-title"
      onKeyDown={handleKeyDown}
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-xl rounded-t-2xl sm:rounded-2xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 id="review-modal-title" className="text-xl font-bold text-[#001A41]">
              Rate your experience with {bookingSummary.brainWorkerName}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {bookingSummary.serviceTitle} • Completed by {bookingSummary.brainWorkerName}
            </p>
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={handleDismiss}
            disabled={isSubmitting}
            aria-label="Close review dialog"
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50 min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Confirmation View */}
        {isSuccess ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 text-[#296A4B] flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-lg font-bold text-[#001A41]">
              Thank you for your feedback
            </h3>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              Your review has been published on {bookingSummary.brainWorkerName}&apos;s public profile.
            </p>
            <div className="pt-4">
              <button
                type="button"
                onClick={handleDismiss}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#001A41] text-white font-semibold text-sm hover:bg-[#00265e] transition-colors min-h-[44px]"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Submission Form */
          <form onSubmit={handleSubmit} className="py-5 space-y-6">
            {errorMessage && (
              <div
                role="alert"
                className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-2.5"
              >
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <p>{errorMessage}</p>
              </div>
            )}

            {/* Section 1: The 4 Required Rating Criteria */}
            <div className="space-y-4">
              <StarRatingGroup
                criterionId="punctuality"
                label="Punctuality"
                description="Did the BrainWorker arrive within the scheduled window?"
                value={punctuality}
                onChange={(val) => {
                  setPunctuality(val);
                  if (validationErrors.punctuality) {
                    setValidationErrors((prev) => {
                      const next = { ...prev };
                      delete next.punctuality;
                      return next;
                    });
                  }
                }}
                disabled={isSubmitting}
                error={validationErrors.punctuality}
              />

              <StarRatingGroup
                criterionId="quality"
                label="Work quality"
                description="Was the work executed to your complete satisfaction?"
                value={quality}
                onChange={(val) => {
                  setQuality(val);
                  if (validationErrors.quality) {
                    setValidationErrors((prev) => {
                      const next = { ...prev };
                      delete next.quality;
                      return next;
                    });
                  }
                }}
                disabled={isSubmitting}
                error={validationErrors.quality}
              />

              <StarRatingGroup
                criterionId="communication"
                label="Communication"
                description="Was the BrainWorker clear, respectful, and responsive?"
                value={communication}
                onChange={(val) => {
                  setCommunication(val);
                  if (validationErrors.communication) {
                    setValidationErrors((prev) => {
                      const next = { ...prev };
                      delete next.communication;
                      return next;
                    });
                  }
                }}
                disabled={isSubmitting}
                error={validationErrors.communication}
              />

              <StarRatingGroup
                criterionId="overall"
                label="Overall experience"
                description="How would you rate the overall completed job?"
                value={overall}
                onChange={(val) => {
                  setOverall(val);
                  if (validationErrors.overall) {
                    setValidationErrors((prev) => {
                      const next = { ...prev };
                      delete next.overall;
                      return next;
                    });
                  }
                }}
                disabled={isSubmitting}
                error={validationErrors.overall}
              />
            </div>

            {/* Section 2: Written Feedback (Optional) */}
            <CharacterCountTextarea
              id="review-comment"
              label="Written feedback (optional)"
              description="Describe the service, workmanship, and overall experience."
              value={comment}
              onChange={setComment}
              disabled={isSubmitting}
              maxLength={MAX_REVIEW_COMMENT_LENGTH}
            />

            {/* Footer Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={handleDismiss}
                disabled={isSubmitting}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors disabled:opacity-50 min-h-[44px]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isCommentOverflow}
                className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#001A41] text-white text-sm font-semibold hover:bg-[#00265e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Submitting review...</span>
                  </>
                ) : (
                  <span>Submit review</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

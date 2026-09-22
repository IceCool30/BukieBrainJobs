'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Star, ShieldCheck, CheckCircle2, Receipt, ArrowRight, WifiOff } from 'lucide-react';
import type { CustomerActivityItem } from '@bukiebrainjobs/types';
import type { ReviewEligibility } from '../../lib/review/types';
import { getCustomerReviewRepository } from '../../lib/review/repository';
import { getMockAuthenticatedUser } from '../../lib/auth/storage';
import { ReviewPromptModal } from './ReviewPromptModal';

export interface ReviewPromptCardPaymentContext {
  receiptAvailable?: boolean | undefined;
}

export interface ReviewPromptCardProps {
  activity: CustomerActivityItem;
  paymentContext?: ReviewPromptCardPaymentContext | undefined;
  onOpenReviewModal?: (() => void) | undefined;
  onViewReceipt?: (() => void) | undefined;
  isOffline?: boolean | undefined;
}

export function ReviewPromptCard({
  activity,
  paymentContext,
  onOpenReviewModal,
  onViewReceipt,
  isOffline = false,
}: ReviewPromptCardProps) {
  const [eligibility, setEligibility] = useState<ReviewEligibility | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Sole lifecycle condition: COMPLETED
  const isCompleted = activity.jobStatus === 'COMPLETED';

  useEffect(() => {
    if (!isCompleted) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    async function checkEligibility() {
      try {
        const user = getMockAuthenticatedUser();
        if (!user?.id) {
          if (isMounted) setIsLoading(false);
          return;
        }

        const repository = getCustomerReviewRepository();
        const result = await repository.getReviewEligibility(user.id, activity.id);
        if (isMounted) {
          setEligibility(result);
          setIsLoading(false);
        }
      } catch {
        // Fail closed: on repository or network error, safely hide prompt
        if (isMounted) {
          setEligibility(null);
          setIsLoading(false);
        }
      }
    }

    checkEligibility();

    return () => {
      isMounted = false;
    };
  }, [activity.id, isCompleted]);

  // If activity is not completed, completely omit review prompt
  if (!isCompleted) {
    return null;
  }

  if (isLoading || !eligibility) {
    return null;
  }

  const workerName =
    activity.preferredWorker?.name ||
    eligibility.bookingSummary?.brainWorkerName ||
    'your BrainWorker';

  const workerId =
    eligibility.bookingSummary?.brainWorkerId ||
    '';

  const handleOpenModal = () => {
    if (isOffline) return;
    if (onOpenReviewModal) {
      onOpenReviewModal();
    } else {
      setIsModalOpen(true);
    }
  };

  // State A: Already reviewed
  if (eligibility.reason === 'already_reviewed') {
    const ratingScore = eligibility.existingReview?.ratings?.overall?.toFixed(1) || '5.0';

    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-[#296A4B] text-xs font-semibold uppercase tracking-wider">
            <CheckCircle2 className="w-3.5 h-3.5" />
            REVIEW SUBMITTED
          </span>
          <div className="flex items-center gap-1 text-amber-500 font-semibold text-sm">
            <Star className="w-4 h-4 fill-amber-500" />
            <span>{ratingScore}</span>
          </div>
        </div>

        <div>
          <h4 className="text-base font-bold text-[#001A41]">
            You reviewed this booking
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Thank you for helping maintain high standards in the BukieBrainJobs community.
          </p>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <Link
            href={`/brainworkers/${workerId}#reviews`}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#001A41] hover:underline"
          >
            <span>View on {workerName}&apos;s profile</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          {paymentContext?.receiptAvailable && (
            <button
              type="button"
              onClick={onViewReceipt}
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-[#001A41] px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors min-h-[36px]"
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>View Receipt</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  // If not eligible (e.g. not owner, not completed, booking not found), omit
  if (!eligibility.eligible) {
    return null;
  }

  const bookingSummaryForModal = eligibility.bookingSummary || {
    bookingId: activity.id,
    referenceCode: activity.referenceCode || 'BKG-001',
    serviceTitle: activity.title || 'Completed Service',
    brainWorkerId: workerId,
    brainWorkerName: workerName,
    completedAt: activity.createdAt,
  };

  // State B: Eligible for review
  return (
    <>
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
        {/* Context Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              COMPLETED JOB • FEEDBACK
            </span>
          </div>
          <h4 className="text-base font-bold text-[#001A41]">
            Rate your experience with {workerName}
          </h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Share your experience with this completed service. Your feedback helps other customers understand the service.
          </p>
        </div>

        {/* Action Group */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <div className="relative">
            <button
              type="button"
              onClick={handleOpenModal}
              disabled={isOffline}
              aria-label="Leave a review"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#001A41] text-white text-sm font-semibold hover:bg-[#00265e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
            >
              <Star className="w-4 h-4 fill-white" />
              <span>Leave a review</span>
            </button>

            {isOffline && (
              <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-1.5">
                <WifiOff className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Review submission requires an active network connection.</span>
              </p>
            )}
          </div>

          {paymentContext?.receiptAvailable && (
            <button
              type="button"
              onClick={onViewReceipt}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors min-h-[44px]"
            >
              <Receipt className="w-4 h-4 text-slate-500" />
              <span>View Receipt</span>
            </button>
          )}
        </div>
      </div>

      {isModalOpen && (
        <ReviewPromptModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          bookingSummary={bookingSummaryForModal}
          onSuccess={() => {
            // Re-fetch eligibility on success
            const user = getMockAuthenticatedUser();
            if (user?.id) {
              getCustomerReviewRepository()
                .getReviewEligibility(user.id, activity.id)
                .then(setEligibility)
                .catch(() => {});
            }
          }}
        />
      )}
    </>
  );
}

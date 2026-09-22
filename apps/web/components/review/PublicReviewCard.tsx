'use client';

import React from 'react';
import { Star, ShieldCheck, Flag } from 'lucide-react';
import type { PublicBrainWorkerReview } from '../../lib/review/types';

export interface PublicReviewCardProps {
  review: PublicBrainWorkerReview;
  onReport?: (reviewId: string) => void;
}

export function PublicReviewCard({ review, onReport }: PublicReviewCardProps) {
  const {
    id,
    reviewerDisplayName,
    ratings,
    comment,
    serviceTitle,
    completedDate,
    isVerifiedBooking,
  } = review;

  const renderMiniStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5 text-amber-500" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-3.5 h-3.5 ${
              star <= rating ? 'fill-amber-500 text-amber-500' : 'text-slate-200 stroke-1'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
      {/* Header Row: Reviewer Masked Name + Verified Badge + Date */}
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-sm text-[#001A41]">
              {reviewerDisplayName}
            </span>
            {isVerifiedBooking && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#296A4B]/10 text-[#296A4B] text-[11px] font-semibold">
                <ShieldCheck className="w-3 h-3" />
                <span>Verified booking</span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500">
            Service: {serviceTitle} {completedDate && `• ${completedDate}`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {renderMiniStars(ratings.overall)}
          <span className="text-xs font-bold text-[#001A41]">{ratings.overall}.0</span>
        </div>
      </div>

      {/* Criteria Micro-Ratings Tags */}
      <div className="flex flex-wrap gap-2 text-[11px] font-medium text-slate-600">
        <span className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-100">
          Punctuality: {ratings.punctuality}
        </span>
        <span className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-100">
          Quality: {ratings.quality}
        </span>
        <span className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-100">
          Communication: {ratings.communication}
        </span>
        <span className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-100">
          Overall: {ratings.overall}
        </span>
      </div>

      {/* Written Feedback - Plain Text Node (XSS Safe) */}
      {comment && (
        <p className="text-sm text-slate-700 leading-relaxed break-words">
          {comment}
        </p>
      )}

      {/* Card Footer: Report Action */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
        <button
          type="button"
          onClick={() => onReport?.(id)}
          className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors underline-offset-2 hover:underline focus:outline-hidden min-h-[32px]"
        >
          <Flag className="w-3 h-3" />
          <span>Report this review</span>
        </button>
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import { Star, ShieldCheck } from 'lucide-react';
import type { BrainWorkerReputationSummary } from '../../lib/review/types';

export interface PublicReviewSummaryProps {
  summary: BrainWorkerReputationSummary;
}

export function PublicReviewSummary({ summary }: PublicReviewSummaryProps) {
  const { averageRating, totalReviews, criteriaAverages, ratingDistribution } = summary;

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5 text-amber-500" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= Math.round(rating)
                ? 'fill-amber-500 text-amber-500'
                : 'text-slate-200 stroke-1'
            }`}
          />
        ))}
      </div>
    );
  };

  const getPercent = (count: number) => {
    if (totalReviews === 0) return 0;
    return Math.round((count / totalReviews) * 100);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
      <div>
        <h3 className="font-display text-2xl font-bold text-[#001A41]">
          BrainWorker Reputation
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Verified feedback from completed BukieBrainJobs bookings
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-[180px_1fr] items-start">
        {/* Overall Score Box */}
        <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-50/80 border border-slate-100 text-center space-y-2">
          <span className="font-display text-5xl font-extrabold text-[#001A41]">
            {averageRating.toFixed(1)}
          </span>
          {renderStars(averageRating)}
          <div className="text-xs font-semibold text-slate-500">
            {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
          </div>
          <div className="pt-1">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-[#296A4B] text-[11px] font-semibold">
              <ShieldCheck className="w-3 h-3" />
              <span>Verified bookings only</span>
            </span>
          </div>
        </div>

        {/* Breakdown by Criteria */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Rating Breakdown
          </h4>
          <div className="space-y-2.5">
            {[
              { label: 'Punctuality', value: criteriaAverages.punctuality },
              { label: 'Work quality', value: criteriaAverages.quality },
              { label: 'Communication', value: criteriaAverages.communication },
              { label: 'Overall', value: criteriaAverages.overall },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center gap-3 text-xs">
                <span className="w-28 font-medium text-slate-700 shrink-0">{label}</span>
                <span className="w-7 font-bold text-[#001A41] text-right shrink-0">
                  {value.toFixed(1)}
                </span>
                <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#001A41] transition-all"
                    style={{ width: `${Math.min(100, Math.max(0, (value / 5) * 100))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Rating Distribution */}
      <div className="pt-4 border-t border-slate-100 space-y-2.5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Rating Distribution
        </h4>
        <div className="space-y-1.5">
          {([5, 4, 3, 2, 1] as const).map((star) => {
            const count = ratingDistribution[star];
            const pct = getPercent(count);

            return (
              <div key={star} className="flex items-center gap-3 text-xs">
                <span className="w-16 font-medium text-slate-600 shrink-0">
                  {star} {star === 1 ? 'star' : 'stars'}
                </span>
                <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-amber-500 transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-10 text-right font-medium text-slate-400 shrink-0">
                  ({count})
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

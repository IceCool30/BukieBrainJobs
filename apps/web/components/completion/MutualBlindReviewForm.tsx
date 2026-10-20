// apps/web/components/completion/MutualBlindReviewForm.tsx
// BW-009: Post-Job Completion & Escrow Release
// Phase 3 GREEN: Mutual Blind Review Form Component

'use client';

import React, { useState } from 'react';
import type {
  MutualRatingSubmissionInput,
  MutualReviewRecord,
  MutualReviewStatus,
} from '../../lib/completion/types';

export interface MutualBlindReviewFormProps {
  role: 'customer' | 'brainworker';
  reviewStatus: MutualReviewStatus;
  currentUserSubmitted: boolean;
  customerReview?: MutualReviewRecord | null | undefined;
  workerReview?: MutualReviewRecord | null | undefined;
  onSubmitReview: (ratings: MutualRatingSubmissionInput) => void | Promise<void>;
  isSubmitting?: boolean | undefined;
}

const CRITERIA = [
  { key: 'punctuality', label: 'Punctuality' },
  { key: 'quality', label: 'Quality' },
  { key: 'communication', label: 'Communication' },
  { key: 'overall', label: 'Overall' },
] as const;

export function MutualBlindReviewForm({
  role: _role,
  reviewStatus,
  currentUserSubmitted,
  customerReview,
  workerReview,
  onSubmitReview,
  isSubmitting = false,
}: MutualBlindReviewFormProps): React.ReactElement {
  const [ratings, setRatings] = useState<Record<string, number>>({
    punctuality: 5,
    quality: 5,
    communication: 5,
    overall: 5,
  });
  const [comment, setComment] = useState('');

  const handleStarClick = (criterion: string, value: number) => {
    setRatings((prev) => ({ ...prev, [criterion]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    void onSubmitReview({
      punctuality: ratings.punctuality ?? 5,
      quality: ratings.quality ?? 5,
      communication: ratings.communication ?? 5,
      overall: ratings.overall ?? 5,
      comment: comment.trim() || undefined,
    });
  };

  // Case 1: Mutual Revealed - both reviews visible
  if (reviewStatus === 'MUTUAL_REVEALED') {
    return (
      <div
        data-testid="mutual-blind-review-form"
        className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900 p-6 text-zinc-100 shadow-xl"
      >
        <div className="border-b border-zinc-800 pb-3">
          <span className="inline-block rounded bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-emerald-400">
            Verified Feedback
          </span>
          <h3 className="mt-1 text-lg font-bold text-zinc-100">
            Mutual Reviews Revealed
          </h3>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {customerReview && (
            <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Customer Review
                </span>
                <span className="font-mono text-xs text-amber-400">
                  ★ {customerReview.ratings.overall}/5
                </span>
              </div>
              {customerReview.ratings.comment && (
                <p className="mt-3 text-sm text-zinc-200">
                  "{customerReview.ratings.comment}"
                </p>
              )}
              <dl className="mt-3 grid grid-cols-2 gap-2 text-xs text-zinc-400">
                <div>Punctuality: {customerReview.ratings.punctuality}/5</div>
                <div>Quality: {customerReview.ratings.quality}/5</div>
                <div>Communication: {customerReview.ratings.communication}/5</div>
                <div>Overall: {customerReview.ratings.overall}/5</div>
              </dl>
            </div>
          )}

          {workerReview && (
            <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  BrainWorker Review
                </span>
                <span className="font-mono text-xs text-amber-400">
                  ★ {workerReview.ratings.overall}/5
                </span>
              </div>
              {workerReview.ratings.comment && (
                <p className="mt-3 text-sm text-zinc-200">
                  "{workerReview.ratings.comment}"
                </p>
              )}
              <dl className="mt-3 grid grid-cols-2 gap-2 text-xs text-zinc-400">
                <div>Punctuality: {workerReview.ratings.punctuality}/5</div>
                <div>Quality: {workerReview.ratings.quality}/5</div>
                <div>Communication: {workerReview.ratings.communication}/5</div>
                <div>Overall: {workerReview.ratings.overall}/5</div>
              </dl>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Case 2: Current user already submitted, waiting for counterparty
  if (currentUserSubmitted) {
    return (
      <div
        data-testid="mutual-blind-review-form"
        className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 text-zinc-100 shadow-xl"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10 text-amber-400">
            🔒
          </div>
          <div>
            <h3 className="text-base font-semibold text-zinc-100">
              Double-Blind Mutual Review Submitted
            </h3>
            <p className="text-sm text-zinc-400">
              Waiting for counterparty - ratings hidden until both parties review.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Case 3: Review form input
  return (
    <div
      data-testid="mutual-blind-review-form"
      className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 text-zinc-100 shadow-xl"
    >
      <div className="border-b border-zinc-800 pb-3">
        <h3 className="text-lg font-bold text-zinc-100">
          Double-Blind Performance Review
        </h3>
        <p className="mt-1 text-xs text-zinc-400">
          Ratings remain completely hidden from the other party until both sides submit their review.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          {CRITERIA.map(({ key, label }) => (
            <div
              key={key}
              className="rounded-lg border border-zinc-800 bg-zinc-950 p-3"
            >
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                  {label}
                </label>
                <span className="font-mono text-xs text-amber-400">
                  ★ {ratings[key]}/5
                </span>
              </div>
              <div className="mt-2 flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleStarClick(key, star)}
                    className={`flex h-10 w-10 items-center justify-center rounded-md text-sm font-bold transition ${
                      (ratings[key] ?? 5) >= star
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-zinc-800 text-zinc-600 hover:text-zinc-400'
                    }`}
                    aria-label={`${label} ${star} star`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div>
          <label
            htmlFor="review-comment"
            className="block text-xs font-semibold uppercase tracking-wider text-zinc-300"
          >
            Feedback Notes (Optional)
          </label>
          <textarea
            id="review-comment"
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            disabled={isSubmitting}
            placeholder="Share honest feedback about the service or customer experience..."
            className="mt-1 block w-full rounded-lg border border-zinc-700 bg-zinc-950 p-3 text-sm text-zinc-100 placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex min-h-[48px] w-full items-center justify-center rounded-lg bg-emerald-600 px-6 text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-500 disabled:opacity-50 sm:w-auto"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </div>
  );
}

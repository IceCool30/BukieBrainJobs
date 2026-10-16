// apps/web/components/brainworker/profile/ReviewsCounterResponseTab.tsx
// BrainWorker Reviews & Counter-Response Tab Component (BW-005, Item 2.7)
// Phase 3 GREEN: Reviews list, star ratings, artisan response cards, counter-response form

import React, { useState, type JSX } from 'react';
import type { CustomerReview } from '../../../lib/brainworker/profile/types';
import type { ReviewsCounterResponseTabProps } from './types';

export function ReviewsCounterResponseTab({
  reviews,
  onSubmitCounterResponse,
}: ReviewsCounterResponseTabProps): JSX.Element {
  const [activeResponseReviewId, setActiveResponseReviewId] = useState<string | null>(null);
  const [responseText, setResponseText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleOpenForm = (reviewId: string) => {
    setActiveResponseReviewId(reviewId);
    setResponseText('');
    setError(null);
  };

  const handleCancelForm = () => {
    setActiveResponseReviewId(null);
    setResponseText('');
    setError(null);
  };

  const handleSubmitResponse = async (reviewId: string, e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmed = responseText.trim();
    if (trimmed.length < 10) {
      setError('Response must be at least 10 characters long.');
      return;
    }
    if (trimmed.length > 500) {
      setError('Response cannot exceed 500 characters.');
      return;
    }

    try {
      if (onSubmitCounterResponse) {
        await onSubmitCounterResponse(reviewId, trimmed);
      }
      setActiveResponseReviewId(null);
      setResponseText('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to submit response.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-lg font-semibold text-slate-100">
          Client Feedback & Verified Reviews
        </h2>
        <p className="text-xs text-slate-400">
          Review customer satisfaction ratings and post official artisan counter-responses.
        </p>
      </div>

      <div data-testid="reviews-list" className="space-y-4">
        {reviews.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-700 p-8 text-center text-slate-400">
            No client reviews posted yet.
          </div>
        ) : (
          reviews.map((review) => {
            const isResponding = activeResponseReviewId === review.id;

            return (
              <div
                key={review.id}
                className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-4 shadow-sm"
              >
                {/* Review Header: Customer name, rating, date */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/60 pb-3">
                  <div>
                    <span className="font-semibold text-slate-100 text-sm">
                      {review.customerName ?? 'Verified Customer'}
                    </span>
                    <div className="flex items-center gap-1 mt-1">
                      {Array.from({ length: 5 }, (_, i) => (
                        <span
                          key={i}
                          className={`text-xs ${
                            i < review.rating
                              ? 'text-amber-400'
                              : 'text-slate-700'
                          }`}
                        >
                          ★
                        </span>
                      ))}
                      <span className="text-xs font-medium text-slate-400 ml-1">
                        {review.rating} / 5
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-slate-500">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Criteria breakdown if present */}
                {review.criteriaScores && (
                  <div className="flex flex-wrap gap-3 text-xs text-slate-400">
                    {Object.entries(review.criteriaScores).map(([key, score]) => (
                      <span
                        key={key}
                        className="rounded bg-slate-800/80 px-2 py-0.5 border border-slate-700/60 capitalize"
                      >
                        {key}: {score}/5
                      </span>
                    ))}
                  </div>
                )}

                {/* Customer Review Body */}
                <p className="text-sm text-slate-200 leading-relaxed">
                  {review.reviewBody}
                </p>

                {/* Artisan Counter-Response Display */}
                {review.artisanResponse && (
                  <div
                    data-testid="artisan-response-card"
                    className="rounded-lg border border-emerald-500/30 bg-emerald-950/20 p-4 space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-emerald-400">
                        Artisan Response
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(
                          review.artisanResponse.respondedAt
                        ).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed">
                      {review.artisanResponse.responseText}
                    </p>
                  </div>
                )}

                {/* Unresponded State Trigger & Form */}
                {!review.artisanResponse && (
                  <div>
                    {!isResponding ? (
                      <button
                        type="button"
                        data-testid={`open-counter-response-btn-${review.id}`}
                        onClick={() => handleOpenForm(review.id)}
                        className="rounded-lg bg-slate-800 border border-slate-700 px-3 py-1.5 text-xs font-semibold text-emerald-400 hover:bg-slate-700"
                      >
                        Respond to Client
                      </button>
                    ) : (
                      <form
                        onSubmit={(e) => handleSubmitResponse(review.id, e)}
                        className="rounded-lg border border-slate-700 bg-slate-800/60 p-4 space-y-3"
                      >
                        <div className="flex justify-between items-center">
                          <label className="text-xs font-semibold text-slate-200">
                            Your Public Counter-Response
                          </label>
                          <span className="text-xs text-slate-400">
                            {responseText.length} / 500
                          </span>
                        </div>

                        {error && (
                          <div className="rounded bg-rose-500/10 border border-rose-500/20 p-2 text-xs text-rose-300">
                            {error}
                          </div>
                        )}

                        <textarea
                          rows={3}
                          maxLength={500}
                          value={responseText}
                          onChange={(e) => setResponseText(e.target.value)}
                          placeholder="Write your response to the client..."
                          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                        />

                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={handleCancelForm}
                            className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            data-testid="submit-counter-response-btn"
                            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500"
                          >
                            Submit Response
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

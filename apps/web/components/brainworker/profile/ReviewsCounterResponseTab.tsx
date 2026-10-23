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
      <div className="border-b border-[var(--lead)] pb-4">
        <h2 className="text-lg font-semibold text-[var(--text-main)]">
          Client Feedback & Verified Reviews
        </h2>
        <p className="text-xs text-[var(--text-muted)]">
          Review customer satisfaction ratings and post official artisan counter-responses.
        </p>
      </div>

      <div data-testid="reviews-list" className="space-y-4">
        {reviews.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[var(--lead)] p-8 text-center text-[var(--text-muted)]">
            No client reviews posted yet.
          </div>
        ) : (
          reviews.map((review) => {
            const isResponding = activeResponseReviewId === review.id;

            return (
              <div
                key={review.id}
                className="rounded-xl border border-[var(--lead)] bg-[var(--card-bg)] p-5 space-y-4 shadow-sm"
              >
                {/* Review Header: Customer name, rating, date */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--lead)] pb-3">
                  <div>
                    <span className="font-semibold text-[var(--text-main)] text-sm">
                      {review.customerName ?? 'Verified Customer'}
                    </span>
                    <div className="flex items-center gap-1 mt-1">
                      {Array.from({ length: 5 }, (_, i) => (
                        <span
                          key={i}
                          className={`text-xs ${
                            i < review.rating
                              ? 'text-[var(--amber)]'
                              : 'text-[var(--rule)]'
                          }`}
                        >
                          ★
                        </span>
                      ))}
                      <span className="text-xs font-medium text-[var(--text-muted)] ml-1">
                        {review.rating} / 5
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-[var(--text-muted)]">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Criteria breakdown if present */}
                {review.criteriaScores && (
                  <div className="flex flex-wrap gap-3 text-xs text-[var(--text-muted)]">
                    {Object.entries(review.criteriaScores).map(([key, score]) => (
                      <span
                        key={key}
                        className="rounded bg-[var(--tag-bg)] px-2 py-0.5 border border-[var(--lead)] capitalize"
                      >
                        {key}: {score}/5
                      </span>
                    ))}
                  </div>
                )}

                {/* Customer Review Body */}
                <p className="text-sm text-[var(--text-main)] leading-relaxed">
                  {review.reviewBody}
                </p>

                {/* Artisan Counter-Response Display */}
                {review.artisanResponse && (
                  <div
                    data-testid="artisan-response-card"
                    className="rounded-lg border border-[var(--brand-green-border)] bg-[var(--brand-green-dim)] p-4 space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-[var(--brand-green)]">
                        Artisan Response
                      </span>
                      <span className="text-xs text-[var(--text-muted)]">
                        {new Date(
                          review.artisanResponse.respondedAt
                        ).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--text-main)] leading-relaxed">
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
                        className="rounded-lg bg-[var(--tag-bg)] border border-[var(--lead)] px-3 py-1.5 text-xs font-semibold text-[var(--brand-green)] hover:bg-[var(--card-hover)]"
                      >
                        Respond to Client
                      </button>
                    ) : (
                      <form
                        onSubmit={(e) => handleSubmitResponse(review.id, e)}
                        className="rounded-lg border border-[var(--lead)] bg-[var(--tag-bg)] p-4 space-y-3"
                      >
                        <div className="flex justify-between items-center">
                          <label className="text-xs font-semibold text-[var(--text-main)]">
                            Your Public Counter-Response
                          </label>
                          <span className="text-xs text-[var(--text-muted)]">
                            {responseText.length} / 500
                          </span>
                        </div>

                        {error && (
                          <div className="rounded bg-[var(--danger-dim)] border border-[var(--danger-border)] p-2 text-xs text-[var(--danger)]">
                            {error}
                          </div>
                        )}

                        <textarea
                          rows={3}
                          maxLength={500}
                          value={responseText}
                          onChange={(e) => setResponseText(e.target.value)}
                          placeholder="Write your response to the client..."
                          className="w-full rounded-lg border border-[var(--lead)] bg-[var(--card-bg)] px-3 py-2 text-xs text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--amber)]"
                        />

                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={handleCancelForm}
                            className="rounded-lg bg-[var(--tag-bg)] px-3 py-1.5 text-xs font-medium text-[var(--text-muted)] hover:bg-[var(--card-hover)]"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            data-testid="submit-counter-response-btn"
                            className="rounded-lg bg-[var(--amber)] px-3 py-1.5 text-xs font-bold text-[#001A41] hover:bg-[var(--amber-hover)]"
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

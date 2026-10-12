'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, MessageSquare, CheckCircle2 } from 'lucide-react';
import type {
  PublicBrainWorkerReview,
  BrainWorkerReputationSummary,
} from '../../lib/review/types';
import { getCustomerReviewRepository } from '../../lib/review/repository';
import { PublicReviewSummary } from './PublicReviewSummary';
import { PublicReviewCard } from './PublicReviewCard';
import { ReportReviewModal } from './ReportReviewModal';

export interface PublicReviewFeedProps {
  brainWorkerId: string;
  initialTab?: 'service' | 'reviews';
  skills?: string[];
  serviceCategories?: string[];
  onRequireAuth?: () => void;
}

export function PublicReviewFeed({
  brainWorkerId,
  initialTab = 'reviews',
  skills = [],
  serviceCategories = [],
  onRequireAuth,
}: PublicReviewFeedProps) {
  const [activeTab, setActiveTab] = useState<'service' | 'reviews'>(initialTab);
  const [reviews, setReviews] = useState<PublicBrainWorkerReview[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [reputationSummary, setReputationSummary] = useState<BrainWorkerReputationSummary | null>(null);
  const [page, setPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Reporting modal state
  const [reportingReviewId, setReportingReviewId] = useState<string | null>(null);

  const fetchReviews = useCallback(async (pageNum: number, isAppend: boolean = false) => {
    try {
      if (isAppend) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      const repository = getCustomerReviewRepository();
      const result = await repository.getPublicReviews(brainWorkerId, {
        page: pageNum,
        limit: 5,
      });

      if (isAppend) {
        setReviews((prev) => [...prev, ...result.reviews]);
      } else {
        setReviews(result.reviews);
      }

      setTotalCount(result.totalCount);
      setReputationSummary(result.reputationSummary);
      setPage(pageNum);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load reviews.';
      setError(message);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [brainWorkerId]);

  useEffect(() => {
    fetchReviews(1);
  }, [fetchReviews]);

  const handleLoadMore = () => {
    if (isLoadingMore || reviews.length >= totalCount) return;
    fetchReviews(page + 1, true);
  };

  const isAllLoaded = reviews.length >= totalCount && totalCount > 0;

  return (
    <div className="space-y-6">
      {/* Sub-Navigation Tabs */}
      <div className="flex border-b border-[var(--lead)]" role="tablist">
        <button
          type="button"
          role="tab"
          id="tab-service"
          aria-selected={activeTab === 'service'}
          aria-controls="panel-service"
          onClick={() => setActiveTab('service')}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'service'
              ? 'border-[var(--amber)] text-[var(--text-main)]'
              : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-main)]'
          }`}
        >
          Service focus
        </button>

        <button
          type="button"
          role="tab"
          id="tab-reviews"
          aria-selected={activeTab === 'reviews'}
          aria-controls="panel-reviews"
          onClick={() => setActiveTab('reviews')}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'reviews'
              ? 'border-[var(--amber)] text-[var(--text-main)]'
              : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-main)]'
          }`}
        >
          Customer reviews ({totalCount})
        </button>
      </div>

      {/* Tab Panel 1: Service Focus */}
      {activeTab === 'service' && (
        <div id="panel-service" role="tabpanel" aria-labelledby="tab-service" className="space-y-6">
          <section className="rounded-lg border border-[var(--lead)] bg-[var(--card-bg)] p-6 sm:p-7 shadow-xs space-y-4">
            <div>
              <p className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--brand-green)]">
                Service focus
              </p>
              <h3 className="font-display text-xl font-bold text-[var(--text-main)] mt-1">
                What this BrainWorker lists
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                Review the listed skills and choose the service that matches your requirement.
              </p>
            </div>

            {skills.length > 0 ? (
              <ul className="grid gap-2.5 sm:grid-cols-2 pt-2">
                {skills.map((skill) => (
                  <li
                    key={skill}
                    className="flex items-center gap-2.5 rounded-lg border border-[var(--lead)] bg-[var(--tag-bg)] p-3 text-xs sm:text-sm font-semibold text-[var(--text-main)]"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[var(--brand-green)] shrink-0" />
                    <span>{skill}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-[var(--text-muted)] italic">No specific skills listed.</p>
            )}

            {serviceCategories.length > 0 && (
              <div className="pt-2 flex flex-wrap gap-2">
                {serviceCategories.map((category) => (
                  <span
                    key={category}
                    className="px-3 py-1 rounded-md bg-[var(--tag-bg)] border border-[var(--lead)] font-mono text-xs font-semibold text-[var(--text-main)]"
                  >
                    {category}
                  </span>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {/* Tab Panel 2: Customer Reviews Feed */}
      {activeTab === 'reviews' && (
        <div id="panel-reviews" role="tabpanel" aria-labelledby="tab-reviews" className="space-y-6">
          {isLoading ? (
            <div className="p-8 text-center text-sm text-[var(--text-muted)] flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-[var(--amber)]" />
              <span>Loading reviews...</span>
            </div>
          ) : error ? (
            <div className="p-6 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
              <p>{error}</p>
              <button
                type="button"
                onClick={() => fetchReviews(1)}
                className="mt-2 text-xs font-bold underline cursor-pointer"
              >
                Retry
              </button>
            </div>
          ) : totalCount === 0 ? (
            /* Empty Review State */
            <div className="rounded-lg border border-[var(--lead)] bg-[var(--card-bg)] p-8 sm:p-12 text-center space-y-3 shadow-xs">
              <div className="w-12 h-12 mx-auto rounded-lg bg-[var(--tag-bg)] border border-[var(--lead)] text-[var(--text-muted)] flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-[var(--amber)]" />
              </div>
              <h3 className="text-base font-bold font-display text-[var(--text-main)]">
                No customer reviews yet
              </h3>
              <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
                Reviews appear here once customers complete bookings with this BrainWorker.
              </p>
            </div>
          ) : (
            <>
              {/* Reputation Summary Card */}
              {reputationSummary && (
                <PublicReviewSummary summary={reputationSummary} />
              )}

              {/* Review Cards Feed */}
              <div className="space-y-4">
                {reviews.map((review) => (
                  <PublicReviewCard
                    key={review.id}
                    review={review}
                    onReport={(id) => setReportingReviewId(id)}
                  />
                ))}
              </div>

              {/* Pagination Controls */}
              <div className="pt-2 text-center">
                {!isAllLoaded && (
                  <button
                    type="button"
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                    className="motion-press inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg border border-[var(--lead)] bg-[var(--card-bg)] text-[var(--text-main)] text-sm font-bold hover:bg-[var(--card-hover)] transition-colors disabled:opacity-50 min-h-[44px] cursor-pointer shadow-xs"
                  >
                    {isLoadingMore ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-[var(--amber)]" />
                        <span>Loading reviews...</span>
                      </>
                    ) : (
                      <span>Load more reviews</span>
                    )}
                  </button>
                )}

                {isAllLoaded && (
                  <p className="text-xs font-medium text-[var(--text-muted)]">
                    Showing all {totalCount} reviews
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Reporting Modal */}
      {reportingReviewId && (
        <ReportReviewModal
          isOpen={Boolean(reportingReviewId)}
          onClose={() => setReportingReviewId(null)}
          reviewId={reportingReviewId}
          onRequireAuth={onRequireAuth}
        />
      )}
    </div>
  );
}

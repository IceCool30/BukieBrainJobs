// apps/web/app/onsite/[bookingId]/page.tsx
// BW-008: On-Site Work & In-Progress Verification
// Phase 4 GREEN: Two-Sided Collaborative On-Site Execution Route

'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { AuthUser } from '../../../lib/auth/types';
import { getMockAuthenticatedUser } from '../../../lib/auth/storage';
import { getOnSiteRepository } from '../../../lib/onsite/repository';
import type {
  CheckInSnapshot,
  OnSiteVerificationState,
  ScopeAdjustmentReasonCategory,
} from '../../../lib/onsite/types';
import {
  CheckInPanel,
  CustomerScopeReviewCard,
  ScopeAdjustmentModal,
  CompletionSubmissionForm,
  OnSiteStatusBanner,
} from '../../../components/onsite';

export interface OnSitePageProps {
  params: Promise<{ bookingId: string }>;
}

export default function OnSitePage({
  params,
}: OnSitePageProps): React.ReactElement {
  const router = useRouter();

  const [bookingId, setBookingId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [onSiteState, setOnSiteState] = useState<OnSiteVerificationState | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [notFound, setNotFound] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Resolve bookingId from params
  useEffect(() => {
    let active = true;
    Promise.resolve(params)
      .then((resolvedParams) => {
        if (active) {
          setBookingId(resolvedParams.bookingId);
        }
      })
      .catch(() => {
        if (active) {
          setNotFound(true);
          setIsLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [params]);

  // Load on-site state from repository
  const loadState = useCallback(async (id: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const repo = getOnSiteRepository();
      const state = await repo.getOnSiteState(id);
      if (!state) {
        setNotFound(true);
        return;
      }
      setOnSiteState(state);
      setNotFound(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load on-site session';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Authentication guard and initial data fetch
  useEffect(() => {
    if (!bookingId) {
      return;
    }

    const user = getMockAuthenticatedUser();
    if (!user) {
      router.replace(`/login?redirect=/onsite/${bookingId}`);
      return;
    }

    setCurrentUser(user);
    void loadState(bookingId);
  }, [bookingId]);

  // Technician Check-In
  const handleCheckIn = async (snapshot: CheckInSnapshot) => {
    if (!bookingId) return;
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const repo = getOnSiteRepository();
      const result = await repo.recordCheckIn(bookingId, snapshot);
      if (!result.eligible) {
        setErrorMessage(result.error ?? 'Check-in failed');
        return;
      }
      await loadState(bookingId);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to record check-in';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Technician Request Scope Adjustment
  const handleRequestScopeAdjustment = async (input: {
    category: ScopeAdjustmentReasonCategory;
    description: string;
    additionalLaborKobo: number;
    additionalMaterialsKobo: number;
  }) => {
    if (!bookingId) return;
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const repo = getOnSiteRepository();
      const result = await repo.submitScopeAdjustment({
        bookingId,
        category: input.category,
        description: input.description,
        additionalLaborKobo: input.additionalLaborKobo,
        additionalMaterialsKobo: input.additionalMaterialsKobo,
      });
      if (!result.valid) {
        setErrorMessage(result.error ?? 'Failed to request scope adjustment');
        return;
      }
      setIsAdjustmentModalOpen(false);
      await loadState(bookingId);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to request scope adjustment';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Customer Approve Scope Adjustment
  const handleApproveAdjustment = async () => {
    if (!bookingId || !onSiteState?.activeScopeAdjustment) return;
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const repo = getOnSiteRepository();
      await repo.respondToScopeAdjustment(
        bookingId,
        onSiteState.activeScopeAdjustment.id,
        'APPROVE',
        undefined,
        currentUser?.role ?? 'customer'
      );
      await loadState(bookingId);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to approve adjustment';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Customer Decline Scope Adjustment
  const handleDeclineAdjustment = async (reason?: string) => {
    if (!bookingId || !onSiteState?.activeScopeAdjustment) return;
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const repo = getOnSiteRepository();
      await repo.respondToScopeAdjustment(
        bookingId,
        onSiteState.activeScopeAdjustment.id,
        'DECLINE',
        reason,
        currentUser?.role ?? 'customer'
      );
      await loadState(bookingId);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to decline adjustment';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Technician Work Completion Submission
  const handleSubmitCompletion = async (payload: {
    photoProofUrls: string[];
    summaryNote: string;
  }) => {
    if (!bookingId) return;
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const repo = getOnSiteRepository();
      const result = await repo.submitCompletion({
        bookingId,
        photoProofUrls: payload.photoProofUrls,
        summaryNote: payload.summaryNote,
      });
      if (!result.valid) {
        setErrorMessage(result.error ?? 'Failed to submit completion');
        return;
      }
      await loadState(bookingId);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to submit completion';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (notFound) {
    return (
      <div className="min-h-screen bg-[var(--bg)] p-4 text-zinc-100 sm:p-8">
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="rounded-2xl border border-rose-900/50 bg-[var(--card-bg)] p-6 text-rose-300 shadow-xl">
            <h2 className="text-lg font-semibold text-rose-200">Session Not Found</h2>
            <p className="mt-2 text-sm text-zinc-400">
              Booking on-site session not found. Please verify the booking reference or return to your dashboard.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!bookingId || isLoading || !onSiteState || !currentUser) {
    return (
      <div className="min-h-screen bg-[var(--bg)] p-4 text-zinc-100 sm:p-8">
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="animate-pulse rounded-2xl border border-zinc-800 bg-[var(--card-bg)] p-6 text-zinc-400">
            Loading on-site session...
          </div>
        </div>
      </div>
    );
  }

  const isWorker = currentUser.role === 'brainworker';
  const isCustomer = currentUser.role === 'customer';

  return (
    <div className="min-h-screen bg-[var(--bg)] p-4 text-zinc-100 sm:p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
              On-Site Execution
            </span>
            <h1 className="text-2xl font-bold text-zinc-100">
              On-Site Work & Verification
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-zinc-700 bg-zinc-800 px-3 py-1 text-xs font-medium text-zinc-300">
              Booking Ref: {bookingId}
            </span>
            <span className="rounded-full border border-amber-800/60 bg-amber-950/40 px-3 py-1 text-xs font-semibold capitalize text-amber-300">
              {currentUser.role}
            </span>
          </div>
        </div>

        {/* Global Error Banner */}
        {errorMessage && (
          <div
            role="alert"
            className="rounded-xl border border-rose-800 bg-rose-950/60 p-4 text-sm text-rose-300"
          >
            {errorMessage}
          </div>
        )}

        {/* Dual-Sided Status Banner */}
        <OnSiteStatusBanner
          jobStatus={onSiteState.jobStatus}
          checkedInAt={onSiteState.checkedInAt}
          escrowStatus={onSiteState.escrowStatus}
        />

        {/* Customer View */}
        {isCustomer && (
          <div className="space-y-6">
            {onSiteState.activeScopeAdjustment?.status === 'PENDING' && (
              <CustomerScopeReviewCard
                adjustment={onSiteState.activeScopeAdjustment}
                baseQuoteKobo={onSiteState.baseQuoteKobo}
                onApprove={handleApproveAdjustment}
                onDecline={handleDeclineAdjustment}
                isSubmitting={isSubmitting}
              />
            )}

            {onSiteState.jobStatus === 'IN_PROGRESS' && !onSiteState.activeScopeAdjustment && (
              <div className="rounded-2xl border border-zinc-800 bg-[var(--card-bg)] p-6 text-zinc-300">
                <h3 className="text-base font-semibold text-zinc-100">
                  Technician Active On-Site
                </h3>
                <p className="mt-1 text-sm text-zinc-400">
                  Your BrainWorker is currently on-site executing the agreed scope of work. Any additional parts or labor requirements will be submitted here for your approval before proceeding.
                </p>
              </div>
            )}

            {onSiteState.jobStatus === 'PENDING_COMPLETION' && (
              <div className="rounded-2xl border border-emerald-800/60 bg-emerald-950/30 p-6 text-emerald-200">
                <h3 className="text-base font-semibold text-emerald-100">
                  Work Completed: Awaiting Verification
                </h3>
                <p className="mt-1 text-sm text-emerald-300/80">
                  Your BrainWorker has completed the work and submitted photo proof. Review the completed work and release escrow when fully satisfied.
                </p>
              </div>
            )}
          </div>
        )}

        {/* BrainWorker View */}
        {isWorker && (
          <div className="space-y-6">
            {onSiteState.jobStatus === 'CONFIRMED' && (
              <CheckInPanel
                jobStatus={onSiteState.jobStatus}
                escrowStatus={onSiteState.escrowStatus}
                onCheckIn={handleCheckIn}
                isSubmitting={isSubmitting}
              />
            )}

            {onSiteState.jobStatus === 'IN_PROGRESS' && (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-zinc-800 bg-[var(--card-bg)] p-5">
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-100">
                      Scope Management
                    </h3>
                    <p className="text-xs text-zinc-400">
                      Need additional parts or labor? Submit an adjustment for customer review.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAdjustmentModalOpen(true)}
                    disabled={isSubmitting || !!onSiteState.activeScopeAdjustment}
                    className="inline-flex min-h-[44px] items-center justify-center outlier-pill-button rounded-full bg-[var(--amber)] px-5 py-2 text-sm font-semibold text-[#001A41] transition hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Request Scope Adjustment
                  </button>
                </div>

                {onSiteState.activeScopeAdjustment?.status === 'PENDING' && (
                  <div className="rounded-2xl border border-amber-900/60 bg-amber-950/30 p-4 text-xs text-amber-300">
                    Scope adjustment request pending customer review. You will be notified once the customer approves or declines.
                  </div>
                )}

                <CompletionSubmissionForm
                  bookingId={bookingId}
                  hasPendingScopeAdjustment={!!onSiteState.activeScopeAdjustment}
                  onSubmitCompletion={handleSubmitCompletion}
                  isSubmitting={isSubmitting}
                />
              </div>
            )}

            {onSiteState.jobStatus === 'PENDING_COMPLETION' && (
              <div className="rounded-2xl border border-emerald-800/60 bg-emerald-950/30 p-6 text-emerald-200">
                <h3 className="text-base font-semibold text-emerald-100">
                  Completion Submitted
                </h3>
                <p className="mt-1 text-sm text-emerald-300/80">
                  Your completion proof and summary notes have been submitted. The customer is currently reviewing the work for final milestone release.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Scope Adjustment Modal */}
        {isWorker && (
          <ScopeAdjustmentModal
            isOpen={isAdjustmentModalOpen}
            onClose={() => setIsAdjustmentModalOpen(false)}
            onSubmit={handleRequestScopeAdjustment}
            isSubmitting={isSubmitting}
          />
        )}
      </div>
    </div>
  );
}

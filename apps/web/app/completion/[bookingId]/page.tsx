// apps/web/app/completion/[bookingId]/page.tsx
// BW-009: Post-Job Completion & Escrow Release
// Phase 4 GREEN: Two-Sided Completion and Escrow Release Protected Route

'use client';

import React, { useEffect, useState } from 'react';
import type { AuthUser } from '../../../lib/auth/types';
import { getMockAuthenticatedUser } from '../../../lib/auth/storage';
import { getCompletionRepository } from '../../../lib/completion/repository';
import { evaluateMutualReviewVisibility } from '../../../lib/completion/domain';
import type {
  MutualRatingSubmissionInput,
  PostJobCompletionState,
} from '../../../lib/completion/types';
import {
  AutoReleaseCountdownCard,
  CompletionInspectionSummary,
  DisputeInitiationModal,
  EscrowReleaseActions,
  MutualBlindReviewForm,
} from '../../../components/completion';

export interface CompletionPageProps {
  params: Promise<{ bookingId: string }>;
}

export default function CompletionPage({
  params,
}: CompletionPageProps): React.ReactElement {
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [completionState, setCompletionState] =
    useState<PostJobCompletionState | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [notFound, setNotFound] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Resolve bookingId from params
  useEffect(() => {
    let active = true;
    Promise.resolve(params)
      .then((resolved) => {
        if (active) {
          setBookingId(resolved.bookingId);
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

  // Auth and data loading
  useEffect(() => {
    if (!bookingId) {
      return;
    }

    const user = getMockAuthenticatedUser();
    if (!user) {
      setCurrentUser(null);
      setIsLoading(false);
      return;
    }

    setCurrentUser(user);

    let active = true;
    setIsLoading(true);
    setErrorMessage(null);

    const repo = getCompletionRepository();
    repo
      .getCompletionState(bookingId)
      .then((state) => {
        if (active) {
          if (!state) {
            setNotFound(true);
          } else {
            setCompletionState(state);
            setNotFound(false);
          }
        }
      })
      .catch((err: unknown) => {
        if (active) {
          setErrorMessage(
            err instanceof Error
              ? err.message
              : 'Failed to load completion state'
          );
        }
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [bookingId]);

  // Loading state
  if (isLoading) {
    return (
      <div
        data-testid="completion-page"
        className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center"
      >
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8 shadow-2xl">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
          <p className="text-sm text-zinc-400">
            Loading completion details...
          </p>
        </div>
      </div>
    );
  }

  // Unauthenticated guard
  if (!currentUser) {
    return (
      <div
        data-testid="completion-page"
        className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center"
      >
        <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-8 shadow-2xl">
          <h2 className="text-xl font-bold text-zinc-100">
            Authentication Required
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Please sign in to access completion inspection and escrow release details.
          </p>
          <a
            href={
              bookingId
                ? `/login?redirect=/completion/${bookingId}`
                : '/login'
            }
            className="mt-6 inline-flex min-h-[48px] items-center justify-center outlier-pill-button rounded-full bg-[var(--amber)] px-6 text-sm font-semibold text-[#001A41] shadow-lg transition hover:scale-[1.02] active:scale-[0.98]"
          >
            Proceed to Login
          </a>
        </div>
      </div>
    );
  }

  // Record not found guard
  if (notFound || !completionState) {
    return (
      <div
        data-testid="completion-page"
        className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center"
      >
        <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-8 shadow-2xl">
          <h2 className="text-xl font-bold text-zinc-100">
            Record Unavailable
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Completion record not found for this identifier.
          </p>
        </div>
      </div>
    );
  }

  // Party authorization guard
  const isAuthorized =
    currentUser.id === completionState.customerId ||
    currentUser.id === completionState.brainWorkerId;

  if (!isAuthorized) {
    return (
      <div
        data-testid="completion-page"
        className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center"
      >
        <div className="w-full max-w-md rounded-2xl border border-red-900/50 bg-zinc-900 p-8 shadow-2xl">
          <h2 className="text-xl font-bold text-red-400">
            Restricted Access
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Access Denied: You are not authorized to view this completion record.
          </p>
        </div>
      </div>
    );
  }

  const isCustomer = currentUser.id === completionState.customerId;

  const reviewVisibility = evaluateMutualReviewVisibility(
    completionState.customerReview,
    completionState.workerReview
  );

  const currentUserSubmitted = isCustomer
    ? Boolean(completionState.customerReview)
    : Boolean(completionState.workerReview);

  // Customer: confirm satisfaction
  const handleConfirmSatisfaction = async () => {
    if (!bookingId || !currentUser) return;
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const repo = getCompletionRepository();
      const updated = await repo.confirmSatisfaction(bookingId, currentUser.id);
      setCompletionState(updated);
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Confirmation failed'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Customer or auto: trigger auto-release
  const handleTriggerAutoRelease = async () => {
    if (!bookingId) return;
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const repo = getCompletionRepository();
      const updated = await repo.triggerAutoRelease(bookingId);
      setCompletionState(updated);
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Auto-release trigger failed'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Customer: raise dispute
  const handleRaiseDispute = async (reason: string, details: string) => {
    if (!bookingId || !currentUser) return;
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const repo = getCompletionRepository();
      const updated = await repo.raiseDispute(
        bookingId,
        currentUser.id,
        `${reason}: ${details}`
      );
      setCompletionState(updated);
      setIsDisputeModalOpen(false);
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Dispute initiation failed'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Either party: submit mutual review
  const handleSubmitReview = async (ratings: MutualRatingSubmissionInput) => {
    if (!bookingId || !currentUser) return;
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const repo = getCompletionRepository();
      const role = isCustomer ? 'customer' : 'brainworker';
      const updated = await repo.submitReview(
        bookingId,
        currentUser.id,
        role,
        ratings
      );
      setCompletionState(updated);
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Review submission failed'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      data-testid="completion-page"
      className="mx-auto max-w-5xl space-y-6 px-4 py-8"
    >
      {errorMessage && (
        <div className="rounded-lg border border-red-900 bg-red-950/60 p-4 text-sm text-red-300">
          {errorMessage}
        </div>
      )}

      {/* Financial Breakdown & Proof Gallery */}
      <CompletionInspectionSummary
        baseQuoteKobo={completionState.baseQuoteKobo}
        approvedAdjustmentKobo={completionState.approvedAdjustmentKobo}
        totalSettlementKobo={completionState.totalSettlementKobo}
        jobStatus={completionState.jobStatus}
        completionSummaryNote={completionState.customerFeedbackNote}
      />

      {/* Customer Escrow Actions (Suppressed for BrainWorker) */}
      {isCustomer && (
        <EscrowReleaseActions
          jobStatus={completionState.jobStatus}
          escrowStatus={completionState.escrowStatus}
          onConfirmSatisfaction={handleConfirmSatisfaction}
          onRaiseDispute={() => setIsDisputeModalOpen(true)}
          isSubmitting={isSubmitting}
        />
      )}

      {/* 72-Hour Inspection Countdown / Auto-Release */}
      <AutoReleaseCountdownCard
        submittedAt={completionState.completionSubmittedAt}
        autoReleaseDeadline={completionState.autoReleaseDeadline}
        isDisputed={completionState.isDisputed}
        escrowStatus={completionState.escrowStatus}
        onTriggerAutoRelease={handleTriggerAutoRelease}
        isSubmitting={isSubmitting}
      />

      {/* Double-Blind Mutual Feedback Section */}
      <MutualBlindReviewForm
        role={isCustomer ? 'customer' : 'brainworker'}
        reviewStatus={reviewVisibility.status}
        currentUserSubmitted={currentUserSubmitted}
        customerReview={completionState.customerReview}
        workerReview={completionState.workerReview}
        onSubmitReview={handleSubmitReview}
        isSubmitting={isSubmitting}
      />

      {/* Dispute Modal */}
      {isCustomer && (
        <DisputeInitiationModal
          isOpen={isDisputeModalOpen}
          onClose={() => setIsDisputeModalOpen(false)}
          onSubmitDispute={handleRaiseDispute}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}

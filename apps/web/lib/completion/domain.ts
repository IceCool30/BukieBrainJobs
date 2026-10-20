// apps/web/lib/completion/domain.ts
// BW-009: Post-Job Completion & Escrow Release
// Phase 1 GREEN: Domain Implementation

import type {
  AutoReleaseEvaluationInput,
  AutoReleaseEvaluationResult,
  CompletionSettlementBreakdown,
  MutualReviewRecord,
  RatingValidationResult,
  ReviewVisibilityEvaluation,
  SatisfactionConfirmationInput,
  SatisfactionConfirmationResult,
} from './types';

const AUTO_RELEASE_WINDOW_MS = 72 * 60 * 60 * 1000; // 259,200,000 ms

export function validateCustomerSatisfactionConfirmation(
  input: SatisfactionConfirmationInput
): SatisfactionConfirmationResult {
  if (input.currentJobStatus !== 'PENDING_COMPLETION') {
    return {
      eligible: false,
      error: 'Job must be PENDING_COMPLETION to confirm satisfaction',
    };
  }

  if (input.currentEscrowStatus !== 'ESCROW_HELD') {
    return {
      eligible: false,
      error: 'Escrow must be ESCROW_HELD to release',
    };
  }

  return {
    eligible: true,
    targetJobStatus: 'COMPLETED',
    targetEscrowStatus: 'ESCROW_RELEASED',
    confirmedAt: input.confirmedAt ?? new Date().toISOString(),
  };
}

export function calculateCompletionSettlement(
  totalSettlementKobo: number
): CompletionSettlementBreakdown {
  const platformFeeKobo = Math.floor(totalSettlementKobo * 0.10);
  const taskerPayoutKobo = totalSettlementKobo - platformFeeKobo;

  return {
    totalSettlementKobo,
    taskerPayoutKobo,
    platformFeeKobo,
    platformFeeBps: 1000,
  };
}

export function evaluateAutoReleaseWindow(
  input: AutoReleaseEvaluationInput
): AutoReleaseEvaluationResult {
  const submittedMs = new Date(input.submittedAt).getTime();
  const nowMs = input.now
    ? new Date(input.now).getTime()
    : Date.now();

  const elapsedMs = nowMs - submittedMs;
  const remainingMs = Math.max(0, AUTO_RELEASE_WINDOW_MS - elapsedMs);
  const autoReleaseDeadline = new Date(
    submittedMs + AUTO_RELEASE_WINDOW_MS
  ).toISOString();

  if (input.isDisputed || input.currentEscrowStatus === 'DISPUTED') {
    return {
      isEligible: false,
      elapsedMs,
      remainingMs,
      autoReleaseDeadline,
      error: 'Dispute active: auto-release blocked',
    };
  }

  return {
    isEligible: elapsedMs >= AUTO_RELEASE_WINDOW_MS,
    elapsedMs,
    remainingMs,
    autoReleaseDeadline,
  };
}

export function evaluateMutualReviewVisibility(
  customerReview?: MutualReviewRecord | null,
  workerReview?: MutualReviewRecord | null
): ReviewVisibilityEvaluation {
  const hasCustomer = customerReview != null;
  const hasWorker = workerReview != null;

  if (hasCustomer && hasWorker) {
    return {
      isRevealed: true,
      customerReviewVisible: true,
      workerReviewVisible: true,
      customerReview: customerReview,
      workerReview: workerReview,
      status: 'MUTUAL_REVEALED',
    };
  }

  if (hasCustomer && !hasWorker) {
    return {
      isRevealed: false,
      customerReviewVisible: false,
      workerReviewVisible: false,
      customerReview: null,
      workerReview: null,
      status: 'AWAITING_WORKER',
    };
  }

  if (!hasCustomer && hasWorker) {
    return {
      isRevealed: false,
      customerReviewVisible: false,
      workerReviewVisible: false,
      customerReview: null,
      workerReview: null,
      status: 'AWAITING_CUSTOMER',
    };
  }

  return {
    isRevealed: false,
    customerReviewVisible: false,
    workerReviewVisible: false,
    customerReview: null,
    workerReview: null,
    status: 'AWAITING_BOTH',
  };
}

export function validateRatingSubmission(ratings: unknown): RatingValidationResult {
  const CRITERIA = ['punctuality', 'quality', 'communication', 'overall'] as const;

  if (
    ratings === null ||
    typeof ratings !== 'object' ||
    Array.isArray(ratings)
  ) {
    return { valid: false, error: 'Ratings must be a non-null object' };
  }

  const r = ratings as Record<string, unknown>;

  for (const key of CRITERIA) {
    const value = r[key];
    if (value === undefined || value === null) {
      return {
        valid: false,
        error: `Missing required rating field: ${key}`,
      };
    }
    if (!Number.isInteger(value)) {
      return {
        valid: false,
        error: `Rating for ${key} must be an integer`,
      };
    }
    const n = value as number;
    if (n < 1 || n > 5) {
      return {
        valid: false,
        error: `Rating for ${key} must be between 1 and 5`,
      };
    }
  }

  return { valid: true };
}

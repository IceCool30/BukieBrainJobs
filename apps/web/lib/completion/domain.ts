// apps/web/lib/completion/domain.ts
// BW-009: Post-Job Completion & Escrow Release
// Phase 1 RED: Throwing Domain Stubs

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

export function validateCustomerSatisfactionConfirmation(
  _input: SatisfactionConfirmationInput
): SatisfactionConfirmationResult {
  throw new Error('Not implemented: Phase 1 RED stub');
}

export function calculateCompletionSettlement(
  _totalSettlementKobo: number
): CompletionSettlementBreakdown {
  throw new Error('Not implemented: Phase 1 RED stub');
}

export function evaluateAutoReleaseWindow(
  _input: AutoReleaseEvaluationInput
): AutoReleaseEvaluationResult {
  throw new Error('Not implemented: Phase 1 RED stub');
}

export function evaluateMutualReviewVisibility(
  _customerReview?: MutualReviewRecord | null,
  _workerReview?: MutualReviewRecord | null
): ReviewVisibilityEvaluation {
  throw new Error('Not implemented: Phase 1 RED stub');
}

export function validateRatingSubmission(
  _ratings: unknown
): RatingValidationResult {
  throw new Error('Not implemented: Phase 1 RED stub');
}

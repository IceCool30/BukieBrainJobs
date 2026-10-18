// apps/web/lib/onsite/domain.ts
// BW-008: On-Site Work & In-Progress Verification
// Phase 1 Domain Validators and Evaluators (RED Stubs)

import type {
  CheckInEligibilityInput,
  CheckInEligibilityResult,
  ScopeAdjustmentInput,
  ScopeAdjustmentValidationResult,
  ScopeAdjustmentResponseInput,
  ScopeAdjustmentEvaluationResult,
  CompletionSubmissionInput,
  CompletionValidationResult,
} from './types';

/**
 * Validates whether a technician is eligible to check in on-site.
 * Enforces booking status CONFIRMED and escrow status ESCROW_HELD.
 */
export function validateCheckInEligibility(
  _input: CheckInEligibilityInput,
  _now?: string
): CheckInEligibilityResult {
  throw new Error('Not implemented: Phase 1 RED stub');
}

/**
 * Validates an on-site scope adjustment request.
 * Enforces booking status IN_PROGRESS, positive integer kobo, valid category,
 * bounded description, and no concurrent active pending adjustments.
 */
export function validateScopeAdjustmentRequest(
  _input: ScopeAdjustmentInput
): ScopeAdjustmentValidationResult {
  throw new Error('Not implemented: Phase 1 RED stub');
}

/**
 * Evaluates a customer response to an active scope adjustment request.
 * Enforces state transition to APPROVED or REJECTED, preserves base quote,
 * and derives authoritative total settlement kobo.
 */
export function evaluateScopeAdjustmentResponse(
  _input: ScopeAdjustmentResponseInput
): ScopeAdjustmentEvaluationResult {
  throw new Error('Not implemented: Phase 1 RED stub');
}

/**
 * Validates a technician work completion submission.
 * Enforces booking status IN_PROGRESS, valid photo proof URLs, non-empty summary,
 * and absence of unresolved pending scope adjustments.
 */
export function validateCompletionSubmission(
  _input: CompletionSubmissionInput
): CompletionValidationResult {
  throw new Error('Not implemented: Phase 1 RED stub');
}

// apps/web/lib/onsite/domain.ts
// BW-008: On-Site Work & In-Progress Verification
// Phase 1 Domain Validators and Evaluators (GREEN Implementation)

import { canTransition } from '@bukiebrainjobs/api-types';
import type {
  CheckInEligibilityInput,
  CheckInEligibilityResult,
  ScopeAdjustmentInput,
  ScopeAdjustmentValidationResult,
  ScopeAdjustmentResponseInput,
  ScopeAdjustmentEvaluationResult,
  CompletionSubmissionInput,
  CompletionValidationResult,
  ScopeAdjustmentRequest,
} from './types';

/**
 * Validates whether a technician is eligible to check in on-site.
 * Enforces booking status CONFIRMED and escrow status ESCROW_HELD.
 * Enforces verified location coordinates or non-empty landmark confirmation.
 */
export function validateCheckInEligibility(
  input: CheckInEligibilityInput,
  now?: string
): CheckInEligibilityResult {
  if (input.jobStatus !== 'CONFIRMED' || !canTransition(input.jobStatus, 'IN_PROGRESS')) {
    return {
      eligible: false,
      error: 'Booking status must be CONFIRMED to check in',
    };
  }

  if (input.escrowStatus !== 'ESCROW_HELD') {
    return {
      eligible: false,
      error: 'Escrow must be funded before check-in',
    };
  }

  if (!input.snapshot) {
    return {
      eligible: false,
      error: 'Location or landmark verification is required',
    };
  }

  const hasCoords =
    input.snapshot.coordinates != null &&
    typeof input.snapshot.coordinates.latitude === 'number' &&
    typeof input.snapshot.coordinates.longitude === 'number';

  const hasLandmark =
    input.snapshot.landmarkConfirmation != null &&
    input.snapshot.landmarkConfirmation.trim().length > 0;

  if (!hasCoords && !hasLandmark) {
    return {
      eligible: false,
      error: 'Location or landmark verification is required',
    };
  }

  const checkedInAt = now ?? new Date().toISOString();

  return {
    eligible: true,
    targetStatus: 'IN_PROGRESS',
    checkedInAt,
  };
}

/**
 * Validates an on-site scope adjustment request.
 * Enforces booking status IN_PROGRESS, positive integer kobo, valid category,
 * bounded description, and no concurrent active pending adjustments.
 */
export function validateScopeAdjustmentRequest(
  input: ScopeAdjustmentInput
): ScopeAdjustmentValidationResult {
  if (input.currentJobStatus !== 'IN_PROGRESS') {
    return {
      valid: false,
      error: 'Scope adjustments permitted strictly when booking is IN_PROGRESS',
    };
  }

  if (input.hasActivePendingAdjustment === true) {
    return {
      valid: false,
      error: 'Active pending scope adjustment already exists',
    };
  }

  const validCategories = ['ADDITIONAL_PARTS', 'ADDITIONAL_LABOR', 'BOTH'];
  if (!validCategories.includes(input.category)) {
    return {
      valid: false,
      error: 'Invalid scope adjustment reason category',
    };
  }

  if (
    !Number.isInteger(input.additionalLaborKobo) ||
    input.additionalLaborKobo < 0
  ) {
    return {
      valid: false,
      error: 'Additional labor kobo must be a non-negative integer',
    };
  }

  if (
    !Number.isInteger(input.additionalMaterialsKobo) ||
    input.additionalMaterialsKobo < 0
  ) {
    return {
      valid: false,
      error: 'Additional materials kobo must be a non-negative integer',
    };
  }

  const totalAdditionalKobo =
    input.additionalLaborKobo + input.additionalMaterialsKobo;

  if (totalAdditionalKobo <= 0) {
    return {
      valid: false,
      error: 'Total additional kobo must be greater than zero',
    };
  }

  const trimmedDescription = input.description.trim();
  if (trimmedDescription.length === 0) {
    return {
      valid: false,
      error: 'Scope adjustment description is required',
    };
  }

  if (trimmedDescription.length > 500) {
    return {
      valid: false,
      error: 'Scope adjustment description cannot exceed 500 characters',
    };
  }

  const requestedAt = input.now ?? new Date().toISOString();
  const requestId = `adj_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const request: ScopeAdjustmentRequest = {
    id: requestId,
    bookingId: input.bookingId,
    category: input.category,
    description: trimmedDescription,
    additionalLaborKobo: input.additionalLaborKobo,
    additionalMaterialsKobo: input.additionalMaterialsKobo,
    totalAdditionalKobo,
    status: 'PENDING',
    requestedAt,
  };

  return {
    valid: true,
    request,
  };
}

/**
 * Evaluates a customer response to an active scope adjustment request.
 * Enforces state transition to APPROVED or REJECTED, preserves base quote,
 * and derives authoritative total settlement kobo.
 */
export function evaluateScopeAdjustmentResponse(
  input: ScopeAdjustmentResponseInput
): ScopeAdjustmentEvaluationResult {
  const { request, decision, baseQuoteKobo, reviewedAt, rejectionReason } = input;

  if (decision === 'APPROVE') {
    const updatedRequest: ScopeAdjustmentRequest = {
      ...request,
      status: 'APPROVED',
      ...(reviewedAt != null ? { reviewedAt } : {}),
    };

    const approvedAdjustmentKobo = request.totalAdditionalKobo;
    const totalSettlementKobo = baseQuoteKobo + approvedAdjustmentKobo;

    return {
      status: 'APPROVED',
      updatedRequest,
      baseQuoteKobo,
      approvedAdjustmentKobo,
      totalSettlementKobo,
    };
  }

  const updatedRequest: ScopeAdjustmentRequest = {
    ...request,
    status: 'REJECTED',
    ...(reviewedAt != null ? { reviewedAt } : {}),
    ...(rejectionReason != null ? { rejectionReason } : {}),
  };

  return {
    status: 'REJECTED',
    updatedRequest,
    baseQuoteKobo,
    approvedAdjustmentKobo: 0,
    totalSettlementKobo: baseQuoteKobo,
  };
}

/**
 * Validates a technician work completion submission.
 * Enforces booking status IN_PROGRESS, valid photo proof URLs, non-empty summary,
 * and absence of unresolved pending scope adjustments.
 */
export function validateCompletionSubmission(
  input: CompletionSubmissionInput
): CompletionValidationResult {
  if (
    input.currentJobStatus !== 'IN_PROGRESS' ||
    !canTransition(input.currentJobStatus, 'PENDING_COMPLETION')
  ) {
    return {
      valid: false,
      error: 'Completion submission requires booking status IN_PROGRESS',
    };
  }

  if (input.hasPendingScopeAdjustment === true) {
    return {
      valid: false,
      error: 'Cannot submit completion with pending scope adjustment',
    };
  }

  if (!Array.isArray(input.photoProofUrls) || input.photoProofUrls.length === 0) {
    return {
      valid: false,
      error: 'At least one completion photo proof URL is required',
    };
  }

  const trimmedNote = input.summaryNote.trim();
  if (trimmedNote.length === 0) {
    return {
      valid: false,
      error: 'Completion summary note is required',
    };
  }

  const submittedAt = input.now ?? new Date().toISOString();

  return {
    valid: true,
    targetStatus: 'PENDING_COMPLETION',
    payload: {
      bookingId: input.bookingId,
      photoProofUrls: input.photoProofUrls,
      summaryNote: trimmedNote,
      submittedAt,
    },
  };
}

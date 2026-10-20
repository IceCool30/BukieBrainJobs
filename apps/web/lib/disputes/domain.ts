// apps/web/lib/disputes/domain.ts
// BW-010: Dispute Handling & Support Interface
// Phase 1 GREEN: Pure Domain Logic Implementation

import type {
  DisputeInitiationInput,
  DisputeValidationResult,
  DisputeEvidenceValidationInput,
  DisputeSettlementEvaluationInput,
  DisputeSettlementBreakdown,
  DisputeStatus,
  DisputeAllowedMimeType,
} from './types';

export const MAX_EVIDENCE_ATTACHMENTS = 5;
export const MAX_EVIDENCE_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5,242,880 bytes (5MB)

export const ALLOWED_EVIDENCE_MIME_TYPES: readonly DisputeAllowedMimeType[] = [
  'image/jpeg',
  'image/png',
  'application/pdf',
];

export const DISPUTE_TRANSITIONS: Record<DisputeStatus, DisputeStatus[]> = {
  FILED: ['UNDER_REVIEW', 'CANCELLED'],
  UNDER_REVIEW: ['ACTION_REQUIRED', 'PROPOSAL_PENDING', 'CANCELLED'],
  ACTION_REQUIRED: ['UNDER_REVIEW', 'PROPOSAL_PENDING', 'CANCELLED'],
  PROPOSAL_PENDING: ['RESOLVED', 'UNDER_REVIEW', 'CANCELLED'],
  RESOLVED: [],
  CANCELLED: [],
};

export function validateDisputeInitiation(
  input: DisputeInitiationInput
): DisputeValidationResult {
  if (input.callerRole !== 'customer' && input.callerRole !== 'brainworker') {
    return {
      valid: false,
      error: 'Caller role must be customer or brainworker',
    };
  }

  if (input.bookingStatus === 'CANCELLED') {
    return {
      valid: false,
      error: 'Cannot initiate dispute on CANCELLED booking',
    };
  }

  if (
    input.bookingStatus !== 'IN_PROGRESS' &&
    input.bookingStatus !== 'PENDING_COMPLETION'
  ) {
    return {
      valid: false,
      error:
        'Disputes can only be initiated on IN_PROGRESS or PENDING_COMPLETION bookings',
    };
  }

  if (!input.description || input.description.trim().length === 0) {
    return {
      valid: false,
      error: 'Dispute description must not be empty',
    };
  }

  return { valid: true };
}

export function validateDisputeEvidence(
  input: DisputeEvidenceValidationInput
): DisputeValidationResult {
  const { evidenceList } = input;

  if (evidenceList.length > MAX_EVIDENCE_ATTACHMENTS) {
    return {
      valid: false,
      error: `Maximum ${MAX_EVIDENCE_ATTACHMENTS} evidence attachments allowed`,
    };
  }

  for (const item of evidenceList) {
    if (!ALLOWED_EVIDENCE_MIME_TYPES.includes(item.fileType)) {
      return {
        valid: false,
        error: `Unsupported evidence file type: ${item.fileType}`,
      };
    }

    if (item.sizeBytes > MAX_EVIDENCE_FILE_SIZE_BYTES) {
      return {
        valid: false,
        error: `Evidence file exceeds 5MB size limit: ${item.sizeBytes} bytes`,
      };
    }
  }

  return { valid: true };
}

export function evaluateDisputeSettlement(
  input: DisputeSettlementEvaluationInput
): DisputeSettlementBreakdown {
  const totalAmountKobo = Math.round(input.totalAmountKobo);

  if (input.resolutionType === 'FULL_REFUND_CUSTOMER') {
    return {
      totalAmountKobo,
      customerRefundKobo: totalAmountKobo,
      workerPayoutKobo: 0,
      platformFeeKobo: 0,
      serviceFeeKobo: 0,
      trustFeeKobo: 0,
      resolutionType: 'FULL_REFUND_CUSTOMER',
    };
  }

  if (input.resolutionType === 'FULL_PAYOUT_WORKER') {
    const serviceFeeKobo = Math.round(totalAmountKobo * 0.10);
    const trustFeeKobo = Math.round(totalAmountKobo * 0.075);
    const platformFeeKobo = serviceFeeKobo + trustFeeKobo;
    const workerPayoutKobo = totalAmountKobo - platformFeeKobo;

    return {
      totalAmountKobo,
      customerRefundKobo: 0,
      workerPayoutKobo,
      platformFeeKobo,
      serviceFeeKobo,
      trustFeeKobo,
      resolutionType: 'FULL_PAYOUT_WORKER',
    };
  }

  // SPLIT_SETTLEMENT or MUTUAL_CONCESSION
  const splitRatio = input.splitRatio !== undefined ? input.splitRatio : 0.50;
  const customerRefundKobo = Math.floor(totalAmountKobo * (1 - splitRatio));
  const workerGrossAllocation = totalAmountKobo - customerRefundKobo;

  const serviceFeeKobo = Math.round(workerGrossAllocation * 0.10);
  const trustFeeKobo = Math.round(workerGrossAllocation * 0.075);
  const platformFeeKobo = serviceFeeKobo + trustFeeKobo;
  const workerPayoutKobo = workerGrossAllocation - platformFeeKobo;

  return {
    totalAmountKobo,
    customerRefundKobo,
    workerPayoutKobo,
    platformFeeKobo,
    serviceFeeKobo,
    trustFeeKobo,
    resolutionType: input.resolutionType,
  };
}

export function canTransitionDispute(
  currentStatus: DisputeStatus,
  nextStatus: DisputeStatus
): boolean {
  return (DISPUTE_TRANSITIONS[currentStatus] ?? []).includes(nextStatus);
}

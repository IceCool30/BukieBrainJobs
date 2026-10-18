// apps/web/lib/completion/domain.test.ts
// BW-009: Post-Job Completion & Escrow Release
// Phase 1 RED: Domain Contracts (COMPL-001 to COMPL-010)

import { describe, expect, it } from 'vitest';
import {
  calculateCompletionSettlement,
  evaluateAutoReleaseWindow,
  evaluateMutualReviewVisibility,
  validateCustomerSatisfactionConfirmation,
  validateRatingSubmission,
} from './domain';
import type {
  AutoReleaseEvaluationInput,
  MutualRatingSubmissionInput,
  MutualReviewRecord,
  SatisfactionConfirmationInput,
} from './types';

describe('BW-009 Post-Job Completion & Escrow Release Domain Contracts (COMPL-001 to COMPL-010)', () => {
  it('COMPL-001: validateCustomerSatisfactionConfirmation validates satisfaction and derives transitions: jobStatus becomes COMPLETED and escrowStatus becomes ESCROW_RELEASED', () => {
    const input: SatisfactionConfirmationInput = {
      bookingId: 'bk-101',
      currentJobStatus: 'PENDING_COMPLETION',
      currentEscrowStatus: 'ESCROW_HELD',
      customerFeedbackNote: 'Job completed excellently',
    };

    const result = validateCustomerSatisfactionConfirmation(input);

    expect(result.eligible).toBe(true);
    expect(result.targetJobStatus).toBe('COMPLETED');
    expect(result.targetEscrowStatus).toBe('ESCROW_RELEASED');
    expect(result.confirmedAt).toBeDefined();
  });

  it('COMPL-002: validateCustomerSatisfactionConfirmation fails closed if jobStatus is not PENDING_COMPLETION', () => {
    const input: SatisfactionConfirmationInput = {
      bookingId: 'bk-101',
      currentJobStatus: 'IN_PROGRESS',
      currentEscrowStatus: 'ESCROW_HELD',
    };

    const result = validateCustomerSatisfactionConfirmation(input);

    expect(result.eligible).toBe(false);
    expect(result.error).toMatch(/job.*must be.*PENDING_COMPLETION/i);
    expect(result.targetJobStatus).toBeUndefined();
    expect(result.targetEscrowStatus).toBeUndefined();
  });

  it('COMPL-003: validateCustomerSatisfactionConfirmation fails closed if escrowStatus is not ESCROW_HELD', () => {
    const input: SatisfactionConfirmationInput = {
      bookingId: 'bk-101',
      currentJobStatus: 'PENDING_COMPLETION',
      currentEscrowStatus: 'ESCROW_RELEASED',
    };

    const result = validateCustomerSatisfactionConfirmation(input);

    expect(result.eligible).toBe(false);
    expect(result.error).toMatch(/escrow.*must be.*ESCROW_HELD/i);
  });

  it('COMPL-004: calculateCompletionSettlement enforces integer kobo settlement arithmetic with 90/10 split and zero rounding discrepancy', () => {
    const totalSettlementKobo = 5000000; // N50,000.00
    const result = calculateCompletionSettlement(totalSettlementKobo);

    expect(result.totalSettlementKobo).toBe(5000000);
    expect(result.taskerPayoutKobo).toBe(4500000); // 90%
    expect(result.platformFeeKobo).toBe(500000); // 10%
    expect(result.platformFeeBps).toBe(1000);
    expect(result.taskerPayoutKobo + result.platformFeeKobo).toBe(
      totalSettlementKobo
    );

    // Verify odd-amount kobo distribution preserves exact sum
    const oddTotalKobo = 5000001;
    const oddResult = calculateCompletionSettlement(oddTotalKobo);
    expect(oddResult.taskerPayoutKobo + oddResult.platformFeeKobo).toBe(
      oddTotalKobo
    );
  });

  it('COMPL-005: evaluateAutoReleaseWindow returns isEligible: false with exact remaining milliseconds when elapsed time is under 72 hours', () => {
    const submittedAt = '2026-10-18T10:00:00.000Z';
    const now = '2026-10-19T10:00:00.000Z'; // 24 hours elapsed

    const input: AutoReleaseEvaluationInput = {
      submittedAt,
      currentEscrowStatus: 'ESCROW_HELD',
      now,
    };

    const result = evaluateAutoReleaseWindow(input);

    expect(result.isEligible).toBe(false);
    expect(result.elapsedMs).toBe(86400000); // 24 hours in ms
    expect(result.remainingMs).toBe(172800000); // 48 hours remaining
    expect(result.autoReleaseDeadline).toBe('2026-10-21T10:00:00.000Z');
  });

  it('COMPL-006: evaluateAutoReleaseWindow returns isEligible: true when elapsed time reaches or exceeds 72 hours (259,200,000 ms)', () => {
    const submittedAt = '2026-10-18T10:00:00.000Z';
    const now = '2026-10-21T10:00:00.000Z'; // Exactly 72 hours elapsed

    const input: AutoReleaseEvaluationInput = {
      submittedAt,
      currentEscrowStatus: 'ESCROW_HELD',
      now,
    };

    const result = evaluateAutoReleaseWindow(input);

    expect(result.isEligible).toBe(true);
    expect(result.elapsedMs).toBe(259200000);
    expect(result.remainingMs).toBe(0);
  });

  it('COMPL-007: evaluateAutoReleaseWindow is strictly blocked if a dispute is active (isDisputed: true)', () => {
    const submittedAt = '2026-10-18T10:00:00.000Z';
    const now = '2026-10-22T10:00:00.000Z'; // 96 hours elapsed

    const input: AutoReleaseEvaluationInput = {
      submittedAt,
      currentEscrowStatus: 'DISPUTED',
      isDisputed: true,
      now,
    };

    const result = evaluateAutoReleaseWindow(input);

    expect(result.isEligible).toBe(false);
    expect(result.error).toMatch(/dispute.*blocked/i);
  });

  it('COMPL-008: evaluateMutualReviewVisibility keeps ratings locked and masked when only one party has submitted their review', () => {
    const customerReview: MutualReviewRecord = {
      reviewId: 'rev-c-1',
      bookingId: 'bk-101',
      reviewerId: 'cust-101',
      reviewerRole: 'customer',
      ratings: {
        punctuality: 5,
        quality: 5,
        communication: 5,
        overall: 5,
        comment: 'Great work',
      },
      submittedAt: '2026-10-18T11:00:00.000Z',
    };

    const result = evaluateMutualReviewVisibility(customerReview, null);

    expect(result.isRevealed).toBe(false);
    expect(result.customerReviewVisible).toBe(false);
    expect(result.workerReviewVisible).toBe(false);
    expect(result.status).toBe('AWAITING_WORKER');
  });

  it('COMPL-009: evaluateMutualReviewVisibility unlocks and reveals reviews when both parties have submitted their ratings', () => {
    const customerReview: MutualReviewRecord = {
      reviewId: 'rev-c-1',
      bookingId: 'bk-101',
      reviewerId: 'cust-101',
      reviewerRole: 'customer',
      ratings: {
        punctuality: 5,
        quality: 5,
        communication: 5,
        overall: 5,
        comment: 'Great work',
      },
      submittedAt: '2026-10-18T11:00:00.000Z',
    };

    const workerReview: MutualReviewRecord = {
      reviewId: 'rev-w-1',
      bookingId: 'bk-101',
      reviewerId: 'work-202',
      reviewerRole: 'brainworker',
      ratings: {
        punctuality: 5,
        quality: 5,
        communication: 5,
        overall: 5,
        comment: 'Respectful and clear customer',
      },
      submittedAt: '2026-10-18T11:30:00.000Z',
    };

    const result = evaluateMutualReviewVisibility(customerReview, workerReview);

    expect(result.isRevealed).toBe(true);
    expect(result.customerReviewVisible).toBe(true);
    expect(result.workerReviewVisible).toBe(true);
    expect(result.status).toBe('MUTUAL_REVEALED');
    expect(result.customerReview).toEqual(customerReview);
    expect(result.workerReview).toEqual(workerReview);
  });

  it('COMPL-010: validateRatingSubmission enforces integer star ratings between 1 and 5 across all criteria', () => {
    const validRatings: MutualRatingSubmissionInput = {
      punctuality: 5,
      quality: 4,
      communication: 5,
      overall: 5,
      comment: 'Very professional artisan',
    };

    expect(validateRatingSubmission(validRatings)).toEqual({ valid: true });

    // Invalid star rating: out of range (greater than 5)
    expect(
      validateRatingSubmission({
        ...validRatings,
        quality: 6,
      }).valid
    ).toBe(false);

    // Invalid star rating: out of range (less than 1)
    expect(
      validateRatingSubmission({
        ...validRatings,
        punctuality: 0,
      }).valid
    ).toBe(false);

    // Invalid star rating: non-integer
    expect(
      validateRatingSubmission({
        ...validRatings,
        communication: 4.5,
      }).valid
    ).toBe(false);

    // Missing criteria
    expect(
      validateRatingSubmission({
        punctuality: 5,
      }).valid
    ).toBe(false);
  });
});

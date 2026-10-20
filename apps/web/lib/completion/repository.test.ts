// apps/web/lib/completion/repository.test.ts
// BW-009: Post-Job Completion & Escrow Release
// Phase 2 RED: Repository Contracts REP-001 through REP-010

import { beforeEach, describe, expect, it } from 'vitest';
import { evaluateMutualReviewVisibility } from './domain';
import { InMemoryCompletionRepository } from './repository';
import {
  CompletionLifecycleError,
  DisputeActiveError,
  DuplicateReviewError,
  UnauthorizedCompletionError,
} from './types';
import type {
  MutualRatingSubmissionInput,
  PostJobCompletionState,
} from './types';

function createMockState(
  overrides?: Partial<PostJobCompletionState>
): PostJobCompletionState {
  const totalSettlementKobo = 5000000;
  return {
    bookingId: 'bk_completion_001',
    customerId: 'cust_001',
    brainWorkerId: 'work_001',
    jobStatus: 'PENDING_COMPLETION',
    escrowStatus: 'ESCROW_HELD',
    baseQuoteKobo: 5000000,
    approvedAdjustmentKobo: 0,
    totalSettlementKobo,
    settlementBreakdown: {
      totalSettlementKobo,
      taskerPayoutKobo: 4500000,
      platformFeeKobo: 500000,
      platformFeeBps: 1000,
    },
    completionSubmittedAt: '2026-10-18T10:00:00.000Z',
    autoReleaseDeadline: '2026-10-21T10:00:00.000Z',
    isDisputed: false,
    ...overrides,
  };
}

describe('BW-009 Phase 2 RED: Completion Repository Contracts (REP-001 to REP-010)', () => {
  let repository: InMemoryCompletionRepository;

  beforeEach(() => {
    repository = new InMemoryCompletionRepository();
  });

  it('REP-001: getCompletionState returns seeded state for an existing booking, or null when not found', async () => {
    const unknown = await repository.getCompletionState('unknown_booking');
    expect(unknown).toBeNull();

    const initial = createMockState();
    repository.seed([initial]);

    const loaded = await repository.getCompletionState('bk_completion_001');
    expect(loaded).toEqual(initial);
  });

  it('REP-002: confirmSatisfaction transitions jobStatus to COMPLETED and escrowStatus to ESCROW_RELEASED, updating customerConfirmedAt', async () => {
    const initial = createMockState({
      jobStatus: 'PENDING_COMPLETION',
      escrowStatus: 'ESCROW_HELD',
    });
    repository.seed([initial]);

    const updated = await repository.confirmSatisfaction(
      'bk_completion_001',
      'cust_001',
      'Work inspected and thoroughly satisfied'
    );

    expect(updated.jobStatus).toBe('COMPLETED');
    expect(updated.escrowStatus).toBe('ESCROW_RELEASED');
    expect(updated.customerConfirmedAt).toBeDefined();
    expect(updated.customerFeedbackNote).toBe(
      'Work inspected and thoroughly satisfied'
    );

    const reloaded = await repository.getCompletionState('bk_completion_001');
    expect(reloaded?.jobStatus).toBe('COMPLETED');
    expect(reloaded?.escrowStatus).toBe('ESCROW_RELEASED');
  });

  it('REP-003: confirmSatisfaction fails closed if caller is not the authoritative customer for the booking', async () => {
    const initial = createMockState({
      customerId: 'cust_001',
      jobStatus: 'PENDING_COMPLETION',
      escrowStatus: 'ESCROW_HELD',
    });
    repository.seed([initial]);

    await expect(
      repository.confirmSatisfaction(
        'bk_completion_001',
        'unauthorized_user_999',
        'Unauthorized confirmation attempt'
      )
    ).rejects.toThrow(UnauthorizedCompletionError);

    // State remains untouched
    const untouched = await repository.getCompletionState('bk_completion_001');
    expect(untouched?.jobStatus).toBe('PENDING_COMPLETION');
    expect(untouched?.escrowStatus).toBe('ESCROW_HELD');
  });

  it('REP-004: confirmSatisfaction fails closed if jobStatus is not PENDING_COMPLETION or escrowStatus is not ESCROW_HELD', async () => {
    const invalidJob = createMockState({
      jobStatus: 'IN_PROGRESS',
      escrowStatus: 'ESCROW_HELD',
    });
    repository.seed([invalidJob]);

    await expect(
      repository.confirmSatisfaction('bk_completion_001', 'cust_001')
    ).rejects.toThrow(CompletionLifecycleError);

    const invalidEscrow = createMockState({
      jobStatus: 'PENDING_COMPLETION',
      escrowStatus: 'ESCROW_RELEASED',
    });
    repository.seed([invalidEscrow]);

    await expect(
      repository.confirmSatisfaction('bk_completion_001', 'cust_001')
    ).rejects.toThrow(CompletionLifecycleError);
  });

  it('REP-005: triggerAutoRelease successfully completes job and releases escrow when elapsed time is greater than or equal to 72 hours', async () => {
    const submittedAt = '2026-10-18T10:00:00.000Z';
    const nowAfter72h = '2026-10-21T10:00:00.000Z'; // Exactly 72 hours

    const initial = createMockState({
      completionSubmittedAt: submittedAt,
      jobStatus: 'PENDING_COMPLETION',
      escrowStatus: 'ESCROW_HELD',
    });
    repository.seed([initial]);

    const updated = await repository.triggerAutoRelease(
      'bk_completion_001',
      nowAfter72h
    );

    expect(updated.jobStatus).toBe('COMPLETED');
    expect(updated.escrowStatus).toBe('ESCROW_RELEASED');
  });

  it('REP-006: triggerAutoRelease rejects when under 72 hours', async () => {
    const submittedAt = '2026-10-18T10:00:00.000Z';
    const nowUnder72h = '2026-10-19T10:00:00.000Z'; // Only 24 hours elapsed

    const initial = createMockState({
      completionSubmittedAt: submittedAt,
      jobStatus: 'PENDING_COMPLETION',
      escrowStatus: 'ESCROW_HELD',
    });
    repository.seed([initial]);

    await expect(
      repository.triggerAutoRelease('bk_completion_001', nowUnder72h)
    ).rejects.toThrow(CompletionLifecycleError);
  });

  it('REP-007: raiseDispute transitions escrowStatus to DISPUTED, sets isDisputed: true, and prevents auto-release', async () => {
    const initial = createMockState({
      jobStatus: 'PENDING_COMPLETION',
      escrowStatus: 'ESCROW_HELD',
      isDisputed: false,
    });
    repository.seed([initial]);

    const updated = await repository.raiseDispute(
      'bk_completion_001',
      'cust_001',
      'Work was not finished to specification'
    );

    expect(updated.isDisputed).toBe(true);
    expect(updated.escrowStatus).toBe('DISPUTED');
    expect(updated.disputeReason).toBe('Work was not finished to specification');
    expect(updated.disputeRaisedBy).toBe('cust_001');

    // Subsequent auto-release must fail closed
    await expect(
      repository.triggerAutoRelease(
        'bk_completion_001',
        '2026-10-25T10:00:00.000Z'
      )
    ).rejects.toThrow(DisputeActiveError);
  });

  it('REP-008: submitReview stores review and masks mutual visibility when only one party has submitted', async () => {
    const initial = createMockState();
    repository.seed([initial]);

    const ratings: MutualRatingSubmissionInput = {
      punctuality: 5,
      quality: 5,
      communication: 5,
      overall: 5,
      comment: 'Arrived promptly and did great work',
    };

    const state = await repository.submitReview(
      'bk_completion_001',
      'cust_001',
      'customer',
      ratings
    );

    expect(state.customerReview).toBeDefined();
    expect(state.customerReview?.ratings.overall).toBe(5);
    expect(state.workerReview).toBeUndefined();

    const visibility = evaluateMutualReviewVisibility(
      state.customerReview,
      state.workerReview
    );
    expect(visibility.isRevealed).toBe(false);
    expect(visibility.status).toBe('AWAITING_WORKER');
  });

  it('REP-009: submitReview unlocks both reviews when both customer and brainworker reviews are submitted', async () => {
    const initial = createMockState();
    repository.seed([initial]);

    const customerRatings: MutualRatingSubmissionInput = {
      punctuality: 5,
      quality: 5,
      communication: 5,
      overall: 5,
      comment: 'Great craftsmanship',
    };

    await repository.submitReview(
      'bk_completion_001',
      'cust_001',
      'customer',
      customerRatings
    );

    const workerRatings: MutualRatingSubmissionInput = {
      punctuality: 5,
      quality: 4,
      communication: 5,
      overall: 5,
      comment: 'Client was prepared and cooperative',
    };

    const state = await repository.submitReview(
      'bk_completion_001',
      'work_001',
      'brainworker',
      workerRatings
    );

    expect(state.customerReview).toBeDefined();
    expect(state.workerReview).toBeDefined();

    const visibility = evaluateMutualReviewVisibility(
      state.customerReview,
      state.workerReview
    );
    expect(visibility.isRevealed).toBe(true);
    expect(visibility.status).toBe('MUTUAL_REVEALED');
    expect(visibility.customerReview?.ratings.overall).toBe(5);
    expect(visibility.workerReview?.ratings.overall).toBe(5);
  });

  it('REP-010: submitReview rejects duplicate review submissions from the same party on the same booking', async () => {
    const initial = createMockState();
    repository.seed([initial]);

    const ratings: MutualRatingSubmissionInput = {
      punctuality: 5,
      quality: 5,
      communication: 5,
      overall: 5,
    };

    await repository.submitReview(
      'bk_completion_001',
      'cust_001',
      'customer',
      ratings
    );

    await expect(
      repository.submitReview(
        'bk_completion_001',
        'cust_001',
        'customer',
        ratings
      )
    ).rejects.toThrow(DuplicateReviewError);
  });
});

// apps/web/lib/completion/repository.ts
// BW-009: Post-Job Completion & Escrow Release
// Phase 2 GREEN: In-Memory Completion Repository Implementation

import {
  evaluateAutoReleaseWindow,
  validateCustomerSatisfactionConfirmation,
  validateRatingSubmission,
} from './domain';
import {
  CompletionLifecycleError,
  CompletionNotFoundError,
  DisputeActiveError,
  DuplicateReviewError,
  UnauthorizedCompletionError,
} from './types';
import type {
  ICompletionRepository,
  MutualRatingSubmissionInput,
  MutualReviewRecord,
  PostJobCompletionState,
} from './types';

export class InMemoryCompletionRepository implements ICompletionRepository {
  private readonly records = new Map<string, PostJobCompletionState>();

  private clone<T>(val: T): T {
    return JSON.parse(JSON.stringify(val)) as T;
  }

  async getCompletionState(
    bookingId: string
  ): Promise<PostJobCompletionState | null> {
    const record = this.records.get(bookingId);
    if (!record) {
      return null;
    }
    return this.clone(record);
  }

  async confirmSatisfaction(
    bookingId: string,
    customerId: string,
    feedbackNote?: string
  ): Promise<PostJobCompletionState> {
    const record = this.records.get(bookingId);
    if (!record) {
      throw new CompletionNotFoundError(bookingId);
    }

    if (record.customerId !== customerId) {
      throw new UnauthorizedCompletionError(
        `User ${customerId} is not authorized to confirm satisfaction for booking ${bookingId}`
      );
    }

    const validation = validateCustomerSatisfactionConfirmation({
      bookingId,
      currentJobStatus: record.jobStatus,
      currentEscrowStatus: record.escrowStatus,
      customerFeedbackNote: feedbackNote,
    });

    if (!validation.eligible) {
      throw new CompletionLifecycleError(
        validation.error ?? 'Cannot confirm satisfaction in current lifecycle state'
      );
    }

    record.jobStatus = validation.targetJobStatus ?? 'COMPLETED';
    record.escrowStatus = validation.targetEscrowStatus ?? 'ESCROW_RELEASED';
    record.customerConfirmedAt =
      validation.confirmedAt ?? new Date().toISOString();
    if (feedbackNote) {
      record.customerFeedbackNote = feedbackNote;
    }

    this.records.set(bookingId, this.clone(record));
    return this.clone(record);
  }

  async triggerAutoRelease(
    bookingId: string,
    now?: string
  ): Promise<PostJobCompletionState> {
    const record = this.records.get(bookingId);
    if (!record) {
      throw new CompletionNotFoundError(bookingId);
    }

    if (record.isDisputed || record.escrowStatus === 'DISPUTED') {
      throw new DisputeActiveError('Auto-release blocked due to active dispute');
    }

    const evaluation = evaluateAutoReleaseWindow({
      submittedAt: record.completionSubmittedAt,
      currentEscrowStatus: record.escrowStatus,
      isDisputed: record.isDisputed,
      now,
    });

    if (!evaluation.isEligible) {
      throw new CompletionLifecycleError(
        evaluation.error ?? 'Auto-release window of 72 hours has not elapsed'
      );
    }

    record.jobStatus = 'COMPLETED';
    record.escrowStatus = 'ESCROW_RELEASED';

    this.records.set(bookingId, this.clone(record));
    return this.clone(record);
  }

  async raiseDispute(
    bookingId: string,
    raisedByUserId: string,
    reason: string
  ): Promise<PostJobCompletionState> {
    const record = this.records.get(bookingId);
    if (!record) {
      throw new CompletionNotFoundError(bookingId);
    }

    record.isDisputed = true;
    record.escrowStatus = 'DISPUTED';
    record.disputeReason = reason;
    record.disputeRaisedBy = raisedByUserId;

    this.records.set(bookingId, this.clone(record));
    return this.clone(record);
  }

  async submitReview(
    bookingId: string,
    reviewerId: string,
    role: 'customer' | 'brainworker',
    ratings: MutualRatingSubmissionInput
  ): Promise<PostJobCompletionState> {
    const record = this.records.get(bookingId);
    if (!record) {
      throw new CompletionNotFoundError(bookingId);
    }

    const validation = validateRatingSubmission(ratings);
    if (!validation.valid) {
      throw new Error(validation.error ?? 'Invalid ratings submission');
    }

    if (role === 'customer' && record.customerReview) {
      throw new DuplicateReviewError(
        'Customer review already submitted for this booking'
      );
    }

    if (role === 'brainworker' && record.workerReview) {
      throw new DuplicateReviewError(
        'BrainWorker review already submitted for this booking'
      );
    }

    const reviewRecord: MutualReviewRecord = {
      reviewId: `rev_${role}_${Date.now()}`,
      bookingId,
      reviewerId,
      reviewerRole: role,
      ratings: this.clone(ratings),
      submittedAt: new Date().toISOString(),
    };

    if (role === 'customer') {
      record.customerReview = reviewRecord;
    } else {
      record.workerReview = reviewRecord;
    }

    this.records.set(bookingId, this.clone(record));
    return this.clone(record);
  }

  seed(records: PostJobCompletionState[]): void {
    for (const record of records) {
      this.records.set(record.bookingId, this.clone(record));
    }
  }

  clear(): void {
    this.records.clear();
  }
}

let singletonRepository: InMemoryCompletionRepository | null = null;

export function getCompletionRepository(): InMemoryCompletionRepository {
  if (!singletonRepository) {
    singletonRepository = new InMemoryCompletionRepository();
  }
  return singletonRepository;
}

export function resetCompletionRepository(): void {
  singletonRepository = null;
}

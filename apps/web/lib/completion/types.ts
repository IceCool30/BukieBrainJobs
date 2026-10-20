// apps/web/lib/completion/types.ts
// BW-009: Post-Job Completion & Escrow Release
// Domain Type Definitions and Repository Contracts

import type { JobStatus } from '@bukiebrainjobs/api-types';

export type CompletionEscrowStatus =
  | 'ESCROW_HELD'
  | 'ESCROW_RELEASED'
  | 'AUTO_RELEASE_ELIGIBLE'
  | 'DISPUTED';

export interface SatisfactionConfirmationInput {
  bookingId: string;
  currentJobStatus: JobStatus;
  currentEscrowStatus: CompletionEscrowStatus;
  confirmedAt?: string | undefined;
  customerFeedbackNote?: string | undefined;
}

export interface SatisfactionConfirmationResult {
  eligible: boolean;
  error?: string | undefined;
  targetJobStatus?: JobStatus | undefined;
  targetEscrowStatus?: CompletionEscrowStatus | undefined;
  confirmedAt?: string | undefined;
}

export interface CompletionSettlementBreakdown {
  totalSettlementKobo: number;
  taskerPayoutKobo: number;
  platformFeeKobo: number;
  platformFeeBps: number;
}

export interface AutoReleaseEvaluationInput {
  submittedAt: string;
  currentEscrowStatus: CompletionEscrowStatus;
  isDisputed?: boolean | undefined;
  now?: string | undefined;
}

export interface AutoReleaseEvaluationResult {
  isEligible: boolean;
  elapsedMs: number;
  remainingMs: number;
  autoReleaseDeadline: string;
  error?: string | undefined;
}

export interface MutualRatingSubmissionInput {
  punctuality: number;
  quality: number;
  communication: number;
  overall: number;
  comment?: string | undefined;
}

export interface RatingValidationResult {
  valid: boolean;
  error?: string | undefined;
}

export interface MutualReviewRecord {
  reviewId: string;
  bookingId: string;
  reviewerId: string;
  reviewerRole: 'customer' | 'brainworker';
  ratings: MutualRatingSubmissionInput;
  submittedAt: string;
}

export type MutualReviewStatus =
  | 'AWAITING_BOTH'
  | 'AWAITING_CUSTOMER'
  | 'AWAITING_WORKER'
  | 'MUTUAL_REVEALED';

export interface ReviewVisibilityEvaluation {
  isRevealed: boolean;
  customerReviewVisible: boolean;
  workerReviewVisible: boolean;
  customerReview: MutualReviewRecord | null;
  workerReview: MutualReviewRecord | null;
  status: MutualReviewStatus;
}

export interface PostJobCompletionState {
  bookingId: string;
  customerId: string;
  brainWorkerId: string;
  jobStatus: JobStatus;
  escrowStatus: CompletionEscrowStatus;
  baseQuoteKobo: number;
  approvedAdjustmentKobo: number;
  totalSettlementKobo: number;
  settlementBreakdown: CompletionSettlementBreakdown;
  completionSubmittedAt: string;
  customerConfirmedAt?: string | undefined;
  customerFeedbackNote?: string | undefined;
  autoReleaseDeadline: string;
  isDisputed: boolean;
  disputeReason?: string | undefined;
  disputeRaisedBy?: string | undefined;
  customerReview?: MutualReviewRecord | undefined;
  workerReview?: MutualReviewRecord | undefined;
}

// Domain Error Classes
export class CompletionNotFoundError extends Error {
  constructor(bookingId: string) {
    super(`Completion record not found for booking: ${bookingId}`);
    this.name = 'CompletionNotFoundError';
  }
}

export class UnauthorizedCompletionError extends Error {
  constructor(message = 'Unauthorized completion action') {
    super(message);
    this.name = 'UnauthorizedCompletionError';
  }
}

export class CompletionLifecycleError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CompletionLifecycleError';
  }
}

export class DuplicateReviewError extends Error {
  constructor(
    message = 'Review already submitted by this party for this booking'
  ) {
    super(message);
    this.name = 'DuplicateReviewError';
  }
}

export class DisputeActiveError extends Error {
  constructor(message = 'Action blocked due to active dispute') {
    super(message);
    this.name = 'DisputeActiveError';
  }
}

// Repository Interface
export interface ICompletionRepository {
  getCompletionState(bookingId: string): Promise<PostJobCompletionState | null>;
  confirmSatisfaction(
    bookingId: string,
    customerId: string,
    feedbackNote?: string
  ): Promise<PostJobCompletionState>;
  triggerAutoRelease(
    bookingId: string,
    now?: string
  ): Promise<PostJobCompletionState>;
  raiseDispute(
    bookingId: string,
    raisedByUserId: string,
    reason: string
  ): Promise<PostJobCompletionState>;
  submitReview(
    bookingId: string,
    reviewerId: string,
    role: 'customer' | 'brainworker',
    ratings: MutualRatingSubmissionInput
  ): Promise<PostJobCompletionState>;
  seed(records: PostJobCompletionState[]): void;
  clear(): void;
}

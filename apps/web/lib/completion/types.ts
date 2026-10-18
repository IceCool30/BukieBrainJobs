// apps/web/lib/completion/types.ts
// BW-009: Post-Job Completion & Escrow Release
// Domain Type Definitions

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
  jobStatus: JobStatus;
  escrowStatus: CompletionEscrowStatus;
  baseQuoteKobo: number;
  approvedAdjustmentKobo: number;
  totalSettlementKobo: number;
  settlementBreakdown: CompletionSettlementBreakdown;
  completionSubmittedAt: string;
  customerConfirmedAt?: string | undefined;
  autoReleaseDeadline: string;
  isDisputed: boolean;
  customerReview?: MutualReviewRecord | undefined;
  workerReview?: MutualReviewRecord | undefined;
}

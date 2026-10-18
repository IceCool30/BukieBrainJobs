// apps/web/lib/onsite/repository.ts
// BW-008: On-Site Work & In-Progress Verification
// Phase 2 Repository Interface and In-Memory Implementation (RED Stubs)

import type {
  CheckInSnapshot,
  CheckInEligibilityResult,
  ScopeAdjustmentInput,
  ScopeAdjustmentValidationResult,
  ScopeAdjustmentDecision,
  ScopeAdjustmentEvaluationResult,
  CompletionSubmissionInput,
  CompletionValidationResult,
  OnSiteVerificationState,
} from './types';

export interface IOnSiteRepository {
  getOnSiteState(bookingId: string): Promise<OnSiteVerificationState | null>;
  initOnSiteState(state: OnSiteVerificationState): Promise<void>;
  recordCheckIn(
    bookingId: string,
    snapshot: CheckInSnapshot,
    now?: string | undefined
  ): Promise<CheckInEligibilityResult>;
  submitScopeAdjustment(
    input: Omit<
      ScopeAdjustmentInput,
      'currentJobStatus' | 'hasActivePendingAdjustment'
    >
  ): Promise<ScopeAdjustmentValidationResult>;
  respondToScopeAdjustment(
    bookingId: string,
    adjustmentId: string,
    decision: ScopeAdjustmentDecision,
    rejectionReason?: string | undefined,
    reviewedAt?: string | undefined
  ): Promise<ScopeAdjustmentEvaluationResult>;
  submitCompletion(
    input: Omit<
      CompletionSubmissionInput,
      'currentJobStatus' | 'hasPendingScopeAdjustment'
    >
  ): Promise<CompletionValidationResult>;
}

export class InMemoryOnSiteRepository implements IOnSiteRepository {
  async getOnSiteState(
    _bookingId: string
  ): Promise<OnSiteVerificationState | null> {
    throw new Error('Not implemented: Phase 2 RED stub');
  }

  async initOnSiteState(_state: OnSiteVerificationState): Promise<void> {
    throw new Error('Not implemented: Phase 2 RED stub');
  }

  async recordCheckIn(
    _bookingId: string,
    _snapshot: CheckInSnapshot,
    _now?: string | undefined
  ): Promise<CheckInEligibilityResult> {
    throw new Error('Not implemented: Phase 2 RED stub');
  }

  async submitScopeAdjustment(
    _input: Omit<
      ScopeAdjustmentInput,
      'currentJobStatus' | 'hasActivePendingAdjustment'
    >
  ): Promise<ScopeAdjustmentValidationResult> {
    throw new Error('Not implemented: Phase 2 RED stub');
  }

  async respondToScopeAdjustment(
    _bookingId: string,
    _adjustmentId: string,
    _decision: ScopeAdjustmentDecision,
    _rejectionReason?: string | undefined,
    _reviewedAt?: string | undefined
  ): Promise<ScopeAdjustmentEvaluationResult> {
    throw new Error('Not implemented: Phase 2 RED stub');
  }

  async submitCompletion(
    _input: Omit<
      CompletionSubmissionInput,
      'currentJobStatus' | 'hasPendingScopeAdjustment'
    >
  ): Promise<CompletionValidationResult> {
    throw new Error('Not implemented: Phase 2 RED stub');
  }
}

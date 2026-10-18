// apps/web/lib/onsite/repository.ts
// BW-008: On-Site Work & In-Progress Verification
// Phase 2 Repository Interface and In-Memory Implementation (GREEN)

import {
  validateCheckInEligibility,
  validateScopeAdjustmentRequest,
  evaluateScopeAdjustmentResponse,
  validateCompletionSubmission,
} from './domain';
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
  private readonly states = new Map<string, OnSiteVerificationState>();

  private clone<T>(val: T): T {
    return JSON.parse(JSON.stringify(val)) as T;
  }

  async getOnSiteState(
    bookingId: string
  ): Promise<OnSiteVerificationState | null> {
    const state = this.states.get(bookingId);
    if (!state) {
      return null;
    }
    return this.clone(state);
  }

  async initOnSiteState(state: OnSiteVerificationState): Promise<void> {
    this.states.set(state.bookingId, this.clone(state));
  }

  async recordCheckIn(
    bookingId: string,
    snapshot: CheckInSnapshot,
    now?: string | undefined
  ): Promise<CheckInEligibilityResult> {
    const state = this.states.get(bookingId);
    if (!state) {
      return {
        eligible: false,
        error: 'Booking not found',
      };
    }

    const result = validateCheckInEligibility(
      {
        jobStatus: state.jobStatus,
        escrowStatus: state.escrowStatus,
        snapshot,
      },
      now
    );

    if (result.eligible) {
      state.jobStatus = 'IN_PROGRESS';
      state.checkedInAt = result.checkedInAt;
      state.checkInSnapshot = this.clone(snapshot);
      this.states.set(bookingId, state);
    }

    return result;
  }

  async submitScopeAdjustment(
    input: Omit<
      ScopeAdjustmentInput,
      'currentJobStatus' | 'hasActivePendingAdjustment'
    >
  ): Promise<ScopeAdjustmentValidationResult> {
    const state = this.states.get(input.bookingId);
    if (!state) {
      return {
        valid: false,
        error: 'Booking not found',
      };
    }

    const hasActivePendingAdjustment =
      state.activeScopeAdjustment != null &&
      state.activeScopeAdjustment.status === 'PENDING';

    const validation = validateScopeAdjustmentRequest({
      ...input,
      currentJobStatus: state.jobStatus,
      hasActivePendingAdjustment,
    });

    if (validation.valid && validation.request) {
      const clonedRequest = this.clone(validation.request);
      state.activeScopeAdjustment = clonedRequest;
      state.scopeAdjustments.push(clonedRequest);
      this.states.set(input.bookingId, state);
    }

    return validation;
  }

  async respondToScopeAdjustment(
    bookingId: string,
    adjustmentId: string,
    decision: ScopeAdjustmentDecision,
    rejectionReason?: string | undefined,
    reviewedAt?: string | undefined
  ): Promise<ScopeAdjustmentEvaluationResult> {
    const state = this.states.get(bookingId);
    if (!state) {
      throw new Error(`Booking ${bookingId} not found`);
    }

    const adjIndex = state.scopeAdjustments.findIndex(
      (a) => a.id === adjustmentId
    );
    if (adjIndex === -1) {
      throw new Error(`Adjustment ${adjustmentId} not found`);
    }

    const targetAdj = state.scopeAdjustments[adjIndex]!;
    if (targetAdj.status !== 'PENDING') {
      throw new Error(`Adjustment ${adjustmentId} is not in PENDING status`);
    }

    const evaluation = evaluateScopeAdjustmentResponse({
      request: targetAdj,
      decision,
      baseQuoteKobo: state.baseQuoteKobo,
      ...(reviewedAt != null ? { reviewedAt } : {}),
      ...(rejectionReason != null ? { rejectionReason } : {}),
    });

    state.scopeAdjustments[adjIndex] = this.clone(evaluation.updatedRequest);

    if (state.activeScopeAdjustment?.id === adjustmentId) {
      delete state.activeScopeAdjustment;
    }

    state.approvedAdjustmentKobo = evaluation.approvedAdjustmentKobo;
    state.totalSettlementKobo = evaluation.totalSettlementKobo;
    this.states.set(bookingId, state);

    return evaluation;
  }

  async submitCompletion(
    input: Omit<
      CompletionSubmissionInput,
      'currentJobStatus' | 'hasPendingScopeAdjustment'
    >
  ): Promise<CompletionValidationResult> {
    const state = this.states.get(input.bookingId);
    if (!state) {
      return {
        valid: false,
        error: 'Booking not found',
      };
    }

    const hasPendingScopeAdjustment =
      (state.activeScopeAdjustment != null &&
        state.activeScopeAdjustment.status === 'PENDING') ||
      state.scopeAdjustments.some((a) => a.status === 'PENDING');

    const validation = validateCompletionSubmission({
      ...input,
      currentJobStatus: state.jobStatus,
      hasPendingScopeAdjustment,
    });

    if (validation.valid && validation.payload) {
      state.jobStatus = 'PENDING_COMPLETION';
      state.completionSubmission = this.clone(validation.payload);
      state.completedAt = validation.payload.submittedAt;
      this.states.set(input.bookingId, state);
    }

    return validation;
  }
}

let singletonRepository: InMemoryOnSiteRepository | null = null;

export function getOnSiteRepository(): InMemoryOnSiteRepository {
  if (!singletonRepository) {
    singletonRepository = new InMemoryOnSiteRepository();
  }
  return singletonRepository;
}

export function resetOnSiteRepository(): void {
  singletonRepository = null;
}


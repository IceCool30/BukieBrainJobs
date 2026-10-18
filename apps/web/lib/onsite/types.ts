// apps/web/lib/onsite/types.ts
// BW-008: On-Site Work & In-Progress Verification
// Phase 1 Domain Types and Invariants

import type { JobStatus } from '@bukiebrainjobs/api-types';

export type OnSiteEscrowStatus =
  | 'ESCROW_HELD'
  | 'UNFUNDED'
  | 'RELEASED'
  | 'DISPUTED';

export interface GeoCoordinates {
  latitude: number;
  longitude: number;
  accuracyMeters?: number | undefined;
}

export interface CheckInSnapshot {
  coordinates?: GeoCoordinates | undefined;
  landmarkConfirmation?: string | undefined;
  capturedAt: string;
  deviceInfo?: string | undefined;
}

export interface CheckInEligibilityInput {
  jobStatus: JobStatus;
  escrowStatus: OnSiteEscrowStatus;
  snapshot?: CheckInSnapshot | null | undefined;
}

export interface CheckInEligibilityResult {
  eligible: boolean;
  error?: string | undefined;
  targetStatus?: 'IN_PROGRESS' | undefined;
  checkedInAt?: string | undefined;
}

export type ScopeAdjustmentReasonCategory =
  | 'ADDITIONAL_PARTS'
  | 'ADDITIONAL_LABOR'
  | 'BOTH';

export type ScopeAdjustmentStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type ScopeAdjustmentDecision = 'APPROVE' | 'DECLINE';

export interface ScopeAdjustmentRequest {
  id: string;
  bookingId: string;
  category: ScopeAdjustmentReasonCategory;
  description: string;
  additionalLaborKobo: number;
  additionalMaterialsKobo: number;
  totalAdditionalKobo: number;
  status: ScopeAdjustmentStatus;
  requestedAt: string;
  reviewedAt?: string | undefined;
  rejectionReason?: string | undefined;
}

export interface ScopeAdjustmentInput {
  bookingId: string;
  currentJobStatus: JobStatus;
  category: ScopeAdjustmentReasonCategory;
  description: string;
  additionalLaborKobo: number;
  additionalMaterialsKobo: number;
  hasActivePendingAdjustment?: boolean | undefined;
  now?: string | undefined;
}

export interface ScopeAdjustmentValidationResult {
  valid: boolean;
  error?: string | undefined;
  request?: ScopeAdjustmentRequest | undefined;
}

export interface ScopeAdjustmentResponseInput {
  request: ScopeAdjustmentRequest;
  decision: ScopeAdjustmentDecision;
  baseQuoteKobo: number;
  reviewedAt?: string | undefined;
  rejectionReason?: string | undefined;
}

export interface ScopeAdjustmentEvaluationResult {
  status: ScopeAdjustmentStatus;
  updatedRequest: ScopeAdjustmentRequest;
  baseQuoteKobo: number;
  approvedAdjustmentKobo: number;
  totalSettlementKobo: number;
}

export interface CompletionSubmissionPayload {
  bookingId: string;
  photoProofUrls: string[];
  summaryNote: string;
  submittedAt: string;
}

export interface CompletionSubmissionInput {
  bookingId: string;
  currentJobStatus: JobStatus;
  photoProofUrls: string[];
  summaryNote: string;
  hasPendingScopeAdjustment?: boolean | undefined;
  now?: string | undefined;
}

export interface CompletionValidationResult {
  valid: boolean;
  error?: string | undefined;
  targetStatus?: 'PENDING_COMPLETION' | undefined;
  payload?: CompletionSubmissionPayload | undefined;
}

export interface OnSiteVerificationState {
  bookingId: string;
  jobStatus: JobStatus;
  escrowStatus: OnSiteEscrowStatus;
  checkInSnapshot?: CheckInSnapshot | undefined;
  checkedInAt?: string | undefined;
  activeScopeAdjustment?: ScopeAdjustmentRequest | undefined;
  scopeAdjustments: ScopeAdjustmentRequest[];
  completionSubmission?: CompletionSubmissionPayload | undefined;
  completedAt?: string | undefined;
  baseQuoteKobo: number;
  approvedAdjustmentKobo: number;
  totalSettlementKobo: number;
}

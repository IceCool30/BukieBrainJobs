// apps/web/lib/disputes/types.ts
// BW-010: Dispute Handling & Support Interface
// Domain Type Definitions and Repository Contracts

import type { JobStatus } from '@bukiebrainjobs/api-types';

export type DisputeCategory =
  | 'WORKMANSHIP_DEFECT'
  | 'INCOMPLETE_ABANDONED'
  | 'DAMAGE_INCIDENT'
  | 'BILLING_SCOPE_DISAGREEMENT'
  | 'UNRESPONSIVE_NO_SHOW'
  | 'SAFETY_CONDUCT'
  | 'OTHER';

export type DisputeStatus =
  | 'FILED'
  | 'UNDER_REVIEW'
  | 'ACTION_REQUIRED'
  | 'PROPOSAL_PENDING'
  | 'RESOLVED'
  | 'CANCELLED';

export type DisputeResolutionType =
  | 'FULL_REFUND_CUSTOMER'
  | 'SPLIT_SETTLEMENT'
  | 'FULL_PAYOUT_WORKER'
  | 'MUTUAL_CONCESSION';

export type DisputeParticipantRole = 'customer' | 'brainworker';

export type DisputeAllowedMimeType =
  | 'image/jpeg'
  | 'image/png'
  | 'application/pdf';

export interface DisputeEvidence {
  id: string;
  uploaderId: string;
  uploaderRole: DisputeParticipantRole;
  fileType: DisputeAllowedMimeType;
  previewUrl: string;
  caption?: string | undefined;
  uploadedAt: string;
  sizeBytes: number;
}

export interface DisputeTimelineEvent {
  id: string;
  eventType: string;
  actorId: string;
  actorRole: 'customer' | 'brainworker' | 'system' | 'mediator';
  note: string;
  timestamp: string;
}

export interface DisputeSettlementBreakdown {
  totalAmountKobo: number;
  customerRefundKobo: number;
  workerPayoutKobo: number;
  platformFeeKobo: number;
  serviceFeeKobo: number;
  trustFeeKobo: number;
  resolutionType: DisputeResolutionType;
}

export interface DisputeRecord {
  id: string;
  bookingId: string;
  customerId: string;
  brainWorkerId: string;
  initiatedByRole: DisputeParticipantRole;
  category: DisputeCategory;
  description: string;
  status: DisputeStatus;
  evidence: DisputeEvidence[];
  timeline: DisputeTimelineEvent[];
  settlement?: DisputeSettlementBreakdown | undefined;
  resolutionNotes?: string | undefined;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string | undefined;
}

export interface DisputeInitiationInput {
  bookingId: string;
  bookingStatus: JobStatus;
  customerId: string;
  brainWorkerId: string;
  callerId: string;
  callerRole: DisputeParticipantRole;
  category: DisputeCategory;
  description: string;
  evidence?: DisputeEvidence[] | undefined;
}

export interface DisputeValidationResult {
  valid: boolean;
  error?: string | undefined;
}

export interface DisputeEvidenceValidationInput {
  evidenceList: DisputeEvidence[];
}

export interface DisputeSettlementEvaluationInput {
  totalAmountKobo: number;
  resolutionType: DisputeResolutionType;
  splitRatio?: number | undefined;
}

export interface DisputeEvidenceInput {
  bookingId: string;
  uploaderId: string;
  uploaderRole: DisputeParticipantRole;
  evidence: DisputeEvidence;
}

export interface DisputeResolutionInput {
  resolutionType: DisputeResolutionType;
  splitRatio?: number | undefined;
  resolutionNotes: string;
  resolvedByRole?: 'mediator' | 'system' | undefined;
}

// Domain Error Classes
export class DisputeNotFoundError extends Error {
  constructor(bookingId: string) {
    super(`Dispute record not found for booking: ${bookingId}`);
    this.name = 'DisputeNotFoundError';
  }
}

export class UnauthorizedDisputeActionError extends Error {
  constructor(message = 'Unauthorized dispute action') {
    super(message);
    this.name = 'UnauthorizedDisputeActionError';
  }
}

export class InvalidDisputeStateError extends Error {
  constructor(from: DisputeStatus, to: DisputeStatus) {
    super(`Invalid dispute status transition from ${from} to ${to}`);
    this.name = 'InvalidDisputeStateError';
  }
}

export class DuplicateDisputeError extends Error {
  constructor(bookingId: string) {
    super(`A dispute is already active for booking: ${bookingId}`);
    this.name = 'DuplicateDisputeError';
  }
}

export class DisputeEvidenceValidationError extends Error {
  constructor(message: string) {
    super(`Dispute evidence validation failed: ${message}`);
    this.name = 'DisputeEvidenceValidationError';
  }
}

// Repository Interface
export interface IDisputeRepository {
  getDisputeByBookingId(bookingId: string): Promise<DisputeRecord | null>;
  initiateDispute(input: DisputeInitiationInput): Promise<DisputeRecord>;
  submitCounterEvidence(input: DisputeEvidenceInput): Promise<DisputeRecord>;
  simulateMediationReview(bookingId: string, notes: string): Promise<DisputeRecord>;
  proposeSettlement(bookingId: string, proposal: DisputeSettlementBreakdown): Promise<DisputeRecord>;
  resolveDispute(bookingId: string, resolution: DisputeResolutionInput): Promise<DisputeRecord>;
  seed(records: DisputeRecord[]): void;
  clear(): void;
}

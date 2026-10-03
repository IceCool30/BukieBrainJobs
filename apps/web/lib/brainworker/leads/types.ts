// apps/web/lib/brainworker/leads/types.ts
// BW-003 Phase 3 GREEN: Repository & Lead contract types
// Governed by: BW-003 Architecture Contract v1.0 (Sections 5, 7, 10, 11)

import type { ProviderProjectedLead, LeadPricingMode } from './domain';

export type DeclineReason =
  | 'SCHEDULE_CONFLICT'
  | 'OUTSIDE_COVERAGE_AREA'
  | 'SKILL_TOOL_MISMATCH'
  | 'RATE_BUDGET_MISMATCH'
  | 'TEMPORARILY_UNAVAILABLE'
  | 'OTHER';

export type LeadInvitationState =
  | 'PENDING'
  | 'ACCEPTED'
  | 'DECLINED'
  | 'EXPIRED'
  | 'SUPERSEDED';

export interface LeadPage {
  items: ProviderProjectedLead[];
  nextCursor?: string | undefined;
}

export type LeadMutationResult =
  | {
      ok: true;
      invitationId: string;
      state: LeadInvitationState;
      respondedAt: string;
      declineReason?: DeclineReason | undefined;
    }
  | { ok: false; reason: LeadMutationFailureReason };

export type LeadMutationFailureReason =
  | 'UNAUTHORIZED'
  | 'FORBIDDEN_TENANT'
  | 'INCOMPLETE_PROFILE'
  | 'INVITATION_NOT_FOUND'
  | 'INVITATION_NOT_OWNED'
  | 'ALREADY_RESPONDED'
  | 'OFFLINE'
  | 'INVALID_STATE';

export interface WorkerQuoteDraft {
  laborAmountKobo: number;
  materialsAmountKobo?: number | undefined;
  diagnosticFeeKobo: number;
  estimatedHours: number;
  scopeNotes?: string | undefined;
}

export interface WorkerQuote extends WorkerQuoteDraft {
  id: string;
  invitationId: string;
  totalAmountKobo: number;
  submittedAt: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'SUPERSEDED' | 'EXPIRED';
}

export type LeadFeedEvent =
  | { type: 'lead_added'; lead: ProviderProjectedLead }
  | { type: 'lead_updated'; lead: ProviderProjectedLead }
  | { type: 'lead_removed'; leadId: string };

/**
 * Authoritative repository contract for BrainWorker leads inbox.
 * All methods bind operations to the authenticated BrainWorker identity.
 * Tenant isolation and authorization are enforced inside the repository.
 */
export interface IBrainWorkerLeadsRepository {
  getLeads(
    brainWorkerId: string,
    options?: { cursor?: string | undefined; limit?: number | undefined }
  ): Promise<LeadPage>;

  getLead(brainWorkerId: string, leadId: string): Promise<ProviderProjectedLead | null>;

  acceptInvitation(
    brainWorkerId: string,
    invitationId: string
  ): Promise<LeadMutationResult>;

  declineInvitation(
    brainWorkerId: string,
    invitationId: string,
    reason: DeclineReason
  ): Promise<LeadMutationResult>;

  submitQuote(
    brainWorkerId: string,
    invitationId: string,
    quote: WorkerQuoteDraft
  ): Promise<WorkerQuote>;

  acceptCustomerRate(
    brainWorkerId: string,
    invitationId: string
  ): Promise<LeadMutationResult>;

  subscribe?(
    brainWorkerId: string,
    listener: (event: LeadFeedEvent) => void
  ): () => void;
}

export class ForbiddenTenantAccessError extends Error {
  readonly code = 'FORBIDDEN_TENANT_ACCESS' as const;
  constructor(message = 'FORBIDDEN_TENANT_ACCESS: Access denied.') {
    super(message);
    this.name = 'ForbiddenTenantAccessError';
  }
}

export class IncompleteProfileError extends Error {
  readonly code = 'INCOMPLETE_PROFILE' as const;
  constructor(message = 'INCOMPLETE_PROFILE: Operational profile is incomplete.') {
    super(message);
    this.name = 'IncompleteProfileError';
  }
}

export class OfflineMutationError extends Error {
  readonly code = 'OFFLINE' as const;
  constructor(message = 'OFFLINE: Mutations are not permitted while offline.') {
    super(message);
    this.name = 'OfflineMutationError';
  }
}

// Re-export domain types used by repository consumers
export type { ProviderProjectedLead, LeadPricingMode, RawLeadData } from './domain';

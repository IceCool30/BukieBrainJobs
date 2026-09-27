// apps/web/lib/brainworker/leads/repository.ts
// BW-003 Phase 2 RED: Repository stub (intentionally incomplete)
// Governed by: BW-003 Architecture Contract v1.0 & Test-First Implementation Plan v1.0
// This stub exists only so RED tests can import the contract surface.
// No real tenant isolation or storage behavior is implemented yet.

import type {
  IBrainWorkerLeadsRepository,
  LeadPage,
  LeadMutationResult,
  WorkerQuote,
  WorkerQuoteDraft,
  DeclineReason,
} from './types';
import type { ProviderProjectedLead, RawLeadData } from './domain';

export interface BrainWorkerLeadsRepositoryDependencies {
  // Reserved for future injection of onboarding/operations bridges.
}

export class BrainWorkerLeadsRepository implements IBrainWorkerLeadsRepository {
  constructor(_dependencies: BrainWorkerLeadsRepositoryDependencies = {}) {
    // RED stub: no storage, no auth, no isolation.
  }

  async getLeads(
    _brainWorkerId: string,
    _options?: { cursor?: string | undefined; limit?: number | undefined }
  ): Promise<LeadPage> {
    throw new Error('RED: getLeads not implemented');
  }

  async getLead(
    _brainWorkerId: string,
    _leadId: string
  ): Promise<ProviderProjectedLead | null> {
    throw new Error('RED: getLead not implemented');
  }

  async acceptInvitation(
    _brainWorkerId: string,
    _invitationId: string
  ): Promise<LeadMutationResult> {
    throw new Error('RED: acceptInvitation not implemented');
  }

  async declineInvitation(
    _brainWorkerId: string,
    _invitationId: string,
    _reason: DeclineReason
  ): Promise<LeadMutationResult> {
    throw new Error('RED: declineInvitation not implemented');
  }

  async submitQuote(
    _brainWorkerId: string,
    _invitationId: string,
    _quote: WorkerQuoteDraft
  ): Promise<WorkerQuote> {
    throw new Error('RED: submitQuote not implemented');
  }

  async acceptCustomerRate(
    _brainWorkerId: string,
    _invitationId: string
  ): Promise<LeadMutationResult> {
    throw new Error('RED: acceptCustomerRate not implemented');
  }

  // Test-only surface used by harness during RED/GREEN.
  // Must never be called from production routes.
  __testSeedLead(_brainWorkerId: string, _lead: RawLeadData): void {
    // no-op in RED
  }

  __testSetOffline(_offline: boolean): void {
    // no-op in RED
  }
}

let defaultRepository: BrainWorkerLeadsRepository | null = null;

export function createBrainWorkerLeadsRepository(
  dependencies: BrainWorkerLeadsRepositoryDependencies = {}
): BrainWorkerLeadsRepository {
  return new BrainWorkerLeadsRepository(dependencies);
}

export function getBrainWorkerLeadsRepository(): IBrainWorkerLeadsRepository {
  if (!defaultRepository) {
    defaultRepository = createBrainWorkerLeadsRepository();
  }
  return defaultRepository;
}

export function resetDefaultBrainWorkerLeadsRepository(): void {
  defaultRepository = null;
}

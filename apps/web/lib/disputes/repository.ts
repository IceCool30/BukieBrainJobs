// apps/web/lib/disputes/repository.ts
// BW-010: Dispute Handling & Support Interface
// Phase 2 RED: Dispute Repository Interface & In-Memory Stub

import type {
  IDisputeRepository,
  DisputeRecord,
  DisputeInitiationInput,
  DisputeEvidence,
  DisputeStatus,
  DisputeSettlementBreakdown,
  DisputeResolutionType,
} from './types';

export class InMemoryDisputeRepository implements IDisputeRepository {
  private records: Map<string, DisputeRecord> = new Map();

  async getDispute(_disputeId: string, _callerId: string): Promise<DisputeRecord> {
    throw new Error('Not implemented: Phase 2 RED stub');
  }

  async getDisputeByBookingId(
    _bookingId: string,
    _callerId?: string
  ): Promise<DisputeRecord | null> {
    throw new Error('Not implemented: Phase 2 RED stub');
  }

  async createDispute(
    _input: DisputeInitiationInput,
    _callerId: string
  ): Promise<DisputeRecord> {
    throw new Error('Not implemented: Phase 2 RED stub');
  }

  async submitCounterEvidence(
    _disputeId: string,
    _evidence: DisputeEvidence,
    _callerId: string
  ): Promise<DisputeRecord> {
    throw new Error('Not implemented: Phase 2 RED stub');
  }

  async simulateStatusUpdate(
    _disputeId: string,
    _nextStatus: DisputeStatus,
    _note: string,
    _actorId: string
  ): Promise<DisputeRecord> {
    throw new Error('Not implemented: Phase 2 RED stub');
  }

  async recordMediationProposal(
    _disputeId: string,
    _proposal: DisputeSettlementBreakdown,
    _actorId: string
  ): Promise<DisputeRecord> {
    throw new Error('Not implemented: Phase 2 RED stub');
  }

  async resolveDisputeWithSettlement(
    _disputeId: string,
    _resolutionType: DisputeResolutionType,
    _splitRatio: number | undefined,
    _note: string,
    _actorId: string
  ): Promise<DisputeRecord> {
    throw new Error('Not implemented: Phase 2 RED stub');
  }

  seed(_records: DisputeRecord[]): void {
    throw new Error('Not implemented: Phase 2 RED stub');
  }

  clear(): void {
    throw new Error('Not implemented: Phase 2 RED stub');
  }
}

let repositoryInstance: IDisputeRepository | null = null;

export function getDisputeRepository(): IDisputeRepository {
  if (!repositoryInstance) {
    repositoryInstance = new InMemoryDisputeRepository();
  }
  return repositoryInstance;
}

export function resetDisputeRepository(): void {
  repositoryInstance = null;
}

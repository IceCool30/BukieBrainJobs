// apps/web/lib/disputes/repository.ts
// BW-010: Dispute Handling & Support Interface
// Phase 2 GREEN: In-Memory Dispute Repository Implementation

import type {
  IDisputeRepository,
  DisputeRecord,
  DisputeInitiationInput,
  DisputeEvidence,
  DisputeStatus,
  DisputeSettlementBreakdown,
  DisputeResolutionType,
  DisputeTimelineEvent,
} from './types';
import {
  DisputeNotFoundError,
  UnauthorizedDisputeActionError,
  InvalidDisputeStateError,
  DuplicateDisputeError,
  DisputeEvidenceValidationError,
} from './types';
import {
  validateDisputeInitiation,
  validateDisputeEvidence,
  evaluateDisputeSettlement,
  canTransitionDispute,
} from './domain';

export class InMemoryDisputeRepository implements IDisputeRepository {
  private records: Map<string, DisputeRecord> = new Map();

  private clone<T>(data: T): T {
    return JSON.parse(JSON.stringify(data)) as T;
  }

  private assertParticipant(record: DisputeRecord, callerId: string): void {
    if (callerId !== record.customerId && callerId !== record.brainWorkerId) {
      throw new UnauthorizedDisputeActionError(
        `Caller ${callerId} is not an authorized participant in dispute ${record.id}`
      );
    }
  }

  async getDispute(disputeId: string, callerId: string): Promise<DisputeRecord> {
    const record = this.records.get(disputeId);
    if (!record) {
      throw new DisputeNotFoundError(disputeId);
    }
    this.assertParticipant(record, callerId);
    return this.clone(record);
  }

  async getDisputeByBookingId(
    bookingId: string,
    callerId?: string
  ): Promise<DisputeRecord | null> {
    for (const record of this.records.values()) {
      if (record.bookingId === bookingId) {
        if (callerId) {
          this.assertParticipant(record, callerId);
        }
        return this.clone(record);
      }
    }
    return null;
  }

  async createDispute(
    input: DisputeInitiationInput,
    callerId: string
  ): Promise<DisputeRecord> {
    if (callerId !== input.customerId && callerId !== input.brainWorkerId) {
      throw new UnauthorizedDisputeActionError(
        `Caller ${callerId} is neither the customer nor the assigned worker for booking ${input.bookingId}`
      );
    }

    for (const record of this.records.values()) {
      if (record.bookingId === input.bookingId) {
        throw new DuplicateDisputeError(input.bookingId);
      }
    }

    const validation = validateDisputeInitiation(input);
    if (!validation.valid) {
      throw new DisputeEvidenceValidationError(
        validation.error ?? 'Invalid dispute initiation parameters'
      );
    }

    if (input.evidence && input.evidence.length > 0) {
      const evValidation = validateDisputeEvidence({
        evidenceList: input.evidence,
      });
      if (!evValidation.valid) {
        throw new DisputeEvidenceValidationError(
          evValidation.error ?? 'Invalid evidence payload'
        );
      }
    }

    const id = `disp-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const now = new Date().toISOString();

    const initialEvent: DisputeTimelineEvent = {
      id: `tl-${Date.now()}-filed`,
      eventType: 'DISPUTE_FILED',
      actorId: callerId,
      actorRole: input.callerRole,
      note: input.description,
      timestamp: now,
    };

    const record: DisputeRecord = {
      id,
      bookingId: input.bookingId,
      customerId: input.customerId,
      brainWorkerId: input.brainWorkerId,
      initiatedByRole: input.callerRole,
      category: input.category,
      description: input.description,
      status: 'FILED',
      evidence: input.evidence ? this.clone(input.evidence) : [],
      timeline: [initialEvent],
      totalAmountKobo: input.totalAmountKobo,
      createdAt: now,
      updatedAt: now,
    };

    this.records.set(id, this.clone(record));
    return this.clone(record);
  }

  async submitCounterEvidence(
    disputeId: string,
    evidence: DisputeEvidence,
    callerId: string
  ): Promise<DisputeRecord> {
    const record = this.records.get(disputeId);
    if (!record) {
      throw new DisputeNotFoundError(disputeId);
    }

    this.assertParticipant(record, callerId);

    const evValidation = validateDisputeEvidence({
      evidenceList: [evidence],
    });
    if (!evValidation.valid) {
      throw new DisputeEvidenceValidationError(
        evValidation.error ?? 'Invalid counter evidence submitted'
      );
    }

    record.evidence.push(this.clone(evidence));

    if (record.status === 'ACTION_REQUIRED') {
      record.status = 'UNDER_REVIEW';
    }

    const now = new Date().toISOString();
    record.timeline.push({
      id: `tl-${Date.now()}-counter`,
      eventType: 'COUNTER_EVIDENCE_SUBMITTED',
      actorId: callerId,
      actorRole: evidence.uploaderRole,
      note: evidence.caption || 'Counter evidence submitted',
      timestamp: now,
    });
    record.updatedAt = now;

    this.records.set(disputeId, this.clone(record));
    return this.clone(record);
  }

  async simulateStatusUpdate(
    disputeId: string,
    nextStatus: DisputeStatus,
    note: string,
    actorId: string
  ): Promise<DisputeRecord> {
    const record = this.records.get(disputeId);
    if (!record) {
      throw new DisputeNotFoundError(disputeId);
    }

    if (!canTransitionDispute(record.status, nextStatus)) {
      throw new InvalidDisputeStateError(record.status, nextStatus);
    }

    record.status = nextStatus;
    const now = new Date().toISOString();
    record.timeline.push({
      id: `tl-${Date.now()}-status`,
      eventType: 'STATUS_UPDATED',
      actorId,
      actorRole: 'mediator',
      note,
      timestamp: now,
    });
    record.updatedAt = now;

    this.records.set(disputeId, this.clone(record));
    return this.clone(record);
  }

  async recordMediationProposal(
    disputeId: string,
    proposal: DisputeSettlementBreakdown,
    actorId: string
  ): Promise<DisputeRecord> {
    const record = this.records.get(disputeId);
    if (!record) {
      throw new DisputeNotFoundError(disputeId);
    }

    if (
      record.status !== 'PROPOSAL_PENDING' &&
      !canTransitionDispute(record.status, 'PROPOSAL_PENDING')
    ) {
      throw new InvalidDisputeStateError(record.status, 'PROPOSAL_PENDING');
    }

    record.status = 'PROPOSAL_PENDING';
    record.settlement = this.clone(proposal);
    const now = new Date().toISOString();
    record.timeline.push({
      id: `tl-${Date.now()}-proposal`,
      eventType: 'MEDIATION_PROPOSAL_RECORDED',
      actorId,
      actorRole: 'mediator',
      note: 'Mediation settlement proposal recorded',
      timestamp: now,
    });
    record.updatedAt = now;

    this.records.set(disputeId, this.clone(record));
    return this.clone(record);
  }

  async resolveDisputeWithSettlement(
    disputeId: string,
    resolutionType: DisputeResolutionType,
    splitRatio: number | undefined,
    note: string,
    actorId: string
  ): Promise<DisputeRecord> {
    const record = this.records.get(disputeId);
    if (!record) {
      throw new DisputeNotFoundError(disputeId);
    }

    if (!canTransitionDispute(record.status, 'RESOLVED')) {
      throw new InvalidDisputeStateError(record.status, 'RESOLVED');
    }

    const totalAmountKobo = record.totalAmountKobo ?? 0;
    const settlement = evaluateDisputeSettlement({
      totalAmountKobo,
      resolutionType,
      splitRatio,
    });

    record.status = 'RESOLVED';
    record.settlement = settlement;
    record.resolutionNotes = note;
    const now = new Date().toISOString();
    record.resolvedAt = now;
    record.updatedAt = now;
    record.timeline.push({
      id: `tl-${Date.now()}-resolved`,
      eventType: 'DISPUTE_RESOLVED',
      actorId,
      actorRole: 'mediator',
      note,
      timestamp: now,
    });

    this.records.set(disputeId, this.clone(record));
    return this.clone(record);
  }

  seed(records: DisputeRecord[]): void {
    this.records.clear();
    for (const record of records) {
      this.records.set(record.id, this.clone(record));
    }
  }

  clear(): void {
    this.records.clear();
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

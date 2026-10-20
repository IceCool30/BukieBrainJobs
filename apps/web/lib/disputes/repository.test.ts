// apps/web/lib/disputes/repository.test.ts
// BW-010: Dispute Handling & Support Interface
// Phase 2 RED: Dispute Repository Contracts (REP-001 through REP-010)

import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryDisputeRepository } from './repository';
import {
  UnauthorizedDisputeActionError,
  DuplicateDisputeError,
  DisputeNotFoundError,
  InvalidDisputeStateError,
  DisputeEvidenceValidationError,
} from './types';
import type {
  DisputeInitiationInput,
  DisputeEvidence,
  DisputeAllowedMimeType,
} from './types';

describe('BW-010 Phase 2 RED: Dispute Repository Contracts', () => {
  let repository: InMemoryDisputeRepository;

  const validInitiationInput: DisputeInitiationInput = {
    bookingId: 'book-rep-test-01',
    bookingStatus: 'IN_PROGRESS',
    customerId: 'usr-customer-01',
    brainWorkerId: 'usr-worker-01',
    callerId: 'usr-customer-01',
    callerRole: 'customer',
    category: 'WORKMANSHIP_DEFECT',
    description: 'Compressor fittings leak and technician refuses repair.',
    totalAmountKobo: 10000000, // ₦100,000
  };

  const sampleEvidence: DisputeEvidence = {
    id: 'ev-rep-01',
    uploaderId: 'usr-worker-01',
    uploaderRole: 'brainworker',
    fileType: 'image/jpeg',
    previewUrl: 'https://images.bukiebrainjobs.ng/proof-01.jpg',
    caption: 'Photo of completed manifold pressure gauge test.',
    uploadedAt: '2026-10-20T13:00:00Z',
    sizeBytes: 1048576,
  };

  beforeEach(() => {
    repository = new InMemoryDisputeRepository();
  });

  describe('REP-001: createDispute stores a dispute record, initializes FILED status, and records timeline', () => {
    it('creates dispute record with FILED status and initial timeline entry', async () => {
      const record = await repository.createDispute(validInitiationInput, 'usr-customer-01');

      expect(record.id).toBeDefined();
      expect(record.bookingId).toBe('book-rep-test-01');
      expect(record.customerId).toBe('usr-customer-01');
      expect(record.brainWorkerId).toBe('usr-worker-01');
      expect(record.status).toBe('FILED');
      expect(record.timeline).toHaveLength(1);
      expect(record.timeline[0]?.eventType).toBe('DISPUTE_FILED');
      expect(record.timeline[0]?.actorId).toBe('usr-customer-01');
      expect(record.timeline[0]?.actorRole).toBe('customer');
      expect(record.createdAt).toBeDefined();
    });
  });

  describe('REP-002: createDispute rejects callers who are neither the booking customer nor the assigned worker', () => {
    it('throws UnauthorizedDisputeActionError when third party attempts dispute creation', async () => {
      await expect(
        repository.createDispute(validInitiationInput, 'usr-unrelated-stranger')
      ).rejects.toThrow(UnauthorizedDisputeActionError);
    });
  });

  describe('REP-003: createDispute prevents opening duplicate disputes for the same booking ID', () => {
    it('throws DuplicateDisputeError if dispute already exists for booking', async () => {
      await repository.createDispute(validInitiationInput, 'usr-customer-01');

      await expect(
        repository.createDispute(validInitiationInput, 'usr-customer-01')
      ).rejects.toThrow(DuplicateDisputeError);
    });
  });

  describe('REP-004: getDispute retrieves dispute for authorized participants and throws for third parties', () => {
    it('allows customer and brainworker to read, but rejects third parties and nonexistent IDs', async () => {
      const created = await repository.createDispute(validInitiationInput, 'usr-customer-01');

      const byCustomer = await repository.getDispute(created.id, 'usr-customer-01');
      expect(byCustomer.id).toBe(created.id);

      const byWorker = await repository.getDispute(created.id, 'usr-worker-01');
      expect(byWorker.id).toBe(created.id);

      await expect(
        repository.getDispute(created.id, 'usr-intruder-99')
      ).rejects.toThrow(UnauthorizedDisputeActionError);

      await expect(
        repository.getDispute('non-existent-id', 'usr-customer-01')
      ).rejects.toThrow(DisputeNotFoundError);
    });
  });

  describe('REP-005: getDisputeByBookingId returns active dispute or null if none exists', () => {
    it('returns null when no dispute exists, and dispute record once created', async () => {
      const initial = await repository.getDisputeByBookingId('book-rep-test-01', 'usr-customer-01');
      expect(initial).toBeNull();

      const created = await repository.createDispute(validInitiationInput, 'usr-customer-01');
      const found = await repository.getDisputeByBookingId('book-rep-test-01', 'usr-customer-01');

      expect(found).not.toBeNull();
      expect(found?.id).toBe(created.id);
    });
  });

  describe('REP-006: submitCounterEvidence appends new evidence, records timeline, and updates status', () => {
    it('appends counter evidence and moves ACTION_REQUIRED dispute back to UNDER_REVIEW', async () => {
      const created = await repository.createDispute(validInitiationInput, 'usr-customer-01');

      await repository.simulateStatusUpdate(
        created.id,
        'ACTION_REQUIRED',
        'Requested technician counter evidence.',
        'mediator'
      );

      const updated = await repository.submitCounterEvidence(
        created.id,
        sampleEvidence,
        'usr-worker-01'
      );

      expect(updated.evidence).toHaveLength(1);
      expect(updated.evidence[0]?.id).toBe('ev-rep-01');
      expect(updated.status).toBe('UNDER_REVIEW');
      expect(updated.timeline.some((t) => t.eventType === 'COUNTER_EVIDENCE_SUBMITTED')).toBe(true);
    });
  });

  describe('REP-007: submitCounterEvidence rejects unauthorized callers or invalid evidence formats', () => {
    it('throws UnauthorizedDisputeActionError when third party submits evidence', async () => {
      const created = await repository.createDispute(validInitiationInput, 'usr-customer-01');

      await expect(
        repository.submitCounterEvidence(created.id, sampleEvidence, 'usr-intruder-99')
      ).rejects.toThrow(UnauthorizedDisputeActionError);
    });

    it('throws DisputeEvidenceValidationError when evidence exceeds size limit', async () => {
      const created = await repository.createDispute(validInitiationInput, 'usr-customer-01');
      const oversizedEvidence: DisputeEvidence = {
        ...sampleEvidence,
        id: 'ev-huge',
        sizeBytes: 10 * 1024 * 1024, // 10MB
      };

      await expect(
        repository.submitCounterEvidence(created.id, oversizedEvidence, 'usr-worker-01')
      ).rejects.toThrow(DisputeEvidenceValidationError);
    });

    it('throws DisputeEvidenceValidationError when evidence has unsupported MIME type', async () => {
      const created = await repository.createDispute(validInitiationInput, 'usr-customer-01');
      const badMimeEvidence = {
        ...sampleEvidence,
        id: 'ev-bad-mime',
        fileType: 'application/x-sh' as unknown as DisputeAllowedMimeType,
      };

      await expect(
        repository.submitCounterEvidence(created.id, badMimeEvidence, 'usr-worker-01')
      ).rejects.toThrow(DisputeEvidenceValidationError);
    });
  });

  describe('REP-008: simulateStatusUpdate updates dispute lifecycle status and appends timeline event', () => {
    it('advances status from FILED to UNDER_REVIEW with timeline logging', async () => {
      const created = await repository.createDispute(validInitiationInput, 'usr-customer-01');

      const updated = await repository.simulateStatusUpdate(
        created.id,
        'UNDER_REVIEW',
        'Support specialist assigned to review evidence.',
        'mediator'
      );

      expect(updated.status).toBe('UNDER_REVIEW');
      const latestTimeline = updated.timeline[updated.timeline.length - 1];
      expect(latestTimeline?.eventType).toBe('STATUS_UPDATED');
      expect(latestTimeline?.note).toBe('Support specialist assigned to review evidence.');
      expect(latestTimeline?.actorRole).toBe('mediator');
    });
  });

  describe('REP-009: resolveDisputeWithSettlement transitions status to RESOLVED and calculates exact fee breakdown', () => {
    it('settles dispute with 60 percent worker split and locks against further status mutation', async () => {
      const created = await repository.createDispute(validInitiationInput, 'usr-customer-01');

      await repository.simulateStatusUpdate(
        created.id,
        'UNDER_REVIEW',
        'Mediation review in progress.',
        'mediator'
      );

      await repository.simulateStatusUpdate(
        created.id,
        'PROPOSAL_PENDING',
        'Settlement proposal ready.',
        'mediator'
      );

      const resolved = await repository.resolveDisputeWithSettlement(
        created.id,
        'SPLIT_SETTLEMENT',
        0.60,
        'Agreed 60-40 split resolution.',
        'mediator'
      );

      expect(resolved.status).toBe('RESOLVED');
      expect(resolved.settlement).toBeDefined();
      expect(resolved.settlement?.customerRefundKobo).toBe(4000000);
      expect(resolved.settlement?.workerPayoutKobo).toBe(4950000);
      expect(resolved.settlement?.platformFeeKobo).toBe(1050000);
      expect(resolved.settlement?.serviceFeeKobo).toBe(600000);
      expect(resolved.settlement?.trustFeeKobo).toBe(450000);

      // Attempting further status transitions on resolved dispute must fail
      await expect(
        repository.simulateStatusUpdate(
          created.id,
          'UNDER_REVIEW',
          'Attempted illegal restart.',
          'mediator'
        )
      ).rejects.toThrow(InvalidDisputeStateError);
    });
  });

  describe('REP-010: Deep clone invariant prevents external object mutations from corrupting repository state', () => {
    it('ensures mutations on retrieved records do not affect repository internal records', async () => {
      const created = await repository.createDispute(validInitiationInput, 'usr-customer-01');

      const retrieved = await repository.getDispute(created.id, 'usr-customer-01');
      retrieved.description = 'Hacked description mutated on outside reference';
      retrieved.timeline.push({
        id: 'fake-event',
        eventType: 'CORRUPTED',
        actorId: 'attacker',
        actorRole: 'customer',
        note: 'Injected corrupt entry',
        timestamp: '2026-10-20T14:00:00Z',
      });

      const freshRead = await repository.getDispute(created.id, 'usr-customer-01');
      expect(freshRead.description).toBe(validInitiationInput.description);
      expect(freshRead.timeline).toHaveLength(1);
    });
  });
});

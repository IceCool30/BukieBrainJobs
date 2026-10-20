// apps/web/lib/disputes/domain.test.ts
// BW-010: Dispute Handling & Support Interface
// Phase 1 RED: Domain Logic Contracts (DISP-001 through DISP-010)

import { describe, it, expect } from 'vitest';
import {
  validateDisputeInitiation,
  validateDisputeEvidence,
  evaluateDisputeSettlement,
  canTransitionDispute,
} from './domain';
import type {
  DisputeInitiationInput,
  DisputeEvidence,
  DisputeAllowedMimeType,
} from './types';

describe('BW-010 Phase 1 RED: Domain Logic Contracts', () => {
  describe('DISP-001: Customer can initiate dispute on IN_PROGRESS booking', () => {
    it('validates customer initiation when booking is in progress', () => {
      const input: DisputeInitiationInput = {
        bookingId: 'book-disp-001',
        bookingStatus: 'IN_PROGRESS',
        customerId: 'usr-customer-01',
        brainWorkerId: 'usr-worker-01',
        callerId: 'usr-customer-01',
        callerRole: 'customer',
        category: 'WORKMANSHIP_DEFECT',
        description: 'Artisan installed pipe fittings improperly and refrigerant leaked out.',
      };

      const result = validateDisputeInitiation(input);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  describe('DISP-002: Customer can initiate dispute on PENDING_COMPLETION booking', () => {
    it('validates customer initiation during inspection window before escrow release', () => {
      const input: DisputeInitiationInput = {
        bookingId: 'book-disp-002',
        bookingStatus: 'PENDING_COMPLETION',
        customerId: 'usr-customer-02',
        brainWorkerId: 'usr-worker-02',
        callerId: 'usr-customer-02',
        callerRole: 'customer',
        category: 'INCOMPLETE_ABANDONED',
        description: 'BrainWorker submitted completion but outdoor compressor unit was left unbolted.',
      };

      const result = validateDisputeInitiation(input);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  describe('DISP-003: BrainWorker can initiate dispute on eligible booking', () => {
    it('validates worker initiation when customer imposes off-platform scope conflict', () => {
      const input: DisputeInitiationInput = {
        bookingId: 'book-disp-003',
        bookingStatus: 'IN_PROGRESS',
        customerId: 'usr-customer-03',
        brainWorkerId: 'usr-worker-03',
        callerId: 'usr-worker-03',
        callerRole: 'brainworker',
        category: 'BILLING_SCOPE_DISAGREEMENT',
        description: 'Customer demands uncompensated replacement of additional indoor cabling.',
      };

      const result = validateDisputeInitiation(input);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  describe('DISP-004: Rejects dispute initiation on unconfirmed or already cancelled bookings', () => {
    it('rejects initiation if booking is CANCELLED', () => {
      const input: DisputeInitiationInput = {
        bookingId: 'book-disp-004',
        bookingStatus: 'CANCELLED',
        customerId: 'usr-customer-04',
        brainWorkerId: 'usr-worker-04',
        callerId: 'usr-customer-04',
        callerRole: 'customer',
        category: 'UNRESPONSIVE_NO_SHOW',
        description: 'Technician never appeared at site.',
      };

      const result = validateDisputeInitiation(input);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Cannot initiate dispute on CANCELLED booking');
    });

    it('rejects initiation if booking is CONFIRMED but work has not started', () => {
      const input: DisputeInitiationInput = {
        bookingId: 'book-disp-004b',
        bookingStatus: 'CONFIRMED',
        customerId: 'usr-customer-04',
        brainWorkerId: 'usr-worker-04',
        callerId: 'usr-customer-04',
        callerRole: 'customer',
        category: 'OTHER',
        description: 'Trying to open dispute before check-in.',
      };

      const result = validateDisputeInitiation(input);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Disputes can only be initiated on IN_PROGRESS or PENDING_COMPLETION bookings');
    });
  });

  describe('DISP-005: Rejects empty or whitespace-only dispute descriptions', () => {
    it('rejects empty string description', () => {
      const input: DisputeInitiationInput = {
        bookingId: 'book-disp-005',
        bookingStatus: 'IN_PROGRESS',
        customerId: 'usr-customer-05',
        brainWorkerId: 'usr-worker-05',
        callerId: 'usr-customer-05',
        callerRole: 'customer',
        category: 'SAFETY_CONDUCT',
        description: '',
      };

      const result = validateDisputeInitiation(input);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Dispute description must not be empty');
    });

    it('rejects whitespace-only description', () => {
      const input: DisputeInitiationInput = {
        bookingId: 'book-disp-005b',
        bookingStatus: 'IN_PROGRESS',
        customerId: 'usr-customer-05',
        brainWorkerId: 'usr-worker-05',
        callerId: 'usr-customer-05',
        callerRole: 'customer',
        category: 'DAMAGE_INCIDENT',
        description: '     \n  \t  ',
      };

      const result = validateDisputeInitiation(input);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Dispute description must not be empty');
    });
  });

  describe('DISP-006: Validates evidence file types and rejects unauthorized MIME formats', () => {
    it('accepts supported image and PDF MIME types', () => {
      const evidenceList: DisputeEvidence[] = [
        {
          id: 'ev-01',
          uploaderId: 'usr-customer-06',
          uploaderRole: 'customer',
          fileType: 'image/jpeg',
          previewUrl: 'https://images.bukiebrainjobs.ng/ev-01.jpg',
          caption: 'Crack in compressor casing',
          uploadedAt: '2026-10-20T12:00:00Z',
          sizeBytes: 1048576,
        },
        {
          id: 'ev-02',
          uploaderId: 'usr-customer-06',
          uploaderRole: 'customer',
          fileType: 'application/pdf',
          previewUrl: 'https://documents.bukiebrainjobs.ng/ev-02.pdf',
          caption: 'Diagnostic report receipt',
          uploadedAt: '2026-10-20T12:05:00Z',
          sizeBytes: 2097152,
        },
      ];

      const result = validateDisputeEvidence({ evidenceList });
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('rejects unauthorized executable or archive MIME types', () => {
      const evidenceList = [
        {
          id: 'ev-bad',
          uploaderId: 'usr-customer-06',
          uploaderRole: 'customer' as const,
          fileType: 'application/octet-stream' as unknown as DisputeAllowedMimeType,
          previewUrl: 'https://downloads.bukiebrainjobs.ng/bad.bin',
          uploadedAt: '2026-10-20T12:00:00Z',
          sizeBytes: 1024,
        },
      ];

      const result = validateDisputeEvidence({ evidenceList });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Unsupported evidence file type');
    });
  });

  describe('DISP-007: Rejects evidence exceeding the 5MB file size limit or 5 attachment count', () => {
    it('rejects individual evidence item exceeding 5MB', () => {
      const evidenceList: DisputeEvidence[] = [
        {
          id: 'ev-huge',
          uploaderId: 'usr-customer-07',
          uploaderRole: 'customer',
          fileType: 'image/png',
          previewUrl: 'https://images.bukiebrainjobs.ng/huge.png',
          uploadedAt: '2026-10-20T12:00:00Z',
          sizeBytes: 5242881, // 5MB + 1 byte
        },
      ];

      const result = validateDisputeEvidence({ evidenceList });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Evidence file exceeds 5MB size limit');
    });

    it('rejects evidence submission with more than 5 attachments', () => {
      const evidenceList: DisputeEvidence[] = Array.from({ length: 6 }, (_, index) => ({
        id: `ev-${index + 1}`,
        uploaderId: 'usr-customer-07',
        uploaderRole: 'customer',
        fileType: 'image/jpeg',
        previewUrl: `https://images.bukiebrainjobs.ng/ev-${index + 1}.jpg`,
        uploadedAt: '2026-10-20T12:00:00Z',
        sizeBytes: 500000,
      }));

      const result = validateDisputeEvidence({ evidenceList });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Maximum 5 evidence attachments allowed');
    });
  });

  describe('DISP-008: Correctly calculates full customer refund with zero fee deduction on verified provider failure', () => {
    it('allocates 100 percent refund to customer with zero platform retention', () => {
      const totalAmountKobo = 6500000; // ₦65,000

      const breakdown = evaluateDisputeSettlement({
        totalAmountKobo,
        resolutionType: 'FULL_REFUND_CUSTOMER',
      });

      expect(breakdown.resolutionType).toBe('FULL_REFUND_CUSTOMER');
      expect(breakdown.customerRefundKobo).toBe(6500000);
      expect(breakdown.workerPayoutKobo).toBe(0);
      expect(breakdown.platformFeeKobo).toBe(0);
      expect(breakdown.serviceFeeKobo).toBe(0);
      expect(breakdown.trustFeeKobo).toBe(0);
      expect(breakdown.totalAmountKobo).toBe(6500000);
    });
  });

  describe('DISP-009: Correctly calculates split settlement preserving integer Kobo and 17.5% platform fee structure', () => {
    it('computes exact integer Kobo split with 10% service fee and 7.5% trust fee on worker share', () => {
      const totalAmountKobo = 10000000; // ₦100,000
      const splitRatio = 0.60; // 60% worker gross allocation, 40% customer refund

      const breakdown = evaluateDisputeSettlement({
        totalAmountKobo,
        resolutionType: 'SPLIT_SETTLEMENT',
        splitRatio,
      });

      // Customer refund: 40% of ₦100,000 = ₦40,000 = 4,000,000 Kobo
      expect(breakdown.customerRefundKobo).toBe(4000000);

      // Worker gross allocation: 60% of ₦100,000 = ₦60,000 = 6,000,000 Kobo
      // Platform retention: 17.5% of ₦60,000 = ₦10,500 = 1,050,000 Kobo
      // Service fee (10%): 600,000 Kobo
      // Trust fee (7.5%): 450,000 Kobo
      expect(breakdown.serviceFeeKobo).toBe(600000);
      expect(breakdown.trustFeeKobo).toBe(450000);
      expect(breakdown.platformFeeKobo).toBe(1050000);

      // Worker net payout: 6,000,000 - 1,050,000 = 4,950,000 Kobo
      expect(breakdown.workerPayoutKobo).toBe(4950000);

      // Integrity assertion: sum of customer refund, worker payout, and platform fee equals totalAmountKobo
      expect(
        breakdown.customerRefundKobo +
        breakdown.workerPayoutKobo +
        breakdown.platformFeeKobo
      ).toBe(totalAmountKobo);
    });
  });

  describe('DISP-010: Prevents illegal dispute status transitions (e.g. from RESOLVED back to FILED)', () => {
    it('permits forward transition from FILED to UNDER_REVIEW', () => {
      expect(canTransitionDispute('FILED', 'UNDER_REVIEW')).toBe(true);
    });

    it('permits forward transition from UNDER_REVIEW to PROPOSAL_PENDING', () => {
      expect(canTransitionDispute('UNDER_REVIEW', 'PROPOSAL_PENDING')).toBe(true);
    });

    it('permits transition from PROPOSAL_PENDING to RESOLVED', () => {
      expect(canTransitionDispute('PROPOSAL_PENDING', 'RESOLVED')).toBe(true);
    });

    it('rejects backwards transition from RESOLVED to FILED', () => {
      expect(canTransitionDispute('RESOLVED', 'FILED')).toBe(false);
    });

    it('rejects mutation on terminal CANCELLED dispute', () => {
      expect(canTransitionDispute('CANCELLED', 'ACTION_REQUIRED')).toBe(false);
    });
  });
});

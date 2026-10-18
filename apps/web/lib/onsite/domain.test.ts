// apps/web/lib/onsite/domain.test.ts
// BW-008: On-Site Work & In-Progress Verification
// Phase 1 RED: Domain Contracts ONSITE-001 through ONSITE-010

import { describe, expect, it } from 'vitest';
import {
  validateCheckInEligibility,
  validateScopeAdjustmentRequest,
  evaluateScopeAdjustmentResponse,
  validateCompletionSubmission,
} from './domain';
import type { ScopeAdjustmentRequest } from './types';

describe('BW-008 Phase 1 RED: On-Site Work & Verification Domain Contracts', () => {
  it('ONSITE-001: check-in requires booking status CONFIRMED and escrow status ESCROW_HELD', () => {
    const result = validateCheckInEligibility({
      jobStatus: 'CONFIRMED',
      escrowStatus: 'ESCROW_HELD',
      snapshot: {
        coordinates: { latitude: 6.5244, longitude: 3.3792, accuracyMeters: 10 },
        capturedAt: '2026-10-18T10:30:00.000Z',
      },
    });
    expect(result.eligible).toBe(true);

    const unconfirmed = validateCheckInEligibility({
      jobStatus: 'OPEN',
      escrowStatus: 'ESCROW_HELD',
      snapshot: {
        coordinates: { latitude: 6.5244, longitude: 3.3792 },
        capturedAt: '2026-10-18T10:30:00.000Z',
      },
    });
    expect(unconfirmed.eligible).toBe(false);
    expect(unconfirmed.error).toMatch(/CONFIRMED/i);
  });

  it('ONSITE-002: check-in fails closed if booking is unfunded or device location is missing', () => {
    const unfunded = validateCheckInEligibility({
      jobStatus: 'CONFIRMED',
      escrowStatus: 'UNFUNDED',
      snapshot: {
        coordinates: { latitude: 6.5244, longitude: 3.3792 },
        capturedAt: '2026-10-18T10:30:00.000Z',
      },
    });
    expect(unfunded.eligible).toBe(false);
    expect(unfunded.error).toMatch(/escrow/i);

    const missingLocation = validateCheckInEligibility({
      jobStatus: 'CONFIRMED',
      escrowStatus: 'ESCROW_HELD',
      snapshot: null,
    });
    expect(missingLocation.eligible).toBe(false);
    expect(missingLocation.error).toMatch(/location|landmark/i);
  });

  it('ONSITE-003: check-in transitions booking to IN_PROGRESS and records authoritative timestamp', () => {
    const mockNow = '2026-10-18T10:30:00.000Z';
    const result = validateCheckInEligibility(
      {
        jobStatus: 'CONFIRMED',
        escrowStatus: 'ESCROW_HELD',
        snapshot: {
          landmarkConfirmation: 'Lekki Phase 1 Gate 2',
          capturedAt: '2026-10-18T10:29:55.000Z',
        },
      },
      mockNow
    );

    expect(result.eligible).toBe(true);
    expect(result.targetStatus).toBe('IN_PROGRESS');
    expect(result.checkedInAt).toBe(mockNow);
  });

  it('ONSITE-004: scope adjustment permitted strictly when booking is IN_PROGRESS', () => {
    const valid = validateScopeAdjustmentRequest({
      bookingId: 'bk_123',
      currentJobStatus: 'IN_PROGRESS',
      category: 'ADDITIONAL_PARTS',
      description: 'Replaced faulty copper pipe segment',
      additionalLaborKobo: 0,
      additionalMaterialsKobo: 1500000,
    });
    expect(valid.valid).toBe(true);

    const notInProgress = validateScopeAdjustmentRequest({
      bookingId: 'bk_123',
      currentJobStatus: 'CONFIRMED',
      category: 'ADDITIONAL_PARTS',
      description: 'Replaced faulty copper pipe segment',
      additionalLaborKobo: 0,
      additionalMaterialsKobo: 1500000,
    });
    expect(notInProgress.valid).toBe(false);
    expect(notInProgress.error).toMatch(/IN_PROGRESS/i);
  });

  it('ONSITE-005: scope adjustment validates integer kobo (> 0) and reason category', () => {
    const negativeKobo = validateScopeAdjustmentRequest({
      bookingId: 'bk_123',
      currentJobStatus: 'IN_PROGRESS',
      category: 'ADDITIONAL_LABOR',
      description: 'Extra troubleshooting labor',
      additionalLaborKobo: -50000,
      additionalMaterialsKobo: 0,
    });
    expect(negativeKobo.valid).toBe(false);

    const nonIntegerKobo = validateScopeAdjustmentRequest({
      bookingId: 'bk_123',
      currentJobStatus: 'IN_PROGRESS',
      category: 'ADDITIONAL_LABOR',
      description: 'Extra troubleshooting labor',
      additionalLaborKobo: 1250.5,
      additionalMaterialsKobo: 0,
    });
    expect(nonIntegerKobo.valid).toBe(false);

    const zeroTotal = validateScopeAdjustmentRequest({
      bookingId: 'bk_123',
      currentJobStatus: 'IN_PROGRESS',
      category: 'BOTH',
      description: 'Zero cost adjustment',
      additionalLaborKobo: 0,
      additionalMaterialsKobo: 0,
    });
    expect(zeroTotal.valid).toBe(false);

    const validBoth = validateScopeAdjustmentRequest({
      bookingId: 'bk_123',
      currentJobStatus: 'IN_PROGRESS',
      category: 'BOTH',
      description: 'Extra conduit and 1 hour additional wiring',
      additionalLaborKobo: 1000000,
      additionalMaterialsKobo: 1500000,
    });
    expect(validBoth.valid).toBe(true);
    expect(validBoth.request?.totalAdditionalKobo).toBe(2500000);
  });

  it('ONSITE-006: scope adjustment enforces non-empty bounded description (max 500 chars)', () => {
    const emptyDesc = validateScopeAdjustmentRequest({
      bookingId: 'bk_123',
      currentJobStatus: 'IN_PROGRESS',
      category: 'ADDITIONAL_PARTS',
      description: '   ',
      additionalLaborKobo: 0,
      additionalMaterialsKobo: 500000,
    });
    expect(emptyDesc.valid).toBe(false);

    const oversizedDesc = validateScopeAdjustmentRequest({
      bookingId: 'bk_123',
      currentJobStatus: 'IN_PROGRESS',
      category: 'ADDITIONAL_PARTS',
      description: 'A'.repeat(501),
      additionalLaborKobo: 0,
      additionalMaterialsKobo: 500000,
    });
    expect(oversizedDesc.valid).toBe(false);

    const concurrentPending = validateScopeAdjustmentRequest({
      bookingId: 'bk_123',
      currentJobStatus: 'IN_PROGRESS',
      category: 'ADDITIONAL_PARTS',
      description: 'Additional switchboard fuses',
      additionalLaborKobo: 0,
      additionalMaterialsKobo: 500000,
      hasActivePendingAdjustment: true,
    });
    expect(concurrentPending.valid).toBe(false);
    expect(concurrentPending.error).toMatch(/pending/i);
  });

  it('ONSITE-007: scope adjustment approval transitions adjustment state to APPROVED without modifying base quote', () => {
    const initialRequest: ScopeAdjustmentRequest = {
      id: 'adj_001',
      bookingId: 'bk_123',
      category: 'ADDITIONAL_PARTS',
      description: 'New compressor relay',
      additionalLaborKobo: 500000,
      additionalMaterialsKobo: 2000000,
      totalAdditionalKobo: 2500000,
      status: 'PENDING',
      requestedAt: '2026-10-18T10:35:00.000Z',
    };

    const evaluation = evaluateScopeAdjustmentResponse({
      request: initialRequest,
      decision: 'APPROVE',
      baseQuoteKobo: 5000000,
      reviewedAt: '2026-10-18T10:40:00.000Z',
    });

    expect(evaluation.status).toBe('APPROVED');
    expect(evaluation.updatedRequest.status).toBe('APPROVED');
    expect(evaluation.baseQuoteKobo).toBe(5000000);
    expect(evaluation.approvedAdjustmentKobo).toBe(2500000);
    expect(evaluation.totalSettlementKobo).toBe(7500000);
  });

  it('ONSITE-008: scope adjustment decline transitions adjustment state to REJECTED and preserves original scope', () => {
    const initialRequest: ScopeAdjustmentRequest = {
      id: 'adj_002',
      bookingId: 'bk_123',
      category: 'ADDITIONAL_LABOR',
      description: 'Deep duct cleaning',
      additionalLaborKobo: 3000000,
      additionalMaterialsKobo: 0,
      totalAdditionalKobo: 3000000,
      status: 'PENDING',
      requestedAt: '2026-10-18T10:35:00.000Z',
    };

    const evaluation = evaluateScopeAdjustmentResponse({
      request: initialRequest,
      decision: 'DECLINE',
      baseQuoteKobo: 5000000,
      rejectionReason: 'Customer prefers to keep initial basic service',
      reviewedAt: '2026-10-18T10:42:00.000Z',
    });

    expect(evaluation.status).toBe('REJECTED');
    expect(evaluation.updatedRequest.status).toBe('REJECTED');
    expect(evaluation.updatedRequest.rejectionReason).toBe(
      'Customer prefers to keep initial basic service'
    );
    expect(evaluation.baseQuoteKobo).toBe(5000000);
    expect(evaluation.approvedAdjustmentKobo).toBe(0);
    expect(evaluation.totalSettlementKobo).toBe(5000000);
  });

  it('ONSITE-009: completion submission requires booking status IN_PROGRESS and transitions to PENDING_COMPLETION', () => {
    const valid = validateCompletionSubmission({
      bookingId: 'bk_123',
      currentJobStatus: 'IN_PROGRESS',
      photoProofUrls: ['https://cdn.bukiebrainjobs.com/proof/p1.jpg'],
      summaryNote: 'Wiring completed and tested with multimeter.',
    });
    expect(valid.valid).toBe(true);
    expect(valid.targetStatus).toBe('PENDING_COMPLETION');

    const invalidStatus = validateCompletionSubmission({
      bookingId: 'bk_123',
      currentJobStatus: 'CONFIRMED',
      photoProofUrls: ['https://cdn.bukiebrainjobs.com/proof/p1.jpg'],
      summaryNote: 'Work done',
    });
    expect(invalidStatus.valid).toBe(false);
    expect(invalidStatus.error).toMatch(/IN_PROGRESS/i);

    const pendingAdjustment = validateCompletionSubmission({
      bookingId: 'bk_123',
      currentJobStatus: 'IN_PROGRESS',
      photoProofUrls: ['https://cdn.bukiebrainjobs.com/proof/p1.jpg'],
      summaryNote: 'Wiring completed',
      hasPendingScopeAdjustment: true,
    });
    expect(pendingAdjustment.valid).toBe(false);
    expect(pendingAdjustment.error).toMatch(/pending scope adjustment/i);
  });

  it('ONSITE-010: completion submission validates required photo proof and completion summary note', () => {
    const missingPhotos = validateCompletionSubmission({
      bookingId: 'bk_123',
      currentJobStatus: 'IN_PROGRESS',
      photoProofUrls: [],
      summaryNote: 'Completed all generator maintenance tasks.',
    });
    expect(missingPhotos.valid).toBe(false);
    expect(missingPhotos.error).toMatch(/photo proof/i);

    const missingNote = validateCompletionSubmission({
      bookingId: 'bk_123',
      currentJobStatus: 'IN_PROGRESS',
      photoProofUrls: ['https://cdn.bukiebrainjobs.com/proof/gen.jpg'],
      summaryNote: '   ',
    });
    expect(missingNote.valid).toBe(false);
    expect(missingNote.error).toMatch(/summary note/i);

    const mockNow = '2026-10-18T11:00:00.000Z';
    const success = validateCompletionSubmission({
      bookingId: 'bk_123',
      currentJobStatus: 'IN_PROGRESS',
      photoProofUrls: [
        'https://cdn.bukiebrainjobs.com/proof/gen-before.jpg',
        'https://cdn.bukiebrainjobs.com/proof/gen-after.jpg',
      ],
      summaryNote:
        'Filter replaced, oil topped up, and voltage verified under load.',
      now: mockNow,
    });
    expect(success.valid).toBe(true);
    expect(success.payload?.submittedAt).toBe(mockNow);
    expect(success.payload?.photoProofUrls).toHaveLength(2);
  });
});

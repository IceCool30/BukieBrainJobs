// apps/web/lib/onsite/repository.test.ts
// BW-008: On-Site Work & In-Progress Verification
// Phase 2 RED: Repository Contracts REP-001 through REP-010

import { beforeEach, describe, expect, it } from 'vitest';
import { InMemoryOnSiteRepository } from './repository';
import type {
  CheckInSnapshot,
  OnSiteVerificationState,
  ScopeAdjustmentRequest,
} from './types';

function createMockState(
  overrides?: Partial<OnSiteVerificationState>
): OnSiteVerificationState {
  return {
    bookingId: 'bk_onsite_001',
    jobStatus: 'CONFIRMED',
    escrowStatus: 'ESCROW_HELD',
    scopeAdjustments: [],
    baseQuoteKobo: 5000000,
    approvedAdjustmentKobo: 0,
    totalSettlementKobo: 5000000,
    ...overrides,
  };
}

describe('BW-008 Phase 2 RED: On-Site Repository Contracts', () => {
  let repository: InMemoryOnSiteRepository;

  beforeEach(() => {
    repository = new InMemoryOnSiteRepository();
  });

  it('REP-001: getOnSiteState returns null for unknown booking or initialized default state for an existing booking', async () => {
    const unknown = await repository.getOnSiteState('unknown_booking');
    expect(unknown).toBeNull();

    const initial = createMockState();
    await repository.initOnSiteState(initial);

    const loaded = await repository.getOnSiteState('bk_onsite_001');
    expect(loaded).toEqual(initial);
  });

  it('REP-002: recordCheckIn successfully transitions booking from CONFIRMED to IN_PROGRESS and records arrival snapshot when escrow is ESCROW_HELD', async () => {
    const initial = createMockState();
    await repository.initOnSiteState(initial);

    const snapshot: CheckInSnapshot = {
      coordinates: { latitude: 6.5244, longitude: 3.3792, accuracyMeters: 10 },
      capturedAt: '2026-10-18T10:30:00.000Z',
    };

    const result = await repository.recordCheckIn(
      'bk_onsite_001',
      snapshot,
      '2026-10-18T10:30:00.000Z'
    );

    expect(result.eligible).toBe(true);
    expect(result.targetStatus).toBe('IN_PROGRESS');

    const updated = await repository.getOnSiteState('bk_onsite_001');
    expect(updated?.jobStatus).toBe('IN_PROGRESS');
    expect(updated?.checkedInAt).toBe('2026-10-18T10:30:00.000Z');
    expect(updated?.checkInSnapshot).toEqual(snapshot);
  });

  it('REP-003: recordCheckIn fails closed and preserves CONFIRMED status if escrow is UNFUNDED or coordinates/landmark are missing', async () => {
    const unfundedState = createMockState({ escrowStatus: 'UNFUNDED' });
    await repository.initOnSiteState(unfundedState);

    const snapshot: CheckInSnapshot = {
      coordinates: { latitude: 6.5244, longitude: 3.3792 },
      capturedAt: '2026-10-18T10:30:00.000Z',
    };

    const result = await repository.recordCheckIn(
      'bk_onsite_001',
      snapshot,
      '2026-10-18T10:30:00.000Z'
    );

    expect(result.eligible).toBe(false);
    expect(result.error).toMatch(/escrow/i);

    const unchanged = await repository.getOnSiteState('bk_onsite_001');
    expect(unchanged?.jobStatus).toBe('CONFIRMED');
    expect(unchanged?.checkedInAt).toBeUndefined();
  });

  it('REP-004: submitScopeAdjustment creates a PENDING adjustment when booking is IN_PROGRESS and updates activeScopeAdjustment', async () => {
    const inProgressState = createMockState({ jobStatus: 'IN_PROGRESS' });
    await repository.initOnSiteState(inProgressState);

    const result = await repository.submitScopeAdjustment({
      bookingId: 'bk_onsite_001',
      category: 'ADDITIONAL_PARTS',
      description: 'Replaced cracked copper pipe joint',
      additionalLaborKobo: 0,
      additionalMaterialsKobo: 1500000,
    });

    expect(result.valid).toBe(true);
    expect(result.request?.status).toBe('PENDING');
    expect(result.request?.totalAdditionalKobo).toBe(1500000);

    const updated = await repository.getOnSiteState('bk_onsite_001');
    expect(updated?.activeScopeAdjustment).toBeDefined();
    expect(updated?.activeScopeAdjustment?.status).toBe('PENDING');
    expect(updated?.scopeAdjustments).toHaveLength(1);
  });

  it('REP-005: submitScopeAdjustment rejects if an active PENDING scope adjustment already exists for the booking', async () => {
    const existingAdjustment: ScopeAdjustmentRequest = {
      id: 'adj_001',
      bookingId: 'bk_onsite_001',
      category: 'ADDITIONAL_LABOR',
      description: 'Extra conduit installation',
      additionalLaborKobo: 1000000,
      additionalMaterialsKobo: 0,
      totalAdditionalKobo: 1000000,
      status: 'PENDING',
      requestedAt: '2026-10-18T10:32:00.000Z',
    };

    const stateWithPending = createMockState({
      jobStatus: 'IN_PROGRESS',
      activeScopeAdjustment: existingAdjustment,
      scopeAdjustments: [existingAdjustment],
    });
    await repository.initOnSiteState(stateWithPending);

    const result = await repository.submitScopeAdjustment({
      bookingId: 'bk_onsite_001',
      category: 'ADDITIONAL_PARTS',
      description: 'Extra copper pipe',
      additionalLaborKobo: 0,
      additionalMaterialsKobo: 500000,
    });

    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/pending/i);

    const stateAfter = await repository.getOnSiteState('bk_onsite_001');
    expect(stateAfter?.scopeAdjustments).toHaveLength(1);
  });

  it('REP-006: respondToScopeAdjustment with APPROVE updates adjustment to APPROVED, clears active pending slot, and increments totalSettlementKobo', async () => {
    const pendingAdjustment: ScopeAdjustmentRequest = {
      id: 'adj_001',
      bookingId: 'bk_onsite_001',
      category: 'BOTH',
      description: 'New breaker switch and wiring labor',
      additionalLaborKobo: 1000000,
      additionalMaterialsKobo: 1500000,
      totalAdditionalKobo: 2500000,
      status: 'PENDING',
      requestedAt: '2026-10-18T10:32:00.000Z',
    };

    const stateWithPending = createMockState({
      jobStatus: 'IN_PROGRESS',
      baseQuoteKobo: 5000000,
      totalSettlementKobo: 5000000,
      activeScopeAdjustment: pendingAdjustment,
      scopeAdjustments: [pendingAdjustment],
    });
    await repository.initOnSiteState(stateWithPending);

    const response = await repository.respondToScopeAdjustment(
      'bk_onsite_001',
      'adj_001',
      'APPROVE',
      undefined,
      '2026-10-18T10:40:00.000Z'
    );

    expect(response.status).toBe('APPROVED');
    expect(response.approvedAdjustmentKobo).toBe(2500000);
    expect(response.totalSettlementKobo).toBe(7500000);

    const updated = await repository.getOnSiteState('bk_onsite_001');
    expect(updated?.activeScopeAdjustment).toBeUndefined();
    expect(updated?.approvedAdjustmentKobo).toBe(2500000);
    expect(updated?.totalSettlementKobo).toBe(7500000);
    expect(updated?.baseQuoteKobo).toBe(5000000);
    expect(updated?.scopeAdjustments[0]?.status).toBe('APPROVED');
  });

  it('REP-007: respondToScopeAdjustment with DECLINE updates adjustment to REJECTED, clears active pending slot, and preserves original totalSettlementKobo', async () => {
    const pendingAdjustment: ScopeAdjustmentRequest = {
      id: 'adj_002',
      bookingId: 'bk_onsite_001',
      category: 'ADDITIONAL_PARTS',
      description: 'Premium copper pipe upgrade',
      additionalLaborKobo: 0,
      additionalMaterialsKobo: 3000000,
      totalAdditionalKobo: 3000000,
      status: 'PENDING',
      requestedAt: '2026-10-18T10:32:00.000Z',
    };

    const stateWithPending = createMockState({
      jobStatus: 'IN_PROGRESS',
      baseQuoteKobo: 5000000,
      totalSettlementKobo: 5000000,
      activeScopeAdjustment: pendingAdjustment,
      scopeAdjustments: [pendingAdjustment],
    });
    await repository.initOnSiteState(stateWithPending);

    const response = await repository.respondToScopeAdjustment(
      'bk_onsite_001',
      'adj_002',
      'DECLINE',
      'Customer declined upgrade',
      '2026-10-18T10:42:00.000Z'
    );

    expect(response.status).toBe('REJECTED');
    expect(response.approvedAdjustmentKobo).toBe(0);
    expect(response.totalSettlementKobo).toBe(5000000);

    const updated = await repository.getOnSiteState('bk_onsite_001');
    expect(updated?.activeScopeAdjustment).toBeUndefined();
    expect(updated?.approvedAdjustmentKobo).toBe(0);
    expect(updated?.totalSettlementKobo).toBe(5000000);
    expect(updated?.baseQuoteKobo).toBe(5000000);
    expect(updated?.scopeAdjustments[0]?.status).toBe('REJECTED');
    expect(updated?.scopeAdjustments[0]?.rejectionReason).toBe(
      'Customer declined upgrade'
    );
  });

  it('REP-008: respondToScopeAdjustment fails closed if target adjustment does not exist or is already resolved', async () => {
    const state = createMockState({ jobStatus: 'IN_PROGRESS' });
    await repository.initOnSiteState(state);

    await expect(
      repository.respondToScopeAdjustment(
        'bk_onsite_001',
        'nonexistent_adj',
        'APPROVE'
      )
    ).rejects.toThrow(/not found|PENDING/i);
  });

  it('REP-009: submitCompletion transitions status to PENDING_COMPLETION, persists photo proof URLs and summary note, and freezes further scope adjustments', async () => {
    const inProgressState = createMockState({ jobStatus: 'IN_PROGRESS' });
    await repository.initOnSiteState(inProgressState);

    const completionResult = await repository.submitCompletion({
      bookingId: 'bk_onsite_001',
      photoProofUrls: ['https://cdn.bukiebrainjobs.com/proof/p1.jpg'],
      summaryNote: 'Work completed and tested under normal load',
      now: '2026-10-18T11:00:00.000Z',
    });

    expect(completionResult.valid).toBe(true);
    expect(completionResult.targetStatus).toBe('PENDING_COMPLETION');

    const updated = await repository.getOnSiteState('bk_onsite_001');
    expect(updated?.jobStatus).toBe('PENDING_COMPLETION');
    expect(updated?.completionSubmission?.photoProofUrls).toHaveLength(1);
    expect(updated?.completedAt).toBe('2026-10-18T11:00:00.000Z');

    const frozenScope = await repository.submitScopeAdjustment({
      bookingId: 'bk_onsite_001',
      category: 'ADDITIONAL_PARTS',
      description: 'Post-completion parts request',
      additionalLaborKobo: 0,
      additionalMaterialsKobo: 500000,
    });
    expect(frozenScope.valid).toBe(false);
    expect(frozenScope.error).toMatch(/IN_PROGRESS/i);
  });

  it('REP-010: submitCompletion rejects if an unresolved pending scope adjustment exists', async () => {
    const pendingAdjustment: ScopeAdjustmentRequest = {
      id: 'adj_003',
      bookingId: 'bk_onsite_001',
      category: 'ADDITIONAL_LABOR',
      description: 'Extra cleanup labor',
      additionalLaborKobo: 1000000,
      additionalMaterialsKobo: 0,
      totalAdditionalKobo: 1000000,
      status: 'PENDING',
      requestedAt: '2026-10-18T10:35:00.000Z',
    };

    const stateWithPending = createMockState({
      jobStatus: 'IN_PROGRESS',
      activeScopeAdjustment: pendingAdjustment,
      scopeAdjustments: [pendingAdjustment],
    });
    await repository.initOnSiteState(stateWithPending);

    const completionResult = await repository.submitCompletion({
      bookingId: 'bk_onsite_001',
      photoProofUrls: ['https://cdn.bukiebrainjobs.com/proof/p2.jpg'],
      summaryNote: 'Attempted completion with unresolved adjustment',
    });

    expect(completionResult.valid).toBe(false);
    expect(completionResult.error).toMatch(/pending scope adjustment/i);

    const unchanged = await repository.getOnSiteState('bk_onsite_001');
    expect(unchanged?.jobStatus).toBe('IN_PROGRESS');
    expect(unchanged?.completionSubmission).toBeUndefined();
  });
});

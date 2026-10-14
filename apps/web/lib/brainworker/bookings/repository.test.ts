// apps/web/lib/brainworker/bookings/repository.test.ts
// BW-004 Phase 2 RED: Repository and Tenant Isolation (REP-001 to REP-014)
// Authoritative References:
// - docs/specs/BW-004-architecture-contract.md (Approved)
// - docs/specs/BW-004-test-first-implementation-plan.md (Approved)
// - docs/specs/BW-004-booking-management.md (Approved)

import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as authStorage from '../../auth/storage';
import {
  createBookingsTestHarness,
  resetBookingsRepository,
  FIXTURE_APPROVED_BRAINWORKER_A,
  FIXTURE_APPROVED_BRAINWORKER_B,
  FIXTURE_UNAPPROVED_BRAINWORKER,
  FIXTURE_INCOMPLETE_BRAINWORKER,
  mockApprovedWorkerA,
  mockApprovedWorkerB,
  mockUnapprovedWorker,
  mockIncompleteWorker,
  mockCustomerUser,
  FIXTURE_LOCATION_SNAPSHOT,
  bookingOwnedByA,
  bookingOwnedByB,
} from './testing';
import {
  ForbiddenTenantAccessError,
  IncompleteProfileError,
  OfflineMutationError,
} from './types';

describe('BW-004 Phase 2: Repository and Tenant Isolation (REP-001 to REP-014)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
    resetBookingsRepository();
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockApprovedWorkerA);
  });

  // ---------------------------------------------------------------------------
  // REP-001: Unauthenticated read refused
  // ---------------------------------------------------------------------------
  it('REP-001: rejects booking reads when caller is unauthenticated or wrong role', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(null);
    const { repository } = createBookingsTestHarness();

    await expect(
      repository.getBookings(FIXTURE_APPROVED_BRAINWORKER_A)
    ).rejects.toThrow(ForbiddenTenantAccessError);

    await expect(
      repository.getBooking(FIXTURE_APPROVED_BRAINWORKER_A, 'booking-a-001')
    ).rejects.toThrow(ForbiddenTenantAccessError);

    // Customer role is rejected
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockCustomerUser);
    await expect(
      repository.getBookings(FIXTURE_APPROVED_BRAINWORKER_A)
    ).rejects.toThrow(ForbiddenTenantAccessError);
  });

  // ---------------------------------------------------------------------------
  // REP-002: Cross-provider read refused
  // ---------------------------------------------------------------------------
  it("REP-002: rejects read of another provider's bookings (tenant isolation)", async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockApprovedWorkerA);
    const { repository, seedBooking } = createBookingsTestHarness();
    seedBooking(FIXTURE_APPROVED_BRAINWORKER_B, bookingOwnedByB());

    await expect(
      repository.getBookings(FIXTURE_APPROVED_BRAINWORKER_B)
    ).rejects.toThrow(ForbiddenTenantAccessError);

    await expect(
      repository.getBooking(FIXTURE_APPROVED_BRAINWORKER_B, 'booking-b-001')
    ).rejects.toThrow(ForbiddenTenantAccessError);
  });

  // ---------------------------------------------------------------------------
  // REP-003: Cross-provider mutation refused
  // ---------------------------------------------------------------------------
  it('REP-003: rejects mutations when caller is not the assigned provider', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockApprovedWorkerA);
    const { repository, seedBooking } = createBookingsTestHarness();
    seedBooking(FIXTURE_APPROVED_BRAINWORKER_B, bookingOwnedByB());

    await expect(
      repository.updateDispatchStatus(
        FIXTURE_APPROVED_BRAINWORKER_B,
        'booking-b-001',
        'EN_ROUTE'
      )
    ).rejects.toThrow(ForbiddenTenantAccessError);

    await expect(
      repository.checkIn(
        FIXTURE_APPROVED_BRAINWORKER_B,
        'booking-b-001',
        FIXTURE_LOCATION_SNAPSHOT
      )
    ).rejects.toThrow(ForbiddenTenantAccessError);

    await expect(
      repository.cancelBooking(
        FIXTURE_APPROVED_BRAINWORKER_B,
        'booking-b-001',
        'SCHEDULE_CONFLICT'
      )
    ).rejects.toThrow(ForbiddenTenantAccessError);
  });

  // ---------------------------------------------------------------------------
  // REP-004: Unapproved provider mutation refused
  // ---------------------------------------------------------------------------
  it('REP-004: rejects reads and mutations from unapproved or incomplete operational profiles', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockUnapprovedWorker);
    const { repository, seedBooking } = createBookingsTestHarness();
    seedBooking(FIXTURE_UNAPPROVED_BRAINWORKER, bookingOwnedByA({ taskerProfileId: FIXTURE_UNAPPROVED_BRAINWORKER }));

    await expect(
      repository.getBookings(FIXTURE_UNAPPROVED_BRAINWORKER)
    ).rejects.toThrow(ForbiddenTenantAccessError);

    await expect(
      repository.cancelBooking(
        FIXTURE_UNAPPROVED_BRAINWORKER,
        'booking-a-001',
        'SCHEDULE_CONFLICT'
      )
    ).rejects.toThrow(ForbiddenTenantAccessError);

    // Incomplete operational profile rejected
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockIncompleteWorker);
    await expect(
      repository.getBookings(FIXTURE_INCOMPLETE_BRAINWORKER)
    ).rejects.toThrow(IncompleteProfileError);

    await expect(
      repository.updateDispatchStatus(
        FIXTURE_INCOMPLETE_BRAINWORKER,
        'booking-a-001',
        'EN_ROUTE'
      )
    ).rejects.toThrow(IncompleteProfileError);
  });

  // ---------------------------------------------------------------------------
  // REP-005: Missing booking ID returns not found
  // ---------------------------------------------------------------------------
  it('REP-005: returns null or not-found result when booking does not exist', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockApprovedWorkerA);
    const { repository } = createBookingsTestHarness();

    const result = await repository.getBooking(
      FIXTURE_APPROVED_BRAINWORKER_A,
      'non-existent-booking-id'
    );
    expect(result).toBeNull();

    const mutationResult = await repository.updateDispatchStatus(
      FIXTURE_APPROVED_BRAINWORKER_A,
      'non-existent-booking-id',
      'EN_ROUTE'
    );
    expect(mutationResult.ok).toBe(false);
    if (!mutationResult.ok) {
      expect(mutationResult.reason).toBe('NOT_FOUND');
    }
  });

  // ---------------------------------------------------------------------------
  // REP-006: Storage is tenant-scoped by BrainWorker ID
  // ---------------------------------------------------------------------------
  it('REP-006: storage keys and records are partitioned by BrainWorker ID', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockApprovedWorkerA);
    const { repository, seedBooking } = createBookingsTestHarness();
    seedBooking(FIXTURE_APPROVED_BRAINWORKER_A, bookingOwnedByA());
    seedBooking(FIXTURE_APPROVED_BRAINWORKER_B, bookingOwnedByB());

    const pageA = await repository.getBookings(FIXTURE_APPROVED_BRAINWORKER_A);
    expect(pageA.items).toHaveLength(1);
    expect(pageA.items[0]?.bookingId).toBe('booking-a-001');

    // Worker B sees only booking B
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockApprovedWorkerB);
    const pageB = await repository.getBookings(FIXTURE_APPROVED_BRAINWORKER_B);
    expect(pageB.items).toHaveLength(1);
    expect(pageB.items[0]?.bookingId).toBe('booking-b-001');

    // Cross-tenant item lookup returns null (not-found, identical to missing booking per ARCH s2)
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockApprovedWorkerA);
    const foreignLookup = await repository.getBooking(
      FIXTURE_APPROVED_BRAINWORKER_A,
      'booking-b-001'
    );
    expect(foreignLookup).toBeNull();
  });

  // ---------------------------------------------------------------------------
  // REP-007: Offline mutation fails closed with OFFLINE
  // ---------------------------------------------------------------------------
  it('REP-007: offline mutations fail closed; cached reads remain available', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockApprovedWorkerA);
    const { repository, seedBooking, setOffline } = createBookingsTestHarness();
    seedBooking(FIXTURE_APPROVED_BRAINWORKER_A, bookingOwnedByA());

    setOffline(true);

    await expect(
      repository.updateDispatchStatus(
        FIXTURE_APPROVED_BRAINWORKER_A,
        'booking-a-001',
        'EN_ROUTE'
      )
    ).rejects.toThrow(OfflineMutationError);

    await expect(
      repository.checkIn(
        FIXTURE_APPROVED_BRAINWORKER_A,
        'booking-a-001',
        FIXTURE_LOCATION_SNAPSHOT
      )
    ).rejects.toThrow(OfflineMutationError);

    await expect(
      repository.cancelBooking(
        FIXTURE_APPROVED_BRAINWORKER_A,
        'booking-a-001',
        'SCHEDULE_CONFLICT'
      )
    ).rejects.toThrow(OfflineMutationError);

    // Read remains available from tenant cache
    const page = await repository.getBookings(FIXTURE_APPROVED_BRAINWORKER_A);
    expect(page.items.length).toBeGreaterThanOrEqual(1);
  });

  // ---------------------------------------------------------------------------
  // REP-008: No stored location snapshot survives for later submission
  // ---------------------------------------------------------------------------
  it('REP-008: no stored location snapshot is queued or retained after an offline failure', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockApprovedWorkerA);
    const { repository, seedBooking, setOffline } = createBookingsTestHarness();
    seedBooking(FIXTURE_APPROVED_BRAINWORKER_A, bookingOwnedByA());

    setOffline(true);
    await expect(
      repository.checkIn(
        FIXTURE_APPROVED_BRAINWORKER_A,
        'booking-a-001',
        FIXTURE_LOCATION_SNAPSHOT
      )
    ).rejects.toThrow(OfflineMutationError);

    // Come back online; no snapshot should have survived in an offline queue
    setOffline(false);
    const booking = await repository.getBooking(
      FIXTURE_APPROVED_BRAINWORKER_A,
      'booking-a-001'
    );
    expect(booking?.jobStatus).toBe('CONFIRMED');
    expect(booking?.dispatchStatus).toBe('NOT_STARTED');
    expect(booking?.actualStartAt).toBeUndefined();
  });

  // ---------------------------------------------------------------------------
  // REP-009: Production export surface contains no testing helpers
  // ---------------------------------------------------------------------------
  it('REP-009: production repository module does not export testing helpers or harness', async () => {
    const repositoryModule = await import('./repository');
    const exportedKeys = Object.keys(repositoryModule);

    expect(exportedKeys).not.toContain('createBookingsTestHarness');
    expect(exportedKeys).not.toContain('FIXTURE_APPROVED_BRAINWORKER_A');
    expect(exportedKeys).not.toContain('mockApprovedWorkerA');
    expect(exportedKeys).not.toContain('bookingOwnedByA');

    expect(typeof repositoryModule.createBrainWorkerBookingsRepository).toBe('function');
    expect(typeof repositoryModule.getBrainWorkerBookingsRepository).toBe('function');
  });

  // ---------------------------------------------------------------------------
  // REP-010: Production modules contain zero testing/ imports
  // ---------------------------------------------------------------------------
  it('REP-010: production modules contain zero imports from testing/ or test fixtures', () => {
    const bookingsDir = path.resolve(__dirname);
    const productionFiles = ['repository.ts', 'domain.ts', 'types.ts'];

    for (const file of productionFiles) {
      const filePath = path.join(bookingsDir, file);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf-8');
        expect(content).not.toMatch(/from\s+['"].*\/testing(\/.*)?['"]/);
      }
    }
  });

  // ---------------------------------------------------------------------------
  // REP-011: Compare-and-set rejects a stale concurrent mutation
  // ---------------------------------------------------------------------------
  it('REP-011: rejects stale concurrent mutation when observed state changed', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockApprovedWorkerA);
    const { repository, seedBooking, mutateBookingDirectly } = createBookingsTestHarness();
    seedBooking(FIXTURE_APPROVED_BRAINWORKER_A, bookingOwnedByA({ jobStatus: 'CONFIRMED' }));

    // Simulate concurrent cancellation by customer in the store
    mutateBookingDirectly(FIXTURE_APPROVED_BRAINWORKER_A, 'booking-a-001', (b) => {
      b.jobStatus = 'CANCELLED';
    });

    const mutationResult = await repository.updateDispatchStatus(
      FIXTURE_APPROVED_BRAINWORKER_A,
      'booking-a-001',
      'EN_ROUTE'
    );

    expect(mutationResult.ok).toBe(false);
    if (!mutationResult.ok) {
      expect(['STALE_STATE', 'INVALID_TRANSITION']).toContain(mutationResult.reason);
      expect(mutationResult.authoritative?.jobStatus).toBe('CANCELLED');
    }
  });

  // ---------------------------------------------------------------------------
  // REP-012: Exact address unlocks only when 3 inputs hold
  // ---------------------------------------------------------------------------
  it('REP-012: unlocks exact address only when booking is assigned, privacy consent recorded, and escrow held', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockApprovedWorkerA);
    const { repository, seedBooking } = createBookingsTestHarness();
    seedBooking(
      FIXTURE_APPROVED_BRAINWORKER_A,
      bookingOwnedByA({
        privacyConsentRecorded: true,
        escrowStatus: 'held_in_escrow',
        jobStatus: 'CONFIRMED',
      })
    );

    const detail = await repository.getBooking(
      FIXTURE_APPROVED_BRAINWORKER_A,
      'booking-a-001'
    );
    expect(detail).not.toBeNull();
    expect(detail?.exactAddress).toBe('Plot 42, 3rd Avenue, Gwarinpa, Abuja');
  });

  // ---------------------------------------------------------------------------
  // REP-013: Any single failing unlock input returns general area
  // ---------------------------------------------------------------------------
  it('REP-013: masks exact address to general area when any unlock input fails', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockApprovedWorkerA);
    const { repository, seedBooking } = createBookingsTestHarness();

    // Input 1 missing: privacy consent absent
    seedBooking(
      FIXTURE_APPROVED_BRAINWORKER_A,
      bookingOwnedByA({
        bookingId: 'booking-no-consent',
        privacyConsentRecorded: false,
        escrowStatus: 'held_in_escrow',
        jobStatus: 'CONFIRMED',
      })
    );
    const noConsent = await repository.getBooking(
      FIXTURE_APPROVED_BRAINWORKER_A,
      'booking-no-consent'
    );
    expect(noConsent?.exactAddress).toBeUndefined();
    expect(noConsent?.generalLocation.neighbourhoodOrZone).toBe('Gwarinpa');

    // Input 2 missing: escrow not held
    seedBooking(
      FIXTURE_APPROVED_BRAINWORKER_A,
      bookingOwnedByA({
        bookingId: 'booking-unfunded',
        privacyConsentRecorded: true,
        escrowStatus: 'unfunded',
        jobStatus: 'CONFIRMED',
      })
    );
    const unfunded = await repository.getBooking(
      FIXTURE_APPROVED_BRAINWORKER_A,
      'booking-unfunded'
    );
    expect(unfunded?.exactAddress).toBeUndefined();

    // Input 3 invalid: pre-confirmed lifecycle state
    seedBooking(
      FIXTURE_APPROVED_BRAINWORKER_A,
      bookingOwnedByA({
        bookingId: 'booking-pre-confirmed',
        privacyConsentRecorded: true,
        escrowStatus: 'held_in_escrow',
        jobStatus: 'PENDING_ACCEPTANCE',
      })
    );
    const preConfirmed = await repository.getBooking(
      FIXTURE_APPROVED_BRAINWORKER_A,
      'booking-pre-confirmed'
    );
    expect(preConfirmed?.exactAddress).toBeUndefined();

    // Input 4 invalid: terminal masked lifecycle state
    seedBooking(
      FIXTURE_APPROVED_BRAINWORKER_A,
      bookingOwnedByA({
        bookingId: 'booking-completed',
        privacyConsentRecorded: true,
        escrowStatus: 'held_in_escrow',
        jobStatus: 'COMPLETED',
      })
    );
    const completed = await repository.getBooking(
      FIXTURE_APPROVED_BRAINWORKER_A,
      'booking-completed'
    );
    expect(completed?.exactAddress).toBeUndefined();
  });

  // ---------------------------------------------------------------------------
  // REP-014: Address is scoped to detail, never in list projection
  // ---------------------------------------------------------------------------
  it('REP-014: address is scoped to single booking detail and never exposed in the list projection', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockApprovedWorkerA);
    const { repository, seedBooking } = createBookingsTestHarness();
    seedBooking(
      FIXTURE_APPROVED_BRAINWORKER_A,
      bookingOwnedByA({
        privacyConsentRecorded: true,
        escrowStatus: 'held_in_escrow',
        jobStatus: 'CONFIRMED',
      })
    );

    const page = await repository.getBookings(FIXTURE_APPROVED_BRAINWORKER_A);
    expect(page.items).toHaveLength(1);
    expect((page.items[0] as unknown as { exactAddress?: string }).exactAddress).toBeUndefined();

    const detail = await repository.getBooking(
      FIXTURE_APPROVED_BRAINWORKER_A,
      'booking-a-001'
    );
    expect(detail?.exactAddress).toBe('Plot 42, 3rd Avenue, Gwarinpa, Abuja');
  });
});

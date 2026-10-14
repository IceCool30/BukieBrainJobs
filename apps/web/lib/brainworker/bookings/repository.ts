// apps/web/lib/brainworker/bookings/repository.ts
// BW-004 Phase 2 RED: Repository & Tenant Isolation (REP-001 to REP-014)
// Governed by: BW-004-ARCH v0.2 section 6 (Repository Contract), section 12 (Offline), section 14 (Physical Layout)
//
// Invariant Rules:
// 1. Zero imports from testing/ (REP-009, REP-010).
// 2. Every operation binds to the authenticated BrainWorker identity (REP-001 to REP-004).
// 3. Storage is physically partitioned per BrainWorker ID (REP-006).
// 4. Mutations fail closed while offline (REP-007, REP-008).
// 5. Writes are compare-and-set to reject stale concurrent mutations (REP-011).
// 6. Exact address unlocks only when booking resolution, privacy, and escrow pass (REP-012, REP-013, REP-014).

import type {
  IBrainWorkerBookingsRepository,
  BookingPage,
  ProviderBookingDetail,
  BookingMutationResult,
  ScopeAdjustment,
  ScopeAdjustmentDraft,
  ProviderCancellationReason,
  LocationSnapshot,
  RawBookingRecord,
  BookingFeedEvent,
} from './types';

export interface BrainWorkerBookingsRepositoryDependencies {
  resolveOperationalProfile?: (brainWorkerId: string) => Promise<boolean> | boolean;
  isOffline?: () => boolean;
  partitions?: Map<string, Map<string, RawBookingRecord>>;
}

export class BrainWorkerBookingsRepository implements IBrainWorkerBookingsRepository {
  private readonly dependencies: BrainWorkerBookingsRepositoryDependencies;
  private readonly partitions: Map<string, Map<string, RawBookingRecord>>;

  constructor(dependencies: BrainWorkerBookingsRepositoryDependencies = {}) {
    this.dependencies = dependencies;
    this.partitions = dependencies.partitions ?? new Map<string, Map<string, RawBookingRecord>>();
  }

  // ---------------------------------------------------------------------------
  // IBrainWorkerBookingsRepository - RED Phase Stubs
  // All operational methods throw "RED: not implemented"
  // ---------------------------------------------------------------------------

  async getBookings(
    _brainWorkerId: string,
    _options?: { cursor?: string | undefined; limit?: number | undefined }
  ): Promise<BookingPage> {
    throw new Error('RED: not implemented');
  }

  async getBooking(
    _brainWorkerId: string,
    _bookingId: string
  ): Promise<ProviderBookingDetail | null> {
    throw new Error('RED: not implemented');
  }

  async updateDispatchStatus(
    _brainWorkerId: string,
    _bookingId: string,
    _next: 'EN_ROUTE' | 'ARRIVED',
    _snapshot?: LocationSnapshot | undefined
  ): Promise<BookingMutationResult> {
    throw new Error('RED: not implemented');
  }

  async checkIn(
    _brainWorkerId: string,
    _bookingId: string,
    _snapshot: LocationSnapshot
  ): Promise<BookingMutationResult> {
    throw new Error('RED: not implemented');
  }

  async requestScopeAdjustment(
    _brainWorkerId: string,
    _bookingId: string,
    _draft: ScopeAdjustmentDraft
  ): Promise<ScopeAdjustment> {
    throw new Error('RED: not implemented');
  }

  async withdrawScopeAdjustment(
    _brainWorkerId: string,
    _bookingId: string,
    _adjustmentId: string
  ): Promise<ScopeAdjustment> {
    throw new Error('RED: not implemented');
  }

  async cancelBooking(
    _brainWorkerId: string,
    _bookingId: string,
    _reason: ProviderCancellationReason
  ): Promise<BookingMutationResult> {
    throw new Error('RED: not implemented');
  }

  subscribe?(
    _brainWorkerId: string,
    _listener: (event: BookingFeedEvent) => void
  ): () => void {
    throw new Error('RED: not implemented');
  }
}

let defaultRepository: IBrainWorkerBookingsRepository | null = null;

export function createBrainWorkerBookingsRepository(
  dependencies: BrainWorkerBookingsRepositoryDependencies = {}
): IBrainWorkerBookingsRepository {
  return new BrainWorkerBookingsRepository(dependencies);
}

export function getBrainWorkerBookingsRepository(): IBrainWorkerBookingsRepository {
  if (!defaultRepository) {
    defaultRepository = createBrainWorkerBookingsRepository();
  }
  return defaultRepository;
}

export function resetDefaultBrainWorkerBookingsRepository(): void {
  defaultRepository = null;
}

// apps/web/lib/brainworker/bookings/repository.ts
// BW-004 Phase 2 GREEN: Repository and Tenant Isolation (REP-001 to REP-014)
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
import {
  ForbiddenTenantAccessError,
  IncompleteProfileError,
  OfflineMutationError,
} from './types';
import {
  projectBookingSummary,
  projectBookingDetail,
} from './domain';
import { getMockAuthenticatedUser } from '../../auth/storage';

export interface BrainWorkerBookingsRepositoryDependencies {
  resolveOperationalProfile?: (brainWorkerId: string) => Promise<boolean> | boolean;
  isOffline?: () => boolean;
  partitions?: Map<string, Map<string, RawBookingRecord>>;
}

export class BrainWorkerBookingsRepository implements IBrainWorkerBookingsRepository {
  private readonly dependencies: BrainWorkerBookingsRepositoryDependencies;
  private readonly partitions: Map<string, Map<string, RawBookingRecord>>;
  private readonly subscribers = new Map<string, Set<(event: BookingFeedEvent) => void>>();

  constructor(dependencies: BrainWorkerBookingsRepositoryDependencies = {}) {
    this.dependencies = dependencies;
    this.partitions = dependencies.partitions ?? new Map<string, Map<string, RawBookingRecord>>();
  }

  // ---------------------------------------------------------------------------
  // Tenant and Authorization Guards (REP-001 to REP-004)
  // ---------------------------------------------------------------------------

  private assertAuthorizedTenant(brainWorkerId: string): void {
    if (!brainWorkerId || typeof brainWorkerId !== 'string' || brainWorkerId.trim() === '') {
      throw new ForbiddenTenantAccessError(
        'FORBIDDEN_TENANT_ACCESS: Valid BrainWorker ID is required.'
      );
    }

    const currentUser = getMockAuthenticatedUser();
    if (!currentUser) {
      throw new ForbiddenTenantAccessError(
        'FORBIDDEN_TENANT_ACCESS: Caller authentication is required.'
      );
    }
    if (currentUser.role !== 'brainworker') {
      throw new ForbiddenTenantAccessError(
        'FORBIDDEN_TENANT_ACCESS: Customer accounts cannot access BrainWorker bookings.'
      );
    }
    if (!currentUser.isBrainWorkerApproved) {
      throw new ForbiddenTenantAccessError(
        'FORBIDDEN_TENANT_ACCESS: Unapproved BrainWorkers cannot access bookings.'
      );
    }
    if (currentUser.id !== brainWorkerId) {
      throw new ForbiddenTenantAccessError(
        `FORBIDDEN_TENANT_ACCESS: Session '${currentUser.id}' cannot access bookings for '${brainWorkerId}'.`
      );
    }
  }

  private async assertCompleteProfile(brainWorkerId: string): Promise<void> {
    const resolver = this.dependencies.resolveOperationalProfile;
    if (resolver) {
      const isComplete = await resolver(brainWorkerId);
      if (!isComplete) {
        throw new IncompleteProfileError();
      }
    }
  }

  private assertOnline(): void {
    if (this.dependencies.isOffline?.() === true) {
      throw new OfflineMutationError();
    }
  }

  private notifySubscribers(brainWorkerId: string, event: BookingFeedEvent): void {
    const workerSubscribers = this.subscribers.get(brainWorkerId);
    if (workerSubscribers) {
      for (const listener of workerSubscribers) {
        try {
          listener(event);
        } catch {
          // Listeners must not fail repository operations
        }
      }
    }
  }

  // ---------------------------------------------------------------------------
  // IBrainWorkerBookingsRepository Implementation
  // ---------------------------------------------------------------------------

  async getBookings(
    brainWorkerId: string,
    options?: { cursor?: string | undefined; limit?: number | undefined }
  ): Promise<BookingPage> {
    this.assertAuthorizedTenant(brainWorkerId);
    await this.assertCompleteProfile(brainWorkerId);

    const partition = this.partitions.get(brainWorkerId);
    if (!partition || partition.size === 0) {
      return { items: [] };
    }

    // Deterministic sort by scheduledStartAt ascending (BOOK-012)
    const records = Array.from(partition.values()).sort(
      (a, b) => new Date(a.scheduledStartAt).getTime() - new Date(b.scheduledStartAt).getTime()
    );

    let startIndex = 0;
    if (options?.cursor) {
      const cursorIndex = records.findIndex((r) => r.bookingId === options.cursor);
      if (cursorIndex >= 0) {
        startIndex = cursorIndex + 1;
      }
    }

    const limit = options?.limit ?? records.length;
    const pageRecords = records.slice(startIndex, startIndex + limit);
    const nextCursor =
      startIndex + limit < records.length
        ? pageRecords[pageRecords.length - 1]?.bookingId
        : undefined;

    // List projection omits exactAddress entirely (REP-014)
    const items = pageRecords.map((record) => projectBookingSummary(record));

    return {
      items,
      ...(nextCursor ? { nextCursor } : {}),
    };
  }

  async getBooking(
    brainWorkerId: string,
    bookingId: string
  ): Promise<ProviderBookingDetail | null> {
    this.assertAuthorizedTenant(brainWorkerId);
    await this.assertCompleteProfile(brainWorkerId);

    const partition = this.partitions.get(brainWorkerId);
    const record = partition?.get(bookingId);
    if (!record) {
      return null;
    }

    // Cross-tenant verification: booking must belong to the authenticated provider (ARCH s2)
    if (record.taskerProfileId !== brainWorkerId) {
      return null;
    }

    // Detail projection applies evaluateAddressUnlock for exactAddress (REP-012, REP-013)
    return projectBookingDetail(record);
  }

  async updateDispatchStatus(
    brainWorkerId: string,
    bookingId: string,
    next: 'EN_ROUTE' | 'ARRIVED',
    _snapshot?: LocationSnapshot | undefined
  ): Promise<BookingMutationResult> {
    this.assertAuthorizedTenant(brainWorkerId);
    await this.assertCompleteProfile(brainWorkerId);
    this.assertOnline();

    const partition = this.partitions.get(brainWorkerId);
    const record = partition?.get(bookingId);
    if (!record || record.taskerProfileId !== brainWorkerId) {
      return { ok: false, reason: 'NOT_FOUND' };
    }

    // Concurrency guard: dispatch can only be authored while jobStatus is CONFIRMED (REP-011)
    if (record.jobStatus !== 'CONFIRMED') {
      return {
        ok: false,
        reason: 'STALE_STATE',
        authoritative: {
          jobStatus: record.jobStatus,
          dispatchStatus: record.dispatchStatus,
          escrowStatus: record.escrowStatus,
        },
      };
    }

    // Forward-only dispatch transitions
    if (record.dispatchStatus === 'ARRIVED') {
      return {
        ok: false,
        reason: 'INVALID_TRANSITION',
        authoritative: {
          jobStatus: record.jobStatus,
          dispatchStatus: record.dispatchStatus,
          escrowStatus: record.escrowStatus,
        },
      };
    }

    const nowIso = new Date().toISOString();
    record.dispatchStatus = next;
    record.dispatchUpdatedAt = nowIso;

    this.notifySubscribers(brainWorkerId, {
      type: 'DISPATCH_UPDATED',
      bookingId,
      dispatchStatus: next,
      timestamp: nowIso,
    });

    return {
      ok: true,
      bookingId,
      jobStatus: record.jobStatus,
      dispatchStatus: record.dispatchStatus,
      updatedAt: nowIso,
    };
  }

  async checkIn(
    brainWorkerId: string,
    bookingId: string,
    _snapshot: LocationSnapshot
  ): Promise<BookingMutationResult> {
    this.assertAuthorizedTenant(brainWorkerId);
    await this.assertCompleteProfile(brainWorkerId);
    this.assertOnline();

    const partition = this.partitions.get(brainWorkerId);
    const record = partition?.get(bookingId);
    if (!record || record.taskerProfileId !== brainWorkerId) {
      return { ok: false, reason: 'NOT_FOUND' };
    }

    // Check-in requires CONFIRMED lifecycle (ARCH s7)
    if (record.jobStatus !== 'CONFIRMED') {
      return {
        ok: false,
        reason: 'INVALID_TRANSITION',
        authoritative: {
          jobStatus: record.jobStatus,
          dispatchStatus: record.dispatchStatus,
          escrowStatus: record.escrowStatus,
        },
      };
    }

    // Check-in requires escrow funds held (ARCH s7, WEB-015)
    if (record.escrowStatus !== 'held_in_escrow') {
      return {
        ok: false,
        reason: 'ESCROW_NOT_HELD',
        authoritative: {
          jobStatus: record.jobStatus,
          dispatchStatus: record.dispatchStatus,
          escrowStatus: record.escrowStatus,
        },
      };
    }

    const nowIso = new Date().toISOString();
    record.jobStatus = 'IN_PROGRESS';
    record.actualStartAt = nowIso;

    this.notifySubscribers(brainWorkerId, {
      type: 'CHECKED_IN',
      bookingId,
      timestamp: nowIso,
    });

    return {
      ok: true,
      bookingId,
      jobStatus: record.jobStatus,
      dispatchStatus: record.dispatchStatus,
      updatedAt: nowIso,
    };
  }

  async requestScopeAdjustment(
    brainWorkerId: string,
    bookingId: string,
    draft: ScopeAdjustmentDraft
  ): Promise<ScopeAdjustment> {
    this.assertAuthorizedTenant(brainWorkerId);
    await this.assertCompleteProfile(brainWorkerId);
    this.assertOnline();

    const partition = this.partitions.get(brainWorkerId);
    const record = partition?.get(bookingId);
    if (!record || record.taskerProfileId !== brainWorkerId) {
      throw new Error('NOT_FOUND');
    }

    if (record.jobStatus !== 'IN_PROGRESS') {
      throw new Error('INVALID_TRANSITION: Scope adjustment can only be submitted in IN_PROGRESS');
    }

    if (record.scopeAdjustments.some((adj) => adj.status === 'PENDING')) {
      throw new Error('SCOPE_ADJUSTMENT_ALREADY_PENDING');
    }

    const totalAdditionalKobo =
      Math.max(0, Math.trunc(draft.additionalLaborKobo)) +
      Math.max(0, Math.trunc(draft.additionalMaterialsKobo));

    const nowIso = new Date().toISOString();
    const adjustment: ScopeAdjustment = {
      id: `scope-adj-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      bookingId,
      reason: draft.reason,
      additionalLaborKobo: Math.max(0, Math.trunc(draft.additionalLaborKobo)),
      additionalMaterialsKobo: Math.max(0, Math.trunc(draft.additionalMaterialsKobo)),
      totalAdditionalKobo,
      note: draft.note?.trim(),
      status: 'PENDING',
      submittedAt: nowIso,
    };

    record.scopeAdjustments.push(adjustment);

    this.notifySubscribers(brainWorkerId, {
      type: 'SCOPE_ADJUSTMENT_REQUESTED',
      bookingId,
      adjustmentId: adjustment.id,
      timestamp: nowIso,
    });

    return adjustment;
  }

  async withdrawScopeAdjustment(
    brainWorkerId: string,
    bookingId: string,
    adjustmentId: string
  ): Promise<ScopeAdjustment> {
    this.assertAuthorizedTenant(brainWorkerId);
    await this.assertCompleteProfile(brainWorkerId);
    this.assertOnline();

    const partition = this.partitions.get(brainWorkerId);
    const record = partition?.get(bookingId);
    if (!record || record.taskerProfileId !== brainWorkerId) {
      throw new Error('NOT_FOUND');
    }

    const adjustment = record.scopeAdjustments.find((adj) => adj.id === adjustmentId);
    if (!adjustment) {
      throw new Error('NOT_FOUND');
    }

    if (adjustment.status !== 'PENDING') {
      throw new Error('INVALID_TRANSITION: Cannot withdraw a non-pending scope adjustment');
    }

    adjustment.status = 'WITHDRAWN';
    const nowIso = new Date().toISOString();

    this.notifySubscribers(brainWorkerId, {
      type: 'SCOPE_ADJUSTMENT_WITHDRAWN',
      bookingId,
      adjustmentId,
      timestamp: nowIso,
    });

    return adjustment;
  }

  async cancelBooking(
    brainWorkerId: string,
    bookingId: string,
    reason: ProviderCancellationReason
  ): Promise<BookingMutationResult> {
    this.assertAuthorizedTenant(brainWorkerId);
    await this.assertCompleteProfile(brainWorkerId);
    this.assertOnline();

    const partition = this.partitions.get(brainWorkerId);
    const record = partition?.get(bookingId);
    if (!record || record.taskerProfileId !== brainWorkerId) {
      return { ok: false, reason: 'NOT_FOUND' };
    }

    if (record.jobStatus !== 'CONFIRMED') {
      return {
        ok: false,
        reason: 'INVALID_TRANSITION',
        authoritative: {
          jobStatus: record.jobStatus,
          dispatchStatus: record.dispatchStatus,
          escrowStatus: record.escrowStatus,
        },
      };
    }

    const nowIso = new Date().toISOString();
    record.jobStatus = 'CANCELLED';
    record.cancellationReason = reason;

    this.notifySubscribers(brainWorkerId, {
      type: 'BOOKING_CANCELLED_BY_PROVIDER',
      bookingId,
      reason,
      timestamp: nowIso,
    });

    return {
      ok: true,
      bookingId,
      jobStatus: record.jobStatus,
      dispatchStatus: record.dispatchStatus,
      updatedAt: nowIso,
    };
  }

  subscribe(
    brainWorkerId: string,
    listener: (event: BookingFeedEvent) => void
  ): () => void {
    let workerSubscribers = this.subscribers.get(brainWorkerId);
    if (!workerSubscribers) {
      workerSubscribers = new Set();
      this.subscribers.set(brainWorkerId, workerSubscribers);
    }
    workerSubscribers.add(listener);

    return () => {
      workerSubscribers?.delete(listener);
    };
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

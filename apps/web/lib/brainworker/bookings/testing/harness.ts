// apps/web/lib/brainworker/bookings/testing/harness.ts
// Deterministic test harness for BW-004 Phase 2 Repository & Tenant Isolation
// Governed by: BW-004-ARCH v0.2 section 6, section 12, section 14
// Strictly for testing. Must never be imported by production code.

import type { IBrainWorkerBookingsRepository, RawBookingRecord } from '../types';
import {
  createBrainWorkerBookingsRepository,
  resetDefaultBrainWorkerBookingsRepository,
  type BrainWorkerBookingsRepositoryDependencies,
} from '../repository';
import {
  FIXTURE_APPROVED_BRAINWORKER_A,
  FIXTURE_APPROVED_BRAINWORKER_B,
  FIXTURE_INCOMPLETE_BRAINWORKER,
} from './fixtures';

export interface BookingsTestHarness {
  repository: IBrainWorkerBookingsRepository;
  seedBooking: (brainWorkerId: string, booking: RawBookingRecord) => void;
  setOffline: (offline: boolean) => void;
  mutateBookingDirectly: (
    brainWorkerId: string,
    bookingId: string,
    mutator: (booking: RawBookingRecord) => void
  ) => void;
}

const fixtureOperationalProfileResolver = (
  brainWorkerId: string
): boolean => {
  if (brainWorkerId === FIXTURE_INCOMPLETE_BRAINWORKER) {
    return false;
  }
  if (
    brainWorkerId === FIXTURE_APPROVED_BRAINWORKER_A ||
    brainWorkerId === FIXTURE_APPROVED_BRAINWORKER_B
  ) {
    return true;
  }
  return false;
};

export interface BookingsTestHarnessOptions {
  dependencies?: BrainWorkerBookingsRepositoryDependencies | undefined;
}

export function createBookingsTestHarness(
  options: BookingsTestHarnessOptions = {}
): BookingsTestHarness {
  const defaultDeps: BrainWorkerBookingsRepositoryDependencies = {
    resolveOperationalProfile: fixtureOperationalProfileResolver,
  };

  const repository = createBrainWorkerBookingsRepository({
    ...defaultDeps,
    ...options.dependencies,
  });

  return {
    repository,
    seedBooking: (brainWorkerId: string, booking: RawBookingRecord) => {
      const seedable = repository as unknown as {
        __testSeedBooking?: (brainWorkerId: string, booking: RawBookingRecord) => void;
      };
      if (typeof seedable.__testSeedBooking === 'function') {
        seedable.__testSeedBooking(brainWorkerId, booking);
      }
    },
    setOffline: (offline: boolean) => {
      const offlineable = repository as unknown as {
        __testSetOffline?: (offline: boolean) => void;
      };
      if (typeof offlineable.__testSetOffline === 'function') {
        offlineable.__testSetOffline(offline);
      }
    },
    mutateBookingDirectly: (
      brainWorkerId: string,
      bookingId: string,
      mutator: (booking: RawBookingRecord) => void
    ) => {
      const directable = repository as unknown as {
        __testMutateDirectly?: (
          brainWorkerId: string,
          bookingId: string,
          mutator: (booking: RawBookingRecord) => void
        ) => void;
      };
      if (typeof directable.__testMutateDirectly === 'function') {
        directable.__testMutateDirectly(brainWorkerId, bookingId, mutator);
      }
    },
  };
}

export function resetBookingsRepository(): void {
  resetDefaultBrainWorkerBookingsRepository();
}

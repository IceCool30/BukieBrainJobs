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
  const partitions = new Map<string, Map<string, RawBookingRecord>>();
  let offline = false;

  const defaultDeps: BrainWorkerBookingsRepositoryDependencies = {
    resolveOperationalProfile: fixtureOperationalProfileResolver,
    isOffline: () => offline,
    partitions,
  };

  const repository = createBrainWorkerBookingsRepository({
    ...defaultDeps,
    ...options.dependencies,
  });

  return {
    repository,
    seedBooking: (brainWorkerId: string, booking: RawBookingRecord) => {
      let partition = partitions.get(brainWorkerId);
      if (!partition) {
        partition = new Map<string, RawBookingRecord>();
        partitions.set(brainWorkerId, partition);
      }
      partition.set(booking.bookingId, { ...booking });
    },
    setOffline: (value: boolean) => {
      offline = value;
    },
    mutateBookingDirectly: (
      brainWorkerId: string,
      bookingId: string,
      mutator: (booking: RawBookingRecord) => void
    ) => {
      const partition = partitions.get(brainWorkerId);
      const booking = partition?.get(bookingId);
      if (booking) {
        mutator(booking);
      }
    },
  };
}

export function resetBookingsRepository(): void {
  resetDefaultBrainWorkerBookingsRepository();
}

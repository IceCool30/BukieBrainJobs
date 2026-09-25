// apps/web/lib/brainworker/catalog/repository.ts
// BW-002: BrainWorker Operations Repository (Phase 2 RED Stub)
// Governed by: BW-002 Architecture Contract v1.2 (Sections 6 & 7) & Test-First Implementation Plan v1.2 (Suite 2)

import type {
  IBrainWorkerOperationsRepository,
  BrainWorkerOperationalProfile,
  BrainWorkerServiceCatalog,
  BrainWorkerAvailability,
  BrainWorkerCoverage,
  DayOfWeek,
  DaySchedule,
  ServiceItemStatus,
  ValidTravelRadiusKm,
  MatchingHydrationProfile,
} from './types';

export class BrainWorkerOperationsRepository implements IBrainWorkerOperationsRepository {
  async getOperationalProfile(_brainWorkerId: string): Promise<BrainWorkerOperationalProfile | null> {
    throw new Error('Not implemented: Phase 2 RED stub');
  }

  async getServiceCatalog(_brainWorkerId: string): Promise<BrainWorkerServiceCatalog> {
    throw new Error('Not implemented: Phase 2 RED stub');
  }

  async saveServiceCatalog(
    _brainWorkerId: string,
    _catalog: {
      diagnosticFeeNgn: number;
      services: Array<{
        serviceId: string;
        hourlyRateNgn: number;
        status: ServiceItemStatus;
      }>;
    }
  ): Promise<BrainWorkerServiceCatalog> {
    throw new Error('Not implemented: Phase 2 RED stub');
  }

  async getAvailability(_brainWorkerId: string): Promise<BrainWorkerAvailability> {
    throw new Error('Not implemented: Phase 2 RED stub');
  }

  async saveAvailability(
    _brainWorkerId: string,
    _availability: {
      isAvailable: boolean;
      isEmergencyAvailable: boolean;
      weeklySchedule: Record<DayOfWeek, DaySchedule>;
    }
  ): Promise<BrainWorkerAvailability> {
    throw new Error('Not implemented: Phase 2 RED stub');
  }

  async getCoverage(_brainWorkerId: string): Promise<BrainWorkerCoverage> {
    throw new Error('Not implemented: Phase 2 RED stub');
  }

  async saveCoverage(
    _brainWorkerId: string,
    _coverage: {
      primaryCityId: string;
      primaryCityName: string;
      coverageNeighbourhoods: string[];
      travelRadiusKm: ValidTravelRadiusKm;
    }
  ): Promise<BrainWorkerCoverage> {
    throw new Error('Not implemented: Phase 2 RED stub');
  }

  async getMatchingHydrationProfile(_brainWorkerId: string): Promise<MatchingHydrationProfile> {
    throw new Error('Not implemented: Phase 2 RED stub');
  }

  subscribe(
    _brainWorkerId: string,
    _callback: (profile: BrainWorkerOperationalProfile) => void
  ): () => void {
    throw new Error('Not implemented: Phase 2 RED stub');
  }
}

let defaultOperationsRepository: IBrainWorkerOperationsRepository | null = null;

export function getBrainWorkerOperationsRepository(): IBrainWorkerOperationsRepository {
  if (!defaultOperationsRepository) {
    defaultOperationsRepository = new BrainWorkerOperationsRepository();
  }
  return defaultOperationsRepository;
}

export function createBrainWorkerOperationsRepository(): IBrainWorkerOperationsRepository {
  return new BrainWorkerOperationsRepository();
}

export function resetDefaultBrainWorkerOperationsRepository(): void {
  defaultOperationsRepository = null;
}

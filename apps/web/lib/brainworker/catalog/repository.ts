// apps/web/lib/brainworker/catalog/repository.ts
// BW-002: BrainWorker Operations Repository (Phase 2 RED Stub)
// Governed by: BW-002 Architecture Contract v1.2 (Sections 6 & 7) & Test-First Implementation Plan v1.2 (Suite 2)

import type { IBrainWorkerOnboardingRepository } from '../types';
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

export interface BrainWorkerOperationsRepositoryDependencies {
  onboardingRepository?: IBrainWorkerOnboardingRepository | undefined;
}

export class BrainWorkerOperationsRepository implements IBrainWorkerOperationsRepository {
  protected readonly onboardingRepository?: IBrainWorkerOnboardingRepository | undefined;

  constructor(dependencies: BrainWorkerOperationsRepositoryDependencies = {}) {
    this.onboardingRepository = dependencies.onboardingRepository;
    void this.onboardingRepository;
  }

  async getOperationalProfile(brainWorkerId: string): Promise<BrainWorkerOperationalProfile | null> {
    void brainWorkerId;
    throw new Error('Not implemented: Phase 2 RED stub');
  }

  async getServiceCatalog(brainWorkerId: string): Promise<BrainWorkerServiceCatalog> {
    void brainWorkerId;
    throw new Error('Not implemented: Phase 2 RED stub');
  }

  async saveServiceCatalog(
    brainWorkerId: string,
    catalog: {
      diagnosticFeeNgn: number;
      services: Array<{
        serviceId: string;
        hourlyRateNgn: number;
        status: ServiceItemStatus;
      }>;
    }
  ): Promise<BrainWorkerServiceCatalog> {
    void brainWorkerId;
    void catalog;
    throw new Error('Not implemented: Phase 2 RED stub');
  }

  async getAvailability(brainWorkerId: string): Promise<BrainWorkerAvailability> {
    void brainWorkerId;
    throw new Error('Not implemented: Phase 2 RED stub');
  }

  async saveAvailability(
    brainWorkerId: string,
    availability: {
      isAvailable: boolean;
      isEmergencyAvailable: boolean;
      weeklySchedule: Record<DayOfWeek, DaySchedule>;
    }
  ): Promise<BrainWorkerAvailability> {
    void brainWorkerId;
    void availability;
    throw new Error('Not implemented: Phase 2 RED stub');
  }

  async getCoverage(brainWorkerId: string): Promise<BrainWorkerCoverage> {
    void brainWorkerId;
    throw new Error('Not implemented: Phase 2 RED stub');
  }

  async saveCoverage(
    brainWorkerId: string,
    coverage: {
      primaryCityId: string;
      primaryCityName: string;
      coverageNeighbourhoods: string[];
      travelRadiusKm: ValidTravelRadiusKm;
    }
  ): Promise<BrainWorkerCoverage> {
    void brainWorkerId;
    void coverage;
    throw new Error('Not implemented: Phase 2 RED stub');
  }

  async getMatchingHydrationProfile(brainWorkerId: string): Promise<MatchingHydrationProfile> {
    void brainWorkerId;
    throw new Error('Not implemented: Phase 2 RED stub');
  }

  subscribe(
    brainWorkerId: string,
    callback: (profile: BrainWorkerOperationalProfile) => void
  ): () => void {
    void brainWorkerId;
    void callback;
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

export function createBrainWorkerOperationsRepository(
  dependencies: BrainWorkerOperationsRepositoryDependencies = {}
): IBrainWorkerOperationsRepository {
  return new BrainWorkerOperationsRepository(dependencies);
}

export function resetDefaultBrainWorkerOperationsRepository(): void {
  defaultOperationsRepository = null;
}

// apps/web/lib/brainworker/catalog/repository.ts
// BW-002: BrainWorker Operations Repository & State Persistence
// Authoritative References:
// - docs/specs/BW-002-architecture-contract.md (Approved, Section 3.2)
// - docs/specs/BW-002-test-first-implementation-plan.md (Approved, Phase 2)

import type {
  IBrainWorkerOperationsRepository,
  BrainWorkerOperationalProfile,
  BrainWorkerServiceCatalog,
  BrainWorkerAvailability,
  BrainWorkerCoverage,
  ConfiguredServiceItem,
  DayOfWeek,
  DaySchedule,
  ValidTravelRadiusKm,
  MatchingHydrationProfile,
} from './types';
import { ORDERED_DAYS } from './types';
import { CANONICAL_SERVICES_REGISTRY } from './canonical-registry';
import {
  OperationsValidationError,
  validateServiceCatalog,
  validateAvailability,
  validateCoverage,
  isOperationalProfileComplete,
} from './validation';
import { getBrainWorkerOnboardingRepository } from '../repository';
import type { IBrainWorkerOnboardingRepository } from '../types';
import { getMockAuthenticatedUser } from '../auth/storage';

const STORAGE_KEY_PREFIX = 'bukie_bw_operations_';

export class ForbiddenTenantAccessError extends Error {
  constructor(message = 'FORBIDDEN_TENANT_ACCESS: Caller is not authorized to access this resource') {
    super(message);
    this.name = 'ForbiddenTenantAccessError';
  }
}

export interface OperationsRepositoryDependencies {
  onboardingRepository?: IBrainWorkerOnboardingRepository | undefined;
}

export class BrainWorkerOperationsRepository implements IBrainWorkerOperationsRepository {
  protected readonly onboardingRepository: IBrainWorkerOnboardingRepository;
  private readonly inMemoryProfiles = new Map<string, BrainWorkerOperationalProfile>();
  private readonly subscribers = new Map<string, Set<(profile: BrainWorkerOperationalProfile) => void>>();

  constructor(dependencies: OperationsRepositoryDependencies = {}) {
    this.onboardingRepository =
      dependencies.onboardingRepository ?? getBrainWorkerOnboardingRepository();
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Tenant Isolation & Identity Boundary (REP-006)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  protected assertCallerAuthorization(targetBrainWorkerId: string): void {
    const caller = getMockAuthenticatedUser();

    if (!caller) {
      throw new ForbiddenTenantAccessError(
        'FORBIDDEN_TENANT_ACCESS: Unauthenticated callers cannot access operations profiles.'
      );
    }

    if (caller.role !== 'brainworker') {
      throw new ForbiddenTenantAccessError(
        `FORBIDDEN_TENANT_ACCESS: Caller with role '${caller.role}' is not authorized to access operations profiles.`
      );
    }

    if (caller.id !== targetBrainWorkerId) {
      throw new ForbiddenTenantAccessError(
        `FORBIDDEN_TENANT_ACCESS: BrainWorker '${caller.id}' cannot access profile of BrainWorker '${targetBrainWorkerId}'.`
      );
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Storage & Profile Retrieval
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private readStoredProfile(brainWorkerId: string): BrainWorkerOperationalProfile | null {
    if (typeof localStorage !== 'undefined') {
      try {
        const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}${brainWorkerId}`);
        if (raw) {
          const parsed = JSON.parse(raw) as BrainWorkerOperationalProfile;
          parsed.isComplete = isOperationalProfileComplete(parsed);
          this.inMemoryProfiles.set(
            brainWorkerId,
            JSON.parse(JSON.stringify(parsed)) as BrainWorkerOperationalProfile
          );
          return JSON.parse(JSON.stringify(parsed)) as BrainWorkerOperationalProfile;
        }
      } catch {
        // Fall through to in-memory store in restricted environments
      }
    }

    const mem = this.inMemoryProfiles.get(brainWorkerId);
    if (mem) {
      mem.isComplete = isOperationalProfileComplete(mem);
      return JSON.parse(JSON.stringify(mem)) as BrainWorkerOperationalProfile;
    }

    return null;
  }

  private persistProfile(brainWorkerId: string, profile: BrainWorkerOperationalProfile): void {
    this.inMemoryProfiles.set(
      brainWorkerId,
      JSON.parse(JSON.stringify(profile)) as BrainWorkerOperationalProfile
    );

    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(
          `${STORAGE_KEY_PREFIX}${brainWorkerId}`,
          JSON.stringify(profile)
        );
      } catch {
        // In-memory fallback
      }
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Default Profile Hydration from BW-001 Onboarding (REP-001)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  private async createDefaultProfile(
    brainWorkerId: string
  ): Promise<BrainWorkerOperationalProfile> {
    const onboarding = await this.onboardingRepository.getWorkerById(brainWorkerId);

    const primaryCityId = onboarding?.primaryCityId ?? 'abuja';
    const primaryCityName = onboarding?.primaryCityName ?? 'Abuja';
    const now = new Date().toISOString();

    const defaultWeeklySchedule = ORDERED_DAYS.reduce(
      (acc, day) => {
        acc[day] = {
          isActive: false,
          windows: [],
        };
        return acc;
      },
      {} as Record<DayOfWeek, DaySchedule>
    );

    const defaultProfile: BrainWorkerOperationalProfile = {
      brainWorkerId,
      catalog: {
        brainWorkerId,
        diagnosticFeeNgn: 5000,
        services: [],
        updatedAt: now,
      },
      availability: {
        brainWorkerId,
        isAvailable: false,
        isEmergencyAvailable: false,
        weeklySchedule: defaultWeeklySchedule,
        updatedAt: now,
      },
      coverage: {
        brainWorkerId,
        primaryCityId,
        primaryCityName,
        coverageNeighbourhoods: [],
        travelRadiusKm: 15,
        updatedAt: now,
      },
      isComplete: false,
      updatedAt: now,
    };

    defaultProfile.isComplete = isOperationalProfileComplete(defaultProfile);
    return defaultProfile;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Profile Summary & Component Queries
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  async getOperationalProfile(brainWorkerId: string): Promise<BrainWorkerOperationalProfile | null> {
    this.assertCallerAuthorization(brainWorkerId);

    const stored = this.readStoredProfile(brainWorkerId);
    if (stored) {
      return stored;
    }

    const defaultProfile = await this.createDefaultProfile(brainWorkerId);
    this.persistProfile(brainWorkerId, defaultProfile);
    return JSON.parse(JSON.stringify(defaultProfile)) as BrainWorkerOperationalProfile;
  }

  async getServiceCatalog(brainWorkerId: string): Promise<BrainWorkerServiceCatalog> {
    this.assertCallerAuthorization(brainWorkerId);
    const profile = await this.getOperationalProfile(brainWorkerId);
    return JSON.parse(JSON.stringify(profile!.catalog)) as BrainWorkerServiceCatalog;
  }

  async getConfiguredCatalog(
    brainWorkerId: string
  ): Promise<BrainWorkerServiceCatalog | null> {
    this.assertCallerAuthorization(brainWorkerId);

    const stored = this.readStoredProfile(brainWorkerId);
    if (!stored) {
      return null;
    }

    const catalog = stored.catalog;
    if (!catalog || !Array.isArray(catalog.services)) {
      return null;
    }

    const hasActiveService = catalog.services.some(
      (service) => service && service.status === 'ACTIVE'
    );
    if (!hasActiveService) {
      return null;
    }

    return JSON.parse(JSON.stringify(catalog)) as BrainWorkerServiceCatalog;
  }

  async saveServiceCatalog(
    brainWorkerId: string,
    catalog: {
      diagnosticFeeNgn: number;
      services: Array<{
        serviceId: string;
        hourlyRateNgn: number;
        status: 'ACTIVE' | 'PAUSED';
      }>;
    }
  ): Promise<BrainWorkerServiceCatalog> {
    this.assertCallerAuthorization(brainWorkerId);

    validateServiceCatalog(catalog);

    const now = new Date().toISOString();

    const validatedServices: ConfiguredServiceItem[] = [];
    for (const service of catalog.services) {
      const canonical = CANONICAL_SERVICES_REGISTRY.find(
        (entry) => entry.serviceId === service.serviceId
      );

      if (!canonical) {
        throw new OperationsValidationError(
          `Unknown service ID '${service.serviceId}' not in canonical registry.`
        );
      }

      if (
        service.hourlyRateNgn < canonical.minHourlyRateNgn ||
        service.hourlyRateNgn > canonical.maxHourlyRateNgn
      ) {
        throw new OperationsValidationError(
          `Hourly rate ₦${service.hourlyRateNgn} for '${service.serviceId}' is outside canonical bounds [₦${canonical.minHourlyRateNgn}, ₦${canonical.maxHourlyRateNgn}].`
        );
      }

      validatedServices.push({
        serviceId: service.serviceId,
        hourlyRateNgn: service.hourlyRateNgn,
        status: service.status,
      });
    }

    const currentProfile = (await this.getOperationalProfile(brainWorkerId))!;

    const updatedCatalog: BrainWorkerServiceCatalog = {
      brainWorkerId,
      diagnosticFeeNgn: catalog.diagnosticFeeNgn,
      services: validatedServices,
      updatedAt: now,
    };

    const updatedProfile: BrainWorkerOperationalProfile = {
      ...currentProfile,
      catalog: updatedCatalog,
      isComplete: isOperationalProfileComplete({
        ...currentProfile,
        catalog: updatedCatalog,
      }),
    };

    this.persistProfile(brainWorkerId, updatedProfile);
    this.notifySubscribers(brainWorkerId, updatedProfile);

    return JSON.parse(JSON.stringify(updatedCatalog)) as BrainWorkerServiceCatalog;
  }

  async getAvailability(brainWorkerId: string): Promise<BrainWorkerAvailability> {
    this.assertCallerAuthorization(brainWorkerId);
    const profile = await this.getOperationalProfile(brainWorkerId);
    return JSON.parse(JSON.stringify(profile!.availability)) as BrainWorkerAvailability;
  }

  async saveAvailability(
    brainWorkerId: string,
    availability: {
      isAvailable: boolean;
      isEmergencyAvailable: boolean;
      weeklySchedule: Record<DayOfWeek, DaySchedule>;
    }
  ): Promise<BrainWorkerAvailability> {
    this.assertCallerAuthorization(brainWorkerId);

    if (!availability || typeof availability !== 'object') {
      throw new OperationsValidationError('Availability payload must be an object.');
    }

    if (!availability.weeklySchedule || typeof availability.weeklySchedule !== 'object') {
      throw new OperationsValidationError('Weekly schedule is required.');
    }

    for (const day of ORDERED_DAYS) {
      const schedule = availability.weeklySchedule[day];
      if (!schedule) {
        throw new OperationsValidationError(`Missing schedule entry for day '${day}'.`);
      }
      validateAvailability(schedule);
    }

    const now = new Date().toISOString();
    const currentProfile = (await this.getOperationalProfile(brainWorkerId))!;

    const updatedAvailability: BrainWorkerAvailability = {
      brainWorkerId,
      isAvailable: Boolean(availability.isAvailable),
      isEmergencyAvailable: Boolean(availability.isEmergencyAvailable),
      weeklySchedule: JSON.parse(
        JSON.stringify(availability.weeklySchedule)
      ) as Record<DayOfWeek, DaySchedule>,
      updatedAt: now,
    };

    const updatedProfile: BrainWorkerOperationalProfile = {
      ...currentProfile,
      availability: updatedAvailability,
      isComplete: isOperationalProfileComplete({
        ...currentProfile,
        availability: updatedAvailability,
      }),
    };

    this.persistProfile(brainWorkerId, updatedProfile);
    this.notifySubscribers(brainWorkerId, updatedProfile);

    return JSON.parse(JSON.stringify(updatedAvailability)) as BrainWorkerAvailability;
  }

  async getCoverage(brainWorkerId: string): Promise<BrainWorkerCoverage> {
    this.assertCallerAuthorization(brainWorkerId);
    const profile = await this.getOperationalProfile(brainWorkerId);
    return JSON.parse(JSON.stringify(profile!.coverage)) as BrainWorkerCoverage;
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
    this.assertCallerAuthorization(brainWorkerId);

    if (!coverage || typeof coverage !== 'object') {
      throw new OperationsValidationError('Coverage payload must be an object.');
    }

    if (
      !coverage.primaryCityId ||
      typeof coverage.primaryCityId !== 'string' ||
      !coverage.primaryCityId.trim()
    ) {
      throw new OperationsValidationError('Primary city ID must be a non-empty string.');
    }

    // REP-005 Invariant: primaryCityId must match verified onboarding record
    const onboarding = await this.onboardingRepository.getWorkerById(brainWorkerId);
    if (onboarding && onboarding.primaryCityId && coverage.primaryCityId !== onboarding.primaryCityId) {
      throw new OperationsValidationError(
        `Primary city ID '${coverage.primaryCityId}' does not match onboarding verified city '${onboarding.primaryCityId}'.`
      );
    }

    const coverageNeighbourhoods = validateCoverage({
      primaryCityId: coverage.primaryCityId,
      primaryCityName: coverage.primaryCityName,
      coverageNeighbourhoods: coverage.coverageNeighbourhoods,
      travelRadiusKm: coverage.travelRadiusKm,
    });

    const now = new Date().toISOString();
    const currentProfile = (await this.getOperationalProfile(brainWorkerId))!;

    const updatedCoverage: BrainWorkerCoverage = {
      brainWorkerId,
      primaryCityId: coverage.primaryCityId,
      primaryCityName: coverage.primaryCityName,
      coverageNeighbourhoods,
      travelRadiusKm: coverage.travelRadiusKm,
      updatedAt: now,
    };

    const updatedProfile: BrainWorkerOperationalProfile = {
      ...currentProfile,
      coverage: updatedCoverage,
      isComplete: isOperationalProfileComplete({
        ...currentProfile,
        coverage: updatedCoverage,
      }),
    };

    this.persistProfile(brainWorkerId, updatedProfile);
    this.notifySubscribers(brainWorkerId, updatedProfile);

    return JSON.parse(JSON.stringify(updatedCoverage)) as BrainWorkerCoverage;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Matching Engine Hydration Adapter (REP-007, REP-010)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  async getMatchingHydrationProfile(brainWorkerId: string): Promise<MatchingHydrationProfile> {
    this.assertCallerAuthorization(brainWorkerId);

    const profile = (await this.getOperationalProfile(brainWorkerId))!;

    const skills = profile.catalog.services.map((service) => {
      const canonical = CANONICAL_SERVICES_REGISTRY.find(
        (entry) => entry.serviceId === service.serviceId
      );
      const skillId = canonical?.skillId ?? service.serviceId;
      const hourlyRateKobo = Math.round(service.hourlyRateNgn * 100);
      const isActive = service.status === 'ACTIVE';

      return {
        skillId,
        hourlyRateKobo,
        isActive,
      };
    });

    return {
      skills,
      isAvailable: profile.availability.isAvailable,
      isEmergencyAvailable: profile.availability.isEmergencyAvailable,
      weeklySchedule: JSON.parse(
        JSON.stringify(profile.availability.weeklySchedule)
      ) as Record<DayOfWeek, DaySchedule>,
      travelRadiusKm: profile.coverage.travelRadiusKm,
      coverageNeighbourhoods: [...profile.coverage.coverageNeighbourhoods],
      primaryCityId: profile.coverage.primaryCityId,
      isOperationalReady: profile.isComplete,
    };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Observer Subscription (REP-008)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  subscribeToOperationalProfile(
    brainWorkerId: string,
    callback: (profile: BrainWorkerOperationalProfile) => void
  ): () => void {
    let set = this.subscribers.get(brainWorkerId);
    if (!set) {
      set = new Set();
      this.subscribers.set(brainWorkerId, set);
    }
    set.add(callback);

    return () => {
      const current = this.subscribers.get(brainWorkerId);
      if (current) {
        current.delete(callback);
        if (current.size === 0) {
          this.subscribers.delete(brainWorkerId);
        }
      }
    };
  }

  private notifySubscribers(brainWorkerId: string, profile: BrainWorkerOperationalProfile): void {
    const subs = this.subscribers.get(brainWorkerId);
    if (subs) {
      const cloned = JSON.parse(JSON.stringify(profile)) as BrainWorkerOperationalProfile;
      for (const cb of subs) {
        try {
          cb(cloned);
        } catch {
          // Swallow subscriber errors to protect persistence flow
        }
      }
    }
  }
}

let defaultBrainWorkerOperationsRepository: IBrainWorkerOperationsRepository | null = null;

export function getBrainWorkerOperationsRepository(): IBrainWorkerOperationsRepository {
  if (!defaultBrainWorkerOperationsRepository) {
    defaultBrainWorkerOperationsRepository = new BrainWorkerOperationsRepository();
  }
  return defaultBrainWorkerOperationsRepository;
}

export function resetDefaultBrainWorkerOperationsRepository(): void {
  defaultBrainWorkerOperationsRepository = null;
}

export function createBrainWorkerOperationsRepository(
  dependencies: OperationsRepositoryDependencies = {}
): IBrainWorkerOperationsRepository {
  return new BrainWorkerOperationsRepository(dependencies);
}

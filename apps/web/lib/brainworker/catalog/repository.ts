// apps/web/lib/brainworker/catalog/repository.ts
// BW-002: BrainWorker Operations Repository (Phase 2 GREEN Implementation)
// Governed by: BW-002 Architecture Contract v1.2 (Sections 6 & 7) & Test-First Implementation Plan v1.2 (Suite 2)

import type { IBrainWorkerOnboardingRepository } from '../types';
import { getBrainWorkerOnboardingRepository } from '../repository';
import { getMockAuthenticatedUser } from '../../auth/storage';
import {
  CANONICAL_SERVICES_REGISTRY,
  DEFAULT_DIAGNOSTIC_FEE_NGN,
  ForbiddenTenantAccessError,
  OperationsValidationError,
  type IBrainWorkerOperationsRepository,
  type BrainWorkerOperationalProfile,
  type BrainWorkerServiceCatalog,
  type BrainWorkerAvailability,
  type BrainWorkerCoverage,
  type ConfiguredServiceItem,
  type DayOfWeek,
  type DaySchedule,
  type ServiceItemStatus,
  type ValidTravelRadiusKm,
  type MatchingHydrationProfile,
} from './types';
import {
  validateDiagnosticFee,
  validateHourlyRate,
  validateDaySchedule,
  validateTravelRadius,
  validateCanonicalServiceId,
  isOperationalProfileComplete,
} from './validation';

const STORAGE_KEY_PREFIX = 'bukie_bw_operations_';

const ORDERED_DAYS: readonly DayOfWeek[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

const DEFAULT_WEEKLY_SCHEDULE: Record<DayOfWeek, DaySchedule> = {
  monday: { day: 'monday', isActive: true, startHour: 8, endHour: 18 },
  tuesday: { day: 'tuesday', isActive: true, startHour: 8, endHour: 18 },
  wednesday: { day: 'wednesday', isActive: true, startHour: 8, endHour: 18 },
  thursday: { day: 'thursday', isActive: true, startHour: 8, endHour: 18 },
  friday: { day: 'friday', isActive: true, startHour: 8, endHour: 18 },
  saturday: { day: 'saturday', isActive: false, startHour: 9, endHour: 17 },
  sunday: { day: 'sunday', isActive: false, startHour: 9, endHour: 17 },
};

export interface BrainWorkerOperationsRepositoryDependencies {
  onboardingRepository?: IBrainWorkerOnboardingRepository | undefined;
}

export class BrainWorkerOperationsRepository implements IBrainWorkerOperationsRepository {
  protected readonly onboardingRepository: IBrainWorkerOnboardingRepository;
  private readonly inMemoryProfiles = new Map<string, BrainWorkerOperationalProfile>();
  private readonly subscribers = new Map<
    string,
    Set<(profile: BrainWorkerOperationalProfile) => void>
  >();

  constructor(dependencies: BrainWorkerOperationsRepositoryDependencies = {}) {
    this.onboardingRepository =
      dependencies.onboardingRepository ?? getBrainWorkerOnboardingRepository();
  }

  private assertCallerAuthorization(brainWorkerId: string): void {
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
        'FORBIDDEN_TENANT_ACCESS: Customer accounts cannot access BrainWorker operations.'
      );
    }

    if (!currentUser.isBrainWorkerApproved) {
      throw new ForbiddenTenantAccessError(
        'FORBIDDEN_TENANT_ACCESS: Unapproved BrainWorkers cannot access operational configuration.'
      );
    }

    if (currentUser.id !== brainWorkerId) {
      throw new ForbiddenTenantAccessError(
        `FORBIDDEN_TENANT_ACCESS: Session '${currentUser.id}' cannot access profile for '${brainWorkerId}'.`
      );
    }
  }

  private async getVerifiedCoverageCities(brainWorkerId: string): Promise<string[]> {
    try {
      const record = await this.onboardingRepository.getOnboardingRecord(brainWorkerId);
      if (record?.trade?.coverageCities && Array.isArray(record.trade.coverageCities)) {
        return record.trade.coverageCities;
      }
    } catch {
      // In case onboarding repository throws or is not accessible, fail closed
    }
    return [];
  }

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

  private persistProfile(
    brainWorkerId: string,
    profile: BrainWorkerOperationalProfile
  ): void {
    const copy = JSON.parse(JSON.stringify(profile)) as BrainWorkerOperationalProfile;
    this.inMemoryProfiles.set(brainWorkerId, copy);

    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}${brainWorkerId}`, JSON.stringify(profile));
      } catch {
        // Ignore quota/access errors in restricted browser contexts
      }
    }
  }

  private notifySubscribers(
    brainWorkerId: string,
    profile: BrainWorkerOperationalProfile
  ): void {
    const subs = this.subscribers.get(brainWorkerId);
    if (subs) {
      const cloned = JSON.parse(JSON.stringify(profile)) as BrainWorkerOperationalProfile;
      for (const callback of subs) {
        try {
          callback(cloned);
        } catch {
          // Prevent listener exceptions from breaking repo execution
        }
      }
    }
  }

  private async createDefaultProfile(
    brainWorkerId: string
  ): Promise<BrainWorkerOperationalProfile> {
    const now = new Date().toISOString();
    const verifiedCities = await this.getVerifiedCoverageCities(brainWorkerId);
    const defaultCity = verifiedCities.length > 0 ? (verifiedCities[0] ?? '') : '';

    const profile: BrainWorkerOperationalProfile = {
      brainWorkerId,
      catalog: {
        brainWorkerId,
        diagnosticFeeNgn: DEFAULT_DIAGNOSTIC_FEE_NGN,
        services: [],
        updatedAt: now,
      },
      availability: {
        brainWorkerId,
        isAvailable: false,
        isEmergencyAvailable: false,
        weeklySchedule: JSON.parse(JSON.stringify(DEFAULT_WEEKLY_SCHEDULE)) as Record<
          DayOfWeek,
          DaySchedule
        >,
        updatedAt: now,
      },
      coverage: {
        brainWorkerId,
        primaryCityId: defaultCity,
        primaryCityName: defaultCity,
        coverageNeighbourhoods: [],
        travelRadiusKm: 15,
        updatedAt: now,
      },
      isComplete: false,
    };

    return profile;
  }

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
    this.assertCallerAuthorization(brainWorkerId);

    const feeValidation = validateDiagnosticFee(catalog.diagnosticFeeNgn);
    if (!feeValidation.valid) {
      throw new OperationsValidationError(
        feeValidation.error ?? 'Diagnostic fee fails numerical boundary invariant.'
      );
    }

    if (!Array.isArray(catalog.services)) {
      throw new OperationsValidationError('Services must be an array.');
    }

    const now = new Date().toISOString();
    const validatedServices: ConfiguredServiceItem[] = [];
    const seenServiceIds = new Set<string>();

    for (const item of catalog.services) {
      if (seenServiceIds.has(item.serviceId)) {
        throw new OperationsValidationError(
          `Duplicate service ID '${item.serviceId}' specified in service catalog.`
        );
      }
      seenServiceIds.add(item.serviceId);

      const canonicalResult = validateCanonicalServiceId(item.serviceId);
      if (!canonicalResult.valid || !canonicalResult.service) {
        throw new OperationsValidationError(
          canonicalResult.error ??
            `Service ID '${item.serviceId}' does not exist in canonical registry.`
        );
      }

      const rateValidation = validateHourlyRate(item.hourlyRateNgn);
      if (!rateValidation.valid) {
        throw new OperationsValidationError(
          rateValidation.error ??
            `Invalid hourly rate for canonical service '${item.serviceId}'.`
        );
      }

      if (item.status !== 'ACTIVE' && item.status !== 'PAUSED') {
        throw new OperationsValidationError(
          `Invalid status '${String(item.status)}' for service '${item.serviceId}'.`
        );
      }

      validatedServices.push({
        serviceId: canonicalResult.service.serviceId,
        categoryId: canonicalResult.service.categoryId,
        serviceName: canonicalResult.service.serviceName,
        hourlyRateNgn: item.hourlyRateNgn,
        status: item.status,
        updatedAt: now,
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
        throw new OperationsValidationError(`Missing day schedule definition for '${day}'.`);
      }
      const dayResult = validateDaySchedule(schedule);
      if (!dayResult.valid) {
        throw new OperationsValidationError(
          dayResult.error ?? `Invalid day schedule for '${day}'.`
        );
      }
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

    const verifiedCities = await this.getVerifiedCoverageCities(brainWorkerId);
    if (!verifiedCities.includes(coverage.primaryCityId)) {
      throw new OperationsValidationError(
        `Primary city '${coverage.primaryCityId}' is not among verified onboarding coverage cities (${verifiedCities.join(', ')}).`
      );
    }

    if (
      !coverage.primaryCityName ||
      typeof coverage.primaryCityName !== 'string' ||
      !coverage.primaryCityName.trim()
    ) {
      throw new OperationsValidationError('Primary city name must be a non-empty string.');
    }

    if (
      !Array.isArray(coverage.coverageNeighbourhoods) ||
      coverage.coverageNeighbourhoods.length === 0
    ) {
      throw new OperationsValidationError(
        'At least one operational neighbourhood/LGA must be designated.'
      );
    }

    for (const n of coverage.coverageNeighbourhoods) {
      if (typeof n !== 'string' || !n.trim()) {
        throw new OperationsValidationError(
          'Operational neighbourhoods/LGAs must be non-empty strings.'
        );
      }
    }

    const radiusResult = validateTravelRadius(coverage.travelRadiusKm);
    if (!radiusResult.valid) {
      throw new OperationsValidationError(
        radiusResult.error ?? 'Travel radius fails validation invariant.'
      );
    }

    const now = new Date().toISOString();
    const currentProfile = (await this.getOperationalProfile(brainWorkerId))!;

    const updatedCoverage: BrainWorkerCoverage = {
      brainWorkerId,
      primaryCityId: coverage.primaryCityId,
      primaryCityName: coverage.primaryCityName,
      coverageNeighbourhoods: [...coverage.coverageNeighbourhoods],
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

  async getMatchingHydrationProfile(
    brainWorkerId: string
  ): Promise<MatchingHydrationProfile> {
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
      primaryCityId: profile.coverage.primaryCityId,
    };
  }

  subscribe(
    brainWorkerId: string,
    callback: (profile: BrainWorkerOperationalProfile) => void
  ): () => void {
    let subs = this.subscribers.get(brainWorkerId);
    if (!subs) {
      subs = new Set();
      this.subscribers.set(brainWorkerId, subs);
    }
    subs.add(callback);

    return () => {
      const currentSubs = this.subscribers.get(brainWorkerId);
      if (currentSubs) {
        currentSubs.delete(callback);
        if (currentSubs.size === 0) {
          this.subscribers.delete(brainWorkerId);
        }
      }
    };
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


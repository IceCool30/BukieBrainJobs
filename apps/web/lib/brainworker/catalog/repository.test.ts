// apps/web/lib/brainworker/catalog/repository.test.ts
// BW-002: BrainWorker Operations Repository & Tenant Isolation Tests (Suite 2: REP-001 to REP-010)
// Authoritative References:
// - docs/specs/BW-002-architecture-contract.md (v1.2, Sections 4, 5, 6 & 7)
// - docs/specs/BW-002-test-first-implementation-plan.md (v1.2, Suite 2: REP-001 to REP-010)

import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as authStorage from '../../auth/storage';
import {
  createOperationsTestHarness,
  resetOperationsRepository,
  FIXTURE_APPROVED_BRAINWORKER_A,
  FIXTURE_APPROVED_BRAINWORKER_B,
  FIXTURE_CUSTOMER_USER_ID,
  mockApprovedWorkerA,
  mockApprovedWorkerB,
  mockCustomerUser,
  FIXTURE_DEFAULT_WEEKLY_SCHEDULE,
  FIXTURE_VARIED_WEEKLY_SCHEDULE,
} from './testing';
import {
  ForbiddenTenantAccessError,
  OperationsValidationError,
} from './types';

describe('BW-002 Operations Repository & Tenant Isolation (Suite 2: REP-001 to REP-010)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetOperationsRepository();
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockApprovedWorkerA);
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // REP-001: Hydrates Initial Operational Profile from Storage
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  it('REP-001: hydrates initial operational profile from browser storage for an approved BrainWorker', async () => {
    const { repository } = createOperationsTestHarness();

    // Default profile hydration for an approved worker with no prior stored state
    const profile = await repository.getOperationalProfile(FIXTURE_APPROVED_BRAINWORKER_A);
    expect(profile).not.toBeNull();
    expect(profile?.brainWorkerId).toBe(FIXTURE_APPROVED_BRAINWORKER_A);
    expect(profile?.isComplete).toBe(false);
    expect(profile?.catalog.diagnosticFeeNgn).toBe(5000);
    expect(profile?.catalog.services).toEqual([]);
    expect(profile?.availability.isAvailable).toBe(false);
    expect(profile?.availability.isEmergencyAvailable).toBe(false);
    expect(profile?.availability.weeklySchedule).toBeDefined();
    expect(Object.keys(profile?.availability.weeklySchedule || {})).toHaveLength(7);
    expect(profile?.coverage.travelRadiusKm).toBe(15);
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // REP-002: Saves Service Catalog Selections and Diagnostic Fee
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  it('REP-002: saves service catalog selections and updates diagnosticFeeNgn', async () => {
    const { repository } = createOperationsTestHarness();

    const savedCatalog = await repository.saveServiceCatalog(FIXTURE_APPROVED_BRAINWORKER_A, {
      diagnosticFeeNgn: 7500,
      services: [
        {
          serviceId: 'gen-diesel-servicing',
          hourlyRateNgn: 8500,
          status: 'ACTIVE',
        },
        {
          serviceId: 'elec-inverter-solar',
          hourlyRateNgn: 12000,
          status: 'ACTIVE',
        },
      ],
    });

    expect(savedCatalog.brainWorkerId).toBe(FIXTURE_APPROVED_BRAINWORKER_A);
    expect(savedCatalog.diagnosticFeeNgn).toBe(7500);
    expect(savedCatalog.services).toHaveLength(2);
    expect(savedCatalog.services[0]!.serviceId).toBe('gen-diesel-servicing');
    expect(savedCatalog.services[0]!.categoryId).toBe('generator');
    expect(savedCatalog.services[0]!.serviceName).toBe('Diesel Generator Servicing & Overhaul');
    expect(savedCatalog.services[0]!.hourlyRateNgn).toBe(8500);
    expect(savedCatalog.services[0]!.status).toBe('ACTIVE');


    // Retrieve via getServiceCatalog
    const retrievedCatalog = await repository.getServiceCatalog(FIXTURE_APPROVED_BRAINWORKER_A);
    expect(retrievedCatalog.diagnosticFeeNgn).toBe(7500);
    expect(retrievedCatalog.services).toHaveLength(2);

    // Verify operational profile reflection
    const profile = await repository.getOperationalProfile(FIXTURE_APPROVED_BRAINWORKER_A);
    expect(profile?.catalog.diagnosticFeeNgn).toBe(7500);
    expect(profile?.catalog.services).toHaveLength(2);
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // REP-003: Preserves Configured Rates When Toggling Active/Paused
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  it('REP-003: preserves existing configured rates when toggling a service between ACTIVE and PAUSED', async () => {
    const { repository } = createOperationsTestHarness();

    // Initial save with configured rate of 8500
    await repository.saveServiceCatalog(FIXTURE_APPROVED_BRAINWORKER_A, {
      diagnosticFeeNgn: 5000,
      services: [
        {
          serviceId: 'gen-diesel-servicing',
          hourlyRateNgn: 8500,
          status: 'ACTIVE',
        },
      ],
    });

    // Toggle service to PAUSED
    const pausedCatalog = await repository.saveServiceCatalog(FIXTURE_APPROVED_BRAINWORKER_A, {
      diagnosticFeeNgn: 5000,
      services: [
        {
          serviceId: 'gen-diesel-servicing',
          hourlyRateNgn: 8500,
          status: 'PAUSED',
        },
      ],
    });

    expect(pausedCatalog.services[0]!.status).toBe('PAUSED');
    expect(pausedCatalog.services[0]!.hourlyRateNgn).toBe(8500);

    // Toggle service back to ACTIVE
    const reactivatedCatalog = await repository.saveServiceCatalog(FIXTURE_APPROVED_BRAINWORKER_A, {
      diagnosticFeeNgn: 5000,
      services: [
        {
          serviceId: 'gen-diesel-servicing',
          hourlyRateNgn: 8500,
          status: 'ACTIVE',
        },
      ],
    });

    expect(reactivatedCatalog.services[0]!.status).toBe('ACTIVE');
    expect(reactivatedCatalog.services[0]!.hourlyRateNgn).toBe(8500);

  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // REP-004: Saves Weekly Availability Schedule and Duty Toggle
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  it('REP-004: saves weekly availability schedule and updates global isAvailable (On-Duty/Off-Duty) status', async () => {
    const { repository } = createOperationsTestHarness();

    const savedAvailability = await repository.saveAvailability(FIXTURE_APPROVED_BRAINWORKER_A, {
      isAvailable: true,
      isEmergencyAvailable: true,
      weeklySchedule: FIXTURE_DEFAULT_WEEKLY_SCHEDULE,
    });

    expect(savedAvailability.brainWorkerId).toBe(FIXTURE_APPROVED_BRAINWORKER_A);
    expect(savedAvailability.isAvailable).toBe(true);
    expect(savedAvailability.isEmergencyAvailable).toBe(true);
    expect(savedAvailability.weeklySchedule.monday.isActive).toBe(true);
    expect(savedAvailability.weeklySchedule.monday.startHour).toBe(8);
    expect(savedAvailability.weeklySchedule.monday.endHour).toBe(18);

    // Retrieve via getAvailability
    const retrieved = await repository.getAvailability(FIXTURE_APPROVED_BRAINWORKER_A);
    expect(retrieved.isAvailable).toBe(true);
    expect(retrieved.isEmergencyAvailable).toBe(true);

    // Toggling to Off-Duty preserves weekly schedule
    const offDuty = await repository.saveAvailability(FIXTURE_APPROVED_BRAINWORKER_A, {
      isAvailable: false,
      isEmergencyAvailable: false,
      weeklySchedule: FIXTURE_DEFAULT_WEEKLY_SCHEDULE,
    });

    expect(offDuty.isAvailable).toBe(false);
    expect(offDuty.weeklySchedule.monday.isActive).toBe(true);
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // REP-005: Coverage Refinement and Verified Onboarding City Enforcement
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  it('REP-005: saves primary city and operational LGAs, enforcing primaryCityId must be in verified onboarding coverageCities', async () => {
    const { repository } = createOperationsTestHarness();

    // Saving coverage with verified onboarding city (Lagos) succeeds
    const savedCoverage = await repository.saveCoverage(FIXTURE_APPROVED_BRAINWORKER_A, {
      primaryCityId: 'Lagos',
      primaryCityName: 'Lagos',
      coverageNeighbourhoods: ['Ikeja', 'Yaba', 'Surulere'],
      travelRadiusKm: 25,
    });

    expect(savedCoverage.brainWorkerId).toBe(FIXTURE_APPROVED_BRAINWORKER_A);
    expect(savedCoverage.primaryCityId).toBe('Lagos');
    expect(savedCoverage.primaryCityName).toBe('Lagos');
    expect(savedCoverage.coverageNeighbourhoods).toEqual(['Ikeja', 'Yaba', 'Surulere']);
    expect(savedCoverage.travelRadiusKm).toBe(25);

    // Retrieving coverage
    const retrieved = await repository.getCoverage(FIXTURE_APPROVED_BRAINWORKER_A);
    expect(retrieved.primaryCityId).toBe('Lagos');
    expect(retrieved.travelRadiusKm).toBe(25);

    // Saving coverage with an unverified onboarding city (Kano is not in ['Lagos', 'Ibadan']) fails closed
    await expect(
      repository.saveCoverage(FIXTURE_APPROVED_BRAINWORKER_A, {
        primaryCityId: 'Kano',
        primaryCityName: 'Kano',
        coverageNeighbourhoods: ['Fagge', 'Nasarawa'],
        travelRadiusKm: 25,
      })
    ).rejects.toThrow(OperationsValidationError);
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // REP-006: Tenant Isolation (Fail Closed on Cross-Tenant Access)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  it('REP-006: fails closed throwing FORBIDDEN_TENANT_ACCESS if caller session attempts to read or mutate another provider profile', async () => {
    const { repository } = createOperationsTestHarness();

    // Authenticated session is Worker A (mockApprovedWorkerA)
    // Cross-tenant read access to Worker B
    await expect(
      repository.getOperationalProfile(FIXTURE_APPROVED_BRAINWORKER_B)
    ).rejects.toThrow(ForbiddenTenantAccessError);

    await expect(
      repository.getServiceCatalog(FIXTURE_APPROVED_BRAINWORKER_B)
    ).rejects.toThrow('FORBIDDEN_TENANT_ACCESS');

    await expect(
      repository.getAvailability(FIXTURE_APPROVED_BRAINWORKER_B)
    ).rejects.toThrow('FORBIDDEN_TENANT_ACCESS');

    await expect(
      repository.getCoverage(FIXTURE_APPROVED_BRAINWORKER_B)
    ).rejects.toThrow('FORBIDDEN_TENANT_ACCESS');

    await expect(
      repository.getMatchingHydrationProfile(FIXTURE_APPROVED_BRAINWORKER_B)
    ).rejects.toThrow('FORBIDDEN_TENANT_ACCESS');

    // Cross-tenant mutation access to Worker B
    await expect(
      repository.saveServiceCatalog(FIXTURE_APPROVED_BRAINWORKER_B, {
        diagnosticFeeNgn: 5000,
        services: [],
      })
    ).rejects.toThrow(ForbiddenTenantAccessError);

    await expect(
      repository.saveAvailability(FIXTURE_APPROVED_BRAINWORKER_B, {
        isAvailable: true,
        isEmergencyAvailable: false,
        weeklySchedule: FIXTURE_DEFAULT_WEEKLY_SCHEDULE,
      })
    ).rejects.toThrow('FORBIDDEN_TENANT_ACCESS');

    await expect(
      repository.saveCoverage(FIXTURE_APPROVED_BRAINWORKER_B, {
        primaryCityId: 'Lagos',
        primaryCityName: 'Lagos',
        coverageNeighbourhoods: ['Ikeja'],
        travelRadiusKm: 15,
      })
    ).rejects.toThrow('FORBIDDEN_TENANT_ACCESS');

    // Customer session rejected
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockCustomerUser);
    await expect(
      repository.getOperationalProfile(FIXTURE_CUSTOMER_USER_ID)
    ).rejects.toThrow(ForbiddenTenantAccessError);

    // Unauthenticated session rejected
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(null);
    await expect(
      repository.getOperationalProfile(FIXTURE_APPROVED_BRAINWORKER_A)
    ).rejects.toThrow('FORBIDDEN_TENANT_ACCESS');
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // REP-007: Matching Hydration Adapter (Lossless Mapping)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  it('REP-007: verifies getMatchingHydrationProfile() returns valid TaskerSkill[] with hourlyRateKobo mapped directly from canonical registry skillId', async () => {
    const { repository } = createOperationsTestHarness();

    // Set up catalog with 1 active service and 1 paused service
    await repository.saveServiceCatalog(FIXTURE_APPROVED_BRAINWORKER_A, {
      diagnosticFeeNgn: 5000,
      services: [
        {
          serviceId: 'gen-diesel-servicing',
          hourlyRateNgn: 7500,
          status: 'ACTIVE',
        },
        {
          serviceId: 'ac-gas-recharge',
          hourlyRateNgn: 6000,
          status: 'PAUSED',
        },
      ],
    });

    // Set up availability
    await repository.saveAvailability(FIXTURE_APPROVED_BRAINWORKER_A, {
      isAvailable: true,
      isEmergencyAvailable: false,
      weeklySchedule: FIXTURE_DEFAULT_WEEKLY_SCHEDULE,
    });

    // Set up coverage
    await repository.saveCoverage(FIXTURE_APPROVED_BRAINWORKER_A, {
      primaryCityId: 'Lagos',
      primaryCityName: 'Lagos',
      coverageNeighbourhoods: ['Ikeja', 'Yaba'],
      travelRadiusKm: 25,
    });

    const matchingProfile = await repository.getMatchingHydrationProfile(FIXTURE_APPROVED_BRAINWORKER_A);

    expect(matchingProfile.skills).toHaveLength(2);

    // Active service mapped to TaskerSkill with skillId from registry and rate in Kobo (7500 NGN = 750,000 Kobo)
    const dieselSkill = matchingProfile.skills.find(s => s.skillId === 'skill_gen_diesel');
    expect(dieselSkill).toBeDefined();
    expect(dieselSkill?.hourlyRateKobo).toBe(750000);
    expect(dieselSkill?.isActive).toBe(true);

    // Paused service mapped with isActive: false
    const acSkill = matchingProfile.skills.find(s => s.skillId === 'skill_ac_gas');
    expect(acSkill).toBeDefined();
    expect(acSkill?.hourlyRateKobo).toBe(600000);
    expect(acSkill?.isActive).toBe(false);

    // Matching profile preserves availability and coverage state
    expect(matchingProfile.isAvailable).toBe(true);
    expect(matchingProfile.isEmergencyAvailable).toBe(false);
    expect(matchingProfile.weeklySchedule).toEqual(FIXTURE_DEFAULT_WEEKLY_SCHEDULE);
    expect(matchingProfile.travelRadiusKm).toBe(25);
    expect(matchingProfile.primaryCityId).toBe('Lagos');
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // REP-008: Reactive Observer Subscription
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  it('REP-008: reactive observer subscription dispatches updates on catalog or schedule mutations', async () => {
    const { repository } = createOperationsTestHarness();

    const observer = vi.fn();
    const unsubscribe = repository.subscribe?.(FIXTURE_APPROVED_BRAINWORKER_A, observer);
    expect(unsubscribe).toBeDefined();

    // Mutate catalog -> observer invoked
    await repository.saveServiceCatalog(FIXTURE_APPROVED_BRAINWORKER_A, {
      diagnosticFeeNgn: 6000,
      services: [
        {
          serviceId: 'gen-diesel-servicing',
          hourlyRateNgn: 8000,
          status: 'ACTIVE',
        },
      ],
    });

    expect(observer).toHaveBeenCalledTimes(1);
    expect(observer.mock.calls[0]![0]!.catalog.diagnosticFeeNgn).toBe(6000);


    // Mutate availability -> observer invoked again
    await repository.saveAvailability(FIXTURE_APPROVED_BRAINWORKER_A, {
      isAvailable: true,
      isEmergencyAvailable: true,
      weeklySchedule: FIXTURE_DEFAULT_WEEKLY_SCHEDULE,
    });

    expect(observer).toHaveBeenCalledTimes(2);

    // Unsubscribe -> subsequent mutation does not invoke observer
    if (unsubscribe) {
      unsubscribe();
    }

    await repository.saveCoverage(FIXTURE_APPROVED_BRAINWORKER_A, {
      primaryCityId: 'Lagos',
      primaryCityName: 'Lagos',
      coverageNeighbourhoods: ['Ikeja'],
      travelRadiusKm: 15,
    });

    expect(observer).toHaveBeenCalledTimes(2);
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // REP-009: Lossless Schedule Preservation
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  it('REP-009: proves that the 7-day weeklySchedule is stored and retrieved losslessly across all 7 days without data truncation', async () => {
    const { repository } = createOperationsTestHarness();

    // Save with varied schedule having distinct start/end hours for each day
    await repository.saveAvailability(FIXTURE_APPROVED_BRAINWORKER_A, {
      isAvailable: true,
      isEmergencyAvailable: false,
      weeklySchedule: FIXTURE_VARIED_WEEKLY_SCHEDULE,
    });

    const retrieved = await repository.getAvailability(FIXTURE_APPROVED_BRAINWORKER_A);
    expect(retrieved.weeklySchedule).toEqual(FIXTURE_VARIED_WEEKLY_SCHEDULE);

    // Check every single day individually
    expect(retrieved.weeklySchedule.monday).toEqual({
      day: 'monday',
      isActive: true,
      startHour: 7,
      endHour: 17,
    });
    expect(retrieved.weeklySchedule.tuesday).toEqual({
      day: 'tuesday',
      isActive: true,
      startHour: 8,
      endHour: 18,
    });
    expect(retrieved.weeklySchedule.wednesday).toEqual({
      day: 'wednesday',
      isActive: false,
      startHour: 8,
      endHour: 17,
    });
    expect(retrieved.weeklySchedule.thursday).toEqual({
      day: 'thursday',
      isActive: true,
      startHour: 9,
      endHour: 19,
    });
    expect(retrieved.weeklySchedule.friday).toEqual({
      day: 'friday',
      isActive: true,
      startHour: 8,
      endHour: 16,
    });
    expect(retrieved.weeklySchedule.saturday).toEqual({
      day: 'saturday',
      isActive: true,
      startHour: 10,
      endHour: 15,
    });
    expect(retrieved.weeklySchedule.sunday).toEqual({
      day: 'sunday',
      isActive: false,
      startHour: 9,
      endHour: 14,
    });

    // Operational profile also preserves lossless schedule
    const profile = await repository.getOperationalProfile(FIXTURE_APPROVED_BRAINWORKER_A);
    expect(profile?.availability.weeklySchedule).toEqual(FIXTURE_VARIED_WEEKLY_SCHEDULE);
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // REP-010: No Single-Window Collapse (Adapter Invariant)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  it('REP-010: proves matching hydration does not silently collapse or fabricate the seven-day schedule into an arbitrary global start/end window', async () => {
    const { repository } = createOperationsTestHarness();

    await repository.saveAvailability(FIXTURE_APPROVED_BRAINWORKER_A, {
      isAvailable: true,
      isEmergencyAvailable: false,
      weeklySchedule: FIXTURE_VARIED_WEEKLY_SCHEDULE,
    });

    const matchingProfile = await repository.getMatchingHydrationProfile(FIXTURE_APPROVED_BRAINWORKER_A);

    // Weekly schedule must be the full 7-day schedule
    expect(matchingProfile.weeklySchedule).toEqual(FIXTURE_VARIED_WEEKLY_SCHEDULE);

    // Architectural invariant: must not fabricate legacy single-window start/end properties
    const profileAny = matchingProfile as unknown as Record<string, unknown>;
    expect(profileAny.workingHoursStart).toBeUndefined();
    expect(profileAny.workingHoursEnd).toBeUndefined();
  });
});

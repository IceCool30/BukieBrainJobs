// apps/web/lib/brainworker/catalog/validation.test.ts
// Phase 1 RED: Domain Validation & Pricing Invariants (Suite 1: CAT-001 to CAT-010)
// Authoritative References:
// - docs/specs/BW-002-architecture-contract.md (v1.2, Sections 2, 3 & 4)
// - docs/specs/BW-002-test-first-implementation-plan.md (v1.2, Suite 1: CAT-001 to CAT-010)

import { describe, it, expect } from 'vitest';
import {
  validateTradeCategory,
  validateHourlyRate,
  validateDiagnosticFee,
  validateDaySchedule,
  validateTravelRadius,
  isOperationalProfileComplete,
  validateCanonicalServiceId,
  isDispatchEligibleNow,
} from './validation';
import {
  BrainWorkerOperationalProfile,
  BrainWorkerServiceCatalog,
  BrainWorkerAvailability,
  BrainWorkerCoverage,
  ValidTravelRadiusKm,
} from './types';

describe('BW-002 Domain Validation & Invariants (Suite 1: CAT-001 to CAT-010)', () => {
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CAT-001: Category Belongs Strictly to 8 Canonical Categories
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  it('CAT-001: validates category belongs strictly to the 8 canonical categories and rejects invalid categories', () => {
    const canonicalCategories = [
      'generator',
      'ac',
      'plumbing',
      'electrical',
      'carpentry',
      'painting',
      'masonry',
      'welding',
    ];

    for (const cat of canonicalCategories) {
      const result = validateTradeCategory(cat);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    }

    const invalidCategories = [
      'cleaning',
      'appliance',
      'laundry',
      'gardening',
      'hvac',
      'mechanic',
      '',
      '   ',
      'unknown',
    ];

    for (const cat of invalidCategories) {
      const result = validateTradeCategory(cat);
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    }
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CAT-002: Hourly Rate Invariants (₦2,000 to ₦50,000, integer)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  it('CAT-002: validates hourly rate falls between ₦2,000 and ₦50,000 (rejects below ₦2k, above ₦50k, and non-integers)', () => {
    // Valid rates
    const validRates = [2000, 2500, 5000, 10000, 25000, 50000];
    for (const rate of validRates) {
      const result = validateHourlyRate(rate);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    }

    // Below minimum
    const belowMinRates = [1999, 1500, 1000, 500, 0, -5000];
    for (const rate of belowMinRates) {
      const result = validateHourlyRate(rate);
      expect(result.valid).toBe(false);
      expect(result.error).toMatch(/between.*2,000.*50,000|minimum/i);
    }

    // Above maximum
    const aboveMaxRates = [50001, 55000, 100000];
    for (const rate of aboveMaxRates) {
      const result = validateHourlyRate(rate);
      expect(result.valid).toBe(false);
      expect(result.error).toMatch(/between.*2,000.*50,000|maximum/i);
    }

    // Non-integers / invalid
    expect(validateHourlyRate(3500.5).valid).toBe(false);
    expect(validateHourlyRate(4000.25).valid).toBe(false);
    expect(validateHourlyRate(NaN).valid).toBe(false);
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CAT-003: Diagnostic Call-Out Fee Invariants (₦2,000 to ₦20,000)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  it('CAT-003: validates diagnostic call-out fee between ₦2,000 and ₦20,000', () => {
    // Valid fees
    const validFees = [2000, 3000, 5000, 10000, 15000, 20000];
    for (const fee of validFees) {
      const result = validateDiagnosticFee(fee);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    }

    // Below min / above max / non-integer
    expect(validateDiagnosticFee(1999).valid).toBe(false);
    expect(validateDiagnosticFee(0).valid).toBe(false);
    expect(validateDiagnosticFee(-1000).valid).toBe(false);
    expect(validateDiagnosticFee(20001).valid).toBe(false);
    expect(validateDiagnosticFee(35000).valid).toBe(false);
    expect(validateDiagnosticFee(5000.5).valid).toBe(false);
    expect(validateDiagnosticFee(NaN).valid).toBe(false);
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CAT-004: Weekly Schedule Sequence: endHour > startHour for Active Days
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  it('CAT-004: validates weekly schedule enforces endHour > startHour for active days', () => {
    const validSchedule = {
      day: 'monday' as const,
      isActive: true,
      startHour: 8,
      endHour: 17,
    };
    expect(validateDaySchedule(validSchedule).valid).toBe(true);

    const equalHours = {
      day: 'tuesday' as const,
      isActive: true,
      startHour: 10,
      endHour: 10,
    };
    expect(validateDaySchedule(equalHours).valid).toBe(false);

    const invertedHours = {
      day: 'wednesday' as const,
      isActive: true,
      startHour: 17,
      endHour: 9,
    };
    expect(validateDaySchedule(invertedHours).valid).toBe(false);

    const inactiveSchedule = {
      day: 'sunday' as const,
      isActive: false,
      startHour: 0,
      endHour: 0,
    };
    expect(validateDaySchedule(inactiveSchedule).valid).toBe(true);

    // Null or invalid day
    expect(validateDaySchedule(null as unknown as Parameters<typeof validateDaySchedule>[0]).valid).toBe(false);
    expect(
      validateDaySchedule({
        day: 'funday' as unknown as Parameters<typeof validateDaySchedule>[0]['day'],
        isActive: true,
        startHour: 8,
        endHour: 17,
      }).valid
    ).toBe(false);
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CAT-005: Minimum 2-Hour Daily Schedule Window
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  it('CAT-005: rejects daily schedule windows under 2 hours (endHour - startHour < 2)', () => {
    const twoHours = {
      day: 'thursday' as const,
      isActive: true,
      startHour: 9,
      endHour: 11,
    };
    expect(validateDaySchedule(twoHours).valid).toBe(true);

    const fourHours = {
      day: 'friday' as const,
      isActive: true,
      startHour: 8,
      endHour: 12,
    };
    expect(validateDaySchedule(fourHours).valid).toBe(true);

    const oneHour = {
      day: 'monday' as const,
      isActive: true,
      startHour: 9,
      endHour: 10,
    };
    const result = validateDaySchedule(oneHour);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/at least 2 hours|minimum.*2/i);
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CAT-006: Standard Operating Window Enforcement (06:00 to 22:00)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  it('CAT-006: rejects daily hours outside standard operating window (06:00 to 22:00)', () => {
    const boundarySchedule = {
      day: 'saturday' as const,
      isActive: true,
      startHour: 6,
      endHour: 22,
    };
    expect(validateDaySchedule(boundarySchedule).valid).toBe(true);

    const tooEarly = {
      day: 'monday' as const,
      isActive: true,
      startHour: 5,
      endHour: 14,
    };
    const earlyResult = validateDaySchedule(tooEarly);
    expect(earlyResult.valid).toBe(false);
    expect(earlyResult.error).toMatch(/06:00|earlier|operating window/i);

    const tooLate = {
      day: 'friday' as const,
      isActive: true,
      startHour: 14,
      endHour: 23,
    };
    const lateResult = validateDaySchedule(tooLate);
    expect(lateResult.valid).toBe(false);
    expect(lateResult.error).toMatch(/22:00|later|operating window/i);
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CAT-007: Travel Radius Selection Validation ([5, 10, 15, 25, 50])
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  it('CAT-007: validates travel radius selection is strictly one of [5, 10, 15, 25, 50]', () => {
    const validRadii = [5, 10, 15, 25, 50];
    for (const radius of validRadii) {
      const result = validateTravelRadius(radius);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    }

    const invalidRadii = [0, 1, 3, 7, 12, 20, 30, 45, 100, -10];
    for (const radius of invalidRadii) {
      const result = validateTravelRadius(radius);
      expect(result.valid).toBe(false);
      expect(result.error).toMatch(/5, 10, 15, 25, 50|radius/i);
    }
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CAT-008: Operational Readiness Invariant (All 6 Criteria Required)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  it('CAT-008: operational readiness invariant requires all 6 criteria to evaluate isComplete to true', () => {
    const validCatalog: BrainWorkerServiceCatalog = {
      brainWorkerId: 'bw-101',
      diagnosticFeeNgn: 5000,
      services: [
        {
          serviceId: 'gen-diesel-servicing',
          categoryId: 'generator',
          serviceName: 'Diesel Generator Servicing & Overhaul',
          hourlyRateNgn: 7500,
          status: 'ACTIVE',
          updatedAt: '2026-09-25T12:00:00Z',
        },
      ],
      updatedAt: '2026-09-25T12:00:00Z',
    };

    const validAvailability: BrainWorkerAvailability = {
      brainWorkerId: 'bw-101',
      isAvailable: true,
      isEmergencyAvailable: false,
      weeklySchedule: {
        monday: { day: 'monday', isActive: true, startHour: 8, endHour: 17 },
        tuesday: { day: 'tuesday', isActive: true, startHour: 8, endHour: 17 },
        wednesday: { day: 'wednesday', isActive: true, startHour: 8, endHour: 17 },
        thursday: { day: 'thursday', isActive: true, startHour: 8, endHour: 17 },
        friday: { day: 'friday', isActive: true, startHour: 8, endHour: 17 },
        saturday: { day: 'saturday', isActive: false, startHour: 9, endHour: 14 },
        sunday: { day: 'sunday', isActive: false, startHour: 0, endHour: 0 },
      },
      updatedAt: '2026-09-25T12:00:00Z',
    };

    const validCoverage: BrainWorkerCoverage = {
      brainWorkerId: 'bw-101',
      primaryCityId: 'city-lagos',
      primaryCityName: 'Lagos',
      coverageNeighbourhoods: ['Ikeja', 'Lekki'],
      travelRadiusKm: 15,
      updatedAt: '2026-09-25T12:00:00Z',
    };

    // All 6 criteria pass
    expect(
      isOperationalProfileComplete({
        catalog: validCatalog,
        availability: validAvailability,
        coverage: validCoverage,
      })
    ).toBe(true);

    // Partial profile: 1 active service + 1 active day ONLY (missing fee, city, LGAs, radius)
    const partialProfile = {
      catalog: {
        services: [
          {
            serviceId: 'gen-diesel-servicing',
            categoryId: 'generator' as const,
            serviceName: 'Diesel Generator Servicing & Overhaul',
            hourlyRateNgn: 7500,
            status: 'ACTIVE' as const,
            updatedAt: '2026-09-25T12:00:00Z',
          },
        ],
      },
      availability: {
        weeklySchedule: {
          monday: { day: 'monday' as const, isActive: true, startHour: 8, endHour: 17 },
          tuesday: { day: 'tuesday' as const, isActive: false, startHour: 0, endHour: 0 },
          wednesday: { day: 'wednesday' as const, isActive: false, startHour: 0, endHour: 0 },
          thursday: { day: 'thursday' as const, isActive: false, startHour: 0, endHour: 0 },
          friday: { day: 'friday' as const, isActive: false, startHour: 0, endHour: 0 },
          saturday: { day: 'saturday' as const, isActive: false, startHour: 0, endHour: 0 },
          sunday: { day: 'sunday' as const, isActive: false, startHour: 0, endHour: 0 },
        },
      },
    };
    expect(isOperationalProfileComplete(partialProfile)).toBe(false);

    // Missing active services (empty or all PAUSED)
    const firstService = validCatalog.services[0]!;
    const pausedCatalog: BrainWorkerServiceCatalog = {
      ...validCatalog,
      services: [{ ...firstService, status: 'PAUSED' }],
    };
    expect(
      isOperationalProfileComplete({
        catalog: pausedCatalog,
        availability: validAvailability,
        coverage: validCoverage,
      })
    ).toBe(false);

    // Invalid diagnostic fee
    const invalidFeeCatalog = { ...validCatalog, diagnosticFeeNgn: 1000 };
    expect(
      isOperationalProfileComplete({
        catalog: invalidFeeCatalog,
        availability: validAvailability,
        coverage: validCoverage,
      })
    ).toBe(false);

    // Missing primary city or neighbourhoods
    expect(
      isOperationalProfileComplete({
        catalog: validCatalog,
        availability: validAvailability,
        coverage: { ...validCoverage, primaryCityId: '' },
      })
    ).toBe(false);

    expect(
      isOperationalProfileComplete({
        catalog: validCatalog,
        availability: validAvailability,
        coverage: { ...validCoverage, coverageNeighbourhoods: [] },
      })
    ).toBe(false);

    // Invalid radius
    expect(
      isOperationalProfileComplete({
        catalog: validCatalog,
        availability: validAvailability,
        coverage: { ...validCoverage, travelRadiusKm: 20 as unknown as ValidTravelRadiusKm },
      })
    ).toBe(false);

    // Null or undefined profile
    expect(isOperationalProfileComplete(null)).toBe(false);
    expect(isOperationalProfileComplete(undefined)).toBe(false);

    // Whitespace-only neighbourhoods
    expect(
      isOperationalProfileComplete({
        catalog: validCatalog,
        availability: validAvailability,
        coverage: { ...validCoverage, coverageNeighbourhoods: ['', '   '] },
      })
    ).toBe(false);

    // Active service with mismatched categoryId against canonical registry
    expect(
      isOperationalProfileComplete({
        catalog: {
          ...validCatalog,
          services: [{ ...firstService, categoryId: 'plumbing' as const }],
        },
        availability: validAvailability,
        coverage: validCoverage,
      })
    ).toBe(false);
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CAT-009: Canonical Service Registry Adherence
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  it('CAT-009: enforces that configured service IDs must strictly exist in CANONICAL_SERVICES_REGISTRY', () => {
    const testCases = [
      { serviceId: 'gen-diesel-servicing', expectedSkill: 'skill_gen_diesel', expectedCategory: 'generator' },
      { serviceId: 'ac-gas-recharge', expectedSkill: 'skill_ac_gas', expectedCategory: 'ac' },
      { serviceId: 'elec-inverter-solar', expectedSkill: 'skill_elec_solar', expectedCategory: 'electrical' },
      { serviceId: 'plumb-leak-repairs', expectedSkill: 'skill_plumb_leaks', expectedCategory: 'plumbing' },
      { serviceId: 'weld-gate-burglar', expectedSkill: 'skill_weld_gates', expectedCategory: 'welding' },
    ];

    for (const tc of testCases) {
      const result = validateCanonicalServiceId(tc.serviceId);
      expect(result.valid).toBe(true);
      expect(result.service).toBeDefined();
      expect(result.service?.skillId).toBe(tc.expectedSkill);
      expect(result.service?.categoryId).toBe(tc.expectedCategory);
    }

    const invalidIds = [
      'custom-gen-repair',
      'gen-magic-fix',
      'cleaning-home-deep',
      'appliance-fridge-gas',
      'random-12345',
      '',
    ];

    for (const id of invalidIds) {
      const result = validateCanonicalServiceId(id);
      expect(result.valid).toBe(false);
      expect(result.service).toBeUndefined();
      expect(result.error).toMatch(/canonical registry|unrecognized|invalid service/i);
    }
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CAT-010: Dispatch Eligibility Separation (isComplete vs isDispatchEligibleNow)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  it('CAT-010: dispatch eligibility separation proves isComplete === true with isAvailable === false does not grant dispatch eligibility', () => {
    const fullProfile: BrainWorkerOperationalProfile = {
      brainWorkerId: 'bw-101',
      isComplete: true,
      catalog: {
        brainWorkerId: 'bw-101',
        diagnosticFeeNgn: 5000,
        services: [
          {
            serviceId: 'gen-diesel-servicing',
            categoryId: 'generator',
            serviceName: 'Diesel Generator Servicing & Overhaul',
            hourlyRateNgn: 7500,
            status: 'ACTIVE',
            updatedAt: '2026-09-25T12:00:00Z',
          },
        ],
        updatedAt: '2026-09-25T12:00:00Z',
      },
      availability: {
        brainWorkerId: 'bw-101',
        isAvailable: false, // OFF-DUTY
        isEmergencyAvailable: false,
        weeklySchedule: {
          monday: { day: 'monday', isActive: true, startHour: 8, endHour: 17 },
          tuesday: { day: 'tuesday', isActive: true, startHour: 8, endHour: 17 },
          wednesday: { day: 'wednesday', isActive: true, startHour: 8, endHour: 17 },
          thursday: { day: 'thursday', isActive: true, startHour: 8, endHour: 17 },
          friday: { day: 'friday', isActive: true, startHour: 8, endHour: 17 },
          saturday: { day: 'saturday', isActive: false, startHour: 0, endHour: 0 },
          sunday: { day: 'sunday', isActive: false, startHour: 0, endHour: 0 },
        },
        updatedAt: '2026-09-25T12:00:00Z',
      },
      coverage: {
        brainWorkerId: 'bw-101',
        primaryCityId: 'city-lagos',
        primaryCityName: 'Lagos',
        coverageNeighbourhoods: ['Ikeja'],
        travelRadiusKm: 15,
        updatedAt: '2026-09-25T12:00:00Z',
      },
    };

    // 2026-09-28 is a Monday at 10:00 AM (scheduled hours)
    const targetDate = new Date('2026-09-28T10:00:00Z');

    expect(fullProfile.isComplete).toBe(true);
    expect(fullProfile.availability.isAvailable).toBe(false);

    // Complete but off-duty must be false
    expect(isDispatchEligibleNow({ profile: fullProfile, targetDate })).toBe(false);

    // Incomplete profile is never eligible
    const incompleteProfile: BrainWorkerOperationalProfile = {
      ...fullProfile,
      isComplete: false,
      availability: { ...fullProfile.availability, isAvailable: true },
    };
    expect(isDispatchEligibleNow({ profile: incompleteProfile, targetDate })).toBe(false);

    // On-duty and during working hours evaluates to true
    const onDutyProfile: BrainWorkerOperationalProfile = {
      ...fullProfile,
      availability: { ...fullProfile.availability, isAvailable: true },
    };
    const duringWorkingHours = new Date('2026-09-28T10:00:00');
    expect(isDispatchEligibleNow({ profile: onDutyProfile, targetDate: duringWorkingHours })).toBe(true);

    // Outside working hours evaluates to false
    const afterHours = new Date('2026-09-28T21:00:00');
    expect(isDispatchEligibleNow({ profile: onDutyProfile, targetDate: afterHours })).toBe(false);

    // On inactive day evaluates to false
    const onInactiveDay = new Date('2026-09-27T12:00:00'); // Sunday
    expect(isDispatchEligibleNow({ profile: onDutyProfile, targetDate: onInactiveDay })).toBe(false);

    // Null params or invalid date targets
    expect(isDispatchEligibleNow(null)).toBe(false);
    expect(isDispatchEligibleNow(undefined)).toBe(false);
    expect(isDispatchEligibleNow({ profile: onDutyProfile, targetDate: new Date('invalid') })).toBe(false);
    expect(isDispatchEligibleNow({ profile: onDutyProfile, targetDate: '2026-09-28T10:00:00' })).toBe(true);
  });
});

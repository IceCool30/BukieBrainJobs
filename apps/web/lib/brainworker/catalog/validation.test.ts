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
  CANONICAL_TRADE_CATEGORIES,
  CANONICAL_SERVICES_REGISTRY,
} from './types';

describe('BW-002 Domain Validation & Invariants (Suite 1: CAT-001 to CAT-010)', () => {
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CAT-001: Category Belongs Strictly to 8 Canonical Categories
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('CAT-001: Canonical Trade Category Validation', () => {
    it('accepts all 8 canonical BW-001 trade categories', () => {
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
    });

    it('rejects consumer-only and invalid categories', () => {
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
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CAT-002: Hourly Rate Invariants (₦2,000 to ₦50,000, integer)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('CAT-002: Hourly Rate Invariants', () => {
    it('accepts valid whole Naira hourly rates between ₦2,000 and ₦50,000', () => {
      const validRates = [2000, 2500, 5000, 10000, 25000, 50000];

      for (const rate of validRates) {
        const result = validateHourlyRate(rate);
        expect(result.valid).toBe(true);
        expect(result.error).toBeUndefined();
      }
    });

    it('rejects rates below ₦2,000 ceiling minimum', () => {
      const belowMinRates = [1999, 1500, 1000, 500, 0, -5000];

      for (const rate of belowMinRates) {
        const result = validateHourlyRate(rate);
        expect(result.valid).toBe(false);
        expect(result.error).toMatch(/between.*2,000.*50,000|minimum/i);
      }
    });

    it('rejects rates above ₦50,000 ceiling maximum', () => {
      const aboveMaxRates = [50001, 55000, 100000];

      for (const rate of aboveMaxRates) {
        const result = validateHourlyRate(rate);
        expect(result.valid).toBe(false);
        expect(result.error).toMatch(/between.*2,000.*50,000|maximum/i);
      }
    });

    it('rejects non-integer rates or invalid inputs', () => {
      expect(validateHourlyRate(3500.5).valid).toBe(false);
      expect(validateHourlyRate(4000.25).valid).toBe(false);
      expect(validateHourlyRate(NaN).valid).toBe(false);
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CAT-003: Diagnostic Call-Out Fee Invariants (₦2,000 to ₦20,000)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('CAT-003: Diagnostic Call-Out Fee Invariants', () => {
    it('accepts valid diagnostic fees between ₦2,000 and ₦20,000', () => {
      const validFees = [2000, 3000, 5000, 10000, 15000, 20000];

      for (const fee of validFees) {
        const result = validateDiagnosticFee(fee);
        expect(result.valid).toBe(true);
        expect(result.error).toBeUndefined();
      }
    });

    it('rejects diagnostic fees below ₦2,000 or above ₦20,000', () => {
      expect(validateDiagnosticFee(1999).valid).toBe(false);
      expect(validateDiagnosticFee(0).valid).toBe(false);
      expect(validateDiagnosticFee(-1000).valid).toBe(false);
      expect(validateDiagnosticFee(20001).valid).toBe(false);
      expect(validateDiagnosticFee(35000).valid).toBe(false);
    });

    it('rejects non-integer diagnostic fees', () => {
      expect(validateDiagnosticFee(5000.5).valid).toBe(false);
      expect(validateDiagnosticFee(NaN).valid).toBe(false);
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CAT-004: Weekly Schedule Sequence: endHour > startHour for Active Days
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('CAT-004: Schedule Chronological Sequence (endHour > startHour)', () => {
    it('accepts valid schedule where endHour is greater than startHour', () => {
      const validSchedule = {
        day: 'monday' as const,
        isActive: true,
        startHour: 8,
        endHour: 17,
      };

      const result = validateDaySchedule(validSchedule);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('rejects active schedule where endHour is equal to or earlier than startHour', () => {
      const equalHours = {
        day: 'tuesday' as const,
        isActive: true,
        startHour: 10,
        endHour: 10,
      };
      const invertedHours = {
        day: 'wednesday' as const,
        isActive: true,
        startHour: 17,
        endHour: 9,
      };

      expect(validateDaySchedule(equalHours).valid).toBe(false);
      expect(validateDaySchedule(invertedHours).valid).toBe(false);
    });

    it('ignores hour sequence check when day is inactive (isActive: false)', () => {
      const inactiveSchedule = {
        day: 'sunday' as const,
        isActive: false,
        startHour: 0,
        endHour: 0,
      };

      expect(validateDaySchedule(inactiveSchedule).valid).toBe(true);
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CAT-005: Minimum 2-Hour Daily Schedule Window
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('CAT-005: Minimum 2-Hour Schedule Window (endHour - startHour >= 2)', () => {
    it('accepts schedules with at least 2 hours duration', () => {
      const twoHours = {
        day: 'thursday' as const,
        isActive: true,
        startHour: 9,
        endHour: 11,
      };
      const fourHours = {
        day: 'friday' as const,
        isActive: true,
        startHour: 8,
        endHour: 12,
      };

      expect(validateDaySchedule(twoHours).valid).toBe(true);
      expect(validateDaySchedule(fourHours).valid).toBe(true);
    });

    it('rejects schedules with window duration under 2 hours', () => {
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
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CAT-006: Standard Operating Window Enforcement (06:00 to 22:00)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('CAT-006: Standard Operating Window (06:00 to 22:00)', () => {
    it('accepts schedule boundaries at exactly 06:00 start and 22:00 end', () => {
      const fullDay = {
        day: 'saturday' as const,
        isActive: true,
        startHour: 6,
        endHour: 22,
      };

      expect(validateDaySchedule(fullDay).valid).toBe(true);
    });

    it('rejects startHour earlier than 06:00', () => {
      const tooEarly = {
        day: 'monday' as const,
        isActive: true,
        startHour: 5,
        endHour: 14,
      };

      const result = validateDaySchedule(tooEarly);
      expect(result.valid).toBe(false);
      expect(result.error).toMatch(/06:00|earlier|operating window/i);
    });

    it('rejects endHour later than 22:00', () => {
      const tooLate = {
        day: 'friday' as const,
        isActive: true,
        startHour: 14,
        endHour: 23,
      };

      const result = validateDaySchedule(tooLate);
      expect(result.valid).toBe(false);
      expect(result.error).toMatch(/22:00|later|operating window/i);
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CAT-007: Travel Radius Selection Validation ([5, 10, 15, 25, 50])
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('CAT-007: Travel Radius Selection Validation', () => {
    it('accepts valid travel radius values (5, 10, 15, 25, 50 km)', () => {
      const validRadii = [5, 10, 15, 25, 50];

      for (const radius of validRadii) {
        const result = validateTravelRadius(radius);
        expect(result.valid).toBe(true);
        expect(result.error).toBeUndefined();
      }
    });

    it('rejects non-whitelisted travel radius values', () => {
      const invalidRadii = [0, 1, 3, 7, 12, 20, 30, 45, 100, -10];

      for (const radius of invalidRadii) {
        const result = validateTravelRadius(radius);
        expect(result.valid).toBe(false);
        expect(result.error).toMatch(/5, 10, 15, 25, 50|radius/i);
      }
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CAT-008: Operational Readiness Invariant (All 6 Criteria Required)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('CAT-008: Operational Readiness Invariant (isComplete)', () => {
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

    it('evaluates to true when all 6 operational readiness criteria are met', () => {
      const isComplete = isOperationalProfileComplete({
        catalog: validCatalog,
        availability: validAvailability,
        coverage: validCoverage,
      });

      expect(isComplete).toBe(true);
    });

    it('explicitly rejects profile when only 1 active service and 1 active day are set (missing city, LGAs, fee, radius)', () => {
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
          // missing diagnosticFeeNgn
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
        // missing coverage
      };

      expect(isOperationalProfileComplete(partialProfile)).toBe(false);
    });

    it('fails completeness if services array has no ACTIVE items (all paused or empty)', () => {
      const pausedCatalog: BrainWorkerServiceCatalog = {
        ...validCatalog,
        services: [
          { ...validCatalog.services[0], status: 'PAUSED' },
        ],
      };

      expect(
        isOperationalProfileComplete({
          catalog: pausedCatalog,
          availability: validAvailability,
          coverage: validCoverage,
        })
      ).toBe(false);
    });

    it('fails completeness if diagnostic fee is invalid or out of bounds', () => {
      const invalidFeeCatalog: BrainWorkerServiceCatalog = {
        ...validCatalog,
        diagnosticFeeNgn: 1000, // below ₦2,000 minimum
      };

      expect(
        isOperationalProfileComplete({
          catalog: invalidFeeCatalog,
          availability: validAvailability,
          coverage: validCoverage,
        })
      ).toBe(false);
    });

    it('fails completeness if primary city or coverage neighbourhoods are empty', () => {
      const emptyCityCoverage: BrainWorkerCoverage = {
        ...validCoverage,
        primaryCityId: '',
      };
      const emptyLgaCoverage: BrainWorkerCoverage = {
        ...validCoverage,
        coverageNeighbourhoods: [],
      };

      expect(
        isOperationalProfileComplete({
          catalog: validCatalog,
          availability: validAvailability,
          coverage: emptyCityCoverage,
        })
      ).toBe(false);

      expect(
        isOperationalProfileComplete({
          catalog: validCatalog,
          availability: validAvailability,
          coverage: emptyLgaCoverage,
        })
      ).toBe(false);
    });

    it('fails completeness if travel radius is not in [5, 10, 15, 25, 50]', () => {
      const invalidRadiusCoverage = {
        ...validCoverage,
        travelRadiusKm: 20 as any,
      };

      expect(
        isOperationalProfileComplete({
          catalog: validCatalog,
          availability: validAvailability,
          coverage: invalidRadiusCoverage,
        })
      ).toBe(false);
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CAT-009: Canonical Service Registry Adherence
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('CAT-009: Canonical Service Registry Adherence', () => {
    it('accepts valid registered service IDs and returns definition with skillId', () => {
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
    });

    it('rejects arbitrary, un-registered, or consumer service IDs', () => {
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
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CAT-010: Dispatch Eligibility Separation (isComplete vs isDispatchEligibleNow)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('CAT-010: Dispatch Eligibility Separation', () => {
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

    it('proves isComplete === true with isAvailable === false is valid, but isDispatchEligibleNow returns false', () => {
      // 2026-09-28 is a Monday at 10:00 AM (scheduled hours)
      const targetDate = new Date('2026-09-28T10:00:00Z');

      expect(fullProfile.isComplete).toBe(true);
      expect(fullProfile.availability.isAvailable).toBe(false);

      const isEligible = isDispatchEligibleNow({
        profile: fullProfile,
        targetDate,
      });

      // Provider is configured (isComplete: true) but off-duty (isAvailable: false)
      expect(isEligible).toBe(false);
    });

    it('returns false for dispatch eligibility if isComplete is false regardless of isAvailable', () => {
      const incompleteProfile: BrainWorkerOperationalProfile = {
        ...fullProfile,
        isComplete: false,
        availability: {
          ...fullProfile.availability,
          isAvailable: true,
        },
      };

      const targetDate = new Date('2026-09-28T10:00:00Z');
      expect(isDispatchEligibleNow({ profile: incompleteProfile, targetDate })).toBe(false);
    });

    it('returns true when profile is complete, provider is on-duty, and within scheduled hours', () => {
      const onDutyProfile: BrainWorkerOperationalProfile = {
        ...fullProfile,
        availability: {
          ...fullProfile.availability,
          isAvailable: true,
        },
      };

      // 2026-09-28 is a Monday at 10:00 AM (Monday hours are 08:00 to 17:00)
      const duringWorkingHours = new Date('2026-09-28T10:00:00');

      expect(isDispatchEligibleNow({ profile: onDutyProfile, targetDate: duringWorkingHours })).toBe(true);
    });

    it('returns false when on-duty provider is outside scheduled hours or on an inactive day', () => {
      const onDutyProfile: BrainWorkerOperationalProfile = {
        ...fullProfile,
        availability: {
          ...fullProfile.availability,
          isAvailable: true,
        },
      };

      // 2026-09-28 is a Monday at 21:00 (outside 08:00 - 17:00)
      const afterHours = new Date('2026-09-28T21:00:00');
      expect(isDispatchEligibleNow({ profile: onDutyProfile, targetDate: afterHours })).toBe(false);

      // 2026-09-27 is a Sunday (inactive day)
      const onInactiveDay = new Date('2026-09-27T12:00:00');
      expect(isDispatchEligibleNow({ profile: onDutyProfile, targetDate: onInactiveDay })).toBe(false);
    });
  });
});

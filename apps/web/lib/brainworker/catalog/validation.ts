// apps/web/lib/brainworker/catalog/validation.ts
// Phase 1 GREEN: Domain Validation & Invariants
// Governed by: BW-002 Architecture Contract v1.2 & Test-First Implementation Plan v1.2

import {
  CanonicalTradeCategoryId,
  CANONICAL_TRADE_CATEGORIES,
  CanonicalServiceDefinition,
  CANONICAL_SERVICES_REGISTRY,
  MIN_HOURLY_RATE_NGN,
  MAX_HOURLY_RATE_NGN,
  MIN_DIAGNOSTIC_FEE_NGN,
  MAX_DIAGNOSTIC_FEE_NGN,
  MIN_SCHEDULE_START_HOUR,
  MAX_SCHEDULE_END_HOUR,
  MIN_SCHEDULE_WINDOW_HOURS,
  VALID_TRAVEL_RADII_KM,
  ValidTravelRadiusKm,
  DayOfWeek,
  DaySchedule,
  BrainWorkerOperationalProfile,
  BrainWorkerServiceCatalog,
  BrainWorkerAvailability,
  BrainWorkerCoverage,
} from './types';

const DAYS_BY_INDEX: readonly DayOfWeek[] = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
];

const VALID_DAYS_SET = new Set<DayOfWeek>([
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
]);

export function validateTradeCategory(category: string): {
  valid: boolean;
  error?: string | undefined;
} {
  if (
    typeof category === 'string' &&
    CANONICAL_TRADE_CATEGORIES.includes(category as CanonicalTradeCategoryId)
  ) {
    return { valid: true };
  }
  return {
    valid: false,
    error: `Category '${category}' is not one of the 8 canonical trade categories: ${CANONICAL_TRADE_CATEGORIES.join(', ')}.`,
  };
}

export function validateHourlyRate(rate: number): {
  valid: boolean;
  error?: string | undefined;
} {
  if (typeof rate !== 'number' || isNaN(rate) || !Number.isInteger(rate)) {
    return {
      valid: false,
      error: 'Hourly rate must be a whole integer in Naira.',
    };
  }
  if (rate < MIN_HOURLY_RATE_NGN || rate > MAX_HOURLY_RATE_NGN) {
    return {
      valid: false,
      error: `Hourly rate must be between ₦2,000 and ₦50,000. Provided: ₦${rate.toLocaleString()}.`,
    };
  }
  return { valid: true };
}

export function validateDiagnosticFee(fee: number): {
  valid: boolean;
  error?: string | undefined;
} {
  if (typeof fee !== 'number' || isNaN(fee) || !Number.isInteger(fee)) {
    return {
      valid: false,
      error: 'Diagnostic fee must be a whole integer in Naira.',
    };
  }
  if (fee < MIN_DIAGNOSTIC_FEE_NGN || fee > MAX_DIAGNOSTIC_FEE_NGN) {
    return {
      valid: false,
      error: `Diagnostic call-out fee must be between ₦2,000 and ₦20,000. Provided: ₦${fee.toLocaleString()}.`,
    };
  }
  return { valid: true };
}

export function validateDaySchedule(schedule: DaySchedule): {
  valid: boolean;
  error?: string | undefined;
} {
  if (!schedule || typeof schedule !== 'object') {
    return {
      valid: false,
      error: 'Day schedule must be a valid object.',
    };
  }

  if (schedule.day && !VALID_DAYS_SET.has(schedule.day)) {
    return {
      valid: false,
      error: `Day '${schedule.day}' is not a valid day of the week.`,
    };
  }

  if (!schedule.isActive) {
    return { valid: true };
  }

  if (
    typeof schedule.startHour !== 'number' ||
    typeof schedule.endHour !== 'number' ||
    isNaN(schedule.startHour) ||
    isNaN(schedule.endHour) ||
    !Number.isInteger(schedule.startHour) ||
    !Number.isInteger(schedule.endHour)
  ) {
    return {
      valid: false,
      error: 'Schedule hours must be valid integers.',
    };
  }

  if (schedule.startHour < MIN_SCHEDULE_START_HOUR) {
    return {
      valid: false,
      error: 'Start hour cannot be earlier than 06:00 within the standard operating window.',
    };
  }

  if (schedule.endHour > MAX_SCHEDULE_END_HOUR) {
    return {
      valid: false,
      error: 'End hour cannot be later than 22:00 within the standard operating window.',
    };
  }

  if (schedule.startHour > MAX_SCHEDULE_END_HOUR) {
    return {
      valid: false,
      error: 'Start hour cannot be later than 22:00 within the standard operating window.',
    };
  }

  if (schedule.endHour < MIN_SCHEDULE_START_HOUR) {
    return {
      valid: false,
      error: 'End hour cannot be earlier than 06:00 within the standard operating window.',
    };
  }

  if (schedule.endHour <= schedule.startHour) {
    return {
      valid: false,
      error: 'End hour must be strictly greater than start hour.',
    };
  }

  if (schedule.endHour - schedule.startHour < MIN_SCHEDULE_WINDOW_HOURS) {
    return {
      valid: false,
      error: 'Daily schedule window must be at least 2 hours.',
    };
  }

  return { valid: true };
}

export function validateTravelRadius(radiusKm: number): {
  valid: boolean;
  error?: string | undefined;
} {
  if (
    typeof radiusKm === 'number' &&
    VALID_TRAVEL_RADII_KM.includes(radiusKm as ValidTravelRadiusKm)
  ) {
    return { valid: true };
  }
  return {
    valid: false,
    error: `Travel radius must be strictly one of: ${VALID_TRAVEL_RADII_KM.join(', ')} km.`,
  };
}

export function validateCanonicalServiceId(serviceId: string): {
  valid: boolean;
  service?: CanonicalServiceDefinition | undefined;
  error?: string | undefined;
} {
  if (typeof serviceId !== 'string' || !serviceId.trim()) {
    return {
      valid: false,
      service: undefined,
      error: 'Service ID cannot be empty and must exist in the canonical registry.',
    };
  }

  const service = CANONICAL_SERVICES_REGISTRY.find((s) => s.serviceId === serviceId);
  if (!service) {
    return {
      valid: false,
      service: undefined,
      error: `Service ID '${serviceId}' is not recognized in the canonical registry.`,
    };
  }

  return {
    valid: true,
    service,
  };
}

export function isOperationalProfileComplete(
  profile:
    | {
        catalog?: Partial<BrainWorkerServiceCatalog> | null | undefined;
        availability?: Partial<BrainWorkerAvailability> | null | undefined;
        coverage?: Partial<BrainWorkerCoverage> | null | undefined;
      }
    | null
    | undefined
): boolean {
  if (!profile || typeof profile !== 'object') {
    return false;
  }

  // Criterion 1: At least one configured service item is ACTIVE and valid
  const services = profile.catalog?.services;
  const activeServices = Array.isArray(services)
    ? services.filter((s) => s?.status === 'ACTIVE')
    : [];
  const hasActiveService =
    activeServices.length > 0 &&
    activeServices.every((s) => {
      if (!s || !s.serviceId || typeof s.hourlyRateNgn !== 'number') {
        return false;
      }
      const canonical = validateCanonicalServiceId(s.serviceId);
      if (!canonical.valid || !canonical.service) {
        return false;
      }
      if (s.categoryId && s.categoryId !== canonical.service.categoryId) {
        return false;
      }
      return validateHourlyRate(s.hourlyRateNgn).valid;
    });

  // Criterion 2: Valid diagnostic fee (₦2,000 - ₦20,000, whole integer)
  const hasValidDiagnosticFee =
    typeof profile.catalog?.diagnosticFeeNgn === 'number' &&
    validateDiagnosticFee(profile.catalog.diagnosticFeeNgn).valid;

  // Criterion 3: At least one active day with valid schedule, and all active days valid
  const weeklySchedule = profile.availability?.weeklySchedule;
  const schedules = weeklySchedule ? Object.values(weeklySchedule) : [];
  const hasActiveDay = schedules.some((d) => d && d.isActive && validateDaySchedule(d).valid);
  const allDaysValid = schedules.every((d) => !d || validateDaySchedule(d).valid);
  const hasValidSchedule = hasActiveDay && allDaysValid;

  // Criterion 4: Primary operational city designated
  const hasPrimaryCity = Boolean(
    profile.coverage?.primaryCityId && profile.coverage.primaryCityId.trim().length > 0
  );

  // Criterion 5: At least one coverage LGA / operational zone designated
  const hasNeighbourhoods = Boolean(
    Array.isArray(profile.coverage?.coverageNeighbourhoods) &&
      profile.coverage.coverageNeighbourhoods.some(
        (n) => typeof n === 'string' && n.trim().length > 0
      )
  );

  // Criterion 6: Valid discrete travel radius selected
  const hasValidRadius =
    typeof profile.coverage?.travelRadiusKm === 'number' &&
    validateTravelRadius(profile.coverage.travelRadiusKm).valid;

  return (
    hasActiveService &&
    hasValidDiagnosticFee &&
    hasValidSchedule &&
    hasPrimaryCity &&
    hasNeighbourhoods &&
    hasValidRadius
  );
}

export function isDispatchEligibleNow(
  params:
    | {
        profile: BrainWorkerOperationalProfile;
        targetDate?: Date | string | undefined;
      }
    | null
    | undefined
): boolean {
  if (!params || !params.profile || !params.profile.isComplete) {
    return false;
  }

  if (!params.profile.availability || !params.profile.availability.isAvailable) {
    return false;
  }

  let target: Date;
  if (!params.targetDate) {
    target = new Date();
  } else if (typeof params.targetDate === 'string') {
    target = new Date(params.targetDate);
  } else if (params.targetDate instanceof Date) {
    target = params.targetDate;
  } else {
    return false;
  }

  if (isNaN(target.getTime())) {
    return false;
  }

  const dayOfWeek = DAYS_BY_INDEX[target.getDay()];
  if (!dayOfWeek) {
    return false;
  }

  const daySchedule = params.profile.availability.weeklySchedule?.[dayOfWeek];
  if (!daySchedule || !daySchedule.isActive || !validateDaySchedule(daySchedule).valid) {
    return false;
  }

  const hour = target.getHours();
  return hour >= daySchedule.startHour && hour < daySchedule.endHour;
}

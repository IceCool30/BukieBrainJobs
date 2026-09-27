// apps/web/lib/brainworker/leads/domain.ts
// Phase 1 GREEN: Domain Contracts and Eligibility (LEAD-001 to LEAD-007)
// Governed by: BW-003 Architecture Contract v1.0 & Test-First Implementation Plan v1.0

export type DayOfWeek =
  | 'sunday'
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday';

export const DAYS_OF_WEEK: readonly DayOfWeek[] = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
] as const;

export interface ScheduleTimeWindow {
  start: string; // "HH:MM" 24h format
  end: string;   // "HH:MM" 24h format
}

export interface LeadProviderOperationalProfile {
  isComplete: boolean;
  isAvailable: boolean;
  primaryCityId: string;
  operationalZones: string[];
  travelRadiusKm: number;
  activeServiceSkillIds: string[];
  weeklySchedule: Record<DayOfWeek, ScheduleTimeWindow[]>;
}

export interface LeadProviderContext {
  authenticated: boolean;
  role: string;
  isBrainWorkerApproved: boolean;
  operationalProfile: LeadProviderOperationalProfile;
}

export type LeadPricingMode = 'CUSTOMER_POSTED_RATE' | 'WORKER_QUOTE';

export interface RawLeadData {
  id: string;
  jobId: string;
  invitationId: string;
  title: string;
  description: string;
  serviceId: string;
  categoryId: string;
  skillId: string;
  cityId: string;
  neighbourhoodOrZone: string;
  landmark?: string | undefined;
  scheduledStartAt: string;
  scheduledEndAt?: string | undefined;
  urgency: string;
  pricingMode: LeadPricingMode;
  customerBudgetKobo?: number | undefined;
  exactAddress?: string | undefined;
  customerPhone?: string | undefined;
  customerEmail?: string | undefined;
  attachmentRefs?: string[] | undefined;
  invitationState: string;
  sentAt: string;
}

export type ProviderProjectedLead = Omit<
  RawLeadData,
  'exactAddress' | 'customerPhone' | 'customerEmail'
> & {
  exactAddress?: undefined;
  customerPhone?: undefined;
  customerEmail?: undefined;
};

export type IneligibilityReason =
  | 'INCOMPLETE_OPERATIONAL_PROFILE'
  | 'UNAUTHORIZED_ROLE'
  | 'SKILL_MISMATCH'
  | 'OUTSIDE_COVERAGE'
  | 'OUTSIDE_SCHEDULE';

export type LeadEligibilityResult =
  | { eligible: true }
  | { eligible: false; reason: IneligibilityReason };

/**
 * LEAD-001 to LEAD-005: Evaluates whether a lead is eligible for presentation
 * to an authenticated BrainWorker provider based on completeness, role, skills,
 * coverage zones, and lossless weekly schedule.
 */
export function evaluateLeadEligibility(
  provider: LeadProviderContext,
  lead: RawLeadData
): LeadEligibilityResult {
  // LEAD-001: Operational profile completeness gate
  if (!provider.operationalProfile?.isComplete) {
    return { eligible: false, reason: 'INCOMPLETE_OPERATIONAL_PROFILE' };
  }

  // LEAD-002: Authenticated approved BrainWorker role gate
  if (
    !provider.authenticated ||
    provider.role !== 'brainworker' ||
    !provider.isBrainWorkerApproved
  ) {
    return { eligible: false, reason: 'UNAUTHORIZED_ROLE' };
  }

  // LEAD-003: Active configured service skill match
  const activeSkills = provider.operationalProfile.activeServiceSkillIds || [];
  if (!activeSkills.includes(lead.skillId)) {
    return { eligible: false, reason: 'SKILL_MISMATCH' };
  }

  // LEAD-004: Coverage: primary city, operational zones, and travel radius
  const providerCity = provider.operationalProfile.primaryCityId?.toLowerCase().trim();
  const leadCity = lead.cityId?.toLowerCase().trim();
  if (providerCity !== leadCity) {
    return { eligible: false, reason: 'OUTSIDE_COVERAGE' };
  }

  const operationalZones = provider.operationalProfile.operationalZones || [];
  if (operationalZones.length > 0) {
    const leadZone = lead.neighbourhoodOrZone?.toLowerCase().trim();
    const zoneMatch = operationalZones.some(
      (zone) => zone.toLowerCase().trim() === leadZone
    );
    if (!zoneMatch) {
      return { eligible: false, reason: 'OUTSIDE_COVERAGE' };
    }
  }

  // LEAD-005: Lossless weekly schedule eligibility
  const weeklySchedule = provider.operationalProfile.weeklySchedule;
  if (!weeklySchedule) {
    return { eligible: false, reason: 'OUTSIDE_SCHEDULE' };
  }

  const startDate = new Date(lead.scheduledStartAt);
  if (isNaN(startDate.getTime())) {
    return { eligible: false, reason: 'OUTSIDE_SCHEDULE' };
  }

  const dayOfWeek = DAYS_OF_WEEK[startDate.getUTCDay()];
  if (!dayOfWeek) {
    return { eligible: false, reason: 'OUTSIDE_SCHEDULE' };
  }

  const dayWindows = weeklySchedule[dayOfWeek];
  if (!dayWindows || dayWindows.length === 0) {
    return { eligible: false, reason: 'OUTSIDE_SCHEDULE' };
  }

  const hours = String(startDate.getUTCHours()).padStart(2, '0');
  const minutes = String(startDate.getUTCMinutes()).padStart(2, '0');
  const leadTimeStr = `${hours}:${minutes}`;

  const isWithinWindow = dayWindows.some(
    (w) => w.start <= leadTimeStr && leadTimeStr <= w.end
  );

  if (!isWithinWindow) {
    return { eligible: false, reason: 'OUTSIDE_SCHEDULE' };
  }

  return { eligible: true };
}

/**
 * LEAD-006: Projects lead data authorized for the BrainWorker role,
 * strictly masking private customer contact details (address, phone, email).
 */
export function projectLeadForProvider<T extends RawLeadData>(
  lead: T
): ProviderProjectedLead {
  const {
    exactAddress: _address,
    customerPhone: _phone,
    customerEmail: _email,
    ...projected
  } = lead;

  return projected;
}

export interface PaginationOptions {
  limit?: number | undefined;
  cursor?: string | undefined;
}

export interface PaginatedResult<T> {
  items: T[];
  nextCursor?: string | undefined;
}

/**
 * LEAD-007: Orders leads deterministically by sentAt ascending (then ID)
 * and paginates without duplication or skipping.
 */
export function sortAndPaginateLeads<T extends { id: string; sentAt: string }>(
  leads: T[],
  options?: PaginationOptions
): PaginatedResult<T> {
  const limit = options?.limit ?? 10;
  const cursor = options?.cursor;

  const sorted = [...leads].sort((a, b) => {
    const timeDiff = new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime();
    if (timeDiff !== 0) return timeDiff;
    return a.id.localeCompare(b.id);
  });

  let startIndex = 0;
  if (cursor) {
    const cursorIndex = sorted.findIndex((item) => item.id === cursor);
    if (cursorIndex !== -1) {
      startIndex = cursorIndex + 1;
    }
  }

  const items = sorted.slice(startIndex, startIndex + limit);
  const hasMore = startIndex + items.length < sorted.length;
  const nextCursor = hasMore && items.length > 0 ? items[items.length - 1]?.id : undefined;

  return {
    items,
    ...(nextCursor ? { nextCursor } : {}),
  };
}

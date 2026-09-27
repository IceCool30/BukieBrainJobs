// apps/web/lib/brainworker/leads/testing/fixtures.ts
// Deterministic fixtures for BW-003 Phase 2 Repository & Tenant Isolation
// Governed by: BW-003 Architecture Contract v1.0 & Test-First Implementation Plan v1.0
// Strictly for testing. Must never be imported by production code.

import type { AuthUser } from '../../../auth/types';
import type { RawLeadData, LeadProviderContext } from '../domain';
import type { DeclineReason } from '../types';

export const FIXTURE_APPROVED_BRAINWORKER_A = 'bw-lead-001';
export const FIXTURE_APPROVED_BRAINWORKER_B = 'bw-lead-002';
export const FIXTURE_UNAPPROVED_BRAINWORKER = 'bw-lead-unapproved';
export const FIXTURE_INCOMPLETE_BRAINWORKER = 'bw-lead-incomplete';
export const FIXTURE_CUSTOMER_USER_ID = 'cust-lead-999';

export const mockApprovedWorkerA: AuthUser = {
  id: FIXTURE_APPROVED_BRAINWORKER_A,
  name: 'Babatunde Adebayo',
  email: 'babatunde@example.com',
  phone: '+2348031234567',
  provider: 'phone',
  role: 'brainworker',
  isBrainWorkerApproved: true,
};

export const mockApprovedWorkerB: AuthUser = {
  id: FIXTURE_APPROVED_BRAINWORKER_B,
  name: 'Chidi Okonkwo',
  email: 'chidi@example.com',
  phone: '+2348059876543',
  provider: 'phone',
  role: 'brainworker',
  isBrainWorkerApproved: true,
};

export const mockUnapprovedWorker: AuthUser = {
  id: FIXTURE_UNAPPROVED_BRAINWORKER,
  name: 'Emeka Unapproved',
  email: 'emeka@example.com',
  phone: '+2348011223344',
  provider: 'phone',
  role: 'brainworker',
  isBrainWorkerApproved: false,
};

export const mockIncompleteWorker: AuthUser = {
  id: FIXTURE_INCOMPLETE_BRAINWORKER,
  name: 'Funke Incomplete',
  email: 'funke@example.com',
  phone: '+2348099988776',
  provider: 'phone',
  role: 'brainworker',
  isBrainWorkerApproved: true,
};

export const mockCustomerUser: AuthUser = {
  id: FIXTURE_CUSTOMER_USER_ID,
  name: 'Adaeze Okafor',
  email: 'adaeze@example.com',
  phone: '+2348021112233',
  provider: 'google',
  role: 'customer',
  isBrainWorkerApproved: false,
};

export const completeProviderContextA = (): LeadProviderContext => ({
  authenticated: true,
  role: 'brainworker',
  isBrainWorkerApproved: true,
  operationalProfile: {
    isComplete: true,
    isAvailable: true,
    primaryCityId: 'abuja',
    operationalZones: ['Gwarinpa'],
    travelRadiusKm: 15,
    activeServiceSkillIds: ['skill-generator-repair'],
    weeklySchedule: {
      monday: [{ start: '08:00', end: '17:00' }],
      tuesday: [{ start: '08:00', end: '17:00' }],
      wednesday: [{ start: '08:00', end: '17:00' }],
      thursday: [{ start: '08:00', end: '17:00' }],
      friday: [{ start: '08:00', end: '17:00' }],
      saturday: [],
      sunday: [],
    },
  },
});

export const incompleteProviderContext = (): LeadProviderContext => ({
  authenticated: true,
  role: 'brainworker',
  isBrainWorkerApproved: true,
  operationalProfile: {
    isComplete: false,
    isAvailable: false,
    primaryCityId: '',
    operationalZones: [],
    travelRadiusKm: 0,
    activeServiceSkillIds: [],
    weeklySchedule: {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: [],
      sunday: [],
    },
  },
});

export const leadOwnedByA = (overrides: Partial<RawLeadData> = {}): RawLeadData => ({
  id: 'lead-owned-a-001',
  jobId: 'job-001',
  invitationId: 'inv-owned-a-001',
  title: 'Generator service',
  description: 'Generator is not starting.',
  serviceId: 'generator-repair',
  categoryId: 'generator',
  skillId: 'skill-generator-repair',
  cityId: 'abuja',
  neighbourhoodOrZone: 'Gwarinpa',
  landmark: 'Near the main junction',
  scheduledStartAt: '2026-09-28T10:00:00.000Z',
  scheduledEndAt: '2026-09-28T12:00:00.000Z',
  urgency: 'standard',
  pricingMode: 'CUSTOMER_POSTED_RATE',
  customerBudgetKobo: 500000,
  exactAddress: '12 Example Close, Gwarinpa, Abuja',
  customerPhone: '+2348000000000',
  customerEmail: 'customer@example.com',
  attachmentRefs: ['attachment-001'],
  distanceKm: 8,
  invitationState: 'PENDING',
  sentAt: '2026-09-27T10:00:00.000Z',
  ...overrides,
});

export const leadOwnedByB = (overrides: Partial<RawLeadData> = {}): RawLeadData =>
  leadOwnedByA({
    id: 'lead-owned-b-001',
    jobId: 'job-002',
    invitationId: 'inv-owned-b-001',
    ...overrides,
  });

export const respondedLeadOwnedByA = (): RawLeadData =>
  leadOwnedByA({
    id: 'lead-responded-a-001',
    invitationId: 'inv-responded-a-001',
    invitationState: 'ACCEPTED',
  });

export const CANONICAL_DECLINE_REASONS: readonly DeclineReason[] = [
  'SCHEDULE_CONFLICT',
  'OUTSIDE_COVERAGE_AREA',
  'SKILL_TOOL_MISMATCH',
  'RATE_BUDGET_MISMATCH',
  'TEMPORARILY_UNAVAILABLE',
  'OTHER',
] as const;

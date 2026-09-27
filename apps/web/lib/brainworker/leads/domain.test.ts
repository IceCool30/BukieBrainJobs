// apps/web/lib/brainworker/leads/domain.test.ts
// Phase 1 RED: Domain Contracts and Eligibility (LEAD-001 to LEAD-007)
// Authoritative References:
// - docs/specs/BW-003-leads-inbox.md (Approved)
// - docs/specs/BW-003-architecture-contract.md (Approved)
// - docs/specs/BW-003-test-first-implementation-plan.md (Approved)

import { describe, expect, it } from 'vitest';
import {
  evaluateLeadEligibility,
  projectLeadForProvider,
  sortAndPaginateLeads,
} from './domain';

type ProviderFixture = Parameters<typeof evaluateLeadEligibility>[0];
type LeadFixture = Parameters<typeof evaluateLeadEligibility>[1];

const completeProvider = (): ProviderFixture => ({
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

const leadFixture = (overrides: Partial<LeadFixture> = {}): LeadFixture => ({
  id: 'lead-001',
  jobId: 'job-001',
  invitationId: 'inv-001',
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

describe('BW-003 Phase 1: Domain Contracts and Eligibility', () => {
  it('LEAD-001: blocks lead eligibility when operationalProfile.isComplete is false', () => {
    const provider = completeProvider();
    provider.operationalProfile.isComplete = false;

    const result = evaluateLeadEligibility(provider, leadFixture());

    expect(result).toEqual({ eligible: false, reason: 'INCOMPLETE_OPERATIONAL_PROFILE' });
  });

  it('LEAD-002: requires an authenticated approved BrainWorker role', () => {
    const unauthenticated = completeProvider();
    unauthenticated.authenticated = false;

    const customer = completeProvider();
    customer.role = 'customer';

    const unapproved = completeProvider();
    unapproved.isBrainWorkerApproved = false;

    expect(evaluateLeadEligibility(unauthenticated, leadFixture()).eligible).toBe(false);
    expect(evaluateLeadEligibility(customer, leadFixture()).eligible).toBe(false);
    expect(evaluateLeadEligibility(unapproved, leadFixture()).eligible).toBe(false);
  });

  it('LEAD-003: requires an active configured service mapped to the lead skill', () => {
    const provider = completeProvider();
    provider.operationalProfile.activeServiceSkillIds = ['skill-electrical'];

    const result = evaluateLeadEligibility(provider, leadFixture());

    expect(result).toEqual({ eligible: false, reason: 'SKILL_MISMATCH' });
  });

  it('LEAD-004: enforces verified primary city, operational zone, and configured travel radius', () => {
    const provider = completeProvider();

    // Default fixture within radius (8km <= 15km)
    expect(evaluateLeadEligibility(provider, leadFixture()).eligible).toBe(true);

    // Explicit distance within radius passes
    expect(evaluateLeadEligibility(provider, leadFixture({ distanceKm: 12 })).eligible).toBe(true);

    // Outside primary city
    expect(
      evaluateLeadEligibility(
        provider,
        leadFixture({ cityId: 'lagos', neighbourhoodOrZone: 'Ikeja' }),
      ),
    ).toEqual({ eligible: false, reason: 'OUTSIDE_COVERAGE' });

    // Outside operational zone
    expect(
      evaluateLeadEligibility(
        provider,
        leadFixture({ cityId: 'abuja', neighbourhoodOrZone: 'Maitama' }),
      ),
    ).toEqual({ eligible: false, reason: 'OUTSIDE_COVERAGE' });

    // Exceeds configured travel radius (20km > 15km)
    expect(
      evaluateLeadEligibility(
        provider,
        leadFixture({ distanceKm: 20 }),
      ),
    ).toEqual({ eligible: false, reason: 'OUTSIDE_COVERAGE' });

    // Stricter radius provider rejects lead beyond boundary
    const shortRadiusProvider = completeProvider();
    shortRadiusProvider.operationalProfile.travelRadiusKm = 5;
    expect(
      evaluateLeadEligibility(
        shortRadiusProvider,
        leadFixture({ distanceKm: 8 }),
      ),
    ).toEqual({ eligible: false, reason: 'OUTSIDE_COVERAGE' });
  });

  it('LEAD-005: uses the lossless weekly schedule and duty state without fabricating a legacy global window', () => {
    const provider = completeProvider();
    provider.operationalProfile.weeklySchedule = {
      monday: [],
      tuesday: [{ start: '08:00', end: '17:00' }],
      wednesday: [],
      thursday: [{ start: '10:00', end: '18:00' }],
      friday: [],
      saturday: [],
      sunday: [],
    };

    const scheduled = leadFixture({ scheduledStartAt: '2026-09-29T10:00:00.000Z' });
    const unscheduled = leadFixture({ scheduledStartAt: '2026-09-28T10:00:00.000Z' });

    expect(evaluateLeadEligibility(provider, scheduled).eligible).toBe(true);
    expect(evaluateLeadEligibility(provider, unscheduled)).toEqual({
      eligible: false,
      reason: 'OUTSIDE_SCHEDULE',
    });

    // Off-duty provider is ineligible even during scheduled working hours
    const offDutyProvider = completeProvider();
    offDutyProvider.operationalProfile.weeklySchedule = provider.operationalProfile.weeklySchedule;
    offDutyProvider.operationalProfile.isAvailable = false;
    expect(evaluateLeadEligibility(offDutyProvider, scheduled)).toEqual({
      eligible: false,
      reason: 'OFF_DUTY',
    });

    expect(provider.operationalProfile).not.toHaveProperty('workingHoursStart');
    expect(provider.operationalProfile).not.toHaveProperty('workingHoursEnd');
  });

  it('LEAD-006: projects only provider-authorized customer/job data and masks private contact details', () => {
    const projected = projectLeadForProvider(leadFixture({ distanceKm: 8 }));

    expect(projected.exactAddress).toBeUndefined();
    expect(projected.customerPhone).toBeUndefined();
    expect(projected.customerEmail).toBeUndefined();
    expect(projected.cityId).toBe('abuja');
    expect(projected.neighbourhoodOrZone).toBe('Gwarinpa');
    expect(projected.landmark).toBe('Near the main junction');
    expect(projected.attachmentRefs).toEqual(['attachment-001']);
    expect(projected.distanceKm).toBe(8);
  });

  it('LEAD-007: orders deterministically and paginates without duplicating or skipping leads', () => {
    const leads = [
      leadFixture({ id: 'lead-003', sentAt: '2026-09-27T12:00:00.000Z' }),
      leadFixture({ id: 'lead-001', sentAt: '2026-09-27T10:00:00.000Z' }),
      leadFixture({ id: 'lead-002', sentAt: '2026-09-27T11:00:00.000Z' }),
    ];

    const firstPage = sortAndPaginateLeads(leads, { limit: 2 });
    const secondPage = sortAndPaginateLeads(leads, {
      limit: 2,
      cursor: firstPage.nextCursor,
    });

    expect(firstPage.items.map((lead) => lead.id)).toEqual(['lead-001', 'lead-002']);
    expect(secondPage.items.map((lead) => lead.id)).toEqual(['lead-003']);
    expect(new Set([...firstPage.items, ...secondPage.items].map((lead) => lead.id)).size).toBe(3);
  });
});

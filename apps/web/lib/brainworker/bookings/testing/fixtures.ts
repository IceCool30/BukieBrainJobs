// apps/web/lib/brainworker/bookings/testing/fixtures.ts
// Deterministic fixtures for BW-004 Phase 2 Repository & Tenant Isolation
// Governed by: BW-004-ARCH v0.2 section 2, section 5, section 6
// Strictly for testing. Must never be imported by production code.

import type { AuthUser } from '../../../auth/types';
import type { RawBookingRecord, LocationSnapshot } from '../types';

export const FIXTURE_APPROVED_BRAINWORKER_A = 'bw-booking-001';
export const FIXTURE_APPROVED_BRAINWORKER_B = 'bw-booking-002';
export const FIXTURE_UNAPPROVED_BRAINWORKER = 'bw-booking-unapproved';
export const FIXTURE_INCOMPLETE_BRAINWORKER = 'bw-booking-incomplete';
export const FIXTURE_CUSTOMER_USER_ID = 'cust-booking-999';

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
  name: 'Adaeze Customer',
  email: 'adaeze@example.com',
  phone: '+2348021112233',
  provider: 'google',
  role: 'customer',
  isBrainWorkerApproved: false,
};

export const FIXTURE_LOCATION_SNAPSHOT: LocationSnapshot = {
  latitude: 9.0765,
  longitude: 7.3986,
  accuracyMeters: 12,
};

export function bookingOwnedByA(
  overrides?: Partial<RawBookingRecord>
): RawBookingRecord {
  return {
    bookingId: 'booking-a-001',
    taskerProfileId: FIXTURE_APPROVED_BRAINWORKER_A,
    jobId: 'job-a-001',
    referenceCode: 'BK-9021',
    title: 'Generator Maintenance and Carburetor Tuning',
    description: 'Perform regular servicing and repair starting coil assembly.',
    serviceId: 'service-generator-repair',
    scheduledStartAt: '2026-10-15T09:00:00.000Z',
    jobStatus: 'CONFIRMED',
    dispatchStatus: 'NOT_STARTED',
    generalLocation: {
      cityId: 'abuja',
      neighbourhoodOrZone: 'Gwarinpa',
      landmark: 'Near 1st Avenue junction',
    },
    exactAddress: 'Plot 42, 3rd Avenue, Gwarinpa, Abuja',
    escrowStatus: 'held_in_escrow',
    privacyConsentRecorded: true,
    scopeAdjustments: [],
    unreadMessageCount: 0,
    conversationId: 'convo-job-a-001',
    ...overrides,
  };
}

export function bookingOwnedByB(
  overrides?: Partial<RawBookingRecord>
): RawBookingRecord {
  return {
    bookingId: 'booking-b-001',
    taskerProfileId: FIXTURE_APPROVED_BRAINWORKER_B,
    jobId: 'job-b-001',
    referenceCode: 'BK-9022',
    title: 'Air Conditioner Coil Cleaning',
    description: 'Clean split unit coils and verify refrigerant pressure.',
    serviceId: 'service-ac-repair',
    scheduledStartAt: '2026-10-15T11:00:00.000Z',
    jobStatus: 'CONFIRMED',
    dispatchStatus: 'NOT_STARTED',
    generalLocation: {
      cityId: 'abuja',
      neighbourhoodOrZone: 'Maitama',
      landmark: 'Near Farmers Market',
    },
    exactAddress: '15 Danube Street, Maitama, Abuja',
    escrowStatus: 'held_in_escrow',
    privacyConsentRecorded: true,
    scopeAdjustments: [],
    unreadMessageCount: 0,
    conversationId: 'convo-job-b-001',
    ...overrides,
  };
}

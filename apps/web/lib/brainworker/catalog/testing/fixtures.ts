// apps/web/lib/brainworker/catalog/testing/fixtures.ts
// Deterministic Test Fixtures for BW-002 BrainWorker Service Catalog & Availability
// Governed by: BW-002 Architecture Contract v1.2 & Test-First Implementation Plan v1.2

import type { AuthUser } from '../../auth/types';
import type { BrainWorkerOnboardingRecord } from '../..';
import type {
  BrainWorkerOperationalProfile,
  BrainWorkerServiceCatalog,
  BrainWorkerAvailability,
  BrainWorkerCoverage,
  DayOfWeek,
  DaySchedule,
  ConfiguredServiceItem,
} from '../types';

export const FIXTURE_APPROVED_BRAINWORKER_A = 'bw-cat-001';
export const FIXTURE_APPROVED_BRAINWORKER_B = 'bw-cat-002';
export const FIXTURE_UNAPPROVED_BRAINWORKER = 'bw-cat-unapproved';
export const FIXTURE_CUSTOMER_USER_ID = 'cust-cat-999';

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

export const mockCustomerUser: AuthUser = {
  id: FIXTURE_CUSTOMER_USER_ID,
  name: 'Adaeze Okafor',
  email: 'adaeze@example.com',
  phone: '+2348021112233',
  provider: 'google',
  role: 'customer',
  isBrainWorkerApproved: false,
};

export const FIXTURE_ONBOARDING_RECORD_A: BrainWorkerOnboardingRecord = {
  id: `onb_${FIXTURE_APPROVED_BRAINWORKER_A}`,
  brainWorkerId: FIXTURE_APPROVED_BRAINWORKER_A,
  status: 'APPROVED',
  currentStep: 'review',
  identity: {
    legalFirstName: 'Babatunde',
    legalLastName: 'Adebayo',
    dateOfBirth: '1992-06-14',
    identifierType: 'NIN',
    identifierNumber: '12345678901',
    maskedIdentifier: '•••••••8901',
    residentialAddress: {
      street: '14 Commercial Avenue, Yaba',
      city: 'Lagos',
      lga: 'Lagos Mainland',
      state: 'Lagos',
    },
  },
  trade: {
    primaryCategory: 'generator',
    subSpecialties: ['Diesel Generators', 'Silent Enclosures'],
    experienceLevel: 'JOURNEYMAN_EXPERIENCED',
    yearsInTrade: 6,
    coverageCities: ['Lagos', 'Ibadan'],
  },
  credentials: {
    governmentId: {
      id: 'doc-gov-001',
      category: 'GOVERNMENT_ID',
      specificType: 'NATIONAL_EID',
      fileName: 'national-id.jpg',
      fileSizeBytes: 1024 * 1024,
      mimeType: 'image/jpeg',
      stagedAt: '2026-09-24T08:00:00.000Z',
    },
    tradeCredentials: [
      {
        id: 'doc-trd-001',
        category: 'TRADE_CREDENTIAL',
        specificType: 'TRADE_TEST_CERTIFICATE',
        fileName: 'trade-cert.pdf',
        fileSizeBytes: 1024 * 1024,
        mimeType: 'application/pdf',
        stagedAt: '2026-09-24T08:05:00.000Z',
      },
    ],
    workProofs: [],
  },
  declaration: {
    truthfulnessAcknowledged: true,
    termsAccepted: true,
    declaredAt: '2026-09-24T08:10:00.000Z',
  },
  remediationIssues: [],
  rejectionDetails: null,
  submittedAt: '2026-09-24T08:10:00.000Z',
  reviewedAt: '2026-09-24T09:00:00.000Z',
  createdAt: '2026-09-24T07:55:00.000Z',
  updatedAt: '2026-09-24T09:00:00.000Z',
};

export const FIXTURE_DEFAULT_WEEKLY_SCHEDULE: Record<DayOfWeek, DaySchedule> = {
  monday: { day: 'monday', isActive: true, startHour: 8, endHour: 18 },
  tuesday: { day: 'tuesday', isActive: true, startHour: 8, endHour: 18 },
  wednesday: { day: 'wednesday', isActive: true, startHour: 8, endHour: 18 },
  thursday: { day: 'thursday', isActive: true, startHour: 8, endHour: 18 },
  friday: { day: 'friday', isActive: true, startHour: 8, endHour: 18 },
  saturday: { day: 'saturday', isActive: false, startHour: 9, endHour: 17 },
  sunday: { day: 'sunday', isActive: false, startHour: 9, endHour: 17 },
};

export const FIXTURE_VARIED_WEEKLY_SCHEDULE: Record<DayOfWeek, DaySchedule> = {
  monday: { day: 'monday', isActive: true, startHour: 7, endHour: 17 },
  tuesday: { day: 'tuesday', isActive: true, startHour: 8, endHour: 18 },
  wednesday: { day: 'wednesday', isActive: false, startHour: 8, endHour: 17 },
  thursday: { day: 'thursday', isActive: true, startHour: 9, endHour: 19 },
  friday: { day: 'friday', isActive: true, startHour: 8, endHour: 16 },
  saturday: { day: 'saturday', isActive: true, startHour: 10, endHour: 15 },
  sunday: { day: 'sunday', isActive: false, startHour: 9, endHour: 14 },
};

export const FIXTURE_CONFIGURED_SERVICES: ConfiguredServiceItem[] = [
  {
    serviceId: 'gen-diesel-servicing',
    categoryId: 'generator',
    serviceName: 'Diesel Generator Servicing & Overhaul',
    hourlyRateNgn: 7500,
    status: 'ACTIVE',
    updatedAt: '2026-09-25T10:00:00.000Z',
  },
  {
    serviceId: 'ac-gas-recharge',
    categoryId: 'ac',
    serviceName: 'AC Refrigerant Gas Top-Up & Leak Sealing',
    hourlyRateNgn: 6000,
    status: 'PAUSED',
    updatedAt: '2026-09-25T10:00:00.000Z',
  },
];

export const FIXTURE_SERVICE_CATALOG_A: BrainWorkerServiceCatalog = {
  brainWorkerId: FIXTURE_APPROVED_BRAINWORKER_A,
  diagnosticFeeNgn: 5000,
  services: FIXTURE_CONFIGURED_SERVICES,
  updatedAt: '2026-09-25T10:00:00.000Z',
};

export const FIXTURE_AVAILABILITY_A: BrainWorkerAvailability = {
  brainWorkerId: FIXTURE_APPROVED_BRAINWORKER_A,
  isAvailable: true,
  isEmergencyAvailable: false,
  weeklySchedule: FIXTURE_DEFAULT_WEEKLY_SCHEDULE,
  updatedAt: '2026-09-25T10:00:00.000Z',
};

export const FIXTURE_COVERAGE_A: BrainWorkerCoverage = {
  brainWorkerId: FIXTURE_APPROVED_BRAINWORKER_A,
  primaryCityId: 'Lagos',
  primaryCityName: 'Lagos',
  coverageNeighbourhoods: ['Ikeja', 'Yaba', 'Surulere'],
  travelRadiusKm: 25,
  updatedAt: '2026-09-25T10:00:00.000Z',
};

export const FIXTURE_OPERATIONAL_PROFILE_A: BrainWorkerOperationalProfile = {
  brainWorkerId: FIXTURE_APPROVED_BRAINWORKER_A,
  catalog: FIXTURE_SERVICE_CATALOG_A,
  availability: FIXTURE_AVAILABILITY_A,
  coverage: FIXTURE_COVERAGE_A,
  isComplete: true,
};

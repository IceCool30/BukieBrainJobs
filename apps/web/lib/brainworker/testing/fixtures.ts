// apps/web/lib/brainworker/testing/fixtures.ts
// Deterministic Test Fixtures for BW-001
// Governed by: BW-001 Architecture Contract v1.0 & Test-First Implementation Plan v1.0

import type {
  BrainWorkerOnboardingRecord,
  OnboardingIdentityData,
  OnboardingTradeData,
  OnboardingCredentialsData,
  StagedDocument,
} from '../types';

export const FIXTURE_BRAINWORKER_A = 'bw-app-001';
export const FIXTURE_BRAINWORKER_B = 'bw-app-002';
export const FIXTURE_CUSTOMER_USER_ID = 'cust-user-999';

export const FIXTURE_IDENTITY_VALID: OnboardingIdentityData = {
  legalFirstName: 'Babatunde',
  legalMiddleName: 'Olufemi',
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
};

export const FIXTURE_TRADE_VALID: OnboardingTradeData = {
  primaryCategory: 'generator',
  subSpecialties: ['Diesel Generators', 'Automatic Transfer Switches', 'Silent Enclosures'],
  experienceLevel: 'JOURNEYMAN_EXPERIENCED',
  yearsInTrade: 6,
  coverageCities: ['Lagos', 'Ibadan'],
};

export const FIXTURE_GOV_DOC: StagedDocument = {
  id: 'doc-gov-001',
  category: 'GOVERNMENT_ID',
  specificType: 'NATIONAL_EID',
  fileName: 'national-id.jpg',
  fileSizeBytes: 1.8 * 1024 * 1024,
  mimeType: 'image/jpeg',
  stagedAt: '2026-09-24T08:00:00.000Z',
  previewUrl: 'blob:http://localhost:3000/preview-gov-001',
};

export const FIXTURE_TRADE_DOC: StagedDocument = {
  id: 'doc-trd-001',
  category: 'TRADE_CREDENTIAL',
  specificType: 'TRADE_TEST_CERTIFICATE',
  fileName: 'trade-test-grade-1.pdf',
  fileSizeBytes: 2.2 * 1024 * 1024,
  mimeType: 'application/pdf',
  stagedAt: '2026-09-24T08:05:00.000Z',
};

export const FIXTURE_WORK_DOC: StagedDocument = {
  id: 'doc-wrk-001',
  category: 'WORK_PROOF',
  specificType: 'WORKSHOP_PHOTO',
  fileName: 'workshop-signboard.jpg',
  fileSizeBytes: 1.1 * 1024 * 1024,
  mimeType: 'image/jpeg',
  stagedAt: '2026-09-24T08:10:00.000Z',
  previewUrl: 'blob:http://localhost:3000/preview-wrk-001',
};

export const FIXTURE_CREDENTIALS_VALID: OnboardingCredentialsData = {
  governmentId: FIXTURE_GOV_DOC,
  tradeCredentials: [FIXTURE_TRADE_DOC],
  workProofs: [FIXTURE_WORK_DOC],
};

export const FIXTURE_RECORD_NEW: BrainWorkerOnboardingRecord = {
  id: 'rec-bw-001',
  brainWorkerId: FIXTURE_BRAINWORKER_A,
  status: 'DRAFT',
  currentStep: 'identity',
  identity: null,
  trade: null,
  credentials: {
    governmentId: null,
    tradeCredentials: [],
    workProofs: [],
  },
  declaration: {
    truthfulnessAcknowledged: false,
    termsAccepted: false,
    declaredAt: null,
  },
  remediationIssues: [],
  rejectionDetails: null,
  submittedAt: null,
  reviewedAt: null,
  createdAt: '2026-09-24T07:00:00.000Z',
  updatedAt: '2026-09-24T07:00:00.000Z',
};

export const FIXTURE_RECORD_SUBMITTED: BrainWorkerOnboardingRecord = {
  ...FIXTURE_RECORD_NEW,
  status: 'SUBMITTED',
  currentStep: 'review',
  identity: FIXTURE_IDENTITY_VALID,
  trade: FIXTURE_TRADE_VALID,
  credentials: FIXTURE_CREDENTIALS_VALID,
  declaration: {
    truthfulnessAcknowledged: true,
    termsAccepted: true,
    declaredAt: '2026-09-24T08:30:00.000Z',
  },
  submittedAt: '2026-09-24T08:30:00.000Z',
  updatedAt: '2026-09-24T08:30:00.000Z',
};

export const FIXTURE_RECORD_REMEDIATION: BrainWorkerOnboardingRecord = {
  ...FIXTURE_RECORD_SUBMITTED,
  status: 'REMEDIATION_REQUIRED',
  currentStep: 'credentials',
  remediationIssues: [
    {
      targetStep: 'credentials',
      fieldKey: 'governmentId',
      issueCode: 'BLURRY_IMAGE',
      message: 'The photo of your National e-ID Card is blurry. Please upload a clear photo.',
      flaggedAt: '2026-09-24T09:00:00.000Z',
    },
  ],
  updatedAt: '2026-09-24T09:00:00.000Z',
};

export const FIXTURE_RECORD_REJECTED: BrainWorkerOnboardingRecord = {
  ...FIXTURE_RECORD_SUBMITTED,
  status: 'REJECTED',
  rejectionDetails: {
    reasonCode: 'UNVERIFIABLE_CREDENTIALS',
    message: 'We were unable to verify your trade test certificate with the issuing body.',
    rejectedAt: '2026-09-24T09:15:00.000Z',
  },
  reviewedAt: '2026-09-24T09:15:00.000Z',
  updatedAt: '2026-09-24T09:15:00.000Z',
};

export const FIXTURE_RECORD_APPROVED: BrainWorkerOnboardingRecord = {
  ...FIXTURE_RECORD_SUBMITTED,
  status: 'APPROVED',
  reviewedAt: '2026-09-24T10:00:00.000Z',
  updatedAt: '2026-09-24T10:00:00.000Z',
};

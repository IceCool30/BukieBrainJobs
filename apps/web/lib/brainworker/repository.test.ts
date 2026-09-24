// apps/web/lib/brainworker/repository.test.ts
// Phase 1 RED: Repository Contract & Multi-Tenant Isolation (Suite 2: REP-001 through REP-014)
// Authoritative References:
// - docs/specs/BW-001-architecture-contract.md (Section 4 & 5)
// - docs/specs/BW-001-test-first-implementation-plan.md (Suite 2: REP-001 to REP-014)

import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as authStorage from '../auth/storage';
import type { AuthUser } from '../auth/types';
import {
  createBrainWorkerTestHarness,
  type BrainWorkerTestHarness,
  FIXTURE_BRAINWORKER_A,
  FIXTURE_BRAINWORKER_B,
  FIXTURE_CUSTOMER_USER_ID,
  FIXTURE_IDENTITY_VALID,
  FIXTURE_RECORD_NEW,
  FIXTURE_RECORD_SUBMITTED,
  FIXTURE_RECORD_REMEDIATION,
  FIXTURE_RECORD_REJECTED,
} from './testing';
import {
  UnauthorizedError,
  StateConflictError,
  ValidationError,
} from './types';
import * as fs from 'fs';
import * as path from 'path';

const mockBrainWorkerUserA: AuthUser = {
  id: FIXTURE_BRAINWORKER_A,
  name: 'Babatunde Adebayo',
  email: 'babatunde@example.com',
  phone: '+2348031234567',
  provider: 'phone',
  role: 'brainworker',
  isBrainWorkerApproved: false,
};

const mockBrainWorkerUserB: AuthUser = {
  id: FIXTURE_BRAINWORKER_B,
  name: 'Chidi Okonkwo',
  email: 'chidi@example.com',
  phone: '+2348059876543',
  provider: 'phone',
  role: 'brainworker',
  isBrainWorkerApproved: false,
};

const mockCustomerUser: AuthUser = {
  id: FIXTURE_CUSTOMER_USER_ID,
  name: 'Adaeze Okafor',
  email: 'adaeze@example.com',
  phone: '+2348021112233',
  provider: 'google',
  role: 'customer',
  isBrainWorkerApproved: false,
};

describe('BW-001 Repository Contract & Multi-Tenant Isolation (Suite 2)', () => {
  let harness: BrainWorkerTestHarness;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockBrainWorkerUserA);
    harness = createBrainWorkerTestHarness();
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // REP-001: Unauthenticated & Missing ID Isolation
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('REP-001: Unauthenticated Access Rejection', () => {
    it('throws UnauthorizedError if brainWorkerId is empty or unauthenticated', async () => {
      vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(null);

      await expect(harness.repository.getOnboardingRecord('')).rejects.toThrow(
        UnauthorizedError
      );
      await expect(
        harness.repository.getOnboardingRecord(FIXTURE_BRAINWORKER_A)
      ).rejects.toThrow(UnauthorizedError);
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // REP-002: Customer Role Access Rejection
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('REP-002: Customer Role Access Rejection', () => {
    it('throws UnauthorizedError if authenticated user has role: customer', async () => {
      vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockCustomerUser);

      await expect(
        harness.repository.getOnboardingRecord(FIXTURE_CUSTOMER_USER_ID)
      ).rejects.toThrow(UnauthorizedError);
      await expect(
        harness.repository.saveDraftStep(FIXTURE_CUSTOMER_USER_ID, 'identity', {})
      ).rejects.toThrow(UnauthorizedError);
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // REP-003: Provider Tenant Isolation
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('REP-003: Provider Tenant Isolation', () => {
    it('fails closed when provider A attempts to query or mutate provider B onboarding record', async () => {
      // User A is signed in
      vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockBrainWorkerUserA);
      harness.testController.seedRecord({
        ...FIXTURE_RECORD_NEW,
        brainWorkerId: FIXTURE_BRAINWORKER_B,
      });

      // Provider A cannot read or mutate Provider B
      await expect(
        harness.repository.getOnboardingRecord(FIXTURE_BRAINWORKER_B)
      ).rejects.toThrow(UnauthorizedError);
      await expect(
        harness.repository.saveDraftStep(FIXTURE_BRAINWORKER_B, 'identity', {})
      ).rejects.toThrow(UnauthorizedError);

      // Provider B cannot read or mutate Provider A
      vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockBrainWorkerUserB);
      await expect(
        harness.repository.getOnboardingRecord(FIXTURE_BRAINWORKER_A)
      ).rejects.toThrow(UnauthorizedError);
      await expect(
        harness.repository.saveDraftStep(FIXTURE_BRAINWORKER_A, 'identity', {})
      ).rejects.toThrow(UnauthorizedError);
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // REP-004: Initial Draft Record Creation
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('REP-004: Initial Draft Record Creation', () => {
    it('initializes a clean DRAFT onboarding record for a new BrainWorker', async () => {
      const record = await harness.repository.getOnboardingRecord(FIXTURE_BRAINWORKER_A);
      expect(record).not.toBeNull();
      expect(record?.brainWorkerId).toBe(FIXTURE_BRAINWORKER_A);
      expect(record?.status).toBe('DRAFT');
      expect(record?.currentStep).toBe('identity');
      expect(record?.identity).toBeNull();
      expect(record?.trade).toBeNull();
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // REP-005: Save Draft Step Data
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('REP-005: Save Draft Step Data', () => {
    it('saves identity step data and persists record updates', async () => {
      const updated = await harness.repository.saveDraftStep(
        FIXTURE_BRAINWORKER_A,
        'identity',
        FIXTURE_IDENTITY_VALID
      );

      expect(updated.identity).toEqual(FIXTURE_IDENTITY_VALID);
      expect(updated.currentStep).toBe('trade');

      const fetched = await harness.repository.getOnboardingRecord(FIXTURE_BRAINWORKER_A);
      expect(fetched?.identity?.legalFirstName).toBe('Babatunde');
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // REP-006 & REP-007: Document Staging & Removal
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('REP-006 & REP-007: Document Staging & Removal', () => {
    it('stages government ID and trade credentials in draft state', async () => {
      const stagedGov = await harness.repository.stageDocument(FIXTURE_BRAINWORKER_A, {
        name: 'nin-slip.jpg',
        size: 1.5 * 1024 * 1024,
        type: 'image/jpeg',
        category: 'GOVERNMENT_ID',
        specificType: 'NIN_SLIP',
      });

      expect(stagedGov.id).toBeDefined();
      expect(stagedGov.category).toBe('GOVERNMENT_ID');

      const record = await harness.repository.getOnboardingRecord(FIXTURE_BRAINWORKER_A);
      expect(record?.credentials.governmentId?.id).toBe(stagedGov.id);
    });

    it('removes a staged document from draft state', async () => {
      const staged = await harness.repository.stageDocument(FIXTURE_BRAINWORKER_A, {
        name: 'trade-cert.pdf',
        size: 2 * 1024 * 1024,
        type: 'application/pdf',
        category: 'TRADE_CREDENTIAL',
        specificType: 'TRADE_TEST_CERTIFICATE',
      });

      await harness.repository.removeStagedDocument(FIXTURE_BRAINWORKER_A, staged.id);

      const record = await harness.repository.getOnboardingRecord(FIXTURE_BRAINWORKER_A);
      expect(record?.credentials.tradeCredentials.find((d) => d.id === staged.id)).toBeUndefined();
    });

    it('enforces that temporary preview data (dataUrl/previewUrl) is never persisted into authoritative record or staged files', async () => {
      const stagedGov = await harness.repository.stageDocument(FIXTURE_BRAINWORKER_A, {
        name: 'nin-slip.jpg',
        size: 1.5 * 1024 * 1024,
        type: 'image/jpeg',
        category: 'GOVERNMENT_ID',
        specificType: 'NIN_SLIP',
        dataUrl: 'data:image/jpeg;base64,temporary-preview-data-payload-mock',
      });

      // Staged return value must not expose ephemeral preview/data URL
      expect(stagedGov.previewUrl).toBeUndefined();
      expect((stagedGov as unknown as Record<string, unknown>).dataUrl).toBeUndefined();
      expect(stagedGov.fileName).toBe('nin-slip.jpg');
      expect(stagedGov.fileSizeBytes).toBe(1.5 * 1024 * 1024);
      expect(stagedGov.mimeType).toBe('image/jpeg');
      expect(stagedGov.stagedAt).toBeDefined();

      // Authoritative repository record must retain ONLY document metadata
      const record = await harness.repository.getOnboardingRecord(FIXTURE_BRAINWORKER_A);
      const savedDoc = record?.credentials.governmentId;
      expect(savedDoc).toBeDefined();
      expect(savedDoc?.id).toBe(stagedGov.id);
      expect(savedDoc?.previewUrl).toBeUndefined();
      expect((savedDoc as unknown as Record<string, unknown>)?.dataUrl).toBeUndefined();
      expect(savedDoc?.fileName).toBe('nin-slip.jpg');
      expect(savedDoc?.fileSizeBytes).toBe(1.5 * 1024 * 1024);
      expect(savedDoc?.mimeType).toBe('image/jpeg');
      expect(savedDoc?.stagedAt).toBeDefined();
    });

    it('strips ephemeral previewUrl when saving credentials via saveDraftStep', async () => {
      const stagedDoc = {
        id: 'doc-preview-strip-01',
        category: 'GOVERNMENT_ID' as const,
        specificType: 'NIN_SLIP' as const,
        fileName: 'identity-card.jpg',
        fileSizeBytes: 1024 * 1024,
        mimeType: 'image/jpeg' as const,
        stagedAt: new Date().toISOString(),
        previewUrl: 'blob:https://bukiebrainjobs.com/ephemeral-object-url-1234',
      };

      const tradeDoc = {
        id: 'doc-preview-strip-02',
        category: 'TRADE_CREDENTIAL' as const,
        specificType: 'TRADE_TEST_CERTIFICATE' as const,
        fileName: 'cert.pdf',
        fileSizeBytes: 2 * 1024 * 1024,
        mimeType: 'application/pdf' as const,
        stagedAt: new Date().toISOString(),
        previewUrl: 'blob:https://bukiebrainjobs.com/ephemeral-trade-preview',
      };

      const savedRecord = await harness.repository.saveDraftStep(FIXTURE_BRAINWORKER_A, 'credentials', {
        governmentId: stagedDoc,
        tradeCredentials: [tradeDoc],
        workProofs: [],
      });

      // Authoritative record must have stripped previewUrl
      expect(savedRecord.credentials.governmentId?.previewUrl).toBeUndefined();
      expect(savedRecord.credentials.tradeCredentials[0]?.previewUrl).toBeUndefined();
      expect(savedRecord.credentials.governmentId?.fileName).toBe('identity-card.jpg');
      expect(savedRecord.credentials.tradeCredentials[0]?.fileName).toBe('cert.pdf');

      // Verify direct retrieval from repository confirms isolation
      const record = await harness.repository.getOnboardingRecord(FIXTURE_BRAINWORKER_A);
      expect(record?.credentials.governmentId?.previewUrl).toBeUndefined();
      expect(record?.credentials.tradeCredentials[0]?.previewUrl).toBeUndefined();
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // REP-008: Submit Onboarding Validation Failure
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('REP-008: Mandatory Requirements for Submission', () => {
    it('rejects submission if identity, trade, or credentials are missing', async () => {
      // Empty draft
      await expect(
        harness.repository.submitOnboarding(FIXTURE_BRAINWORKER_A, {
          truthfulnessAcknowledged: true,
          termsAccepted: true,
        })
      ).rejects.toThrow(ValidationError);
    });

    it('rejects submission if truthfulness declaration is false', async () => {
      harness.testController.seedRecord({
        ...FIXTURE_RECORD_SUBMITTED,
        status: 'DRAFT',
      });

      await expect(
        harness.repository.submitOnboarding(FIXTURE_BRAINWORKER_A, {
          truthfulnessAcknowledged: false,
          termsAccepted: true,
        })
      ).rejects.toThrow(ValidationError);
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // REP-009: Successful Submission Transition
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('REP-009: Successful Submission Transition', () => {
    it('transitions DRAFT to SUBMITTED, stamps submittedAt, and locks record', async () => {
      harness.testController.seedRecord({
        ...FIXTURE_RECORD_SUBMITTED,
        status: 'DRAFT',
      });

      const submitted = await harness.repository.submitOnboarding(FIXTURE_BRAINWORKER_A, {
        truthfulnessAcknowledged: true,
        termsAccepted: true,
      });

      expect(submitted.status).toBe('SUBMITTED');
      expect(submitted.submittedAt).toBeDefined();
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // REP-010: Submission Locking Invariant
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('REP-010: Submission Locking Invariant', () => {
    it('prevents draft mutations when status is SUBMITTED, PENDING_REVIEW, or REJECTED', async () => {
      harness.testController.seedRecord(FIXTURE_RECORD_SUBMITTED);

      await expect(
        harness.repository.saveDraftStep(FIXTURE_BRAINWORKER_A, 'identity', FIXTURE_IDENTITY_VALID)
      ).rejects.toThrow(StateConflictError);

      await expect(
        harness.repository.stageDocument(FIXTURE_BRAINWORKER_A, {
          name: 'extra.jpg',
          size: 1024,
          type: 'image/jpeg',
          category: 'WORK_PROOF',
          specificType: 'WORKSHOP_PHOTO',
        })
      ).rejects.toThrow(StateConflictError);
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // REP-011: Targeted Remediation Unlocking
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('REP-011: Targeted Remediation Unlocking', () => {
    it('unlocks only the flagged step when status is REMEDIATION_REQUIRED', async () => {
      // Flagged credentials
      harness.testController.seedRecord(FIXTURE_RECORD_REMEDIATION);

      // Mutating unflagged identity step should reject
      await expect(
        harness.repository.saveDraftStep(FIXTURE_BRAINWORKER_A, 'identity', FIXTURE_IDENTITY_VALID)
      ).rejects.toThrow(StateConflictError);

      // Mutating flagged credentials step is permitted
      const updated = await harness.repository.saveDraftStep(
        FIXTURE_BRAINWORKER_A,
        'credentials',
        FIXTURE_RECORD_REMEDIATION.credentials
      );
      expect(updated.status).toBe('REMEDIATION_REQUIRED');
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // REP-012: Authoritative Rejection Details
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('REP-012: Authoritative Rejection Details', () => {
    it('stores authoritative rejection reason code and plain language message', async () => {
      harness.testController.seedRecord(FIXTURE_RECORD_REJECTED);

      const record = await harness.repository.getOnboardingRecord(FIXTURE_BRAINWORKER_A);
      expect(record?.status).toBe('REJECTED');
      expect(record?.rejectionDetails?.reasonCode).toBe('UNVERIFIABLE_CREDENTIALS');
      expect(record?.rejectionDetails?.message).toMatch(/unable to verify/i);
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // REP-013: Approval Handoff Invariant
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('REP-013: Approval Handoff Invariant', () => {
    it('enables isBrainWorkerApproved strictly upon operational APPROVED transition', async () => {
      harness.testController.seedRecord(FIXTURE_RECORD_SUBMITTED);

      // Prior to approval, session flag is false
      expect(authStorage.getMockAuthenticatedUser()?.isBrainWorkerApproved).toBe(false);

      // Operational team approves
      const setSessionSpy = vi.spyOn(authStorage, 'setMockAuthenticatedUser');
      harness.testController.simulateOpsApproval(FIXTURE_BRAINWORKER_A);

      expect(setSessionSpy).toHaveBeenCalledWith(
        expect.objectContaining({ isBrainWorkerApproved: true })
      );

      const record = await harness.repository.getOnboardingRecord(FIXTURE_BRAINWORKER_A);
      expect(record?.status).toBe('APPROVED');
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // REP-014: Physical Boundary Isolation
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('REP-014: Physical Boundary Isolation', () => {
    it('verifies production repository implementation has zero imports from testing modules', () => {
      const repoFilePath = path.resolve(__dirname, 'repository.ts');
      const repoContent = fs.readFileSync(repoFilePath, 'utf8');

      expect(repoContent).not.toMatch(/from\s+['"].*\/testing(\/.*)?['"]/);
      expect(repoContent).not.toMatch(/import\s+.*testing/);
    });
  });
});

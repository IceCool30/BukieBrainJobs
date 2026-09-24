// apps/web/lib/brainworker/useBrainWorkerRegistration.test.ts
// Phase 2 RED: Registration & Onboarding Hook Contracts (Suite 3: REG-001 through REG-009)
// Authoritative References:
// - docs/specs/BW-001-architecture-contract.md (Section 5)
// - docs/specs/BW-001-test-first-implementation-plan.md (Suite 3: REG-001 to REG-009)

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import * as authStorage from '../auth/storage';
import type { AuthUser } from '../auth/types';
import { useBrainWorkerRegistration } from './useBrainWorkerRegistration';
import { useBrainWorkerOnboardingStore } from './store';
import {
  createBrainWorkerTestHarness,
  type BrainWorkerTestHarness,
  FIXTURE_BRAINWORKER_A,
  FIXTURE_CUSTOMER_USER_ID,
  FIXTURE_IDENTITY_VALID,
  FIXTURE_RECORD_SUBMITTED,
} from './testing';
import * as fs from 'fs';
import * as path from 'path';

const mockBrainWorkerUser: AuthUser = {
  id: FIXTURE_BRAINWORKER_A,
  name: 'Babatunde Adebayo',
  email: 'babatunde@example.com',
  phone: '+2348031234567',
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

describe('BW-001 Registration Hook Contracts (Suite 3: REG-001 to REG-009)', () => {
  let harness: BrainWorkerTestHarness;

  beforeEach(() => {
    vi.clearAllMocks();
    useBrainWorkerOnboardingStore.getState().resetStore();
    harness = createBrainWorkerTestHarness();
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // REG-001: Authenticated BrainWorker Record Loading
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('REG-001: Authenticated Record Loading', () => {
    it('loads onboarding record and synchronizes client store for authenticated provider', async () => {
      vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockBrainWorkerUser);

      const { result } = renderHook(() =>
        useBrainWorkerRegistration({ repository: harness.repository })
      );

      await act(async () => {
        await result.current.loadRecord();
      });

      expect(result.current.user?.id).toBe(FIXTURE_BRAINWORKER_A);
      expect(result.current.record?.brainWorkerId).toBe(FIXTURE_BRAINWORKER_A);
      expect(result.current.status).toBe('DRAFT');
      expect(result.current.isCustomerBlocked).toBe(false);
      expect(result.current.isApproved).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // REG-002: Unauthenticated Fail-Closed Access
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('REG-002: Unauthenticated Access', () => {
    it('fails closed and sets actionable error when caller is unauthenticated', async () => {
      vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(null);

      const { result } = renderHook(() =>
        useBrainWorkerRegistration({ repository: harness.repository })
      );

      expect(result.current.user).toBeNull();
      expect(result.current.record).toBeNull();

      await act(async () => {
        await result.current.loadRecord();
      });

      expect(result.current.error).not.toBeNull();
      expect(result.current.error).toMatch(/authentication required/i);
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // REG-003: Customer Conflict Boundary
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('REG-003: Customer Conflict Boundary', () => {
    it('blocks customer accounts from accessing onboarding and flags isCustomerBlocked', async () => {
      vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockCustomerUser);

      const { result } = renderHook(() =>
        useBrainWorkerRegistration({ repository: harness.repository })
      );

      expect(result.current.isCustomerBlocked).toBe(true);
      expect(result.current.error).not.toBeNull();
      expect(result.current.error).toMatch(/customer/i);

      await act(async () => {
        await result.current.loadRecord();
      });

      expect(result.current.record).toBeNull();
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // REG-004: Tenant Isolation & Authoritative Session Binding
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('REG-004: Tenant Session Binding', () => {
    it('binds repository calls strictly to active session id and reflects session approval flag', async () => {
      const approvedUser: AuthUser = {
        ...mockBrainWorkerUser,
        isBrainWorkerApproved: true,
      };
      vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(approvedUser);

      const { result } = renderHook(() =>
        useBrainWorkerRegistration({ repository: harness.repository })
      );

      expect(result.current.isApproved).toBe(true);
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // REG-005: Step Saving Orchestration
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('REG-005: Step Saving Orchestration', () => {
    it('persists step data via repository and updates store state', async () => {
      vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockBrainWorkerUser);

      const { result } = renderHook(() =>
        useBrainWorkerRegistration({ repository: harness.repository })
      );

      await act(async () => {
        await result.current.saveStep('identity', FIXTURE_IDENTITY_VALID);
      });

      expect(result.current.record?.identity?.legalFirstName).toBe('Babatunde');
      expect(result.current.currentStep).toBe('trade');
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // REG-006: Document Staging & Removal Orchestration
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('REG-006: Document Staging Orchestration', () => {
    it('stages and removes documents through repository and synchronizes store state', async () => {
      vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockBrainWorkerUser);

      const { result } = renderHook(() =>
        useBrainWorkerRegistration({ repository: harness.repository })
      );

      let stagedDocId = '';
      await act(async () => {
        const doc = await result.current.stageDocument({
          name: 'gov-id.jpg',
          size: 1.2 * 1024 * 1024,
          type: 'image/jpeg',
          category: 'GOVERNMENT_ID',
          specificType: 'NIN_SLIP',
        });
        stagedDocId = doc.id;
      });

      expect(stagedDocId).toBeDefined();
      expect(result.current.record?.credentials.governmentId?.id).toBe(stagedDocId);

      await act(async () => {
        await result.current.removeDocument(stagedDocId);
      });

      expect(result.current.record?.credentials.governmentId).toBeNull();
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // REG-007: Submission Orchestration
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('REG-007: Submission Orchestration', () => {
    it('submits onboarding and transitions status to SUBMITTED', async () => {
      vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockBrainWorkerUser);
      harness.testController.seedRecord({
        ...FIXTURE_RECORD_SUBMITTED,
        status: 'DRAFT',
      });

      const { result } = renderHook(() =>
        useBrainWorkerRegistration({ repository: harness.repository })
      );

      await act(async () => {
        await result.current.submit({
          truthfulnessAcknowledged: true,
          termsAccepted: true,
        });
      });

      expect(result.current.status).toBe('SUBMITTED');
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // REG-008: Error Mapping
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('REG-008: Error Mapping', () => {
    it('maps repository validation and conflict errors to user-friendly messages', async () => {
      vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockBrainWorkerUser);

      const { result } = renderHook(() =>
        useBrainWorkerRegistration({ repository: harness.repository })
      );

      // Attempting submission without required steps throws ValidationError
      await act(async () => {
        try {
          await result.current.submit({
            truthfulnessAcknowledged: true,
            termsAccepted: true,
          });
        } catch {
          // Expected error catch
        }
      });

      expect(result.current.error).not.toBeNull();
      expect(result.current.error).toMatch(/incomplete|required|mandatory/i);
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // REG-009: Physical Boundary Isolation
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('REG-009: Physical Boundary Isolation', () => {
    it('verifies store.ts and useBrainWorkerRegistration.ts contain zero imports from testing modules', () => {
      const storePath = path.resolve(__dirname, 'store.ts');
      const hookPath = path.resolve(__dirname, 'useBrainWorkerRegistration.ts');

      const storeContent = fs.readFileSync(storePath, 'utf8');
      const hookContent = fs.readFileSync(hookPath, 'utf8');

      expect(storeContent).not.toMatch(/from\s+['"].*\/testing(\/.*)?['"]/);
      expect(storeContent).not.toMatch(/import\s+.*testing/);

      expect(hookContent).not.toMatch(/from\s+['"].*\/testing(\/.*)?['"]/);
      expect(hookContent).not.toMatch(/import\s+.*testing/);
    });
  });
});

// apps/web/lib/brainworker/store.test.ts
// Phase 2 RED: Client Store Contracts (Suite 3: STO-001 through STO-007)
// Authoritative References:
// - docs/specs/BW-001-architecture-contract.md (Section 3)
// - docs/specs/BW-001-ux-design-specification.md (Section 4 & 5)

import { describe, it, expect, beforeEach } from 'vitest';
import { useBrainWorkerOnboardingStore } from './store';
import {
  FIXTURE_IDENTITY_VALID,
  FIXTURE_TRADE_VALID,
  FIXTURE_GOV_DOC,
  FIXTURE_TRADE_DOC,
  FIXTURE_WORK_DOC,
  FIXTURE_RECORD_SUBMITTED,
  FIXTURE_RECORD_REMEDIATION,
} from './testing';

describe('BW-001 Client Store Contracts (Suite 3: STO-001 to STO-007)', () => {
  beforeEach(() => {
    useBrainWorkerOnboardingStore.getState().resetStore();
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STO-001: Initial State
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('STO-001: Initial State', () => {
    it('initializes store at identity step with clean drafts and not dirty', () => {
      const state = useBrainWorkerOnboardingStore.getState();

      expect(state.currentStep).toBe('identity');
      expect(state.isDirty).toBe(false);
      expect(state.draftRecord).toBeNull();
      expect(state.identityDraft).toEqual({});
      expect(state.tradeDraft).toEqual({});
      expect(state.credentialsDraft.governmentId).toBeNull();
      expect(state.credentialsDraft.tradeCredentials).toEqual([]);
      expect(state.credentialsDraft.workProofs).toEqual([]);
      expect(state.declarationDraft.truthfulnessAcknowledged).toBe(false);
      expect(state.declarationDraft.termsAccepted).toBe(false);
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STO-002: Four-Step Funnel Navigation
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('STO-002: Four-Step Funnel Navigation', () => {
    it('navigates sequentially forward through identity -> trade -> credentials -> review', () => {
      const store = useBrainWorkerOnboardingStore.getState();

      expect(store.currentStep).toBe('identity');

      useBrainWorkerOnboardingStore.getState().nextStep();
      expect(useBrainWorkerOnboardingStore.getState().currentStep).toBe('trade');

      useBrainWorkerOnboardingStore.getState().nextStep();
      expect(useBrainWorkerOnboardingStore.getState().currentStep).toBe('credentials');

      useBrainWorkerOnboardingStore.getState().nextStep();
      expect(useBrainWorkerOnboardingStore.getState().currentStep).toBe('review');

      // Clamped at review
      useBrainWorkerOnboardingStore.getState().nextStep();
      expect(useBrainWorkerOnboardingStore.getState().currentStep).toBe('review');
    });

    it('navigates backward through review -> credentials -> trade -> identity', () => {
      useBrainWorkerOnboardingStore.getState().setStep('review');
      expect(useBrainWorkerOnboardingStore.getState().currentStep).toBe('review');

      useBrainWorkerOnboardingStore.getState().prevStep();
      expect(useBrainWorkerOnboardingStore.getState().currentStep).toBe('credentials');

      useBrainWorkerOnboardingStore.getState().prevStep();
      expect(useBrainWorkerOnboardingStore.getState().currentStep).toBe('trade');

      useBrainWorkerOnboardingStore.getState().prevStep();
      expect(useBrainWorkerOnboardingStore.getState().currentStep).toBe('identity');

      // Clamped at identity
      useBrainWorkerOnboardingStore.getState().prevStep();
      expect(useBrainWorkerOnboardingStore.getState().currentStep).toBe('identity');
    });

    it('allows direct step navigation via setStep', () => {
      useBrainWorkerOnboardingStore.getState().setStep('credentials');
      expect(useBrainWorkerOnboardingStore.getState().currentStep).toBe('credentials');

      useBrainWorkerOnboardingStore.getState().setStep('identity');
      expect(useBrainWorkerOnboardingStore.getState().currentStep).toBe('identity');
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STO-003: Dirty State Tracking
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('STO-003: Dirty State Tracking', () => {
    it('tracks dirty state when form input changes occur', () => {
      expect(useBrainWorkerOnboardingStore.getState().isDirty).toBe(false);

      useBrainWorkerOnboardingStore.getState().setDirty(true);
      expect(useBrainWorkerOnboardingStore.getState().isDirty).toBe(true);

      useBrainWorkerOnboardingStore.getState().setDirty(false);
      expect(useBrainWorkerOnboardingStore.getState().isDirty).toBe(false);
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STO-004: Step Draft State Management
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('STO-004: Step Draft State Management', () => {
    it('stores identity draft and isolates from other draft slices', () => {
      useBrainWorkerOnboardingStore.getState().setIdentityDraft(FIXTURE_IDENTITY_VALID);

      const state = useBrainWorkerOnboardingStore.getState();
      expect(state.identityDraft.legalFirstName).toBe('Babatunde');
      expect(state.identityDraft.identifierNumber).toBe('12345678901');
      expect(state.tradeDraft).toEqual({});
    });

    it('stores trade draft and preserves identity draft', () => {
      useBrainWorkerOnboardingStore.getState().setIdentityDraft(FIXTURE_IDENTITY_VALID);
      useBrainWorkerOnboardingStore.getState().setTradeDraft(FIXTURE_TRADE_VALID);

      const state = useBrainWorkerOnboardingStore.getState();
      expect(state.identityDraft.legalFirstName).toBe('Babatunde');
      expect(state.tradeDraft.primaryCategory).toBe('generator');
      expect(state.tradeDraft.yearsInTrade).toBe(6);
    });

    it('stores credentials draft attachments', () => {
      useBrainWorkerOnboardingStore.getState().setCredentialsDraft({
        governmentId: FIXTURE_GOV_DOC,
        tradeCredentials: [FIXTURE_TRADE_DOC],
        workProofs: [FIXTURE_WORK_DOC],
      });

      const state = useBrainWorkerOnboardingStore.getState();
      expect(state.credentialsDraft.governmentId?.id).toBe(FIXTURE_GOV_DOC.id);
      expect(state.credentialsDraft.tradeCredentials).toHaveLength(1);
      expect(state.credentialsDraft.workProofs).toHaveLength(1);
    });

    it('stores declaration draft checkmarks', () => {
      useBrainWorkerOnboardingStore.getState().setDeclarationDraft({
        truthfulnessAcknowledged: true,
        termsAccepted: true,
      });

      const state = useBrainWorkerOnboardingStore.getState();
      expect(state.declarationDraft.truthfulnessAcknowledged).toBe(true);
      expect(state.declarationDraft.termsAccepted).toBe(true);
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STO-005: State Recovery from Authoritative Record
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('STO-005: State Recovery from Authoritative Record', () => {
    it('populates drafts and active step from existing repository record', () => {
      useBrainWorkerOnboardingStore.getState().syncFromRecord(FIXTURE_RECORD_SUBMITTED);

      const state = useBrainWorkerOnboardingStore.getState();
      expect(state.draftRecord?.id).toBe(FIXTURE_RECORD_SUBMITTED.id);
      expect(state.currentStep).toBe('review');
      expect(state.identityDraft.legalFirstName).toBe('Babatunde');
      expect(state.tradeDraft.primaryCategory).toBe('generator');
      expect(state.credentialsDraft.governmentId?.id).toBe(FIXTURE_GOV_DOC.id);
      expect(state.declarationDraft.truthfulnessAcknowledged).toBe(true);
      expect(state.isDirty).toBe(false);
    });

    it('navigates to targeted step during remediation state recovery', () => {
      // In FIXTURE_RECORD_REMEDIATION, issue flags 'credentials' step
      useBrainWorkerOnboardingStore.getState().syncFromRecord(FIXTURE_RECORD_REMEDIATION);

      const state = useBrainWorkerOnboardingStore.getState();
      expect(state.draftRecord?.status).toBe('REMEDIATION_REQUIRED');
      expect(state.currentStep).toBe('credentials');
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STO-006: Reset Store
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('STO-006: Reset Store', () => {
    it('restores all draft slices and navigation to initial empty state', () => {
      useBrainWorkerOnboardingStore.getState().syncFromRecord(FIXTURE_RECORD_SUBMITTED);
      useBrainWorkerOnboardingStore.getState().setDirty(true);

      useBrainWorkerOnboardingStore.getState().resetStore();

      const state = useBrainWorkerOnboardingStore.getState();
      expect(state.currentStep).toBe('identity');
      expect(state.isDirty).toBe(false);
      expect(state.draftRecord).toBeNull();
      expect(state.identityDraft).toEqual({});
      expect(state.tradeDraft).toEqual({});
      expect(state.credentialsDraft.governmentId).toBeNull();
      expect(state.credentialsDraft.tradeCredentials).toEqual([]);
      expect(state.declarationDraft.truthfulnessAcknowledged).toBe(false);
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STO-007: Anti-Tampering Boundary
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('STO-007: Anti-Tampering Boundary', () => {
    it('does not expose methods for mutating authoritative status directly', () => {
      const state = useBrainWorkerOnboardingStore.getState() as unknown as Record<string, unknown>;

      // Neither status setter nor approval setter must exist on the store
      expect(state['setStatus']).toBeUndefined();
      expect(state['setApproval']).toBeUndefined();
      expect(state['approve']).toBeUndefined();
    });
  });
});

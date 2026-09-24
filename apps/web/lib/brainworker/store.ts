// apps/web/lib/brainworker/store.ts
// Phase 2 RED Stub: BrainWorker Onboarding Client Store
// Authoritative References:
// - docs/specs/BW-001-architecture-contract.md (Section 3)
// - docs/specs/BW-001-ux-design-specification.md (Section 4 & 5)
// - docs/specs/BW-001-test-first-implementation-plan.md (Suite 3: STO-001 to STO-007)

import { create } from 'zustand';
import type {
  OnboardingStep,
  BrainWorkerOnboardingRecord,
  OnboardingIdentityData,
  OnboardingTradeData,
  OnboardingCredentialsData,
  OnboardingDeclarationData,
  StagedDocument,
} from './types';

export interface BrainWorkerOnboardingStoreState {
  currentStep: OnboardingStep;
  isDirty: boolean;
  draftRecord: BrainWorkerOnboardingRecord | null;
  identityDraft: Partial<OnboardingIdentityData>;
  tradeDraft: Partial<OnboardingTradeData>;
  credentialsDraft: {
    governmentId: StagedDocument | null;
    tradeCredentials: StagedDocument[];
    workProofs: StagedDocument[];
  };
  declarationDraft: {
    truthfulnessAcknowledged: boolean;
    termsAccepted: boolean;
  };

  // Funnel actions
  setStep: (step: OnboardingStep) => void;
  nextStep: () => void;
  prevStep: () => void;
  setDirty: (isDirty: boolean) => void;

  // Ephemeral draft actions
  setIdentityDraft: (data: Partial<OnboardingIdentityData>) => void;
  setTradeDraft: (data: Partial<OnboardingTradeData>) => void;
  setCredentialsDraft: (
    data: Partial<{
      governmentId: StagedDocument | null;
      tradeCredentials: StagedDocument[];
      workProofs: StagedDocument[];
    }>
  ) => void;
  setDeclarationDraft: (data: {
    truthfulnessAcknowledged: boolean;
    termsAccepted: boolean;
  }) => void;

  // Lifecycle sync & recovery
  syncFromRecord: (record: BrainWorkerOnboardingRecord) => void;
  resetStore: () => void;
}

const INITIAL_CREDENTIALS: BrainWorkerOnboardingStoreState['credentialsDraft'] = {
  governmentId: null,
  tradeCredentials: [],
  workProofs: [],
};

const INITIAL_DECLARATION: BrainWorkerOnboardingStoreState['declarationDraft'] = {
  truthfulnessAcknowledged: false,
  termsAccepted: false,
};

export const useBrainWorkerOnboardingStore = create<BrainWorkerOnboardingStoreState>((_set) => ({
  currentStep: 'identity',
  isDirty: false,
  draftRecord: null,
  identityDraft: {},
  tradeDraft: {},
  credentialsDraft: { ...INITIAL_CREDENTIALS },
  declarationDraft: { ...INITIAL_DECLARATION },

  // RED Stub: intentionally unimplemented actions
  setStep: (_step) => {},
  nextStep: () => {},
  prevStep: () => {},
  setDirty: (_isDirty) => {},
  setIdentityDraft: (_data) => {},
  setTradeDraft: (_data) => {},
  setCredentialsDraft: (_data) => {},
  setDeclarationDraft: (_data) => {},
  syncFromRecord: (_record) => {},
  resetStore: () => {},
}));

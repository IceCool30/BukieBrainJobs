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
  StagedDocument,
} from './types';

const FUNNEL_STEPS: readonly OnboardingStep[] = [
  'identity',
  'trade',
  'credentials',
  'review',
] as const;

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

export const useBrainWorkerOnboardingStore = create<BrainWorkerOnboardingStoreState>((set) => ({
  currentStep: 'identity',
  isDirty: false,
  draftRecord: null,
  identityDraft: {},
  tradeDraft: {},
  credentialsDraft: { ...INITIAL_CREDENTIALS },
  declarationDraft: { ...INITIAL_DECLARATION },

  setStep: (step) => set({ currentStep: step }),

  nextStep: () =>
    set((state) => {
      const currentIndex = FUNNEL_STEPS.indexOf(state.currentStep);
      if (currentIndex < FUNNEL_STEPS.length - 1) {
        return { currentStep: FUNNEL_STEPS[currentIndex + 1] };
      }
      return state;
    }),

  prevStep: () =>
    set((state) => {
      const currentIndex = FUNNEL_STEPS.indexOf(state.currentStep);
      if (currentIndex > 0) {
        return { currentStep: FUNNEL_STEPS[currentIndex - 1] };
      }
      return state;
    }),

  setDirty: (isDirty) => set({ isDirty }),

  setIdentityDraft: (data) =>
    set((state) => ({
      identityDraft: { ...state.identityDraft, ...data },
      isDirty: true,
    })),

  setTradeDraft: (data) =>
    set((state) => ({
      tradeDraft: { ...state.tradeDraft, ...data },
      isDirty: true,
    })),

  setCredentialsDraft: (data) =>
    set((state) => ({
      credentialsDraft: {
        governmentId:
          data.governmentId !== undefined ? data.governmentId : state.credentialsDraft.governmentId,
        tradeCredentials: data.tradeCredentials ?? state.credentialsDraft.tradeCredentials,
        workProofs: data.workProofs ?? state.credentialsDraft.workProofs,
      },
      isDirty: true,
    })),

  setDeclarationDraft: (data) =>
    set((state) => ({
      declarationDraft: { ...state.declarationDraft, ...data },
      isDirty: true,
    })),

  syncFromRecord: (record) =>
    set(() => {
      // If in remediation, jump directly to the flagged step
      let targetStep = record.currentStep;
      if (record.status === 'REMEDIATION_REQUIRED' && record.remediationIssues.length > 0) {
        targetStep = record.remediationIssues[0]?.targetStep ?? record.currentStep;
      }

      return {
        draftRecord: { ...record },
        currentStep: targetStep,
        identityDraft: record.identity ? { ...record.identity } : {},
        tradeDraft: record.trade ? { ...record.trade } : {},
        credentialsDraft: {
          governmentId: record.credentials?.governmentId ?? null,
          tradeCredentials: [...(record.credentials?.tradeCredentials ?? [])],
          workProofs: [...(record.credentials?.workProofs ?? [])],
        },
        declarationDraft: {
          truthfulnessAcknowledged: record.declaration?.truthfulnessAcknowledged ?? false,
          termsAccepted: record.declaration?.termsAccepted ?? false,
        },
        isDirty: false,
      };
    }),

  resetStore: () =>
    set({
      currentStep: 'identity',
      isDirty: false,
      draftRecord: null,
      identityDraft: {},
      tradeDraft: {},
      credentialsDraft: { ...INITIAL_CREDENTIALS },
      declarationDraft: { ...INITIAL_DECLARATION },
    }),
}));

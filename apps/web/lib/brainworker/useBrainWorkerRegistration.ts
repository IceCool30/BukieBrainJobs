// apps/web/lib/brainworker/useBrainWorkerRegistration.ts
// Phase 2 RED Stub: BrainWorker Registration & Onboarding Hook
// Authoritative References:
// - docs/specs/BW-001-architecture-contract.md (Section 5)
// - docs/specs/BW-001-test-first-implementation-plan.md (Suite 3: REG-001 to REG-009)

import { useState } from 'react';
import type { AuthUser } from '../auth/types';
import type {
  BrainWorkerOnboardingRecord,
  BrainWorkerOnboardingStatus,
  OnboardingStep,
  OnboardingIdentityData,
  OnboardingTradeData,
  OnboardingCredentialsData,
  StagedDocument,
  DocumentCategory,
  SpecificDocumentType,
  IBrainWorkerOnboardingRepository,
} from './types';

export interface UseBrainWorkerRegistrationOptions {
  repository?: IBrainWorkerOnboardingRepository | undefined;
}

export interface UseBrainWorkerRegistrationReturn {
  user: AuthUser | null;
  record: BrainWorkerOnboardingRecord | null;
  status: BrainWorkerOnboardingStatus | null;
  currentStep: OnboardingStep;
  isLoading: boolean;
  error: string | null;
  isCustomerBlocked: boolean;
  isApproved: boolean;

  loadRecord: () => Promise<BrainWorkerOnboardingRecord | null>;
  saveStep: (
    step: OnboardingStep,
    stepData: Partial<OnboardingIdentityData | OnboardingTradeData | OnboardingCredentialsData>
  ) => Promise<BrainWorkerOnboardingRecord>;
  stageDocument: (file: {
    name: string;
    size: number;
    type: string;
    category: DocumentCategory;
    specificType: SpecificDocumentType;
    dataUrl?: string | undefined;
  }) => Promise<StagedDocument>;
  removeDocument: (documentId: string) => Promise<void>;
  submit: (declaration: {
    truthfulnessAcknowledged: boolean;
    termsAccepted: boolean;
  }) => Promise<BrainWorkerOnboardingRecord>;
}

export function useBrainWorkerRegistration(
  _options?: UseBrainWorkerRegistrationOptions
): UseBrainWorkerRegistrationReturn {
  const [isLoading] = useState(false);
  const [error] = useState<string | null>(null);

  // RED Stub: intentionally incomplete
  return {
    user: null,
    record: null,
    status: null,
    currentStep: 'identity',
    isLoading,
    error,
    isCustomerBlocked: false,
    isApproved: false,
    loadRecord: async () => null,
    saveStep: async () => {
      throw new Error('Not implemented');
    },
    stageDocument: async () => {
      throw new Error('Not implemented');
    },
    removeDocument: async () => {
      throw new Error('Not implemented');
    },
    submit: async () => {
      throw new Error('Not implemented');
    },
  };
}

// apps/web/lib/brainworker/useBrainWorkerRegistration.ts
// Phase 2 RED Stub: BrainWorker Registration & Onboarding Hook
// Authoritative References:
// - docs/specs/BW-001-architecture-contract.md (Section 5)
// - docs/specs/BW-001-test-first-implementation-plan.md (Suite 3: REG-001 to REG-009)

import { useState, useCallback, useMemo } from 'react';
import type { AuthUser } from '../auth/types';
import { getMockAuthenticatedUser } from '../auth/storage';
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
import { UnauthorizedError } from './types';
import { getBrainWorkerOnboardingRepository } from './repository';
import { useBrainWorkerOnboardingStore } from './store';

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
  options?: UseBrainWorkerRegistrationOptions
): UseBrainWorkerRegistrationReturn {
  const repository = useMemo(
    () => options?.repository ?? getBrainWorkerOnboardingRepository(),
    [options?.repository]
  );

  const currentUser = getMockAuthenticatedUser();
  const isCustomerBlocked = currentUser?.role === 'customer';
  const isApproved = currentUser?.isBrainWorkerApproved ?? false;

  const [isLoading, setIsLoading] = useState(false);
  const [internalError, setInternalError] = useState<string | null>(null);

  const currentStep = useBrainWorkerOnboardingStore((s) => s.currentStep);
  const draftRecord = useBrainWorkerOnboardingStore((s) => s.draftRecord);
  const syncFromRecord = useBrainWorkerOnboardingStore((s) => s.syncFromRecord);

  const activeError = useMemo(() => {
    if (!currentUser) {
      return 'Authentication required to access BrainWorker registration.';
    }
    if (currentUser.role === 'customer') {
      return 'Customer accounts cannot access BrainWorker onboarding. Please switch or create a provider account.';
    }
    return internalError;
  }, [currentUser, internalError]);

  const loadRecord = useCallback(async (): Promise<BrainWorkerOnboardingRecord | null> => {
    if (!currentUser) {
      setInternalError('Authentication required to access BrainWorker registration.');
      return null;
    }
    if (currentUser.role === 'customer') {
      setInternalError('Customer accounts cannot access BrainWorker onboarding.');
      return null;
    }

    setIsLoading(true);
    setInternalError(null);
    try {
      const record = await repository.getOnboardingRecord(currentUser.id);
      if (record) {
        syncFromRecord(record);
      }
      return record;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load onboarding record.';
      setInternalError(msg);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, repository, syncFromRecord]);

  const saveStep = useCallback(
    async (
      step: OnboardingStep,
      stepData: Partial<OnboardingIdentityData | OnboardingTradeData | OnboardingCredentialsData>
    ): Promise<BrainWorkerOnboardingRecord> => {
      if (!currentUser) {
        const err = new UnauthorizedError('Authentication required to save onboarding progress.');
        setInternalError(err.message);
        throw err;
      }
      if (currentUser.role === 'customer') {
        const err = new UnauthorizedError('Customer accounts cannot modify BrainWorker onboarding.');
        setInternalError(err.message);
        throw err;
      }

      setIsLoading(true);
      setInternalError(null);
      try {
        const updated = await repository.saveDraftStep(currentUser.id, step, stepData);
        syncFromRecord(updated);
        return updated;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to save onboarding step.';
        setInternalError(msg);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [currentUser, repository, syncFromRecord]
  );

  const stageDocument = useCallback(
    async (file: {
      name: string;
      size: number;
      type: string;
      category: DocumentCategory;
      specificType: SpecificDocumentType;
      dataUrl?: string | undefined;
    }): Promise<StagedDocument> => {
      if (!currentUser) {
        const err = new UnauthorizedError('Authentication required to stage documents.');
        setInternalError(err.message);
        throw err;
      }
      if (currentUser.role === 'customer') {
        const err = new UnauthorizedError('Customer accounts cannot stage BrainWorker documents.');
        setInternalError(err.message);
        throw err;
      }

      setIsLoading(true);
      setInternalError(null);
      try {
        const staged = await repository.stageDocument(currentUser.id, file);
        const record = await repository.getOnboardingRecord(currentUser.id);
        if (record) {
          syncFromRecord(record);
        }
        return staged;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to stage document.';
        setInternalError(msg);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [currentUser, repository, syncFromRecord]
  );

  const removeDocument = useCallback(
    async (documentId: string): Promise<void> => {
      if (!currentUser) {
        const err = new UnauthorizedError('Authentication required to remove documents.');
        setInternalError(err.message);
        throw err;
      }
      if (currentUser.role === 'customer') {
        const err = new UnauthorizedError('Customer accounts cannot modify BrainWorker documents.');
        setInternalError(err.message);
        throw err;
      }

      setIsLoading(true);
      setInternalError(null);
      try {
        await repository.removeStagedDocument(currentUser.id, documentId);
        const record = await repository.getOnboardingRecord(currentUser.id);
        if (record) {
          syncFromRecord(record);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to remove document.';
        setInternalError(msg);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [currentUser, repository, syncFromRecord]
  );

  const submit = useCallback(
    async (declaration: {
      truthfulnessAcknowledged: boolean;
      termsAccepted: boolean;
    }): Promise<BrainWorkerOnboardingRecord> => {
      if (!currentUser) {
        const err = new UnauthorizedError('Authentication required to submit onboarding.');
        setInternalError(err.message);
        throw err;
      }
      if (currentUser.role === 'customer') {
        const err = new UnauthorizedError('Customer accounts cannot submit BrainWorker onboarding.');
        setInternalError(err.message);
        throw err;
      }

      setIsLoading(true);
      setInternalError(null);
      try {
        const submitted = await repository.submitOnboarding(currentUser.id, declaration);
        syncFromRecord(submitted);
        return submitted;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to submit onboarding.';
        setInternalError(msg);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [currentUser, repository, syncFromRecord]
  );

  return {
    user: currentUser,
    record: draftRecord,
    status: draftRecord?.status ?? null,
    currentStep,
    isLoading,
    error: activeError,
    isCustomerBlocked,
    isApproved,
    loadRecord,
    saveStep,
    stageDocument,
    removeDocument,
    submit,
  };
}

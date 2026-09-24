// apps/web/app/brainworker/onboarding/page.tsx
// Phase 8 GREEN: BrainWorker Onboarding Funnel Route
// Authoritative References:
// - docs/specs/BW-001-architecture-contract.md (Section 5.1)
// - docs/specs/BW-001-test-first-implementation-plan.md (Suite 8: INT-003 to INT-006)

'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getMockAuthenticatedUser } from '../../../lib/auth/storage';
import { getBrainWorkerOnboardingRepository } from '../../../lib/brainworker/repository';
import { useBrainWorkerOnboardingStore } from '../../../lib/brainworker/store';
import { FunnelProgressBar } from '../../../components/brainworker/onboarding/FunnelProgressBar';
import { IdentityStepForm } from '../../../components/brainworker/onboarding/IdentityStepForm';
import { TradeStepForm } from '../../../components/brainworker/onboarding/TradeStepForm';
import { CredentialsStepForm } from '../../../components/brainworker/onboarding/CredentialsStepForm';
import { ReviewStepForm } from '../../../components/brainworker/onboarding/ReviewStepForm';
import type {
  OnboardingStep,
  OnboardingIdentityData,
  OnboardingTradeData,
  OnboardingCredentialsData,
  StagedDocument,
} from '../../../lib/brainworker/types';
import type { AuthUser } from '../../../lib/auth/types';

export default function BrainWorkerOnboardingPage(): React.ReactElement {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(() => getMockAuthenticatedUser());
  const [isInitializing, setIsInitializing] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Store hooks
  const currentStep = useBrainWorkerOnboardingStore((s) => s.currentStep);
  const setStep = useBrainWorkerOnboardingStore((s) => s.setStep);
  const nextStep = useBrainWorkerOnboardingStore((s) => s.nextStep);
  const prevStep = useBrainWorkerOnboardingStore((s) => s.prevStep);
  const draftRecord = useBrainWorkerOnboardingStore((s) => s.draftRecord);
  const syncFromRecord = useBrainWorkerOnboardingStore((s) => s.syncFromRecord);

  const identityDraft = useBrainWorkerOnboardingStore((s) => s.identityDraft);
  const setIdentityDraft = useBrainWorkerOnboardingStore((s) => s.setIdentityDraft);

  const tradeDraft = useBrainWorkerOnboardingStore((s) => s.tradeDraft);
  const setTradeDraft = useBrainWorkerOnboardingStore((s) => s.setTradeDraft);

  const credentialsDraft = useBrainWorkerOnboardingStore((s) => s.credentialsDraft);
  const setCredentialsDraft = useBrainWorkerOnboardingStore((s) => s.setCredentialsDraft);

  useEffect(() => {
    const currentUser = getMockAuthenticatedUser();
    setUser(currentUser);

    // Guard 1: Unauthenticated -> redirect to /login?redirect=/brainworker/onboarding
    if (!currentUser) {
      router.replace('/login?redirect=/brainworker/onboarding');
      return;
    }

    // Guard 2: Customer -> fail-closed boundary, DO NOT interact with repository
    if (currentUser.role === 'customer') {
      setIsInitializing(false);
      return;
    }

    // Guard 3: Approved BrainWorker -> redirect to /brainworker/dashboard
    if (currentUser.isBrainWorkerApproved) {
      router.replace('/brainworker/dashboard');
      return;
    }

    // Guard 4: Active BrainWorker -> check authoritative onboarding status
    const repo = getBrainWorkerOnboardingRepository();
    repo.getOnboardingRecord(currentUser.id)
      .then((record) => {
        if (record) {
          // If already submitted, pending review, or rejected -> redirect to verification status
          if (
            record.status === 'SUBMITTED' ||
            record.status === 'PENDING_REVIEW' ||
            record.status === 'REJECTED'
          ) {
            router.replace('/brainworker/verification-status');
            return;
          }
          if (record.status === 'APPROVED') {
            router.replace('/brainworker/dashboard');
            return;
          }
          // Sync draft state into store
          syncFromRecord(record);
        }
        setIsInitializing(false);
      })
      .catch(() => {
        setIsInitializing(false);
      });
  }, [router, syncFromRecord]);

  // Compute completed steps for progress bar
  const completedSteps = useMemo(() => {
    const steps: OnboardingStep[] = [];
    const idData = draftRecord?.identity ?? identityDraft;
    if (idData?.legalFirstName && idData?.legalLastName && idData?.identifierNumber) {
      steps.push('identity');
    }
    const trData = draftRecord?.trade ?? tradeDraft;
    if (trData?.primaryCategory && (trData?.coverageCities?.length ?? 0) > 0) {
      steps.push('trade');
    }
    const crData = draftRecord?.credentials ?? credentialsDraft;
    if (crData?.governmentId && (crData?.tradeCredentials?.length ?? 0) > 0) {
      steps.push('credentials');
    }
    return steps;
  }, [draftRecord, identityDraft, tradeDraft, credentialsDraft]);

  // Customer boundary notice (rendered immediately without repository call)
  if (user?.role === 'customer') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-white rounded-2xl border border-amber-200 p-8 shadow-sm space-y-4 text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-300 px-3 py-1 text-xs font-semibold text-amber-900">
            Boundary Conflict
          </div>
          <h2 className="text-xl font-bold text-[#001A41]">
            BrainWorker Registration Required
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            You are currently signed in as a customer. Provider onboarding requires an active BrainWorker provider account. Customer accounts cannot access provider onboarding.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/brainworker/register"
              className="inline-flex items-center justify-center rounded-xl bg-[#001A41] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#002661]"
            >
              Create Provider Account
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Return Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!user || isInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#001A41] border-t-transparent" />
      </div>
    );
  }

  // Repository step handlers
  const handleSaveIdentity = async (data: OnboardingIdentityData) => {
    setIsSubmitting(true);
    try {
      const repo = getBrainWorkerOnboardingRepository();
      const updated = await repo.saveDraftStep(user.id, 'identity', data);
      syncFromRecord(updated);
      setIdentityDraft(data);
      nextStep();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveTrade = async (data: OnboardingTradeData) => {
    setIsSubmitting(true);
    try {
      const repo = getBrainWorkerOnboardingRepository();
      const updated = await repo.saveDraftStep(user.id, 'trade', data);
      syncFromRecord(updated);
      setTradeDraft(data);
      nextStep();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStageDocument = (doc: StagedDocument) => {
    setCredentialsDraft({
      ...credentialsDraft,
      ...(doc.category === 'GOVERNMENT_ID'
        ? { governmentId: doc }
        : doc.category === 'TRADE_CREDENTIAL'
          ? { tradeCredentials: [...credentialsDraft.tradeCredentials, doc] }
          : { workProofs: [...credentialsDraft.workProofs, doc] }),
    });
  };

  const handleRemoveDocument = (docId: string) => {
    setCredentialsDraft({
      ...credentialsDraft,
      governmentId: credentialsDraft.governmentId?.id === docId ? null : credentialsDraft.governmentId,
      tradeCredentials: credentialsDraft.tradeCredentials.filter((d) => d.id !== docId),
      workProofs: credentialsDraft.workProofs.filter((d) => d.id !== docId),
    });
  };

  const handleSaveCredentials = async (data: OnboardingCredentialsData) => {
    setIsSubmitting(true);
    try {
      const repo = getBrainWorkerOnboardingRepository();
      const updated = await repo.saveDraftStep(user.id, 'credentials', data);
      syncFromRecord(updated);
      setCredentialsDraft(data);
      nextStep();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (declaration: {
    truthfulnessAcknowledged: boolean;
    termsAccepted: boolean;
    declaredAt: string;
  }) => {
    setIsSubmitting(true);
    try {
      const repo = getBrainWorkerOnboardingRepository();
      const updated = await repo.submitOnboarding(user.id, declaration);
      syncFromRecord(updated);
      router.replace('/brainworker/verification-status');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <FunnelProgressBar currentStep={currentStep} completedSteps={completedSteps} />
        </div>

        {currentStep === 'identity' && (
          <IdentityStepForm
            initialData={draftRecord?.identity ?? identityDraft}
            onSave={handleSaveIdentity}
            isSubmitting={isSubmitting}
          />
        )}

        {currentStep === 'trade' && (
          <TradeStepForm
            initialData={draftRecord?.trade ?? tradeDraft}
            onBack={prevStep}
            onSave={handleSaveTrade}
            isSubmitting={isSubmitting}
          />
        )}

        {currentStep === 'credentials' && (
          <CredentialsStepForm
            initialData={draftRecord?.credentials ?? credentialsDraft}
            onStageDocument={handleStageDocument}
            onRemoveDocument={handleRemoveDocument}
            onBack={prevStep}
            onSave={handleSaveCredentials}
            isSubmitting={isSubmitting}
          />
        )}

        {currentStep === 'review' && (
          <ReviewStepForm
            identityData={(draftRecord?.identity ?? identityDraft) as OnboardingIdentityData}
            tradeData={(draftRecord?.trade ?? tradeDraft) as OnboardingTradeData}
            credentialsData={draftRecord?.credentials ?? credentialsDraft}
            onEditStep={(step) => setStep(step)}
            onBack={prevStep}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        )}
      </div>
    </main>
  );
}

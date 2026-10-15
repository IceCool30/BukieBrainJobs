// apps/web/app/brainworker/onboarding/page.tsx
// Phase 8 GREEN: BrainWorker Onboarding Funnel Route
// Authoritative References:
// - docs/specs/BW-001-architecture-contract.md (Section 5.1)
// - docs/specs/BW-001-test-first-implementation-plan.md (Suite 8: INT-003 to INT-006)

'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getMockAuthenticatedUser } from '../../../lib/auth/storage';
import { getBrainWorkerOnboardingRepository } from '../../../lib/brainworker/repository';
import { useBrainWorkerOnboardingStore } from '../../../lib/brainworker/store';
import { FunnelProgressBar } from '../../../components/brainworker/onboarding/FunnelProgressBar';
import { ThemeToggle } from '../../../components/ThemeToggle';
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
    let isMounted = true;
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
        if (!isMounted) return;
        if (record) {
          // If already submitted, pending review, rejected, or approved -> redirect to verification status
          // The route must not decide the provider is approved independently of isBrainWorkerApproved
          if (
            record.status === 'SUBMITTED' ||
            record.status === 'PENDING_REVIEW' ||
            record.status === 'REJECTED' ||
            record.status === 'APPROVED'
          ) {
            router.replace('/brainworker/verification-status');
            return;
          }
          // Sync draft state into store (DRAFT or REMEDIATION_REQUIRED)
          syncFromRecord(record);
        }
        setIsInitializing(false);
      })
      .catch(() => {
        if (isMounted) {
          setIsInitializing(false);
        }
      });

    return () => {
      isMounted = false;
    };
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

  // Provide safe normalized defaults for review step to prevent destructuring exceptions on partial drafts
  const identityDataForReview: OnboardingIdentityData = useMemo(() => {
    const base = draftRecord?.identity ?? identityDraft;
    return {
      legalFirstName: base?.legalFirstName ?? '',
      legalMiddleName: base?.legalMiddleName ?? '',
      legalLastName: base?.legalLastName ?? '',
      dateOfBirth: base?.dateOfBirth ?? '',
      identifierType: base?.identifierType ?? 'NIN',
      identifierNumber: base?.identifierNumber ?? '',
      maskedIdentifier: base?.maskedIdentifier ?? '',
      residentialAddress: base?.residentialAddress ?? {
        street: '',
        city: '',
        lga: '',
        state: '',
      },
    };
  }, [draftRecord?.identity, identityDraft]);

  const tradeDataForReview: OnboardingTradeData = useMemo(() => {
    const base = draftRecord?.trade ?? tradeDraft;
    return {
      primaryCategory: base?.primaryCategory ?? '',
      subSpecialties: base?.subSpecialties ?? [],
      experienceLevel: base?.experienceLevel ?? 'JOURNEYMAN_EXPERIENCED',
      yearsInTrade: base?.yearsInTrade ?? 0,
      coverageCities: base?.coverageCities ?? [],
    };
  }, [draftRecord?.trade, tradeDraft]);

  // Customer boundary notice (rendered immediately without repository call)
  if (user?.role === 'customer') {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-4 transition-colors">
        <div className="max-w-lg w-full bg-[var(--card-bg)] rounded-lg border border-amber-300 dark:border-amber-800/60 p-6 sm:p-8 shadow-xs space-y-4 text-center">
          <div className="inline-flex items-center gap-1.5 rounded-md bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/60 px-2.5 py-1 text-xs font-semibold text-amber-900 dark:text-amber-200">
            Boundary Conflict
          </div>
          <h2 className="text-xl font-bold text-[var(--text-main)]">
            BrainWorker Registration Required
          </h2>
          <p className="text-sm text-[var(--text-muted)] leading-relaxed">
            You are currently signed in as a customer. Provider onboarding requires an active BrainWorker provider account. Customer accounts cannot access provider onboarding.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/brainworker/register"
              className="inline-flex items-center justify-center rounded-lg bg-[#001A41] dark:bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-[#002661] dark:hover:bg-emerald-500 transition-colors"
            >
              Create Provider Account
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] px-5 py-2.5 text-sm font-semibold text-[var(--text-main)] hover:bg-[var(--card-hover)] transition-colors"
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
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] transition-colors">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#001A41] dark:border-emerald-500 border-t-transparent" />
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
    <div className="min-h-screen bg-[var(--bg)] transition-colors">
      <header className="bg-[var(--card-bg)] border-b border-[var(--card-border)] sticky top-0 z-20 transition-colors">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--text-main)] hover:text-primary-hover dark:hover:text-emerald-400 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Home</span>
            </Link>
            <span className="text-[var(--card-border)]">|</span>
            <span className="font-black text-xl tracking-tight text-[var(--text-main)]">BukieBrainJobs</span>
          </div>
          <ThemeToggle idPrefix="worker-onboarding-theme" />
        </div>
      </header>

      <main className="py-10 px-4 sm:px-6 lg:px-8 transition-colors">
        <div className="max-w-3xl mx-auto space-y-8">
          <div>
            <FunnelProgressBar
              currentStep={currentStep}
              completedSteps={completedSteps}
              onStepClick={(step) => setStep(step)}
            />
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
              identityData={identityDataForReview}
              tradeData={tradeDataForReview}
              credentialsData={draftRecord?.credentials ?? credentialsDraft}
              onEditStep={(step) => setStep(step)}
              onBack={prevStep}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
            />
          )}
        </div>
      </main>
    </div>
  );
}

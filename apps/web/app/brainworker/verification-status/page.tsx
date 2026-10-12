// apps/web/app/brainworker/verification-status/page.tsx
// Phase 8 GREEN: BrainWorker Verification Status Monitor Route
// Authoritative References:
// - docs/specs/BW-001-architecture-contract.md (Section 5.1)
// - docs/specs/BW-001-test-first-implementation-plan.md (Suite 8: INT-008)

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getMockAuthenticatedUser, setMockAuthenticatedUser } from '../../../lib/auth/storage';
import { getBrainWorkerOnboardingRepository } from '../../../lib/brainworker/repository';
import type { BrainWorkerOnboardingRecord } from '../../../lib/brainworker/types';
import { VerificationStatusMonitor } from '../../../components/brainworker/onboarding/VerificationStatusMonitor';
import type { AuthUser } from '../../../lib/auth/types';

export default function BrainWorkerVerificationStatusPage(): React.ReactElement {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(() => getMockAuthenticatedUser());
  const [record, setRecord] = useState<BrainWorkerOnboardingRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const currentUser = getMockAuthenticatedUser();
    setUser(currentUser);

    // Guard 1: Unauthenticated -> redirect to /login
    if (!currentUser) {
      router.replace('/login?redirect=/brainworker/verification-status');
      return;
    }

    // Guard 2: Non-BrainWorker (e.g. Customer) -> fail-closed boundary, no repo call
    if (currentUser.role !== 'brainworker') {
      setIsLoading(false);
      return;
    }

    // Guard 3: BrainWorker -> load authoritative record
    const repo = getBrainWorkerOnboardingRepository();
    let isSubscribed = true;

    repo
      .getOnboardingRecord(currentUser.id)
      .then((fetchedRecord) => {
        if (isSubscribed) {
          setRecord(fetchedRecord);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isSubscribed) {
          setIsLoading(false);
        }
      });

    if (repo.subscribe) {
      const unsubscribe = repo.subscribe(currentUser.id, (updatedRecord) => {
        if (isSubscribed) {
          setRecord(updatedRecord);
        }
      });
      return () => {
        isSubscribed = false;
        unsubscribe();
      };
    }

    return () => {
      isSubscribed = false;
    };
  }, [router]);

  const handleRemediate = () => {
    router.push('/brainworker/onboarding');
  };

  const handleEnterWorkspace = () => {
    // If operational review transitioned record to APPROVED, ensure session flag is enabled before entering operating dashboard
    if (record?.status === 'APPROVED' && user && !user.isBrainWorkerApproved) {
      const approvedUser: AuthUser = { ...user, isBrainWorkerApproved: true };
      setMockAuthenticatedUser(approvedUser);
      setUser(approvedUser);
    }
    router.push('/brainworker/dashboard');
  };

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-[#0B1528] transition-colors">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#001A41] dark:border-emerald-400 border-t-transparent" />
      </div>
    );
  }

  if (user.role !== 'brainworker') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0B1528] p-6 flex items-center justify-center transition-colors">
        <div className="max-w-md w-full bg-white dark:bg-[#111927] rounded-lg border border-amber-200 dark:border-amber-900/40 p-8 text-center space-y-4 shadow-xs transition-colors">
          <div className="inline-flex items-center gap-1.5 rounded-md bg-amber-500/10 border border-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-700 dark:text-amber-400">
            Customer Account Detected
          </div>
          <h2 className="text-xl font-bold text-[#001A41] dark:text-white">Provider Status Restricted</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            BrainWorker verification status is only accessible by registered service providers.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg bg-[#001A41] dark:bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white dark:text-slate-950 shadow-sm hover:bg-[#002661] dark:hover:bg-emerald-500 transition"
          >
            Return to Customer Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-[#0B1528] transition-colors">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#001A41] dark:border-emerald-400 border-t-transparent" />
      </div>
    );
  }

  if (!record) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0B1528] p-6 flex items-center justify-center transition-colors">
        <div className="max-w-md w-full bg-white dark:bg-[#111927] rounded-lg border border-slate-200 dark:border-slate-800 p-8 text-center space-y-4 shadow-xs transition-colors">
          <h2 className="text-xl font-bold text-[#001A41] dark:text-white">No Application Found</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            You have not submitted a BrainWorker onboarding application yet.
          </p>
          <button
            type="button"
            onClick={() => router.push('/brainworker/onboarding')}
            className="inline-flex items-center gap-2 rounded-lg bg-[#001A41] dark:bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white dark:text-slate-950 shadow-sm hover:bg-[#002661] dark:hover:bg-emerald-500 transition"
          >
            Start Onboarding
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#0B1528] py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-4xl mx-auto space-y-6">
        <VerificationStatusMonitor
          record={record}
          onRemediate={handleRemediate}
          onEnterWorkspace={handleEnterWorkspace}
        />
      </div>
    </main>
  );
}

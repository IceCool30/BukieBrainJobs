// apps/web/app/brainworker/verification-status/page.tsx
// Phase 8 GREEN: BrainWorker Verification Status Monitor Route
// Authoritative References:
// - docs/specs/BW-001-architecture-contract.md (Section 5.1)
// - docs/specs/BW-001-test-first-implementation-plan.md (Suite 8: INT-008)

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import { getMockAuthenticatedUser, setMockAuthenticatedUser } from '../../../lib/auth/storage';
import { getBrainWorkerOnboardingRepository } from '../../../lib/brainworker/repository';
import type { BrainWorkerOnboardingRecord } from '../../../lib/brainworker/types';
import { VerificationStatusMonitor } from '../../../components/brainworker/onboarding/VerificationStatusMonitor';
import type { AuthUser } from '../../../lib/auth/types';

export default function BrainWorkerVerificationStatusPage(): React.ReactElement {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
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
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] transition-colors">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--text-main)] border-t-transparent" />
      </div>
    );
  }

  if (user.role !== 'brainworker') {
    return (
      <div className="min-h-screen bg-[var(--bg)] p-6 flex items-center justify-center transition-colors">
        <div className="max-w-md w-full bg-[var(--card-bg)] rounded-lg border border-[var(--amber)]/30 p-8 text-center space-y-4 shadow-xs transition-colors">
          <div className="inline-flex items-center gap-1.5 rounded-md bg-[var(--amber-dim)] border border-[var(--amber)]/30 px-3 py-1 text-xs font-semibold text-[var(--amber)]">
            Customer Account Detected
          </div>
          <h2 className="text-xl font-bold text-[var(--text-main)]">Provider Status Restricted</h2>
          <p className="text-sm text-[var(--text-muted)] leading-relaxed">
            BrainWorker verification status is only accessible by registered service providers.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg bg-[var(--amber)] px-5 py-2.5 text-sm font-bold text-[#001A41] shadow-sm hover:bg-[var(--amber-hover)] transition"
          >
            Return to Customer Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] transition-colors">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--text-main)] border-t-transparent" />
      </div>
    );
  }

  if (!record) {
    return (
      <div className="min-h-screen bg-[var(--bg)] p-6 flex items-center justify-center transition-colors">
        <div className="max-w-md w-full bg-[var(--card-bg)] rounded-lg border border-[var(--card-border)] p-8 text-center space-y-4 shadow-xs transition-colors">
          <h2 className="text-xl font-bold text-[var(--text-main)]">No Application Found</h2>
          <p className="text-sm text-[var(--text-muted)]">
            You have not submitted a BrainWorker onboarding application yet.
          </p>
          <button
            type="button"
            onClick={() => router.push('/brainworker/onboarding')}
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--amber)] px-5 py-2.5 text-sm font-bold text-[#001A41] shadow-sm hover:bg-[var(--amber-hover)] transition"
          >
            Start Onboarding
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] transition-colors">
      <header className="bg-[var(--card-bg)] border-b border-[var(--card-border)] sticky top-0 z-20 transition-colors">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--text-main)] hover:text-[var(--amber-hover)] transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Home</span>
            </Link>
          </div>
          <Image src="/images/logo-icon.png" alt="BukieBrainJobs" width={32} height={32} className="h-8 w-8 rounded-lg object-contain" />
        </div>
      </header>

      <main className="py-12 px-4 sm:px-6 lg:px-8 transition-colors">
        <div className="max-w-4xl mx-auto space-y-6">
          <VerificationStatusMonitor
            record={record}
            onRemediate={handleRemediate}
            onEnterWorkspace={handleEnterWorkspace}
          />
        </div>
      </main>
    </div>
  );
}

// apps/web/app/brainworker/leads/page.tsx
// Phase 6 GREEN: BrainWorker Leads & Job Requests Route
// Governed by: BW-003 Architecture Contract v1.0 & Test-First Implementation Plan v1.0 (Suite 6: INT-001 to INT-010)

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import { getMockAuthenticatedUser, setMockAuthenticatedUser } from '../../../lib/auth/storage';
import type { AuthUser } from '../../../lib/auth/types';
import { getBrainWorkerOperationsRepository } from '../../../lib/brainworker/catalog/repository';
import type { BrainWorkerOperationalProfile } from '../../../lib/brainworker/catalog/types';
import { LeadsInboxView } from '../../../components/brainworker/leads/LeadsInboxView';
import { BrainWorkerHeader } from '../../../components/brainworker/BrainWorkerHeader';

export default function BrainWorkerLeadsPage(): React.ReactElement {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [operationalProfile, setOperationalProfile] =
    useState<BrainWorkerOperationalProfile | null>(null);
  const [isProfileLoaded, setIsProfileLoaded] = useState(false);

  useEffect(() => {
    let isSubscribed = true;
    const currentUser = getMockAuthenticatedUser();
    setUser(currentUser);

    // Guard 1: Unauthenticated -> redirect to /login
    if (!currentUser) {
      router.replace('/login?redirect=/brainworker/leads');
      return;
    }

    // Guard 2: Non-BrainWorker -> fail-closed boundary
    if (currentUser.role !== 'brainworker') {
      return;
    }

    // Guard 3: Unapproved BrainWorker -> redirect to verification status
    if (!currentUser.isBrainWorkerApproved) {
      router.replace('/brainworker/verification-status');
      return;
    }

    // Guard 4: Query operational profile for setup completeness check
    const opsRepo = getBrainWorkerOperationsRepository();
    opsRepo
      .getOperationalProfile(currentUser.id)
      .then((profile) => {
        if (!isSubscribed) return;
        setOperationalProfile(profile);
        setIsProfileLoaded(true);
      })
      .catch(() => {
        if (!isSubscribed) return;
        setIsProfileLoaded(true);
      });

    return () => {
      isSubscribed = false;
    };
  }, [router]);

  // Customer Account / Non-BrainWorker Fail-Closed Boundary
  if (user && user.role !== 'brainworker') {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-4 transition-colors">
        <div className="max-w-md w-full bg-[var(--card-bg)] rounded-lg border border-[var(--danger-border)] p-8 shadow-xs text-center space-y-4 transition-colors">
          <div className="inline-flex items-center gap-1.5 rounded-md bg-[var(--danger-dim)] border border-[var(--danger-border)] px-3 py-1 text-xs font-semibold text-[var(--danger)]">
            {user.role === 'customer' ? 'Customer Account Detected' : 'Unauthorized Access'}
          </div>
          <h2 className="text-xl font-bold text-[var(--text-main)]">Access Restricted</h2>
          <p className="text-sm text-[var(--text-muted)] leading-relaxed">
            The BrainWorker workspace is strictly reserved for verified service providers.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg bg-[var(--amber)] px-5 py-2.5 text-sm font-bold text-[#001A41] shadow-xs hover:bg-[var(--amber-hover)] transition-colors"
          >
            {user.role === 'customer' ? 'Return to Customer Dashboard' : 'Return Home'}
          </Link>
        </div>
      </div>
    );
  }

  const handleSignOut = () => {
    setMockAuthenticatedUser(null);
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-main)] transition-colors duration-200">
      {/* Top Navigation */}
      <BrainWorkerHeader active="leads" user={user} onSignOut={handleSignOut} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-main)]">Job Requests & Leads</h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Inspect and respond to customer job requests matching your trade and coverage zones.
          </p>
        </div>

        {/* Loading state while resolving auth and profile */}
        {(!user || !isProfileLoaded) && (
          <div className="p-12 text-center bg-[var(--card-bg)] text-[var(--text-main)] rounded-lg border border-[var(--card-border)] shadow-xs transition-colors">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-[var(--lead)] border-t-transparent" />
            <p className="mt-3 text-sm text-[var(--text-muted)]">Checking provider authorization...</p>
          </div>
        )}

        {/* Incomplete Operational Profile Banner */}
        {user && isProfileLoaded && operationalProfile && !operationalProfile.isComplete && (
          <div role="region" aria-label="Provider setup required" className="p-6 rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)] shadow-xs space-y-4 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 rounded-md bg-[var(--amber-dim)] border border-[var(--amber)]/30 px-2.5 py-0.5 text-xs font-bold text-[var(--amber)]">
                  <AlertTriangle className="h-3.5 w-3.5 text-[var(--amber)]" />
                  <span>Action Needed</span>
                </div>
                <h2 className="text-lg font-bold text-[var(--text-main)]">
                  Complete Your Provider Setup to Receive Leads
                </h2>
                <p className="text-sm text-[var(--text-muted)] max-w-2xl leading-relaxed">
                  Before you can inspect customer job requests, configure your trade services, hourly rates, operating hours, and coverage zones.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/brainworker/services"
                  className="inline-flex items-center justify-center rounded-lg bg-[var(--amber)] px-4 py-2.5 text-sm font-bold text-[#001A41] shadow-xs hover:bg-[var(--amber-hover)] transition-colors"
                >
                  Configure Services & Rates
                </Link>
                <Link
                  href="/brainworker/availability"
                  className="inline-flex items-center justify-center rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)] px-4 py-2.5 text-sm font-semibold text-[var(--text-main)] shadow-xs hover:bg-[var(--bg)] transition-colors"
                >
                  Set Hours & Coverage
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Approved & Complete Provider Leads Workspace */}
        {user && isProfileLoaded && operationalProfile && operationalProfile.isComplete && (
          <LeadsInboxView brainWorkerId={user.id} />
        )}
      </main>
    </div>
  );
}

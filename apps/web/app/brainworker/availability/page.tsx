// apps/web/app/brainworker/availability/page.tsx
// Phase 7 GREEN: BrainWorker Availability, Schedule & Coverage Route
// Governed by: BW-002 Architecture Contract v1.2 & Test-First Implementation Plan v1.2 (Suite 6: INT-001 to INT-003, INT-005, INT-009, INT-010)

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, ArrowLeft, LogOut } from 'lucide-react';
import { getMockAuthenticatedUser, setMockAuthenticatedUser } from '../../../lib/auth/storage';
import type { AuthUser } from '../../../lib/auth/types';
import { AvailabilityEditor } from '../../../components/brainworker/catalog/AvailabilityEditor';
import { CoverageEditor } from '../../../components/brainworker/catalog/CoverageEditor';
import { getBrainWorkerOnboardingRepository } from '../../../lib/brainworker/repository';
import ThemeToggle from '../../../components/ThemeToggle';

export default function BrainWorkerAvailabilityPage(): React.ReactElement {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(() => getMockAuthenticatedUser());
  const [verifiedCities, setVerifiedCities] = useState<string[]>([]);

  useEffect(() => {
    const currentUser = getMockAuthenticatedUser();
    setUser(currentUser);

    // Guard 1: Unauthenticated -> redirect to /login
    if (!currentUser) {
      router.replace('/login?redirect=/brainworker/availability');
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

    // Authoritative derivation of verifiedCities from BW-001 onboarding repository
    let isSubscribed = true;
    const onboardingRepo = getBrainWorkerOnboardingRepository();
    onboardingRepo
      .getOnboardingRecord(currentUser.id)
      .then((record) => {
        if (isSubscribed && record?.trade?.coverageCities) {
          setVerifiedCities(record.trade.coverageCities);
        }
      })
      .catch(() => {
        // fail closed on city derivation error
      });

    return () => {
      isSubscribed = false;
    };
  }, [router]);

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] transition-colors">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#001A41] dark:border-emerald-400 border-t-transparent" />
      </div>
    );
  }

  if (user.role !== 'brainworker') {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-4 transition-colors">
        <div className="max-w-md w-full bg-[var(--card-bg)] rounded-lg border border-red-200 dark:border-red-900/40 p-8 shadow-xs text-center space-y-4 transition-colors">
          <div className="inline-flex items-center gap-1.5 rounded-md bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 px-3 py-1 text-xs font-semibold text-red-800 dark:text-red-300">
            {user.role === 'customer' ? 'Customer Account Detected' : 'Unauthorized Access'}
          </div>
          <h2 className="text-xl font-bold text-[var(--text-main)]">Workspace Unavailable</h2>
          <p className="text-sm text-[var(--text-muted)] leading-relaxed">
            This section requires a verified service provider profile.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg bg-[#001A41] dark:bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white dark:text-slate-950 shadow-sm hover:bg-[#002661] dark:hover:bg-emerald-500 transition"
          >
            {user.role === 'customer' ? 'Return to Customer Dashboard' : 'Return Home'}
          </Link>
        </div>
      </div>
    );
  }

  if (!user.isBrainWorkerApproved) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] transition-colors">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#001A41] dark:border-emerald-400 border-t-transparent" />
      </div>
    );
  }

  const handleSignOut = () => {
    setMockAuthenticatedUser(null);
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-main)] transition-colors">
      {/* Top Navigation */}
      <header className="bg-[var(--card-bg)] text-[var(--text-main)] border-b border-[var(--lead)] sticky top-0 z-20 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/brainworker/dashboard"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--text-main)] hover:text-[var(--amber)] transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Dashboard</span>
            </Link>
            <span className="text-[var(--lead)]">|</span>
            <span className="font-black text-xl tracking-tight text-[var(--text-main)]">BukieBrainJobs</span>
            <span className="inline-flex items-center gap-1 rounded-md bg-[var(--brand-green-dim)] border border-[var(--brand-green-border)] px-2.5 py-0.5 text-xs font-semibold text-[var(--brand-green)]">
              <ShieldCheck className="h-3.5 w-3.5 text-[var(--brand-green)]" />
              <span>Verified Provider</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle idPrefix="worker-availability-theme" />
            <div className="text-right hidden sm:block">
              <div className="text-sm font-bold text-[var(--text-main)]">{user.name}</div>
              <div className="text-xs text-[var(--text-muted)]">{user.email || user.phone}</div>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--text-muted)] hover:text-red-600 dark:hover:text-red-400 transition cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        <AvailabilityEditor brainWorkerId={user.id} />
        <CoverageEditor brainWorkerId={user.id} verifiedCities={verifiedCities} />
      </main>
    </div>
  );
}

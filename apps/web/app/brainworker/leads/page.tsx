// apps/web/app/brainworker/leads/page.tsx
// Phase 6 GREEN: BrainWorker Leads & Job Requests Route
// Governed by: BW-003 Architecture Contract v1.0 & Test-First Implementation Plan v1.0 (Suite 6: INT-001 to INT-010)

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, ArrowLeft, LogOut, AlertTriangle } from 'lucide-react';
import { getMockAuthenticatedUser, setMockAuthenticatedUser } from '../../../lib/auth/storage';
import type { AuthUser } from '../../../lib/auth/types';
import { getBrainWorkerOperationsRepository } from '../../../lib/brainworker/catalog/repository';
import type { BrainWorkerOperationalProfile } from '../../../lib/brainworker/catalog/types';
import { LeadsInboxView } from '../../../components/brainworker/leads/LeadsInboxView';

export default function BrainWorkerLeadsPage(): React.ReactElement {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(() => getMockAuthenticatedUser());
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
      <div className="min-h-screen bg-slate-50 dark:bg-[#0B1528] flex items-center justify-center p-4 transition-colors">
        <div className="max-w-md w-full bg-white dark:bg-[#111927] rounded-lg border border-red-200 dark:border-red-900/40 p-8 shadow-xs text-center space-y-4 transition-colors">
          <div className="inline-flex items-center gap-1.5 rounded-md bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 px-3 py-1 text-xs font-semibold text-red-800 dark:text-red-300">
            {user.role === 'customer' ? 'Customer Account Detected' : 'Unauthorized Access'}
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Access Restricted</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            The BrainWorker workspace is strictly reserved for verified service providers.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg bg-[#001A41] dark:bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white dark:text-slate-950 shadow-xs hover:bg-[#002661] dark:hover:bg-emerald-500 transition-colors"
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
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1528] text-slate-900 dark:text-white transition-colors duration-200">
      {/* Top Navigation */}
      <header className="bg-white dark:bg-[#111927] border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/brainworker/dashboard"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#001A41] dark:text-white hover:text-primary-hover dark:hover:text-emerald-400 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Dashboard</span>
            </Link>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <span className="font-black text-xl tracking-tight text-[#001A41] dark:text-white">BukieBrainJobs</span>
            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Verified Provider</span>
            </span>
          </div>

          {user && user.role === 'brainworker' && user.isBrainWorkerApproved && (
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-bold text-slate-900 dark:text-white">{user.name}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">{user.email || user.phone}</div>
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Job Requests & Leads</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Inspect and respond to customer job requests matching your trade and coverage zones.
          </p>
        </div>

        {/* Loading state while resolving auth and profile */}
        {(!user || !isProfileLoaded) && (
          <div className="p-12 text-center bg-white dark:bg-[#111927] text-slate-900 dark:text-white rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-[#001A41] dark:border-emerald-400 border-t-transparent" />
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">Checking provider authorization...</p>
          </div>
        )}

        {/* Incomplete Operational Profile Banner */}
        {user && isProfileLoaded && operationalProfile && !operationalProfile.isComplete && (
          <div className="p-6 rounded-lg bg-white dark:bg-[#111927] border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 rounded-md bg-amber-50 dark:bg-[#20180B] border border-amber-200 dark:border-amber-800/60 px-2.5 py-0.5 text-xs font-bold text-amber-800 dark:text-amber-400">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                  <span>Action Needed</span>
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Complete Your Provider Setup to Receive Leads
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
                  Before you can inspect customer job requests, configure your trade services, hourly rates, operating hours, and coverage zones.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/brainworker/services"
                  className="inline-flex items-center justify-center rounded-lg bg-[#FF6B35] px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-[#F15A24] transition-colors"
                >
                  Configure Services & Rates
                </Link>
                <Link
                  href="/brainworker/availability"
                  className="inline-flex items-center justify-center rounded-lg bg-white dark:bg-[#0D1424] border border-slate-300 dark:border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-900 dark:text-white shadow-xs hover:bg-slate-50 dark:hover:bg-[#1A2538] transition-colors"
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

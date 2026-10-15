// apps/web/app/brainworker/dashboard/page.tsx
// Phase 7 GREEN: BrainWorker Operating Dashboard Route & Operational Banners
// Authoritative References:
// - docs/specs/BW-001-architecture-contract.md (Section 5.1)
// - docs/specs/BW-002-architecture-contract.md (Sections 4, 5)
// - docs/specs/BW-002-ux-design-specification.md (Sections 2, 5)
// - docs/specs/BW-002-test-first-implementation-plan.md (Suite 6: INT-006 to INT-008, INT-010)

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldCheck,
  Briefcase,
  Clock,
  TrendingUp,
  LogOut,
  UserCheck,
  AlertTriangle,
} from 'lucide-react';
import { getMockAuthenticatedUser, setMockAuthenticatedUser } from '../../../lib/auth/storage';
import type { AuthUser } from '../../../lib/auth/types';
import { getBrainWorkerOperationsRepository } from '../../../lib/brainworker/catalog/repository';
import type { BrainWorkerOperationalProfile } from '../../../lib/brainworker/catalog/types';
import ThemeToggle from '../../../components/ThemeToggle';

export default function BrainWorkerDashboardPage(): React.ReactElement {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(() => getMockAuthenticatedUser());
  const [operationalProfile, setOperationalProfile] =
    useState<BrainWorkerOperationalProfile | null>(null);
  const [isTogglingDuty, setIsTogglingDuty] = useState(false);
  const redirectedRef = React.useRef(false);
  const toggledDutyRef = React.useRef<boolean | null>(null);

  useEffect(() => {
    const currentUser = getMockAuthenticatedUser();
    setUser(currentUser);

    // Guard 1: Unauthenticated -> redirect to /login
    if (!currentUser) {
      if (!redirectedRef.current) {
        redirectedRef.current = true;
        router.replace('/login?redirect=/brainworker/dashboard');
      }
      return;
    }

    // Guard 2: Non-BrainWorker -> fail-closed boundary
    if (currentUser.role !== 'brainworker') {
      return;
    }

    // Guard 3: Unapproved BrainWorker -> redirect to verification status
    if (!currentUser.isBrainWorkerApproved) {
      if (!redirectedRef.current) {
        redirectedRef.current = true;
        router.replace('/brainworker/verification-status');
      }
      return;
    }

    // Operational profile query for approved BrainWorker
    let isSubscribed = true;
    const opsRepo = getBrainWorkerOperationsRepository();
    opsRepo
      .getOperationalProfile(currentUser.id)
      .then((profile) => {
        if (!isSubscribed || !profile) return;

        const effectiveAvailable =
          toggledDutyRef.current !== null
            ? toggledDutyRef.current
            : profile.availability?.isAvailable ?? false;

        const mergedProfile: BrainWorkerOperationalProfile = {
          ...profile,
          availability: {
            ...profile.availability,
            isAvailable: effectiveAvailable,
          },
        };

        setOperationalProfile((prev) => {
          if (
            prev &&
            prev.isComplete === mergedProfile.isComplete &&
            prev.availability?.isAvailable === mergedProfile.availability?.isAvailable
          ) {
            return prev;
          }
          return mergedProfile;
        });
      })
      .catch(() => {
        // fail-safe
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
          <h2 className="text-xl font-bold text-[var(--text-main)]">Access Restricted</h2>
          <p className="text-sm text-[var(--text-muted)] leading-relaxed">
            The BrainWorker workspace is strictly reserved for verified service providers.
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

  const handleToggleDuty = async () => {
    if (!user || !operationalProfile || isTogglingDuty) {
      return;
    }
    setIsTogglingDuty(true);
    const nextAvailable = !operationalProfile.availability.isAvailable;
    toggledDutyRef.current = nextAvailable;
    try {
      const repo = getBrainWorkerOperationsRepository();
      const updatedAvailability = await repo.saveAvailability(user.id, {
        isAvailable: nextAvailable,
        isEmergencyAvailable: operationalProfile.availability.isEmergencyAvailable,
        weeklySchedule: operationalProfile.availability.weeklySchedule,
      });
      setOperationalProfile((prev) =>
        prev
          ? {
              ...prev,
              availability: {
                ...(updatedAvailability ?? prev.availability),
                isAvailable: nextAvailable,
              },
            }
          : null
      );
    } catch {
      toggledDutyRef.current = operationalProfile.availability.isAvailable;
    } finally {
      setIsTogglingDuty(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-main)] transition-colors">
      {/* Top Navigation */}
      <header className="bg-[var(--card-bg)] text-[var(--text-main)] border-b border-[var(--lead)] sticky top-0 z-20 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-black text-xl tracking-tight text-[var(--text-main)]">BukieBrainJobs</span>
            <span className="inline-flex items-center gap-1 rounded-md bg-[var(--brand-green-dim)] border border-[var(--brand-green-border)] px-2.5 py-0.5 text-xs font-semibold text-[var(--brand-green)]">
              <ShieldCheck className="h-3.5 w-3.5 text-[var(--brand-green)]" />
              <span>Verified Provider</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle idPrefix="worker-dashboard-theme" />
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#001A41] dark:text-white">BrainWorker Operating Dashboard</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Manage your service dispatch requests, active customer jobs, and earnings.
          </p>
        </div>

        {/* Setup Incomplete Banner (BW-002) */}
        {operationalProfile && !operationalProfile.isComplete && (
          <div className="p-6 rounded-lg bg-amber-50/70 dark:bg-[#20180B] border border-amber-200 dark:border-amber-900/40 shadow-xs space-y-4 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 rounded-md bg-amber-100 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/40 px-2.5 py-0.5 text-xs font-bold text-amber-900 dark:text-amber-300">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-700 dark:text-amber-400" />
                  <span>Action Needed</span>
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Complete Your Provider Setup to Receive Leads
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
                  Before you can be matched with customer jobs, configure your trade services, hourly rates, operating hours, and coverage zones.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/brainworker/services"
                  className="inline-flex items-center justify-center rounded-lg bg-[#001A41] dark:bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white dark:text-slate-950 shadow-sm hover:bg-[#002661] dark:hover:bg-emerald-500 transition-colors"
                >
                  Configure Services & Rates
                </Link>
                <Link
                  href="/brainworker/availability"
                  className="inline-flex items-center justify-center rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)] px-4 py-2.5 text-sm font-semibold text-[var(--text-main)] shadow-xs hover:bg-[var(--card-hover)] transition-colors"
                >
                  Set Hours & Coverage
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Operational Readiness Banner & Quick Duty Toggle (BW-002) */}
        {operationalProfile && operationalProfile.isComplete && (
          <div className="p-6 rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)] shadow-xs space-y-4 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={
                      operationalProfile.availability.isAvailable
                        ? 'h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse'
                        : 'h-2.5 w-2.5 rounded-full bg-slate-400'
                    }
                  />
                  <h2 className="text-lg font-bold text-[var(--text-main)]">
                    {operationalProfile.availability.isAvailable
                      ? 'Ready for Dispatch'
                      : 'Dispatch Paused'}
                  </h2>
                </div>
                <p className="text-sm text-[var(--text-muted)] max-w-2xl leading-relaxed">
                  {operationalProfile.availability.isAvailable
                    ? 'Your operational profile is active. Customer job invitations matching your trade and coverage zones will arrive during scheduled hours.'
                    : 'Your status is paused. No new job invitations will be routed to your account while you are away.'}
                </p>
              </div>
              <div className="flex items-center gap-4 bg-[var(--bg)] p-3 rounded-lg border border-[var(--card-border)]">
                <div className="text-right">
                  <div className="text-xs font-bold text-[var(--text-main)]">Dispatch Duty</div>
                  <div className="text-xs text-[var(--text-muted)]">
                    {operationalProfile.availability.isAvailable ? 'Active' : 'Standby'}
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={operationalProfile.availability.isAvailable}
                  aria-label="Dispatch Duty Toggle"
                  disabled={isTogglingDuty}
                  onClick={handleToggleDuty}
                  className={
                    operationalProfile.availability.isAvailable
                      ? 'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-emerald-600 dark:bg-emerald-500 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#001A41] focus:ring-offset-2'
                      : 'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-slate-300 dark:bg-slate-700 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#001A41] focus:ring-offset-2'
                  }
                >
                  <span
                    className={
                      operationalProfile.availability.isAvailable
                        ? 'translate-x-5 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out'
                        : 'translate-x-0 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out'
                    }
                  />
                </button>
              </div>
            </div>

            {/* Quick Links to Services, Availability, and Leads */}
            <div className="pt-3 border-t border-[var(--card-border)] flex flex-wrap items-center gap-4 text-xs font-semibold text-[#001A41] dark:text-emerald-400">
              <Link href="/brainworker/services" className="hover:underline">
                Configure Services & Rates →
              </Link>
              <Link href="/brainworker/availability" className="hover:underline">
                Set Hours & Coverage →
              </Link>
              <Link href="/brainworker/leads" className="hover:underline">
                View Job Requests & Leads →
              </Link>
            </div>
          </div>
        )}

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[var(--card-bg)] rounded-lg border border-[var(--card-border)] p-5 shadow-xs space-y-2 transition-colors">
            <div className="flex items-center justify-between text-[var(--text-muted)]">
              <span className="text-xs font-bold uppercase tracking-wider">Active Jobs</span>
              <Briefcase className="h-4 w-4 text-[var(--text-main)]" />
            </div>
            <div className="text-2xl font-bold text-[var(--text-main)]">0</div>
            <p className="text-xs text-[var(--text-muted)]">Ready for incoming requests</p>
          </div>

          <div className="bg-[var(--card-bg)] rounded-lg border border-[var(--card-border)] p-5 shadow-xs space-y-2 transition-colors">
            <div className="flex items-center justify-between text-[var(--text-muted)]">
              <span className="text-xs font-bold uppercase tracking-wider">Completed</span>
              <UserCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-[var(--text-main)]">0</div>
            <p className="text-xs text-[var(--text-muted)]">Total verified completions</p>
          </div>

          <div className="bg-[var(--card-bg)] rounded-lg border border-[var(--card-border)] p-5 shadow-xs space-y-2 transition-colors">
            <div className="flex items-center justify-between text-[var(--text-muted)]">
              <span className="text-xs font-bold uppercase tracking-wider">Total Earnings</span>
              <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-[var(--text-main)]">₦0.00</div>
            <p className="text-xs text-[var(--text-muted)]">Escrow released balance</p>
          </div>

          <div className="bg-[var(--card-bg)] rounded-lg border border-[var(--card-border)] p-5 shadow-xs space-y-2 transition-colors">
            <div className="flex items-center justify-between text-[var(--text-muted)]">
              <span className="text-xs font-bold uppercase tracking-wider">Standing</span>
              <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="text-sm font-bold text-emerald-700 dark:text-emerald-400">Verified & Approved</div>
            <p className="text-xs text-[var(--text-muted)]">Full dispatch privileges active</p>
          </div>
        </div>

        {/* Dispatch Feed Placeholder */}
        <div className="bg-[var(--card-bg)] rounded-lg border border-[var(--card-border)] p-8 shadow-xs text-center space-y-3 transition-colors">
          <div className="mx-auto w-12 h-12 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/40 flex items-center justify-center text-[#001A41] dark:text-blue-400">
            <Clock className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-bold text-[var(--text-main)]">No Incoming Service Requests</h2>
          <p className="text-sm text-[var(--text-muted)] max-w-md mx-auto">
            You will be alerted instantly when customers within your coverage areas request emergency or scheduled trade services.
          </p>
        </div>
      </main>
    </div>
  );
}

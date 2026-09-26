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

export default function BrainWorkerDashboardPage(): React.ReactElement {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(() => getMockAuthenticatedUser());
  const [operationalProfile, setOperationalProfile] =
    useState<BrainWorkerOperationalProfile | null>(null);
  const [isTogglingDuty, setIsTogglingDuty] = useState(false);

  useEffect(() => {
    const currentUser = getMockAuthenticatedUser();
    setUser(currentUser);

    // Guard 1: Unauthenticated -> redirect to /login
    if (!currentUser) {
      router.replace('/login?redirect=/brainworker/dashboard');
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

    // Operational profile query for approved BrainWorker
    let isSubscribed = true;
    const opsRepo = getBrainWorkerOperationsRepository();
    opsRepo
      .getOperationalProfile(currentUser.id)
      .then((profile) => {
        if (isSubscribed && profile) {
          setOperationalProfile(profile);
        }
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
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#001A41] border-t-transparent" />
      </div>
    );
  }

  if (user.role !== 'brainworker') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-red-200 p-8 shadow-sm text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-red-50 border border-red-200 px-3 py-1 text-xs font-semibold text-red-800">
            {user.role === 'customer' ? 'Customer Account Detected' : 'Unauthorized Access'}
          </div>
          <h2 className="text-xl font-bold text-slate-900">Access Restricted</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            The BrainWorker workspace is strictly reserved for verified service providers.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-xl bg-[#001A41] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#002661]"
          >
            {user.role === 'customer' ? 'Return to Customer Dashboard' : 'Return Home'}
          </Link>
        </div>
      </div>
    );
  }

  if (!user.isBrainWorkerApproved) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#001A41] border-t-transparent" />
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
              availability: updatedAvailability,
            }
          : null
      );
    } catch {
      // keep current state on error
    } finally {
      setIsTogglingDuty(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navigation */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-black text-xl tracking-tight text-[#001A41]">BukieBrainJobs</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>Verified Provider</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-bold text-slate-900">{user.name}</div>
              <div className="text-xs text-slate-500">{user.email || user.phone}</div>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-red-600 transition"
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
          <h1 className="text-2xl sm:text-3xl font-bold text-[#001A41]">BrainWorker Operating Dashboard</h1>
          <p className="mt-1 text-sm text-slate-600">
            Manage your service dispatch requests, active customer jobs, and earnings.
          </p>
        </div>

        {/* Setup Incomplete Banner (BW-002) */}
        {operationalProfile && !operationalProfile.isComplete && (
          <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 border border-amber-300 px-2.5 py-0.5 text-xs font-bold text-amber-900">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-700" />
                  <span>Setup Required</span>
                </div>
                <h2 className="text-lg font-bold text-slate-900">
                  Complete Your Provider Setup to Receive Leads
                </h2>
                <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
                  Before you can be matched with customer jobs, configure your trade services, hourly rates, operating hours, and coverage zones.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/brainworker/services"
                  className="inline-flex items-center justify-center rounded-xl bg-[#001A41] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#002661] transition-colors"
                >
                  Configure Services & Rates
                </Link>
                <Link
                  href="/brainworker/availability"
                  className="inline-flex items-center justify-center rounded-xl bg-white border border-slate-300 px-4 py-2.5 text-sm font-semibold text-[#001A41] shadow-sm hover:bg-slate-50 transition-colors"
                >
                  Set Hours & Coverage
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Operational Readiness Banner & Quick Duty Toggle (BW-002) */}
        {operationalProfile && operationalProfile.isComplete && (
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
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
                  <h2 className="text-lg font-bold text-slate-900">
                    {operationalProfile.availability.isAvailable
                      ? 'Ready for Dispatch'
                      : 'Dispatch Paused (Off-Duty)'}
                  </h2>
                </div>
                <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
                  {operationalProfile.availability.isAvailable
                    ? 'You are eligible for dispatch. Customer job invitations within your verified coverage areas will match your profile during scheduled hours.'
                    : 'You are currently off-duty and taking a break. No new job leads or matches will be routed to your account.'}
                </p>
              </div>
              <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-700">Dispatch Duty</div>
                  <div className="text-xs text-slate-500">
                    {operationalProfile.availability.isAvailable ? 'On-Duty' : 'Off-Duty'}
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={operationalProfile.availability.isAvailable}
                  aria-label={
                    operationalProfile.availability.isAvailable
                      ? 'Dispatch duty On-Duty'
                      : 'Dispatch duty Off-Duty'
                  }
                  disabled={isTogglingDuty}
                  onClick={handleToggleDuty}
                  className={
                    operationalProfile.availability.isAvailable
                      ? 'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-emerald-600 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#001A41] focus:ring-offset-2'
                      : 'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-slate-300 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#001A41] focus:ring-offset-2'
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

            {/* Quick Links to Services & Availability */}
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-4 text-xs font-semibold text-[#001A41]">
              <Link href="/brainworker/services" className="hover:underline">
                Configure Services & Rates →
              </Link>
              <Link href="/brainworker/availability" className="hover:underline">
                Set Hours & Coverage →
              </Link>
            </div>
          </div>
        )}

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Active Jobs</span>
              <Briefcase className="h-4 w-4 text-[#001A41]" />
            </div>
            <div className="text-2xl font-bold text-[#001A41]">0</div>
            <p className="text-xs text-slate-500">Ready for incoming requests</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Completed</span>
              <UserCheck className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-[#001A41]">0</div>
            <p className="text-xs text-slate-500">Total verified completions</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Total Earnings</span>
              <TrendingUp className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-[#001A41]">₦0.00</div>
            <p className="text-xs text-slate-500">Escrow released balance</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Standing</span>
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="text-sm font-bold text-emerald-700">Verified & Approved</div>
            <p className="text-xs text-slate-500">Full dispatch privileges active</p>
          </div>
        </div>

        {/* Dispatch Feed Placeholder */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center space-y-3">
          <div className="mx-auto w-12 h-12 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-[#001A41]">
            <Clock className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-bold text-[#001A41]">No Incoming Service Requests</h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            You will be alerted instantly when customers within your coverage areas request emergency or scheduled trade services.
          </p>
        </div>
      </main>
    </div>
  );
}

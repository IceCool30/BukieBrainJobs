// apps/web/app/brainworker/dashboard/page.tsx
// Phase 8 GREEN: BrainWorker Operating Dashboard Route
// Authoritative References:
// - docs/specs/BW-001-architecture-contract.md (Section 5.1)
// - docs/specs/BW-001-test-first-implementation-plan.md (Suite 8: INT-007)

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Briefcase,
  Clock,
  TrendingUp,
  LogOut,
  UserCheck,
} from 'lucide-react';
import { getMockAuthenticatedUser, setMockAuthenticatedUser } from '../../../lib/auth/storage';
import type { AuthUser } from '../../../lib/auth/types';

export default function BrainWorkerDashboardPage(): React.ReactElement {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(() => getMockAuthenticatedUser());

  useEffect(() => {
    const currentUser = getMockAuthenticatedUser();
    setUser(currentUser);

    // Guard 1: Unauthenticated -> redirect to /login
    if (!currentUser) {
      router.replace('/login?redirect=/brainworker/dashboard');
      return;
    }

    // Guard 2: Customer -> blocked
    if (currentUser.role === 'customer') {
      return;
    }

    // Guard 3: Unapproved BrainWorker -> redirect to verification status
    if (currentUser.role === 'brainworker' && !currentUser.isBrainWorkerApproved) {
      router.replace('/brainworker/verification-status');
      return;
    }
  }, [router]);

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#001A41] border-t-transparent" />
      </div>
    );
  }

  if (user.role === 'customer') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-red-200 p-8 shadow-sm text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-red-50 border border-red-200 px-3 py-1 text-xs font-semibold text-red-800">
            Customer Account Detected
          </div>
          <h2 className="text-xl font-bold text-slate-900">Access Restricted</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            The BrainWorker workspace is strictly reserved for verified service providers.
          </p>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-xl bg-[#001A41] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#002661]"
          >
            Return to Customer Dashboard
          </a>
        </div>
      </div>
    );
  }

  if (user.role === 'brainworker' && !user.isBrainWorkerApproved) {
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

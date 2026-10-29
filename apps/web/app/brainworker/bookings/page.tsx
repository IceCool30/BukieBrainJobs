// apps/web/app/brainworker/bookings/page.tsx
// Phase 8 GREEN: BrainWorker Bookings Management Route
// Governed by: BW-004-ARCH v0.2 section 13 and BW-004-TEST-PLAN section 2 (Suite 8: INT-001 to INT-011)

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import { getMockAuthenticatedUser, setMockAuthenticatedUser } from '../../../lib/auth/storage';
import type { AuthUser } from '../../../lib/auth/types';
import { getBrainWorkerOperationsRepository } from '../../../lib/brainworker/catalog/repository';
import type { BrainWorkerOperationalProfile } from '../../../lib/brainworker/catalog/types';
import { getBrainWorkerBookingsRepository } from '../../../lib/brainworker/bookings/repository';
import { BookingsListView } from '../../../components/brainworker/bookings/BookingsListView';
import { BrainWorkerHeader } from '../../../components/brainworker/BrainWorkerHeader';

export default function BrainWorkerBookingsPage(): React.ReactElement {
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
      router.replace('/login?redirect=/brainworker/bookings');
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
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[var(--card-bg)] rounded-2xl border border-[var(--danger-border)] p-8 shadow-sm text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[var(--danger-dim)] border border-[var(--danger-border)] px-3 py-1 text-xs font-semibold text-[var(--danger)]">
            {user.role === 'customer' ? 'Customer Account Detected' : 'Unauthorized Access'}
          </div>
          <h2 className="text-xl font-bold text-[var(--text-main)]">Access Restricted</h2>
          <p className="text-sm text-[var(--text-muted)] leading-relaxed">
            The BrainWorker workspace is strictly reserved for verified service providers.
          </p>
          <Link
            href="/"
            className="outlier-pill-button inline-flex items-center justify-center rounded-full bg-[var(--amber)] px-5 py-2.5 text-sm font-bold text-[#001A41] shadow-sm hover:bg-[var(--amber-hover)] transition-all"
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
      <BrainWorkerHeader active="bookings" user={user} onSignOut={handleSignOut} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-trades uppercase text-[var(--text-main)]">
            My Bookings
          </h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Operational dispatch sheet for scheduled and active customer service bookings.
          </p>
        </div>

        {/* Loading state while resolving auth and profile */}
        {(!user || !isProfileLoaded) && (
          <div className="p-12 text-center bg-[var(--card-bg)] text-[var(--text-main)] rounded-2xl border border-[var(--lead)] shadow-sm">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-[var(--amber)] border-t-transparent" />
            <p className="mt-3 text-sm text-[var(--text-muted)]">Checking provider authorization...</p>
          </div>
        )}

        {/* Incomplete Operational Profile Banner */}
        {user && isProfileLoaded && operationalProfile && !operationalProfile.isComplete && (
          <div role="region" aria-label="Provider setup required" className="p-6 rounded-2xl bg-[var(--card-bg)] border border-[var(--lead)] shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-[var(--amber-dim)] border border-[var(--amber)]/30 px-2.5 py-0.5 text-xs font-bold text-[var(--amber)]">
                  <AlertTriangle className="h-3.5 w-3.5 text-[var(--amber)]" />
                  <span>Action Needed</span>
                </div>
                <h2 className="text-lg font-bold text-[var(--text-main)]">
                  Complete Your Provider Setup to Manage Bookings
                </h2>
                <p className="text-sm text-[var(--text-muted)] max-w-2xl leading-relaxed">
                  Before you can manage confirmed bookings, configure your trade services, hourly rates, operating hours, and coverage zones.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/brainworker/services"
                  className="outlier-pill-button inline-flex items-center justify-center rounded-full bg-[var(--amber)] px-4 py-2.5 text-sm font-bold text-[#001A41] shadow-sm hover:bg-[var(--amber-hover)] transition-all"
                >
                  Configure Services & Rates
                </Link>
                <Link
                  href="/brainworker/availability"
                  className="inline-flex items-center justify-center rounded-lg bg-[var(--card-bg)] border border-[var(--lead)] px-4 py-2.5 text-sm font-semibold text-[var(--text-main)] shadow-sm hover:bg-[var(--card-hover)] transition-all"
                >
                  Set Hours & Coverage
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Approved & Complete Provider Bookings Workspace */}
        {user && isProfileLoaded && operationalProfile && operationalProfile.isComplete && (
          <BookingsListView
            brainWorkerId={user.id}
            repository={getBrainWorkerBookingsRepository()}
            onSelectBooking={(bookingId) => router.push(`/brainworker/bookings/${bookingId}`)}
          />
        )}
      </main>
    </div>
  );
}

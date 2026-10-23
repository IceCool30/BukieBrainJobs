// apps/web/app/brainworker/dashboard/page.tsx
// Phase 4 GREEN: BrainWorker Operating Dashboard Route & Live Aggregated Feed
// Authoritative References:
// - docs/specs/BW-004-booking-management.md
// - docs/specs/BW-002-service-catalog-availability.md
// - Item 2.2 in master checklist: BrainWorker Operating Dashboard

'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import { getMockAuthenticatedUser, setMockAuthenticatedUser } from '../../../lib/auth/storage';
import type { AuthUser } from '../../../lib/auth/types';
import { getBrainWorkerOperationsRepository } from '../../../lib/brainworker/catalog/repository';
import type { BrainWorkerOperationalProfile } from '../../../lib/brainworker/catalog/types';
import { getBrainWorkerDashboardService } from '../../../lib/brainworker/dashboard/service';
import type { BrainWorkerDashboardFeed } from '../../../lib/brainworker/dashboard/types';
import { DashboardMetricsCards } from '../../../components/brainworker/dashboard/DashboardMetricsCards';
import { UrgentLeadsTicker } from '../../../components/brainworker/dashboard/UrgentLeadsTicker';
import { BrainWorkerHeader } from '../../../components/brainworker/BrainWorkerHeader';

export default function BrainWorkerDashboardPage(): React.ReactElement {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [operationalProfile, setOperationalProfile] =
    useState<BrainWorkerOperationalProfile | null>(null);
  const [feed, setFeed] = useState<BrainWorkerDashboardFeed | null>(null);
  const [isFeedLoading, setIsFeedLoading] = useState<boolean>(true);
  const [feedError, setFeedError] = useState<string | null>(null);
  const [isTogglingDuty, setIsTogglingDuty] = useState(false);
  const redirectedRef = useRef(false);
  const toggledDutyRef = useRef<boolean | null>(null);

  const loadFeed = useCallback(async (workerId: string) => {
    try {
      setIsFeedLoading(true);
      setFeedError(null);
      const service = getBrainWorkerDashboardService();
      const feedData = await service.getDashboardFeed(workerId);
      setFeed(feedData);
    } catch (err) {
      setFeedError(
        err instanceof Error ? err.message : 'Unable to load operational dashboard feed.'
      );
    } finally {
      setIsFeedLoading(false);
    }
  }, []);

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

    // Query live feed for approved BrainWorker
    void loadFeed(currentUser.id);

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
  }, [router, loadFeed]);

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] transition-colors">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--text-main)] border-t-transparent" />
      </div>
    );
  }

  if (user.role !== 'brainworker') {
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
            className="inline-flex items-center justify-center rounded-lg bg-[var(--amber)] px-5 py-2.5 text-sm font-bold text-[#001A41] shadow-sm hover:bg-[var(--amber-hover)] transition"
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
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--text-main)] border-t-transparent" />
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
      // Synchronize feed operational status if feed is present
      setFeed((prevFeed) =>
        prevFeed
          ? {
              ...prevFeed,
              operationalStatus: {
                ...prevFeed.operationalStatus,
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
      <BrainWorkerHeader active="dashboard" user={user} onSignOut={handleSignOut} />

      {/* Main Workspace */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-main)]">BrainWorker Operating Dashboard</h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Manage your service dispatch requests, active customer jobs, and verified schedule.
          </p>
        </div>

        {/* Setup Incomplete Banner (BW-002) */}
        {operationalProfile && !operationalProfile.isComplete && (
          <div role="region" aria-label="Provider setup required" className="p-6 rounded-lg bg-[var(--amber-dim)] border border-[var(--amber)]/30 shadow-xs space-y-4 transition-colors">
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
                  Before you can be matched with customer jobs, configure your trade services, hourly rates, operating hours, and coverage zones.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/brainworker/services"
                  className="inline-flex items-center justify-center rounded-lg bg-[var(--amber)] px-4 py-2.5 text-sm font-bold text-[#001A41] shadow-sm hover:bg-[var(--amber-hover)] transition-colors"
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
                        ? 'h-2.5 w-2.5 rounded-full bg-[var(--brand-green)] animate-pulse'
                        : 'h-2.5 w-2.5 rounded-full bg-[var(--rule)]'
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
                      ? 'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-[var(--amber)] transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[var(--amber)] focus:ring-offset-2'
                      : 'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-[var(--rule)] transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[var(--amber)] focus:ring-offset-2'
                  }
                >
                  <span
                    className={
                      operationalProfile.availability.isAvailable
                        ? 'translate-x-5 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-[var(--card-bg)] shadow ring-0 transition duration-200 ease-in-out'
                        : 'translate-x-0 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-[var(--card-bg)] shadow ring-0 transition duration-200 ease-in-out'
                    }
                  />
                </button>
              </div>
            </div>

            {/* Quick Links to Services, Availability, Leads, and Bookings */}
            <div className="pt-3 border-t border-[var(--card-border)] flex flex-wrap items-center gap-4 text-xs font-semibold text-[var(--text-main)]">
              <Link href="/brainworker/services" className="hover:underline">
                Configure Services & Rates →
              </Link>
              <Link href="/brainworker/availability" className="hover:underline">
                Set Hours & Coverage →
              </Link>
              <Link href="/brainworker/leads" className="hover:underline">
                View Job Requests & Leads →
              </Link>
              <Link href="/brainworker/bookings" className="hover:underline">
                View Confirmed Bookings →
              </Link>
            </div>
          </div>
        )}

        {/* Live Aggregated Metrics & Ticker Section (ROUT-004 to ROUT-010) */}
        {isFeedLoading && !feed && (
          <div
            data-testid="dashboard-loading-skeleton"
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 animate-pulse"
          >
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-32 rounded-xl border border-[var(--lead)] bg-[var(--tag-bg)] p-5"
              />
            ))}
          </div>
        )}

        {feedError && (
          <div
            data-testid="dashboard-error-alert"
            role="alert"
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-[var(--danger-border)] bg-[var(--danger-dim)] p-4 text-[var(--danger)]"
          >
            <div>
              <h3 className="text-sm font-semibold">Feed Notice</h3>
              <p className="mt-1 text-sm">{feedError}</p>
            </div>
            <button
              type="button"
              onClick={() => user && void loadFeed(user.id)}
              className="rounded-lg bg-[var(--danger)] px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {feed && (
          <div className="space-y-6">
            <DashboardMetricsCards
              metrics={feed.metrics}
              onSelectActiveJob={(bookingId) =>
                router.push(`/brainworker/bookings/${bookingId}`)
              }
              onNavigateToLeads={() => router.push('/brainworker/leads')}
              onNavigateToBookings={() => router.push('/brainworker/bookings')}
            />

            <UrgentLeadsTicker
              urgentLeads={feed.urgentLeads}
              onQuoteLead={(leadId) =>
                router.push(`/brainworker/leads?quote=${leadId}`)
              }
              onViewAllLeads={() => router.push('/brainworker/leads')}
            />
          </div>
        )}
      </main>
    </div>
  );
}

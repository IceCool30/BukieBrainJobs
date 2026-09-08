'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  AlertTriangle,
  RotateCcw,
  Briefcase,
} from 'lucide-react';
import {
  CustomerActivityViewModel,
  ActivityFilterView,
} from '@bukiebrainjobs/types';
import {
  getMockAuthenticatedUser,
  setMockAuthenticatedUser,
  getPreservedJobDraft,
} from '../../lib/auth/storage';
import { AuthUser } from '../../lib/auth/types';
import {
  resolveJobsContext,
  normalizeFilterView,
  MOCK_CUSTOMER_ACTIVITIES,
} from '../../lib/jobs';
import { ActivityCard } from './ActivityCard';
import { ActivityDetail } from './ActivityDetail';
import { ActivityFilters } from './ActivityFilters';
import {
  JobsLoadingSkeleton,
  JobsFirstRunEmptyState,
  JobsFilteredEmptyState,
  JobsPartialFailureNotice,
  JobsOfflineBanner,
  JobsNewJobNotice,
} from './JobsEmptyStates';
import {
  JobsSidebar,
  JobsMobileBottomNav,
  JobsNoticeDialog,
} from './JobsNavigation';

export default function JobsScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Auth & customer state
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Filter & selection state
  const [activeFilter, setActiveFilter] = useState<ActivityFilterView>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);

  // Recovery overrides
  const [partialFailureCleared, setPartialFailureCleared] = useState(false);

  // Notice dialog for future capability placeholders
  const [activeNoticeDialog, setActiveNoticeDialog] = useState<'messages' | 'notifications' | null>(null);

  // Check authentication on mount
  useEffect(() => {
    const user = getMockAuthenticatedUser();
    setCurrentUser(user);
    setAuthChecked(true);
  }, []);

  // Sync URL query params on mount & searchParams changes
  useEffect(() => {
    const viewParam = searchParams.get('view');
    setActiveFilter(normalizeFilterView(viewParam));

    const idParam = searchParams.get('id');
    if (idParam) {
      setSelectedId(idParam);
      setMobileDetailOpen(true);
    }
  }, [searchParams]);

  // Compute view model
  const viewModel: CustomerActivityViewModel = useMemo(() => {
    const preservedJob = getPreservedJobDraft();
    const vm = resolveJobsContext(searchParams, currentUser, preservedJob);

    // Filter view override if local state changed
    let activities = vm.activities;
    if (activeFilter === 'active') {
      activities = vm.activeActivities;
    } else if (activeFilter === 'upcoming') {
      activities = vm.upcomingActivities;
    } else if (activeFilter === 'past') {
      activities = vm.pastActivities;
    } else {
      activities = vm.allActivities;
    }

    // Apply client-side manual recovery overrides
    if (partialFailureCleared && vm.hasPartialFailure) {
      const restoredActive = MOCK_CUSTOMER_ACTIVITIES.filter(
        (a) =>
          a.status === 'in_progress' ||
          a.status === 'awaiting_progress' ||
          a.status === 'request_received'
      );
      const restoredAll = [...restoredActive, ...vm.upcomingActivities, ...vm.pastActivities];
      return {
        ...vm,
        currentFilter: activeFilter,
        activities: activeFilter === 'active' ? restoredActive : restoredAll,
        allActivities: restoredAll,
        activeActivities: restoredActive,
        totalCount: restoredAll.length,
        hasPartialFailure: false,
        failedSection: undefined,
      };
    }

    return {
      ...vm,
      currentFilter: activeFilter,
      activities,
    };
  }, [searchParams, currentUser, activeFilter, partialFailureCleared]);

  // Auto-select first activity if none selected and on desktop
  const activeSelectedActivity = useMemo(() => {
    if (selectedId) {
      return (
        viewModel.activities.find((a) => a.id === selectedId) ||
        viewModel.allActivities.find((a) => a.id === selectedId)
      );
    }
    return viewModel.activities[0] || viewModel.allActivities[0];
  }, [selectedId, viewModel.activities, viewModel.allActivities]);

  // Navigation handlers
  const handleFilterChange = useCallback(
    (newFilter: ActivityFilterView) => {
      setActiveFilter(newFilter);
      const params = new URLSearchParams(searchParams.toString());
      if (newFilter === 'all') {
        params.delete('view');
      } else {
        params.set('view', newFilter);
      }
      router.push(`/jobs?${params.toString()}`);
    },
    [router, searchParams]
  );

  const handleSelectActivity = useCallback(
    (id: string) => {
      setSelectedId(id);
      setMobileDetailOpen(true);
      const params = new URLSearchParams(searchParams.toString());
      params.set('id', id);
      router.push(`/jobs?${params.toString()}`);
    },
    [router, searchParams]
  );

  const handleCloseMobileDetail = useCallback(() => {
    setMobileDetailOpen(false);
  }, []);

  const handleSignOut = useCallback(() => {
    setMockAuthenticatedUser(null);
    setCurrentUser(null);
    router.push('/login');
  }, [router]);

  // 1. Unauthenticated state check
  if (authChecked && !currentUser && viewModel.stateMode !== 'auth_failure') {
    return (
      <div className="min-h-screen bg-[#F8F9FF] flex items-center justify-center p-6 text-slate-800 font-sans">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-slate-200 shadow-xs text-center">
          <div className="mx-auto w-14 h-14 rounded-full bg-blue-50 text-[#001A41] flex items-center justify-center mb-5">
            <Briefcase className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold font-display text-[#001A41] mb-2">
            Sign in to view your activity
          </h1>
          <p className="text-slate-600 text-sm mb-6">
            Please sign in to access your BukieBrainJobs service requests, active bookings, and scheduled work.
          </p>
          <div className="space-y-3">
            <Link
              href="/login?redirect=/jobs"
              className="w-full inline-flex items-center justify-center px-5 py-3 rounded-xl bg-[#001A41] text-white font-medium hover:bg-[#002661] transition"
            >
              Sign In
            </Link>
            <Link
              href="/"
              className="w-full inline-flex items-center justify-center px-5 py-3 rounded-xl bg-slate-100 text-slate-700 font-medium hover:bg-slate-200 transition"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 2. Full failure state
  if (viewModel.stateMode === 'auth_failure') {
    return (
      <div className="min-h-screen bg-[#F8F9FF] flex items-center justify-center p-6 text-slate-800 font-sans">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-rose-200 shadow-xs text-center">
          <div className="mx-auto w-14 h-14 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mb-5">
            <AlertTriangle className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold font-display text-rose-950 mb-2">
            We could not load your activity
          </h1>
          <p className="text-slate-600 text-sm mb-6">
            There was a connection issue loading your current jobs and bookings. Please refresh or retry.
          </p>
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#001A41] text-white font-medium hover:bg-[#002661] transition cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Retry</span>
            </button>
            <Link
              href="/dashboard"
              className="w-full inline-flex items-center justify-center px-5 py-3 rounded-xl bg-slate-100 text-slate-700 font-medium hover:bg-slate-200 transition"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. Main Authenticated Surface
  return (
    <div className="min-h-screen bg-[#F8F9FF] text-slate-800 font-sans pb-24 lg:pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 lg:flex lg:gap-8">
        {/* Desktop Authenticated Sidebar */}
        <JobsSidebar
          customer={viewModel.customer}
          onSignOut={handleSignOut}
          onOpenNoticeDialog={setActiveNoticeDialog}
        />

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0">
          {/* Page Heading */}
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-[#001A41]">
              Jobs & Bookings
            </h1>
            <p className="text-slate-600 text-sm mt-1">
              Keep track of your service requests, bookings, and activity in one place.
            </p>
          </div>

          {/* Offline Banner */}
          {viewModel.isOffline && <JobsOfflineBanner />}

          {/* New Job Notification Notice */}
          {viewModel.newJobNotice && (
            <JobsNewJobNotice notice={viewModel.newJobNotice} />
          )}

          {/* Partial Failure Sync Issue Notice */}
          {viewModel.hasPartialFailure && (
            <JobsPartialFailureNotice
              onRetry={() => setPartialFailureCleared(true)}
            />
          )}

          {/* Activity Filter Bar with Stable Tab Counts */}
          <ActivityFilters
            activeFilter={activeFilter}
            onFilterChange={handleFilterChange}
            counts={{
              all: viewModel.totalCount,
              active: viewModel.activeActivities.length,
              upcoming: viewModel.upcomingActivities.length,
              past: viewModel.pastActivities.length,
            }}
          />

          {/* Loading Skeleton */}
          {viewModel.stateMode === 'loading' && <JobsLoadingSkeleton />}

          {/* First-Run Empty State */}
          {viewModel.stateMode === 'first_run' && <JobsFirstRunEmptyState />}

          {/* Filtered Empty State */}
          {viewModel.stateMode !== 'first_run' &&
            viewModel.stateMode !== 'loading' &&
            viewModel.activities.length === 0 && (
              <JobsFilteredEmptyState
                filter={activeFilter}
                onResetFilter={() => handleFilterChange('all')}
              />
            )}

          {/* Master-Detail 12-Column Layout */}
          {viewModel.stateMode !== 'loading' &&
            viewModel.stateMode !== 'first_run' &&
            viewModel.activities.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Master List (5 columns on desktop) */}
                <div
                  className="lg:col-span-5 space-y-3"
                  role="feed"
                  aria-label="Activity list"
                >
                  {viewModel.activities.map((activity) => (
                    <ActivityCard
                      key={activity.id}
                      activity={activity}
                      isSelected={activeSelectedActivity?.id === activity.id}
                      onSelect={() => handleSelectActivity(activity.id)}
                    />
                  ))}
                </div>

                {/* Detail Pane (7 columns on desktop, full-screen on mobile) */}
                <ActivityDetail
                  activity={activeSelectedActivity}
                  requestedId={selectedId}
                  isMobileOpen={mobileDetailOpen}
                  onCloseMobile={handleCloseMobileDetail}
                  onResetSelected={() => {
                    setSelectedId(null);
                    router.push('/jobs');
                  }}
                />
              </div>
            )}
        </main>
      </div>

      {/* Mobile Persistent Bottom Navigation */}
      <JobsMobileBottomNav onOpenNoticeDialog={setActiveNoticeDialog} />

      {/* Capability Notice Dialog */}
      <JobsNoticeDialog
        dialog={activeNoticeDialog}
        onClose={() => setActiveNoticeDialog(null)}
      />
    </div>
  );
}

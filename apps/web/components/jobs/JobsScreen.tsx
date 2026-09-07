'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Home,
  Briefcase,
  MessageSquare,
  Bell,
  User,
  Search,
  PlusCircle,
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  WifiOff,
  LogOut,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  X,
  FileText,
  Tag,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import {
  CustomerActivityItem,
  CustomerActivityViewModel,
  ActivityFilterView,
  CustomerActivityStatus,
  CustomerActivityType,
} from '@bukiebrainjobs/types';
import {
  getMockAuthenticatedUser,
  setMockAuthenticatedUser,
  getPreservedJobDraft,
} from '../../lib/auth/storage';
import { AuthUser } from '../../lib/auth/types';
import {
  resolveJobsContext,
  MOCK_CUSTOMER_ACTIVITIES,
  normalizeFilterView,
} from '../../lib/jobs';

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
      activities = [...vm.activeActivities, ...vm.upcomingActivities, ...vm.pastActivities];
    }

    // Apply client-side manual recovery overrides
    if (partialFailureCleared && vm.hasPartialFailure) {
      const restoredActive = MOCK_CUSTOMER_ACTIVITIES.filter(
        (a) =>
          a.status === 'in_progress' ||
          a.status === 'awaiting_progress' ||
          a.status === 'request_received'
      );
      return {
        ...vm,
        currentFilter: activeFilter,
        activities: activeFilter === 'active' ? restoredActive : [...restoredActive, ...vm.upcomingActivities, ...vm.pastActivities],
        activeActivities: restoredActive,
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
        viewModel.activeActivities.find((a) => a.id === selectedId) ||
        viewModel.upcomingActivities.find((a) => a.id === selectedId) ||
        viewModel.pastActivities.find((a) => a.id === selectedId)
      );
    }
    return viewModel.activities[0] || undefined;
  }, [selectedId, viewModel]);

  // Handlers
  const handleFilterChange = (filter: ActivityFilterView) => {
    setActiveFilter(filter);
    if (filter === 'all') {
      router.push('/jobs');
    } else {
      router.push(`/jobs?view=${filter}`);
    }
  };

  const handleSelectActivity = (activity: CustomerActivityItem) => {
    setSelectedId(activity.id);
    setMobileDetailOpen(true);
    const viewQuery = activeFilter !== 'all' ? `view=${activeFilter}&` : '';
    router.push(`/jobs?${viewQuery}id=${activity.id}`);
  };

  const handleCloseMobileDetail = () => {
    setMobileDetailOpen(false);
    setSelectedId(null);
    if (activeFilter === 'all') {
      router.push('/jobs');
    } else {
      router.push(`/jobs?view=${activeFilter}`);
    }
  };

  const handleSignOut = () => {
    setMockAuthenticatedUser(null);
    setCurrentUser(null);
    router.push('/login');
  };

  const handleRetryActive = () => {
    setPartialFailureCleared(true);
  };

  const closeDialog = useCallback(() => {
    setActiveNoticeDialog(null);
  }, []);

  // Handle Escape key for modal
  useEffect(() => {
    if (!activeNoticeDialog) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeDialog();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeNoticeDialog, closeDialog]);

  // Type styling helper
  const renderTypeBadge = (type: CustomerActivityType) => {
    if (type === 'job_request') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
          <FileText className="h-3 w-3 text-slate-500" />
          JOB REQUEST
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-[#001A41] border border-indigo-200">
        <Briefcase className="h-3 w-3 text-indigo-500" />
        BOOKING
      </span>
    );
  };

  // Status styling helper
  const renderStatusBadge = (status: CustomerActivityStatus, label: string) => {
    switch (status) {
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
            {label}
          </span>
        );
      case 'scheduled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
            <Calendar className="h-3 w-3 text-emerald-600" />
            {label}
          </span>
        );
      case 'awaiting_progress':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-800 border border-blue-200">
            <Clock className="h-3 w-3 text-blue-600" />
            {label}
          </span>
        );
      case 'request_received':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-50 text-teal-800 border border-teal-200">
            <CheckCircle2 className="h-3 w-3 text-teal-600" />
            {label}
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-900 border border-emerald-300">
            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
            {label}
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
            <X className="h-3 w-3 text-slate-400" />
            {label}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
            {label}
          </span>
        );
    }
  };

  // 1. Unauthenticated state check
  if (authChecked && !currentUser && viewModel.stateMode !== 'auth_failure') {
    return (
      <div className="min-h-screen bg-[#F8F9FF] flex items-center justify-center p-6 text-slate-800 font-sans">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-slate-200 shadow-sm text-center">
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
  const isFullFailure = searchParams.get('state') === 'full_failure';
  if (isFullFailure) {
    return (
      <div className="min-h-screen bg-[#F8F9FF] flex items-center justify-center p-6 text-slate-800 font-sans">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-red-100 shadow-sm text-center">
          <div className="mx-auto w-14 h-14 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-5">
            <AlertTriangle className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold font-display text-[#001A41] mb-2">
            We could not load your activity
          </h1>
          <p className="text-slate-600 text-sm mb-6">
            An unexpected error occurred while loading your jobs and bookings. Please retry or return to the dashboard.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => router.push('/jobs')}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#001A41] text-white font-medium hover:bg-[#002661] transition"
            >
              <RotateCcw className="h-4 w-4" />
              Retry
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

  // Main UI
  return (
    <div className="min-h-screen bg-[#F8F9FF] text-slate-800 font-sans flex flex-col pb-20 md:pb-0">
      {/* Offline Banner */}
      {viewModel.isOffline && (
        <div
          role="status"
          className="bg-slate-900 text-white px-4 py-2.5 text-xs sm:text-sm font-medium flex items-center justify-center gap-2 shadow-sm border-b border-slate-700"
        >
          <WifiOff className="h-4 w-4 text-amber-400" />
          <span>Offline Mode: Showing cached activity. Online refresh unavailable.</span>
        </div>
      )}

      {/* Partial Failure Notice */}
      {viewModel.hasPartialFailure && (
        <div
          role="alert"
          className="bg-amber-50 text-amber-900 border-b border-amber-200 px-4 py-3 text-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
        >
          <div className="flex items-center gap-2.5">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
            <div>
              <span className="font-semibold">Could not refresh active work.</span> Showing saved offline context.
            </div>
          </div>
          <button
            onClick={handleRetryActive}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-200 hover:bg-amber-300 text-amber-900 transition"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Retry active work
          </button>
        </div>
      )}

      {/* Top Header / Nav */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ABEEC8] rounded-lg">
              <Image
                src="/images/logo-badge-512.png"
                alt="BukieBrainJobs"
                width={32}
                height={32}
                className="h-8 w-8 object-contain"
                priority
              />
              <span className="text-xl font-bold font-display tracking-tight text-[#001A41]">
                Bukie<span className="text-[#296A4B]">BrainJobs</span>
              </span>
            </Link>
            <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>Customer Activity</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Dashboard
            </Link>
            <Link
              href="/post-job"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-[#001A41] hover:bg-[#002661] px-3 py-1.5 rounded-lg transition shadow-sm"
            >
              <PlusCircle className="h-3.5 w-3.5 text-[#ABEEC8]" />
              <span>Post a Job</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1 flex flex-col md:flex-row gap-6">
        {/* Desktop Sidebar Navigation */}
        <aside
          role="navigation"
          aria-label="Desktop Sidebar"
          className="hidden md:flex flex-col w-56 shrink-0 space-y-6"
        >
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-1">
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition"
            >
              <Home className="h-4 w-4 text-slate-400" />
              <span>Home</span>
            </button>

            <button
              aria-current="page"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold bg-[#001A41] text-white shadow-sm transition"
            >
              <Briefcase className="h-4 w-4 text-[#ABEEC8]" />
              <span>Jobs / Bookings</span>
            </button>

            <button
              onClick={() => setActiveNoticeDialog('messages')}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition"
            >
              <MessageSquare className="h-4 w-4 text-slate-400" />
              <span>Messages</span>
            </button>

            <button
              onClick={() => setActiveNoticeDialog('notifications')}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition"
            >
              <Bell className="h-4 w-4 text-slate-400" />
              <span>Notifications</span>
            </button>

            <button
              onClick={() => router.push('/dashboard?tab=profile')}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition"
            >
              <User className="h-4 w-4 text-slate-400" />
              <span>Profile</span>
            </button>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block px-1">
              Marketplace
            </span>
            <Link
              href="/services"
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 transition"
            >
              <Search className="h-3.5 w-3.5 text-slate-500" />
              <span>Find a Service</span>
            </Link>
            <Link
              href="/post-job"
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 transition"
            >
              <PlusCircle className="h-3.5 w-3.5 text-slate-500" />
              <span>Post a Job</span>
            </Link>
          </div>

          {/* Customer info & Sign out */}
          <div className="mt-auto bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
            <div className="truncate pr-2">
              <div className="text-xs font-bold text-slate-800 truncate">
                {viewModel.customer.name}
              </div>
              <div className="text-[11px] text-slate-500 capitalize">
                {viewModel.customer.role} Account
              </div>
            </div>
            <button
              onClick={handleSignOut}
              title="Sign Out"
              aria-label="Sign Out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </aside>

        {/* Content Area */}
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

          {/* Filter Bar */}
          <nav
            role="navigation"
            aria-label="Activity Filters"
            className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 border-b border-slate-200 scrollbar-none"
          >
            {(['all', 'active', 'upcoming', 'past'] as ActivityFilterView[]).map((filter) => {
              const isActive = activeFilter === filter;
              let count = 0;
              if (filter === 'all') count = viewModel.activities.length;
              if (filter === 'active') count = viewModel.activeActivities.length;
              if (filter === 'upcoming') count = viewModel.upcomingActivities.length;
              if (filter === 'past') count = viewModel.pastActivities.length;

              return (
                <button
                  key={filter}
                  onClick={() => handleFilterChange(filter)}
                  aria-pressed={isActive}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition shrink-0 ${
                    isActive
                      ? 'bg-[#001A41] text-white shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <span className="capitalize">{filter}</span>
                  <span
                    className={`text-[11px] px-1.5 py-0.5 rounded-full ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </nav>

          {/* New Job Notification Notice */}
          {viewModel.newJobNotice && (
            <div className="mb-6 bg-teal-50 border border-teal-200 rounded-xl p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-teal-600 shrink-0" />
                <div className="text-xs sm:text-sm text-teal-900">
                  <span className="font-bold">New Request Submitted:</span> {viewModel.newJobNotice.title} ({viewModel.newJobNotice.reference}) is now tracked in your active work.
                </div>
              </div>
              <Link
                href={`/post-job?reference=${viewModel.newJobNotice.reference}`}
                className="text-xs font-bold text-teal-800 hover:text-teal-950 underline shrink-0"
              >
                View Request
              </Link>
            </div>
          )}

          {/* Loading Skeleton */}
          {viewModel.stateMode === 'loading' && (
            <div role="region" aria-label="Loading activities" className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl p-5 border border-slate-200 animate-pulse flex flex-col gap-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="h-4 w-24 bg-slate-200 rounded" />
                    <div className="h-4 w-20 bg-slate-200 rounded" />
                  </div>
                  <div className="h-5 w-2/3 bg-slate-200 rounded" />
                  <div className="h-4 w-1/2 bg-slate-200 rounded" />
                </div>
              ))}
            </div>
          )}

          {/* First-Run Empty State */}
          {viewModel.stateMode === 'first_run' && (
            <div className="bg-white rounded-2xl p-10 border border-slate-200 shadow-sm text-center my-auto">
              <div className="mx-auto w-16 h-16 rounded-full bg-slate-50 border border-slate-200 text-[#001A41] flex items-center justify-center mb-4">
                <Briefcase className="h-8 w-8 text-slate-400" />
              </div>
              <h2 className="text-xl font-bold font-display text-[#001A41] mb-2">
                Your activity will appear here
              </h2>
              <p className="text-slate-600 text-sm max-w-md mx-auto mb-6">
                When you request a service or schedule a booking with a verified BrainWorker, your ongoing work and history will be organized here.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/services"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#001A41] text-white text-sm font-semibold hover:bg-[#002661] transition"
                >
                  <Search className="h-4 w-4 text-[#ABEEC8]" />
                  Find a Service
                </Link>
                <Link
                  href="/post-job"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-sm font-semibold hover:bg-slate-200 transition"
                >
                  <PlusCircle className="h-4 w-4 text-slate-500" />
                  Post a Job
                </Link>
              </div>
            </div>
          )}

          {/* Filtered Empty State */}
          {viewModel.stateMode !== 'first_run' &&
            viewModel.stateMode !== 'loading' &&
            viewModel.activities.length === 0 && (
              <div className="bg-white rounded-2xl p-10 border border-slate-200 shadow-sm text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center mb-3">
                  <Calendar className="h-6 w-6" />
                </div>
                <h2 className="text-lg font-bold font-display text-[#001A41] mb-1">
                  {activeFilter === 'upcoming'
                    ? 'No upcoming activity yet'
                    : activeFilter === 'active'
                    ? 'No active work right now'
                    : activeFilter === 'past'
                    ? 'No past activity recorded'
                    : 'No activities found'}
                </h2>
                <p className="text-slate-500 text-xs sm:text-sm max-w-sm mx-auto mb-5">
                  {activeFilter === 'upcoming'
                    ? 'You do not have any scheduled appointments or bookings in your calendar.'
                    : 'Explore vetted Nigerian services or post a custom job request to get started.'}
                </p>
                <div className="flex items-center justify-center gap-3">
                  <Link
                    href="/services"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#001A41] text-white text-xs font-semibold hover:bg-[#002661] transition"
                  >
                    Find a Service
                  </Link>
                </div>
              </div>
            )}

          {/* Master-Detail Layout (Desktop) & List (Mobile) */}
          {viewModel.stateMode !== 'first_run' &&
            viewModel.stateMode !== 'loading' &&
            viewModel.activities.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Master Activity List (5 columns on desktop) */}
                <div
                  className={`lg:col-span-5 space-y-3 ${
                    mobileDetailOpen ? 'hidden lg:block' : 'block'
                  }`}
                  role="region"
                  aria-label="Activity List"
                >
                  {viewModel.activities.map((activity) => {
                    const isSelected = activeSelectedActivity?.id === activity.id;
                    return (
                      <button
                        key={activity.id}
                        type="button"
                        onClick={() => handleSelectActivity(activity)}
                        aria-label={`Select ${activity.title}`}
                        className={`w-full text-left bg-white rounded-2xl p-4 border transition duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ABEEC8] ${
                          isSelected
                            ? 'border-[#001A41] ring-1 ring-[#001A41] shadow-sm bg-slate-50/50'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/30'
                        }`}
                      >
                        {/* Type and Status */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          {renderTypeBadge(activity.type)}
                          {renderStatusBadge(activity.status, activity.statusLabel)}
                        </div>

                        {/* Title */}
                        <h3 className="text-sm sm:text-base font-bold font-display text-[#001A41] line-clamp-1 mb-2">
                          {activity.title}
                        </h3>

                        {/* Metadata */}
                        <div className="space-y-1 text-xs text-slate-500">
                          <div className="flex items-center gap-1.5 truncate">
                            <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{activity.location}</span>
                          </div>
                          <div className="flex items-center gap-1.5 truncate">
                            <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{activity.schedule}</span>
                          </div>
                        </div>

                        {/* Footer info: Budget & Action */}
                        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                          {activity.budgetOrPrice ? (
                            <span className="font-semibold text-slate-700 truncate">
                              {activity.budgetOrPrice}
                            </span>
                          ) : (
                            <span className="text-slate-400">Ref: {activity.referenceCode}</span>
                          )}
                          <span className="text-[#001A41] font-bold inline-flex items-center gap-1">
                            Details <ArrowRight className="h-3 w-3" />
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Detail Pane (7 columns on desktop, full-screen overlay/modal on mobile) */}
                <div
                  className={`lg:col-span-7 ${
                    mobileDetailOpen
                      ? 'fixed inset-0 z-50 bg-[#F8F9FF] p-4 sm:p-6 overflow-y-auto lg:static lg:p-0 lg:z-auto'
                      : 'hidden lg:block'
                  }`}
                  role="region"
                  aria-label="Activity Detail"
                >
                  {activeSelectedActivity ? (
                    <div className="relative bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm overflow-hidden">
                      {/* Decorative Watermark: Subtle brand signature at 3.5% opacity */}
                      <Image
                        src="/images/logo-badge-512.png"
                        alt=""
                        aria-hidden="true"
                        width={280}
                        height={280}
                        className="pointer-events-none select-none absolute right-2 bottom-2 opacity-[0.035] -z-0"
                      />

                      {/* Mobile Sticky Back Header with >=48px Touch Target */}
                      <div className="lg:hidden flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                        <button
                          type="button"
                          onClick={handleCloseMobileDetail}
                          aria-label="Back to activity list"
                          className="min-h-[48px] min-w-[48px] -ml-2 px-3 py-2 inline-flex items-center gap-2 rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200 font-semibold text-xs transition"
                        >
                          <ArrowLeft className="h-4 w-4" />
                          <span>Back to list</span>
                        </button>
                        <span className="text-xs font-mono text-slate-400">
                          {activeSelectedActivity.referenceCode}
                        </span>
                      </div>

                      {/* Header info */}
                      <div className="relative z-10 space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            {renderTypeBadge(activeSelectedActivity.type)}
                            {renderStatusBadge(
                              activeSelectedActivity.status,
                              activeSelectedActivity.statusLabel
                            )}
                          </div>
                          <span className="text-xs font-mono text-slate-400 hidden lg:inline">
                            Ref: {activeSelectedActivity.referenceCode}
                          </span>
                        </div>

                        <h2 className="text-xl sm:text-2xl font-bold font-display text-[#001A41]">
                          {activeSelectedActivity.title}
                        </h2>

                        {/* Primary Information Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100">
                            <span className="text-xs text-slate-400 block mb-1">Service & Category</span>
                            <div className="text-xs sm:text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                              <Tag className="h-3.5 w-3.5 text-slate-500" />
                              <span>{activeSelectedActivity.service ?? 'General Request'}</span>
                            </div>
                          </div>

                          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100">
                            <span className="text-xs text-slate-400 block mb-1">Schedule</span>
                            <div className="text-xs sm:text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5 text-slate-500" />
                              <span>{activeSelectedActivity.schedule}</span>
                            </div>
                          </div>

                          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100">
                            <span className="text-xs text-slate-400 block mb-1">Location</span>
                            <div className="text-xs sm:text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                              <MapPin className="h-3.5 w-3.5 text-slate-500" />
                              <span>{activeSelectedActivity.location}</span>
                            </div>
                          </div>

                          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100">
                            <span className="text-xs text-slate-400 block mb-1">Budget / Price</span>
                            <div className="text-xs sm:text-sm font-semibold text-slate-800">
                              {activeSelectedActivity.budgetOrPrice ?? 'Negotiable'}
                            </div>
                          </div>
                        </div>

                        {/* Description */}
                        {activeSelectedActivity.description && (
                          <div className="pt-2">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                              Customer Description
                            </h3>
                            <div className="text-xs sm:text-sm text-slate-700 bg-slate-50/70 p-4 rounded-xl border border-slate-100 leading-relaxed whitespace-pre-wrap">
                              {activeSelectedActivity.description}
                            </div>
                          </div>
                        )}

                        {/* Preferred BrainWorker */}
                        {activeSelectedActivity.preferredWorker && (
                          <div className="bg-emerald-50/60 rounded-xl p-4 border border-emerald-100 space-y-1.5">
                            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-900">
                              <ShieldCheck className="h-4 w-4 text-emerald-600" />
                              <span>Preferred BrainWorker: {activeSelectedActivity.preferredWorker.name}</span>
                            </div>
                            <p className="text-[11px] text-emerald-800">
                              Customer preference only. BrainWorker assignment is finalized upon schedule acceptance.
                            </p>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                          {activeSelectedActivity.nextAction ? (
                            <Link
                              href={activeSelectedActivity.nextAction.url}
                              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#001A41] text-white text-xs sm:text-sm font-semibold hover:bg-[#002661] transition"
                            >
                              <span>{activeSelectedActivity.nextAction.label}</span>
                              <ExternalLink className="h-3.5 w-3.5" />
                            </Link>
                          ) : (
                            <div />
                          )}

                          <Link
                            href="/dashboard"
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 px-3 py-2 transition"
                          >
                            <span>Return to Dashboard</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Deep Link Not Found State */
                    <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center">
                      <AlertCircle className="h-10 w-10 text-amber-500 mx-auto mb-3" />
                      <h3 className="text-lg font-bold font-display text-[#001A41] mb-1">
                        Activity not found
                      </h3>
                      <p className="text-xs text-slate-500 max-w-xs mx-auto mb-4">
                        The requested activity identifier ({searchParams.get('id')}) was not found in your account history.
                      </p>
                      <button
                        onClick={() => {
                          setSelectedId(null);
                          router.push('/jobs');
                        }}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#001A41] text-white text-xs font-semibold hover:bg-[#002661] transition"
                      >
                        Show all activity
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
        </main>
      </div>

      {/* Mobile Bottom Navigation (Persistent on mobile/PWA for authenticated customers) */}
      <nav
        role="navigation"
        aria-label="Mobile Bottom Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#001A41] border-t border-slate-800 px-2 py-1 shadow-lg"
      >
        <div className="grid grid-cols-5 items-center justify-items-center">
          <button
            onClick={() => router.push('/dashboard')}
            className="min-h-[48px] min-w-[48px] flex flex-col items-center justify-center text-[10px] font-medium text-slate-400 hover:text-white transition"
          >
            <Home className="h-5 w-5 mb-0.5" />
            <span>Home</span>
          </button>

          <button
            aria-current="page"
            className="min-h-[48px] min-w-[48px] flex flex-col items-center justify-center text-[10px] font-semibold text-[#ABEEC8] transition"
          >
            <Briefcase className="h-5 w-5 mb-0.5" />
            <span>Jobs</span>
          </button>

          <button
            onClick={() => setActiveNoticeDialog('messages')}
            className="min-h-[48px] min-w-[48px] flex flex-col items-center justify-center text-[10px] font-medium text-slate-400 hover:text-white transition"
          >
            <MessageSquare className="h-5 w-5 mb-0.5" />
            <span>Messages</span>
          </button>

          <button
            onClick={() => setActiveNoticeDialog('notifications')}
            className="min-h-[48px] min-w-[48px] flex flex-col items-center justify-center text-[10px] font-medium text-slate-400 hover:text-white transition"
          >
            <Bell className="h-5 w-5 mb-0.5" />
            <span>Alerts</span>
          </button>

          <button
            onClick={() => router.push('/dashboard?tab=profile')}
            className="min-h-[48px] min-w-[48px] flex flex-col items-center justify-center text-[10px] font-medium text-slate-400 hover:text-white transition"
          >
            <User className="h-5 w-5 mb-0.5" />
            <span>Profile</span>
          </button>
        </div>
      </nav>

      {/* Capability Notice Dialog */}
      {activeNoticeDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="dialog-heading"
            className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-200 relative text-center"
          >
            <button
              onClick={closeDialog}
              aria-label="Close dialog"
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="mx-auto w-12 h-12 rounded-full bg-blue-50 text-[#001A41] flex items-center justify-center mb-3">
              {activeNoticeDialog === 'messages' ? (
                <MessageSquare className="h-6 w-6" />
              ) : (
                <Bell className="h-6 w-6" />
              )}
            </div>
            <h3 id="dialog-heading" className="text-lg font-bold font-display text-[#001A41] mb-2">
              {activeNoticeDialog === 'messages'
                ? 'Messages Coming Soon'
                : 'Notifications Coming Soon'}
            </h3>
            <p className="text-slate-600 text-xs sm:text-sm mb-6 leading-relaxed">
              {activeNoticeDialog === 'messages'
                ? 'Real-time in-app messaging between customers and BrainWorkers is planned for an upcoming milestone.'
                : 'Direct in-app notification center and push alerts are being configured for a future release.'}
            </p>
            <button
              onClick={closeDialog}
              className="w-full py-2.5 px-4 rounded-xl bg-[#001A41] text-white text-xs font-semibold hover:bg-[#002661] transition"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

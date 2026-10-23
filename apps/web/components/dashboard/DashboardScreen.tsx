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
  Clock,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  WifiOff,
  LogOut,
  ShieldCheck,
  ArrowRight,
  RotateCcw,
  X,
  ChevronRight,
  Info,
} from 'lucide-react';
import ThemeToggle from '../ThemeToggle';
import {
  DashboardViewModel,
  getRoleDisplayLabel,
} from '@bukiebrainjobs/types';
import { getMockAuthenticatedUser, setMockAuthenticatedUser, getPreservedJobDraft } from '../../lib/auth/storage';
import { AuthUser } from '../../lib/auth/types';
import { resolveDashboardContext, MOCK_ACTIVE_WORK } from '../../lib/dashboard';

type DashboardTab = 'home' | 'jobs' | 'messages' | 'notifications' | 'profile';

export default function DashboardScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Auth & user state
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [activeTab, setActiveTab] = useState<DashboardTab>('home');
  const [partialFailureCleared, setPartialFailureCleared] = useState(false);
  const [isOfflineManual, setIsOfflineManual] = useState(false);

  // Dialog state for future capability placeholders
  const [activeNoticeDialog, setActiveNoticeDialog] = useState<'messages' | null>(null);

  // Check authentication on mount
  useEffect(() => {
    const user = getMockAuthenticatedUser();
    setCurrentUser(user);
    setAuthChecked(true);
  }, []);

  // Listen for tab query param if provided
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'profile') {
      if (typeof router.replace === 'function') {
        router.replace('/profile');
      } else if (typeof router.push === 'function') {
        router.push('/profile');
      }
      return;
    }
    if (tabParam === 'notifications') {
      router.push('/notifications');
      return;
    }
    if (tabParam === 'jobs' || tabParam === 'messages') {
      setActiveTab(tabParam as DashboardTab);
    }
  }, [searchParams, router]);

  // Compute view model from context
  const viewModel: DashboardViewModel = useMemo(() => {
    const preservedJob = getPreservedJobDraft();
    const vm = resolveDashboardContext(searchParams, currentUser, preservedJob);

    // Apply client-side manual recovery overrides
    if (partialFailureCleared && vm.hasPartialFailure) {
      return {
        ...vm,
        hasPartialFailure: false,
        failedSection: undefined,
        activeWork: [...MOCK_ACTIVE_WORK],
      };
    }

    if (isOfflineManual) {
      return {
        ...vm,
        isOffline: true,
      };
    }

    return vm;
  }, [searchParams, currentUser, partialFailureCleared, isOfflineManual]);

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

  // Handle unauthenticated state
  if (authChecked && !currentUser && viewModel.stateMode !== 'auth_failure') {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-6 text-[var(--text-main)] font-sans">
        <div className="max-w-md w-full bg-[var(--card-bg)] rounded-lg p-8 border border-[var(--lead)] shadow-xs text-center">
          <div className="h-14 w-14 mx-auto rounded-lg bg-[var(--tag-bg)] border border-[var(--lead)] flex items-center justify-center text-[var(--amber)] mb-4">
            <User className="h-7 w-7" />
          </div>
          <h1 className="text-xl font-bold font-display tracking-trades uppercase text-[var(--text-main)] mb-2">Authentication required</h1>
          <p className="text-sm text-[var(--text-muted)] mb-6 leading-relaxed">
            Please sign in to access your customer dashboard and manage your service requests.
          </p>
          <Link
            href="/login?returnUrl=%2Fdashboard"
            className="inline-flex items-center justify-center w-full px-5 py-3 rounded-lg bg-[var(--amber)] text-white font-semibold text-sm hover:bg-[var(--amber-hover)] transition-colors shadow-xs"
          >
            Sign In Now
          </Link>
        </div>
      </div>
    );
  }

  // Handle loading state
  if (viewModel.stateMode === 'loading') {
    return (
      <div
        role="status"
        aria-label="Loading dashboard content"
        aria-busy="true"
        className="min-h-screen bg-[var(--bg)] font-sans p-6 text-[var(--text-main)]"
      >
        <div className="max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar Skeleton */}
          <div className="hidden lg:block lg:col-span-3 bg-[var(--card-bg)] rounded-lg p-6 border border-[var(--lead)] h-[600px] animate-pulse shadow-xs">
            <div className="h-8 bg-[var(--lead)] rounded w-3/4 mb-8" />
            <div className="h-12 bg-[var(--tag-bg)] rounded-lg mb-4" />
            <div className="space-y-3">
              <div className="h-10 bg-[var(--tag-bg)] rounded-lg" />
              <div className="h-10 bg-[var(--tag-bg)] rounded-lg" />
              <div className="h-10 bg-[var(--tag-bg)] rounded-lg" />
            </div>
          </div>
          {/* Content Skeleton */}
          <div className="lg:col-span-9 space-y-6">
            <div className="bg-[var(--card-bg)] rounded-lg p-6 border border-[var(--lead)] animate-pulse h-28 shadow-xs" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-[var(--card-bg)] rounded-lg p-6 border border-[var(--lead)] animate-pulse h-36 shadow-xs" />
              <div className="bg-[var(--card-bg)] rounded-lg p-6 border border-[var(--lead)] animate-pulse h-36 shadow-xs" />
            </div>
            <div className="bg-[var(--card-bg)] rounded-lg p-6 border border-[var(--lead)] animate-pulse h-48 shadow-xs" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-main)] font-sans pb-24 lg:pb-12 transition-colors duration-200">
      {/* 1. Offline or Degraded Banner */}
      {viewModel.isOffline && (
        <div className="bg-[var(--amber-dim)] text-[var(--text-main)] px-4 py-2.5 text-sm font-semibold flex items-center justify-between border-b border-[var(--amber)]">
          <div className="max-w-[1280px] mx-auto w-full flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <WifiOff className="h-4 w-4 text-[var(--amber)] shrink-0" />
              <span>Offline Mode: Showing cached dashboard activity. Live updates will resume when reconnected.</span>
            </div>
            <button
              onClick={() => setIsOfflineManual(false)}
              className="px-3 py-1 bg-[var(--amber)] text-white text-xs rounded-lg font-semibold hover:bg-[var(--amber-hover)] transition-colors shadow-xs"
            >
              Refresh Status
            </button>
          </div>
        </div>
      )}

      {/* 2. Top Header Container */}
      <header className="bg-[var(--card-bg)] text-[var(--text-main)] border-b border-[var(--lead)] sticky top-0 z-30 shadow-xs">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <Image
                src="/images/logo-icon.png"
                alt="BukieBrainJobs"
                width={36}
                height={36}
                className="h-9 w-9 object-contain rounded-lg"
                priority
              />
            </Link>
            <span className="hidden md:inline text-xs font-mono font-semibold px-2.5 py-1 rounded-lg bg-[var(--tag-bg)] text-[var(--text-muted)] border border-[var(--lead)]">
              Customer Portal
            </span>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle idPrefix="dashboard-theme" />
            <div className="hidden sm:flex items-center gap-2 text-xs text-[var(--brand-green)] bg-[var(--brand-green-dim)] border border-[var(--brand-green)] px-3 py-1.5 rounded-lg font-medium">
              <ShieldCheck className="h-3.5 w-3.5 text-[var(--brand-green)]" />
              <span>BukieGuarantee Protected</span>
            </div>

            {/* Quick Profile / Sign Out on mobile */}
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-main)] px-2.5 py-1.5 rounded-lg hover:bg-[var(--tag-bg)] transition-colors"
              title="Sign Out"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* 3. Main Layout Wrapper */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 lg:pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ======================================================== */}
          {/* Desktop Persistent Sidebar (lg:col-span-3)                */}
          {/* ======================================================== */}
          <aside
            aria-label="Desktop Sidebar Navigation"
            className="hidden lg:block lg:col-span-3 sticky top-24 space-y-6"
          >
            {/* Customer Identity Card */}
            <div className="bg-[var(--card-bg)] text-[var(--text-main)] rounded-lg p-5 border border-[var(--lead)] shadow-xs">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-lg bg-[var(--amber)] text-white flex items-center justify-center font-display font-bold text-lg border border-[var(--lead)]">
                  {viewModel.customer.name.charAt(0)}
                </div>
                <div className="overflow-hidden">
                  <h3 className="font-display font-bold text-base text-[var(--text-main)] truncate">
                    {viewModel.customer.name}
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] truncate">
                    {viewModel.customer.email || viewModel.customer.phone || 'Verified Customer'}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-[var(--lead)] flex items-center justify-between text-xs">
                <span className="text-[var(--text-muted)]">Account status</span>
                <span className="inline-flex items-center gap-1 text-[var(--brand-green)] font-semibold bg-[var(--brand-green-dim)] border border-[var(--brand-green-border)] px-2 py-0.5 rounded-md">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand-green)]" />
                  Active
                </span>
              </div>
            </div>

            {/* Navigation Menu */}
            <nav
              aria-label="Desktop Sidebar"
              className="bg-[var(--card-bg)] text-[var(--text-main)] rounded-lg p-3 border border-[var(--lead)] shadow-xs space-y-1"
            >
              <button
                onClick={() => setActiveTab('home')}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
                  activeTab === 'home'
                    ? 'bg-[var(--amber)] text-white shadow-xs'
                    : 'text-[var(--text-main)] hover:bg-[var(--card-hover)]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Home className={`h-4 w-4 ${activeTab === 'home' ? 'text-white' : 'text-[var(--text-muted)]'}`} />
                  <span>Home</span>
                </div>
                {viewModel.activeWork.length > 0 && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                      activeTab === 'home' ? 'bg-amber-700/60 text-white' : 'bg-[var(--tag-bg)] text-[var(--text-main)] border border-[var(--lead)]'
                    }`}
                  >
                    {viewModel.activeWork.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => router.push('/jobs')}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
                  activeTab === 'jobs'
                    ? 'bg-[var(--amber)] text-white shadow-xs'
                    : 'text-[var(--text-main)] hover:bg-[var(--card-hover)]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Briefcase className={`h-4 w-4 ${activeTab === 'jobs' ? 'text-white' : 'text-[var(--text-muted)]'}`} />
                  <span>Jobs / Bookings</span>
                </div>
                {viewModel.upcomingWork.length > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-[var(--tag-bg)] text-[var(--text-main)] border border-[var(--lead)]">
                    {viewModel.upcomingWork.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => router.push('/messages')}
                className="w-full flex items-center justify-between px-3.5 py-3 rounded-lg text-sm font-semibold text-[var(--text-main)] hover:bg-[var(--card-hover)] transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-4 w-4 text-[var(--text-muted)] group-hover:text-[var(--text-main)]" />
                  <span>Messages</span>
                </div>
              </button>

              <button
                onClick={() => router.push('/notifications')}
                className="w-full flex items-center justify-between px-3.5 py-3 rounded-lg text-sm font-semibold text-[var(--text-main)] hover:bg-[var(--card-hover)] transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Bell className="h-4 w-4 text-[var(--text-muted)] group-hover:text-[var(--text-main)]" />
                  <span>Notifications</span>
                </div>
              </button>

              <button
                onClick={() => router.push('/profile')}
                className="w-full flex items-center justify-between px-3.5 py-3 rounded-lg text-sm font-semibold transition-colors text-[var(--text-main)] hover:bg-[var(--card-hover)] cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-[var(--text-muted)]" />
                  <span>Profile</span>
                </div>
              </button>
            </nav>

            {/* Quick Guarantee Assurance Box */}
            <div className="bg-[var(--card-bg)] text-[var(--text-main)] rounded-lg p-4 border border-[var(--lead)] text-xs space-y-2 shadow-xs">
              <div className="flex items-center gap-2 text-[var(--text-main)] font-bold">
                <ShieldCheck className="h-4 w-4 text-[var(--brand-green)]" />
                <span>BukieGuarantee Terms</span>
              </div>
              <p className="text-[var(--text-muted)] leading-relaxed">
                All services booked through BukieBrainJobs include dispute resolution and verified BrainWorker standards.
              </p>
              <Link href="/guarantee" className="inline-flex items-center gap-1 text-[var(--brand-green)] font-semibold hover:underline">
                Read full policy
                <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
          </aside>

          {/* ======================================================== */}
          {/* Main Content Area (lg:col-span-9)                         */}
          {/* ======================================================== */}
          <main id="main-content" className="lg:col-span-9 space-y-6">
            {/* New Job Alert Banner (Handoff from /post-job) */}
            {viewModel.newJobNotice && (
              <div
                role="alert"
                className="bg-[var(--brand-green-dim)] border border-[var(--brand-green-border)] rounded-lg p-4 flex items-start gap-3 text-[var(--brand-green)] shadow-xs animate-fade-in"
              >
                <CheckCircle2 className="h-5 w-5 text-[var(--brand-green)] shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-bold text-sm text-[var(--text-main)]">
                    Request Received: Reference {viewModel.newJobNotice.reference}
                  </h4>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    Your request for &quot;{viewModel.newJobNotice.title}&quot; has been recorded and placed into active
                    work. Qualified BrainWorkers are being notified.
                  </p>
                </div>
              </div>
            )}

            {/* Greeting & Operational Context Bar */}
            <div className="bg-[var(--card-bg)] text-[var(--text-main)] rounded-lg p-6 border border-[var(--lead)] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold font-display tracking-trades text-[var(--text-main)]">
                  Good day, {viewModel.customer.name}
                </h1>
                <p className="text-sm text-[var(--text-muted)] mt-1 flex items-center gap-2">
                  <span>Operational Dashboard</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                    Lagos, Nigeria
                  </span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[var(--brand-green-dim)] text-[var(--brand-green)] border border-[var(--brand-green-border)] flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[var(--brand-green)]" />
                  Account Active
                </span>
                <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[var(--tag-bg)] text-[var(--text-main)] border border-[var(--lead)]">
                  Customer
                </span>
              </div>
            </div>

            {activeTab === 'jobs' ? (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[var(--lead)]">
                  <div>
                    <h2 className="text-xl font-bold font-display text-[var(--text-main)]">Your Jobs & Bookings</h2>
                    <p className="text-xs text-[var(--text-muted)] mt-1">
                      Manage your ongoing requests, active services, and scheduled appointments.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href="/post-job"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[var(--amber)] text-white text-xs font-semibold hover:bg-[var(--amber-hover)] transition-colors shadow-xs"
                    >
                      <PlusCircle className="h-3.5 w-3.5" />
                      Post a Job
                    </Link>
                    <Link
                      href="/services"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[var(--lead)] bg-[var(--card-bg)] text-[var(--text-main)] text-xs font-semibold hover:bg-[var(--card-hover)] transition-colors shadow-xs"
                    >
                      <Search className="h-3.5 w-3.5 text-[var(--brand-green)]" />
                      Find Service
                    </Link>
                  </div>
                </div>

                {/* Active Work Section */}
                <section aria-labelledby="jobs-tab-active-heading" className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 id="jobs-tab-active-heading" className="text-base font-bold font-display text-[var(--text-main)]">
                        Active Requests
                      </h3>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-[var(--amber-dim)] text-[var(--amber)] border border-[var(--amber)]/30">
                        {viewModel.activeWork.length}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {viewModel.activeWork.length > 0 ? (
                      viewModel.activeWork.map((item) => (
                        <div
                          key={item.id}
                          className="bg-[var(--card-bg)] text-[var(--text-main)] rounded-lg p-5 border border-[var(--lead)] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[var(--lead-light)] transition-colors"
                        >
                          <div className="space-y-2 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-[var(--tag-bg)] text-[var(--text-main)] border border-[var(--lead)]">
                                {item.id}
                              </span>
                              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-[var(--amber-dim)] text-[var(--amber)] border border-[var(--amber)]/30">
                                {item.statusLabel}
                              </span>
                              {item.preferredWorkerName && (
                                <span className="text-xs font-medium text-[var(--text-muted)]">
                                  {item.preferredWorkerName}
                                </span>
                              )}
                            </div>

                            <h4 className="font-display font-bold text-base text-[var(--text-main)]">{item.title}</h4>

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--text-muted)]">
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3 text-[var(--text-muted)]" />
                                {item.location}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3 text-[var(--text-muted)]" />
                                {item.scheduleContext}
                              </span>
                              {item.budget && (
                                <span className="font-semibold text-[var(--text-main)]">
                                  Budget: {item.budget}
                                </span>
                              )}
                            </div>

                            {/* Visual Progress Stepper */}
                            <div className="pt-2 border-t border-[var(--lead)]">
                              <div className="flex items-center justify-between text-[10px] font-semibold text-[var(--text-muted)] max-w-sm">
                                <span className="text-[var(--brand-green)] font-bold">1. Confirmed</span>
                                <span className="h-0.5 w-6 bg-[var(--brand-green)]" />
                                <span className="text-[var(--brand-green)] font-bold">2. Matching</span>
                                <span className="h-0.5 w-6 bg-[var(--lead)]" />
                                <span>3. En Route</span>
                                <span className="h-0.5 w-6 bg-[var(--lead)]" />
                                <span>4. Completed</span>
                              </div>
                            </div>
                          </div>

                          <Link
                            href={item.actionUrl}
                            className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-[var(--amber)] text-white text-xs font-semibold hover:bg-[var(--amber-hover)] transition-colors shrink-0 shadow-xs"
                          >
                            {item.actionLabel}
                          </Link>
                        </div>
                      ))
                    ) : (
                      <div className="relative overflow-hidden bg-[var(--card-bg)] rounded-lg p-8 border border-[var(--lead)] text-center text-xs text-[var(--text-muted)] shadow-xs">
                        <div
                          className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.04] select-none"
                          aria-hidden="true"
                        >
                          <Image
                            src="/images/logo-watermark.png"
                            alt=""
                            width={160}
                            height={160}
                            className="object-contain"
                          />
                        </div>
                        <p className="relative z-10 font-bold text-sm text-[var(--text-main)]">No active job requests at this moment.</p>
                        <p className="relative z-10 text-xs text-[var(--text-muted)] mt-1 mb-4">Post a custom project or book a verified BrainWorker directly.</p>
                        <div className="relative z-10 flex flex-wrap items-center justify-center gap-3">
                          <Link
                            href="/post-job"
                            className="motion-press inline-flex items-center gap-1.5 rounded-lg bg-[var(--amber)] px-4 py-2 text-xs font-bold text-white hover:bg-[var(--amber-hover)] transition-colors shadow-xs"
                          >
                            <PlusCircle className="h-3.5 w-3.5" />
                            Post a Job
                          </Link>
                          <Link
                            href="/services"
                            className="motion-press inline-flex items-center gap-1.5 rounded-lg border border-[var(--lead)] bg-[var(--card-bg)] px-4 py-2 text-xs font-bold text-[var(--text-main)] hover:bg-[var(--card-hover)] transition-colors shadow-xs"
                          >
                            Browse Services
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                </section>

                {/* Upcoming Scheduled Work Section */}
                <section aria-labelledby="jobs-tab-upcoming-heading" className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 id="jobs-tab-upcoming-heading" className="text-base font-bold font-display text-[var(--text-main)]">
                        Scheduled Bookings
                      </h3>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-[var(--amber-dim)] text-[var(--amber)] border border-[var(--amber)]/30">
                        {viewModel.upcomingWork.length}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {viewModel.upcomingWork.length > 0 ? (
                      viewModel.upcomingWork.map((item) => (
                        <div
                          key={item.id}
                          className="bg-[var(--card-bg)] text-[var(--text-main)] rounded-lg p-5 border border-[var(--lead)] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-[var(--tag-bg)] text-[var(--text-main)] border border-[var(--lead)]">
                                {item.id}
                              </span>
                              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-[var(--amber-dim)] text-[var(--amber)] border border-[var(--amber)]/30">
                                Scheduled
                              </span>
                            </div>

                            <h4 className="font-display font-bold text-base text-[var(--text-main)]">{item.serviceTitle}</h4>

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--text-muted)]">
                              <span className="font-semibold text-[var(--text-main)] flex items-center gap-1">
                                <ShieldCheck className="h-3.5 w-3.5 text-[var(--brand-green)]" />
                                {item.workerName}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3 text-[var(--text-muted)]" />
                                {item.date}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3 text-[var(--text-muted)]" />
                                {item.arrivalWindow}
                              </span>
                            </div>

                            {item.preparationTip && (
                              <div className="text-xs bg-[var(--bg)] text-[var(--text-muted)] p-2.5 rounded-lg border border-[var(--lead)] flex items-start gap-1.5">
                                <Info className="h-3.5 w-3.5 text-[var(--brand-green)] shrink-0 mt-0.5" />
                                <span>{item.preparationTip}</span>
                              </div>
                            )}
                          </div>

                          <Link
                            href={item.actionUrl}
                            className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg border border-[var(--lead)] bg-[var(--card-bg)] hover:bg-[var(--card-hover)] text-xs font-semibold text-[var(--text-main)] transition-colors shrink-0 shadow-xs"
                          >
                            {item.actionLabel}
                          </Link>
                        </div>
                      ))
                    ) : (
                      <div className="relative overflow-hidden bg-[var(--card-bg)] rounded-lg p-8 border border-[var(--lead)] text-center text-xs text-[var(--text-muted)] shadow-xs">
                        <div
                          className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.04] select-none"
                          aria-hidden="true"
                        >
                          <Image
                            src="/images/logo-watermark.png"
                            alt=""
                            width={160}
                            height={160}
                            className="object-contain"
                          />
                        </div>
                        <p className="relative z-10 font-medium text-[var(--text-main)]">No upcoming bookings scheduled.</p>
                        <p className="relative z-10 text-[11px] text-[var(--text-muted)] mt-1">Bookings through the directory or job posts will appear here.</p>
                      </div>
                    )}
                  </div>
                </section>

                {/* Past Activity */}
                {viewModel.recentActivity.length > 0 && (
                  <section aria-labelledby="jobs-tab-past-heading" className="space-y-3">
                    <h3 id="jobs-tab-past-heading" className="text-base font-bold font-display text-[var(--text-main)]">
                      Past Completed Work
                    </h3>
                    <div className="space-y-2">
                      {viewModel.recentActivity.map((item) => (
                        <div
                          key={item.id}
                          className="bg-[var(--card-bg)] text-[var(--text-main)] rounded-lg p-4 border border-[var(--lead)] flex items-center justify-between gap-4 text-xs shadow-xs"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-[var(--text-main)]">{item.title}</span>
                              <span className="text-[var(--text-muted)]">•</span>
                              <span className="text-[var(--text-muted)]">{item.workerName}</span>
                            </div>
                            <div className="flex items-center gap-3 text-[var(--text-muted)]">
                              <span>{item.completedDate}</span>
                              {item.amount && <span>{item.amount}</span>}
                              <span>{item.location}</span>
                            </div>
                          </div>

                          <Link
                            href={item.actionUrl}
                            className="text-xs font-semibold text-[var(--brand-green)] hover:underline shrink-0"
                          >
                            {item.actionLabel}
                          </Link>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            ) : (
              <>
            {/* Primary Marketplace Actions */}
            <section aria-labelledby="marketplace-actions-heading">
              <div className="flex items-center justify-between mb-3">
                <h2 id="marketplace-actions-heading" className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Marketplace Actions
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. Primary Action: Find a Service */}
                <Link
                  href="/services"
                  className="group relative bg-[var(--card-bg)] text-[var(--text-main)] p-5 rounded-lg shadow-xs hover:border-[var(--amber)] transition-all duration-200 flex flex-col justify-between border border-[var(--lead)] min-h-[140px]"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="h-10 w-10 rounded-lg bg-[var(--amber)]/10 text-[var(--amber)] border border-[var(--amber)]/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <Search className="h-5 w-5" />
                      </div>
                      <span className="text-[11px] font-bold uppercase tracking-wider bg-[var(--amber)] text-white px-2.5 py-0.5 rounded-md">
                        Primary Action
                      </span>
                    </div>
                    <h3 className="text-lg font-bold font-display text-[var(--text-main)] group-hover:text-[var(--amber)] transition-colors">
                      Find a Service
                    </h3>
                    <p className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">
                      Browse vetted BrainWorkers, fixed-scope tasks, and instant price estimates across Nigeria.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[var(--lead)] flex items-center justify-between text-xs font-semibold text-[var(--amber)]">
                    <span>Browse Catalog</span>
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>

                {/* 2. Secondary Action: Post a Job */}
                <Link
                  href="/post-job"
                  className="group relative bg-[var(--card-bg)] text-[var(--text-main)] p-5 rounded-lg shadow-xs hover:border-[var(--brand-green)] transition-all duration-200 flex flex-col justify-between border border-[var(--lead)] min-h-[140px]"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="h-10 w-10 rounded-lg bg-[var(--brand-green-dim)] text-[var(--brand-green)] border border-[var(--brand-green-border)] flex items-center justify-center group-hover:scale-105 transition-transform">
                        <Briefcase className="h-5 w-5" />
                      </div>
                      <span className="text-[11px] font-bold uppercase tracking-wider bg-[var(--tag-bg)] text-[var(--text-main)] border border-[var(--lead)] px-2.5 py-0.5 rounded-md">
                        Secondary
                      </span>
                    </div>
                    <h3 className="text-lg font-bold font-display text-[var(--text-main)] group-hover:text-[var(--brand-green)] transition-colors">
                      Post a Job
                    </h3>
                    <p className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">
                      Describe your custom task or broader project to get proposals from qualified local BrainWorkers.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[var(--lead)] flex items-center justify-between text-xs font-semibold text-[var(--text-main)] group-hover:text-[var(--brand-green)]">
                    <span>Create Custom Request</span>
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </div>
            </section>

            {/* ======================================================== */}
            {/* FIRST-RUN STATE (No Activity)                             */}
            {/* ======================================================== */}
            {viewModel.stateMode === 'first_run' && (
              <section
                aria-labelledby="first-run-heading"
                className="bg-[var(--card-bg)] text-[var(--text-main)] rounded-lg p-6 sm:p-8 border border-[var(--lead)] shadow-xs space-y-6"
              >
                <div>
                  <h3 id="first-run-heading" className="text-xl font-bold font-display text-[var(--text-main)]">
                    Welcome to your account home
                  </h3>
                  <p className="text-sm text-[var(--text-muted)] mt-1.5 max-w-xl leading-relaxed">
                    You do not have any active requests or scheduled work right now. When you book a BrainWorker or post a
                    job, all status updates, proposals, and schedules will be tracked right here.
                  </p>
                </div>

                {/* Getting started steps */}
                <div className="pt-4 border-t border-[var(--lead)]">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-4">
                    How BukieBrainJobs Works
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div className="p-4 rounded-lg bg-[var(--bg)] border border-[var(--lead)] space-y-1.5">
                      <div className="h-6 w-6 rounded-md bg-[var(--amber)] text-white font-bold flex items-center justify-center text-xs">
                        1
                      </div>
                      <h5 className="font-bold text-[var(--text-main)] text-sm">Discover or Request</h5>
                      <p className="text-[var(--text-muted)] leading-relaxed">
                        Find a service directly or post custom job details with your preferred schedule and location.
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-[var(--bg)] border border-[var(--lead)] space-y-1.5">
                      <div className="h-6 w-6 rounded-md bg-[var(--amber)] text-white font-bold flex items-center justify-center text-xs">
                        2
                      </div>
                      <h5 className="font-bold text-[var(--text-main)] text-sm">Review BrainWorkers</h5>
                      <p className="text-[var(--text-muted)] leading-relaxed">
                        Inspect verified badges, ratings, and customer reviews before agreeing on timing.
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-[var(--bg)] border border-[var(--lead)] space-y-1.5">
                      <div className="h-6 w-6 rounded-md bg-[var(--amber)] text-white font-bold flex items-center justify-center text-xs">
                        3
                      </div>
                      <h5 className="font-bold text-[var(--text-main)] text-sm">BukieGuarantee</h5>
                      <p className="text-[var(--text-muted)] leading-relaxed">
                        Work is completed with quality assurance. Pricing is agreed directly without hidden fees.
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* ======================================================== */}
            {/* ACTIVE WORK SECTION (Highest Content Priority)            */}
            {/* ======================================================== */}
            {viewModel.stateMode !== 'first_run' && (
              <section aria-labelledby="active-work-heading" className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h2 id="active-work-heading" className="text-base font-bold font-display text-[var(--text-main)]">
                      Active Work
                    </h2>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-[var(--amber-dim)] text-[var(--amber)] border border-[var(--amber)]/30">
                      {viewModel.activeWork.length}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Link href="/jobs?view=active" className="text-xs font-semibold text-[var(--text-main)] hover:text-[var(--amber)] hover:underline flex items-center gap-1">
                      <span>View in Jobs</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                    <Link href="/post-job" className="text-xs font-semibold text-[var(--brand-green)] hover:underline flex items-center gap-1">
                      <PlusCircle className="h-3.5 w-3.5" />
                      New Request
                    </Link>
                  </div>
                </div>

                {/* Partial Failure State for Active Work */}
                {viewModel.hasPartialFailure && (
                  <div
                    role="alert"
                    className="bg-[var(--danger-dim)] border border-[var(--danger-border)] rounded-lg p-5 text-[var(--danger)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-[var(--danger)] shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-sm text-[var(--danger)]">Could not load active requests</h4>
                        <p className="text-xs text-[var(--danger)] mt-0.5 leading-relaxed">
                          A temporary network issue prevented us from retrieving active requests. Other dashboard
                          sections remain operational.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleRetryActive}
                      className="px-4 py-2 bg-[var(--danger)] hover:opacity-90 text-white text-xs font-semibold rounded-lg transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Retry Active Requests
                    </button>
                  </div>
                )}

                {/* Active Work Card List */}
                {!viewModel.hasPartialFailure && (
                  <div className="space-y-3">
                    {viewModel.activeWork.length > 0 ? (
                      viewModel.activeWork.map((item) => (
                        <div
                          key={item.id}
                          className="bg-[var(--card-bg)] text-[var(--text-main)] rounded-lg p-5 border border-[var(--lead)] shadow-xs hover:border-[var(--lead-light)] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                          <div className="space-y-1.5 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-[var(--tag-bg)] text-[var(--text-main)] border border-[var(--lead)]">
                                {item.id}
                              </span>
                              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-[var(--amber-dim)] text-[var(--amber)] border border-[var(--amber)]/30">
                                {item.statusLabel}
                              </span>
                              {item.preferredWorkerName && (
                                <span className="text-xs font-medium text-[var(--text-muted)]">
                                  {item.preferredWorkerName}
                                </span>
                              )}
                            </div>

                            <h3 className="font-display font-bold text-base text-[var(--text-main)]">{item.title}</h3>

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--text-muted)]">
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3 text-[var(--text-muted)]" />
                                {item.location}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3 text-[var(--text-muted)]" />
                                {item.scheduleContext}
                              </span>
                              {item.budget && (
                                <span className="font-semibold text-[var(--text-main)]">
                                  Budget: {item.budget}
                                </span>
                              )}
                            </div>
                          </div>

                          <Link
                            href={item.actionUrl}
                            className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-[var(--amber)] text-white text-xs font-semibold hover:bg-[var(--amber-hover)] transition-colors shrink-0 shadow-xs"
                          >
                            {item.actionLabel}
                          </Link>
                        </div>
                      ))
                    ) : (
                      <div className="bg-[var(--card-bg)] rounded-lg p-6 border border-[var(--lead)] text-center text-xs text-[var(--text-muted)] shadow-xs">
                        No active work at this moment. Click &quot;Post a Job&quot; or &quot;Find a Service&quot; to begin.
                      </div>
                    )}
                  </div>
                )}
              </section>
            )}

            {/* ======================================================== */}
            {/* UPCOMING WORK SECTION (Second Priority)                   */}
            {/* ======================================================== */}
            {viewModel.stateMode !== 'first_run' && viewModel.stateMode !== 'active' && (
              <section aria-labelledby="upcoming-work-heading" className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h2 id="upcoming-work-heading" className="text-base font-bold font-display text-[var(--text-main)]">
                      Upcoming Work
                    </h2>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-[var(--amber-dim)] text-[var(--amber)] border border-[var(--amber)]/30">
                      {viewModel.upcomingWork.length}
                    </span>
                  </div>
                  <Link href="/jobs?view=upcoming" className="text-xs font-semibold text-[var(--text-main)] hover:text-[var(--amber)] hover:underline flex items-center gap-1">
                    <span>View in Jobs</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>

                <div className="space-y-3">
                  {viewModel.upcomingWork.length > 0 ? (
                    viewModel.upcomingWork.map((item) => (
                      <div
                        key={item.id}
                        className="bg-[var(--card-bg)] text-[var(--text-main)] rounded-lg p-5 border border-[var(--lead)] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-[var(--tag-bg)] text-[var(--text-main)] border border-[var(--lead)]">
                              {item.id}
                            </span>
                            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-[var(--amber-dim)] text-[var(--amber)] border border-[var(--amber)]/30">
                              Scheduled
                            </span>
                          </div>

                          <h3 className="font-display font-bold text-base text-[var(--text-main)]">{item.serviceTitle}</h3>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--text-muted)]">
                            <span className="font-semibold text-[var(--text-main)] flex items-center gap-1">
                              <ShieldCheck className="h-3.5 w-3.5 text-[var(--brand-green)]" />
                              {item.workerName}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 text-[var(--text-muted)]" />
                              {item.date}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-[var(--text-muted)]" />
                              {item.arrivalWindow}
                            </span>
                          </div>

                          {item.preparationTip && (
                            <div className="text-xs bg-[var(--bg)] text-[var(--text-muted)] p-2.5 rounded-lg border border-[var(--lead)] flex items-start gap-1.5">
                              <Info className="h-3.5 w-3.5 text-[var(--brand-green)] shrink-0 mt-0.5" />
                              <span>{item.preparationTip}</span>
                            </div>
                          )}
                        </div>

                        <Link
                          href={item.actionUrl}
                          className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg border border-[var(--lead)] bg-[var(--card-bg)] hover:bg-[var(--card-hover)] text-xs font-semibold text-[var(--text-main)] transition-colors shrink-0 shadow-xs"
                        >
                          {item.actionLabel}
                        </Link>
                      </div>
                    ))
                  ) : (
                    <div className="bg-[var(--card-bg)] rounded-lg p-6 border border-[var(--lead)] text-center text-xs text-[var(--text-muted)] shadow-xs">
                      No upcoming bookings scheduled.
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* ======================================================== */}
            {/* RECENT ACTIVITY SECTION (Subordinate Priority)            */}
            {/* ======================================================== */}
            {viewModel.stateMode !== 'first_run' &&
              viewModel.stateMode !== 'active' &&
              viewModel.stateMode !== 'upcoming' && (
                <section aria-labelledby="recent-activity-heading" className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 id="recent-activity-heading" className="text-base font-bold font-display text-[var(--text-main)]">
                      Recent Activity
                    </h2>
                    <Link href="/jobs?view=past" className="text-xs font-semibold text-[var(--text-main)] hover:text-[var(--amber)] hover:underline flex items-center gap-1">
                      <span>View in Jobs</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>

                  <div className="space-y-2">
                    {viewModel.recentActivity.length > 0 ? (
                      viewModel.recentActivity.map((item) => (
                        <div
                          key={item.id}
                          className="bg-[var(--card-bg)] text-[var(--text-main)] rounded-lg p-4 border border-[var(--lead)] flex items-center justify-between gap-4 text-xs shadow-xs"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-[var(--text-main)]">{item.title}</span>
                              <span className="text-[var(--text-muted)]">•</span>
                              <span className="text-[var(--text-muted)]">{item.workerName}</span>
                            </div>
                            <div className="flex items-center gap-3 text-[var(--text-muted)]">
                              <span>{item.completedDate}</span>
                              {item.amount && <span>{item.amount}</span>}
                              <span>{item.location}</span>
                            </div>
                          </div>

                          <Link
                            href={item.actionUrl}
                            className="text-xs font-semibold text-[var(--brand-green)] hover:underline shrink-0"
                          >
                            {item.actionLabel}
                          </Link>
                        </div>
                      ))
                    ) : (
                      <div className="bg-[var(--card-bg)] rounded-lg p-4 border border-[var(--lead)] text-center text-xs text-[var(--text-muted)] shadow-xs">
                        No previous activity recorded.
                      </div>
                    )}
                  </div>
                </section>
              )}

            {/* ======================================================== */}
            {/* MARKETPLACE CONTINUATION (Restrained Discovery)          */}
            {/* ======================================================== */}
            <section aria-labelledby="marketplace-continuation-heading" className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h2
                  id="marketplace-continuation-heading"
                  className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]"
                >
                  Explore Popular Services
                </h2>
                <Link href="/services" className="text-xs font-semibold text-[var(--brand-green)] hover:underline">
                  View all services
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {viewModel.marketplaceContinuation.map((cat) => (
                  <Link
                    key={cat.id}
                    href={cat.href}
                    className="bg-[var(--card-bg)] text-[var(--text-main)] rounded-lg p-3.5 border border-[var(--lead)] hover:border-[var(--amber)] transition-colors group block shadow-xs"
                  >
                    <h4 className="font-bold text-sm text-[var(--text-main)] group-hover:text-[var(--amber)] transition-colors">
                      {cat.title}
                    </h4>
                    <p className="text-[11px] text-[var(--text-muted)] mt-1 line-clamp-2 leading-relaxed">{cat.description}</p>
                    <div className="mt-2 text-xs font-semibold text-[var(--brand-green)] flex items-center justify-between">
                      <span>{cat.startingPrice}</span>
                      <ChevronRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </Link>
                ))}
              </div>
            </section>
            </>
          )}
          </main>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MOBILE PERSISTENT BOTTOM NAVIGATION (Customer views only)  */}
      {/* ======================================================== */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-[var(--card-bg)] border-t border-[var(--lead)] px-2 py-1 flex items-center justify-around shadow-lg backdrop-blur-md"
      >
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center justify-center min-h-[48px] px-3 py-1 text-[11px] font-semibold transition-colors cursor-pointer ${
            activeTab === 'home' ? 'text-[var(--amber)]' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
          }`}
        >
          <Home className="h-4 w-4 mb-0.5" />
          <span>Home</span>
        </button>

        <button
          onClick={() => router.push('/jobs')}
          className={`flex flex-col items-center justify-center min-h-[48px] px-3 py-1 text-[11px] font-semibold transition-colors cursor-pointer ${
            activeTab === 'jobs' ? 'text-[var(--amber)]' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
          }`}
        >
          <Briefcase className="h-4 w-4 mb-0.5" />
          <span>Jobs</span>
        </button>

        <button
          onClick={() => router.push('/messages')}
          className="flex flex-col items-center justify-center min-h-[48px] px-3 py-1 text-[11px] font-semibold text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors relative cursor-pointer"
        >
          <MessageSquare className="h-4 w-4 mb-0.5" />
          <span>Messages</span>
        </button>

        <button
          onClick={() => router.push('/notifications')}
          className="flex flex-col items-center justify-center min-h-[48px] px-3 py-1 text-[11px] font-semibold text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors relative cursor-pointer"
        >
          <Bell className="h-4 w-4 mb-0.5" />
          <span>Alerts</span>
        </button>

        <button
          onClick={() => router.push('/profile')}
          className="flex flex-col items-center justify-center min-h-[48px] px-3 py-1 text-[11px] font-semibold text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
        >
          <User className="h-4 w-4 mb-0.5" />
          <span>Profile</span>
        </button>
      </nav>

      {/* ======================================================== */}
      {/* DIALOG FOR FUTURE CAPABILITY NOTICES                      */}
      {/* ======================================================== */}
      {activeNoticeDialog && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Direct Messaging Notice"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
          onClick={closeDialog}
        >
          <div
            className="bg-[var(--card-bg)] text-[var(--text-main)] rounded-lg max-w-md w-full p-6 border border-[var(--lead)] shadow-xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="h-10 w-10 rounded-lg bg-[var(--amber)]/10 text-[var(--amber)] border border-[var(--amber)]/20 flex items-center justify-center">
                <MessageSquare className="h-5 w-5" />
              </div>
              <button
                onClick={closeDialog}
                className="p-2 text-[var(--text-muted)] hover:text-[var(--text-main)] rounded-lg hover:bg-[var(--card-hover)] transition-colors cursor-pointer"
                aria-label="Close Notice"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div>
              <h3 className="text-lg font-bold font-display text-[var(--text-main)]">
                Direct Messaging in Progress
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-2 leading-relaxed">
                Direct real-time chat with your chosen BrainWorker is part of our upcoming Customer Platform release. In the meantime, communication is coordinated after booking confirmation under the BukieGuarantee.
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={closeDialog}
                className="w-full py-2.5 px-4 bg-[var(--amber)] text-white text-xs font-semibold rounded-lg hover:bg-[var(--amber-hover)] transition-colors cursor-pointer shadow-xs"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* PROFILE TAB MODAL / DRAWER                               */}
      {/* ======================================================== */}
      {activeTab === 'profile' && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Customer Profile Details"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setActiveTab('home')}
        >
          <div
            className="bg-[var(--card-bg)] text-[var(--text-main)] rounded-lg max-w-md w-full p-6 border border-[var(--lead)] shadow-xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold font-display text-[var(--text-main)]">Customer Account Details</h3>
              <button
                onClick={() => setActiveTab('home')}
                className="p-2 text-[var(--text-muted)] hover:text-[var(--text-main)] rounded-lg hover:bg-[var(--card-hover)] transition-colors cursor-pointer"
                aria-label="Close Profile"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-[var(--bg)] rounded-lg border border-[var(--lead)] flex items-center justify-between">
                <span className="text-[var(--text-muted)]">Full Name</span>
                <span className="font-bold text-[var(--text-main)]">{viewModel.customer.name}</span>
              </div>
              <div className="p-3 bg-[var(--bg)] rounded-lg border border-[var(--lead)] flex items-center justify-between">
                <span className="text-[var(--text-muted)]">Role</span>
                <span className="font-semibold text-[var(--brand-green)] bg-[var(--brand-green-dim)] border border-[var(--brand-green-border)] px-2 py-0.5 rounded-md">
                  {getRoleDisplayLabel(viewModel.customer.role)}
                </span>
              </div>
              <div className="p-3 bg-[var(--bg)] rounded-lg border border-[var(--lead)] flex items-center justify-between">
                <span className="text-[var(--text-muted)]">Contact</span>
                <span className="text-[var(--text-main)]">
                  {viewModel.customer.email || viewModel.customer.phone || 'Protected'}
                </span>
              </div>
              <div className="p-3 bg-[var(--bg)] rounded-lg border border-[var(--lead)] flex items-center justify-between">
                <span className="text-[var(--text-muted)]">Marketplace Region</span>
                <span className="text-[var(--text-main)]">Nigeria (Lagos Hub)</span>
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <button
                onClick={handleSignOut}
                className="w-full py-2.5 px-4 bg-[var(--danger)] text-white text-xs font-semibold rounded-lg hover:opacity-90 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
              <button
                onClick={() => setActiveTab('home')}
                className="w-full py-2 px-4 border border-[var(--lead)] bg-[var(--card-bg)] text-[var(--text-main)] text-xs font-semibold rounded-lg hover:bg-[var(--card-hover)] transition-colors cursor-pointer shadow-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

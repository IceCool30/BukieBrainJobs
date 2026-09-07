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
import {
  DashboardViewModel,
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
  const [activeNoticeDialog, setActiveNoticeDialog] = useState<'messages' | 'notifications' | null>(null);

  // Check authentication on mount
  useEffect(() => {
    const user = getMockAuthenticatedUser();
    setCurrentUser(user);
    setAuthChecked(true);
  }, []);

  // Listen for tab query param if provided
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'jobs' || tabParam === 'messages' || tabParam === 'notifications' || tabParam === 'profile') {
      setActiveTab(tabParam as DashboardTab);
    }
  }, [searchParams]);

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
      <div className="min-h-screen bg-[#F8F9FF] flex items-center justify-center p-6 text-slate-800 font-sans">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-slate-200 shadow-sm text-center">
          <div className="h-14 w-14 mx-auto rounded-full bg-[#001A41]/10 flex items-center justify-center text-[#001A41] mb-4">
            <User className="h-7 w-7" />
          </div>
          <h1 className="text-xl font-bold font-display text-[#001A41] mb-2">Authentication required</h1>
          <p className="text-sm text-slate-600 mb-6 leading-relaxed">
            Please sign in to access your customer dashboard and manage your service requests.
          </p>
          <Link
            href="/login?returnUrl=%2Fdashboard"
            className="inline-flex items-center justify-center w-full px-5 py-3 rounded-xl bg-[#001A41] text-white font-semibold text-sm hover:bg-[#00265E] transition-colors shadow-sm"
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
        className="min-h-screen bg-[#F8F9FF] font-sans p-6"
      >
        <div className="max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar Skeleton */}
          <div className="hidden lg:block lg:col-span-3 bg-white rounded-2xl p-6 border border-slate-200 h-[600px] animate-pulse">
            <div className="h-8 bg-slate-200 rounded-md w-3/4 mb-8" />
            <div className="h-12 bg-slate-100 rounded-xl mb-4" />
            <div className="space-y-3">
              <div className="h-10 bg-slate-100 rounded-xl" />
              <div className="h-10 bg-slate-100 rounded-xl" />
              <div className="h-10 bg-slate-100 rounded-xl" />
            </div>
          </div>
          {/* Content Skeleton */}
          <div className="lg:col-span-9 space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 animate-pulse h-28" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl p-6 border border-slate-200 animate-pulse h-36" />
              <div className="bg-white rounded-2xl p-6 border border-slate-200 animate-pulse h-36" />
            </div>
            <div className="bg-white rounded-2xl p-6 border border-slate-200 animate-pulse h-48" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FF] text-slate-800 font-sans pb-24 lg:pb-12">
      {/* 1. Offline or Degraded Banner */}
      {viewModel.isOffline && (
        <div className="bg-amber-500 text-[#001A41] px-4 py-2.5 text-sm font-semibold flex items-center justify-between border-b border-amber-600/30">
          <div className="max-w-[1280px] mx-auto w-full flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <WifiOff className="h-4 w-4 shrink-0" />
              <span>Offline Mode: Showing cached dashboard activity. Live updates will resume when reconnected.</span>
            </div>
            <button
              onClick={() => setIsOfflineManual(false)}
              className="px-3 py-1 bg-[#001A41] text-white text-xs rounded-lg font-medium hover:bg-slate-900 transition-colors"
            >
              Refresh Status
            </button>
          </div>
        </div>
      )}

      {/* 2. Top Header Container */}
      <header className="bg-[#001A41] text-white border-b border-white/10 sticky top-0 z-30 shadow-sm">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <Image
                src="/images/logo-icon.png"
                alt="BukieBrainJobs"
                width={36}
                height={36}
                className="h-9 w-9 object-contain rounded-xl"
                priority
              />
              <span className="font-display font-bold text-lg tracking-tight text-white hidden sm:inline">
                Bukie<span className="text-[#ABEEC8]">BrainJobs</span>
              </span>
            </Link>
            <span className="hidden md:inline text-xs font-semibold px-2.5 py-1 rounded-full bg-white/10 text-slate-200 border border-white/10">
              Customer Portal
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-300 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
              <ShieldCheck className="h-3.5 w-3.5 text-[#ABEEC8]" />
              <span>BukieGuarantee Protected</span>
            </div>

            {/* Quick Profile / Sign Out on mobile */}
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
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
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-xl bg-[#001A41] text-[#ABEEC8] flex items-center justify-center font-display font-bold text-lg border border-[#001A41]/20">
                  {viewModel.customer.name.charAt(0)}
                </div>
                <div className="overflow-hidden">
                  <h3 className="font-display font-bold text-base text-[#001A41] truncate">
                    {viewModel.customer.name}
                  </h3>
                  <p className="text-xs text-slate-500 truncate">
                    {viewModel.customer.email || viewModel.customer.phone || 'Verified Customer'}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Account status</span>
                <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                  Active
                </span>
              </div>
            </div>

            {/* Navigation Menu */}
            <nav
              aria-label="Desktop Sidebar"
              className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-sm space-y-1"
            >
              <button
                onClick={() => setActiveTab('home')}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-colors ${
                  activeTab === 'home'
                    ? 'bg-[#001A41] text-white shadow-sm'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-[#001A41]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Home className={`h-4 w-4 ${activeTab === 'home' ? 'text-[#ABEEC8]' : 'text-slate-400'}`} />
                  <span>Home</span>
                </div>
                {viewModel.activeWork.length > 0 && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                      activeTab === 'home' ? 'bg-[#296A4B] text-[#ABEEC8]' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {viewModel.activeWork.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('jobs')}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-colors ${
                  activeTab === 'jobs'
                    ? 'bg-[#001A41] text-white shadow-sm'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-[#001A41]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Briefcase className={`h-4 w-4 ${activeTab === 'jobs' ? 'text-[#ABEEC8]' : 'text-slate-400'}`} />
                  <span>Jobs / Bookings</span>
                </div>
                {viewModel.upcomingWork.length > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-slate-100 text-slate-700">
                    {viewModel.upcomingWork.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveNoticeDialog('messages')}
                className="w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#001A41] transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-4 w-4 text-slate-400 group-hover:text-[#001A41]" />
                  <span>Messages</span>
                </div>
                <span className="text-[11px] font-medium bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                  Soon
                </span>
              </button>

              <button
                onClick={() => setActiveNoticeDialog('notifications')}
                className="w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#001A41] transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <Bell className="h-4 w-4 text-slate-400 group-hover:text-[#001A41]" />
                  <span>Notifications</span>
                </div>
                <span className="text-[11px] font-medium bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                  Soon
                </span>
              </button>

              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-colors ${
                  activeTab === 'profile'
                    ? 'bg-[#001A41] text-white shadow-sm'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-[#001A41]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <User className={`h-4 w-4 ${activeTab === 'profile' ? 'text-[#ABEEC8]' : 'text-slate-400'}`} />
                  <span>Profile</span>
                </div>
              </button>
            </nav>

            {/* Quick Guarantee Assurance Box */}
            <div className="bg-[#001A41]/5 rounded-2xl p-4 border border-[#001A41]/10 text-xs space-y-2">
              <div className="flex items-center gap-2 text-[#001A41] font-bold">
                <ShieldCheck className="h-4 w-4 text-[#296A4B]" />
                <span>BukieGuarantee Terms</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                All services booked through BukieBrainJobs include dispute resolution and verified artisan standards.
              </p>
              <Link href="/guarantee" className="inline-flex items-center gap-1 text-[#296A4B] font-semibold hover:underline">
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
                className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3 text-emerald-900 shadow-sm animate-fade-in"
              >
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-bold text-sm text-emerald-950">
                    Request Received: Reference {viewModel.newJobNotice.reference}
                  </h4>
                  <p className="text-xs text-emerald-800 mt-0.5">
                    Your request for &quot;{viewModel.newJobNotice.title}&quot; has been recorded and placed into active
                    work. Qualified BrainWorkers are being notified.
                  </p>
                </div>
              </div>
            )}

            {/* Greeting & Operational Context Bar */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold font-display text-[#001A41] tracking-tight">
                  Good day, {viewModel.customer.name}
                </h1>
                <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                  <span>Operational Dashboard</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    Lagos, Nigeria
                  </span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Account Active
                </span>
                <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[#001A41]/5 text-[#001A41] border border-[#001A41]/10">
                  Customer
                </span>
              </div>
            </div>

            {/* Primary Marketplace Actions */}
            <section aria-labelledby="marketplace-actions-heading">
              <div className="flex items-center justify-between mb-3">
                <h2 id="marketplace-actions-heading" className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Marketplace Actions
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. Primary Action: Find a Service */}
                <Link
                  href="/services"
                  className="group relative bg-[#001A41] text-white p-5 rounded-2xl shadow-sm hover:bg-[#00265E] transition-all duration-200 flex flex-col justify-between border border-[#001A41] min-h-[140px]"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center text-[#ABEEC8] group-hover:scale-105 transition-transform">
                        <Search className="h-5 w-5" />
                      </div>
                      <span className="text-[11px] font-bold uppercase tracking-wider bg-[#296A4B] text-[#ABEEC8] px-2.5 py-0.5 rounded-full">
                        Primary Action
                      </span>
                    </div>
                    <h3 className="text-lg font-bold font-display text-white group-hover:text-[#ABEEC8] transition-colors">
                      Find a Service
                    </h3>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      Browse vetted BrainWorkers, fixed-scope tasks, and instant price estimates across Nigeria.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-semibold text-[#ABEEC8]">
                    <span>Browse Catalog</span>
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>

                {/* 2. Secondary Action: Post a Job */}
                <Link
                  href="/post-job"
                  className="group relative bg-white text-[#001A41] p-5 rounded-2xl shadow-sm hover:border-[#001A41] transition-all duration-200 flex flex-col justify-between border-2 border-slate-200 min-h-[140px]"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center text-[#296A4B] group-hover:scale-105 transition-transform">
                        <Briefcase className="h-5 w-5" />
                      </div>
                      <span className="text-[11px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full">
                        Secondary
                      </span>
                    </div>
                    <h3 className="text-lg font-bold font-display text-[#001A41] group-hover:text-[#296A4B] transition-colors">
                      Post a Job
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Describe your custom task or broader project to get proposals from qualified local pros.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-[#001A41] group-hover:text-[#296A4B]">
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
                className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6"
              >
                <div>
                  <h3 id="first-run-heading" className="text-xl font-bold font-display text-[#001A41]">
                    Welcome to your account home
                  </h3>
                  <p className="text-sm text-slate-600 mt-1.5 max-w-xl leading-relaxed">
                    You do not have any active requests or scheduled work right now. When you book an artisan or post a
                    job, all status updates, proposals, and schedules will be tracked right here.
                  </p>
                </div>

                {/* Getting started steps */}
                <div className="pt-4 border-t border-slate-100">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
                    How BukieBrainJobs Works
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                      <div className="h-6 w-6 rounded-full bg-[#001A41] text-[#ABEEC8] font-bold flex items-center justify-center text-xs">
                        1
                      </div>
                      <h5 className="font-bold text-slate-800 text-sm">Discover or Request</h5>
                      <p className="text-slate-600 leading-relaxed">
                        Find a service directly or post custom job details with your preferred schedule and location.
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                      <div className="h-6 w-6 rounded-full bg-[#001A41] text-[#ABEEC8] font-bold flex items-center justify-center text-xs">
                        2
                      </div>
                      <h5 className="font-bold text-slate-800 text-sm">Review BrainWorkers</h5>
                      <p className="text-slate-600 leading-relaxed">
                        Inspect verified badges, ratings, and customer reviews before agreeing on timing.
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                      <div className="h-6 w-6 rounded-full bg-[#001A41] text-[#ABEEC8] font-bold flex items-center justify-center text-xs">
                        3
                      </div>
                      <h5 className="font-bold text-slate-800 text-sm">BukieGuarantee</h5>
                      <p className="text-slate-600 leading-relaxed">
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
                    <h2 id="active-work-heading" className="text-base font-bold font-display text-[#001A41]">
                      Active Work
                    </h2>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200">
                      {viewModel.activeWork.length}
                    </span>
                  </div>
                  <Link href="/post-job" className="text-xs font-semibold text-[#296A4B] hover:underline flex items-center gap-1">
                    <PlusCircle className="h-3.5 w-3.5" />
                    New Request
                  </Link>
                </div>

                {/* Partial Failure State for Active Work */}
                {viewModel.hasPartialFailure && (
                  <div
                    role="alert"
                    className="bg-red-50 border border-red-200 rounded-2xl p-5 text-red-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-sm">Could not load active requests</h4>
                        <p className="text-xs text-red-800 mt-0.5 leading-relaxed">
                          A temporary network issue prevented us from retrieving active requests. Other dashboard
                          sections remain operational.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleRetryActive}
                      className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white text-xs font-semibold rounded-xl transition-colors shrink-0 flex items-center gap-1.5"
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
                          className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:border-[#001A41]/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                          <div className="space-y-1.5 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                                {item.id}
                              </span>
                              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200">
                                {item.statusLabel}
                              </span>
                              {item.preferredWorkerName && (
                                <span className="text-xs font-medium text-slate-500">
                                  {item.preferredWorkerName}
                                </span>
                              )}
                            </div>

                            <h3 className="font-display font-bold text-base text-[#001A41]">{item.title}</h3>

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3 text-slate-400" />
                                {item.location}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3 text-slate-400" />
                                {item.scheduleContext}
                              </span>
                              {item.budget && (
                                <span className="font-semibold text-slate-700">
                                  Budget: {item.budget}
                                </span>
                              )}
                            </div>
                          </div>

                          <Link
                            href={item.actionUrl}
                            className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-[#001A41] text-white text-xs font-semibold hover:bg-[#00265E] transition-colors shrink-0 shadow-sm"
                          >
                            {item.actionLabel}
                          </Link>
                        </div>
                      ))
                    ) : (
                      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 text-center text-xs text-slate-500">
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
                    <h2 id="upcoming-work-heading" className="text-base font-bold font-display text-[#001A41]">
                      Upcoming Work
                    </h2>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-900 border border-blue-200">
                      {viewModel.upcomingWork.length}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  {viewModel.upcomingWork.length > 0 ? (
                    viewModel.upcomingWork.map((item) => (
                      <div
                        key={item.id}
                        className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                              {item.id}
                            </span>
                            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                              Scheduled
                            </span>
                          </div>

                          <h3 className="font-display font-bold text-base text-[#001A41]">{item.serviceTitle}</h3>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                            <span className="font-semibold text-slate-800 flex items-center gap-1">
                              <ShieldCheck className="h-3.5 w-3.5 text-[#296A4B]" />
                              {item.workerName}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 text-slate-400" />
                              {item.date}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-slate-400" />
                              {item.arrivalWindow}
                            </span>
                          </div>

                          {item.preparationTip && (
                            <div className="text-xs bg-slate-50 text-slate-600 p-2.5 rounded-xl border border-slate-100 flex items-start gap-1.5">
                              <Info className="h-3.5 w-3.5 text-[#296A4B] shrink-0 mt-0.5" />
                              <span>{item.preparationTip}</span>
                            </div>
                          )}
                        </div>

                        <Link
                          href={item.actionUrl}
                          className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-[#001A41] transition-colors shrink-0 shadow-sm"
                        >
                          {item.actionLabel}
                        </Link>
                      </div>
                    ))
                  ) : (
                    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 text-center text-xs text-slate-500">
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
                  <h2 id="recent-activity-heading" className="text-base font-bold font-display text-[#001A41]">
                    Recent Activity
                  </h2>

                  <div className="space-y-2">
                    {viewModel.recentActivity.length > 0 ? (
                      viewModel.recentActivity.map((item) => (
                        <div
                          key={item.id}
                          className="bg-white rounded-xl p-4 border border-slate-200/80 flex items-center justify-between gap-4 text-xs"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-slate-900">{item.title}</span>
                              <span className="text-slate-400">•</span>
                              <span className="text-slate-600">{item.workerName}</span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-500">
                              <span>{item.completedDate}</span>
                              {item.amount && <span>{item.amount}</span>}
                              <span>{item.location}</span>
                            </div>
                          </div>

                          <Link
                            href={item.actionUrl}
                            className="text-xs font-semibold text-[#296A4B] hover:underline shrink-0"
                          >
                            {item.actionLabel}
                          </Link>
                        </div>
                      ))
                    ) : (
                      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 text-center text-xs text-slate-500">
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
                  className="text-xs font-bold uppercase tracking-wider text-slate-500"
                >
                  Explore Popular Services
                </h2>
                <Link href="/services" className="text-xs font-semibold text-[#296A4B] hover:underline">
                  View all services
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {viewModel.marketplaceContinuation.map((cat) => (
                  <Link
                    key={cat.id}
                    href={cat.href}
                    className="bg-white rounded-xl p-3.5 border border-slate-200/80 hover:border-[#001A41]/40 transition-colors group block"
                  >
                    <h4 className="font-bold text-sm text-[#001A41] group-hover:text-[#296A4B] transition-colors">
                      {cat.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">{cat.description}</p>
                    <div className="mt-2 text-xs font-semibold text-[#296A4B] flex items-center justify-between">
                      <span>{cat.startingPrice}</span>
                      <ChevronRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </main>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MOBILE PERSISTENT BOTTOM NAVIGATION (Customer views only)  */}
      {/* ======================================================== */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-[#001A41] border-t border-white/10 px-2 py-1 flex items-center justify-around shadow-lg"
      >
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center justify-center min-h-[48px] px-3 py-1 text-[11px] font-semibold transition-colors ${
            activeTab === 'home' ? 'text-[#ABEEC8]' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Home className="h-4 w-4 mb-0.5" />
          <span>Home</span>
        </button>

        <button
          onClick={() => setActiveTab('jobs')}
          className={`flex flex-col items-center justify-center min-h-[48px] px-3 py-1 text-[11px] font-semibold transition-colors ${
            activeTab === 'jobs' ? 'text-[#ABEEC8]' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Briefcase className="h-4 w-4 mb-0.5" />
          <span>Jobs</span>
        </button>

        <button
          onClick={() => setActiveNoticeDialog('messages')}
          className="flex flex-col items-center justify-center min-h-[48px] px-3 py-1 text-[11px] font-semibold text-slate-400 hover:text-white transition-colors relative"
        >
          <MessageSquare className="h-4 w-4 mb-0.5" />
          <span>Messages</span>
        </button>

        <button
          onClick={() => setActiveNoticeDialog('notifications')}
          className="flex flex-col items-center justify-center min-h-[48px] px-3 py-1 text-[11px] font-semibold text-slate-400 hover:text-white transition-colors relative"
        >
          <Bell className="h-4 w-4 mb-0.5" />
          <span>Alerts</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center justify-center min-h-[48px] px-3 py-1 text-[11px] font-semibold transition-colors ${
            activeTab === 'profile' ? 'text-[#ABEEC8]' : 'text-slate-400 hover:text-white'
          }`}
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
          aria-label={
            activeNoticeDialog === 'messages' ? 'Direct Messaging Notice' : 'Platform Notifications Notice'
          }
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={closeDialog}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="h-10 w-10 rounded-xl bg-[#001A41]/10 flex items-center justify-center text-[#001A41]">
                {activeNoticeDialog === 'messages' ? (
                  <MessageSquare className="h-5 w-5" />
                ) : (
                  <Bell className="h-5 w-5" />
                )}
              </div>
              <button
                onClick={closeDialog}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                aria-label="Close Notice"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div>
              <h3 className="text-lg font-bold font-display text-[#001A41]">
                {activeNoticeDialog === 'messages'
                  ? 'Direct Messaging in Progress'
                  : 'Platform Notifications in Progress'}
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                {activeNoticeDialog === 'messages'
                  ? 'Direct real-time chat with your chosen BrainWorker is part of our upcoming Customer Platform release. In the meantime, communication is coordinated after booking confirmation under the BukieGuarantee.'
                  : 'Instant dispatch and proposal notification feeds will be enabled when matching services launch. Active work status remains continuously visible on your dashboard.'}
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={closeDialog}
                className="w-full py-2.5 px-4 bg-[#001A41] text-white text-xs font-semibold rounded-xl hover:bg-[#00265E] transition-colors"
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setActiveTab('home')}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold font-display text-[#001A41]">Customer Account Details</h3>
              <button
                onClick={() => setActiveTab('home')}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                aria-label="Close Profile"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <span className="text-slate-500">Full Name</span>
                <span className="font-bold text-slate-900">{viewModel.customer.name}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <span className="text-slate-500">Role</span>
                <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  {viewModel.customer.role}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <span className="text-slate-500">Contact</span>
                <span className="text-slate-700">
                  {viewModel.customer.email || viewModel.customer.phone || 'Protected'}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <span className="text-slate-500">Marketplace Region</span>
                <span className="text-slate-700">Nigeria (Lagos Hub)</span>
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <button
                onClick={handleSignOut}
                className="w-full py-2.5 px-4 bg-red-600 text-white text-xs font-semibold rounded-xl hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
              <button
                onClick={() => setActiveTab('home')}
                className="w-full py-2 px-4 border border-slate-200 text-slate-600 text-xs font-semibold rounded-xl hover:bg-slate-50 transition-colors"
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

'use client';

import React from 'react';
import Link from 'next/link';
import {
  Briefcase,
  Calendar,
  Search,
  PlusCircle,
  AlertTriangle,
  RotateCcw,
  WifiOff,
  CheckCircle2,
} from 'lucide-react';
import { ActivityFilterView } from '@bukiebrainjobs/types';

export function JobsLoadingSkeleton() {
  return (
    <div
      role="region"
      aria-label="Loading activities"
      aria-busy="true"
      className="space-y-4"
    >
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
  );
}

export function JobsFirstRunEmptyState() {
  return (
    <div className="bg-white rounded-2xl p-10 border border-slate-200 shadow-xs text-center my-auto">
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
          <span>Find a Service</span>
        </Link>
        <Link
          href="/post-job"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-sm font-semibold hover:bg-slate-200 transition"
        >
          <PlusCircle className="h-4 w-4 text-slate-500" />
          <span>Post a Job</span>
        </Link>
      </div>
    </div>
  );
}

interface JobsFilteredEmptyStateProps {
  filter: ActivityFilterView;
  onResetFilter: () => void;
}

export function JobsFilteredEmptyState({
  filter,
  onResetFilter,
}: JobsFilteredEmptyStateProps) {
  let title = 'No activities found';
  let message = 'Explore vetted Nigerian services or post a custom job request to get started.';

  if (filter === 'upcoming') {
    title = 'No upcoming activity yet';
    message = 'You do not have any scheduled appointments or bookings in your calendar.';
  } else if (filter === 'active') {
    title = 'No active work right now';
    message = 'No service requests or in-progress jobs are currently awaiting action.';
  } else if (filter === 'past') {
    title = 'No past activity recorded';
    message = 'Completed and cancelled service history will be archived here.';
  }

  return (
    <div className="bg-white rounded-2xl p-10 border border-slate-200 shadow-xs text-center">
      <div className="mx-auto w-12 h-12 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center mb-3">
        <Calendar className="h-6 w-6" />
      </div>
      <h2 className="text-lg font-bold font-display text-[#001A41] mb-1">
        {title}
      </h2>
      <p className="text-slate-500 text-xs sm:text-sm max-w-sm mx-auto mb-5">
        {message}
      </p>
      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={onResetFilter}
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition cursor-pointer"
        >
          View all activity
        </button>
        <Link
          href="/services"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#001A41] text-white text-xs font-semibold hover:bg-[#002661] transition"
        >
          <span>Find a Service</span>
        </Link>
      </div>
    </div>
  );
}

interface JobsPartialFailureNoticeProps {
  onRetry: () => void;
}

export function JobsPartialFailureNotice({ onRetry }: JobsPartialFailureNoticeProps) {
  return (
    <div
      role="alert"
      className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-900"
    >
      <div className="flex items-center gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
        <div className="text-xs sm:text-sm">
          <span className="font-bold">Could not refresh active work.</span> Showing saved offline context.
        </div>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-100/80 hover:bg-amber-200 px-3 py-1.5 rounded-lg transition shrink-0 cursor-pointer"
      >
        <RotateCcw className="h-3.5 w-3.5" />
        <span>Retry active work</span>
      </button>
    </div>
  );
}

export function JobsOfflineBanner() {
  return (
    <div
      role="status"
      className="mb-6 bg-slate-900 text-white rounded-xl p-3.5 flex items-center justify-between gap-3 text-xs shadow-sm"
    >
      <div className="flex items-center gap-2">
        <WifiOff className="h-4 w-4 text-amber-400 shrink-0" />
        <span>
          Offline Mode: Showing cached activity. Online refresh unavailable.
        </span>
      </div>
      <span className="text-slate-400 text-[11px] hidden sm:inline">
        Last verified: Today
      </span>
    </div>
  );
}

interface JobsNewJobNoticeProps {
  notice: { reference: string; title: string };
}

export function JobsNewJobNotice({ notice }: JobsNewJobNoticeProps) {
  return (
    <div className="mb-6 bg-teal-50 border border-teal-200 rounded-xl p-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <CheckCircle2 className="h-5 w-5 text-teal-600 shrink-0" />
        <div className="text-xs sm:text-sm text-teal-900">
          <span className="font-bold">New Request Tracked:</span> {notice.title} ({notice.reference}) is recorded in your activity.
        </div>
      </div>
      <Link
        href={`/post-job?reference=${encodeURIComponent(notice.reference)}`}
        className="text-xs font-bold text-teal-800 hover:text-teal-950 underline shrink-0"
      >
        View Details
      </Link>
    </div>
  );
}

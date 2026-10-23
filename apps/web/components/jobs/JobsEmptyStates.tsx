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
          className="bg-[var(--card-bg)] rounded-lg p-5 border border-[var(--lead)] animate-pulse flex flex-col gap-3"
        >
          <div className="flex items-center justify-between">
            <div className="h-4 w-24 bg-[var(--lead)] rounded" />
            <div className="h-4 w-20 bg-[var(--lead)] rounded" />
          </div>
          <div className="h-5 w-2/3 bg-[var(--lead)] rounded" />
          <div className="h-4 w-1/2 bg-[var(--lead)] rounded" />
        </div>
      ))}
    </div>
  );
}

export function JobsFirstRunEmptyState() {
  return (
    <div className="bg-[var(--card-bg)] rounded-lg p-10 border border-[var(--lead)] shadow-xs text-center my-auto">
      <div className="mx-auto w-16 h-16 rounded-lg bg-[var(--tag-bg)] border border-[var(--lead)] text-[var(--amber)] flex items-center justify-center mb-4">
        <Briefcase className="h-8 w-8 text-[var(--text-muted)]" />
      </div>
      <h2 className="text-xl font-bold font-display text-[var(--text-main)] mb-2">
        Your activity will appear here
      </h2>
      <p className="text-[var(--text-muted)] text-sm max-w-md mx-auto mb-6">
        When you request a service or schedule a booking with a verified BrainWorker, your ongoing work and history will be organized here.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          href="/services"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[var(--amber)] text-[#001A41] text-sm font-bold hover:bg-[var(--amber-hover)] transition cursor-pointer shadow-xs"
        >
          <Search className="h-4 w-4" />
          <span>Find a Service</span>
        </Link>
        <Link
          href="/post-job"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[var(--card-bg)] border border-[var(--lead)] text-[var(--text-main)] text-sm font-bold hover:bg-[var(--card-hover)] transition cursor-pointer shadow-xs"
        >
          <PlusCircle className="h-4 w-4 text-[var(--text-muted)]" />
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
    <div className="bg-[var(--card-bg)] rounded-lg p-10 border border-[var(--lead)] shadow-xs text-center">
      <div className="mx-auto w-12 h-12 rounded-lg bg-[var(--tag-bg)] border border-[var(--lead)] text-[var(--text-muted)] flex items-center justify-center mb-3">
        <Calendar className="h-6 w-6" />
      </div>
      <h2 className="text-lg font-bold font-display text-[var(--text-main)] mb-1">
        {title}
      </h2>
      <p className="text-[var(--text-muted)] text-xs sm:text-sm max-w-sm mx-auto mb-5">
        {message}
      </p>
      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={onResetFilter}
          className="px-4 py-2 rounded-lg text-xs font-bold bg-[var(--card-bg)] border border-[var(--lead)] text-[var(--text-main)] hover:bg-[var(--card-hover)] transition cursor-pointer shadow-xs"
        >
          View all activity
        </button>
        <Link
          href="/services"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[var(--amber)] text-[#001A41] text-xs font-bold hover:bg-[var(--amber-hover)] transition cursor-pointer shadow-xs"
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
      className="mb-6 bg-[var(--amber-dim)] border border-[var(--amber)]/30 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[var(--amber)]"
    >
      <div className="flex items-center gap-3">
        <AlertTriangle className="h-5 w-5 text-[var(--amber)] shrink-0" />
        <div className="text-xs sm:text-sm">
          <span className="font-bold">Could not refresh active work.</span> Showing saved offline context.
        </div>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--amber)] bg-[var(--amber-dim)] hover:bg-amber-500/30 px-3 py-1.5 rounded-lg transition shrink-0 cursor-pointer"
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
      className="mb-6 bg-[var(--card-bg)] border border-[var(--lead)] text-[var(--text-main)] rounded-lg p-3.5 flex items-center justify-between gap-3 text-xs shadow-xs"
    >
      <div className="flex items-center gap-2">
        <WifiOff className="h-4 w-4 text-[var(--amber)] shrink-0" />
        <span>
          Offline Mode: Showing cached activity. Online refresh unavailable.
        </span>
      </div>
      <span className="text-[var(--text-muted)] text-[11px] hidden sm:inline">
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
    <div className="mb-6 bg-teal-500/10 border border-teal-500/30 rounded-lg p-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <CheckCircle2 className="h-5 w-5 text-[var(--brand-green)] shrink-0" />
        <div className="text-xs sm:text-sm text-[var(--text-main)]">
          <span className="font-bold">New Request Tracked:</span> {notice.title} ({notice.reference}) is recorded in your activity.
        </div>
      </div>
      <Link
        href={`/post-job?reference=${encodeURIComponent(notice.reference)}`}
        className="text-xs font-bold text-[var(--brand-green)] hover:underline shrink-0"
      >
        View Details
      </Link>
    </div>
  );
}

'use client';

import React from 'react';
import Link from 'next/link';
import {
  Loader2,
  SearchX,
  AlertTriangle,
  WifiOff,
  ShieldAlert,
  ArrowLeft,
  RotateCcw,
  MapPin,
  FileText,
  Plus,
  Clock,
} from 'lucide-react';
import type { MatchingState } from '@bukiebrainjobs/types';

// ─── Skeleton card for loading state ──────────────────────────────────────────

function MatchCardSkeleton() {
  return (
    <div
      className="bg-white border border-slate-200 rounded-2xl p-5 animate-pulse"
      aria-hidden="true"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-14 h-14 rounded-full bg-slate-200 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-slate-200 rounded w-2/3" />
          <div className="h-3 bg-slate-100 rounded w-1/2" />
        </div>
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-3 bg-slate-100 rounded w-full" />
        <div className="h-3 bg-slate-100 rounded w-4/5" />
        <div className="h-3 bg-slate-100 rounded w-3/5" />
      </div>
      <div className="flex gap-1.5 mb-4">
        <div className="h-5 bg-slate-100 rounded-full w-24" />
        <div className="h-5 bg-slate-100 rounded-full w-20" />
      </div>
      <div className="flex gap-2 pt-3 border-t border-slate-100">
        <div className="flex-1 h-9 bg-slate-100 rounded-xl" />
        <div className="flex-1 h-9 bg-slate-200 rounded-xl" />
      </div>
    </div>
  );
}

// ─── Matching in progress ──────────────────────────────────────────────────────

export function MatchingInProgress() {
  return (
    <div role="status" aria-live="polite" aria-label="Matching is in progress" className="py-16 flex flex-col items-center text-center">
      <div className="w-16 h-16 rounded-full bg-[#e5eeff] flex items-center justify-center mb-5">
        <Loader2 className="h-8 w-8 text-[#001A41] animate-spin" aria-hidden="true" />
      </div>
      <h2 className="font-display font-bold text-xl text-[#001A41] mb-2">
        Matching is in progress
      </h2>
      <p className="text-slate-500 text-sm max-w-xs">
        We are looking for BrainWorkers who may be a good fit for your request. This may take a
        moment.
      </p>
      <div className="mt-6 flex gap-2 flex-wrap justify-center">
        <MatchCardSkeleton />
      </div>
    </div>
  );
}

// ─── Loading skeletons (initial page load) ────────────────────────────────────

export function MatchingLoadingSkeleton() {
  return (
    <section aria-label="Loading match results" aria-busy="true" className="space-y-4">
      <MatchCardSkeleton />
      <MatchCardSkeleton />
      <MatchCardSkeleton />
    </section>
  );
}

// ─── No suitable matches ───────────────────────────────────────────────────────

export function NoMatchesState({
  jobReferenceCode,
  onRetry,
}: {
  jobReferenceCode: string;
  onRetry: () => void;
}) {
  return (
    <div role="status" className="py-14 flex flex-col items-center text-center">
      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-5">
        <SearchX className="h-8 w-8 text-slate-400" aria-hidden="true" />
      </div>
      <h2 className="font-display font-bold text-xl text-[#001A41] mb-2">
        No suitable BrainWorkers yet
      </h2>
      <p className="text-slate-500 text-sm max-w-xs mb-6">
        Matching completed for {jobReferenceCode} but no eligible BrainWorkers were found under
        the current conditions.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
        <button
          type="button"
          onClick={onRetry}
          className="flex-1 inline-flex items-center justify-center gap-1.5 text-sm font-semibold text-[#001A41] border border-[#001A41] rounded-xl py-2.5 px-4 hover:bg-slate-50 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#001A41]"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Try again
        </button>
        <Link
          href="/post-job"
          className="flex-1 inline-flex items-center justify-center gap-1.5 text-sm font-semibold text-white bg-[#001A41] rounded-xl py-2.5 px-4 hover:bg-[#002661] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#001A41]"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Post a new job
        </Link>
      </div>
      <Link
        href="/services"
        className="mt-4 text-sm text-[#296A4B] hover:underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#296A4B] rounded"
      >
        Find a service instead
      </Link>
    </div>
  );
}

// ─── Constraint-limited ────────────────────────────────────────────────────────

export function ConstraintLimitedState({
  constraintLabel,
  jobReferenceCode,
}: {
  constraintLabel: string;
  jobReferenceCode: string;
}) {
  return (
    <div role="status" className="py-14 flex flex-col items-center text-center">
      <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mb-5">
        <MapPin className="h-8 w-8 text-amber-500" aria-hidden="true" />
      </div>
      <h2 className="font-display font-bold text-xl text-[#001A41] mb-2">
        No matches for current conditions
      </h2>
      <p className="text-slate-500 text-sm max-w-xs mb-2">{constraintLabel}</p>
      <p className="text-slate-400 text-xs mb-6">Reference: {jobReferenceCode}</p>
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
        <Link
          href="/jobs"
          className="flex-1 inline-flex items-center justify-center gap-1.5 text-sm font-semibold text-[#001A41] border border-[#001A41] rounded-xl py-2.5 px-4 hover:bg-slate-50 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#001A41]"
        >
          <FileText className="h-4 w-4" aria-hidden="true" />
          Review request
        </Link>
        <Link
          href="/services"
          className="flex-1 inline-flex items-center justify-center gap-1.5 text-sm font-semibold text-white bg-[#001A41] rounded-xl py-2.5 px-4 hover:bg-[#002661] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#001A41]"
        >
          Find a service
        </Link>
      </div>
    </div>
  );
}

// ─── Matching service failure ──────────────────────────────────────────────────

export function MatchingFailedState({ onRetry }: { onRetry: () => void }) {
  return (
    <div role="alert" className="py-14 flex flex-col items-center text-center">
      <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-5">
        <AlertTriangle className="h-8 w-8 text-red-500" aria-hidden="true" />
      </div>
      <h2 className="font-display font-bold text-xl text-[#001A41] mb-2">
        Matching could not complete
      </h2>
      <p className="text-slate-500 text-sm max-w-xs mb-6">
        There was a problem fetching match results. Your job request is still active. Please try
        again or return to your jobs.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
        <button
          type="button"
          onClick={onRetry}
          className="flex-1 inline-flex items-center justify-center gap-1.5 text-sm font-semibold text-[#001A41] border border-[#001A41] rounded-xl py-2.5 px-4 hover:bg-slate-50 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#001A41]"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Try again
        </button>
        <Link
          href="/jobs"
          className="flex-1 inline-flex items-center justify-center gap-1.5 text-sm font-semibold text-white bg-[#001A41] rounded-xl py-2.5 px-4 hover:bg-[#002661] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#001A41]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to jobs
        </Link>
      </div>
    </div>
  );
}

// ─── Offline state ─────────────────────────────────────────────────────────────

export function MatchingOfflineState({ onRetry }: { onRetry: () => void }) {
  return (
    <div role="alert" className="py-14 flex flex-col items-center text-center">
      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-5">
        <WifiOff className="h-8 w-8 text-slate-400" aria-hidden="true" />
      </div>
      <h2 className="font-display font-bold text-xl text-[#001A41] mb-2">
        You appear to be offline
      </h2>
      <p className="text-slate-500 text-sm max-w-xs mb-6">
        Match results cannot be loaded right now. Check your connection and try again.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#001A41] border border-[#001A41] rounded-xl py-2.5 px-5 hover:bg-slate-50 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#001A41]"
      >
        <RotateCcw className="h-4 w-4" aria-hidden="true" />
        Try again
      </button>
    </div>
  );
}

// ─── Invalid / expired context ─────────────────────────────────────────────────

export function InvalidContextState() {
  return (
    <div role="alert" className="py-14 flex flex-col items-center text-center">
      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-5">
        <ShieldAlert className="h-8 w-8 text-slate-400" aria-hidden="true" />
      </div>
      <h2 className="font-display font-bold text-xl text-[#001A41] mb-2">
        Job not found
      </h2>
      <p className="text-slate-500 text-sm max-w-xs mb-6">
        This job request cannot be found or may have expired. Return to your jobs to continue.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
        <Link
          href="/jobs"
          className="flex-1 inline-flex items-center justify-center gap-1.5 text-sm font-semibold text-[#001A41] border border-[#001A41] rounded-xl py-2.5 px-4 hover:bg-slate-50 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#001A41]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to jobs
        </Link>
        <Link
          href="/post-job"
          className="flex-1 inline-flex items-center justify-center gap-1.5 text-sm font-semibold text-white bg-[#001A41] rounded-xl py-2.5 px-4 hover:bg-[#002661] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#001A41]"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Post a new job
        </Link>
      </div>
    </div>
  );
}

// ─── Stale results notice ───────────────────────────────────────────────────────

export function StaleResultsNotice({ onRefresh }: { onRefresh: () => void }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6 text-sm text-amber-900"
    >
      <div className="flex items-start gap-2">
        <Clock className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" aria-hidden="true" />
        <p>
          These match results may no longer be current. Availability and rates may have changed since they were generated.
        </p>
      </div>
      <button
        type="button"
        onClick={onRefresh}
        className="shrink-0 inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-[#001A41] bg-white border border-amber-300 rounded-lg py-1.5 px-3 hover:bg-amber-100/50 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#001A41]"
      >
        <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
        Refresh matches
      </button>
    </div>
  );
}

// ─── Stale results state ────────────────────────────────────────────────────────

export function StaleResultsState({
  jobReferenceCode,
  onRefresh,
}: {
  jobReferenceCode: string;
  onRefresh: () => void;
}) {
  return (
    <div role="status" className="py-14 flex flex-col items-center text-center">
      <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mb-5">
        <Clock className="h-8 w-8 text-amber-600" aria-hidden="true" />
      </div>
      <h2 className="font-display font-bold text-xl text-[#001A41] mb-2">
        Match results may no longer be current
      </h2>
      <p className="text-slate-500 text-sm max-w-xs mb-2">
        These results were generated earlier. Availability, rates, and matches may have changed since then.
      </p>
      <p className="text-slate-400 text-xs mb-6">Reference: {jobReferenceCode}</p>
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
        <button
          type="button"
          onClick={onRefresh}
          className="flex-1 inline-flex items-center justify-center gap-1.5 text-sm font-semibold text-white bg-[#001A41] rounded-xl py-2.5 px-4 hover:bg-[#002661] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#001A41]"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Refresh matches
        </button>
        <Link
          href="/jobs"
          className="flex-1 inline-flex items-center justify-center gap-1.5 text-sm font-semibold text-[#001A41] border border-[#001A41] rounded-xl py-2.5 px-4 hover:bg-slate-50 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#001A41]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to jobs
        </Link>
      </div>
    </div>
  );
}

// ─── Partial results notice ────────────────────────────────────────────────────

export function PartialResultsNotice() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4 text-sm text-amber-800"
    >
      <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" aria-hidden="true" />
      <p>
        Some match information is unavailable right now. Showing the results we could load.
      </p>
    </div>
  );
}

// ─── Auth required ─────────────────────────────────────────────────────────────

export function AuthRequiredState({ returnPath }: { returnPath: string }) {
  return (
    <div role="alert" className="py-14 flex flex-col items-center text-center">
      <div className="w-16 h-16 rounded-full bg-[#e5eeff] flex items-center justify-center mb-5">
        <ShieldAlert className="h-8 w-8 text-[#001A41]" aria-hidden="true" />
      </div>
      <h2 className="font-display font-bold text-xl text-[#001A41] mb-2">
        Session expired
      </h2>
      <p className="text-slate-500 text-sm max-w-xs mb-6">
        Sign in to continue viewing your match results.
      </p>
      <Link
        href={`/login?return=${encodeURIComponent(returnPath)}`}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-[#001A41] rounded-xl py-2.5 px-6 hover:bg-[#002661] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#001A41]"
      >
        Sign in
      </Link>
    </div>
  );
}

// ─── Generic state router (convenience export) ────────────────────────────────

export function MatchStatePanel({
  state,
  jobReferenceCode,
  constraintLabel,
  onRetry,
  returnPath,
}: {
  state: MatchingState;
  jobReferenceCode: string;
  constraintLabel?: string;
  onRetry: () => void;
  returnPath: string;
}) {
  switch (state) {
    case 'in_progress':
      return <MatchingInProgress />;
    case 'no_matches':
      return <NoMatchesState jobReferenceCode={jobReferenceCode} onRetry={onRetry} />;
    case 'constraint_limited':
      return (
        <ConstraintLimitedState
          constraintLabel={constraintLabel ?? 'Some conditions are preventing suitable results.'}
          jobReferenceCode={jobReferenceCode}
        />
      );
    case 'stale_results':
      return <StaleResultsState jobReferenceCode={jobReferenceCode} onRefresh={onRetry} />;
    case 'failed':
      return <MatchingFailedState onRetry={onRetry} />;
    case 'offline':
      return <MatchingOfflineState onRetry={onRetry} />;
    case 'invalid_context':
      return <InvalidContextState />;
    case 'auth_required':
      return <AuthRequiredState returnPath={returnPath} />;
    // matches_available and partial_results are rendered by the parent screen
    default:
      return null;
  }
}

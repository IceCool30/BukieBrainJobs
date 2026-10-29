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
      className="bg-[var(--card-bg)] border border-[var(--lead)] rounded-2xl p-5 animate-pulse shadow-xs"
      aria-hidden="true"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-14 h-14 rounded-xl bg-[var(--lead)] shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-[var(--lead)] rounded-full w-2/3" />
          <div className="h-3 bg-[var(--tag-bg)] rounded-full w-1/2" />
        </div>
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-3 bg-[var(--tag-bg)] rounded-full w-full" />
        <div className="h-3 bg-[var(--tag-bg)] rounded-full w-4/5" />
        <div className="h-3 bg-[var(--tag-bg)] rounded-full w-3/5" />
      </div>
      <div className="flex gap-1.5 mb-4">
        <div className="h-5 bg-[var(--lead)] rounded-full w-24" />
        <div className="h-5 bg-[var(--lead)] rounded-full w-20" />
      </div>
      <div className="flex gap-2 pt-3 border-t border-[var(--lead)]">
        <div className="flex-1 h-9 bg-[var(--tag-bg)] rounded-full" />
        <div className="flex-1 h-9 bg-[var(--lead)] rounded-full" />
      </div>
    </div>
  );
}

// ─── Matching in progress ──────────────────────────────────────────────────────

export function MatchingInProgress() {
  return (
    <div role="status" aria-live="polite" aria-label="Matching is in progress" className="py-16 flex flex-col items-center text-center">
      <div className="w-16 h-16 rounded-full bg-[var(--brand-green-dim)] border border-[var(--brand-green)] flex items-center justify-center mb-5">
        <Loader2 className="h-8 w-8 text-[var(--brand-green)] animate-spin" aria-hidden="true" />
      </div>
      <h2 className="font-display font-bold text-xl text-[var(--text)] mb-2">
        Matching is in progress
      </h2>
      <p className="text-[var(--muted)] text-sm max-w-xs">
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
      <div className="w-16 h-16 rounded-full bg-[var(--tag-bg)] border border-[var(--lead)] flex items-center justify-center mb-5">
        <SearchX className="h-8 w-8 text-[var(--muted)]" aria-hidden="true" />
      </div>
      <h2 className="font-display font-bold text-xl text-[var(--text)] mb-2">
        No suitable BrainWorkers yet
      </h2>
      <p className="text-[var(--muted)] text-sm max-w-xs mb-6">
        Matching completed for {jobReferenceCode} but no eligible BrainWorkers were found under
        the current conditions.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
        <button
          type="button"
          onClick={onRetry}
          className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-[var(--text)] border border-[var(--lead)] rounded-full py-2.5 px-4 hover:bg-[var(--tag-bg)] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--amber)]"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Try again
        </button>
        <Link
          href="/post-job"
          className="outlier-pill-button flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-bold text-[#001A41] bg-[var(--amber)] hover:bg-[var(--amber-hover)] rounded-full py-2.5 px-4 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--amber)] shadow-xs"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Post a new job
        </Link>
      </div>
      <Link
        href="/services"
        className="mt-4 text-xs font-semibold text-[var(--brand-green)] hover:underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-green)] rounded-full"
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
      <div className="w-16 h-16 rounded-full bg-[var(--amber-dim)] border border-[var(--amber)] flex items-center justify-center mb-5">
        <MapPin className="h-8 w-8 text-[var(--amber)]" aria-hidden="true" />
      </div>
      <h2 className="font-display font-bold text-xl text-[var(--text)] mb-2">
        No matches for current conditions
      </h2>
      <p className="text-[var(--muted)] text-sm max-w-xs mb-2">{constraintLabel}</p>
      <p className="text-[var(--muted)] text-xs font-mono mb-6">Reference: {jobReferenceCode}</p>
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
        <Link
          href="/jobs"
          className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-[var(--text)] border border-[var(--lead)] rounded-full py-2.5 px-4 hover:bg-[var(--tag-bg)] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--amber)]"
        >
          <FileText className="h-4 w-4" aria-hidden="true" />
          Review request
        </Link>
        <Link
          href="/services"
          className="outlier-pill-button flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-bold text-[#001A41] bg-[var(--amber)] hover:bg-[var(--amber-hover)] rounded-full py-2.5 px-4 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--amber)] shadow-xs"
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
      <div className="w-16 h-16 rounded-full bg-[var(--danger-dim)] border border-[var(--danger-border)] flex items-center justify-center mb-5">
        <AlertTriangle className="h-8 w-8 text-[var(--danger)]" aria-hidden="true" />
      </div>
      <h2 className="font-display font-bold text-xl text-[var(--text)] mb-2">
        Matching could not complete
      </h2>
      <p className="text-[var(--muted)] text-sm max-w-xs mb-6">
        There was a problem fetching match results. Your job request is still active. Please try
        again or return to your jobs.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
        <button
          type="button"
          onClick={onRetry}
          className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-[var(--text)] border border-[var(--lead)] rounded-full py-2.5 px-4 hover:bg-[var(--tag-bg)] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--amber)]"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Try again
        </button>
        <Link
          href="/jobs"
          className="outlier-pill-button flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-bold text-[#001A41] bg-[var(--amber)] hover:bg-[var(--amber-hover)] rounded-full py-2.5 px-4 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--amber)] shadow-xs"
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
      <div className="w-16 h-16 rounded-full bg-[var(--tag-bg)] border border-[var(--lead)] flex items-center justify-center mb-5">
        <WifiOff className="h-8 w-8 text-[var(--muted)]" aria-hidden="true" />
      </div>
      <h2 className="font-display font-bold text-xl text-[var(--text)] mb-2">
        You appear to be offline
      </h2>
      <p className="text-[var(--muted)] text-sm max-w-xs mb-6">
        Match results cannot be loaded right now. Check your connection and try again.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="outlier-pill-button inline-flex items-center gap-1.5 text-xs font-bold text-[#001A41] bg-[var(--amber)] hover:bg-[var(--amber-hover)] rounded-full py-2.5 px-5 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--amber)] shadow-xs"
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
      <div className="w-16 h-16 rounded-full bg-[var(--tag-bg)] border border-[var(--lead)] flex items-center justify-center mb-5">
        <ShieldAlert className="h-8 w-8 text-[var(--muted)]" aria-hidden="true" />
      </div>
      <h2 className="font-display font-bold text-xl text-[var(--text)] mb-2">
        Job not found
      </h2>
      <p className="text-[var(--muted)] text-sm max-w-xs mb-6">
        This job request cannot be found or may have expired. Return to your jobs to continue.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
        <Link
          href="/jobs"
          className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-[var(--text)] border border-[var(--lead)] rounded-full py-2.5 px-4 hover:bg-[var(--tag-bg)] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--amber)]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to jobs
        </Link>
        <Link
          href="/post-job"
          className="outlier-pill-button flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-bold text-[#001A41] bg-[var(--amber)] hover:bg-[var(--amber-hover)] rounded-full py-2.5 px-4 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--amber)] shadow-xs"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Post a new job
        </Link>
      </div>
    </div>
  );
}

// ─── Stale results notice ───────────────────────────────────────────────────────

export function StaleResultsNotice({
  onRefresh,
  isRefreshing = false,
}: {
  onRefresh: () => void;
  isRefreshing?: boolean;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy={isRefreshing}
      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[var(--amber-dim)] border border-[var(--amber)] rounded-2xl px-4 py-3 mb-6 text-sm text-[var(--text)]"
    >
      <div className="flex items-start gap-2">
        {isRefreshing ? (
          <Loader2 className="h-4 w-4 shrink-0 mt-0.5 text-[var(--amber)] animate-spin" aria-hidden="true" />
        ) : (
          <Clock className="h-4 w-4 shrink-0 mt-0.5 text-[var(--amber)]" aria-hidden="true" />
        )}
        <p>
          {isRefreshing
            ? 'Refreshing match results...'
            : 'These match results may no longer be current. Matches and availability may have changed since they were generated.'}
        </p>
      </div>
      <button
        type="button"
        onClick={onRefresh}
        disabled={isRefreshing}
        aria-busy={isRefreshing}
        className="shrink-0 inline-flex items-center justify-center gap-1.5 text-xs font-bold text-[var(--amber)] bg-[var(--card-bg)] border border-[var(--amber)] rounded-full py-1.5 px-4 hover:bg-[var(--amber)] hover:text-[#001A41] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--amber)] disabled:opacity-60 disabled:cursor-not-allowed shadow-xs"
      >
        {isRefreshing ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
            <span>Refreshing...</span>
          </>
        ) : (
          <>
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Refresh matches</span>
          </>
        )}
      </button>
    </div>
  );
}

// ─── Stale results state ────────────────────────────────────────────────────────

export function StaleResultsState({
  jobReferenceCode,
  onRefresh,
  isRefreshing = false,
}: {
  jobReferenceCode: string;
  onRefresh: () => void;
  isRefreshing?: boolean;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy={isRefreshing}
      className="py-14 flex flex-col items-center text-center"
    >
      <div className="w-16 h-16 rounded-full bg-[var(--amber-dim)] border border-[var(--amber)] flex items-center justify-center mb-5">
        {isRefreshing ? (
          <Loader2 className="h-8 w-8 text-[var(--amber)] animate-spin" aria-hidden="true" />
        ) : (
          <Clock className="h-8 w-8 text-[var(--amber)]" aria-hidden="true" />
        )}
      </div>
      <h2 className="font-display font-bold text-xl text-[var(--text)] mb-2">
        {isRefreshing ? 'Refreshing match results' : 'Match results may no longer be current'}
      </h2>
      <p className="text-[var(--muted)] text-sm max-w-xs mb-2">
        {isRefreshing
          ? 'Checking for current BrainWorker matches. This will only take a moment.'
          : 'These results were generated earlier. Matches and availability may have changed since then.'}
      </p>
      <p className="text-[var(--muted)] text-xs font-mono mb-6">Reference: {jobReferenceCode}</p>
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          aria-busy={isRefreshing}
          className="outlier-pill-button flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-bold text-[#001A41] bg-[var(--amber)] hover:bg-[var(--amber-hover)] rounded-full py-2.5 px-4 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--amber)] disabled:opacity-60 disabled:cursor-not-allowed shadow-xs"
        >
          {isRefreshing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              <span>Refreshing...</span>
            </>
          ) : (
            <>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              <span>Refresh matches</span>
            </>
          )}
        </button>
        <Link
          href="/jobs"
          className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-[var(--text)] border border-[var(--lead)] rounded-full py-2.5 px-4 hover:bg-[var(--tag-bg)] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--amber)]"
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
      className="flex items-start gap-2 bg-[var(--amber-dim)] border border-[var(--amber)] rounded-2xl px-4 py-3 mb-4 text-sm text-[var(--text)]"
    >
      <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-[var(--amber)]" aria-hidden="true" />
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
      <div className="w-16 h-16 rounded-full bg-[var(--tag-bg)] border border-[var(--lead)] flex items-center justify-center mb-5">
        <ShieldAlert className="h-8 w-8 text-[var(--muted)]" aria-hidden="true" />
      </div>
      <h2 className="font-display font-bold text-xl text-[var(--text)] mb-2">
        Session expired
      </h2>
      <p className="text-[var(--muted)] text-sm max-w-xs mb-6">
        Sign in to continue viewing your match results.
      </p>
      <Link
        href={`/login?return=${encodeURIComponent(returnPath)}`}
        className="outlier-pill-button inline-flex items-center gap-1.5 text-xs font-bold text-[#001A41] bg-[var(--amber)] hover:bg-[var(--amber-hover)] rounded-full py-2.5 px-6 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--amber)] shadow-xs"
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
  onRefresh,
  isRefreshing = false,
  returnPath,
}: {
  state: MatchingState;
  jobReferenceCode: string;
  constraintLabel?: string;
  onRetry: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
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
      return (
        <StaleResultsState
          jobReferenceCode={jobReferenceCode}
          onRefresh={onRefresh ?? onRetry}
          isRefreshing={isRefreshing}
        />
      );
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

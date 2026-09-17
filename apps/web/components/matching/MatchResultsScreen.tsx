'use client';

import React, { useState, useEffect, useCallback, useId } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Users } from 'lucide-react';
import type { RankedMatchResult, MatchCandidate, MatchSelectionAction } from '@bukiebrainjobs/types';
import { getMockAuthenticatedUser } from '../../lib/auth/storage';
import { getMatchingRepository } from '../../lib/matching';
import { JobContextPanel } from './JobContextPanel';
import { MatchCard } from './MatchCard';
import {
  MatchingLoadingSkeleton,
  MatchStatePanel,
  PartialResultsNotice,
  StaleResultsNotice,
} from './MatchStates';

// ─── Props ─────────────────────────────────────────────────────────────────────

interface MatchResultsScreenProps {
  /** The durable reference code from the URL segment, treated as untrusted input */
  referenceCode: string;
}

// ─── Screen ────────────────────────────────────────────────────────────────────

/**
 * WEB-012 Customer Job Matching Screen.
 *
 * Renders all nine required states: loading, in_progress, matches_available,
 * partial_results, no_matches, constraint_limited, failed, offline, invalid_context.
 *
 * Entry path: /jobs → Job Request Detail → View Matches → /job/[ref]/matches
 * Return path: /jobs (preserved through auth redirect)
 *
 * Authentication: uses existing mock auth layer. On session failure, redirects
 * through /login with a preserved return destination.
 *
 * ARCH-002: never fabricates a successful result from a failed repository call.
 */
export default function MatchResultsScreen({ referenceCode }: MatchResultsScreenProps) {
  const router = useRouter();
  const headingId = useId();

  // ── Auth ────────────────────────────────────────────────────────────────────
  const [authChecked, setAuthChecked] = useState(false);
  const [customerId, setCustomerId] = useState<string | null>(null);

  useEffect(() => {
    const user = getMockAuthenticatedUser();
    setCustomerId(user?.id ?? null);
    setAuthChecked(true);
  }, []);

  // ── Match result state ──────────────────────────────────────────────────────
  const [result, setResult] = useState<RankedMatchResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  // Track optimistic selection processing
  const [processingCandidateId, setProcessingCandidateId] = useState<string | null>(null);
  // Track toast-style confirmation message
  const [selectionMessage, setSelectionMessage] = useState<string | null>(null);
  // Track refresh in progress
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ── Fetch matching results ──────────────────────────────────────────────────
  const fetchMatches = useCallback(async () => {
    if (!customerId) return;

    setIsLoading(true);
    setLoadError(false);

    try {
      const repo = getMatchingRepository();
      const data = await repo.getMatchesForJob(customerId, referenceCode);
      setResult(data);
    } catch (err) {
      // Programming error (missing params etc.): log and show failure state
      console.error('[WEB-012] Unexpected repository error:', err);
      setLoadError(true);
    } finally {
      setIsLoading(false);
    }
  }, [customerId, referenceCode]);

  // ── Refresh handler (retains existing results without full loading skeleton) ─
  const handleRefresh = useCallback(async () => {
    if (!customerId || isRefreshing) return;

    setIsRefreshing(true);
    setLoadError(false);

    try {
      const repo = getMatchingRepository();
      const data = await repo.getMatchesForJob(customerId, referenceCode);
      setResult(data);
    } catch (err) {
      console.error('[WEB-012] Unexpected repository error during refresh:', err);
      setLoadError(true);
    } finally {
      setIsRefreshing(false);
    }
  }, [customerId, referenceCode, isRefreshing]);

  useEffect(() => {
    if (authChecked && customerId) {
      fetchMatches();
    } else if (authChecked && !customerId) {
      setIsLoading(false);
    }
  }, [authChecked, customerId, fetchMatches]);

  // ── Selection handler ───────────────────────────────────────────────────────
  const handleSelect = useCallback(
    async (candidateId: string) => {
      if (!customerId || !result) return;

      const candidate = result.candidates.find((c) => c.candidateId === candidateId);
      if (!candidate) return;

      const isCurrentlyInterested = candidate.selectionState === 'interest_expressed';
      const actionType = isCurrentlyInterested ? 'WITHDRAW_INTEREST' : 'EXPRESS_INTEREST';

      const action: MatchSelectionAction = {
        type: actionType,
        candidateId,
        jobReferenceCode: referenceCode,
      };

      setProcessingCandidateId(candidateId);
      setSelectionMessage(null);

      try {
        const repo = getMatchingRepository();
        const selectionResult = await repo.recordSelection(customerId, action);

        // Update local result state with new selectionState: no refetch needed
        setResult((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            candidates: prev.candidates.map((c) =>
              c.candidateId === candidateId
                ? { ...c, selectionState: selectionResult.newSelectionState }
                : c
            ),
          };
        });

        setSelectionMessage(selectionResult.confirmationLabel);
        // Auto-clear message after 6 s
        setTimeout(() => setSelectionMessage(null), 6000);
      } catch (err) {
        console.error('[WEB-012] Selection recording failed:', err);
        setSelectionMessage('Something went wrong. Please try again.');
      } finally {
        setProcessingCandidateId(null);
      }
    },
    [customerId, referenceCode, result]
  );

  // ── View profile handler ────────────────────────────────────────────────────
  const handleViewProfile = useCallback(
    (brainWorkerId: string) => {
      // Navigate to BrainWorker profile with job context preserved in URL
      router.push(`/brainworkers/${brainWorkerId}?from=matches&ref=${encodeURIComponent(referenceCode)}`);
    },
    [router, referenceCode]
  );

  const returnPath = `/job/${encodeURIComponent(referenceCode)}/matches`;

  // ── Render: auth check pending ──────────────────────────────────────────────
  if (!authChecked) {
    return (
      <div className="min-h-screen bg-[#f8f9ff] flex items-center justify-center" aria-busy="true" aria-label="Checking session">
        <div className="h-8 w-8 rounded-full border-2 border-[#001A41] border-t-transparent animate-spin" />
      </div>
    );
  }

  // ── Render: session expired ─────────────────────────────────────────────────
  if (authChecked && !customerId) {
    return (
      <main className="min-h-screen bg-[#f8f9ff] flex items-center justify-center p-4">
        <MatchStatePanel
          state="auth_required"
          jobReferenceCode={referenceCode}
          onRetry={fetchMatches}
          returnPath={returnPath}
        />
      </main>
    );
  }

  // ── Render: initial loading ─────────────────────────────────────────────────
  if (isLoading && !result) {
    return (
      <div className="min-h-screen bg-[#f8f9ff]">
        <ScreenShell referenceCode={referenceCode}>
          <MatchingLoadingSkeleton />
        </ScreenShell>
      </div>
    );
  }

  // ── Render: programming error (unexpected repository throw) ─────────────────
  if (loadError) {
    return (
      <div className="min-h-screen bg-[#f8f9ff]">
        <ScreenShell referenceCode={referenceCode}>
          <MatchStatePanel
            state="failed"
            jobReferenceCode={referenceCode}
            onRetry={fetchMatches}
            returnPath={returnPath}
          />
        </ScreenShell>
      </div>
    );
  }

  // ── Render: result available ────────────────────────────────────────────────
  if (!result) return null;

  // Invalid / unowned context: render isolated notice without job context panel
  if (result.state === 'invalid_context') {
    return (
      <div className="min-h-screen bg-[#f8f9ff]">
        <ScreenShell referenceCode={referenceCode} maxWidth="narrow">
          <MatchStatePanel
            state="invalid_context"
            jobReferenceCode={referenceCode}
            onRetry={fetchMatches}
            returnPath={returnPath}
          />
          <div className="mt-8 pt-6 border-t border-slate-200">
            <Link
              href="/jobs"
              className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-[#001A41] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#001A41] rounded"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to jobs
            </Link>
          </div>
        </ScreenShell>
      </div>
    );
  }

  const showCandidates =
    result.state === 'matches_available' ||
    result.state === 'partial_results' ||
    (result.state === 'stale_results' && result.candidates.length > 0);

  const sortedCandidates: MatchCandidate[] = [...result.candidates].sort(
    (a, b) => a.rank - b.rank
  );

  return (
    <div className="min-h-screen bg-[#f8f9ff]">
      <ScreenShell referenceCode={referenceCode}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Job context summary: persistent sticky panel on desktop */}
          <aside className="lg:col-span-4 lg:sticky lg:top-6 self-start">
            <JobContextPanel result={result} />
          </aside>

          {/* Matches column */}
          <div className="lg:col-span-8 space-y-6">
            {/* Selection confirmation message */}
            {selectionMessage && (
              <div
                role="status"
                aria-live="polite"
                aria-atomic="true"
                className="px-4 py-3 bg-[#abeec8]/20 border border-[#abeec8] rounded-xl text-sm text-[#075135]"
              >
                {selectionMessage}
              </div>
            )}

            {/* Partial results notice */}
            {result.state === 'partial_results' && <PartialResultsNotice />}

            {/* Stale results notice */}
            {result.state === 'stale_results' && sortedCandidates.length > 0 && (
              <StaleResultsNotice
                onRefresh={handleRefresh}
                isRefreshing={isRefreshing}
              />
            )}

            {/* State panel for non-candidate states */}
            {!showCandidates && (
              <MatchStatePanel
                state={result.state}
                jobReferenceCode={result.jobReferenceCode}
                {...(result.constraintLabel !== undefined ? { constraintLabel: result.constraintLabel } : {})}
                onRetry={fetchMatches}
                onRefresh={handleRefresh}
                isRefreshing={isRefreshing}
                returnPath={returnPath}
              />
            )}

            {/* Candidates */}
            {showCandidates && sortedCandidates.length > 0 && (
              <section aria-labelledby={headingId}>
                <header className="flex items-center gap-2 mb-4">
                  <Users className="h-5 w-5 text-[#001A41]" aria-hidden="true" />
                  <h2
                    id={headingId}
                    className="font-display font-bold text-[#001A41] text-base"
                  >
                    {sortedCandidates.length === 1
                      ? '1 BrainWorker found'
                      : `${sortedCandidates.length} BrainWorkers found`}
                  </h2>
                </header>
                <p className="text-xs text-slate-500 mb-5">
                  We found BrainWorkers who may be a good fit for your request. Expressing interest does not
                  confirm a booking or assign a BrainWorker.
                </p>
                <ul className="space-y-4" role="list" aria-label="Match results">
                  {sortedCandidates.map((candidate) => (
                    <li key={candidate.candidateId} role="listitem">
                      <MatchCard
                        candidate={candidate}
                        onSelect={handleSelect}
                        onViewProfile={handleViewProfile}
                        isProcessing={processingCandidateId === candidate.candidateId}
                      />
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </div>

        {/* Bottom return link */}
        <div className="mt-8 pt-6 border-t border-slate-200">
          <Link
            href="/jobs"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-[#001A41] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#001A41] rounded"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to jobs
          </Link>
        </div>
      </ScreenShell>
    </div>
  );
}

// ─── Shell wrapper (nav + container) ──────────────────────────────────────────

function ScreenShell({
  referenceCode,
  children,
  maxWidth = 'standard',
}: {
  referenceCode: string;
  children: React.ReactNode;
  maxWidth?: 'standard' | 'narrow';
}) {
  const containerClass =
    maxWidth === 'narrow'
      ? 'max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8'
      : 'max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8';

  return (
    <div className={containerClass}>
      {/* Top nav */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 mb-6 text-sm">
        <Link
          href="/jobs"
          className="text-slate-500 hover:text-[#001A41] transition inline-flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#001A41] rounded"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Jobs
        </Link>
        <span className="text-slate-300" aria-hidden="true">/</span>
        <span className="text-slate-500 truncate max-w-[160px]">{referenceCode}</span>
        <span className="text-slate-300" aria-hidden="true">/</span>
        <span className="text-[#001A41] font-medium">Matches</span>
      </nav>

      <main id="main-content">{children}</main>
    </div>
  );
}

// apps/web/components/disputes/DisputeBookingPageView.tsx
// BW-010: Dispute Handling & Support Interface
// Phase 4 GREEN: Dispute Workspace View Component
// Strictly zero em dashes in comments, identifiers, or UI text.

'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowLeft,
  ShieldAlert,
  WifiOff,
} from 'lucide-react';
import { getMockAuthenticatedUser } from '../../lib/auth/storage';
import type { AuthUser } from '../../lib/auth/types';
import { getDisputeRepository } from '../../lib/disputes/repository';
import {
  type DisputeCategory,
  type DisputeEvidence,
  type DisputeParticipantRole,
  type DisputeRecord,
  UnauthorizedDisputeActionError,
} from '../../lib/disputes/types';
import { getCompletionRepository } from '../../lib/completion/repository';
import type { PostJobCompletionState } from '../../lib/completion/types';
import { DisputeTimelineView } from './DisputeTimelineView';
import { DisputeInitiationModal } from './DisputeInitiationModal';
import { DisputeCounterEvidenceModal } from './DisputeCounterEvidenceModal';
import { BrainWorkerDisputeBanner } from './BrainWorkerDisputeBanner';
import { HelpCenterView } from './HelpCenterView';
import { SupportTicketForm } from './SupportTicketForm';
import { attachDisputeDevHarness } from '../../lib/disputes/testing/dev-harness';

export interface DisputeBookingPageViewProps {
  bookingId: string;
  isOffline?: boolean | undefined;
}

export function DisputeBookingPageView({
  bookingId,
  isOffline: propIsOffline,
}: DisputeBookingPageViewProps): React.ReactElement {
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [completionState, setCompletionState] = useState<PostJobCompletionState | null>(null);
  const [disputeRecord, setDisputeRecord] = useState<DisputeRecord | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNotFound, setIsNotFound] = useState<boolean>(false);
  const [isUnauthorized, setIsUnauthorized] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isCounterModalOpen, setIsCounterModalOpen] = useState<boolean>(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [completionSyncError, setCompletionSyncError] = useState<string | null>(null);
  const [isRetryingSync, setIsRetryingSync] = useState<boolean>(false);
  const [dataVersion, setDataVersion] = useState<number>(0);

  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });

  const loadGenerationRef = useRef<number>(0);

  // Reactive online/offline event listener
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Attach dev harness and listen to dev harness events in non-production environments to refresh data
  useEffect(() => {
    if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
      const handleHarnessSeed = () => {
        setDataVersion((v) => v + 1);
      };
      window.addEventListener('bbj:dispute-seeded', handleHarnessSeed);
      const detach = attachDisputeDevHarness();
      return () => {
        window.removeEventListener('bbj:dispute-seeded', handleHarnessSeed);
        detach();
      };
    }
  }, []);

  const isOffline = propIsOffline ?? !isOnline;
  const targetBookingId = (bookingId || '').trim();
  const activeBookingIdRef = useRef(targetBookingId);
  activeBookingIdRef.current = targetBookingId;

  // Authoritative data loading effect keyed on targetBookingId and dataVersion
  useEffect(() => {
    let isSubscribed = true;
    const currentGeneration = ++loadGenerationRef.current;

    const user = getMockAuthenticatedUser();
    setCurrentUser(user);

    // Reset view state on booking switch
    setCompletionState(null);
    setDisputeRecord(null);
    setIsNotFound(false);
    setIsUnauthorized(false);
    setActionError(null);
    setCompletionSyncError(null);

    if (!user) {
      if (targetBookingId) {
        router.replace(`/login?redirect=${encodeURIComponent(`/disputes/${targetBookingId}`)}`);
      }
      return;
    }

    if (!targetBookingId) {
      setIsNotFound(true);
      setIsLoading(false);
      return;
    }

    const loadBookingData = async () => {
      setIsLoading(true);

      try {
        const completionRepo = getCompletionRepository();
        const disputeRepo = getDisputeRepository();

        let dispute: DisputeRecord | null = null;
        try {
          dispute = await disputeRepo.getDisputeByBookingId(targetBookingId, user.id);
        } catch (disputeErr: unknown) {
          if (disputeErr instanceof UnauthorizedDisputeActionError) {
            setIsUnauthorized(true);
            setIsLoading(false);
            return;
          }
          throw disputeErr;
        }

        const completion = await completionRepo.getCompletionState(targetBookingId);

        if (!isSubscribed || currentGeneration !== loadGenerationRef.current) return;

        // Fail closed if record is absent: zero demo backdoor fabrication
        if (!completion && !dispute) {
          setIsNotFound(true);
          setIsLoading(false);
          return;
        }

        // Fail closed if completion and dispute participant records disagree
        if (completion && dispute) {
          if (
            completion.customerId !== dispute.customerId ||
            completion.brainWorkerId !== dispute.brainWorkerId
          ) {
            setIsUnauthorized(true);
            setIsLoading(false);
            return;
          }
        }

        const validCustomerId = completion?.customerId || dispute?.customerId;
        const validWorkerId = completion?.brainWorkerId || dispute?.brainWorkerId;

        if (user.id !== validCustomerId && user.id !== validWorkerId) {
          setIsUnauthorized(true);
          setIsLoading(false);
          return;
        }

        setCompletionState(completion);
        setDisputeRecord(dispute);
      } catch (err: unknown) {
        if (!isSubscribed || currentGeneration !== loadGenerationRef.current) return;
        setActionError(
          err instanceof Error ? err.message : 'Failed to load booking dispute records.'
        );
      } finally {
        if (isSubscribed && currentGeneration === loadGenerationRef.current) {
          setIsLoading(false);
        }
      }
    };

    void loadBookingData();

    return () => {
      isSubscribed = false;
    };
    // router is omitted from dependencies because Next router identity is not stable across renders and would cause re-fetch churn
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetBookingId, dataVersion]);

  const handleInitiateDispute = async (data: {
    category: DisputeCategory;
    description: string;
    evidence: DisputeEvidence[];
  }) => {
    if (isOffline) {
      throw new Error('Cannot submit dispute while offline. Please restore connection and retry.');
    }
    if (!currentUser || !targetBookingId) {
      throw new Error('Authenticated initiator context required.');
    }
    if (!completionState) {
      throw new Error('Booking completion state not found for dispute initiation.');
    }

    const role: DisputeParticipantRole =
      currentUser.role === 'brainworker' ? 'brainworker' : 'customer';

    const disputeRepo = getDisputeRepository();
    const created = await disputeRepo.createDispute(
      {
        bookingId: targetBookingId,
        bookingStatus: completionState.jobStatus,
        customerId: completionState.customerId,
        brainWorkerId: completionState.brainWorkerId,
        callerId: currentUser.id,
        callerRole: role,
        category: data.category,
        description: data.description,
        totalAmountKobo: completionState.totalSettlementKobo,
        evidence: data.evidence,
      },
      currentUser.id
    );

    // Save created dispute immediately so evidence and filing are never lost
    if (activeBookingIdRef.current !== targetBookingId) return;
    setDisputeRecord(created);
    setIsModalOpen(false);

    // Synchronize completion state with honest failure handling and retry recovery
    const completionRepo = getCompletionRepository();
    try {
      const updatedCompletion = await completionRepo.raiseDispute(
        targetBookingId,
        currentUser.id,
        data.description
      );
      if (activeBookingIdRef.current !== targetBookingId) return;
      setCompletionState(updatedCompletion);
      setCompletionSyncError(null);
    } catch (err: unknown) {
      if (activeBookingIdRef.current !== targetBookingId) return;
      const errorMsg =
        err instanceof Error ? err.message : 'Local completion record could not be updated';
      setCompletionSyncError(
        `Dispute was recorded, but local booking status could not be updated: ${errorMsg}. This preview does not change real escrow or payment status.`
      );
    }
  };

  const handleRetryCompletionSync = async () => {
    if (isOffline) {
      setCompletionSyncError(
        'Cannot retry local booking status update while offline. Please restore connection and retry.'
      );
      return;
    }
    if (!currentUser || !targetBookingId || !disputeRecord) {
      return;
    }

    if (activeBookingIdRef.current !== targetBookingId) return;
    setIsRetryingSync(true);
    try {
      const completionRepo = getCompletionRepository();
      const updatedCompletion = await completionRepo.raiseDispute(
        targetBookingId,
        currentUser.id,
        disputeRecord.description
      );
      if (activeBookingIdRef.current !== targetBookingId) return;
      setCompletionState(updatedCompletion);
      setCompletionSyncError(null);
    } catch (err: unknown) {
      if (activeBookingIdRef.current !== targetBookingId) return;
      const errorMsg =
        err instanceof Error ? err.message : 'Local completion record update failed.';
      setCompletionSyncError(
        `Local booking status update retry failed: ${errorMsg}. This preview does not change real escrow or payment status.`
      );
    } finally {
      if (activeBookingIdRef.current === targetBookingId) {
        setIsRetryingSync(false);
      }
    }
  };

  const handleCounterEvidenceSubmit = async (newEvidenceList: DisputeEvidence[]) => {
    if (isOffline) {
      throw new Error('Cannot submit counter-evidence while offline. Please restore connection and retry.');
    }
    if (!currentUser || !disputeRecord) {
      throw new Error('Authenticated caller and active dispute required.');
    }

    const disputeRepo = getDisputeRepository();
    let latestDispute = await disputeRepo.getDispute(disputeRecord.id, currentUser.id);

    // Filter out items already recorded by id to prevent duplicate evidence or events on retry
    const itemsToSubmit = newEvidenceList.filter((item) => {
      const alreadyExists = latestDispute.evidence.some(
        (existing) => existing.id === item.id
      );
      return !alreadyExists;
    });

    for (const item of itemsToSubmit) {
      latestDispute = await disputeRepo.submitCounterEvidence(
        disputeRecord.id,
        item,
        currentUser.id
      );
    }

    if (activeBookingIdRef.current !== targetBookingId) return;
    setDisputeRecord(latestDispute);
    setIsCounterModalOpen(false);
  };

  if (!currentUser) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6 text-xs text-[var(--text-muted)]">
        Verifying authenticated credentials...
      </div>
    );
  }

  if (isUnauthorized) {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center p-6 text-center">
        <div
          role="alert"
          className="flex flex-col items-center gap-3 rounded-lg border border-[var(--danger-border)] bg-[var(--danger-dim)] p-8 text-[var(--text-main)] shadow-sm max-w-md"
        >
          <ShieldAlert className="h-10 w-10 text-[var(--danger)]" aria-hidden="true" />
          <h1 className="text-lg font-bold text-[var(--danger)]">
            Unauthorized Access
          </h1>
          <p className="text-xs text-[var(--text-muted)] leading-relaxed">
            You are not an authorized participant for this booking dispute. Dispute records are restricted to the customer and assigned BrainWorker recorded on this booking.
          </p>
          <Link
            href="/"
            className="mt-2 inline-flex min-h-[44px] items-center justify-center rounded-md border border-[var(--rule)] bg-[var(--bg)] px-5 text-xs font-semibold text-[var(--text-main)] hover:bg-[var(--lead)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--amber)]"
          >
            Return to Dashboard
          </Link>
        </div>
      </main>
    );
  }

  if (isNotFound) {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center p-6 text-center">
        <div
          role="alert"
          className="flex flex-col items-center gap-3 rounded-lg border border-[var(--rule)] bg-[var(--card-bg)] p-8 text-[var(--text-main)] shadow-sm max-w-md"
        >
          <AlertTriangle className="h-10 w-10 text-[var(--amber)]" aria-hidden="true" />
          <h1 className="text-lg font-bold text-[var(--text-main)]">
            Booking Not Found
          </h1>
          <p className="text-xs text-[var(--text-muted)] leading-relaxed">
            The requested booking reference could not be found in local workspace records. Please check the booking reference or return to your bookings overview.
          </p>
          <Link
            href="/"
            className="mt-2 inline-flex min-h-[44px] items-center justify-center rounded-md bg-[var(--amber)] px-5 text-xs font-semibold text-[var(--amber-text)] shadow-sm hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--amber)]"
          >
            Return to Overview
          </Link>
        </div>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center p-6 text-center">
        <div role="status" className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--rule)] border-t-[var(--amber)]" />
          <span>Loading dispute records...</span>
        </div>
      </main>
    );
  }

  const isBrainWorker = currentUser.role === 'brainworker';
  const roleTitle = isBrainWorker ? 'BrainWorker Dispute Response' : 'Customer Dispute & Support';

  const isEligibleToDispute = Boolean(
    completionState &&
    (completionState.jobStatus === 'IN_PROGRESS' || completionState.jobStatus === 'PENDING_COMPLETION') &&
    !completionState.isDisputed &&
    !disputeRecord
  );

  const isSyncUnconfirmed = Boolean(
    disputeRecord &&
    (!completionState || !completionState.isDisputed || completionSyncError)
  );

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-4 sm:p-6 lg:p-8">
      {/* Offline Status Banner */}
      {isOffline && (
        <div
          role="status"
          className="flex items-center gap-2.5 rounded-lg border border-[var(--lead)] bg-[var(--card-bg)] p-3.5 text-xs text-[var(--text-muted)] shadow-sm"
        >
          <WifiOff className="h-4 w-4 shrink-0 text-[var(--amber)]" aria-hidden="true" />
          <span>Device is currently offline. Mutation actions are disabled until connection is restored.</span>
        </div>
      )}

      {/* Breadcrumb / Back Link */}
      <div className="flex items-center justify-between">
        <Link
          href={isBrainWorker ? `/brainworker/bookings/${targetBookingId}` : `/completion/${targetBookingId}`}
          className="inline-flex min-h-[44px] items-center gap-1.5 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--amber)] rounded-md px-2"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>Back to Booking Detail</span>
        </Link>
        <span className="font-mono text-xs text-[var(--text-muted)]">
          REF: {targetBookingId}
        </span>
      </div>

      {/* Workspace Header */}
      <header className="flex flex-col gap-2 rounded-lg border border-[var(--lead)] bg-[var(--card-bg)] p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--amber)]">
              {roleTitle}
            </span>
            <h1 className="text-xl font-bold text-[var(--text-main)] sm:text-2xl">
              Dispute Workspace Preview: Dispute Resolution and Support
            </h1>
          </div>
          {disputeRecord && (
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${
                disputeRecord.status === 'RESOLVED'
                  ? 'border border-[var(--brand-green)]/30 bg-[var(--brand-green)]/15 text-[var(--brand-green)]'
                  : 'border border-[var(--amber)]/30 bg-[var(--amber)]/15 text-[var(--amber)]'
              }`}
            >
              LOCAL RECORD: {disputeRecord.status.replace(/_/g, ' ')}
            </span>
          )}
        </div>

        <p className="text-xs leading-relaxed text-[var(--text-muted)]">
          {isSyncUnconfirmed
            ? 'This is a local preview workspace and does not manage real escrow, funds, payment or release timers. Local booking record synchronization is unconfirmed.'
            : 'This is a local preview workspace and does not manage real escrow, funds, payment or release timers. In this local preview, simulated auto-release timer is paused and does not hold or move real funds.'}
        </p>

        {isSyncUnconfirmed && (
          <div
            role="alert"
            className="mt-3 flex flex-col gap-2 rounded-md border border-[var(--danger-border)] bg-[var(--danger-dim)] p-3 text-xs text-[var(--danger)] sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 text-[var(--danger)]" aria-hidden="true" />
              <span>
                {completionSyncError ||
                  'Dispute was recorded, but local booking status is not updated in completion records. This preview does not change real escrow or payment status.'}
              </span>
            </div>
            <button
              type="button"
              disabled={isOffline || isRetryingSync}
              onClick={handleRetryCompletionSync}
              className="inline-flex min-h-[36px] shrink-0 items-center justify-center rounded-md border border-[var(--danger-border)] bg-[var(--bg)] px-3 py-1 text-xs font-semibold text-[var(--text-main)] hover:bg-[var(--danger-dim)] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--amber)]"
            >
              {isRetryingSync ? 'Updating Status...' : 'Retry Local Status Update'}
            </button>
          </div>
        )}

        {disputeRecord?.description && (
          <div className="mt-1 flex flex-col gap-1 rounded-md border border-[var(--lead)] bg-[var(--bg)] p-3.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Dispute Description
            </span>
            <p className="text-xs text-[var(--text-main)] leading-relaxed">
              {disputeRecord.description}
            </p>
          </div>
        )}

        {actionError && (
          <div
            role="alert"
            className="mt-2 rounded-md border border-[var(--danger-border)] bg-[var(--danger-dim)] p-3 text-xs text-[var(--danger)]"
          >
            {actionError}
          </div>
        )}
      </header>

      {/* BrainWorker Dispute Alert Banner */}
      {isBrainWorker && disputeRecord && (
        <BrainWorkerDisputeBanner
          dispute={disputeRecord}
          onRespond={() => setIsCounterModalOpen(true)}
        />
      )}

      {/* Main Dispute Activity Timeline */}
      {disputeRecord ? (
        <section aria-label="Dispute timeline and activity">
          <DisputeTimelineView record={disputeRecord} />
        </section>
      ) : (
        <section
          aria-label="Dispute initiation section"
          className="flex flex-col items-center justify-between gap-4 rounded-lg border border-[var(--lead)] bg-[var(--card-bg)] p-6 shadow-sm sm:flex-row"
        >
          <div className="flex flex-col gap-1">
            <h2 className="text-sm font-bold text-[var(--text-main)]">
              File a Booking Dispute
            </h2>
            <p className="text-xs text-[var(--text-muted)]">
              This local prototype allows recording a simulated dispute on this booking for interface review. Real escrow and payments are not affected.
            </p>
          </div>
          <button
            type="button"
            disabled={isOffline || !isEligibleToDispute}
            onClick={() => setIsModalOpen(true)}
            className="flex min-h-[44px] shrink-0 items-center justify-center rounded-md bg-[var(--amber)] px-5 text-xs font-semibold text-[var(--amber-text)] shadow-sm transition hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--amber)]"
          >
            File Dispute
          </button>
        </section>
      )}

      {/* Help Center Section */}
      <section aria-label="Dispute resolution guide and policies">
        <HelpCenterView />
      </section>

      {/* Dedicated Support Ticket Submission */}
      <section aria-label="General support ticket submission">
        <SupportTicketForm
          initialBookingId={targetBookingId}
        />
      </section>

      {/* Dispute Initiation Modal */}
      {isModalOpen && (
        <DisputeInitiationModal
          isOpen={isModalOpen}
          bookingId={targetBookingId}
          initiatorRole={isBrainWorker ? 'BRAINWORKER' : 'CUSTOMER'}
          initiatorId={currentUser.id}
          eligible={isEligibleToDispute}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleInitiateDispute}
        />
      )}

      {/* Dispute Counter-Evidence Modal */}
      {isCounterModalOpen && disputeRecord && (
        <DisputeCounterEvidenceModal
          isOpen={isCounterModalOpen}
          disputeId={disputeRecord.id}
          bookingId={targetBookingId}
          callerId={currentUser.id}
          callerRole={isBrainWorker ? 'brainworker' : 'customer'}
          onClose={() => setIsCounterModalOpen(false)}
          onSubmit={handleCounterEvidenceSubmit}
        />
      )}
    </main>
  );
}

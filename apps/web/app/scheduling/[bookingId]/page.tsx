// apps/web/app/scheduling/[bookingId]/page.tsx
// BW-007 Phase 4: Collaborative Scheduling and Dispatch Route Implementation

'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getMockAuthenticatedUser } from '../../../lib/auth/storage';
import {
  getSchedulingRepository,
  type BookingScheduleRecord,
} from '../../../lib/scheduling/repository';
import type {
  ArrivalWindow,
  DispatchStatus,
  DispatchTrackingView,
  RescheduleReason,
  RescheduleRequest,
} from '../../../lib/scheduling/types';
import type { AuthUser } from '../../../lib/auth/types';
import { ArrivalWindowCard } from '../../../components/scheduling/ArrivalWindowCard';
import { RescheduleProposalModal } from '../../../components/scheduling/RescheduleProposalModal';
import { RescheduleResponseCard } from '../../../components/scheduling/RescheduleResponseCard';
import { DispatchTrackingViewCard } from '../../../components/scheduling/DispatchTrackingViewCard';
import { DispatchStatusUpdater } from '../../../components/scheduling/DispatchStatusUpdater';

export interface SchedulingPageProps {
  params: Promise<{ bookingId: string }>;
}

export default function SchedulingPage({ params }: SchedulingPageProps): React.JSX.Element | null {
  const router = useRouter();

  const [bookingId, setBookingId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [schedule, setSchedule] = useState<BookingScheduleRecord | null>(null);
  const [trackingView, setTrackingView] = useState<DispatchTrackingView | null>(null);
  const [pendingRequest, setPendingRequest] = useState<RescheduleRequest | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [notFound, setNotFound] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProposalModalOpen, setIsProposalModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Resolve bookingId from params
  useEffect(() => {
    let active = true;
    Promise.resolve(params)
      .then((p) => {
        if (active) {
          setBookingId(p.bookingId);
        }
      })
      .catch(() => {
        if (active) {
          setNotFound(true);
          setIsLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [params]);

  // Load schedule and requests
  const loadScheduleData = useCallback(async (id: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const repo = getSchedulingRepository();
      const sched = await repo.getBookingSchedule(id);

      if (!sched) {
        setNotFound(true);
        setIsLoading(false);
        return;
      }

      setSchedule(sched);
      setNotFound(false);

      const [tracking, pending] = await Promise.all([
        repo.deriveCustomerDispatchView(id),
        repo.getPendingRescheduleRequest(id),
      ]);

      setTrackingView(tracking);
      setPendingRequest(pending);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load scheduling data';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Auth and data initialization
  useEffect(() => {
    if (!bookingId) {
      return;
    }

    const user = getMockAuthenticatedUser();
    if (!user) {
      router.replace(`/login?redirect=/scheduling/${bookingId}`);
      return;
    }

    setCurrentUser(user);
    loadScheduleData(bookingId);
  }, [bookingId, router, loadScheduleData]);

  // Handler for technician dispatch update
  const handleUpdateDispatchStatus = async (nextStatus: DispatchStatus) => {
    if (!bookingId) return;
    setIsSubmitting(true);
    try {
      const repo = getSchedulingRepository();
      const updated = await repo.updateDispatchStatus(bookingId, nextStatus);
      setSchedule(updated);
      const tracking = await repo.deriveCustomerDispatchView(bookingId);
      setTrackingView(tracking);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update dispatch status';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler for proposing reschedule
  const handleProposeReschedule = async (input: {
    proposedWindows: ArrivalWindow[];
    reason: RescheduleReason;
    reasonNote?: string | undefined;
  }) => {
    if (!bookingId || !currentUser) return;
    setIsSubmitting(true);
    try {
      const repo = getSchedulingRepository();
      const requesterRole = currentUser.role === 'customer' ? 'CLIENT' : 'TASKER';
      await repo.proposeReschedule({
        bookingId,
        requesterRole,
        requesterId: currentUser.id,
        proposedWindows: input.proposedWindows,
        reason: input.reason,
        ...(input.reasonNote ? { reasonNote: input.reasonNote } : {}),
      });

      setIsProposalModalOpen(false);
      await loadScheduleData(bookingId);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to propose reschedule';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler for accepting reschedule
  const handleAcceptReschedule = async (selectedWindow: ArrivalWindow) => {
    if (!pendingRequest || !bookingId) return;
    setIsSubmitting(true);
    try {
      const repo = getSchedulingRepository();
      await repo.respondReschedule(pendingRequest.id, {
        action: 'ACCEPT',
        selectedWindow,
        ...(currentUser?.id ? { respondedBy: currentUser.id } : {}),
      });
      await loadScheduleData(bookingId);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to accept reschedule';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler for declining reschedule
  const handleDeclineReschedule = async () => {
    if (!pendingRequest || !bookingId) return;
    setIsSubmitting(true);
    try {
      const repo = getSchedulingRepository();
      await repo.respondReschedule(pendingRequest.id, {
        action: 'DECLINE',
        ...(currentUser?.id ? { respondedBy: currentUser.id } : {}),
      });
      await loadScheduleData(bookingId);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to decline reschedule';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler for countering reschedule
  const handleCounterReschedule = async (
    counterWindows: ArrivalWindow[],
    counterReason?: RescheduleReason,
    counterNote?: string
  ) => {
    if (!pendingRequest || !bookingId) return;
    setIsSubmitting(true);
    try {
      const repo = getSchedulingRepository();
      await repo.respondReschedule(pendingRequest.id, {
        action: 'COUNTER',
        counterWindows,
        ...(counterReason ? { counterReason } : {}),
        ...(counterNote ? { counterNote } : {}),
        ...(currentUser?.id ? { respondedBy: currentUser.id } : {}),
      });
      await loadScheduleData(bookingId);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to counter reschedule';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fallback during initial mount / SSR
  if (!bookingId || !currentUser) {
    return null;
  }

  // Not found state
  if (notFound) {
    return (
      <div className="min-h-screen bg-zinc-950 px-4 py-12 text-zinc-100 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8 shadow-sm">
          <div className="flex items-center gap-3 text-rose-400">
            <span className="text-2xl">⚠️</span>
            <h1 className="text-xl font-bold">Booking schedule not found</h1>
          </div>
          <p className="mt-3 text-sm text-zinc-400">
            The booking ID <span className="font-mono text-zinc-300">{bookingId}</span> does not have an active schedule record.
          </p>
          <div className="mt-6 border-t border-zinc-800 pt-4">
            <button
              type="button"
              onClick={() => router.push(currentUser.role === 'customer' ? '/jobs' : '/brainworker/dashboard')}
              className="rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-700"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading && !schedule) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-400">
        <div className="flex items-center gap-2">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
          <span className="text-sm">Loading appointment details...</span>
        </div>
      </div>
    );
  }

  if (!schedule) {
    return null;
  }

  const isCustomer = currentUser.role === 'customer';
  const roleCode = isCustomer ? 'CLIENT' : 'TASKER';

  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-8 text-zinc-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              {isCustomer ? 'Customer Dispatch Portal' : 'Artisan Dispatch Hub'}
            </span>
            <h1 className="text-2xl font-bold text-white sm:text-3xl">
              Appointment Scheduling & Dispatch
            </h1>
            <p className="mt-1 text-sm text-zinc-400">
              Booking Ref: <span className="font-mono text-zinc-300">{schedule.bookingId}</span>
            </p>
          </div>
        </div>

        {errorMessage && (
          <div className="rounded-xl border border-rose-900/60 bg-rose-950/30 p-4 text-sm text-rose-300">
            {errorMessage}
          </div>
        )}

        {/* Customer View */}
        {isCustomer && trackingView && (
          <div className="space-y-6">
            <DispatchTrackingViewCard
              view={trackingView}
              onRefresh={() => loadScheduleData(schedule.bookingId)}
            />
            <ArrivalWindowCard
              arrivalWindow={schedule.agreedArrivalWindow}
              jobStatus={schedule.jobStatus}
              dispatchStatus={schedule.dispatchStatus}
              onRequestReschedule={() => setIsProposalModalOpen(true)}
              canReschedule={schedule.dispatchStatus === 'NOT_STARTED'}
            />
          </div>
        )}

        {/* BrainWorker / Artisan View */}
        {!isCustomer && (
          <div className="space-y-6">
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                Artisan Dispatch Controls
              </span>
              <h3 className="mt-1 text-lg font-bold text-white">
                Update Technician Progression
              </h3>
              <p className="mt-1 text-sm text-zinc-400">
                Mark your operational status as you travel to the job site.
              </p>
              <div className="mt-4">
                <DispatchStatusUpdater
                  dispatchStatus={schedule.dispatchStatus}
                  onUpdateStatus={handleUpdateDispatchStatus}
                  isUpdating={isSubmitting}
                />
              </div>
            </div>

            <ArrivalWindowCard
              arrivalWindow={schedule.agreedArrivalWindow}
              jobStatus={schedule.jobStatus}
              dispatchStatus={schedule.dispatchStatus}
              onRequestReschedule={() => setIsProposalModalOpen(true)}
              canReschedule={schedule.dispatchStatus === 'NOT_STARTED'}
            />
          </div>
        )}

        {/* Reschedule Response Card if pending request exists */}
        {pendingRequest && (
          <div className="space-y-2">
            <RescheduleResponseCard
              request={pendingRequest}
              currentUserRole={roleCode}
              onAccept={handleAcceptReschedule}
              onDecline={handleDeclineReschedule}
              onCounter={handleCounterReschedule}
              isSubmitting={isSubmitting}
            />
          </div>
        )}

        {/* Proposal Modal */}
        <RescheduleProposalModal
          isOpen={isProposalModalOpen}
          onClose={() => setIsProposalModalOpen(false)}
          onSubmitProposal={handleProposeReschedule}
          currentArrivalWindow={schedule.agreedArrivalWindow}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  MapPin,
  Calendar,
  Clock,
  ShieldCheck,
  User,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { CustomerActivityItem, JobStatus } from '@bukiebrainjobs/types';
import { canTransition } from '@bukiebrainjobs/api-types';
import { TypeBadge } from './JobsBadges';
import { LifecycleStepIndicator } from './LifecycleStepIndicator';
import { CancellationModal } from './CancellationModal';

export interface LifecycleStateSurfaceProps {
  activity: CustomerActivityItem;
  onCancel?: ((activityId: string, reason: string) => Promise<void>) | undefined;
  onAccept?: ((activityId: string, invitationId: string, workerId: string) => Promise<void>) | undefined;
  onDecline?: ((activityId: string, invitationId: string, workerId: string, reason?: string) => Promise<void>) | undefined;
  isMutating?: boolean | undefined;
  mutationError?: string | null | undefined;
  onClearMutationError?: (() => void) | undefined;
}

interface StateCopy {
  badgeLabel: string;
  meaningLine: string;
  badgeStyle: 'navy' | 'emerald' | 'amber' | 'slate' | 'rose';
  icon: 'clock' | 'check' | 'alert' | 'cancelled' | 'neutral';
}

function resolveStateCopy(activity: CustomerActivityItem): StateCopy {
  const isDeclined = Boolean(
    activity.declineResponse ||
      (activity.invitation && activity.invitation.accepted === false)
  );

  const jobStatus: JobStatus = activity.jobStatus ?? 'OPEN';

  if (isDeclined) {
    return {
      badgeLabel: 'BrainWorker Declined',
      meaningLine: 'The BrainWorker declined the request.',
      badgeStyle: 'amber',
      icon: 'alert',
    };
  }

  switch (jobStatus) {
    case 'PENDING_ACCEPTANCE':
      return {
        badgeLabel: 'Awaiting Response',
        meaningLine: 'Waiting for the BrainWorker to respond.',
        badgeStyle: 'slate',
        icon: 'clock',
      };
    case 'CONFIRMED':
      return {
        badgeLabel: 'Booking Confirmed',
        meaningLine: 'Your booking is confirmed.',
        badgeStyle: 'navy',
        icon: 'check',
      };
    case 'IN_PROGRESS':
      return {
        badgeLabel: 'In Progress',
        meaningLine: 'BrainWorker is actively delivering the service.',
        badgeStyle: 'amber',
        icon: 'clock',
      };
    case 'PENDING_COMPLETION':
      return {
        badgeLabel: 'Pending Completion',
        meaningLine: 'Service delivery pending completion confirmation.',
        badgeStyle: 'slate',
        icon: 'clock',
      };
    case 'COMPLETED':
      return {
        badgeLabel: 'Completed',
        meaningLine: 'Service delivery completed.',
        badgeStyle: 'emerald',
        icon: 'check',
      };
    case 'PAID':
      return {
        badgeLabel: 'Completed & Paid',
        meaningLine: 'Service delivery completed and payment settled.',
        badgeStyle: 'emerald',
        icon: 'check',
      };
    case 'CANCELLED':
      return {
        badgeLabel: 'Cancelled',
        meaningLine: 'Your booking was cancelled.',
        badgeStyle: 'slate',
        icon: 'cancelled',
      };
    case 'EXPIRED':
      return {
        badgeLabel: 'Expired',
        meaningLine: 'The request expired without a response.',
        badgeStyle: 'slate',
        icon: 'neutral',
      };
    case 'DISPUTED':
      return {
        badgeLabel: 'Disputed',
        meaningLine: 'Booking is currently under dispute resolution.',
        badgeStyle: 'rose',
        icon: 'alert',
      };
    case 'RESOLVED':
      return {
        badgeLabel: 'Resolved',
        meaningLine: 'Dispute has been resolved.',
        badgeStyle: 'emerald',
        icon: 'check',
      };
    case 'OPEN':
    default:
      return {
        badgeLabel: 'Request Received',
        meaningLine: 'Request recorded and awaiting worker matching.',
        badgeStyle: 'slate',
        icon: 'clock',
      };
  }
}

export function LifecycleStateSurface({
  activity,
  onCancel,
  onAccept,
  onDecline,
  isMutating = false,
  mutationError = null,
  onClearMutationError,
}: LifecycleStateSurfaceProps) {
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [localActionPending, setLocalActionPending] = useState(false);

  const isDeclined = Boolean(
    activity.declineResponse ||
      (activity.invitation && activity.invitation.accepted === false)
  );
  const currentJobStatus: JobStatus = activity.jobStatus ?? 'OPEN';
  const stateCopy = resolveStateCopy(activity);

  // Check if cancellation is permitted by state machine
  const canCancel = canTransition(currentJobStatus, 'CANCELLED');

  // Handle cancellation execution
  const handleConfirmCancel = async (reason: string) => {
    if (!onCancel) return;
    setLocalActionPending(true);
    try {
      await onCancel(activity.id, reason);
      setIsCancelModalOpen(false);
    } finally {
      setLocalActionPending(false);
    }
  };

  // Simulation handler for acceptance
  const handleSimulateAccept = async () => {
    if (!onAccept) return;
    const invitationId = activity.invitation?.id || `inv-${activity.id}-sim`;
    const workerId = activity.invitation?.taskerProfileId || 'bw-simulated-artisan';
    setLocalActionPending(true);
    try {
      await onAccept(activity.id, invitationId, workerId);
    } finally {
      setLocalActionPending(false);
    }
  };

  // Simulation handler for decline
  const handleSimulateDecline = async () => {
    if (!onDecline) return;
    const invitationId = activity.invitation?.id || `inv-${activity.id}-sim`;
    const workerId = activity.invitation?.taskerProfileId || 'bw-simulated-artisan';
    setLocalActionPending(true);
    try {
      await onDecline(
        activity.id,
        invitationId,
        workerId,
        'The BrainWorker is fully committed on another project.'
      );
    } finally {
      setLocalActionPending(false);
    }
  };

  const isPending = isMutating || localActionPending;

  return (
    <div
      className="space-y-6"
      role="region"
      aria-label="Booking Lifecycle Surface"
      aria-busy={isPending}
    >
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* BLOCK 1: Current State Block                                    */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section
        aria-label="Current Booking State"
        className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <TypeBadge type={activity.type} />
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                stateCopy.badgeStyle === 'navy'
                  ? 'bg-[#001A41] text-white'
                  : stateCopy.badgeStyle === 'emerald'
                  ? 'bg-emerald-100 text-[#296A4B] border border-emerald-200'
                  : stateCopy.badgeStyle === 'amber'
                  ? 'bg-amber-100 text-amber-900 border border-amber-200'
                  : stateCopy.badgeStyle === 'rose'
                  ? 'bg-rose-100 text-rose-900 border border-rose-200'
                  : 'bg-slate-200 text-slate-800'
              }`}
            >
              {stateCopy.icon === 'check' && (
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              )}
              {stateCopy.icon === 'alert' && (
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              )}
              {stateCopy.icon === 'cancelled' && (
                <XCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              )}
              {stateCopy.icon === 'clock' && (
                <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              )}
              {stateCopy.icon === 'neutral' && (
                <HelpCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              )}
              <span>{stateCopy.badgeLabel}</span>
            </span>
          </div>

          <span className="text-xs font-mono text-slate-500">
            Ref: <span className="font-bold text-slate-700">{activity.referenceCode}</span>
          </span>
        </div>

        <div className="mt-3">
          <p
            className="text-sm sm:text-base font-semibold text-[#001A41] font-display"
            aria-live="polite"
          >
            {stateCopy.meaningLine}
          </p>
          {isDeclined && activity.declineResponse?.declineReason && (
            <p className="text-xs text-slate-600 mt-1">
              Note from BrainWorker: {activity.declineResponse.declineReason}
            </p>
          )}
          {currentJobStatus === 'CANCELLED' && activity.cancellationReason && (
            <p className="text-xs text-slate-600 mt-1">
              Cancellation reason: {activity.cancellationReason}
            </p>
          )}
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* BLOCK 2: Lifecycle Position                                     */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section aria-label="Lifecycle Position" className="py-2">
        <LifecycleStepIndicator jobStatus={currentJobStatus} isDeclined={isDeclined} />
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* BLOCK 3: Context Block                                          */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section aria-label="Job Details and Context" className="space-y-4">
        <div>
          <h3 className="text-xl sm:text-2xl font-bold font-display text-[#001A41]">
            {activity.title}
          </h3>
          {activity.service && (
            <p className="text-xs sm:text-sm font-semibold text-[#296A4B] mt-0.5">
              {activity.service}
            </p>
          )}
        </div>

        {/* Quick Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Schedule Context vs Confirmed Commitment */}
          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100 flex items-start gap-3">
            <Calendar className="h-4 w-4 text-[#001A41] shrink-0 mt-0.5" aria-hidden="true" />
            <div className="text-xs">
              <span className="block text-slate-400 font-medium">
                {activity.confirmedSchedule ? 'Confirmed Schedule' : 'Requested Schedule'}
              </span>
              <span
                className={`mt-0.5 block font-semibold ${
                  activity.confirmedSchedule ? 'text-[#296A4B]' : 'text-slate-900'
                }`}
              >
                {activity.confirmedSchedule || activity.schedule}
              </span>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100 flex items-start gap-3">
            <MapPin className="h-4 w-4 text-[#001A41] shrink-0 mt-0.5" aria-hidden="true" />
            <div className="text-xs">
              <span className="block text-slate-400 font-medium">Location</span>
              <span className="font-semibold text-slate-900 mt-0.5 block">
                {activity.location}
              </span>
            </div>
          </div>

          {activity.budgetOrPrice && (
            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100 flex items-start gap-3">
              <Clock className="h-4 w-4 text-[#001A41] shrink-0 mt-0.5" aria-hidden="true" />
              <div className="text-xs">
                <span className="block text-slate-400 font-medium">
                  {activity.type === 'booking' ? 'Estimated Fee' : 'Budget'}
                </span>
                <span className="font-semibold text-slate-900 mt-0.5 block">
                  {activity.budgetOrPrice}
                </span>
              </div>
            </div>
          )}

          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100 flex items-start gap-3">
            <ShieldCheck className="h-4 w-4 text-[#296A4B] shrink-0 mt-0.5" aria-hidden="true" />
            <div className="text-xs">
              <span className="block text-slate-400 font-medium">Safety Standard</span>
              <span className="font-semibold text-slate-900 mt-0.5 block">
                Verified Identity & Community Standards
              </span>
            </div>
          </div>
        </div>

        {/* Selected or Preferred BrainWorker */}
        {activity.preferredWorker && (
          <div className="pt-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              {currentJobStatus === 'CONFIRMED' ||
              currentJobStatus === 'IN_PROGRESS' ||
              currentJobStatus === 'COMPLETED'
                ? 'Confirmed Professional'
                : 'Preferred Professional'}
            </h4>
            <div className="bg-blue-50/40 rounded-xl p-4 border border-blue-100/80 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-100 text-[#001A41] flex items-center justify-center font-bold text-xs shrink-0">
                  <User className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-bold text-[#001A41]">
                    {activity.preferredWorker.name}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {currentJobStatus === 'CONFIRMED' ||
                    currentJobStatus === 'IN_PROGRESS' ||
                    currentJobStatus === 'COMPLETED'
                      ? 'Confirmed BrainWorker'
                      : 'Customer Preference • Not assigned'}
                  </div>
                </div>
              </div>
              {activity.preferredWorker.verified && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#296A4B] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 shrink-0">
                  <ShieldCheck className="h-3 w-3" />
                  Verified
                </span>
              )}
            </div>
          </div>
        )}

        {/* Job Overview Description */}
        {activity.description && (
          <div className="pt-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Job Overview & Requirements
            </h4>
            <div className="bg-slate-50/70 rounded-xl p-4 border border-slate-100 text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {activity.description}
            </div>
          </div>
        )}
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* BLOCK 4: Action Block                                           */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section
        aria-label="Lifecycle Actions"
        className="pt-4 border-t border-slate-100 space-y-3"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            Reference code: <span className="font-mono font-bold text-slate-700">{activity.referenceCode}</span>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Primary actions based on lifecycle state */}
            {isDeclined && (
              <Link
                href={`/job/${encodeURIComponent(activity.referenceCode || activity.id)}/matches`}
                className="px-4 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition bg-[#001A41] text-white hover:bg-[#002661] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#001A41]"
              >
                <span>Review Alternatives</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            )}

            {currentJobStatus === 'EXPIRED' && (
              <Link
                href="/post-job"
                className="px-4 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition bg-[#001A41] text-white hover:bg-[#002661] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#001A41]"
              >
                <span>Recreate Request</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            )}

            {currentJobStatus === 'CANCELLED' && (
              <Link
                href="/post-job"
                className="px-4 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition bg-slate-100 text-slate-700 hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#001A41]"
              >
                <span>Post a New Job</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            )}

            {currentJobStatus === 'OPEN' && (
              <Link
                href={`/job/${encodeURIComponent(activity.referenceCode || activity.id)}/matches`}
                className="px-4 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition border border-[#001A41] text-[#001A41] hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#001A41]"
              >
                <span>View BrainWorker matches</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            )}

            {/* Secondary / Destructive Cancellation Button */}
            {canCancel && onCancel && (
              <button
                type="button"
                onClick={() => setIsCancelModalOpen(true)}
                disabled={isPending}
                className="px-4 py-2 rounded-xl text-xs font-semibold border border-rose-200 text-rose-700 hover:bg-rose-50 transition disabled:opacity-50 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
              >
                {currentJobStatus === 'CONFIRMED' ? 'Cancel Booking' : 'Cancel Request'}
              </button>
            )}
          </div>
        </div>

        {/* Deterministic Simulation Controls (Accessible in dev/mock verification) */}
        {currentJobStatus === 'PENDING_ACCEPTANCE' && !isDeclined && onAccept && onDecline && (
          <div className="mt-3 p-3.5 rounded-xl bg-slate-100/80 border border-slate-200 space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Simulate Worker Response (Mock Environment)</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleSimulateAccept}
                disabled={isPending}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#296A4B] text-white hover:bg-[#23583E] transition disabled:opacity-50 cursor-pointer"
              >
                Simulate Acceptance
              </button>
              <button
                type="button"
                onClick={handleSimulateDecline}
                disabled={isPending}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-200 text-slate-700 hover:bg-slate-300 transition disabled:opacity-50 cursor-pointer"
              >
                Simulate Decline
              </button>
            </div>
          </div>
        )}
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* BLOCK 5: Recovery Block                                         */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {mutationError && (
        <section
          aria-label="Action Error Notice"
          className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-900 flex items-start justify-between gap-3"
        >
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" aria-hidden="true" />
            <div className="text-xs">
              <p className="font-bold">Action could not complete</p>
              <p className="text-rose-700 mt-0.5">{mutationError}</p>
            </div>
          </div>
          {onClearMutationError && (
            <button
              type="button"
              onClick={onClearMutationError}
              className="p-1 text-rose-600 hover:text-rose-800 text-xs font-semibold cursor-pointer"
              aria-label="Dismiss error notice"
            >
              Dismiss
            </button>
          )}
        </section>
      )}

      {/* Cancellation Modal */}
      <CancellationModal
        isOpen={isCancelModalOpen}
        referenceCode={activity.referenceCode}
        isPending={isPending}
        onConfirm={handleConfirmCancel}
        onClose={() => setIsCancelModalOpen(false)}
      />
    </div>
  );
}

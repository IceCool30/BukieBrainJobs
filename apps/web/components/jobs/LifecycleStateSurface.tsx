'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  MapPin,
  Calendar,
  Clock,
  User,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ShieldCheck,
  Receipt,
  RotateCcw,
} from 'lucide-react';
import { CustomerActivityItem, JobStatus } from '@bukiebrainjobs/types';
import { canTransition } from '@bukiebrainjobs/api-types';
import { TypeBadge } from './JobsBadges';
import { LifecycleStepIndicator } from './LifecycleStepIndicator';
import { CancellationModal } from './CancellationModal';
import { getCustomerPaymentRepository } from '../../lib/payment/repository';
import type {
  PaymentContext,
  PaymentReceipt,
  PaymentAuthorizationStatus,
} from '../../lib/payment/types';
import {
  EscrowProtectionTracker,
  CheckoutModal,
  CompletionInspectionCard,
  ReceiptModal,
  RefundRequestModal,
  DisputeModal,
} from '../payment';
import { getMockAuthenticatedUser } from '../../lib/auth/storage';

export interface LifecycleStateSurfaceProps {
  activity: CustomerActivityItem;
  onCancel?: ((activityId: string, reason: string) => Promise<void>) | undefined;
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
  const jobStatus: JobStatus = activity.jobStatus ?? 'OPEN';
  const isDeclined =
    jobStatus === 'PENDING_ACCEPTANCE' &&
    Boolean(
      activity.declineResponse ||
        (activity.invitation && activity.invitation.accepted === false)
    );

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
    case 'PAID':
      return {
        badgeLabel: 'Completed',
        meaningLine: 'Service delivery completed.',
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
  isMutating = false,
  mutationError = null,
  onClearMutationError,
}: LifecycleStateSurfaceProps) {
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [localActionPending, setLocalActionPending] = useState(false);

  // Payment and Escrow State (WEB-015)
  const [paymentContext, setPaymentContext] = useState<PaymentContext | null>(null);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
  const [receiptData, setReceiptData] = useState<PaymentReceipt | null>(null);
  const [isPaymentActionPending, setIsPaymentActionPending] = useState(false);

  // Authenticated customer resolution
  const user = getMockAuthenticatedUser();
  const customerId = user?.id || 'usr-customer-default';

  const currentJobStatus: JobStatus = activity.jobStatus ?? 'OPEN';
  const isDeclined =
    currentJobStatus === 'PENDING_ACCEPTANCE' &&
    Boolean(
      activity.declineResponse ||
        (activity.invitation && activity.invitation.accepted === false)
    );
  const stateCopy = resolveStateCopy(activity);

  // Load payment context when activity or status updates
  React.useEffect(() => {
    const isFinancialState =
      currentJobStatus === 'CONFIRMED' ||
      currentJobStatus === 'IN_PROGRESS' ||
      currentJobStatus === 'PENDING_COMPLETION' ||
      currentJobStatus === 'COMPLETED' ||
      currentJobStatus === 'PAID' ||
      currentJobStatus === 'CANCELLED' ||
      currentJobStatus === 'DISPUTED';

    if (!isFinancialState) {
      setPaymentContext(null);
      return;
    }

    const repo = getCustomerPaymentRepository();
    repo
      .getPaymentContext(customerId, activity.id, {
        jobStatus: currentJobStatus,
        serviceTitle: activity.title,
        workerName: activity.preferredWorker?.name || 'Assigned BrainWorker',
        serviceLocation: activity.location || 'Lagos, Nigeria',
        baseAmountNaira: 20000,
      })
      .then((ctx) => {
        setPaymentContext(ctx);
      })
      .catch(() => {
        setPaymentContext(null);
      });
  }, [
    activity.id,
    currentJobStatus,
    customerId,
    activity.title,
    activity.preferredWorker?.name,
    activity.location,
  ]);

  const handleOpenCheckout = async () => {
    const repo = getCustomerPaymentRepository();
    try {
      const session = await repo.initiateCheckout(
        customerId,
        {
          bookingId: activity.id,
          idempotencyKey: `idem-chk-${activity.id}-${Date.now()}`,
        },
        {
          jobStatus: currentJobStatus,
          serviceTitle: activity.title,
          workerName: activity.preferredWorker?.name || 'Assigned BrainWorker',
          serviceLocation: activity.location || 'Lagos, Nigeria',
          baseAmountNaira: 20000,
        }
      );
      setPaymentContext((prev) => (prev ? { ...prev, activeCheckoutSession: session } : null));
      setIsCheckoutModalOpen(true);
    } catch {
      // Fail-closed
    }
  };

  const handleVerifyPayment = async (checkoutReference: string) => {
    const repo = getCustomerPaymentRepository();
    const result = await repo.verifyPayment(customerId, checkoutReference);
    const updated = await repo.getPaymentContext(customerId, activity.id);
    setPaymentContext(updated);
    return result;
  };

  const handleCheckStatus = async (checkoutReference: string) => {
    const repo = getCustomerPaymentRepository();
    const result = await repo.checkVerificationStatus(customerId, checkoutReference);
    const updated = await repo.getPaymentContext(customerId, activity.id);
    setPaymentContext(updated);
    return result;
  };

  const handleReleaseEscrow = async (feedback?: string, rating?: number) => {
    const repo = getCustomerPaymentRepository();
    await repo.releaseEscrow(customerId, {
      bookingId: activity.id,
      customerFeedback: feedback,
      customerRating: rating,
    });
    const updated = await repo.getPaymentContext(customerId, activity.id);
    setPaymentContext(updated);
  };

  const handleRetryRelease = async () => {
    setIsPaymentActionPending(true);
    try {
      const repo = getCustomerPaymentRepository();
      await repo.retryRelease(customerId, activity.id);
      const updated = await repo.getPaymentContext(customerId, activity.id);
      setPaymentContext(updated);
    } finally {
      setIsPaymentActionPending(false);
    }
  };

  const handleDisputeEscrow = async (reason: string, description: string) => {
    const repo = getCustomerPaymentRepository();
    await repo.disputeEscrow(customerId, {
      bookingId: activity.id,
      reason,
      description,
    });
    const updated = await repo.getPaymentContext(customerId, activity.id);
    setPaymentContext(updated);
  };

  const handleRequestRefund = async (reason: string, notes?: string) => {
    const repo = getCustomerPaymentRepository();
    await repo.requestRefund(customerId, {
      bookingId: activity.id,
      reason,
      notes,
    });
    const updated = await repo.getPaymentContext(customerId, activity.id);
    setPaymentContext(updated);
  };

  const handleOpenReceipt = async () => {
    const repo = getCustomerPaymentRepository();
    try {
      const rec = await repo.getReceipt(customerId, activity.id);
      setReceiptData(rec);
      setIsReceiptModalOpen(true);
    } catch {
      // Receipt not available
    }
  };

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
      {/* ESCROW & PAYMENT SECTION (WEB-015)                              */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {paymentContext && (
        <section aria-label="Payment and Escrow Protection" className="space-y-4">
          <EscrowProtectionTracker
            escrowStatus={paymentContext.escrowStatus}
            settlementStatus={
              paymentContext.receiptAvailable
                ? paymentContext.escrowStatus === 'released'
                  ? 'settled'
                  : paymentContext.escrowStatus === 'release_pending'
                  ? 'release_pending'
                  : 'funded'
                : undefined
            }
            onRetryRelease={handleRetryRelease}
            isRetrying={isPaymentActionPending}
          />

          {/* Prompt to Fund Escrow for CONFIRMED bookings */}
          {currentJobStatus === 'CONFIRMED' && paymentContext.escrowStatus === 'unfunded' && (
            <div className="rounded-2xl border-2 border-emerald-500/40 bg-emerald-50/50 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#296A4B]">
                  Funding Required to Authorize Service
                </span>
                <h4 className="text-sm sm:text-base font-display font-bold text-[#001A41]">
                  Deposit agreed fee into secure BukieGuarantee escrow
                </h4>
                <p className="text-xs text-slate-600">
                  Total Payable: ₦{paymentContext.pricing.totalPayableNaira.toLocaleString()} (including transparent protection fee and VAT).
                </p>
              </div>

              <button
                type="button"
                onClick={handleOpenCheckout}
                className="min-h-[48px] px-5 py-2.5 rounded-xl bg-[#296A4B] hover:bg-[#20543B] text-white text-xs font-semibold inline-flex items-center justify-center gap-2 transition cursor-pointer shrink-0 shadow-xs"
              >
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                <span>Fund Escrow (₦{paymentContext.pricing.totalPayableNaira.toLocaleString()})</span>
              </button>
            </div>
          )}

          {/* Completion Inspection Card for PENDING_COMPLETION */}
          {currentJobStatus === 'PENDING_COMPLETION' && paymentContext.escrowStatus === 'held_in_escrow' && (
            <CompletionInspectionCard
              bookingId={activity.id}
              workerName={activity.preferredWorker?.name || 'BrainWorker'}
              serviceTitle={activity.title}
              amountNaira={paymentContext.pricing.totalPayableNaira}
              isOffline={false}
              onReleaseEscrow={handleReleaseEscrow}
              onOpenDisputeModal={() => setIsDisputeModalOpen(true)}
            />
          )}

          {/* Dispute Notice Banner */}
          {currentJobStatus === 'DISPUTED' && (
            <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-xs text-amber-900 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <p className="font-bold">BukieGuarantee Dispute In Progress</p>
                <p className="mt-0.5 text-amber-800">
                  Payouts for this job are frozen under escrow. A mediation specialist is reviewing the case to resolve the claim.
                </p>
              </div>
            </div>
          )}
        </section>
      )}

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
        </div>

        {/* Selected or Preferred BrainWorker */}
        {activity.preferredWorker && (
          <div className="pt-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Assigned BrainWorker
            </h4>
            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#001A41] text-white flex items-center justify-center font-bold text-xs">
                  <User className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-bold text-[#001A41]">
                    {activity.preferredWorker.name}
                  </div>
                </div>
              </div>
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
            {/* View Digital Receipt */}
            {paymentContext?.receiptAvailable && (
              <button
                type="button"
                onClick={handleOpenReceipt}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 border border-slate-300 text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                <Receipt className="h-3.5 w-3.5 text-[#001A41]" aria-hidden="true" />
                <span>View Receipt</span>
              </button>
            )}

            {/* Request Escrow Refund for Cancelled Funded Booking */}
            {currentJobStatus === 'CANCELLED' &&
              paymentContext &&
              (paymentContext.escrowStatus === 'held_in_escrow' ||
                paymentContext.escrowStatus === 'refund_failed') && (
                <button
                  type="button"
                  onClick={() => setIsRefundModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 border border-rose-300 bg-rose-50 text-rose-800 hover:bg-rose-100 transition cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Request Refund</span>
                </button>
              )}

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
        jobStatus={currentJobStatus}
        isPending={isPending}
        onConfirm={handleConfirmCancel}
        onClose={() => setIsCancelModalOpen(false)}
      />

      {/* WEB-015 Payment & Escrow Modals */}
      {paymentContext && (
        <>
          <CheckoutModal
            isOpen={isCheckoutModalOpen}
            onClose={() => setIsCheckoutModalOpen(false)}
            bookingId={activity.id}
            referenceCode={activity.referenceCode}
            serviceTitle={activity.title}
            workerName={activity.preferredWorker?.name || 'Assigned BrainWorker'}
            pricing={paymentContext.pricing}
            session={paymentContext.activeCheckoutSession || null}
            isOffline={false}
            onVerifyPayment={handleVerifyPayment}
            onCheckStatus={handleCheckStatus}
            onSuccess={() => setIsCheckoutModalOpen(false)}
          />

          <ReceiptModal
            isOpen={isReceiptModalOpen}
            onClose={() => setIsReceiptModalOpen(false)}
            receipt={receiptData}
          />

          <RefundRequestModal
            isOpen={isRefundModalOpen}
            onClose={() => setIsRefundModalOpen(false)}
            bookingId={activity.id}
            amountNaira={paymentContext.pricing.totalPayableNaira}
            isOffline={false}
            onSubmitRefund={handleRequestRefund}
          />

          <DisputeModal
            isOpen={isDisputeModalOpen}
            onClose={() => setIsDisputeModalOpen(false)}
            bookingId={activity.id}
            isOffline={false}
            onSubmitDispute={handleDisputeEscrow}
          />
        </>
      )}
    </div>
  );
}

'use client';

import React from 'react';
import { ShieldCheck, CheckCircle2, AlertCircle, Clock, AlertTriangle, RefreshCw } from 'lucide-react';
import type { EscrowStatus, SettlementStatus } from '../../lib/payment/types';

interface EscrowProtectionTrackerProps {
  escrowStatus: EscrowStatus;
  settlementStatus?: SettlementStatus | undefined;
  onRetryRelease?: () => void;
  isRetrying?: boolean | undefined;
}

export function EscrowProtectionTracker({
  escrowStatus,
  settlementStatus,
  onRetryRelease,
  isRetrying = false,
}: EscrowProtectionTrackerProps) {
  // Resolve status presentation model
  const resolveStatusBadge = () => {
    switch (escrowStatus) {
      case 'unfunded':
        return {
          label: 'Awaiting Escrow Funding',
          description: 'Payment is not yet funded. Fund escrow to protect your payment and authorize work.',
          icon: Clock,
          colorClass: 'bg-slate-100 text-slate-700 border-slate-200',
        };
      case 'held_in_escrow':
        return {
          label: 'Funds Protected in Escrow',
          description: 'Your payment is safely held under BukieGuarantee. Funds will not be released until you inspect and approve the completed work.',
          icon: ShieldCheck,
          colorClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        };
      case 'release_pending':
        return {
          label: 'Release Pending Verification',
          description: 'You approved work completion. Payout transfer to BrainWorker is undergoing banking settlement.',
          icon: Clock,
          colorClass: 'bg-amber-50 text-amber-800 border-amber-200',
        };
      case 'release_failed':
        return {
          label: 'Release Transfer Failed',
          description: 'The payout transfer encountered a temporary banking communication error. Click retry to re-dispatch.',
          icon: AlertTriangle,
          colorClass: 'bg-rose-50 text-rose-800 border-rose-200',
        };
      case 'released':
        return {
          label: settlementStatus === 'settled' ? 'Payment Settled & Released' : 'Funds Released to BrainWorker',
          description: 'Escrow settlement is complete. Payout has been transferred to the verified BrainWorker.',
          icon: CheckCircle2,
          colorClass: 'bg-emerald-50 text-[#296A4B] border-emerald-200',
        };
      case 'disputed':
        return {
          label: 'Escrow Frozen (Dispute Open)',
          description: 'A dispute has been submitted. Escrow funds are locked and cannot be released or withdrawn until mediation concludes.',
          icon: AlertCircle,
          colorClass: 'bg-amber-50 text-amber-900 border-amber-300',
        };
      case 'refund_pending':
        return {
          label: 'Refund in Progress',
          description: 'Booking cancelled. Your refund has been submitted to your bank and is undergoing settlement.',
          icon: Clock,
          colorClass: 'bg-amber-50 text-amber-800 border-amber-200',
        };
      case 'refund_failed':
        return {
          label: 'Refund Settlement Delayed',
          description: 'The refund transfer encountered a banking error. Our financial team is reconciling the record.',
          icon: AlertTriangle,
          colorClass: 'bg-rose-50 text-rose-800 border-rose-200',
        };
      case 'refunded':
        return {
          label: 'Refund Completed',
          description: 'Funds have been returned to your original payment account.',
          icon: CheckCircle2,
          colorClass: 'bg-slate-100 text-slate-800 border-slate-200',
        };
      default:
        return {
          label: 'Escrow Status Pending',
          description: 'Payment status is updating.',
          icon: Clock,
          colorClass: 'bg-slate-100 text-slate-700 border-slate-200',
        };
    }
  };

  const badge = resolveStatusBadge();
  const IconComponent = badge.icon;

  // Timeline step statuses (1: Confirmed, 2: Escrow Funded, 3: Work Inspection, 4: Settlement)
  const isStep1Done = true; // Booking is confirmed
  const isStep2Done =
    escrowStatus === 'held_in_escrow' ||
    escrowStatus === 'release_pending' ||
    escrowStatus === 'release_failed' ||
    escrowStatus === 'released' ||
    escrowStatus === 'disputed';
  const isStep2Active = escrowStatus === 'unfunded';
  const isStep3Done = escrowStatus === 'released' || escrowStatus === 'release_pending';
  const isStep3Active = escrowStatus === 'held_in_escrow';
  const isStep4Done = escrowStatus === 'released';

  return (
    <div
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4"
      role="region"
      aria-label="Escrow Protection Tracker"
    >
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-[#001A41]/5 text-[#001A41]">
            <ShieldCheck className="h-5 w-5 text-[#296A4B]" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              BukieGuarantee Escrow Protection
            </h3>
            <div className="text-sm font-display font-bold text-[#001A41]">
              Safe Payment Milestone Timeline
            </div>
          </div>
        </div>

        {/* Dynamic Status Badge */}
        <div
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${badge.colorClass}`}
        >
          <IconComponent className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>{badge.label}</span>
        </div>
      </div>

      <p className="text-xs text-slate-600 leading-relaxed">
        {badge.description}
      </p>

      {/* Release Failure Localized Retry */}
      {escrowStatus === 'release_failed' && onRetryRelease && (
        <div className="pt-1">
          <button
            type="button"
            onClick={onRetryRelease}
            disabled={isRetrying}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRetrying ? 'animate-spin' : ''}`} aria-hidden="true" />
            <span>{isRetrying ? 'Retrying transfer...' : 'Retry Release Settlement'}</span>
          </button>
        </div>
      )}

      {/* 4-Step Milestone Progress Bar */}
      <div className="pt-2 border-t border-slate-100">
        <ol className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <li className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                isStep1Done ? 'bg-[#296A4B] text-white' : 'bg-slate-200 text-slate-600'
              }`}>
                1
              </span>
              <span className="font-semibold text-slate-800">Booking</span>
            </div>
            <span className="text-[11px] text-slate-500 block pl-6.5">Confirmed</span>
          </li>

          <li className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                isStep2Done
                  ? 'bg-[#296A4B] text-white'
                  : isStep2Active
                  ? 'bg-amber-500 text-white animate-pulse'
                  : 'bg-slate-200 text-slate-600'
              }`}>
                2
              </span>
              <span className="font-semibold text-slate-800">Escrow</span>
            </div>
            <span className="text-[11px] text-slate-500 block pl-6.5">
              {isStep2Done ? 'Funded' : 'Awaiting Payment'}
            </span>
          </li>

          <li className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                isStep3Done
                  ? 'bg-[#296A4B] text-white'
                  : isStep3Active
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-200 text-slate-600'
              }`}>
                3
              </span>
              <span className="font-semibold text-slate-800">Inspection</span>
            </div>
            <span className="text-[11px] text-slate-500 block pl-6.5">
              {isStep3Done ? 'Approved' : isStep3Active ? 'In Progress' : 'Pending'}
            </span>
          </li>

          <li className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                isStep4Done ? 'bg-[#296A4B] text-white' : 'bg-slate-200 text-slate-600'
              }`}>
                4
              </span>
              <span className="font-semibold text-slate-800">Settlement</span>
            </div>
            <span className="text-[11px] text-slate-500 block pl-6.5">
              {isStep4Done ? 'Released' : 'Pending Approval'}
            </span>
          </li>
        </ol>
      </div>
    </div>
  );
}

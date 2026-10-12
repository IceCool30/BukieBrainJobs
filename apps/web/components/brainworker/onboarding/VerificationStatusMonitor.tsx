// apps/web/components/brainworker/onboarding/VerificationStatusMonitor.tsx
// Phase 7 GREEN: Verification Status Monitor Component
// Authoritative References:
// - docs/specs/BW-001-architecture-contract.md (Section 2.4 & 2.5)
// - docs/specs/BW-001-ux-design-specification.md (Section 3.3)
// - docs/specs/BW-001-test-first-implementation-plan.md (Suite 8: VFD-001 to VFD-005)

'use client';

import React from 'react';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ShieldCheck,
  ArrowRight,
  Mail,
  Loader2,
  FileWarning,
} from 'lucide-react';
import type {
  BrainWorkerOnboardingRecord,
  OnboardingStep,
  RejectionReasonCode,
} from '../../../lib/brainworker/types';

export interface VerificationStatusMonitorProps {
  record: BrainWorkerOnboardingRecord;
  onRemediate?: ((targetStep: OnboardingStep) => void) | undefined;
  onEnterWorkspace?: (() => void) | undefined;
  className?: string | undefined;
}

const REJECTION_MESSAGES: Record<RejectionReasonCode, string> = {
  UNVERIFIABLE_CREDENTIALS:
    'Our verification team was unable to confirm the trade test or apprenticeship records provided with the issuing authority.',
  FRAUD_SUSPECTED:
    'The submitted documents could not be authenticated or contained mismatched biometric records.',
  DOCUMENT_FORGERY:
    'The submitted documents could not be authenticated or contained altered certification markings.',
  INELIGIBLE_APPLICANT:
    'The application does not meet the minimum operating criteria for BukieBrainJobs providers.',
  OTHER:
    'Your verification application could not be approved based on our provider vetting requirements.',
};

export function VerificationStatusMonitor({
  record,
  onRemediate,
  onEnterWorkspace,
  className = '',
}: VerificationStatusMonitorProps): React.ReactElement {
  const { status, remediationIssues, rejectionDetails } = record;

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 1. SUBMITTED: In queue
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (status === 'SUBMITTED') {
    return (
      <div
        className={`w-full max-w-2xl mx-auto space-y-6 bg-white dark:bg-[#111927] border border-slate-200 dark:border-slate-800 rounded-lg p-6 sm:p-10 shadow-xs transition-colors ${className}`}
      >
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/40 px-3 py-1 text-xs font-semibold text-blue-700 dark:text-blue-300">
            <Clock className="h-3.5 w-3.5" />
            <span>Application Received</span>
          </span>
        </div>

        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#001A41] dark:text-white">
            Your Verification Application is in Queue
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            We have received your identity and trade credentials. Your application is queued for operational review by our verification team.
          </p>
        </div>

        <div className="rounded-lg border border-blue-100 dark:border-blue-900/30 bg-blue-50/60 dark:bg-[#0E1B31] p-5 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#001A41] dark:text-white">
            <Clock className="h-4 w-4 shrink-0 text-[#001A41] dark:text-blue-400" />
            <span>Expected turnaround: 24 to 48 business hours</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pl-6">
            You will receive an in-app alert and SMS as soon as your background review is complete.
          </p>
        </div>
      </div>
    );
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 2. PENDING_REVIEW: In-progress checklist
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (status === 'PENDING_REVIEW') {
    return (
      <div
        className={`w-full max-w-2xl mx-auto space-y-6 bg-white dark:bg-[#111927] border border-slate-200 dark:border-slate-800 rounded-lg p-6 sm:p-10 shadow-xs transition-colors ${className}`}
      >
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 px-3 py-1 text-xs font-semibold text-amber-800 dark:text-amber-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
            </span>
            <span>Under Active Review</span>
          </span>
        </div>

        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#001A41] dark:text-white">
            Verification Review in Progress
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Our operational review team is actively cross-referencing your submitted identity documents and trade certifications.
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0D1424] p-5 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Review Stages
          </h3>

          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="text-slate-800 dark:text-slate-200 font-medium">
                Application Submitted & Formats Checked
              </span>
              <span className="ml-auto text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200/50 dark:border-emerald-800/40">
                Completed
              </span>
            </li>

            <li className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 text-amber-600 dark:text-amber-400 animate-spin shrink-0" />
              <span className="text-slate-800 dark:text-slate-200 font-medium">
                Government Identity Document Review
              </span>
              <span className="ml-auto text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-200/50 dark:border-amber-800/40">
                In Progress
              </span>
            </li>

            <li className="flex items-center gap-3">
              <div className="h-5 w-5 rounded-full border-2 border-slate-300 dark:border-slate-700 shrink-0" />
              <span className="text-slate-500 dark:text-slate-400">
                Trade Credential & Competency Check
              </span>
              <span className="ml-auto text-xs font-medium text-slate-400 dark:text-slate-500">
                Pending
              </span>
            </li>

            <li className="flex items-center gap-3">
              <div className="h-5 w-5 rounded-full border-2 border-slate-300 dark:border-slate-700 shrink-0" />
              <span className="text-slate-500 dark:text-slate-400">
                Final Operating Approval
              </span>
              <span className="ml-auto text-xs font-medium text-slate-400 dark:text-slate-500">
                Pending
              </span>
            </li>
          </ul>
        </div>
      </div>
    );
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 3. REMEDIATION_REQUIRED: Actionable issue guidance
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (status === 'REMEDIATION_REQUIRED') {
    const primaryIssue = remediationIssues[0];
    const targetStep = primaryIssue?.targetStep || 'credentials';
    const buttonLabel =
      primaryIssue?.fieldKey === 'governmentId'
        ? 'Update Government ID'
        : 'Update Credentials';

    return (
      <div
        className={`w-full max-w-2xl mx-auto space-y-6 bg-white dark:bg-[#111927] border border-amber-200 dark:border-amber-900/40 rounded-lg p-6 sm:p-10 shadow-xs transition-colors ${className}`}
      >
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-900/50 px-3 py-1 text-xs font-semibold text-amber-900 dark:text-amber-300">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
            <span>Action Needed</span>
          </span>
        </div>

        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#001A41] dark:text-white">
            Action Needed: Document Re-Upload Required
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Our verification agents reviewed your submission and flagged an item that needs your attention before approval.
          </p>
        </div>

        <div className="rounded-lg border border-amber-200 dark:border-amber-900/30 bg-amber-50/70 dark:bg-[#20180B] p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300">
            <FileWarning className="h-4 w-4 shrink-0 text-amber-700 dark:text-amber-400" />
            <span>Reviewer Guidance ({primaryIssue?.issueCode || 'ACTION_REQUIRED'})</span>
          </div>
          <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
            {primaryIssue?.message ||
              'A document photo was unclear or missing. Please upload a clear, legible replacement to proceed.'}
          </p>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end">
          <button
            type="button"
            onClick={() => onRemediate && onRemediate(targetStep)}
            className="inline-flex items-center gap-2 rounded-lg bg-[#001A41] dark:bg-emerald-600 px-6 py-3 text-sm font-semibold text-white dark:text-slate-950 shadow-sm transition hover:bg-[#002661] dark:hover:bg-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#001A41]"
          >
            <span>{buttonLabel}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 4. REJECTED: Disqualification & Support
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (status === 'REJECTED') {
    const reasonMessage =
      rejectionDetails?.message ||
      (rejectionDetails?.reasonCode
        ? REJECTION_MESSAGES[rejectionDetails.reasonCode]
        : REJECTION_MESSAGES.OTHER);

    return (
      <div
        className={`w-full max-w-2xl mx-auto space-y-6 bg-white dark:bg-[#111927] border border-red-200 dark:border-red-900/40 rounded-lg p-6 sm:p-10 shadow-xs transition-colors ${className}`}
      >
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-md bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 px-3 py-1 text-xs font-semibold text-red-800 dark:text-red-300">
            <XCircle className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
            <span>Application Not Approved</span>
          </span>
        </div>

        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Verification Could Not Be Completed
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {reasonMessage}
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0D1424] p-5 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            <Mail className="h-4 w-4 shrink-0 text-slate-500 dark:text-slate-400" />
            <span>Operational Support Assistance</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            If you believe this determination was made in error or wish to provide supplementary official documentation, please reach out to our operations team at{' '}
            <a
              href="mailto:support@bukiebrainjobs.com"
              className="font-semibold text-[#001A41] dark:text-emerald-400 underline underline-offset-2 hover:text-blue-800 dark:hover:text-emerald-300"
            >
              support@bukiebrainjobs.com
            </a>
            .
          </p>
        </div>
      </div>
    );
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 5. APPROVED: Verified Provider & Workspace CTA
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (status === 'APPROVED') {
    return (
      <div
        className={`w-full max-w-2xl mx-auto space-y-6 bg-white dark:bg-[#111927] border border-emerald-200 dark:border-emerald-900/40 rounded-lg p-6 sm:p-10 shadow-xs transition-colors ${className}`}
      >
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-900/50 px-3 py-1 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
            <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>Verified Provider</span>
          </span>
        </div>

        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#001A41] dark:text-white">
            Congratulations! Your BrainWorker Account is Verified
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            You are now an approved service provider on BukieBrainJobs. Your profile is active and eligible to receive verified customer booking requests.
          </p>
        </div>

        <div className="rounded-lg border border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/50 dark:bg-[#081F17] p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>Operating Privileges Unlocked</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            You have full access to the BrainWorker dispatch dashboard, customer service inquiries, direct messaging, and milestone payments.
          </p>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end">
          <button
            type="button"
            onClick={onEnterWorkspace}
            className="inline-flex items-center gap-2 rounded-lg bg-[#001A41] dark:bg-emerald-600 px-6 py-3.5 text-sm font-semibold text-white dark:text-slate-950 shadow-sm transition hover:bg-[#002661] dark:hover:bg-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#001A41]"
          >
            <span>Enter BrainWorker Workspace</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  // Fallback for draft or unknown state
  return (
    <div
      className={`w-full max-w-2xl mx-auto bg-white dark:bg-[#111927] border border-slate-200 dark:border-slate-800 rounded-lg p-6 sm:p-10 text-center shadow-xs transition-colors ${className}`}
    >
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Onboarding draft in progress. Please complete all required steps to submit your application.
      </p>
    </div>
  );
}

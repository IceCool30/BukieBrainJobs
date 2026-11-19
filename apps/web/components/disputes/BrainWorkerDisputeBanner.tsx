// apps/web/components/disputes/BrainWorkerDisputeBanner.tsx
// BW-010: Dispute Handling & Support Interface
// Phase 3 GREEN: BrainWorker Dispute Banner Component

'use client';

import React from 'react';
import type { DisputeRecord } from '../../lib/disputes/types';

export interface BrainWorkerDisputeBannerProps {
  dispute: DisputeRecord;
  onRespond?: () => void;
  className?: string;
}

function formatCategory(category: string): string {
  switch (category) {
    case 'WORKMANSHIP_DEFECT':
      return 'Workmanship Defect';
    case 'INCOMPLETE_ABANDONED':
      return 'Incomplete or Abandoned Task';
    case 'DAMAGE_INCIDENT':
      return 'Property Damage Incident';
    case 'BILLING_SCOPE_DISAGREEMENT':
      return 'Billing or Scope Disagreement';
    case 'UNRESPONSIVE_NO_SHOW':
      return 'Unresponsive or No-Show';
    case 'SAFETY_CONDUCT':
      return 'Safety or Conduct Concern';
    default:
      return category.replace(/_/g, ' ');
  }
}

export function BrainWorkerDisputeBanner({
  dispute,
  onRespond,
  className = '',
}: BrainWorkerDisputeBannerProps): React.ReactElement {
  if (dispute.status === 'RESOLVED') {
    return (
      <aside
        aria-label="Dispute resolution banner"
        data-testid="brainworker-dispute-banner"
        className={`flex flex-col gap-2 rounded-lg border border-[var(--brand-green)]/30 bg-[var(--brand-green)]/10 p-4 text-[var(--text-main)] shadow-sm ${className}`}
      >
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-[var(--brand-green)]" aria-hidden="true" />
          <h3 className="text-xs font-bold text-[var(--brand-green)]">
            Dispute Resolved: Resolution Summary
          </h3>
        </div>

        {dispute.resolutionNotes && (
          <p className="text-xs leading-relaxed text-[var(--text-main)]">
            {dispute.resolutionNotes}
          </p>
        )}

        <p className="text-[11px] text-[var(--text-muted)]">
          Settlement terms have been recorded in this local preview. Real funds and banking transfers are unaffected.
        </p>
      </aside>
    );
  }

  if (dispute.status === 'CANCELLED') {
    return (
      <aside
        aria-label="Dispute cancelled banner"
        data-testid="brainworker-dispute-banner"
        className={`flex flex-col gap-2 rounded-lg border border-[var(--rule)] bg-[var(--bg)] p-4 text-[var(--text-main)] shadow-sm ${className}`}
      >
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-[var(--text-muted)]" aria-hidden="true" />
          <h3 className="text-xs font-bold text-[var(--text-muted)]">
            Dispute Cancelled: Closed
          </h3>
        </div>
        <p className="text-xs text-[var(--text-muted)]">
          The dispute for this booking was cancelled in this local preview. Real funds and payments are unaffected.
        </p>
      </aside>
    );
  }

  const isActionRequired = dispute.status === 'ACTION_REQUIRED';
  const isProposalPending = dispute.status === 'PROPOSAL_PENDING';
  const isActionable = (dispute.status === 'FILED' || dispute.status === 'UNDER_REVIEW' || isActionRequired) && Boolean(onRespond);

  let bannerTitle = 'Active Dispute: Dispute Under Review';
  let bannerDescription =
    'This local preview pauses its simulated completion timer while dispute details are under review in this workspace. It does not change real escrow or payment status, and no platform mediator has been contacted. Review the claim and submit any counter-evidence.';

  if (isActionRequired) {
    bannerTitle = 'Action Required: Counter-Evidence Requested';
    bannerDescription =
      'This local preview pauses its simulated completion timer. Counter-evidence has been requested in this local workspace. It does not change real escrow or payment status.';
  } else if (isProposalPending) {
    bannerTitle = 'Mediation Proposal: Settlement Terms Pending Review';
    bannerDescription =
      'Simulated settlement terms have been recorded and are currently awaiting review in this workspace. This local preview does not change real escrow or payment status, and no platform mediator has been contacted.';
  } else if (dispute.status === 'FILED') {
    bannerTitle = 'Dispute Filed: Awaiting Review';
  }

  return (
    <aside
      role="alert"
      aria-label="Active dispute alert"
      data-testid="brainworker-dispute-banner"
      className={`flex flex-col gap-3 rounded-lg border border-[var(--amber)]/30 bg-[var(--amber)]/10 p-4 text-[var(--text-main)] shadow-sm sm:flex-row sm:items-center sm:justify-between ${className}`}
    >
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-[var(--amber)]" aria-hidden="true" />
          <h3 className="text-xs font-bold text-[var(--amber)]">
            {bannerTitle}
          </h3>
        </div>

        <p className="text-xs text-[var(--text-main)]">
          Reason: <span className="font-semibold">{formatCategory(dispute.category)}</span>
        </p>

        <p className="text-[11px] text-[var(--text-muted)]">
          {bannerDescription}
        </p>
      </div>

      {isActionable && onRespond && (
        <button
          type="button"
          onClick={onRespond}
          className="flex min-h-[44px] shrink-0 items-center justify-center rounded-md bg-[var(--amber)] px-4 text-xs font-semibold text-[var(--amber-text)] shadow-sm transition hover:opacity-90 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--amber)]"
        >
          Submit Counter-Evidence
        </button>
      )}
    </aside>
  );
}

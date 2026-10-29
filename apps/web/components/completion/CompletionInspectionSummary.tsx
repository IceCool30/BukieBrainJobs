// apps/web/components/completion/CompletionInspectionSummary.tsx
// BW-009: Post-Job Completion & Escrow Release
// Phase 3 GREEN: Completion Inspection Summary Component

'use client';

import React from 'react';
import type { JobStatus } from '@bukiebrainjobs/api-types';

export interface CompletionInspectionSummaryProps {
  baseQuoteKobo: number;
  approvedAdjustmentKobo: number;
  totalSettlementKobo: number;
  jobStatus: JobStatus;
  photoProofUrls?: string[] | undefined;
  completionSummaryNote?: string | undefined;
  className?: string | undefined;
}

function formatNaira(kobo: number): string {
  return `₦${(kobo / 100).toLocaleString()}`;
}

export function CompletionInspectionSummary({
  baseQuoteKobo,
  approvedAdjustmentKobo,
  totalSettlementKobo,
  jobStatus,
  photoProofUrls = [],
  completionSummaryNote,
  className = '',
}: CompletionInspectionSummaryProps): React.ReactElement {
  return (
    <div
      data-testid="completion-inspection-summary"
      className={`rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-zinc-100 shadow-xl ${className}`}
    >
      <div className="mb-6 flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-4">
        <div>
          <span className="inline-block rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-400">
            Inspection Overview
          </span>
          <h1 className="mt-1 text-xl font-bold text-zinc-100">
            Job Settlement Inspection
          </h1>
        </div>
        <span className="rounded-full border border-zinc-700 bg-zinc-800 px-3 py-1 text-xs font-medium text-zinc-300">
          Status: {jobStatus}
        </span>
      </div>

      <div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-950 p-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Financial Settlement Breakdown
        </h3>
        <dl className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between text-zinc-300">
            <dt>Base Quote</dt>
            <dd className="font-mono font-medium text-zinc-100">
              {formatNaira(baseQuoteKobo)}
            </dd>
          </div>
          <div className="flex justify-between text-zinc-300">
            <dt>Approved Adjustments</dt>
            <dd className="font-mono font-medium text-zinc-100">
              {formatNaira(approvedAdjustmentKobo)}
            </dd>
          </div>
          <div className="flex justify-between border-t border-zinc-800 pt-2 font-semibold text-emerald-400">
            <dt>Total Settlement</dt>
            <dd className="font-mono text-base text-emerald-400">
              {formatNaira(totalSettlementKobo)}
            </dd>
          </div>
        </dl>
      </div>

      {completionSummaryNote && (
        <div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-950 p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Technician Completion Summary
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-zinc-200">
            {completionSummaryNote}
          </p>
        </div>
      )}

      {photoProofUrls.length > 0 && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Proof of Work Gallery ({photoProofUrls.length})
          </h3>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {photoProofUrls.map((url, index) => (
              <div
                key={url}
                className="group relative aspect-video overflow-hidden rounded-md border border-zinc-800 bg-zinc-900"
              >
                <img
                  src={url}
                  alt={`Completion photo proof ${index + 1}`}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

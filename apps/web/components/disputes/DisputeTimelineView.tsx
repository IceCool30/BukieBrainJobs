// apps/web/components/disputes/DisputeTimelineView.tsx
// BW-010: Dispute Handling & Support Interface
// Phase 3 GREEN: Dispute Timeline and Evidence View Component

'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import type { DisputeRecord } from '../../lib/disputes/types';

export interface DisputeTimelineViewProps {
  record: DisputeRecord;
  className?: string;
}

function formatNaira(kobo: number): string {
  return `₦${(kobo / 100).toLocaleString()}`;
}

function formatActorRole(role: string): string {
  switch (role.toLowerCase()) {
    case 'customer':
      return 'Customer';
    case 'brainworker':
      return 'BrainWorker';
    case 'mediator':
      return 'Mediator';
    case 'system':
      return 'System';
    default:
      return role;
  }
}

function formatTimestamp(iso: string): string {
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return iso;
  }
}

function EvidenceThumbnail({
  src,
  alt,
}: {
  src: string;
  alt: string;
}): React.ReactElement {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div
        role="img"
        aria-label="Image Preview (Unavailable)"
        className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded border border-[var(--lead)] bg-[var(--card-bg)] p-1 text-center font-mono text-[9px] text-[var(--text-muted)]"
      >
        <span className="font-semibold text-[10px]">Image Preview</span>
        <span>(Unavailable)</span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={64}
      height={64}
      unoptimized
      onError={() => setHasError(true)}
      className="h-16 w-16 shrink-0 rounded object-cover border border-[var(--lead)]"
    />
  );
}

export function DisputeTimelineView({
  record,
  className = '',
}: DisputeTimelineViewProps): React.ReactElement {
  const isResolved = record.status === 'RESOLVED' && record.settlement;

  // Immutably sort timeline events chronologically
  const sortedTimeline = [...record.timeline].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  return (
    <div
      data-testid="dispute-timeline-view"
      className={`flex flex-col gap-5 rounded-lg border border-[var(--lead)] bg-[var(--card-bg)] p-6 text-[var(--text-main)] shadow-sm ${className}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--lead)] pb-3">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--amber)]">
            Audit Timeline
          </span>
          <h2 className="text-lg font-bold text-[var(--text-main)]">
            Dispute Progress and Activity
          </h2>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            Local dispute record for audit and review.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`rounded-md px-2.5 py-1 text-xs font-semibold uppercase tracking-wider ${
              record.status === 'RESOLVED'
                ? 'bg-[var(--brand-green)]/15 text-[var(--brand-green)] border border-[var(--brand-green)]/30'
                : 'bg-[var(--amber)]/15 text-[var(--amber)] border border-[var(--amber)]/30'
            }`}
          >
            Local status: {record.status.replace(/_/g, ' ')}
          </span>
        </div>
      </div>

      {isResolved && record.settlement && (
        <section
          aria-label="Settlement breakdown card"
          className="rounded-md border border-[var(--brand-green)]/30 bg-[var(--brand-green)]/10 p-4 text-xs"
        >
          <div className="flex items-center justify-between pb-2 border-b border-[var(--brand-green)]/20">
            <div>
              <span className="font-bold text-[var(--brand-green)]">
                Settlement Agreement
              </span>
              <span className="ml-2 text-[10px] uppercase tracking-wider text-[var(--brand-green)]">
                (Settlement preview only)
              </span>
            </div>
            <span className="font-semibold text-[var(--brand-green)] uppercase">
              {record.settlement.resolutionType.replace(/_/g, ' ')}
            </span>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="flex flex-col rounded-md bg-[var(--bg)] p-3 border border-[var(--lead)]">
              <span className="text-[11px] text-[var(--text-muted)]">Customer Refund</span>
              <span className="mt-1 font-mono text-base font-bold text-[var(--brand-green)]">
                {formatNaira(record.settlement.customerRefundKobo)}
              </span>
            </div>

            <div className="flex flex-col rounded-md bg-[var(--bg)] p-3 border border-[var(--lead)]">
              <span className="text-[11px] text-[var(--text-muted)]">BrainWorker Payout</span>
              <span className="mt-1 font-mono text-base font-bold text-[var(--amber)]">
                {formatNaira(record.settlement.workerPayoutKobo)}
              </span>
            </div>

            <div className="flex flex-col rounded-md bg-[var(--bg)] p-3 border border-[var(--lead)]">
              <span className="text-[11px] text-[var(--text-muted)]">Platform Fee (17.5%)</span>
              <span className="mt-1 font-mono text-base font-bold text-[var(--text-main)]">
                {formatNaira(record.settlement.platformFeeKobo)}
              </span>
            </div>
          </div>

          <p className="mt-2 text-[11px] text-[var(--text-muted)]">
            Settlement figures reflect the recorded prototype resolution breakdown. Live banking disbursement remains reserved.
          </p>
        </section>
      )}

      {/* Submitted Evidence Attachments */}
      <section aria-label="Submitted evidence attachments" className="flex flex-col gap-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
          Submitted Evidence
        </h3>

        {(!record.evidence || record.evidence.length === 0) ? (
          <p className="text-xs text-[var(--text-muted)]">No evidence attachments submitted yet.</p>
        ) : (
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2" aria-label="Attached evidence items">
            {record.evidence.map((item) => {
              const isImage = item.fileType.startsWith('image/');
              return (
                <li
                  key={item.id}
                  data-testid={`evidence-item-${item.id}`}
                  className="flex items-start gap-3 rounded-md border border-[var(--lead)] bg-[var(--bg)] p-3 text-xs"
                >
                  {isImage ? (
                    <EvidenceThumbnail
                      src={item.previewUrl}
                      alt={item.caption || 'Evidence photo'}
                    />
                  ) : (
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded border border-[var(--lead)] bg-[var(--card-bg)] font-mono text-[10px] text-[var(--text-muted)]">
                      PDF
                    </div>
                  )}

                  <div className="flex flex-1 flex-col justify-between overflow-hidden gap-1">
                    <div className="flex flex-col gap-0.5">
                      <span className="truncate font-semibold text-[var(--text-main)]">
                        {item.caption || 'Evidence attachment'}
                      </span>
                      <span className="text-[10px] text-[var(--text-muted)]">
                        Uploaded by {formatActorRole(item.uploaderRole)} • {Math.round(item.sizeBytes / 1024)} KB
                      </span>
                      <time dateTime={item.uploadedAt} className="text-[10px] text-[var(--text-muted)]">
                        {formatTimestamp(item.uploadedAt)}
                      </time>
                    </div>

                    <a
                      href={item.previewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-[11px] font-semibold text-[var(--amber)] hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--amber)] rounded"
                      aria-label={`View attachment ${item.caption || item.id}`}
                    >
                      View Attachment ↗
                    </a>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Timeline Audit Events */}
      <div className="flex flex-col gap-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
          Timeline Events
        </h3>

        {sortedTimeline.length === 0 ? (
          <p className="text-xs text-[var(--text-muted)]">No timeline events recorded yet.</p>
        ) : (
          <ol className="relative flex flex-col gap-3 border-l border-[var(--lead)] pl-4 ml-1">
            {sortedTimeline.map((event) => (
              <li key={event.id} className="flex flex-col gap-1 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded bg-[var(--lead)] px-2 py-0.5 text-[10px] font-medium text-[var(--text-muted)]">
                    {event.eventType}
                  </span>
                  <time role="time" dateTime={event.timestamp} className="text-[10px] text-[var(--text-muted)]">
                    {formatTimestamp(event.timestamp)}
                  </time>
                </div>
                <p className="mt-0.5 text-xs text-[var(--text-main)]">
                  {formatActorRole(event.actorRole)}: {event.note}
                </p>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}

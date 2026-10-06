'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  REQUISITION_DISCIPLINES,
  RequisitionEntry,
  buildRequisitionBookUrl,
  filterByDiscipline,
  formatRequisitionLocation,
} from '../lib/requisitions';

interface RequisitionIndexProps {
  entries: RequisitionEntry[];
  city?: string | undefined;
  onReviewDetails: (categoryId: string) => void;
}

/**
 * Requisition Index command table (Trades Design System, DESIGN.md v2.0).
 * Structured discovery board: Ref ID, Role & Stack, Location / Workshop,
 * Milestone & Escrow, Action. Rows open the spec inspector drawer.
 */
export function RequisitionIndex({ entries, city, onReviewDetails }: RequisitionIndexProps) {
  const [discipline, setDiscipline] = useState('all');
  const [inspected, setInspected] = useState<RequisitionEntry | null>(null);

  const visible = filterByDiscipline(entries, discipline);

  const openInspector = useCallback((entry: RequisitionEntry) => {
    setInspected(entry);
  }, []);

  const closeInspector = useCallback(() => {
    setInspected(null);
  }, []);

  return (
    <section aria-label="Verified requisition index">
      <div className="station-toolbar">
        <div className="filter-pills" role="group" aria-label="Filter by technical discipline">
          <button
            type="button"
            onClick={() => setDiscipline('all')}
            aria-pressed={discipline === 'all'}
            className={`pill-btn ${discipline === 'all' ? 'active' : ''}`}
          >
            All Dispatches ({entries.length})
          </button>
          {REQUISITION_DISCIPLINES.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setDiscipline(item.id)}
              aria-pressed={discipline === item.id}
              className={`pill-btn ${discipline === item.id ? 'active' : ''}`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="feed-count" role="status" aria-live="polite">
          Showing {visible.length} verified position{visible.length === 1 ? '' : 's'}
        </div>
      </div>

      <div className="market-index">
        <div className="index-header" aria-hidden="true">
          <div>Ref ID</div>
          <div>Role &amp; Technical Stack</div>
          <div>Workshop / Location</div>
          <div>Milestone &amp; Escrow</div>
          <div style={{ textAlign: 'right' }}>Action</div>
        </div>

        {visible.map((entry) => (
          <article
            key={entry.refId}
            className="job-row"
            onClick={() => openInspector(entry)}
            data-testid={`requisition-row-${entry.refId}`}
          >
            <div className="req-code">
              <span>{entry.refId}</span>
            </div>
            <div className="role-title-block">
              <h2 className="role-name">{entry.roleTitle}</h2>
              <div className="stack-tags" aria-label="Technical stack">
                {entry.stackTags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </div>
            <div className="facility-meta">
              <div className="org-name">{entry.group}</div>
              <div className="site-loc">{formatRequisitionLocation(city, entry.group)}</div>
            </div>
            <div>
              <div className="comp-range">{entry.milestone}</div>
              <div className="comp-equity">
                <span className="shield-dot" aria-hidden="true" /> 100% Escrow Milestone
              </div>
            </div>
            <div className="row-cta">
              <button
                type="button"
                className="pill-status"
                onClick={(event) => {
                  event.stopPropagation();
                  openInspector(entry);
                }}
              >
                Inspect Spec
              </button>
            </div>
          </article>
        ))}
      </div>

      {inspected && (
        <SpecInspector
          entry={inspected}
          city={city}
          onClose={closeInspector}
          onReviewDetails={onReviewDetails}
        />
      )}
    </section>
  );
}

interface SpecInspectorProps {
  entry: RequisitionEntry;
  city?: string | undefined;
  onClose: () => void;
  onReviewDetails: (categoryId: string) => void;
}

/**
 * Spec inspection drawer. Shows technical scope, verified tooling,
 * milestone value, and direct booking triggers.
 */
export function SpecInspector({ entry, city, onClose, onReviewDetails }: SpecInspectorProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return (
    <div
      className="sheet-overlay"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="sheet-modal" role="dialog" aria-modal="true" aria-labelledby="spec-title">
        <button ref={closeRef} type="button" className="close-sheet" onClick={onClose}>
          [ESC] CLOSE
        </button>
        <div className="spec-id-line">
          {entry.refId} {'//'} {formatRequisitionLocation(city, entry.group).toUpperCase()}
        </div>
        <h2 id="spec-title" className="spec-title">
          {entry.roleTitle}
        </h2>
        <div className="spec-org">
          {entry.group} {'//'} {city ?? 'Nationwide'}
        </div>

        <div className="spec-scope-block">
          <div className="spec-scope-label">Technical Workshop Scope</div>
          <p className="spec-scope-text">{entry.description}</p>
          <div className="stack-tags" style={{ marginTop: '0.75rem' }} aria-label="Verified tooling">
            {entry.stackTags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        </div>

        <div className="spec-footer">
          <div>
            <div className="spec-comp-label">Escrow Milestone From</div>
            <div className="spec-comp-value">{entry.milestone}</div>
            <div className="comp-equity">
              <span className="shield-dot" aria-hidden="true" /> 100% Escrow Milestone
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn-action btn-ghost"
              onClick={() => onReviewDetails(entry.categoryId)}
            >
              Review details
            </button>
            <Link href={buildRequisitionBookUrl(entry, city)} className="btn-action">
              Book BrainWorker
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

const PROTOCOL_CARDS = [
  {
    criterion: 'Criterion // 01',
    badge: 'Verified Workshop',
    title: 'Physical Rig & Bench Vetting',
    body: 'Every BrainWorker proves a physical workshop address, calibrated diagnostic gear, and tools before taking a booking.',
  },
  {
    criterion: 'Criterion // 02',
    badge: 'BukieGuarantee',
    title: 'Milestone Escrow Protection',
    body: 'Funds are secured before work starts and released only after the agreed scope passes inspection.',
  },
  {
    criterion: 'Criterion // 03',
    badge: 'Direct Link',
    title: 'Direct Engineering Link',
    body: 'Bookings connect customers straight to the verified BrainWorker handling the job. No intermediaries in between.',
  },
];

/** Verification protocol trust grid. */
export function VerificationProtocol() {
  return (
    <section className="protocol-grid" aria-label="Verification protocol">
      {PROTOCOL_CARDS.map((card) => (
        <div key={card.title} className="protocol-card">
          <div className="protocol-tag">
            <span>{card.criterion}</span>
            <span className="badge-mint">{card.badge}</span>
          </div>
          <h3>{card.title}</h3>
          <p>{card.body}</p>
        </div>
      ))}
    </section>
  );
}

/** Bottom dispatch callout with amber conversion action. */
export function DispatchBox() {
  return (
    <section className="dispatch-box" aria-label="Post a verified requisition">
      <div className="dispatch-info">
        <h2>Deploy a Verified Technical Requisition</h2>
        <p>
          Describe the work, set the milestone, and get matched with a verified
          BrainWorker whose payment stays protected until you approve the job.
        </p>
      </div>
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <Link href="/guarantee" className="btn-action btn-ghost">
          Read BukieGuarantee
        </Link>
        <Link href="/post-job" className="btn-action">
          Post Verified Requisition
        </Link>
      </div>
    </section>
  );
}

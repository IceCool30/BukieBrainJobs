// apps/web/components/disputes/DisputeCounterEvidenceModal.tsx
// BW-010: Dispute Handling & Support Interface
// Phase 3 GREEN: Dispute Counter-Evidence Modal Component

'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import type {
  DisputeEvidence,
  DisputeParticipantRole,
} from '../../lib/disputes/types';
import { evidenceStore } from '../../lib/disputes/evidence-store';
import { DisputeEvidenceUploader } from './DisputeEvidenceUploader';

export interface DisputeCounterEvidenceModalProps {
  isOpen: boolean;
  disputeId: string;
  bookingId: string;
  callerId: string;
  callerRole: DisputeParticipantRole;
  onClose: () => void;
  onSubmit: (evidence: DisputeEvidence[]) => Promise<void> | void;
  isSubmitting?: boolean;
}

export function DisputeCounterEvidenceModal({
  isOpen,
  disputeId,
  bookingId,
  callerId,
  callerRole,
  onClose,
  onSubmit,
  isSubmitting = false,
}: DisputeCounterEvidenceModalProps): React.ReactElement | null {
  const [evidence, setEvidence] = useState<DisputeEvidence[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPendingSubmit, setIsPendingSubmit] = useState<boolean>(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);
  const isSubmittingRef = useRef<boolean>(false);
  const prevContextRef = useRef({ disputeId, callerId });

  const titleId = useId();
  const sessionId = `counter-${disputeId}-${callerId || 'user'}`;

  const isBusy = isSubmitting || isPendingSubmit;
  const isSubmitDisabled = evidence.length === 0 || isBusy || !callerId;

  useEffect(() => {
    if (!isOpen) {
      setEvidence([]);
      setSubmitError(null);
      evidenceStore.clearDraftBlobs(sessionId);
    } else if (
      prevContextRef.current.disputeId !== disputeId ||
      prevContextRef.current.callerId !== callerId
    ) {
      const oldSessionId = `counter-${prevContextRef.current.disputeId}-${prevContextRef.current.callerId || 'user'}`;
      evidenceStore.clearDraftBlobs(oldSessionId);
      setEvidence([]);
      setSubmitError(null);
    }
    prevContextRef.current = { disputeId, callerId };
  }, [isOpen, disputeId, callerId, sessionId]);

  useEffect(() => {
    if (isOpen) {
      previousActiveElementRef.current = document.activeElement as HTMLElement | null;
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      const focusable = modalRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])'
      );
      if (focusable && focusable.length > 0) {
        focusable[0]?.focus();
      }

      return () => {
        document.body.style.overflow = originalOverflow;
        if (previousActiveElementRef.current?.focus) {
          previousActiveElementRef.current.focus();
        }
      };
    }
  }, [isOpen]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape' && !isBusy) {
      onClose();
      return;
    }

    if (event.key === 'Tab' && modalRef.current) {
      const focusables = Array.from(
        modalRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isSubmitDisabled || isSubmittingRef.current) return;

    isSubmittingRef.current = true;
    setIsPendingSubmit(true);
    setSubmitError(null);

    const evidenceUrls = evidence.map((item) => item.previewUrl);
    evidenceStore.commitDraftBlobs(evidenceUrls, disputeId);

    try {
      await onSubmit(evidence);
    } catch (err: unknown) {
      evidenceStore.revertCommittedBlobsToDraft(evidenceUrls);
      setSubmitError(
        err instanceof Error
          ? err.message
          : 'Failed to submit counter-evidence. Please retry.'
      );
    } finally {
      isSubmittingRef.current = false;
      setIsPendingSubmit(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      data-testid="dispute-counter-evidence-modal"
      onKeyDown={handleKeyDown}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs"
    >
      <div
        ref={modalRef}
        className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-y-auto rounded-lg border border-[var(--lead)] bg-[var(--card-bg)] p-6 text-[var(--text-main)] shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-[var(--lead)] pb-3">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--amber)]">
              Dispute Response
            </span>
            <h2 id={titleId} className="text-lg font-bold text-[var(--text-main)]">
              Submit Counter-Evidence
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isBusy}
            aria-label="Close dialog"
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md text-sm text-[var(--text-muted)] hover:bg-[var(--lead)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--amber)] disabled:opacity-50"
          >
            ✕
          </button>
        </div>

        <p className="mt-3 text-xs leading-relaxed text-[var(--text-muted)]">
          This local preview records your counter-evidence on this simulated dispute record for booking {bookingId}. All submitted attachments are recorded on the local preview timeline. It does not hold, move, or release real funds, and no platform mediator has been contacted.
        </p>

        {submitError && (
          <div
            role="alert"
            className="mt-3 rounded-md border border-[var(--danger-border)] bg-[var(--danger-dim)] p-3 text-xs text-[var(--danger)]"
          >
            {submitError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          <div className="rounded-md border border-[var(--lead)] bg-[var(--bg)] p-3.5">
            <DisputeEvidenceUploader
              evidenceList={evidence}
              onChange={setEvidence}
              uploaderId={callerId}
              uploaderRole={callerRole}
              sessionId={sessionId}
              maxItems={1}
              disabled={isBusy}
            />
          </div>

          <div className="mt-2 flex items-center justify-end gap-3 pt-2 border-t border-[var(--lead)]">
            <button
              type="button"
              onClick={onClose}
              disabled={isBusy}
              className="min-h-[44px] rounded-md px-4 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-main)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--amber)] disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitDisabled}
              className="flex min-h-[44px] items-center justify-center rounded-md bg-[var(--amber)] px-5 text-xs font-semibold text-[var(--amber-text)] shadow-sm transition hover:opacity-90 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--amber)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isBusy ? 'Submitting...' : 'Submit Counter-Evidence'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

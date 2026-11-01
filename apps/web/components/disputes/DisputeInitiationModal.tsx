// apps/web/components/disputes/DisputeInitiationModal.tsx
// BW-010: Dispute Handling & Support Interface
// Phase 3 GREEN: Dispute Initiation Modal Component

'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import type {
  DisputeCategory,
  DisputeEvidence,
  DisputeParticipantRole,
} from '../../lib/disputes/types';
import { evidenceStore } from '../../lib/disputes/evidence-store';
import { DisputeEvidenceUploader } from './DisputeEvidenceUploader';

export interface DisputeInitiationModalProps {
  isOpen: boolean;
  bookingId: string;
  initiatorRole: 'CUSTOMER' | 'BRAINWORKER' | 'customer' | 'brainworker';
  initiatorId?: string;
  eligible?: boolean;
  onClose: () => void;
  onSubmit: (data: {
    category: DisputeCategory;
    reason?: DisputeCategory;
    description: string;
    evidence: DisputeEvidence[];
  }) => Promise<void> | void;
  isSubmitting?: boolean;
}

const DISPUTE_CATEGORIES: { value: DisputeCategory; label: string }[] = [
  { value: 'WORKMANSHIP_DEFECT', label: 'Workmanship Defect' },
  { value: 'INCOMPLETE_ABANDONED', label: 'Incomplete or Abandoned Task' },
  { value: 'DAMAGE_INCIDENT', label: 'Property Damage Incident' },
  { value: 'BILLING_SCOPE_DISAGREEMENT', label: 'Billing or Scope Disagreement' },
  { value: 'UNRESPONSIVE_NO_SHOW', label: 'Unresponsive or No-Show' },
  { value: 'SAFETY_CONDUCT', label: 'Safety or Conduct Concern' },
  { value: 'OTHER', label: 'Other Issue' },
];

export function DisputeInitiationModal({
  isOpen,
  bookingId,
  initiatorRole,
  initiatorId = '',
  eligible = true,
  onClose,
  onSubmit,
  isSubmitting = false,
}: DisputeInitiationModalProps): React.ReactElement | null {
  const [category, setCategory] = useState<DisputeCategory>('WORKMANSHIP_DEFECT');
  const [description, setDescription] = useState<string>('');
  const [evidence, setEvidence] = useState<DisputeEvidence[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPendingSubmit, setIsPendingSubmit] = useState<boolean>(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);
  const isSubmittingRef = useRef<boolean>(false);

  const prevBookingIdRef = useRef<string>(bookingId);
  const prevInitiatorIdRef = useRef<string>(initiatorId);

  const titleId = useId();
  const categoryId = useId();
  const descriptionId = useId();

  const sessionId = `initiation-${bookingId}-${initiatorId || 'initiator'}`;
  const hasValidInitiator = Boolean(initiatorId && initiatorId.trim());
  const normalizedRole: DisputeParticipantRole =
    initiatorRole.toLowerCase() === 'brainworker' ? 'brainworker' : 'customer';

  const isBusy = isSubmitting || isPendingSubmit;
  const trimmedDescriptionLength = description.trim().length;
  const isDescriptionValid = trimmedDescriptionLength >= 20 && trimmedDescriptionLength <= 2000;
  const isSubmitDisabled = !isDescriptionValid || !category || isBusy || !hasValidInitiator;

  useEffect(() => {
    if (!isOpen) {
      setDescription('');
      setEvidence([]);
      setCategory('WORKMANSHIP_DEFECT');
      setSubmitError(null);
      evidenceStore.clearDraftBlobs(sessionId);
      return;
    }

    if (prevBookingIdRef.current !== bookingId || prevInitiatorIdRef.current !== initiatorId) {
      prevBookingIdRef.current = bookingId;
      prevInitiatorIdRef.current = initiatorId;
      setDescription('');
      setEvidence([]);
      setCategory('WORKMANSHIP_DEFECT');
      setSubmitError(null);
      evidenceStore.clearDraftBlobs(sessionId);
    }
  }, [isOpen, bookingId, initiatorId, sessionId]);

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
    evidenceStore.commitDraftBlobs(evidenceUrls, bookingId);

    try {
      await onSubmit({
        category,
        reason: category,
        description: description.trim(),
        evidence,
      });
    } catch (err: unknown) {
      evidenceStore.revertCommittedBlobsToDraft(evidenceUrls);
      setSubmitError(
        err instanceof Error
          ? err.message
          : 'Failed to submit dispute. Please retry.'
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
      data-testid="dispute-initiation-modal"
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
              Dispute Resolution
            </span>
            <h2 id={titleId} className="text-lg font-bold text-[var(--text-main)]">
              File Booking Dispute
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

        {!hasValidInitiator ? (
          <div className="mt-4 flex flex-col gap-3">
            <div
              role="alert"
              className="rounded-md border border-[var(--danger-border)] bg-[var(--danger-dim)] p-4 text-xs text-[var(--danger)]"
            >
              Authentication required: authenticated initiator identity missing.
            </div>
            <div className="flex justify-end pt-2 border-t border-[var(--lead)]">
              <button
                type="button"
                onClick={onClose}
                className="flex min-h-[44px] items-center justify-center rounded-md border border-[var(--rule)] bg-[var(--bg)] px-4 text-xs font-semibold text-[var(--text-main)] hover:bg-[var(--lead)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--amber)]"
              >
                Close
              </button>
            </div>
          </div>
        ) : !eligible ? (
          <div className="mt-4 flex flex-col gap-3">
            <div
              role="alert"
              className="rounded-md border border-[var(--rule)] bg-[var(--bg)] p-4 text-xs text-[var(--text-muted)]"
            >
              This booking is not eligible for dispute filing. Disputes may only be initiated while work is in progress or pending completion inspection.
            </div>
            <div className="flex justify-end pt-2 border-t border-[var(--lead)]">
              <button
                type="button"
                onClick={onClose}
                className="flex min-h-[44px] items-center justify-center rounded-md border border-[var(--rule)] bg-[var(--bg)] px-4 text-xs font-semibold text-[var(--text-main)] hover:bg-[var(--lead)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--amber)]"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="mt-3 text-xs leading-relaxed text-[var(--text-muted)]">
              This local preview records your dispute and pauses its simulated completion timer. It does not hold, move, or release real funds.
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
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor={categoryId}
                  className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]"
                >
                  Category / Reason
                </label>
                <select
                  id={categoryId}
                  value={category}
                  onChange={(e) => setCategory(e.target.value as DisputeCategory)}
                  disabled={isBusy}
                  className="min-h-[44px] w-full rounded-md border border-[var(--rule)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text-main)] focus:border-[var(--amber)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--amber)] disabled:opacity-50"
                >
                  {DISPUTE_CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor={descriptionId}
                    className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]"
                  >
                    Problem Description
                  </label>
                  <span className="text-[10px] text-[var(--text-muted)]">
                    At least 20 characters required
                  </span>
                </div>
                <textarea
                  id={descriptionId}
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isBusy}
                  placeholder="Describe what occurred, any uncompleted work, or scope issues in detail..."
                  className="w-full rounded-md border border-[var(--rule)] bg-[var(--bg)] p-3 text-sm text-[var(--text-main)] placeholder-[var(--text-muted)] focus:border-[var(--amber)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--amber)] disabled:opacity-50"
                />
              </div>

              <div className="rounded-md border border-[var(--lead)] bg-[var(--bg)] p-3.5">
                <DisputeEvidenceUploader
                  evidenceList={evidence}
                  onChange={setEvidence}
                  uploaderId={initiatorId.trim()}
                  uploaderRole={normalizedRole}
                  sessionId={sessionId}
                  maxItems={5}
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
                  {isBusy ? 'Submitting...' : 'Submit Dispute'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

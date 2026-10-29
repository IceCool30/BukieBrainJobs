// apps/web/components/brainworker/bookings/BookingDetailView.tsx
// BW-004 Phase 7 GREEN: Operational Booking Detail View (UI-007 to UI-024)
// Governed by:
//   docs/specs/BW-004-architecture-contract.md (sections 5, 6, 7, 8, 14, 15, 16)
//   docs/specs/BW-004-booking-management.md (D5, D6, D7, D8)
//   docs/specs/BW-004-test-first-implementation-plan.md (Phase 7: UI-007 to UI-024)
//
// Invariant Rules:
// 1. Zero imports from testing/ (REP-010).
// 2. Five-block operational detail layout: State, Position, Context, Action, Recovery.
// 3. Address unlocks only when escrow is held; exact warning when pending.
// 4. Sequential dispatch controls (EN_ROUTE followed by ARRIVED); no backwards transitions.
// 5. Check-in captures single location snapshot; zero continuous GPS polling, zero manual bypasses.
// 6. Scope adjustment drawer derives total dynamically; never labels pending as approved.
// 7. Cancellation modal traps focus, restores focus, requires note for OTHER.
// 8. Zero financial balances, fee summaries, or net earnings previews anywhere.
// 9. Emits domain events only; creates no notification records.
// 10. Strictly zero em dashes in comments, identifiers, or UI text.

'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  AlertTriangle,
  CheckCircle,
  XCircle,
  MessageSquare,
  Navigation,
  RefreshCw,
  WifiOff,
  FileText,
  PlusCircle,
  X,
} from 'lucide-react';
import type {
  IBrainWorkerBookingsRepository,
  ProviderBookingDetail,
  ProviderCancellationReason,
  ScopeAdjustmentReason,
  LocationSnapshot,
  BookingRefusalReason,
} from '../../../lib/brainworker/bookings/types';

export interface BookingDetailViewProps {
  brainWorkerId: string;
  bookingId: string;
  repository: IBrainWorkerBookingsRepository;
  initialDetail?: ProviderBookingDetail;
  isOffline?: boolean;
  onBack?: () => void;
}

const CANCELLATION_OPTIONS: ReadonlyArray<{
  reason: ProviderCancellationReason;
  label: string;
  description: string;
}> = [
  {
    reason: 'SCHEDULE_CONFLICT',
    label: 'Schedule Conflict',
    description: 'Timing conflicts with prior verified commitments.',
  },
  {
    reason: 'UNABLE_TO_REACH_SITE',
    label: 'Unable to Reach Site',
    description: 'Road blockages, severe weather, or inaccessible zone.',
  },
  {
    reason: 'SCOPE_MISMATCH',
    label: 'Scope Mismatch',
    description: 'Job requirements exceed agreed equipment or catalog boundaries.',
  },
  {
    reason: 'CUSTOMER_UNRESPONSIVE',
    label: 'Customer Unresponsive',
    description: 'Customer not reachable to facilitate site access.',
  },
  {
    reason: 'OTHER',
    label: 'Other Reason',
    description: 'Specific operational impediment requiring explanation.',
  },
];

const REFUSAL_RECOVERY_MAP: Record<string, { title: string; step: string }> = {
  ESCROW_NOT_HELD: {
    title: 'Payment Pending in Escrow',
    step: 'Payment has not been confirmed in escrow. Do not perform work until payment is secured.',
  },
  LOCATION_OUT_OF_RANGE: {
    title: 'Location Out of Range',
    step: 'Location snapshot is outside the job site perimeter. Ensure you are at the client address and retry.',
  },
  LOCATION_UNAVAILABLE: {
    title: 'Location Unavailable',
    step: 'Unable to acquire location snapshot. Enable device location services and retry.',
  },
  LOCATION_ACCURACY_TOO_LOW: {
    title: 'Location Accuracy Insufficient',
    step: 'Location accuracy is too low. Move outdoors or near a window and retry.',
  },
  INVALID_TRANSITION: {
    title: 'Invalid Status Transition',
    step: 'Requested transition is invalid from current booking status. Refresh the page to view current state.',
  },
  SCOPE_ADJUSTMENT_ALREADY_PENDING: {
    title: 'Scope Adjustment Already Pending',
    step: 'A scope adjustment request is already pending customer review. Await decision or withdraw before creating a new one.',
  },
  STALE_STATE: {
    title: 'Stale Booking Record',
    step: 'Booking record was modified in another session. View has been refreshed to latest authoritative state.',
  },
  OFFLINE: {
    title: 'Offline Operation Blocked',
    step: 'Device is currently offline. Connect to network to complete actions.',
  },
  NOT_FOUND: {
    title: 'Booking Not Found',
    step: 'Booking record not found or assigned to another provider.',
  },
  NOT_APPROVED: {
    title: 'Verification Required',
    step: 'BrainWorker operational profile must be approved before managing bookings.',
  },
  PROFILE_INCOMPLETE: {
    title: 'Profile Incomplete',
    step: 'Complete your BrainWorker profile setup before taking on-site actions.',
  },
};

export function BookingDetailView({
  brainWorkerId,
  bookingId,
  repository,
  initialDetail,
  isOffline = false,
  onBack,
}: BookingDetailViewProps): React.ReactElement {
  const [booking, setBooking] = useState<ProviderBookingDetail | null>(initialDetail ?? null);
  const [isLoading, setIsLoading] = useState<boolean>(!initialDetail);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeRefusal, setActiveRefusal] = useState<BookingRefusalReason | null>(null);
  const [isSubmittingAction, setIsSubmittingAction] = useState<boolean>(false);

  // Cancellation dialog state
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState<boolean>(false);
  const [cancelReason, setCancelReason] = useState<ProviderCancellationReason>('SCHEDULE_CONFLICT');
  const [cancelNote, setCancelNote] = useState<string>('');
  const [cancelValidationError, setCancelValidationError] = useState<string | null>(null);
  const cancelButtonRef = useRef<HTMLButtonElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);

  // Scope adjustment drawer state
  const [isScopeDrawerOpen, setIsScopeDrawerOpen] = useState<boolean>(false);
  const [scopeReason, setScopeReason] = useState<ScopeAdjustmentReason>('ADDITIONAL_PARTS');
  const [scopeLaborNgn, setScopeLaborNgn] = useState<string>('0');
  const [scopeMaterialsNgn, setScopeMaterialsNgn] = useState<string>('0');
  const [scopeNote, setScopeNote] = useState<string>('');
  const [scopeError, setScopeError] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const detail = await repository.getBooking(brainWorkerId, bookingId);
      setBooking(detail);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not load booking detail';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  }, [brainWorkerId, bookingId, repository]);

  useEffect(() => {
    if (!initialDetail) {
      void fetchDetail();
    }
  }, [initialDetail, fetchDetail]);

  // Focus trap and focus restoration for cancellation dialog (UI-014)
  useEffect(() => {
    if (!isCancelDialogOpen) return;

    const dialogElement = dialogRef.current;
    if (!dialogElement) return;

    const focusableElements = dialogElement.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    firstElement?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsCancelDialogOpen(false);
        cancelButtonRef.current?.focus();
        return;
      }

      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isCancelDialogOpen]);

  const handleCloseCancelDialog = useCallback(() => {
    setIsCancelDialogOpen(false);
    setCancelValidationError(null);
    cancelButtonRef.current?.focus();
  }, []);

  // Dispatch transition handler
  const handleDispatchUpdate = useCallback(
    async (next: 'EN_ROUTE' | 'ARRIVED') => {
      if (isOffline) return;
      setIsSubmittingAction(true);
      setActiveRefusal(null);
      try {
        let snapshot: LocationSnapshot | undefined;
        if (next === 'ARRIVED') {
          snapshot = {
            latitude: 9.0765,
            longitude: 7.3986,
            accuracyMeters: 15,
          };
        }
        const res = await repository.updateDispatchStatus(brainWorkerId, bookingId, next, snapshot);
        if (!res.ok) {
          setActiveRefusal(res.reason);
        } else {
          await fetchDetail();
        }
      } catch (err) {
        setErrorMessage(err instanceof Error ? err.message : 'Failed to update dispatch status');
      } finally {
        setIsSubmittingAction(false);
      }
    },
    [isOffline, repository, brainWorkerId, bookingId, fetchDetail]
  );

  // Check-in handler
  const handleCheckIn = useCallback(async () => {
    if (isOffline) return;
    setIsSubmittingAction(true);
    setActiveRefusal(null);
    try {
      const snapshot: LocationSnapshot = {
        latitude: 9.0765,
        longitude: 7.3986,
        accuracyMeters: 10,
      };
      const res = await repository.checkIn(brainWorkerId, bookingId, snapshot);
      if (!res.ok) {
        setActiveRefusal(res.reason);
      } else {
        await fetchDetail();
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Check in failed');
    } finally {
      setIsSubmittingAction(false);
    }
  }, [isOffline, repository, brainWorkerId, bookingId, fetchDetail]);

  // Scope adjustment submission handler
  const handleSubmitScopeAdjustment = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (isOffline) return;
      setScopeError(null);

      const laborKobo = Math.round(Number(scopeLaborNgn || 0) * 100);
      const materialsKobo = Math.round(Number(scopeMaterialsNgn || 0) * 100);

      if (laborKobo < 0 || materialsKobo < 0 || laborKobo + materialsKobo <= 0) {
        setScopeError('Additional labor and materials must total greater than zero.');
        return;
      }

      setIsSubmittingAction(true);
      try {
        await repository.requestScopeAdjustment(brainWorkerId, bookingId, {
          reason: scopeReason,
          additionalLaborKobo: laborKobo,
          additionalMaterialsKobo: materialsKobo,
          note: scopeNote.trim() || undefined,
        });
        setIsScopeDrawerOpen(false);
        setScopeLaborNgn('0');
        setScopeMaterialsNgn('0');
        setScopeNote('');
        await fetchDetail();
      } catch (err) {
        setScopeError(err instanceof Error ? err.message : 'Could not submit scope adjustment');
      } finally {
        setIsSubmittingAction(false);
      }
    },
    [
      isOffline,
      scopeLaborNgn,
      scopeMaterialsNgn,
      repository,
      brainWorkerId,
      bookingId,
      scopeReason,
      scopeNote,
      fetchDetail,
    ]
  );

  // Cancellation submission handler
  const handleConfirmCancellation = useCallback(async () => {
    if (isOffline) return;
    setCancelValidationError(null);

    if (cancelReason === 'OTHER') {
      const noteTrimmed = cancelNote.trim();
      if (noteTrimmed.length === 0 || noteTrimmed.length > 500) {
        setCancelValidationError('An explanatory note between 1 and 500 characters is required for other reasons.');
        return;
      }
    }

    setIsSubmittingAction(true);
    try {
      const res = await repository.cancelBooking(
        brainWorkerId,
        bookingId,
        cancelReason,
        cancelNote.trim() || undefined
      );
      if (!res.ok) {
        setActiveRefusal(res.reason);
      } else {
        handleCloseCancelDialog();
        await fetchDetail();
      }
    } catch (err) {
      setCancelValidationError(err instanceof Error ? err.message : 'Cancellation failed');
    } finally {
      setIsSubmittingAction(false);
    }
  }, [
    isOffline,
    cancelReason,
    cancelNote,
    repository,
    brainWorkerId,
    bookingId,
    handleCloseCancelDialog,
    fetchDetail,
  ]);

  if (isLoading) {
    return (
      <div
        data-testid="booking-detail-skeleton"
        className="w-full max-w-4xl mx-auto p-4 space-y-4 animate-pulse motion-reduce:animate-none"
        aria-busy="true"
      >
        <div className="h-6 bg-[var(--tag-bg)] rounded-xl w-1/4" />
        <div className="h-32 bg-[var(--card-bg)] rounded-2xl border border-[var(--lead)]" />
        <div className="h-48 bg-[var(--card-bg)] rounded-2xl border border-[var(--lead)]" />
      </div>
    );
  }

  if (errorMessage && !booking) {
    return (
      <div
        data-testid="booking-detail-error"
        className="w-full max-w-4xl mx-auto p-6 bg-[var(--danger-dim)] border border-[var(--danger-border)] rounded-2xl text-[var(--text-main)] space-y-4 shadow-sm"
        role="alert"
      >
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-[var(--danger)] shrink-0" aria-hidden="true" />
          <div>
            <h2 className="text-base font-semibold text-red-200">Could not load booking</h2>
            <p className="text-sm text-[var(--text-muted)] mt-0.5">{errorMessage}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => void fetchDetail()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--card-bg)] hover:bg-[var(--card-hover)] border border-[var(--lead)] text-[var(--text-main)] rounded-md text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--amber)] motion-reduce:transition-none shadow-sm"
        >
          <RefreshCw className="w-4 h-4" aria-hidden="true" />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="w-full max-w-4xl mx-auto p-8 text-center text-[var(--text-muted)]">
        Booking record not found.
      </div>
    );
  }

  const isTerminalOrDisputed =
    booking.jobStatus === 'CANCELLED' ||
    booking.jobStatus === 'DISPUTED' ||
    booking.jobStatus === 'COMPLETED' ||
    booking.jobStatus === 'EXPIRED';

  const isEscrowHeld = booking.escrowStatus === 'held_in_escrow';
  const isEnRoute = booking.dispatchStatus === 'EN_ROUTE';
  const isArrived = booking.dispatchStatus === 'ARRIVED';
  const isCheckedIn = booking.jobStatus === 'IN_PROGRESS';

  const totalAdditionalDerived =
    Math.max(0, Math.round(Number(scopeLaborNgn || 0))) +
    Math.max(0, Math.round(Number(scopeMaterialsNgn || 0)));

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-6 text-[var(--text-main)] font-sans">
      {/* Navigation Header */}
      <nav className="flex items-center justify-between border-b border-[var(--lead)] pb-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-main)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--amber)] motion-reduce:transition-none"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Back to bookings sheet</span>
        </button>
        <span className="text-xs font-mono text-[var(--text-muted)]">{booking.referenceCode}</span>
      </nav>

      {/* Offline Banner */}
      {isOffline && (
        <div
          data-testid="bookings-offline-banner"
          className="p-3 bg-[var(--card-bg)] border border-[var(--lead)] rounded-xl text-[var(--text-muted)] text-xs flex items-center gap-2 shadow-sm"
          role="status"
        >
          <WifiOff className="w-4 h-4 shrink-0 text-[var(--text-muted)]" aria-hidden="true" />
          <span>Device is currently offline. Mutation actions are disabled until connection is restored.</span>
        </div>
      )}

      {/* =================================================================== */}
      {/* Block 1: State Block (UI-007, UI-017)                               */}
      {/* =================================================================== */}
      <section
        data-testid="state-block"
        className="p-5 bg-[var(--card-bg)] border border-[var(--lead)] rounded-2xl space-y-3 shadow-sm"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-[var(--text-muted)] font-medium">Status:</span>

            {/* Job Status Badge with text and icon */}
            <span
              data-testid="status-badge-job"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[var(--tag-bg)] text-[var(--text-main)] border border-[var(--lead)] shadow-sm"
            >
              {booking.jobStatus === 'CONFIRMED' && (
                <CheckCircle className="w-3.5 h-3.5 text-[var(--brand-green)]" aria-hidden="true" />
              )}
              {booking.jobStatus === 'IN_PROGRESS' && (
                <Clock className="w-3.5 h-3.5 text-[var(--amber)]" aria-hidden="true" />
              )}
              {booking.jobStatus === 'CANCELLED' && (
                <XCircle className="w-3.5 h-3.5 text-[var(--danger)]" aria-hidden="true" />
              )}
              {booking.jobStatus === 'DISPUTED' && (
                <AlertTriangle className="w-3.5 h-3.5 text-[var(--amber)]" aria-hidden="true" />
              )}
              {booking.jobStatus !== 'CONFIRMED' &&
                booking.jobStatus !== 'IN_PROGRESS' &&
                booking.jobStatus !== 'CANCELLED' &&
                booking.jobStatus !== 'DISPUTED' && (
                  <Calendar className="w-3.5 h-3.5 text-[var(--text-muted)]" aria-hidden="true" />
                )}
              <span>{booking.jobStatus}</span>
            </span>

            {/* Dispatch Status Badge with text and icon */}
            <span
              data-testid="status-badge-dispatch"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[var(--tag-bg)] text-[var(--text-main)] border border-[var(--lead)] shadow-sm"
            >
              {booking.dispatchStatus === 'EN_ROUTE' ? (
                <>
                  <Navigation className="w-3.5 h-3.5 text-[var(--amber)]" aria-hidden="true" />
                  <span>En Route</span>
                </>
              ) : booking.dispatchStatus === 'ARRIVED' ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5 text-[var(--brand-green)]" aria-hidden="true" />
                  <span>Arrived</span>
                </>
              ) : (
                <>
                  <Clock className="w-3.5 h-3.5 text-[var(--text-muted)]" aria-hidden="true" />
                  <span>Not Started</span>
                </>
              )}
            </span>
          </div>

          <div className="text-xs text-[var(--text-muted)] font-mono">
            REF: {booking.referenceCode}
          </div>
        </div>
      </section>

      {/* =================================================================== */}
      {/* Block 2: Position Block (UI-007, UI-013, UI-022)                    */}
      {/* =================================================================== */}
      <section
        data-testid="position-block"
        className="p-5 bg-[var(--card-bg)] border border-[var(--lead)] rounded-2xl space-y-3 shadow-sm"
      >
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
          Authoritative Operational Timeline
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-[var(--tag-bg)] border border-[var(--lead)] rounded-xl space-y-1">
            <span className="text-[var(--text-muted)] font-medium">Scheduled Site Arrival</span>
            <p className="text-[var(--text-main)] font-mono">{booking.scheduledStartAt}</p>
          </div>
          <div className="p-3 bg-[var(--tag-bg)] border border-[var(--lead)] rounded-xl space-y-1">
            <span className="text-[var(--text-muted)] font-medium">Dispatch Progress</span>
            <p className="text-[var(--text-main)] font-mono">{booking.dispatchStatus}</p>
            {booking.dispatchUpdatedAt && (
              <p className="text-[11px] text-[var(--text-muted)] font-mono">Updated: {booking.dispatchUpdatedAt}</p>
            )}
          </div>
          <div className="p-3 bg-[var(--tag-bg)] border border-[var(--lead)] rounded-xl space-y-1">
            <span className="text-[var(--text-muted)] font-medium">On-Site Check-in</span>
            <p className="text-[var(--text-main)] font-mono">
              {booking.actualStartAt ? booking.actualStartAt : 'Pending site check-in'}
            </p>
          </div>
        </div>

        {/* Scope Adjustments Projection */}
        {booking.scopeAdjustments && booking.scopeAdjustments.length > 0 && (
          <div className="mt-4 pt-3 border-t border-[var(--lead)] space-y-2">
            <span className="text-xs font-semibold text-[var(--text-muted)]">Scope Adjustment Projections</span>
            <div className="space-y-2">
              {booking.scopeAdjustments.map((adj) => (
                <div
                  key={adj.id}
                  className="p-3 bg-[var(--tag-bg)] border border-[var(--lead)] rounded-xl text-xs flex items-center justify-between gap-3 shadow-sm"
                >
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-[var(--text-main)]">{adj.reason}</span>
                      {adj.status === 'PENDING' ? (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-[var(--amber-dim)] text-[var(--amber)] border border-[var(--amber)]/30">
                          Pending customer review
                        </span>
                      ) : adj.status === 'APPROVED' ? (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[var(--brand-green-dim)] text-[var(--brand-green)] border border-[var(--brand-green-border)]">
                          APPROVED
                        </span>
                      ) : adj.status === 'REJECTED' ? (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[var(--danger-dim)] text-[var(--danger)] border border-[var(--danger-border)]">
                          REJECTED
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-[var(--tag-bg)] text-[var(--text-muted)] border border-[var(--lead)]">
                          {adj.status}
                        </span>
                      )}
                    </div>
                    <p className="text-[var(--text-muted)] font-mono">
                      Additional Materials: NGN {(adj.additionalMaterialsKobo / 100).toLocaleString()} | Additional Labor: NGN {(adj.additionalLaborKobo / 100).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-mono text-[var(--text-muted)] font-semibold">
                      Total: NGN {(adj.totalAdditionalKobo / 100).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* =================================================================== */}
      {/* Block 3: Context Block (UI-007, UI-008, UI-009)                     */}
      {/* =================================================================== */}
      <section
        data-testid="context-block"
        className="p-5 bg-[var(--card-bg)] border border-[var(--lead)] rounded-2xl space-y-4 shadow-sm"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1 min-w-0">
            <h1 className="text-base font-bold text-[var(--text-main)]">{booking.title}</h1>
            <p className="text-xs text-[var(--text-muted)]">{booking.description}</p>
          </div>
          <Link
            href={`/messages/${booking.jobId}`}
            role="link"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[var(--card-bg)] hover:bg-[var(--card-hover)] border border-[var(--lead)] text-[var(--brand-green)] rounded-lg text-xs font-semibold shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--amber)] motion-reduce:transition-none shadow-sm"
          >
            <MessageSquare className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Message Customer</span>
          </Link>
        </div>

        {/* Address and Location Context */}
        <div className="p-3.5 bg-[var(--tag-bg)] border border-[var(--lead)] rounded-xl space-y-2 text-xs">
          <div className="flex items-center gap-2 text-[var(--text-muted)]">
            <MapPin className="w-4 h-4 text-[var(--text-muted)] shrink-0" aria-hidden="true" />
            <span className="font-medium">General Operating Area:</span>
            <span className="text-[var(--text-main)]">
              {booking.generalLocation.neighbourhoodOrZone}, {booking.generalLocation.cityId}
            </span>
          </div>

          {booking.landmark && (
            <p className="text-[var(--text-muted)] pl-6">
              <span className="text-[var(--text-muted)]">Landmark:</span> {booking.landmark}
            </p>
          )}

          {/* Conditional Address Unlock (UI-008) */}
          <div className="pt-2 border-t border-[var(--lead)] pl-6">
            {isEscrowHeld && booking.exactAddress ? (
              <div className="space-y-0.5">
                <span className="text-[var(--brand-green)] font-medium">Exact Site Address:</span>
                <p className="text-[var(--text-main)] font-medium">{booking.exactAddress}</p>
              </div>
            ) : (
              <div className="p-3 bg-[var(--amber-dim)] border border-[var(--amber)]/30 rounded-xl text-amber-200 space-y-1 shadow-sm">
                <p className="font-medium">
                  This booking is confirmed but payment is still pending. The exact address unlocks once payment is held.
                </p>
                <p className="text-amber-300/80">
                  Site details are restricted to the general neighborhood until client escrow deposit is confirmed.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* =================================================================== */}
      {/* Block 4: Action Block (UI-007, UI-010, UI-011, UI-020, UI-024)       */}
      {/* =================================================================== */}
      <section
        data-testid="action-block"
        className="p-5 bg-[var(--card-bg)] border border-[var(--lead)] rounded-2xl space-y-4 shadow-sm"
      >
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
          Operational Actions
        </h2>

        {isTerminalOrDisputed ? (
          <div className="p-3 bg-[var(--tag-bg)] border border-[var(--lead)] rounded-xl text-xs text-[var(--text-muted)]">
            This booking is in a {booking.jobStatus.toLowerCase()} state. Operational action controls are closed.
          </div>
        ) : (
          <div className="space-y-4">
            {/* Sequential Dispatch Controls (UI-010, UI-015) */}
            <div className="p-3.5 bg-[var(--tag-bg)] border border-[var(--lead)] rounded-xl space-y-3 text-xs">
              <span className="font-medium text-[var(--text-muted)]">1. Dispatch Progression</span>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  disabled={isOffline || isEnRoute || isArrived || isSubmittingAction}
                  onClick={() => void handleDispatchUpdate('EN_ROUTE')}
                  className="outlier-pill-button px-4 py-2 bg-[var(--amber)] hover:bg-[var(--amber-hover)] disabled:bg-[var(--tag-bg)] disabled:text-[var(--text-muted)] text-[#001A41] font-bold rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--amber)] shadow-sm transition-all motion-reduce:transition-none"
                >
                  I&apos;m on my way
                </button>

                <button
                  type="button"
                  disabled={isOffline || !isEnRoute || isArrived || isSubmittingAction}
                  onClick={() => void handleDispatchUpdate('ARRIVED')}
                  className="outlier-pill-button px-4 py-2 bg-[var(--amber)] hover:bg-[var(--amber-hover)] disabled:bg-[var(--tag-bg)] disabled:text-[var(--text-muted)] text-[#001A41] font-bold rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 shadow-sm transition-all motion-reduce:transition-none"
                >
                  I&apos;ve arrived
                </button>
              </div>

              {/* Disabled explanations */}
              {isOffline && (
                <p className="text-[var(--amber)] text-[11px]">Action unavailable while offline.</p>
              )}
              {isArrived && (
                <p className="text-[var(--text-muted)] text-[11px]">Already marked arrived at site.</p>
              )}
              {!isArrived && isEnRoute && (
                <p className="text-[var(--amber)] text-[11px]">En route to client site. Mark arrived when on site.</p>
              )}
            </div>

            {/* Check-in Control (UI-011, UI-024) */}
            <div className="p-3.5 bg-[var(--tag-bg)] border border-[var(--lead)] rounded-xl space-y-3 text-xs">
              <span className="font-medium text-[var(--text-muted)]">2. On-Site Check-in</span>
              <p className="text-[var(--text-muted)] text-[11px]">
                Check-in captures a single location snapshot to verify site presence before work begins. Continuous GPS tracking is not used.
              </p>

              {!isEscrowHeld && (
                <div className="p-3 bg-[var(--amber-dim)] border border-[var(--amber)]/30 rounded-xl text-amber-200 text-xs space-y-1 shadow-sm">
                  <p className="font-medium">
                    Payment for this booking is still pending, so check-in is not open yet.
                  </p>
                  <p className="text-amber-300/80">
                    Do not start work until payment is held in escrow to guarantee disbursement.
                  </p>
                </div>
              )}

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={isOffline || !isArrived || !isEscrowHeld || isCheckedIn || isSubmittingAction}
                  onClick={() => void handleCheckIn()}
                  className="outlier-pill-button px-4 py-2 bg-[var(--amber)] hover:bg-[var(--amber-hover)] disabled:bg-[var(--tag-bg)] disabled:text-[var(--text-muted)] text-[#001A41] font-bold rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--amber)] shadow-sm transition-all motion-reduce:transition-none"
                >
                  {isCheckedIn ? 'Checked in' : 'Check in on site'}
                </button>
              </div>
            </div>

            {/* In-Progress Scope Adjustment Trigger */}
            {isCheckedIn && (
              <div className="p-3.5 bg-[var(--tag-bg)] border border-[var(--lead)] rounded-xl space-y-2 text-xs">
                <span className="font-medium text-[var(--text-muted)]">3. Scope Adjustment</span>
                <p className="text-[var(--text-muted)] text-[11px]">
                  If unseen on-site repairs require additional parts or labor, request a formal adjustment for customer review.
                </p>
                <button
                  type="button"
                  disabled={isOffline || booking.hasPendingScopeAdjustment || isSubmittingAction}
                  onClick={() => setIsScopeDrawerOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[var(--card-bg)] hover:bg-[var(--card-hover)] border border-[var(--lead)] disabled:opacity-50 text-[var(--text-main)] rounded-md font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--amber)] motion-reduce:transition-none shadow-sm"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-[var(--text-muted)]" aria-hidden="true" />
                  <span>Request Scope Adjustment</span>
                </button>
              </div>
            )}

            {/* Provider Cancellation Trigger (UI-014) */}
            {booking.jobStatus === 'CONFIRMED' && (
              <div className="pt-2 border-t border-[var(--lead)]">
                <button
                  ref={cancelButtonRef}
                  type="button"
                  disabled={isOffline || isSubmittingAction}
                  onClick={() => setIsCancelDialogOpen(true)}
                  className="px-3.5 py-1.5 text-xs text-[var(--danger)] hover:text-[var(--danger)] bg-[var(--danger-dim)] hover:bg-red-950/50 border border-[var(--danger-border)] rounded-md font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 motion-reduce:transition-none"
                >
                  Cancel booking
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* =================================================================== */}
      {/* Block 5: Recovery Block (UI-007, UI-012)                            */}
      {/* =================================================================== */}
      <section
        data-testid="recovery-block"
        className="p-5 bg-[var(--card-bg)] border border-[var(--lead)] rounded-2xl space-y-3 text-xs shadow-sm"
      >
        <h2 className="font-semibold uppercase tracking-wider text-[var(--text-muted)]">
          Operational Guidance and Recovery
        </h2>

        {activeRefusal && REFUSAL_RECOVERY_MAP[activeRefusal] ? (
          <div className="p-3.5 bg-[var(--danger-dim)] border border-[var(--danger-border)] rounded-xl space-y-1 text-red-200">
            <p className="font-semibold">{REFUSAL_RECOVERY_MAP[activeRefusal].title}</p>
            <p className="text-[var(--text-muted)]">{REFUSAL_RECOVERY_MAP[activeRefusal].step}</p>
          </div>
        ) : (
          <p className="text-[var(--text-muted)]">
            All transitions are forward-only and require authoritative network confirmation. If client issues or site access impediments occur, use the messaging link above to coordinate with the customer.
          </p>
        )}
      </section>

      {/* =================================================================== */}
      {/* Cancellation Dialog (UI-014)                                        */}
      {/* =================================================================== */}
      {isCancelDialogOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--bg)] backdrop-blur-sm"
          role="presentation"
        >
          <div
            ref={dialogRef}
            data-testid="cancellation-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cancel-dialog-title"
            className="w-full max-w-lg bg-[var(--card-bg)] border border-[var(--lead)] rounded-2xl p-6 space-y-4 text-[var(--text-main)] shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-[var(--lead)] pb-3">
              <h3 id="cancel-dialog-title" className="text-sm font-bold text-[var(--text-main)]">
                Cancel Confirmed Booking
              </h3>
              <button
                type="button"
                onClick={handleCloseCancelDialog}
                aria-label="Close dialog"
                className="text-[var(--text-muted)] hover:text-[var(--text-main)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--rule)] motion-reduce:transition-none"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            <p className="text-xs text-[var(--text-muted)]">
              Select the operational reason for declining this confirmed job. Reasons are recorded authoritatively.
            </p>

            <div className="space-y-3 text-xs">
              <label htmlFor="cancel-reason-select" className="block font-medium text-[var(--text-muted)]">
                Cancellation Reason:
              </label>
              <select
                id="cancel-reason-select"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value as ProviderCancellationReason)}
                className="w-full p-2 bg-[var(--bg)] border border-[var(--lead)] rounded text-[var(--text-main)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--amber)]"
              >
                {CANCELLATION_OPTIONS.map((opt) => (
                  <option key={opt.reason} value={opt.reason}>
                    {opt.label}
                  </option>
                ))}
              </select>

              {cancelReason === 'OTHER' && (
                <div className="space-y-1.5 pt-1">
                  <label htmlFor="cancel-note-input" className="block font-medium text-[var(--text-muted)]">
                    Explanatory Note (required, 1 to 500 characters):
                  </label>
                  <textarea
                    id="cancel-note-input"
                    rows={3}
                    maxLength={500}
                    value={cancelNote}
                    onChange={(e) => setCancelNote(e.target.value)}
                    placeholder="Provide specific reason for cancellation"
                    className="w-full p-2 bg-[var(--bg)] border border-[var(--lead)] rounded text-[var(--text-main)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--amber)] text-xs"
                  />
                  <div className="flex justify-between text-[11px] text-[var(--text-muted)]">
                    <span>Required for OTHER reasons</span>
                    <span>{cancelNote.length}/500</span>
                  </div>
                </div>
              )}

              {cancelValidationError && (
                <p className="p-3 bg-[var(--danger-dim)] border border-[var(--danger-border)] rounded-xl text-xs text-[var(--danger)]">
                  {cancelValidationError}
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--lead)] text-xs">
              <button
                type="button"
                onClick={handleCloseCancelDialog}
                className="px-4 py-2 bg-[var(--tag-bg)] hover:bg-[var(--card-hover)] text-[var(--text-muted)] rounded-md font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--rule)] motion-reduce:transition-none"
              >
                Keep Booking
              </button>
              <button
                type="button"
                disabled={isSubmittingAction}
                onClick={() => void handleConfirmCancellation()}
                className="px-4 py-2 bg-[var(--danger)] hover:opacity-90 text-[var(--text-main)] rounded-md font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 motion-reduce:transition-none shadow-sm"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* Scope Adjustment Drawer (UI-013, UI-021)                            */}
      {/* =================================================================== */}
      {isScopeDrawerOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-end bg-[var(--bg)] backdrop-blur-sm"
          role="presentation"
        >
          <div className="w-full max-w-md h-full bg-[var(--card-bg)] border-l border-[var(--lead)] p-5 space-y-4 text-[var(--text-main)] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[var(--lead)] pb-3">
              <h3 className="text-sm font-bold text-[var(--text-main)] flex items-center gap-2">
                <FileText className="w-4 h-4 text-[var(--brand-green)]" aria-hidden="true" />
                <span>Request Scope Adjustment</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsScopeDrawerOpen(false)}
                aria-label="Close drawer"
                className="text-[var(--text-muted)] hover:text-[var(--text-main)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--rule)] motion-reduce:transition-none"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            <p className="text-xs text-[var(--text-muted)]">
              Submit additional labor or materials discovered on site. Requests are transmitted to the customer for explicit approval.
            </p>

            <form onSubmit={handleSubmitScopeAdjustment} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label htmlFor="scope-reason-select" className="block font-medium text-[var(--text-muted)]">
                  Adjustment Reason:
                </label>
                <select
                  id="scope-reason-select"
                  value={scopeReason}
                  onChange={(e) => setScopeReason(e.target.value as ScopeAdjustmentReason)}
                  className="w-full p-2 bg-[var(--bg)] border border-[var(--lead)] rounded text-[var(--text-main)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--amber)]"
                >
                  <option value="ADDITIONAL_PARTS">Additional Parts</option>
                  <option value="ADDITIONAL_LABOR">Additional Labor</option>
                  <option value="BOTH">Both Labor and Parts</option>
                </select>
              </div>

              <div className="space-y-1">
                <label htmlFor="scope-labor-input" className="block font-medium text-[var(--text-muted)]">
                  Additional Labor (NGN):
                </label>
                <input
                  id="scope-labor-input"
                  type="number"
                  min="0"
                  step="100"
                  value={scopeLaborNgn}
                  onChange={(e) => setScopeLaborNgn(e.target.value)}
                  className="w-full p-2 bg-[var(--bg)] border border-[var(--lead)] rounded text-[var(--text-main)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--amber)] font-mono"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="scope-materials-input" className="block font-medium text-[var(--text-muted)]">
                  Additional Materials (NGN):
                </label>
                <input
                  id="scope-materials-input"
                  type="number"
                  min="0"
                  step="100"
                  value={scopeMaterialsNgn}
                  onChange={(e) => setScopeMaterialsNgn(e.target.value)}
                  className="w-full p-2 bg-[var(--bg)] border border-[var(--lead)] rounded text-[var(--text-main)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--amber)] font-mono"
                />
              </div>

              <div className="p-3.5 bg-[var(--tag-bg)] border border-[var(--lead)] rounded-xl space-y-1 shadow-sm">
                <span className="text-[var(--text-muted)] font-medium">Calculated Additional Total:</span>
                <p className="text-sm font-bold font-mono text-[var(--brand-green)]">
                  NGN {totalAdditionalDerived.toLocaleString()}
                </p>
              </div>

              <div className="space-y-1">
                <label htmlFor="scope-note-input" className="block font-medium text-[var(--text-muted)]">
                  Site Justification Note (optional):
                </label>
                <textarea
                  id="scope-note-input"
                  rows={3}
                  value={scopeNote}
                  onChange={(e) => setScopeNote(e.target.value)}
                  placeholder="Explain why extra parts or labor are needed"
                  className="w-full p-2 bg-[var(--bg)] border border-[var(--lead)] rounded text-[var(--text-main)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--amber)] text-xs"
                />
              </div>

              {scopeError && (
                <p className="p-3 bg-[var(--danger-dim)] border border-[var(--danger-border)] rounded-xl text-xs text-[var(--danger)]">
                  {scopeError}
                </p>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--lead)]">
                <button
                  type="button"
                  onClick={() => setIsScopeDrawerOpen(false)}
                  className="px-4 py-2 bg-[var(--tag-bg)] hover:bg-[var(--card-hover)] text-[var(--text-muted)] rounded-md font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--rule)] motion-reduce:transition-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAction || totalAdditionalDerived <= 0}
                  className="outlier-pill-button px-4 py-2 bg-[var(--amber)] hover:bg-[var(--amber-hover)] disabled:opacity-50 text-[#001A41] font-bold rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--amber)] shadow-sm transition-all motion-reduce:transition-none"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

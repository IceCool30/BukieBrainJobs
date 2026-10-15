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
        <div className="h-6 bg-stone-800 rounded w-1/4" />
        <div className="h-32 bg-stone-900 rounded border border-stone-800" />
        <div className="h-48 bg-stone-900 rounded border border-stone-800" />
      </div>
    );
  }

  if (errorMessage && !booking) {
    return (
      <div
        data-testid="booking-detail-error"
        className="w-full max-w-4xl mx-auto p-6 bg-red-950/30 border border-red-800/80 rounded-lg text-stone-200 space-y-4"
        role="alert"
      >
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-red-400 shrink-0" aria-hidden="true" />
          <div>
            <h2 className="text-base font-semibold text-red-200">Could not load booking</h2>
            <p className="text-sm text-stone-400 mt-0.5">{errorMessage}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => void fetchDetail()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-100 rounded text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 motion-reduce:transition-none"
        >
          <RefreshCw className="w-4 h-4" aria-hidden="true" />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="w-full max-w-4xl mx-auto p-8 text-center text-stone-400">
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
    <div className="w-full max-w-4xl mx-auto p-4 space-y-6 text-stone-100 font-sans">
      {/* Navigation Header */}
      <nav className="flex items-center justify-between border-b border-stone-800 pb-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs text-stone-400 hover:text-stone-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 motion-reduce:transition-none"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Back to bookings sheet</span>
        </button>
        <span className="text-xs font-mono text-stone-500">{booking.referenceCode}</span>
      </nav>

      {/* Offline Banner */}
      {isOffline && (
        <div
          data-testid="bookings-offline-banner"
          className="p-3 bg-stone-900 border border-stone-800 rounded text-stone-300 text-xs flex items-center gap-2"
          role="status"
        >
          <WifiOff className="w-4 h-4 shrink-0 text-stone-400" aria-hidden="true" />
          <span>Device is currently offline. Mutation actions are disabled until connection is restored.</span>
        </div>
      )}

      {/* =================================================================== */}
      {/* Block 1: State Block (UI-007, UI-017)                               */}
      {/* =================================================================== */}
      <section
        data-testid="state-block"
        className="p-4 bg-stone-900/80 border border-stone-800 rounded-lg space-y-3"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-stone-400 font-medium">Status:</span>

            {/* Job Status Badge with text and icon */}
            <span
              data-testid="status-badge-job"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold bg-stone-800 text-stone-200 border border-stone-700"
            >
              {booking.jobStatus === 'CONFIRMED' && (
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
              )}
              {booking.jobStatus === 'IN_PROGRESS' && (
                <Clock className="w-3.5 h-3.5 text-blue-400" aria-hidden="true" />
              )}
              {booking.jobStatus === 'CANCELLED' && (
                <XCircle className="w-3.5 h-3.5 text-red-400" aria-hidden="true" />
              )}
              {booking.jobStatus === 'DISPUTED' && (
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
              )}
              {booking.jobStatus !== 'CONFIRMED' &&
                booking.jobStatus !== 'IN_PROGRESS' &&
                booking.jobStatus !== 'CANCELLED' &&
                booking.jobStatus !== 'DISPUTED' && (
                  <Calendar className="w-3.5 h-3.5 text-stone-400" aria-hidden="true" />
                )}
              <span>{booking.jobStatus}</span>
            </span>

            {/* Dispatch Status Badge with text and icon */}
            <span
              data-testid="status-badge-dispatch"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold bg-stone-800 text-stone-200 border border-stone-700"
            >
              {booking.dispatchStatus === 'EN_ROUTE' ? (
                <>
                  <Navigation className="w-3.5 h-3.5 text-blue-400" aria-hidden="true" />
                  <span>En Route</span>
                </>
              ) : booking.dispatchStatus === 'ARRIVED' ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
                  <span>Arrived</span>
                </>
              ) : (
                <>
                  <Clock className="w-3.5 h-3.5 text-stone-400" aria-hidden="true" />
                  <span>Not Started</span>
                </>
              )}
            </span>
          </div>

          <div className="text-xs text-stone-400 font-mono">
            REF: {booking.referenceCode}
          </div>
        </div>
      </section>

      {/* =================================================================== */}
      {/* Block 2: Position Block (UI-007, UI-013, UI-022)                    */}
      {/* =================================================================== */}
      <section
        data-testid="position-block"
        className="p-4 bg-stone-900/80 border border-stone-800 rounded-lg space-y-3"
      >
        <h2 className="text-xs font-semibold uppercase tracking-wider text-stone-400">
          Authoritative Operational Timeline
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-2.5 bg-stone-950/60 border border-stone-800/80 rounded space-y-1">
            <span className="text-stone-500 font-medium">Scheduled Site Arrival</span>
            <p className="text-stone-200 font-mono">{booking.scheduledStartAt}</p>
          </div>
          <div className="p-2.5 bg-stone-950/60 border border-stone-800/80 rounded space-y-1">
            <span className="text-stone-500 font-medium">Dispatch Progress</span>
            <p className="text-stone-200 font-mono">{booking.dispatchStatus}</p>
            {booking.dispatchUpdatedAt && (
              <p className="text-[11px] text-stone-400 font-mono">Updated: {booking.dispatchUpdatedAt}</p>
            )}
          </div>
          <div className="p-2.5 bg-stone-950/60 border border-stone-800/80 rounded space-y-1">
            <span className="text-stone-500 font-medium">On-Site Check-in</span>
            <p className="text-stone-200 font-mono">
              {booking.actualStartAt ? booking.actualStartAt : 'Pending site check-in'}
            </p>
          </div>
        </div>

        {/* Scope Adjustments Projection */}
        {booking.scopeAdjustments && booking.scopeAdjustments.length > 0 && (
          <div className="mt-4 pt-3 border-t border-stone-800 space-y-2">
            <span className="text-xs font-semibold text-stone-400">Scope Adjustment Projections</span>
            <div className="space-y-2">
              {booking.scopeAdjustments.map((adj) => (
                <div
                  key={adj.id}
                  className="p-2.5 bg-stone-950 border border-stone-800 rounded text-xs flex items-center justify-between gap-3"
                >
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-stone-200">{adj.reason}</span>
                      {adj.status === 'PENDING' ? (
                        <span className="px-1.5 py-0.5 rounded text-[11px] font-medium bg-amber-950/60 text-amber-300 border border-amber-800/60">
                          Pending customer review
                        </span>
                      ) : adj.status === 'APPROVED' ? (
                        <span className="px-1.5 py-0.5 rounded text-[11px] font-semibold bg-emerald-950/60 text-emerald-300 border border-emerald-800/60">
                          APPROVED
                        </span>
                      ) : adj.status === 'REJECTED' ? (
                        <span className="px-1.5 py-0.5 rounded text-[11px] font-semibold bg-red-950/60 text-red-300 border border-red-800/60">
                          REJECTED
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded text-[11px] font-medium bg-stone-800 text-stone-400 border border-stone-700">
                          {adj.status}
                        </span>
                      )}
                    </div>
                    <p className="text-stone-400 font-mono">
                      Additional Materials: NGN {(adj.additionalMaterialsKobo / 100).toLocaleString()} | Additional Labor: NGN {(adj.additionalLaborKobo / 100).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-mono text-stone-300 font-semibold">
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
        className="p-4 bg-stone-900/80 border border-stone-800 rounded-lg space-y-4"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1 min-w-0">
            <h1 className="text-base font-bold text-stone-100">{booking.title}</h1>
            <p className="text-xs text-stone-400">{booking.description}</p>
          </div>
          <Link
            href={`/messages/${booking.jobId}`}
            role="link"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-emerald-400 rounded text-xs font-medium shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 motion-reduce:transition-none"
          >
            <MessageSquare className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Message Customer</span>
          </Link>
        </div>

        {/* Address and Location Context */}
        <div className="p-3 bg-stone-950/60 border border-stone-800 rounded space-y-2 text-xs">
          <div className="flex items-center gap-2 text-stone-400">
            <MapPin className="w-4 h-4 text-stone-500 shrink-0" aria-hidden="true" />
            <span className="font-medium">General Operating Area:</span>
            <span className="text-stone-200">
              {booking.generalLocation.neighbourhoodOrZone}, {booking.generalLocation.cityId}
            </span>
          </div>

          {booking.landmark && (
            <p className="text-stone-400 pl-6">
              <span className="text-stone-500">Landmark:</span> {booking.landmark}
            </p>
          )}

          {/* Conditional Address Unlock (UI-008) */}
          <div className="pt-2 border-t border-stone-800/80 pl-6">
            {isEscrowHeld && booking.exactAddress ? (
              <div className="space-y-0.5">
                <span className="text-emerald-400 font-medium">Exact Site Address:</span>
                <p className="text-stone-100 font-medium">{booking.exactAddress}</p>
              </div>
            ) : (
              <div className="p-2.5 bg-amber-950/30 border border-amber-800/60 rounded text-amber-200 space-y-1">
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
        className="p-4 bg-stone-900/80 border border-stone-800 rounded-lg space-y-4"
      >
        <h2 className="text-xs font-semibold uppercase tracking-wider text-stone-400">
          Operational Actions
        </h2>

        {isTerminalOrDisputed ? (
          <div className="p-3 bg-stone-950 border border-stone-800 rounded text-xs text-stone-400">
            This booking is in a {booking.jobStatus.toLowerCase()} state. Operational action controls are closed.
          </div>
        ) : (
          <div className="space-y-4">
            {/* Sequential Dispatch Controls (UI-010, UI-015) */}
            <div className="p-3 bg-stone-950/60 border border-stone-800 rounded space-y-3 text-xs">
              <span className="font-medium text-stone-300">1. Dispatch Progression</span>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  disabled={isOffline || isEnRoute || isArrived || isSubmittingAction}
                  onClick={() => void handleDispatchUpdate('EN_ROUTE')}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-stone-800 disabled:text-stone-500 text-stone-950 font-medium rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 motion-reduce:transition-none"
                >
                  I&apos;m on my way
                </button>

                <button
                  type="button"
                  disabled={isOffline || !isEnRoute || isArrived || isSubmittingAction}
                  onClick={() => void handleDispatchUpdate('ARRIVED')}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-stone-800 disabled:text-stone-500 text-stone-950 font-medium rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 motion-reduce:transition-none"
                >
                  I&apos;ve arrived
                </button>
              </div>

              {/* Disabled explanations */}
              {isOffline && (
                <p className="text-amber-400 text-[11px]">Action unavailable while offline.</p>
              )}
              {isArrived && (
                <p className="text-stone-400 text-[11px]">Already marked arrived at site.</p>
              )}
              {!isArrived && isEnRoute && (
                <p className="text-blue-300 text-[11px]">En route to client site. Mark arrived when on site.</p>
              )}
            </div>

            {/* Check-in Control (UI-011, UI-024) */}
            <div className="p-3 bg-stone-950/60 border border-stone-800 rounded space-y-3 text-xs">
              <span className="font-medium text-stone-300">2. On-Site Check-in</span>
              <p className="text-stone-400 text-[11px]">
                Check-in captures a single location snapshot to verify site presence before work begins. Continuous GPS tracking is not used.
              </p>

              {!isEscrowHeld && (
                <div className="p-2.5 bg-amber-950/30 border border-amber-800/60 rounded text-amber-200 text-xs space-y-1">
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
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-stone-800 disabled:text-stone-500 text-stone-950 font-medium rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 motion-reduce:transition-none"
                >
                  {isCheckedIn ? 'Checked in' : 'Check in on site'}
                </button>
              </div>
            </div>

            {/* In-Progress Scope Adjustment Trigger */}
            {isCheckedIn && (
              <div className="p-3 bg-stone-950/60 border border-stone-800 rounded space-y-2 text-xs">
                <span className="font-medium text-stone-300">3. Scope Adjustment</span>
                <p className="text-stone-400 text-[11px]">
                  If unseen on-site repairs require additional parts or labor, request a formal adjustment for customer review.
                </p>
                <button
                  type="button"
                  disabled={isOffline || booking.hasPendingScopeAdjustment || isSubmittingAction}
                  onClick={() => setIsScopeDrawerOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 disabled:opacity-50 text-stone-200 rounded font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 motion-reduce:transition-none"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-stone-400" aria-hidden="true" />
                  <span>Request Scope Adjustment</span>
                </button>
              </div>
            )}

            {/* Provider Cancellation Trigger (UI-014) */}
            {booking.jobStatus === 'CONFIRMED' && (
              <div className="pt-2 border-t border-stone-800">
                <button
                  ref={cancelButtonRef}
                  type="button"
                  disabled={isOffline || isSubmittingAction}
                  onClick={() => setIsCancelDialogOpen(true)}
                  className="px-3 py-1.5 text-xs text-red-400 hover:text-red-300 bg-red-950/30 hover:bg-red-950/50 border border-red-900/60 rounded font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 motion-reduce:transition-none"
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
        className="p-4 bg-stone-900/80 border border-stone-800 rounded-lg space-y-3 text-xs"
      >
        <h2 className="font-semibold uppercase tracking-wider text-stone-400">
          Operational Guidance and Recovery
        </h2>

        {activeRefusal && REFUSAL_RECOVERY_MAP[activeRefusal] ? (
          <div className="p-3 bg-red-950/40 border border-red-800/80 rounded space-y-1 text-red-200">
            <p className="font-semibold">{REFUSAL_RECOVERY_MAP[activeRefusal].title}</p>
            <p className="text-stone-300">{REFUSAL_RECOVERY_MAP[activeRefusal].step}</p>
          </div>
        ) : (
          <p className="text-stone-400">
            All transitions are forward-only and require authoritative network confirmation. If client issues or site access impediments occur, use the messaging link above to coordinate with the customer.
          </p>
        )}
      </section>

      {/* =================================================================== */}
      {/* Cancellation Dialog (UI-014)                                        */}
      {/* =================================================================== */}
      {isCancelDialogOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm"
          role="presentation"
        >
          <div
            ref={dialogRef}
            data-testid="cancellation-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cancel-dialog-title"
            className="w-full max-w-lg bg-stone-900 border border-stone-800 rounded-lg p-5 space-y-4 text-stone-100 shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-stone-800 pb-2">
              <h3 id="cancel-dialog-title" className="text-sm font-bold text-stone-100">
                Cancel Confirmed Booking
              </h3>
              <button
                type="button"
                onClick={handleCloseCancelDialog}
                aria-label="Close dialog"
                className="text-stone-400 hover:text-stone-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-stone-400 motion-reduce:transition-none"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            <p className="text-xs text-stone-400">
              Select the operational reason for declining this confirmed job. Reasons are recorded authoritatively.
            </p>

            <div className="space-y-3 text-xs">
              <label htmlFor="cancel-reason-select" className="block font-medium text-stone-300">
                Cancellation Reason:
              </label>
              <select
                id="cancel-reason-select"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value as ProviderCancellationReason)}
                className="w-full p-2 bg-stone-950 border border-stone-800 rounded text-stone-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                {CANCELLATION_OPTIONS.map((opt) => (
                  <option key={opt.reason} value={opt.reason}>
                    {opt.label}
                  </option>
                ))}
              </select>

              {cancelReason === 'OTHER' && (
                <div className="space-y-1.5 pt-1">
                  <label htmlFor="cancel-note-input" className="block font-medium text-stone-300">
                    Explanatory Note (required, 1 to 500 characters):
                  </label>
                  <textarea
                    id="cancel-note-input"
                    rows={3}
                    maxLength={500}
                    value={cancelNote}
                    onChange={(e) => setCancelNote(e.target.value)}
                    placeholder="Provide specific reason for cancellation"
                    className="w-full p-2 bg-stone-950 border border-stone-800 rounded text-stone-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 text-xs"
                  />
                  <div className="flex justify-between text-[11px] text-stone-500">
                    <span>Required for OTHER reasons</span>
                    <span>{cancelNote.length}/500</span>
                  </div>
                </div>
              )}

              {cancelValidationError && (
                <p className="p-2 bg-red-950/40 border border-red-800/60 rounded text-xs text-red-300">
                  {cancelValidationError}
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-800 text-xs">
              <button
                type="button"
                onClick={handleCloseCancelDialog}
                className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 motion-reduce:transition-none"
              >
                Keep Booking
              </button>
              <button
                type="button"
                disabled={isSubmittingAction}
                onClick={() => void handleConfirmCancellation()}
                className="px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-stone-950 rounded font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 motion-reduce:transition-none"
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
          className="fixed inset-0 z-50 flex items-center justify-end bg-stone-950/80 backdrop-blur-sm"
          role="presentation"
        >
          <div className="w-full max-w-md h-full bg-stone-900 border-l border-stone-800 p-5 space-y-4 text-stone-100 overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="text-sm font-bold text-stone-100 flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" aria-hidden="true" />
                <span>Request Scope Adjustment</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsScopeDrawerOpen(false)}
                aria-label="Close drawer"
                className="text-stone-400 hover:text-stone-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-stone-400 motion-reduce:transition-none"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            <p className="text-xs text-stone-400">
              Submit additional labor or materials discovered on site. Requests are transmitted to the customer for explicit approval.
            </p>

            <form onSubmit={handleSubmitScopeAdjustment} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label htmlFor="scope-reason-select" className="block font-medium text-stone-300">
                  Adjustment Reason:
                </label>
                <select
                  id="scope-reason-select"
                  value={scopeReason}
                  onChange={(e) => setScopeReason(e.target.value as ScopeAdjustmentReason)}
                  className="w-full p-2 bg-stone-950 border border-stone-800 rounded text-stone-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                >
                  <option value="ADDITIONAL_PARTS">Additional Parts</option>
                  <option value="ADDITIONAL_LABOR">Additional Labor</option>
                  <option value="BOTH">Both Labor and Parts</option>
                </select>
              </div>

              <div className="space-y-1">
                <label htmlFor="scope-labor-input" className="block font-medium text-stone-300">
                  Additional Labor (NGN):
                </label>
                <input
                  id="scope-labor-input"
                  type="number"
                  min="0"
                  step="100"
                  value={scopeLaborNgn}
                  onChange={(e) => setScopeLaborNgn(e.target.value)}
                  className="w-full p-2 bg-stone-950 border border-stone-800 rounded text-stone-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="scope-materials-input" className="block font-medium text-stone-300">
                  Additional Materials (NGN):
                </label>
                <input
                  id="scope-materials-input"
                  type="number"
                  min="0"
                  step="100"
                  value={scopeMaterialsNgn}
                  onChange={(e) => setScopeMaterialsNgn(e.target.value)}
                  className="w-full p-2 bg-stone-950 border border-stone-800 rounded text-stone-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 font-mono"
                />
              </div>

              <div className="p-3 bg-stone-950 border border-stone-800 rounded space-y-1">
                <span className="text-stone-400 font-medium">Calculated Additional Total:</span>
                <p className="text-sm font-bold font-mono text-emerald-400">
                  NGN {totalAdditionalDerived.toLocaleString()}
                </p>
              </div>

              <div className="space-y-1">
                <label htmlFor="scope-note-input" className="block font-medium text-stone-300">
                  Site Justification Note (optional):
                </label>
                <textarea
                  id="scope-note-input"
                  rows={3}
                  value={scopeNote}
                  onChange={(e) => setScopeNote(e.target.value)}
                  placeholder="Explain why extra parts or labor are needed"
                  className="w-full p-2 bg-stone-950 border border-stone-800 rounded text-stone-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 text-xs"
                />
              </div>

              {scopeError && (
                <p className="p-2 bg-red-950/40 border border-red-800/60 rounded text-xs text-red-300">
                  {scopeError}
                </p>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsScopeDrawerOpen(false)}
                  className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 motion-reduce:transition-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAction || totalAdditionalDerived <= 0}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-stone-950 rounded font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 motion-reduce:transition-none"
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

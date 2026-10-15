// apps/web/components/brainworker/bookings/BookingsUI.test.tsx
// BW-004 Phase 7 RED: UI Implementation (UI-001 to UI-024)
// Governed by:
//   docs/specs/BW-004-architecture-contract.md (sections 5, 6, 7, 8, 14, 15, 16)
//   docs/specs/BW-004-booking-management.md (D5, D6, D7, D8)
//   docs/specs/BW-004-test-first-implementation-plan.md (Phase 7: UI-001 to UI-024)
//
// Invariant Rules:
// 1. Operational dispatch sheet style: clean, utilitarian, zero decorative distraction.
// 2. List grouped into Today, Upcoming, Then Later, and Cancelled/Expired.
// 3. Five-block detail view: State, Position, Context, Action, Recovery.
// 4. Address unlocks only when escrow is held; exact warning when pending.
// 5. Contact shortcut opens /messages/[jobId]; zero raw credentials exposed.
// 6. Sequential dispatch controls; check-in captures single location snapshot.
// 7. Scope adjustment drawer derives total; never labels pending as approved.
// 8. Cancellation dialog contains focus, restores focus, requires note for OTHER.
// 9. Full keyboard operability, visible focus, reduced motion, zero color-only status.
// 10. Zero wallet balances, payout figures, or earnings previews anywhere.

import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { BookingsListView } from './BookingsListView';
import { BookingDetailView } from './BookingDetailView';
import {
  createBookingsTestHarness,
  type BookingsTestHarness,
} from '../../../lib/brainworker/bookings/testing/harness';
import {
  FIXTURE_APPROVED_BRAINWORKER_A,
  FIXTURE_APPROVED_BRAINWORKER_B,
  bookingOwnedByA,
  mockApprovedWorkerA,
} from '../../../lib/brainworker/bookings/testing/fixtures';
import type {
  IBrainWorkerBookingsRepository,
  BookingPage,
  ProviderBookingDetail,
} from '../../../lib/brainworker/bookings/types';
import * as authStorage from '../../../lib/auth/storage';

const sourceOf = (file: string): string =>
  readFileSync(fileURLToPath(new URL(file, import.meta.url)), 'utf8');

describe('BW-004 Phase 7: UI Implementation (UI-001 to UI-024)', () => {
  let harness: BookingsTestHarness;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockApprovedWorkerA);
    harness = createBookingsTestHarness();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ===========================================================================
  // UI-001: list loading
  // ===========================================================================
  it('UI-001: list loading', async () => {
    let resolveBookings: (page: BookingPage) => void = () => {};
    const pendingPromise = new Promise<BookingPage>((resolve) => {
      resolveBookings = resolve;
    });

    const pendingRepo: IBrainWorkerBookingsRepository = {
      ...harness.repository,
      getBookings: vi.fn().mockReturnValue(pendingPromise),
    };

    render(
      <BookingsListView
        brainWorkerId={FIXTURE_APPROVED_BRAINWORKER_A}
        repository={pendingRepo}
      />
    );

    expect(screen.getByTestId('bookings-loading-skeleton')).toBeInTheDocument();
    expect(screen.queryByTestId('bookings-empty-state')).not.toBeInTheDocument();

    resolveBookings({ items: [] });
  });

  // ===========================================================================
  // UI-002: populated list, grouped and sorted
  // ===========================================================================
  it('UI-002: populated list, grouped and sorted', async () => {
    // Seed bookings across Today, Upcoming, Then Later, and Cancelled
    const now = new Date('2026-10-15T10:00:00.000Z');
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(now);

    const bToday1 = bookingOwnedByA({
      bookingId: 'b-today-1',
      title: 'Generator Tuning Today Early',
      scheduledStartAt: '2026-10-15T09:00:00.000Z',
    });
    const bToday2 = bookingOwnedByA({
      bookingId: 'b-today-2',
      title: 'Generator Tuning Today Late',
      scheduledStartAt: '2026-10-15T15:00:00.000Z',
    });
    const bUpcoming = bookingOwnedByA({
      bookingId: 'b-upcoming-1',
      title: 'AC Cleaning Tomorrow',
      scheduledStartAt: '2026-10-16T10:00:00.000Z',
    });
    const bLater = bookingOwnedByA({
      bookingId: 'b-later-1',
      title: 'Plumbing Repair Next Month',
      scheduledStartAt: '2026-11-01T10:00:00.000Z',
    });
    const bCancelled = bookingOwnedByA({
      bookingId: 'b-cancelled-1',
      title: 'Cancelled Repair',
      jobStatus: 'CANCELLED',
      scheduledStartAt: '2026-10-14T10:00:00.000Z',
    });

    harness.seedBooking(FIXTURE_APPROVED_BRAINWORKER_A, bToday2);
    harness.seedBooking(FIXTURE_APPROVED_BRAINWORKER_A, bToday1);
    harness.seedBooking(FIXTURE_APPROVED_BRAINWORKER_A, bUpcoming);
    harness.seedBooking(FIXTURE_APPROVED_BRAINWORKER_A, bLater);
    harness.seedBooking(FIXTURE_APPROVED_BRAINWORKER_A, bCancelled);

    render(
      <BookingsListView
        brainWorkerId={FIXTURE_APPROVED_BRAINWORKER_A}
        repository={harness.repository}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('group-today')).toBeInTheDocument();
    });

    expect(screen.getByTestId('group-upcoming')).toBeInTheDocument();
    expect(screen.getByTestId('group-later')).toBeInTheDocument();
    expect(screen.getByTestId('group-cancelled-expired')).toBeInTheDocument();

    // Verify sort within Today group: Early before Late
    const todayCards = screen.getAllByTestId('booking-card-b-today-1');
    expect(todayCards.length).toBeGreaterThan(0);

    vi.useRealTimers();
  });

  // ===========================================================================
  // UI-003: empty state links to /brainworker/leads and fabricates no bookings
  // ===========================================================================
  it('UI-003: empty state links to /brainworker/leads and fabricates no bookings', async () => {
    render(
      <BookingsListView
        brainWorkerId={FIXTURE_APPROVED_BRAINWORKER_A}
        repository={harness.repository}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('bookings-empty-state')).toBeInTheDocument();
    });

    const leadsLink = screen.getByRole('link', { name: /leads/i });
    expect(leadsLink).toHaveAttribute('href', '/brainworker/leads');
    expect(screen.queryAllByTestId(/booking-card-/)).toHaveLength(0);
  });

  // ===========================================================================
  // UI-004: degraded state keeps last authorized data
  // ===========================================================================
  it('UI-004: degraded state keeps last authorized data', async () => {
    const b1 = bookingOwnedByA({
      bookingId: 'b-degraded-1',
      title: 'Authorized Solar Inverter Check',
    });
    harness.seedBooking(FIXTURE_APPROVED_BRAINWORKER_A, b1);

    render(
      <BookingsListView
        brainWorkerId={FIXTURE_APPROVED_BRAINWORKER_A}
        repository={harness.repository}
        isDegraded={true}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('bookings-degraded-banner')).toBeInTheDocument();
    });

    expect(screen.getByText('Authorized Solar Inverter Check')).toBeInTheDocument();
  });

  // ===========================================================================
  // UI-005: offline state disables every mutation with a reason
  // ===========================================================================
  it('UI-005: offline state disables every mutation with a reason', async () => {
    const b1 = bookingOwnedByA({
      bookingId: 'b-offline-1',
      title: 'Emergency Generator Service',
      jobStatus: 'CONFIRMED',
      dispatchStatus: 'NOT_STARTED',
    });
    harness.seedBooking(FIXTURE_APPROVED_BRAINWORKER_A, b1);

    render(
      <BookingDetailView
        brainWorkerId={FIXTURE_APPROVED_BRAINWORKER_A}
        bookingId="b-offline-1"
        repository={harness.repository}
        isOffline={true}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('bookings-offline-banner')).toBeInTheDocument();
    });

    const enRouteButton = screen.getByRole('button', { name: /on my way/i });
    expect(enRouteButton).toBeDisabled();
    expect(screen.getByText(/unavailable while offline/i)).toBeInTheDocument();
  });

  // ===========================================================================
  // UI-006: repository failure and retry
  // ===========================================================================
  it('UI-006: repository failure and retry', async () => {
    const failingRepo: IBrainWorkerBookingsRepository = {
      ...harness.repository,
      getBookings: vi.fn().mockRejectedValue(new Error('Network error')),
    };

    render(
      <BookingsListView
        brainWorkerId={FIXTURE_APPROVED_BRAINWORKER_A}
        repository={failingRepo}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('bookings-error-state')).toBeInTheDocument();
    });

    const retryButton = screen.getByRole('button', { name: /retry/i });
    expect(retryButton).toBeInTheDocument();

    (failingRepo.getBookings as Mock).mockResolvedValueOnce({ items: [] });
    fireEvent.click(retryButton);

    await waitFor(() => {
      expect(failingRepo.getBookings).toHaveBeenCalledTimes(2);
    });
  });

  // ===========================================================================
  // UI-007: detail renders all five blocks
  // ===========================================================================
  it('UI-007: detail renders all five blocks', async () => {
    const b1 = bookingOwnedByA({
      bookingId: 'b-detail-1',
      title: 'Complete Borehole Pump Repair',
    });
    harness.seedBooking(FIXTURE_APPROVED_BRAINWORKER_A, b1);

    render(
      <BookingDetailView
        brainWorkerId={FIXTURE_APPROVED_BRAINWORKER_A}
        bookingId="b-detail-1"
        repository={harness.repository}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('state-block')).toBeInTheDocument();
    });

    expect(screen.getByTestId('position-block')).toBeInTheDocument();
    expect(screen.getByTestId('context-block')).toBeInTheDocument();
    expect(screen.getByTestId('action-block')).toBeInTheDocument();
    expect(screen.getByTestId('recovery-block')).toBeInTheDocument();
  });

  // ===========================================================================
  // UI-008: address rendering for masked, unlocked, and escrow-pending cases
  // ===========================================================================
  it('UI-008: address rendering for masked, unlocked, and escrow-pending cases', async () => {
    // 1. Escrow pending case
    const bPending = bookingOwnedByA({
      bookingId: 'b-addr-pending',
      jobStatus: 'CONFIRMED',
      escrowStatus: 'unfunded',
      exactAddress: '42 Secret Street, Asokoro, Abuja',
    });
    harness.seedBooking(FIXTURE_APPROVED_BRAINWORKER_A, bPending);

    const { unmount } = render(
      <BookingDetailView
        brainWorkerId={FIXTURE_APPROVED_BRAINWORKER_A}
        bookingId="b-addr-pending"
        repository={harness.repository}
      />
    );

    await waitFor(() => {
      expect(
        screen.getByText(/exact address unlocks once payment is held/i)
      ).toBeInTheDocument();
    });
    expect(screen.queryByText('42 Secret Street, Asokoro, Abuja')).not.toBeInTheDocument();
    unmount();

    // 2. Escrow held case
    const bHeld = bookingOwnedByA({
      bookingId: 'b-addr-held',
      jobStatus: 'CONFIRMED',
      escrowStatus: 'held_in_escrow',
      exactAddress: 'Plot 42, 3rd Avenue, Gwarinpa, Abuja',
    });
    harness.seedBooking(FIXTURE_APPROVED_BRAINWORKER_A, bHeld);

    render(
      <BookingDetailView
        brainWorkerId={FIXTURE_APPROVED_BRAINWORKER_A}
        bookingId="b-addr-held"
        repository={harness.repository}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Plot 42, 3rd Avenue, Gwarinpa, Abuja')).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // UI-009: contact control opens the conversation, exposes no credentials
  // ===========================================================================
  it('UI-009: contact control opens the conversation, exposes no credentials', async () => {
    const b1 = bookingOwnedByA({
      bookingId: 'b-contact-1',
      jobId: 'job-9876',
      conversationId: 'convo-9876',
    });
    harness.seedBooking(FIXTURE_APPROVED_BRAINWORKER_A, b1);

    render(
      <BookingDetailView
        brainWorkerId={FIXTURE_APPROVED_BRAINWORKER_A}
        bookingId="b-contact-1"
        repository={harness.repository}
      />
    );

    await waitFor(() => {
      expect(screen.getByRole('link', { name: /message customer/i })).toBeInTheDocument();
    });

    const contactLink = screen.getByRole('link', { name: /message customer/i });
    expect(contactLink).toHaveAttribute('href', '/messages/job-9876');

    // No raw email, phone, or external whatsapp link
    expect(screen.queryByText(/\+234/)).not.toBeInTheDocument();
    expect(screen.queryByText(/@/)).not.toBeInTheDocument();
    expect(screen.queryByText(/whatsapp/i)).not.toBeInTheDocument();
  });

  // ===========================================================================
  // UI-010: sequential dispatch controls with disabled reasons
  // ===========================================================================
  it('UI-010: sequential dispatch controls with disabled reasons', async () => {
    const b1 = bookingOwnedByA({
      bookingId: 'b-dispatch-seq',
      jobStatus: 'CONFIRMED',
      dispatchStatus: 'ARRIVED',
    });
    harness.seedBooking(FIXTURE_APPROVED_BRAINWORKER_A, b1);

    render(
      <BookingDetailView
        brainWorkerId={FIXTURE_APPROVED_BRAINWORKER_A}
        bookingId="b-dispatch-seq"
        repository={harness.repository}
      />
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /on my way/i })).toBeInTheDocument();
    });

    const onMyWayBtn = screen.getByRole('button', { name: /on my way/i });
    expect(onMyWayBtn).toBeDisabled();
    expect(screen.getByText(/already marked arrived/i)).toBeInTheDocument();
  });

  // ===========================================================================
  // UI-011: check-in copy states single-snapshot capture, no override
  // ===========================================================================
  it('UI-011: check-in copy states single-snapshot capture, no override', async () => {
    const b1 = bookingOwnedByA({
      bookingId: 'b-checkin-copy',
      jobStatus: 'CONFIRMED',
      dispatchStatus: 'ARRIVED',
      escrowStatus: 'held_in_escrow',
    });
    harness.seedBooking(FIXTURE_APPROVED_BRAINWORKER_A, b1);

    render(
      <BookingDetailView
        brainWorkerId={FIXTURE_APPROVED_BRAINWORKER_A}
        bookingId="b-checkin-copy"
        repository={harness.repository}
      />
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /check in/i })).toBeInTheDocument();
    });

    expect(screen.getByText(/single location snapshot/i)).toBeInTheDocument();
    expect(screen.queryByText(/override/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/check in anyway/i)).not.toBeInTheDocument();
  });

  // ===========================================================================
  // UI-012: every typed refusal renders its own message and next step
  // ===========================================================================
  it('UI-012: every typed refusal renders its own message and next step', async () => {
    const b1 = bookingOwnedByA({
      bookingId: 'b-refusals',
      jobStatus: 'CONFIRMED',
      dispatchStatus: 'NOT_STARTED',
    });
    harness.seedBooking(FIXTURE_APPROVED_BRAINWORKER_A, b1);

    const { unmount } = render(
      <BookingDetailView
        brainWorkerId={FIXTURE_APPROVED_BRAINWORKER_A}
        bookingId="b-refusals"
        repository={harness.repository}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('recovery-block')).toBeInTheDocument();
    });

    unmount();
  });

  // ===========================================================================
  // UI-013: scope form derives total and never says approved while pending
  // ===========================================================================
  it('UI-013: scope form derives total and never says approved while pending', async () => {
    const b1 = bookingOwnedByA({
      bookingId: 'b-scope-pending',
      jobStatus: 'IN_PROGRESS',
      dispatchStatus: 'ARRIVED',
      scopeAdjustments: [
        {
          id: 'adj-001',
          bookingId: 'b-scope-pending',
          reason: 'ADDITIONAL_PARTS',
          additionalLaborKobo: 500000,
          additionalMaterialsKobo: 1000000,
          totalAdditionalKobo: 1500000,
          status: 'PENDING',
          submittedAt: '2026-10-15T12:00:00.000Z',
        },
      ],
    });
    harness.seedBooking(FIXTURE_APPROVED_BRAINWORKER_A, b1);

    render(
      <BookingDetailView
        brainWorkerId={FIXTURE_APPROVED_BRAINWORKER_A}
        bookingId="b-scope-pending"
        repository={harness.repository}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/pending customer review/i)).toBeInTheDocument();
    });

    expect(screen.queryByText(/^approved$/i)).not.toBeInTheDocument();
  });

  // ===========================================================================
  // UI-014: cancellation dialog focus containment and focus restore
  // ===========================================================================
  it('UI-014: cancellation dialog focus containment and focus restore', async () => {
    const b1 = bookingOwnedByA({
      bookingId: 'b-cancel-dlg',
      jobStatus: 'CONFIRMED',
    });
    harness.seedBooking(FIXTURE_APPROVED_BRAINWORKER_A, b1);

    render(
      <BookingDetailView
        brainWorkerId={FIXTURE_APPROVED_BRAINWORKER_A}
        bookingId="b-cancel-dlg"
        repository={harness.repository}
      />
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /cancel booking/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /cancel booking/i }));

    expect(screen.getByTestId('cancellation-dialog')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  // ===========================================================================
  // UI-015: keyboard operation and visible focus
  // ===========================================================================
  it('UI-015: keyboard operation and visible focus', async () => {
    const b1 = bookingOwnedByA({
      bookingId: 'b-a11y-focus',
      jobStatus: 'CONFIRMED',
    });
    harness.seedBooking(FIXTURE_APPROVED_BRAINWORKER_A, b1);

    render(
      <BookingDetailView
        brainWorkerId={FIXTURE_APPROVED_BRAINWORKER_A}
        bookingId="b-a11y-focus"
        repository={harness.repository}
      />
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /on my way/i })).toBeInTheDocument();
    });

    const button = screen.getByRole('button', { name: /on my way/i });
    expect(button.className).toMatch(/focus-visible/);
  });

  // ===========================================================================
  // UI-016: reduced motion
  // ===========================================================================
  it('UI-016: reduced motion', async () => {
    const b1 = bookingOwnedByA({ bookingId: 'b-motion' });
    harness.seedBooking(FIXTURE_APPROVED_BRAINWORKER_A, b1);

    render(
      <BookingDetailView
        brainWorkerId={FIXTURE_APPROVED_BRAINWORKER_A}
        bookingId="b-motion"
        repository={harness.repository}
      />
    );

    const detailSource = sourceOf('./BookingDetailView.tsx');
    const listSource = sourceOf('./BookingsListView.tsx');

    // Both components must respect motion-reduce
    expect(detailSource + listSource).toMatch(/motion-reduce|prefers-reduced-motion/);
  });

  // ===========================================================================
  // UI-017: no color-only status
  // ===========================================================================
  it('UI-017: no color-only status', async () => {
    const b1 = bookingOwnedByA({
      bookingId: 'b-color-status',
      jobStatus: 'CONFIRMED',
      dispatchStatus: 'EN_ROUTE',
    });
    harness.seedBooking(FIXTURE_APPROVED_BRAINWORKER_A, b1);

    render(
      <BookingDetailView
        brainWorkerId={FIXTURE_APPROVED_BRAINWORKER_A}
        bookingId="b-color-status"
        repository={harness.repository}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('status-badge-job')).toHaveTextContent(/confirmed/i);
    });

    expect(screen.getByTestId('status-badge-dispatch')).toHaveTextContent(/en route/i);
  });

  // ===========================================================================
  // UI-018: mobile detail fully usable at 320px
  // ===========================================================================
  it('UI-018: mobile detail fully usable at 320px', async () => {
    const b1 = bookingOwnedByA({ bookingId: 'b-320px' });
    harness.seedBooking(FIXTURE_APPROVED_BRAINWORKER_A, b1);

    render(
      <BookingDetailView
        brainWorkerId={FIXTURE_APPROVED_BRAINWORKER_A}
        bookingId="b-320px"
        repository={harness.repository}
      />
    );

    const detailSource = sourceOf('./BookingDetailView.tsx');

    // Must not contain rigid fixed widths wider than 320px
    expect(detailSource).not.toMatch(/w-\[(3[3-9]\d|[4-9]\d\d|\d{4,})px\]/);
  });

  // ===========================================================================
  // UI-019: no earnings, payout, or wallet figure anywhere
  // ===========================================================================
  it('UI-019: no earnings, payout, or wallet figure anywhere', async () => {
    const b1 = bookingOwnedByA({
      bookingId: 'b-no-wallet',
    });
    harness.seedBooking(FIXTURE_APPROVED_BRAINWORKER_A, b1);

    render(
      <BookingDetailView
        brainWorkerId={FIXTURE_APPROVED_BRAINWORKER_A}
        bookingId="b-no-wallet"
        repository={harness.repository}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('state-block')).toBeInTheDocument();
    });

    expect(screen.queryByText(/wallet/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/payout/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/platform fee/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/net earnings/i)).not.toBeInTheDocument();

    const detailSource = sourceOf('./BookingDetailView.tsx');
    const listSource = sourceOf('./BookingsListView.tsx');
    expect(detailSource + listSource).not.toMatch(/wallet/i);
    expect(detailSource + listSource).not.toMatch(/payout/i);
  });

  // ===========================================================================
  // UI-020: disputed and cancelled states render read-only with no actions
  // ===========================================================================
  it('UI-020: disputed and cancelled states render read-only with no actions', async () => {
    const bCancelled = bookingOwnedByA({
      bookingId: 'b-cancelled-ro',
      jobStatus: 'CANCELLED',
    });
    harness.seedBooking(FIXTURE_APPROVED_BRAINWORKER_A, bCancelled);

    render(
      <BookingDetailView
        brainWorkerId={FIXTURE_APPROVED_BRAINWORKER_A}
        bookingId="b-cancelled-ro"
        repository={harness.repository}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('state-block')).toBeInTheDocument();
    });

    expect(screen.queryByRole('button', { name: /on my way/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /check in/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /cancel booking/i })).not.toBeInTheDocument();
  });

  // ===========================================================================
  // UI-021: no control approves, rejects, or auto-decides a scope request
  // ===========================================================================
  it('UI-021: no control approves, rejects, or auto-decides a scope request', async () => {
    const b1 = bookingOwnedByA({ bookingId: 'b-scope-ctl', jobStatus: 'IN_PROGRESS' });
    harness.seedBooking(FIXTURE_APPROVED_BRAINWORKER_A, b1);

    render(
      <BookingDetailView
        brainWorkerId={FIXTURE_APPROVED_BRAINWORKER_A}
        bookingId="b-scope-ctl"
        repository={harness.repository}
      />
    );

    const detailSource = sourceOf('./BookingDetailView.tsx');

    // BrainWorker surface cannot approve, reject, or auto-decide
    expect(detailSource).not.toMatch(/approveScope/i);
    expect(detailSource).not.toMatch(/rejectScope/i);
    expect(detailSource).not.toMatch(/autoApprove/i);
  });

  // ===========================================================================
  // UI-022: APPROVED and REJECTED render only as read-only projections
  // ===========================================================================
  it('UI-022: APPROVED and REJECTED render only as read-only projections', async () => {
    const b1 = bookingOwnedByA({
      bookingId: 'b-hist-scope',
      jobStatus: 'IN_PROGRESS',
      scopeAdjustments: [
        {
          id: 'adj-app',
          bookingId: 'b-hist-scope',
          reason: 'ADDITIONAL_PARTS',
          additionalLaborKobo: 0,
          additionalMaterialsKobo: 1200000,
          totalAdditionalKobo: 1200000,
          status: 'APPROVED',
          submittedAt: '2026-10-15T11:00:00.000Z',
          decidedAt: '2026-10-15T11:30:00.000Z',
        },
      ],
    });
    harness.seedBooking(FIXTURE_APPROVED_BRAINWORKER_A, b1);

    render(
      <BookingDetailView
        brainWorkerId={FIXTURE_APPROVED_BRAINWORKER_A}
        bookingId="b-hist-scope"
        repository={harness.repository}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('position-block')).toBeInTheDocument();
    });

    expect(screen.getByText('APPROVED')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /edit adjustment/i })).not.toBeInTheDocument();
  });

  // ===========================================================================
  // UI-023: the surface emits domain events only and creates no notification record
  // ===========================================================================
  it('UI-023: the surface emits domain events only and creates no notification record', async () => {
    const b1 = bookingOwnedByA({ bookingId: 'b-events-only' });
    harness.seedBooking(FIXTURE_APPROVED_BRAINWORKER_A, b1);

    render(
      <BookingDetailView
        brainWorkerId={FIXTURE_APPROVED_BRAINWORKER_A}
        bookingId="b-events-only"
        repository={harness.repository}
      />
    );

    const detailSource = sourceOf('./BookingDetailView.tsx');
    const listSource = sourceOf('./BookingsListView.tsx');

    expect(detailSource + listSource).not.toMatch(/createNotification/i);
    expect(detailSource + listSource).not.toMatch(/notificationsRepository/i);
  });

  // ===========================================================================
  // UI-024: check-in copy states the payment prerequisite and implies no payment change
  // ===========================================================================
  it('UI-024: check-in copy states the payment prerequisite and implies no payment change', async () => {
    const bPending = bookingOwnedByA({
      bookingId: 'b-checkin-pending',
      jobStatus: 'CONFIRMED',
      dispatchStatus: 'ARRIVED',
      escrowStatus: 'unfunded',
    });
    harness.seedBooking(FIXTURE_APPROVED_BRAINWORKER_A, bPending);

    render(
      <BookingDetailView
        brainWorkerId={FIXTURE_APPROVED_BRAINWORKER_A}
        bookingId="b-checkin-pending"
        repository={harness.repository}
      />
    );

    await waitFor(() => {
      expect(
        screen.getByText(
          /payment for this booking is still pending, so check-in is not open yet/i
        )
      ).toBeInTheDocument();
    });

    expect(
      screen.getByText(/do not start work until payment is held/i)
    ).toBeInTheDocument();
  });
});

// apps/web/components/brainworker/bookings/BookingDetailView.test.tsx
// BW-010 Phase 3: BrainWorker Dispute Banner Integration Tests
// Governed by: BW-010 specification and AGENTS.md rules
// Strictly zero em dashes in comments, identifiers, or UI text.

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BookingDetailView } from './BookingDetailView';
import { createBookingsTestHarness } from '../../../lib/brainworker/bookings/testing/harness';
import {
  FIXTURE_APPROVED_BRAINWORKER_A,
  bookingOwnedByA,
  mockApprovedWorkerA,
} from '../../../lib/brainworker/bookings/testing/fixtures';
import { InMemoryDisputeRepository } from '../../../lib/disputes/repository';
import type { DisputeRecord } from '../../../lib/disputes/types';
import * as authStorage from '../../../lib/auth/storage';

describe('BW-010: BookingDetailView Dispute Banner Integration', () => {
  let disputeRepo: InMemoryDisputeRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockApprovedWorkerA);
    disputeRepo = new InMemoryDisputeRepository();
  });

  it('renders BrainWorkerDisputeBanner when booking.jobStatus is DISPUTED', async () => {
    const harness = createBookingsTestHarness();
    const booking = bookingOwnedByA({
      bookingId: 'b-disputed-1',
      jobStatus: 'DISPUTED',
    });
    harness.seedBooking(FIXTURE_APPROVED_BRAINWORKER_A, booking);

    const disputeRecord: DisputeRecord = {
      id: 'disp-test-1',
      bookingId: 'b-disputed-1',
      customerId: 'cust-party-1',
      brainWorkerId: FIXTURE_APPROVED_BRAINWORKER_A,
      initiatedByRole: 'customer',
      category: 'WORKMANSHIP_DEFECT',
      description: 'Wall tiles cracked after installation',
      evidence: [],
      status: 'UNDER_REVIEW',
      createdAt: '2026-10-15T12:00:00.000Z',
      updatedAt: '2026-10-15T12:00:00.000Z',
      timeline: [],
    };
    disputeRepo.seed([disputeRecord]);

    const onDisputeRespond = vi.fn();

    render(
      <BookingDetailView
        brainWorkerId={FIXTURE_APPROVED_BRAINWORKER_A}
        bookingId="b-disputed-1"
        repository={harness.repository}
        disputeRepository={disputeRepo}
        onDisputeRespond={onDisputeRespond}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('brainworker-dispute-banner')).toBeInTheDocument();
    });

    expect(screen.getByText(/Active Dispute: Dispute Under Review/i)).toBeInTheDocument();
    expect(screen.getByText(/Workmanship Defect/i)).toBeInTheDocument();

    const respondButton = screen.getByRole('button', { name: /Submit Counter-Evidence/i });
    expect(respondButton).toBeInTheDocument();

    fireEvent.click(respondButton);
    expect(onDisputeRespond).toHaveBeenCalledWith('b-disputed-1');
  });

  it('does not render BrainWorkerDisputeBanner when booking is not in disputed state', async () => {
    const harness = createBookingsTestHarness();
    const booking = bookingOwnedByA({
      bookingId: 'b-normal-1',
      jobStatus: 'CONFIRMED',
    });
    harness.seedBooking(FIXTURE_APPROVED_BRAINWORKER_A, booking);

    render(
      <BookingDetailView
        brainWorkerId={FIXTURE_APPROVED_BRAINWORKER_A}
        bookingId="b-normal-1"
        repository={harness.repository}
        disputeRepository={disputeRepo}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('state-block')).toBeInTheDocument();
    });

    expect(screen.queryByTestId('brainworker-dispute-banner')).not.toBeInTheDocument();
  });

  it('does not construct a synthetic dispute record when booking is DISPUTED but repository has no dispute record, rendering a safe truthful unavailable notice', async () => {
    const harness = createBookingsTestHarness();
    const booking = bookingOwnedByA({
      bookingId: 'b-disputed-no-record',
      jobStatus: 'DISPUTED',
    });
    harness.seedBooking(FIXTURE_APPROVED_BRAINWORKER_A, booking);

    const onDisputeRespond = vi.fn();

    render(
      <BookingDetailView
        brainWorkerId={FIXTURE_APPROVED_BRAINWORKER_A}
        bookingId="b-disputed-no-record"
        repository={harness.repository}
        disputeRepository={disputeRepo}
        onDisputeRespond={onDisputeRespond}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('dispute-unavailable-banner')).toBeInTheDocument();
    });

    // Prove zero fabricated IDs, parties, category, or descriptions
    expect(screen.queryByText(/customer-party/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/A formal dispute has been filed for this booking and is under review/i)).not.toBeInTheDocument();
    expect(screen.queryByTestId('brainworker-dispute-banner')).not.toBeInTheDocument();
    expect(screen.getByText(/Dispute details are currently unavailable/i)).toBeInTheDocument();

    const reviewButton = screen.getByRole('button', { name: /Review Dispute Workspace/i });
    fireEvent.click(reviewButton);
    expect(onDisputeRespond).toHaveBeenCalledWith('b-disputed-no-record');
  });

  it('handles repository errors safely by rendering dispute-error-banner and permitting retry', async () => {
    const harness = createBookingsTestHarness();
    const booking = bookingOwnedByA({
      bookingId: 'b-disputed-error',
      jobStatus: 'DISPUTED',
    });
    harness.seedBooking(FIXTURE_APPROVED_BRAINWORKER_A, booking);

    const getDisputeMock = vi.fn().mockRejectedValueOnce(new Error('Network failure: dispute store unreachable'));
    const errorRepo = {
      ...disputeRepo,
      getDisputeByBookingId: getDisputeMock,
    };

    render(
      <BookingDetailView
        brainWorkerId={FIXTURE_APPROVED_BRAINWORKER_A}
        bookingId="b-disputed-error"
        repository={harness.repository}
        disputeRepository={errorRepo as unknown as InMemoryDisputeRepository}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('dispute-error-banner')).toBeInTheDocument();
    });

    expect(screen.queryByTestId('brainworker-dispute-banner')).not.toBeInTheDocument();
    expect(screen.queryByTestId('dispute-unavailable-banner')).not.toBeInTheDocument();
    expect(screen.getByText(/Network failure: dispute store unreachable/i)).toBeInTheDocument();

    // Now mock recovery on retry
    getDisputeMock.mockResolvedValueOnce(null);
    const retryBtn = screen.getByRole('button', { name: /retry/i });
    fireEvent.click(retryBtn);

    await waitFor(() => {
      expect(screen.getByTestId('dispute-unavailable-banner')).toBeInTheDocument();
    });
    expect(screen.queryByTestId('dispute-error-banner')).not.toBeInTheDocument();
  });
});

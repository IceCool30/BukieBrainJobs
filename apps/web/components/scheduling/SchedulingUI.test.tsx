// apps/web/components/scheduling/SchedulingUI.test.tsx
// Phase 3 RED: Trades Design System UI Component Contracts (COMP-001 to COMP-012)
// Item 3.1 in master checklist (BW-007)

import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { ArrivalWindowCard } from './ArrivalWindowCard';
import { RescheduleProposalModal } from './RescheduleProposalModal';
import { RescheduleResponseCard } from './RescheduleResponseCard';
import { DispatchTrackingViewCard } from './DispatchTrackingViewCard';
import { DispatchStatusUpdater } from './DispatchStatusUpdater';
import type {
  ArrivalWindow,
  DispatchTrackingView,
  RescheduleRequest,
} from '../../lib/scheduling/types';

describe('BW-007 Collaborative Scheduling & Dispatch UI Components (COMP-001 to COMP-012)', () => {
  const sampleArrivalWindow: ArrivalWindow = {
    date: '2026-10-25',
    startHour: 10,
    endHour: 13,
    display: 'Sunday, Oct 25, 2026, 10:00 AM - 1:00 PM WAT',
  };

  const candidateWindowA: ArrivalWindow = {
    date: '2026-10-26',
    startHour: 14,
    endHour: 17,
    display: 'Monday, Oct 26, 2026, 2:00 PM - 5:00 PM WAT',
  };

  const candidateWindowB: ArrivalWindow = {
    date: '2026-10-27',
    startHour: 9,
    endHour: 12,
    display: 'Tuesday, Oct 27, 2026, 9:00 AM - 12:00 PM WAT',
  };

  const samplePendingRequest: RescheduleRequest = {
    id: 'resched-001',
    bookingId: 'booking-777',
    requesterRole: 'CLIENT',
    requesterId: 'client-123',
    proposedWindows: [candidateWindowA],
    reason: 'PARTS_PROCUREMENT',
    status: 'PENDING',
    createdAt: '2026-10-20T10:00:00.000Z',
  };

  const sampleMultiWindowRequest: RescheduleRequest = {
    ...samplePendingRequest,
    id: 'resched-002',
    proposedWindows: [candidateWindowA, candidateWindowB],
  };

  const sampleDispatchView: DispatchTrackingView = {
    bookingId: 'booking-777',
    jobStatus: 'CONFIRMED',
    dispatchStatus: 'NOT_STARTED',
    arrivalWindow: sampleArrivalWindow,
    safetyNotice: 'Ensure someone 18+ is home to receive the artisan',
    actionRequired: 'Awaiting scheduled window. Your artisan is preparing for the job.',
  };

  it('COMP-001: ArrivalWindowCard renders arrival window formatted display, date, and job/dispatch status badges', () => {
    render(
      <ArrivalWindowCard
        arrivalWindow={sampleArrivalWindow}
        jobStatus="CONFIRMED"
        dispatchStatus="NOT_STARTED"
      />
    );

    expect(screen.getByText(/Sunday, Oct 25, 2026, 10:00 AM - 1:00 PM WAT/i)).toBeInTheDocument();
    expect(screen.getByText(/CONFIRMED/i)).toBeInTheDocument();
    expect(screen.getByText(/NOT_STARTED|Not Started/i)).toBeInTheDocument();
  });

  it('COMP-002: ArrivalWindowCard disables Request Reschedule button when dispatchStatus is EN_ROUTE or ARRIVED or when canReschedule is false', () => {
    const { rerender } = render(
      <ArrivalWindowCard
        arrivalWindow={sampleArrivalWindow}
        jobStatus="CONFIRMED"
        dispatchStatus="EN_ROUTE"
        canReschedule={true}
      />
    );

    const enRouteButton = screen.getByRole('button', { name: /request reschedule/i });
    expect(enRouteButton).toBeDisabled();

    rerender(
      <ArrivalWindowCard
        arrivalWindow={sampleArrivalWindow}
        jobStatus="CONFIRMED"
        dispatchStatus="ARRIVED"
        canReschedule={true}
      />
    );
    const arrivedButton = screen.getByRole('button', { name: /request reschedule/i });
    expect(arrivedButton).toBeDisabled();

    rerender(
      <ArrivalWindowCard
        arrivalWindow={sampleArrivalWindow}
        jobStatus="CONFIRMED"
        dispatchStatus="NOT_STARTED"
        canReschedule={false}
      />
    );
    const cannotRescheduleButton = screen.getByRole('button', { name: /request reschedule/i });
    expect(cannotRescheduleButton).toBeDisabled();
  });

  it('COMP-003: ArrivalWindowCard triggers onRequestReschedule when reschedule button is clicked', () => {
    const onReschedule = vi.fn();
    render(
      <ArrivalWindowCard
        arrivalWindow={sampleArrivalWindow}
        jobStatus="CONFIRMED"
        dispatchStatus="NOT_STARTED"
        canReschedule={true}
        onRequestReschedule={onReschedule}
      />
    );

    const button = screen.getByRole('button', { name: /request reschedule/i });
    expect(button).not.toBeDisabled();
    fireEvent.click(button);
    expect(onReschedule).toHaveBeenCalledTimes(1);
  });

  it('COMP-004: RescheduleProposalModal renders form inputs (dates, hours, reasons) and candidate windows when open', () => {
    render(
      <RescheduleProposalModal
        isOpen={true}
        onClose={vi.fn()}
        onSubmitProposal={vi.fn()}
        currentArrivalWindow={sampleArrivalWindow}
      />
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByLabelText(/reason for reschedule/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/candidate date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/start hour/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/end hour/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit proposal/i })).toBeInTheDocument();
  });

  it('COMP-005: RescheduleProposalModal enforces non-empty reasonNote when reason is OTHER and disables submission until provided', () => {
    render(
      <RescheduleProposalModal
        isOpen={true}
        onClose={vi.fn()}
        onSubmitProposal={vi.fn()}
        currentArrivalWindow={sampleArrivalWindow}
      />
    );

    const reasonSelect = screen.getByLabelText(/reason for reschedule/i);
    fireEvent.change(reasonSelect, { target: { value: 'OTHER' } });

    const noteInput = screen.getByLabelText(/reason note/i);
    expect(noteInput).toBeInTheDocument();

    const submitBtn = screen.getByRole('button', { name: /submit proposal/i });
    expect(submitBtn).toBeDisabled();

    fireEvent.change(noteInput, { target: { value: 'Facility security fumigation until 2 PM' } });
    expect(submitBtn).not.toBeDisabled();
  });

  it('COMP-006: RescheduleProposalModal triggers onSubmitProposal with validated windows and reason payload', () => {
    const onSubmit = vi.fn();
    render(
      <RescheduleProposalModal
        isOpen={true}
        onClose={vi.fn()}
        onSubmitProposal={onSubmit}
        currentArrivalWindow={sampleArrivalWindow}
      />
    );

    const reasonSelect = screen.getByLabelText(/reason for reschedule/i);
    fireEvent.change(reasonSelect, { target: { value: 'PARTS_PROCUREMENT' } });

    const dateInput = screen.getByLabelText(/candidate date/i);
    fireEvent.change(dateInput, { target: { value: '2026-10-26' } });

    const startInput = screen.getByLabelText(/start hour/i);
    fireEvent.change(startInput, { target: { value: '14' } });

    const endInput = screen.getByLabelText(/end hour/i);
    fireEvent.change(endInput, { target: { value: '17' } });

    const submitBtn = screen.getByRole('button', { name: /submit proposal/i });
    fireEvent.click(submitBtn);

    expect(onSubmit).toHaveBeenCalledWith({
      proposedWindows: [
        expect.objectContaining({
          date: '2026-10-26',
          startHour: 14,
          endHour: 17,
        }),
      ],
      reason: 'PARTS_PROCUREMENT',
      reasonNote: undefined,
    });
  });

  it('COMP-007: RescheduleResponseCard renders awaiting response banner when currentUserRole === request.requesterRole', () => {
    render(
      <RescheduleResponseCard
        request={samplePendingRequest}
        currentUserRole="CLIENT"
      />
    );

    expect(screen.getByText(/awaiting response from counterparty|awaiting response/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^accept$/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^decline$/i })).not.toBeInTheDocument();
  });

  it('COMP-008: RescheduleResponseCard renders Accept, Decline, and Counter buttons when currentUserRole !== request.requesterRole for a PENDING request', () => {
    render(
      <RescheduleResponseCard
        request={samplePendingRequest}
        currentUserRole="TASKER"
        onAccept={vi.fn()}
        onDecline={vi.fn()}
        onCounter={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: /^accept$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^decline$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /counter/i })).toBeInTheDocument();
  });

  it('COMP-009: RescheduleResponseCard allows choosing between candidate arrival windows when accepting', () => {
    const onAccept = vi.fn();
    render(
      <RescheduleResponseCard
        request={sampleMultiWindowRequest}
        currentUserRole="TASKER"
        onAccept={onAccept}
        onDecline={vi.fn()}
        onCounter={vi.fn()}
      />
    );

    expect(screen.getByText(/Monday, Oct 26, 2026/i)).toBeInTheDocument();
    expect(screen.getByText(/Tuesday, Oct 27, 2026/i)).toBeInTheDocument();

    const secondOption = screen.getByLabelText(/Tuesday, Oct 27, 2026/i);
    fireEvent.click(secondOption);

    const acceptBtn = screen.getByRole('button', { name: /^accept$/i });
    fireEvent.click(acceptBtn);

    expect(onAccept).toHaveBeenCalledWith(candidateWindowB);
  });

  it('COMP-010: DispatchTrackingViewCard renders step progression and active prompt matching dispatch status', () => {
    const { rerender } = render(<DispatchTrackingViewCard view={sampleDispatchView} />);

    expect(screen.getByText(/Not Started/i)).toBeInTheDocument();
    expect(screen.getByText(/En Route/i)).toBeInTheDocument();
    expect(screen.getByText(/Arrived/i)).toBeInTheDocument();
    expect(screen.getByText(/Awaiting scheduled window/i)).toBeInTheDocument();

    rerender(
      <DispatchTrackingViewCard
        view={{
          ...sampleDispatchView,
          dispatchStatus: 'EN_ROUTE',
          actionRequired: 'Your artisan is traveling and on the way to your location.',
        }}
      />
    );
    expect(screen.getByText(/Your artisan is traveling/i)).toBeInTheDocument();

    rerender(
      <DispatchTrackingViewCard
        view={{
          ...sampleDispatchView,
          dispatchStatus: 'ARRIVED',
          actionRequired: 'Your artisan has arrived. Please admit them to begin the work.',
        }}
      />
    );
    expect(screen.getByText(/Your artisan has arrived/i)).toBeInTheDocument();
  });

  it('COMP-011: DispatchTrackingViewCard displays the mandatory safety notice: Ensure someone 18+ is home to receive the artisan', () => {
    render(<DispatchTrackingViewCard view={sampleDispatchView} />);

    expect(
      screen.getByText(/Ensure someone 18\+ is home to receive the artisan/i)
    ).toBeInTheDocument();
  });

  it('COMP-012: DispatchStatusUpdater renders Mark En Route when NOT_STARTED, Mark Arrived when EN_ROUTE, and disabled badge when ARRIVED', () => {
    const onUpdate = vi.fn();
    const { rerender } = render(
      <DispatchStatusUpdater dispatchStatus="NOT_STARTED" onUpdateStatus={onUpdate} />
    );

    const enRouteBtn = screen.getByRole('button', { name: /mark en route/i });
    expect(enRouteBtn).toBeInTheDocument();
    fireEvent.click(enRouteBtn);
    expect(onUpdate).toHaveBeenCalledWith('EN_ROUTE');

    rerender(
      <DispatchStatusUpdater dispatchStatus="EN_ROUTE" onUpdateStatus={onUpdate} />
    );
    const arrivedBtn = screen.getByRole('button', { name: /mark arrived/i });
    expect(arrivedBtn).toBeInTheDocument();
    fireEvent.click(arrivedBtn);
    expect(onUpdate).toHaveBeenCalledWith('ARRIVED');

    rerender(
      <DispatchStatusUpdater dispatchStatus="ARRIVED" onUpdateStatus={onUpdate} />
    );
    expect(screen.queryByRole('button', { name: /mark/i })).not.toBeInTheDocument();
    expect(screen.getByText(/Arrived on site|Arrived/i)).toBeInTheDocument();
  });
});

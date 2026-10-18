// apps/web/app/scheduling/SchedulingRoute.test.tsx
// Phase 4 RED: Route Integration Contracts (ROUTE-001 to ROUTE-010)
// Item 3.1 in master checklist: Collaborative Scheduling and Dispatch (BW-007)

import * as fs from 'fs';
import * as path from 'path';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import * as authStorage from '../../lib/auth/storage';
import {
  getSchedulingRepository,
  resetSchedulingRepository,
} from '../../lib/scheduling/repository';
import type { ArrivalWindow } from '../../lib/scheduling/types';
import type { AuthUser } from '../../lib/auth/types';
import SchedulingPage from './[bookingId]/page';

// Mock Next.js Navigation Hooks
const mockPush = vi.fn();
const mockReplace = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/scheduling/bk-101',
}));

describe('BW-007 Collaborative Scheduling & Dispatch Route Contracts (ROUTE-001 to ROUTE-010)', () => {
  const mockCustomer: AuthUser = {
    id: 'cust-101',
    name: 'Amara Kanu',
    role: 'customer',
    provider: 'phone',
    isBrainWorkerApproved: false,
  };

  const mockWorker: AuthUser = {
    id: 'artisan-202',
    name: 'Emeka Okafor',
    role: 'brainworker',
    provider: 'phone',
    isBrainWorkerApproved: true,
  };

  const sampleWindow: ArrivalWindow = {
    date: '2026-10-25',
    startHour: 10,
    endHour: 13,
    display: 'Sunday, Oct 25, 2026, 10:00 AM - 1:00 PM WAT',
  };

  const candidateWindow: ArrivalWindow = {
    date: '2026-10-26',
    startHour: 14,
    endHour: 17,
    display: 'Monday, Oct 26, 2026, 2:00 PM - 5:00 PM WAT',
  };

  const defaultParams = Promise.resolve({ bookingId: 'bk-101' });

  beforeEach(() => {
    vi.clearAllMocks();
    resetSchedulingRepository();
  });

  it('ROUTE-001: unauthenticated visitor accessing /scheduling/bk-101 redirects to /login?redirect=/scheduling/bk-101 without querying repository', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(null);
    const repo = getSchedulingRepository();
    const getScheduleSpy = vi.spyOn(repo, 'getBookingSchedule');

    render(<SchedulingPage params={defaultParams} />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/login?redirect=/scheduling/bk-101');
    });
    expect(getScheduleSpy).not.toHaveBeenCalled();
  });

  it('ROUTE-002: authenticated customer accessing /scheduling/bk-101 mounts customer tracking view (DispatchTrackingViewCard) with the safety notice Ensure someone 18+ is home to receive the artisan', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockCustomer);
    const repo = getSchedulingRepository();
    await repo.seedBookingSchedule({
      bookingId: 'bk-101',
      jobStatus: 'CONFIRMED',
      agreedArrivalWindow: sampleWindow,
      dispatchStatus: 'NOT_STARTED',
    });

    render(<SchedulingPage params={defaultParams} />);

    expect(
      await screen.findByText(/Ensure someone 18\+ is home to receive the artisan/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Technician Arrival Status/i)).toBeInTheDocument();
  });

  it('ROUTE-003: authenticated BrainWorker accessing /scheduling/bk-101 mounts technician controls (ArrivalWindowCard and DispatchStatusUpdater)', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockWorker);
    const repo = getSchedulingRepository();
    await repo.seedBookingSchedule({
      bookingId: 'bk-101',
      jobStatus: 'CONFIRMED',
      agreedArrivalWindow: sampleWindow,
      dispatchStatus: 'NOT_STARTED',
    });

    render(<SchedulingPage params={defaultParams} />);

    expect(await screen.findByRole('button', { name: /mark en route/i })).toBeInTheDocument();
    expect(screen.getByText(/Agreed Arrival Window/i)).toBeInTheDocument();
  });

  it('ROUTE-004: non-existent bookingId renders Booking schedule not found error state gracefully', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockCustomer);
    const missingParams = Promise.resolve({ bookingId: 'nonexistent-bk' });

    render(<SchedulingPage params={missingParams} />);

    expect(await screen.findByText(/Booking schedule not found/i)).toBeInTheDocument();
  });

  it('ROUTE-005: customer viewing pending artisan reschedule request sees candidate windows, Accept, Decline, and Counter options', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockCustomer);
    const repo = getSchedulingRepository();
    await repo.seedBookingSchedule({
      bookingId: 'bk-101',
      jobStatus: 'CONFIRMED',
      agreedArrivalWindow: sampleWindow,
    });
    await repo.proposeReschedule({
      bookingId: 'bk-101',
      requesterRole: 'TASKER',
      requesterId: 'artisan-202',
      proposedWindows: [candidateWindow],
      reason: 'TRAFFIC_DELAY',
    });

    render(<SchedulingPage params={defaultParams} />);

    expect(await screen.findByRole('button', { name: /^accept$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^decline$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /counter/i })).toBeInTheDocument();
  });

  it('ROUTE-006: artisan viewing pending customer reschedule request sees candidate windows, Accept, Decline, and Counter options', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockWorker);
    const repo = getSchedulingRepository();
    await repo.seedBookingSchedule({
      bookingId: 'bk-101',
      jobStatus: 'CONFIRMED',
      agreedArrivalWindow: sampleWindow,
    });
    await repo.proposeReschedule({
      bookingId: 'bk-101',
      requesterRole: 'CLIENT',
      requesterId: 'cust-101',
      proposedWindows: [candidateWindow],
      reason: 'CUSTOMER_UNAVAILABLE',
    });

    render(<SchedulingPage params={defaultParams} />);

    expect(await screen.findByRole('button', { name: /^accept$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^decline$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /counter/i })).toBeInTheDocument();
  });

  it('ROUTE-007: requester viewing their own pending request sees Awaiting response banner and no Accept/Decline action buttons', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockCustomer);
    const repo = getSchedulingRepository();
    await repo.seedBookingSchedule({
      bookingId: 'bk-101',
      jobStatus: 'CONFIRMED',
      agreedArrivalWindow: sampleWindow,
    });
    await repo.proposeReschedule({
      bookingId: 'bk-101',
      requesterRole: 'CLIENT',
      requesterId: 'cust-101',
      proposedWindows: [candidateWindow],
      reason: 'PARTS_PROCUREMENT',
    });

    render(<SchedulingPage params={defaultParams} />);

    expect(
      await screen.findByText(/Awaiting response from counterparty|Awaiting response/i)
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^accept$/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^decline$/i })).not.toBeInTheDocument();
  });

  it('ROUTE-008: technician dispatch action (Mark En Route) delegates to repository.updateDispatchStatus(bookingId, nextStatus)', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockWorker);
    const repo = getSchedulingRepository();
    await repo.seedBookingSchedule({
      bookingId: 'bk-101',
      jobStatus: 'CONFIRMED',
      agreedArrivalWindow: sampleWindow,
      dispatchStatus: 'NOT_STARTED',
    });
    const updateSpy = vi.spyOn(repo, 'updateDispatchStatus');

    render(<SchedulingPage params={defaultParams} />);

    const enRouteBtn = await screen.findByRole('button', { name: /mark en route/i });
    fireEvent.click(enRouteBtn);

    await waitFor(() => {
      expect(updateSpy).toHaveBeenCalledWith('bk-101', 'EN_ROUTE');
    });
  });

  it('ROUTE-009: counterparty clicking Accept delegates to repository.respondReschedule(requestId, input) and updates the displayed window', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockCustomer);
    const repo = getSchedulingRepository();
    await repo.seedBookingSchedule({
      bookingId: 'bk-101',
      jobStatus: 'CONFIRMED',
      agreedArrivalWindow: sampleWindow,
    });
    const req = await repo.proposeReschedule({
      bookingId: 'bk-101',
      requesterRole: 'TASKER',
      requesterId: 'artisan-202',
      proposedWindows: [candidateWindow],
      reason: 'TRAFFIC_DELAY',
    });
    const respondSpy = vi.spyOn(repo, 'respondReschedule');

    render(<SchedulingPage params={defaultParams} />);

    const acceptBtn = await screen.findByRole('button', { name: /^accept$/i });
    fireEvent.click(acceptBtn);

    await waitFor(() => {
      expect(respondSpy).toHaveBeenCalledWith(
        req.id,
        expect.objectContaining({ action: 'ACCEPT' })
      );
    });
  });

  it('ROUTE-010: SSR mount safety and production boundary audit renders via renderToString without throwing and verifies page.tsx contains zero imports from testing/', async () => {
    const { renderToString } = await import('react-dom/server');

    let markup = '';
    expect(() => {
      markup = renderToString(<SchedulingPage params={defaultParams} />);
    }).not.toThrow();

    expect(markup).toBeDefined();

    // Verify physical boundary: page.tsx does not import from testing/
    const pagePath = path.join(__dirname, '[bookingId]', 'page.tsx');
    const pageSource = fs.readFileSync(pagePath, 'utf8');
    expect(pageSource).not.toMatch(/from ['"][^'"]*testing[^'"]*['"]/);
  });
});

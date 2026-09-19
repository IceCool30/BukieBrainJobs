import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import JobsScreen from '../../components/jobs/JobsScreen';
import * as authStorage from '../../lib/auth/storage';
import { AuthUser } from '../../lib/auth/types';
import { resetCustomerActivityRepository } from '../../lib/jobs/repository';

// Mock Next.js navigation
const mockPush = vi.fn();
let mockSearchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => mockSearchParams,
}));

// Mock Next.js Image
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...props} />
  ),
}));

describe('WEB-011 JobsScreen Component (TDD)', () => {
  const mockCustomerUser: AuthUser = {
    id: 'usr-customer-default',
    name: 'Babajide Adeleke',
    email: 'babajide@example.com',
    phone: '+2348031234567',
    provider: 'google',
    role: 'customer',
    isBrainWorkerApproved: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    resetCustomerActivityRepository();
    mockSearchParams = new URLSearchParams();
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockCustomerUser);
    vi.spyOn(authStorage, 'setMockAuthenticatedUser').mockImplementation(() => {});
    vi.spyOn(authStorage, 'getPreservedJobDraft').mockReturnValue(null);
  });

  it('renders authenticated header with "Jobs & Bookings" and supporting text', () => {
    render(<JobsScreen />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Jobs & Bookings/i);
    expect(
      screen.getByText(/Keep track of your service requests, bookings, and activity in one place/i)
    ).toBeInTheDocument();
  });

  it('renders persistent desktop sidebar navigation with active indicator on "Jobs / Bookings"', () => {
    render(<JobsScreen />);

    const sidebar = screen.getByRole('navigation', { name: /Desktop Sidebar/i });
    expect(sidebar).toBeInTheDocument();

    const jobsBtn = within(sidebar).getByRole('button', { name: /Jobs \/ Bookings/i });
    expect(jobsBtn).toBeInTheDocument();
    expect(jobsBtn).toHaveAttribute('aria-current', 'page');
  });

  it('renders persistent mobile bottom navigation with active indicator on "Jobs"', () => {
    render(<JobsScreen />);

    const bottomNav = screen.getByRole('navigation', { name: /Mobile Bottom Navigation/i });
    expect(bottomNav).toBeInTheDocument();

    const jobsBottomBtn = within(bottomNav).getByRole('button', { name: /Jobs/i });
    expect(jobsBottomBtn).toBeInTheDocument();
    expect(jobsBottomBtn).toHaveAttribute('aria-current', 'page');
  });

  it('renders activity filters (All, Active, Upcoming, Past) with URL synchronization', () => {
    render(<JobsScreen />);

    const filterNav = screen.getByRole('navigation', { name: /Activity Filters/i });
    expect(filterNav).toBeInTheDocument();

    const allTab = within(filterNav).getByRole('button', { name: /All/i });
    const activeTab = within(filterNav).getByRole('button', { name: /Active/i });
    const upcomingTab = within(filterNav).getByRole('button', { name: /Upcoming/i });
    const pastTab = within(filterNav).getByRole('button', { name: /Past/i });

    expect(allTab).toHaveAttribute('aria-pressed', 'true');
    expect(activeTab).toHaveAttribute('aria-pressed', 'false');
    expect(upcomingTab).toHaveAttribute('aria-pressed', 'false');
    expect(pastTab).toHaveAttribute('aria-pressed', 'false');

    // Clicking Active tab pushes URL param and activates
    fireEvent.click(activeTab);
    expect(mockPush).toHaveBeenCalledWith('/jobs?view=active');
  });

  it('preserves accurate filter counts across tab selection (All count remains total count)', () => {
    render(<JobsScreen />);

    const filterNav = screen.getByRole('navigation', { name: /Activity Filters/i });
    const allTab = within(filterNav).getByRole('button', { name: /All/i });
    const activeTab = within(filterNav).getByRole('button', { name: /Active/i });

    // Initial counts
    expect(within(allTab).getByText('9')).toBeInTheDocument();
    expect(within(activeTab).getByText('4')).toBeInTheDocument();

    // Click Active filter
    fireEvent.click(activeTab);

    // Verify All tab count STILL displays the total count 9, not 4
    expect(within(allTab).getByText('9')).toBeInTheDocument();
    expect(within(activeTab).getByText('4')).toBeInTheDocument();
  });

  it('separates Activity Type and Activity Status visually on each card', () => {
    render(<JobsScreen />);

    // Check presence of type badges
    const jobRequestBadges = screen.getAllByText('JOB REQUEST');
    const bookingBadges = screen.getAllByText('BOOKING');
    expect(jobRequestBadges.length).toBeGreaterThan(0);
    expect(bookingBadges.length).toBeGreaterThan(0);

    // Check presence of distinct statuses
    expect(screen.getAllByText('Awaiting Progress').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Request Received').length).toBeGreaterThan(0);
  });

  it('renders master-detail desktop layout: selecting an item displays its detail pane', () => {
    render(<JobsScreen />);

    // Click on the AC Servicing booking card
    const bookingCard = screen.getByRole('button', {
      name: /Select Split-Unit AC Deep Servicing/i,
    });
    fireEvent.click(bookingCard);

    // Detail area updates with details
    const detailPanel = screen.getByRole('region', { name: /Activity Detail/i });
    expect(detailPanel).toBeInTheDocument();
    expect(within(detailPanel).getByText(/Split-Unit AC Deep Servicing/i)).toBeInTheDocument();
    expect(within(detailPanel).getByText(/Victoria Island, Lagos/i)).toBeInTheDocument();
    expect(within(detailPanel).getByText(/Chidi Okonkwo/i)).toBeInTheDocument();
    expect(within(detailPanel).getAllByText(/BKG-77210/i).length).toBeGreaterThan(0);
  });

  it('renders decorative logo watermark at subtle opacity in activity detail', () => {
    render(<JobsScreen />);

    const watermarkImg = screen.getByAltText('');
    expect(watermarkImg).toBeInTheDocument();
    expect(watermarkImg).toHaveAttribute('src', '/images/logo-badge-512.png');
    expect(watermarkImg).toHaveAttribute('aria-hidden', 'true');
  });

  it('handles deep linking via ?id= query param on mount', () => {
    mockSearchParams = new URLSearchParams('id=BKG-63102');
    render(<JobsScreen />);

    const detailPanel = screen.getByRole('region', { name: /Activity Detail/i });
    expect(within(detailPanel).getByText(/Plumbing Drainage Pressure Test/i)).toBeInTheDocument();
    expect(within(detailPanel).getByText(/Ikeja GRA, Lagos/i)).toBeInTheDocument();
  });

  it('displays honest "Activity not found" notice for invalid id without crashing', () => {
    mockSearchParams = new URLSearchParams('id=NON-EXISTENT-999');
    render(<JobsScreen />);

    expect(screen.getByText(/Activity not found/i)).toBeInTheDocument();
    expect(screen.getByText(/NON-EXISTENT-999/i)).toBeInTheDocument();
  });

  it('renders first-run empty state when no activities exist', () => {
    mockSearchParams = new URLSearchParams('state=first_run');
    render(<JobsScreen />);

    expect(screen.getByText(/Your activity will appear here/i)).toBeInTheDocument();
    const findServiceLinks = screen.getAllByRole('link', { name: /Find a Service/i });
    expect(findServiceLinks.length).toBeGreaterThan(0);
    expect(findServiceLinks[0]).toHaveAttribute('href', '/services');

    const postJobLinks = screen.getAllByRole('link', { name: /Post a Job/i });
    expect(postJobLinks.length).toBeGreaterThan(0);
    expect(postJobLinks[0]).toHaveAttribute('href', '/post-job');
  });

  it('renders filtered empty state when filter has zero items', () => {
    mockSearchParams = new URLSearchParams('state=active&view=upcoming');
    render(<JobsScreen />);

    expect(screen.getByText(/No upcoming activity yet/i)).toBeInTheDocument();
  });

  it('renders loading skeleton state', () => {
    mockSearchParams = new URLSearchParams('state=loading');
    render(<JobsScreen />);

    expect(screen.getByRole('region', { name: /Loading activities/i })).toBeInTheDocument();
  });

  it('renders partial failure state with retry button', () => {
    mockSearchParams = new URLSearchParams('state=partial_failure');
    render(<JobsScreen />);

    expect(screen.getByText(/Could not refresh active work/i)).toBeInTheDocument();
    const retryBtn = screen.getByRole('button', { name: /Retry active work/i });
    expect(retryBtn).toBeInTheDocument();

    fireEvent.click(retryBtn);
    expect(screen.queryByText(/Could not refresh active work/i)).not.toBeInTheDocument();
  });

  it('renders offline degraded state with cache notice banner', () => {
    mockSearchParams = new URLSearchParams('state=offline');
    render(<JobsScreen />);

    expect(screen.getByText(/Offline Mode: Showing cached activity/i)).toBeInTheDocument();
  });

  it('renders authentication protection for unauthenticated users', () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(null);
    render(<JobsScreen />);

    expect(screen.getByText(/Sign in to view your activity/i)).toBeInTheDocument();
    const signInLink = screen.getByRole('link', { name: /Sign In/i });
    expect(signInLink).toHaveAttribute('href', '/login?redirect=/jobs');
  });

  it('renders WEB-013 lifecycle step indicator and honest meaning line for awaiting response', () => {
    mockSearchParams = new URLSearchParams('id=REQ-84920');
    render(<JobsScreen />);

    expect(screen.getByText('Waiting for the BrainWorker to respond.')).toBeInTheDocument();
    expect(screen.getByRole('region', { name: /Booking lifecycle progression/i })).toBeInTheDocument();
  });

  it('renders WEB-013 confirmed booking state with confirmation headline', () => {
    mockSearchParams = new URLSearchParams('id=BKG-63102');
    render(<JobsScreen />);

    expect(screen.getByText('Your booking is confirmed.')).toBeInTheDocument();
    expect(screen.getByText('Confirmed Professional')).toBeInTheDocument();
    expect(screen.getByText('Emeka Obi')).toBeInTheDocument();
  });

  it('renders WEB-013 decline state with honest wording and alternatives CTA', () => {
    mockSearchParams = new URLSearchParams('id=REQ-72941');
    render(<JobsScreen />);

    expect(screen.getByText('The BrainWorker declined the request.')).toBeInTheDocument();
    const alternativesLink = screen.getByRole('link', { name: /Review Alternatives/i });
    expect(alternativesLink).toBeInTheDocument();
    expect(alternativesLink).toHaveAttribute('href', '/job/REQ-72941/matches');
  });

  it('renders WEB-013 expired state with recreate CTA', () => {
    mockSearchParams = new URLSearchParams('id=REQ-22019');
    render(<JobsScreen />);

    expect(screen.getByText('The request expired without a response.')).toBeInTheDocument();
    const recreateLink = screen.getByRole('link', { name: /Recreate Request/i });
    expect(recreateLink).toBeInTheDocument();
    expect(recreateLink).toHaveAttribute('href', '/post-job');
  });

  it('allows opening CancellationModal and cancelling an open request', async () => {
    mockSearchParams = new URLSearchParams('id=REQ-51829');
    render(<JobsScreen />);

    const cancelBtn = screen.getByRole('button', { name: /Cancel Request/i });
    expect(cancelBtn).toBeInTheDocument();

    fireEvent.click(cancelBtn);

    // Modal opens
    expect(screen.getByRole('dialog', { name: /Cancel Service Request/i })).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to cancel request/i)).toBeInTheDocument();

    // Confirm cancellation
    const confirmBtn = screen.getByRole('button', { name: /Confirm Cancellation/i });
    fireEvent.click(confirmBtn);

    // After cancellation, status updates to cancelled
    expect(await screen.findByText('Your booking was cancelled.')).toBeInTheDocument();
  });

  it('does not render mock acceptance or decline controls in customer UI', () => {
    mockSearchParams = new URLSearchParams('id=REQ-84920');
    render(<JobsScreen />);

    expect(screen.getByText('Waiting for the BrainWorker to respond.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Simulate Acceptance/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Simulate Decline/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/Simulate Worker Response/i)).not.toBeInTheDocument();
  });

  it('renders booking-specific cancellation modal title and text when cancelling confirmed booking', async () => {
    mockSearchParams = new URLSearchParams('id=BKG-63102');
    render(<JobsScreen />);

    expect(screen.getByText('Your booking is confirmed.')).toBeInTheDocument();

    const cancelBtn = screen.getByRole('button', { name: /Cancel Booking/i });
    expect(cancelBtn).toBeInTheDocument();

    fireEvent.click(cancelBtn);

    expect(screen.getByRole('dialog', { name: /Cancel Booking/i })).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to cancel booking/i)).toBeInTheDocument();
    expect(screen.getByText(/This action will update the status to Cancelled\./i)).toBeInTheDocument();
    expect(screen.queryByText(/stop further processing/i)).not.toBeInTheDocument();
  });

  it('does not display decline state when authoritative jobStatus is CONFIRMED despite stale decline response', () => {
    resetCustomerActivityRepository([
      {
        id: 'BKG-STALE-DECLINE',
        type: 'booking',
        title: 'Generator Maintenance',
        service: 'Generator Maintenance',
        status: 'scheduled',
        statusLabel: 'Scheduled',
        jobStatus: 'CONFIRMED',
        customerId: 'usr-customer-default',
        location: 'Lekki Phase 1, Lagos',
        schedule: 'Tomorrow morning',
        referenceCode: 'BKG-STALE-DECLINE',
        createdAt: 'Today, 9:00 AM',
        invitation: {
          id: 'inv-stale-1',
          jobId: 'BKG-STALE-DECLINE',
          taskerProfileId: 'bw-prior-worker',
          sentAt: 'Yesterday',
          accepted: false,
        },
        declineResponse: {
          respondedAt: 'Yesterday',
          declineReason: 'Worker was busy yesterday',
        },
      },
    ]);

    mockSearchParams = new URLSearchParams('id=BKG-STALE-DECLINE');
    render(<JobsScreen />);

    // Authoritative status must win:
    expect(screen.getByText('Your booking is confirmed.')).toBeInTheDocument();
    expect(screen.queryByText('The BrainWorker declined the request.')).not.toBeInTheDocument();
    expect(screen.queryByText('BrainWorker Declined')).not.toBeInTheDocument();
  });

  it('traps focus and restores focus upon modal dismissal', async () => {
    mockSearchParams = new URLSearchParams('id=REQ-51829');
    render(<JobsScreen />);

    const cancelBtn = screen.getByRole('button', { name: /Cancel Request/i });
    cancelBtn.focus();
    expect(document.activeElement).toBe(cancelBtn);

    fireEvent.click(cancelBtn);

    const dialog = screen.getByRole('dialog', { name: /Cancel Service Request/i });
    expect(dialog).toBeInTheDocument();

    // Dismiss with Escape key
    fireEvent.keyDown(window, { key: 'Escape' });

    // Modal closes and focus is restored to the trigger button
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(document.activeElement).toBe(cancelBtn);
  });

  it('closing mobile detail view cleanly removes id parameter from URL and closes view', () => {
    mockSearchParams = new URLSearchParams('id=REQ-84920&view=active');
    render(<JobsScreen />);

    const backBtn = screen.getByLabelText(/Back to activity list/i);
    expect(backBtn).toBeInTheDocument();

    fireEvent.click(backBtn);

    expect(mockPush).toHaveBeenCalledWith('/jobs?view=active');
  });

  it('not-found reset control clears invalid ID and preserves active filter view', () => {
    mockSearchParams = new URLSearchParams('view=active&id=NON-EXISTENT-999');
    render(<JobsScreen />);

    expect(screen.getByText('Activity not found')).toBeInTheDocument();

    const resetBtn = screen.getByRole('button', { name: /View all activity/i });
    fireEvent.click(resetBtn);

    expect(mockPush).toHaveBeenCalledWith('/jobs?view=active');
  });

  it('fails closed and renders unauthenticated sign-in state when user is null without synthesizing default customer', () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(null);
    render(<JobsScreen />);

    expect(screen.getByRole('heading', { level: 1, name: /Sign in to view your activity/i })).toBeInTheDocument();
    expect(
      screen.getByText(/Please sign in to access your BukieBrainJobs service requests/i)
    ).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /Jobs & Bookings/i })).not.toBeInTheDocument();
  });

  it('renders "Activity not found" and does not fall through to the first activity on invalid deep-link /jobs?id=NON-EXISTENT-999', () => {
    mockSearchParams = new URLSearchParams('id=NON-EXISTENT-999');
    render(<JobsScreen />);

    expect(screen.getByText('Activity not found')).toBeInTheDocument();
    expect(
      screen.getByText(/The requested activity identifier \(NON-EXISTENT-999\) was not found in your account history\./i)
    ).toBeInTheDocument();

    // Verify detail pane does NOT show the first activity's action or lifecycle details
    expect(screen.queryByText(/Your booking is confirmed\./i)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /View all activity/i })).toBeInTheDocument();
  });

  it('renders first-run empty state when an authenticated customer has no activities (customer isolation)', () => {
    resetCustomerActivityRepository([]);
    render(<JobsScreen />);

    expect(screen.getByText('Your activity will appear here')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Find a Service/i })).toBeInTheDocument();
    expect(screen.queryByRole('feed', { name: /Activity list/i })).not.toBeInTheDocument();
  });
});


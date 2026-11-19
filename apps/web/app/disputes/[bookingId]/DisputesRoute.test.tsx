// apps/web/app/disputes/[bookingId]/DisputesRoute.test.tsx
// BW-010: Dispute Handling & Support Interface
// Phase 4 RED: Protected Route Integration Contracts (ROUTE-001 to ROUTE-009)

import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import * as authStorage from '../../../lib/auth/storage';
import type { AuthUser } from '../../../lib/auth/types';
import {
  InMemoryDisputeRepository,
  getDisputeRepository,
  resetDisputeRepository,
} from '../../../lib/disputes/repository';
import type { DisputeRecord } from '../../../lib/disputes/types';
import {
  InMemoryCompletionRepository,
  getCompletionRepository,
  resetCompletionRepository,
} from '../../../lib/completion/repository';
import type { PostJobCompletionState } from '../../../lib/completion/types';
import DisputeBookingPage from './page';
import { DisputeBookingPageView } from '../../../components/disputes/DisputeBookingPageView';

// Helper to render Next.js 15 Async Server Page Component in Vitest / RTL
const renderRoute = async (props: { params: Promise<{ bookingId: string }> }) => {
  const pageElement = await DisputeBookingPage(props);
  return render(pageElement);
};

// Mock Next.js Navigation
const mockPush = vi.fn();
const mockReplace = vi.fn();
let mockParams: Record<string, string> = { bookingId: 'book-101' };

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => `/disputes/${mockParams.bookingId}`,
  useParams: () => mockParams,
}));

// Mock Authenticated Fixtures
const customerUser: AuthUser = {
  id: 'cust-101',
  role: 'customer',
  email: 'customer@example.com',
  name: 'Chidi Obi',
  provider: 'google',
  isBrainWorkerApproved: false,
};

const brainWorkerUser: AuthUser = {
  id: 'worker-202',
  role: 'brainworker',
  email: 'worker@example.com',
  name: 'Amaka Eze',
  provider: 'phone',
  isBrainWorkerApproved: true,
};

const unauthorizedUser: AuthUser = {
  id: 'stranger-999',
  role: 'customer',
  email: 'stranger@example.com',
  name: 'Stranger User',
  provider: 'google',
  isBrainWorkerApproved: false,
};

// Mock Completion & Booking Fixtures
const sampleCompletionRecord: PostJobCompletionState = {
  bookingId: 'book-101',
  customerId: 'cust-101',
  brainWorkerId: 'worker-202',
  jobStatus: 'PENDING_COMPLETION',
  escrowStatus: 'ESCROW_HELD',
  baseQuoteKobo: 5000000,
  approvedAdjustmentKobo: 0,
  totalSettlementKobo: 5000000,
  settlementBreakdown: {
    totalSettlementKobo: 5000000,
    taskerPayoutKobo: 4125000,
    platformFeeKobo: 875000,
    platformFeeBps: 1750,
  },
  completionSubmittedAt: '2026-10-20T10:00:00Z',
  autoReleaseDeadline: '2026-10-23T10:00:00Z',
  isDisputed: false,
};

describe('BW-010 Phase 4: /disputes/[bookingId] Route Integration (ROUTE-001 to ROUTE-009)', () => {
  let disputeRepo: InMemoryDisputeRepository;
  let completionRepo: InMemoryCompletionRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    mockParams = { bookingId: 'book-101' };

    resetDisputeRepository();
    resetCompletionRepository();

    disputeRepo = getDisputeRepository() as InMemoryDisputeRepository;
    completionRepo = getCompletionRepository();

    // Default seed completion record
    completionRepo.seed([sampleCompletionRecord]);

    // Ensure URL APIs exist as spies in jsdom
    if (typeof URL.createObjectURL !== 'function') {
      URL.createObjectURL = vi.fn();
    }
    if (typeof URL.revokeObjectURL !== 'function') {
      URL.revokeObjectURL = vi.fn();
    }
    vi.spyOn(URL, 'createObjectURL').mockImplementation(() => 'blob:mock-evidence-url');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ROUTE-001: Unauthenticated visitor redirected or gated
  it('ROUTE-001: Redirects unauthenticated visitor to login with return redirect parameter', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(null);

    await renderRoute({ params: Promise.resolve({ bookingId: 'book-101' }) });

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(
        expect.stringContaining('/login?redirect=')
      );
    });
  });

  // ROUTE-002: Unauthorized participant fails closed with 403 notice
  it('ROUTE-002: Fails closed and displays 403 unauthorized notice when user is neither customer nor worker for booking', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(unauthorizedUser);

    await renderRoute({ params: Promise.resolve({ bookingId: 'book-101' }) });

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/unauthorized|access denied/i);
    });
    expect(screen.queryByTestId('dispute-timeline-view')).not.toBeInTheDocument();
  });

  // ROUTE-003: Non-existent booking displays 404 notice
  it('ROUTE-003: Renders 404 booking not found notice when booking does not exist in platform records', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(customerUser);
    mockParams = { bookingId: 'non-existent-booking' };

    await renderRoute({ params: Promise.resolve({ bookingId: 'non-existent-booking' }) });

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/booking not found/i);
    });
  });

  // ROUTE-004: Customer participant view when eligible to file dispute
  it('ROUTE-004: Customer participant can view the local dispute preview and open the record form', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(customerUser);

    await renderRoute({ params: Promise.resolve({ bookingId: 'book-101' }) });

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Dispute Workspace Preview/i })).toBeInTheDocument();
      expect(screen.getByText(/REF:\s*book-101/i)).toBeInTheDocument();
    });

    // Customer sees action to file dispute when no dispute exists
    const fileDisputeBtn = screen.getByRole('button', { name: /file dispute|initiate dispute/i });
    expect(fileDisputeBtn).toBeInTheDocument();

    // Opening modal
    fireEvent.click(fileDisputeBtn);
    expect(screen.getByTestId('dispute-initiation-modal')).toBeInTheDocument();

    // Customer can also view SupportTicketForm and HelpCenter
    expect(screen.getByTestId('support-ticket-form')).toBeInTheDocument();
    expect(screen.getByTestId('help-center-view')).toBeInTheDocument();
  });

  // ROUTE-005: Customer participant view when dispute is active
  it('ROUTE-005: Customer participant sees a local status and simulated timer notice without a real-funds claim', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(customerUser);

    // Seed active dispute in repository
    const activeDispute: DisputeRecord = {
      id: 'disp-active-1',
      bookingId: 'book-101',
      customerId: 'cust-101',
      brainWorkerId: 'worker-202',
      initiatedByRole: 'customer',
      category: 'WORKMANSHIP_DEFECT',
      description: 'Defective bathroom pipes with water leaks.',
      status: 'UNDER_REVIEW',
      evidence: [],
      timeline: [
        {
          id: 'tl-1',
          eventType: 'DISPUTE_FILED',
          actorId: 'cust-101',
          actorRole: 'customer',
          note: 'Customer filed dispute for workmanship defect.',
          timestamp: '2026-10-21T09:00:00Z',
        },
      ],
      createdAt: '2026-10-21T09:00:00Z',
      updatedAt: '2026-10-21T09:00:00Z',
    };
    disputeRepo.seed([activeDispute]);
    completionRepo.seed([{ ...sampleCompletionRecord, isDisputed: true }]);

    await renderRoute({ params: Promise.resolve({ bookingId: 'book-101' }) });

    await waitFor(() => {
      expect(screen.getByTestId('dispute-timeline-view')).toBeInTheDocument();
    });

    expect(screen.getByText(/Local record: UNDER REVIEW/i)).toBeInTheDocument();
    expect(screen.getByText(/Local status: UNDER REVIEW/i)).toBeInTheDocument();
    expect(screen.getByText(/Defective bathroom pipes with water leaks/i)).toBeInTheDocument();
    expect(screen.getByText(/Customer filed dispute for workmanship defect/i)).toBeInTheDocument();

    expect(screen.getByText(/simulated auto-release timer is paused/i)).toBeInTheDocument();
    expect(screen.getByText(/does not hold or move real funds/i)).toBeInTheDocument();
    expect(
      screen.queryByText(/Escrow auto-release remains paused while a dispute is active/i)
    ).not.toBeInTheDocument();
  });

  // ROUTE-006: BrainWorker participant view
  it('ROUTE-006: BrainWorker participant views active dispute banner, timeline, and cannot file duplicate', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(brainWorkerUser);

    const activeDispute: DisputeRecord = {
      id: 'disp-active-2',
      bookingId: 'book-101',
      customerId: 'cust-101',
      brainWorkerId: 'worker-202',
      initiatedByRole: 'customer',
      category: 'INCOMPLETE_ABANDONED',
      description: 'Job was not completed according to agreement.',
      status: 'ACTION_REQUIRED',
      evidence: [],
      timeline: [
        {
          id: 'tl-1',
          eventType: 'DISPUTE_FILED',
          actorId: 'cust-101',
          actorRole: 'customer',
          note: 'Customer opened dispute for incomplete task.',
          timestamp: '2026-10-21T09:00:00Z',
        },
      ],
      createdAt: '2026-10-21T09:00:00Z',
      updatedAt: '2026-10-21T09:00:00Z',
    };
    disputeRepo.seed([activeDispute]);

    await renderRoute({ params: Promise.resolve({ bookingId: 'book-101' }) });

    await waitFor(() => {
      expect(screen.getByTestId('brainworker-dispute-banner')).toBeInTheDocument();
      expect(screen.getByTestId('dispute-timeline-view')).toBeInTheDocument();
    });

    expect(screen.getByText(/Action Required: Counter-Evidence Requested/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^file dispute$/i })).not.toBeInTheDocument();
  });

  // ROUTE-007: Settlement view when status is RESOLVED
  it('ROUTE-007: Both participants can inspect settlement terms and canonical 17.5% fee breakdown upon resolution', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(customerUser);

    const resolvedDispute: DisputeRecord = {
      id: 'disp-resolved-1',
      bookingId: 'book-101',
      customerId: 'cust-101',
      brainWorkerId: 'worker-202',
      initiatedByRole: 'customer',
      category: 'WORKMANSHIP_DEFECT',
      description: 'Tile joints were repaired mutually.',
      status: 'RESOLVED',
      evidence: [],
      timeline: [],
      settlement: {
        totalAmountKobo: 10000000,
        customerRefundKobo: 5000000,
        workerPayoutKobo: 3250000,
        platformFeeKobo: 1750000,
        serviceFeeKobo: 1000000,
        trustFeeKobo: 750000,
        resolutionType: 'SPLIT_SETTLEMENT',
      },
      createdAt: '2026-10-20T09:00:00Z',
      updatedAt: '2026-10-21T12:00:00Z',
      resolvedAt: '2026-10-21T12:00:00Z',
    };
    disputeRepo.seed([resolvedDispute]);

    await renderRoute({ params: Promise.resolve({ bookingId: 'book-101' }) });

    await waitFor(() => {
      expect(screen.getByText(/Settlement Agreement/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/₦50,000/)).toBeInTheDocument();
    expect(screen.getByText(/₦32,500/)).toBeInTheDocument();
    expect(screen.getByText(/₦17,500/)).toBeInTheDocument();
    expect(screen.getByText(/Platform Fee \(17\.5%\)/i)).toBeInTheDocument();
  });

  // ROUTE-008: Offline state handling
  it('ROUTE-008: Displays offline notice and disables dispute submission while device is offline', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(customerUser);

    // Render with offline indicator
    render(
      <DisputeBookingPageView
        bookingId="book-101"
        isOffline={true}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Device is currently offline/i)).toBeInTheDocument();
    });

    const fileDisputeBtn = screen.getByRole('button', { name: /file dispute|initiate dispute/i });
    expect(fileDisputeBtn).toBeDisabled();
  });

  // ROUTE-009: Evidence continuity through submission flow
  it('ROUTE-009: Preserves submitted evidence in timeline without revoking blob preview upon modal close', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(customerUser);

    await renderRoute({ params: Promise.resolve({ bookingId: 'book-101' }) });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /file dispute/i })).toBeInTheDocument();
    });

    // Open initiation modal
    fireEvent.click(screen.getByRole('button', { name: /file dispute/i }));

    const file = new File(['evidence image file'], 'broken-tiles.png', { type: 'image/png' });
    Object.defineProperty(file, 'size', { value: 20480 });

    const fileInput = screen.getByLabelText(/upload evidence/i);
    fireEvent.change(fileInput, { target: { files: [file] } });

    const descriptionInput = screen.getByLabelText(/description/i);
    fireEvent.change(descriptionInput, {
      target: { value: 'Bathroom wall tiles cracked during mounting work.' },
    });

    const submitBtn = screen.getByRole('button', { name: /submit dispute/i });
    fireEvent.click(submitBtn);

    // Modal closes and timeline renders the newly filed dispute
    await waitFor(() => {
      expect(screen.queryByTestId('dispute-initiation-modal')).not.toBeInTheDocument();
      expect(screen.getByTestId('dispute-timeline-view')).toBeInTheDocument();
    });

    expect(
      screen.getAllByText(/Bathroom wall tiles cracked during mounting work/i).length
    ).toBeGreaterThanOrEqual(1);
    // Submitted blob preview must not be revoked
    expect(URL.revokeObjectURL).not.toHaveBeenCalledWith('blob:mock-evidence-url');
  });

  // ROUTE-010: No demo-prefix backdoor; unknown demo IDs fail closed with 404
  it('ROUTE-010: Fails closed and displays 404 when booking starts with demo but does not exist in repository', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(customerUser);

    await renderRoute({ params: Promise.resolve({ bookingId: 'demo-unseeded-999' }) });

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/booking not found/i);
    });
    // Must NOT have fabricated a fictional booking record
    expect(screen.queryByText(/File a Formal Platform Dispute/i)).not.toBeInTheDocument();
  });

  // ROUTE-011: BrainWorker counter-evidence submission to same dispute
  it('ROUTE-011: BrainWorker submits counter-evidence to existing dispute, appending to timeline and evidence view', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(brainWorkerUser);

    const activeDispute: DisputeRecord = {
      id: 'disp-bw-test',
      bookingId: 'book-101',
      customerId: 'cust-101',
      brainWorkerId: 'worker-202',
      initiatedByRole: 'customer',
      category: 'WORKMANSHIP_DEFECT',
      description: 'Customer claims pipe leaks.',
      status: 'UNDER_REVIEW',
      evidence: [],
      timeline: [
        {
          id: 'tl-1',
          eventType: 'DISPUTE_FILED',
          actorId: 'cust-101',
          actorRole: 'customer',
          note: 'Customer filed dispute.',
          timestamp: '2026-10-21T09:00:00Z',
        },
      ],
      createdAt: '2026-10-21T09:00:00Z',
      updatedAt: '2026-10-21T09:00:00Z',
    };
    disputeRepo.seed([activeDispute]);

    await renderRoute({ params: Promise.resolve({ bookingId: 'book-101' }) });

    await waitFor(() => {
      expect(screen.getByTestId('brainworker-dispute-banner')).toBeInTheDocument();
    });

    const counterBtn = screen.getByRole('button', { name: /submit counter-evidence/i });
    fireEvent.click(counterBtn);

    // Counter evidence modal opens
    expect(screen.getByTestId('dispute-counter-evidence-modal')).toBeInTheDocument();

    const file = new File(['proof image'], 'fixed-valve.png', { type: 'image/png' });
    Object.defineProperty(file, 'size', { value: 30000 });

    const fileInput = screen.getAllByLabelText(/upload evidence/i)[0];
    if (fileInput) fireEvent.change(fileInput, { target: { files: [file] } });

    const modal = screen.getByTestId('dispute-counter-evidence-modal');
    const submitBtn = within(modal).getByRole('button', { name: /submit counter-evidence/i });
    fireEvent.click(submitBtn);

    // Modal closes and timeline shows the submitted counter evidence
    await waitFor(() => {
      expect(screen.queryByTestId('dispute-counter-evidence-modal')).not.toBeInTheDocument();
    });

    const updatedDispute = await disputeRepo.getDisputeByBookingId('book-101', 'worker-202');
    expect(updatedDispute?.evidence.length).toBe(1);
    expect(updatedDispute?.evidence[0]?.caption).toBe('fixed-valve.png');
    expect(updatedDispute?.timeline.some((t) => t.eventType === 'COUNTER_EVIDENCE_SUBMITTED')).toBe(true);

    // Attachment rendered in DisputeTimelineView
    expect(screen.getAllByText(/fixed-valve.png/i).length).toBeGreaterThanOrEqual(1);
  });

  // ROUTE-012: Navigation from booking A to booking B clears state immediately; handles rejected params
  it('ROUTE-012: Clears dispute state on booking change and prevents stale dispute display across navigation', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(customerUser);

    const activeDispute: DisputeRecord = {
      id: 'disp-book-101',
      bookingId: 'book-101',
      customerId: 'cust-101',
      brainWorkerId: 'worker-202',
      initiatedByRole: 'customer',
      category: 'WORKMANSHIP_DEFECT',
      description: 'Active dispute on 101.',
      status: 'UNDER_REVIEW',
      evidence: [],
      timeline: [],
      createdAt: '2026-10-21T09:00:00Z',
      updatedAt: '2026-10-21T09:00:00Z',
    };
    disputeRepo.seed([activeDispute]);

    const { rerender } = render(
      <DisputeBookingPageView bookingId="book-101" />
    );

    await waitFor(() => {
      expect(screen.getByText(/Active dispute on 101/i)).toBeInTheDocument();
    });

    // Navigate to unknown booking B
    rerender(<DisputeBookingPageView bookingId="book-unknown-888" />);

    // Old dispute must NOT be displayed
    expect(screen.queryByText(/Active dispute on 101/i)).not.toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/booking not found/i);
    });
  });

  // ROUTE-012b: Propagates rejected params Promise and renders not found alert on empty bookingId
  it('ROUTE-012b: Propagates rejected params Promise and renders not found alert on empty bookingId', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(customerUser);

    await expect(
      renderRoute({
        params: Promise.reject(new Error('Route resolution failed')),
      })
    ).rejects.toThrow('Route resolution failed');

    await renderRoute({
      params: Promise.resolve({ bookingId: '' }),
    });

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/booking not found/i);
    });
  });

  // ROUTE-013: Subscribes to online/offline events reactively
  it('ROUTE-013: Reactively disables actions when offline event fires and re-enables on online event', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(customerUser);

    await renderRoute({ params: Promise.resolve({ bookingId: 'book-101' }) });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /file dispute/i })).toBeEnabled();
    });

    // Fire offline event
    fireEvent(window, new Event('offline'));

    await waitFor(() => {
      expect(screen.getByText(/device is currently offline/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /file dispute/i })).toBeDisabled();
    });

    // Fire online event
    fireEvent(window, new Event('online'));

    await waitFor(() => {
      expect(screen.queryByText(/device is currently offline/i)).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: /file dispute/i })).toBeEnabled();
    });
  });

  // ROUTE-014: Renders SupportTicketForm in read-only unavailable state with all fields and submit button disabled
  it('ROUTE-014: Renders SupportTicketForm in read-only unavailable state with all fields and submit button disabled', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(customerUser);

    await renderRoute({ params: Promise.resolve({ bookingId: 'book-101' }) });

    await waitFor(() => {
      expect(screen.getByTestId('support-ticket-form')).toBeInTheDocument();
    });

    expect(screen.getByText(/ticket submission is currently unavailable/i)).toBeInTheDocument();
    expect(screen.queryByText(/submit a ticket draft for simulated review/i)).not.toBeInTheDocument();

    const categorySelect = screen.getByLabelText(/category \/ topic/i);
    expect(categorySelect).toBeDisabled();

    const emailInput = screen.getByLabelText(/email \/ contact/i);
    expect(emailInput).toBeDisabled();

    const bookingIdInput = screen.getByLabelText(/booking reference/i);
    expect(bookingIdInput).toBeDisabled();

    const messageInput = screen.getByLabelText(/message \/ inquiry/i);
    expect(messageInput).toBeDisabled();

    const submitBtn = screen.getByRole('button', { name: /submit ticket/i });
    expect(submitBtn).toBeDisabled();
  });

  // ROUTE-015: StrictMode effect replay resolves booking data without getting stuck in loading state
  it('ROUTE-015: StrictMode effect replay resolves booking data without getting stuck in loading state', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(customerUser);

    render(
      <React.StrictMode>
        <DisputeBookingPageView bookingId="book-101" />
      </React.StrictMode>
    );

    // This fails on the old code because prevParamsRef equality check cancels effect replay
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Dispute Resolution and Support/i })).toBeInTheDocument();
      expect(screen.getByText(/REF:\s*book-101/i)).toBeInTheDocument();
    }, { timeout: 1500 });

    expect(screen.queryByText(/loading dispute records/i)).not.toBeInTheDocument();
  });

  // ROUTE-016: A-to-B navigation discards pending old mutation resolution and resets local state cleanly
  it('ROUTE-016: A-to-B navigation resets local modal state and discards pending old mutation resolution', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(customerUser);

    completionRepo.seed([
      sampleCompletionRecord,
      {
        ...sampleCompletionRecord,
        bookingId: 'book-102',
        totalSettlementKobo: 7500000,
      },
    ]);

    const { rerender } = render(
      <DisputeBookingPageView key="book-101" bookingId="book-101" />
    );

    await waitFor(() => {
      expect(screen.getByText(/REF:\s*book-101/i)).toBeInTheDocument();
    });

    // Open file dispute modal on book-101
    const fileDisputeBtn = screen.getByRole('button', { name: /file dispute/i });
    fireEvent.click(fileDisputeBtn);
    expect(screen.getByTestId('dispute-initiation-modal')).toBeInTheDocument();

    // Navigate to book-102 using key={bookingId} established Next pattern
    rerender(
      <DisputeBookingPageView key="book-102" bookingId="book-102" />
    );

    await waitFor(() => {
      expect(screen.getByText(/REF:\s*book-102/i)).toBeInTheDocument();
    });

    // Modal state from book-101 must be completely unmounted
    expect(screen.queryByTestId('dispute-initiation-modal')).not.toBeInTheDocument();
  });

  // ROUTE-017: Surfaces partial failure explicitly when completion state sync fails after dispute creation, displays retry action without claiming escrow is paused, and syncs on retry without duplicating dispute
  it('ROUTE-017: Surfaces local status failure and recovers on retry without duplicate dispute', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(customerUser);

    await renderRoute({ params: Promise.resolve({ bookingId: 'book-101' }) });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /file dispute/i })).toBeInTheDocument();
    });

    // Mock the local completion status update to fail
    vi.spyOn(completionRepo, 'raiseDispute').mockRejectedValueOnce(
      new Error('Local completion record could not be updated')
    );

    // Open initiation modal
    fireEvent.click(screen.getByRole('button', { name: /file dispute/i }));

    const descriptionInput = screen.getByLabelText(/description/i);
    fireEvent.change(descriptionInput, {
      target: { value: 'Water leak under kitchen sink pipes.' },
    });

    const submitBtn = screen.getByRole('button', { name: /submit dispute/i });
    fireEvent.click(submitBtn);

    // Modal closes because the dispute record was created
    await waitFor(() => {
      expect(screen.queryByTestId('dispute-initiation-modal')).not.toBeInTheDocument();
    });

    // The dispute record was created and is rendered
    expect(screen.getByTestId('dispute-timeline-view')).toBeInTheDocument();
    expect(screen.getAllByText(/Water leak under kitchen sink pipes/i).length).toBeGreaterThanOrEqual(1);

    // Partial failure must identify the local status update and real-funds boundary
    const syncAlert = await screen.findByRole('alert');
    expect(syncAlert).toHaveTextContent(/local booking status could not be updated/i);
    expect(syncAlert).toHaveTextContent(/does not change real escrow or payment status/i);

    // MUST NOT claim escrow auto-release is paused
    expect(
      screen.queryByText(/Escrow auto-release remains paused while a dispute is active/i)
    ).not.toBeInTheDocument();

    // Retry button must be present
    const retryBtn = screen.getByRole('button', { name: /retry local status update/i });
    expect(retryBtn).toBeInTheDocument();

    // Verify exactly 1 dispute was created
    const currentDispute = await disputeRepo.getDisputeByBookingId('book-101', 'cust-101');
    expect(currentDispute).not.toBeNull();
    const disputeId = currentDispute?.id;

    // Now trigger retry
    fireEvent.click(retryBtn);

    // On retry, the local status update succeeds
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /retry local status update/i })).not.toBeInTheDocument();
    });

    // Completion state is now disputed and auto-release is paused
    const updatedCompletion = await completionRepo.getCompletionState('book-101');
    expect(updatedCompletion?.isDisputed).toBe(true);
    expect(updatedCompletion?.escrowStatus).toBe('DISPUTED');

    // The UI accurately identifies only the simulated timer state
    expect(screen.getByText(/simulated auto-release timer is paused/i)).toBeInTheDocument();
    expect(screen.getByText(/does not hold or move real funds/i)).toBeInTheDocument();

    // Dispute ID is unchanged (NO duplicate dispute created)
    const afterRetryDispute = await disputeRepo.getDisputeByBookingId('book-101', 'cust-101');
    expect(afterRetryDispute?.id).toBe(disputeId);
  });

  // ROUTE-018: Mismatched participant records fail closed into 403 and never disclose another participant's dispute body or evidence
  it('ROUTE-018: Mismatched participant records fail closed into 403 and never disclose another participant dispute body or evidence', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(customerUser);

    // Seed dispute belonging to foreign participants for the same booking
    const foreignDispute: DisputeRecord = {
      id: 'disp-foreign-999',
      bookingId: 'book-101',
      customerId: 'cust-foreign-999',
      brainWorkerId: 'worker-foreign-999',
      initiatedByRole: 'customer',
      category: 'WORKMANSHIP_DEFECT',
      description: 'CONFIDENTIAL_FOREIGN_DISPUTE_CLAIM',
      evidence: [
        {
          id: 'ev-foreign-1',
          uploaderId: 'cust-foreign-999',
          uploaderRole: 'customer',
          fileType: 'image/png',
          caption: 'confidential_contract.png',
          sizeBytes: 1024,
          previewUrl: 'blob:mock-confidential-contract',
          uploadedAt: '2026-10-21T09:00:00Z',
        },
      ],
      status: 'UNDER_REVIEW',
      timeline: [
        {
          id: 'tl-foreign-1',
          eventType: 'DISPUTE_FILED',
          actorId: 'cust-foreign-999',
          actorRole: 'customer',
          note: 'CONFIDENTIAL_FOREIGN_TIMELINE_EVENT',
          timestamp: '2026-10-21T09:00:00Z',
        },
      ],
      createdAt: '2026-10-21T09:00:00Z',
      updatedAt: '2026-10-21T09:00:00Z',
    };
    disputeRepo.seed([foreignDispute]);

    await renderRoute({ params: Promise.resolve({ bookingId: 'book-101' }) });

    // Must fail closed with 403 Unauthorized Access alert
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
    expect(screen.getByText(/Unauthorized Access/i)).toBeInTheDocument();

    // Prove zero disclosure of foreign dispute content
    expect(screen.queryByText(/CONFIDENTIAL_FOREIGN_DISPUTE_CLAIM/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/confidential_contract\.png/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/CONFIDENTIAL_FOREIGN_TIMELINE_EVENT/i)).not.toBeInTheDocument();
  });

  // ROUTE-019: On remount/reload with existing dispute but undisputed completion record, states synchronization is unconfirmed and offers safe retry without false pause claim
  it('ROUTE-019: On remount with an undisputed completion record, states local status is pending and offers retry', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(customerUser);

    // Existing dispute in disputeRepo
    const activeDispute: DisputeRecord = {
      id: 'disp-active-remount',
      bookingId: 'book-101',
      customerId: 'cust-101',
      brainWorkerId: 'worker-202',
      initiatedByRole: 'customer',
      category: 'WORKMANSHIP_DEFECT',
      description: 'Leak persists under sink.',
      evidence: [],
      status: 'UNDER_REVIEW',
      timeline: [],
      createdAt: '2026-10-21T09:00:00Z',
      updatedAt: '2026-10-21T09:00:00Z',
    };
    disputeRepo.seed([activeDispute]);

    // Ensure completionRecord is NOT marked disputed (simulating reload after failed sync)
    const existingCompletion = await completionRepo.getCompletionState('book-101');
    if (existingCompletion) {
      existingCompletion.isDisputed = false;
      existingCompletion.escrowStatus = 'ESCROW_HELD';
    }

    await renderRoute({ params: Promise.resolve({ bookingId: 'book-101' }) });

    await waitFor(() => {
      expect(screen.getByTestId('dispute-timeline-view')).toBeInTheDocument();
    });

    // MUST NOT claim escrow auto-release is paused
    expect(
      screen.queryByText(/Escrow auto-release remains paused while a dispute is active/i)
    ).not.toBeInTheDocument();

    // The local completion status is pending and the retry is clearly local
    expect(screen.getByText(/local booking status is not updated/i)).toBeInTheDocument();
    expect(screen.getByText(/does not change real escrow or payment status/i)).toBeInTheDocument();
    const retryBtn = screen.getByRole('button', { name: /retry local status update/i });
    expect(retryBtn).toBeInTheDocument();

    // Click retry
    fireEvent.click(retryBtn);

    // On successful retry, the local simulated timer is marked paused
    await waitFor(() => {
      expect(screen.getByText(/simulated auto-release timer is paused/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/does not hold or move real funds/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /retry local status update/i })).not.toBeInTheDocument();
  });

  // ROUTE-020: Repeat safety on counter-evidence: re-reads latest record and skips already-present evidence IDs on retry
  it('ROUTE-020: Re-reads latest dispute and skips already-present evidence IDs on retry, preventing duplicate evidence or events', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(brainWorkerUser);

    const activeDispute: DisputeRecord = {
      id: 'disp-retry-counter',
      bookingId: 'book-101',
      customerId: 'cust-101',
      brainWorkerId: 'worker-202',
      initiatedByRole: 'customer',
      category: 'WORKMANSHIP_DEFECT',
      description: 'Original customer claim.',
      evidence: [],
      status: 'UNDER_REVIEW',
      timeline: [],
      createdAt: '2026-10-21T09:00:00Z',
      updatedAt: '2026-10-21T09:00:00Z',
    };
    disputeRepo.seed([activeDispute]);

    await renderRoute({ params: Promise.resolve({ bookingId: 'book-101' }) });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /submit counter-evidence/i })).toBeInTheDocument();
    });

    // Open counter-evidence modal
    fireEvent.click(screen.getByRole('button', { name: /submit counter-evidence/i }));

    const fileInput = screen.getByLabelText(/upload evidence/i);
    const validFile = new File(['valid-image-bytes'], 'proof_counter.png', { type: 'image/png' });
    fireEvent.change(fileInput, { target: { files: [validFile] } });

    await waitFor(() => {
      expect(screen.getByText(/proof_counter\.png/i)).toBeInTheDocument();
    });

    // Mock submitCounterEvidence so that the repository executes the write once, but throws on response (simulating ambiguous network rejection)
    const realSubmitCounter = disputeRepo.submitCounterEvidence.bind(disputeRepo);
    let rejectedOnce = false;
    vi.spyOn(disputeRepo, 'submitCounterEvidence').mockImplementation(async (disputeId, item, callerId) => {
      const res = await realSubmitCounter(disputeId, item, callerId);
      if (!rejectedOnce) {
        rejectedOnce = true;
        throw new Error('Ambiguous network error after write');
      }
      return res;
    });

    const modal = screen.getByTestId('dispute-counter-evidence-modal');
    const submitBtn = within(modal).getByRole('button', { name: /^submit counter-evidence$/i });
    fireEvent.click(submitBtn);

    // Modal stays open with error message and allows retry
    await waitFor(() => {
      expect(screen.getByText(/Ambiguous network error after write/i)).toBeInTheDocument();
    });

    // User clicks submit again (retry)
    fireEvent.click(submitBtn);

    // Modal now closes
    await waitFor(() => {
      expect(screen.queryByTestId('dispute-counter-evidence-modal')).not.toBeInTheDocument();
    });

    // The dispute in repo must have exactly ONE counter-evidence item and ONE timeline event
    const updatedDispute = await disputeRepo.getDispute('disp-retry-counter', 'worker-202');
    expect(updatedDispute.evidence.length).toBe(1);
    expect(updatedDispute.evidence[0]?.caption).toBe('proof_counter.png');
    const counterEvents = updatedDispute.timeline.filter(e => e.eventType === 'COUNTER_EVIDENCE_SUBMITTED');
    expect(counterEvents.length).toBe(1);
  });

  // ROUTE-020b: Preserves distinct evidence items having matching filenames or captions when IDs differ
  it('ROUTE-020b: Preserves distinct evidence items having matching filenames or captions when IDs differ', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(brainWorkerUser);

    const activeDispute: DisputeRecord = {
      id: 'disp-multi-same-caption',
      bookingId: 'book-101',
      customerId: 'cust-101',
      brainWorkerId: 'worker-202',
      initiatedByRole: 'customer',
      category: 'WORKMANSHIP_DEFECT',
      description: 'Customer claim on tiles.',
      evidence: [
        {
          id: 'ev-existing-1',
          uploaderRole: 'customer',
          uploaderId: 'cust-101',
          previewUrl: 'blob:mock-file-1',
          sizeBytes: 1024,
          fileType: 'image/png',
          uploadedAt: '2026-10-21T09:00:00Z',
          caption: 'Site photo',
        },
      ],
      status: 'UNDER_REVIEW',
      timeline: [],
      createdAt: '2026-10-21T09:00:00Z',
      updatedAt: '2026-10-21T09:00:00Z',
    };
    disputeRepo.seed([activeDispute]);

    await renderRoute({ params: Promise.resolve({ bookingId: 'book-101' }) });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /submit counter-evidence/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /submit counter-evidence/i }));

    const fileInput = screen.getByLabelText(/upload evidence/i);
    const workerFile = new File(['worker-photo-bytes'], 'evidence.png', { type: 'image/png' });
    fireEvent.change(fileInput, { target: { files: [workerFile] } });

    await waitFor(() => {
      expect(screen.getAllByText(/evidence\.png/i).length).toBeGreaterThan(0);
    });

    const modal = screen.getByTestId('dispute-counter-evidence-modal');
    const submitBtn = within(modal).getByRole('button', { name: /^submit counter-evidence$/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.queryByTestId('dispute-counter-evidence-modal')).not.toBeInTheDocument();
    });

    const updatedDispute = await disputeRepo.getDispute('disp-multi-same-caption', 'worker-202');
    expect(updatedDispute.evidence.length).toBe(2);
    expect(updatedDispute.evidence[0]?.id).toBe('ev-existing-1');
    expect(updatedDispute.evidence[1]?.caption).toBe('evidence.png');
    expect(updatedDispute.evidence[1]?.id).not.toBe('ev-existing-1');
  });

  // ROUTE-021a: Customer back link renders "Back to Booking Detail" pointing to /completion/[bookingId]
  it('ROUTE-021a: Customer back link renders "Back to Booking Detail" pointing to /completion/[bookingId]', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(customerUser);

    await renderRoute({ params: Promise.resolve({ bookingId: 'book-101' }) });

    await waitFor(() => {
      expect(screen.getByRole('link', { name: /Back to Booking Detail/i })).toBeInTheDocument();
    });

    const customerBackLink = screen.getByRole('link', { name: /Back to Booking Detail/i });
    expect(customerBackLink).toHaveAttribute('href', '/completion/book-101');
  });

  // ROUTE-021b: BrainWorker back link renders "Back to Booking Detail" pointing to /brainworker/bookings/[bookingId]
  it('ROUTE-021b: BrainWorker back link renders "Back to Booking Detail" pointing to /brainworker/bookings/[bookingId]', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(brainWorkerUser);

    await renderRoute({ params: Promise.resolve({ bookingId: 'book-101' }) });

    await waitFor(() => {
      expect(screen.getByRole('link', { name: /Back to Booking Detail/i })).toBeInTheDocument();
    });

    const workerBackLink = screen.getByRole('link', { name: /Back to Booking Detail/i });
    expect(workerBackLink).toHaveAttribute('href', '/brainworker/bookings/book-101');
  });

  // ROUTE-022: Labels BrainWorker view as Dispute Response without claiming Mediation Workspace, and fallback copy avoids verified/platform record claims
  it('ROUTE-022: Labels BrainWorker view as Dispute Response without claiming Mediation Workspace, and fallback copy avoids verified/platform record claims', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(brainWorkerUser);

    await renderRoute({ params: Promise.resolve({ bookingId: 'book-101' }) });

    await waitFor(() => {
      expect(screen.getByText(/BrainWorker Dispute Response/i)).toBeInTheDocument();
    });
    expect(screen.queryByText(/BrainWorker Mediation Workspace/i)).not.toBeInTheDocument();

    // 404 fallback check:
    await renderRoute({ params: Promise.resolve({ bookingId: 'book-non-existent' }) });
    await waitFor(() => {
      expect(screen.getByText(/could not be found in local workspace records/i)).toBeInTheDocument();
    });
    expect(screen.queryByText(/platform records/i)).not.toBeInTheDocument();
  });
});


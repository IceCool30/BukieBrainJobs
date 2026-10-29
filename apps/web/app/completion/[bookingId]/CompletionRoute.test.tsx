// apps/web/app/completion/[bookingId]/CompletionRoute.test.tsx
// Phase 4 RED: Route Integration Contracts (ROUTE-001 to ROUTE-010)
// Item 3.3 in master checklist: Post-Job Completion & Escrow Release (BW-009)

import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import * as authStorage from '../../../lib/auth/storage';
import {
  getCompletionRepository,
  resetCompletionRepository,
} from '../../../lib/completion/repository';
import type { PostJobCompletionState } from '../../../lib/completion/types';
import type { AuthUser } from '../../../lib/auth/types';
import CompletionPage from './page';

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
  usePathname: () => '/completion/bk-101',
}));

describe('BW-009 Post-Job Completion & Escrow Release Route Contracts (ROUTE-001 to ROUTE-010)', () => {
  const mockCustomer: AuthUser = {
    id: 'cust-101',
    name: 'Amara Kanu',
    role: 'customer',
    provider: 'phone',
    isBrainWorkerApproved: false,
  };

  const mockWorker: AuthUser = {
    id: 'work-202',
    name: 'Emeka Okafor',
    role: 'brainworker',
    provider: 'phone',
    isBrainWorkerApproved: true,
  };

  const mockThirdParty: AuthUser = {
    id: 'intruder-999',
    name: 'Random Visitor',
    role: 'customer',
    provider: 'phone',
    isBrainWorkerApproved: false,
  };

  const defaultParams = Promise.resolve({ bookingId: 'bk-101' });

  function createMockState(
    overrides?: Partial<PostJobCompletionState>
  ): PostJobCompletionState {
    const totalSettlementKobo = 6000000;
    return {
      bookingId: 'bk-101',
      customerId: 'cust-101',
      brainWorkerId: 'work-202',
      jobStatus: 'PENDING_COMPLETION',
      escrowStatus: 'ESCROW_HELD',
      baseQuoteKobo: 5000000,
      approvedAdjustmentKobo: 1000000,
      totalSettlementKobo,
      settlementBreakdown: {
        totalSettlementKobo,
        taskerPayoutKobo: 5400000,
        platformFeeKobo: 600000,
        platformFeeBps: 1000,
      },
      completionSubmittedAt: '2026-10-18T10:00:00.000Z',
      autoReleaseDeadline: '2026-10-21T10:00:00.000Z',
      isDisputed: false,
      ...overrides,
    };
  }

  beforeEach(() => {
    vi.clearAllMocks();
    resetCompletionRepository();
  });

  it('ROUTE-001: unauthenticated user renders unauthorized / sign-in prompt', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(null);

    render(<CompletionPage params={defaultParams} />);

    await waitFor(() => {
      expect(
        screen.getByText(/sign in|unauthorized|please log in/i)
      ).toBeInTheDocument();
    });
  });

  it('ROUTE-002: user without matching party authorization renders forbidden access message', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(
      mockThirdParty
    );
    const repo = getCompletionRepository();
    repo.seed([createMockState()]);

    render(<CompletionPage params={defaultParams} />);

    await waitFor(() => {
      expect(
        screen.getByText(/forbidden|not authorized|access denied/i)
      ).toBeInTheDocument();
    });
  });

  it('ROUTE-003: loading state rendered while booking and completion records resolve', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(
      mockCustomer
    );
    let resolveParams: (val: { bookingId: string }) => void;
    const delayedParams = new Promise<{ bookingId: string }>((resolve) => {
      resolveParams = resolve;
    });

    render(<CompletionPage params={delayedParams} />);

    expect(
      screen.getByText(/loading completion details|loading/i)
    ).toBeInTheDocument();

    resolveParams!({ bookingId: 'bk-101' });
  });

  it('ROUTE-004: error boundary rendered when booking is not found', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(
      mockCustomer
    );
    const repo = getCompletionRepository();
    repo.clear();

    render(
      <CompletionPage
        params={Promise.resolve({ bookingId: 'non-existent-booking' })}
      />
    );

    await waitFor(() => {
      expect(
        screen.getByText(/booking not found|completion record not found/i)
      ).toBeInTheDocument();
    });
  });

  it('ROUTE-005: customer view renders CompletionInspectionSummary, EscrowReleaseActions, and AutoReleaseCountdownCard', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(
      mockCustomer
    );
    const repo = getCompletionRepository();
    repo.seed([createMockState()]);

    render(<CompletionPage params={defaultParams} />);

    await waitFor(() => {
      expect(
        screen.getByTestId('completion-inspection-summary')
      ).toBeInTheDocument();
      expect(
        screen.getByRole('heading', { level: 1, name: /Job Settlement Inspection/i })
      ).toBeInTheDocument();
      expect(screen.getByTestId('escrow-release-actions')).toBeInTheDocument();
      expect(
        screen.getByTestId('auto-release-countdown-card')
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /inspect & release escrow/i })
      ).toBeInTheDocument();
    });
  });

  it('ROUTE-006: BrainWorker view displays settlement summary and countdown card, but suppresses customer release actions', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(
      mockWorker
    );
    const repo = getCompletionRepository();
    repo.seed([createMockState()]);

    render(<CompletionPage params={defaultParams} />);

    await waitFor(() => {
      expect(
        screen.getByTestId('completion-inspection-summary')
      ).toBeInTheDocument();
      expect(
        screen.getByTestId('auto-release-countdown-card')
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: /inspect & release escrow/i })
      ).not.toBeInTheDocument();
    });
  });

  it('ROUTE-007: customer clicking "Inspect & Release Escrow" triggers confirmation and transitions display to completed state', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(
      mockCustomer
    );
    const repo = getCompletionRepository();
    repo.seed([createMockState()]);

    render(<CompletionPage params={defaultParams} />);

    const releaseButton = await screen.findByRole('button', {
      name: /inspect & release escrow/i,
    });
    fireEvent.click(releaseButton);

    await waitFor(() => {
      expect(screen.getByText(/completed|escrow released/i)).toBeInTheDocument();
    });
  });

  it('ROUTE-008: dispute trigger opens DisputeInitiationModal and successful submission freezes countdown card with dispute badge', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(
      mockCustomer
    );
    const repo = getCompletionRepository();
    repo.seed([createMockState()]);

    render(<CompletionPage params={defaultParams} />);

    const disputeButton = await screen.findByRole('button', {
      name: /raise dispute/i,
    });
    fireEvent.click(disputeButton);

    expect(
      screen.getByRole('heading', { name: /raise dispute/i })
    ).toBeInTheDocument();

    const reasonSelect = screen.getByRole('combobox', {
      name: /dispute reason|reason/i,
    });
    const detailsInput = screen.getByRole('textbox', {
      name: /dispute details|description/i,
    });

    fireEvent.change(reasonSelect, { target: { value: 'INCOMPLETE_WORK' } });
    fireEvent.change(detailsInput, {
      target: { value: 'Artisan left electrical conduit exposed' },
    });

    const submitDispute = screen.getByRole('button', {
      name: /submit dispute|freeze escrow/i,
    });
    fireEvent.click(submitDispute);

    await waitFor(() => {
      expect(
        screen.getByText(/dispute active|escrow frozen/i)
      ).toBeInTheDocument();
    });
  });

  it('ROUTE-009: shows MutualBlindReviewForm and renders masked state when one review is submitted', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(
      mockCustomer
    );
    const repo = getCompletionRepository();
    repo.seed([
      createMockState({
        customerReview: {
          reviewId: 'rev-c-1',
          bookingId: 'bk-101',
          reviewerId: 'cust-101',
          reviewerRole: 'customer',
          ratings: {
            punctuality: 5,
            quality: 5,
            communication: 5,
            overall: 5,
            comment: 'Great craftsmanship',
          },
          submittedAt: '2026-10-18T11:00:00.000Z',
        },
      }),
    ]);

    render(<CompletionPage params={defaultParams} />);

    await waitFor(() => {
      expect(
        screen.getByText(
          /waiting for counterparty|ratings hidden until both parties review/i
        )
      ).toBeInTheDocument();
    });
  });

  it('ROUTE-010: unmasks and displays both reviews when status is MUTUAL_REVEALED', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(
      mockCustomer
    );
    const repo = getCompletionRepository();
    repo.seed([
      createMockState({
        customerReview: {
          reviewId: 'rev-c-1',
          bookingId: 'bk-101',
          reviewerId: 'cust-101',
          reviewerRole: 'customer',
          ratings: {
            punctuality: 5,
            quality: 5,
            communication: 5,
            overall: 5,
            comment: 'Great craftsmanship and prompt delivery',
          },
          submittedAt: '2026-10-18T11:00:00.000Z',
        },
        workerReview: {
          reviewId: 'rev-w-1',
          bookingId: 'bk-101',
          reviewerId: 'work-202',
          reviewerRole: 'brainworker',
          ratings: {
            punctuality: 5,
            quality: 4,
            communication: 5,
            overall: 5,
            comment: 'Pleasant and cooperative customer',
          },
          submittedAt: '2026-10-18T11:30:00.000Z',
        },
      }),
    ]);

    render(<CompletionPage params={defaultParams} />);

    await waitFor(() => {
      expect(
        screen.getByText(/Mutual Reviews Revealed|Mutual Feedback Unlocked/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Great craftsmanship and prompt delivery/)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Pleasant and cooperative customer/)
      ).toBeInTheDocument();
    });
  });
});

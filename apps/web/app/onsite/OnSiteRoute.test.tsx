// apps/web/app/onsite/OnSiteRoute.test.tsx
// Phase 4 RED: Route Integration Contracts (ROUTE-001 to ROUTE-010)
// Item 3.2 in master checklist: On-Site Work & In-Progress Verification (BW-008)

import * as fs from 'fs';
import * as path from 'path';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import * as authStorage from '../../lib/auth/storage';
import {
  getOnSiteRepository,
  resetOnSiteRepository,
} from '../../lib/onsite/repository';
import type {
  OnSiteVerificationState,
  ScopeAdjustmentRequest,
} from '../../lib/onsite/types';
import type { AuthUser } from '../../lib/auth/types';
import OnSitePage from './[bookingId]/page';

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
  usePathname: () => '/onsite/bk-101',
}));

describe('BW-008 On-Site Work & In-Progress Verification Route Contracts (ROUTE-001 to ROUTE-010)', () => {
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

  const defaultParams = Promise.resolve({ bookingId: 'bk-101' });

  function createMockState(
    overrides?: Partial<OnSiteVerificationState>
  ): OnSiteVerificationState {
    return {
      bookingId: 'bk-101',
      jobStatus: 'CONFIRMED',
      escrowStatus: 'ESCROW_HELD',
      scopeAdjustments: [],
      baseQuoteKobo: 5000000,
      approvedAdjustmentKobo: 0,
      totalSettlementKobo: 5000000,
      ...overrides,
    };
  }

  beforeEach(() => {
    vi.clearAllMocks();
    resetOnSiteRepository();
  });

  it('ROUTE-001: unauthenticated visitor accessing /onsite/bk-101 redirects to /login?redirect=/onsite/bk-101 without querying repository', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(null);
    const repo = getOnSiteRepository();
    const getStateSpy = vi.spyOn(repo, 'getOnSiteState');

    render(<OnSitePage params={defaultParams} />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(
        '/login?redirect=/onsite/bk-101'
      );
    });
    expect(getStateSpy).not.toHaveBeenCalled();
  });

  it('ROUTE-002: authenticated customer accessing /onsite/bk-101 with no pending scope adjustment renders OnSiteStatusBanner and arrival status', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(
      mockCustomer
    );
    const repo = getOnSiteRepository();
    await repo.initOnSiteState(
      createMockState({
        jobStatus: 'IN_PROGRESS',
        checkedInAt: '2026-10-18T10:30:00.000Z',
      })
    );

    render(<OnSitePage params={defaultParams} />);

    expect(await screen.findByText(/In Progress/i)).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /On-Site Work & Verification/i,
      })
    ).toBeInTheDocument();
    expect(screen.getByText(/Arrived at/i)).toBeInTheDocument();
    expect(
      screen.queryByText(/On-Site Scope Adjustment Request/i)
    ).not.toBeInTheDocument();
  });

  it('ROUTE-003: authenticated customer accessing /onsite/bk-101 with an active PENDING adjustment mounts CustomerScopeReviewCard', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(
      mockCustomer
    );
    const repo = getOnSiteRepository();
    const pendingAdjustment: ScopeAdjustmentRequest = {
      id: 'adj_001',
      bookingId: 'bk-101',
      category: 'ADDITIONAL_PARTS',
      description: 'Replaced burst copper pressure pipe',
      additionalLaborKobo: 500000,
      additionalMaterialsKobo: 2000000,
      totalAdditionalKobo: 2500000,
      status: 'PENDING',
      requestedAt: '2026-10-18T10:35:00.000Z',
    };

    await repo.initOnSiteState(
      createMockState({
        jobStatus: 'IN_PROGRESS',
        checkedInAt: '2026-10-18T10:30:00.000Z',
        activeScopeAdjustment: pendingAdjustment,
        scopeAdjustments: [pendingAdjustment],
      })
    );

    render(<OnSitePage params={defaultParams} />);

    expect(
      await screen.findByText(/On-Site Scope Adjustment Request/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /approve adjustment/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /decline adjustment/i })
    ).toBeInTheDocument();
  });

  it('ROUTE-004: authenticated BrainWorker accessing /onsite/bk-101 when booking is CONFIRMED mounts CheckInPanel', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(
      mockWorker
    );
    const repo = getOnSiteRepository();
    await repo.initOnSiteState(
      createMockState({
        jobStatus: 'CONFIRMED',
      })
    );

    render(<OnSitePage params={defaultParams} />);

    expect(
      await screen.findByRole('button', {
        name: /check in at customer location/i,
      })
    ).toBeInTheDocument();
  });

  it('ROUTE-005: authenticated BrainWorker accessing /onsite/bk-101 when booking is IN_PROGRESS renders controls to request scope adjustments and submit completion', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(
      mockWorker
    );
    const repo = getOnSiteRepository();
    await repo.initOnSiteState(
      createMockState({
        jobStatus: 'IN_PROGRESS',
        checkedInAt: '2026-10-18T10:30:00.000Z',
      })
    );

    render(<OnSitePage params={defaultParams} />);

    expect(
      await screen.findByRole('button', { name: /request scope adjustment/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /submit work completion/i })
    ).toBeInTheDocument();
  });

  it('ROUTE-006: non-existent booking ID displays graceful error state (Booking on-site session not found)', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(
      mockCustomer
    );
    const missingParams = Promise.resolve({ bookingId: 'nonexistent-bk' });

    render(<OnSitePage params={missingParams} />);

    expect(
      await screen.findByText(/Booking on-site session not found/i)
    ).toBeInTheDocument();
  });

  it('ROUTE-007: BrainWorker check-in action delegates to repository.recordCheckIn and transitions route view to IN_PROGRESS', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(
      mockWorker
    );
    const repo = getOnSiteRepository();
    await repo.initOnSiteState(
      createMockState({
        jobStatus: 'CONFIRMED',
      })
    );
    const checkInSpy = vi.spyOn(repo, 'recordCheckIn');

    render(<OnSitePage params={defaultParams} />);

    const checkInButton = await screen.findByRole('button', {
      name: /check in at customer location/i,
    });
    fireEvent.click(checkInButton);

    await waitFor(() => {
      expect(checkInSpy).toHaveBeenCalledWith(
        'bk-101',
        expect.objectContaining({
          coordinates: expect.objectContaining({
            latitude: expect.any(Number),
            longitude: expect.any(Number),
          }),
        })
      );
    });
  });

  it('ROUTE-008: Customer clicking Approve Adjustment delegates to repository.respondToScopeAdjustment(..., APPROVE) and refreshes total settlement', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(
      mockCustomer
    );
    const repo = getOnSiteRepository();
    const pendingAdjustment: ScopeAdjustmentRequest = {
      id: 'adj_001',
      bookingId: 'bk-101',
      category: 'ADDITIONAL_PARTS',
      description: 'Replaced burst copper pressure pipe',
      additionalLaborKobo: 500000,
      additionalMaterialsKobo: 2000000,
      totalAdditionalKobo: 2500000,
      status: 'PENDING',
      requestedAt: '2026-10-18T10:35:00.000Z',
    };

    await repo.initOnSiteState(
      createMockState({
        jobStatus: 'IN_PROGRESS',
        checkedInAt: '2026-10-18T10:30:00.000Z',
        activeScopeAdjustment: pendingAdjustment,
        scopeAdjustments: [pendingAdjustment],
      })
    );
    const respondSpy = vi.spyOn(repo, 'respondToScopeAdjustment');

    render(<OnSitePage params={defaultParams} />);

    const approveButton = await screen.findByRole('button', {
      name: /approve adjustment/i,
    });
    fireEvent.click(approveButton);

    await waitFor(() => {
      expect(respondSpy).toHaveBeenCalledWith(
        'bk-101',
        'adj_001',
        'APPROVE',
        undefined,
        expect.any(String)
      );
    });
  });

  it('ROUTE-009: BrainWorker submitting completion delegates to repository.submitCompletion and transitions view to PENDING_COMPLETION', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(
      mockWorker
    );
    const repo = getOnSiteRepository();
    await repo.initOnSiteState(
      createMockState({
        jobStatus: 'IN_PROGRESS',
        checkedInAt: '2026-10-18T10:30:00.000Z',
      })
    );
    const submitCompletionSpy = vi.spyOn(repo, 'submitCompletion');

    render(<OnSitePage params={defaultParams} />);

    const photoInput = await screen.findByRole('textbox', {
      name: /photo proof url/i,
    });
    const addPhotoButton = screen.getByRole('button', { name: /add photo/i });
    const noteInput = screen.getByRole('textbox', {
      name: /completion summary note/i,
    });

    fireEvent.change(photoInput, {
      target: { value: 'https://cdn.bukiebrainjobs.com/proof/1.jpg' },
    });
    fireEvent.click(addPhotoButton);

    fireEvent.change(noteInput, {
      target: { value: 'Work finished and thoroughly verified' },
    });

    const submitBtn = screen.getByRole('button', {
      name: /submit work completion/i,
    });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(submitCompletionSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          bookingId: 'bk-101',
          photoProofUrls: ['https://cdn.bukiebrainjobs.com/proof/1.jpg'],
          summaryNote: 'Work finished and thoroughly verified',
        })
      );
    });
  });

  it('ROUTE-010: SSR mount safety and production boundary audit renders via renderToString without throwing and verifies page.tsx contains zero imports from testing/', async () => {
    const { renderToString } = await import('react-dom/server');

    let markup = '';
    expect(() => {
      markup = renderToString(<OnSitePage params={defaultParams} />);
    }).not.toThrow();

    expect(markup).toBeDefined();

    // Verify physical boundary: page.tsx does not import from testing/
    const pagePath = path.join(__dirname, '[bookingId]', 'page.tsx');
    const pageSource = fs.readFileSync(pagePath, 'utf8');
    expect(pageSource).not.toMatch(/from ['"][^'"]*testing[^'"]*['"]/);
  });
});

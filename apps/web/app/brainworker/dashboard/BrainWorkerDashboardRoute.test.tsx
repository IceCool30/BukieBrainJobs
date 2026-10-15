// apps/web/app/brainworker/dashboard/BrainWorkerDashboardRoute.test.tsx
// Phase 4 RED: BrainWorker Operating Dashboard Route Integration & Security Contracts (ROUT-001 to ROUT-010)
// Authoritative References:
// - docs/specs/BW-004-booking-management.md
// - docs/specs/BW-002-service-catalog-availability.md
// - Item 2.2 in master checklist: BrainWorker Operating Dashboard
// Scope boundary: Route integration, security gates, live feed aggregation, and zero financial contamination.

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import * as authStorage from '../../../lib/auth/storage';
import * as operationsRepoModule from '../../../lib/brainworker/catalog/repository';
import * as dashboardServiceModule from '../../../lib/brainworker/dashboard/service';
import type { IBrainWorkerOperationsRepository } from '../../../lib/brainworker/catalog/types';
import type {
  BrainWorkerDashboardFeed,
  BrainWorkerDashboardService,
} from '../../../lib/brainworker/dashboard/types';
import {
  FIXTURE_OPERATIONAL_PROFILE_A,
  FIXTURE_AVAILABILITY_A,
  mockApprovedWorkerA,
  mockCustomerUser,
  mockUnapprovedWorker,
} from '../../../lib/brainworker/catalog/testing';

// Route Component Under Test
import BrainWorkerDashboardPage from './page';

// Mock Next.js Navigation
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
  usePathname: () => '/brainworker/dashboard',
}));

describe('BrainWorker Operating Dashboard Route Contracts (ROUT-001 to ROUT-010)', () => {
  let mockOperationsRepo: IBrainWorkerOperationsRepository;
  let mockDashboardService: BrainWorkerDashboardService;

  const mockFeed: BrainWorkerDashboardFeed = {
    metrics: {
      todayBookingsCount: 3,
      nextScheduledStartAt: '2026-10-15T10:00:00Z',
      activeJobsCount: 1,
      activeJobId: 'booking-active-123',
      pendingQuotesCount: 2,
      completedJobsCount: 14,
      clientRating: 4.9,
    },
    urgentLeads: [
      {
        id: 'lead-urgent-1',
        title: 'Emergency Generator Repair',
        tradeCategory: 'Generator Repair',
        urgency: 'EMERGENCY',
        locationArea: 'Lekki Phase 1',
        postedAt: '2026-10-15T08:00:00Z',
      },
    ],
    operationalStatus: {
      isComplete: true,
      isAvailable: true,
      isEmergencyAvailable: false,
      primaryTradeName: 'Generator Repair',
    },
    lastRefreshedAt: '2026-10-15T09:00:00Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockOperationsRepo = {
      getOperationalProfile: vi.fn().mockResolvedValue(FIXTURE_OPERATIONAL_PROFILE_A),
      getServiceCatalog: vi.fn(),
      saveServiceCatalog: vi.fn(),
      getAvailability: vi.fn().mockResolvedValue(FIXTURE_AVAILABILITY_A),
      saveAvailability: vi.fn().mockResolvedValue({
        ...FIXTURE_AVAILABILITY_A,
        isAvailable: false,
      }),
      getCoverage: vi.fn(),
      saveCoverage: vi.fn(),
      getMatchingHydrationProfile: vi.fn(),
    };

    mockDashboardService = {
      getDashboardFeed: vi.fn().mockResolvedValue(mockFeed),
    };

    vi.spyOn(operationsRepoModule, 'getBrainWorkerOperationsRepository').mockReturnValue(
      mockOperationsRepo
    );
    vi.spyOn(dashboardServiceModule, 'getBrainWorkerDashboardService').mockReturnValue(
      mockDashboardService
    );
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(null);
  });

  // ===========================================================================
  // ROUT-001: Unauthenticated Guard
  // ===========================================================================
  it('ROUT-001: unauthenticated visitor redirects to /login?redirect=/brainworker/dashboard without fetching feed or profile', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(null);

    render(<BrainWorkerDashboardPage />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(
        expect.stringMatching(/\/login\?redirect=.*brainworker.*dashboard/)
      );
    });
    expect(mockDashboardService.getDashboardFeed).not.toHaveBeenCalled();
    expect(mockOperationsRepo.getOperationalProfile).not.toHaveBeenCalled();
  });

  // ===========================================================================
  // ROUT-002: Customer Role Guard
  // ===========================================================================
  it('ROUT-002: customer account renders fail-closed unauthorized card without querying feed', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockCustomerUser);

    render(<BrainWorkerDashboardPage />);

    expect(screen.getByText('Customer Account Detected')).toBeInTheDocument();
    expect(screen.getByText('Access Restricted')).toBeInTheDocument();
    expect(mockDashboardService.getDashboardFeed).not.toHaveBeenCalled();
    expect(mockOperationsRepo.getOperationalProfile).not.toHaveBeenCalled();
  });

  // ===========================================================================
  // ROUT-003: Unapproved Provider Guard
  // ===========================================================================
  it('ROUT-003: unapproved BrainWorker redirects to /brainworker/verification-status without querying feed', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockUnapprovedWorker);

    render(<BrainWorkerDashboardPage />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/brainworker/verification-status');
    });
    expect(mockDashboardService.getDashboardFeed).not.toHaveBeenCalled();
    expect(mockOperationsRepo.getOperationalProfile).not.toHaveBeenCalled();
  });

  // ===========================================================================
  // ROUT-004: Live Feed Fetch for Approved Provider
  // ===========================================================================
  it('ROUT-004: approved BrainWorker with complete profile fetches live dashboard feed via service', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockApprovedWorkerA);

    render(<BrainWorkerDashboardPage />);

    await waitFor(() => {
      expect(mockDashboardService.getDashboardFeed).toHaveBeenCalledWith(mockApprovedWorkerA.id);
    });
  });

  // ===========================================================================
  // ROUT-005: Live Operational Metrics Rendering
  // ===========================================================================
  it('ROUT-005: renders live operational metrics from aggregated feed', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockApprovedWorkerA);

    render(<BrainWorkerDashboardPage />);

    await waitFor(() => {
      expect(screen.getByTestId('metric-today-bookings')).toHaveTextContent('3');
      expect(screen.getByTestId('metric-active-jobs')).toHaveTextContent('1');
      expect(screen.getByTestId('metric-pending-quotes')).toHaveTextContent('2');
      expect(screen.getByTestId('metric-completed-jobs')).toHaveTextContent('14');
    });
  });

  // ===========================================================================
  // ROUT-006: View Active Job Deep-Link
  // ===========================================================================
  it('ROUT-006: clicking View Active Job triggers navigation to /brainworker/bookings/[activeJobId]', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockApprovedWorkerA);

    render(<BrainWorkerDashboardPage />);

    const viewActiveJobBtn = await screen.findByRole('button', { name: /view active job/i });
    fireEvent.click(viewActiveJobBtn);

    expect(mockPush).toHaveBeenCalledWith('/brainworker/bookings/booking-active-123');
  });

  // ===========================================================================
  // ROUT-007: Review Leads Navigation
  // ===========================================================================
  it('ROUT-007: clicking Review Leads triggers navigation to /brainworker/leads', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockApprovedWorkerA);

    render(<BrainWorkerDashboardPage />);

    const reviewLeadsBtn = await screen.findByRole('button', { name: /review leads/i });
    fireEvent.click(reviewLeadsBtn);

    expect(mockPush).toHaveBeenCalledWith('/brainworker/leads');
  });

  // ===========================================================================
  // ROUT-008: Preserves Duty Toggle Switch
  // ===========================================================================
  it('ROUT-008: preserves duty toggle switch, updating provider availability via repository', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockApprovedWorkerA);
    vi.mocked(mockOperationsRepo.getOperationalProfile).mockResolvedValue({
      ...FIXTURE_OPERATIONAL_PROFILE_A,
      isComplete: true,
      availability: { ...FIXTURE_AVAILABILITY_A, isAvailable: true },
    });

    render(<BrainWorkerDashboardPage />);

    const dutyToggle = await screen.findByRole('switch', { name: /dispatch duty/i });
    fireEvent.click(dutyToggle);

    await waitFor(() => {
      expect(mockOperationsRepo.saveAvailability).toHaveBeenCalledWith(
        mockApprovedWorkerA.id,
        expect.objectContaining({ isAvailable: false })
      );
    });
  });

  // ===========================================================================
  // ROUT-009: Setup Incomplete Banner
  // ===========================================================================
  it('ROUT-009: displays Setup Incomplete banner when operationalProfile is incomplete', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockApprovedWorkerA);
    vi.mocked(mockOperationsRepo.getOperationalProfile).mockResolvedValue({
      ...FIXTURE_OPERATIONAL_PROFILE_A,
      isComplete: false,
    });

    render(<BrainWorkerDashboardPage />);

    expect(
      await screen.findByText(/complete your provider setup/i)
    ).toBeInTheDocument();
    const servicesLink = screen.getByRole('link', { name: /configure services/i });
    const availabilityLink = screen.getByRole('link', { name: /set hours/i });
    expect(servicesLink.getAttribute('href')).toBe('/brainworker/services');
    expect(availabilityLink.getAttribute('href')).toBe('/brainworker/availability');
  });

  // ===========================================================================
  // ROUT-010: Financial Decoupling Boundary
  // ===========================================================================
  it('ROUT-010: financial decoupling: strictly zero wallet balances, escrow accounts, or NGN values rendered', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockApprovedWorkerA);

    render(<BrainWorkerDashboardPage />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /brainworker operating dashboard/i })).toBeInTheDocument();
    });

    expect(screen.queryAllByText(/₦|NGN|total earnings|escrow released/i)).toHaveLength(0);
  });
});

// apps/web/app/brainworker/BrainWorkerBookingsRoute.test.tsx
// Phase 8 RED: BrainWorker Bookings Route Integration & Security Contracts (INT-001 to INT-011)
// Authoritative References:
// - docs/specs/BW-004-booking-management.md (v1.0, Sections 2, 4, 5, 11, 12, 13)
// - docs/specs/BW-004-architecture-contract.md (v0.2, Sections 2, 5, 6, 13, 14)
// - docs/specs/BW-004-test-first-implementation-plan.md (v1.0, Phase 8: INT-001 to INT-011)
// Scope boundary: Route integration, role and approval guards, completeness gating, tenant isolation, parameter validation, and layout integration.
// No payment, escrow, or wallet mutations. No customer-side decision authority simulation.

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import * as authStorage from '../../lib/auth/storage';
import * as bookingsRepoModule from '../../lib/brainworker/bookings/repository';
import * as operationsRepoModule from '../../lib/brainworker/catalog/repository';
import type {
  IBrainWorkerBookingsRepository,
  BookingPage,
  ProviderBookingDetail,
} from '../../lib/brainworker/bookings/types';
import { ForbiddenTenantAccessError } from '../../lib/brainworker/bookings/types';
import type { IBrainWorkerOperationsRepository } from '../../lib/brainworker/catalog/types';
import {
  projectBookingSummary,
  projectBookingDetail,
} from '../../lib/brainworker/bookings/domain';
import {
  mockApprovedWorkerA,
  mockCustomerUser,
  mockUnapprovedWorker,
  mockIncompleteWorker,
  bookingOwnedByA,
} from '../../lib/brainworker/bookings/testing';
import { FIXTURE_OPERATIONAL_PROFILE_A } from '../../lib/brainworker/catalog/testing';
import * as fs from 'fs';
import * as path from 'path';

// Route Component Imports
import BrainWorkerBookingsPage from './bookings/page';
import BrainWorkerBookingDetailPage from './bookings/[bookingId]/page';
import BrainWorkerDashboardPage from './dashboard/page';

// Mock Navigation & Next.js Hooks
const mockPush = vi.fn();
const mockReplace = vi.fn();
let mockParams: Record<string, string> = { bookingId: 'booking-a-001' };

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/brainworker/bookings',
  useParams: () => mockParams,
}));

vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...props} />
  ),
}));

describe('BW-004 Phase 8: BrainWorker Bookings Route Integration & Security Contracts (INT-001 to INT-011)', () => {
  let mockOperationsRepo: IBrainWorkerOperationsRepository;
  let mockBookingsRepo: IBrainWorkerBookingsRepository;

  const sampleRawA = bookingOwnedByA();
  const mockPopulatedBookingPage: BookingPage = {
    items: [projectBookingSummary(sampleRawA)],
  };
  const mockPopulatedDetailA: ProviderBookingDetail = projectBookingDetail(sampleRawA);

  beforeEach(() => {
    vi.clearAllMocks();
    mockParams = { bookingId: 'booking-a-001' };

    mockOperationsRepo = {
      getOperationalProfile: vi.fn().mockResolvedValue(FIXTURE_OPERATIONAL_PROFILE_A),
      getServiceCatalog: vi.fn(),
      saveServiceCatalog: vi.fn(),
      getAvailability: vi.fn(),
      saveAvailability: vi.fn(),
      getCoverage: vi.fn(),
      saveCoverage: vi.fn(),
      getMatchingHydrationProfile: vi.fn(),
    };

    mockBookingsRepo = {
      getBookings: vi.fn().mockResolvedValue(mockPopulatedBookingPage),
      getBooking: vi.fn().mockResolvedValue(mockPopulatedDetailA),
      updateDispatchStatus: vi.fn(),
      checkIn: vi.fn(),
      requestScopeAdjustment: vi.fn(),
      withdrawScopeAdjustment: vi.fn(),
      cancelBooking: vi.fn(),
      subscribe: vi.fn().mockReturnValue(() => {}),
    };

    vi.spyOn(operationsRepoModule, 'getBrainWorkerOperationsRepository').mockReturnValue(
      mockOperationsRepo
    );
    vi.spyOn(bookingsRepoModule, 'getBrainWorkerBookingsRepository').mockReturnValue(
      mockBookingsRepo
    );
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(null);
  });

  // ===========================================================================
  // INT-001: Unauthenticated Visitor Guard
  // ===========================================================================
  it('INT-001: unauthenticated visitor accessing /brainworker/bookings redirects to /login without triggering repository reads', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(null);

    render(<BrainWorkerBookingsPage />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(
        expect.stringMatching(/\/login\?redirect=.*brainworker.*bookings/)
      );
    });
    expect(mockBookingsRepo.getBookings).not.toHaveBeenCalled();
    expect(mockOperationsRepo.getOperationalProfile).not.toHaveBeenCalled();
  });

  // ===========================================================================
  // INT-002: Customer Fail-Closed Boundary
  // ===========================================================================
  it('INT-002: authenticated customer accessing /brainworker/bookings fails closed without repository queries', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockCustomerUser);

    render(<BrainWorkerBookingsPage />);

    expect(
      screen.getByText('Customer Account Detected')
    ).toBeInTheDocument();
    expect(mockBookingsRepo.getBookings).not.toHaveBeenCalled();
    expect(mockOperationsRepo.getOperationalProfile).not.toHaveBeenCalled();
  });

  // ===========================================================================
  // INT-003: Unapproved BrainWorker Guard
  // ===========================================================================
  it('INT-003: unapproved BrainWorker accessing /brainworker/bookings redirects to /brainworker/verification-status', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockUnapprovedWorker);

    render(<BrainWorkerBookingsPage />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/brainworker/verification-status');
    });
    expect(mockBookingsRepo.getBookings).not.toHaveBeenCalled();
    expect(mockOperationsRepo.getOperationalProfile).not.toHaveBeenCalled();
  });

  // ===========================================================================
  // INT-004: Incomplete Provider Setup Gate
  // ===========================================================================
  it('INT-004: incomplete provider setup gate blocks bookings feed and renders setup prompt with links to services and availability', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockIncompleteWorker);
    vi.mocked(mockOperationsRepo.getOperationalProfile).mockResolvedValue({
      ...FIXTURE_OPERATIONAL_PROFILE_A,
      isComplete: false,
    });

    render(<BrainWorkerBookingsPage />);

    expect(
      await screen.findByText(/complete your provider setup|setup required|complete setup/i)
    ).toBeInTheDocument();
    const setupPrompt = within(screen.getByRole('region', { name: /provider setup required/i }));
    const servicesLink = setupPrompt.getByRole('link', { name: /configure services|services & rates/i });
    const availabilityLink = setupPrompt.getByRole('link', { name: /set hours|hours & coverage|availability/i });
    expect(servicesLink.getAttribute('href')).toBe('/brainworker/services');
    expect(availabilityLink.getAttribute('href')).toBe('/brainworker/availability');
    expect(mockBookingsRepo.getBookings).not.toHaveBeenCalled();
  });

  // ===========================================================================
  // INT-005: Approved Complete Provider Workspace Load
  // ===========================================================================
  it('INT-005: approved and complete BrainWorker loads /brainworker/bookings and renders production BookingsListView workspace', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockApprovedWorkerA);
    vi.mocked(mockOperationsRepo.getOperationalProfile).mockResolvedValue(FIXTURE_OPERATIONAL_PROFILE_A);

    render(<BrainWorkerBookingsPage />);

    expect(await screen.findByRole('heading', { name: /bookings|my bookings|confirmed bookings/i })).toBeInTheDocument();
    expect(await screen.findByText('Generator Maintenance and Carburetor Tuning')).toBeInTheDocument();
    expect(
      screen.getAllByRole('heading', { level: 1 }).map((heading) => heading.textContent?.trim())
    ).toEqual(['My Bookings']);
    expect(
      screen.getByRole('heading', { level: 2, name: 'Operational Dispatch Sheet' })
    ).toBeInTheDocument();
  });

  // ==========================================================================
  // INT-006: Session-Bound Repository Isolation
  // ===========================================================================
  it('INT-006: authenticated session ID is strictly bound to repository queries, preventing cross-tenant access', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockApprovedWorkerA);
    vi.mocked(mockOperationsRepo.getOperationalProfile).mockResolvedValue(FIXTURE_OPERATIONAL_PROFILE_A);

    render(<BrainWorkerBookingsPage />);

    await waitFor(() => {
      expect(mockBookingsRepo.getBookings).toHaveBeenCalledWith(
        mockApprovedWorkerA.id
      );
    });
  });

  // ===========================================================================
  // INT-007: bookingId Route Parameter Validated and Never Trusted for Ownership
  // ===========================================================================
  it('INT-007: bookingId route parameter validated and never trusted for ownership', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockApprovedWorkerA);
    vi.mocked(mockOperationsRepo.getOperationalProfile).mockResolvedValue(FIXTURE_OPERATIONAL_PROFILE_A);
    mockParams = { bookingId: 'booking-b-001' };

    vi.mocked(mockBookingsRepo.getBooking).mockRejectedValue(
      new ForbiddenTenantAccessError('FORBIDDEN_TENANT_ACCESS: Caller does not own booking')
    );

    render(
      <BrainWorkerBookingDetailPage
        params={Promise.resolve({ bookingId: 'booking-b-001' })}
      />
    );

    expect(
      await screen.findByText(/booking not found|access restricted|unauthorized|forbidden/i)
    ).toBeInTheDocument();
    expect(screen.queryByText(/Plot 42, 3rd Avenue/i)).not.toBeInTheDocument();
  });

  // ===========================================================================
  // INT-008: Static Prerendering and SSR Mount Safety
  // ===========================================================================
  it('INT-008: static prerendering and SSR mount safety renders production shell structure without SSR errors', async () => {
    const { renderToString } = await import('react-dom/server');
    let listMarkup = '';
    let detailMarkup = '';

    expect(() => {
      listMarkup = renderToString(<BrainWorkerBookingsPage />);
    }).not.toThrow();
    expect(listMarkup).toContain('BukieBrainJobs');

    expect(() => {
      detailMarkup = renderToString(
        <BrainWorkerBookingDetailPage
          params={Promise.resolve({ bookingId: 'booking-a-001' })}
        />
      );
    }).not.toThrow();
    expect(detailMarkup).toContain('BukieBrainJobs');
  });

  // ===========================================================================
  // INT-009: Physical Testing Boundary & Component Integration
  // ===========================================================================
  it('INT-009: production route source files preserve physical testing boundary and integrate production components', () => {
    const bookingsPagePath = path.join(__dirname, 'bookings', 'page.tsx');
    const detailPagePath = path.join(__dirname, 'bookings', '[bookingId]', 'page.tsx');

    const listSource = fs.readFileSync(bookingsPagePath, 'utf8');
    const detailSource = fs.readFileSync(detailPagePath, 'utf8');

    // Physical testing boundary
    expect(listSource).not.toMatch(/from ['"][^'"]*testing[^'"]*['"]/);
    expect(listSource).not.toMatch(/test fixtures/i);
    expect(detailSource).not.toMatch(/from ['"][^'"]*testing[^'"]*['"]/);
    expect(detailSource).not.toMatch(/test fixtures/i);

    // Component integration
    expect(listSource).toMatch(/BookingsListView/);
    expect(detailSource).toMatch(/BookingDetailView/);
  });

  // ===========================================================================
  // INT-010: Dashboard Navigation Link
  // ===========================================================================
  it('INT-010: dashboard navigation links reach /brainworker/bookings for quick provider access without booking authority', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockApprovedWorkerA);
    vi.mocked(mockOperationsRepo.getOperationalProfile).mockResolvedValue(FIXTURE_OPERATIONAL_PROFILE_A);

    render(<BrainWorkerDashboardPage />);

    const bookingsLink = await screen.findByRole('link', {
      name: /view bookings|manage bookings|confirmed bookings|bookings/i,
    });
    expect(bookingsLink.getAttribute('href')).toBe('/brainworker/bookings');
  });

  // ===========================================================================
  // INT-011: Route Privacy Projection
  // ===========================================================================
  it('INT-011: no private customer credentials reach the rendered projection at the route boundary', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockApprovedWorkerA);
    vi.mocked(mockOperationsRepo.getOperationalProfile).mockResolvedValue(FIXTURE_OPERATIONAL_PROFILE_A);

    render(<BrainWorkerBookingsPage />);

    await screen.findByText('Generator Maintenance and Carburetor Tuning');

    // Customer private details must never leak into rendered projection
    expect(screen.queryByText(/Adeleke/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/\+2348000000000|08012345678/)).not.toBeInTheDocument();
    expect(screen.queryByText(/customer@example.com/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Plot 42, 3rd Avenue, Gwarinpa, Abuja/i)).not.toBeInTheDocument();
  });
});

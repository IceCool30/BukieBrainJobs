// apps/web/app/brainworker/BrainWorkerOperationsRoutes.test.tsx
// BW-002 Suite 7 RED: BrainWorker Route Integration & Dashboard Contracts (INT-001 to INT-010)

import React from 'react';
import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as authStorage from '../../lib/auth/storage';
import * as operationsRepoModule from '../../lib/brainworker/catalog/repository';
import * as onboardingRepoModule from '../../lib/brainworker/repository';
import type { IBrainWorkerOperationsRepository } from '../../lib/brainworker/catalog/types';
import type { IBrainWorkerOnboardingRepository } from '../../lib/brainworker/types';
import ServicesPage from './services/page';
import AvailabilityPage from './availability/page';
import DashboardPage from './dashboard/page';
import {
  FIXTURE_OPERATIONAL_PROFILE_A,
  FIXTURE_SERVICE_CATALOG_A,
  FIXTURE_AVAILABILITY_A,
  FIXTURE_COVERAGE_A,
  FIXTURE_APPROVED_WORKER_A,
  mockApprovedWorkerA,
} from '../../lib/brainworker/catalog/testing/fixtures';

// Mock next/navigation
const mockPush = vi.fn();
const mockReplace = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
  useSearchParams: () => ({
    get: vi.fn(),
  }),
  usePathname: () => '/brainworker/services',
}));

describe('BW-002 Suite 7 RED: BrainWorker Route Integration & Dashboard Contracts (INT-001 to INT-010)', () => {
  let mockOperationsRepo: IBrainWorkerOperationsRepository;
  let mockOnboardingRepo: IBrainWorkerOnboardingRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }

    mockOperationsRepo = {
      getOperationalProfile: vi.fn().mockResolvedValue(FIXTURE_OPERATIONAL_PROFILE_A),
      getConfiguredCatalog: vi.fn().mockResolvedValue(FIXTURE_SERVICE_CATALOG_A),
      getServiceCatalog: vi.fn().mockResolvedValue(FIXTURE_SERVICE_CATALOG_A),
      saveServiceCatalog: vi.fn().mockResolvedValue(FIXTURE_SERVICE_CATALOG_A),
      getAvailability: vi.fn().mockResolvedValue(FIXTURE_AVAILABILITY_A),
      saveAvailability: vi.fn().mockResolvedValue(FIXTURE_AVAILABILITY_A),
      getCoverage: vi.fn().mockResolvedValue(FIXTURE_COVERAGE_A),
      saveCoverage: vi.fn().mockResolvedValue(FIXTURE_COVERAGE_A),
      getMatchingHydrationProfile: vi.fn(),
      subscribeToOperationalProfile: vi.fn().mockReturnValue(() => {}),
    };

    mockOnboardingRepo = {
      getWorkerById: vi.fn().mockResolvedValue(FIXTURE_APPROVED_WORKER_A),
      saveWorker: vi.fn(),
      getAllWorkers: vi.fn(),
      updateWorkerStatus: vi.fn(),
      clearAllWorkers: vi.fn(),
    };

    vi.spyOn(operationsRepoModule, 'getBrainWorkerOperationsRepository').mockReturnValue(
      mockOperationsRepo
    );
    vi.spyOn(onboardingRepoModule, 'getBrainWorkerOnboardingRepository').mockReturnValue(
      mockOnboardingRepo
    );
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // INT-001: Unauthenticated Guard Redirect
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  it('INT-001: unauthenticated access to /brainworker/services redirects to /auth/login with returnUrl', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(null);

    render(<ServicesPage />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/auth/login?returnUrl=%2Fbrainworker%2Fservices');
    });
    expect(mockOperationsRepo.getOperationalProfile).not.toHaveBeenCalled();
    expect(mockOperationsRepo.getServiceCatalog).not.toHaveBeenCalled();
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // INT-002: Customer Role Guard Redirect
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  it('INT-002: customer role access to /brainworker/availability redirects to /marketplace', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue({
      id: 'cust-1',
      name: 'Customer User',
      email: 'customer@example.com',
      role: 'customer',
      createdAt: '2026-09-01T00:00:00.000Z',
    });

    render(<AvailabilityPage />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/marketplace');
    });
    expect(mockOperationsRepo.getOperationalProfile).not.toHaveBeenCalled();
    expect(mockOperationsRepo.getServiceCatalog).not.toHaveBeenCalled();
    expect(mockOperationsRepo.getAvailability).not.toHaveBeenCalled();
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // INT-003: Unapproved BrainWorker Guard Redirect
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  it('INT-003: brainworker with status SUBMITTED redirects to /brainworker/verification-pending', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockApprovedWorkerA);
    vi.mocked(mockOnboardingRepo.getWorkerById).mockResolvedValue({
      ...FIXTURE_APPROVED_WORKER_A,
      verificationStatus: 'SUBMITTED',
    });

    render(<ServicesPage />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/brainworker/verification-pending');
    });
    expect(mockOperationsRepo.getOperationalProfile).not.toHaveBeenCalled();
    expect(mockOperationsRepo.getServiceCatalog).not.toHaveBeenCalled();
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // INT-004: Direct Save Operation on /brainworker/services
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  it('INT-004: saving catalog on /brainworker/services invokes repository.saveServiceCatalog', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockApprovedWorkerA);
    vi.mocked(mockOperationsRepo.getServiceCatalog).mockResolvedValue(FIXTURE_SERVICE_CATALOG_A);

    render(<ServicesPage />);

    // Wait for services page to hydrate
    expect(await screen.findByRole('heading', { name: /service catalog/i })).toBeInTheDocument();

    const saveButton = screen.getByRole('button', { name: /save services|save catalog/i });
    await userEvent.click(saveButton);

    await waitFor(() => {
      expect(mockOperationsRepo.saveServiceCatalog).toHaveBeenCalledWith(
        mockApprovedWorkerA.id,
        expect.objectContaining({
          diagnosticFeeNgn: expect.any(Number),
          services: expect.any(Array),
        })
      );
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // INT-005: Operational Readiness Card on /brainworker/dashboard
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  it('INT-005: /brainworker/dashboard displays readiness status for complete vs incomplete profile', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockApprovedWorkerA);
    vi.mocked(mockOperationsRepo.getAvailability).mockResolvedValue(FIXTURE_AVAILABILITY_A);
    vi.mocked(mockOperationsRepo.getCoverage).mockResolvedValue(FIXTURE_COVERAGE_A);

    // Test incomplete profile
    vi.mocked(mockOperationsRepo.getOperationalProfile).mockResolvedValue({
      ...FIXTURE_OPERATIONAL_PROFILE_A,
      isComplete: false,
    });

    const { unmount } = render(<DashboardPage />);
    expect(await screen.findByText(/action required/i)).toBeInTheDocument();
    expect(screen.queryByText(/accepting jobs/i)).not.toBeInTheDocument();
    unmount();

    // Test complete profile
    vi.mocked(mockOperationsRepo.getOperationalProfile).mockResolvedValue({
      ...FIXTURE_OPERATIONAL_PROFILE_A,
      isComplete: true,
    });

    render(<DashboardPage />);
    expect(await screen.findByText(/accepting jobs/i)).toBeInTheDocument();
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // INT-006: Readiness Checklist Missing Items
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  it('INT-006: readiness card lists specific missing items when profile is incomplete', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockApprovedWorkerA);
    vi.mocked(mockOperationsRepo.getOperationalProfile).mockResolvedValue({
      ...FIXTURE_OPERATIONAL_PROFILE_A,
      isComplete: false,
      catalog: {
        ...FIXTURE_SERVICE_CATALOG_A,
        services: [], // missing services
      },
      coverage: {
        ...FIXTURE_COVERAGE_A,
        coverageNeighbourhoods: [], // missing neighbourhoods
      },
    });

    render(<DashboardPage />);

    expect(await screen.findByText(/no active services configured/i)).toBeInTheDocument();
    expect(screen.getByText(/no operational zones selected/i)).toBeInTheDocument();
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // INT-007: Emergency Dispatch Toggle
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  it('INT-007: toggling emergency dispatch calls repository.saveAvailability with updated flag', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockApprovedWorkerA);
    vi.mocked(mockOperationsRepo.getOperationalProfile).mockResolvedValue({
      ...FIXTURE_OPERATIONAL_PROFILE_A,
      availability: {
        ...FIXTURE_AVAILABILITY_A,
        isEmergencyAvailable: false,
      },
    });

    render(<DashboardPage />);

    const emergencyToggle = await screen.findByRole('switch', {
      name: /emergency dispatch|emergency available/i,
    });
    expect(emergencyToggle).not.toBeChecked();

    vi.mocked(mockOperationsRepo.getOperationalProfile).mockResolvedValue({
      ...FIXTURE_OPERATIONAL_PROFILE_A,
      availability: {
        ...FIXTURE_AVAILABILITY_A,
        isEmergencyAvailable: true,
      },
    });

    await userEvent.click(emergencyToggle);

    await waitFor(() => {
      expect(mockOperationsRepo.saveAvailability).toHaveBeenCalledWith(
        mockApprovedWorkerA.id,
        expect.objectContaining({
          isEmergencyAvailable: true,
        })
      );
    });
    expect(mockOperationsRepo.saveServiceCatalog).not.toHaveBeenCalled();
    expect(mockOperationsRepo.saveCoverage).not.toHaveBeenCalled();
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // INT-008: Deep Links to Operational Tabs
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  it('INT-008: clicking configure links on dashboard navigates to correct operational tabs', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockApprovedWorkerA);

    render(<DashboardPage />);

    const editServicesLink = await screen.findByRole('link', { name: /manage services/i });
    expect(editServicesLink).toHaveAttribute('href', '/brainworker/services');

    const editScheduleLink = screen.getByRole('link', { name: /manage schedule/i });
    expect(editScheduleLink).toHaveAttribute('href', '/brainworker/availability');

    const editCoverageLink = screen.getByRole('link', { name: /manage coverage/i });
    expect(editCoverageLink).toHaveAttribute('href', '/brainworker/coverage');
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // INT-009: Real-time Profile Mutation Reflected on Dashboard
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  it('INT-009: dashboard updates reactively when subscribeToOperationalProfile fires', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockApprovedWorkerA);

    let subscriberCallback: ((profile: any) => void) | null = null;
    vi.mocked(mockOperationsRepo.subscribeToOperationalProfile).mockImplementation(
      (_id, cb) => {
        subscriberCallback = cb;
        return () => {};
      }
    );

    render(<DashboardPage />);

    expect(await screen.findByText(/accepting jobs/i)).toBeInTheDocument();

    // Trigger external update making worker unavailable
    subscriberCallback!({
      ...FIXTURE_OPERATIONAL_PROFILE_A,
      availability: {
        ...FIXTURE_AVAILABILITY_A,
        isAvailable: false,
      },
    });

    await waitFor(() => {
      expect(screen.getByText(/currently paused/i)).toBeInTheDocument();
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // INT-010: Offline / Degraded Notice
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  it('INT-010: displays offline storage degraded indicator when browser offline event fires', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockApprovedWorkerA);

    render(<ServicesPage />);

    expect(await screen.findByRole('heading', { name: /service catalog/i })).toBeInTheDocument();
    expect(screen.queryByText(/offline mode/i)).not.toBeInTheDocument();

    // Dispatch offline event
    window.dispatchEvent(new Event('offline'));

    await waitFor(() => {
      expect(screen.getByText(/working offline/i)).toBeInTheDocument();
    });

    // Dispatch online event
    window.dispatchEvent(new Event('online'));

    await waitFor(() => {
      expect(screen.queryByText(/working offline/i)).not.toBeInTheDocument();
    });
  });
});

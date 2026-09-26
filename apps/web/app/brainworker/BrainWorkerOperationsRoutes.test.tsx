// apps/web/app/brainworker/BrainWorkerOperationsRoutes.test.tsx
// Phase 7 RED: BrainWorker Route Integration, Guards & Dashboard Banner Contracts (INT-001 to INT-010)
// Authoritative References:
// - docs/specs/BW-002-architecture-contract.md (v1.2, Sections 4, 5)
// - docs/specs/BW-002-ux-design-specification.md (v1.2, Sections 2, 3, 4, 5)
// - docs/specs/BW-002-test-first-implementation-plan.md (v1.2, Suite 6: INT-001 to INT-010)
// - docs/specs/BW-002-service-catalog-availability.md (v1.2, Sections 2.4, 4.3 FR-013 to FR-016)
// Scope boundary: Route integration, role guards, and dashboard operational state banners.
// No Prisma, backend/API routes, matching changes, or state architecture alterations.

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import * as authStorage from '../../lib/auth/storage';
import * as operationsRepoModule from '../../lib/brainworker/catalog/repository';
import * as onboardingRepoModule from '../../lib/brainworker/repository';
import type { IBrainWorkerOperationsRepository } from '../../lib/brainworker/catalog/types';
import type { IBrainWorkerOnboardingRepository } from '../../lib/brainworker/types';
import { isOperationalProfileComplete } from '../../lib/brainworker/catalog/validation';
import {
  FIXTURE_APPROVED_BRAINWORKER_A,
  FIXTURE_OPERATIONAL_PROFILE_A,
  FIXTURE_SERVICE_CATALOG_A,
  FIXTURE_AVAILABILITY_A,
  FIXTURE_COVERAGE_A,
  FIXTURE_ONBOARDING_RECORD_A,
  mockApprovedWorkerA,
  mockCustomerUser,
  mockUnapprovedWorker,
} from '../../lib/brainworker/catalog/testing';
import * as fs from 'fs';
import * as path from 'path';

// Route Component Imports (will fail RED since services and availability routes are not yet implemented)
import BrainWorkerServicesPage from './services/page';
import BrainWorkerAvailabilityPage from './availability/page';
import BrainWorkerDashboardPage from './dashboard/page';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Mock Navigation & Next.js Hooks
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

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
  usePathname: () => '/brainworker/services',
}));

vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...props} />
  ),
}));

describe('BW-002 Suite 7 RED: BrainWorker Route Integration & Dashboard Contracts (INT-001 to INT-010)', () => {
  let mockOperationsRepo: IBrainWorkerOperationsRepository;
  let mockOnboardingRepo: IBrainWorkerOnboardingRepository;

  beforeEach(() => {
    vi.clearAllMocks();

    mockOperationsRepo = {
      getOperationalProfile: vi.fn().mockResolvedValue(FIXTURE_OPERATIONAL_PROFILE_A),
      getServiceCatalog: vi.fn().mockResolvedValue(FIXTURE_SERVICE_CATALOG_A),
      saveServiceCatalog: vi.fn().mockResolvedValue(FIXTURE_SERVICE_CATALOG_A),
      getAvailability: vi.fn().mockResolvedValue(FIXTURE_AVAILABILITY_A),
      saveAvailability: vi.fn().mockResolvedValue(FIXTURE_AVAILABILITY_A),
      getCoverage: vi.fn().mockResolvedValue(FIXTURE_COVERAGE_A),
      saveCoverage: vi.fn().mockResolvedValue(FIXTURE_COVERAGE_A),
      getMatchingHydrationProfile: vi.fn(),
    };

    mockOnboardingRepo = {
      getOnboardingRecord: vi.fn().mockResolvedValue(FIXTURE_ONBOARDING_RECORD_A),
      saveDraftStep: vi.fn(),
      stageDocument: vi.fn(),
      removeStagedDocument: vi.fn(),
      submitOnboarding: vi.fn(),
    };

    vi.spyOn(operationsRepoModule, 'getBrainWorkerOperationsRepository').mockReturnValue(
      mockOperationsRepo
    );
    vi.spyOn(onboardingRepoModule, 'getBrainWorkerOnboardingRepository').mockReturnValue(
      mockOnboardingRepo
    );
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(null);
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // INT-001: Unauthenticated Visitor Guard
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  it('INT-001: unauthenticated visitor accessing operational routes redirects to /login without triggering repository reads', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(null);

    render(<BrainWorkerServicesPage />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(
        expect.stringMatching(/\/login\?redirect=.*brainworker.*services/)
      );
    });
    expect(mockOperationsRepo.getOperationalProfile).not.toHaveBeenCalled();
    expect(mockOperationsRepo.getServiceCatalog).not.toHaveBeenCalled();
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // INT-002: Customer Fail-Closed Guard
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  it('INT-002: authenticated customer accessing operational routes fails closed without repository queries', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockCustomerUser);

    render(<BrainWorkerServicesPage />);

    expect(
      screen.getByText(/Customer Account Detected|Access Restricted|BrainWorker workspace is strictly reserved/i)
    ).toBeInTheDocument();
    expect(mockOperationsRepo.getOperationalProfile).not.toHaveBeenCalled();
    expect(mockOperationsRepo.getServiceCatalog).not.toHaveBeenCalled();
    expect(mockOperationsRepo.getAvailability).not.toHaveBeenCalled();
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // INT-003: Unapproved BrainWorker Guard
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  it('INT-003: unapproved BrainWorker accessing operational routes redirects to /brainworker/verification-status', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockUnapprovedWorker);

    render(<BrainWorkerServicesPage />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/brainworker/verification-status');
    });
    expect(mockOperationsRepo.getOperationalProfile).not.toHaveBeenCalled();
    expect(mockOperationsRepo.getServiceCatalog).not.toHaveBeenCalled();
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // INT-004: Approved BrainWorker Service Catalog Route Integration
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  it('INT-004: approved BrainWorker loads /brainworker/services, renders ServiceCatalogEditor, and saves catalog updates', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockApprovedWorkerA);
    vi.mocked(mockOperationsRepo.getServiceCatalog).mockResolvedValue(FIXTURE_SERVICE_CATALOG_A);

    render(<BrainWorkerServicesPage />);

    expect(await screen.findByRole('heading', { name: /service catalog|diagnostic.*fee/i })).toBeInTheDocument();
    const saveBtn = screen.getByRole('button', { name: /save changes|save catalog/i });
    expect(saveBtn).toBeInTheDocument();

    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(mockOperationsRepo.saveServiceCatalog).toHaveBeenCalledWith(
        mockApprovedWorkerA.id,
        expect.objectContaining({
          diagnosticFeeNgn: FIXTURE_SERVICE_CATALOG_A.diagnosticFeeNgn,
          services: expect.any(Array),
        })
      );
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // INT-005: Availability & Coverage Integration with Authoritative City Origin
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  it('INT-005: /brainworker/availability integrates AvailabilityEditor and CoverageEditor, deriving verifiedCities authoritatively from onboarding repository', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockApprovedWorkerA);
    vi.mocked(mockOnboardingRepo.getOnboardingRecord).mockResolvedValue(FIXTURE_ONBOARDING_RECORD_A);
    vi.mocked(mockOperationsRepo.getAvailability).mockResolvedValue(FIXTURE_AVAILABILITY_A);
    vi.mocked(mockOperationsRepo.getCoverage).mockResolvedValue(FIXTURE_COVERAGE_A);

    render(<BrainWorkerAvailabilityPage />);

    expect(await screen.findByRole('region', { name: /availability and schedule/i })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: /coverage area and location/i })).toBeInTheDocument();

    await waitFor(() => {
      expect(mockOnboardingRepo.getOnboardingRecord).toHaveBeenCalledWith(mockApprovedWorkerA.id);
    });

    const citySelect = screen.getByLabelText(/primary city/i);
    const options = within(citySelect as HTMLElement)
      .getAllByRole('option')
      .map((o) => (o as HTMLOptionElement).value)
      .filter((v) => v !== '');
    expect(options.sort()).toEqual([...FIXTURE_ONBOARDING_RECORD_A.trade!.coverageCities].sort());
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // INT-006: Dashboard Setup Incomplete Prompt Banner
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  it('INT-006: /brainworker/dashboard renders setup prompt banner when isComplete === false with links to services and availability', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockApprovedWorkerA);
    vi.mocked(mockOperationsRepo.getOperationalProfile).mockResolvedValue({
      ...FIXTURE_OPERATIONAL_PROFILE_A,
      isComplete: false,
    });

    render(<BrainWorkerDashboardPage />);

    expect(
      await screen.findByText(/complete your provider setup|setup required|complete setup/i)
    ).toBeInTheDocument();
    const servicesLink = screen.getByRole('link', { name: /configure services|services & rates/i });
    const availabilityLink = screen.getByRole('link', { name: /set hours|hours & coverage|availability/i });
    expect(servicesLink.getAttribute('href')).toBe('/brainworker/services');
    expect(availabilityLink.getAttribute('href')).toBe('/brainworker/availability');
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // INT-007: Dashboard Separates isComplete from isAvailable
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  it('INT-007: /brainworker/dashboard separates isComplete and isAvailable: on-duty displays Ready for Dispatch, off-duty displays Paused', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockApprovedWorkerA);

    vi.mocked(mockOperationsRepo.getOperationalProfile).mockResolvedValue({
      ...FIXTURE_OPERATIONAL_PROFILE_A,
      isComplete: true,
      availability: { ...FIXTURE_AVAILABILITY_A, isAvailable: true },
    });

    const { rerender } = render(<BrainWorkerDashboardPage />);
    expect(await screen.findByText(/ready for dispatch|eligible for dispatch/i)).toBeInTheDocument();

    vi.mocked(mockOperationsRepo.getOperationalProfile).mockResolvedValue({
      ...FIXTURE_OPERATIONAL_PROFILE_A,
      isComplete: true,
      availability: { ...FIXTURE_AVAILABILITY_A, isAvailable: false },
    });

    rerender(<BrainWorkerDashboardPage />);
    expect(await screen.findByText(/off-duty|dispatch paused|taking a break/i)).toBeInTheDocument();
    expect(screen.queryByText(/complete your provider setup/i)).not.toBeInTheDocument();
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // INT-008: Dashboard Quick Duty Toggle Preserves Completeness
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  it('INT-008: dashboard quick duty toggle toggles availability via repository while proving profile completeness remains unchanged', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockApprovedWorkerA);
    vi.mocked(mockOperationsRepo.getOperationalProfile).mockResolvedValue({
      ...FIXTURE_OPERATIONAL_PROFILE_A,
      isComplete: true,
      availability: { ...FIXTURE_AVAILABILITY_A, isAvailable: true },
    });

    render(<BrainWorkerDashboardPage />);

    const dutyToggle = await screen.findByRole('switch', { name: /dispatch duty|on-duty/i });
    fireEvent.click(dutyToggle);

    await waitFor(() => {
      expect(mockOperationsRepo.saveAvailability).toHaveBeenCalledWith(
        mockApprovedWorkerA.id,
        expect.objectContaining({ isAvailable: false })
      );
    });

    // Invariant proof: saving availability off-duty never mutates catalog or coverage
    expect(mockOperationsRepo.saveServiceCatalog).not.toHaveBeenCalled();
    expect(mockOperationsRepo.saveCoverage).not.toHaveBeenCalled();

    // Domain proof: operational completeness is invariant to duty state changes
    expect(
      isOperationalProfileComplete({
        catalog: FIXTURE_SERVICE_CATALOG_A,
        availability: { ...FIXTURE_AVAILABILITY_A, isAvailable: false },
        coverage: FIXTURE_COVERAGE_A,
      })
    ).toBe(true);

    // Dashboard UI proof: toggling off-duty displays paused status and NEVER falls back to unconfigured setup banner
    expect(await screen.findByText(/off-duty|dispatch paused|taking a break/i)).toBeInTheDocument();
    expect(screen.queryByText(/complete your provider setup|setup required/i)).not.toBeInTheDocument();
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // INT-009: Static Prerendering and SSR Mount Safety
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  it('INT-009: static prerendering and SSR mount safety: route components render without ReferenceError or unhandled window access', async () => {
    const { renderToString } = await import('react-dom/server');
    expect(() => renderToString(<BrainWorkerServicesPage />)).not.toThrow();
    expect(() => renderToString(<BrainWorkerAvailabilityPage />)).not.toThrow();
    expect(() => render(<BrainWorkerServicesPage />)).not.toThrow();
    expect(() => render(<BrainWorkerAvailabilityPage />)).not.toThrow();
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // INT-010: Physical Testing Boundary
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  it('INT-010: production route source files keep the physical testing boundary (zero testing imports)', () => {
    const servicesPath = path.join(__dirname, 'services', 'page.tsx');
    const availabilityPath = path.join(__dirname, 'availability', 'page.tsx');
    const dashboardPath = path.join(__dirname, 'dashboard', 'page.tsx');

    for (const filePath of [servicesPath, availabilityPath, dashboardPath]) {
      const source = fs.readFileSync(filePath, 'utf8');
      expect(source).not.toMatch(/from ['"][^'"]*testing[^'"]*['"]/);
      expect(source).not.toMatch(/test fixtures/i);
    }
  });
});

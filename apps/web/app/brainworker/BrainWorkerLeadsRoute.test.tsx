// apps/web/app/brainworker/BrainWorkerLeadsRoute.test.tsx
// Phase 6 RED: BrainWorker Leads Route Integration & Security Contracts (INT-001 to INT-010)
// Authoritative References:
// - docs/specs/BW-003-leads-inbox.md (v1.0, Sections 2, 4, 5, 11, 12, 13)
// - docs/specs/BW-003-architecture-contract.md (v1.0, Sections 2, 5, 12)
// - docs/specs/BW-003-test-first-implementation-plan.md (v1.0, Phase 6: INT-001 to INT-010)
// Scope boundary: Route integration, role and approval guards, completeness gating, tenant isolation, and layout integration.
// No matching engine changes, payments, escrow, or booking state alterations.

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import * as authStorage from '../../lib/auth/storage';
import * as leadsRepoModule from '../../lib/brainworker/leads/repository';
import * as operationsRepoModule from '../../lib/brainworker/catalog/repository';
import type { IBrainWorkerLeadsRepository, LeadPage } from '../../lib/brainworker/leads/types';
import type { IBrainWorkerOperationsRepository } from '../../lib/brainworker/catalog/types';
import { projectLeadForProvider } from '../../lib/brainworker/leads/domain';
import {
  mockApprovedWorkerA,
  mockCustomerUser,
  mockUnapprovedWorker,
  mockIncompleteWorker,
  leadOwnedByA,
} from '../../lib/brainworker/leads/testing';
import { FIXTURE_OPERATIONAL_PROFILE_A } from '../../lib/brainworker/catalog/testing';
import * as fs from 'fs';
import * as path from 'path';

// Route Component Imports
import BrainWorkerLeadsPage from './leads/page';
import BrainWorkerDashboardPage from './dashboard/page';

// Mock Navigation & Next.js Hooks
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
  usePathname: () => '/brainworker/leads',
}));

vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...props} />
  ),
}));

describe('BW-003 Phase 6 RED: BrainWorker Leads Route Integration & Security Contracts (INT-001 to INT-010)', () => {
  let mockOperationsRepo: IBrainWorkerOperationsRepository;
  let mockLeadsRepo: IBrainWorkerLeadsRepository;

  const mockPopulatedLeadPage: LeadPage = {
    items: [projectLeadForProvider(leadOwnedByA())],
  };

  beforeEach(() => {
    vi.clearAllMocks();

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

    mockLeadsRepo = {
      getLeads: vi.fn().mockResolvedValue(mockPopulatedLeadPage),
      getLead: vi.fn(),
      acceptInvitation: vi.fn(),
      declineInvitation: vi.fn(),
      submitQuote: vi.fn(),
      acceptCustomerRate: vi.fn(),
    };

    vi.spyOn(operationsRepoModule, 'getBrainWorkerOperationsRepository').mockReturnValue(
      mockOperationsRepo
    );
    vi.spyOn(leadsRepoModule, 'getBrainWorkerLeadsRepository').mockReturnValue(
      mockLeadsRepo
    );
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(null);
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // INT-001: Unauthenticated Visitor Guard
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  it('INT-001: unauthenticated visitor accessing /brainworker/leads redirects to /login without triggering repository reads', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(null);

    render(<BrainWorkerLeadsPage />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(
        expect.stringMatching(/\/login\?redirect=.*brainworker.*leads/)
      );
    });
    expect(mockLeadsRepo.getLeads).not.toHaveBeenCalled();
    expect(mockOperationsRepo.getOperationalProfile).not.toHaveBeenCalled();
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // INT-002: Customer Fail-Closed Boundary
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  it('INT-002: authenticated customer accessing /brainworker/leads fails closed without repository queries', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockCustomerUser);

    render(<BrainWorkerLeadsPage />);

    expect(
      screen.getByText(/Customer Account Detected|Access Restricted|BrainWorker workspace is strictly reserved/i)
    ).toBeInTheDocument();
    expect(mockLeadsRepo.getLeads).not.toHaveBeenCalled();
    expect(mockOperationsRepo.getOperationalProfile).not.toHaveBeenCalled();
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // INT-003: Unapproved BrainWorker Guard
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  it('INT-003: unapproved BrainWorker accessing /brainworker/leads redirects to /brainworker/verification-status', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockUnapprovedWorker);

    render(<BrainWorkerLeadsPage />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/brainworker/verification-status');
    });
    expect(mockLeadsRepo.getLeads).not.toHaveBeenCalled();
    expect(mockOperationsRepo.getOperationalProfile).not.toHaveBeenCalled();
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // INT-004: Incomplete Provider Setup Gate
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  it('INT-004: incomplete provider setup gate blocks leads feed and renders setup prompt with links to services and availability', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockIncompleteWorker);
    vi.mocked(mockOperationsRepo.getOperationalProfile).mockResolvedValue({
      ...FIXTURE_OPERATIONAL_PROFILE_A,
      isComplete: false,
    });

    render(<BrainWorkerLeadsPage />);

    expect(
      await screen.findByText(/complete your provider setup|setup required|complete setup/i)
    ).toBeInTheDocument();
    const servicesLink = screen.getByRole('link', { name: /configure services|services & rates/i });
    const availabilityLink = screen.getByRole('link', { name: /set hours|hours & coverage|availability/i });
    expect(servicesLink.getAttribute('href')).toBe('/brainworker/services');
    expect(availabilityLink.getAttribute('href')).toBe('/brainworker/availability');
    expect(mockLeadsRepo.getLeads).not.toHaveBeenCalled();
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // INT-005: Approved Complete Provider Workspace Load
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  it('INT-005: approved and complete BrainWorker loads /brainworker/leads and renders production LeadsInboxView workspace', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockApprovedWorkerA);
    vi.mocked(mockOperationsRepo.getOperationalProfile).mockResolvedValue(FIXTURE_OPERATIONAL_PROFILE_A);

    render(<BrainWorkerLeadsPage />);

    expect(await screen.findByRole('heading', { name: /job requests|incoming leads|leads inbox/i })).toBeInTheDocument();
    expect(await screen.findByRole('feed', { name: /incoming job requests|leads feed/i })).toBeInTheDocument();
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // INT-006: Session-Bound Repository Isolation
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  it('INT-006: authenticated session ID is strictly bound to repository queries, preventing cross-tenant access', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockApprovedWorkerA);
    vi.mocked(mockOperationsRepo.getOperationalProfile).mockResolvedValue(FIXTURE_OPERATIONAL_PROFILE_A);

    render(<BrainWorkerLeadsPage />);

    await waitFor(() => {
      expect(mockLeadsRepo.getLeads).toHaveBeenCalledWith(
        mockApprovedWorkerA.id,
        expect.anything()
      );
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // INT-007: Static Prerendering and SSR Mount Safety
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  it('INT-007: static prerendering and SSR mount safety renders production shell structure without SSR errors', async () => {
    const { renderToString } = await import('react-dom/server');
    let markup = '';
    expect(() => {
      markup = renderToString(<BrainWorkerLeadsPage />);
    }).not.toThrow();
    expect(markup).toContain('BukieBrainJobs');
    expect(markup).toMatch(/Job Requests.*Leads/);
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // INT-008: Physical Testing Boundary & Component Integration
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  it('INT-008: production route source file preserves physical testing boundary and integrates production LeadsInboxView', () => {
    const leadsPagePath = path.join(__dirname, 'leads', 'page.tsx');
    const source = fs.readFileSync(leadsPagePath, 'utf8');

    expect(source).not.toMatch(/from ['"][^'"]*testing[^'"]*['"]/);
    expect(source).not.toMatch(/test fixtures/i);
    expect(source).toMatch(/LeadsInboxView/);
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // INT-009: Dashboard Navigation Link
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  it('INT-009: dashboard navigation links reach /brainworker/leads for quick provider access', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockApprovedWorkerA);
    vi.mocked(mockOperationsRepo.getOperationalProfile).mockResolvedValue(FIXTURE_OPERATIONAL_PROFILE_A);

    render(<BrainWorkerDashboardPage />);

    const leadsLink = await screen.findByRole('link', {
      name: /view job requests|leads inbox|job requests & leads|incoming requests/i,
    });
    expect(leadsLink.getAttribute('href')).toBe('/brainworker/leads');
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // INT-010: Route Privacy Projection
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  it('INT-010: no private customer credentials reach the rendered projection at the route boundary', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockApprovedWorkerA);
    vi.mocked(mockOperationsRepo.getOperationalProfile).mockResolvedValue(FIXTURE_OPERATIONAL_PROFILE_A);

    render(<BrainWorkerLeadsPage />);

    await screen.findByText(/Generator service|Emergency Generator Troubleshooting/i);

    expect(screen.queryByText(/Adeleke/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/\+2348000000000|08012345678/)).not.toBeInTheDocument();
    expect(screen.queryByText(/customer@example.com/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/12 Example Close/i)).not.toBeInTheDocument();
  });
});

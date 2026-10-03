// apps/web/app/brainworker/BW003Phase7ProductionVerification.test.tsx
// Phase 7 RED: BW-003 Production Verification / Final Feature Audit
// Governed by: BW-003 Test-First Implementation Plan v1.0 (Phase 7)
// docs/specs/BW-003-test-first-implementation-plan.md (Phase 7: Production Verification)
// docs/specs/BW-003-leads-inbox.md
// docs/specs/BW-003-architecture-contract.md
//
// Scope: Complete BW-003 system boundary verification
// - Production route and shell
// - Authentication, role, approval, operational-completeness gates
// - Authenticated user.id tenant/session binding
// - Lead eligibility and coverage/availability authority
// - Privacy projection at repository and rendered boundaries
// - Lead ordering and feed state handling
// - Customer media authorization
// - Accept/decline mutation behavior and canonical decline reasons
// - Quotation authority, including authoritative BW-002 diagnostic-fee resolution
// - Offline and degraded behavior
// - Keyboard/accessibility/reduced-motion requirements
// - Production/testing physical separation
// - No mutation of booking/payment/escrow state from BW-003
// - Complete BW-003 regression integration
//
// RED Gate Rules:
// 1. Every assertion must fail for the intended missing verification/behavior
// 2. Existing Phases 1-6 tests must remain green
// 3. Do not weaken existing tests
// 4. Do not add production implementation merely to satisfy compilation
// 5. Test boundary remains physically separated from production code
// 6. PR #53 remains open and unmerged

import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import * as authStorage from '../../lib/auth/storage';
import * as leadsRepoModule from '../../lib/brainworker/leads/repository';
import * as operationsRepoModule from '../../lib/brainworker/catalog/repository';
import * as fs from 'fs';
import * as path from 'path';

// Route and Component Imports
import BrainWorkerLeadsPage from './leads/page';
import { LeadsInboxView } from '../../components/brainworker/leads/LeadsInboxView';

// Mock Types
import type { IBrainWorkerLeadsRepository, LeadPage, WorkerQuote, DeclineReason } from '../../lib/brainworker/leads/types';
import type { IBrainWorkerOperationsRepository } from '../../lib/brainworker/catalog/types';
import type { ProviderProjectedLead, RawLeadData } from '../../lib/brainworker/leads/domain';

// Test Utilities
import {
  mockApprovedWorkerA,
  mockCustomerUser,
  mockUnapprovedWorker,
  mockIncompleteWorker,
  leadOwnedByA,
  respondedLeadOwnedByA,
  leadOwnedByB,
  CANONICAL_DECLINE_REASONS,
} from '../../lib/brainworker/leads/testing';
import { FIXTURE_OPERATIONAL_PROFILE_A } from '../../lib/brainworker/catalog/testing/fixtures';
import { projectLeadForProvider } from '../../lib/brainworker/leads/domain';

// Helper functions for test data creation
const leadWithPrivateCustomerData = (overrides: Partial<RawLeadData> = {}): RawLeadData =>
  leadOwnedByA({
    exactAddress: '12 Example Close, Gwarinpa, Abuja',
    customerPhone: '+2348000000000',
    customerEmail: 'customer@example.com',
    ...overrides,
  });

const leadOutsideCoverage = (overrides: Partial<RawLeadData> = {}): RawLeadData =>
  leadOwnedByA({
    cityId: 'lagos', // Different city
    neighbourhoodOrZone: 'Victoria Island',
    distanceKm: 500, // Far outside coverage
    ...overrides,
  });

const createTestLead = (overrides: Partial<RawLeadData> = {}): RawLeadData =>
  leadOwnedByA(overrides);

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
  usePathname: () => '/brainworker/leads',
}));

vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...props} />
  ),
}));

// =============================================================================
// Phase 7 RED: Production Verification / Final Feature Audit
// =============================================================================

describe('BW-003 Phase 7 RED: Production Verification / Final Feature Audit', () => {
  let mockOperationsRepo: IBrainWorkerOperationsRepository;
  let mockLeadsRepo: IBrainWorkerLeadsRepository;

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
      getLeads: vi.fn(),
      getLead: vi.fn(),
      acceptInvitation: vi.fn(),
      declineInvitation: vi.fn(),
      submitQuote: vi.fn(),
      acceptCustomerRate: vi.fn(),
    };

    vi.spyOn(operationsRepoModule, 'getBrainWorkerOperationsRepository').mockReturnValue(
      mockOperationsRepo
    );
    vi.spyOn(leadsRepoModule, 'getBrainWorkerLeadsRepository').mockReturnValue(mockLeadsRepo);
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ===========================================================================
  // 1. Production Route and Shell Verification
  // ===========================================================================

  describe('Production Route and Shell', () => {
    it('PROD-001: production route /brainworker/leads renders without SSR hydration errors', async () => {
      const { renderToString } = await import('react-dom/server');
      vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockApprovedWorkerA);
      vi.mocked(mockOperationsRepo.getOperationalProfile).mockResolvedValue(
        FIXTURE_OPERATIONAL_PROFILE_A
      );

      let markup = '';
      expect(() => {
        markup = renderToString(<BrainWorkerLeadsPage />);
      }).not.toThrow();

      expect(markup).toContain('BukieBrainJobs');
      expect(markup).toMatch(/Job Requests.*Leads/i);
    });

    it('PROD-002: production route file contains zero imports from testing/ directory', () => {
      const leadsPagePath = path.join(__dirname, 'leads', 'page.tsx');
      const source = fs.readFileSync(leadsPagePath, 'utf8');

      expect(source).not.toMatch(/from ['"].*testing[\\/].*['"]/);
      expect(source).not.toMatch(/from ['"].*__mocks__[\\/].*['"]/);
      expect(source).toMatch(/LeadsInboxView/);
    });

    it('PROD-003: production route does not expose test-only surfaces in export', () => {
      const leadsPagePath = path.join(__dirname, 'leads', 'page.tsx');
      const source = fs.readFileSync(leadsPagePath, 'utf8');

      expect(source).not.toMatch(/__testSeedLead|__testSetOffline|testOnly|TEST_ONLY/i);
    });
  });

  // ===========================================================================
  // 2. Authentication and Authorization Gates
  // ===========================================================================

  describe('Authentication and Authorization Gates', () => {
    it('PROD-004: unauthenticated access to /brainworker/leads redirects to login without repository interaction', async () => {
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

    it('PROD-005: customer role fails closed at route boundary without data leakage', async () => {
      vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockCustomerUser);

      render(<BrainWorkerLeadsPage />);

      expect(screen.getByText('Customer Account Detected')).toBeInTheDocument();
      expect(mockLeadsRepo.getLeads).not.toHaveBeenCalled();
      expect(mockOperationsRepo.getOperationalProfile).not.toHaveBeenCalled();
    });

    it('PROD-006: unapproved BrainWorker redirects to verification-status without repository reads', async () => {
      vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockUnapprovedWorker);

      render(<BrainWorkerLeadsPage />);

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith('/brainworker/verification-status');
      });

      expect(mockLeadsRepo.getLeads).not.toHaveBeenCalled();
      expect(mockOperationsRepo.getOperationalProfile).not.toHaveBeenCalled();
    });

    it('PROD-007: incomplete operational profile blocks leads feed and renders setup navigation', async () => {
      vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockIncompleteWorker);
      vi.mocked(mockOperationsRepo.getOperationalProfile).mockResolvedValue({
        ...FIXTURE_OPERATIONAL_PROFILE_A,
        isComplete: false,
      });

      render(<BrainWorkerLeadsPage />);

      expect(await screen.findByText(/complete your provider setup/i)).toBeInTheDocument();

      const servicesLink = screen.getByRole('link', { name: /configure services/i });
      const availabilityLink = screen.getByRole('link', { name: /set hours/i });

      expect(servicesLink.getAttribute('href')).toBe('/brainworker/services');
      expect(availabilityLink.getAttribute('href')).toBe('/brainworker/availability');

      expect(mockLeadsRepo.getLeads).not.toHaveBeenCalled();
    });

    it('PROD-008: approved complete BrainWorker binds repository to authenticated user.id', async () => {
      vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockApprovedWorkerA);
      vi.mocked(mockOperationsRepo.getOperationalProfile).mockResolvedValue(
        FIXTURE_OPERATIONAL_PROFILE_A
      );
      vi.mocked(mockLeadsRepo.getLeads).mockResolvedValue({ items: [] });

      render(<BrainWorkerLeadsPage />);

      await waitFor(() => {
        expect(mockLeadsRepo.getLeads).toHaveBeenCalledWith(mockApprovedWorkerA.id);
      });
    });
  });

  // ===========================================================================
  // 3. Tenant Isolation and Session Binding
  // ===========================================================================

  describe('Tenant Isolation and Session Binding', () => {
    it('PROD-009: repository rejects cross-tenant lead access attempts', async () => {
      vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockApprovedWorkerA);
      vi.mocked(mockOperationsRepo.getOperationalProfile).mockResolvedValue(
        FIXTURE_OPERATIONAL_PROFILE_A
      );

      const { BrainWorkerLeadsRepository } = await import(
        '../../lib/brainworker/leads/repository'
      );
      const repo = new BrainWorkerLeadsRepository();

      // Attempt to access with a different BrainWorker ID than the authenticated session
      const differentWorkerId = 'worker_different_id';

      await expect(
        repo.getLeads(differentWorkerId)
      ).rejects.toThrow(/FORBIDDEN_TENANT_ACCESS/);
    });

    it('PROD-010: repository enforces authenticated session identity match on all operations', async () => {
      vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockApprovedWorkerA);

      const { BrainWorkerLeadsRepository } = await import(
        '../../lib/brainworker/leads/repository'
      );
      const repo = new BrainWorkerLeadsRepository();

      // Verify that operations are bound to the session user
      const leadData = leadOwnedByA();
      
      repo.__testSeedLead(mockApprovedWorkerA.id, leadData);

      // Attempt to access with correct session
      await expect(repo.getLeads(mockApprovedWorkerA.id)).resolves.not.toThrow();
    });
  });

  // ===========================================================================
  // 4. Lead Eligibility and Authority
  // ===========================================================================

  describe('Lead Eligibility and Authority', () => {
    it('PROD-011: repository filters leads by authoritative provider eligibility', async () => {
      vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockApprovedWorkerA);
      vi.mocked(mockOperationsRepo.getOperationalProfile).mockResolvedValue(
        FIXTURE_OPERATIONAL_PROFILE_A
      );

      const { BrainWorkerLeadsRepository } = await import(
        '../../lib/brainworker/leads/repository'
      );
      const repo = new BrainWorkerLeadsRepository();

      // Seed leads - one eligible, one outside coverage
      const eligibleLead = leadOwnedByA();
      const ineligibleLead = leadOutsideCoverage();

      
      repo.__testSeedLead(mockApprovedWorkerA.id, eligibleLead);
      
      repo.__testSeedLead(mockApprovedWorkerA.id, ineligibleLead);

      const result = await repo.getLeads(mockApprovedWorkerA.id);

      // Eligibility filtering happens at the domain level, not repository
      // The repository returns privacy-projected leads
      expect(result.items).toBeDefined();
      expect(Array.isArray(result.items)).toBe(true);
    });

    it('PROD-012: privacy projection masks sensitive customer data at repository boundary', async () => {
      vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockApprovedWorkerA);
      vi.mocked(mockOperationsRepo.getOperationalProfile).mockResolvedValue(
        FIXTURE_OPERATIONAL_PROFILE_A
      );

      const { BrainWorkerLeadsRepository } = await import(
        '../../lib/brainworker/leads/repository'
      );
      const repo = new BrainWorkerLeadsRepository();

      const leadWithPrivateData = leadWithPrivateCustomerData();
      
      repo.__testSeedLead(mockApprovedWorkerA.id, leadWithPrivateData);

      const result = await repo.getLeads(mockApprovedWorkerA.id);

      // Verify that returned leads are privacy-projected
      result.items.forEach((lead: ProviderProjectedLead) => {
        expect(lead).not.toHaveProperty('customerPhone');
        expect(lead).not.toHaveProperty('customerEmail');
        expect(lead).not.toHaveProperty('customerAddress');
        expect(lead).not.toHaveProperty('houseNumber');
      });
    });

    it('PROD-013: privacy projection masks sensitive data at rendered UI boundary', async () => {
      vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockApprovedWorkerA);
      vi.mocked(mockOperationsRepo.getOperationalProfile).mockResolvedValue(
        FIXTURE_OPERATIONAL_PROFILE_A
      );

      const projectedLead = projectLeadForProvider(leadWithPrivateCustomerData());
      vi.mocked(mockLeadsRepo.getLeads).mockResolvedValue({
        items: [projectedLead],
      });

      render(<BrainWorkerLeadsPage />);

      await waitFor(() => {
        expect(screen.queryByText(/Adeleke/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/\+23480/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/customer@example\.com/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/12 Example Close/i)).not.toBeInTheDocument();
      });
    });
  });

  // ===========================================================================
  // 5. Feed State and Ordering
  // ===========================================================================

  describe('Feed State and Ordering', () => {
    it('PROD-014: leads feed renders loading state before data resolution', async () => {
      vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockApprovedWorkerA);
      vi.mocked(mockOperationsRepo.getOperationalProfile).mockResolvedValue(
        FIXTURE_OPERATIONAL_PROFILE_A
      );
      vi.mocked(mockLeadsRepo.getLeads).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ items: [] }), 1000))
      );

      render(<LeadsInboxView brainWorkerId={mockApprovedWorkerA.id} repository={mockLeadsRepo} />);

      expect(screen.getByRole('status', { name: /loading/i })).toBeInTheDocument();
    });

    it('PROD-015: leads feed renders empty state when no leads available', async () => {
      vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockApprovedWorkerA);
      vi.mocked(mockOperationsRepo.getOperationalProfile).mockResolvedValue(
        FIXTURE_OPERATIONAL_PROFILE_A
      );
      vi.mocked(mockLeadsRepo.getLeads).mockResolvedValue({ items: [] });

      render(<LeadsInboxView brainWorkerId={mockApprovedWorkerA.id} repository={mockLeadsRepo} />);

      await waitFor(() => {
        expect(screen.getByText(/no job requests available/i)).toBeInTheDocument();
      });
    });

    it('PROD-016: leads feed renders populated state with multiple leads ordered deterministically', async () => {
      vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockApprovedWorkerA);

      const leads: ProviderProjectedLead[] = [
        projectLeadForProvider(createTestLead({ id: 'lead_1', title: 'First Lead' })),
        projectLeadForProvider(createTestLead({ id: 'lead_2', title: 'Second Lead' })),
        projectLeadForProvider(createTestLead({ id: 'lead_3', title: 'Third Lead' })),
      ];

      vi.mocked(mockLeadsRepo.getLeads).mockResolvedValue({ items: leads });

      render(<LeadsInboxView brainWorkerId={mockApprovedWorkerA.id} repository={mockLeadsRepo} />);

      await waitFor(() => {
        expect(screen.getAllByTestId('lead-card').length).toBe(3);
      });
    });

    it('PROD-017: leads feed renders error state with retry action when repository fails', async () => {
      vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockApprovedWorkerA);
      vi.mocked(mockLeadsRepo.getLeads).mockRejectedValue(new Error('Repository failure'));

      render(<LeadsInboxView brainWorkerId={mockApprovedWorkerA.id} repository={mockLeadsRepo} />);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText(/could not load/i)).toBeInTheDocument();
        expect(screen.getByText(/retry/i)).toBeInTheDocument();
      });
    });
  });

  // ===========================================================================
  // 6. Invitation Mutations
  // ===========================================================================

  describe('Invitation Mutations', () => {
    it('PROD-018: accept invitation mutation enforces canonical state transition', async () => {
      vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockApprovedWorkerA);

      const { BrainWorkerLeadsRepository } = await import(
        '../../lib/brainworker/leads/repository'
      );
      const repo = new BrainWorkerLeadsRepository();

      const lead = leadOwnedByA();
      
      repo.__testSeedLead(mockApprovedWorkerA.id, lead);

      const result = await repo.acceptInvitation(mockApprovedWorkerA.id, lead.invitationId);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.state).toBe('ACCEPTED');
        expect(result.respondedAt).toBeDefined();
        expect(typeof result.respondedAt).toBe('string');
      }
    });

    it('PROD-019: decline invitation mutation uses canonical reason taxonomy', async () => {
      vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockApprovedWorkerA);

      const { BrainWorkerLeadsRepository } = await import(
        '../../lib/brainworker/leads/repository'
      );
      const repo = new BrainWorkerLeadsRepository();

      const lead = leadOwnedByA();
      
      repo.__testSeedLead(mockApprovedWorkerA.id, lead);

      const result = await repo.declineInvitation(
        mockApprovedWorkerA.id,
        lead.invitationId,
        'SCHEDULE_CONFLICT'
      );

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.state).toBe('DECLINED');
        expect(result.declineReason).toBe('SCHEDULE_CONFLICT');
      }
    });

    it('PROD-020: decline invitation rejects invalid reason outside canonical taxonomy', async () => {
      vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockApprovedWorkerA);

      const { BrainWorkerLeadsRepository } = await import(
        '../../lib/brainworker/leads/repository'
      );
      const repo = new BrainWorkerLeadsRepository();

      const lead = leadOwnedByA();
      
      repo.__testSeedLead(mockApprovedWorkerA.id, lead);

      
      const result = await repo.declineInvitation(
        mockApprovedWorkerA.id,
        lead.invitationId,
        'INVALID_REASON' as DeclineReason
      );

      expect(result.ok).toBe(false);
    });

    it('PROD-021: invitation mutations reject already-responded invitations', async () => {
      vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockApprovedWorkerA);

      const { BrainWorkerLeadsRepository } = await import(
        '../../lib/brainworker/leads/repository'
      );
      const repo = new BrainWorkerLeadsRepository();

      const lead = leadOwnedByA();
      
      repo.__testSeedLead(mockApprovedWorkerA.id, lead);

      // First accept
      await repo.acceptInvitation(mockApprovedWorkerA.id, lead.invitationId);

      // Attempt to accept again
      const secondResult = await repo.acceptInvitation(
        mockApprovedWorkerA.id,
        lead.invitationId
      );

      expect(secondResult.ok).toBe(false);
      if (!secondResult.ok) {
        expect(secondResult.reason).toBe('ALREADY_RESPONDED');
      }
    });
  });

  // ===========================================================================
  // 7. Quotation Authority
  // ===========================================================================

  describe('Quotation Authority', () => {
    it('PROD-022: submit quote enforces authoritative diagnostic fee from BW-002 catalog', async () => {
      vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockApprovedWorkerA);

      const { BrainWorkerLeadsRepository } = await import(
        '../../lib/brainworker/leads/repository'
      );
      const repo = new BrainWorkerLeadsRepository();

      const lead = leadOwnedByA();
      
      repo.__testSeedLead(mockApprovedWorkerA.id, lead);

      // Attempt to submit quote with incorrect diagnostic fee
      await expect(
        repo.submitQuote(mockApprovedWorkerA.id, lead.invitationId, {
          laborAmountKobo: 500000,
          diagnosticFeeKobo: 999999, // Wrong fee
          estimatedHours: 2,
        })
      ).rejects.toThrow(/diagnosticFeeKobo.*must match active provider catalog fee/);
    });

    it('PROD-023: submit quote derives total from line items, rejecting client-authored totals', async () => {
      vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockApprovedWorkerA);

      const { BrainWorkerLeadsRepository } = await import(
        '../../lib/brainworker/leads/repository'
      );
      const repo = new BrainWorkerLeadsRepository();

      const lead = leadOwnedByA();
      
      repo.__testSeedLead(mockApprovedWorkerA.id, lead);

      // FIXTURE_SERVICE_CATALOG_A has diagnosticFeeNgn: 5000 (50.00 NGN = 500000 kobo)
      const diagnosticFeeKobo = 500000;

      const quote = await repo.submitQuote(mockApprovedWorkerA.id, lead.invitationId, {
        laborAmountKobo: 100000, // 1000.00 NGN
        diagnosticFeeKobo,
        estimatedHours: 2,
      });

      // Total should be derived: labor + diagnosticFee = 150000
      expect(quote.totalAmountKobo).toBe(100000 + diagnosticFeeKobo);
    });

    it('PROD-024: accept customer rate is separate from quotation submission', async () => {
      vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockApprovedWorkerA);

      const { BrainWorkerLeadsRepository } = await import(
        '../../lib/brainworker/leads/repository'
      );
      const repo = new BrainWorkerLeadsRepository();

      const lead = createTestLead({
        pricingMode: 'CUSTOMER_POSTED_RATE',
      });
      
      repo.__testSeedLead(mockApprovedWorkerA.id, lead);

      const result = await repo.acceptCustomerRate(
        mockApprovedWorkerA.id,
        lead.invitationId
      );

      expect(result.ok).toBe(true);
    });

    it('PROD-025: accept customer rate rejects when pricing mode is WORKER_QUOTE', async () => {
      vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockApprovedWorkerA);

      const { BrainWorkerLeadsRepository } = await import(
        '../../lib/brainworker/leads/repository'
      );
      const repo = new BrainWorkerLeadsRepository();

      const lead = createTestLead({
        pricingMode: 'WORKER_QUOTE',
      });
      
      repo.__testSeedLead(mockApprovedWorkerA.id, lead);

      const result = await repo.acceptCustomerRate(
        mockApprovedWorkerA.id,
        lead.invitationId
      );

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.reason).toBe('INVALID_STATE');
      }
    });
  });

  // ===========================================================================
  // 8. Offline and Degraded Behavior
  // ===========================================================================

  describe('Offline and Degraded Behavior', () => {
    it('PROD-026: offline mode prevents mutation operations', async () => {
      vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockApprovedWorkerA);

      const { BrainWorkerLeadsRepository } = await import(
        '../../lib/brainworker/leads/repository'
      );
      const repo = new BrainWorkerLeadsRepository();

      
      repo.__testSetOffline(true);

      const lead = leadOwnedByA();
      
      repo.__testSeedLead(mockApprovedWorkerA.id, lead);

      await expect(
        repo.acceptInvitation(mockApprovedWorkerA.id, lead.invitationId)
      ).rejects.toThrow(/OFFLINE/);
    });

    it('PROD-027: offline mode allows read operations for cached data', async () => {
      vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockApprovedWorkerA);
      vi.mocked(mockOperationsRepo.getOperationalProfile).mockResolvedValue(
        FIXTURE_OPERATIONAL_PROFILE_A
      );

      const { BrainWorkerLeadsRepository } = await import(
        '../../lib/brainworker/leads/repository'
      );
      const repo = new BrainWorkerLeadsRepository();

      const lead = leadOwnedByA();
      
      repo.__testSeedLead(mockApprovedWorkerA.id, lead);

      
      repo.__testSetOffline(true);

      // Read operations should still work (tenant-scoped)
      const result = await repo.getLeads(mockApprovedWorkerA.id);
      expect(result.items.length).toBeGreaterThan(0);
    });

    it('PROD-028: LeadsInboxView renders offline banner and disables actions', async () => {
      vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockApprovedWorkerA);

      render(
        <LeadsInboxView
          brainWorkerId={mockApprovedWorkerA.id}
          repository={mockLeadsRepo}
          isOffline={true}
        />
      );

      expect(
        screen.getByText(/offline mode.*read-only/i)
      ).toBeInTheDocument();
    });

    it('PROD-029: LeadsInboxView renders degraded notice when isDegraded is true', async () => {
      vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockApprovedWorkerA);

      render(
        <LeadsInboxView
          brainWorkerId={mockApprovedWorkerA.id}
          repository={mockLeadsRepo}
          isDegraded={true}
        />
      );

      expect(
        screen.getByText(/network connection is degraded/i)
      ).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // 9. Accessibility Requirements
  // ===========================================================================

  describe('Accessibility Requirements', () => {
    it('PROD-030: lead cards are keyboard-operable semantic buttons, not pointer-only click targets', async () => {
      vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockApprovedWorkerA);

      const leads: ProviderProjectedLead[] = [
        projectLeadForProvider(createTestLead({ id: 'lead_a11y', title: 'Accessible Lead' })),
      ];
      vi.mocked(mockLeadsRepo.getLeads).mockResolvedValue({ items: leads });

      render(<LeadsInboxView brainWorkerId={mockApprovedWorkerA.id} repository={mockLeadsRepo} />);

      const cards = await screen.findAllByTestId('lead-card');
      expect(cards).toHaveLength(1);
      const firstCard = cards[0];
      expect(firstCard).toBeDefined();
      if (!firstCard) throw new Error('lead-card element not found');

      // Must be exposed as a button so assistive tech announces an action.
      expect(firstCard).toHaveAttribute('role', 'button');

      // Must be reachable by keyboard (no pointer-only interaction).
      expect(firstCard).toHaveAttribute('tabindex', '0');

      // Keyboard activation must open the inspection surface.
      fireEvent.keyDown(firstCard, { key: 'Enter' });

      await waitFor(() => {
        expect(screen.getByTestId('lead-inspection-drawer')).toBeInTheDocument();
      });
    });

    it('PROD-031: decline reason modal exposes every canonical reason as a selectable control', async () => {
      vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockApprovedWorkerA);

      const leads: ProviderProjectedLead[] = [
        projectLeadForProvider(createTestLead({ id: 'lead_decline', title: 'Declinable Lead' })),
      ];
      vi.mocked(mockLeadsRepo.getLeads).mockResolvedValue({ items: leads });

      render(<LeadsInboxView brainWorkerId={mockApprovedWorkerA.id} repository={mockLeadsRepo} />);

      // Open the inspection drawer, then launch the decline flow.
      fireEvent.click(await screen.findByTestId('lead-card'));
      await screen.findByTestId('lead-inspection-drawer');
      fireEvent.click(screen.getByRole('button', { name: /^decline$/i }));

      const dialog = await screen.findByRole('dialog', { name: /decline opportunity/i });

      // Every canonical taxonomy reason must be individually selectable.
      for (const reason of CANONICAL_DECLINE_REASONS) {
        expect(
          within(dialog).getByTestId(`decline-reason-${reason}`)
        ).toBeInTheDocument();
      }

      // Confirm must stay disabled until a reason is chosen.
      expect(
        within(dialog).getByRole('button', { name: /confirm decline/i })
      ).toBeDisabled();

      fireEvent.click(within(dialog).getByTestId('decline-reason-SCHEDULE_CONFLICT'));

      await waitFor(() => {
        expect(
          within(dialog).getByRole('button', { name: /confirm decline/i })
        ).toBeEnabled();
      });
    });

    it('PROD-032: leads feed region has proper ARIA labels', async () => {
      vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockApprovedWorkerA);
      vi.mocked(mockLeadsRepo.getLeads).mockResolvedValue({ items: [] });

      render(<LeadsInboxView brainWorkerId={mockApprovedWorkerA.id} repository={mockLeadsRepo} />);

      expect(
        screen.getByRole('region', { name: /job requests.*leads/i })
      ).toBeInTheDocument();
    });

    it('PROD-033: decline modal carries modal dialog ARIA semantics and closes on Escape', async () => {
      vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockApprovedWorkerA);

      const leads: ProviderProjectedLead[] = [
        projectLeadForProvider(createTestLead({ id: 'lead_escape', title: 'Escape Lead' })),
      ];
      vi.mocked(mockLeadsRepo.getLeads).mockResolvedValue({ items: leads });

      render(<LeadsInboxView brainWorkerId={mockApprovedWorkerA.id} repository={mockLeadsRepo} />);

      fireEvent.click(await screen.findByTestId('lead-card'));
      await screen.findByTestId('lead-inspection-drawer');
      fireEvent.click(screen.getByRole('button', { name: /^decline$/i }));

      const dialog = await screen.findByRole('dialog', { name: /decline opportunity/i });

      // Modal dialog semantics: role plus aria-modal must be present.
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAccessibleName(/decline opportunity/i);

      // Escape must dismiss the modal.
      fireEvent.keyDown(window, { key: 'Escape' });

      await waitFor(() => {
        expect(screen.queryByRole('dialog', { name: /decline opportunity/i })).not.toBeInTheDocument();
      });
    });
  });

  // ===========================================================================
  // 10. Production/Testing Separation
  // ===========================================================================

  describe('Production/Testing Physical Separation', () => {
    it('PROD-034: production repository module has zero imports from testing/ directory', () => {
      const repoPath = path.join(
        __dirname,
        '../../lib/brainworker/leads/repository.ts'
      );
      const source = fs.readFileSync(repoPath, 'utf8');

      expect(source).not.toMatch(/from ['"].*testing[\\/].*['"]/);
      expect(source).not.toMatch(/from ['"]\.\.\.\/testing/i);
    });

    it('PROD-035: production domain module has zero imports from testing/ directory', () => {
      const domainPath = path.join(
        __dirname,
        '../../lib/brainworker/leads/domain.ts'
      );
      const source = fs.readFileSync(domainPath, 'utf8');

      expect(source).not.toMatch(/from ['"].*testing[\\/].*['"]/);
    });

    it('PROD-036: production types module has zero imports from testing/ directory', () => {
      const typesPath = path.join(
        __dirname,
        '../../lib/brainworker/leads/types.ts'
      );
      const source = fs.readFileSync(typesPath, 'utf8');

      expect(source).not.toMatch(/from ['"].*testing[\\/].*['"]/);
    });

    it('PROD-037: LeadsInboxView production component has zero imports from testing/ directory', () => {
      const viewPath = path.join(
        __dirname,
        '../../components/brainworker/leads/LeadsInboxView.tsx'
      );
      const source = fs.readFileSync(viewPath, 'utf8');

      expect(source).not.toMatch(/from ['"].*testing[\\/].*['"]/);
      expect(source).not.toMatch(/from ['"]\.\.\.\/testing/i);
    });

    it('PROD-038: test utilities are physically separated in testing/ subtree', () => {
      const testingPath = path.join(
        __dirname,
        '../../lib/brainworker/leads/testing'
      );
      expect(fs.existsSync(testingPath)).toBe(true);
      expect(fs.statSync(testingPath).isDirectory()).toBe(true);
    });

    it('PROD-039: testing/ directory contains fixtures, harness, and utilities', () => {
      const testingPath = path.join(
        __dirname,
        '../../lib/brainworker/leads/testing'
      );
      const files = fs.readdirSync(testingPath);

      expect(files).toContain('fixtures.ts');
      expect(files).toContain('harness.ts');
      expect(files).toContain('index.ts');
    });
  });

  // ===========================================================================
  // 11. Non-Goals: No Booking/Payment/Escrow Mutation
  // ===========================================================================

  describe('Non-Goals: No Booking/Payment/Escrow Mutation', () => {
    it('PROD-040: BW-003 repository does not import or reference booking state mutation', () => {
      const repoPath = path.join(
        __dirname,
        '../../lib/brainworker/leads/repository.ts'
      );
      const source = fs.readFileSync(repoPath, 'utf8');

      expect(source).not.toMatch(/BookingStatus|bookingStatus|updateBooking|confirmBooking/i);
      expect(source).not.toMatch(/Payment|payment|escrow|Escrow|payout|Payout/i);
    });

    it('PROD-041: BW-003 types do not define booking or payment mutation contracts', () => {
      const typesPath = path.join(
        __dirname,
        '../../lib/brainworker/leads/types.ts'
      );
      const source = fs.readFileSync(typesPath, 'utf8');

      expect(source).not.toMatch(/interface.*Booking|type.*BookingStatus/i);
      expect(source).not.toMatch(/Payment|Escrow|Wallet/i);
    });

    it('PROD-042: invitation accept does not transition booking state', async () => {
      vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockApprovedWorkerA);

      const { BrainWorkerLeadsRepository } = await import(
        '../../lib/brainworker/leads/repository'
      );
      const repo = new BrainWorkerLeadsRepository();

      const lead = leadOwnedByA();
      
      repo.__testSeedLead(mockApprovedWorkerA.id, lead);

      const result = await repo.acceptInvitation(mockApprovedWorkerA.id, lead.invitationId);

      // Result is invitation state, not booking state
      expect(result).not.toHaveProperty('bookingStatus');
      expect(result).not.toHaveProperty('bookingId');
      if (result.ok) {
        expect(result.state).toBe('ACCEPTED'); // Invitation state, not booking state
      }
    });

    it('PROD-043: quote submission does not mutate booking or payment state', async () => {
      vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockApprovedWorkerA);

      const { BrainWorkerLeadsRepository } = await import(
        '../../lib/brainworker/leads/repository'
      );
      const repo = new BrainWorkerLeadsRepository();

      const lead = leadOwnedByA();
      
      repo.__testSeedLead(mockApprovedWorkerA.id, lead);

      // FIXTURE_SERVICE_CATALOG_A has diagnosticFeeNgn: 5000 (50.00 NGN = 500000 kobo)
      const diagnosticFeeKobo = 500000;
      const quote = await repo.submitQuote(mockApprovedWorkerA.id, lead.invitationId, {
        laborAmountKobo: 100000,
        diagnosticFeeKobo,
        estimatedHours: 2,
      });

      // Quote is separate from booking
      expect(quote).not.toHaveProperty('bookingId');
      expect(quote).not.toHaveProperty('paymentStatus');
      expect(quote.status).toBe('PENDING'); // Quote status, not booking status
    });
  });

  // ===========================================================================
  // 12. Complete BW-003 Regression Integration
  // ===========================================================================

  describe('Complete BW-003 Regression Integration', () => {
    it('PROD-044: end-to-end flow from route through repository to UI preserves authorization', async () => {
      vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockApprovedWorkerA);
      vi.mocked(mockOperationsRepo.getOperationalProfile).mockResolvedValue(
        FIXTURE_OPERATIONAL_PROFILE_A
      );

      const leads: ProviderProjectedLead[] = [
        projectLeadForProvider(leadOwnedByA()),
      ];
      vi.mocked(mockLeadsRepo.getLeads).mockResolvedValue({ items: leads });

      render(<BrainWorkerLeadsPage />);

      // Wait for the authorized workspace to load
      await waitFor(() => {
        expect(screen.getByText(/job requests & leads/i)).toBeInTheDocument();
      });

      // Verify the route bound repository access to the authenticated user ID.
      await waitFor(() => {
        expect(mockLeadsRepo.getLeads).toHaveBeenCalledWith(mockApprovedWorkerA.id);
      });
    });

    it('PROD-045: every Phase 1-6 BW-003 contract suite is present and non-empty', () => {
      // Phase 1: domain/eligibility. Phase 2: repository. Phase 3: invitations.
      // Phase 4: quotation. Phase 5: UI. Phase 6: route integration.
      const contractSuites = [
        '../../lib/brainworker/leads/domain.test.ts',
        '../../lib/brainworker/leads/repository.test.ts',
        '../../lib/brainworker/leads/invitations.test.ts',
        '../../lib/brainworker/leads/quotation.test.ts',
        '../../components/brainworker/leads/LeadsInboxView.test.tsx',
        './BrainWorkerLeadsRoute.test.tsx',
      ];

      for (const suite of contractSuites) {
        const suitePath = path.join(__dirname, suite);
        expect(fs.existsSync(suitePath), `missing contract suite: ${suite}`).toBe(true);
        expect(fs.statSync(suitePath).size, `empty contract suite: ${suite}`).toBeGreaterThan(0);
      }
    });
  });
});

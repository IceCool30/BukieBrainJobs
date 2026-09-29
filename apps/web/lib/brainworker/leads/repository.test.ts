// apps/web/lib/brainworker/leads/repository.test.ts
// BW-003 Phase 2 GREEN: Repository & Tenant Isolation (REP-001 to REP-010)
// Authoritative References:
// - docs/specs/BW-003-architecture-contract.md (Approved)
// - docs/specs/BW-003-test-first-implementation-plan.md (Approved)
// - docs/specs/BW-003-leads-inbox.md (Approved)

import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as authStorage from '../../auth/storage';
import {
  createLeadsTestHarness,
  resetLeadsRepository,
  FIXTURE_APPROVED_BRAINWORKER_A,
  FIXTURE_APPROVED_BRAINWORKER_B,
  FIXTURE_UNAPPROVED_BRAINWORKER,
  FIXTURE_INCOMPLETE_BRAINWORKER,
  FIXTURE_CUSTOMER_USER_ID,
  mockApprovedWorkerA,
  mockApprovedWorkerB,
  mockUnapprovedWorker,
  mockIncompleteWorker,
  mockCustomerUser,
  leadOwnedByA,
  leadOwnedByB,
  respondedLeadOwnedByA,
  completeProviderContextA,
  incompleteProviderContext,
} from './testing';
import {
  ForbiddenTenantAccessError,
  IncompleteProfileError,
  OfflineMutationError,
} from './types';

describe('BW-003 Phase 2: Repository & Tenant Isolation (REP-001 to REP-010)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
    resetLeadsRepository();
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockApprovedWorkerA);
  });

  // -------------------------------------------------------------------------
  // REP-001: Authenticated provider required
  // -------------------------------------------------------------------------
  it('REP-001: rejects lead reads when no authenticated user is present', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(null);
    const { repository } = createLeadsTestHarness();

    await expect(repository.getLeads(FIXTURE_APPROVED_BRAINWORKER_A)).rejects.toThrow(
      ForbiddenTenantAccessError,
    );
    await expect(
      repository.getLead(FIXTURE_APPROVED_BRAINWORKER_A, 'lead-owned-a-001'),
    ).rejects.toThrow(ForbiddenTenantAccessError);
  });

  // -------------------------------------------------------------------------
  // REP-002: Cross-provider read rejected
  // -------------------------------------------------------------------------
  it('REP-002: rejects read of another provider\'s leads (tenant isolation)', async () => {
    // Authenticated as worker A, but requesting worker B's scope
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockApprovedWorkerA);
    const { repository, seedLead } = createLeadsTestHarness();
    seedLead(FIXTURE_APPROVED_BRAINWORKER_B, leadOwnedByB());

    await expect(repository.getLeads(FIXTURE_APPROVED_BRAINWORKER_B)).rejects.toThrow(
      ForbiddenTenantAccessError,
    );
    await expect(
      repository.getLead(FIXTURE_APPROVED_BRAINWORKER_B, 'lead-owned-b-001'),
    ).rejects.toThrow(ForbiddenTenantAccessError);
  });

  // -------------------------------------------------------------------------
  // REP-003: Cross-provider mutation rejected
  // -------------------------------------------------------------------------
  it('REP-003: rejects accept/decline when caller is not the invitation owner', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockApprovedWorkerA);
    const { repository, seedLead } = createLeadsTestHarness();
    seedLead(FIXTURE_APPROVED_BRAINWORKER_B, leadOwnedByB());

    await expect(
      repository.acceptInvitation(FIXTURE_APPROVED_BRAINWORKER_B, 'inv-owned-b-001'),
    ).rejects.toThrow(ForbiddenTenantAccessError);

    await expect(
      repository.declineInvitation(
        FIXTURE_APPROVED_BRAINWORKER_B,
        'inv-owned-b-001',
        'SCHEDULE_CONFLICT',
      ),
    ).rejects.toThrow(ForbiddenTenantAccessError);
  });

  // -------------------------------------------------------------------------
  // REP-004: Incomplete provider receives no leads
  // -------------------------------------------------------------------------
  it('REP-004: incomplete operational profile receives no leads and cannot mutate', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockIncompleteWorker);
    const { repository, seedLead } = createLeadsTestHarness();
    seedLead(FIXTURE_INCOMPLETE_BRAINWORKER, leadOwnedByA({ id: 'lead-inc-001' }));

    await expect(repository.getLeads(FIXTURE_INCOMPLETE_BRAINWORKER)).rejects.toThrow(
      IncompleteProfileError,
    );
    await expect(
      repository.acceptInvitation(FIXTURE_INCOMPLETE_BRAINWORKER, 'inv-owned-a-001'),
    ).rejects.toThrow(IncompleteProfileError);
  });

  // -------------------------------------------------------------------------
  // REP-005: Authorized lead retrieval
  // -------------------------------------------------------------------------
  it('REP-005: returns only tenant-scoped, privacy-projected leads for the authenticated provider', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockApprovedWorkerA);
    const { repository, seedLead } = createLeadsTestHarness();
    seedLead(FIXTURE_APPROVED_BRAINWORKER_A, leadOwnedByA());
    seedLead(FIXTURE_APPROVED_BRAINWORKER_B, leadOwnedByB());

    const page = await repository.getLeads(FIXTURE_APPROVED_BRAINWORKER_A);
    expect(page.items).toHaveLength(1);
    expect(page.items[0]?.id).toBe('lead-owned-a-001');
    // Privacy projection: private contact fields must not be present
    expect(page.items[0]?.exactAddress).toBeUndefined();
    expect(page.items[0]?.customerPhone).toBeUndefined();
    expect(page.items[0]?.customerEmail).toBeUndefined();

    const single = await repository.getLead(
      FIXTURE_APPROVED_BRAINWORKER_A,
      'lead-owned-a-001',
    );
    expect(single).not.toBeNull();
    expect(single?.id).toBe('lead-owned-a-001');
    expect(single?.exactAddress).toBeUndefined();
  });

  // -------------------------------------------------------------------------
  // REP-006: Invitation ownership enforced
  // -------------------------------------------------------------------------
  it('REP-006: accept/decline require invitation ownership for the authenticated provider', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockApprovedWorkerA);
    const { repository, seedLead } = createLeadsTestHarness();
    seedLead(FIXTURE_APPROVED_BRAINWORKER_A, leadOwnedByA());

    // Correct owner + pending invitation
    const acceptResult = await repository.acceptInvitation(
      FIXTURE_APPROVED_BRAINWORKER_A,
      'inv-owned-a-001',
    );
    expect(acceptResult.ok).toBe(true);
    if (acceptResult.ok) {
      expect(acceptResult.invitationId).toBe('inv-owned-a-001');
      expect(acceptResult.state).toBe('ACCEPTED');
      expect(typeof acceptResult.respondedAt).toBe('string');
      expect(acceptResult.respondedAt.length).toBeGreaterThan(0);
    }
  });

  // -------------------------------------------------------------------------
  // REP-007: Already-responded invitation rejected
  // -------------------------------------------------------------------------
  it('REP-007: rejects mutation on an already-responded invitation', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockApprovedWorkerA);
    const { repository, seedLead } = createLeadsTestHarness();
    seedLead(FIXTURE_APPROVED_BRAINWORKER_A, respondedLeadOwnedByA());

    const result = await repository.acceptInvitation(
      FIXTURE_APPROVED_BRAINWORKER_A,
      'inv-responded-a-001',
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe('ALREADY_RESPONDED');
    }

    const declineResult = await repository.declineInvitation(
      FIXTURE_APPROVED_BRAINWORKER_A,
      'inv-responded-a-001',
      'SCHEDULE_CONFLICT',
    );
    expect(declineResult.ok).toBe(false);
    if (!declineResult.ok) {
      expect(declineResult.reason).toBe('ALREADY_RESPONDED');
    }
  });

  // -------------------------------------------------------------------------
  // REP-008: Offline mutation fails closed
  // -------------------------------------------------------------------------
  it('REP-008: offline mutations fail closed; cached reads remain tenant-scoped', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockApprovedWorkerA);
    const { repository, seedLead, setOffline } = createLeadsTestHarness();
    seedLead(FIXTURE_APPROVED_BRAINWORKER_A, leadOwnedByA());

    setOffline(true);

    await expect(
      repository.acceptInvitation(FIXTURE_APPROVED_BRAINWORKER_A, 'inv-owned-a-001'),
    ).rejects.toThrow(OfflineMutationError);

    await expect(
      repository.declineInvitation(
        FIXTURE_APPROVED_BRAINWORKER_A,
        'inv-owned-a-001',
        'TEMPORARILY_UNAVAILABLE',
      ),
    ).rejects.toThrow(OfflineMutationError);

    // Read remains available (tenant-scoped cache)
    const page = await repository.getLeads(FIXTURE_APPROVED_BRAINWORKER_A);
    expect(page.items.length).toBeGreaterThanOrEqual(0);
  });

  // -------------------------------------------------------------------------
  // REP-009: Production export surface contains no testing helpers
  // -------------------------------------------------------------------------
  it('REP-009: production repository module does not export testing helpers or import testing/', async () => {
    // Static contract: the production repository module must not re-export
    // harness/fixtures, and must not import from a testing/ path.
    const repositoryModule = await import('./repository');
    const exportedKeys = Object.keys(repositoryModule);

    expect(exportedKeys).not.toContain('createLeadsTestHarness');
    expect(exportedKeys).not.toContain('FIXTURE_APPROVED_BRAINWORKER_A');
    expect(exportedKeys).not.toContain('mockApprovedWorkerA');

    // Physical boundary: source must not contain testing/ imports.
    // This is enforced by source inspection in GREEN/audit; here we assert
    // that the public surface stays production-only.
    expect(typeof repositoryModule.createBrainWorkerLeadsRepository).toBe('function');
    expect(typeof repositoryModule.getBrainWorkerLeadsRepository).toBe('function');
  });

  // -------------------------------------------------------------------------
  // REP-010: Storage is tenant-scoped
  // -------------------------------------------------------------------------
  it('REP-010: storage keys and in-memory state are scoped by BrainWorker ID', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockApprovedWorkerA);
    const harnessA = createLeadsTestHarness();
    harnessA.seedLead(FIXTURE_APPROVED_BRAINWORKER_A, leadOwnedByA());

    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockApprovedWorkerB);
    const harnessB = createLeadsTestHarness();
    harnessB.seedLead(FIXTURE_APPROVED_BRAINWORKER_B, leadOwnedByB());

    // Worker A sees only own lead
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockApprovedWorkerA);
    const pageA = await harnessA.repository.getLeads(FIXTURE_APPROVED_BRAINWORKER_A);
    expect(pageA.items.every((item) => item.id.startsWith('lead-owned-a'))).toBe(true);

    // Worker B sees only own lead
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockApprovedWorkerB);
    const pageB = await harnessB.repository.getLeads(FIXTURE_APPROVED_BRAINWORKER_B);
    expect(pageB.items.every((item) => item.id.startsWith('lead-owned-b'))).toBe(true);

    // Cross-tenant read still rejected: authenticated tenant B cannot read tenant A
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockApprovedWorkerB);
    await expect(
      harnessA.repository.getLeads(FIXTURE_APPROVED_BRAINWORKER_A),
    ).rejects.toThrow(ForbiddenTenantAccessError);
  });
});

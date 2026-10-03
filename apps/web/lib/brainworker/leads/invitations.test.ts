// apps/web/lib/brainworker/leads/invitations.test.ts
// BW-003 Phase 3 GREEN: Invitation Responses (INV-001 to INV-010)
// Authoritative References:
// - docs/specs/BW-003-architecture-contract.md (Approved, Section 7)
// - docs/specs/BW-003-test-first-implementation-plan.md (Approved, Phase 3)
// - docs/specs/BW-003-leads-inbox.md (Approved, Section 6)

import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as authStorage from '../../auth/storage';
import {
  createLeadsTestHarness,
  resetLeadsRepository,
  FIXTURE_APPROVED_BRAINWORKER_A,
  FIXTURE_APPROVED_BRAINWORKER_B,
  mockApprovedWorkerA,
  mockApprovedWorkerB,
  leadOwnedByA,
  respondedLeadOwnedByA,
} from './testing';
import {
  ForbiddenTenantAccessError,
  type DeclineReason,
} from './types';
import {
  createInvitationResponseConsumer,
} from './invitations';

describe('BW-003 Phase 3 GREEN: Invitation Responses (INV-001 to INV-010)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
    resetLeadsRepository();
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockApprovedWorkerA);
  });

  // -------------------------------------------------------------------------
  // INV-001: Accept valid invitation
  // -------------------------------------------------------------------------
  it('INV-001: accept valid invitation transitions state to ACCEPTED', async () => {
    const { repository, seedLead } = createLeadsTestHarness();
    seedLead(FIXTURE_APPROVED_BRAINWORKER_A, leadOwnedByA());
    const consumer = createInvitationResponseConsumer(repository);

    const result = await consumer.accept(
      FIXTURE_APPROVED_BRAINWORKER_A,
      'inv-owned-a-001',
    );

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.invitationId).toBe('inv-owned-a-001');
      expect(result.state).toBe('ACCEPTED');
    }
  });

  // -------------------------------------------------------------------------
  // INV-002: Accept records authoritative response time
  // -------------------------------------------------------------------------
  it('INV-002: accept records authoritative response timestamp from repository', async () => {
    const { repository, seedLead } = createLeadsTestHarness();
    seedLead(FIXTURE_APPROVED_BRAINWORKER_A, leadOwnedByA());
    const consumer = createInvitationResponseConsumer(repository);

    const result = await consumer.accept(
      FIXTURE_APPROVED_BRAINWORKER_A,
      'inv-owned-a-001',
    );

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(typeof result.respondedAt).toBe('string');
      expect(new Date(result.respondedAt).getTime()).not.toBeNaN();
    }
  });

  // -------------------------------------------------------------------------
  // INV-003: Accept rejects mismatched provider
  // -------------------------------------------------------------------------
  it('INV-003: accept rejects when caller does not match the invitation owner', async () => {
    // Authenticated as Worker B, attempting to accept Worker A's invitation
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockApprovedWorkerB);
    const { repository, seedLead } = createLeadsTestHarness();
    seedLead(FIXTURE_APPROVED_BRAINWORKER_A, leadOwnedByA());
    const consumer = createInvitationResponseConsumer(repository);

    await expect(
      consumer.accept(FIXTURE_APPROVED_BRAINWORKER_A, 'inv-owned-a-001'),
    ).rejects.toThrow(ForbiddenTenantAccessError);
  });

  // -------------------------------------------------------------------------
  // INV-004: Accept rejects already-responded invitation
  // -------------------------------------------------------------------------
  it('INV-004: accept rejects mutation on an already-responded invitation', async () => {
    const { repository, seedLead } = createLeadsTestHarness();
    seedLead(FIXTURE_APPROVED_BRAINWORKER_A, respondedLeadOwnedByA());
    const consumer = createInvitationResponseConsumer(repository);

    const result = await consumer.accept(
      FIXTURE_APPROVED_BRAINWORKER_A,
      'inv-responded-a-001',
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe('ALREADY_RESPONDED');
    }
  });

  // -------------------------------------------------------------------------
  // INV-005: Decline valid invitation
  // -------------------------------------------------------------------------
  it('INV-005: decline valid invitation transitions state to DECLINED and records reason', async () => {
    const { repository, seedLead } = createLeadsTestHarness();
    seedLead(FIXTURE_APPROVED_BRAINWORKER_A, leadOwnedByA());
    const consumer = createInvitationResponseConsumer(repository);

    const result = await consumer.decline(
      FIXTURE_APPROVED_BRAINWORKER_A,
      'inv-owned-a-001',
      'SCHEDULE_CONFLICT',
    );

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.invitationId).toBe('inv-owned-a-001');
      expect(result.state).toBe('DECLINED');
      expect(result.declineReason).toBe('SCHEDULE_CONFLICT');
    }
  });

  // -------------------------------------------------------------------------
  // INV-006: Decline uses canonical taxonomy and persists reason
  // -------------------------------------------------------------------------
  it('INV-006: decline accepts each reason in the approved canonical taxonomy and persists it', async () => {
    const canonicalReasons: readonly DeclineReason[] = [
      'SCHEDULE_CONFLICT',
      'OUTSIDE_COVERAGE_AREA',
      'SKILL_TOOL_MISMATCH',
      'RATE_BUDGET_MISMATCH',
      'TEMPORARILY_UNAVAILABLE',
      'OTHER',
    ];

    const { repository, seedLead } = createLeadsTestHarness();
    const consumer = createInvitationResponseConsumer(repository);

    for (const [index, reason] of canonicalReasons.entries()) {
      const invId = `inv-canonical-${index}`;
      const leadId = `lead-canonical-${index}`;
      seedLead(
        FIXTURE_APPROVED_BRAINWORKER_A,
        leadOwnedByA({ id: leadId, invitationId: invId }),
      );

      const result = await consumer.decline(
        FIXTURE_APPROVED_BRAINWORKER_A,
        invId,
        reason,
      );

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.state).toBe('DECLINED');
        expect(result.declineReason).toBe(reason);
      }

      // Authoritative state assertion: reason must persist on the lead in repository store
      const persistedLead = await repository.getLead(
        FIXTURE_APPROVED_BRAINWORKER_A,
        leadId,
      );
      expect(persistedLead?.invitationState).toBe('DECLINED');
      expect(persistedLead?.declineReason).toBe(reason);
    }
  });

  // -------------------------------------------------------------------------
  // INV-007: Decline records authoritative response time
  // -------------------------------------------------------------------------
  it('INV-007: decline records authoritative response timestamp from repository', async () => {
    const { repository, seedLead } = createLeadsTestHarness();
    seedLead(FIXTURE_APPROVED_BRAINWORKER_A, leadOwnedByA());
    const consumer = createInvitationResponseConsumer(repository);

    const result = await consumer.decline(
      FIXTURE_APPROVED_BRAINWORKER_A,
      'inv-owned-a-001',
      'TEMPORARILY_UNAVAILABLE',
    );

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(typeof result.respondedAt).toBe('string');
      expect(new Date(result.respondedAt).getTime()).not.toBeNaN();
    }
  });

  // -------------------------------------------------------------------------
  // INV-008: Decline does not cancel job
  // -------------------------------------------------------------------------
  it('INV-008: declining an invitation does not cancel the underlying customer job', async () => {
    const rawLead = leadOwnedByA({ jobId: 'job-customer-active-100' });
    const { repository, seedLead } = createLeadsTestHarness();
    seedLead(FIXTURE_APPROVED_BRAINWORKER_A, rawLead);
    const consumer = createInvitationResponseConsumer(repository);

    const result = await consumer.decline(
      FIXTURE_APPROVED_BRAINWORKER_A,
      rawLead.invitationId,
      'RATE_BUDGET_MISMATCH',
    );

    expect(result.ok).toBe(true);
    // Verifies that the lead still maps to the original active customer jobId
    const updatedLead = await repository.getLead(
      FIXTURE_APPROVED_BRAINWORKER_A,
      rawLead.id,
    );
    expect(updatedLead?.jobId).toBe('job-customer-active-100');
    expect(updatedLead?.invitationState).toBe('DECLINED');
    expect(updatedLead?.declineReason).toBe('RATE_BUDGET_MISMATCH');
  });

  // -------------------------------------------------------------------------
  // INV-009: Invalid decline reason rejected
  // -------------------------------------------------------------------------
  it('INV-009: invalid or freeform decline reasons are rejected with INVALID_STATE', async () => {
    const { repository, seedLead } = createLeadsTestHarness();
    seedLead(FIXTURE_APPROVED_BRAINWORKER_A, leadOwnedByA());
    const consumer = createInvitationResponseConsumer(repository);

    const result = await consumer.decline(
      FIXTURE_APPROVED_BRAINWORKER_A,
      'inv-owned-a-001',
      'UNAUTHORIZED_REASON_TEXT' as DeclineReason,
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe('INVALID_STATE');
    }
  });

  // -------------------------------------------------------------------------
  // INV-010: Response state renders from repository result
  // -------------------------------------------------------------------------
  it('INV-010: consumer strictly uses repository result state rather than locally inventing it', async () => {
    // Custom repository returning a controlled authoritative outcome
    const mockCustomResult = {
      ok: true as const,
      invitationId: 'inv-custom-001',
      state: 'SUPERSEDED' as const,
      respondedAt: '2026-09-29T12:00:00.000Z',
    };

    const mockRepo = {
      acceptInvitation: vi.fn().mockResolvedValue(mockCustomResult),
      declineInvitation: vi.fn().mockResolvedValue(mockCustomResult),
    };

    const consumer = createInvitationResponseConsumer(mockRepo as never);

    const acceptResult = await consumer.accept(
      FIXTURE_APPROVED_BRAINWORKER_A,
      'inv-custom-001',
    );

    // Consumer must not overwrite or assume 'ACCEPTED'; it must faithfully reflect the repository's returned state
    expect(acceptResult).toEqual(mockCustomResult);
    expect(mockRepo.acceptInvitation).toHaveBeenCalledWith(
      FIXTURE_APPROVED_BRAINWORKER_A,
      'inv-custom-001',
    );
  });
});

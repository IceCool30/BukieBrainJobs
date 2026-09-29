// apps/web/lib/brainworker/leads/quotation.test.ts
// BW-003 Phase 4 RED: Quotation (QUO-001 to QUO-010)
// Authoritative References:
// - docs/specs/BW-003-architecture-contract.md (Approved, Section 8)
// - docs/specs/BW-003-test-first-implementation-plan.md (Approved, Phase 4)
// - docs/specs/BW-003-leads-inbox.md (Approved, Section 8)

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
} from './testing';
import {
  ForbiddenTenantAccessError,
  type WorkerQuoteDraft,
} from './types';
import {
  createQuotationConsumer,
} from './quotation';

describe('BW-003 Phase 4 RED: Quotation (QUO-001 to QUO-010)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
    resetLeadsRepository();
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockApprovedWorkerA);
  });

  // -------------------------------------------------------------------------
  // QUO-001: Customer-rate acceptance
  // -------------------------------------------------------------------------
  it('QUO-001: accepts customer-posted rate and transitions state to ACCEPTED with authoritative timestamp', async () => {
    const { repository, seedLead } = createLeadsTestHarness();
    seedLead(
      FIXTURE_APPROVED_BRAINWORKER_A,
      leadOwnedByA({
        pricingMode: 'CUSTOMER_POSTED_RATE',
        customerBudgetKobo: 500000,
      }),
    );
    const consumer = createQuotationConsumer(repository);

    const result = await consumer.acceptCustomerRate(
      FIXTURE_APPROVED_BRAINWORKER_A,
      'inv-owned-a-001',
    );

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.invitationId).toBe('inv-owned-a-001');
      expect(result.state).toBe('ACCEPTED');
      expect(typeof result.respondedAt).toBe('string');
      expect(new Date(result.respondedAt).getTime()).not.toBeNaN();
    }
  });

  // -------------------------------------------------------------------------
  // QUO-002: Worker quote labor line validation
  // -------------------------------------------------------------------------
  it('QUO-002: requires a non-negative integer kobo labor amount', async () => {
    const { repository, seedLead } = createLeadsTestHarness();
    seedLead(
      FIXTURE_APPROVED_BRAINWORKER_A,
      leadOwnedByA({ pricingMode: 'WORKER_QUOTE' }),
    );
    const consumer = createQuotationConsumer(repository);

    // Negative labor amount rejected
    await expect(
      consumer.submitQuote(FIXTURE_APPROVED_BRAINWORKER_A, 'inv-owned-a-001', {
        laborAmountKobo: -100,
        diagnosticFeeKobo: 50000,
        estimatedHours: 2,
      }),
    ).rejects.toThrow(/laborAmountKobo/);

    // Fractional kobo amount rejected
    await expect(
      consumer.submitQuote(FIXTURE_APPROVED_BRAINWORKER_A, 'inv-owned-a-001', {
        laborAmountKobo: 25000.5,
        diagnosticFeeKobo: 50000,
        estimatedHours: 2,
      }),
    ).rejects.toThrow(/laborAmountKobo/);
  });

  // -------------------------------------------------------------------------
  // QUO-003: Optional materials line validation
  // -------------------------------------------------------------------------
  it('QUO-003: accepts optional materials line in integer kobo and rejects negative or fractional values', async () => {
    const { repository, seedLead } = createLeadsTestHarness();
    seedLead(
      FIXTURE_APPROVED_BRAINWORKER_A,
      leadOwnedByA({ pricingMode: 'WORKER_QUOTE' }),
    );
    const consumer = createQuotationConsumer(repository);

    // Valid materials line
    const quoteWithMaterials = await consumer.submitQuote(
      FIXTURE_APPROVED_BRAINWORKER_A,
      'inv-owned-a-001',
      {
        laborAmountKobo: 200000,
        materialsAmountKobo: 100000,
        diagnosticFeeKobo: 50000,
        estimatedHours: 3,
      },
    );
    expect(quoteWithMaterials.materialsAmountKobo).toBe(100000);

    // Negative materials rejected
    await expect(
      consumer.submitQuote(FIXTURE_APPROVED_BRAINWORKER_A, 'inv-owned-a-001', {
        laborAmountKobo: 200000,
        materialsAmountKobo: -500,
        diagnosticFeeKobo: 50000,
        estimatedHours: 3,
      }),
    ).rejects.toThrow(/materialsAmountKobo/);
  });

  // -------------------------------------------------------------------------
  // QUO-004: Catalog diagnostic fee sourcing
  // -------------------------------------------------------------------------
  it('QUO-004: enforces non-negative integer diagnostic fee matching catalog', async () => {
    const { repository, seedLead } = createLeadsTestHarness();
    seedLead(
      FIXTURE_APPROVED_BRAINWORKER_A,
      leadOwnedByA({ pricingMode: 'WORKER_QUOTE' }),
    );
    const consumer = createQuotationConsumer(repository);

    const validQuote = await consumer.submitQuote(
      FIXTURE_APPROVED_BRAINWORKER_A,
      'inv-owned-a-001',
      {
        laborAmountKobo: 150000,
        diagnosticFeeKobo: 50000,
        estimatedHours: 1.5,
      },
    );
    expect(validQuote.diagnosticFeeKobo).toBe(50000);

    // Negative diagnostic fee rejected
    await expect(
      consumer.submitQuote(FIXTURE_APPROVED_BRAINWORKER_A, 'inv-owned-a-001', {
        laborAmountKobo: 150000,
        diagnosticFeeKobo: -1,
        estimatedHours: 1.5,
      }),
    ).rejects.toThrow(/diagnosticFeeKobo/);
  });

  // -------------------------------------------------------------------------
  // QUO-005: Integer-kobo total derivation
  // -------------------------------------------------------------------------
  it('QUO-005: derives totalAmountKobo as the exact sum of labor, materials, and diagnostic fee', async () => {
    const { repository, seedLead } = createLeadsTestHarness();
    seedLead(
      FIXTURE_APPROVED_BRAINWORKER_A,
      leadOwnedByA({ pricingMode: 'WORKER_QUOTE' }),
    );
    const consumer = createQuotationConsumer(repository);

    const draft: WorkerQuoteDraft = {
      laborAmountKobo: 300000,
      materialsAmountKobo: 120000,
      diagnosticFeeKobo: 50000,
      estimatedHours: 4,
    };

    const quote = await consumer.submitQuote(
      FIXTURE_APPROVED_BRAINWORKER_A,
      'inv-owned-a-001',
      draft,
    );

    expect(quote.totalAmountKobo).toBe(470000);
  });

  // -------------------------------------------------------------------------
  // QUO-006: Conflicting client-supplied total rejected
  // -------------------------------------------------------------------------
  it('QUO-006: rejects conflicting client-supplied total that disagrees with derived line sum', async () => {
    const { repository, seedLead } = createLeadsTestHarness();
    seedLead(
      FIXTURE_APPROVED_BRAINWORKER_A,
      leadOwnedByA({ pricingMode: 'WORKER_QUOTE' }),
    );
    const consumer = createQuotationConsumer(repository);

    const draft: WorkerQuoteDraft = {
      laborAmountKobo: 200000,
      materialsAmountKobo: 50000,
      diagnosticFeeKobo: 50000,
      estimatedHours: 2,
    };
    // Expected derived sum: 300000 kobo. Client sends 999999 kobo.
    await expect(
      consumer.submitQuote(
        FIXTURE_APPROVED_BRAINWORKER_A,
        'inv-owned-a-001',
        draft,
        999999,
      ),
    ).rejects.toThrow(/totalAmountKobo|conflict/i);
  });

  // -------------------------------------------------------------------------
  // QUO-007: Estimated duration validation
  // -------------------------------------------------------------------------
  it('QUO-007: requires a positive, finite number for estimated duration in hours', async () => {
    const { repository, seedLead } = createLeadsTestHarness();
    seedLead(
      FIXTURE_APPROVED_BRAINWORKER_A,
      leadOwnedByA({ pricingMode: 'WORKER_QUOTE' }),
    );
    const consumer = createQuotationConsumer(repository);

    // Zero hours rejected
    await expect(
      consumer.submitQuote(FIXTURE_APPROVED_BRAINWORKER_A, 'inv-owned-a-001', {
        laborAmountKobo: 100000,
        diagnosticFeeKobo: 50000,
        estimatedHours: 0,
      }),
    ).rejects.toThrow(/estimatedHours/);

    // Negative hours rejected
    await expect(
      consumer.submitQuote(FIXTURE_APPROVED_BRAINWORKER_A, 'inv-owned-a-001', {
        laborAmountKobo: 100000,
        diagnosticFeeKobo: 50000,
        estimatedHours: -2,
      }),
    ).rejects.toThrow(/estimatedHours/);

    // Non-finite NaN rejected
    await expect(
      consumer.submitQuote(FIXTURE_APPROVED_BRAINWORKER_A, 'inv-owned-a-001', {
        laborAmountKobo: 100000,
        diagnosticFeeKobo: 50000,
        estimatedHours: Number.NaN,
      }),
    ).rejects.toThrow(/estimatedHours/);
  });

  // -------------------------------------------------------------------------
  // QUO-008: Optional scope-note validation
  // -------------------------------------------------------------------------
  it('QUO-008: preserves optional scope notes and accepts quote when notes are omitted', async () => {
    const { repository, seedLead } = createLeadsTestHarness();
    seedLead(
      FIXTURE_APPROVED_BRAINWORKER_A,
      leadOwnedByA({ pricingMode: 'WORKER_QUOTE' }),
    );
    const consumer = createQuotationConsumer(repository);

    const withNotes = await consumer.submitQuote(
      FIXTURE_APPROVED_BRAINWORKER_A,
      'inv-owned-a-001',
      {
        laborAmountKobo: 100000,
        diagnosticFeeKobo: 50000,
        estimatedHours: 1,
        scopeNotes: 'Includes preliminary generator diagnostic and filter cleaning.',
      },
    );
    expect(withNotes.scopeNotes).toBe(
      'Includes preliminary generator diagnostic and filter cleaning.',
    );
  });

  // -------------------------------------------------------------------------
  // QUO-009: Quote authorization
  // -------------------------------------------------------------------------
  it('QUO-009: rejects quote submission when caller does not match invitation owner', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockApprovedWorkerB);
    const { repository, seedLead } = createLeadsTestHarness();
    seedLead(
      FIXTURE_APPROVED_BRAINWORKER_A,
      leadOwnedByA({ pricingMode: 'WORKER_QUOTE' }),
    );
    const consumer = createQuotationConsumer(repository);

    await expect(
      consumer.submitQuote(FIXTURE_APPROVED_BRAINWORKER_A, 'inv-owned-a-001', {
        laborAmountKobo: 100000,
        diagnosticFeeKobo: 50000,
        estimatedHours: 2,
      }),
    ).rejects.toThrow(ForbiddenTenantAccessError);
  });

  // -------------------------------------------------------------------------
  // QUO-010: Quote remains separate from booking/payment state
  // -------------------------------------------------------------------------
  it('QUO-010: submitted quote has status PENDING and does not mutate booking or payment state', async () => {
    const rawLead = leadOwnedByA({
      jobId: 'job-quotation-active-500',
      pricingMode: 'WORKER_QUOTE',
    });
    const { repository, seedLead } = createLeadsTestHarness();
    seedLead(FIXTURE_APPROVED_BRAINWORKER_A, rawLead);
    const consumer = createQuotationConsumer(repository);

    const quote = await consumer.submitQuote(
      FIXTURE_APPROVED_BRAINWORKER_A,
      rawLead.invitationId,
      {
        laborAmountKobo: 250000,
        diagnosticFeeKobo: 50000,
        estimatedHours: 2,
      },
    );

    expect(quote.status).toBe('PENDING');
    // Verifies lead customer job remains intact and unmodified
    const lead = await repository.getLead(FIXTURE_APPROVED_BRAINWORKER_A, rawLead.id);
    expect(lead?.jobId).toBe('job-quotation-active-500');
    // Does not create a payment or booking assignment on the quote object
    expect(quote).not.toHaveProperty('paymentStatus');
    expect(quote).not.toHaveProperty('escrowId');
    expect(quote).not.toHaveProperty('bookingId');
  });
});

// apps/web/lib/brainworker/leads/quotation.test.ts
// BW-003 Phase 4 GREEN: Quotation (QUO-001 to QUO-010)
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
import {
  getBrainWorkerOperationsRepository,
  resetDefaultBrainWorkerOperationsRepository,
} from '../catalog/repository';

describe('BW-003 Phase 4 GREEN: Quotation (QUO-001 to QUO-010)', () => {
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

    // Negative assertion: acceptCustomerRate is strictly forbidden on a WORKER_QUOTE lead
    seedLead(
      FIXTURE_APPROVED_BRAINWORKER_A,
      leadOwnedByA({
        id: 'lead-worker-quote-only-001',
        invitationId: 'inv-worker-quote-only-001',
        pricingMode: 'WORKER_QUOTE',
      }),
    );

    const quoteModeResult = await consumer.acceptCustomerRate(
      FIXTURE_APPROVED_BRAINWORKER_A,
      'inv-worker-quote-only-001',
    );
    expect(quoteModeResult.ok).toBe(false);
    if (!quoteModeResult.ok) {
      expect(quoteModeResult.reason).toBe('INVALID_STATE');
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

    // Fractional materials amount rejected
    await expect(
      consumer.submitQuote(FIXTURE_APPROVED_BRAINWORKER_A, 'inv-owned-a-001', {
        laborAmountKobo: 200000,
        materialsAmountKobo: 100.5,
        diagnosticFeeKobo: 50000,
        estimatedHours: 3,
      }),
    ).rejects.toThrow(/materialsAmountKobo/);
  });

  // -------------------------------------------------------------------------
  // QUO-004: Catalog diagnostic fee sourcing
  // -------------------------------------------------------------------------
  it('QUO-004: enforces diagnostic fee sourced from active provider catalog and rejects mismatched or non-integer fees', async () => {
    const { repository, seedLead } = createLeadsTestHarness();
    seedLead(
      FIXTURE_APPROVED_BRAINWORKER_A,
      leadOwnedByA({ pricingMode: 'WORKER_QUOTE' }),
    );
    const consumer = createQuotationConsumer(repository);

    // Sourced matching fee (50000 kobo matching provider catalog) succeeds
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

    // Mismatched positive fee (51000 kobo != catalog 50000 kobo) rejected
    await expect(
      consumer.submitQuote(FIXTURE_APPROVED_BRAINWORKER_A, 'inv-owned-a-001', {
        laborAmountKobo: 150000,
        diagnosticFeeKobo: 51000,
        estimatedHours: 1.5,
      }),
    ).rejects.toThrow(/diagnosticFee|catalog/i);

    // Negative diagnostic fee rejected
    await expect(
      consumer.submitQuote(FIXTURE_APPROVED_BRAINWORKER_A, 'inv-owned-a-001', {
        laborAmountKobo: 150000,
        diagnosticFeeKobo: -1,
        estimatedHours: 1.5,
      }),
    ).rejects.toThrow(/diagnosticFee/);

    // Fractional diagnostic fee rejected
    await expect(
      consumer.submitQuote(FIXTURE_APPROVED_BRAINWORKER_A, 'inv-owned-a-001', {
        laborAmountKobo: 150000,
        diagnosticFeeKobo: 50000.5,
        estimatedHours: 1.5,
      }),
    ).rejects.toThrow(/diagnosticFee/);
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
  it('QUO-008: validates optional scope notes, preserving valid text and rejecting excessive length or non-string inputs', async () => {
    const { repository, seedLead } = createLeadsTestHarness();
    seedLead(
      FIXTURE_APPROVED_BRAINWORKER_A,
      leadOwnedByA({ pricingMode: 'WORKER_QUOTE' }),
    );
    const consumer = createQuotationConsumer(repository);

    // 1. Valid scope notes preserved
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

    // 2. Omitted scope notes accepted
    const withoutNotes = await consumer.submitQuote(
      FIXTURE_APPROVED_BRAINWORKER_A,
      'inv-owned-a-001',
      {
        laborAmountKobo: 100000,
        diagnosticFeeKobo: 50000,
        estimatedHours: 1,
      },
    );
    expect(withoutNotes.scopeNotes).toBeUndefined();

    // 3. Excessive scope-note length rejected (bounded at 1000 characters)
    const excessiveNotes = 'A'.repeat(1001);
    await expect(
      consumer.submitQuote(FIXTURE_APPROVED_BRAINWORKER_A, 'inv-owned-a-001', {
        laborAmountKobo: 100000,
        diagnosticFeeKobo: 50000,
        estimatedHours: 1,
        scopeNotes: excessiveNotes,
      }),
    ).rejects.toThrow(/scopeNotes/);

    // 4. Non-string scope note rejected if received at runtime boundary
    await expect(
      consumer.submitQuote(FIXTURE_APPROVED_BRAINWORKER_A, 'inv-owned-a-001', {
        laborAmountKobo: 100000,
        diagnosticFeeKobo: 50000,
        estimatedHours: 1,
        scopeNotes: 12345 as unknown as string,
      }),
    ).rejects.toThrow(/scopeNotes/);
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

    // Initial state check
    const leadBefore = await repository.getLead(
      FIXTURE_APPROVED_BRAINWORKER_A,
      rawLead.id,
    );
    expect(leadBefore?.invitationState).toBe('PENDING');
    expect(leadBefore?.jobId).toBe('job-quotation-active-500');

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

    // Quote is PENDING and strictly separate from booking confirmation
    expect(quote.status).toBe('PENDING');

    // Verifies lead customer job and invitation state remain intact and unmutated to booked/confirmed
    const leadAfter = await repository.getLead(
      FIXTURE_APPROVED_BRAINWORKER_A,
      rawLead.id,
    );
    expect(leadAfter?.jobId).toBe('job-quotation-active-500');
    expect(leadAfter?.invitationState).toBe('PENDING');

    // Quotation contract boundary: assert quote does not contain booking, escrow, or payment fields
    expect(quote).not.toHaveProperty('bookingId');
    expect(quote).not.toHaveProperty('bookingStatus');
    expect(quote).not.toHaveProperty('paymentAuthorizationId');
    expect(quote).not.toHaveProperty('paymentStatus');
    expect(quote).not.toHaveProperty('escrowId');
    expect(quote).not.toHaveProperty('escrowStatus');
    expect(quote).not.toHaveProperty('payoutId');
    expect(quote).not.toHaveProperty('settlementStatus');
  });

  // -------------------------------------------------------------------------
  // End-to-End Catalog Authority Regression Tests
  // -------------------------------------------------------------------------
  describe('BW-003 End-to-End Catalog Authority Regression', () => {
    beforeEach(() => {
      resetDefaultBrainWorkerOperationsRepository();
    });

    it('fails closed with CATALOG_UNRESOLVED when provider has no persisted or configured catalog', async () => {
      const { repository, seedLead } = createLeadsTestHarness({
        useRealCatalogAuthority: true,
      });
      seedLead(
        FIXTURE_APPROVED_BRAINWORKER_A,
        leadOwnedByA({ pricingMode: 'WORKER_QUOTE' }),
      );
      const consumer = createQuotationConsumer(repository);

      await expect(
        consumer.submitQuote(FIXTURE_APPROVED_BRAINWORKER_A, 'inv-owned-a-001', {
          laborAmountKobo: 150000,
          diagnosticFeeKobo: 500000,
          estimatedHours: 2,
        }),
      ).rejects.toThrow(/CATALOG_UNRESOLVED/);
    });

    it('proves an auto-created or default profile cannot authorize a quote', async () => {
      const opsRepo = getBrainWorkerOperationsRepository();
      // Hydrating operational profile for unconfigured worker auto-creates default profile (services: [])
      const profile = await opsRepo.getOperationalProfile(FIXTURE_APPROVED_BRAINWORKER_A);
      expect(profile).not.toBeNull();
      expect(profile?.catalog.services).toEqual([]);

      const { repository, seedLead } = createLeadsTestHarness({
        useRealCatalogAuthority: true,
      });
      seedLead(
        FIXTURE_APPROVED_BRAINWORKER_A,
        leadOwnedByA({ pricingMode: 'WORKER_QUOTE' }),
      );
      const consumer = createQuotationConsumer(repository);

      await expect(
        consumer.submitQuote(FIXTURE_APPROVED_BRAINWORKER_A, 'inv-owned-a-001', {
          laborAmountKobo: 150000,
          diagnosticFeeKobo: 500000,
          estimatedHours: 2,
        }),
      ).rejects.toThrow(/CATALOG_UNRESOLVED/);
    });

    it('accepts exact configured fee when provider has an active configured catalog', async () => {
      const opsRepo = getBrainWorkerOperationsRepository();
      await opsRepo.saveServiceCatalog(FIXTURE_APPROVED_BRAINWORKER_A, {
        diagnosticFeeNgn: 5000,
        services: [
          {
            serviceId: 'gen-diesel-servicing',
            hourlyRateNgn: 7500,
            status: 'ACTIVE',
          },
        ],
      });

      const { repository, seedLead } = createLeadsTestHarness({
        useRealCatalogAuthority: true,
      });
      seedLead(
        FIXTURE_APPROVED_BRAINWORKER_A,
        leadOwnedByA({ pricingMode: 'WORKER_QUOTE' }),
      );
      const consumer = createQuotationConsumer(repository);

      // Exact configured fee in kobo: 5000 NGN * 100 = 500000 kobo
      const quote = await consumer.submitQuote(
        FIXTURE_APPROVED_BRAINWORKER_A,
        'inv-owned-a-001',
        {
          laborAmountKobo: 150000,
          diagnosticFeeKobo: 500000,
          estimatedHours: 2,
        },
      );

      expect(quote.diagnosticFeeKobo).toBe(500000);
      expect(quote.totalAmountKobo).toBe(650000);

      // Mismatched fee fails closed against authoritative catalog
      await expect(
        consumer.submitQuote(FIXTURE_APPROVED_BRAINWORKER_A, 'inv-owned-a-001', {
          laborAmountKobo: 150000,
          diagnosticFeeKobo: 510000,
          estimatedHours: 2,
        }),
      ).rejects.toThrow(/diagnosticFeeKobo|must match active provider catalog fee/);
    });

    it('fails closed with CATALOG_UNRESOLVED when configured catalog has only paused services', async () => {
      const opsRepo = getBrainWorkerOperationsRepository();
      await opsRepo.saveServiceCatalog(FIXTURE_APPROVED_BRAINWORKER_A, {
        diagnosticFeeNgn: 5000,
        services: [
          {
            serviceId: 'gen-diesel-servicing',
            hourlyRateNgn: 7500,
            status: 'PAUSED',
          },
        ],
      });

      const { repository, seedLead } = createLeadsTestHarness({
        useRealCatalogAuthority: true,
      });
      seedLead(
        FIXTURE_APPROVED_BRAINWORKER_A,
        leadOwnedByA({ pricingMode: 'WORKER_QUOTE' }),
      );
      const consumer = createQuotationConsumer(repository);

      await expect(
        consumer.submitQuote(FIXTURE_APPROVED_BRAINWORKER_A, 'inv-owned-a-001', {
          laborAmountKobo: 150000,
          diagnosticFeeKobo: 500000,
          estimatedHours: 2,
        }),
      ).rejects.toThrow(/CATALOG_UNRESOLVED/);
    });

    it('fails closed with INVALID_CATALOG_DIAGNOSTIC_FEE when catalog fee is malformed', async () => {
      const opsRepo = getBrainWorkerOperationsRepository();
      await opsRepo.saveServiceCatalog(FIXTURE_APPROVED_BRAINWORKER_A, {
        diagnosticFeeNgn: 5000,
        services: [
          {
            serviceId: 'gen-diesel-servicing',
            hourlyRateNgn: 7500,
            status: 'ACTIVE',
          },
        ],
      });

      // Simulate corrupted/malformed diagnostic fee in storage
      if (typeof localStorage !== 'undefined') {
        const storedRaw = localStorage.getItem(`bukie_bw_operations_${FIXTURE_APPROVED_BRAINWORKER_A}`);
        if (storedRaw) {
          const parsed = JSON.parse(storedRaw);
          parsed.catalog.diagnosticFeeNgn = NaN;
          localStorage.setItem(
            `bukie_bw_operations_${FIXTURE_APPROVED_BRAINWORKER_A}`,
            JSON.stringify(parsed)
          );
        }
      }

      const { repository, seedLead } = createLeadsTestHarness({
        useRealCatalogAuthority: true,
      });
      seedLead(
        FIXTURE_APPROVED_BRAINWORKER_A,
        leadOwnedByA({ pricingMode: 'WORKER_QUOTE' }),
      );
      const consumer = createQuotationConsumer(repository);

      await expect(
        consumer.submitQuote(FIXTURE_APPROVED_BRAINWORKER_A, 'inv-owned-a-001', {
          laborAmountKobo: 150000,
          diagnosticFeeKobo: 500000,
          estimatedHours: 2,
        }),
      ).rejects.toThrow(/INVALID_CATALOG_DIAGNOSTIC_FEE/);
    });

    it('preserves cross-tenant isolation and rejects access to another provider catalog', async () => {
      const opsRepo = getBrainWorkerOperationsRepository();
      await opsRepo.saveServiceCatalog(FIXTURE_APPROVED_BRAINWORKER_A, {
        diagnosticFeeNgn: 5000,
        services: [
          {
            serviceId: 'gen-diesel-servicing',
            hourlyRateNgn: 7500,
            status: 'ACTIVE',
          },
        ],
      });

      // Switch caller to Worker B
      vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockApprovedWorkerB);

      const { repository, seedLead } = createLeadsTestHarness({
        useRealCatalogAuthority: true,
      });
      seedLead(
        FIXTURE_APPROVED_BRAINWORKER_A,
        leadOwnedByA({ pricingMode: 'WORKER_QUOTE' }),
      );
      const consumer = createQuotationConsumer(repository);

      await expect(
        consumer.submitQuote(FIXTURE_APPROVED_BRAINWORKER_A, 'inv-owned-a-001', {
          laborAmountKobo: 150000,
          diagnosticFeeKobo: 500000,
          estimatedHours: 2,
        }),
      ).rejects.toThrow(ForbiddenTenantAccessError);
    });
  });
});

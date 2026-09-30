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

    // Negative materials rejected
    await expect(
      consumer.submitQuote(FIXTURE_APPROVED_BRAINWORKER_A, 'inv-owned-a-001', {
        laborAmountKobo: 150000,
        materialsAmountKobo: -5000,
        diagnosticFeeKobo: 50000,
        estimatedHours: 2,
      }),
    ).rejects.toThrow(/materialsAmountKobo/);

    // Fractional materials rejected
    await expect(
      consumer.submitQuote(FIXTURE_APPROVED_BRAINWORKER_A, 'inv-owned-a-001', {
        laborAmountKobo: 150000,
        materialsAmountKobo: 1234.56,
        diagnosticFeeKobo: 50000,
        estimatedHours: 2,
      }),
    ).rejects.toThrow(/materialsAmountKobo/);

    // Valid materials line accepted
    const quote = await consumer.submitQuote(
      FIXTURE_APPROVED_BRAINWORKER_A,
      'inv-owned-a-001',
      {
        laborAmountKobo: 150000,
        materialsAmountKobo: 75000,
        diagnosticFeeKobo: 50000,
        estimatedHours: 2,
      },
    );
    expect(quote.materialsAmountKobo).toBe(75000);
    expect(quote.totalAmountKobo).toBe(275000);
  });

  // -------------------------------------------------------------------------
  // QUO-004: Diagnostic call-out fee validation
  // -------------------------------------------------------------------------
  it('QUO-004: validates catalog diagnostic fee against authoritative provider catalog', async () => {
    const { repository, seedLead } = createLeadsTestHarness();
    seedLead(
      FIXTURE_APPROVED_BRAINWORKER_A,
      leadOwnedByA({ pricingMode: 'WORKER_QUOTE' }),
    );
    const consumer = createQuotationConsumer(repository);

    // Mismatched diagnostic fee fails closed
    await expect(
      consumer.submitQuote(FIXTURE_APPROVED_BRAINWORKER_A, 'inv-owned-a-001', {
        laborAmountKobo: 150000,
        diagnosticFeeKobo: 75000,
        estimatedHours: 2,
      }),
    ).rejects.toThrow(/diagnosticFeeKobo/);

    // Matching catalog fee passes
    const quote = await consumer.submitQuote(
      FIXTURE_APPROVED_BRAINWORKER_A,
      'inv-owned-a-001',
      {
        laborAmountKobo: 150000,
        diagnosticFeeKobo: 50000,
        estimatedHours: 2,
      },
    );
    expect(quote.diagnosticFeeKobo).toBe(50000);
  });

  // -------------------------------------------------------------------------
  // QUO-005: Total amount calculation integrity
  // -------------------------------------------------------------------------
  it('QUO-005: calculates totalAmountKobo as exact sum of labor + materials + diagnosticFee', async () => {
    const { repository, seedLead } = createLeadsTestHarness();
    seedLead(
      FIXTURE_APPROVED_BRAINWORKER_A,
      leadOwnedByA({ pricingMode: 'WORKER_QUOTE' }),
    );
    const consumer = createQuotationConsumer(repository);

    const quote = await consumer.submitQuote(
      FIXTURE_APPROVED_BRAINWORKER_A,
      'inv-owned-a-001',
      {
        laborAmountKobo: 200000,
        materialsAmountKobo: 100000,
        diagnosticFeeKobo: 50000,
        estimatedHours: 4,
      },
    );

    expect(quote.totalAmountKobo).toBe(350000);
  });

  // -------------------------------------------------------------------------
  // QUO-006: Quote expiration duration
  // -------------------------------------------------------------------------
  it('QUO-006: sets quote expiresAt to authoritative 24-hour window from submission timestamp', async () => {
    const { repository, seedLead } = createLeadsTestHarness();
    seedLead(
      FIXTURE_APPROVED_BRAINWORKER_A,
      leadOwnedByA({ pricingMode: 'WORKER_QUOTE' }),
    );
    const consumer = createQuotationConsumer(repository);

    const before = Date.now();
    const quote = await consumer.submitQuote(
      FIXTURE_APPROVED_BRAINWORKER_A,
      'inv-owned-a-001',
      {
        laborAmountKobo: 150000,
        diagnosticFeeKobo: 50000,
        estimatedHours: 2,
      },
    );
    const after = Date.now();

    const createdMs = new Date(quote.createdAt).getTime();
    const expiresMs = new Date(quote.expiresAt).getTime();
    const durationHours = (expiresMs - createdMs) / (1000 * 60 * 60);

    expect(durationHours).toBeCloseTo(24, 0);
    expect(createdMs).toBeGreaterThanOrEqual(before);
    expect(createdMs).toBeLessThanOrEqual(after);
  });

  // -------------------------------------------------------------------------
  // QUO-007: Estimated duration format validation
  // -------------------------------------------------------------------------
  it('QUO-007: accepts valid estimatedHours between 1 and 40 and rejects 0, negative, or > 40', async () => {
    const { repository, seedLead } = createLeadsTestHarness();
    seedLead(
      FIXTURE_APPROVED_BRAINWORKER_A,
      leadOwnedByA({ pricingMode: 'WORKER_QUOTE' }),
    );
    const consumer = createQuotationConsumer(repository);

    // 0 hours rejected
    await expect(
      consumer.submitQuote(FIXTURE_APPROVED_BRAINWORKER_A, 'inv-owned-a-001', {
        laborAmountKobo: 150000,
        diagnosticFeeKobo: 50000,
        estimatedHours: 0,
      }),
    ).rejects.toThrow(/estimatedHours/);

    // 41 hours rejected
    await expect(
      consumer.submitQuote(FIXTURE_APPROVED_BRAINWORKER_A, 'inv-owned-a-001', {
        laborAmountKobo: 150000,
        diagnosticFeeKobo: 50000,
        estimatedHours: 41,
      }),
    ).rejects.toThrow(/estimatedHours/);

    // Negative hours rejected
    await expect(
      consumer.submitQuote(FIXTURE_APPROVED_BRAINWORKER_A, 'inv-owned-a-001', {
        laborAmountKobo: 150000,
        diagnosticFeeKobo: 50000,
        estimatedHours: -2,
      }),
    ).rejects.toThrow(/estimatedHours/);

    // Valid hours accepted
    const quote = await consumer.submitQuote(
      FIXTURE_APPROVED_BRAINWORKER_A,
      'inv-owned-a-001',
      {
        laborAmountKobo: 150000,
        diagnosticFeeKobo: 50000,
        estimatedHours: 8,
      },
    );
    expect(quote.estimatedHours).toBe(8);
  });

  // -------------------------------------------------------------------------
  // QUO-008: Scope notes character limit
  // -------------------------------------------------------------------------
  it('QUO-008: validates optional scopeNotes up to 500 characters and rejects notes exceeding length or invalid types', async () => {
    const { repository, seedLead } = createLeadsTestHarness();
    seedLead(
      FIXTURE_APPROVED_BRAINWORKER_A,
      leadOwnedByA({ pricingMode: 'WORKER_QUOTE' }),
    );
    const consumer = createQuotationConsumer(repository);

    // Notes at limit (500 chars) accepted
    const maxNotes = 'x'.repeat(500);
    const quote = await consumer.submitQuote(
      FIXTURE_APPROVED_BRAINWORKER_A,
      'inv-owned-a-001',
      {
        laborAmountKobo: 150000,
        diagnosticFeeKobo: 50000,
        estimatedHours: 2,
        scopeNotes: maxNotes,
      },
    );
    expect(quote.scopeNotes).toBe(maxNotes);

    // Notes exceeding limit (501 chars) rejected
    await expect(
      consumer.submitQuote(FIXTURE_APPROVED_BRAINWORKER_A, 'inv-owned-a-001', {
        laborAmountKobo: 150000,
        diagnosticFeeKobo: 50000,
        estimatedHours: 2,
        scopeNotes: 'x'.repeat(501),
      }),
    ).rejects.toThrow(/scopeNotes/);

    // Non-string types rejected
    await expect(
      consumer.submitQuote(FIXTURE_APPROVED_BRAINWORKER_A, 'inv-owned-a-001', {
        laborAmountKobo: 150000,
        diagnosticFeeKobo: 50000,
        estimatedHours: 2,
        scopeNotes: 12345 as unknown as string,
      }),
    ).rejects.toThrow(/scopeNotes/);

    await expect(
      consumer.submitQuote(FIXTURE_APPROVED_BRAINWORKER_A, 'inv-owned-a-001', {
        laborAmountKobo: 150000,
        diagnosticFeeKobo: 50000,
        estimatedHours: 2,
        scopeNotes: true as unknown as string,
      }),
    ).rejects.toThrow(/scopeNotes/);

    await expect(
      consumer.submitQuote(FIXTURE_APPROVED_BRAINWORKER_A, 'inv-owned-a-001', {
        laborAmountKobo: 150000,
        diagnosticFeeKobo: 50000,
        estimatedHours: 2,
        scopeNotes: {} as unknown as string,
      }),
    ).rejects.toThrow(/scopeNotes/);
  });

  // -------------------------------------------------------------------------
  // QUO-009: Lead status remains unchanged after quotation
  // -------------------------------------------------------------------------
  it('QUO-009: retains lead state as PENDING and updates quote status to SUBMITTED without mutating invitation', async () => {
    const { repository, seedLead } = createLeadsTestHarness();
    seedLead(
      FIXTURE_APPROVED_BRAINWORKER_A,
      leadOwnedByA({ pricingMode: 'WORKER_QUOTE' }),
    );
    const consumer = createQuotationConsumer(repository);

    const quote = await consumer.submitQuote(
      FIXTURE_APPROVED_BRAINWORKER_A,
      'inv-owned-a-001',
      {
        laborAmountKobo: 150000,
        diagnosticFeeKobo: 50000,
        estimatedHours: 2,
      },
    );

    expect(quote.status).toBe('SUBMITTED');

    // Lead state remains PENDING
    const lead = await repository.getLead(
      FIXTURE_APPROVED_BRAINWORKER_A,
      'lead-owned-a-001',
    );
    expect(lead?.invitationState).toBe('PENDING');
  });

  // -------------------------------------------------------------------------
  // QUO-010: Boundary isolation proof
  // -------------------------------------------------------------------------
  it('QUO-010: proves quotation does not mutate customer activity records, trigger escrows, or create bookings', async () => {
    const { repository, seedLead } = createLeadsTestHarness();
    const rawLead = leadOwnedByA({
      id: 'lead-boundary-proof-010',
      invitationId: 'inv-boundary-proof-010',
      jobId: 'job-quotation-active-500',
      pricingMode: 'WORKER_QUOTE',
    });
    seedLead(FIXTURE_APPROVED_BRAINWORKER_A, rawLead);

    const consumer = createQuotationConsumer(repository);
    const quote = await consumer.submitQuote(
      FIXTURE_APPROVED_BRAINWORKER_A,
      'inv-boundary-proof-010',
      {
        laborAmountKobo: 250000,
        materialsAmountKobo: 50000,
        diagnosticFeeKobo: 50000,
        estimatedHours: 3,
        scopeNotes: 'Replace fan belt and test oil pressure.',
      },
    );

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

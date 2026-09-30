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
  // QUO-001: Pricing Mode Invariant Check
  // -------------------------------------------------------------------------
  it('QUO-001: rejects quotation when lead pricingMode is FIXED_PRICE or EMERGENCY_DISPATCH', async () => {
    const { repository, seedLead } = createLeadsTestHarness();
    seedLead(
      FIXTURE_APPROVED_BRAINWORKER_A,
      leadOwnedByA({ pricingMode: 'FIXED_PRICE' })
    );

    const consumer = createQuotationConsumer(repository);
    const draft: WorkerQuoteDraft = {
      laborAmountKobo: 150000,
      diagnosticFeeKobo: 50000,
      estimatedHours: 2,
    };

    await expect(
      consumer.submitQuote(FIXTURE_APPROVED_BRAINWORKER_A, 'inv-owned-a-001', draft)
    ).rejects.toThrow(/pricingMode|pricing mode/i);
  });

  // -------------------------------------------------------------------------
  // QUO-002: Status Invariant Check
  // -------------------------------------------------------------------------
  it('QUO-002: rejects quotation when lead status is COMPLETED, CANCELLED, or ARCHIVED', async () => {
    const { repository, seedLead } = createLeadsTestHarness();
    seedLead(
      FIXTURE_APPROVED_BRAINWORKER_A,
      leadOwnedByA({ status: 'COMPLETED', pricingMode: 'WORKER_QUOTE' })
    );

    const consumer = createQuotationConsumer(repository);
    const draft: WorkerQuoteDraft = {
      laborAmountKobo: 150000,
      diagnosticFeeKobo: 50000,
      estimatedHours: 2,
    };

    await expect(
      consumer.submitQuote(FIXTURE_APPROVED_BRAINWORKER_A, 'inv-owned-a-001', draft)
    ).rejects.toThrow(/status|cannot receive/i);
  });

  // -------------------------------------------------------------------------
  // QUO-003: Terminal Invitation Status Check
  // -------------------------------------------------------------------------
  it('QUO-003: rejects quotation when invitationStatus is DECLINED or EXPIRED', async () => {
    const { repository, seedLead } = createLeadsTestHarness();
    seedLead(
      FIXTURE_APPROVED_BRAINWORKER_A,
      leadOwnedByA({ invitationStatus: 'DECLINED', pricingMode: 'WORKER_QUOTE' })
    );

    const consumer = createQuotationConsumer(repository);
    const draft: WorkerQuoteDraft = {
      laborAmountKobo: 150000,
      diagnosticFeeKobo: 50000,
      estimatedHours: 2,
    };

    await expect(
      consumer.submitQuote(FIXTURE_APPROVED_BRAINWORKER_A, 'inv-owned-a-001', draft)
    ).rejects.toThrow(/terminal|invitation/i);
  });

  // -------------------------------------------------------------------------
  // QUO-004: Minimum Labor Amount Validation
  // -------------------------------------------------------------------------
  it('QUO-004: rejects laborAmountKobo below 500,000 kobo (5,000 NGN) or above 50,000,000 kobo (500,000 NGN)', async () => {
    const { repository, seedLead } = createLeadsTestHarness();
    seedLead(
      FIXTURE_APPROVED_BRAINWORKER_A,
      leadOwnedByA({ pricingMode: 'WORKER_QUOTE' })
    );

    const consumer = createQuotationConsumer(repository);

    // Below 5,000 NGN
    await expect(
      consumer.submitQuote(FIXTURE_APPROVED_BRAINWORKER_A, 'inv-owned-a-001', {
        laborAmountKobo: 499900,
        diagnosticFeeKobo: 50000,
        estimatedHours: 2,
      })
    ).rejects.toThrow(/labor|amount|bounds/i);

    // Above 500,000 NGN
    await expect(
      consumer.submitQuote(FIXTURE_APPROVED_BRAINWORKER_A, 'inv-owned-a-001', {
        laborAmountKobo: 50000100,
        diagnosticFeeKobo: 50000,
        estimatedHours: 2,
      })
    ).rejects.toThrow(/labor|amount|bounds/i);
  });

  // -------------------------------------------------------------------------
  // QUO-005: Diagnostic Fee Matching Check
  // -------------------------------------------------------------------------
  it('QUO-005: accepts quotation only when diagnosticFeeKobo matches active catalog diagnostic call-out fee', async () => {
    const { repository, seedLead } = createLeadsTestHarness();
    seedLead(
      FIXTURE_APPROVED_BRAINWORKER_A,
      leadOwnedByA({ pricingMode: 'WORKER_QUOTE' })
    );

    const consumer = createQuotationConsumer(repository);

    // Mismatched fee (expected 50,000 kobo)
    await expect(
      consumer.submitQuote(FIXTURE_APPROVED_BRAINWORKER_A, 'inv-owned-a-001', {
        laborAmountKobo: 1500000,
        diagnosticFeeKobo: 60000,
        estimatedHours: 2,
      })
    ).rejects.toThrow(/diagnosticFeeKobo|diagnostic fee/i);

    // Matching fee
    const quote = await consumer.submitQuote(
      FIXTURE_APPROVED_BRAINWORKER_A,
      'inv-owned-a-001',
      {
        laborAmountKobo: 1500000,
        diagnosticFeeKobo: 50000,
        estimatedHours: 2,
      }
    );

    expect(quote.diagnosticFeeKobo).toBe(50000);
    expect(quote.laborAmountKobo).toBe(1500000);
    expect(quote.totalAmountKobo).toBe(1550000);
  });

  // -------------------------------------------------------------------------
  // QUO-006: Total Amount Integrity Calculation
  // -------------------------------------------------------------------------
  it('QUO-006: guarantees totalAmountKobo is strictly laborAmountKobo + diagnosticFeeKobo', async () => {
    const { repository, seedLead } = createLeadsTestHarness();
    seedLead(
      FIXTURE_APPROVED_BRAINWORKER_A,
      leadOwnedByA({ pricingMode: 'WORKER_QUOTE' })
    );

    const consumer = createQuotationConsumer(repository);
    const labor = 2500000;
    const diag = 50000;

    const quote = await consumer.submitQuote(
      FIXTURE_APPROVED_BRAINWORKER_A,
      'inv-owned-a-001',
      {
        laborAmountKobo: labor,
        diagnosticFeeKobo: diag,
        estimatedHours: 4,
      }
    );

    expect(quote.totalAmountKobo).toBe(labor + diag);
    expect(quote.totalAmountKobo).toBe(2550000);
  });

  // -------------------------------------------------------------------------
  // QUO-007: Estimated Hours Range Validation
  // -------------------------------------------------------------------------
  it('QUO-007: rejects estimatedHours less than 1 or greater than 40', async () => {
    const { repository, seedLead } = createLeadsTestHarness();
    seedLead(
      FIXTURE_APPROVED_BRAINWORKER_A,
      leadOwnedByA({ pricingMode: 'WORKER_QUOTE' })
    );

    const consumer = createQuotationConsumer(repository);

    // Less than 1 hour
    await expect(
      consumer.submitQuote(FIXTURE_APPROVED_BRAINWORKER_A, 'inv-owned-a-001', {
        laborAmountKobo: 1500000,
        diagnosticFeeKobo: 50000,
        estimatedHours: 0,
      })
    ).rejects.toThrow(/hours|estimated/i);

    // Greater than 40 hours
    await expect(
      consumer.submitQuote(FIXTURE_APPROVED_BRAINWORKER_A, 'inv-owned-a-001', {
        laborAmountKobo: 1500000,
        diagnosticFeeKobo: 50000,
        estimatedHours: 41,
      })
    ).rejects.toThrow(/hours|estimated/i);
  });

  // -------------------------------------------------------------------------
  // QUO-008: Scope Notes Bounded Length Validation
  // -------------------------------------------------------------------------
  it('QUO-008: validates optional scopeNotes up to 500 characters and rejects notes exceeding length or invalid types', async () => {
    const { repository, seedLead } = createLeadsTestHarness();
    seedLead(
      FIXTURE_APPROVED_BRAINWORKER_A,
      leadOwnedByA({ pricingMode: 'WORKER_QUOTE' })
    );

    const consumer = createQuotationConsumer(repository);

    // Valid 500-char string
    const validNotes = 'A'.repeat(500);
    const quote = await consumer.submitQuote(
      FIXTURE_APPROVED_BRAINWORKER_A,
      'inv-owned-a-001',
      {
        laborAmountKobo: 1500000,
        diagnosticFeeKobo: 50000,
        estimatedHours: 3,
        scopeNotes: validNotes,
      }
    );
    expect(quote.scopeNotes).toBe(validNotes);

    // Invalid 501-char string
    const longNotes = 'A'.repeat(501);
    await expect(
      consumer.submitQuote(FIXTURE_APPROVED_BRAINWORKER_A, 'inv-owned-a-001', {
        laborAmountKobo: 1500000,
        diagnosticFeeKobo: 50000,
        estimatedHours: 3,
        scopeNotes: longNotes,
      })
    ).rejects.toThrow(/scopeNotes|500/i);

    // Invalid non-string types
    await expect(
      consumer.submitQuote(FIXTURE_APPROVED_BRAINWORKER_A, 'inv-owned-a-001', {
        laborAmountKobo: 1500000,
        diagnosticFeeKobo: 50000,
        estimatedHours: 3,
        scopeNotes: 12345 as unknown as string,
      })
    ).rejects.toThrow(/scopeNotes|string/i);

    await expect(
      consumer.submitQuote(FIXTURE_APPROVED_BRAINWORKER_A, 'inv-owned-a-001', {
        laborAmountKobo: 1500000,
        diagnosticFeeKobo: 50000,
        estimatedHours: 3,
        scopeNotes: {} as unknown as string,
      })
    ).rejects.toThrow(/scopeNotes|string/i);
  });

  // -------------------------------------------------------------------------
  // QUO-009: Auto-Accept Transition & Timeline Event
  // -------------------------------------------------------------------------
  it('QUO-009: auto-accepts invitation if PENDING and records QUOTED timeline event', async () => {
    const { repository, seedLead } = createLeadsTestHarness();
    seedLead(
      FIXTURE_APPROVED_BRAINWORKER_A,
      leadOwnedByA({ status: 'PENDING', invitationStatus: 'PENDING', pricingMode: 'WORKER_QUOTE' })
    );

    const consumer = createQuotationConsumer(repository);
    await consumer.submitQuote(
      FIXTURE_APPROVED_BRAINWORKER_A,
      'inv-owned-a-001',
      {
        laborAmountKobo: 1500000,
        diagnosticFeeKobo: 50000,
        estimatedHours: 2,
      }
    );

    const projected = await repository.getLeadById(
      FIXTURE_APPROVED_BRAINWORKER_A,
      'inv-owned-a-001'
    );

    expect(projected?.status).toBe('ACCEPTED');
    expect(projected?.invitationStatus).toBe('ACCEPTED');
    expect(projected?.quote).toBeDefined();

    const quotedEvent = projected?.timeline.find((e) => e.eventType === 'QUOTED');
    expect(quotedEvent).toBeDefined();
    expect(quotedEvent?.actor).toBe('BRAINWORKER');
  });

  // -------------------------------------------------------------------------
  // QUO-010: Boundary Isolation Audit
  // -------------------------------------------------------------------------
  it('QUO-010: verifies quote object contains no customer contact info or escrow payment identifiers', async () => {
    const { repository, seedLead } = createLeadsTestHarness();
    seedLead(
      FIXTURE_APPROVED_BRAINWORKER_A,
      leadOwnedByA({ pricingMode: 'WORKER_QUOTE' })
    );

    const consumer = createQuotationConsumer(repository);
    const quote = await consumer.submitQuote(
      FIXTURE_APPROVED_BRAINWORKER_A,
      'inv-owned-a-001',
      {
        laborAmountKobo: 1500000,
        diagnosticFeeKobo: 50000,
        estimatedHours: 2,
      }
    );

    // Quotation data boundary invariants
    expect(quote).not.toHaveProperty('customerPhone');
    expect(quote).not.toHaveProperty('customerEmail');
    expect(quote).not.toHaveProperty('customerAddress');
    expect(quote).not.toHaveProperty('escrowId');
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

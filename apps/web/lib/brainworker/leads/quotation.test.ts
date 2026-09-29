// apps/web/lib/brainworker/leads/quotation.test.ts
// BW-003 Phase 4 GREEN: Quotation (QUO-001 to QUO-010)
// Authoritative References:
// - docs/specs/BW-003-architecture-contract.md (Approved, Section 8)
// - docs/specs/BW-003-test-first-implementation-plan.md (Approved, Phase 4)
//
// Invariants verified by this suite:
// 1. Pricing mode separation (QUO-001)
// 2. Integer-kobo labor validation (QUO-002)
// 3. Optional integer-kobo materials validation (QUO-003)
// 4. Authoritative catalog diagnostic fee validation (QUO-004)
// 5. Total integer-kobo amount derived server-side (QUO-005)
// 6. Conflicting client totals rejected (QUO-006)
// 7. Positive finite estimated hours required (QUO-007)
// 8. 1,000-character scope notes boundary (QUO-008)
// 9. Multi-tenant quote submission isolation (QUO-009)
// 10. Status remains PENDING with no booking/payment mutation (QUO-010)

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  createLeadsTestHarness,
  resetLeadsRepository,
} from './testing/harness';
import {
  FIXTURE_APPROVED_BRAINWORKER_A,
  FIXTURE_APPROVED_BRAINWORKER_B,
  leadOwnedByA,
  mockApprovedWorkerA,
  mockApprovedWorkerB,
  mockUnauthenticated,
} from './testing/fixtures';
import {
  createQuotationConsumer,
} from './quotation';

describe('BW-003 Phase 4 GREEN: Quotation (QUO-001 to QUO-010)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
    resetLeadsRepository();
  });

  describe('Pricing Mode Separation & Rates', () => {
    // QUO-001: acceptCustomerRate succeeds on customer-posted-rate and fails on worker-quote
    it('QUO-001: accepts customer rate on CUSTOMER_POSTED_RATE lead and rejects on WORKER_QUOTE lead', async () => {
      mockApprovedWorkerA();
      const harness = createLeadsTestHarness();
      const consumer = createQuotationConsumer(harness.repository);
      harness.seedLead(
        FIXTURE_APPROVED_BRAINWORKER_A,
        leadOwnedByA({
          pricingMode: 'CUSTOMER_POSTED_RATE',
          customerBudgetKobo: 500000,
        })
      );

      const result = await consumer.acceptCustomerRate(
        FIXTURE_APPROVED_BRAINWORKER_A,
        'inv-owned-a-001'
      );
      expect(result.ok).toBe(true);
      expect(result.invitationId).toBe('inv-owned-a-001');
      expect(result.state).toBe('ACCEPTED');
      expect(result.respondedAt).toBeDefined();

      // Negative assertion: attempting to accept customer rate on WORKER_QUOTE lead fails closed
      harness.seedLead(
        FIXTURE_APPROVED_BRAINWORKER_A,
        leadOwnedByA({
          id: 'lead-worker-quote-only-001',
          invitationId: 'inv-worker-quote-only-001',
          pricingMode: 'WORKER_QUOTE',
        })
      );

      const quoteModeResult = await consumer.acceptCustomerRate(
        FIXTURE_APPROVED_BRAINWORKER_A,
        'inv-worker-quote-only-001'
      );
      expect(quoteModeResult.ok).toBe(false);
      expect(quoteModeResult.reason).toBe('INVALID_STATE');
    });
  });

  describe('Monetary Line-Item Validation', () => {
    // QUO-002: laborAmountKobo non-negative integer validation
    it('QUO-002: enforces laborAmountKobo as a non-negative integer kobo amount', async () => {
      mockApprovedWorkerA();
      const harness = createLeadsTestHarness();
      const consumer = createQuotationConsumer(harness.repository);
      harness.seedLead(
        FIXTURE_APPROVED_BRAINWORKER_A,
        leadOwnedByA({ pricingMode: 'WORKER_QUOTE' })
      );

      // Negative labor amount rejected
      await expect(
        consumer.submitQuote(FIXTURE_APPROVED_BRAINWORKER_A, 'inv-owned-a-001', {
          laborAmountKobo: -100,
          diagnosticFeeKobo: 50000,
          estimatedHours: 2,
        })
      ).rejects.toThrow(/laborAmountKobo/i);

      // Fractional labor amount rejected
      await expect(
        consumer.submitQuote(FIXTURE_APPROVED_BRAINWORKER_A, 'inv-owned-a-001', {
          laborAmountKobo: 25000.5,
          diagnosticFeeKobo: 50000,
          estimatedHours: 2,
        })
      ).rejects.toThrow(/laborAmountKobo/i);
    });

    // QUO-003: materialsAmountKobo non-negative integer when provided and optional
    it('QUO-003: accepts valid materialsAmountKobo and rejects negative or fractional kobo', async () => {
      mockApprovedWorkerA();
      const harness = createLeadsTestHarness();
      const consumer = createQuotationConsumer(harness.repository);
      harness.seedLead(
        FIXTURE_APPROVED_BRAINWORKER_A,
        leadOwnedByA({ pricingMode: 'WORKER_QUOTE' })
      );

      // Valid positive materials
      const quoteWithMaterials = await consumer.submitQuote(
        FIXTURE_APPROVED_BRAINWORKER_A,
        'inv-owned-a-001',
        {
          laborAmountKobo: 100000,
          materialsAmountKobo: 50000,
          diagnosticFeeKobo: 50000,
          estimatedHours: 3,
        }
      );
      expect(quoteWithMaterials.materialsAmountKobo).toBe(50000);

      // Negative materials rejected
      await expect(
        consumer.submitQuote(FIXTURE_APPROVED_BRAINWORKER_A, 'inv-owned-a-001', {
          laborAmountKobo: 100000,
          materialsAmountKobo: -500,
          diagnosticFeeKobo: 50000,
          estimatedHours: 3,
        })
      ).rejects.toThrow(/materialsAmountKobo/i);

      // Fractional materials rejected
      await expect(
        consumer.submitQuote(FIXTURE_APPROVED_BRAINWORKER_A, 'inv-owned-a-001', {
          laborAmountKobo: 100000,
          materialsAmountKobo: 100.5,
          diagnosticFeeKobo: 50000,
          estimatedHours: 3,
        })
      ).rejects.toThrow(/materialsAmountKobo/i);
    });

    // QUO-004: Diagnostic fee sourcing from provider catalog and validation
    it('QUO-004: verifies diagnostic fee matches active provider catalog and rejects invalid or client-authored fees', async () => {
      mockApprovedWorkerA();
      const harness = createLeadsTestHarness();
      const consumer = createQuotationConsumer(harness.repository);
      harness.seedLead(
        FIXTURE_APPROVED_BRAINWORKER_A,
        leadOwnedByA({ pricingMode: 'WORKER_QUOTE' })
      );

      // Sourced matching fee (50000 kobo matching provider catalog) succeeds
      const validQuote = await consumer.submitQuote(
        FIXTURE_APPROVED_BRAINWORKER_A,
        'inv-owned-a-001',
        {
          laborAmountKobo: 150000,
          diagnosticFeeKobo: 50000,
          estimatedHours: 1.5,
        }
      );
      expect(validQuote.diagnosticFeeKobo).toBe(50000);

      // Mismatched positive fee (51000 kobo != catalog 50000 kobo) rejected
      await expect(
        consumer.submitQuote(FIXTURE_APPROVED_BRAINWORKER_A, 'inv-owned-a-001', {
          laborAmountKobo: 150000,
          diagnosticFeeKobo: 51000,
          estimatedHours: 1.5,
        })
      ).rejects.toThrow(/diagnosticFee|catalog/i);

      // Negative diagnostic fee rejected
      await expect(
        consumer.submitQuote(FIXTURE_APPROVED_BRAINWORKER_A, 'inv-owned-a-001', {
          laborAmountKobo: 150000,
          diagnosticFeeKobo: -1,
          estimatedHours: 1.5,
        })
      ).rejects.toThrow(/diagnosticFee/i);

      // Fractional diagnostic fee rejected
      await expect(
        consumer.submitQuote(FIXTURE_APPROVED_BRAINWORKER_A, 'inv-owned-a-001', {
          laborAmountKobo: 150000,
          diagnosticFeeKobo: 50000.5,
          estimatedHours: 1.5,
        })
      ).rejects.toThrow(/diagnosticFee/i);

      // Fail-closed: missing or unresolvable catalog diagnostic fee
      const unresolvableHarness = createLeadsTestHarness({
        dependencies: {
          resolveCatalogDiagnosticFee: () => {
            throw new Error('CATALOG_UNRESOLVED: Provider catalog not available');
          },
        },
      });
      unresolvableHarness.seedLead(
        FIXTURE_APPROVED_BRAINWORKER_A,
        leadOwnedByA({ id: 'lead-unres-1', invitationId: 'inv-unres-1', pricingMode: 'WORKER_QUOTE' })
      );
      const unresolvableConsumer = createQuotationConsumer(unresolvableHarness.repository);
      await expect(
        unresolvableConsumer.submitQuote(FIXTURE_APPROVED_BRAINWORKER_A, 'inv-unres-1', {
          laborAmountKobo: 150000,
          diagnosticFeeKobo: 50000,
          estimatedHours: 1.5,
        })
      ).rejects.toThrow(/CATALOG_UNRESOLVED/);

      // Fail-closed: malformed/non-integer catalog diagnostic fee returned by resolver
      const malformedHarness = createLeadsTestHarness({
        dependencies: {
          resolveCatalogDiagnosticFee: () => NaN as unknown as number,
        },
      });
      malformedHarness.seedLead(
        FIXTURE_APPROVED_BRAINWORKER_A,
        leadOwnedByA({ id: 'lead-malf-1', invitationId: 'inv-malf-1', pricingMode: 'WORKER_QUOTE' })
      );
      const malformedConsumer = createQuotationConsumer(malformedHarness.repository);
      await expect(
        malformedConsumer.submitQuote(FIXTURE_APPROVED_BRAINWORKER_A, 'inv-malf-1', {
          laborAmountKobo: 150000,
          diagnosticFeeKobo: 50000,
          estimatedHours: 1.5,
        })
      ).rejects.toThrow(/INVALID_CATALOG_DIAGNOSTIC_FEE/);
    });

    // QUO-005: Total amount derivation
    it('QUO-005: derives totalAmountKobo server-side as exact sum of labor, materials, and diagnostic fee', async () => {
      mockApprovedWorkerA();
      const harness = createLeadsTestHarness();
      const consumer = createQuotationConsumer(harness.repository);
      harness.seedLead(
        FIXTURE_APPROVED_BRAINWORKER_A,
        leadOwnedByA({ pricingMode: 'WORKER_QUOTE' })
      );

      const quote = await consumer.submitQuote(
        FIXTURE_APPROVED_BRAINWORKER_A,
        'inv-owned-a-001',
        {
          laborAmountKobo: 300000,
          materialsAmountKobo: 120000,
          diagnosticFeeKobo: 50000,
          estimatedHours: 4,
        }
      );

      expect(quote.totalAmountKobo).toBe(470000);
      expect(Number.isInteger(quote.totalAmountKobo)).toBe(true);
    });

    // QUO-006: Reject conflicting client-supplied total
    it('QUO-006: rejects quote submission if client supplies a conflicting totalAmountKobo', async () => {
      mockApprovedWorkerA();
      const harness = createLeadsTestHarness();
      const consumer = createQuotationConsumer(harness.repository);
      harness.seedLead(
        FIXTURE_APPROVED_BRAINWORKER_A,
        leadOwnedByA({ pricingMode: 'WORKER_QUOTE' })
      );

      await expect(
        consumer.submitQuote(
          FIXTURE_APPROVED_BRAINWORKER_A,
          'inv-owned-a-001',
          {
            laborAmountKobo: 200000,
            materialsAmountKobo: 50000,
            diagnosticFeeKobo: 50000,
            estimatedHours: 2,
          },
          999999 // conflicting total: 999,999 kobo != derived 300,000 kobo
        )
      ).rejects.toThrow(/totalAmountKobo|conflict/i);
    });
  });

  describe('Duration & Scope Boundaries', () => {
    // QUO-007: estimatedHours must be positive finite number
    it('QUO-007: requires estimatedHours to be a finite positive number', async () => {
      mockApprovedWorkerA();
      const harness = createLeadsTestHarness();
      const consumer = createQuotationConsumer(harness.repository);
      harness.seedLead(
        FIXTURE_APPROVED_BRAINWORKER_A,
        leadOwnedByA({ pricingMode: 'WORKER_QUOTE' })
      );

      // Zero hours rejected
      await expect(
        consumer.submitQuote(FIXTURE_APPROVED_BRAINWORKER_A, 'inv-owned-a-001', {
          laborAmountKobo: 100000,
          diagnosticFeeKobo: 50000,
          estimatedHours: 0,
        })
      ).rejects.toThrow(/estimatedHours/i);

      // Negative hours rejected
      await expect(
        consumer.submitQuote(FIXTURE_APPROVED_BRAINWORKER_A, 'inv-owned-a-001', {
          laborAmountKobo: 100000,
          diagnosticFeeKobo: 50000,
          estimatedHours: -2,
        })
      ).rejects.toThrow(/estimatedHours/i);

      // NaN hours rejected
      await expect(
        consumer.submitQuote(FIXTURE_APPROVED_BRAINWORKER_A, 'inv-owned-a-001', {
          laborAmountKobo: 100000,
          diagnosticFeeKobo: 50000,
          estimatedHours: NaN,
        })
      ).rejects.toThrow(/estimatedHours/i);
    });

    // QUO-008: scopeNotes max 1,000 characters and optional
    it('QUO-008: accepts optional scopeNotes up to 1000 characters and rejects excessive notes', async () => {
      mockApprovedWorkerA();
      const harness = createLeadsTestHarness();
      const consumer = createQuotationConsumer(harness.repository);
      harness.seedLead(
        FIXTURE_APPROVED_BRAINWORKER_A,
        leadOwnedByA({ pricingMode: 'WORKER_QUOTE' })
      );

      // Valid notes within 1,000 characters
      const withNotes = await consumer.submitQuote(
        FIXTURE_APPROVED_BRAINWORKER_A,
        'inv-owned-a-001',
        {
          laborAmountKobo: 200000,
          diagnosticFeeKobo: 50000,
          estimatedHours: 2.5,
          scopeNotes: 'Includes preliminary generator diagnostic and filter cleaning.',
        }
      );
      expect(withNotes.scopeNotes).toBe(
        'Includes preliminary generator diagnostic and filter cleaning.'
      );

      // Omitted notes succeeds
      const withoutNotes = await consumer.submitQuote(
        FIXTURE_APPROVED_BRAINWORKER_A,
        'inv-owned-a-001',
        {
          laborAmountKobo: 200000,
          diagnosticFeeKobo: 50000,
          estimatedHours: 2.5,
        }
      );
      expect(withoutNotes.scopeNotes).toBeUndefined();

      // Excessive notes (> 1,000 characters) rejected
      const longNotes = 'a'.repeat(1001);
      await expect(
        consumer.submitQuote(FIXTURE_APPROVED_BRAINWORKER_A, 'inv-owned-a-001', {
          laborAmountKobo: 200000,
          diagnosticFeeKobo: 50000,
          estimatedHours: 2.5,
          scopeNotes: longNotes,
        })
      ).rejects.toThrow(/scopeNotes/i);

      // Non-string notes rejected
      await expect(
        consumer.submitQuote(FIXTURE_APPROVED_BRAINWORKER_A, 'inv-owned-a-001', {
          laborAmountKobo: 200000,
          diagnosticFeeKobo: 50000,
          estimatedHours: 2.5,
          scopeNotes: 12345 as unknown as string,
        })
      ).rejects.toThrow(/scopeNotes/i);
    });
  });

  describe('Isolation, State & Booking Independence', () => {
    // QUO-009: Tenant isolation on quote submission
    it('QUO-009: enforces tenant isolation on quote submission rejecting cross-tenant attempts', async () => {
      mockApprovedWorkerB();
      const harness = createLeadsTestHarness();
      const consumer = createQuotationConsumer(harness.repository);
      harness.seedLead(
        FIXTURE_APPROVED_BRAINWORKER_A,
        leadOwnedByA({ pricingMode: 'WORKER_QUOTE' })
      );

      // Worker B attempts to quote on Worker A's lead -> rejected
      await expect(
        consumer.submitQuote(FIXTURE_APPROVED_BRAINWORKER_A, 'inv-owned-a-001', {
          laborAmountKobo: 200000,
          diagnosticFeeKobo: 50000,
          estimatedHours: 2,
        })
      ).rejects.toThrow(/FORBIDDEN_TENANT_ACCESS/);
    });

    // QUO-010: Status remains PENDING with no booking/payment mutation
    it('QUO-010: keeps quote status as PENDING and does not mutate booking, payment, escrow, or payout state', async () => {
      mockApprovedWorkerA();
      const harness = createLeadsTestHarness();
      const consumer = createQuotationConsumer(harness.repository);
      const rawLead = leadOwnedByA({
        pricingMode: 'WORKER_QUOTE',
        jobId: 'job-quotation-active-500',
      });
      harness.seedLead(FIXTURE_APPROVED_BRAINWORKER_A, rawLead);

      const quote = await consumer.submitQuote(
        FIXTURE_APPROVED_BRAINWORKER_A,
        rawLead.invitationId,
        {
          laborAmountKobo: 250000,
          diagnosticFeeKobo: 50000,
          estimatedHours: 2,
        }
      );

      // Quote status is PENDING
      expect(quote.status).toBe('PENDING');

      // Lead state remains PENDING - booking and payment flows are separate
      const leadAfter = await harness.repository.getLead(
        FIXTURE_APPROVED_BRAINWORKER_A,
        rawLead.id
      );
      expect(leadAfter?.jobId).toBe('job-quotation-active-500');
      expect(leadAfter?.invitationState).toBe('PENDING');

      // Quote object contains only quotation fields
      expect(quote.id).toBeDefined();
      expect(quote.invitationId).toBe(rawLead.invitationId);
      expect(quote.laborAmountKobo).toBe(250000);
      expect(quote.diagnosticFeeKobo).toBe(50000);
      expect(quote.totalAmountKobo).toBe(300000);
      expect(quote.submittedAt).toBeDefined();
    });
  });
});

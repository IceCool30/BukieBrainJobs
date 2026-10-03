// apps/web/lib/brainworker/leads/quotation.ts
// BW-003 Phase 4 GREEN: Quotation Consumer (QUO-001 to QUO-010)
// Governed by: BW-003 Architecture Contract v1.0 & Test-First Implementation Plan v1.0
//
// Invariant Rules:
// 1. Zero imports from testing/ (REP-009 boundary).
// 2. Caller/session identity is authoritative; provider IDs are verified.
// 3. Diagnostic fee is sourced from the active provider catalog, never client-authored.
// 4. Integer-kobo arithmetic: totalAmountKobo is derived; conflicting client totals are rejected.
// 5. Quotation is independent from booking, payment, escrow, and payout.
// 6. No customer quote negotiation or settlement behavior is invented.

import type {
  LeadMutationResult,
  WorkerQuote,
  WorkerQuoteDraft,
  IBrainWorkerLeadsRepository,
} from './types';
import { getBrainWorkerLeadsRepository } from './repository';

export interface QuotationConsumer {
  acceptCustomerRate(
    brainWorkerId: string,
    invitationId: string
  ): Promise<LeadMutationResult>;

  submitQuote(
    brainWorkerId: string,
    invitationId: string,
    quote: WorkerQuoteDraft,
    clientSubmittedTotalKobo?: number
  ): Promise<WorkerQuote>;
}

export class DefaultQuotationConsumer implements QuotationConsumer {
  private readonly repository: IBrainWorkerLeadsRepository;

  constructor(repository?: IBrainWorkerLeadsRepository) {
    this.repository = repository ?? getBrainWorkerLeadsRepository();
  }

  async acceptCustomerRate(
    brainWorkerId: string,
    invitationId: string
  ): Promise<LeadMutationResult> {
    return this.repository.acceptCustomerRate(brainWorkerId, invitationId);
  }

  async submitQuote(
    brainWorkerId: string,
    invitationId: string,
    quote: WorkerQuoteDraft,
    clientSubmittedTotalKobo?: number
  ): Promise<WorkerQuote> {
    // QUO-006: Client-supplied total validation at consumer boundary
    if (clientSubmittedTotalKobo !== undefined) {
      const derivedTotal =
        quote.laborAmountKobo +
        (quote.materialsAmountKobo ?? 0) +
        quote.diagnosticFeeKobo;
      if (clientSubmittedTotalKobo !== derivedTotal) {
        throw new Error(
          `Conflicting client-supplied total: totalAmountKobo (${clientSubmittedTotalKobo}) does not match derived line sum (${derivedTotal}).`
        );
      }
    }

    return this.repository.submitQuote(brainWorkerId, invitationId, quote);
  }
}

export function createQuotationConsumer(
  repository?: IBrainWorkerLeadsRepository
): QuotationConsumer {
  return new DefaultQuotationConsumer(
    repository ?? getBrainWorkerLeadsRepository()
  );
}

export async function acceptCustomerPostedRate(
  brainWorkerId: string,
  invitationId: string,
  repository?: IBrainWorkerLeadsRepository
): Promise<LeadMutationResult> {
  const consumer = createQuotationConsumer(repository);
  return consumer.acceptCustomerRate(brainWorkerId, invitationId);
}

export async function submitBrainWorkerQuote(
  brainWorkerId: string,
  invitationId: string,
  quote: WorkerQuoteDraft,
  clientSubmittedTotalKobo?: number,
  repository?: IBrainWorkerLeadsRepository
): Promise<WorkerQuote> {
  const consumer = createQuotationConsumer(repository);
  return consumer.submitQuote(brainWorkerId, invitationId, quote, clientSubmittedTotalKobo);
}

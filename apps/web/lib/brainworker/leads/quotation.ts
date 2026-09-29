// apps/web/lib/brainworker/leads/quotation.ts
// BW-003 Phase 4 RED: Quotation Consumer (stub)
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
  constructor(
    private readonly repository: IBrainWorkerLeadsRepository = getBrainWorkerLeadsRepository()
  ) {}

  async acceptCustomerRate(
    _brainWorkerId: string,
    _invitationId: string
  ): Promise<LeadMutationResult> {
    throw new Error('RED: acceptCustomerRate not implemented');
  }

  async submitQuote(
    _brainWorkerId: string,
    _invitationId: string,
    _quote: WorkerQuoteDraft,
    _clientSubmittedTotalKobo?: number
  ): Promise<WorkerQuote> {
    throw new Error('RED: submitQuote not implemented');
  }
}

export function createQuotationConsumer(
  repository?: IBrainWorkerLeadsRepository
): QuotationConsumer {
  return new DefaultQuotationConsumer(repository);
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

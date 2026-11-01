// apps/web/lib/disputes/testing/dev-harness.ts
// BW-010: Dispute Handling & Support Interface
// Development-only test seed harness for realistic browser verification flows.
// Kept strictly outside production component logic to prevent production boundary leakage.
// Strictly zero em dashes in comments, identifiers, or UI text.

import { getCompletionRepository } from '../../completion/repository';
import { getDisputeRepository } from '../repository';
import type { DisputeRecord } from '../types';

export type DisputeHarnessScenario =
  | 'customer_initiation'
  | 'active_dispute_customer'
  | 'active_dispute_worker'
  | 'counter_evidence_submitted'
  | 'settled_dispute';

export function seedDisputeScenario(scenario: DisputeHarnessScenario = 'active_dispute_customer'): void {
  const compRepo = getCompletionRepository();
  const dispRepo = getDisputeRepository();

  compRepo.seed([
    {
      bookingId: 'book-101',
      customerId: 'cust-101',
      brainWorkerId: 'worker-202',
      jobStatus: 'PENDING_COMPLETION',
      escrowStatus: scenario === 'settled_dispute' ? 'ESCROW_RELEASED' : 'ESCROW_HELD',
      baseQuoteKobo: 5000000,
      approvedAdjustmentKobo: 0,
      totalSettlementKobo: 5000000,
      settlementBreakdown: {
        totalSettlementKobo: 5000000,
        taskerPayoutKobo: 4125000,
        platformFeeKobo: 875000,
        platformFeeBps: 1750,
      },
      completionSubmittedAt: '2026-10-20T10:00:00Z',
      autoReleaseDeadline: '2026-10-23T10:00:00Z',
      isDisputed: scenario !== 'customer_initiation',
    },
    {
      bookingId: 'book-102',
      customerId: 'cust-101',
      brainWorkerId: 'worker-303',
      jobStatus: 'PENDING_COMPLETION',
      escrowStatus: 'ESCROW_HELD',
      baseQuoteKobo: 3500000,
      approvedAdjustmentKobo: 0,
      totalSettlementKobo: 3500000,
      settlementBreakdown: {
        totalSettlementKobo: 3500000,
        taskerPayoutKobo: 2887500,
        platformFeeKobo: 612500,
        platformFeeBps: 1750,
      },
      completionSubmittedAt: '2026-10-25T11:00:00Z',
      autoReleaseDeadline: '2026-10-28T11:00:00Z',
      isDisputed: false,
    },
  ]);

  if (
    scenario === 'active_dispute_customer' ||
    scenario === 'active_dispute_worker' ||
    scenario === 'counter_evidence_submitted'
  ) {
    const hasWorkerEvidence = scenario === 'counter_evidence_submitted';
    const activeDispute: DisputeRecord = {
      id: 'disp-book-101',
      bookingId: 'book-101',
      customerId: 'cust-101',
      brainWorkerId: 'worker-202',
      initiatedByRole: 'customer',
      category: 'WORKMANSHIP_DEFECT',
      description: 'The bathroom pipe installation leaks water under pressure. Joints were not properly sealed.',
      status: 'UNDER_REVIEW',
      evidence: [
        {
          id: 'ev-1',
          uploaderId: 'cust-101',
          uploaderRole: 'customer',
          fileType: 'image/png',
          previewUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=400&q=80',
          sizeBytes: 245000,
          uploadedAt: '2026-10-24T10:30:00Z',
          caption: 'Water pooling around main valve connection: leaking_pipe_joint.png',
        },
        {
          id: 'ev-2',
          uploaderId: 'cust-101',
          uploaderRole: 'customer',
          fileType: 'application/pdf',
          previewUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          sizeBytes: 85000,
          uploadedAt: '2026-10-24T10:32:00Z',
          caption: 'Receipt showing diagnostic fee paid: diagnostic_invoice.pdf',
        },
        ...(hasWorkerEvidence
          ? [
              {
                id: 'ev-worker-1',
                uploaderId: 'worker-202',
                uploaderRole: 'brainworker' as const,
                fileType: 'image/png' as const,
                previewUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=400&q=80',
                sizeBytes: 198000,
                uploadedAt: '2026-10-24T14:15:00Z',
                caption: 'Pressure test gauge verification: pressure_gauge_test.png',
              },
            ]
          : []),
      ],
      timeline: [
        {
          id: 'tl-1',
          eventType: 'DISPUTE_FILED',
          actorId: 'cust-101',
          actorRole: 'customer',
          note: 'Dispute initiated for poor workmanship. Simulated auto-release timer paused in local workspace.',
          timestamp: '2026-10-24T10:30:00Z',
        },
        ...(hasWorkerEvidence
          ? [
              {
                id: 'tl-2',
                eventType: 'COUNTER_EVIDENCE_SUBMITTED' as const,
                actorId: 'worker-202',
                actorRole: 'brainworker' as const,
                note: 'Work was completed to specifications; existing plumbing upstream was corroded.',
                timestamp: '2026-10-24T14:15:00Z',
              },
            ]
          : []),
      ],
      totalAmountKobo: 5000000,
      createdAt: '2026-10-24T10:30:00Z',
      updatedAt: hasWorkerEvidence ? '2026-10-24T14:15:00Z' : '2026-10-24T10:30:00Z',
    };
    dispRepo.seed([activeDispute]);
  } else if (scenario === 'settled_dispute') {
    const settledDispute: DisputeRecord = {
      id: 'disp-settled-101',
      bookingId: 'book-101',
      customerId: 'cust-101',
      brainWorkerId: 'worker-202',
      initiatedByRole: 'customer',
      category: 'WORKMANSHIP_DEFECT',
      description: 'Mutual agreement reached regarding pipe fitting replacement.',
      status: 'RESOLVED',
      evidence: [],
      timeline: [
        {
          id: 'tl-1',
          eventType: 'DISPUTE_FILED',
          actorId: 'cust-101',
          actorRole: 'customer',
          note: 'Dispute filed.',
          timestamp: '2026-10-24T10:30:00Z',
        },
        {
          id: 'tl-2',
          eventType: 'SETTLEMENT_ACCEPTED',
          actorId: 'cust-101',
          actorRole: 'customer',
          note: 'Settlement terms accepted by customer.',
          timestamp: '2026-10-25T11:00:00Z',
        },
      ],
      settlement: {
        totalAmountKobo: 5000000,
        customerRefundKobo: 2500000,
        workerPayoutKobo: 1625000,
        platformFeeKobo: 875000,
        serviceFeeKobo: 500000,
        trustFeeKobo: 375000,
        resolutionType: 'SPLIT_SETTLEMENT',
      },
      createdAt: '2026-10-24T10:30:00Z',
      updatedAt: '2026-10-25T11:00:00Z',
      resolvedAt: '2026-10-25T11:00:00Z',
    };
    dispRepo.seed([settledDispute]);
  } else {
    dispRepo.clear();
  }

  const user =
    scenario === 'active_dispute_worker' || scenario === 'counter_evidence_submitted'
      ? {
          id: 'worker-202',
          role: 'brainworker' as const,
          email: 'worker@example.com',
          name: 'Amaka Eze',
          provider: 'phone',
          isBrainWorkerApproved: true,
        }
      : {
          id: 'cust-101',
          role: 'customer' as const,
          email: 'customer@example.com',
          name: 'Chidi Obi',
          provider: 'google',
          isBrainWorkerApproved: false,
        };

  try {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('bukiebrainjobs_auth_user', JSON.stringify(user));
      window.sessionStorage.setItem('bukiebrainjobs_auth_user', JSON.stringify(user));
      window.dispatchEvent(new CustomEvent('bbj:dispute-seeded', { detail: { scenario } }));
    }
  } catch {
    // storage restricted in sandboxes
  }
}

export function attachDisputeDevHarness(): () => void {
  if (typeof window === 'undefined') return () => {};

  (window as unknown as {
    __BBJ_DISPUTE_HARNESS__?: {
      seedActiveDispute: (scenario?: DisputeHarnessScenario) => void;
      mockNextCompletionSyncFailure: () => void;
      getDebugState: (id: string) => Promise<unknown>;
    };
  }).__BBJ_DISPUTE_HARNESS__ = {
    seedActiveDispute: seedDisputeScenario,
    mockNextCompletionSyncFailure: () => {
      const compRepo = getCompletionRepository();
      const orig = compRepo.raiseDispute.bind(compRepo);
      compRepo.raiseDispute = async () => {
        compRepo.raiseDispute = orig;
        throw new Error('Network failure: Escrow sync service unreachable');
      };
    },
    getDebugState: async (id: string) => {
      const compRepo = getCompletionRepository();
      const dispRepo = getDisputeRepository();
      return {
        completion: await compRepo.getCompletionState(id),
        dispute: await dispRepo.getDisputeByBookingId(id),
      };
    },
  };

  return () => {
    delete (window as unknown as { __BBJ_DISPUTE_HARNESS__?: unknown }).__BBJ_DISPUTE_HARNESS__;
  };
}

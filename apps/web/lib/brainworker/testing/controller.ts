// apps/web/lib/brainworker/testing/controller.ts
// Scenario Test Controller for BW-001
// Strictly for testing use. Must never be imported by production code.

import type {
  BrainWorkerOnboardingRecord,
  RemediationIssue,
  RejectionDetails,
} from '../types';
import type { BrainWorkerRepositoryStore } from '../repository';

export interface IBrainWorkerTestController {
  seedRecord(record: BrainWorkerOnboardingRecord): void;
  simulateOpsApproval(brainWorkerId: string): BrainWorkerOnboardingRecord;
  simulateOpsRemediation(
    brainWorkerId: string,
    issues: RemediationIssue[]
  ): BrainWorkerOnboardingRecord;
  simulateOpsRejection(
    brainWorkerId: string,
    details: RejectionDetails
  ): BrainWorkerOnboardingRecord;
  reset(): void;
}

export class BrainWorkerTestController implements IBrainWorkerTestController {
  constructor(private store: BrainWorkerRepositoryStore) {}

  private notify(record: BrainWorkerOnboardingRecord): void {
    const subs = this.store.subscribers.get(record.brainWorkerId);
    if (subs) {
      for (const listener of subs) {
        listener({ ...record });
      }
    }
  }

  seedRecord(record: BrainWorkerOnboardingRecord): void {
    this.store.records.set(record.brainWorkerId, { ...record });
    this.notify(record);
  }

  simulateOpsApproval(brainWorkerId: string): BrainWorkerOnboardingRecord {
    const existing = this.store.records.get(brainWorkerId);
    if (!existing) {
      throw new Error(`Record for '${brainWorkerId}' not found.`);
    }
    const updated: BrainWorkerOnboardingRecord = {
      ...existing,
      status: 'APPROVED',
      reviewedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.store.records.set(brainWorkerId, updated);
    this.notify(updated);
    return updated;
  }

  simulateOpsRemediation(
    brainWorkerId: string,
    issues: RemediationIssue[]
  ): BrainWorkerOnboardingRecord {
    const existing = this.store.records.get(brainWorkerId);
    if (!existing) {
      throw new Error(`Record for '${brainWorkerId}' not found.`);
    }
    const updated: BrainWorkerOnboardingRecord = {
      ...existing,
      status: 'REMEDIATION_REQUIRED',
      remediationIssues: [...issues],
      updatedAt: new Date().toISOString(),
    };
    this.store.records.set(brainWorkerId, updated);
    this.notify(updated);
    return updated;
  }

  simulateOpsRejection(
    brainWorkerId: string,
    details: RejectionDetails
  ): BrainWorkerOnboardingRecord {
    const existing = this.store.records.get(brainWorkerId);
    if (!existing) {
      throw new Error(`Record for '${brainWorkerId}' not found.`);
    }
    const updated: BrainWorkerOnboardingRecord = {
      ...existing,
      status: 'REJECTED',
      rejectionDetails: { ...details },
      reviewedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.store.records.set(brainWorkerId, updated);
    this.notify(updated);
    return updated;
  }

  reset(): void {
    this.store.records.clear();
    this.store.stagedFiles.clear();
    this.store.subscribers.clear();
  }
}

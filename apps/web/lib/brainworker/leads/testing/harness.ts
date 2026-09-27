// apps/web/lib/brainworker/leads/testing/harness.ts
// Test harness for BW-003 Phase 2 Repository & Tenant Isolation
// Strictly for testing. Must never be imported by production code.

import type { IBrainWorkerLeadsRepository } from '../types';
import {
  createBrainWorkerLeadsRepository,
  resetDefaultBrainWorkerLeadsRepository,
  type BrainWorkerLeadsRepositoryDependencies,
} from '../repository';
import type { RawLeadData } from '../domain';

export interface LeadsTestHarness {
  repository: IBrainWorkerLeadsRepository;
  seedLead: (brainWorkerId: string, lead: RawLeadData) => void;
  setOffline: (offline: boolean) => void;
}

export function createLeadsTestHarness(
  options: {
    dependencies?: BrainWorkerLeadsRepositoryDependencies | undefined;
  } = {}
): LeadsTestHarness {
  const repository = createBrainWorkerLeadsRepository(options.dependencies);

  return {
    repository,
    seedLead: (brainWorkerId: string, lead: RawLeadData) => {
      // Seeding is provided by the concrete repository test surface.
      // The RED stub may expose an internal seed helper via the factory.
      const seedable = repository as unknown as {
        __testSeedLead?: (brainWorkerId: string, lead: RawLeadData) => void;
      };
      if (typeof seedable.__testSeedLead === 'function') {
        seedable.__testSeedLead(brainWorkerId, lead);
      }
    },
    setOffline: (offline: boolean) => {
      const offlineable = repository as unknown as {
        __testSetOffline?: (offline: boolean) => void;
      };
      if (typeof offlineable.__testSetOffline === 'function') {
        offlineable.__testSetOffline(offline);
      }
    },
  };
}

export function resetLeadsRepository(): void {
  resetDefaultBrainWorkerLeadsRepository();
}

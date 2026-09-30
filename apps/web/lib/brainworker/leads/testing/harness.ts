// apps/web/lib/brainworker/leads/testing/harness.ts
// Deterministic test harness for BW-003 Phase 2 Repository & Tenant Isolation
// Governed by: BW-003 Architecture Contract v1.0 & Test-First Implementation Plan v1.0
// Strictly for testing. Must never be imported by production code.

import type { IBrainWorkerLeadsRepository } from '../types';
import type { LeadProviderOperationalProfile, RawLeadData } from '../domain';
import {
  createBrainWorkerLeadsRepository,
  resetDefaultBrainWorkerLeadsRepository,
  type BrainWorkerLeadsRepositoryDependencies,
  type OperationalProfileResolver,
} from '../repository';
import {
  FIXTURE_APPROVED_BRAINWORKER_A,
  FIXTURE_APPROVED_BRAINWORKER_B,
  FIXTURE_INCOMPLETE_BRAINWORKER,
  completeProviderContextA,
  incompleteProviderContext,
} from './fixtures';

export interface LeadsTestHarness {
  repository: IBrainWorkerLeadsRepository;
  seedLead: (brainWorkerId: string, lead: RawLeadData) => void;
  setOffline: (offline: boolean) => void;
}

/**
 * Deterministic fixture-driven operational profile source. The repository
 * still enforces the completeness gate itself (REP-004); this resolver only
 * supplies the authoritative profile data the way the BW-002 operations
 * repository would in production.
 */
const fixtureOperationalProfileResolver: OperationalProfileResolver = (
  brainWorkerId: string
): LeadProviderOperationalProfile | null => {
  if (brainWorkerId === FIXTURE_INCOMPLETE_BRAINWORKER) {
    return incompleteProviderContext().operationalProfile;
  }
  if (
    brainWorkerId === FIXTURE_APPROVED_BRAINWORKER_A ||
    brainWorkerId === FIXTURE_APPROVED_BRAINWORKER_B
  ) {
    return completeProviderContextA().operationalProfile;
  }
  // Unknown workers fail closed as incomplete.
  return null;
};

export interface LeadsTestHarnessOptions {
  dependencies?: BrainWorkerLeadsRepositoryDependencies | undefined;
  useRealCatalogAuthority?: boolean | undefined;
}

export function createLeadsTestHarness(
  options: LeadsTestHarnessOptions = {}
): LeadsTestHarness {
  const defaultDeps: BrainWorkerLeadsRepositoryDependencies = {
    resolveOperationalProfile: fixtureOperationalProfileResolver,
    ...(options.useRealCatalogAuthority ? {} : { resolveCatalogDiagnosticFee: () => 50_000 }),
  };

  const repository = createBrainWorkerLeadsRepository({
    ...defaultDeps,
    ...options.dependencies,
  });

  return {
    repository,
    seedLead: (brainWorkerId: string, lead: RawLeadData) => {
      // Seeding is provided by the concrete repository test surface.
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

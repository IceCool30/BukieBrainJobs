// apps/web/lib/brainworker/leads/testing/harness.ts
// BW-003: Leads Test Harness & Deterministic Fixtures

import type {
  IBrainWorkerLeadsRepository,
  BrainWorkerLeadsRepositoryDependencies,
  AuthoritativeLeadInvitation,
  ProviderProjectedLead,
} from '../types';
import { BrainWorkerLeadsRepository } from '../repository';
import type { BrainWorkerOperationalProfile } from '../../catalog/types';
import {
  FIXTURE_OPERATIONAL_PROFILE_A,
  FIXTURE_OPERATIONAL_PROFILE_B,
} from '../../catalog/testing/fixtures';
import { FIXTURE_APPROVED_BRAINWORKER_A, FIXTURE_APPROVED_BRAINWORKER_B } from './fixtures';

export interface LeadsTestHarness {
  repository: IBrainWorkerLeadsRepository;
  seedLead: (brainWorkerId: string, lead: AuthoritativeLeadInvitation) => void;
  getRawLeads: (brainWorkerId: string) => Promise<ProviderProjectedLead[]>;
}

const fixtureOperationalProfileResolver = async (
  brainWorkerId: string
): Promise<BrainWorkerOperationalProfile | null> => {
  if (brainWorkerId === FIXTURE_APPROVED_BRAINWORKER_A) {
    return JSON.parse(
      JSON.stringify(FIXTURE_OPERATIONAL_PROFILE_A)
    ) as BrainWorkerOperationalProfile;
  }
  if (brainWorkerId === FIXTURE_APPROVED_BRAINWORKER_B) {
    return JSON.parse(
      JSON.stringify(FIXTURE_OPERATIONAL_PROFILE_B)
    ) as BrainWorkerOperationalProfile;
  }
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
    seedLead: (brainWorkerId: string, lead: AuthoritativeLeadInvitation) => {
      (repository as BrainWorkerLeadsRepository).seedLead(brainWorkerId, lead);
    },
    getRawLeads: async (brainWorkerId: string) => {
      return repository.getLeads(brainWorkerId);
    },
  };
}

export function createBrainWorkerLeadsRepository(
  dependencies: BrainWorkerLeadsRepositoryDependencies = {}
): IBrainWorkerLeadsRepository {
  return new BrainWorkerLeadsRepository(dependencies);
}

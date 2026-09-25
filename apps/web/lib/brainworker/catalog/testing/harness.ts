// apps/web/lib/brainworker/catalog/testing/harness.ts
// Test harness factory for BW-002 operations repository testing.
// Strictly for testing use. Must never be imported by production code.

import type { IBrainWorkerOperationsRepository } from '../types';
import type { IBrainWorkerOnboardingRepository } from '../../types';
import {
  createBrainWorkerOperationsRepository,
  resetDefaultBrainWorkerOperationsRepository,
  type BrainWorkerOperationsRepositoryDependencies,
} from '../repository';
import {
  createBrainWorkerOnboardingRepository,
  createBrainWorkerRepositoryStore,
  resetDefaultBrainWorkerOnboardingRepository,
} from '../../repository';
import {
  FIXTURE_APPROVED_BRAINWORKER_A,
  FIXTURE_ONBOARDING_RECORD_A,
} from './fixtures';

export interface OperationsTestHarness {
  repository: IBrainWorkerOperationsRepository;
  onboardingRepository: IBrainWorkerOnboardingRepository;
}

export function createOperationsTestHarness(
  options: {
    dependencies?: BrainWorkerOperationsRepositoryDependencies;
  } = {}
): OperationsTestHarness {
  const onboardingStore = createBrainWorkerRepositoryStore();
  onboardingStore.records.set(
    FIXTURE_APPROVED_BRAINWORKER_A,
    JSON.parse(JSON.stringify(FIXTURE_ONBOARDING_RECORD_A))
  );
  const onboardingRepository =
    options.dependencies?.onboardingRepository ??
    createBrainWorkerOnboardingRepository(onboardingStore);

  const repository = createBrainWorkerOperationsRepository({
    onboardingRepository,
    ...options.dependencies,
  });

  return { repository, onboardingRepository };
}

export function resetOperationsRepository(): void {
  resetDefaultBrainWorkerOperationsRepository();
  resetDefaultBrainWorkerOnboardingRepository();
}

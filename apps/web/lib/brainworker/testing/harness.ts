// apps/web/lib/brainworker/testing/harness.ts
// Test harness factory for BW-001 onboarding repository testing.
// Strictly for testing use. Must never be imported by production code.

import type { IBrainWorkerOnboardingRepository } from '../types';
import {
  createBrainWorkerOnboardingRepository,
  resetDefaultBrainWorkerOnboardingRepository,
  type BrainWorkerRepositoryStore,
  createBrainWorkerRepositoryStore,
} from '../repository';
import {
  BrainWorkerTestController,
  type IBrainWorkerTestController,
} from './controller';

export interface BrainWorkerTestHarness {
  repository: IBrainWorkerOnboardingRepository;
  testController: IBrainWorkerTestController;
  store: BrainWorkerRepositoryStore;
}

export function createBrainWorkerTestHarness(
  customStore?: BrainWorkerRepositoryStore
): BrainWorkerTestHarness {
  const store = customStore ?? createBrainWorkerRepositoryStore();
  const repository = createBrainWorkerOnboardingRepository(store);
  const testController = new BrainWorkerTestController(store);
  return { repository, testController, store };
}

export function resetBrainWorkerOnboardingRepository(): void {
  resetDefaultBrainWorkerOnboardingRepository();
}

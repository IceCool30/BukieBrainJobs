// apps/web/lib/brainworker/catalog/testing/harness.ts
// Test harness factory for BW-002 operations repository testing.
// Strictly for testing use. Must never be imported by production code.

import type { IBrainWorkerOperationsRepository } from '../types';
import {
  createBrainWorkerOperationsRepository,
  resetDefaultBrainWorkerOperationsRepository,
} from '../repository';

export interface OperationsTestHarness {
  repository: IBrainWorkerOperationsRepository;
}

export function createOperationsTestHarness(): OperationsTestHarness {
  const repository = createBrainWorkerOperationsRepository();
  return { repository };
}

export function resetOperationsRepository(): void {
  resetDefaultBrainWorkerOperationsRepository();
}

// apps/web/lib/brainworker/testing/store.ts
// Test store abstraction for BW-001
// Strictly for testing use. Must never be imported by production code.

import {
  createBrainWorkerRepositoryStore,
  type BrainWorkerRepositoryStore,
} from '../repository';

export type BrainWorkerTestStore = BrainWorkerRepositoryStore;
export const createBrainWorkerTestStore = createBrainWorkerRepositoryStore;

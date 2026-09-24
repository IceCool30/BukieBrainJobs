// apps/web/lib/brainworker/repository.ts
// Phase 1 RED Stub: BrainWorker Onboarding Repository
// Authoritative References:
// - docs/specs/BW-001-architecture-contract.md (Section 4 & 5)
// - docs/specs/BW-001-test-first-implementation-plan.md (Suite 2: REP-001 to REP-013)

import type {
  IBrainWorkerOnboardingRepository,
  BrainWorkerOnboardingRecord,
  OnboardingStep,
  OnboardingIdentityData,
  OnboardingTradeData,
  OnboardingCredentialsData,
  StagedDocument,
  DocumentCategory,
  SpecificDocumentType,
} from './types';

export interface BrainWorkerRepositoryStore {
  records: Map<string, BrainWorkerOnboardingRecord>;
  stagedFiles: Map<string, StagedDocument>;
  subscribers: Map<string, Set<(record: BrainWorkerOnboardingRecord) => void>>;
}

export function createBrainWorkerRepositoryStore(): BrainWorkerRepositoryStore {
  return {
    records: new Map(),
    stagedFiles: new Map(),
    subscribers: new Map(),
  };
}

export class BrainWorkerOnboardingRepository implements IBrainWorkerOnboardingRepository {
  readonly store: BrainWorkerRepositoryStore;

  constructor(store: BrainWorkerRepositoryStore = createBrainWorkerRepositoryStore()) {
    this.store = store;
  }

  async getOnboardingRecord(_brainWorkerId: string): Promise<BrainWorkerOnboardingRecord | null> {
    // RED Stub: intentionally incomplete
    return null;
  }

  async saveDraftStep(
    _brainWorkerId: string,
    _step: OnboardingStep,
    _stepData: Partial<OnboardingIdentityData | OnboardingTradeData | OnboardingCredentialsData>
  ): Promise<BrainWorkerOnboardingRecord> {
    // RED Stub: intentionally incomplete
    throw new Error('Not implemented');
  }

  async stageDocument(
    _brainWorkerId: string,
    _file: {
      name: string;
      size: number;
      type: string;
      category: DocumentCategory;
      specificType: SpecificDocumentType;
      dataUrl?: string | undefined;
    }
  ): Promise<StagedDocument> {
    // RED Stub: intentionally incomplete
    throw new Error('Not implemented');
  }

  async removeStagedDocument(_brainWorkerId: string, _documentId: string): Promise<void> {
    // RED Stub: intentionally incomplete
    throw new Error('Not implemented');
  }

  async submitOnboarding(
    _brainWorkerId: string,
    _declaration: { truthfulnessAcknowledged: boolean; termsAccepted: boolean }
  ): Promise<BrainWorkerOnboardingRecord> {
    // RED Stub: intentionally incomplete
    throw new Error('Not implemented');
  }

  subscribe(
    _brainWorkerId: string,
    _listener: (record: BrainWorkerOnboardingRecord) => void
  ): () => void {
    return () => {};
  }
}

let defaultRepository: IBrainWorkerOnboardingRepository | null = null;

export function getBrainWorkerOnboardingRepository(): IBrainWorkerOnboardingRepository {
  if (!defaultRepository) {
    defaultRepository = new BrainWorkerOnboardingRepository();
  }
  return defaultRepository;
}

export function createBrainWorkerOnboardingRepository(
  store?: BrainWorkerRepositoryStore
): IBrainWorkerOnboardingRepository {
  return new BrainWorkerOnboardingRepository(store);
}

export function resetDefaultBrainWorkerOnboardingRepository(): void {
  defaultRepository = null;
}

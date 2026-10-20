// apps/web/lib/completion/repository.ts
// BW-009: Post-Job Completion & Escrow Release
// Phase 2 RED: Throwing Repository Stubs

import type {
  ICompletionRepository,
  MutualRatingSubmissionInput,
  PostJobCompletionState,
} from './types';

export class InMemoryCompletionRepository implements ICompletionRepository {
  private readonly records = new Map<string, PostJobCompletionState>();

  private clone<T>(val: T): T {
    return JSON.parse(JSON.stringify(val)) as T;
  }

  async getCompletionState(
    _bookingId: string
  ): Promise<PostJobCompletionState | null> {
    throw new Error('Not implemented: Phase 2 RED stub');
  }

  async confirmSatisfaction(
    _bookingId: string,
    _customerId: string,
    _feedbackNote?: string
  ): Promise<PostJobCompletionState> {
    throw new Error('Not implemented: Phase 2 RED stub');
  }

  async triggerAutoRelease(
    _bookingId: string,
    _now?: string
  ): Promise<PostJobCompletionState> {
    throw new Error('Not implemented: Phase 2 RED stub');
  }

  async raiseDispute(
    _bookingId: string,
    _raisedByUserId: string,
    _reason: string
  ): Promise<PostJobCompletionState> {
    throw new Error('Not implemented: Phase 2 RED stub');
  }

  async submitReview(
    _bookingId: string,
    _reviewerId: string,
    _role: 'customer' | 'brainworker',
    _ratings: MutualRatingSubmissionInput
  ): Promise<PostJobCompletionState> {
    throw new Error('Not implemented: Phase 2 RED stub');
  }

  seed(records: PostJobCompletionState[]): void {
    for (const record of records) {
      this.records.set(record.bookingId, this.clone(record));
    }
  }

  clear(): void {
    this.records.clear();
  }
}

let singletonRepository: InMemoryCompletionRepository | null = null;

export function getCompletionRepository(): InMemoryCompletionRepository {
  if (!singletonRepository) {
    singletonRepository = new InMemoryCompletionRepository();
  }
  return singletonRepository;
}

export function resetCompletionRepository(): void {
  singletonRepository = null;
}

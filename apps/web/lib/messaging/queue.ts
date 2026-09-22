// apps/web/lib/messaging/queue.ts
// Phase 2 GREEN: Offline Queue Production Implementation
// Authoritative Reference: WEB-017 Architecture Contract v1.0
//
// Design principles:
// - Queue state partitioned strictly by authenticated userId (session isolation).
// - FIFO drain with tempId as idempotency key.
// - Booking lifecycle re-verified before each replay send.
// - COMPLETED and CANCELLED bookings invalidate pending queued messages.
// - Photo attachments cannot be queued offline (requires active upload transport).
// - No browser globals, React, Socket.io, or transport-specific logic.
// - No imports from ./testing.

import type {
  OfflineQueuedMessage,
  LocationPayload,
} from './types';
import { MediaUploadError } from './types';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Domain Types
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** A queued message that permanently failed to send during drain replay. */
export interface FailedQueuedMessage extends OfflineQueuedMessage {
  /** Human-readable reason the message could not be sent. */
  errorMessage: string;
  /** ISO 8601 timestamp when the failure was recorded. */
  failedAt: string;
}

/** Input shape for enqueueing a text message. */
export interface EnqueueTextInput {
  jobId: string;
  content: string;
  contentType: 'text';
  tempId: string;
}

/** Input shape for enqueueing a location message. */
export interface EnqueueLocationInput {
  jobId: string;
  content: string;
  contentType: 'location';
  location: LocationPayload;
  tempId: string;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Storage Abstraction (Dependency Inversion)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Storage backend for the offline queue.
 * Implementations may use sessionStorage, IndexedDB, or in-memory Maps.
 * The test harness provides InMemoryQueueStorage.
 */
export interface IQueueStorage {
  getQueue(userId: string): OfflineQueuedMessage[];
  setQueue(userId: string, items: OfflineQueuedMessage[]): void;
  append(userId: string, item: OfflineQueuedMessage): void;
  remove(userId: string, tempId: string): boolean;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Drain Options
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface DrainOptions {
  /**
   * The currently authenticated user ID at drain time.
   * Drain is a no-op if this does not match the queue owner (session isolation).
   */
  activeUserId: string;
  /**
   * Async function to re-verify the booking status before each send.
   * Returns the current BookingStatus string.
   */
  getBookingStatus: (jobId: string) => Promise<string>;
  /**
   * Async function that transmits a single queued message to the server.
   * Must throw on failure so the queue can mark the message as failed.
   */
  sender: (userId: string, msg: OfflineQueuedMessage) => Promise<void>;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Public Interface
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface IOfflineQueue {
  /**
   * Appends a text message to the userId-scoped pending queue.
   * Returns the OfflineQueuedMessage record with generated metadata.
   */
  enqueueText(userId: string, input: EnqueueTextInput): OfflineQueuedMessage;

  /**
   * Always throws MediaUploadError.
   * Photo attachments require an active upload transport — they cannot be queued offline.
   */
  enqueueImageAttachment(): never;

  /**
   * Returns the pending (not yet sent) messages for the given userId, in FIFO order.
   */
  getQueue(userId: string): OfflineQueuedMessage[];

  /**
   * Drains the userId-scoped queue in FIFO order.
   * Re-verifies booking status before each send.
   * COMPLETED/CANCELLED bookings invalidate the queued message (marked failed).
   * Session mismatch (activeUserId !== userId) aborts the drain without sending.
   */
  drain(userId: string, options: DrainOptions): Promise<void>;

  /**
   * Returns messages that failed permanently during drain (booking closed or network error).
   */
  getFailedMessages(userId: string): FailedQueuedMessage[];

  /**
   * Re-queues a failed message for another drain attempt.
   * Increments retryCount on the message.
   */
  retryFailed(userId: string, tempId: string): void;

  /**
   * Removes a pending message from the queue.
   * Returns true if the message was found and removed; false if not found.
   */
  remove(userId: string, tempId: string): boolean;

  /**
   * Permanently dismisses a failed message from the failed list.
   */
  dismissFailed(userId: string, tempId: string): void;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Default In-Memory Storage (no-dependency fallback)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class InternalMemoryStorage implements IQueueStorage {
  private readonly queues = new Map<string, OfflineQueuedMessage[]>();

  getQueue(userId: string): OfflineQueuedMessage[] {
    return this.queues.get(userId) ?? [];
  }

  setQueue(userId: string, items: OfflineQueuedMessage[]): void {
    this.queues.set(userId, [...items]);
  }

  append(userId: string, item: OfflineQueuedMessage): void {
    const current = this.getQueue(userId);
    this.queues.set(userId, [...current, item]);
  }

  remove(userId: string, tempId: string): boolean {
    const current = this.getQueue(userId);
    const filtered = current.filter((m) => m.tempId !== tempId);
    if (filtered.length === current.length) return false;
    this.queues.set(userId, filtered);
    return true;
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Lifecycle Constants
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const READONLY_BOOKING_STATUSES = ['COMPLETED', 'CANCELLED'] as const;
type ReadonlyBookingStatus = typeof READONLY_BOOKING_STATUSES[number];

function isReadOnlyStatus(status: string): status is ReadonlyBookingStatus {
  return (READONLY_BOOKING_STATUSES as readonly string[]).includes(status);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// OfflineQueue Implementation
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class OfflineQueue implements IOfflineQueue {
  private readonly storage: IQueueStorage;
  /** Failed messages partitioned by userId. */
  private readonly failedByUser = new Map<string, FailedQueuedMessage[]>();

  constructor(storage: IQueueStorage) {
    this.storage = storage;
  }

  enqueueText(userId: string, input: EnqueueTextInput): OfflineQueuedMessage {
    const msg: OfflineQueuedMessage = {
      tempId: input.tempId,
      jobId: input.jobId,
      userId,
      content: input.content,
      contentType: 'text',
      queuedAt: new Date().toISOString(),
      retryCount: 0,
    };
    this.storage.append(userId, msg);
    return msg;
  }

  enqueueImageAttachment(): never {
    throw new MediaUploadError(
      'Photo attachments require an active internet connection. Please reconnect and try again.'
    );
  }

  getQueue(userId: string): OfflineQueuedMessage[] {
    return this.storage.getQueue(userId);
  }

  async drain(userId: string, options: DrainOptions): Promise<void> {
    // Session isolation: abort silently if active session doesn't match the queue owner
    if (options.activeUserId !== userId) {
      return;
    }

    // Snapshot the pending queue so in-flight mutations don't affect iteration
    const pending = [...this.storage.getQueue(userId)];

    for (const msg of pending) {
      // Re-verify booking lifecycle before each send
      const status = await options.getBookingStatus(msg.jobId);

      if (isReadOnlyStatus(status)) {
        // Booking closed while device was offline — invalidate message
        this.storage.remove(userId, msg.tempId);
        this.recordFailure(
          userId,
          msg,
          `This job has ended. Queued messages cannot be sent to a ${status.toLowerCase()} booking.`
        );
        continue;
      }

      try {
        await options.sender(userId, msg);
        // Successful send — remove from pending queue
        this.storage.remove(userId, msg.tempId);
      } catch (err) {
        // Network or server error — remove from pending and record as failed
        this.storage.remove(userId, msg.tempId);
        const reason =
          err instanceof Error ? err.message : 'Message could not be sent due to an unknown error.';
        this.recordFailure(userId, msg, reason);
      }
    }
  }

  getFailedMessages(userId: string): FailedQueuedMessage[] {
    return this.failedByUser.get(userId) ?? [];
  }

  retryFailed(userId: string, tempId: string): void {
    const failed = this.failedByUser.get(userId) ?? [];
    const idx = failed.findIndex((m) => m.tempId === tempId);
    if (idx === -1) return;

    const failedMsg = failed[idx];
    if (!failedMsg) return;

    // Remove from the failed list
    this.failedByUser.set(userId, failed.filter((m) => m.tempId !== tempId));

    // Re-queue with incremented retryCount — preserves all original fields
    const retryMsg: OfflineQueuedMessage = {
      tempId: failedMsg.tempId,
      jobId: failedMsg.jobId,
      userId: failedMsg.userId,
      content: failedMsg.content,
      contentType: failedMsg.contentType,
      location: failedMsg.location,
      queuedAt: failedMsg.queuedAt,
      retryCount: failedMsg.retryCount + 1,
    };
    this.storage.append(userId, retryMsg);
  }

  remove(userId: string, tempId: string): boolean {
    return this.storage.remove(userId, tempId);
  }

  dismissFailed(userId: string, tempId: string): void {
    const failed = this.failedByUser.get(userId) ?? [];
    this.failedByUser.set(userId, failed.filter((m) => m.tempId !== tempId));
  }

  // ── Private helpers ──────────────────────────────────────────────

  private recordFailure(userId: string, msg: OfflineQueuedMessage, errorMessage: string): void {
    const failedMsg: FailedQueuedMessage = {
      ...msg,
      errorMessage,
      failedAt: new Date().toISOString(),
    };
    const existing = this.failedByUser.get(userId) ?? [];
    this.failedByUser.set(userId, [...existing, failedMsg]);
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Factory
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface CreateOfflineQueueOptions {
  /**
   * Injectable storage backend.
   * Defaults to an in-process Map-based store.
   * The test harness injects InMemoryQueueStorage to share state with QueueSenderSpy.
   */
  storage?: IQueueStorage;
}

/**
 * Creates a new offline queue.
 *
 * @example
 * // Default (in-process memory storage)
 * const queue = createOfflineQueue();
 *
 * @example
 * // Injectable storage (e.g. in tests)
 * const queue = createOfflineQueue({ storage: harness.storage });
 */
export function createOfflineQueue(options: CreateOfflineQueueOptions = {}): IOfflineQueue {
  const storage = options.storage ?? new InternalMemoryStorage();
  return new OfflineQueue(storage);
}

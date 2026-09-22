// apps/web/lib/messaging/queue.test.ts
// Phase 2 RED: Offline Queue & Session Isolation Tests (QUE-001 – QUE-010)
// Governed by: WEB-017 Architecture Contract v1.0 & Test-First Implementation Plan v1.0
//
// RED BOUNDARY: This file imports from './queue' which does not yet exist.
// Vitest will fail at module resolution before any individual test executes.
// The genuine architectural absence is confirmed by the import failure.
//
// Environment: jsdom (navigator.onLine is available via globalThis.navigator)

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type {
  OfflineQueuedMessage,
  LocationPayload,
} from './types';
import { MediaUploadError } from './types';
// ┌─────────────────────────────────────────────────────────────────────────────┐
// │ RED MARKER — The import below causes the entire suite to fail in Phase 2.   │
// │ The production module ./queue does not yet exist.                           │
// │ GREEN is authorized only after createOfflineQueue is implemented.           │
// └─────────────────────────────────────────────────────────────────────────────┘
import { createOfflineQueue, type IOfflineQueue } from './queue';
import {
  createQueueTestHarness,
  type QueueTestHarness,
  FIXTURE_CUSTOMER_ID_A,
  FIXTURE_CUSTOMER_ID_B,
  FIXTURE_BOOKING_CONFIRMED,
  FIXTURE_BOOKING_COMPLETED,
  FIXTURE_BOOKING_CANCELLED,
  FIXTURE_BOOKING_OTHER_CUSTOMER,
  FIXTURE_OFFLINE_MESSAGE_A,
  FIXTURE_OFFLINE_MESSAGE_B,
  FIXTURE_OFFLINE_MESSAGE_C,
  FIXTURE_LOCATION_PAYLOAD,
} from './testing';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Helper: set navigator.onLine
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function setOnlineStatus(isOnline: boolean): void {
  Object.defineProperty(globalThis.navigator, 'onLine', {
    value: isOnline,
    configurable: true,
    writable: true,
  });
}

describe('WEB-017 Offline Queue & Session Isolation (QUE-001 – QUE-010)', () => {
  let harness: QueueTestHarness;
  let queue: IOfflineQueue;

  beforeEach(() => {
    harness = createQueueTestHarness();
    // Pass the harness storage into the production queue so it can use in-memory storage
    queue = createOfflineQueue({ storage: harness.storage });
    // Default: offline
    setOnlineStatus(false);
  });

  afterEach(() => {
    harness.resetAll();
    // Restore online status
    setOnlineStatus(true);
    vi.restoreAllMocks();
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // QUE-001: Enqueue text message when offline
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('QUE-001: Appends outbound text message to offline queue when navigator.onLine === false', () => {
    it('enqueues a text message and adds it to the user-scoped queue', () => {
      const queued = queue.enqueueText(FIXTURE_CUSTOMER_ID_A, {
        jobId: FIXTURE_BOOKING_CONFIRMED.jobId,
        content: 'Are you still coming today?',
        contentType: 'text',
        tempId: 'temp-que-001',
      });

      expect(queued.tempId).toBe('temp-que-001');
      expect(queued.userId).toBe(FIXTURE_CUSTOMER_ID_A);
      expect(queued.content).toBe('Are you still coming today?');
      expect(queued.contentType).toBe('text');

      const userQueue = queue.getQueue(FIXTURE_CUSTOMER_ID_A);
      expect(userQueue).toHaveLength(1);
      expect(userQueue[0]!.tempId).toBe('temp-que-001');
    });

    it('queued message has a queuedAt ISO 8601 timestamp', () => {
      const queued = queue.enqueueText(FIXTURE_CUSTOMER_ID_A, {
        jobId: FIXTURE_BOOKING_CONFIRMED.jobId,
        content: 'Timestamp test.',
        contentType: 'text',
        tempId: 'temp-que-001b',
      });
      expect(typeof queued.queuedAt).toBe('string');
      expect(Date.parse(queued.queuedAt)).not.toBeNaN();
    });

    it('queued message starts with retryCount of 0', () => {
      const queued = queue.enqueueText(FIXTURE_CUSTOMER_ID_A, {
        jobId: FIXTURE_BOOKING_CONFIRMED.jobId,
        content: 'Retry count test.',
        contentType: 'text',
        tempId: 'temp-que-001c',
      });
      expect(queued.retryCount).toBe(0);
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // QUE-002: Reject photo attachment queueing when offline
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('QUE-002: Rejects photo attachment queueing when offline with explanatory error', () => {
    it('throws MediaUploadError when attempting to queue an image attachment while offline', () => {
      expect(() =>
        queue.enqueueImageAttachment()
      ).toThrow(MediaUploadError);
    });

    it('throws with an explanatory message about internet connectivity requirement', () => {
      expect(() =>
        queue.enqueueImageAttachment()
      ).toThrow(/internet connection|online|connectivity|requires.*connection/i);
    });

    it('does not add any message to the queue when image queuing is rejected', () => {
      try {
        queue.enqueueImageAttachment();
      } catch {
        // expected
      }
      const userQueue = queue.getQueue(FIXTURE_CUSTOMER_ID_A);
      expect(userQueue).toHaveLength(0);
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // QUE-003: Queue scoped strictly to authenticated userId
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('QUE-003: Offline queue is scoped strictly to authenticated userId', () => {
    it('messages queued under User A are not visible in User B queue', () => {
      queue.enqueueText(FIXTURE_CUSTOMER_ID_A, {
        jobId: FIXTURE_BOOKING_CONFIRMED.jobId,
        content: 'User A private message.',
        contentType: 'text',
        tempId: 'temp-que-003-a',
      });

      const userBQueue = queue.getQueue(FIXTURE_CUSTOMER_ID_B);
      expect(userBQueue).toHaveLength(0);
    });

    it('messages queued under User B are not visible in User A queue', () => {
      queue.enqueueText(FIXTURE_CUSTOMER_ID_B, {
        jobId: FIXTURE_BOOKING_OTHER_CUSTOMER.jobId,
        content: 'User B private message.',
        contentType: 'text',
        tempId: 'temp-que-003-b',
      });

      const userAQueue = queue.getQueue(FIXTURE_CUSTOMER_ID_A);
      expect(userAQueue).toHaveLength(0);
    });

    it('each user has an isolated independent queue', () => {
      queue.enqueueText(FIXTURE_CUSTOMER_ID_A, {
        jobId: FIXTURE_BOOKING_CONFIRMED.jobId,
        content: 'Message for A.',
        contentType: 'text',
        tempId: 'temp-que-003-a2',
      });
      queue.enqueueText(FIXTURE_CUSTOMER_ID_B, {
        jobId: FIXTURE_BOOKING_OTHER_CUSTOMER.jobId,
        content: 'Message for B.',
        contentType: 'text',
        tempId: 'temp-que-003-b2',
      });

      expect(queue.getQueue(FIXTURE_CUSTOMER_ID_A)).toHaveLength(1);
      expect(queue.getQueue(FIXTURE_CUSTOMER_ID_B)).toHaveLength(1);
      expect(queue.getQueue(FIXTURE_CUSTOMER_ID_A)[0]!.tempId).toBe('temp-que-003-a2');
      expect(queue.getQueue(FIXTURE_CUSTOMER_ID_B)[0]!.tempId).toBe('temp-que-003-b2');
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // QUE-004: Does not send queued messages if user logs out or switches accounts
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('QUE-004: Does not send queued messages if user logs out or switches accounts', () => {
    it('drain halts without sending when the active session userId does not match the queue userId', async () => {
      // Enqueue messages for User A
      queue.enqueueText(FIXTURE_CUSTOMER_ID_A, {
        jobId: FIXTURE_BOOKING_CONFIRMED.jobId,
        content: 'Message before logout.',
        contentType: 'text',
        tempId: 'temp-que-004',
      });

      // Attempt to drain as User B (different session — simulating an account switch)
      await queue.drain(FIXTURE_CUSTOMER_ID_A, {
        activeUserId: FIXTURE_CUSTOMER_ID_B, // ← switched session
        getBookingStatus: harness.bookingStatusStub.getBookingStatus.bind(harness.bookingStatusStub),
        sender: (userId, msg) => harness.senderSpy.send(userId, msg),
      });

      // Nothing should have been sent because the active session doesn't match
      expect(harness.senderSpy.getSentTempIds()).not.toContain('temp-que-004');
    });

    it('messages remain in the queue when drain is skipped due to session mismatch', async () => {
      queue.enqueueText(FIXTURE_CUSTOMER_ID_A, {
        jobId: FIXTURE_BOOKING_CONFIRMED.jobId,
        content: 'Retained message.',
        contentType: 'text',
        tempId: 'temp-que-004b',
      });

      await queue.drain(FIXTURE_CUSTOMER_ID_A, {
        activeUserId: FIXTURE_CUSTOMER_ID_B,
        getBookingStatus: harness.bookingStatusStub.getBookingStatus.bind(harness.bookingStatusStub),
        sender: (userId, msg) => harness.senderSpy.send(userId, msg),
      });

      expect(queue.getQueue(FIXTURE_CUSTOMER_ID_A)).toHaveLength(1);
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // QUE-005: Drains queue sequentially in FIFO order when online
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('QUE-005: Drains offline queue sequentially in FIFO order when connectivity returns', () => {
    it('sends messages in the exact order they were enqueued', async () => {
      setOnlineStatus(true);
      harness.bookingStatusStub.setStatus(FIXTURE_BOOKING_CONFIRMED.jobId, 'CONFIRMED');

      queue.enqueueText(FIXTURE_CUSTOMER_ID_A, {
        jobId: FIXTURE_BOOKING_CONFIRMED.jobId,
        content: 'First message.',
        contentType: 'text',
        tempId: 'temp-que-005-first',
      });
      queue.enqueueText(FIXTURE_CUSTOMER_ID_A, {
        jobId: FIXTURE_BOOKING_CONFIRMED.jobId,
        content: 'Second message.',
        contentType: 'text',
        tempId: 'temp-que-005-second',
      });
      queue.enqueueText(FIXTURE_CUSTOMER_ID_A, {
        jobId: FIXTURE_BOOKING_CONFIRMED.jobId,
        content: 'Third message.',
        contentType: 'text',
        tempId: 'temp-que-005-third',
      });

      await queue.drain(FIXTURE_CUSTOMER_ID_A, {
        activeUserId: FIXTURE_CUSTOMER_ID_A,
        getBookingStatus: harness.bookingStatusStub.getBookingStatus.bind(harness.bookingStatusStub),
        sender: (userId, msg) => harness.senderSpy.send(userId, msg),
      });

      const sentIds = harness.senderSpy.getSentTempIds();
      expect(sentIds).toEqual([
        'temp-que-005-first',
        'temp-que-005-second',
        'temp-que-005-third',
      ]);
    });

    it('queue is empty after successful drain', async () => {
      setOnlineStatus(true);
      harness.bookingStatusStub.setStatus(FIXTURE_BOOKING_CONFIRMED.jobId, 'CONFIRMED');

      queue.enqueueText(FIXTURE_CUSTOMER_ID_A, {
        jobId: FIXTURE_BOOKING_CONFIRMED.jobId,
        content: 'Will be drained.',
        contentType: 'text',
        tempId: 'temp-que-005-drain',
      });

      await queue.drain(FIXTURE_CUSTOMER_ID_A, {
        activeUserId: FIXTURE_CUSTOMER_ID_A,
        getBookingStatus: harness.bookingStatusStub.getBookingStatus.bind(harness.bookingStatusStub),
        sender: (userId, msg) => harness.senderSpy.send(userId, msg),
      });

      expect(queue.getQueue(FIXTURE_CUSTOMER_ID_A)).toHaveLength(0);
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // QUE-006: Replays using idempotencyKey = tempId to prevent duplicate persistence
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('QUE-006: Replays messages using idempotencyKey = tempId to prevent duplicate persistence', () => {
    it('passes the tempId as the idempotency key in each send call', async () => {
      setOnlineStatus(true);
      harness.bookingStatusStub.setStatus(FIXTURE_BOOKING_CONFIRMED.jobId, 'CONFIRMED');

      const IDEMPOTENT_TEMP_ID = 'temp-que-006-idem';
      queue.enqueueText(FIXTURE_CUSTOMER_ID_A, {
        jobId: FIXTURE_BOOKING_CONFIRMED.jobId,
        content: 'Idempotent replay message.',
        contentType: 'text',
        tempId: IDEMPOTENT_TEMP_ID,
      });

      await queue.drain(FIXTURE_CUSTOMER_ID_A, {
        activeUserId: FIXTURE_CUSTOMER_ID_A,
        getBookingStatus: harness.bookingStatusStub.getBookingStatus.bind(harness.bookingStatusStub),
        sender: (userId, msg) => harness.senderSpy.send(userId, msg),
      });

      // Verify the message sent to the sender contains the correct tempId for idempotency
      const sent = harness.senderSpy.sent.find((r) => r.message.tempId === IDEMPOTENT_TEMP_ID);
      expect(sent).toBeDefined();
      expect(sent!.message.tempId).toBe(IDEMPOTENT_TEMP_ID);
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // QUE-007: Invalidate message if booking COMPLETED while offline
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('QUE-007: Invalidates queued message with failed status if booking was COMPLETED while offline', () => {
    it('does not send a queued message when booking status is COMPLETED at drain time', async () => {
      setOnlineStatus(true);
      // Job became COMPLETED while device was offline
      harness.bookingStatusStub.setStatus(FIXTURE_BOOKING_CONFIRMED.jobId, 'COMPLETED');

      queue.enqueueText(FIXTURE_CUSTOMER_ID_A, {
        jobId: FIXTURE_BOOKING_CONFIRMED.jobId,
        content: 'Message queued before job completed.',
        contentType: 'text',
        tempId: 'temp-que-007',
      });

      await queue.drain(FIXTURE_CUSTOMER_ID_A, {
        activeUserId: FIXTURE_CUSTOMER_ID_A,
        getBookingStatus: harness.bookingStatusStub.getBookingStatus.bind(harness.bookingStatusStub),
        sender: (userId, msg) => harness.senderSpy.send(userId, msg),
      });

      expect(harness.senderSpy.getSentTempIds()).not.toContain('temp-que-007');
    });

    it('marks the message as failed with an explanatory message when booking is COMPLETED', async () => {
      setOnlineStatus(true);
      harness.bookingStatusStub.setStatus(FIXTURE_BOOKING_CONFIRMED.jobId, 'COMPLETED');

      queue.enqueueText(FIXTURE_CUSTOMER_ID_A, {
        jobId: FIXTURE_BOOKING_CONFIRMED.jobId,
        content: 'Invalidated due to job completion.',
        contentType: 'text',
        tempId: 'temp-que-007-fail',
      });

      await queue.drain(FIXTURE_CUSTOMER_ID_A, {
        activeUserId: FIXTURE_CUSTOMER_ID_A,
        getBookingStatus: harness.bookingStatusStub.getBookingStatus.bind(harness.bookingStatusStub),
        sender: (userId, msg) => harness.senderSpy.send(userId, msg),
      });

      const failed = queue.getFailedMessages(FIXTURE_CUSTOMER_ID_A);
      expect(failed.length).toBeGreaterThan(0);
      const failedMsg = failed.find((m) => m.tempId === 'temp-que-007-fail');
      expect(failedMsg).toBeDefined();
      expect(failedMsg!.errorMessage).toMatch(/job has ended|completed|cannot be sent/i);
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // QUE-008: Invalidate message if booking CANCELLED while offline
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('QUE-008: Invalidates queued message with failed status if booking was CANCELLED while offline', () => {
    it('does not send a queued message when booking status is CANCELLED at drain time', async () => {
      setOnlineStatus(true);
      harness.bookingStatusStub.setStatus(FIXTURE_BOOKING_CONFIRMED.jobId, 'CANCELLED');

      queue.enqueueText(FIXTURE_CUSTOMER_ID_A, {
        jobId: FIXTURE_BOOKING_CONFIRMED.jobId,
        content: 'Message queued before job was cancelled.',
        contentType: 'text',
        tempId: 'temp-que-008',
      });

      await queue.drain(FIXTURE_CUSTOMER_ID_A, {
        activeUserId: FIXTURE_CUSTOMER_ID_A,
        getBookingStatus: harness.bookingStatusStub.getBookingStatus.bind(harness.bookingStatusStub),
        sender: (userId, msg) => harness.senderSpy.send(userId, msg),
      });

      expect(harness.senderSpy.getSentTempIds()).not.toContain('temp-que-008');
    });

    it('marks the message as failed with explanatory error message when booking is CANCELLED', async () => {
      setOnlineStatus(true);
      harness.bookingStatusStub.setStatus(FIXTURE_BOOKING_CONFIRMED.jobId, 'CANCELLED');

      queue.enqueueText(FIXTURE_CUSTOMER_ID_A, {
        jobId: FIXTURE_BOOKING_CONFIRMED.jobId,
        content: 'Invalidated due to cancellation.',
        contentType: 'text',
        tempId: 'temp-que-008-fail',
      });

      await queue.drain(FIXTURE_CUSTOMER_ID_A, {
        activeUserId: FIXTURE_CUSTOMER_ID_A,
        getBookingStatus: harness.bookingStatusStub.getBookingStatus.bind(harness.bookingStatusStub),
        sender: (userId, msg) => harness.senderSpy.send(userId, msg),
      });

      const failed = queue.getFailedMessages(FIXTURE_CUSTOMER_ID_A);
      const failedMsg = failed.find((m) => m.tempId === 'temp-que-008-fail');
      expect(failedMsg).toBeDefined();
      expect(failedMsg!.errorMessage).toMatch(/job has ended|cancelled|cannot be sent/i);
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // QUE-009: Allow user to manually retry a failed queued message
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('QUE-009: Allows user to manually retry a failed queued message', () => {
    beforeEach(() => {
      // Set up a failed message in the queue
      setOnlineStatus(true);
      harness.bookingStatusStub.setStatus(FIXTURE_BOOKING_CONFIRMED.jobId, 'CONFIRMED');
    });

    it('retryFailed re-adds the failed message to the active pending queue', async () => {
      // Simulate a network error during send to produce a failed message
      harness.senderSpy.errorOnTempId = 'temp-que-009-failed';
      queue.enqueueText(FIXTURE_CUSTOMER_ID_A, {
        jobId: FIXTURE_BOOKING_CONFIRMED.jobId,
        content: 'Will fail on first send.',
        contentType: 'text',
        tempId: 'temp-que-009-failed',
      });

      await queue.drain(FIXTURE_CUSTOMER_ID_A, {
        activeUserId: FIXTURE_CUSTOMER_ID_A,
        getBookingStatus: harness.bookingStatusStub.getBookingStatus.bind(harness.bookingStatusStub),
        sender: (userId, msg) => harness.senderSpy.send(userId, msg),
      });

      // Verify it's in failed state
      const failed = queue.getFailedMessages(FIXTURE_CUSTOMER_ID_A);
      expect(failed.some((m) => m.tempId === 'temp-que-009-failed')).toBe(true);

      // Retry: clear the error and retry the message
      harness.senderSpy.errorOnTempId = null;
      queue.retryFailed(FIXTURE_CUSTOMER_ID_A, 'temp-que-009-failed');

      // Message should be back in the pending queue
      const pending = queue.getQueue(FIXTURE_CUSTOMER_ID_A);
      expect(pending.some((m) => m.tempId === 'temp-que-009-failed')).toBe(true);
    });

    it('retried message increments retryCount', async () => {
      harness.senderSpy.errorOnTempId = 'temp-que-009-count';
      queue.enqueueText(FIXTURE_CUSTOMER_ID_A, {
        jobId: FIXTURE_BOOKING_CONFIRMED.jobId,
        content: 'Retry count increment test.',
        contentType: 'text',
        tempId: 'temp-que-009-count',
      });

      await queue.drain(FIXTURE_CUSTOMER_ID_A, {
        activeUserId: FIXTURE_CUSTOMER_ID_A,
        getBookingStatus: harness.bookingStatusStub.getBookingStatus.bind(harness.bookingStatusStub),
        sender: (userId, msg) => harness.senderSpy.send(userId, msg),
      });

      harness.senderSpy.errorOnTempId = null;
      queue.retryFailed(FIXTURE_CUSTOMER_ID_A, 'temp-que-009-count');

      const pending = queue.getQueue(FIXTURE_CUSTOMER_ID_A);
      const retried = pending.find((m) => m.tempId === 'temp-que-009-count');
      expect(retried).toBeDefined();
      expect(retried!.retryCount).toBeGreaterThan(0);
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // QUE-010: Allow user to dismiss or delete a failed queued message
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('QUE-010: Allows user to dismiss or delete a failed queued message', () => {
    it('remove() removes a pending message from the user queue', () => {
      queue.enqueueText(FIXTURE_CUSTOMER_ID_A, {
        jobId: FIXTURE_BOOKING_CONFIRMED.jobId,
        content: 'Will be dismissed.',
        contentType: 'text',
        tempId: 'temp-que-010-remove',
      });

      expect(queue.getQueue(FIXTURE_CUSTOMER_ID_A)).toHaveLength(1);

      const removed = queue.remove(FIXTURE_CUSTOMER_ID_A, 'temp-que-010-remove');
      expect(removed).toBe(true);
      expect(queue.getQueue(FIXTURE_CUSTOMER_ID_A)).toHaveLength(0);
    });

    it('remove() returns false when the tempId does not exist in the queue', () => {
      const removed = queue.remove(FIXTURE_CUSTOMER_ID_A, 'non-existent-temp-id');
      expect(removed).toBe(false);
    });

    it('remove() only removes the targeted message and leaves others intact', () => {
      queue.enqueueText(FIXTURE_CUSTOMER_ID_A, {
        jobId: FIXTURE_BOOKING_CONFIRMED.jobId,
        content: 'Keep this.',
        contentType: 'text',
        tempId: 'temp-que-010-keep',
      });
      queue.enqueueText(FIXTURE_CUSTOMER_ID_A, {
        jobId: FIXTURE_BOOKING_CONFIRMED.jobId,
        content: 'Remove this.',
        contentType: 'text',
        tempId: 'temp-que-010-discard',
      });

      queue.remove(FIXTURE_CUSTOMER_ID_A, 'temp-que-010-discard');

      const remaining = queue.getQueue(FIXTURE_CUSTOMER_ID_A);
      expect(remaining).toHaveLength(1);
      expect(remaining[0]!.tempId).toBe('temp-que-010-keep');
    });

    it('dismissFailed() removes a failed message from the failed messages list', async () => {
      setOnlineStatus(true);
      harness.bookingStatusStub.setStatus(FIXTURE_BOOKING_CONFIRMED.jobId, 'COMPLETED');

      queue.enqueueText(FIXTURE_CUSTOMER_ID_A, {
        jobId: FIXTURE_BOOKING_CONFIRMED.jobId,
        content: 'Will fail due to completed job.',
        contentType: 'text',
        tempId: 'temp-que-010-dismiss',
      });

      await queue.drain(FIXTURE_CUSTOMER_ID_A, {
        activeUserId: FIXTURE_CUSTOMER_ID_A,
        getBookingStatus: harness.bookingStatusStub.getBookingStatus.bind(harness.bookingStatusStub),
        sender: (userId, msg) => harness.senderSpy.send(userId, msg),
      });

      const failedBefore = queue.getFailedMessages(FIXTURE_CUSTOMER_ID_A);
      expect(failedBefore.some((m) => m.tempId === 'temp-que-010-dismiss')).toBe(true);

      queue.dismissFailed(FIXTURE_CUSTOMER_ID_A, 'temp-que-010-dismiss');

      const failedAfter = queue.getFailedMessages(FIXTURE_CUSTOMER_ID_A);
      expect(failedAfter.some((m) => m.tempId === 'temp-que-010-dismiss')).toBe(false);
    });
  });
});

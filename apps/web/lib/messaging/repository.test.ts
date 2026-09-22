// apps/web/lib/messaging/repository.test.ts
// Phase 2 RED: Repository Contract & Authorization Tests (REP-001 – REP-025)
// Governed by: WEB-017 Architecture Contract v1.0 & Test-First Implementation Plan v1.0
//
// RED BOUNDARY: This file imports from './repository' which does not yet exist.
// Vitest will fail at module resolution before any individual test executes.
// The genuine architectural absence is confirmed by the import failure.

import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import type { IMessagingRepository } from './types';
import {
  UnauthorizedError,
  ConversationClosedError,
  MediaUploadError,
} from './types';
// ┌─────────────────────────────────────────────────────────────────────────────┐
// │ RED MARKER — The import below causes the entire suite to fail in Phase 2.   │
// │ The production module ./repository does not exist.                          │
// │ GREEN is authorized only after createMessagingRepository is implemented.    │
// └─────────────────────────────────────────────────────────────────────────────┘
import { createMessagingRepository } from './repository';
import {
  createMessagingTestHarness,
  type IMessagingTestController,
  FIXTURE_CUSTOMER_ID_A,
  FIXTURE_CUSTOMER_ID_B,
  FIXTURE_BRAINWORKER_ID_A,
  FIXTURE_BRAINWORKER_ID_B,
  FIXTURE_NON_PARTICIPANT_ID,
  FIXTURE_UNAUTHENTICATED_ID,
  FIXTURE_BOOKING_CONFIRMED,
  FIXTURE_BOOKING_IN_PROGRESS,
  FIXTURE_BOOKING_COMPLETED,
  FIXTURE_BOOKING_CANCELLED,
  FIXTURE_BOOKING_DISPUTED,
  FIXTURE_BOOKING_OTHER_CUSTOMER,
  FIXTURE_BOOKING_BRAINWORKER_B,
  FIXTURE_MESSAGE_FROM_CUSTOMER,
  FIXTURE_MESSAGE_FROM_BRAINWORKER,
  FIXTURE_PAGINATION_BOOKING,
  FIXTURE_PAGINATION_JOB_ID,
  buildPaginationMessages,
  FIXTURE_LOCATION_PAYLOAD,
  FIXTURE_VALID_JPEG_FILE,
  FIXTURE_VALID_PNG_FILE,
  FIXTURE_VALID_WEBP_FILE,
  FIXTURE_OVERSIZED_FILE,
  FIXTURE_INVALID_MIME_FILE,
  buildTestBlob,
} from './testing';

describe('WEB-017 MessagingRepository Contract (REP-001 – REP-025)', () => {
  let repo: IMessagingRepository;
  let ctrl: IMessagingTestController;

  beforeEach(() => {
    const harness = createMessagingTestHarness();
    repo = harness.repository;
    ctrl = harness.testController;
    // Seed canonical conversations for ownership tests
    ctrl.seedConversation(FIXTURE_BOOKING_CONFIRMED);
    ctrl.seedConversation(FIXTURE_BOOKING_IN_PROGRESS);
    ctrl.seedConversation(FIXTURE_BOOKING_COMPLETED);
    ctrl.seedConversation(FIXTURE_BOOKING_CANCELLED);
    ctrl.seedConversation(FIXTURE_BOOKING_DISPUTED);
    ctrl.seedConversation(FIXTURE_BOOKING_OTHER_CUSTOMER);
    ctrl.seedConversation(FIXTURE_BOOKING_BRAINWORKER_B);
    // Seed two messages in the confirmed conversation for conversation listing tests
    ctrl.seedMessage(FIXTURE_BOOKING_CONFIRMED.jobId, FIXTURE_MESSAGE_FROM_CUSTOMER);
    ctrl.seedMessage(FIXTURE_BOOKING_CONFIRMED.jobId, FIXTURE_MESSAGE_FROM_BRAINWORKER);
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // REP-001: getConversations — sorting and ownership
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('REP-001: getConversations returns caller conversations sorted by lastMessageAt descending', () => {
    it('returns conversations belonging to the caller sorted strictly by lastMessageAt DESC', async () => {
      const conversations = await repo.getConversations(FIXTURE_CUSTOMER_ID_A);
      // All conversations owned by Customer A
      expect(conversations.length).toBeGreaterThan(0);
      for (const conv of conversations) {
        expect(
          conv.jobId === FIXTURE_BOOKING_CONFIRMED.jobId ||
          conv.jobId === FIXTURE_BOOKING_IN_PROGRESS.jobId ||
          conv.jobId === FIXTURE_BOOKING_COMPLETED.jobId ||
          conv.jobId === FIXTURE_BOOKING_CANCELLED.jobId ||
          conv.jobId === FIXTURE_BOOKING_DISPUTED.jobId ||
          conv.jobId === FIXTURE_BOOKING_BRAINWORKER_B.jobId
        ).toBe(true);
      }
      // Verify strict descending order
      for (let i = 0; i < conversations.length - 1; i++) {
        expect(conversations[i]!.lastMessageAt >= conversations[i + 1]!.lastMessageAt).toBe(true);
      }
    });

    it('returns the conversation with the latest message timestamp first', async () => {
      // CONFIRMED job has two messages; its lastMessageAt is the latest message timestamp
      const conversations = await repo.getConversations(FIXTURE_CUSTOMER_ID_A);
      const confirmedIdx = conversations.findIndex(
        (c) => c.jobId === FIXTURE_BOOKING_CONFIRMED.jobId
      );
      const inProgressIdx = conversations.findIndex(
        (c) => c.jobId === FIXTURE_BOOKING_IN_PROGRESS.jobId
      );
      // confirmed job has messages in Sep 22, in_progress booking was created Sep 21 with no messages
      expect(confirmedIdx).toBeLessThan(inProgressIdx);
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // REP-002: getConversations — excludes non-participants
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('REP-002: getConversations excludes conversations where caller is not a participant', () => {
    it('does not return conversations owned by a different customer', async () => {
      // Customer A should not see Customer B's conversations
      const conversations = await repo.getConversations(FIXTURE_CUSTOMER_ID_A);
      const jobIds = conversations.map((c) => c.jobId);
      expect(jobIds).not.toContain(FIXTURE_BOOKING_OTHER_CUSTOMER.jobId);
    });

    it('returns zero conversations for a non-participant user', async () => {
      const conversations = await repo.getConversations(FIXTURE_NON_PARTICIPANT_ID);
      expect(conversations).toEqual([]);
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // REP-003: getConversations — zero confirmed bookings
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('REP-003: getConversations returns empty array when caller has zero confirmed bookings', () => {
    it('returns empty array for a caller with no conversations seeded', async () => {
      ctrl.reset();
      // Re-seed only conversations for OTHER customer
      ctrl.seedConversation(FIXTURE_BOOKING_OTHER_CUSTOMER);
      const conversations = await repo.getConversations(FIXTURE_CUSTOMER_ID_A);
      expect(conversations).toEqual([]);
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // REP-004: getConversation — customer access
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('REP-004: getConversation succeeds for the booking customer', () => {
    it('returns conversation data when called by the booking customer', async () => {
      const result = await repo.getConversation(
        FIXTURE_CUSTOMER_ID_A,
        FIXTURE_BOOKING_CONFIRMED.jobId
      );
      expect(result.conversation.jobId).toBe(FIXTURE_BOOKING_CONFIRMED.jobId);
      expect(result.conversation.bookingStatus).toBe('CONFIRMED');
      expect(typeof result.messages).toBe('object');
      expect(Array.isArray(result.messages)).toBe(true);
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // REP-005: getConversation — BrainWorker access
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('REP-005: getConversation succeeds for the assigned BrainWorker', () => {
    it('returns conversation data when called by the assigned BrainWorker', async () => {
      const result = await repo.getConversation(
        FIXTURE_BRAINWORKER_ID_A,
        FIXTURE_BOOKING_CONFIRMED.jobId
      );
      expect(result.conversation.jobId).toBe(FIXTURE_BOOKING_CONFIRMED.jobId);
      expect(result.messages).toBeDefined();
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // REP-006: getConversation — unauthorized access
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('REP-006: getConversation throws UnauthorizedError for non-participants', () => {
    it('throws UnauthorizedError when caller is unauthenticated (empty string)', async () => {
      await expect(
        repo.getConversation(FIXTURE_UNAUTHENTICATED_ID, FIXTURE_BOOKING_CONFIRMED.jobId)
      ).rejects.toThrow(UnauthorizedError);
    });

    it('throws UnauthorizedError when caller is a non-participant', async () => {
      await expect(
        repo.getConversation(FIXTURE_NON_PARTICIPANT_ID, FIXTURE_BOOKING_CONFIRMED.jobId)
      ).rejects.toThrow(UnauthorizedError);
    });

    it('throws UnauthorizedError when Customer A tries to access Customer B conversation', async () => {
      await expect(
        repo.getConversation(FIXTURE_CUSTOMER_ID_A, FIXTURE_BOOKING_OTHER_CUSTOMER.jobId)
      ).rejects.toThrow(UnauthorizedError);
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // REP-007: getConversation — initial window of 30 messages
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('REP-007: getConversation returns initial window of 30 messages ordered chronologically', () => {
    beforeEach(() => {
      ctrl.seedConversation(FIXTURE_PAGINATION_BOOKING);
      // Seed exactly 30 messages
      ctrl.seedMessages(FIXTURE_PAGINATION_JOB_ID, buildPaginationMessages(30));
    });

    it('returns exactly 30 messages when 30 are present', async () => {
      const result = await repo.getConversation(
        FIXTURE_CUSTOMER_ID_A,
        FIXTURE_PAGINATION_JOB_ID
      );
      expect(result.messages).toHaveLength(30);
    });

    it('returns messages in chronological ascending order', async () => {
      const result = await repo.getConversation(
        FIXTURE_CUSTOMER_ID_A,
        FIXTURE_PAGINATION_JOB_ID
      );
      for (let i = 0; i < result.messages.length - 1; i++) {
        expect(result.messages[i]!.createdAt <= result.messages[i + 1]!.createdAt).toBe(true);
      }
    });

    it('returns hasMore: false when exactly 30 messages are present', async () => {
      const result = await repo.getConversation(
        FIXTURE_CUSTOMER_ID_A,
        FIXTURE_PAGINATION_JOB_ID
      );
      expect(result.hasMore).toBe(false);
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // REP-008: getConversation — hasMore and oldestCursor for > 30 messages
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('REP-008: getConversation returns hasMore: true and oldestCursor when > 30 messages exist', () => {
    beforeEach(() => {
      ctrl.seedConversation(FIXTURE_PAGINATION_BOOKING);
      // Seed 35 messages (5 beyond the page size)
      ctrl.seedMessages(FIXTURE_PAGINATION_JOB_ID, buildPaginationMessages(35));
    });

    it('returns at most 30 messages (the most recent 30)', async () => {
      const result = await repo.getConversation(
        FIXTURE_CUSTOMER_ID_A,
        FIXTURE_PAGINATION_JOB_ID
      );
      expect(result.messages).toHaveLength(30);
    });

    it('returns hasMore: true when more than 30 messages exist', async () => {
      const result = await repo.getConversation(
        FIXTURE_CUSTOMER_ID_A,
        FIXTURE_PAGINATION_JOB_ID
      );
      expect(result.hasMore).toBe(true);
    });

    it('returns a valid oldestCursor timestamp string when hasMore is true', async () => {
      const result = await repo.getConversation(
        FIXTURE_CUSTOMER_ID_A,
        FIXTURE_PAGINATION_JOB_ID
      );
      expect(typeof result.oldestCursor).toBe('string');
      expect(result.oldestCursor!.length).toBeGreaterThan(0);
    });

    it('returns the 30 most recent messages, not the 30 oldest', async () => {
      const allMessages = buildPaginationMessages(35);
      const result = await repo.getConversation(
        FIXTURE_CUSTOMER_ID_A,
        FIXTURE_PAGINATION_JOB_ID
      );
      // The last message returned should be the most recent (message 35)
      const lastReturnedMsg = result.messages[result.messages.length - 1];
      expect(lastReturnedMsg!.id).toBe(allMessages[34]!.id);
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // REP-009: getOlderMessages — paginate before cursor
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('REP-009: getOlderMessages fetches messages strictly before oldestCursor', () => {
    beforeEach(() => {
      ctrl.seedConversation(FIXTURE_PAGINATION_BOOKING);
      ctrl.seedMessages(FIXTURE_PAGINATION_JOB_ID, buildPaginationMessages(35));
    });

    it('returns only messages with createdAt strictly before the provided timestamp', async () => {
      // Get the initial window to get oldestCursor
      const initial = await repo.getConversation(
        FIXTURE_CUSTOMER_ID_A,
        FIXTURE_PAGINATION_JOB_ID
      );
      expect(initial.hasMore).toBe(true);
      const cursor = initial.oldestCursor!;

      const older = await repo.getOlderMessages(
        FIXTURE_CUSTOMER_ID_A,
        FIXTURE_PAGINATION_JOB_ID,
        cursor
      );
      // All returned messages must have createdAt < cursor
      for (const msg of older.messages) {
        expect(msg.createdAt < cursor).toBe(true);
      }
    });

    it('returns the 5 older messages that preceded the initial window', async () => {
      const initial = await repo.getConversation(
        FIXTURE_CUSTOMER_ID_A,
        FIXTURE_PAGINATION_JOB_ID
      );
      const cursor = initial.oldestCursor!;
      const older = await repo.getOlderMessages(
        FIXTURE_CUSTOMER_ID_A,
        FIXTURE_PAGINATION_JOB_ID,
        cursor
      );
      expect(older.messages).toHaveLength(5);
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // REP-010: getOlderMessages — hasMore: false at history beginning
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('REP-010: getOlderMessages returns hasMore: false at beginning of history', () => {
    beforeEach(() => {
      ctrl.seedConversation(FIXTURE_PAGINATION_BOOKING);
      ctrl.seedMessages(FIXTURE_PAGINATION_JOB_ID, buildPaginationMessages(35));
    });

    it('returns hasMore: false when fetching the oldest page', async () => {
      const initial = await repo.getConversation(
        FIXTURE_CUSTOMER_ID_A,
        FIXTURE_PAGINATION_JOB_ID
      );
      const cursor = initial.oldestCursor!;
      const older = await repo.getOlderMessages(
        FIXTURE_CUSTOMER_ID_A,
        FIXTURE_PAGINATION_JOB_ID,
        cursor
      );
      expect(older.hasMore).toBe(false);
    });

    it('returns undefined oldestCursor when there are no more pages', async () => {
      const initial = await repo.getConversation(
        FIXTURE_CUSTOMER_ID_A,
        FIXTURE_PAGINATION_JOB_ID
      );
      const cursor = initial.oldestCursor!;
      const older = await repo.getOlderMessages(
        FIXTURE_CUSTOMER_ID_A,
        FIXTURE_PAGINATION_JOB_ID,
        cursor
      );
      expect(older.oldestCursor).toBeUndefined();
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // REP-011 / REP-012 / REP-013: sendMessage succeeds for active booking states
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('REP-011: sendMessage succeeds when booking is CONFIRMED', () => {
    it('resolves with a ChatMessageRecord for a CONFIRMED booking', async () => {
      const record = await repo.sendMessage(FIXTURE_CUSTOMER_ID_A, {
        jobId: FIXTURE_BOOKING_CONFIRMED.jobId,
        content: 'Confirmed receipt. On my way.',
        contentType: 'text',
        tempId: 'temp-rep-011',
      });
      expect(record.id).toMatch(/^msg_/);
      expect(record.jobId).toBe(FIXTURE_BOOKING_CONFIRMED.jobId);
      expect(record.senderId).toBe(FIXTURE_CUSTOMER_ID_A);
      expect(record.senderRole).toBe('customer');
    });
  });

  describe('REP-012: sendMessage succeeds when booking is IN_PROGRESS', () => {
    it('resolves with a ChatMessageRecord for an IN_PROGRESS booking', async () => {
      const record = await repo.sendMessage(FIXTURE_CUSTOMER_ID_A, {
        jobId: FIXTURE_BOOKING_IN_PROGRESS.jobId,
        content: 'Work is going well. Thank you.',
        contentType: 'text',
        tempId: 'temp-rep-012',
      });
      expect(record.id).toMatch(/^msg_/);
      expect(record.senderRole).toBe('customer');
    });
  });

  describe('REP-013: sendMessage succeeds when booking is DISPUTED', () => {
    it('resolves with a ChatMessageRecord for a DISPUTED booking', async () => {
      const record = await repo.sendMessage(FIXTURE_CUSTOMER_ID_A, {
        jobId: FIXTURE_BOOKING_DISPUTED.jobId,
        content: 'I need to escalate this issue with the mediator.',
        contentType: 'text',
        tempId: 'temp-rep-013',
      });
      expect(record.id).toMatch(/^msg_/);
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // REP-014 / REP-015: sendMessage throws ConversationClosedError for closed bookings
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('REP-014: sendMessage throws ConversationClosedError for COMPLETED booking', () => {
    it('throws ConversationClosedError when booking status is COMPLETED', async () => {
      await expect(
        repo.sendMessage(FIXTURE_CUSTOMER_ID_A, {
          jobId: FIXTURE_BOOKING_COMPLETED.jobId,
          content: 'Thank you for the service!',
          contentType: 'text',
          tempId: 'temp-rep-014',
        })
      ).rejects.toThrow(ConversationClosedError);
    });

    it('ConversationClosedError has the correct error code', async () => {
      try {
        await repo.sendMessage(FIXTURE_CUSTOMER_ID_A, {
          jobId: FIXTURE_BOOKING_COMPLETED.jobId,
          content: 'Late message attempt.',
          contentType: 'text',
          tempId: 'temp-rep-014b',
        });
        expect.fail('Expected ConversationClosedError to be thrown.');
      } catch (err) {
        expect(err).toBeInstanceOf(ConversationClosedError);
        expect((err as ConversationClosedError).code).toBe('CONVERSATION_CLOSED');
      }
    });
  });

  describe('REP-015: sendMessage throws ConversationClosedError for CANCELLED booking', () => {
    it('throws ConversationClosedError when booking status is CANCELLED', async () => {
      await expect(
        repo.sendMessage(FIXTURE_CUSTOMER_ID_A, {
          jobId: FIXTURE_BOOKING_CANCELLED.jobId,
          content: 'I know the booking is cancelled...',
          contentType: 'text',
          tempId: 'temp-rep-015',
        })
      ).rejects.toThrow(ConversationClosedError);
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // REP-016: sendMessage throws UnauthorizedError for non-owners
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('REP-016: sendMessage throws UnauthorizedError when caller is not a participant', () => {
    it('throws UnauthorizedError when caller is not the booking customer or BrainWorker', async () => {
      await expect(
        repo.sendMessage(FIXTURE_NON_PARTICIPANT_ID, {
          jobId: FIXTURE_BOOKING_CONFIRMED.jobId,
          content: 'Unauthorized message attempt.',
          contentType: 'text',
          tempId: 'temp-rep-016',
        })
      ).rejects.toThrow(UnauthorizedError);
    });

    it('throws UnauthorizedError when Customer A tries to send into Customer B conversation', async () => {
      await expect(
        repo.sendMessage(FIXTURE_CUSTOMER_ID_A, {
          jobId: FIXTURE_BOOKING_OTHER_CUSTOMER.jobId,
          content: 'Cross-customer message attempt.',
          contentType: 'text',
          tempId: 'temp-rep-016b',
        })
      ).rejects.toThrow(UnauthorizedError);
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // REP-017: sendMessage is idempotent on tempId
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('REP-017: sendMessage is idempotent — same tempId returns existing record without duplicate', () => {
    it('returns identical record when same tempId is submitted twice', async () => {
      const input = {
        jobId: FIXTURE_BOOKING_CONFIRMED.jobId,
        content: 'Idempotent message.',
        contentType: 'text' as const,
        tempId: 'temp-rep-017-idempotent',
      };
      const first = await repo.sendMessage(FIXTURE_CUSTOMER_ID_A, input);
      const second = await repo.sendMessage(FIXTURE_CUSTOMER_ID_A, input);
      expect(second.id).toBe(first.id);
      expect(second.content).toBe(first.content);
    });

    it('does not create a duplicate message in the conversation thread', async () => {
      const input = {
        jobId: FIXTURE_BOOKING_CONFIRMED.jobId,
        content: 'Only one of me.',
        contentType: 'text' as const,
        tempId: 'temp-rep-017-dedup',
      };
      await repo.sendMessage(FIXTURE_CUSTOMER_ID_A, input);
      await repo.sendMessage(FIXTURE_CUSTOMER_ID_A, input);
      const msgCount = ctrl.getMessageCount(FIXTURE_BOOKING_CONFIRMED.jobId);
      // The conversation started with 2 seeded messages; after this test, should be 3 (not 4)
      expect(msgCount).toBe(3);
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // REP-018: sendMessage assigns authoritative server ID, timestamp, senderRole
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('REP-018: sendMessage assigns authoritative id, timestamp, and senderRole', () => {
    it('assigns a server id matching the msg_ prefix convention', async () => {
      const record = await repo.sendMessage(FIXTURE_CUSTOMER_ID_A, {
        jobId: FIXTURE_BOOKING_CONFIRMED.jobId,
        content: 'New authoritative message.',
        contentType: 'text',
        tempId: 'temp-rep-018',
      });
      expect(record.id).toBeTruthy();
      expect(record.id).toMatch(/^msg_/);
    });

    it('assigns a createdAt timestamp in valid ISO 8601 format', async () => {
      const record = await repo.sendMessage(FIXTURE_CUSTOMER_ID_A, {
        jobId: FIXTURE_BOOKING_CONFIRMED.jobId,
        content: 'Timestamped message.',
        contentType: 'text',
        tempId: 'temp-rep-018b',
      });
      expect(typeof record.createdAt).toBe('string');
      expect(Date.parse(record.createdAt)).not.toBeNaN();
    });

    it('assigns senderRole: customer when caller is the booking customer', async () => {
      const record = await repo.sendMessage(FIXTURE_CUSTOMER_ID_A, {
        jobId: FIXTURE_BOOKING_CONFIRMED.jobId,
        content: 'Customer message.',
        contentType: 'text',
        tempId: 'temp-rep-018c',
      });
      expect(record.senderRole).toBe('customer');
    });

    it('assigns senderRole: brainworker when caller is the assigned BrainWorker', async () => {
      const record = await repo.sendMessage(FIXTURE_BRAINWORKER_ID_A, {
        jobId: FIXTURE_BOOKING_CONFIRMED.jobId,
        content: 'Worker message.',
        contentType: 'text',
        tempId: 'temp-rep-018d',
      });
      expect(record.senderRole).toBe('brainworker');
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // REP-019: markAsRead — updates caller's read state, unreadCount becomes 0
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('REP-019: markAsRead updates callers read timestamp and recalculates unreadCount to 0', () => {
    it('returns readCount equal to number of unread messages from others', async () => {
      // Customer A has FIXTURE_MESSAGE_FROM_BRAINWORKER as unread (sender is BrainWorker)
      const result = await repo.markAsRead(
        FIXTURE_CUSTOMER_ID_A,
        FIXTURE_BOOKING_CONFIRMED.jobId
      );
      expect(result.readCount).toBeGreaterThanOrEqual(1);
    });

    it('updates the callers lastReadTimestamp persisted in the repository', async () => {
      const before = ctrl.getReadTimestamp(FIXTURE_CUSTOMER_ID_A, FIXTURE_BOOKING_CONFIRMED.jobId);
      expect(before).toBeUndefined();

      await repo.markAsRead(FIXTURE_CUSTOMER_ID_A, FIXTURE_BOOKING_CONFIRMED.jobId);

      const after = ctrl.getReadTimestamp(FIXTURE_CUSTOMER_ID_A, FIXTURE_BOOKING_CONFIRMED.jobId);
      expect(typeof after).toBe('string');
      expect(after!.length).toBeGreaterThan(0);
    });

    it('conversation summary shows unreadCount of 0 after markAsRead by the caller', async () => {
      await repo.markAsRead(
        FIXTURE_CUSTOMER_ID_A,
        FIXTURE_BOOKING_CONFIRMED.jobId
      );
      const result = await repo.getConversation(
        FIXTURE_CUSTOMER_ID_A,
        FIXTURE_BOOKING_CONFIRMED.jobId
      );
      expect(result.conversation.unreadCount).toBe(0);
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // REP-020: markAsRead — does not affect opposing participant's unread state
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('REP-020: markAsRead does not affect the opposing participants unread status', () => {
    it('BrainWorker still has their own unread count after Customer A marks as read', async () => {
      // Customer A reads — BrainWorker A has not read FIXTURE_MESSAGE_FROM_CUSTOMER
      await repo.markAsRead(
        FIXTURE_CUSTOMER_ID_A,
        FIXTURE_BOOKING_CONFIRMED.jobId
      );
      const brainWorkerView = await repo.getConversation(
        FIXTURE_BRAINWORKER_ID_A,
        FIXTURE_BOOKING_CONFIRMED.jobId
      );
      // BrainWorker has not marked as read, FIXTURE_MESSAGE_FROM_CUSTOMER is still unread for them
      expect(brainWorkerView.conversation.unreadCount).toBeGreaterThanOrEqual(1);
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // REP-021: uploadAttachment succeeds for valid MIME types ≤ 5MB
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('REP-021: uploadAttachment returns sanitized CDN mediaUrl for valid files', () => {
    it('returns a mediaUrl for a valid JPEG file within size limit', async () => {
      const file = buildTestBlob(FIXTURE_VALID_JPEG_FILE.size);
      Object.defineProperty(file, 'size', { value: FIXTURE_VALID_JPEG_FILE.size });
      const result = await repo.uploadAttachment(
        FIXTURE_CUSTOMER_ID_A,
        FIXTURE_BOOKING_CONFIRMED.jobId,
        file,
        'image/jpeg'
      );
      expect(result.mediaUrl).toMatch(/^https:\/\//);
      expect(result.mimeType).toBe('image/jpeg');
    });

    it('returns a mediaUrl for a valid PNG file', async () => {
      const file = buildTestBlob(FIXTURE_VALID_PNG_FILE.size);
      Object.defineProperty(file, 'size', { value: FIXTURE_VALID_PNG_FILE.size });
      const result = await repo.uploadAttachment(
        FIXTURE_CUSTOMER_ID_A,
        FIXTURE_BOOKING_CONFIRMED.jobId,
        file,
        'image/png'
      );
      expect(result.mediaUrl).toMatch(/^https:\/\//);
    });

    it('returns a mediaUrl for a valid WebP file', async () => {
      const file = buildTestBlob(FIXTURE_VALID_WEBP_FILE.size);
      Object.defineProperty(file, 'size', { value: FIXTURE_VALID_WEBP_FILE.size });
      const result = await repo.uploadAttachment(
        FIXTURE_CUSTOMER_ID_A,
        FIXTURE_BOOKING_CONFIRMED.jobId,
        file,
        'image/webp'
      );
      expect(result.mediaUrl).toMatch(/^https:\/\//);
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // REP-022: uploadAttachment throws MediaUploadError for size or MIME violations
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('REP-022: uploadAttachment throws MediaUploadError for invalid files', () => {
    it('throws MediaUploadError when file exceeds 5MB limit', async () => {
      const file = buildTestBlob(64);
      Object.defineProperty(file, 'size', { value: FIXTURE_OVERSIZED_FILE.size });
      await expect(
        repo.uploadAttachment(
          FIXTURE_CUSTOMER_ID_A,
          FIXTURE_BOOKING_CONFIRMED.jobId,
          file,
          'image/jpeg'
        )
      ).rejects.toThrow(MediaUploadError);
    });

    it('throws MediaUploadError for a prohibited MIME type (application/pdf)', async () => {
      const file = buildTestBlob(1024);
      Object.defineProperty(file, 'size', { value: FIXTURE_INVALID_MIME_FILE.size });
      await expect(
        repo.uploadAttachment(
          FIXTURE_CUSTOMER_ID_A,
          FIXTURE_BOOKING_CONFIRMED.jobId,
          file,
          'application/pdf'
        )
      ).rejects.toThrow(MediaUploadError);
    });

    it('throws MediaUploadError for SVG MIME type (image/svg+xml)', async () => {
      const file = buildTestBlob(1024);
      Object.defineProperty(file, 'size', { value: 1024 });
      await expect(
        repo.uploadAttachment(
          FIXTURE_CUSTOMER_ID_A,
          FIXTURE_BOOKING_CONFIRMED.jobId,
          file,
          'image/svg+xml'
        )
      ).rejects.toThrow(MediaUploadError);
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // REP-023: Deduplication — reconcile duplicate message deliveries
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('REP-023: Reconciles duplicate deliveries from WebSocket and polling into a single deduplicated list', () => {
    it('returns each message exactly once when the same message ID is delivered multiple times', async () => {
      // Simulate duplicate delivery: message arrives via WebSocket and then polling
      ctrl.simulateDuplicateDelivery(
        FIXTURE_BOOKING_CONFIRMED.jobId,
        FIXTURE_MESSAGE_FROM_BRAINWORKER.id
      );
      ctrl.simulateDuplicateDelivery(
        FIXTURE_BOOKING_CONFIRMED.jobId,
        FIXTURE_MESSAGE_FROM_BRAINWORKER.id
      );

      const result = await repo.getConversation(
        FIXTURE_CUSTOMER_ID_A,
        FIXTURE_BOOKING_CONFIRMED.jobId
      );
      const workerMsgCount = result.messages.filter(
        (m) => m.id === FIXTURE_MESSAGE_FROM_BRAINWORKER.id
      ).length;
      expect(workerMsgCount).toBe(1);
    });

    it('total message count remains unchanged after duplicate delivery simulation', async () => {
      const before = ctrl.getMessageCount(FIXTURE_BOOKING_CONFIRMED.jobId);
      ctrl.simulateDuplicateDelivery(
        FIXTURE_BOOKING_CONFIRMED.jobId,
        FIXTURE_MESSAGE_FROM_CUSTOMER.id
      );
      const after = ctrl.getMessageCount(FIXTURE_BOOKING_CONFIRMED.jobId);
      expect(after).toBe(before);
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // REP-024: Reconnection — query since latestMessageTimestamp, no duplicates
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('REP-024: Queries since={latestMessageTimestamp} upon reconnection merges without duplicates', () => {
    it('getOlderMessages with exact boundary timestamp excludes messages AT the boundary', async () => {
      // The initial window gives the oldest cursor; messages before cursor should not overlap
      ctrl.seedConversation(FIXTURE_PAGINATION_BOOKING);
      ctrl.seedMessages(FIXTURE_PAGINATION_JOB_ID, buildPaginationMessages(35));

      const initial = await repo.getConversation(
        FIXTURE_CUSTOMER_ID_A,
        FIXTURE_PAGINATION_JOB_ID
      );
      const cursor = initial.oldestCursor!;
      const older = await repo.getOlderMessages(
        FIXTURE_CUSTOMER_ID_A,
        FIXTURE_PAGINATION_JOB_ID,
        cursor
      );

      // No message ID from initial window should appear in older window
      const initialIds = new Set(initial.messages.map((m) => m.id));
      for (const msg of older.messages) {
        expect(initialIds.has(msg.id)).toBe(false);
      }
    });

    it('sending a new message after reconnection does not produce a duplicate entry', async () => {
      const sent = await repo.sendMessage(FIXTURE_CUSTOMER_ID_A, {
        jobId: FIXTURE_BOOKING_CONFIRMED.jobId,
        content: 'Post-reconnection message.',
        contentType: 'text',
        tempId: 'temp-rep-024-new',
      });
      const result = await repo.getConversation(
        FIXTURE_CUSTOMER_ID_A,
        FIXTURE_BOOKING_CONFIRMED.jobId
      );
      const matches = result.messages.filter((m) => m.id === sent.id);
      expect(matches).toHaveLength(1);
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // REP-025: Strict boundary — production repository has zero test imports
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('REP-025: Production repository.ts has zero imports from test harness or fixtures', () => {
    it('createMessagingRepository export exists and conforms to IMessagingRepository interface', () => {
      // In GREEN, createMessagingRepository must be a function returning IMessagingRepository
      expect(typeof createMessagingRepository).toBe('function');
    });

    it('production repository.ts source contains no imports from ./testing', () => {
      const repoPath = resolve(__dirname, './repository.ts');
      expect(existsSync(repoPath)).toBe(true);
      const source = readFileSync(repoPath, 'utf-8');
      expect(source).not.toContain('./testing');
      expect(source).not.toContain('../testing');
      expect(source).not.toContain('testing/fixtures');
      expect(source).not.toContain('testing/harness');
      expect(source).not.toContain('testing/index');
    });
  });
});

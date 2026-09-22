// apps/web/lib/messaging/testing/harness.ts
// In-memory test harness for WEB-017 repository and queue contract tests.
// Provides InMemoryMessagingRepository (conforming to IMessagingRepository)
// and test controllers for seeding state, injecting faults, and inspecting internals.
//
// Architecture Invariant (REP-025): This module must NEVER be imported by production code.
// Production messaging code (repository.ts, queue.ts) has zero imports from this module.

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Shared Type: FailedQueuedMessage
// Used by queue.test.ts assertions and will align with the IOfflineQueue
// interface declared in queue.ts during GREEN phase.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import type {
  IMessagingRepository,
  ChatMessageRecord,
  ConversationSummary,
  LocationPayload,
  OfflineQueuedMessage,
  SendMessageInput,
  GetMessagesResult,
  MediaUploadResult,
} from '../types';

/** A queued message that permanently failed to send during drain replay. */
export interface FailedQueuedMessage extends OfflineQueuedMessage {
  /** Human-readable reason the message could not be sent. */
  errorMessage: string;
  /** ISO 8601 timestamp when the failure was recorded. */
  failedAt: string;
}
import {
  UnauthorizedError,
  ConversationClosedError,
  MediaUploadError,
} from '../types';
import {
  validateImageAttachment,
  ALLOWED_IMAGE_MIME_TYPES,
  MAX_ATTACHMENT_BYTES,
} from '../validation';
import type {
  MessagingBookingRecord,
  MessagingBookingStatus,
} from './fixtures';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Internal Store Shape
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** Per-conversation internal state held by the in-memory repository. */
export interface ConversationState {
  booking: MessagingBookingRecord;
  /** Messages keyed by authoritative id to enforce deduplication. */
  messageById: Map<string, ChatMessageRecord>;
  /** Ordered chronological message IDs (maintained in insertion order). */
  messageOrder: string[];
  /** `lastReadTimestamp` per userId — key is `${userId}:${jobId}`. */
  readState: Map<string, string>;
}

export interface MessagingInternalStore {
  conversations: Map<string, ConversationState>; // jobId → state
  sentTempIds: Map<string, string>;               // tempId → authoritative msgId
  networkFaultEnabled: boolean;
  msgCounter: number;
}

function createMessagingInternalStore(): MessagingInternalStore {
  return {
    conversations: new Map(),
    sentTempIds: new Map(),
    networkFaultEnabled: false,
    msgCounter: 0,
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Constants
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const PAGE_SIZE = 30;
const READONLY_STATUSES: MessagingBookingStatus[] = ['COMPLETED', 'CANCELLED'];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// InMemoryMessagingRepository
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export class InMemoryMessagingRepository implements IMessagingRepository {
  constructor(private readonly store: MessagingInternalStore) {}

  private getConversationState(jobId: string): ConversationState | undefined {
    return this.store.conversations.get(jobId);
  }

  private assertParticipant(callerId: string, state: ConversationState): void {
    if (!callerId || callerId.trim() === '') {
      throw new UnauthorizedError('Caller must be authenticated to access this conversation.');
    }
    const { customerId, brainWorkerId } = state.booking;
    if (callerId !== customerId && callerId !== brainWorkerId) {
      throw new UnauthorizedError(
        'You do not have permission to access this conversation.'
      );
    }
  }

  private assertWriteable(state: ConversationState): void {
    if (READONLY_STATUSES.includes(state.booking.bookingStatus)) {
      throw new ConversationClosedError();
    }
  }

  private generateMessageId(): string {
    this.store.msgCounter += 1;
    const ts = Date.now();
    return `msg_${ts}_${String(this.store.msgCounter).padStart(4, '0')}`;
  }

  private buildConversationSummary(
    callerId: string,
    state: ConversationState
  ): ConversationSummary {
    const { booking, messageOrder, messageById, readState } = state;
    const isReadOnly = READONLY_STATUSES.includes(booking.bookingStatus);

    // Determine the participant from the opposing side
    const isCustomer = callerId === booking.customerId;
    const participant = {
      id: isCustomer ? booking.brainWorkerId : booking.customerId,
      name: isCustomer ? booking.brainWorkerName : booking.customerName,
      role: isCustomer ? ('brainworker' as const) : ('customer' as const),
      avatarUrl: isCustomer ? booking.brainWorkerAvatarUrl : undefined,
      isVerified: isCustomer ? booking.brainWorkerIsVerified : false,
    };

    // Latest message in chronological order
    const latestId = messageOrder[messageOrder.length - 1];
    const latestMsg = latestId ? messageById.get(latestId) : undefined;

    // Count unread messages sent by others
    const callerReadTs = readState.get(`${callerId}:${booking.jobId}`);
    let unreadCount = 0;
    for (const msgId of messageOrder) {
      const msg = messageById.get(msgId);
      if (!msg || msg.senderId === callerId) continue;
      if (!callerReadTs || msg.createdAt > callerReadTs) {
        unreadCount += 1;
      }
    }

    const lastMessageAt = latestMsg?.createdAt ?? booking.createdAt;

    return {
      jobId: booking.jobId,
      referenceCode: booking.referenceCode,
      serviceTitle: booking.serviceTitle,
      bookingStatus: booking.bookingStatus,
      participant,
      lastMessage: latestMsg
        ? {
            id: latestMsg.id,
            senderId: latestMsg.senderId,
            senderName: latestMsg.senderName,
            content: latestMsg.content,
            contentType: latestMsg.contentType,
            createdAt: latestMsg.createdAt,
          }
        : undefined,
      unreadCount,
      lastMessageAt,
      isReadOnly,
    };
  }

  async getConversations(callerId: string): Promise<ConversationSummary[]> {
    if (this.store.networkFaultEnabled) {
      throw new Error('Network fault injected: getConversations failed.');
    }
    if (!callerId || callerId.trim() === '') {
      return [];
    }

    const results: ConversationSummary[] = [];
    for (const state of this.store.conversations.values()) {
      const { customerId, brainWorkerId } = state.booking;
      if (callerId !== customerId && callerId !== brainWorkerId) continue;
      results.push(this.buildConversationSummary(callerId, state));
    }

    // Sort strictly descending by lastMessageAt
    results.sort((a, b) => {
      if (b.lastMessageAt > a.lastMessageAt) return 1;
      if (b.lastMessageAt < a.lastMessageAt) return -1;
      return 0;
    });

    return results;
  }

  async getConversation(
    callerId: string,
    jobId: string
  ): Promise<{
    conversation: ConversationSummary;
    messages: ChatMessageRecord[];
    hasMore: boolean;
    oldestCursor?: string | undefined;
  }> {
    if (this.store.networkFaultEnabled) {
      throw new Error('Network fault injected: getConversation failed.');
    }

    const state = this.getConversationState(jobId);
    if (!state) {
      throw new UnauthorizedError('Conversation not found or access denied.');
    }
    this.assertParticipant(callerId, state);

    const allMsgIds = [...state.messageOrder];
    // Return the 30 most recent messages in chronological order
    const windowIds = allMsgIds.slice(-PAGE_SIZE);
    const messages = windowIds
      .map((id) => state.messageById.get(id))
      .filter((m): m is ChatMessageRecord => m !== undefined);

    const hasMore = allMsgIds.length > PAGE_SIZE;
    const oldestCursor = hasMore ? messages[0]?.createdAt : undefined;

    return {
      conversation: this.buildConversationSummary(callerId, state),
      messages,
      hasMore,
      oldestCursor,
    };
  }

  async getOlderMessages(
    callerId: string,
    jobId: string,
    beforeTimestamp: string,
    limit: number = PAGE_SIZE
  ): Promise<GetMessagesResult> {
    if (this.store.networkFaultEnabled) {
      throw new Error('Network fault injected: getOlderMessages failed.');
    }

    const state = this.getConversationState(jobId);
    if (!state) {
      throw new UnauthorizedError('Conversation not found or access denied.');
    }
    this.assertParticipant(callerId, state);

    const olderMsgIds = [...state.messageOrder].filter((id) => {
      const msg = state.messageById.get(id);
      return msg && msg.createdAt < beforeTimestamp;
    });

    // Return last `limit` items (most recent of the older messages)
    const pageIds = olderMsgIds.slice(-limit);
    const messages = pageIds
      .map((id) => state.messageById.get(id))
      .filter((m): m is ChatMessageRecord => m !== undefined);

    const hasMore = olderMsgIds.length > limit;
    const oldestCursor = hasMore ? messages[0]?.createdAt : undefined;

    return { messages, hasMore, oldestCursor };
  }

  async sendMessage(
    callerId: string,
    input: SendMessageInput
  ): Promise<ChatMessageRecord> {
    if (this.store.networkFaultEnabled) {
      throw new Error('Network fault injected: sendMessage failed.');
    }

    const state = this.getConversationState(input.jobId);
    if (!state) {
      throw new UnauthorizedError('Conversation not found or access denied.');
    }
    this.assertParticipant(callerId, state);
    this.assertWriteable(state);

    // Idempotency: if this tempId was already sent, return the existing record
    const existingMsgId = this.store.sentTempIds.get(input.tempId);
    if (existingMsgId) {
      const existing = state.messageById.get(existingMsgId);
      if (existing) return existing;
    }

    const { booking } = state;
    const isCustomer = callerId === booking.customerId;
    const senderRole = isCustomer ? 'customer' : 'brainworker';
    const senderName = isCustomer ? booking.customerName : booking.brainWorkerName;

    const newMsgId = this.generateMessageId();
    const now = new Date().toISOString();

    const record: ChatMessageRecord = {
      id: newMsgId,
      jobId: input.jobId,
      senderId: callerId,
      senderRole,
      senderName,
      content: input.content ?? '',
      contentType: input.contentType ?? 'text',
      mediaUrl: input.mediaUrl,
      location: input.location,
      isRead: false,
      createdAt: now,
    };

    state.messageById.set(newMsgId, record);
    state.messageOrder.push(newMsgId);
    this.store.sentTempIds.set(input.tempId, newMsgId);

    // Update lastMessageAt on conversation summary via booking (derived at read time)
    // No stored field needed; summary derives it from latest message.

    return record;
  }

  async markAsRead(
    callerId: string,
    jobId: string,
    upToTimestamp?: string
  ): Promise<{ readCount: number }> {
    if (this.store.networkFaultEnabled) {
      throw new Error('Network fault injected: markAsRead failed.');
    }

    const state = this.getConversationState(jobId);
    if (!state) {
      throw new UnauthorizedError('Conversation not found or access denied.');
    }
    this.assertParticipant(callerId, state);

    const cutoff = upToTimestamp ?? new Date().toISOString();
    const readKey = `${callerId}:${jobId}`;

    let readCount = 0;
    for (const msgId of state.messageOrder) {
      const msg = state.messageById.get(msgId);
      if (!msg || msg.senderId === callerId) continue;
      if (msg.createdAt <= cutoff) {
        readCount += 1;
      }
    }

    // Update the caller's lastReadTimestamp
    const existing = state.readState.get(readKey);
    if (!existing || cutoff > existing) {
      state.readState.set(readKey, cutoff);
    }

    return { readCount };
  }

  async uploadAttachment(
    callerId: string,
    jobId: string,
    _file: File | Blob,
    mimeType: string
  ): Promise<MediaUploadResult> {
    if (this.store.networkFaultEnabled) {
      throw new Error('Network fault injected: uploadAttachment failed.');
    }

    const state = this.getConversationState(jobId);
    if (!state) {
      throw new UnauthorizedError('Conversation not found or access denied.');
    }
    this.assertParticipant(callerId, state);

    // Enforce MIME allowlist
    if (!ALLOWED_IMAGE_MIME_TYPES.includes(mimeType as typeof ALLOWED_IMAGE_MIME_TYPES[number])) {
      throw new MediaUploadError(
        `Invalid or unsupported MIME type '${mimeType}'. Only JPEG, PNG, and WebP photos are supported.`
      );
    }

    // Enforce size cap via actual Blob size
    const fileSize = _file.size;
    if (fileSize > MAX_ATTACHMENT_BYTES) {
      throw new MediaUploadError(
        `Photo exceeds 5MB limit. Maximum size is ${MAX_ATTACHMENT_BYTES.toLocaleString()} bytes.`
      );
    }

    const ext = mimeType.split('/')[1] ?? 'jpg';
    const mediaUrl = `https://cdn.bukiebrainjobs.com/media/upload_${Date.now()}.${ext}`;

    return { mediaUrl, fileSize, mimeType };
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Test Controller
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface IMessagingTestController {
  /** Seed a booking (creates an empty conversation for it). */
  seedConversation(booking: MessagingBookingRecord): void;
  /** Seed a message directly into an existing conversation. */
  seedMessage(jobId: string, message: ChatMessageRecord): void;
  /** Seed multiple messages into a conversation at once. */
  seedMessages(jobId: string, messages: ChatMessageRecord[]): void;
  /** Change the booking lifecycle status for a conversation. */
  setBookingStatus(jobId: string, status: MessagingBookingStatus): void;
  /** Inject or clear a network fault across all repository operations. */
  setNetworkFault(shouldFault: boolean): void;
  /** Returns the current message IDs in chronological order for a conversation. */
  getMessageIds(jobId: string): string[];
  /** Returns the number of unique message IDs in a conversation. */
  getMessageCount(jobId: string): number;
  /** Returns the lastReadTimestamp for a user in a conversation (undefined if never read). */
  getReadTimestamp(userId: string, jobId: string): string | undefined;
  /**
   * Simulates a duplicate delivery of an already-seeded message
   * (as would happen when the same message arrives via both WebSocket and polling).
   * The message should appear exactly once in getConversation results.
   */
  simulateDuplicateDelivery(jobId: string, messageId: string): void;
  /** Resets all store state to clean baseline for test isolation. */
  reset(): void;
}

export class MessagingTestController implements IMessagingTestController {
  constructor(private readonly store: MessagingInternalStore) {}

  seedConversation(booking: MessagingBookingRecord): void {
    if (!this.store.conversations.has(booking.jobId)) {
      this.store.conversations.set(booking.jobId, {
        booking: { ...booking },
        messageById: new Map(),
        messageOrder: [],
        readState: new Map(),
      });
    }
  }

  seedMessage(jobId: string, message: ChatMessageRecord): void {
    const state = this.store.conversations.get(jobId);
    if (!state) {
      throw new Error(
        `[Test Harness] Cannot seed message: conversation '${jobId}' not found. Call seedConversation() first.`
      );
    }
    if (!state.messageById.has(message.id)) {
      state.messageById.set(message.id, { ...message });
      state.messageOrder.push(message.id);
    }
  }

  seedMessages(jobId: string, messages: ChatMessageRecord[]): void {
    for (const msg of messages) {
      this.seedMessage(jobId, msg);
    }
  }

  setBookingStatus(jobId: string, status: MessagingBookingStatus): void {
    const state = this.store.conversations.get(jobId);
    if (!state) {
      throw new Error(`[Test Harness] Conversation '${jobId}' not found.`);
    }
    state.booking = { ...state.booking, bookingStatus: status };
  }

  setNetworkFault(shouldFault: boolean): void {
    this.store.networkFaultEnabled = shouldFault;
  }

  getMessageIds(jobId: string): string[] {
    return [...(this.store.conversations.get(jobId)?.messageOrder ?? [])];
  }

  getMessageCount(jobId: string): number {
    return this.store.conversations.get(jobId)?.messageById.size ?? 0;
  }

  getReadTimestamp(userId: string, jobId: string): string | undefined {
    return this.store.conversations.get(jobId)?.readState.get(`${userId}:${jobId}`);
  }

  simulateDuplicateDelivery(jobId: string, messageId: string): void {
    const state = this.store.conversations.get(jobId);
    if (!state) return;
    if (!state.messageById.has(messageId)) return;
    // Attempt to insert the same messageId again — simulates duplicate WebSocket + polling delivery.
    // The map key ensures deduplication regardless of how many times this is called.
    const existing = state.messageById.get(messageId)!;
    state.messageById.set(messageId, { ...existing });
    // Do NOT push to messageOrder again — deduplication must hold.
  }

  reset(): void {
    this.store.conversations.clear();
    this.store.sentTempIds.clear();
    this.store.networkFaultEnabled = false;
    this.store.msgCounter = 0;
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Harness Factory
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface MessagingTestHarness {
  repository: IMessagingRepository;
  testController: IMessagingTestController;
}

export function createMessagingTestHarness(): MessagingTestHarness {
  const store = createMessagingInternalStore();
  const repository = new InMemoryMessagingRepository(store);
  const testController = new MessagingTestController(store);
  return { repository, testController };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Queue Test Harness
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** In-memory session storage for the offline queue, partitioned by userId. */
export class InMemoryQueueStorage {
  private readonly queues = new Map<string, OfflineQueuedMessage[]>();

  getQueue(userId: string): OfflineQueuedMessage[] {
    return this.queues.get(userId) ?? [];
  }

  setQueue(userId: string, items: OfflineQueuedMessage[]): void {
    this.queues.set(userId, [...items]);
  }

  append(userId: string, item: OfflineQueuedMessage): void {
    const queue = this.getQueue(userId);
    this.queues.set(userId, [...queue, item]);
  }

  remove(userId: string, tempId: string): boolean {
    const queue = this.getQueue(userId);
    const filtered = queue.filter((m) => m.tempId !== tempId);
    if (filtered.length === queue.length) return false;
    this.queues.set(userId, filtered);
    return true;
  }

  clear(userId: string): void {
    this.queues.delete(userId);
  }

  clearAll(): void {
    this.queues.clear();
  }
}

export interface SentQueueRecord {
  userId: string;
  message: OfflineQueuedMessage;
}

/** Spy tracking what the drain sender dispatched. */
export class QueueSenderSpy {
  public readonly sent: SentQueueRecord[] = [];
  public errorOnTempId: string | null = null;
  public shouldThrow = false;

  async send(userId: string, message: OfflineQueuedMessage): Promise<void> {
    if (this.shouldThrow || message.tempId === this.errorOnTempId) {
      throw new Error(`[QueueSenderSpy] Simulated send failure for tempId '${message.tempId}'.`);
    }
    this.sent.push({ userId, message });
  }

  reset(): void {
    this.sent.length = 0;
    this.errorOnTempId = null;
    this.shouldThrow = false;
  }

  getSentTempIds(): string[] {
    return this.sent.map((r) => r.message.tempId);
  }
}

/** Stub for booking status checks during queue drain. */
export class BookingStatusStub {
  private readonly statuses = new Map<string, MessagingBookingStatus>();

  setStatus(jobId: string, status: MessagingBookingStatus): void {
    this.statuses.set(jobId, status);
  }

  async getBookingStatus(jobId: string): Promise<MessagingBookingStatus> {
    return this.statuses.get(jobId) ?? 'CONFIRMED';
  }

  reset(): void {
    this.statuses.clear();
  }
}

export interface QueueTestHarness {
  storage: InMemoryQueueStorage;
  senderSpy: QueueSenderSpy;
  bookingStatusStub: BookingStatusStub;
  resetAll: () => void;
}

export function createQueueTestHarness(): QueueTestHarness {
  const storage = new InMemoryQueueStorage();
  const senderSpy = new QueueSenderSpy();
  const bookingStatusStub = new BookingStatusStub();

  function resetAll(): void {
    storage.clearAll();
    senderSpy.reset();
    bookingStatusStub.reset();
  }

  return { storage, senderSpy, bookingStatusStub, resetAll };
}

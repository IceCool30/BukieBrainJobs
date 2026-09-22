// apps/web/lib/messaging/repository.ts
// Phase 2 GREEN: Production Messaging Repository Implementation
// Authoritative Reference: WEB-017 Architecture Contract v1.0
//
// Design principles:
// - Transport-agnostic: no Socket.io, polling, or browser globals.
// - Fail-closed: every operation rejects before it succeeds when authorization is absent.
// - Production boundary: this module has zero imports from the test harness (enforced by REP-025).

import type {
  IMessagingRepository,
  ChatMessageRecord,
  ConversationSummary,
  GetMessagesResult,
  MediaUploadResult,
  SendMessageInput,
} from './types';
import {
  UnauthorizedError,
  ConversationClosedError,
  MediaUploadError,
} from './types';
import { ALLOWED_IMAGE_MIME_TYPES, MAX_ATTACHMENT_BYTES } from './validation';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Internal Types
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

type BookingStatus = 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'DISPUTED';

const READONLY_STATUSES: readonly BookingStatus[] = ['COMPLETED', 'CANCELLED'];
const PAGE_SIZE = 30;

interface ParticipantRecord {
  id: string;
  name: string;
  avatarUrl?: string | undefined;
  isVerified: boolean;
}

/** Per-conversation state held by the in-process repository. */
interface ConversationRecord {
  jobId: string;
  referenceCode: string;
  serviceTitle: string;
  bookingStatus: BookingStatus;
  createdAt: string;
  customer: ParticipantRecord;
  brainWorker: ParticipantRecord;
  /** Messages keyed by authoritative id — enforces deduplication. */
  messageById: Map<string, ChatMessageRecord>;
  /** Chronological message ID ordering. */
  messageOrder: string[];
  /** Per-user read timestamps. Key = userId. */
  readTimestamps: Map<string, string>;
}

/**
 * Internal store for the production MessagingRepository.
 * Exported to allow downstream adapters (e.g. server-side hydration) to inject
 * pre-populated state without coupling to the test harness.
 */
export interface MessagingRepositoryStore {
  conversations: Map<string, ConversationRecord>;
  /** tempId → authoritative message id (idempotency registry). */
  sentTempIds: Map<string, string>;
  msgCounter: number;
}

function createStore(): MessagingRepositoryStore {
  return {
    conversations: new Map(),
    sentTempIds: new Map(),
    msgCounter: 0,
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Production MessagingRepository
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class MessagingRepository implements IMessagingRepository {
  constructor(private readonly store: MessagingRepositoryStore) {}

  // ── Authorization helpers ────────────────────────────────────────

  private assertAuthenticated(callerId: string): void {
    if (!callerId || callerId.trim() === '') {
      throw new UnauthorizedError('Caller must be authenticated to access this conversation.');
    }
  }

  private assertParticipant(callerId: string, record: ConversationRecord): void {
    this.assertAuthenticated(callerId);
    if (callerId !== record.customer.id && callerId !== record.brainWorker.id) {
      throw new UnauthorizedError(
        'You do not have permission to access this conversation.'
      );
    }
  }

  private assertWriteable(record: ConversationRecord): void {
    if ((READONLY_STATUSES as readonly string[]).includes(record.bookingStatus)) {
      throw new ConversationClosedError();
    }
  }

  // ── ID generation ────────────────────────────────────────────────

  private generateMessageId(): string {
    this.store.msgCounter += 1;
    const ts = Date.now();
    return `msg_${ts}_${String(this.store.msgCounter).padStart(4, '0')}`;
  }

  // ── Summary projection ───────────────────────────────────────────

  private buildSummary(callerId: string, record: ConversationRecord): ConversationSummary {
    const isCustomer = callerId === record.customer.id;
    const participant = isCustomer ? record.brainWorker : record.customer;
    const isReadOnly = (READONLY_STATUSES as readonly string[]).includes(record.bookingStatus);

    const latestMsgId = record.messageOrder[record.messageOrder.length - 1];
    const latestMsg = latestMsgId ? record.messageById.get(latestMsgId) : undefined;

    const callerReadTs = record.readTimestamps.get(callerId);
    let unreadCount = 0;
    for (const id of record.messageOrder) {
      const msg = record.messageById.get(id);
      if (!msg || msg.senderId === callerId) continue;
      if (!callerReadTs || msg.createdAt > callerReadTs) unreadCount += 1;
    }

    return {
      jobId: record.jobId,
      referenceCode: record.referenceCode,
      serviceTitle: record.serviceTitle,
      bookingStatus: record.bookingStatus,
      participant: {
        id: participant.id,
        name: participant.name,
        role: isCustomer ? 'brainworker' : 'customer',
        avatarUrl: participant.avatarUrl,
        isVerified: participant.isVerified,
      },
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
      lastMessageAt: latestMsg?.createdAt ?? record.createdAt,
      isReadOnly,
    };
  }

  // ── IMessagingRepository methods ─────────────────────────────────

  async getConversations(callerId: string): Promise<ConversationSummary[]> {
    if (!callerId || callerId.trim() === '') return [];

    const results: ConversationSummary[] = [];
    for (const record of this.store.conversations.values()) {
      if (callerId !== record.customer.id && callerId !== record.brainWorker.id) continue;
      results.push(this.buildSummary(callerId, record));
    }

    // Strict descending order by lastMessageAt
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
    const record = this.store.conversations.get(jobId);
    if (!record) {
      throw new UnauthorizedError('Conversation not found or access denied.');
    }
    this.assertParticipant(callerId, record);

    // Return the 30 most recent messages in chronological order
    const allIds = [...record.messageOrder];
    const windowIds = allIds.slice(-PAGE_SIZE);
    const messages = windowIds
      .map((id) => record.messageById.get(id))
      .filter((m): m is ChatMessageRecord => m !== undefined);

    const hasMore = allIds.length > PAGE_SIZE;
    const oldestCursor = hasMore ? messages[0]?.createdAt : undefined;

    return {
      conversation: this.buildSummary(callerId, record),
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
    const record = this.store.conversations.get(jobId);
    if (!record) {
      throw new UnauthorizedError('Conversation not found or access denied.');
    }
    this.assertParticipant(callerId, record);

    const olderIds = [...record.messageOrder].filter((id) => {
      const msg = record.messageById.get(id);
      return msg && msg.createdAt < beforeTimestamp;
    });

    const pageIds = olderIds.slice(-limit);
    const messages = pageIds
      .map((id) => record.messageById.get(id))
      .filter((m): m is ChatMessageRecord => m !== undefined);

    const hasMore = olderIds.length > limit;
    const oldestCursor = hasMore ? messages[0]?.createdAt : undefined;

    return { messages, hasMore, oldestCursor };
  }

  async sendMessage(
    callerId: string,
    input: SendMessageInput
  ): Promise<ChatMessageRecord> {
    const record = this.store.conversations.get(input.jobId);
    if (!record) {
      throw new UnauthorizedError('Conversation not found or access denied.');
    }
    this.assertParticipant(callerId, record);
    this.assertWriteable(record);

    // Idempotency: return the existing record for a repeated tempId
    const existingMsgId = this.store.sentTempIds.get(input.tempId);
    if (existingMsgId) {
      const existing = record.messageById.get(existingMsgId);
      if (existing) return existing;
    }

    const isCustomer = callerId === record.customer.id;
    const msgId = this.generateMessageId();
    const now = new Date().toISOString();

    const chatMsg: ChatMessageRecord = {
      id: msgId,
      jobId: input.jobId,
      senderId: callerId,
      senderRole: isCustomer ? 'customer' : 'brainworker',
      senderName: isCustomer ? record.customer.name : record.brainWorker.name,
      content: input.content ?? '',
      contentType: input.contentType ?? 'text',
      mediaUrl: input.mediaUrl,
      location: input.location,
      isRead: false,
      createdAt: now,
    };

    record.messageById.set(msgId, chatMsg);
    record.messageOrder.push(msgId);
    this.store.sentTempIds.set(input.tempId, msgId);

    return chatMsg;
  }

  async markAsRead(
    callerId: string,
    jobId: string,
    upToTimestamp?: string
  ): Promise<{ readCount: number }> {
    const record = this.store.conversations.get(jobId);
    if (!record) {
      throw new UnauthorizedError('Conversation not found or access denied.');
    }
    this.assertParticipant(callerId, record);

    const cutoff = upToTimestamp ?? new Date().toISOString();
    let readCount = 0;

    for (const id of record.messageOrder) {
      const msg = record.messageById.get(id);
      if (!msg || msg.senderId === callerId) continue;
      if (msg.createdAt <= cutoff) readCount += 1;
    }

    const existing = record.readTimestamps.get(callerId);
    if (!existing || cutoff > existing) {
      record.readTimestamps.set(callerId, cutoff);
    }

    return { readCount };
  }

  async uploadAttachment(
    callerId: string,
    jobId: string,
    file: File | Blob,
    mimeType: string
  ): Promise<MediaUploadResult> {
    const record = this.store.conversations.get(jobId);
    if (!record) {
      throw new UnauthorizedError('Conversation not found or access denied.');
    }
    this.assertParticipant(callerId, record);

    // MIME allowlist — fail closed
    if (!ALLOWED_IMAGE_MIME_TYPES.includes(mimeType as typeof ALLOWED_IMAGE_MIME_TYPES[number])) {
      throw new MediaUploadError(
        `Invalid or unsupported MIME type '${mimeType}'. Only JPEG, PNG, and WebP photos are supported.`
      );
    }

    // Size enforcement
    if (file.size > MAX_ATTACHMENT_BYTES) {
      throw new MediaUploadError(
        `Photo exceeds 5MB limit. Maximum size is ${MAX_ATTACHMENT_BYTES.toLocaleString()} bytes.`
      );
    }

    const ext = mimeType.split('/')[1] ?? 'jpg';
    const mediaUrl = `https://cdn.bukiebrainjobs.com/media/upload_${Date.now()}.${ext}`;

    return { mediaUrl, fileSize: file.size, mimeType };
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Factory
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Creates a new transport-agnostic MessagingRepository.
 *
 * In development / test environments with no real transport, this repository
 * holds state in process memory. In production, a socket/HTTP adapter injects
 * pre-hydrated conversation records by passing an initial store.
 *
 * @param store - Optional pre-populated store (for server-side hydration or testing).
 */
export function createMessagingRepository(
  store: MessagingRepositoryStore = createStore()
): IMessagingRepository {
  return new MessagingRepository(store);
}

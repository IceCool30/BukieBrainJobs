// apps/web/lib/messaging/types.ts
// Domain Types, Contracts, and Error Hierarchy for WEB-017 In-App Messaging & Real-Time Chat
// Authoritative Reference: WEB-017 Architecture Contract v1.0 & Scope v1.1

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Domain Enums & Primitives
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type MessageContentType = 'text' | 'image' | 'location';

export type ClientMessageStatus =
  | 'sending'   // In client queue or flight; local tempId
  | 'sent'      // Server acknowledged; authoritative id assigned
  | 'delivered' // Recipient device acknowledged or recipient online
  | 'read'      // Recipient opened conversation
  | 'failed';   // Network timeout, offline invalidation, or authorization error

export type TransportState =
  | 'connected'    // WebSocket connected to /chat namespace
  | 'polling'      // WebSocket unavailable; HTTP short-polling active (4s)
  | 'reconnecting' // Attempting socket reconnection with backoff
  | 'offline';     // Network offline (navigator.onLine === false)

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Location Payload Contract
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface LocationPayload {
  latitude: number;
  longitude: number;
  addressText: string;
  landmark?: string | undefined;
  sharedAt: string; // ISO 8601
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Message Records & Projections
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Authoritative server message record returned by API and WebSocket broadcast.
 */
export interface ChatMessageRecord {
  id: string;                      // Server-assigned authoritative ID (e.g. 'msg_1727000000_abc')
  jobId: string;                   // Scoped booking reference
  senderId: string;                // Authenticated user ID of sender
  senderRole: 'customer' | 'brainworker';
  senderName: string;              // Display name of sender
  senderAvatar?: string | undefined;
  content: string;                 // Escaped UTF-8 plain text (max 2,000 Unicode code points)
  contentType: MessageContentType;
  mediaUrl?: string | undefined;   // HTTPS URL of processed attachment (if contentType === 'image')
  location?: LocationPayload | undefined; // Structured location (if contentType === 'location')
  isRead: boolean;
  readAt?: string | undefined;     // ISO 8601 timestamp
  createdAt: string;               // ISO 8601 timestamp
}

/**
 * Client-augmented message holding optimistic delivery states.
 */
export interface ClientChatMessage extends ChatMessageRecord {
  tempId: string;                  // Client UUID generated before transmission
  status: ClientMessageStatus;
  errorMessage?: string | undefined; // Human-readable error description if status === 'failed'
}

/**
 * Authoritative booking lifecycle statuses relevant to messaging.
 */
export type MessagingBookingStatus =
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'DISPUTED';

export const READONLY_BOOKING_STATUSES = ['COMPLETED', 'CANCELLED'] as const;
export type ReadonlyBookingStatus = typeof READONLY_BOOKING_STATUSES[number];

/**
 * Type guard checking whether a booking status is in a read-only (archived) state.
 */
export function isReadOnlyBookingStatus(status: string): status is ReadonlyBookingStatus {
  return (READONLY_BOOKING_STATUSES as readonly string[]).includes(status);
}

/**
 * Conversation inbox thread summary for /messages.
 */
export interface ConversationSummary {
  jobId: string;
  referenceCode: string;           // Human-facing reference (e.g. 'BBJ-LAG-2026-0891')
  serviceTitle: string;            // Service title (e.g. 'Generator Servicing & Repair')
  bookingStatus: MessagingBookingStatus;
  participant: {
    id: string;
    name: string;
    role: 'customer' | 'brainworker';
    avatarUrl?: string | undefined;
    isVerified: boolean;
  };
  lastMessage?: {
    id: string;
    senderId: string;
    senderName: string;
    content: string;
    contentType: MessageContentType;
    createdAt: string;
  } | undefined;
  unreadCount: number;             // Count of messages where senderId !== callerId && !isRead
  lastMessageAt: string;           // ISO 8601 timestamp used for ordering (defaults to booking createdAt)
  isReadOnly: boolean;             // True if booking is COMPLETED or CANCELLED
}

/**
 * Item persisted in client offline queue when disconnected.
 */
export interface OfflineQueuedMessage {
  tempId: string;
  jobId: string;
  userId: string;                  // Scoped to current authenticated session
  content: string;
  contentType: 'text' | 'location';
  location?: LocationPayload | undefined;
  queuedAt: string;                // ISO 8601
  retryCount: number;
}

/**
 * A queued message that permanently failed to send during drain replay.
 */
export interface FailedQueuedMessage extends OfflineQueuedMessage {
  /** Human-readable reason the message could not be sent. */
  errorMessage: string;
  /** ISO 8601 timestamp when the failure was recorded. */
  failedAt: string;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Repository Operations & Contracts
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface SendMessageInput {
  jobId: string;
  content: string;
  contentType?: MessageContentType | undefined; // Defaults to 'text'
  mediaUrl?: string | undefined;
  location?: LocationPayload | undefined;
  tempId: string;                              // Client-generated UUID for idempotency
}

export interface GetMessagesResult {
  messages: ChatMessageRecord[];
  hasMore: boolean;
  oldestCursor?: string | undefined;           // Timestamp cursor for backward pagination
}

export interface MediaUploadResult {
  mediaUrl: string;
  fileSize: number;
  mimeType: string;
}

export interface ImageAttachmentInput {
  size: number;
  mimeType: string;
}

export interface IMessagingRepository {
  /**
   * Returns all conversation summaries for the authenticated caller,
   * sorted by lastMessageAt DESC.
   */
  getConversations(callerId: string): Promise<ConversationSummary[]>;

  /**
   * Returns the conversation summary and initial window of messages (30 most recent).
   */
  getConversation(
    callerId: string,
    jobId: string
  ): Promise<{
    conversation: ConversationSummary;
    messages: ChatMessageRecord[];
    hasMore: boolean;
    oldestCursor?: string | undefined;
  }>;

  /**
   * Retrieves older messages before a given timestamp cursor.
   */
  getOlderMessages(
    callerId: string,
    jobId: string,
    beforeTimestamp: string,
    limit?: number
  ): Promise<GetMessagesResult>;

  /**
   * Submits a new message. Idempotent based on tempId.
   */
  sendMessage(
    callerId: string,
    input: SendMessageInput
  ): Promise<ChatMessageRecord>;

  /**
   * Marks unread messages in the conversation as read up to upToTimestamp.
   */
  markAsRead(
    callerId: string,
    jobId: string,
    upToTimestamp?: string
  ): Promise<{ readCount: number }>;

  /**
   * Uploads a single image attachment.
   * Enforces 5MB limit and MIME validation.
   */
  uploadAttachment(
    callerId: string,
    jobId: string,
    file: File | Blob,
    mimeType: string
  ): Promise<MediaUploadResult>;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Domain Error Hierarchy
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export class MessagingError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = 'MessagingError';
    Object.setPrototypeOf(this, MessagingError.prototype);
  }
}

export class UnauthorizedError extends MessagingError {
  constructor(message = 'You do not have permission to access this conversation.') {
    super(message, 'UNAUTHORIZED');
    this.name = 'UnauthorizedError';
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

export class ConversationClosedError extends MessagingError {
  constructor(message = 'This job has ended. New messages cannot be sent.') {
    super(message, 'CONVERSATION_CLOSED');
    this.name = 'ConversationClosedError';
    Object.setPrototypeOf(this, ConversationClosedError.prototype);
  }
}

export class MessageValidationError extends MessagingError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR');
    this.name = 'MessageValidationError';
    Object.setPrototypeOf(this, MessageValidationError.prototype);
  }
}

export class MediaUploadError extends MessagingError {
  constructor(message: string) {
    super(message, 'MEDIA_UPLOAD_ERROR');
    this.name = 'MediaUploadError';
    Object.setPrototypeOf(this, MediaUploadError.prototype);
  }
}

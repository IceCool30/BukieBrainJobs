# Spec: WEB-017 In-App Messaging & Real-Time Chat Architecture Contract (v1.0)

| Field | Value |
|---|---|
| **Document ID** | WEB-017-ARCH |
| **Feature** | In-App Messaging & Real-Time Chat |
| **Status** | 🟡 Proposed for Architecture Approval (v1.0) |
| **Version** | 1.0 |
| **Workstream** | Phase 1: Customer Web Platform Completion |
| **Governing Loop** | Mr. Solomon 9-Command Engineering Loop (`/architect`) |
| **Scope Contract** | WEB-017 Scope & Product Contract v1.1 |
| **Target Surfaces** | `/messages` (Conversation List), `/messages/[jobId]` (Active Chat View) |
| **Date** | 2026-09-22 |

---

## 1. Architectural Doctrine & Boundary Invariants

WEB-017 establishes the architecture for authenticated, job-scoped messaging between customers and assigned BrainWorkers.

### Core Doctrine

> **1. Authoritative truth lives on the server, not in local optimistic state.**
> 
> The client may hold pending intent (`tempId`, `sending`), but only a server ACK confirms persistence.
>
> **2. The transport is an implementation detail behind the repository.**
>
> UI components consume an abstract `IMessagingRepository` and reactive hook (`useConversation`). They do not know or care whether a message arrived via Socket.io WebSocket, HTTP polling, or local cache replay.
>
> **3. Strict session and participant isolation.**
>
> Messages and offline queues are strictly partitioned by authenticated `userId` and `jobId`. No operation may cross this boundary.

---

## 2. Domain Data Model & Types

All types align with `@bukiebrainjobs/api-types` while introducing explicit client lifecycle states and pagination contracts.

### 2.1 Domain Enums & Primitives

```typescript
export type MessageContentType = 'text' | 'image' | 'location';

export type ClientMessageStatus = 
  | 'sending'    // In client queue or flight; local tempId
  | 'sent'       // Server acknowledged; authoritative id assigned
  | 'delivered'  // Recipient device acknowledged or recipient online
  | 'read'       // Recipient opened conversation
  | 'failed';    // Network timeout, offline invalidation, or authorization error

export type TransportState = 
  | 'connected'        // WebSocket connected to /chat namespace
  | 'polling'          // WebSocket unavailable; HTTP short-polling active (4s)
  | 'reconnecting'     // Attempting socket reconnection with backoff
  | 'offline';         // Network offline (navigator.onLine === false)
```

### 2.2 Location Payload Structure

```typescript
export interface LocationPayload {
  latitude: number;
  longitude: number;
  addressText: string;
  landmark?: string | undefined;
  sharedAt: string; // ISO 8601
}
```

### 2.3 Authoritative Server Message Record (`ChatMessageRecord`)

```typescript
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
  createdAt: string;                // ISO 8601 timestamp
}
```

### 2.4 Client Augmented Message (`ClientChatMessage`)

```typescript
export interface ClientChatMessage extends ChatMessageRecord {
  tempId: string;                  // Client UUID generated before transmission
  status: ClientMessageStatus;
  errorMessage?: string | undefined; // Human-readable error description if status === 'failed'
}
```

### 2.5 Conversation Summary (`ConversationSummary`)

```typescript
export interface ConversationSummary {
  jobId: string;
  referenceCode: string;           // Human-facing reference (e.g. 'BBJ-LAG-2026-0891')
  serviceTitle: string;            // Service title (e.g. 'Generator Servicing & Repair')
  bookingStatus: 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'DISPUTED';
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
```

### 2.6 Offline Queued Message (`OfflineQueuedMessage`)

```typescript
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
```

---

## 3. Domain Error Hierarchy

All messaging operations fail closed with explicit, strongly-typed errors:

```typescript
export class MessagingError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = 'MessagingError';
  }
}

export class UnauthorizedError extends MessagingError {
  constructor(message = 'You do not have permission to access this conversation.') {
    super(message, 'UNAUTHORIZED');
    this.name = 'UnauthorizedError';
  }
}

export class ConversationClosedError extends MessagingError {
  constructor(message = 'This job has ended. New messages cannot be sent.') {
    super(message, 'CONVERSATION_CLOSED');
    this.name = 'ConversationClosedError';
  }
}

export class MessageValidationError extends MessagingError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR');
    this.name = 'MessageValidationError';
  }
}

export class MediaUploadError extends MessagingError {
  constructor(message: string) {
    super(message, 'MEDIA_UPLOAD_ERROR');
    this.name = 'MediaUploadError';
  }
}
```

---

## 4. Repository Contract (`IMessagingRepository`)

The repository boundary provides a pure async interface decoupled from any specific transport or mock implementation.

```typescript
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

export interface IMessagingRepository {
  /**
   * Returns all conversation summaries for the authenticated caller,
   * sorted by lastMessageAt DESC.
   */
  getConversations(callerId: string): Promise<ConversationSummary[]>;

  /**
   * Returns the conversation summary and initial window of messages (e.g. 30 most recent).
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
```

---

## 5. Real-Time Transport, Socket.io Contract, & Polling Fallback

### 5.1 Socket.io Namespace & Events (`/chat`)

The client connects to `/chat` on the socket server:

1. **Authentication Handshake**:
   - `auth: { userId: string, role: 'customer' | 'brainworker' }`
   - Server rejects socket connection if auth credentials are missing or invalid.
2. **Room Architecture**:
   - Each booking maps to room `job:${jobId}`.
   - `socket.emit('join_chat', jobId, (success, error) => ...)`
   - Server independently verifies participant authorization before joining socket to room.
3. **Outbound Event (`send_message`)**:
   ```typescript
   socket.emit('send_message', {
     jobId: string,
     content: string,
     contentType: MessageContentType,
     mediaUrl?: string,
     tempId: string, // Idempotency key
   }, (success: boolean, message?: ChatMessageRecord, error?: string) => { ... })
   ```
4. **Inbound Broadcasts**:
   - `'new_message'`: Broadcast to `job:${jobId}` when a message is accepted.
   - `'message_read'`: Broadcast to `job:${jobId}` with `(messageId: string, readAt: string)`.

### 5.2 HTTP Short-Polling Fallback Engine

When WebSocket is disconnected or in degraded network conditions:
- Polling runs every 4 seconds (`POLL_INTERVAL_MS = 4000`).
- **Endpoint**: `GET /api/chat/messages?jobId={jobId}&since={latestMessageCreatedAt}`
- **Overlap Mutex**: A poll request will not fire if an earlier poll is still in flight.
- **Backoff on Inactive Tab**: When `document.hidden === true`, polling drops to 15 seconds to conserve mobile data and battery.

### 5.3 Deduplication & Transport Reconciliation

Because a message can arrive via WebSocket, polling fallback, or immediate sender ACK, the client hook uses a reconciliation store:
1. Messages are indexed in an internal map keyed by authoritative `id`.
2. When an incoming message arrives with `tempId`, any existing client message with `clientChatMessage.tempId === incoming.tempId` is replaced in-place, updating status from `'sending'` to `'sent'` without visual layout jitter.
3. Multiple deliveries of the same `id` are silently ignored.

---

## 6. Offline Queue & Idempotency Protocol

### 6.1 Storage Partitioning & Session Isolation

- Queue storage is partitioned in `sessionStorage` under key: `bbj_offline_queue_${userId}`.
- If the active session changes (user logs out or switches accounts), the queue processor terminates. Messages belonging to a different user are never sent under the new session.

### 6.2 FIFO Drain & Idempotent Replay

When network returns online (`navigator.onLine === true` or socket reconnects):
1. The queue processor reads pending items for the current `userId`.
2. Drains items sequentially in FIFO order.
3. Sends each item with `tempId` as the idempotency key.
4. If the server already persisted the message during a network blip, it returns the existing record without creating a duplicate.

### 6.3 Invalidation on State Change

Prior to replaying a queued message, the processor verifies that `conversation.isReadOnly === false`. If the booking became `COMPLETED` or `CANCELLED` while the device was offline:
- The message is removed from the active queue.
- It transitions to `status: 'failed'` with `errorMessage: 'Job has ended. Message could not be sent.'`.

---

## 7. Media Attachment Pipeline

### 7.1 Separation of Attachments from Message Queue

Photo uploads are distinct from message creation:
1. The image is uploaded first (`uploadAttachment`).
2. Only after receiving the confirmed `mediaUrl` does the client construct and send the `contentType: 'image'` message.
3. Offline queueing applies only to text and location messages; image uploads require an active connection.

### 7.2 Security & Processing Boundary

- **MIME Whitelist**: `image/jpeg`, `image/png`, `image/webp`. Enforced by inspecting file magic bytes, not just file extensions.
- **Size Cap**: Exactly `5,242,880` bytes (5.0 MB).
- **Sanitization**: EXIF metadata is stripped prior to final CDN storage.
- **In-Flight Cancellation**: `uploadAttachment` accepts an `AbortSignal`, allowing the user to cancel an in-progress upload without leaving orphaned locks.

---

## 8. Pagination & Read Cursor Architecture

### 8.1 Reverse-Chronological Cursor Pagination

To maintain smooth scrolling without jumps:
- Initial query: `getConversation(jobId)` fetches the 30 most recent messages.
- Pagination query: `getOlderMessages(jobId, beforeTimestamp, limit = 30)` fetches the preceding 30 messages.
- In the UI, the container preserves its `scrollTop` offset relative to the scroll height when older items are prepended to the top of the list.

### 8.2 Cursor-Based Read State

- Rather than writing individual `isRead` flags per message on disk, each participant maintains a `lastReadTimestamp` in the conversation record.
- Any message with `createdAt <= lastReadTimestamp` is treated as read by that participant.
- Marking a conversation as read simply updates `lastReadTimestamp = new Date().toISOString()`.

---

## 9. Test-Only Mock Boundary & Module Isolation

### 9.1 Zero Production Test Imports Invariant

- Production code in `lib/messaging/repository.ts` and `components/messages/` must have **zero imports** from test files, mock fixtures, or test utilities.
- Test infrastructure lives strictly in:
  - `lib/messaging/testing/fixtures.ts` (deterministic test conversations and messages).
  - `lib/messaging/testing/harness.ts` (test-only repository factory with controllable network latency, error injection, and socket simulation).

### 9.2 In-Memory Mock Repository

The test harness provides an `InMemoryMessagingRepository` that conforms 100% to `IMessagingRepository`:
- Thread-safe, deterministic state.
- Supports simulating offline failures, authorization mismatches, and duplicate submissions.
- Maintains separate in-memory stores per test run with clean reset capability.

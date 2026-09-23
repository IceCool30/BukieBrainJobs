# Spec: WEB-017 In-App Messaging & Real-Time Chat Scope and Product Contract (v1.0)

| Field | Value |
|---|---|
| **Document ID** | WEB-017-SCOPE |
| **Feature** | In-App Messaging & Real-Time Chat |
| **Status** | 🟢 Complete / Live |
| **Version** | 1.0 (Live in Production) |
| **Workstream** | Phase 1: Customer Web Platform Completion |
| **Governing Loop** | Mr. Solomon 9-Command Engineering Loop |
| **Target Surfaces** | `/messages` (Conversation List Hub), `/messages/[jobId]` (Active Conversation Screen) |
| **Date** | 2026-09-23 |

---

## 1. Executive Summary & Core Doctrine

WEB-017 establishes the in-app messaging system for the BukieBrainJobs customer web platform. It replaces the temporary "Messages coming soon" dialog with an authenticated conversation hub (`/messages`) and an active chat interface (`/messages/[jobId]`). Customers and assigned BrainWorkers communicate directly to coordinate job details, discuss materials, clarify arrival directions, share inspection photographs, and send one-time location snapshots for confirmed jobs.

### Core Doctrine

> **Messages serve job delivery, not social networking.**
>
> Every conversation exists to fulfill an active, confirmed booking. The chat interface is strictly scoped to the participants of that booking. All messaging state is backed by an authoritative repository contract that supports both real-time socket events and resilient HTTP polling, while keeping optimistic client state cleanly separated from server-confirmed truth.

### 1.2 Explicit Non-Scope for v1

To prevent scope creep and maintain delivery discipline, the following features are deliberately excluded from WEB-017 v1:
- **Typing Indicators**: Excluded from v1.
- **Message Reactions & Emoji Counters**: Excluded from v1.
- **Message Editing**: Sent messages are immutable records.
- **Message Deletion**: Messages cannot be deleted by users.
- **Voice Notes & Audio Clips**: Excluded from v1.
- **Video Calling**: Excluded from v1.
- **Continuous Live GPS Tracking**: Excluded; only one-time structured snapshots are permitted.
- **Group Chats**: Strictly 1-to-1 between customer and assigned BrainWorker.
- **Customer-to-Customer Messaging**: Prohibited; marketplace communication is strictly customer ↔ BrainWorker.
- **Arbitrary File Attachments**: Only standard JPEG, PNG, and WEBP images are supported. PDF, ZIP, and other documents are excluded.
- **Pre-Booking Messaging**: Prohibited prior to booking confirmation and provider assignment.
- **WhatsApp Direct Handoff**: Prohibited to preserve escrow and audit protection.

---

## 2. Conversation Model & Discovery

### 2.1 One Conversation Per Booking (`jobId`) Invariant

- **Model**: A conversation is strictly keyed to a specific booking (`jobId`).
- **Rationale**: In BukieBrainJobs, every job represents a distinct task, address, quote, schedule, and safety context. Combining multiple jobs into a single user-to-user thread causes confusion regarding quotes, milestones, and receipts.
- **Deduplication**: If a customer hires the same BrainWorker for two separate bookings, the system maintains two distinct conversations, each tied to its respective `jobId` and referenced by its `referenceCode`.

### 2.2 Conversation Hub Discovery (`/messages`)

The `/messages` route serves as the primary inbox. It displays all conversations owned by the authenticated customer.

- **Ordering**: Sorted strictly descending by `lastMessageAt` (the timestamp of the most recent message in the thread). If a conversation has no messages yet, it sorts by `bookingCreatedAt`.
- **Display Fields per Thread**:
  - BrainWorker profile avatar, full name, and verified badge.
  - Service title (for example, "Generator Servicing & Repair").
  - Booking reference code (for example, `BBJ-LAG-2026-0891`).
  - Snippet of the latest message with sender prefix ("You: ..." or "Worker: ...").
  - Timestamp of latest message formatted with relative human context ("2m ago", "10:30 AM", "Yesterday", or date).
  - Unread message count badge (highlighted emerald badge).
  - Booking status badge (`CONFIRMED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`).
- **Empty State**: When an authenticated user has zero active or past conversations, the hub displays a calm, structured empty state: "No active conversations. When you book a BrainWorker, your chat thread will appear here to help you coordinate job details." with a primary CTA to browse services or view active jobs.

### 2.3 Message History & Pagination

A conversation cannot load an unbounded message history into client memory.
- **Initial Load Window**: The chat screen initially fetches the most recent window of messages (for example, 30 most recent messages) ordered chronologically.
- **Scroll-Anchored Older Retrieval**: When the user scrolls to the top of the conversation viewport, older messages are fetched in reverse-chronological pages without resetting or jumping the user's current scroll position.
- **Deterministic Cursor**: Messages are cursor-paginated based on message timestamp (`before={oldestMessageTimestamp}`) to avoid skipping or repeating messages during active conversation exchanges.

### 2.4 Calm Degraded, Loading, & Empty States Catalog

The interface enforces honest state representation across all conditions:
1. **`/messages` Zero Conversations**: Clean slate explaining how conversations are created when a job is booked, with a CTA to browse services.
2. **Active Conversation Zero Messages**: When a booking is confirmed but neither party has sent a message yet, a helpful onboarding card displays: "Your booking is confirmed with {workerName}. Use this space to confirm arrival time, clarify tools, or give specific house directions."
3. **Loading Conversations**: Skeleton placeholders for conversation items preserving layout stability.
4. **Loading Older Messages**: Subtle top spinner inside the message container that does not shift the active viewport.
5. **Connection Degraded**: Small non-blocking status pill ("Connecting... Polling for updates every 4s") displayed above the input box.
6. **Message Send Failure**: Explicit red alert under the affected message with a "Retry" button.
7. **Attachment Upload Failure**: Explanatory message indicating upload failure with a "Retry upload" or "Remove" option.
8. **Inaccessible / Unauthorized Conversation**: Fail-closed card: "You do not have permission to view this conversation." with a button returning to `/jobs` or `/messages`.
9. **Archived / Closed Conversation**: The composition bar is replaced with a calm read-only notice: "This job was completed on {date}. Messaging is closed." (or "This booking was cancelled. Messaging is closed.").

---

## 3. Authorization & Lifecycle Invariants

### 3.1 Participant Authorization (Strict Fail-Closed)

A user can access a conversation if and only if:
1. The user has an active, authenticated session.
2. The user is either the customer who booked the job (`customerId === session.userId`) or the assigned BrainWorker (`brainWorkerId === session.userId`).

Any access attempt by a third party, unauthenticated visitor, or non-participant must fail closed immediately:
- In the UI: Redirect to `/login` if unauthenticated, or display an "Access Restricted: You are not a participant in this conversation" state.
- In repository and socket handlers: Reject queries and room joins with an explicit `UnauthorizedError`.

### 3.2 Chat Availability by Booking Lifecycle

Chat availability is governed strictly by the booking's lifecycle state:

| Booking State | Chat Read Access | Chat Write Access | UI Status Indicator | Notes |
|:---|:---|:---|:---|:---|
| `SEARCHING` / `MATCHING` | **Denied** | **Denied** | Not created | No provider assigned yet; chat does not exist. |
| `CONFIRMED` | **Allowed** | **Allowed** | Active | BrainWorker assigned and escrow funded. Coordination begins. |
| `IN_PROGRESS` | **Allowed** | **Allowed** | Active | Work actively underway. Photos and updates exchanged. |
| `COMPLETED` | **Allowed** | **Read-Only** | Archived (Completed) | Work is done. Messages are preserved for historical record. New input disabled. |
| `CANCELLED` | **Allowed** | **Read-Only** | Closed (Cancelled) | Booking was cancelled. Thread preserved for audit and dispute safety. New input disabled. |
| `DISPUTED` | **Allowed** | **Allowed** | Under Mediation | Active dispute. Communication remains open for resolution unless moderator intervenes. |

#### 3.2.1 Distinction Between Conversation Visibility and Message Composition

A read-only archived conversation (`COMPLETED` or `CANCELLED`) remains accessible and readable to authorized participants so that receipts, historical agreements, and photos can be reviewed for audit and dispute safety. However, the repository and socket/API endpoints independently reject new message creation attempts with an explicit `ConversationClosedError`. The UI composition bar renders read-only, but the repository and server enforce this independently; the UI is never the security boundary.

### 3.3 No Pre-Booking Direct Messaging

- Customers cannot start a direct chat thread with a BrainWorker before a booking is confirmed.
- This rule prevents off-platform disintermediation, protects customer phone numbers and privacy, and ensures that platform escrow guarantees cover every scheduled engagement.

---

## 4. Message Lifecycle & State Model

### 4.1 Client Delivery States vs Authoritative Persistence

To prevent false claims of delivery during unstable network conditions, client state is explicitly tracked:

```
[User Hits Send]
       │
       ▼
   `sending`   ──(Local optimism with tempId, input disabled, pending icon)
       │
       ├────────────────────────────────────────┐
       ▼                                        ▼
    `sent` (Server ACK received)             `failed` (Timeout, network error, or rejection)
       │                                        │
       ▼                                        ▼
  `delivered` (Recipient socket ACK/online)  [Retry Button / Dismiss]
       │
       ▼
    `read`    (Recipient opens chat view)
```

1. **`sending`**: The message exists only in client memory or local queue with a client-generated UUID (`tempId`). It is displayed with reduced opacity and a clock icon.
2. **`sent`**: The server has accepted the payload, generated the authoritative `id`, persisted the record, and acknowledged receipt back to the sender.
3. **`delivered`**: The message has reached the recipient's active socket connection or device.
4. **`read`**: The recipient has viewed the message in an active conversation window.
5. **`failed`**: Transmission failed due to network loss, server error, or authorization rejection. An explicit red warning appears with a "Retry" button.

Optimistic messages must never display checkmarks or pretend to be delivered before authoritative server acknowledgment.

### 4.2 Content Types

WEB-017 supports three explicit content types matching `@bukiebrainjobs/api-types`:

1. **`text`**: Standard UTF-8 plain text.
   - Limit: Maximum **2,000 Unicode code points** (`Array.from(str.trim()).length <= 2000`).
   - Minimum: 1 non-whitespace character.
   - Strict XSS defense: Rendered purely as escaped text, never as raw HTML or markdown that allows script injection.
2. **`image`**: Single photograph attachment (inspection photo, damaged part, receipt).
   - See Section 7 for file validation and storage rules.
3. **`location`**: One-time location snapshot card.
   - See Section 8 for schema and permissions.

---

## 5. Unread & Read Semantics

### 5.1 Authoritative Unread Count

- A message is considered unread if:
  $$\text{isUnread} = (\text{message.senderId} \neq \text{currentUserId}) \land (\text{message.isRead} = \text{false})$$
- The conversation badge on `/messages` reflects the exact sum of unread incoming messages for that `jobId`.
- Global navigation badges reflect the sum of unread messages across all active conversations.

### 5.2 Read Receipt Trigger

- When an authenticated participant opens `/messages/[jobId]` and the window is focused, any unread messages in that thread are marked as read.
- The client emits a batch `read_message` event to the socket server with the conversation `jobId` and the highest `readAt` timestamp.
- The repository marks records as `isRead = true` and records `readAt = new Date().toISOString()`.
- The UI reflects this with subtle double-check indicators on the sender's screen.

---

## 6. Real-Time Transport & Resilient Polling Fallback

### 6.1 Dual-Engine Architecture

Real-time chat must work reliably on variable mobile networks across Nigeria. The client uses an abstracted `IMessagingRepository` that encapsulates transport details:

1. **Primary Transport**: WebSocket via Socket.io client connecting to `/chat` namespace on `services/socket-server`.
2. **Secondary Transport (Fallback)**: HTTP short-polling (`GET /api/chat/messages?jobId=...&since=...`) running at 4-second intervals.

### 6.2 Connection State Machine

```
   [Initial Connect]
          │
          ▼
    `connecting`
          │
          ├────────────────────────────────────────┐
          ▼                                        ▼
     `connected` (WebSocket active)           `disconnected`
          │                                        │
          ▼                                        ▼
   (Instant socket events)               `polling_fallback` (HTTP 4s cadence)
                                                   │
                                                   ▼
                                         `reconnecting` (Exponential backoff)
```

- When the socket connection fails or drops for more than 5 seconds, the system seamlessly activates the polling fallback without dropping the user from the interface.
- A calm, non-intrusive status pill indicates connectivity status:
  - Green (silent): Connected.
  - Yellow: "Connecting... Polling for new updates."
  - Slate: "Offline. Messages will be sent when connection returns."

### 6.3 Missed-Message Recovery

Upon reconnecting after a dropped connection:
1. The client queries the server for all messages created since the timestamp of the last confirmed message:
   `GET /api/chat/messages?jobId={jobId}&since={latestMessageCreatedAt}`
2. Incoming messages are reconciled and merged into the active list without duplicate entries.

---

## 7. Photo Attachments (Media Handling)

### 7.1 Purpose & Usage

Customers and BrainWorkers frequently need to share visual evidence: a leaking plumbing joint, an electrical breaker model number, or a completed installation.

### 7.2 Strict Validation & Storage Rules

- **Permitted MIME Types**: `image/jpeg`, `image/png`, `image/webp`. All other types (including PDF, SVG, executables, or archives) are strictly rejected.
- **Size Limit**: Maximum **5.0 MB** per image. Files exceeding 5MB are rejected prior to upload with a clear user prompt: "Photo exceeds 5MB limit. Please choose a smaller photo."
- **Quantity**: Exactly **1 photo per message**. Multi-photo uploads are sent as sequential messages to preserve timeline clarity.
- **Upload Lifecycle**:
  1. User selects image ➔ Local client preview generated via `URL.createObjectURL`.
  2. Thumbnail displayed with progress indicator (0% to 100%).
  3. Upload dispatched to media storage endpoint (`POST /api/chat/upload`).
  4. Server returns sanitized, immutable CDN URL (`mediaUrl`).
  5. Message payload is submitted with `contentType: 'image'` and `mediaUrl`.
- **Security & Privacy**:
  - Image URLs must be served over HTTPS.
  - Server strips EXIF metadata (GPS tags, camera serials) during processing to protect customer residential privacy.
- **Offline Rule & Upload Separation**: Photo attachment uploads are strictly decoupled from text-message queuing. Uploading requires active internet connectivity. If the client is offline, photo selection alerts the user: "Internet connection required to upload photos." Image uploads cannot be queued offline.

---

## 8. Location Sharing (One-Time Snapshot)

### 8.1 Scope Boundary: One-Time Snapshot Only

- WEB-017 explicitly implements a **one-time location snapshot card**.
- **Continuous or live background GPS tracking is strictly out of scope for v1**. Background tracking drains battery, triggers invasive browser permission dialogs, and introduces unnecessary liability.
- **Intentional User Action**: Location sharing must be an intentional user action (clicking "Share Location" and confirming address details). It must never occur automatically merely because the chat window is open.

### 8.2 Location Message Structure

When a customer clicks "Share Job Location", the client packages a structured location card:

```typescript
interface LocationPayload {
  latitude: number;
  longitude: number;
  addressText: string;
  landmark?: string | undefined;
  sharedAt: string; // ISO 8601
}
```

- **Address Confirmation**: The modal displays the pre-filled address and landmark from the booking, allowing the customer to confirm or adjust before sending.
- **Presentation**: Rendered inside the chat timeline as an interactive card showing the landmark, street address, and a "View in Google Maps" external link (`https://maps.google.com/?q={latitude},{longitude}`).

---

## 9. Offline Message Queue & Resilience

### 9.1 Local Storage Queue & Session Isolation

- When `navigator.onLine === false` or the network transport fails, outbound text messages are appended to a persistent client queue in `sessionStorage` or `IndexedDB`.
- Queued messages are assigned a unique client `tempId` and displayed in the conversation thread with a subtle "Waiting for network" clock indicator.
- **Account & Conversation Isolation Invariant**: Queue storage is strictly partitioned and scoped by authenticated `userId` and `jobId`. A queued message must never become sendable after an account or session switch if the new session does not own that conversation.

### 9.2 Replay & Idempotency Protocol

- When connectivity is restored, the queue processor drains in FIFO order.
- Each payload carries an `idempotencyKey` equal to the `tempId`.
- If the server already received and processed the message during an earlier partial connection drop, it returns the existing message record without creating a duplicate.

### 9.3 Invalidation While Queued

- If the booking state changes while a message is in the offline queue (for example, the job was cancelled or marked complete by another session), the queue processor halts transmission of that message.
- The message transitions to `failed` state with the label: "Job has ended. Message could not be sent."

---

## 10. Privacy, Safety, & Anti-Disintermediation

### 10.1 Safety Warnings & Escrow Protection

The chat header displays a calm, persistent trust banner:
> "Keep payments and communications on BukieBrainJobs. Off-platform payments are not protected by BukieGuarantee escrow."

### 10.2 Disintermediation & Sensitive Pattern Detection

- The client scans outbound message text for direct off-platform solicitation patterns (for example, raw Nigerian phone numbers `080...`, `+234...`, or direct bank account numbers).
- When detected, the system displays a gentle inline tip:
  "For your safety and escrow protection, keep work agreements and payments on BukieBrainJobs. Do not share banking credentials."
- The message is not hard-blocked to avoid frustrating users sending legitimate dimensional measurements, but the safety warning is prominently displayed.

### 10.3 Profanity & Harassment Protection

- A "Report Message" action allows participants to flag offensive, abusive, or threatening messages directly to platform moderators without leaving the chat view.
- Flagging creates an audit ticket and does not delete the conversation history.

---

## 11. Accessibility & Responsive Standards

### 11.1 Keyboard Navigation & Focus Management

- Full tab navigation across the thread list, message input, attachment buttons, and message history.
- Pressing `Enter` in the text area sends the message. `Shift + Enter` inserts a newline.
- After sending, focus remains smoothly in the text area for fluid back-and-forth conversation.
- Scroll position automatically snaps to the newest incoming message, unless the user has scrolled up to inspect history. When scrolled up, a "New messages below" pill appears.

### 11.2 Screen Reader Announcements

- New incoming messages are announced via an off-screen `aria-live="polite"` region.
- Double-check delivery indicators include accessible text alternatives: "Message sent", "Message delivered", "Message read".

### 11.3 Mobile & Responsive Layout

- On mobile viewports (`< 768px`), the interface operates in a master-detail push structure:
  - `/messages` displays the conversation list.
  - Tapping a conversation slides smoothly into the full-screen chat view with a sticky header and fixed bottom input bar.
  - A clear "Back to conversations" arrow returns to the list.
- On desktop viewports (`>= 768px`), the interface renders as a split-pane layout: conversation list on the left (360px), active conversation on the right.

---

## 12. Verification & Acceptance Criteria

### Hub & Discovery (`/messages`)
- [ ] **HUB-001**: Renders conversation list sorted by latest message timestamp descending.
- [ ] **HUB-002**: Displays BrainWorker name, avatar, service title, reference code, snippet, and relative timestamp.
- [ ] **HUB-003**: Displays unread badge matching count of unread incoming messages.
- [ ] **HUB-004**: Shows calm empty state with service CTA when customer has zero conversations.
- [ ] **HUB-005**: Replaces existing "Messages coming soon" dialog across navigation and dashboard.

### Active Chat Interface (`/messages/[jobId]`)
- [ ] **CHT-001**: Restricts conversation access strictly to authenticated booking participants (customer and assigned BrainWorker).
- [ ] **CHT-002**: Denies access and fails closed for unauthenticated callers or non-participants.
- [ ] **CHT-003**: Renders conversation header with BrainWorker details, booking reference link, and BukieGuarantee safety note.
- [ ] **CHT-004**: Read-only input bar when booking is `COMPLETED` or `CANCELLED`.
- [ ] **CHT-005**: Active input bar when booking is `CONFIRMED`, `IN_PROGRESS`, or `DISPUTED`.

### Message Delivery & State
- [ ] **MSG-001**: Renders client states: `sending` (clock), `sent` (single check), `delivered` (double check), `read` (colored double check), `failed` (warning).
- [ ] **MSG-002**: Enforces 2,000 Unicode code point limit with client counter.
- [ ] **MSG-003**: Automatically marks unread messages as read upon conversation focus.
- [ ] **MSG-004**: Escapes plain text to prevent XSS injection.

### Real-Time & Polling
- [ ] **RT-001**: Subscribes to `job:${jobId}` room via Socket.io chat namespace.
- [ ] **RT-002**: Receives real-time incoming messages and appends to timeline without full page re-render.
- [ ] **RT-003**: Falls back to 4-second HTTP polling if WebSocket fails or disconnects.
- [ ] **RT-004**: Backfills missed messages upon reconnect without duplicate entries.

### Media & Location
- [ ] **MED-001**: Accepts JPEG, PNG, WEBP images up to 5MB.
- [ ] **MED-002**: Displays inline thumbnail with upload progress and full-view lightbox.
- [ ] **MED-003**: Rejects non-image files and files larger than 5MB with clear error copy.
- [ ] **LOC-001**: Renders one-time location snapshot card with landmark, address, and Google Maps link.
- [ ] **LOC-002**: Requires user confirmation before sending location snapshot.

### Offline Resilience
- [ ] **OFF-001**: Outbound text messages queue locally when offline with pending indicator.
- [ ] **OFF-002**: Outbound queue automatically drains with idempotent retry when connection returns.
- [ ] **OFF-003**: Disables photo uploads while offline with explanatory toast.

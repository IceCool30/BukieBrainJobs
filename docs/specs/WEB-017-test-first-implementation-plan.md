# Test-First Implementation Plan: WEB-017 In-App Messaging & Real-Time Chat (v1.0)

| Field | Value |
|---|---|
| **Document ID** | WEB-017-TEST |
| **Feature** | In-App Messaging & Real-Time Chat |
| **Status** | 🟢 Complete / Live |
| **Version** | 1.0 (Live in Production) |
| **Workstream** | Phase 1: Customer Web Platform Completion |
| **Governing Loop** | Mr. Solomon 9-Command Engineering Loop |
| **Activated Skill** | `agent-skills-test-driven-development` |
| **Prerequisites** | Scope v1.1 (Approved), Architecture v1.0 (Approved), UX v1.0 (Approved) |
| **Date** | 2026-09-23 |

---

## 1. Executive Summary & TDD Doctrine

This document establishes the strict Test-Driven Development (TDD) protocol for **WEB-017: In-App Messaging & Real-Time Chat**. In accordance with the project's engineering loop and `agent-skills-test-driven-development`:

> **No production code or UI component may be written before its corresponding failing test is committed.**
>
> Tests represent authoritative proof of domain correctness. The implementation team writes the test first (RED), writes the minimal code to satisfy the test (GREEN), refactors for clarity and performance (REFACTOR), and verifies the full suite over SSH on the cloud Codespace.

### Mandatory Environment & Cloud SSH Rules
- **Zero Heavy Execution on Termux**: Monorepo-wide test runs (`pnpm test`, `turbo run test`), broad Vitest suites, type-checking (`tsc --noEmit`), and Next.js builds (`pnpm build`) will not run locally in Termux.
- **Cloud Codespace SSH Dispatch**: All test suites, type-checking, linting, and build verifications are dispatched over SSH to cloud Codespace `effective-fishstick-x5qwp6wrrp64fxwx`:
  ```bash
  gh codespace ssh -c effective-fishstick-x5qwp6wrrp64fxwx -- "cd /workspaces/BukieBrainJobs && <COMMAND>"
  ```
- **Synchronization Pipeline**:
  1. Commit changes locally on Termux (`git commit`).
  2. Push branch to remote (`git push origin <branch>`).
  3. Pull and execute verification on Codespace.

---

## 2. Test Suite Architecture & File Layout

Nine dedicated test suites will provide automated coverage across domain validation, repository authorization, real-time transport reconciliation, offline queueing, UI components, accessibility, media upload, and surface routing:

```
BukieBrainJobs/apps/web/
├── lib/messaging/
│   ├── validation.test.ts             # Suite 1: Pure validation (content length, MIME whitelist, size, location payload)
│   ├── repository.test.ts             # Suite 2: Domain repository, participant authorization, lifecycle invariants, pagination
│   └── queue.test.ts                  # Suite 3: Offline queue, session isolation, FIFO replay, invalidation
├── components/messages/
│   ├── ConversationHub.test.tsx       # Suite 4: /messages inbox list, ordering, unread badge, filters, empty state
│   ├── ChatScreen.test.tsx            # Suite 5: Active chat interface, message bubbles, delivery states, retry action, archived read-only composer
│   ├── LocationShareModal.test.tsx    # Suite 6: One-time location confirmation modal, payload packaging, map links
│   └── MediaUploadStaging.test.tsx    # Suite 7: Image staging, upload progress, abort controller, 5MB limit
└── app/messages/
    ├── HubPage.test.tsx               # Suite 8: /messages route integration, auth gate, desktop/mobile responsive view
    └── [jobId]/ChatPage.test.tsx      # Suite 9: /messages/[jobId] route integration, participant verification, real-time sync
```

---

## 3. Seven-Phase RED-GREEN-REFACTOR Implementation Sequence

The implementation proceeds in seven strictly sequential phases. Test-support infrastructure is created only as required to execute failing tests:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Phase 1: Pure Domain Types & Validation (TDD)                               │
│ ├── RED: Write apps/web/lib/messaging/validation.test.ts                    │
│ ├── GREEN: Implement apps/web/lib/messaging/validation.ts and types.ts      │
│ └── REFACTOR: Clean up Unicode helpers and error types                      │
├─────────────────────────────────────────────────────────────────────────────┤
│ Phase 2: Repository & Queue Contract Tests (RED)                            │
│ ├── RED: Write lib/messaging/repository.test.ts & queue.test.ts             │
│ └── Create minimum test-only harness/fixtures in lib/messaging/testing/     │
│     to execute failing repository contract tests                            │
├─────────────────────────────────────────────────────────────────────────────┤
│ Phase 3: Messaging Repository & Offline Queue (GREEN & REFACTOR)            │
│ ├── GREEN: Implement lib/messaging/repository.ts & queue.ts                 │
│ ├── VERIFY: Assert zero-leakage production module boundary in index.ts       │
│ └── REFACTOR: Ensure clean in-memory map isolation and transport adapters    │
├─────────────────────────────────────────────────────────────────────────────┤
│ Phase 4: Conversation Hub Components (TDD)                                  │
│ ├── RED: Write components/messages/ConversationHub.test.tsx                 │
│ ├── GREEN: Implement ConversationCard, ConversationFilterBar, Hub           │
│ └── REFACTOR: Polish master-detail layout, unread counters, and filters      │
├─────────────────────────────────────────────────────────────────────────────┤
│ Phase 5: Active Chat & Delivery State Components (TDD)                      │
│ ├── RED: Write components/messages/ChatScreen.test.tsx                      │
│ ├── GREEN: Implement MessageBubble, DeliveryStatusIcon, ChatHeader,         │
│ │   ChatComposer, and ChatScreen                                            │
│ └── REFACTOR: Polish delivery states, read cursor, and archived composer    │
├─────────────────────────────────────────────────────────────────────────────┤
│ Phase 6: Media Attachment & Location Sharing Components (TDD)               │
│ ├── RED: Write MediaUploadStaging.test.tsx & LocationShareModal.test.tsx    │
│ ├── GREEN: Implement MediaUploadStaging, Lightbox, LocationShareModal, Card │
│ └── REFACTOR: Verify AbortController cancellation and Map link formatting   │
├─────────────────────────────────────────────────────────────────────────────┤
│ Phase 7: Surface & Route Integration, Cloud Verification & Production Gate  │
│ ├── RED: Write app/messages/HubPage.test.tsx & [jobId]/ChatPage.test.tsx    │
│ ├── GREEN: Wire route pages and replace "Messages coming soon" dialog       │
│ └── VERIFY: Full regression (608 baseline + WEB-017 suites), lint, build    │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Detailed Test Catalog (Assertion Invariants)

### Suite 1: Pure Domain Validation (`lib/messaging/validation.test.ts`)
- **VAL-001**: Rejects empty or whitespace-only text messages with `MessageValidationError`.
- **VAL-002**: Accepts text message with exactly 1 Unicode code point.
- **VAL-003**: Accepts text message with exactly 2,000 Unicode code points (`Array.from(str.trim()).length === 2000`).
- **VAL-004**: Rejects text message exceeding 2,000 Unicode code points with `MessageValidationError`.
- **VAL-005**: Handles multi-byte Unicode characters (Nigerian names, accents, emojis) accurately in character counter.
- **VAL-006**: Validates permitted image MIME types (`image/jpeg`, `image/png`, `image/webp`).
- **VAL-007**: Rejects prohibited MIME types (`application/pdf`, `image/gif`, `image/svg+xml`, `application/zip`) with `MediaUploadError`.
- **VAL-008**: Accepts image attachments up to exactly 5,242,880 bytes (5.0 MB).
- **VAL-009**: Rejects image attachments exceeding 5,242,880 bytes with `MediaUploadError`.
- **VAL-010**: Validates structured location payload: requires valid latitude (-90 to 90), longitude (-180 to 180), non-empty `addressText`, and valid ISO 8601 `sharedAt`.
- **VAL-011**: Rejects location payload with missing address or out-of-range coordinates.
- **VAL-012**: Sanitizes plain text content by escaping HTML control tags (`<script>`, `<iframe>`, `<div>`) preventing XSS.

---

### Suite 2: Repository Contract & Authorization (`lib/messaging/repository.test.ts`)
- **REP-001**: `getConversations` returns all active conversations owned by caller, sorted strictly by `lastMessageAt` descending.
- **REP-002**: `getConversations` excludes conversations where the caller is neither customer nor assigned BrainWorker.
- **REP-003**: `getConversations` returns empty array when caller has zero confirmed bookings.
- **REP-004**: `getConversation` succeeds when caller is the booking customer (`customerId === callerId`).
- **REP-005**: `getConversation` succeeds when caller is the assigned BrainWorker (`brainWorkerId === callerId`).
- **REP-006**: `getConversation` throws `UnauthorizedError` when caller is unauthenticated or a non-participant.
- **REP-007**: `getConversation` returns initial window of 30 messages ordered chronologically.
- **REP-008**: `getConversation` returns `hasMore: true` and `oldestCursor` when thread contains > 30 messages.
- **REP-009**: `getOlderMessages` fetches previous page of messages strictly before `oldestCursor`.
- **REP-010**: `getOlderMessages` returns `hasMore: false` when reaching the beginning of message history.
- **REP-011**: `sendMessage` succeeds for bookings in `CONFIRMED` state.
- **REP-012**: `sendMessage` succeeds for bookings in `IN_PROGRESS` state.
- **REP-013**: `sendMessage` succeeds for bookings in `DISPUTED` state.
- **REP-014**: `sendMessage` throws `ConversationClosedError` when booking is in `COMPLETED` state.
- **REP-015**: `sendMessage` throws `ConversationClosedError` when booking is in `CANCELLED` state.
- **REP-016**: `sendMessage` throws `UnauthorizedError` when caller does not own the booking.
- **REP-017**: `sendMessage` is idempotent: submitting the same `tempId` returns the existing message record without duplicate insertion.
- **REP-018**: `sendMessage` assigns authoritative server ID (`msg_...`), timestamp, and `senderRole`.
- **REP-019**: `markAsRead` updates caller's `lastReadTimestamp` and recalculates `unreadCount = 0`.
- **REP-020**: `markAsRead` does not affect unread status for the opposing participant.
- **REP-021**: `uploadAttachment` returns sanitized CDN `mediaUrl` for valid JPEG/PNG/WEBP files $\le 5$MB.
- **REP-022**: `uploadAttachment` throws `MediaUploadError` if file exceeds 5MB or has invalid MIME type.
- **REP-023**: Reconciles incoming messages from both WebSocket and polling fallback into a unified deduplicated list.
- **REP-024**: Queries `since={latestMessageTimestamp}` upon reconnection and merges missed messages without duplicates.
- **REP-025**: Maintains strict boundary: production repository has zero imports from test harness or fixtures.

---

### Suite 3: Offline Queue & Session Isolation (`lib/messaging/queue.test.ts`)
- **QUE-001**: Appends outbound text message to offline queue when `navigator.onLine === false`.
- **QUE-002**: Rejects photo attachment queueing when offline with explanatory error.
- **QUE-003**: Scopes offline queue strictly to authenticated `userId`: messages queued under User A are inaccessible to User B.
- **QUE-004**: Does not send queued messages if user logs out or switches accounts.
- **QUE-005**: Drains offline queue sequentially in FIFO order when connectivity returns.
- **QUE-006**: Replays messages using `idempotencyKey = tempId` to prevent duplicate persistence.
- **QUE-007**: Re-verifies booking state during replay: invalidates message with `failed` status if booking was `COMPLETED` while offline.
- **QUE-008**: Invalidate message with `failed` status if booking was `CANCELLED` while offline.
- **QUE-009**: Allows user to manually retry a failed queued message.
- **QUE-010**: Allows user to dismiss or delete a failed queued message.

---

### Suite 4: Conversation Hub Component (`components/messages/ConversationHub.test.tsx`)
- **HUB-001**: Renders list of conversation cards sorted by latest message descending.
- **HUB-002**: Displays BrainWorker avatar, full name, verified shield badge, and service title.
- **HUB-003**: Displays booking reference code (e.g. `BBJ-LAG-2026-0891`).
- **HUB-004**: Displays last message snippet with correct sender prefix ("You: ..." or "Emeka: ...").
- **HUB-005**: Displays relative timestamp ("5m ago", "10:30 AM", "Yesterday").
- **HUB-006**: Displays highlighted emerald unread badge matching unread message count.
- **HUB-007**: Renders calm empty state ("No active conversations yet") with "Browse Services" CTA when user has zero conversations.
- **HUB-008**: Filter tabs: filters conversations by "All", "Active Jobs", and "Archived".
- **HUB-009**: Search filter: filters conversation cards matching search query in real time.
- **HUB-010**: Selecting a conversation invokes `onSelectConversation(jobId)`.
- **HUB-011**: Highlights active conversation card in desktop split-pane view.
- **HUB-012**: Renders loading skeleton while conversations are being fetched.

---

### Suite 5: Active Chat & Delivery States (`components/messages/ChatScreen.test.tsx`)
- **CHT-001**: Renders sticky header with worker avatar, name, and booking reference link.
- **CHT-002**: Renders BukieGuarantee escrow trust banner below header.
- **CHT-003**: Displays outgoing customer messages right-aligned in Deep Navy `#001A41` bubbles.
- **CHT-004**: Displays incoming worker messages left-aligned in white bubbles with slate borders.
- **CHT-005**: Renders date separators ("Today", "Yesterday") between messages from different calendar days.
- **CHT-006**: Renders `sending` state with clock icon and reduced opacity.
- **CHT-007**: Renders `sent` state with single checkmark upon server confirmation.
- **CHT-008**: Renders `delivered` state with double checkmark.
- **CHT-009**: Renders `read` state with emerald double checkmark.
- **CHT-010**: Renders `failed` state with red alert icon and "Retry" text button.
- **CHT-011**: Clicking "Retry" on a failed message triggers re-transmission.
- **CHT-012**: Input field auto-expands as user types.
- **CHT-013**: Pressing `Enter` submits the message; `Shift + Enter` inserts a newline.
- **CHT-014**: Submit button is disabled when input is empty or only whitespace.
- **CHT-015**: Displays character counter when comment exceeds 1,500 characters (`X / 2,000`).
- **CHT-016**: Read-only composer: replaces textarea with calm notice when booking is `COMPLETED`.
- **CHT-017**: Read-only composer: replaces textarea with calm notice when booking is `CANCELLED`.
- **CHT-018**: Displays connection status pill when running in polling fallback mode.
- **CHT-019**: Screen reader announcements: announces new incoming messages via `aria-live="polite"`.
- **CHT-020**: Retains focus in textarea after sending message.

---

### Suite 6: Media Attachment & Lightbox (`components/messages/MediaUploadStaging.test.tsx`)
- **MED-001**: Clicking camera icon triggers native file picker.
- **MED-002**: Selecting valid image displays thumbnail preview with upload progress bar.
- **MED-003**: Clicking cancel `X` button aborts in-flight upload via `AbortController`.
- **MED-004**: Rejects files larger than 5MB with inline error: "Photo exceeds 5MB limit."
- **MED-005**: Rejects non-image files with inline error: "Only JPEG, PNG, and WEBP photos are supported."
- **MED-006**: Disables photo upload when offline and shows toast notification.
- **MED-007**: Renders uploaded image message as aspect-ratio constrained photo card.
- **MED-008**: Clicking photo card opens accessible full-screen image lightbox with Escape key dismissal.

---

### Suite 7: Location Sharing Modal & Card (`components/messages/LocationShareModal.test.tsx`)
- **LOC-001**: Clicking map pin icon opens Location Confirmation modal.
- **LOC-002**: Modal pre-fills street address, landmark, and city from booking record.
- **LOC-003**: Cancelling modal dismisses without sending and returns focus to trigger.
- **LOC-004**: Confirming modal dispatches structured `contentType: 'location'` payload.
- **LOC-005**: Chat timeline renders Location Card with landmark, street address, and Google Maps button.
- **LOC-006**: "Open in Google Maps" link formats strictly as `https://maps.google.com/?q={lat},{lng}` with `rel="noopener noreferrer"`.
- **LOC-007**: Disallows automated background location transmission without user confirmation.
- **LOC-008**: Modal traps focus and closes on Escape key press.

---

### Suite 8 & 9: Surface & Route Integration (`app/messages/`)
- **INT-001**: `/messages` renders conversation hub for authenticated customer.
- **INT-002**: `/messages` redirects unauthenticated visitor to `/login`.
- **INT-003**: `/messages/[jobId]` renders active chat for authorized customer.
- **INT-004**: `/messages/[jobId]` throws/renders fail-closed error if caller does not own booking.
- **INT-005**: Navigation "Messages" button links directly to `/messages` route (retires "Coming soon" dialog).
- **INT-006**: Dashboard "Messages" link navigates directly to `/messages`.
- **INT-007**: Lifecycle receipt and re-book links remain strictly decoupled from messaging state.

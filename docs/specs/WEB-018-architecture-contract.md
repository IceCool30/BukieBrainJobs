# Spec: WEB-018 Notification Center & Push UX Architecture Contract (v1.0)

| Field | Value |
|---|---|
| **Document ID** | WEB-018-ARCH |
| **Feature** | Notification Center & Push UX |
| **Status** | 🟡 Proposed for Architecture Approval (v1.0) |
| **Version** | 1.0 |
| **Workstream** | Phase 1: Customer Web Platform Completion |
| **Governing Loop** | Mr. Solomon 9-Command Engineering Loop (`/architect`) |
| **Scope Contract** | WEB-018 Scope & Product Contract v1.0 |
| **Target Surfaces** | `/notifications` (Notification Feed Hub), Navigation Bell Triggers, `/profile?tab=notifications` |
| **Date** | 2026-09-23 |

---

## 1. Architectural Doctrine & Boundary Invariants

WEB-018 establishes the architectural contract for the customer-facing notification center and push notification experience in BukieBrainJobs.

### Core Architectural Doctrine

> **1. Authoritative notification state originates from domain events, not client manufacturing.**
>
> The frontend may request and present notification state, but it must not manufacture authoritative notification events or claim that an external event occurred. All notifications represent real domain transitions (job bookings, messages, escrow milestones, security alerts).
>
> **2. The transport and delivery mechanism sits behind the repository.**
>
> UI components consume an abstract `INotificationRepository` and reactive hook (`useNotifications`). They do not know or care whether a notification was fetched over HTTP, pushed through WebSockets, replayed from an offline cache, or triggered via a browser push event.
>
> **3. Strict customer session isolation.**
>
> Notifications are strictly partitioned by authenticated `recipientId`. No customer can query, mark as read, or dismiss another customer's notifications.
>
> **4. Physical production/testing boundary isolation.**
>
> Production repository modules must have zero imports from testing modules or fixture stores. Test fixtures and state manipulation controls sit exclusively in `lib/notifications/testing/`.

---

## 2. Domain Data Model & Types

All types align with `packages/api-types` and the Prisma schema while introducing explicit client categories, query options, and push permission contracts.

### 2.1 Domain Enums & Primitives

```typescript
export type NotificationCategory = 'all' | 'bookings' | 'messages_payments' | 'account';

export type NotificationType =
  | 'JOB_CONFIRMED'
  | 'JOB_STARTED'
  | 'JOB_COMPLETED'
  | 'JOB_CANCELLED'
  | 'MESSAGE_RECEIVED'
  | 'PAYMENT_CONFIRMED'
  | 'PAYMENT_RELEASED'
  | 'PAYMENT_REFUNDED'
  | 'REVIEW_REQUESTED'
  | 'SECURITY_ALERT'
  | 'VERIFICATION_COMPLETE'
  | 'SYSTEM';

export type PushPermissionState = 'default' | 'granted' | 'denied' | 'unsupported';
```

### 2.2 Category Mapping Invariant

Every `NotificationType` deterministically maps to exactly one UI category (excluding the universal `'all'` view):

| Notification Type | Category | Description |
|---|---|---|
| `JOB_CONFIRMED` | `bookings` | Artisan assigned, schedule confirmed, escrow funded |
| `JOB_STARTED` | `bookings` | Artisan departed, arrived, or work in progress |
| `JOB_COMPLETED` | `bookings` | Artisan completed work, awaiting customer inspection |
| `JOB_CANCELLED` | `bookings` | Booking cancelled by customer or artisan |
| `MESSAGE_RECEIVED` | `messages_payments` | New direct chat message in active job conversation |
| `PAYMENT_CONFIRMED` | `messages_payments` | Escrow deposit verified and secured |
| `PAYMENT_RELEASED` | `messages_payments` | Escrow payout released to artisan |
| `PAYMENT_REFUNDED` | `messages_payments` | Customer refund approved and processed |
| `REVIEW_REQUESTED` | `account` | Completed job prompt to rate and review artisan |
| `SECURITY_ALERT` | `account` | Password updated, unrecognized login, session change |
| `VERIFICATION_COMPLETE` | `account` | Customer phone or profile verification confirmed |
| `SYSTEM` | `account` | Platform policy update or scheduled maintenance notice |

### 2.3 Authoritative Customer Notification Record (`CustomerNotification`)

```typescript
export interface CustomerNotification {
  id: string;                      // Server-assigned authoritative ID (UUID)
  recipientId: string;             // Authenticated customer user ID
  type: NotificationType;          // Domain event type
  category: 'bookings' | 'messages_payments' | 'account';
  title: string;                   // Concise headline (max 100 chars)
  message: string;                 // Plain-language notification body (max 500 chars)
  isRead: boolean;                 // Read status
  createdAt: string;               // ISO 8601 creation timestamp
  readAt?: string | null;          // ISO 8601 timestamp when marked read
  targetUrl?: string | null;       // Safe internal relative path (e.g. /jobs?id=job-123)
  referenceCode?: string | null;   // Human-readable reference code (e.g. BBJ-LAG-2026-0891)
  metadata?: Record<string, unknown> | null;
}
```

### 2.4 Query Options & Result Models

```typescript
export interface NotificationQueryOptions {
  category?: NotificationCategory;
  unreadOnly?: boolean;
  limit?: number;
  cursor?: string;
}

export interface NotificationQueryResult {
  items: CustomerNotification[];
  unreadCount: number;
  categoryCounts: {
    all: number;
    bookings: number;
    messages_payments: number;
    account: number;
  };
  hasMore: boolean;
  nextCursor?: string | null;
  isCached?: boolean;
}
```

---

## 3. Repository Contract: `INotificationRepository`

The core contract defines authoritative queries and customer-authorized mutations. Frontend callers have zero access to creation or event manufacturing methods.

```typescript
export interface INotificationRepository {
  /**
   * Fetches notifications for the authenticated customer with category and unread filtering.
   * Fails closed if customerId is missing or does not match active session.
   */
  getNotifications(
    customerId: string,
    options?: NotificationQueryOptions
  ): Promise<NotificationQueryResult>;

  /**
   * Returns total unread notification count for the authenticated customer.
   */
  getUnreadCount(customerId: string): Promise<number>;

  /**
   * Marks a single notification as read.
   * Rejects if notification does not exist or does not belong to customerId.
   */
  markAsRead(customerId: string, notificationId: string): Promise<CustomerNotification>;

  /**
   * Marks all unread notifications (optionally scoped to a category) as read.
   * Returns the count of mutated records.
   */
  markAllAsRead(customerId: string, category?: NotificationCategory): Promise<{ count: number }>;

  /**
   * Soft-dismisses a notification from the feed.
   */
  dismiss(customerId: string, notificationId: string): Promise<void>;

  /**
   * Subscribes to real-time notification updates for the active customer.
   * Returns an unsubscribe cleanup function.
   */
  subscribe(
    customerId: string,
    listener: (notification: CustomerNotification) => void
  ): () => void;
}
```

---

## 4. Production vs Testing Boundary & Physical Module Isolation

Adhering strictly to the architectural standards proved in WEB-015 and WEB-017:

```
apps/web/lib/notifications/
├── types.ts                     # Authoritative domain types, interfaces, enums
├── repository.ts                # Production NotificationRepository implementing INotificationRepository
├── deep-link.ts                 # Sanitized deep-link resolver
├── push-adapter.ts              # Browser Push API adapter
├── index.ts                     # Production barrel (zero imports from ./testing/)
└── testing/
    ├── store.ts                 # NotificationInternalStore (in-memory state container)
    ├── controller.ts            # NotificationTestController (seed, dispatchEvent, clear, setOffline)
    └── harness.ts               # Isolated test repository factory and mock fixtures
```

### Invariant Rules:
1. `apps/web/lib/notifications/repository.ts` must **never** import from `./testing` or `/testing`.
2. `apps/web/lib/notifications/index.ts` exports **strictly**:
   - `NotificationRepository`
   - `getNotificationRepository`
   - `createNotificationRepository`
   - `resolveNotificationDeepLink`
   - `BrowserPushAdapter`
   - `getBrowserPushAdapter`
   - Domain types from `types.ts`
3. Any test fixture manipulation, mock event dispatching, or offline simulation must import exclusively from `@/lib/notifications/testing/harness`.
4. Automated lint and boundary regression tests will assert that `repository.ts` contains 0 occurrences of `./testing` or `/testing`.

---

## 5. Notification Event Creation & Integration Boundary

To prevent the frontend from becoming an unverified event factory:

1. **Frontend Non-Creation Invariant**:
   `INotificationRepository` contains **zero** `createNotification()`, `addNotification()`, or `emitEvent()` methods.
2. **Domain Event Dispatching**:
   In Phase 1, deterministic mock notifications are seeded at initialization by `testing/harness.ts` representing pre-existing job lifecycle, payment, and message events.
3. **Simulated Backend Triggers**:
   When tests need to simulate an incoming alert (e.g. BrainWorker arrived on site while customer is viewing notifications), they interact with `NotificationTestController.dispatchDomainEvent(event)` inside `testing/`, never through the production repository interface.
4. **Phase 5 Production Backend Integration**:
   In Phase 5, the internal store in `NotificationRepository` is replaced with standard REST endpoints (`GET /api/notifications`, `PATCH /api/notifications/:id/read`) and the existing Socket cluster in `services/socket-server`. Zero UI components will require code changes.

---

## 6. Deep-Link Resolver & Sanitization Contract

Notifications guide users to specific app destinations. To prevent open-redirect vulnerabilities, malformed routes, or access leakage:

### 6.1 Resolver Implementation: `resolveNotificationDeepLink`

```typescript
export function resolveNotificationDeepLink(notification: CustomerNotification): string {
  // 1. Explicit internal path check
  if (notification.targetUrl && isValidInternalPath(notification.targetUrl)) {
    return notification.targetUrl;
  }

  // 2. Type-driven canonical fallback
  switch (notification.type) {
    case 'JOB_CONFIRMED':
    case 'JOB_STARTED':
    case 'JOB_COMPLETED':
    case 'JOB_CANCELLED':
    case 'REVIEW_REQUESTED':
      return notification.metadata?.jobId
        ? `/jobs?id=${encodeURIComponent(String(notification.metadata.jobId))}`
        : '/jobs';

    case 'MESSAGE_RECEIVED':
      return notification.metadata?.jobId
        ? `/messages/${encodeURIComponent(String(notification.metadata.jobId))}`
        : '/messages';

    case 'PAYMENT_CONFIRMED':
    case 'PAYMENT_RELEASED':
    case 'PAYMENT_REFUNDED':
      return notification.metadata?.bookingId
        ? `/receipt/${encodeURIComponent(String(notification.metadata.bookingId))}`
        : '/jobs';

    case 'SECURITY_ALERT':
      return '/profile?tab=security';

    case 'VERIFICATION_COMPLETE':
      return '/profile?tab=personal';

    case 'SYSTEM':
    default:
      return '/notifications';
  }
}
```

### 6.2 Sanitization Rules
1. `targetUrl` must begin with a single `/`.
2. `targetUrl` must not begin with `//` (protocol-relative URL) or contain `:` before the first `/` (scheme attack).
3. Any string matching `javascript:`, `data:`, `vbscript:`, or containing unencoded control characters fails sanitization and falls back to `/notifications`.

---

## 7. Customer Session Isolation & Fail-Closed Rules

1. **Authentication Requirement**:
   Accessing `/notifications` without an active session immediately halts and redirects: `router.replace('/login?redirect=/notifications')`.
2. **Customer ID Ownership**:
   All repository calls take `customerId`. The repository compares `customerId` against the authenticated session user ID. Mismatch immediately rejects with `[UnauthorizedError: Caller cannot access foreign customer notifications]`.
3. **Record-Level Ownership**:
   When calling `markAsRead(customerId, notificationId)` or `dismiss(customerId, notificationId)`, the repository verifies `record.recipientId === customerId`. If the notification belongs to another user, mutation fails closed.

---

## 8. Optimistic Read Mutation & Reconciliation

To maintain high UI responsiveness on variable mobile networks:

1. **Optimistic Local Update**:
   When the user clicks a notification or "Mark all as read":
   - The UI immediately toggles `isRead = true` and updates `readAt = new Date().toISOString()`.
   - The unread badge counter decrements synchronously.
2. **Repository Mutation Dispatch**:
   - The repository asynchronously persists the state change.
3. **Reconciliation on Failure**:
   - If the network request fails (e.g. connection drops), the UI rolls back the optimistic state change and displays a non-blocking toast: "Could not update notification status. Tap to retry."

---

## 9. Offline & Cache Boundary

1. **Client Snapshot Caching**:
   `NotificationRepository` maintains an in-memory snapshot of the latest query results.
2. **Offline Detection**:
   When `typeof navigator !== 'undefined' && !navigator.onLine`:
   - `getNotifications` returns the cached snapshot immediately with `isCached: true`.
   - The UI renders the calm offline banner.
3. **Offline Mutation Invariant**:
   - Read mutations during offline state are stored in a transient optimistic client queue.
   - When the browser fires the `online` event, the queue flushes to the repository and a silent background re-fetch reconciles true unread counts.

---

## 10. Web Push Capability & Permission Adapter

Web Push is abstracted behind `IPushNotificationAdapter` to decouple browser APIs from UI components and simplify testing.

### 10.1 Interface: `IPushNotificationAdapter`

```typescript
export interface IPushNotificationAdapter {
  isSupported(): boolean;
  getPermission(): PushPermissionState;
  requestPermission(): Promise<PushPermissionState>;
  sendTestAlert?(title: string, body: string): Promise<boolean>;
}
```

### 10.2 Browser Implementation: `BrowserPushAdapter`
- Checks `typeof window !== 'undefined' && 'Notification' in window`.
- Returns `'unsupported'` on server render, webviews without notification APIs, or disabled browser contexts.
- Wraps `Notification.permission` (`'default'`, `'granted'`, `'denied'`).
- `requestPermission()` invokes `window.Notification.requestPermission()`.
- Sandbox test alert utilizes `new window.Notification(title, { body, icon: '/favicon.ico' })` when permission is `'granted'`.

### 10.3 Testing Adapter: `MockPushAdapter`
- Provides deterministic permission switching (`setPermission('granted')`, `setPermission('denied')`) without prompting native OS dialogs during Vitest execution.

---

## 11. Failure, Degraded State & Replacement Strategy

| Failure Scenario | System Behavior | Recovery Action |
|---|---|---|
| Initial fetch failure | Renders accessible error card with retry button | Click "Retry" or auto-retry on reconnect |
| Repository timeout | Calm loading state times out after 10s with fallback message | "Taking longer than usual. Retry connection." |
| Push API unsupported | Push banner is omitted cleanly from UI | In-app feed operates 100% normally |
| Push API permission denied | Educational banner explains browser site settings | User can re-enable in browser preferences |
| Deep-link target resource deleted | Target route renders its own fail-closed 404/not-found card | Return button back to `/notifications` |
| Malformed notification payload | Skipped during rendering; warning logged in non-production | Feed renders remaining valid records |

---

## 12. Verification & Regression Strategy

1. **Unit Tests (`repository.test.ts`)**:
   - Customer isolation (rejects foreign customer queries and mutations).
   - Category filtering accuracy across all 12 notification types.
   - Unread count calculation and category count breakdown.
   - Single and batch "Mark as Read" behavior.
   - Physical boundary assertion: 0 imports from `./testing` or `/testing`.
2. **Deep-Link Tests (`deep-link.test.ts`)**:
   - Canonical routing for all 12 types.
   - Open-redirect prevention (rejects `http://`, `//`, `javascript:`).
   - Malformed URL fallback to `/notifications`.
3. **Push Adapter Tests (`push-adapter.test.ts`)**:
   - State handling across `default`, `granted`, `denied`, `unsupported`.
   - Non-aggressive invocation rule verification.
4. **Component Tests (`NotificationCenter.test.tsx`)**:
   - Tab switching and empty states per category.
   - Unread badge decrement on click and mark-all-read.
   - Offline banner display and optimistic mutation.
   - Accessible keyboard navigation and screen reader announcements.

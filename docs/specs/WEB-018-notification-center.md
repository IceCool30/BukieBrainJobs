# Spec: WEB-018 Notification Center & Push UX Scope and Product Contract (v1.0)

| Field | Value |
|---|---|
| **Document ID** | WEB-018-SCOPE |
| **Feature** | Notification Center & Push UX |
| **Status** | 🟡 Proposed for Scope Approval (v1.0) |
| **Version** | 1.0 |
| **Workstream** | Phase 1: Customer Web Platform Completion |
| **Governing Loop** | Mr. Solomon 9-Command Engineering Loop (`/scope`) |
| **Target Surfaces** | `/notifications` (Notification Feed Hub), Navigation Bell Triggers, `/profile?tab=notifications` (Channel Preferences) |
| **Date** | 2026-09-23 |

---

## 1. Executive Summary & Core Doctrine

WEB-018 establishes the notification system for the BukieBrainJobs customer web platform. It completes the final slice of Phase 1 (Customer Web Platform Completion), replacing the temporary "Notifications Coming Soon" dialog in header navigation and mobile bottom bars with an authenticated notification center at `/notifications`. 

Customers receive timely, categorized operational alerts when an artisan accepts a booking, sends a message, arrives on site, requests a scope review, or completes a job. In addition to in-app alerts, WEB-018 provides contextual Web Push notification opt-in, offline cached notification access, and deep-link routing into active jobs, messages, receipts, and security settings.

### Core Doctrine

> **Notifications communicate operational changes, not advertising noise.**
>
> Every notification exists to inform a user about an authoritative state transition in their booking, message thread, payment escrow, or account security. The notification feed does not manufacture events; it projects real domain changes. All notifications are strictly isolated to the authenticated recipient and fail closed on unauthorized inspection.

### 1.2 Explicit Non-Scope for WEB-018

To preserve architectural boundaries and maintain delivery discipline, the following items are deliberately excluded from WEB-018:

1. **SMS Gateway & Telephony Delivery**: Real SMS dispatch through Termii or Twilio is deferred to Phase 5 (Backend Integration).
2. **WhatsApp Business API Delivery**: Automated WhatsApp dispatch is deferred to Phase 5.
3. **Email SMTP / Transactional Dispatch**: Real SES or SendGrid email transport is deferred to Phase 5.
4. **Native Mobile Push (APNs / FCM)**: Native iOS and Android push pipelines belong to Phase 4 (`apps/mobile`).
5. **BrainWorker Dispatch Inbox**: Artisan lead feeds and invitation responses belong to Phase 2 (`BW-001`, `BW-002`).
6. **Marketing Campaign Engines**: Bulk promotional blasts, newsletter signups, and marketing email builders are excluded.
7. **Custom Sound Chimes**: Audio asset playback on incoming notifications is excluded.
8. **In-Notification Interactive Mutations**: Direct inline booking approval or inline chat replies inside notification cards are excluded. Notifications inform and deep-link; mutations happen on the dedicated target screens.

---

## 2. Notification Center Surface & Architecture

### 2.1 Route & Entry Points

- **Primary Route**: `/notifications`
- **Navigation Bell Triggers**:
  - Desktop Header: Notification bell button in top bar displaying an unread badge counter.
  - Mobile Bottom Navigation: Replaces "Notifications Coming Soon" modal trigger in `ProfileNavigation.tsx`, `JobsNavigation.tsx`, and `DashboardScreen.tsx`.
- **Deep-Link Return Target**: Preserves return context when returning to the source activity.

### 2.2 Category Model & Tab Filtering

The notification center organizes alerts into four distinct tabs:

1. **All** (`category: 'all'`): Unified chronological feed of all customer notifications.
2. **Bookings** (`category: 'bookings'`): Job request lifecycle updates:
   - Artisan assigned / booking confirmed (`JOB_CONFIRMED`)
   - Artisan dispatched / arrived / started (`JOB_STARTED`)
   - Job completed by artisan / awaiting inspection (`JOB_COMPLETED`)
   - Booking cancelled (`JOB_CANCELLED`)
3. **Messages & Payments** (`category: 'messages_payments'`):
   - New message received in active job thread (`MESSAGE_RECEIVED`)
   - Escrow funded confirmation (`PAYMENT_CONFIRMED`)
   - Escrow payout released (`PAYMENT_RELEASED`)
   - Refund approved / processed (`PAYMENT_REFUNDED`)
4. **Account & Security** (`category: 'account'`):
   - Phone or identity verification status update (`VERIFICATION_COMPLETE`)
   - Password updated or active session alert (`SECURITY_ALERT`)
   - Review prompt on completed booking (`REVIEW_REQUESTED`)
   - System policy or maintenance alert (`SYSTEM`)

### 2.3 Notification Data Contract

Aligning with `packages/api-types` and the Prisma schema:

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

export interface CustomerNotification {
  id: string;
  recipientId: string;
  type: NotificationType;
  category: 'bookings' | 'messages_payments' | 'account';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;       // ISO 8601
  readAt?: string | null;  // ISO 8601
  targetUrl?: string;      // Safe internal relative path
  referenceCode?: string;  // e.g. BBJ-LAG-2026-0891
  metadata?: Record<string, unknown>;
}
```

### 2.4 Unread & Read State Machine

- **Initial State**: Notifications created with `isRead: false` and `readAt: null`.
- **Mark As Read (Single)**:
  - Triggered when the customer clicks a notification card or the explicit mark-read button.
  - Updates `isRead: true` and sets `readAt` to current timestamp.
  - Optimistic client update with repository persistence.
- **Mark All As Read**:
  - Global action button in header of `/notifications`.
  - Mutates all unread items belonging to the active customer to `isRead: true`.
  - Decrements global unread counter to 0.
- **Visual Presentation**:
  - Unread items display a subtle emerald indicator dot, high-contrast title typography, and a distinct tinted card surface.
  - Read items render with standard body weight and subdued timestamp.

---

## 3. Deep-Link Navigation & Sanitization

### 3.1 Target URL Mapping Invariants

Notifications direct users straight to the relevant product surface:

| Notification Type | Target URL Pattern | Destination |
|---|---|---|
| `JOB_CONFIRMED` | `/jobs?id={jobId}` | Jobs Activity Hub: Confirmed Booking Detail |
| `JOB_STARTED` | `/jobs?id={jobId}` | Jobs Activity Hub: In-Progress Tracker |
| `JOB_COMPLETED` | `/jobs?id={jobId}` | Jobs Activity Hub: Inspection & Review Prompt |
| `JOB_CANCELLED` | `/jobs?id={jobId}` | Jobs Activity Hub: Cancelled Summary |
| `MESSAGE_RECEIVED` | `/messages/{jobId}` | Active Job Chat Screen |
| `PAYMENT_CONFIRMED` | `/receipt/{bookingId}` | Official Digital Escrow Receipt |
| `PAYMENT_RELEASED` | `/receipt/{bookingId}` | Official Digital Settled Receipt |
| `PAYMENT_REFUNDED` | `/receipt/{bookingId}` | Official Refund Confirmation Receipt |
| `REVIEW_REQUESTED` | `/jobs?id={jobId}` | Completed Booking with Review Modal Trigger |
| `SECURITY_ALERT` | `/profile?tab=security` | Security Settings & Active Sessions |
| `VERIFICATION_COMPLETE` | `/profile?tab=personal` | Profile Personal Verification Status |
| `SYSTEM` | `/notifications` | Notification Feed Self-Reference |

### 3.2 URL Sanitization & Open-Redirect Defense

- **Internal Path Enforcement**: All `targetUrl` strings must start with `/` and must not contain `//`, `http:`, `https:`, or `javascript:`.
- **Fail-Safe Fallback**: Any malformed, external, or unauthorized target URL falls back safely to `/notifications`.
- **Session Validation**: Clicking a deep link verifies that the customer owns the target resource before navigating. If access is rejected, the app renders the appropriate fail-closed error surface rather than leaking private job or message details.

---

## 4. Web Push Notification UX & Permission State Model

### 4.1 Permission State Matrix

WEB-018 interacts with browser push capabilities using standard Service Worker and Notification APIs:

| Browser Permission | Notification Center Presentation | User Action |
|---|---|---|
| `default` (Unprompted) | Opt-in promotional banner: "Turn on browser push alerts to know immediately when your BrainWorker messages or arrives." | "Enable Notifications" button triggers native browser permission dialog. |
| `granted` (Allowed) | Status pill: "Push alerts active". Option to send a test notification in sandbox. | Push active; new messages or job updates trigger browser alerts. |
| `denied` (Blocked) | Informational banner: "Browser push notifications are blocked. To receive instant alerts, enable permissions in your browser address bar." | Explanatory instructions without repeated native popups. |
| `unsupported` | Banner and push controls are omitted cleanly. | Feed operates purely in-app without errors. |

### 4.2 Non-Aggressive Prompting Invariant

- The native `Notification.requestPermission()` prompt is **never** invoked on initial page load or route transition.
- Browser permissions must only be requested following an explicit customer click on the "Enable Notifications" button in `/notifications` or `/profile?tab=notifications`.

---

## 5. Offline & Network Resilience

### 5.1 Offline Feed Presentation

- **Cached Reads**: Previously loaded notifications remain fully readable when offline (`navigator.onLine === false`).
- **Offline Banner**: Prominent calm banner: "Offline: Viewing cached notifications. Real-time alerts will resume when connection is restored."
- **Disabled Actions**: Push subscription toggles are disabled while offline.
- **Queued / Optimistic Read Transitions**: Marking notifications as read offline updates the local client cache optimistically, synchronizing to the repository when network connectivity returns.

### 5.2 Browser Reconnection

- Reconnecting triggers an automatic background check for new notifications without requiring a full manual browser refresh.

---

## 6. Security, Privacy & Authorization Invariants

1. **Strict Customer Isolation**: Every repository method requires the authenticated customer identifier. The repository guarantees that user A cannot inspect, mark as read, or delete notifications belonging to user B.
2. **Zero Sensitive Payment Credentials**: Notifications must never include Bank Verification Numbers (BVN), credit card digits, account passwords, or full customer billing addresses in notification titles or messages.
3. **State Honesty**: Notifications report real status changes. The system must never manufacture synthetic promo alerts ("A worker is looking at your job right now!") that do not correspond to verified database records.
4. **Production Repository Boundary**: Production repository modules must not import from test harnesses or mock stores. Exactly as established in WEB-015 and WEB-017, testing controllers must live in isolated test paths.

---

## 7. Accessibility & Motion Standards

1. **Semantic Navigation**: The category selector uses an accessible ARIA tablist pattern (`role="tablist"`, `role="tab"`, `aria-selected`, `aria-controls`, `role="tabpanel"`).
2. **Live Announcements**: Unread count changes and "Mark all as read" confirmations announce politely to screen readers (`aria-live="polite"`).
3. **Contrast Compliance**: Notification titles (navy-900), body text (slate-600), unread badges (emerald-700 on emerald-50), and alert tags meet WCAG 2.1 AA 4.5:1 contrast ratios.
4. **Touch Target Sizing**: All interactive touch targets (cards, mark-as-read buttons, category tabs) maintain a minimum of 44x44px.
5. **Reduced Motion**: All badge transitions, tab switches, and notification item entrance animations honor `prefers-reduced-motion: reduce`.

---

## 8. Catalog of UI States for `/notifications`

The `/notifications` surface must deterministically handle six core visual states:

1. **First-Run Empty State**: When a user has zero notifications across all time.
   - Headline: "No notifications yet"
   - Body: "When you book a service, updates on artisan arrival, job progress, messages, and payments will appear here."
   - CTA: "Browse Services" -> `/services`
2. **Filtered Category Empty State**: When a category has zero items (e.g. no payment alerts yet).
   - Headline: "No {Category} notifications"
   - Body: "You do not have any notifications in this section."
   - CTA: "View All Notifications"
3. **Loading Skeleton State**: Accessible animated shimmer cards preserving layout stability while data loads.
4. **Active Feed with Unread Items**: Populated feed with distinct unread visual treatments and category filter tabs.
5. **Offline Read-Only State**: Prominent banner indicating cached data; mutation buttons guarded.
6. **Unauthorized / Unauthenticated State**: Visitors without an active session redirect cleanly to `/login?redirect=/notifications`.

---

## 9. Success Verification Criteria

WEB-018 will be considered complete when:

1. `/notifications` is fully routed and navigable in Next.js 15 App Router.
2. Header bell icons and mobile navigation bars display real unread counts and route directly to `/notifications`.
3. Category tabs (All, Bookings, Messages & Payments, Account) filter items deterministically.
4. Individual "Mark as Read" and global "Mark All as Read" actions mutate state cleanly.
5. Notification cards deep-link safely to active jobs, messages, receipts, and profile tabs.
6. Web Push permission lifecycle (default, granted, denied, unsupported) is contextually handled without aggressive prompts.
7. Obsolete "Notifications Coming Soon" dialogs are retired across navigation components.
8. Full test suite covers repository operations, component interactions, category filtering, unread calculations, deep-link routing, and accessibility.
9. 0 TypeScript errors, 0 ESLint warnings, production build exports all routes cleanly.
10. Vercel deployment preview verified live with HTTP 200 on `/notifications`.

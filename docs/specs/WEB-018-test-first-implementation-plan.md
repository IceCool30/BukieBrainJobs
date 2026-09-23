# Test-First Implementation Plan: WEB-018 Notification Center & Push UX (v1.0)

| Field | Value |
|---|---|
| **Document ID** | WEB-018-TEST |
| **Feature** | Notification Center & Push UX |
| **Status** | 🟡 Proposed for Test-First Approval (v1.0) |
| **Version** | 1.0 |
| **Workstream** | Phase 1: Customer Web Platform Completion |
| **Governing Loop** | Mr. Solomon 9-Command Engineering Loop (`/develop` & `/test` Gate) |
| **Activated Skill** | `agent-skills-test-driven-development` |
| **Prerequisites** | Scope v1.0 (Approved), Architecture v1.0 (Approved), UX v1.0 (Approved) |
| **Date** | 2026-09-23 |

---

## 1. Executive Summary & TDD Doctrine

This document establishes the strict Test-Driven Development (TDD) protocol for **WEB-018: Notification Center & Push UX**. In accordance with the project's engineering loop and `agent-skills-test-driven-development`:

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

## 2. Authoritative vs Client-Derived State Distinction

To guarantee that future backend integration cannot accidentally move presentation logic into the domain contract, all tests explicitly enforce the separation between authoritative domain state and client-derived presentation state:

```
Authoritative Domain State (Server / Repository Record)
├── id (server-assigned UUID)
├── recipientId (customer user ID)
├── type (NotificationType)
├── createdAt (ISO 8601 string)
├── isRead (boolean)
├── readAt (ISO 8601 string or null)
├── referenceCode (booking reference code)
├── targetUrl (optional relative path)
└── metadata (authoritative event context, e.g. jobId, bookingId)

Client-Derived Presentation State (UI / Adapter Layer)
├── activeCategory (filter tab selection: 'all' | 'bookings' | 'messages_payments' | 'account')
├── filteredItems (derived subset for active category)
├── displayedUnreadCount (optimistic counter badge)
├── optimisticReadMap (pending local mutations awaiting server ACK)
├── pushPermissionState (browser capability: 'default' | 'granted' | 'denied' | 'unsupported')
├── isCached / isOffline (network detection and snapshot display)
└── resolvedDeepLink (sanitized internal routing destination)
```

### Invariant Rules
1. Domain records stored in the repository never hold client presentation properties (`activeCategory`, `isCached`, `resolvedDeepLink`).
2. Client presentation components derive counts and category membership dynamically from the authoritative records.
3. Optimistic read mutations are strictly transient and reconcile against repository responses.

---

## 3. Test Suite Architecture & File Layout

Eight dedicated test suites will provide automated coverage across domain validation, repository authorization, deep-link sanitization, push adapters, UI components, accessibility, and surface routing:

```
BukieBrainJobs/apps/web/
├── lib/notifications/
│   ├── types.test.ts                  # Suite 1: Domain types, category mapping, authoritative vs presentation state
│   ├── deep-link.test.ts              # Suite 2: Deep-link resolver, canonical fallbacks, open-redirect defense
│   ├── repository.test.ts             # Suite 3: Repository contract, customer isolation, unread count, physical boundary
│   └── push-adapter.test.ts           # Suite 4: Push capability adapter, 4 permission states, non-aggressive prompt rule
├── components/notifications/
│   ├── NotificationCenter.test.tsx    # Suite 5: Feed rendering, category tabs, mark-all-as-read, live regions
│   ├── NotificationCard.test.tsx      # Suite 6: Card anatomy, category icons, read/unread hierarchy, optimistic click
│   └── NotificationStates.test.tsx    # Suite 7: Empty states, loading skeleton, offline banner, error retry, push banner
└── app/notifications/
    └── NotificationsPage.test.tsx     # Suite 8: Route integration, auth redirect, bell badge, placeholder retirement
```

---

## 4. Seven-Phase RED-GREEN-REFACTOR Implementation Sequence

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Phase 1: Domain Types, Category Mapping & Deep-Link Resolver (TDD)         │
│ ├── RED: Write lib/notifications/types.test.ts & deep-link.test.ts          │
│ ├── GREEN: Implement lib/notifications/types.ts & deep-link.ts              │
│ └── REFACTOR: Verify open-redirect sanitization and category purity         │
├─────────────────────────────────────────────────────────────────────────────┤
│ Phase 2: Notification Repository & Boundary Isolation (TDD)                 │
│ ├── RED: Write lib/notifications/repository.test.ts                         │
│ ├── Create testing harness in lib/notifications/testing/                    │
│ ├── GREEN: Implement lib/notifications/repository.ts & index.ts             │
│ └── REFACTOR: Assert 0 imports from testing/ in production repository       │
├─────────────────────────────────────────────────────────────────────────────┤
│ Phase 3: Web Push Capability Adapter (TDD)                                  │
│ ├── RED: Write lib/notifications/push-adapter.test.ts                       │
│ ├── GREEN: Implement lib/notifications/push-adapter.ts                      │
│ └── REFACTOR: Verify non-aggressive permission request invariant            │
├─────────────────────────────────────────────────────────────────────────────┤
│ Phase 4: Notification Center Feed & Category Tabs (TDD)                     │
│ ├── RED: Write components/notifications/NotificationCenter.test.tsx         │
│ ├── GREEN: Implement NotificationCenter, CategoryTabs, MarkAllReadButton   │
│ └── REFACTOR: Polish ARIA tablist accessibility and live announcements      │
├─────────────────────────────────────────────────────────────────────────────┤
│ Phase 5: Notification Card Anatomy & Deterministic States (TDD)             │
│ ├── RED: Write NotificationCard.test.tsx & NotificationStates.test.tsx      │
│ ├── GREEN: Implement NotificationCard, PushBanner, EmptyStates, Skeleton   │
│ └── REFACTOR: Polish touch targets (>=44px), contrast, reduced-motion       │
├─────────────────────────────────────────────────────────────────────────────┤
│ Phase 6: Route Integration, Bell Badge & Placeholder Retirement (TDD)       │
│ ├── RED: Write app/notifications/NotificationsPage.test.tsx                 │
│ ├── GREEN: Implement app/notifications/page.tsx, wire nav bell badges,      │
│ │   retire "Notifications coming soon" in Dashboard, Profile, Jobs nav      │
│ └── REFACTOR: Ensure clean auth redirect and static prerender safety        │
├─────────────────────────────────────────────────────────────────────────────┤
│ Phase 7: Cloud Verification, Vercel Audit & Production Sign-Off             │
│ ├── VERIFY: Full regression (816 baseline + WEB-018 suites) on Codespace    │
│ ├── VERIFY: TypeScript (0 errors), Lint (0 warnings), Next.js Build (32/32) │
│ ├── DEPLOY: Vercel preview verification (HTTP 200 on /notifications)        │
│ └── AUDIT: Independent audit against all scope and architecture invariants   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Detailed Test Catalog (Assertion Invariants)

### Suite 1: Domain Types & Category Mapping (`lib/notifications/types.test.ts`)
- **TYP-001**: Maps `JOB_CONFIRMED`, `JOB_STARTED`, `JOB_COMPLETED`, `JOB_CANCELLED` deterministically to category `'bookings'`.
- **TYP-002**: Maps `MESSAGE_RECEIVED`, `PAYMENT_CONFIRMED`, `PAYMENT_RELEASED`, `PAYMENT_REFUNDED` deterministically to category `'messages_payments'`.
- **TYP-003**: Maps `REVIEW_REQUESTED`, `SECURITY_ALERT`, `VERIFICATION_COMPLETE`, `SYSTEM` deterministically to category `'account'`.
- **TYP-004**: Universal category `'all'` includes all notification types without exception.
- **TYP-005**: Authoritative record interface contains strictly domain data (`id`, `recipientId`, `type`, `createdAt`, `isRead`, `readAt`, `targetUrl`, `referenceCode`, `metadata`) and zero UI presentation state (`activeCategory`, `isCached`).
- **TYP-006**: `readAt` is strictly `null` or undefined when `isRead` is `false`.
- **TYP-007**: `readAt` is a valid ISO 8601 string when `isRead` is `true`.

### Suite 2: Deep-Link Resolver & Sanitization (`lib/notifications/deep-link.test.ts`)
- **LNK-001**: Resolves explicit valid internal `targetUrl` (e.g. `/jobs?id=job-101`) unchanged.
- **LNK-002**: Rejects protocol-relative target URLs (e.g. `//evil.com/phish`) and falls back to canonical destination.
- **LNK-003**: Rejects absolute external URLs (e.g. `https://malicious.com`, `http://insecure.com`) and falls back to canonical destination.
- **LNK-004**: Rejects script schemes (e.g. `javascript:alert(1)`, `data:text/html,...`) and falls back to `/notifications`.
- **LNK-005**: Derives canonical path `/jobs?id={jobId}` for booking notifications missing explicit `targetUrl`.
- **LNK-006**: Derives canonical path `/messages/{jobId}` for `MESSAGE_RECEIVED` notifications missing explicit `targetUrl`.
- **LNK-007**: Derives canonical path `/receipt/{bookingId}` for payment and escrow notifications missing explicit `targetUrl`.
- **LNK-008**: Derives canonical path `/profile?tab=security` for `SECURITY_ALERT` notifications.
- **LNK-009**: Derives canonical path `/profile?tab=personal` for `VERIFICATION_COMPLETE` notifications.
- **LNK-010**: Safely falls back to `/notifications` when metadata is missing or target cannot be resolved.

### Suite 3: Repository Contract & Customer Isolation (`lib/notifications/repository.test.ts`)
- **REP-001**: Returns empty item list and 0 unread count for customer with no notifications.
- **REP-002**: Returns customer's notifications sorted strictly descending by `createdAt`.
- **REP-003**: Customer isolation: customer A cannot view notifications belonging to customer B.
- **REP-004**: Rejects queries with empty or undefined `customerId` with `UnauthorizedError`.
- **REP-005**: Calculates unread count accurately (`isRead === false`).
- **REP-006**: Returns accurate category count breakdown across `all`, `bookings`, `messages_payments`, `account`.
- **REP-007**: `markAsRead` mutates single record to `isRead: true` and sets `readAt` timestamp.
- **REP-008**: `markAsRead` rejects if notification does not belong to caller (`UnauthorizedError`).
- **REP-009**: `markAsRead` rejects with `NotFoundError` for non-existent notification ID.
- **REP-010**: `markAllAsRead` marks all customer unread notifications as read and updates count.
- **REP-011**: `markAllAsRead` with category scope mutates only notifications within that category.
- **REP-012**: `dismiss` removes or soft-archives single notification for the caller.
- **REP-013**: Real-time subscriber listener receives newly pushed notification events.
- **REP-014**: In offline mode (`navigator.onLine === false`), returns cached snapshot with `isCached: true`.
- **REP-015**: Physical module boundary: production `repository.ts` source code contains 0 occurrences of `./testing` or `/testing`.
- **REP-016**: Production barrel `index.ts` exports strictly production classes and functions, exporting `undefined` for test controllers.

### Suite 4: Push Capability Adapter (`lib/notifications/push-adapter.test.ts`)
- **PSH-001**: Detects unsupported environment when `window.Notification` is undefined.
- **PSH-002**: Reports `'default'` when user has not yet interacted with native browser permission prompt.
- **PSH-003**: Reports `'granted'` when browser permission is allowed.
- **PSH-004**: Reports `'denied'` when browser permission is blocked.
- **PSH-005**: `requestPermission()` invokes native browser API only upon explicit invocation.
- **PSH-006**: Non-aggressive invariant: adapter constructor does not call `requestPermission()`.
- **PSH-007**: Test alert triggers native `Notification` constructor only when permission is `'granted'`.

### Suite 5: Notification Center Feed & Category Tabs (`components/notifications/NotificationCenter.test.tsx`)
- **FED-001**: Renders page title "Notifications" and category tablist.
- **FED-002**: Defaults to active tab `'all'` displaying all notifications.
- **FED-003**: Clicking `'Bookings'` tab filters feed strictly to booking milestone notifications.
- **FED-004**: Clicking `'Messages & Payments'` tab filters feed to chat and escrow notifications.
- **FED-005**: Clicking `'Account'` tab filters feed to security, review, and system notifications.
- **FED-006**: Category tabs display accurate badge counts matching unread items.
- **FED-007**: "Mark all as read" button is enabled when unread items exist.
- **FED-008**: "Mark all as read" button is disabled or hidden when 0 unread items exist.
- **FED-009**: Clicking "Mark all as read" updates all cards to read and clears unread badges.
- **FED-010**: "Mark all as read" triggers polite screen reader announcement via `aria-live="polite"`.
- **FED-011**: Keyboard navigation: Left/Right arrow keys navigate between category tabs.

### Suite 6: Notification Card Anatomy & Interaction (`components/notifications/NotificationCard.test.tsx`)
- **CRD-001**: Renders distinct category icon container for each notification type.
- **CRD-002**: Unread card renders bold headline, tinted surface (`#EFF4FF`), and emerald unread indicator dot.
- **CRD-003**: Read card renders standard body weight, white surface, and no unread dot.
- **CRD-004**: Renders humanized relative timestamp (e.g. "5m ago", "2h ago", "Yesterday").
- **CRD-005**: Renders booking reference code pill (e.g. `BBJ-LAG-2026-0891`) when present.
- **CRD-006**: Card click invokes `markAsRead` optimistically before navigating.
- **CRD-007**: Card click routes to resolved sanitized deep-link URL.
- **CRD-008**: Card provides minimum 44x44px touch target (48x48px on mobile).
- **CRD-009**: Card provides visible focus ring on keyboard focus (`focus-visible:ring-2`).

### Suite 7: Deterministic UI States & Push Banner (`components/notifications/NotificationStates.test.tsx`)
- **STA-001**: First-run empty state renders when customer has 0 notifications across all time.
- **STA-002**: First-run empty state displays "Browse Services" CTA routing to `/services`.
- **STA-003**: Filtered category empty state renders when a tab has 0 notifications.
- **STA-004**: Filtered category empty state displays "View All Notifications" CTA resetting tab to `'all'`.
- **STA-005**: Loading skeleton displays 4 shimmer placeholder cards preventing layout shift.
- **STA-006**: Offline banner renders when `navigator.onLine === false` with cached data alert.
- **STA-007**: Error retry card renders when initial repository fetch fails.
- **STA-008**: Push opt-in banner displays when permission is `'default'`.
- **STA-009**: Clicking "Enable Notifications" on push banner invokes push adapter request.
- **STA-010**: Push status pill ("Browser alerts active") displays when permission is `'granted'`.
- **STA-011**: Push blocked info callout displays when permission is `'denied'`.
- **STA-012**: Push banner is completely omitted when push is `'unsupported'`.
- **STA-013**: Respects `prefers-reduced-motion: reduce` by disabling shimmer and transition animations.

### Suite 8: Route Integration & Placeholder Retirement (`app/notifications/NotificationsPage.test.tsx`)
- **INT-001**: `/notifications` route renders `NotificationCenter` for authenticated customer.
- **INT-002**: `/notifications` route redirects unauthenticated visitor to `/login?redirect=/notifications`.
- **INT-003**: Navigation header bell displays live unread count badge.
- **INT-004**: Clicking navigation header bell navigates directly to `/notifications`.
- **INT-005**: Mobile bottom bar notification trigger navigates directly to `/notifications`.
- **INT-006**: DashboardScreen notification bell and tab navigate to `/notifications` without opening placeholder modal.
- **INT-007**: ProfileNavigation notification bell navigates to `/notifications` without opening placeholder modal.
- **INT-008**: JobsNavigation notification bell navigates to `/notifications` without opening placeholder modal.
- **INT-009**: Footer link in Notification Center navigates cleanly to `/profile?tab=notifications`.
- **INT-010**: Prerender guard prevents `ReferenceError: location is not defined` during static generation.

---

## 6. Verification Commands & Acceptance Gates

All phases must pass the three verification commands on cloud Codespace over SSH:

```bash
# 1. Typecheck
gh codespace ssh -c effective-fishstick-x5qwp6wrrp64fxwx -- "cd /workspaces/BukieBrainJobs && pnpm run type-check"

# 2. Lint
gh codespace ssh -c effective-fishstick-x5qwp6wrrp64fxwx -- "cd /workspaces/BukieBrainJobs && pnpm --filter @bukiebrainjobs/web lint"

# 3. Targeted & Full Test Suites
gh codespace ssh -c effective-fishstick-x5qwp6wrrp64fxwx -- "cd /workspaces/BukieBrainJobs && pnpm --filter @bukiebrainjobs/web test"

# 4. Production Build (Pre-render check across all 32 routes)
gh codespace ssh -c effective-fishstick-x5qwp6wrrp64fxwx -- "cd /workspaces/BukieBrainJobs && pnpm run build"
```

The entering baseline is **816 tests across 41 suites**. With the 8 new WEB-018 suites containing approximately 70 new tests, the final expected passing test count will be approximately **886 passing tests across 49 suites with zero regressions**.

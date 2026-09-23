# Spec: WEB-018 Notification Center & Push UX Design Specification (v1.0)

| Field | Value |
|---|---|
| **Document ID** | WEB-018-UX |
| **Feature** | Notification Center & Push UX |
| **Status** | 🟡 Proposed for UX Approval (v1.0) |
| **Version** | 1.0 |
| **Workstream** | Phase 1: Customer Web Platform Completion |
| **Governing Loop** | Mr. Solomon 9-Command Engineering Loop (`/architect`) |
| **Architecture Contract** | WEB-018 Architecture Contract v1.0 |
| **Target Surfaces** | `/notifications` (Notification Feed Hub), Navigation Bell Triggers, `/profile?tab=notifications` |
| **Design Standards** | BukieBrainJobs Experience Standards & Content Guide |
| **Date** | 2026-09-23 |

---

## 1. Executive Summary & Core Experience Principles

WEB-018 delivers the user experience for the BukieBrainJobs customer Notification Center. It transforms scattered operational events (artisan arrival, message receipt, escrow funding, review requests) into a calm, structured, and actionable communication feed.

### Core Experience Principles

1. **Operational Relevance Over Attention-Grabbing**:
   Notifications communicate real job milestones and account security. There are no flashing banners, badge counters that refuse to clear, or synthetic marketing alerts designed to manipulate attention.
2. **Clear Read/Unread Differentiation Without Visual Clutter**:
   Unread items are immediately identifiable via subtle background tinting, high-contrast titles, and a quiet emerald dot indicator. Once read, items settle into a readable, calm typography hierarchy.
3. **Frictionless Deep-Link Routing**:
   Every operational notification serves as a direct gateway into the relevant workflow (the active job tracker, chat screen, official receipt, or review modal). Clicking a notification marks it read and lands the customer exactly where action is needed.
4. **Contextual Web Push Without Intrusive Prompts**:
   Native browser push permission is requested only after explicit customer opt-in inside `/notifications` or `/profile?tab=notifications`. The app never fires unexpected browser popups on initial load.
5. **Calm Degradation on Variable Mobile Networks**:
   Notifications remain readable while offline. Badge counters update optimistically, and offline state is communicated with clarity and dignity.

---

## 2. Visual System & Brand Tokens

The Notification Center strictly follows the locked BukieBrainJobs design tokens from `DESIGN.md` and `docs/02-design-system/`:

| Token Role | Value / Class | Applied Usage in Notification Center |
|---|---|---|
| **Canvas Background** | `#F8F9FF` (`bg-[#F8F9FF]`) | Page canvas background behind the notification feed container |
| **Container Surface** | `#FFFFFF` (`bg-white`) | Main notification list card, modal dialogs, read notification cards |
| **Unread Card Surface** | `#EFF4FF` (`bg-[#EFF4FF]`) | Subtle cool-blue tint applied to unread notification cards |
| **Primary Brand Navy** | `#001A41` (`text-[#001A41]`) | Page title, active category tab, unread card headlines, primary buttons |
| **Supporting Brand Green** | `#296A4B` (`text-[#296A4B]`) | Unread dot indicator, active push status pill, booking checkmarks |
| **Accent Mint** | `#ABEEC8` (`bg-[#ABEEC8]`) | Focus rings, category count badge highlight, push active background |
| **Border Neutral** | `#E2E8F0` (`border-slate-200`) | Card dividers, tab borders, container perimeter outline |
| **Text Primary** | `#0B1C30` (`text-slate-900`) | Read notification titles, modal headings, action labels |
| **Text Muted** | `#64748B` (`text-slate-500`) | Notification body snippet, relative timestamp, category subtitles |
| **Error / Alert Crimson** | `#DC2626` (`text-red-600`) | Security alerts, cancelled booking tags, push blocked indicator |

### Typography & Geometry
- **Page Heading**: Hanken Grotesk (`font-display font-bold text-2xl md:text-3xl text-[#001A41]`).
- **Section & Tab Labels**: Inter semibold (`font-sans font-semibold text-sm`).
- **Notification Titles**: Inter bold (`font-sans font-bold text-sm md:text-base`).
- **Notification Body Text**: Inter regular (`font-sans text-xs md:text-sm text-slate-600 leading-relaxed`).
- **Card Radius**: `rounded-2xl` for containers, `rounded-xl` for individual notification cards and tabs.
- **Elevation**: `shadow-[0_2px_12px_rgba(0,26,65,0.04)]` on notification container; subtle hover lift.

---

## 3. Information Architecture & Page Layout

### 3.1 Layout Hierarchy (`/notifications`)

```
┌────────────────────────────────────────────────────────────────────────┐
│ Global Navigation Header (Desktop / Mobile Top Bar)                   │
│ Logo ─────────── Search ─────────── Jobs ─── Messages ─── [Bell (3)]  │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│   Page Header                                                          │
│   Notifications                        [Mark All as Read]              │
│   Stay updated on your bookings, messages, and account.                │
│                                                                        │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │ Web Push Permission Banner (Contextual Opt-In or Status)       │   │
│   └────────────────────────────────────────────────────────────────┘   │
│                                                                        │
│   Category Tabs (Accessible Tablist)                                   │
│   [ All (12) ]  [ Bookings (4) ]  [ Messages & Payments (5) ]  [ Account (3) ]
│                                                                        │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │ Notification Card (Unread - Booking Confirmed)                 │   │
│   │ [Calendar Icon]  Artisan Assigned: Engr. Emeka Nwosu    • 5m   │   │
│   │ Your generator repair booking has been confirmed for 2:00 PM.  │   │
│   │ [BBJ-LAG-2026-0891]                          [View Booking →]  │   │
│   ├────────────────────────────────────────────────────────────────┤   │
│   │ Notification Card (Unread - New Message)                       │   │
│   │ [Chat Icon]      New Message from Sunday Ogundimu       • 22m  │   │
│   │ "Good morning sir, I am arriving at your gate now."            │   │
│   │ [BBJ-LAG-2026-0744]                         [Open Messages →]  │   │
│   ├────────────────────────────────────────────────────────────────┤   │
│   │ Notification Card (Read - Escrow Funded)                       │   │
│   │ [Shield Icon]    Escrow Payment Verified                • 2h   │   │
│   │ Deposit of ₦45,000 is securely held in BukieGuarantee escrow.  │   │
│   │ [BBJ-LAG-2026-0891]                          [View Receipt →]  │   │
│   └────────────────────────────────────────────────────────────────┘   │
│                                                                        │
│   Footer / Channel Preferences Link:                                   │
│   Want to adjust SMS, WhatsApp, or Email alerts? [Manage Preferences]  │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Responsive Behavior
- **Desktop (>= 1024px)**: Max container width `max-w-4xl` centered on canvas, comfortable padding (`py-10 px-6`), side-by-side header actions.
- **Tablet (768px - 1023px)**: Max width `max-w-3xl`, horizontal scrolling category tab strip if required.
- **Mobile (< 768px)**: Edge-to-edge container with `px-4 py-6`, full-width tap cards with minimum 48px touch targets, sticky category tabs below header, bottom navigation bar active.

---

## 4. Header Bell & Unread Badge Anatomy

The navigation bell icon lives in the top bar (desktop and mobile) and in the mobile bottom bar:

1. **Bell Trigger Icon**: Outline bell (`Heroicons` or brand rounded outline).
2. **Unread Badge Counter**:
   - Condition: Displayed only when `unreadCount > 0`.
   - Badge Style: Small emerald circle/pill (`bg-[#296A4B] text-white font-bold text-[11px] leading-none px-1.5 py-0.5 rounded-full ring-2 ring-white`).
   - Counter Cap: If count > 99, display `99+`.
   - Accessibility: `aria-label="{count} unread notifications"`.
3. **Click Interaction**: Directly navigates to `/notifications`. Replaces and retires the previous "Notifications Coming Soon" modal.

---

## 5. Category Tabs Anatomy & Navigation

The category filter bar allows customers to isolate specific alert types:

1. **Tab Items**:
   - **All**: Total alerts count.
   - **Bookings**: Job milestones, artisan dispatch, completion.
   - **Messages & Payments**: Direct chat alerts, escrow holds, payout releases, refunds.
   - **Account**: Security alerts, verification approvals, review prompts, system notices.
2. **Active Tab Styling**:
   - `bg-[#001A41] text-white font-semibold shadow-sm`
   - Active count pill: `bg-[#ABEEC8] text-[#001A41] font-bold text-xs px-2 py-0.5 rounded-full`
3. **Inactive Tab Styling**:
   - `bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium`
   - Inactive count pill: `bg-slate-200 text-slate-600 text-xs px-2 py-0.5 rounded-full`
4. **Keyboard Accessibility**:
   - Left/Right arrow keys navigate between tabs.
   - Enter/Space activates the selected tab.
   - Proper ARIA attributes: `role="tablist"`, `role="tab"`, `aria-selected`, `aria-controls="notifications-panel"`.

---

## 6. Notification Card Anatomy

Each card in the feed represents an operational event:

```
┌────────────────────────────────────────────────────────────────────────┐
│ [Icon]  [Title Text]                              [Unread Dot] [Time]  │
│         [Message Body Text - Max 2 Lines]                              │
│         [Reference Code Pill]                     [Action / Deep Link] │
└────────────────────────────────────────────────────────────────────────┘
```

1. **Leading Category Icon (40x40px container)**:
   - Bookings: Blue container (`bg-blue-50 text-blue-700`) with calendar/clock icon.
   - Messages: Emerald container (`bg-emerald-50 text-[#296A4B]`) with chat bubble icon.
   - Payments: Amber/Emerald container (`bg-emerald-50 text-emerald-800`) with shield/currency icon.
   - Account / Security: Purple/Navy container (`bg-indigo-50 text-indigo-700`) with user/lock icon.
2. **Headline & Timestamp**:
   - Title: Bold navy (`#001A41`) for unread, slate-900 for read.
   - Relative Timestamp: Muted slate (`text-xs text-slate-500`), e.g. "Just now", "14m ago", "2h ago", "Yesterday".
   - Unread Dot: 8px solid emerald circle (`#296A4B`) positioned next to the timestamp on unread cards.
3. **Message Body**:
   - Clear, direct plain-language summary of what happened. Truncated to 2 lines on mobile with ellipsis.
4. **Context & Deep-Link Affordances**:
   - Reference Code Badge: Compact pill (`bg-slate-100 text-slate-700 text-xs font-mono px-2 py-0.5 rounded`) displaying the booking reference code (e.g. `BBJ-LAG-2026-0891`).
   - Deep-Link Indicator: Chevron right icon or explicit action text ("View Booking", "Open Chat", "View Receipt") on hover.
5. **Interactive Card Behavior**:
   - Entire card is an accessible button / link (`role="link"` or semantic anchor).
   - Clicking the card:
     1. Optimistically marks the notification as read.
     2. Routes directly to the resolved target URL.
   - Hover / Focus state: Subtle card border highlight (`border-slate-300`) and slight shadow increase.

---

## 7. Web Push Permission UX & Banners

The Web Push interface respects customer autonomy:

### 7.1 Unprompted State (`permission === 'default'`)
- Rendered as an opt-in banner above the notification list:
  - Container: Soft emerald gradient (`bg-emerald-50/70 border border-emerald-200 rounded-xl p-4`).
  - Headline: "Get instant alerts on your phone or computer"
  - Body: "Turn on browser notifications so you know the moment an artisan arrives or sends a message."
  - Action Button: "Enable Notifications" (`bg-[#296A4B] hover:bg-[#20543B] text-white text-xs font-semibold px-4 py-2 rounded-lg`).
  - Dismiss: Close cross button to hide banner for the current session.

### 7.2 Granted State (`permission === 'granted'`)
- Subtle confirmation pill in header or preferences:
  - Pill: `bg-emerald-100 text-[#296A4B] text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1.5`.
  - Icon: Green checkmark dot.
  - Text: "Browser alerts active".
  - Sandbox test button: "Send test alert" (in non-production environments).

### 7.3 Denied State (`permission === 'denied'`)
- Quiet informational callout (only shown if customer explicitly looks for push settings):
  - Text: "Browser push notifications are currently blocked. To receive real-time alerts, click the lock icon in your browser address bar and set Notifications to Allow."

---

## 8. Catalog of UI States for `/notifications`

The interface deterministically supports six visual states:

### 8.1 First-Run Empty State (Zero Notifications Across All Time)
- Visual: Clean outline illustration of a calm notification bell inside a soft blue circle.
- Headline: "No notifications yet"
- Body: "When you book a service, real-time updates on artisan arrival, job milestones, messages, and payments will appear here."
- Primary Action: "Browse Services" (routes to `/services`).
- Secondary Action: "View Active Jobs" (routes to `/jobs`).

### 8.2 Filtered Category Empty State
- Rendered when a specific category has zero items (e.g. no payment alerts yet):
  - Headline: "No {Category} notifications"
  - Body: "You do not have any notifications in this section."
  - Action Button: "View All Notifications" (resets tab to `all`).

### 8.3 Loading Skeleton State
- Layout-stable shimmer placeholders matching the exact card geometry:
  - 4 skeleton cards with pulse animation, placeholder icon box, headline bar, body bar, and pill placeholder.
  - Prevents Cumulative Layout Shift (CLS < 0.1).

### 8.4 Active Feed with Unread Items
- Normal populated feed displaying unread and read items with category filters and "Mark All as Read" button active.

### 8.5 Offline Read-Only State
- Pinned calm warning banner at top of feed:
  - Banner: `bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-3 flex items-center gap-2`.
  - Icon: Offline cloud / signal bar icon.
  - Text: "You are currently offline. Showing cached notifications. Actions will sync when connection returns."
  - Push permission toggle disabled.
  - Read actions apply optimistically to local cache.

### 8.6 Unauthorized State
- Unauthenticated visitor accessing `/notifications` redirects immediately: `router.replace('/login?redirect=/notifications')`.

---

## 9. Accessibility, Motion & Touch Standards

1. **Touch Target Sizing**:
   - Every card, category tab, "Mark All as Read" button, and deep link maintains a minimum tap target of **44x44px** (48x48px on mobile).
2. **Color Contrast (WCAG 2.1 AA)**:
   - Primary text (`#0B1C30` on `#FFFFFF` / `#EFF4FF`): Contrast ratio > 12:1 (exceeds 4.5:1 requirement).
   - Muted text (`#64748B` on `#FFFFFF`): Contrast ratio 4.6:1 (meets 4.5:1 requirement).
   - Unread indicator (`#296A4B` on `#EFF4FF`): Contrast ratio 5.1:1.
3. **Screen Reader Live Announcements**:
   - Marking all notifications read announces: "All notifications marked as read. Zero unread items." via `aria-live="polite"`.
   - Tab switching announces: "{Category} notifications loaded, {count} total items."
4. **Focus Rings & Keyboard Traps**:
   - Clear, high-contrast focus rings: `focus-visible:ring-2 focus-visible:ring-[#001A41] focus-visible:ring-offset-2`.
   - Modals (e.g. test alert dialogs or confirm clear) implement strict focus trapping and escape-key handling.
5. **Reduced Motion**:
   - All hover lifts, skeleton pulses, and badge transitions honor `@media (prefers-reduced-motion: reduce)`. Transitions are set to `transition-none` when reduced motion is requested.

---

## 10. Clean Retirement of Placeholder Surfaces

WEB-018 completely retires the temporary "Notifications Coming Soon" modal notices across the codebase:

1. **`apps/web/components/dashboard/DashboardScreen.tsx`**:
   - Top-bar notification bell routes directly to `/notifications`.
   - Mobile navigation tab for notifications routes directly to `/notifications`.
   - Notice dialog state `'notifications'` is removed.
2. **`apps/web/components/profile/ProfileNavigation.tsx`**:
   - Top-bar and mobile bottom navigation bell triggers route to `/notifications`.
   - Obsolete modal notice removed.
3. **`apps/web/components/jobs/JobsNavigation.tsx`**:
   - Top-bar and mobile bottom navigation bell triggers route to `/notifications`.
   - Obsolete modal notice removed.

---

## 11. Relationship to Existing Profile Notification Preferences

- `WEB-014` already implemented `NotificationPreferencesSection.tsx` at `/profile?tab=notifications` (SMS, WhatsApp, Email, In-App toggles).
- At the bottom of `/notifications`, a calm persistent card provides a link:
  "Looking to update SMS, WhatsApp, or Email alerts? [Manage Notification Channels in Profile →]" (routes directly to `/profile?tab=notifications`).
- Browser push permission state is harmonized: if push is granted, the in-app channel toggle in profile preferences is reflected as active.

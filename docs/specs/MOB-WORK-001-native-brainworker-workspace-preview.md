# MOB-WORK-001: Native BrainWorker Workspace and Local Lead Alert Preview (UI-Only)

**Scope:** Approved for scoped implementation by delegated PM on 2026-11-03
**Status:** Approved Specification
**Phase:** Phase 4.3 BrainWorker Native Experiences (Item 1, UI Scope Only)
**Primary Route:** `/brainworker/workspace-preview` (`apps/mobile/app/brainworker/workspace-preview.tsx`)

---

## 1. Scope and Objective

This specification establishes the architectural and user-experience contract for the first native BrainWorker slice in Phase 4.3: **Native BrainWorker Workspace and Local Lead Alert Preview (`MOB-WORK-001`)**.

The scope is strictly limited to an in-memory, frontend UI presentation demonstrating the layout of a provider mobile workspace, an in-app lead alert presentation, and local sample lead detail inspection using static local fixtures.

### Governing Checklist Item
- **Phase 4.3, Item 1**: `Worker mobile workspace and lead push notifications.`
- **Boundary**: This slice covers the mobile workspace and in-app lead-alert presentation UI only. It does **NOT** implement or complete actual OS push notification delivery, permission requests, or device token registration. The checklist item remains in progress, and real push delivery remains deferred to Phase 4.4 and Phase 5 backend integration.

---

## 2. Navigation and Entry Route Boundaries

1. **Dedicated Preview Route**:
   - Implemented as a dedicated native stack screen at `apps/mobile/app/brainworker/workspace-preview.tsx`.
   - Registered in the root stack at `apps/mobile/app/_layout.tsx` (`<Stack.Screen name="brainworker/workspace-preview" />`).
   - Completely separate from the customer bottom tab shell (`apps/mobile/app/(tabs)/`). The 5 customer tabs (`home`, `services`, `jobs`, `messages`, `profile`) remain preserved and unmodified.
2. **Single Controlled Entry Point**:
   - The only entry point into this preview is a clearly labelled informational link on `/brainworker/register` (`apps/mobile/app/brainworker/register.tsx`).
   - The link label must state clearly that it is a sample preview (e.g. `View Sample Workspace Preview`).
3. **Preservation of Registration Form Behavior**:
   - Submitting the form on `/brainworker/register` preserves its existing behavior: displaying the confirmation Alert and returning to `/`.
   - Form submission must **never** automatically redirect to the workspace preview or imply that the user has been registered, approved, or verified as a BrainWorker.
4. **Back Navigation**:
   - An accessible Back action at the top of `/brainworker/workspace-preview` exits the preview and returns the user to `/brainworker/register`.

---

## 3. Data Privacy and Anti-Fabrication Rules

In alignment with `BW-003` (BrainWorker Leads Inbox) and BukieBrainJobs data integrity standards, this slice enforces strict privacy and anti-fabrication boundaries:

### Strict BW-003 Lead Privacy Boundary
- Sample leads must expose only high-level information authorized for the initial invitation stage:
  - Job title and category.
  - Problem description.
  - General city and neighborhood or zone (e.g. `Ikeja, Lagos` or `Lekki Phase 1, Lagos`).
  - Landmark where applicable.
  - Sample requested timeframe and sample urgency indicator (strictly non-live).
  - Sample customer budget or permitted rate (strictly non-live).
- **Strictly Masked Data**: Sample leads must **never** display customer full names, customer phone numbers, customer email addresses, or exact street/building addresses.

### Anti-Fabrication Rules
- **No Fabricated Worker Identity**: The workspace must not invent live BrainWorker names, fake account balances, artificial ratings, fake completion percentages, or false accreditation/verification badges.
- **No Fabricated Availability State**: The UI must not display a live toggle switch implying active connection to a real-time dispatch queue. Status is marked explicitly as `LOCAL DEMONSTRATION`.
- **No Fabricated Notification Counts**: The workspace must not manufacture unread message counts, system alerts, or fake push badges.

---

## 4. Screen Layout & Presentation Components

The screen structure adapts the web BrainWorker workspace patterns to native mobile density:

1. **Local Preview Disclaimer Banner**:
   - Displayed prominently at the top fold using `c.strip` background and `c.divider` border.
   - Text: `Sample preview only. The leads shown here are local examples. This is not a live BrainWorker account, lead feed or push alert service.`
2. **Workspace Header Block**:
   - Eyebrow: `BRAINWORKER WORKSPACE` in uppercase monospace font.
   - Title: `BrainWorker workspace preview` with clear informational subtitle.
   - Mode badge: An immutable tag marked `SAMPLE PREVIEW`. Zero fabricated worker identity, account balance, rating, completion rate, or live availability state claims.
3. **In-App Lead Alert Presentation Banner**:
   - A plainly labelled static sample lead-alert presentation banner with no live urgency, countdown timers, push notification claims, or fake activity state.
   - Displays an informational icon, sample category, neighborhood, and problem summary.
   - Includes an explicit `View sample details` action button meeting >= 48dp minimum touch target size that opens the sample lead inspection view.
4. **Static Lead Feed List**:
   - Displays 3 to 4 immutable static sample lead cards (e.g. Generator Repair, AC Diagnostic, Plumbing Leak).
   - Each card displays category, title, neighborhood/zone, sample timeframe, sample non-live urgency tag, and sample budget range.
   - Each card provides an accessible touch target (>= 48dp) to open local detail inspection.
5. **Local Sample Lead Detail Inspection Sheet/View**:
   - Opening a lead presents its full problem description, sample timeframe, sample pricing mode, and location boundary.
   - Includes an explicit Back action to return to the sample lead feed.
   - Explicitly displays: `Sample preview only. The leads shown here are local examples. This is not a live BrainWorker account, lead feed or push alert service.`

---

## 5. Explicit Action, Hardware, and Infrastructure Exclusions

The following capabilities are strictly out of scope:

1. **No Invitation Accept or Decline Actions**:
   - There are zero interactive Accept, Decline, or Quotation buttons.
   - Invitation response actions belong strictly to Phase 4.3 Item 2 (`Immediate job invitation accept/decline action modals`).
2. **No Booking Creation or Lifecycle Mutations**:
   - Leads cannot be accepted, booked, rescheduled, or cancelled.
3. **No Hardware or Device Capabilities**:
   - Zero GPS location capture or on-site check-in (Phase 4.3 Item 3).
   - Zero camera, photo attachments, or biometric lock access (Phase 4.4).
4. **No Real OS Push Notification Infrastructure**:
   - `expo-notifications` is not installed or configured.
   - Zero OS notification permission dialogs (`requestPermissionsAsync`).
   - Zero device push token registration, APNs keys, FCM credentials, or background delivery daemons.
   - Real push notifications remain deferred to Phase 4.4 and Phase 5 backend integration.
5. **No Backend, Database, Auth, or Persistence**:
   - Zero PostgreSQL, Prisma, Supabase, JWTs, or session cookies.
   - Zero HTTP API endpoints or WebSocket lead streaming.
   - Zero SQLite or AsyncStorage persistence of lead records.

---

## 6. Theme and Accessibility Requirements

- **Theme Compliance (`THEME-001`)**:
  - Reuses existing tokens from `apps/mobile/lib/theme.ts` (`useThemeColors()`, `useThemeMode()`).
  - Dark mode by default (`#0B0E13` canvas, `#13171E` card, `#07090D` strip, `#FF6B35` amber accent).
  - Light mode choice supported cleanly via existing token mappings and theme switcher.
  - Zero imported or competing design palettes; Outlier skill remains scoped to web/PWA.
- **Measured Contrast Compliance**:
  - Normal text must maintain a measured contrast ratio >= 4.5:1 against its background in both dark and light modes.
  - Meaningful icons and control boundaries must maintain a measured contrast ratio >= 3:1 against their backgrounds in both dark and light modes.
- **Touch Targets**:
  - Every interactive button, lead card, Back action, and View sample details action must measure at least 48x48 logical units.
- **Accessibility and Responsive Modes**:
  - Screen-reader compatibility: explicit `accessibilityRole` and `accessibilityLabel` on all interactive actions, headers, and disclaimers.
  - Large text support: dynamic font scaling without content clipping or horizontal overflow.
  - Reduced motion support: static transitions with zero forced motion or auto-animating carousels.
  - 375px portrait density check: zero horizontal layout blowout on narrow viewports.
  - Landscape orientation check: flexible scrolling preserving safe area insets without layout overlap.
- **Code Standards**:
  - Component functions must not exceed 25 lines, verified by `apps/mobile/app/content-guardrails.test.ts`.
  - Zero raw `console.log` statements; zero swallowed exceptions.

---

## 7. Verifiable Acceptance Criteria

1. **Route & Shell Isolation**:
   - `/brainworker/workspace-preview` renders as a standalone stack route.
   - The 5 customer tabs in `apps/mobile/app/(tabs)/` remain completely unmodified.
   - `/brainworker/register` preserves its exact form validation and alert submission logic, adding only a static preview navigation link.
2. **Lead Privacy & Content**:
   - Static lead fixtures reside in `apps/mobile/lib/worker-workspace-preview.ts`.
   - Exactly 3 to 4 distinct sample leads are provided.
   - All sample leads mask customer personal information (no phone, no email, no street address).
3. **In-App Lead Alert & Inspection**:
   - The plainly labelled static sample lead-alert banner renders visibly at the top fold with no live urgency, countdown, push claim, or fake activity state.
   - The `View sample details` action cleanly opens the sample lead detail inspection view.
   - Tapping the Back action cleanly restores the sample lead feed view.
4. **Contrast and Responsive Audits**:
   - Measured contrast verified >= 4.5:1 for normal text and >= 3:1 for meaningful icons/control boundaries in both dark and light modes.
   - Verified 375px portrait viewport with zero horizontal overflow.
   - Verified landscape orientation with proper safe area handling.
   - Screen-reader accessibility attributes verified on all interactive elements and headers.
   - Large text scaling and reduced motion verified.
5. **Verification Gates**:
   - Unit tests in `apps/mobile/lib/worker-workspace-preview.test.ts` verify sample fixtures, privacy masking, and state transitions.
   - Route guardrail tests in `apps/mobile/app/worker-workspace.test.ts` verify accessibility roles, 48dp targets, and absence of backend/mutation code.
   - Content guardrail tests pass with all component functions <= 25 lines.
   - Clean TypeScript check (`tsc --noEmit`).
   - Clean Expo static export compilation across web, Android, and iOS.

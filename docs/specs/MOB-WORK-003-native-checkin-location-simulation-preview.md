# MOB-WORK-003: Native BrainWorker On-Site Check-In Location Simulation Preview (UI-Only)

**Version:** 1.2 (UI-Only Local Preview Implementation Complete & PM-Accepted)
**Status:** Complete & PM-Accepted (UI-Only Local Preview Implementation). Real GPS sensing and real on-site verification are not implemented. Native iOS/Android runtime QA remains unverified.
**Date:** 2026-11-03
**Phase:** Phase 4.3 BrainWorker Native Experiences (`apps/mobile`), Item 3 ("On-site check-in with GPS location confirmation")
**Target Route:** `/brainworker/workspace-preview` (`apps/mobile/app/brainworker/workspace-preview.tsx`)
**Parent Baseline:** `c806442ce2f339386d147d815f07d7f1b8c98d8e` (MOB-WORK-002 accepted, committed, and pushed; Vercel READY)

---

## 1. Overview & Business Intent

In Phase 4.3 of the BukieBrainJobs roadmap, BrainWorker mobile capabilities are introduced progressively. MOB-WORK-001 established the native workspace layout, sample lead feed, and sample alert banner. MOB-WORK-002 added immediate job invitation accept and decline action modals as an in-memory preview.

MOB-WORK-003 addresses the third milestone in Phase 4.3: **On-site check-in with GPS location confirmation**.

In this mobile slice, native device location capabilities (e.g. `expo-location`), device permission dialogs, backend synchronization, and booking state machines remain deferred to later phases. Escrow and payment are entirely out of scope and not modeled.

MOB-WORK-003 defines the approved scope, audit findings, visual architecture, and strict non-goals for a **UI-only local-preview simulation**. The planned screen is explicitly labelled as a sample simulation and does not capture, transmit, or confirm real on-site presence. The copy must clearly state that location is simulated and does not prove or guarantee physical presence.

---

## 2. Audit Findings

### 2.1 Repository & Branch State
- **Active Branch**: `feature/mobile-accepted-slices` at `c806442ce2f339386d147d815f07d7f1b8c98d8e`.
- **Pre-existing Working Tree State**: Several unrelated files remain modified or untracked from prior local development (e.g. `apps/mobile/app/post-job.tsx`, `docs/check-log.md`, `docs/master-checklist.md`, screenshots, and capture scripts). These paths are preserved completely untouched.
- **Workflow State**: `docs/master-checklist.md` line 227 (`- [ ] On-site check-in with GPS location confirmation`) remains open because real device GPS sensing, live location permissions, backend synchronization, and booking state transitions remain deferred. The scoped UI-only local-preview implementation is complete and PM-accepted.

### 2.2 Authoritative Domain Alignment (BW-004 & BW-008)
Audit of the authoritative web implementation (`apps/web/lib/brainworker/bookings/checkin.ts`, `apps/web/components/brainworker/bookings/BookingDetailView.tsx`, and `apps/web/components/onsite/CheckInPanel.tsx`) confirms:
1. **Lifecycle Transition**: On-site check-in in the production domain is a lifecycle transition from `CONFIRMED` to `IN_PROGRESS` (CHK-001, BOOK-015).
2. **Single Location Snapshot**: Production check-in records a single coordinate snapshot upon arrival. Continuous GPS monitoring, background location tracking, and persistent `watchPosition` listeners are explicitly forbidden (CHK-010).
3. **Server-Enforced Proximity**: Proximity validation is strictly an authority/server concern (CHK-009, CHK-014). User-facing copy must never claim a fixed distance radius as a platform guarantee (CHK-015) and must never claim GPS proves or guarantees physical presence.
4. **Escrow and Payment Out of Scope**: Escrow and payment are entirely out of scope and not modeled (CHK-012). Check-in never mutates escrow, payment, refund, or payout balances.

### 2.3 Mobile Conventions & Patterns
1. **Truthful Disclaimer Engine**: Following `WORKER_WORKSPACE_DISCLAIMER` in MOB-WORK-001 and `LIFECYCLE_SAMPLE_DISCLAIMER` in MOB-LIFE-001, every preview screen requires clear, persistent notice copy that prevents any misunderstanding about live provider accounts or active bookings. The copy must state that location is simulated and does not prove or guarantee physical presence.
2. **THEME-001 Fidelity**: Dark-first default (`#0B0F17` canvas), full light mode support (`#F8FAFC` canvas), high-contrast text ratios (>= 4.5:1), and semantic tokens (`c.amber`, `c.green`, `c.card`, `c.strip`, `c.divider`).
3. **Ergonomic Standards**: Minimum 48dp touch targets on all buttons and pressables, zero component functions exceeding 25 lines, and semantic accessibility roles (`header`, `button`, `text`, `alert`).

---

## 3. Scope Boundaries & Strict Prohibitions

### 3.1 Strict Technical Prohibitions (No-Go Boundaries)
The implementation of MOB-WORK-003 strictly prohibits all of the following:
1. **No Real GPS / Location APIs**: Zero use of `expo-location`, `navigator.geolocation`, or native device location modules.
2. **No Location Permission Requests**: Zero OS-level permission dialogs (`requestForegroundPermissionsAsync`, `requestBackgroundPermissionsAsync`, etc.).
3. **No Network / API / Backend Access**: Zero `fetch`, Axios, REST, GraphQL, WebSocket, Prisma, or Supabase calls.
4. **No State Persistence**: Zero storage in `AsyncStorage`, SQLite, MMKV, or filesystem caches.
5. **No Booking Mutation**: Zero database writes, memory mutations of external booking records, or status changes.
6. **No Escrow or Payment Modeling**: Escrow and payment are entirely out of scope and not modeled. Zero manipulation or display of escrow deposits, provider payouts, or pricing models.
7. **No Notifications**: Zero Expo Push, FCM, APNs, or local system notification triggers.
8. **No Remote Map Tiles**: Zero external map rendering (no Google Maps SDK, Apple Maps, Mapbox, or OpenStreetMap webviews).
9. **No Coordinates Displayed**: The sample displays no coordinates. Neither real nor simulated latitude or longitude values are rendered.

### 3.2 Escrow and Payment Entirely Out of Scope
Escrow and payment are entirely out of scope and not modeled. The sample contains no escrow or payment state, no escrow funding toggle, no escrow gating or warning banners, and no payment copy.

### 3.3 In-Scope Preview Boundaries
1. **Presentation-Only In-Memory State**: Interaction is strictly limited to local React state (`useState`) during the active preview session.
2. **Navigation Integration**: Use only `lead_gen_01` as a locally simulated accepted outcome on the existing `/brainworker/workspace-preview` route. An in-card button advances to the check-in sample simulation. No dedicated route and no separate sample-confirmed-job feed card are added.
3. **One-Tap Landmark-Free Interaction (No Modal)**: Pure one-tap sample simulation with no separate confirmation modal and no landmark input field. A single tap on the in-card button sets the temporary in-memory preview outcome directly. This is strictly a temporary UI presentation state, not a booking status change, check-in record, arrival proof, or persistence.
4. **Explicit Sample Labelling & Presence Disclaimer**: Both initial and simulated states must visibly announce that the view is a sample simulation and that location is simulated and does not prove or guarantee physical presence.
5. **Stylized Static Schematic**: Visual arrival feedback must use accessible vector icons and thematic card blocks instead of live maps or coordinate strings.
6. **Session Reset**: Navigating away or tapping a reset action resets the preview to its initial unsimulated state.

---

## 4. Proposed Screen States & Copy Requirements

### 4.1 State 1: Initial Unsimulated State (Arrival Simulation Ready)
- **Top Bar / Eyebrow**:
  - Eyebrow: `SAMPLE LOCATION SIMULATION`
  - Badge: `LOCAL PREVIEW ONLY`
- **Mandatory Persistent Disclaimer**:
  - Role: `alert` or `text`
  - Copy: `"This location is simulated and does not prove or guarantee physical presence. This preview does not confirm your on-site presence or check in a booking."`
- **Sample Job Information Card**:
  - Service Title: `Generator Servicing & Repair (Sample)`
  - Location Area: `Ikeja, Lagos (Allen Avenue area)`
  - Landmark: `Near Allen Roundabout`
  - Booking Status Tag: `CONFIRMED (Sample)`
  - Explanatory Subtext:
    `"In production, arrival check-in captures a single location snapshot without continuous tracking. This preview demonstrates the interface layout without accessing device sensors. Location is simulated and does not prove or guarantee physical presence."`
- **Simulated Arrival Card (Schematic)**:
  - Header: `Simulated Site Location`
  - Status Row: `Arrival Snapshot: Not simulated`
  - Visual Representation: Stylized vector card using theme tokens and `location-outline` icon. No coordinates are displayed.
- **Action Trigger (Direct One-Tap)**:
  - Button Label: `Simulate on-site check-in`
  - Accessibility Label: `Simulate on-site check-in for sample generator repair`
  - Subtext: `Tapping directly sets the temporary in-memory arrival preview view without opening a separate confirmation modal.`
  - Behavior: A single tap directly transitions the view to State 2 in memory. This is strictly a temporary UI presentation state, not a booking status change, check-in record, arrival proof, or persistence.

### 4.2 State 2: Simulated Outcome State (Arrival Simulated)
- **Header Section**:
  - Eyebrow: `SAMPLE CHECK-IN SIMULATED`
  - Title: `On-Site Arrival Simulated (Preview)`
- **Mandatory Persistent Disclaimer**:
  - Copy: `"This location is simulated and does not prove or guarantee physical presence. This preview does not confirm your on-site presence or check in a booking."`
- **Simulated Status Card**:
  - Status Badge: `SIMULATED ARRIVAL (Preview)`
  - Verification Stamp: `Arrival view previewed in memory`
  - Timing: `Current preview session only`
  - Explanation:
    `"This preview demonstrated the on-site verification layout. Location is simulated and does not prove or guarantee physical presence. In production, a single location snapshot is recorded upon arrival without background tracking or continuous location monitoring."`
  - Presentation Boundary Notice:
    `"This is only a temporary UI presentation state, not a booking status change, check-in record, arrival proof, or persistence."`
- **Reset Trigger**:
  - Button Label: `Reset location simulation`
  - Behavior: Clears simulated in-memory state and returns to State 1.

---

## 5. Acceptance Criteria (For Eventual Implementation Phase)

1. **Visual & Copy Precision**:
   - Both initial and simulated states contain the exact required disclaimers:
     - `"Sample location simulation"`
     - `"This location is simulated and does not prove or guarantee physical presence. This preview does not confirm your on-site presence or check in a booking."`
   - Simulated status card renders status badge `SIMULATED ARRIVAL (Preview)` and verification stamp `Arrival view previewed in memory`.
   - The interface and documentation clearly reflect that this is only a temporary UI presentation state, not a booking status change, check-in record, arrival proof, or persistence.
   - Zero coordinates (real or simulated) and zero live map tiles rendered.
   - Zero escrow, gating, or payment copy rendered. Escrow and payment are entirely out of scope and not modeled.
2. **Navigation & Interaction Alignment**:
   - Navigation uses only `lead_gen_01` as a locally simulated accepted outcome on the existing `/brainworker/workspace-preview` route.
   - An in-card button advances to the check-in sample simulation. No dedicated route and no separate sample-confirmed-job feed card.
   - Pure one-tap sample simulation with no separate confirmation modal and no landmark input field. A single tap on `Simulate on-site check-in` sets the temporary in-memory preview outcome directly.
3. **Zero Sensor / Network / Persistence Side-Effects**:
   - Zero imports or invocations of `expo-location` or geolocation APIs.
   - Zero permission requests prompted to the user.
   - Zero network requests (`fetch` / Axios).
   - Zero writes to `AsyncStorage`, SQLite, or local files.
4. **Accessibility & Design Standards**:
   - All interactive controls have >= 48dp hit targets.
   - Contrast ratio meets or exceeds WCAG AA (>= 4.5:1 text, >= 3:1 controls/borders).
   - Component functions remain <= 25 lines.
   - Preserves `THEME-001` across dark and light modes.
5. **Workflow Discipline & Verification Status**:
   - `docs/master-checklist.md` is preserved without edits and remains open at line 227.
   - Scoped UI-only local-preview implementation is complete and PM-accepted.
   - Real GPS sensing and real on-site verification are not implemented. Native iOS/Android runtime QA remains unverified.
   - Simulation does not prove physical presence and does not affect booking status, backend, persistence, payments, or notifications.
   - Verified results:
     - Mobile test suite: 217/217 passing
     - TypeScript: no diagnostics
     - Repository skill gate plus regression: 22/22 passing
     - Focused verifier suite: 9/9 passing
     - `git diff --check`: passed
     - Compiled Expo Playwright M3 flow: passed (including reset RED/GREEN, app-selected light theme, landscape, and scaling proxy)
   - The compiled Expo Playwright evidence is browser emulation only. Native iOS/Android runtime QA remains unverified.
   - Existing unrelated unstaged working tree files remain untouched.

---

## 6. Resolved PM Decisions (Approved Specification & Implementation Status)

The PM design decisions have been resolved, implemented, and accepted as follows:

1. **Navigation Entrypoint**:
   - **Resolved**: Use only `lead_gen_01` as a locally simulated accepted outcome on the existing `/brainworker/workspace-preview` route.
   - A local button advances to the check-in sample simulation.
   - Do not add a dedicated route (`/brainworker/checkin-preview`) and do not add a separate sample-confirmed-job feed card.

2. **Landmark Confirmation Input & Confirmation Modal Removal**:
   - **Resolved**: Pure one-tap sample simulation with no landmark input field and no separate confirmation modal.
   - A single tap on the in-card `Simulate on-site check-in` button directly sets the temporary in-memory preview outcome (`SIMULATED ARRIVAL (Preview)` / `Arrival view previewed in memory`).
   - This interaction is strictly a temporary UI presentation state, not a booking status change, check-in record, arrival proof, or persistence.

3. **Presence and Escrow Boundaries**:
   - **Resolved**: Location is simulated and does not prove or guarantee physical presence. The UI copy prominently reflects this disclaimer.
   - Escrow and payment are entirely out of scope and not modeled. Check-in is not described as affecting escrow or payment.

4. **Implementation Phase Gate**:
   - **Resolved**: Scoped UI-only local preview implementation is complete and PM-accepted. Real GPS sensing and real on-site verification are not implemented. Native iOS/Android runtime QA remains unverified. Device permissions, backend synchronization, booking mutations, persistence, payments/escrow, and notifications remain strictly deferred and not implemented.

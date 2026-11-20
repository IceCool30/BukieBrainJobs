# Decision Record: MOB-WORK-003 Native Check-In Location Simulation Preview (UI-Only)

**Date:** 2026-11-03
**Status:** Complete & PM-Accepted (UI-Only Local Preview Implementation). Real GPS sensing and real on-site verification are not implemented. Native iOS/Android runtime QA remains unverified.
**Context:** Phase 4.3 BrainWorker Native Experiences (`apps/mobile`), Item 3 ("On-site check-in with GPS location confirmation")
**Primary Target Route:** `/brainworker/workspace-preview` (`apps/mobile/app/brainworker/workspace-preview.tsx`)
**Parent Baselines:** `2252aca` (MOB-WORK-001 accepted), `c806442` (MOB-WORK-002 accepted, committed, pushed)

---

## 1. Context

Under Phase 4.3 BrainWorker Native Experiences:
- MOB-WORK-001 established the native BrainWorker workspace preview, sample lead feed, and sample lead alert banner on `/brainworker/workspace-preview`.
- MOB-WORK-002 implemented the immediate job invitation accept and decline action modals as an in-memory preview on `lead_gen_01`.
- Phase 4.3 Item 3 identifies "On-site check-in with GPS location confirmation" as the next mobile milestone.

In the authoritative web and backend domain specifications (BW-004 Booking Management and BW-008 On-Site Work):
- On-site check-in is an authoritative lifecycle transition from `CONFIRMED` to `IN_PROGRESS` (CHK-001, BOOK-015).
- Check-in captures a single location snapshot at arrival time; continuous GPS tracking or background location tracking is strictly forbidden (CHK-010).
- Proximity verification is evaluated strictly by the server authority, not the client (CHK-009, CHK-014, CHK-015), and no specific radius is claimed in user-facing copy.
- Escrow and payment are entirely out of scope and not modeled (CHK-012). Check-in never mutates escrow, payment, refund, or payout balances.

Because native device capabilities, real location APIs, backend integration, live booking mutation, and payment systems are deferred, this decision record governs the approved UI-only local preview for Phase 4.3 Item 3.

---

## 2. Key Architectural Decisions

### 2.1 Explicit Simulation Mandate
The proposed mobile screen must be an explicitly labelled sample simulation, not a real on-site confirmation. The copy must explicitly state that location is simulated and does not prove or guarantee physical presence. It must never state or imply that the provider's physical location has been proven or guaranteed, that a GPS fix was obtained, or that an authoritative booking check-in occurred.

### 2.2 Strict Technical Prohibitions (No-Go Boundaries)
1. **Zero Device Location APIs**: No invocation of `expo-location`, `navigator.geolocation`, or native location managers.
2. **Zero Location Permission Prompts**: No permission dialogs, manifest permission requests, or OS prompt triggers.
3. **Zero Network / Backend Access**: No HTTP `fetch`, Axios, GraphQL, WebSocket, Prisma, or Supabase calls.
4. **Zero State Persistence**: No storage in `AsyncStorage`, SQLite, MMKV, or file caches.
5. **Zero Booking Mutation**: No database write or lifecycle progression for any booking.
6. **Zero Payment / Escrow Changes**: Escrow and payment are entirely out of scope and not modeled. Check-in is not described as affecting escrow or payment.
7. **Zero Notifications**: No push notification tokens, APNs/FCM delivery, or local OS notifications.

### 2.3 Escrow and Payment Entirely Out of Scope
Escrow and payment are entirely out of scope and not modeled. Check-in is not described as affecting escrow or payment. The sample contains no escrow or payment state, no escrow funding toggle, no escrow gating or warning banners, and no payment copy.

### 2.4 Presentation State Only
Any user interaction in the preview modifies only temporary in-memory React state for the active view session. A single tap on the in-card `Simulate on-site check-in` button transitions directly to the simulated arrival view in memory with no intermediate confirmation modal. This is strictly a temporary UI presentation state, not a booking status change, check-in record, arrival proof, or persistence. Leaving the screen or resetting the simulation immediately returns the interface to its initial unsimulated state.

### 2.5 Mandatory Disclaimer Copy
Both initial and simulated views must prominently display visible disclaimers:
- Eyebrow / Tag: `Sample location simulation` / `Local preview only`
- Persistent Notice: `"This location is simulated and does not prove or guarantee physical presence. This preview does not confirm your on-site presence or check in a booking."`

### 2.6 Coordinate & Map Guardrails
- **No Remote Map Tiles**: Remote tile loading (Google Maps, Mapbox, Apple Maps, OpenStreetMap) is prohibited.
- **No Coordinates Displayed**: The sample displays no coordinates. Neither real nor simulated latitude or longitude values are rendered. Visual representation is strictly limited to static, accessible vector icons and thematic status cards.

### 2.7 Theme & Design System Fidelity
The implementation must adhere strictly to `THEME-001` (dark-first default, light mode support, single theme toggle) and use repository tokens from `apps/mobile/lib/theme.ts`. All interactive controls must satisfy the >= 48dp touch target requirement and meet WCAG AA contrast standards. Component functions must remain <= 25 lines.

### 2.8 Checklist Item Status
`docs/master-checklist.md` line 227 (`- [ ] On-site check-in with GPS location confirmation`) remains pending, unchanged, and is not marked complete. Live device location integration and backend synchronization will be addressed in a future governed slice.

---

## 3. Resolved PM Decisions

The product decisions evaluated during specification review have been resolved and approved as follows:

### 3.1 Navigation Integration
- **Decision**: Approved Option 1 (Integrate into `/brainworker/workspace-preview`).
- **Mechanism**: Use only `lead_gen_01` as a locally simulated accepted outcome on the existing `/brainworker/workspace-preview` route. An in-card button advances to the check-in sample simulation.
- **Exclusions**: Do not add a dedicated route (`/brainworker/checkin-preview`) and do not add a separate sample-confirmed-job feed card.

### 3.2 Pure One-Tap Action Without Confirmation Modal or Landmark Input
- **Decision**: Pure one-tap sample simulation with no separate confirmation modal and no landmark input field.
- **Mechanism**: A single tap on the in-card `Simulate on-site check-in` button directly sets the temporary in-memory preview outcome.
- **Preview Output**: Renders status badge `SIMULATED ARRIVAL (Preview)` and verification stamp `Arrival view previewed in memory`.
- **Presentation State**: Explicitly documented and confirmed as a temporary UI presentation state only, not a booking status change, check-in record, arrival proof, or persistence.

### 3.3 Presence and Escrow Boundaries
- **Decision**: The copy explicitly states that location is simulated and does not prove or guarantee physical presence.
- **Decision**: Escrow and payment are entirely out of scope and not modeled. Check-in is not described as affecting escrow or payment.

---

## 4. Status & Verification Summary

- **Approved Specification**: `docs/specs/MOB-WORK-003-native-checkin-location-simulation-preview.md`
- **Current Status**: Complete & PM-Accepted for scoped UI-only local preview implementation. Real GPS sensing and real on-site verification are not implemented. Native iOS/Android runtime QA remains unverified.
- **Scope & Boundary Preservation**:
  - Real GPS sensing and real on-site verification are not implemented. Native iOS/Android runtime QA remains unverified.
  - Simulation is an explicit in-memory preview only and does not prove physical presence.
  - Simulation does not affect booking status, backend systems, database persistence, payments/escrow, or notifications.
  - Escrow and payment are entirely out of scope and not modeled.
- **Verification Evidence**:
  - Mobile test suite: 217/217 passed
  - TypeScript: no diagnostics
  - Repository skill gate plus regression: 22/22 passed
  - Focused verifier suite: 9/9 passed
  - `git diff --check`: passed cleanly
  - Compiled Expo Playwright M3 flow: passed cleanly, including reset RED/GREEN, app-selected light theme, landscape, and scaling proxy.
- **Runtime Disclaimers**:
  - The compiled Expo Playwright evidence is browser emulation only.
  - Native iOS/Android runtime QA remains unverified.
  - `docs/master-checklist.md` line 227 (`- [ ] On-site check-in with GPS location confirmation`) remains open and unedited.

Read-
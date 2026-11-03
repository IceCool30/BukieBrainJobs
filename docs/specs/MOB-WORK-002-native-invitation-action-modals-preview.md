# MOB-WORK-002: Native BrainWorker Workspace Immediate Job Invitation Accept/Decline Action Modals Preview (UI-Only)

**Version:** 1.0
**Status:** Approved for Implementation (UI-Only Preview)
**Date:** 2026-11-03
**Phase:** Phase 4.3 BrainWorker Native Experiences (`apps/mobile`), Item 2
**Route:** `/brainworker/workspace-preview` (`apps/mobile/app/brainworker/workspace-preview.tsx`)
**Parent Baseline:** `2252aca7e8de4bb331212bf8ede07812c22845c8` (MOB-WORK-001 accepted, committed, and pushed)

---

## 1. Overview & Business Intent

MOB-WORK-001 established the native BrainWorker workspace layout, truthful sample disclaimer, sample lead feed, and sample lead alert banner on `/brainworker/workspace-preview`. MOB-WORK-001 intentionally deferred action controls (Accept and Decline) to Phase 4.3 Item 2.

MOB-WORK-002 delivers the scoped UI-only preview of immediate job invitation accept and decline action modals. It enables BrainWorker providers to preview how incoming direct invitations can be accepted or declined, while strictly enforcing that all actions are in-memory local UI demonstrations. No network transmission, push response, booking state machine transition, database mutation, or offline cache write occurs.

---

## 2. Scope Boundaries & Delegation

### 2.1 In Scope (UI-Only Preview Subset)
1. **Existing Screen Extension**: Extend the existing native `/brainworker/workspace-preview` route. No new routes are introduced.
2. **Selective Invitation Targeting**: Display accept and decline action controls exclusively on the sample detail view for the sample lead corresponding to `SAMPLE_LEAD_ALERT.id` (`lead_gen_01`). All other sample leads (`lead_ac_02`, `lead_plumb_03`) display standard lead details without invitation action controls.
3. **Accept Confirmation Modal**:
   - Opens an accessible confirmation modal.
   - Plainly states that this is an interface preview and that no actual booking will be confirmed or dispatched.
   - Cancel closes the modal with no outcome.
   - Confirm records a temporary in-memory preview outcome.
4. **Decline Modal with Canonical BW-003 Taxonomy**:
   - Opens an accessible modal requiring a single-choice decline reason selection.
   - Strictly limited to the six canonical reasons from `docs/specs/BW-003-leads-inbox.md`:
     - `SCHEDULE_CONFLICT` ("Schedule conflict")
     - `OUTSIDE_COVERAGE_AREA` ("Outside coverage area")
     - `SKILL_TOOL_MISMATCH` ("Skill or tool mismatch")
     - `RATE_BUDGET_MISMATCH` ("Rate or budget mismatch")
     - `TEMPORARILY_UNAVAILABLE` ("Temporarily unavailable")
     - `OTHER` ("Other reason")
   - Zero free-form text inputs.
   - Confirmation is disabled until an option is selected.
   - Cancel closes the modal with no outcome.
   - Confirm records a temporary in-memory preview outcome.
5. **In-Memory Preview Outcomes**:
   - Display a distinct, truthful in-memory outcome block on the detail view once an action is confirmed.
   - Clearly states that no response was transmitted or recorded and no booking was created.
   - Automatically resets when leaving the sample detail view (navigating back to the lead feed).
6. **Mobile Accessibility & Theme Fidelity**:
   - Dark-first default and light mode support preserving THEME-001 token rules.
   - All interactive controls >= 48dp hit target.
   - Semantic modal roles, accessible radio states, and Android back button dismissal (`onRequestClose`).
   - Contrast >= 4.5:1 for text, >= 3:1 for borders, controls, and icons.
   - Zero component functions exceeding 25 lines.

### 2.2 Explicit Exclusions & Non-Goals
1. **No Backend or Database Interaction**: Zero PostgreSQL, Prisma, Supabase, or REST/GraphQL endpoints.
2. **No Network Requests**: Zero `fetch`, Axios, or WebSocket messages.
3. **No State Persistence**: Zero AsyncStorage, SQLite, MMKV, or file caching.
4. **No Real Booking Transitions**: No transition into `BOOKING_ACCEPTED`, escrow creation, or customer notifications.
5. **No Push Delivery**: Real push notifications remain deferred to Phase 4.4 and backend integration.
6. **No GPS or Check-In**: Location services remain deferred to Phase 4.3 Item 3.
7. **No Changes to Customer Tabs or Workspaces**: Customer tabs (`home`, `services`, `jobs`, `messages`, `profile`) and registration submit behavior remain untouched.
8. **Checklist Preserved**: `docs/master-checklist.md` is not modified; Phase 4.3 Item 2 remains open for future live backend integration.

---

## 3. UI/UX Interaction & Copy Requirements

### 3.1 Invitation Action Card (Lead Detail for `lead_gen_01`)
- **Card Header**: Eyebrow `SAMPLE INVITATION ACTIONS`, tag `LOCAL PREVIEW`.
- **Explanatory Copy**: "Preview how direct lead invitations are handled. Actions taken here are simulated locally; no server response or booking is created."
- **Primary Action**: `Accept sample lead` (high-contrast button).
- **Secondary Action**: `Decline sample lead` (outlined high-contrast button).

### 3.2 Accept Confirmation Modal
- **Title**: `Accept Sample Lead?`
- **Body**: "This is an interface preview only. Confirming will show how an accepted state appears locally. No real customer booking will be created and no provider commitment is made."
- **Buttons**:
  - `Cancel` (dismisses modal)
  - `Confirm sample acceptance` (sets preview outcome to accepted)

### 3.3 Decline Modal
- **Title**: `Decline Sample Lead`
- **Subtitle**: "Select a reason to preview the decline flow. No response will be submitted."
- **Reason Options**:
  1. `Schedule conflict` (`SCHEDULE_CONFLICT`)
  2. `Outside coverage area` (`OUTSIDE_COVERAGE_AREA`)
  3. `Skill or tool mismatch` (`SKILL_TOOL_MISMATCH`)
  4. `Rate or budget mismatch` (`RATE_BUDGET_MISMATCH`)
  5. `Temporarily unavailable` (`TEMPORARILY_UNAVAILABLE`)
  6. `Other reason` (`OTHER`)
- **Buttons**:
  - `Cancel` (dismisses modal)
  - `Confirm sample decline` (disabled if no reason selected; sets preview outcome to declined)

### 3.4 In-Memory Preview Outcome Block
- **Accepted Outcome**:
  - Header: `Sample Lead Accepted (Preview)`
  - Description: "This was a local in-memory preview demonstration. No response was transmitted to any server and no active booking was created."
- **Declined Outcome**:
  - Header: `Sample Lead Declined (Preview)`
  - Reason display: "Reason: <Reason Label>"
  - Description: "This was a local in-memory preview demonstration. No response was transmitted to any server."
- **Action**: `Reset preview outcome` button allowing providers to re-test the interaction without leaving the detail view.

---

## 4. Verification & Testing Requirements
1. **Focused Unit & Guardrail Tests** (`apps/mobile/app/worker-workspace.test.ts` and `apps/mobile/lib/worker-workspace-preview.test.ts`):
   - Canonical decline taxonomy constants and labels.
   - Accept modal open, cancel, and confirm behavior.
   - Decline modal open, cancel, single-selection requirement, and confirm behavior.
   - Action controls visible exclusively on `lead_gen_01`.
   - Absence of action controls on other sample leads.
   - Outcome state reset on navigating back to the lead feed.
   - Zero network API or persistence calls.
   - Component functions <= 25 lines.
2. **Playwright Compiled Expo QA Verification** (`scripts/verify-expo-workspace.mjs`):
   - Accept modal open, cancellation, and confirmation flow.
   - Decline modal reason selection and confirmation flow.
   - Contrast check across modals, action buttons, radio options, and outcome cards in dark and light themes.
   - 125% rendered text scaling without clipping.
   - Modal keyboard dismissal and accessibility attributes.

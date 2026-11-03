# Decision Record: MOB-WORK-002 Native Invitation Action Modals Preview (UI-Only)

**Date:** 2026-11-03
**Status:** Approved by Delegated PM
**Context:** Phase 4.3 BrainWorker Native Experiences, Item 2 (`Immediate job invitation accept/decline action modals`)
**Route:** `/brainworker/workspace-preview` (`apps/mobile/app/brainworker/workspace-preview.tsx`)

---

## 1. Context

Under Phase 4.3 Item 1, MOB-WORK-001 delivered the core native BrainWorker workspace layout, sample lead feed, and sample lead alert presentation on `/brainworker/workspace-preview`. Action controls (accepting and declining direct lead invitations) were explicitly deferred to Phase 4.3 Item 2.

In this decision, we define the bounded, UI-only local preview for Phase 4.3 Item 2.

## 2. Decision

1. **Route Continuity**: Implement invitation actions directly inside the existing `/brainworker/workspace-preview` detail view. No new route is created.
2. **Selective Invitation Targeting**: Action controls appear only for the sample lead linked to `SAMPLE_LEAD_ALERT.id` (`lead_gen_01`). Other sample leads represent generic lead feed items and do not display invitation actions.
3. **Accept Modal**: Opens a confirmation dialog stating that acceptance is an interface preview and creates no active booking or server commitment.
4. **Decline Modal & Canonical Taxonomy**: Opens a single-choice modal strictly limited to the six canonical BW-003 decline reasons (`SCHEDULE_CONFLICT`, `OUTSIDE_COVERAGE_AREA`, `SKILL_TOOL_MISMATCH`, `RATE_BUDGET_MISMATCH`, `TEMPORARILY_UNAVAILABLE`, `OTHER`). No free-form text input is supported. Confirmation is disabled until a choice is selected.
5. **In-Memory Outcome & State Clearing**: Confirming an action updates an in-memory outcome card on the detail view. Leaving the detail view (navigating back to the feed) automatically resets the preview state.
6. **Zero Backend / Persistence**: No network, database, storage, push notification, GPS, or offline cache infrastructure is added.
7. **Accessibility & Design Standards**: Dark-first default, light mode support, >= 48dp hit targets, WCAG AA contrast, component functions <= 25 lines.
8. **Checklist Item Status**: `docs/master-checklist.md` is not modified and remains open for future live backend implementation.

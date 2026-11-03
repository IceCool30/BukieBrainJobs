# MOB-WORK-001: Native BrainWorker Workspace and Local Lead Alert Preview Decision Record

**Decision ID:** MOB-WORK-001-DEC-001
**Date:** 2026-11-03
**Status:** Approved Specification (UI-only local sample scope; Phase 4.3 IN PROGRESS)

**Decision:** The PM, acting under the product owner's explicit delegation, authorizes the specification for `MOB-WORK-001: Native BrainWorker Workspace and Local Lead Alert Preview` as detailed in `docs/specs/MOB-WORK-001-native-brainworker-workspace-preview.md`. This authorizes a dedicated native preview route at `/brainworker/workspace-preview` displaying an in-app lead alert presentation, workspace header block, and local sample lead inspection across immutable fixtures adhering to `BW-003` privacy rules.

**Authority:** PM under product owner delegation.

**Scope Boundaries:**
1. **Governing Checklist Item**: Phase 4.3 Item 1 (`Worker mobile workspace and lead push notifications`). This slice covers the mobile workspace UI and in-app lead alert presentation only. It does not complete actual push delivery. The checklist item remains in progress, and real push delivery remains deferred.
2. **Dedicated Preview Route**: Dedicated native stack screen at `apps/mobile/app/brainworker/workspace-preview.tsx`. The 5 customer tabs in `apps/mobile/app/(tabs)/` remain completely unmodified.
3. **Controlled Entry Link**: A clearly labelled sample preview link on `/brainworker/register`. Submitting the registration form preserves its existing confirmation alert and return to `/`; it does not redirect into the preview or imply registration or approval.
4. **Data Privacy & Anti-Fabrication**: Follows `BW-003` privacy standards strictly. Masked data: zero customer names, phone numbers, emails, or exact street addresses. Zero fabricated worker identities, accounts, live availability toggles, urgency counts, ratings, completion rates, or notification counts.
5. **Action & Hardware Exclusions**: Zero accept/decline action controls (deferred to Phase 4.3 Item 2). Zero booking creation or mutations. Zero GPS location check-in (Phase 4.3 Item 3). Zero camera, photo attachments, or biometrics (Phase 4.4).
6. **Infrastructure Exclusions**: Zero backend, database, or live auth (no PostgreSQL, Prisma, JWTs). Zero network APIs or WebSocket lead streaming. Zero production persistence or offline SQLite caching. Zero `expo-notifications`, push permission prompts, device token registration, APNs/FCM keys, or background delivery.
7. **Design & Accessibility**: Reuses existing `apps/mobile/lib/theme.ts` tokens in dark (default) and light modes under `THEME-001` with >= 4.5:1 for normal text and >= 3:1 for meaningful icons/control boundaries, and 48dp minimum touch targets. Outlier skill remains scoped to web/PWA. All component functions <= 25 lines.

**References:** `docs/specs/MOB-WORK-001-native-brainworker-workspace-preview.md`, `docs/specs/BW-003-leads-inbox.md`, `docs/specs/THEME-001-light-dark-toggle.md`

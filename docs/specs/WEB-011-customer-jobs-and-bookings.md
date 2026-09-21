# Spec: WEB-011 Customer Jobs & Bookings Activity Hub

**Status**: Accepted

## Decision
Implement the unified customer activity management hub at the canonical `/jobs` route. The implementation adheres strictly to the approved WEB-011 Product & UX Specification and WEB-011A Design Brief, operating within a deterministic mock-first architecture. It establishes a unified customer activity model distinguishing activity type from lifecycle status, provides master-detail navigation on desktop and dedicated full-screen detail on mobile, and enforces rigorous boundaries preventing premature backend infrastructure or unsupported marketplace claims.

## Requirements

1. **Canonical Route and Navigation**:
   - Canonical route is `/jobs`.
   - Continuous integration with WEB-010 authenticated shell: desktop sidebar and persistent mobile bottom navigation.
   - External deep links or dashboard transitions (`/dashboard?tab=jobs`) resolve cleanly to `/jobs`.
   - Browser Back and Forward navigation must work naturally without desynchronizing mobile modal state or selection.
   - Query parameters (`view`, `id`, `state`) are sanitized and validated; they never serve as authorization channels or transport sensitive data.

2. **Unified Customer Activity Model**:
   - Customer activities are presented in a unified list combining Job Requests and Bookings.
   - Explicit separation of Activity Type (`JOB REQUEST`, `BOOKING`) from Activity Status (`Request received`, `Awaiting progress`, `Scheduled`, `In progress`, `Completed`, `Cancelled`).
   - "Scheduled" is strictly a presentation label for supported scheduled activities; it does not introduce an unapproved `SCHEDULED` value into the domain `JobStatus` enum.
   - `CustomerActivity` contracts remain purely presentation and domain contracts; no production database models or persistence tables are introduced.

3. **Filtering and Deep-Linking**:
   - Filter views: `all`, `active`, `upcoming`, `past`.
   - Stable count badges reflecting true totals per category across view switching.
   - Filter state synchronized bidirectionally with URL (`/jobs?view=active`, `/jobs?view=upcoming`, `/jobs?view=past`).
   - Deep-linking via activity reference (`/jobs?id=REQ-84920`). Valid IDs open the corresponding detail view; malformed or missing IDs render a clean not-found state with a "View all activity" reset control.
   - Customer activity queries are scoped by authenticated customer ID and fail closed.

4. **Desktop and Mobile Responsive Experience**:
   - Desktop: 12-column master-detail layout (5-column scannable list, 7-column detail surface).
   - Mobile: Full-screen detail view with sticky header (`Back to list`), minimum 48px touch targets, and persistent bottom navigation.
   - Closing the mobile detail view cleanly removes the `id` query parameter and returns to the active list filter.

5. **Decorative Brand Watermark**:
   - Logo watermark (`/images/logo-badge-512.png` at 3.5% opacity) embedded in activity detail.
   - Strictly decorative: `aria-hidden="true"`, `pointer-events-none`, subordinate to text content with zero interference to contrast or legibility.

6. **Complete State Coverage**:
   - Loading skeleton during data fetch.
   - First-run empty state encouraging initial service discovery or job posting.
   - Filtered empty state with clear context and action to reset filters.
   - Partial failure notice with localized retry for resilient error recovery.
   - Full failure and connection issue presentation.
   - Offline degraded mode banner communicating read-only status.
   - Unauthenticated boundary redirecting to login with return path preservation.

7. **Voice and Visual Standards**:
   - Locked DESIGN.md tokens: Deep Navy `#001A41` as primary, Emerald `#296A4B` for positive status indicators.
   - Hanken Grotesk for headings, Inter for interface copy.
   - Zero em dashes across all code comments, test descriptions, and user-facing copy.
   - Honest marketplace language: no false assignment, live dispatch, escrow, or real-time tracking claims.

## Acceptance Criteria

1. Authenticated customer visits `/jobs` and views their unified activity list with master-detail layout on desktop and scannable list on mobile.
2. Filter tabs (`All`, `Active`, `Upcoming`, `Past`) correctly filter activities while preserving stable badge counts, synchronizing to `?view=` parameter.
3. Clicking an activity on mobile opens full-screen detail with `>=48px` touch targets; clicking "Back to list" returns to the list and removes the `id` parameter.
4. Deep link with valid ID opens the requested activity; deep link with non-existent or malformed ID renders accessible not-found state.
5. Browser Back and Forward navigation correctly updates selection and detail view state without desynchronization.
6. Activity type and activity status are visually and semantically distinct across cards and detail surfaces.
7. Decorative watermark renders with `aria-hidden="true"` at subtle opacity behind content.
8. All deterministic states (loading, empty, partial failure, offline, unauthenticated) render according to spec.
9. All monorepo test suites pass with zero regressions.

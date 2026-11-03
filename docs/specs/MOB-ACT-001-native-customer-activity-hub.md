# MOB-ACT-001: Native Customer Activity Hub

**Decision ID:** MOB-ACT-001-DEC-001
**Status:** Approved for scoped implementation under delegated PM authority
**Implementation:** Complete
**Acceptance:** PM review accepted on 2026-11-02
**Phase:** 4.2.2 IN PROGRESS. Booking lifecycle and offline caching remain separate and unchecked.

## 1. Scope

Specify a local-only sample activity presentation in the existing native Jobs tab at `/jobs`, implemented in `apps/mobile/app/(tabs)/jobs.tsx`. This slice uses four screen-local segments and exactly six static, in-memory presentation samples. The samples are not customer activity records, are not saved, and do not connect to `/post-job` or transfer its route-local request preview. No new route is added.

No customer activity source or production data contract is included. Filtering is limited to the six local samples in this specification. No API, network, backend, database, state persistence, local storage, SQLite or offline caching is included. Do not add counts, detail screens, lifecycle actions, loading, failure, retry or empty-state UI. Keep booking lifecycle and offline caching in their separate unchecked scope. Approval is under delegated PM authority only and does not claim personal owner review, separate human/design review, or Product Architect approval.

## 2. Segments and local filtering

Segment order is All, Active, Upcoming, Past. All is selected by default. Selection stays in screen memory only and is not persisted or URL-synced. Use the WEB-011 status mapping to filter only this local fixture. It is a future integration reference beyond this slice, not a data-source contract.

| Segment | Included fixture statuses |
|---|---|
| All | All six rows |
| Active | request_received, awaiting_progress, in_progress |
| Upcoming | scheduled |
| Past | completed, cancelled |

## 3. Static sample fixture

Each sample card displays only its service title, type label, status label and a visible `Sample` badge. Do not show customer or worker identities, names, addresses, phone numbers, prices, budgets, reference codes, ratings, availability or other invented fields.

| Activity type | Status | Service title | Badge |
|---|---|---|---|
| job_request | request_received | Generator Servicing & Repair | Sample |
| booking | awaiting_progress | AC Repair & Gas Refill | Sample |
| booking | in_progress | Plumbing & Pipe Fitting | Sample |
| booking | scheduled | Electrical & Solar Inverter | Sample |
| booking | completed | Deep Cleaning & Post-Construction | Sample |
| job_request | cancelled | Furniture & Carpentry Work | Sample |

Visible-label mapping is explicit and uses approved WEB-011 terminology:

| Value | Visible label |
|---|---|
| job_request | Job request |
| booking | Booking |
| request_received | Request received |
| awaiting_progress | Awaiting progress |
| in_progress | In progress |
| scheduled | Scheduled |
| completed | Completed |
| cancelled | Cancelled |

Show this exact notice once, after the segment bar and immediately above the sample list: `These sample entries are for preview only. They're not saved to your account.`

## 4. CTA and theme

Keep the existing CTA label `EXPLORE SERVICES`, its existing placement after the content/list in screen flow, and its existing navigation to `/(tabs)/services`. The screen order is segment bar, sample notice, sample list, then the existing CTA.

Use existing THEME-001 tokens for both CTA icon and label foreground. Keep the amber background tokens and shared theme engine unchanged.

| Theme and state | Foreground | Background | Contrast |
|---|---|---|---|
| Dark, normal | c.canvas #0B0E13 | c.amber #FF6B35 | 6.82:1 |
| Dark, pressed | c.canvas #0B0E13 | c.amberHover #FF7D4D | 7.63:1 |
| Light, normal | c.card #FFFFFF | c.amber #CC4A14 | 4.61:1 |
| Light, pressed | c.card #FFFFFF | c.amberHover #B34312 | 5.63:1 |

Keep dark as the first-visit default and preserve the existing saved light/dark preference. Do not add a theme toggle or change shared theme tokens.

## 5. Accessibility and layout

Give each segment `accessibilityRole="tab"` and `accessibilityState={{ selected: true|false }}`. Only the active segment is selected. Do not communicate selection by color alone. Each segment and the CTA must have a React Native tap target of at least 48x48 logical units without adding rows or changing the existing layout structure.

Preserve the existing safe-area and bottom-navigation behavior. Prevent horizontal overflow. Check portrait 375x812 and landscape 844x390 layouts, a large-text/browser-zoom proxy and reduced-motion behavior. Add no decorative animation.

Playwright bounds are browser CSS pixels only, not proof of native logical units. Native 44pt/48dp targets, Dynamic Type, native safe areas, VoiceOver/TalkBack and OS reduced-motion behavior remain unverified unless tested on a native device or simulator. Do not claim native proof from browser emulation.

## 6. Future test and QA plan

Keep the static fixture, pure filtering function, type/status visible-label mappings, and exact sample notice in apps/mobile/lib/activity-preview.ts. Use the existing Vitest setup without adding dependencies. Tests in apps/mobile/lib/activity-preview.test.ts must cover actual filter outcomes for All, Active, Upcoming and Past, type/status visible-label mappings, fixture category and service-title values, and the exact notice and Sample-only presentation. Source-text checks are not behavior proof; compiled Expo Playwright separately tests visible rendered behavior.

Export and test the actual compiled Expo app, not source text alone: `pnpm --filter @bukiebrainjobs/mobile exec expo export --platform web --output-dir dist-web`. The Playwright runner at `scripts/verify-expo-activity-hub.mjs` exercises all four filters, default selection, visible labels, accessibility selected state, sample badges and notice, both themes, CTA navigation and contrast including pressed states, CSS-pixel target bounds, both viewports and horizontal overflow. The QA report is recorded in `docs/reports/MOB-ACT-001-native-customer-activity-hub-qa.md`. Both the verifier and QA report are created and verified in compiled Expo browser emulation.

## 7. Acceptance criteria

1. The existing `/jobs` tab is used. No new route or screen registration is added.
2. The four segments appear in the approved order and All is selected by default.
3. Filtering genuinely returns all six local samples for All, the three mapped statuses for Active, the scheduled sample for Upcoming, and the completed and cancelled samples for Past. No count badges are shown.
4. The exact six generic fixture rows, visible `Sample` badges and exact preview notice are used. No customer activity source or identifying fields are added.
5. The CTA retains the exact `EXPLORE SERVICES` label, existing after-list placement and existing services navigation.
6. CTA icon and label meet the documented contrast values in both themes and pressed states using the specified tokens.
7. Segment selection exposes the correct accessible selected state, and every segment and CTA has a React Native target of at least 48x48 logical units.
8. The existing theme preference, safe-area behavior and bottom navigation remain intact; the UI has no horizontal overflow.
9. Unit and compiled-Expo browser tests cover the documented mappings and interactions. Browser dimensions are reported as CSS pixels only.
10. Native-device-only checks remain unverified unless actually performed. No production records, persistence, backend, network, lifecycle controls or offline caching are introduced.
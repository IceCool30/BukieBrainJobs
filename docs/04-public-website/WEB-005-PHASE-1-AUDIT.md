# WEB-005 Phase 1 Audit: Public BrainWorker Profile

**Status:** Remote CI, Vercel preview, and browser verification completed; merge review pending
**Decision:** WEB-005 approved for a frontend-only deterministic mock-data implementation
**Platform decision:** PLAT-002 governs the compact homepage shell below 768px and in installed or standalone mode. The homepage has no bottom navigation.

## Audit purpose

This audit reconciles the approved Public BrainWorker Profile contract against the current public homepage, existing service-detail route, services directory, and booking-preparation route. The implementation is deliberately limited to the four existing featured records and does not expand the product into a directory or account journey.

## Findings and decisions

| Area | Finding | WEB-005 decision |
|---|---|---|
| Entry points | Desktop cards and compact-home cards previously opened a legacy modal. | Both now link to `/brainworkers/[brainworkerId]`. Compact home carries its selected active city. |
| Public data | Existing mock workers contain ratings, reviews, completed jobs, and passport tiers. | The profile route consumes an explicit `PublicBrainWorker` allowlist projection. |
| Inventory | Four featured records are already present. | `PUBLIC_BRAINWORKER_IDS` is the only v1 public inventory: `bw-1` through `bw-4`. |
| Context | Existing booking flows accept display strings directly. | Profile context accepts only exact canonical `serviceId` and active city values. Incoming `service` text is ignored. |
| Service relationship | Worker category and customer service are not interchangeable. | Worker category may be suggested, but service selection is explicit before booking. |
| Navigation | A profile page must not create a dead end. | No-context back navigation returns to `/#workers`; valid discovery context returns to canonical `/services` values. |
| Mobile shell | Older wording described standalone-only PWA behavior. | PLAT-002 wording is aligned so phone widths below 768px and standalone mode use the compact homepage shell. |
| Legacy modal | The former modal exposed prohibited trust and performance fields. | It was deleted after repository-wide search found no active imports, renders, state, or callback paths. |

## Scope boundary

The implementation changes only the approved WEB-005 application, test, and documentation files. It does not change the homepage bottom-navigation policy, Services Directory behavior, WEB-004 route, native app, backend, database, authentication, payments, Escrow, verification, availability, matching, messaging, or external integrations.

## Verification plan

Static source review and focused deterministic contract tests are separate from executable remote verification. The final delivery must report each required command independently as PASS, FAIL, or NOT RUN, along with the exact branch commit, GitHub Actions evidence, Vercel preview evidence, browser route evidence, responsive checks, accessibility checks, console findings, network findings, and any remaining risks.

## Remaining risks before merge approval

The local sandbox is not evidence of GitHub Actions execution, Vercel preview readiness, or browser-runtime behavior. These must be obtained from the pushed draft pull request and its branch preview. The local runtime also reports an engine warning because the repository requests Node 24 while this sandbox currently runs Node 22.13.0.

## Acceptance status

| Gate | Status |
|---|---|
| Approved contract implemented locally | PASS |
| Focused deterministic tests | PASS |
| Local web type-check and lint | PASS |
| Remote CI install, generation, type-check, lint, and test steps | PASS |
| Standalone remote web build command | NOT RUN; Vercel preview build passed |
| Standalone remote git diff check | NOT RUN; local diff check passed |
| Vercel preview | PASS |
| Browser-runtime verification | PASS for exercised route, context, responsive, console, network, and navigation cases |
| Merge approval | NOT REQUESTED |

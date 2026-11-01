# MOB-POST-001: Native Multi-Step Job Posting

**Document ID:** MOB-POST-001 <br>
**Status:** PM accepted for native local-preview scope; native-device QA unverified; Phase 4.2.2 IN PROGRESS <br>
**Route:** `/post-job` in `apps/mobile` <br>
**Decision:** [MOB-POST-001-DEC-001](../21-decision-log/MOB-POST-001-NATIVE-JOB-POSTING.md)

## 1. Authority and stopping point

The product owner delegated PM review and approval for this task. On 2026-10-30 the requesting PM reviewed and approved the final MOB-POST-001 document set for native `/post-job` implementation under that delegation. On 2026-10-31 the delegated PM accepted the implemented native `/post-job` local-preview scope based on implementation and the available compiled Expo browser-emulation QA recorded in the [QA report](../reports/MOB-POST-001-native-job-posting-qa.md). This specification records the approved native product choices and the later scoped implementation acceptance. It does not claim personal owner review, a separate human reviewer, or Product Architect authorization. Actual native iOS/Android runtime, screen-reader and device-specific QA remain unverified.

[WEB-009 v1.1](WEB-009-customer-job-posting.md) governs the product meaning. [WEB-009A](../04-public-website/WEB-009A-CUSTOMER-JOB-POSTING-DESIGN-BRIEF.md) is an unapproved design reference and provenance source only. Its original requirements and sections 30-31 gates remain untouched and are not claimed satisfied. This document explicitly defines the native adaptation: an in-memory local preview, not web mock-auth handoff or receipt through a customer activity repository. It supersedes only MOB-002's native `/post-job` planning authority. Accepted MOB-BOOK-001 `/book` work is unchanged.

## 2. Five-step journey

| Step | Exact heading | Fields |
|---|---|---|
| 1 | Job Requirement | Job type, optional category, title, description |
| 2 | Location | City, street address, optional landmark |
| 3 | Schedule | Timing preference, conditional specific date, optional arrival window |
| 4 | Budget and Optional Worker Preference | Optional budget and budget type, optional preferred BrainWorker |
| 5 | Review | Editable summary of active values, mock-auth notice, local-preview action |

Use step keys `job_requirement`, `location`, `schedule`, `budget_preference`, and `review`. Direct entry is safe and starts with blank required fields. Back and Continue preserve the same in-memory draft. Validate the current step before advancing; invalid fields remain visible with errors and focus moves to the first error. Review Edit returns to the selected step; normal sequential Back/Continue navigation resumes without losing other values. At Review, validate the whole draft again before generating a preview.

Back within the flow returns to the previous step. Back from the first step exits using existing router history, or the homepage when there is no history. Leaving the flow, unmounting, reset, or process termination discards draft and result state. No refresh or relaunch recovery is promised. Existing service-discovery navigation stays available; do not add unrelated homepage or tab changes.

## 3. One native draft contract

This is the only field contract for this feature. Text values are strings while editing. Apply length limits after trimming, without dropping unrelated fields.

| Field | Values and validation |
|---|---|
| `jobType` | Initial `''`; required `specific_service` or `broader_project`. Labels: A specific service; A broader project. |
| `categoryId` | Optional `''`, an existing native service ID accepted by `getServiceById`, or `not-sure` labelled `I'm not sure`. No new taxonomy or category questionnaire. |
| `title` | Required, 10-100 trimmed characters. |
| `description` | Required, 20-1,000 trimmed characters. |
| `city` | Initial `''`; required exact canonical label from Section 4. |
| `streetAddress` | Required, at least 5 trimmed characters. |
| `landmark` | Optional, at most 100 trimmed characters. |
| `urgency` | Initial `''`; required `urgent`, `tomorrow`, `flexible`, or `specific_date`, mapped in Section 4. |
| `preferredDate` | Initial `''`; real `YYYY-MM-DD` date required only for `specific_date`. |
| `arrivalWindow` | Optional `''` or one exact arrival label from Section 4, not a separate enum taxonomy. |
| `budget` | Optional string containing one plain positive finite Naira decimal amount, at most two decimal places. |
| `budgetType` | `fixed` or `negotiable` when an amount exists. Internal `unspecified` is allowed only for omission; no third visible budget-type choice. |
| `preferredWorkerId` | Optional `''` or one exact ID from Section 5. Derive its display name from the whitelist; do not accept a caller-supplied name field. |

Initial optional strings are blank and internal budget type is `unspecified`. Do not preselect a city, worker, or authenticated identity. Whitespace-only required inputs fail. Reject unknown nonempty enum values, catalog IDs, city labels, and worker IDs. Normalize safe prefill defensively; invalid injected prefill is ignored rather than presented as an approved selection. Customer edits remain authoritative. No address or draft is carried in a URL.

## 4. Location and schedule

Only these seven city labels are accepted: Lagos; Abuja (FCT); Port Harcourt; Ibadan; Enugu; Kano; Benin City. Their provenance is the active entries in `apps/web/lib/mock/homepage-data.ts`, not the wider alias list or substring checks in shared validation. Do not import a Next/web module into native, activate a market, or imply nationwide coverage.

| Stored urgency | Exact visible label |
|---|---|
| `urgent` | Urgent / Today |
| `tomorrow` | Tomorrow |
| `flexible` | Flexible / Within a week |
| `specific_date` | Specific Date |

Validate specific dates as real calendar dates, rejecting rollover such as February 30. Compare date-only values with device-local calendar today, not a UTC timestamp. Revalidate at final preview and Retry, including midnight rollover. When urgency is not `specific_date`, retain any inactive editing value only in memory and omit it from the meaningful summary/reference snapshot. Do not convert preferences into a confirmed appointment.

Optional arrival values are exactly: Morning (9:00 AM - 12:00 PM); Afternoon (1:00 PM - 4:00 PM); Evening (4:00 PM - 7:00 PM); Any time. Blank is valid; unknown nonempty values fail. All timing and arrival selections are preferences, never guaranteed appointments.

## 5. Budget and preferred BrainWorker

Budget may be omitted. A nonempty amount must be positive and finite, with at most two decimal places. Reject zero, negatives, exponent notation, currency text, separators, ranges, and malformed values. No arbitrary business cap is introduced. Require `fixed` labelled Fixed or `negotiable` labelled Negotiable when an amount exists. A blank amount omits both amount and type from the meaningful summary/reference snapshot; safe editing state can remain in memory. Budget is not a quote, price lock, payment authorization, or acceptance.

| Allowed ID | Display name |
|---|---|
| `bw-1` | Engr. Emeka Nwosu |
| `bw-2` | Babatunde Adebayo |
| `bw-3` | Chinedu Eze |
| `bw-4` | Tariq Olanrewaju |

These are existing public mock identities, not evidence of real availability. Selection and review expose only these names and IDs. No photos, ratings, rates, counts, availability, verification, assignment, or matching claims. Removing a preference is supported. It is only a preference, never a booking or assignment.

## 6. Commitment, result, and recovery

At Review, show the label `Mock-auth preview`, this notice, and the exact action below:

> This local preview does not sign you in, create an account, or send a request.

**Action:** `Continue in local preview`.

There is no real sign-in, account creation, login handoff, identity invention, or credential/contact collection. Use minimal editing, previewing, error, and preview-ready states. Allow one pending preview interaction at a time, disable the commitment action while pending, and ignore duplicate taps. Do not imply server idempotency or queued requests.

Successful local generation uses the exact heading `Local request preview` and explains that no platform request was sent or stored. The normalized in-memory summary must render the exact text `Local preview reference: REQ-xxxxx`, where the value matches `REQ-\d{5}` and is generated through the existing local-preview helper. It is not a server receipt, durable identifier, or globally unique guarantee. Never claim Request received, confirmed booking, assignment, payment, matching, or a Jobs-tab/activity-history update.

A deterministic developer/test failure option exercises a truthful local error and Retry without adding public debug controls. Preserve every draft value and preference on failure. Retry revalidates the complete draft and current date. Identical normalized active inputs produce the same reference; edits clear stale results/errors. Local preview works without network access and must not claim offline submission or queued delivery.

## 7. Privacy, accessibility, and visual boundaries

Keep draft, address, worker preference, normalized snapshot, reference, and error state only in memory. No AsyncStorage, SecureStore, URL, logs, analytics containing draft data, API/network request, activity repository write, or production record. No media upload, geolocation, or device permissions. [THEME-001](THEME-001-light-dark-toggle.md) theme-preference storage remains separate and unchanged.

Reuse current native tokens, form controls, calendar/local-preview helpers, navigation, and both themes. No native restyling, web/PWA Outlier transplant, new toggle, dependency, or broad refactor. Expose Step X of 5, accessible labels and selection states, readable inline errors, logical focus after navigation/errors/results, and text alternatives for meaningful controls. Minimum targets: 44pt on iOS and 48dp on Android. Keep content and actions clear of safe areas and the keyboard. Support Dynamic Type, reduced motion, and screen-reader navigation without relying on color alone.

## 8. Implementation boundary and acceptance

The accepted implementation covers the native `/post-job` route, native job-posting helper/constants, focused tests, only the minimal directly required homepage entry action and root-stack route registration, and QA/checklist evidence. It reuses the native catalog in `apps/mobile/lib/services.ts` and existing form-kit/local-preview/theme/calendar components. This approved slice includes only the minimal secondary `Post a Job` action on the existing native homepage and the native root-stack route registration needed to access `/post-job`. Keep it secondary to existing discovery/primary actions. Do not add a new section, card, layout, homepage redesign, navigation system, or unrelated UI change; preserve the current layout and existing content.

Shared `validateCustomerJobDraft` does not fully enforce real dates, enums, budget, or IDs; the native boundary must implement this specification without changing shared contracts in this slice.

Delegated PM implementation acceptance was recorded on 2026-10-31 for this native in-memory local-preview scope. The [QA report](../reports/MOB-POST-001-native-job-posting-qa.md) records 136/136 mobile tests across 14 files, including 8 native-focus regressions that execute the route's actual focus effect and verify web DOM focus versus native API dispatch. These regressions prove tested API dispatch, not actual native runtime or screen-reader behavior. The full compiled Expo journey and validation/navigation/focus checks passed. The 50-check browser-emulation audit covered light portrait, dark landscape and dark small portrait, with native-only checks recorded as unverified. Mobile type-check still exits 2 on the same 11 pre-existing unrelated diagnostics; the posting route and test add none. TypeScript is not green.

The QA report's pending-PM wording records the earlier QA status. This specification records the later delegated PM acceptance without changing that report.

Accepted implementation and verification record:

- [x] Exact five steps, correct fields, blank defaults, optional omission, and strict type/enum/catalog/city/worker checks.
- [x] Trimmed text boundaries, malformed budgets, valid/leap/rollover/past dates, midnight recheck, and correct inactive-field omission.
- [x] Back/Continue/Review editing preserves all input; exit/reset discards memory; browser error focus and accessible progress are verified. Native focus API dispatch is regression-tested, not device-verified.
- [x] Exact mock-auth notice/action/result, duplicate-action prevention, deterministic reference, simulated failure, and safe Retry.
- [x] No network, storage, logging/analytics of draft data, activity writes, real auth, payment, uploads, or other-tab changes.
- [x] Browser-emulation checks recorded for both approved themes, keyboard entry, portrait/landscape, browser reduced motion, and CSS-pixel touch targets. CSS-pixel measurements do not establish native 44pt or 48dp targets.
- [ ] Native-only QA remains unverified: actual iOS/Android runtime, VoiceOver/TalkBack, native safe-area and soft-keyboard behavior, Dynamic Type, OS reduced motion, and native 44pt/48dp touch targets.
- [x] Focused unit/integration checks and compiled Expo route QA recorded with their limits. Expo web/mobile emulation is not native-runtime proof; unavailable native and assistive-technology QA remains explicitly unverified.
- [x] A continuous 8.68-second screen recording from the running Expo browser emulation covers all five steps through Local request preview and is saved at `docs/screenshots/videos/expo-mob-post-001-job-posting-verification.webm`. This recording does not constitute native Android/iOS simulator QA.
- [x] The current homepage exposes the secondary `Post a Job` action and opens the registered `/post-job` route, while existing homepage layout and primary action remain unchanged.

Checked items record the accepted implementation and available unit/integration/browser evidence. The unchecked native-only item records outstanding device QA, not pending PM acceptance. No native-only requirement is claimed verified or waived. Backend, database, schema, migration, server/API, payment, production authentication/persistence, matching, dispatch, notifications, and web/PWA work are excluded. Phase 4.2.2 remains IN PROGRESS.

# MOB-002: Native Booking Preparation and Multi-Step Job Posting

**Document ID:** MOB-002
**Status:** Draft (not implementation authority)
**Checklist Item:** 4.2.2 Native booking preparation and multi-step job posting forms
**Governing Authority:** `docs/04-public-website/WEB-007-PUBLIC-BOOKING-PREPARATION.md`, `docs/04-public-website/WEB-007A-BOOKING-PREPARATION-DESIGN-BRIEF.md`, `docs/04-public-website/WEB-009-CUSTOMER-JOB-POSTING.md`, `docs/04-public-website/WEB-009A-CUSTOMER-JOB-POSTING-DESIGN-BRIEF.md`, `docs/04-public-website/APPROVED-ARTIFACT-MATRIX.md`, and `docs/21-decision-log/MOB-002-WEB-009A-APPROVAL-RECONCILIATION.md`

> **Authority notice, 2026-10-30 (updated):** This combined working draft does not authorize implementation. Native `/book` has a separate scoped approval in `MOB-BOOK-001-DEC-001` and `docs/specs/MOB-BOOK-001-native-booking-preparation.md`. Native `/post-job` is now approved for implementation under `MOB-POST-001-DEC-001` and `docs/specs/MOB-POST-001-native-job-posting.md` (owner-delegated PM approval, 30 Oct 2026); implementation is scoped native only and now authorized, not pending. The canonical WEB-009 product authority is now `docs/specs/WEB-009-customer-job-posting.md` (approved v1.1). WEB-009A sections 30-31 remain untouched and their design/implementation gates are not established by this record. MOB-002 remains non-authoritative historical planning.

---

## 1. Scope

### 1.1 Objective

Add two customer form journeys to `apps/mobile`:

1. **Booking preparation** at `/book`, a single preparation screen for a selected catalog service.
2. **Job posting** at `/post-job`, a five-step request form for work the customer describes.

Both journeys reuse the approved WEB-007 and WEB-009 product behavior and the shared validation rules in `@bukiebrainjobs/validation`. Both stop at a local preview confirmation. Neither creates a production record.

### 1.2 Entry points

- Service detail (`app/services/[id].tsx`): a `Prepare booking request` action pushes `/book?serviceId=<id>`.
- Marketing homepage (`app/index.tsx`): a secondary `POST A JOB` action pushes `/post-job`, consistent with the locked homepage rule that job posting remains a secondary path.

### 1.3 Non-goals

- No web or PWA changes.
- No backend, database, schema, migration, Supabase, server, API, or payment work.
- No production authentication. There is no login handoff in this slice.
- No matching, assignment, dispatch, notification, or escrow behavior.
- No native visual restyling. The existing Obsidian Titanium Gunmetal Dark tokens and native navigation patterns stay in place.
- No attachments, media upload, geolocation, or device permissions.
- No changes to `home.tsx`, `jobs.tsx`, `messages.tsx`, or `profile.tsx`.

---

## 2. Source Crosswalk

| Mobile surface | Approved source | What is reused |
|---|---|---|
| Booking draft type and field rules | `packages/validation/src/prototypeFormValidation.ts` | `BookingDraft`, `validateBookingDraft`, `getPrototypeSubmissionOutcome` |
| Job draft type and field rules | `packages/validation/src/prototypeFormValidation.ts` | `CustomerJobDraft`, `validateCustomerJobDraft`, `ACTIVE_MARKETPLACE_CITIES` |
| Service catalog | `apps/mobile/lib/services.ts` | `CANONICAL_SERVICES`, `getServiceById`, `MobileServiceCategory` |
| Visual tokens | `apps/mobile/lib/theme.ts` | `obsidianDarkTokens`, `mono` |
| Product behavior | WEB-007, WEB-009 | Section order, validation timing, honest confirmation, draft preservation on failure |
| Approval | `APPROVED-ARTIFACT-MATRIX.md`, `MOB-002-DEC-001` | WEB-007A and WEB-009A are approval records for this slice |

Native adaptation decisions:

- The web flow requires authentication at submission. This slice has no authentication implementation, so the native flow stops at a local preview confirmation and says so.
- The web booking screen reads service, worker, city, and date from query parameters. Native accepts only `serviceId`, validates it against the local catalog, and ignores unknown or invalid values.
- The web job form supports a preferred BrainWorker. Native omits the preference in this slice because there is no worker directory on mobile.
- The shared job validator requires an active marketplace city. Native uses the same list and shows it as helper text, with the local preview notice so the list is not read as live coverage today.

---

## 3. Domain Contracts

### 3.1 `apps/mobile/lib/local-preview.ts`

- `buildLocalPreviewReference(prefix, draft)`: deterministic `BKG-xxxxx` or `REQ-xxxxx` from a small string hash. Same draft input produces the same reference, which keeps tests stable and makes clear the code is simulated.
- `isValidDateString(value)`: `YYYY-MM-DD` shape check plus real calendar check.

### 3.2 `apps/mobile/lib/booking-preparation.ts`

- `ARRIVAL_WINDOWS`: Morning, Afternoon, Evening, Flexible.
- `PAYMENT_PREFERENCES`: Card, Bank transfer, USSD. These are preferences only.
- `BookingPreparationDraft`: serviceId, city, streetAddress, landmark, preferredDate, arrivalWindow, jobDescription, paymentPreference.
- `createEmptyBookingDraft(serviceId)`.
- `normalizeServiceId(value)`: returns a catalog id or an empty string. Any other input is discarded.
- `validateBookingPreparation(draft)`: wraps `validateBookingDraft`, adds a missing service error, and returns a flat error map keyed by field.
- `submitBookingPreparationRequest(draft, options)`: returns either a confirmation payload or a failure reason. Uses `getPrototypeSubmissionOutcome` so `mockError` can force the failure path.

### 3.3 `apps/mobile/lib/job-posting.ts`

- `JOB_STEPS`: `service`, `details`, `location`, `schedule`, `review`.
- `JOB_STEP_TITLES`, `getStepNumber`, `getNextStep`, `getPreviousStep`.
- `NOT_SURE_CATEGORY = 'not-sure'`.
- `JOB_TYPE_OPTIONS`, `URGENCY_OPTIONS`, `BUDGET_TYPE_OPTIONS`.
- `JobPostingDraft`: jobType, categoryId, title, description, city, streetAddress, landmark, urgency, preferredDate, arrivalWindow, budget, budgetType.
- `validateJobStep(step, draft)`: step-scoped errors so a customer is not blocked by a later field.
- `validateJobPosting(draft)`: full validation, wrapping `validateCustomerJobDraft` and adding category and budget checks.
- `getCategoryTitle(categoryId)`: service title, `General service request` for `not-sure` or blank.
- `submitJobPostingRequest(draft, options)`: confirmation payload or failure reason.
- `getFirstInvalidStep(errors)`: maps a full error map back to the earliest step.

---

## 4. Screen Contracts

### 4.1 Booking preparation (`app/book.tsx`)

Sections in order: Service, Location, Schedule, Work details, Payment preference, Summary.

- Service: selectable list of the 8 catalog services, prefilled and selected when `serviceId` is valid.
- Location: city, street address, optional landmark.
- Schedule: preferred date in `YYYY-MM-DD`, arrival window chips.
- Work details: description, minimum 20 characters.
- Payment preference: Card, Bank transfer, USSD. Copy says this is a preference and no payment is taken.
- Summary: service title, location, date and window, payment preference.
- Submit: `Prepare booking request`.
- Success: `Booking request prepared`, simulated `BKG-xxxxx` reference, and a plain statement that no booking was created, no payment was taken, and no BrainWorker was assigned.
- Failure: calm error card, draft preserved, `Try again` action.
- Invalid or missing `serviceId`: no crash. The service list is shown unselected and the customer must pick one.

### 4.2 Job posting (`app/post-job.tsx`)

Five steps with a visible `Step n of 5` label and step title.

1. **Service**: job type (specific service or broader project) and optional category, including `I'm not sure`.
2. **Details**: title (10 to 100 characters) and description (20 to 1000 characters).
3. **Location**: city, street address, optional landmark.
4. **Schedule**: urgency, preferred date when a specific date is chosen, optional arrival window, optional budget and budget type.
5. **Review**: summary rows with per-step `Edit` actions, then `Submit job request`.

- Continue validates only the current step.
- Submitting from review validates everything. If something fails, the screen opens the first invalid step and shows an error summary.
- Success: `Request received`, simulated `REQ-xxxxx` reference, next-step copy that does not promise matching, assignment, payment, or a booking.
- Failure: error card, all entered values preserved, `Try again` action.

---

## 5. Shared Form Primitives (`apps/mobile/components/form-kit.tsx`)

- `FormScreen`: safe area, keyboard avoidance, scroll container.
- `FormHeader`: 48x48 back button, step or section label.
- `PreviewNotice`: the existing LOCAL PREVIEW pattern with task-specific copy.
- `Field`: label, input, helper, error. Error text uses `accessibilityLiveRegion="polite"` and the input carries the error through `accessibilityHint`.
- `ChoiceChips`: horizontal chip row with `accessibilityState={{ selected }}` and 48dp targets.
- `ErrorSummary`: announces the first error and lists the rest.
- `PrimaryButton`, `SecondaryButton`: 48dp minimum, disabled and pending states.
- `SummaryRow`: label and value for review surfaces.

---

## 6. States and Accessibility

Required states per screen: default, populated, validation error, submission pending, success, failure, and invalid entry context.

- Every interactive control is at least 48x48dp.
- Safe areas on all edges.
- Keyboard avoidance on iOS and resize handling on Android.
- Back behavior: header back leaves the form, except inside the job flow where back returns to the previous step. Footer `Back` is explicit.
- Screen headings use `accessibilityRole="header"`.
- Selections expose `selected` state.
- Errors are text, not color alone.
- Reduced motion is respected by using no decorative animation.

---

## 7. Boundaries and Honesty

- Copy never says booked, confirmed, matched, assigned, paid, or reserved.
- Booking payment is a preference only.
- A simulated reference is labeled as a local preview reference.
- Starting price is not shown because the native catalog has no price data. No price is invented.
- City availability is not claimed. The active city list is validation input, not a coverage promise.

---

## 8. Acceptance Criteria

- [ ] `/book` renders and validates every booking field, preserves the draft on failure, and reaches a local confirmation.
- [ ] `/post-job` renders five steps, validates per step and at review, supports back and edit, and reaches a local confirmation.
- [ ] Invalid `serviceId` input is safely ignored.
- [ ] Both screens reuse shared validation instead of duplicating field rules.
- [ ] All new interactive elements meet 48dp.
- [ ] Focused unit and integration tests pass.
- [ ] `apps/mobile` type-check passes.
- [ ] Expo web export succeeds and the compiled app is exercised through the real route flow.
- [ ] No backend, database, auth, payment, deployment, commit, or push work occurs.

---

## 9. Verification Plan

- Unit tests for both domain modules, including invalid input, per-step validation, deterministic references, and failure outcomes.
- Integration tests that assert route registration, entry wiring, honest copy, import of shared validation, and 48dp targets in both screens.
- Type-check in `apps/mobile`.
- Expo web export, then Playwright against the exported app with mobile portrait and landscape captures and a screen recording.
- Native simulator availability is checked first. If unavailable, the report states that plainly and records the emulated compiled-app coverage instead.

---

## 10. Known Limitations

- No production authentication, persistence, matching, or payment.
- No native iOS or Android runtime in this environment unless a simulator is proven available.
- The preview reference is simulated and not stored after the screen resets.

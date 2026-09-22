# UX & Design Specification: WEB-016 Customer Reviews & Reputation System (v1.1)

| Field | Value |
|---|---|
| **Document ID** | WEB-016-UX |
| **Feature** | Customer Reviews & Reputation System |
| **Status** | 🟡 Proposed for UX Approval (Revised v1.1) |
| **Version** | 1.1 |
| **Workstream** | Phase 1 — Customer Web Platform Completion |
| **Governing Loop** | Mr. Solomon 9-Command Engineering Loop (`/architect` ➔ UX Gate) |
| **Architecture Reference** | WEB-016 Architecture Contract v1.2 (Approved) |
| **Scope Reference** | WEB-016 Scope & Product Contract v1.0 (Approved) |
| **Date** | 2026-09-21 |

---

## 1. Design Doctrine & Content Standards

The customer reviews experience must feel like a natural, integral part of the approved BukieBrainJobs platform. It enforces the following core standards:

1. **Honest, Pressure-Free Voice**:
   - The UI never begs for a 5-star rating or implies that high ratings are expected.
   - Text is direct, factual, and customer-centric, following `bukiebrainjobs-content-style` and `mr-solomon-natural-voice`.
   - Em dashes (`—` or `--`), empty cheerleading, and corporate filler are strictly forbidden.

2. **Calm Visual System & Semantic Token Authority**:
   - Canvas: `#F8F9FF` (quiet off-white base).
   - Brand Navy: `#001A41` (headings, primary actions, dense structural surfaces).
   - Supporting Green: `#296A4B` (verified badges, positive accents, secondary emphasis).
   - Highlight Mint: `#ABEEC8` (focus rings, subtle selection pills).
   - Star Accent: `brandColors.amber[500]` / `text-amber-500` (the approved brand accent token from `packages/ui/src/tokens/colors.ts` and `DESIGN.md`).
   - Unselected Stars: `text-slate-300` border/fill.
   - Geometry: Compact `rounded-xl` and `rounded-2xl` containers. No arbitrary pill shapes.
   - Contrast: Meets or exceeds WCAG 2.2 AA (4.5:1 for body copy, 3:1 for interactive controls).

3. **Multi-Dimensional State Truth**:
   - The UI renders authoritative state; it never manufactures state.
   - Forms fail closed if authorization, lifecycle state (`JobStatus !== 'COMPLETED'`), or network connectivity checks fail.
   - Financial actions (such as viewing a receipt) are rendered only when the authoritative payment context confirms availability.

---

## 2. Information Architecture & Customer Surfaces

The review experience is distributed across four coordinated surfaces:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Surface 1: Customer Activity Detail (/jobs?id=...)                          │
│ ├── Post-completion review prompt card (when JobStatus === 'COMPLETED')     │
│ ├── Conditional "View Receipt" action (ONLY if receiptAvailable === true)   │
│ └── "Review Submitted" summary badge (when already reviewed)                │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ Opens Modal
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ Surface 2: Review Submission Modal (ReviewPromptModal)                      │
│ ├── Completed booking context header (Worker name, service, date)           │
│ ├── 4-Criterion Star Rating inputs (Unselected initial state, radio ARIA)   │
│ ├── Written feedback textarea with live 1,000-character counter             │
│ └── Atomic submission action & error alerts                                 │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ Surface 3: Public BrainWorker Profile (/brainworkers/[brainworkerId])       │
│ ├── Sub-navigation tabs: "Service focus" | "Customer reviews (N)"           │
│ ├── Reputation Summary Panel (Overall score, criteria breakdown, bars)      │
│ ├── Verified Customer Review Cards (Masked names, "Verified booking" badge) │
│ └── "Load more reviews" pagination                                          │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ Opens Modal (Auth Gated)
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ Surface 4: Abuse Flagging Modal (ReportReviewModal)                         │
│ ├── Authenticated gate (redirects unauthenticated visitors to sign in)      │
│ ├── Moderation reason selector & unconstrained optional details             │
│ └── Deduplicated, non-destructive report submission                         │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Detailed Component Specifications

### 3.1 Surface 1: Completed Booking Review Prompt (`/jobs?id=...`)

#### Placement
Located inside `LifecycleStateSurface.tsx` within the **Block 4 (Lifecycle Actions)** section of the customer activity detail pane when `activity.jobStatus === 'COMPLETED'`.

#### Decoupled Financial Actions Rule
`View Receipt` appears **only** when the authoritative payment context indicates that a receipt is available (`paymentContext?.receiptAvailable === true`, meaning escrow status is `held_in_escrow`, `release_pending`, or `released`). The review prompt card is fully decoupled from receipt presence and remains fully functional regardless of whether a receipt exists.

#### Visual Structure
- Container: White card with thin neutral border (`border-slate-200`), rounded-2xl padding (`p-5 sm:p-6`), subtle shadow.
- Context Header:
  - Small uppercase badge: `COMPLETED JOB • FEEDBACK`
  - Headline: `Rate your experience with [BrainWorker Name]`
  - Subtitle: `Share your experience with this completed service. Your feedback helps other customers understand the service.`
- CTA Group:
  - Primary Action: `Leave a review` button (solid navy `#001A41`, white text, star icon, minimum 44px touch target).
  - Supporting Action: `View Receipt` link/button (rendered **only** when `paymentContext?.receiptAvailable === true`).

#### Already-Reviewed State
If `getReviewEligibility` returns `reason: 'already_reviewed'`:
- The prompt is replaced by a calm confirmation card:
  - Small green badge: `REVIEW SUBMITTED`
  - Headline: `You reviewed this booking on [Date]`
  - Overall score rendered with static stars (`★ 5.0`)
  - Link: `View on [BrainWorker Name]'s profile` (deep-links to public profile reviews tab).

#### Offline State
If the customer is offline:
- Primary button is disabled with tooltip/explainer: `Review submission requires an active network connection.`

---

### 3.2 Surface 2: Review Submission Modal (`ReviewPromptModal`)

#### Presentation
- **Desktop ($\ge 768\text{px}$)**: Centered modal dialog with backdrop overlay (`bg-slate-950/60 backdrop-blur-xs`), max width `max-w-xl` (576px), `rounded-2xl`, white surface, explicit close button (`X` in top-right), dismiss on `Escape`.
- **Mobile ($< 768\text{px}$)**: Standard accessible bottom sheet pinned to viewport bottom with `rounded-t-2xl`, scrollable inner content, and explicit close button. No gesture-based drag-to-dismiss.

#### Initial Unselected State (Strict No-Default Rule)
All four rating criteria begin **completely unselected**. No criterion defaults to a positive or neutral rating.

```
┌────────────────────────────────────────────────────────────────┐
│ [Modal Header]                                             [X] │
│ Review completed service                                       │
│ [Service Title] • Completed by [BrainWorker Name]              │
├────────────────────────────────────────────────────────────────┤
│ [Section 1: The 4 Required Rating Criteria]                    │
│                                                                │
│ 1. Punctuality                                                 │
│    Did the BrainWorker arrive within the scheduled window?     │
│    [ ☆ ] [ ☆ ] [ ☆ ] [ ☆ ] [ ☆ ]  Select a rating              │
│                                                                │
│ 2. Work quality                                                │
│    Was the work executed to your complete satisfaction?        │
│    [ ☆ ] [ ☆ ] [ ☆ ] [ ☆ ] [ ☆ ]  Select a rating              │
│                                                                │
│ 3. Communication                                               │
│    Was the BrainWorker clear, respectful, and responsive?      │
│    [ ☆ ] [ ☆ ] [ ☆ ] [ ☆ ] [ ☆ ]  Select a rating              │
│                                                                │
│ 4. Overall experience                                          │
│    How would you rate the overall completed job?               │
│    [ ☆ ] [ ☆ ] [ ☆ ] [ ☆ ] [ ☆ ]  Select a rating              │
├────────────────────────────────────────────────────────────────┤
│ [Section 2: Written Feedback (Optional)]                       │
│ Written feedback (optional)                                    │
│ Describe the service, workmanship, and overall experience.     │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │                                                            │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                               0 / 1,000 chars  │
├────────────────────────────────────────────────────────────────┤
│ [Footer Actions]                                               │
│ [Cancel]                                       [Submit review] │
└────────────────────────────────────────────────────────────────┘
```

#### Rating Control Interaction & Accessibility Specification
- Semantic Structure:
  ```html
  <div role="radiogroup" aria-label="Punctuality rating" aria-required="true">
    <button type="button" role="radio" aria-checked="false" aria-label="1 of 5 stars, Poor" ... />
    <button type="button" role="radio" aria-checked="false" aria-label="2 of 5 stars, Fair" ... />
    <button type="button" role="radio" aria-checked="true"  aria-label="3 of 5 stars, Good" ... />
    <button type="button" role="radio" aria-checked="false" aria-label="4 of 5 stars, Very good" ... />
    <button type="button" role="radio" aria-checked="false" aria-label="5 of 5 stars, Excellent" ... />
  </div>
  ```
- Interactive Touch Targets:
  - Each star option has a minimum bounding box of **$44 \times 44\text{px}$** (using an invisible touch target wrapper or padding), even though the visible star icon is 28px on desktop and 32px on mobile.
- Visual Feedback:
  - Unselected: `text-slate-300` (open/empty star).
  - Selected / Hovered: `text-amber-500` (filled star using approved `brandColors.amber[500]`).
  - Active selection label rendered beside stars:
    - `1 of 5 • Poor`
    - `2 of 5 • Fair`
    - `3 of 5 • Good`
    - `4 of 5 • Very good`
    - `5 of 5 • Excellent`
- Keyboard Navigation:
  - `Tab` moves focus between criteria radiogroups.
  - Within a radiogroup, `ArrowLeft` and `ArrowRight` (or `ArrowDown` and `ArrowUp`) navigate between stars, updating the active selection. `Space` or `Enter` selects.

#### Written Feedback Textarea & Character Counter
- Label: `Written feedback (optional)`
- Helper Text: `Describe the service, workmanship, and overall experience.`
- Textarea styling: `rounded-xl border border-slate-200 focus:border-[#001A41] focus:ring-2 focus:ring-[#ABEEC8] p-3 text-sm min-h-[110px]`.
- Live Character Counter:
  - Placed below the textarea, right-aligned.
  - Format: `{count} / 1,000 characters`.
  - Color transitions:
    - Normal (0 to 900 chars): `text-slate-400`.
    - Approaching limit (901 to 999 chars): `text-amber-600 font-semibold`.
    - Limit reached (1,000 chars): `text-slate-900 font-bold`.
    - Exceeded (> 1,000 chars): `text-rose-600 font-bold`.
  - ARIA: Live region `aria-live="polite"` announces count changes cleanly.
  - Overflow guard: If character count exceeds 1,000, submission is disabled and an inline error appears: `Written feedback cannot exceed 1,000 characters.`

#### Submission Feedback & Success Screen
- While submitting:
  - Submit button displays spinner (`RefreshCw className="animate-spin"`) with label: `Submitting review...`.
  - All form controls are locked.
- Upon success:
  - Modal transitions to confirmation screen:
    - Green checkmark icon (`CheckCircle2` in `#296A4B`).
    - Headline: `Thank you for your feedback`
    - Body: `Your review has been published on [BrainWorker Name]'s public profile.`
    - Primary CTA: `Done` (closes modal, updates parent activity state).

---

### 3.3 Surface 3: Public BrainWorker Profile Review Experience (`/brainworkers/[brainworkerId]`)

#### Placement & Sub-Navigation Tabs
Located on `/brainworkers/[brainworkerId]/page.tsx`.
A sub-navigation bar is positioned below the hero:
- Tab 1: `Service focus` (displays listed skills & service categories).
- Tab 2: `Customer reviews ({totalReviews})` (renders the review feed).

#### 3.3.1 Reputation Summary Card
When the "Customer reviews" tab is active:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ BrainWorker Reputation                                                      │
│ Verified feedback from completed BukieBrainJobs bookings                    │
│                                                                             │
│ ┌───────────────┐  ┌──────────────────────────────────────────────────────┐ │
│ │     4.9       │  │ Rating Breakdown                                     │ │
│ │   ★★★★★       │  │ Punctuality      4.9  ████████████████████░░         │ │
│ │ 28 reviews    │  │ Work quality     5.0  ██████████████████████         │ │
│ │ Verified      │  │ Communication    4.8  ███████████████████░░░         │ │
│ │ bookings only │  │ Overall          4.9  ████████████████████░░         │ │
│ └───────────────┘  └──────────────────────────────────────────────────────┘ │
│                                                                             │
│ Rating Distribution                                                         │
│ 5 stars  ████████████████████████████████ (24)                              │
│ 4 stars  ████ (3)                                                           │
│ 3 stars  █ (1)                                                              │
│ 2 stars  (0)                                                                │
│ 1 star   (0)                                                                │
└─────────────────────────────────────────────────────────────────────────────┘
```

- Primary Metric: Large bold font (`text-5xl font-display font-extrabold text-[#001A41]`), e.g., `4.9`.
- Stars: Rendered using `brandColors.amber[500]` (`text-amber-500`).
- Verification Callout: Small pill with shield icon: `Verified bookings only` (factual claim; no unsupported percentages).
- Progress Bars: Rounded meters using `bg-[#001A41]` fill on `bg-slate-100` track.

#### 3.3.2 Public Review Feed Cards & "Load More" Pagination
Each review card includes:
- Reviewer Metadata:
  - Masked Name: `Babajide A.` (bold `#001A41`).
  - Verified Booking Badge: Small green pill `Verified booking` (`bg-[#296A4B]/10 text-[#296A4B] font-semibold text-xs`).
  - Service Context: `Service: AC Deep Chemical Cleaning`.
  - Date: e.g. `September 2026` (text-xs text-slate-400).
- Criteria Micro-Ratings:
  - Row of compact tags: `Punctuality: 5` • `Quality: 5` • `Communication: 4` • `Overall: 5`.
- Customer Feedback Text:
  - Rendered safely as plain text in `text-sm text-slate-700 leading-relaxed`.
  - If no written comment was provided, only the ratings and service context are rendered.
- Abuse Flagging Action:
  - Discreet link in card footer: `Report this review` (`text-xs text-slate-400 hover:text-slate-600 underline-offset-2 hover:underline`).

#### Pagination Behavior ("Load More" Pattern)
- Initial load: First 5 reviews.
- When more reviews exist:
  - `Load more reviews` secondary button.
- While fetching:
  - Button shows `Loading reviews...` with `RefreshCw` spinner; button disabled.
- On fetch failure:
  - Inline error: `Unable to load more reviews. Retry` action.
- When all reviews are loaded:
  - Calm text footer: `Showing all {totalCount} reviews`.

#### Empty Review State
If `totalReviews === 0`:
- Headline: `No customer reviews yet`
- Description: `Reviews appear here once customers complete bookings with this BrainWorker.`
- Visual: Calm clipboard illustration in neutral slate tones.

---

### 3.4 Surface 4: Abuse Flagging Modal (`ReportReviewModal`)

#### Purpose & Authentication Guard
- **Authentication Rule**: Unauthenticated visitors may view public reviews but cannot submit reports. Selecting `Report this review` while unauthenticated opens the approved authentication gate (or redirects to `/login?returnUrl=...` with the preserved review reference). No report submission occurs before authentication.
- **Reporting Deduplication**: A customer can report a specific review at most once.
- **Self-Reporting Guard**: A customer cannot report their own review.
- **Non-Destructive**: Reporting creates a moderation ticket; it does not delete or alter the review.

#### Content & Form Structure
- Title: `Report a customer review`
- Subtitle: `Tell us why you believe this review should be reviewed.`
- Radio Group (`AbuseReportReason`):
  1. `Inappropriate or abusive language`
  2. `False or fabricated information`
  3. `Harassment or personal attack`
  4. `Spam, promotional, or advertising content`
  5. `Privacy violation (contains personal contact details)`
  6. `Other issue`
- Optional Details Field:
  - Label: `Additional details (optional)`
  - Helper Text: `Provide any additional context that will assist our moderation team.`
  - Textarea: Unconstrained length per approved Architecture Contract.
- Action Buttons:
  - `Cancel` (secondary)
  - `Submit report` (primary `#001A41`).
- Confirmation Screen:
  - Headline: `Report received`
  - Body: `Thank you. Our moderation team has received your report.`
  - Button: `Close`.

---

## 4. Interaction States Matrix

### 4.1 Review Form Submission States

| State | Visual Manifestation | Interactive Controls | Recovery / Next Action |
|:---|:---|:---|:---|
| `idle` | Pristine form; all star inputs unselected (`Select a rating`); textarea empty. | All controls active. | User selects stars or begins typing. |
| `editing` | Stars selected; live character counter active. | All controls active; submit button enabled if 4 criteria chosen. | User submits form or cancels. |
| `submitting` | Submit button spinner active; form fields locked/disabled. | All inputs disabled. | System awaits authoritative repository response. |
| `submitted` | Confirmation screen with green checkmark and "Done" button. | Modal dismiss only. | User clicks "Done"; parent detail re-fetches. |
| `validation_error` | Inline red border on unselected star groups or red character counter. | All controls active. | User corrects invalid fields. |
| `authorization_error` | Red alert banner: "You do not have permission to review this booking." | Form locked; close button only. | User dismisses modal. |
| `repository_error` | Amber alert banner: "Unable to submit review. Please try again." | Inputs re-enabled; draft text preserved. | User clicks "Submit review" to retry. |
| `offline` | Gray alert banner: "You are offline. Review submission is unavailable." | Form rendered read-only; submit button disabled. | Connect to network to restore submission. |
| `already_reviewed` | Summary card showing previously submitted rating & date. | View on profile link active. | User navigates to profile. |
| `ineligible` | Gray banner: "Reviews are available once the booking is completed." | Modal cannot be opened; prompt hidden. | Complete job lifecycle first. |

### 4.2 Abuse Reporting States

| State | Visual Manifestation | Interactive Controls |
|:---|:---|:---|
| `report_not_submitted` | Pristine reporting dialog with reason radio options. | Radios and submit active. |
| `report_submitting` | Button spinner active: `Submitting report...`. | Inputs disabled. |
| `report_submitted` | Success confirmation: "Report received". | Close button active. |
| `report_already_submitted` | Info banner: "You have already submitted a report for this review." | Close button active. |
| `report_failed` | Red error banner: "Unable to submit report. Please try again." | Retry active. |

---

## 5. Exact Customer-Facing Copy & Microcopy

All text follows BukieBrainJobs approved terminology and natural human voice:

| Key | Approved Copy Text | Content Standard |
|:---|:---|:---|
| Prompt Headline | `Rate your experience with {workerName}` | Direct, personal, action-focused. |
| Prompt Subtext | `Share your experience with this completed service. Your feedback helps other customers understand the service.` | Factual; references verified service. |
| Prompt CTA | `Leave a review` | Standard action verb. |
| Receipt CTA | `View Receipt` | Rendered only when `receiptAvailable === true`. |
| Modal Title | `Review completed service` | Clear H1 identifier. |
| Criteria 1 | `Punctuality` • `Did the BrainWorker arrive within the scheduled window?` | Concrete evaluation question. |
| Criteria 2 | `Work quality` • `Was the work executed to your complete satisfaction?` | Concrete evaluation question. |
| Criteria 3 | `Communication` • `Was the BrainWorker clear, respectful, and responsive?` | Concrete evaluation question. |
| Criteria 4 | `Overall experience` • `How would you rate the overall completed job?` | Primary evaluation question. |
| Unselected Prompt | `Select a rating` | Visible unselected placeholder state. |
| Selected Label | `{star} of 5 • {label}` (e.g. `4 of 5 • Very good`) | Explicit numeric and qualitative text. |
| Textarea Label | `Written feedback (optional)` | Explicit optionality. |
| Textarea Helper | `Describe the service, workmanship, and overall experience.` | Actionable writing prompt. |
| Counter Format | `{count} / 1,000 characters` | Explicit character constraint. |
| Validation Missing | `Please select a rating for all four criteria.` | Specific error prompt. |
| Validation Overflow | `Written feedback cannot exceed 1,000 characters.` | Actionable error prompt. |
| Success Headline | `Thank you for your feedback` | Respectful, calm closure. |
| Success Subtext | `Your review has been published on {workerName}'s public profile.` | Explains immediate outcome. |
| Offline Notice | `You are currently offline. Review submission requires an active network connection.` | Clear explanation and cause. |
| Profile Tab | `Customer reviews ({count})` | Explicit marketplace terminology. |
| Verified Badge | `Verified booking` | Builds marketplace trust honestly. |
| Verification Callout | `Verified bookings only` | Honest platform guarantee; no percentage claims. |
| Empty Feed | `No customer reviews yet` | Calm empty state; no artificial ratings. |
| Load More CTA | `Load more reviews` | Clear pagination action. |
| Load More Loading | `Loading reviews...` | Descriptive progress indicator. |
| Load More End | `Showing all {totalCount} reviews` | Definitive boundary. |
| Report CTA | `Report this review` | Discreet moderation action. |
| Report Subtitle | `Tell us why you believe this review should be reviewed.` | Action-oriented explanation. |
| Report Success | `Thank you. Our moderation team has received your report.` | Professional, non-committal confirmation. |

---

## 6. Responsive Behavior (Desktop vs Mobile)

### Desktop Website ($\ge 768\text{px}$)
- Review prompt appears integrated within the `ActivityDetail` pane on `/jobs`.
- Review submission renders as a centered modal dialog (`max-w-xl`, 576px width) with smooth opacity fade.
- Profile reviews tab uses a two-column desktop layout: left column (360px) holds the reputation summary card and distribution bars; right column holds the review feed.
- Star buttons scale smoothly on hover (`hover:scale-110`).

### Mobile Web App ($< 768\text{px}$)
- Review prompt is positioned prominently in the mobile activity detail view.
- Review submission renders as a bottom-sheet modal anchored to viewport bottom with `rounded-t-2xl`, scrollable inner body, and sticky bottom submit action. No gesture-based drag-to-dismiss.
- Interactive touch targets: star buttons have a minimum touch target of **$44 \times 44\text{px}$**; submit button has a minimum height of **$48\text{px}$**.
- Profile reviews tab stacks vertically: reputation summary card on top, followed by review cards.

---

## 7. Accessibility & Screen Reader Contract (WCAG 2.2 AA)

1. **Dialog Accessibility**:
   - Modals use `role="dialog"`, `aria-modal="true"`, and `aria-labelledby` pointing to the modal title.
   - Keyboard focus is trapped within the active modal; initial focus lands on the first interactive rating group.
   - Pressing `Escape` closes the modal without submitting.
   - Closing the modal restores focus to the triggering button.

2. **Star Rating Radio Semantics**:
   - Each criterion is structured as a proper radio group:
     `<div role="radiogroup" aria-label="Punctuality rating" aria-required="true">`
   - Individual star options carry `role="radio"`, `aria-checked="true|false"`, and explicit labels: `aria-label="1 of 5 stars, Poor"`.
   - Keyboard interaction: Left/Right arrows navigate within the group; Space/Enter selects.
   - Minimum interactive target of $44 \times 44\text{px}$ is enforced on every star option.

3. **Character Counter & Validation Announcements**:
   - The counter is an `aria-live="polite"` region.
   - When 1,000 characters is exceeded, `aria-invalid="true"` is set on the textarea and the error message is referenced via `aria-errormessage`.

4. **Color Independence**:
   - Star states are never indicated by color alone; visible text labels (`Select a rating`, `4 of 5 • Very good`) accompany visual star glyphs.
   - Error states pair red color with alert icons (`AlertCircle`) and descriptive text.

---

## 8. Frontend Component Hierarchy & File Architecture

All review components will be created under `apps/web/components/review/`:

```
apps/web/components/review/
├── ReviewPromptCard.tsx          # Card embedded in JobsScreen for completed bookings
├── ReviewPromptModal.tsx         # Multi-criteria submission modal (desktop dialog / mobile sheet)
├── StarRatingGroup.tsx           # Accessible 1-to-5 star radio group (44x44px touch targets)
├── CharacterCountTextarea.tsx    # Textarea with live 1,000-char counter & aria-live region
├── PublicReviewSummary.tsx       # Profile reputation card with breakdown & distribution
├── PublicReviewCard.tsx          # Single verified review card with masked author
├── PublicReviewFeed.tsx          # Paginated review feed with "Load more" and empty state
└── ReportReviewModal.tsx         # Moderation flagging dialog with auth gate & deduplication
```

---

*WEB-016 UX & Design Specification v1.1 — prepared under the Mr. Solomon 9-Command Engineering Loop*

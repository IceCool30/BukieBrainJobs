# BW-004 UX Design Specification

**Document ID:** BW-004-UX
**Version:** 0.2 (Revision A)
**Status:** APPROVED as the implementation baseline. Product, architecture, and implementation gates closed by Product Owner decision on 2026-10-03. Implementation is authorized only on `feature/bw-004-booking-management`.
**Package:** 3 of 4
**Depends on:** BW-004-PROD decisions D1 to D10, BW-004-ARCH

> **Revision A.** REVIEWED, NOT YET APPROVED. Address unlock and check-in are
> restated as authority decisions over escrow, funding is never implied by a
> lifecycle label, the scope screen no longer leaves room for BW-004 to approve
> anything, and notification copy is framed as an event pipeline into WEB-018.

## 1. Experience Goal

The BrainWorker should be able to answer, in order, while on the job:

1. What is happening today?
2. Where exactly am I going, and what is the customer called?
3. What have I already told the customer?
4. What can I do right now, and what will cost me later?
5. Has the customer answered my scope request?

The surface is operational, not promotional. It reads like a dispatch sheet.

## 2. Routes

- List: `/brainworker/bookings`
- Detail: `/brainworker/bookings/[bookingId]`

All actions live on the detail page. No per-action routes, so a refresh never
lands the provider mid-mutation and deep links stay stable. The Dashboard may
link to the list only. Leads links to detail once a booking exists.

## 3. Page Structure

Reuse the approved BrainWorker shell and the container widths used by the live
BrainWorker surfaces. Layout is not pinned to a grid those surfaces do not
already use. Desktop may use a list on the left with a detail pane on the
right, the list filtered by bucket. Mobile web and PWA may use list to
full-screen detail navigation. No new navigation system.

## 4. Booking List

Grouped into Today, Upcoming, Then Later, with a closed group for Cancelled
and Expired. Each card shows, in priority order:

- status label with icon and text, never color alone;
- dispatch label whenever dispatch has started, including after check-in, where
  the frozen dispatch record stays visible as history;
- scheduled time in the provider's timezone;
- service title and reference code;
- general location;
- escrow-pending flag when `CONFIRMED` but not funded;
- pending scope adjustment badge;
- unread message count.

Sort within groups by `scheduledStartAt`, ascending, from the authoritative
value. The client invents no ranking and no urgency score.

## 5. Detail Page Blocks

Desktop follows the established five-block pattern from WEB-013, adapted:

1. **State block**: booking status, dispatch status, allowed actions.
2. **Position block**: timeline of authoritative events, dispatch, check-in,
   scope decisions, cancellation.
3. **Context block**: service, description, attachments, address at the
   precision permitted by D8, schedule, agreed amount from the quote.
4. **Action block**: the actions the authority returned in `allowedActions`.
5. **Recovery block**: reason for any refusal, retry, and what to do instead.

## 6. Address and Contact Presentation

- General area shows city and neighbourhood or zone plus landmark when present.
- When D8 unlocks the exact address, it renders as "Job address", with the
  general area retained above it.
- When the booking is `CONFIRMED` but escrow is not held, show the honest
  message: "This booking is confirmed but payment is still pending. The exact
  address unlocks once payment is held."
- Address precision is decided by the authority from three inputs and is never
  computed on this screen: booking resolution (the address belongs to this booking
  assigned to this provider), privacy policy (a service address may be shown to the
  assigned provider for the engagement), and escrow policy (the exact address
  unlocks once the escrow authority reports funds held). If any one input fails,
  this screen renders the general area.
- Contact is one control, "Message customer", which opens the existing
  conversation. No phone number, no email, no call or WhatsApp button, ever.
- The provider never sees a field the platform does not already permit.

## 7. Dispatch Controls

Two sequential controls while `CONFIRMED`: "I'm on my way" and "I've arrived".
The unavailable one is shown disabled with a short reason rather than hidden,
so the provider knows the sequence exists.

- "I'm on my way" sets `EN_ROUTE`. Copy: "The customer has been notified that you are on your way."
- "I've arrived" sets `ARRIVED`. Copy: "The customer has been notified that you have arrived."
- Neither implies check-in, and neither changes the booking status.
- No map, no live position, no ETA on either control or anywhere in the UI.

## 8. Check-in Control

A single primary action, "Check in on site". It takes one location snapshot
at the moment of activation.

- Before activation, state plainly what will happen: "Checking in records your location once, to confirm you are at the job site. We do not track you."
- On refusal, Recovery block states the actual typed refusal from the
  architecture contract and the next step. Copy for out of range: "You appear to be away from the job site. Move closer and try again, or message the customer."
- For `LOCATION_UNAVAILABLE` or `LOCATION_PERMISSION_DENIED`: "Location access is off on this device. Turn it on in Settings, or message the customer."
- For `ESCROW_NOT_HELD`: "Check-in opens once payment is held for this booking."
- No manual override, no "check in anyway", no simulated check-in control.
- Before the action, say plainly why it is closed when escrow is not held:
  "Payment for this booking is still pending, so check-in is not open yet. Do not
  start work until payment is held."
- Check-in evaluates the booking lifecycle, the authoritative escrow state, and the
  location snapshot. It changes the booking lifecycle only. It never funds,
  releases, or otherwise alters payment or escrow, and no screen may suggest that
  checking in does.

## 9. Scope Adjustment Request

A form, available only while `IN_PROGRESS`:

- reason: additional parts, additional labor, or both;
- labor amount and materials amount in kobo, one required above zero;
- optional note, 500 characters, with a visible counter;
- derived total shown read-only.

Submission copy: "Request sent. The customer must approve before any extra work is agreed."

Pending state shows the request with its status and a "Withdraw request"
control. Withdrawing requires confirmation.

No `APPROVED`, `REJECTED`, or decided display can arise in BW-004 until the
customer-side approval authority ships, so until then nothing in this section
renders a decision. Once that authority exists, an `APPROVED` request shows the
approved amount as a separate line, never merged into the original quote, and
`REJECTED` shows the outcome plainly with no promise of a workaround.

Do not use the word "approved" for a `PENDING` request anywhere in the UI.

`APPROVED` and `REJECTED` may appear only as read-only projections of a customer
decision authority. BW-004 can never move a request into either state, and no
screen offers an approve, reject, or auto-decide control. Until the customer-side
approval surface exists, the request control is not shipped. No substitute, demo
approval, or timeout that resolves a request may stand in for it.

This is Gate 1. Nothing in this surface, and no copy, badge, toast, or
notification, may present an approved, rejected, or settled outcome before the
customer-side approval authority ships.

## 10. Provider Cancellation

Available only from `CONFIRMED`, shown as a destructive action separate from
the primary controls.

- A confirmation dialog states the booking will be cancelled and that the
  customer will be notified. No promise about refunds, penalties, or ratings.
- Reason selector uses the closed taxonomy, with `OTHER` requiring a note.
- Copy on success uses the authoritative state: "This booking is cancelled."

## 11. State Design

- **Loading**: stable skeleton. No empty state flash before resolution.
- **Populated**: authoritative ordering only.
- **Empty**: "No bookings yet. Accepted invitations become bookings." with a
  link to `/brainworker/leads`. No fabricated sample bookings.
- **Degraded**: keep last authorized data, say fresh data may be delayed.
- **Offline**: cached data marked "possibly stale". Every mutation control
  disabled with the reason "You are offline. This action needs a connection."
- **Failure**: what failed, plus retry.
- **Unauthorized**: the established fail-closed provider boundary.
- **Cancelled or Expired**: read-only history with no actions.
- **Disputed**: read-only with a clear disputed notice and no check-in,
  dispatch, or scope controls.

## 12. Accessibility

- 44px minimum interactive targets.
- Text and meaningful non-text elements meet WCAG 2.1 AA contrast, at minimum
  4.5:1 for body text and 3:1 for large text, icons, borders, and focus rings.
  Emerald and amber label-on-surface pairs must be checked against the surface
  they render on rather than assumed to pass.
- Full keyboard operation, visible focus ring on every control.
- Status conveyed by icon plus text, never color alone.
- Dialogs for cancellation and withdrawal implement genuine focus
  containment, Escape to dismiss where non-destructive, and focus restored to
  the trigger on close.
- Form errors are associated with their controls and announced.
- Live region announces material state changes: dispatch updates, check-in
  outcome, scope request status changes.
- Semantic headings in order, landmarks for the list and detail regions.
- Reduced-motion support.

## 13. Responsive Behaviour

The same domain information stays available at every width. Mobile is not a
reduced-information mode. Primary actions stay reachable without horizontal
scroll at 320px.

## 14. Notification Copy

Consumed by the WEB-018 notification authority, per D4. No SMS, email, push,
or WhatsApp. Copy is factual and never implies payment, completion, or live
tracking.

Delivery path: BW-004 emits an authoritative domain event, and the WEB-018
notification projection owns the notification record, delivery, and rendering.
This table is suggested copy only. This surface creates no notification record.

No row may direct the customer to an action that does not exist yet. The scope
request row deliberately avoids an instruction to review or approve, because
that surface is an external dependency (D5).

| Event | Copy |
| --- | --- |
| Dispatch en route | "{workerName} is on the way to your job." |
| Arrived | "{workerName} has arrived at your job site." |
| Checked in | "{workerName} has checked in at your job site." |
| Scope request | "{workerName} is requesting a scope adjustment on your booking. We will let you know when the review is available." |
| Scope withdrawn | "{workerName} withdrew the scope adjustment request." |
| Provider cancelled | "{workerName} cancelled this booking." |

## 15. Content Rules

Direct, factual language. No unsupported guarantees, no fabricated urgency, no
generic motivational copy, no claim that a booking is complete, no earnings or
payment language, no off-platform contact suggestion. Use **BrainWorker**
consistently.

Gate 2 applies here. No copy on this surface reconciles WEB-015 and WEB-017, or
states a new rule about what `CONFIRMED` means financially. The screen reports
the authoritative escrow value it was given and says nothing beyond it.

Gate 3 applies here. No copy states or implies that a scope adjustment has been
repriced, authorized, paid, added to escrow, recorded in a ledger, refunded, or
settled. Until those outcomes are owned, this surface does not describe them.

## 16. Visual System

Use the existing live experience and design-system tokens only. No raw hex
values in this specification. Roles follow the approved live result and the
existing BrainWorker surfaces:

| Role | Token direction |
|---|---|
| Page canvas | The existing page canvas treatment used by the live BrainWorker surfaces, not a new one |
| Primary action, heading, focus | Deep Navy, as on the live BrainWorker header and primary buttons |
| Verified, confirmed, successful action | Emerald, as on the live BrainWorker dashboard and availability surfaces |
| Pending attention | Amber surface with a dark amber label, as on the live dashboard pending card and the verification and register surfaces |
| Cancelled, expired, disabled | Neutral greys |
| Error | The live error treatment, including the existing fail-closed provider gate |

Emerald is used for a confirmed booking and a valid check-in. Amber is used for
pending attention only and never for error. Existing typography, spacing, radii,
motion and shared components remain authoritative. No arbitrary colors and no
new visual language.

## 17. UX Acceptance Criteria

- [ ] List groups and sorts from authoritative data only.
- [ ] Address precision follows D8, including the escrow-pending case.
- [ ] No phone, email, call, or WhatsApp control exists anywhere.
- [ ] Dispatch controls are sequential and neither implies check-in.
- [ ] Check-in explains single-snapshot capture and has no override.
- [ ] Check-in states the payment prerequisite and implies no payment change.
- [ ] Address precision renders only what the authority unlocked, across all three
      unlock inputs.
- [ ] No control approves, rejects, or auto-decides a scope request.
- [ ] No notification record is created by this surface; only domain events are
      emitted.
- [ ] Every refusal renders its own typed reason and next step.
- [ ] Scope request derives its total and never says approved while pending.
- [ ] Cancellation is only reachable from `CONFIRMED` and promises nothing
      about refunds.
- [ ] Offline disables every mutation with a stated reason.
- [ ] Accessibility requirements pass verification.

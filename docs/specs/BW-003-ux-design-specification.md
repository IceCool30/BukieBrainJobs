# BW-003 UX/UI Design Specification

**Document ID:** BW-003-UX  
**Version:** 1.0  
**Status:** Approved

## 1. Experience Goal

The leads inbox is the BrainWorker's controlled opportunity workspace. It should answer:

1. What opportunity is available?
2. Is it within my configured operation?
3. What response can I make now?

The interface is operational, not promotional.

## 2. Route

Primary route: `/brainworker/leads`.

The existing dashboard incoming-request placeholder links to this route.

## 3. Page Structure

Desktop may use a feed with a selected inspection drawer. Mobile may use list-to-full-screen-detail navigation.

Reuse the approved BrainWorker shell and existing shared components. Do not introduce a new navigation system.

## 4. Lead Card

Prioritize:

- service/category;
- job title;
- general location;
- urgency;
- requested timeframe;
- pricing mode;
- invitation age/response state.

Secondary information may include a concise problem description and authorized attachment preview.

Exact residential address and private contact credentials remain hidden before confirmation.

## 5. Inspection Surface

Expose:

- problem description;
- authorized photos/media;
- general location and landmark;
- requested timeframe;
- urgency;
- pricing mode;
- permitted customer budget/rate information;
- response controls.

The worker should not need to navigate away simply to decide whether to respond.

## 6. Response Actions

Primary actions:

- Accept invitation;
- Decline invitation.

Decline opens the canonical reason selector.

After success, render the authoritative resulting state. Never claim a booking or payment result not returned by the repository.

## 7. Quotation Drawer

Worker-quote mode:

- labor amount;
- materials amount;
- diagnostic fee;
- estimated hours;
- optional scope notes;
- derived total.

Customer-rate mode:

- authoritative customer rate;
- explicit accept-rate action.

Keep quotation distinct from payment and escrow.

## 8. Readiness Gate

If `isComplete === false`:

- do not display actionable leads;
- explain that service, availability and coverage setup must be completed;
- link to `/brainworker/services` and `/brainworker/availability`.

If complete but off duty, show operational state without implying current dispatch eligibility.

If complete and dispatch eligible, show incoming opportunities normally.

## 9. State Design

### Loading
Stable skeleton. Do not flash empty state before resolution.

### Populated
Use authoritative feed ordering. The client must not invent ranking.

### Empty
State that there are no currently available opportunities. Do not fabricate example leads.

### Degraded
Retain last authorized data and indicate that fresh data may be delayed.

### Offline
Show cached data when available and clearly mark it stale/possibly stale. Disable mutations.

### Failure
Explain that the feed could not be loaded and provide retry.

### Unauthorized
Use the established fail-closed provider boundary.

## 10. Accessibility

- 44px minimum interactive targets.
- Keyboard-accessible feed and controls.
- Dialog/drawer focus management.
- Escape closes non-destructive overlays where appropriate.
- Semantic labels for urgency, pricing and response state.
- Live region for material feed refreshes.
- Visible focus ring.
- Reduced-motion support.
- No status conveyed by color alone.
- Form errors associated with controls.

## 11. Responsive Behaviour

The same domain information remains available across desktop, mobile web and PWA. Desktop may use list/detail; mobile may use list/full-screen detail. Mobile is not a reduced-information mode.

## 12. Content Rules

Use direct, factual language.

Avoid unsupported guarantees, fabricated urgency, fake response-time promises, generic motivational copy, claims that a provider has been selected when only an invitation exists, and payment/escrow language before those states exist.

Use **BrainWorker** consistently.

## 13. Visual System

Use the existing live experience and design-system tokens. Deep Navy remains primary; Emerald is strategic success/verified emphasis. Existing typography, spacing, radii, motion and shared components remain authoritative. No arbitrary colors or new visual language.

## 14. UX Acceptance Criteria

- [ ] Feed communicates opportunity, location, timing and pricing mode without exposing private credentials.
- [ ] Inspection provides enough authorized information to respond.
- [ ] Accept/Decline are clear and keyboard accessible.
- [ ] Decline reason selector uses the canonical taxonomy.
- [ ] Quote drawer derives totals from line items.
- [ ] Incomplete providers cannot act on leads.
- [ ] Offline state is visibly read-only.
- [ ] Responsive behavior preserves the same information architecture.
- [ ] Accessibility and reduced-motion requirements pass verification.

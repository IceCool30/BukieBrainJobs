# Decision Log: WEB-007 Booking Preparation & Intake Flow

**Decision ID:** WEB-007-DEC-001  
**Date:** 2026-09-06  
**Status:** Approved  
**Related Feature:** WEB-007  
**Approver:** CEO / Product Owner

## Decision

Approve the WEB-007 Public Booking Preparation & Intake Flow as the product authority for the `/book` booking-preparation experience, subject to completion and approval of the screen-level design brief before implementation.

## Scope

WEB-007 covers:

- Service context review
- City and street-address capture
- Landmark or estate-gate context
- Preferred service date
- Arrival window
- Job description
- Payment preference selection
- Booking summary review
- Deterministic mock submission
- Accessible success and failure states
- Context-preserving navigation

## Explicit Boundary

WEB-007 does not introduce:

- Real payment processing
- Paystack or Flutterwave integration
- Card tokenization
- Bank-transfer or USSD transaction processing
- Database persistence
- Production booking records
- Real BrainWorker matching or assignment
- Messaging or sockets
- Production authentication enforcement
- KYC
- Escrow
- Production notifications
- Dispute resolution

## Key Product Decisions

1. `/book` is a booking preparation route, not a payment route.
2. Starting price is contextual and must not be represented as a final guaranteed price.
3. A selected BrainWorker is a preference and must not be represented as an assignment.
4. Payment methods are preferences only in this slice: Card, Bank Transfer, and USSD.
5. Query parameters are untrusted input and must be normalized and validated.
6. Invalid or inactive cities must not silently redirect the customer.
7. Guest discovery remains allowed. Production authentication remains at the commitment point.
8. The experience is mock-first and must not create production records or transactions.
9. Human design approval is required before Antigravity implementation.

## Alternatives Considered

### Build production booking now

Rejected for WEB-007. It would expand the slice into payment, persistence, authentication, matching, and operational concerns that are not yet approved for implementation.

### Skip the booking-preparation route and send users directly to payment

Rejected. The customer needs a structured intake step for location, schedule, job details, and review before the commitment stage.

### Make the selected BrainWorker an immediate assignment

Rejected. Worker availability, matching, and assignment are later marketplace concerns.

## Consequences

The immediate implementation can validate the complete customer intake experience without requiring production backend or payment infrastructure. The mock booking contract must remain replaceable by a production service later.

## Approval Gate

```text
Approved WEB-007 Product & UX Specification
            ↓
WEB-007 Design Brief
            ↓
Human design approval
            ↓
Antigravity implementation
            ↓
QA and independent verification
            ↓
PR review and merge
```

## References

- `docs/04-public-website/WEB-007-PUBLIC-BOOKING-PREPARATION.md`
- `docs/04-public-website/APPROVED-ARTIFACT-MATRIX.md`
- `DESIGN.md`
- `docs/00-governance/SOURCE-OF-TRUTH.md`

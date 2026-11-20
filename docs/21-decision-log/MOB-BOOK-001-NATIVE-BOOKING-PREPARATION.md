# Decision Log: Native Booking Preparation

**Decision ID:** MOB-BOOK-001-DEC-001  
**Date:** 2026-10-30  
**Status:** Approved, scoped  
**Decision authority:** Product Manager acting under the product owner's explicit delegation for this task  
**Related feature:** Native `/book` booking preparation only  
**Related authority:** WEB-007, WEB-007A, and THEME-001

## Decision

Approve one native mobile booking-preparation screen at `/book`, limited to the build specification `docs/specs/MOB-BOOK-001-native-booking-preparation.md`. The screen uses a clearly labelled local preview and preserves WEB-007 behavior.

The product owner explicitly delegated product-manager review and approval to continue on the owner's behalf. This entry records that delegated PM decision. It does not claim that the owner personally performed the design review, that a separate human reviewer signed off, or that Product Architect approval exists.

## Relationship to WEB-007A

WEB-007A section 25 requires human design review before implementation. This owner-delegated PM decision supersedes that human-review gate only for the native `/book` adaptation described in MOB-BOOK-001. It does not record that a human review occurred, and it creates no general exception to the repository's approval process.

This decision does not authorize the web or PWA `/book` implementation, `/post-job`, or any work relying on WEB-009 or WEB-009A. The matrix alone is not treated as sufficient approval for those job-posting requirements. No separate Product Architect approval is asserted.

## Preserved product behavior

The native screen follows WEB-007's service, location, schedule, job-details, payment-preference, summary, validation, mock-submission, success, failure, retry, and recovery behavior. It does not create a production booking, charge or initiate payment, authenticate the customer, or assign a BrainWorker.

Mobile uses the canonical service catalog and shared validation already present in the app. Because that catalog contains no price data or worker directory, the screen does not invent a starting price or preferred BrainWorker. The PM-approved local-preview boundary is explicit in the screen.

## Scope boundary

Only the native booking route, its service-detail entry point, the required focused tests, and THEME-001 behavior needed for the native flow are in scope. No `/post-job` UI, tests, domain logic, backend, database, server, API, authentication integration, payment processing, or production records are authorized.

## References

- `docs/04-public-website/WEB-007-PUBLIC-BOOKING-PREPARATION.md`
- `docs/04-public-website/WEB-007A-BOOKING-PREPARATION-DESIGN-BRIEF.md`
- `docs/specs/THEME-001-light-dark-toggle.md`
- `docs/specs/MOB-BOOK-001-native-booking-preparation.md`

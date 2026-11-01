# Decision Log: Native Multi-Step Job Posting

**Decision ID:** MOB-POST-001-DEC-001
**Date:** 2026-10-30
**Status:** Approved for scoped native implementation; Phase 4.2.2 IN PROGRESS
**Decision authority:** Product Manager acting under the product owner's explicit delegation for this task
**Related feature:** Native `/post-job` multi-step job posting only
**Related authority:** `docs/specs/WEB-009-customer-job-posting.md`, `docs/04-public-website/WEB-009A-CUSTOMER-JOB-POSTING-DESIGN-BRIEF.md` (unapproved reference/provenance only, not operative native authority), `docs/specs/THEME-001-light-dark-toggle.md`

## Decision

Approve the native mobile multi-step job-posting product decisions at `/post-job`, limited to the build specification `docs/specs/MOB-POST-001-native-job-posting.md`. The screen uses five sequential steps: Job Requirement; Location; Schedule; Budget and Optional Worker Preference; Review. Back and Continue preserve the in-memory draft. Validation occurs before each advance and again before local preview. The commitment point uses a clearly labelled mock-auth preview with the exact action `Continue in local preview` and an explicit notice it does not sign in, create an account, or send a request. The result shows the exact heading `Local request preview`, with an optional deterministic `Local preview reference: REQ-xxxxx` reference only. The identifier remains `REQ-xxxxx` exactly, with no `LOCAL-` prefix. No platform receipt, durable storage, Jobs tab, or activity-history update is claimed.

Draft and address stay only in memory. No AsyncStorage, SecureStore, logging, or URL persistence. No API or activity repository call.

The product owner explicitly delegated product-manager review and approval to continue on the owner's behalf. This entry records that delegated PM decision. It does not claim that the owner personally performed the design review, that a separate human reviewer signed off, or that Product Architect approval exists.

## Relationship to WEB-009A

WEB-009A is an unapproved design reference and provenance source, not the operative native authority. WEB-009A section 30 requires agent design review before implementation; section 31 states this document authorizes design review only. MOB-POST-001 defines all native requirements explicitly, derived from approved WEB-009 product behavior plus delegated PM native decisions. This owner-delegated PM decision records product decisions only for the native `/post-job` adaptation described in MOB-POST-001. It does not claim that a human review occurred, that sections 30-31 gates are satisfied, or that Product Architect approval exists. It creates no general exception to the repository's approval process.

This decision supersedes only MOB-002's native `/post-job` planning authority for the approved scoped product decisions. MOB-002's `/book` scope and existing `/post-job` body history remain unchanged. This decision does not authorize web or PWA changes, `/book` web/PWA implementation, backend, database, schema, migration, server, API, authentication integration, payment processing, production records, uploads, or native visual restyling.

## Scope boundary

On 2026-10-30 the requesting PM reviewed and approved the final MOB-POST-001 document set for native `/post-job` implementation under the product owner's explicit delegation. Implementation is now authorized for this native scope only. No separate or external human review and no Product Architect approval is claimed. No web/PWA, `/book`, backend, database, schema, migration, server, API, authentication, payment, or production persistence scope is included. No `/post-job` UI, tests, domain logic, backend, database, server, API, authentication integration, payment processing, or production records beyond this native scope are authorized.

## References

- `docs/specs/WEB-009-customer-job-posting.md`
- `docs/04-public-website/WEB-009A-CUSTOMER-JOB-POSTING-DESIGN-BRIEF.md`
- `docs/specs/THEME-001-light-dark-toggle.md`
- `docs/specs/MOB-POST-001-native-job-posting.md` (complete native build specification with all approved product decisions, field/data contract, validation rules, accessibility, privacy, and QA criteria)
- `docs/21-decision-log/MOB-002-WEB-009A-APPROVAL-RECONCILIATION.md`

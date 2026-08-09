# BukieBrainJobs QA Baseline

**Document ID:** QA-000
**Version:** 1.0
**Status:** Approved baseline

## Test Layers

| Layer | Baseline Tool | Purpose |
|---|---|---|
| Unit | Vitest | Pure functions, utilities, state transitions, pricing and matching |
| Integration | Vitest + Prisma test client | Services and database behavior |
| API | Supertest + Next.js test utilities | Route handlers and external-service boundaries |
| Web E2E | Playwright | Critical browser journeys |
| Mobile E2E | Maestro | Critical mobile journeys |
| Real-time | Socket.io test client | Chat and job-event behavior |

## Mandatory Critical Cases

- Valid and invalid job state transitions.
- Pricing calculations and monetary edge cases.
- Matching score calculations.
- Contact-information filtering in chat.
- Payment webhook signature verification and idempotency.
- Identity verification webhook outcomes.
- OTP rate limiting.
- End-to-end job lifecycle from creation through payment.

## Quality Review

Every substantive feature receives review for:

- Functional correctness
- UX and interaction behavior
- Accessibility
- Security
- Performance
- Error and empty states
- Observability
- Documentation completeness

## Accessibility

WCAG 2.2 AA is the project baseline. Keyboard behavior, focus, semantic structure, labels, contrast, touch targets and reduced-motion behavior must be verified where applicable.

## Release Gate

A release must not proceed when critical tests fail, security checks fail, required documentation is missing, or a known blocker remains unresolved without explicit approval.

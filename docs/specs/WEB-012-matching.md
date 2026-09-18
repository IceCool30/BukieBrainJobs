# Spec: WEB-012 Customer Job Matching & BrainWorker Match Results

**Status**: Accepted

## Decision
Provide authenticated customers with a dedicated, durable matching screen at `/job/[referenceCode]/matches` where they can review ranked BrainWorker candidates matched to their job request. Use deterministic mock data with a production-first domain interface, and use honest, non-assignment language for customer selection and interest.

## Requirements
1. Durable route at `/job/[referenceCode]/matches` loading valid job context from mock or local repository.
2. Presentation of ranked BrainWorker match candidates with clear, customer-friendly match explanations.
3. Explicit separation of match states: matching in progress, matches available, no suitable matches, constraint-driven no match, degraded service, matching failure, offline, and invalid context.
4. "Express interest" or "Select BrainWorker" action that updates local/mock selection state without falsely claiming assignment, booking, or dispatch.
5. Privacy protection: zero NIN, BVN, private phone/email, or internal risk scores exposed.
6. Seamless backward navigation to the customer activity hub at `/jobs`.

## Acceptance Criteria
1. Invalid job reference codes display an honest invalid context notice with safe return links.
2. Matching in progress state displays stable loading UI without fabricated candidate names.
3. Candidate cards display BrainWorker name, photo, verified status, skills, rating, rate, and match reasons.
4. Express interest action updates card state to show selection interest is recorded.
5. All 23 component tests and 36 unit tests pass.

## Build Plan
- Implement `apps/web/lib/matching/types.ts` with production-relevant domain contracts.
- Implement `apps/web/lib/matching/mock-adapter.ts` with deterministic fixtures for all states.
- Implement `apps/web/app/job/[referenceCode]/matches/page.tsx` and `MatchResultsScreen.tsx`.
- Add comprehensive Vitest suites covering rendering, states, selection, and error recovery.

## Edge Cases & Failure Modes
- Repository failure: simulated errors must not collapse into empty states; must render explicit failure state with retry.
- Offline connectivity: network absence renders offline banner with retry option.
- Cross-customer access: match state is scoped strictly to the authenticated customer and job reference.

## Out of Scope
- Production backend matching service algorithm.
- Direct BrainWorker SMS or push notifications.
- Payment processing or escrow deposit.

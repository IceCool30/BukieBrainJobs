# Scope & Task Breakdown

## Objective
A clear, grounded statement of the feature or milestone.

## Planned Work Slices

- [ ] **1. Foundation / Data Layer**
  - **Spec**: `docs/specs/01-foundation.md`
  - **Acceptance Criteria**:
    - [ ] Schema migration verified
    - [ ] Seed data scripts pass
  - **Verification Command**: `pnpm run db:verify`

- [ ] **2. Core Service / Logic**
  - **Spec**: `docs/specs/02-logic.md`
  - **Acceptance Criteria**:
    - [ ] Pure business logic unit tested
    - [ ] Error boundary handles missing records
  - **Verification Command**: `pnpm test logic.test.ts`

- [ ] **3. User Interface / Interaction**
  - **Spec**: `docs/specs/03-ui.md`
  - **Acceptance Criteria**:
    - [ ] Uses established design tokens (no raw hex)
    - [ ] Screen renders correctly on desktop and mobile
    - [ ] Anti-generic guardrails verified (no generic icons/taglines/tips)
  - **Verification Command**: `pnpm run check:ui`

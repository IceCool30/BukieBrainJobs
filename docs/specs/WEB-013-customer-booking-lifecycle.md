# Spec: WEB-013 Customer Booking Acceptance & Booking Lifecycle

**Status**: Accepted

## Decision
Implement the customer-facing booking acceptance and lifecycle surface within the canonical `/jobs` activity view. The implementation enforces strict adherence to the existing authoritative `JobStatus` state machine and `canTransition()` mutation boundary. BrainWorker response (acceptance/decline) is modeled as a distinct response contract on invitations without inventing competing `JobStatus` values like `DECLINED` or `SCHEDULED`. Booking confirmation is strictly separated from payment and cannot be produced by UI selection alone.

## Requirements
1. **Authoritative State Machine**:
   - Reuse existing `JobStatus`: `OPEN`, `PENDING_ACCEPTANCE`, `CONFIRMED`, `IN_PROGRESS`, `PENDING_COMPLETION`, `COMPLETED`, `PAID`, `CANCELLED`, `EXPIRED`, `DISPUTED`, `RESOLVED`.
   - Use `canTransition()` for all status transitions.
   - Never add `DECLINED`, `SCHEDULED`, `CANCELLATION_PENDING`, or `PAYMENT_PENDING` to `JobStatus`.

2. **Acceptance and Decline Boundary**:
    - BrainWorker acceptance triggers `canTransition('PENDING_ACCEPTANCE', 'CONFIRMED')` to reach `CONFIRMED`.
    - BrainWorker decline records `accepted: false`, optional customer-safe `declineReason`, and timestamp on the invitation response. The invitation response boundary is strictly `PENDING_ACCEPTANCE`. Decline presentation requires `PENDING_ACCEPTANCE` and never overrides authoritative states (`CONFIRMED`, `CANCELLED`, `EXPIRED`).

3. **Confirmation Boundary**:
    - Render "Your booking is confirmed." only when authoritative state is `CONFIRMED`.
    - Selection, interest, profile viewing, or proposed schedules must never render confirmed-booking language.

4. **Schedule Treatment**:
    - Requested schedule is displayed purely as request context.
    - No schedule negotiation, counter-proposals, or accept/reject schedule controls are built.
    - Confirmed schedule is rendered only when an authoritative contract supplies it. If not supplied, `confirmedSchedule` remains undefined and the requested schedule is displayed separately.

5. **Customer Cancellation**:
    - Available only when `canTransition(currentStatus, 'CANCELLED')` evaluates to true and customer ownership is validated.
    - Permitted states: `OPEN`, `PENDING_ACCEPTANCE`, `CONFIRMED`, `DISPUTED`, `RESOLVED`.
    - Execution uses transient pending mutation state; on failure, prior state is retained. No `CANCELLATION_PENDING` status.
    - Modal title and text dynamically reflect booking vs request ('Cancel Booking' vs 'Cancel Service Request') and honestly state that the status will be updated to Cancelled without unverified backend claims.

6. **Payment Boundary**:
    - Zero payment execution, payment CTAs, escrow states, or funds-secured messaging in WEB-013.
    - Booking confirmation is not payment confirmation.

7. **Authorization, Data Isolation, and Anti-Manufacturing**:
    - Enforce customer data isolation in `getActivities()` and `getActivityById()`: never return or leak another customer's activities.
    - Fail closed: if an activity has missing ownership (no `customerId`), mutations must be rejected.
    - Reject cross-customer mutations and unauthorized worker associations.
    - Acceptance and decline strictly require an active invitation on the job. Customer callers cannot manufacture, create, or send invitations; simulation controls are excluded from customer surfaces.
    - Invitation dispatch is separated from the customer repository class into a standalone domain service function (`dispatchDomainInvitation`).
    - Confirmed schedule must originate from an authoritative booking/lifecycle response, never fabricated from the customer's requested schedule.

8. **Design and Accessibility**:
   - Deep Navy `#001A41` as primary; Emerald `#296A4B` used strategically for confirmed/completed indicators.
   - 5-block lifecycle layout in activity detail: Current state block, Lifecycle position, Context block, Action block, Recovery block.
   - Modal focus management: `CancellationModal` must implement genuine focus containment (Tab/Shift-Tab focus trap) and restore focus to trigger element on dismissal.
   - Semantic headings, WCAG 2.2 AA contrast, visible focus, reduced motion support.
   - Zero em dashes across all user-facing copy, test titles, and code comments.

## Acceptance Criteria
1. Valid acceptance transitions job from `PENDING_ACCEPTANCE` to `CONFIRMED` and renders "Your booking is confirmed."
2. Unauthorized customer, missing activity ownership, or invalid transition rejects mutation and preserves prior state.
3. Acceptance or decline requires an existing invitation; operations without an active invitation fail without manufacturing one.
4. Decline response records `accepted: false` and renders "The BrainWorker declined the request." while `jobStatus` remains valid.
5. Cancellation from permitted state succeeds and transitions to `CANCELLED`. Cancellation from non-permitted state (e.g. `COMPLETED`, `PAID`) rejects.
6. `CancellationModal` traps focus inside the dialog and restores focus to the trigger button when closed.
7. Customer activity queries strictly isolate results by `customerId`.
8. All tests in monorepo pass without regressions.

## Build Plan
- **Step 1: Domain Contracts (`packages/types` & `packages/api-types`)**:
  - Add `JobInvitationRecord`, `AcceptJobInvitationInput`, `DeclineJobInvitationInput`, `CancelJobInput` to typed interfaces.
  - Extend `JobLifecycleAction` to include `ACCEPT_INVITATION` and `DECLINE_INVITATION`.
- **Step 2: Repository & Mock Adapter (`apps/web/lib/jobs/`)**:
  - Implement invitation response methods and cancellation on `MockCustomerActivityRepository`.
  - Add ownership validation checks and deterministic fixtures for each lifecycle state.
- **Step 3: Lifecycle UI Components (`apps/web/components/jobs/`)**:
  - Build `LifecycleStateSurface.tsx` implementing the 5-block structure.
  - Build `LifecycleStepIndicator.tsx` with horizontal desktop and vertical mobile views.
  - Update `ActivityDetail.tsx` to mount the lifecycle surface.
  - Add `CancellationModal.tsx` for destructive cancellation confirmation.
- **Step 4: Unit & Component Tests (`apps/web/`)**:
  - Test acceptance, decline, cancellation, schedule, and authorization behavior.
- **Step 5: Cloud Codespace Verification**:
  - Verify typecheck, test, lint, and build.

## Edge Cases & Failure Modes
- Mutation failure: network or repository errors must retain the prior authoritative state and present a clear retry button.
- Offline connectivity: display cached state with explicit stale warning and retry option.
- Cross-customer access: attempting to mutate or view another customer's activity must throw an authorization error without leaking data.

## Out of Scope
- Real backend API endpoints or PostgreSQL database migrations.
- Payment processing or Paystack integration.
- Schedule counter-proposal workflows.
- Real-time chat or WebSockets.

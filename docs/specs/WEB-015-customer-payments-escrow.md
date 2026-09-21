# Spec: WEB-015 Customer Payments & Escrow UX (v1.1)

**Status**: Draft (Revised Architecture v1.1 for Review)

## 1. Executive Summary & Core Architectural Doctrine

WEB-015 establishes the Customer Payments and Escrow user experience for the BukieBrainJobs platform. In the marketplace transaction lifecycle, once a booking is confirmed (`JobStatus: CONFIRMED` following WEB-013), the customer must be able to securely fund escrow before work commences, track funds protected under BukieGuarantee, inspect completed work, release payouts upon satisfaction, and access digital receipts and honest refund flows.

### Core Architectural Doctrine
> **The frontend can request financial actions, but it cannot authoritatively declare that money moved.**
> 
> All financial transitions, escrow ledger balances, and payment records originate from authoritative domain evaluations. The client UI renders state; it never manufactures state.

---

## 2. Multi-Dimensional Lifecycle Architecture

The marketplace transaction lifecycle consists of four orthogonal state dimensions. The UI must never conflate them into competing or artificial statuses.

1. **`JobStatus`**: The authoritative marketplace lifecycle state defined in `@bukiebrainjobs/api-types` and Prisma schema (`OPEN`, `PENDING_ACCEPTANCE`, `CONFIRMED`, `IN_PROGRESS`, `PENDING_COMPLETION`, `COMPLETED`, `PAID`, `CANCELLED`, `EXPIRED`, `DISPUTED`, `RESOLVED`).
2. **`BookingStatus`**: The operational service engagement between the customer and assigned BrainWorker (`booking_confirmed`, `job_in_progress`, `invoice_submitted`, `completed_and_paid`, `disputed`, `cancelled`).
3. **`PaymentAuthorizationStatus`**: The client-to-gateway authorization attempt lifecycle (`idle`, `initiating`, `awaiting_payment`, `processing`, `verified`, `failed`, `timeout`, `cancelled`).
4. **`EscrowStatus`**: The escrow ledger balance state (`unfunded`, `held_in_escrow`, `release_pending`, `released`, `release_failed`, `disputed`, `refund_pending`, `refunded`, `refund_failed`).

### 2.1 Complete Valid/Invalid State Matrix

| JobStatus | BookingStatus | Payment Auth Status | EscrowStatus | Valid? | Architectural Rationale & Client Semantics |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `CONFIRMED` | `booking_confirmed` | `idle` / `awaiting_payment` | `unfunded` | **Yes** | Booking confirmed by both parties. Awaiting customer checkout initiation. |
| `CONFIRMED` | `booking_confirmed` | `processing` | `unfunded` | **Yes** | Customer submitted payment details; gateway authorization in progress. |
| `CONFIRMED` | `booking_confirmed` | `failed` | `unfunded` | **Yes** | Gateway declined payment attempt. Checkout displays retry options. |
| `CONFIRMED` | `booking_confirmed` | `timeout` | `unfunded` | **Yes** | Gateway verification latency exceeded. Polling reconciliation active. |
| `CONFIRMED` | `booking_confirmed` | `verified` | `held_in_escrow` | **Yes** | Payment verified; funds locked in escrow. Booking is funded and eligible for next step. |
| `IN_PROGRESS` | `job_in_progress` | `verified` | `held_in_escrow` | **Yes** | Work actively in progress. Escrow safely locked. Payouts blocked. |
| `PENDING_COMPLETION` | `invoice_submitted` | `verified` | `held_in_escrow` | **Yes** | Worker submitted completion. Customer inspection prompt active. |
| `PENDING_COMPLETION` | `invoice_submitted` | `verified` | `release_pending` | **Yes** | Customer approved work. Payout transfer initiated to BrainWorker. |
| `PENDING_COMPLETION` | `invoice_submitted` | `verified` | `release_failed` | **Yes** | Payout transfer failed (e.g. banking rail error). Safe retry available. |
| `COMPLETED` | `completed_and_paid` | `verified` | `released` | **Yes** | Escrow settled. Job completed. Authoritative receipt available. |
| `PAID` | `completed_and_paid` | `verified` | `released` | **Yes** | Final financial closure of completed job. |
| `DISPUTED` | `disputed` | `verified` | `disputed` | **Yes** | Customer or worker opened dispute. Escrow locked pending mediation. |
| `CANCELLED` | `cancelled` | `failed` / `cancelled` | `unfunded` | **Yes** | Booking cancelled prior to funding. Zero financial liability. |
| `CANCELLED` | `cancelled` | `verified` | `refund_pending` | **Yes** | Booking cancelled after funding. Refund settlement in progress. |
| `CANCELLED` | `cancelled` | `verified` | `refunded` | **Yes** | Refund completed to customer source account. |
| `CANCELLED` | `cancelled` | `verified` | `refund_failed` | **Yes** | Refund settlement failed. Administrative retry required. |
| `IN_PROGRESS` | any | any | `unfunded` | **NO** | Invariant violation: Work cannot begin without funded escrow. |
| `PENDING_COMPLETION` | any | any | `unfunded` | **NO** | Invariant violation: Unfunded job cannot reach completion review. |
| `COMPLETED` | any | any | `unfunded` | **NO** | Invariant violation: Job cannot complete without payment settlement. |
| `PAID` | any | any | `held_in_escrow` | **NO** | Invariant violation: Cannot be PAID while funds remain in escrow. |
| `OPEN` | any | any | `held_in_escrow` | **NO** | Invariant violation: Cannot fund open unassigned job request. |
| `PENDING_ACCEPTANCE` | any | any | `held_in_escrow` | **NO** | Invariant violation: Cannot fund invitation prior to mutual confirmation. |

---

## 3. Financial State Machines & Transition Boundaries

### 3.1 Payment Authorization State Machine
```text
               ┌───────────┐
               │   idle    │
               └─────┬─────┘
                     │ initiateCheckout()
                     ▼
             ┌───────────────┐
             │  initiating   │
             └───────┬───────┘
                     │ checkout session created
                     ▼
            ┌─────────────────┐
            │awaiting_payment │◄────────────────────────┐
            └────────┬────────┘                         │
                     │ submitCredentials() / transfer   │
                     ▼                                  │
              ┌──────────────┐                          │
              │  processing  │                          │
              └──────┬───────┘                          │
        ┌────────────┼────────────┐                     │
        │            │            │                     │
        ▼            ▼            ▼                     │
   ┌─────────┐  ┌─────────┐ ┌───────────┐               │
   │verified │  │ failed  │ │  timeout  │               │
   └─────────┘  └────┬────┘ └─────┬─────┘               │
                     │            │ checkStatus()       │
                     │            └───────────┬─────────┘
                     │ retry                  │
                     └────────────────────────┴─────────┘
```

### 3.2 Escrow Ledger State Machine (Including Failures & Disputes)
```text
                     ┌───────────┐
                     │ unfunded  │
                     └─────┬─────┘
                           │ payment authorization verified
                           ▼
                  ┌─────────────────┐
                  │ held_in_escrow  │◄────────────────────────┐
                  └────────┬────────┘                         │
         ┌─────────────────┼─────────────────┐                │
         │ releaseEscrow() │ cancel/refund   │ disputeEscrow()│
         ▼                 ▼                 ▼                │
┌────────────────┐ ┌───────────────┐ ┌───────────────┐       │
│release_pending │ │refund_pending │ │   disputed    │       │
└──────┬─────────┘ └───────┬───────┘ └───────┬───────┘       │
   ┌───┴───┐           ┌───┴───┐             │               │
   ▼       ▼           ▼       ▼             │               │
┌──────┐┌─────────┐ ┌────────┐┌─────────┐    │               │
│rel-  ││release_ │ │refunded││refund_  │    │               │
│eased ││failed   │ └────────┘│failed   │    │               │
└──────┘└────┬────┘           └────┬────┘    │               │
             │ retry               │ retry   │               │
             └──────────┐   ┌──────┘         │               │
                        ▼   ▼                ▼               │
               [mediation resolution] ───────┼───────────────┘
                        ├── customer refund ─┤
                        └── worker payout ───┘
```

---

## 4. Provider-Neutral Payment Architecture

The domain contracts are entirely decoupled from specific payment vendors. Capabilities are returned dynamically by provider adapters.

### 4.1 Domain Contracts
```typescript
export type PaymentMethod = 'card' | 'bank_transfer' | 'ussd';
export type PaymentRail = 'card_processor' | 'virtual_account' | 'ussd_session';

export interface PaymentProviderCapabilities {
  providerId: string; // e.g. 'paystack', 'flutterwave', 'mock_gateway'
  supportedMethods: PaymentMethod[];
  supportsVirtualAccounts: boolean;
  supportsUssd: boolean;
}

export interface VirtualAccountDetails {
  bankName: string;
  accountNumber: string;
  accountName: string;
  expiresAt?: string | undefined;
  reconciliationNotes: string;
}

export interface UssdDetails {
  bankName: string;
  ussdString: string;
  directDialUri: string;
}

export interface CheckoutSession {
  checkoutReference: string;
  bookingId: string;
  totalPayableNaira: number;
  availableMethods: PaymentMethod[];
  virtualAccount?: VirtualAccountDetails | undefined;
  ussd?: UssdDetails | undefined;
  idempotencyKey: string;
  expiresAt: string;
}
```

### 4.2 Security & No Raw Card Credential Handling
- **Production Standard**: Production card entry is strictly provider-hosted and tokenized (via Paystack Inline or Flutterwave tokenization). BukieBrainJobs application code, web servers, and databases NEVER receive, store, or transmit raw PAN, CVV, or card PIN.
- **Mock Simulation Boundary**: The mock customer UI provides a sandbox payment simulator with test cards (e.g. `4084 0840 0000 0000`) solely to test component state transitions. An explicit notice is rendered: *"Simulated sandbox payment environment. Do not enter real payment credentials."*

---

## 5. Pricing & Fee Configuration Contract

To avoid hard-coding commercial assumptions into architecture, fee calculations are derived from an explicit configuration contract:

```typescript
export interface FeeScheduleConfig {
  platformFeePercentage: number;          // e.g. 10.0
  escrowProtectionFeePercentage: number;  // e.g. 7.5
  statutoryVatPercentage: number;         // e.g. 7.5 applied to platform fee
}

export interface PricingBreakdown {
  baseServiceAmountNaira: number;
  platformServiceFeeNaira: number;
  escrowProtectionFeeNaira: number;
  statutoryVatNaira: number;
  totalPayableNaira: number;
}
```

### Calculation Rules
1. `platformServiceFeeNaira = round(baseServiceAmountNaira * (platformFeePercentage / 100))`
2. `escrowProtectionFeeNaira = round(baseServiceAmountNaira * (escrowProtectionFeePercentage / 100))`
3. `statutoryVatNaira = round(platformServiceFeeNaira * (statutoryVatPercentage / 100))`
4. `totalPayableNaira = baseServiceAmountNaira + platformServiceFeeNaira + escrowProtectionFeeNaira + statutoryVatNaira`

The checkout drawer and receipts display these four itemized components. Zero undocumented fees.

---

## 6. Authoritative Receipt & Refund Boundaries

### 6.1 Receipt Generation Rules
- A receipt is an authoritative financial document that can ONLY be generated when `escrowStatus` has transitioned to `held_in_escrow`, `release_pending`, or `released`.
- Receipts derive exclusively from verified payment and settlement ledger entries:
  - `receiptNumber`: `REC-[YEAR]-[RANDOM]`
  - `paymentReference`: Authoritative gateway transaction reference
  - `bookingReference`: Human-readable customer booking reference
  - `paidAt`: ISO timestamp of verified payment
  - `releasedAt`: ISO timestamp of settlement (if released)
  - `itemizedPricing`: Authoritative pricing breakdown
  - `paymentMethodUsed`: Masked payment instrument description
- In mock mode, all receipts carry the explicit notice: *"SIMULATED TEST RECEIPT (PHASE 1 MOCK BOUNDARY)"*.

### 6.2 Customer Refund Boundaries & Indicative Timelines
- Customers can submit refund requests only when a funded booking is cancelled prior to work start or when awarded through dispute resolution.
- Indicative Provider Timelines (Clearly labeled as provider/bank estimates, never platform guarantees):
  - *"Card refunds are processed by your issuing bank and typically reflect within 3 to 5 business days."*
  - *"Bank transfer refunds are processed via commercial banking rails and typically reflect within 24 to 48 hours."*

---

## 7. Dispute Resolution Boundaries

1. **Dispute Invariants**:
   - Filing a dispute (`disputeEscrow`) immediately freezes escrow mutations and transitions `JobStatus` to `DISPUTED` and `EscrowStatus` to `disputed`.
   - The customer UI cannot unilaterally resolve a dispute.
2. **Authoritative Dispute Resolution Branches**:
   - **Resolution Branch A (Customer Full Refund)**: Administrative mediation awards full restitution -> `EscrowStatus: refund_pending` -> `refunded`. `JobStatus: RESOLVED` (or `CANCELLED`).
   - **Resolution Branch B (BrainWorker Payout)**: Administrative mediation confirms work was performed to standard -> `EscrowStatus: release_pending` -> `released`. `JobStatus: RESOLVED` / `COMPLETED`.
   - **Resolution Branch C (Split Settlement)**: Partial refund + partial release.

---

## 8. Idempotency & Reconciliation Semantics

1. Every checkout attempt requires an `idempotencyKey` generated at checkout initialization.
2. Submitting payment with the same `idempotencyKey` returns the existing attempt record rather than generating a duplicate charge.
3. If an authorization attempt enters `timeout`, the client polls `checkVerificationStatus(paymentReference)`. The repository queries the provider ledger and transitions to `verified` or `failed` without creating a new payment attempt.

---

## 9. Comprehensive Customer Payment Repository Interface

The application communicates exclusively through this interface:

```typescript
export interface ICustomerPaymentRepository {
  getPaymentContext(authenticatedCustomerId: string, bookingId: string): Promise<PaymentContext>;
  getFeeConfig(): Promise<FeeScheduleConfig>;
  calculatePricing(baseAmountNaira: number): Promise<PricingBreakdown>;
  
  // Checkout & Authorization
  initiateCheckout(authenticatedCustomerId: string, input: InitiateCheckoutInput): Promise<CheckoutSession>;
  verifyPayment(authenticatedCustomerId: string, paymentReference: string): Promise<PaymentVerificationResult>;
  checkVerificationStatus(authenticatedCustomerId: string, paymentReference: string): Promise<PaymentVerificationResult>;
  getPaymentAttempts(authenticatedCustomerId: string, bookingId: string): Promise<PaymentAttempt[]>;
  
  // Escrow Lifecycle
  releaseEscrow(authenticatedCustomerId: string, input: ReleaseEscrowInput): Promise<EscrowReleaseResult>;
  retryRelease(authenticatedCustomerId: string, bookingId: string): Promise<EscrowReleaseResult>;
  disputeEscrow(authenticatedCustomerId: string, input: DisputeEscrowInput): Promise<DisputeResult>;
  
  // Refunds & Receipts
  requestRefund(authenticatedCustomerId: string, input: RequestRefundInput): Promise<RefundRequestResult>;
  getRefundStatus(authenticatedCustomerId: string, bookingId: string): Promise<RefundStatusDetails>;
  getReceipt(authenticatedCustomerId: string, bookingId: string): Promise<PaymentReceipt>;
}
```

---

## 10. Deterministic Mock Scenarios for TDD

To ensure 100% testable state coverage in `/develop`, the mock repository must provide deterministic test fixtures for 21 discrete scenarios:

1. `confirmed_unfunded`: Freshly confirmed booking, awaiting escrow checkout.
2. `card_processing`: Card credentials submitted, 3D Secure verification pending.
3. `card_verified`: Card authorization successful, escrow funded.
4. `card_failed_insufficient_funds`: Card declined with actionable insufficient funds reason.
5. `card_failed_network_error`: Card declined due to bank network error.
6. `payment_timeout`: Gateway latency exceeded, reconciliation polling active.
7. `bank_transfer_pending`: Dedicated virtual account generated, awaiting bank credit.
8. `bank_transfer_verified`: Bank transfer credit detected, escrow funded.
9. `ussd_pending`: USSD shortcode issued, awaiting dialing.
10. `escrow_held`: Funds locked in BukieGuarantee escrow, job in progress.
11. `pending_completion`: Worker submitted completion, inspection approval active.
12. `release_pending`: Customer approved release, payout transferring.
13. `release_failed`: Payout transfer failed, retry button active.
14. `released`: Payout settled, job completed and paid, receipt unlocked.
15. `refund_pending`: Booking cancelled after funding, refund transferring.
16. `refund_failed`: Refund transfer failed, administrative intervention required.
17. `refunded`: Refund completed to customer, receipt updated with refund record.
18. `disputed`: Dispute open, escrow frozen, mediation notice active.
19. `dispute_resolved_refund`: Dispute settled with customer refund.
20. `dispute_resolved_payout`: Dispute settled with BrainWorker payout.
21. `offline_read_only`: Network disconnected, all payment and escrow mutation controls disabled.

---

## 11. Backend Handoff Contract (Future PostgreSQL/Provider Integration)

When backend services deploy production payment rails, the HTTP adapter implements `ICustomerPaymentRepository` mapping to these exact endpoints:

- `POST /api/v1/payments/checkout`: `{ bookingId, paymentMethod, idempotencyKey }` -> `CheckoutSession`
- `POST /api/v1/payments/verify`: `{ paymentReference }` -> `PaymentVerificationResult`
- `GET /api/v1/payments/status/:paymentReference`: -> `PaymentVerificationResult`
- `POST /api/v1/escrow/release`: `{ bookingId, customerFeedback? }` -> `EscrowReleaseResult`
- `POST /api/v1/escrow/dispute`: `{ bookingId, reason, description }` -> `DisputeResult`
- `POST /api/v1/escrow/refund`: `{ bookingId, reason, notes? }` -> `RefundRequestResult`
- `GET /api/v1/receipts/:bookingId`: -> `PaymentReceipt`

Because the frontend is coded to `ICustomerPaymentRepository`, swapping `MockCustomerPaymentRepository` for `HttpCustomerPaymentRepository` will require zero changes to UI components or state machines.

---

## 12. Design, Accessibility, and Natural Voice Standards

- Zero em dashes across all UI microcopy, receipts, notices, and error messages.
- Plain, direct Nigerian marketplace terms: "Pay & Fund Escrow", "BukieGuarantee Escrow", "Inspect & Release Funds", "Bank Transfer", "Naira (₦)".
- Follows locked `DESIGN.md` tokens: Deep Navy `#001A41`, Emerald `#296A4B`, Light Mint `#ABEEC8`, Slate borders.
- Touch targets strictly 48px minimum height on mobile.
- High contrast and full WCAG 2.2 AA compliance.

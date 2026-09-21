# Spec: WEB-015 Customer Payments & Escrow UX

**Status**: Draft (Proposed Architecture for Review)

## 1. Overview and Core Objective
WEB-015 establishes the Customer Payments and Escrow user experience for the BukieBrainJobs platform. In the marketplace transaction lifecycle, once a booking is confirmed (`JobStatus: CONFIRMED` following WEB-013), the customer must be able to securely fund escrow before work commences, track funds protected under BukieGuarantee, inspect completed work, release payouts upon satisfaction, and access digital receipts and honest refund flows.

This specification formally locks the architectural contracts, state machines, financial boundaries, and UI requirements before `/develop` begins.

---

## 2. Escrow & Payment State Machine and Relationship to Job Contracts

### 2.1 Domain Enums and States

```typescript
export type PaymentMethodType = 'card' | 'bank_transfer' | 'ussd';

export type PaymentRailProvider = 'paystack' | 'flutterwave' | 'moniepoint';

export type PaymentAuthorizationStatus =
  | 'idle'
  | 'initiating'
  | 'awaiting_payment'
  | 'processing'
  | 'verified'
  | 'failed'
  | 'timeout'
  | 'cancelled';

export type EscrowStatus =
  | 'unfunded'
  | 'held_in_escrow'
  | 'release_pending'
  | 'released'
  | 'disputed'
  | 'refund_pending'
  | 'refunded';
```

### 2.2 Relationship to `JobStatus` and `BookingStatus`

Under ARCH-002, `JobStatus` is the authoritative lifecycle state across the marketplace. Escrow status acts as an explicit financial dimension attached to the job:

| JobStatus | Allowed EscrowStatus | Customer UI Surface & Prompts |
| :--- | :--- | :--- |
| `CONFIRMED` | `unfunded` | "Booking confirmed. Fund escrow to protect your payment and schedule technician dispatch." |
| `CONFIRMED` | `held_in_escrow` | "Funds secured in BukieGuarantee escrow. BrainWorker has been authorized to proceed." |
| `IN_PROGRESS` | `held_in_escrow` | "BrainWorker is actively executing service. Funds remain safely locked." |
| `PENDING_COMPLETION` | `held_in_escrow` | "Work completed by BrainWorker. Inspect the job and approve release of funds." |
| `COMPLETED` / `PAID` | `released` | "Funds released to BrainWorker. Service completed. Digital receipt available." |
| `DISPUTED` | `disputed` | "Escrow locked due to open dispute. BukieBrainJobs team is reviewing the claim." |
| `CANCELLED` | `unfunded` or `refunded` | "Booking cancelled. No funds held or refund processed." |

### 2.3 Strict State Transitions
- `unfunded` -> `held_in_escrow`: Only valid when `JobStatus` is `CONFIRMED` and payment authorization reaches `verified`.
- `held_in_escrow` -> `release_pending` -> `released`: Only valid when `JobStatus` is `PENDING_COMPLETION` (or `IN_PROGRESS` with explicit customer inspection override).
- `held_in_escrow` -> `disputed`: Valid at any point during `IN_PROGRESS` or `PENDING_COMPLETION` before funds are released.
- `held_in_escrow` -> `refund_pending` -> `refunded`: Valid if booking is cancelled before work begins, or via dispute resolution.
- Any attempt to release an `unfunded` or `refunded` escrow throws an invariant error and fails closed.

---

## 3. Nigerian Payment Methods & Fee Presentation

### 3.1 Supported Payment Methods (Modal/Drawer Selector)
1. **Debit / Credit Card (Paystack / Flutterwave standard)**:
   - Supports Mastercard, Visa, and Verve.
   - Form inputs: Card number, Expiry MM/YY, CVV, with 3D Secure / OTP authorization mock simulation.
2. **Dedicated Virtual Bank Transfer (Moniepoint / Wema ALAT / Providus standard)**:
   - Dynamic unique virtual account generated for checkout:
     - Bank Name: e.g. "Wema Bank / BukiePay"
     - Account Number: e.g. "0123984712"
     - Beneficiary Name: "BukieBrainJobs Escrow (Job #...)"
     - Expiration countdown timer (30 minutes).
     - Instruction: "Transfer the exact amount below. Escrow confirms automatically within 60 seconds."
3. **USSD Shortcode**:
   - Quick bank selector (GTBank `*737*...#`, Access `*901*...#`, Zenith `*966*...#`, UBA `*919*...#`).
   - Copyable USSD string with direct dial link on mobile devices.

### 3.2 Transparent Fee Breakdown & Calculations
Every checkout summary and receipt itemizes four clear figures in Naira (₦):
1. **Base Service Estimate**: Agreed rate or technician quote (e.g. ₦20,000).
2. **Platform Service Fee**: 10% marketplace connection fee (₦2,000).
3. **BukieGuarantee Escrow Protection Fee**: 7.5% escrow security fee (₦1,500), clearly annotated: "Protects your payment in escrow until you inspect and approve the completed work."
4. **VAT (Value Added Tax)**: 7.5% statutory VAT applied to the platform service fee (₦150).
5. **Total Payable**: Sum of base, platform fee, guarantee fee, and VAT (e.g. ₦23,650).
Zero hidden convenience fees or undocumented processing charges.

---

## 4. Authorization & Financial Mutation Boundaries

1. **Session-Derived Caller Identity**:
   - Every financial mutation (`initiateCheckout`, `verifyPayment`, `releaseEscrow`, `requestRefund`, `disputeEscrow`) requires the authenticated `customerId` derived from the session/auth boundary.
   - If the caller `customerId` does not match the customer on the booking record, the mutation immediately throws `UnauthorizedError` and fails closed.
2. **Idempotency & Duplicate Charge Prevention**:
   - Every checkout initiation generates a unique `idempotencyKey` and `paymentReference` (`bbj-pay-[uuid]`).
   - The UI disables payment action buttons immediately upon submission, preventing double-clicks.
   - The repository rejects any subsequent `initiateCheckout` or `verifyPayment` call for a booking that already has status `held_in_escrow`.
3. **No Synthetic Money**:
   - No mock balance increments or artificial funds may be created out of thin air. All escrow records must trace to an explicit verified payment reference.

---

## 5. Offline & Network Degraded Behavior

1. **Offline Read-Only Protection**:
   - If the application is offline (`isOffline === true`):
     - All mutation controls ("Pay Now", "Release Escrow", "Submit Refund Request") are disabled.
     - A clear, non-generic banner states: "You are currently offline. Payment and escrow operations require an active network connection."
     - Background retries are paused to avoid duplicate transaction attempts when reconnecting.
2. **Cache Readability**:
   - Completed receipts and historical transaction records remain readable and printable from local session storage.

---

## 6. Receipts & Refund Boundaries

### 6.1 Digital Receipt Surface (`/receipt/[bookingId]`)
- Canonical web surface accessible via `/receipt/[bookingId]` or directly from the `/jobs` detail view.
- Content:
  - BukieBrainJobs official receipt header and logo badge.
  - Receipt Number (`REC-[YEAR]-[RANDOM]`), Issue Date, and Timestamp.
  - Customer Name, Masked Phone, and Service Address.
  - Assigned BrainWorker Name, Trade Category, and Verification Status.
  - Itemized Financial Breakdown (Base, Platform Fee, Escrow Guarantee, VAT, Total).
  - Payment Method Used (e.g. `Card (Mastercard •••• 4242)` or `Bank Transfer`).
  - Escrow Settlement Status and Release Timestamp.
- Print & Export:
  - Clean `@media print` layout hiding navigation and non-printable UI elements.
  - "Download JSON Summary" for personal accounting.

### 6.2 Customer Refund Flow
- Accessible from `/jobs?id=...` when a booking is cancelled prior to work or when dispute resolution awards a refund.
- Refund Form:
  - Reason selector: "BrainWorker unable to attend", "Mutual cancellation", "Work incomplete or unacceptable", "Other".
  - Additional context notes.
- Transparent Timeline Notice:
  - "Card refunds typically reflect within 3 to 5 business days depending on your issuing bank. Bank transfer refunds process within 24 to 48 hours."
- State tracking: `refund_pending` -> `refunded`.

---

## 7. Failure, Timeout, Retry, and Degraded States

1. **Payment Gateway Timeout (`timeout`)**:
   - Triggered when gateway verification does not respond within the expected threshold.
   - UI warning: "Payment verification is taking longer than expected. Do not submit payment again. Click 'Check Verification Status' to re-check with your bank."
2. **Declined / Failed Payment (`failed`)**:
   - Shows actionable, human error reasons (e.g. "Card declined: Insufficient funds", "Bank network timeout").
   - Action: "Try another payment method" or "Retry verification".
3. **Service Unavailable**:
   - Localized retry block with clean error boundary.

---

## 8. Frontend / Backend Handoff & Repository Contract

To ensure the mock implementation does not establish a false contract, the frontend interacts exclusively through an authoritative repository interface:

```typescript
export interface ICustomerPaymentRepository {
  getPaymentContext(authenticatedCustomerId: string, bookingId: string): Promise<PaymentContext>;
  initiateCheckout(authenticatedCustomerId: string, input: InitiateCheckoutInput): Promise<CheckoutSession>;
  verifyPayment(authenticatedCustomerId: string, checkoutReference: string): Promise<PaymentVerificationResult>;
  releaseEscrow(authenticatedCustomerId: string, input: ReleaseEscrowInput): Promise<EscrowReleaseResult>;
  requestRefund(authenticatedCustomerId: string, input: RequestRefundInput): Promise<RefundRequestResult>;
  getReceipt(authenticatedCustomerId: string, bookingId: string): Promise<PaymentReceipt>;
}
```

When backend engineers deploy the production Paystack/Flutterwave microservice, they simply provide an `HttpCustomerPaymentRepository` implementing `ICustomerPaymentRepository`. The frontend components and state machines require zero structural modification.

---

## 9. Brand & Voice Standards

- Zero em dashes across all UI microcopy, receipts, notices, and error messages.
- Plain, direct Nigerian marketplace terms: "Pay & Fund Escrow", "BukieGuarantee Escrow", "Inspect & Release Funds", "Bank Transfer", "Naira (₦)".
- Follows locked `DESIGN.md` tokens: Deep Navy `#001A41`, Emerald `#296A4B`, Light Mint `#ABEEC8`, Slate borders.
- Touch targets strictly 48px minimum height on mobile.
- High contrast and full WCAG 2.2 AA compliance.

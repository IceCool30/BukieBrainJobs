# BW-006 BrainWorker Earnings, Wallet and Payouts

**Document ID:** BW-006  
**Version:** 1.0  
**Status:** Approved  
**Primary Route:** `/brainworker/wallet`  
**Item Reference:** Master Checklist Item 2.6  

---

## 1. Purpose and Architectural Summary

BW-006 establishes the financial management, earnings transparency, and payout execution workspace for approved artisans (BrainWorkers) on BukieBrainJobs.

The feature empowers artisans to track their available balances, monitor pending escrow clearance, inspect lifetime earnings, manage verified Nigerian bank settlement accounts (via NUBAN validation across canonical Nigerian commercial banks), and request fee-free withdrawals to their verified personal accounts. In accordance with platform security and architecture guidelines, this surface enforces strict physical tenant isolation, fail-closed customer boundaries, unapproved provider verification routing, and rigorous financial invariants (zero negative balances, ₦1,000 minimum withdrawal threshold, deterministic 10% platform service fee deduction on gross escrow settlements, and account number masking).

---

## 2. Domain Invariants and Specifications (WALLET-001 to WALLET-010)

The pure domain layer (`apps/web/lib/brainworker/wallet/domain.ts`) governs all wallet summaries, bank accounts, payout requests, and financial calculation invariants:

1. **WALLET-001 (NUBAN Bank Account Validation):**
   - Account numbers must be exactly 10 digits (`/^\d{10}$/`).
   - Non-numeric inputs, lengths less than 10, or lengths greater than 10 are rejected.
2. **WALLET-002 (Canonical Nigerian Bank Support):**
   - Bank names must match one of the recognized Nigerian financial institutions (Access Bank, GTBank, Zenith Bank, First Bank, UBA, Fidelity Bank, Union Bank, Stanbic IBTC, FCMB, Sterling Bank, Wema Bank).
   - Rejects unlisted or fabricated institutions.
3. **WALLET-003 (Account Name Normalization and Trimming):**
   - Account holder names are trimmed of leading/trailing whitespace and normalized to uppercase.
   - Requires non-empty name with minimum length of 2 characters.
4. **WALLET-004 (Account Number Masking):**
   - Account numbers displayed in UI or logged in receipts are masked to show only the last 4 digits (e.g. `******7890`).
5. **WALLET-005 (Minimum Withdrawal Threshold):**
   - Enforces a minimum withdrawal limit of ₦1,000 (`MIN_WITHDRAWAL_NGN = 1000`).
   - Amounts below ₦1,000 throw an invariant error.
6. **WALLET-006 (Available Balance Withdrawal Constraint):**
   - Withdrawal requests cannot exceed the artisan current `availableBalanceNgn`.
   - Rejects attempts to withdraw more than available funds.
7. **WALLET-007 (Non-Negative Financial Invariants):**
   - Validates that `availableBalanceNgn`, `pendingEscrowNgn`, and `lifetimeEarningsNgn` are finite, non-negative numbers.
   - Throws if any balance component drops below zero.
8. **WALLET-008 (Platform Fee and Net Earnings Calculation):**
   - Calculates deterministic 10% platform service fee on completed booking escrow (`PLATFORM_FEE_PERCENTAGE = 10`).
   - Net artisan earnings equal gross amount minus fee (e.g. ₦50,000 gross yields ₦5,000 fee and ₦45,000 net credit).
9. **WALLET-009 (Transaction Type Classification):**
   - Restricts transaction types to canonical ledger entries: `escrow_credit`, `payout_withdrawal`, `platform_fee_deduction`, and `dispute_adjustment`.
10. **WALLET-010 (Currency Formatting Helper):**
    - Standardizes currency presentation to Nigerian Naira with comma thousands separators and optional decimals (e.g. `₦45,000` or `₦1,250.50`).

---

## 3. Repository Contracts and Tenant Isolation (REP-001 to REP-010)

The repository layer (`apps/web/lib/brainworker/wallet/repository.ts`) provides tenant-partitioned in-memory storage and state transitions:

1. **REP-001 (Physical Tenant Isolation):**
   - Bank accounts, wallet summaries, payout requests, and transaction histories are partitioned strictly by `workerId`.
2. **REP-002 (Safe Zero-Initialized Summary Provisioning):**
   - Uninitialized artisans receive a zero-balance summary (`availableBalanceNgn: 0`, `pendingEscrowNgn: 0`, `lifetimeEarningsNgn: 0`) with verified non-negative invariants.
3. **REP-003 (Bank Account Registration and Duplicate Prevention):**
   - Validates NUBAN and bank code, prevents duplicate registrations of the same bank and account number pair for a worker, and sets the first registered account as default.
4. **REP-004 (Scoped Bank Account Deletion):**
   - Deletes bank accounts strictly within the caller tenant partition and prevents deleting accounts belonging to another artisan.
5. **REP-005 (Payout Request Dispatch and Balance Deduction):**
   - Verifies verified bank account ownership, asserts minimum ₦1,000 threshold and balance sufficiency, creates a `pending` payout record, and deducts the payout amount from `availableBalanceNgn`.
6. **REP-006 (Payout History Reverse Chronological Ordering):**
   - Payout requests are returned newest first by `requestedAt`.
7. **REP-007 (Transaction Ledger Scoped Recording):**
   - Transactions are immutably appended to the worker partitioned ledger with unique IDs and timestamps.
8. **REP-008 (Transaction Ledger Query and Type Filtering):**
   - Returns ledger items sorted newest first, with optional filtering by transaction type (`escrow_credit`, `payout_withdrawal`, etc.).
9. **REP-009 (Escrow Release and Fee Deduction Automation):**
   - Simulates escrow release by crediting net amount (90%) to `availableBalanceNgn`, adding gross amount to `lifetimeEarningsNgn`, reducing `pendingEscrowNgn`, and appending corresponding ledger entries.
10. **REP-010 (Audit Trail and Masked Account Logging):**
    - Payout records store masked account numbers (`******7890`) ensuring sensitive financial identifiers are not exposed in plaintext logs.

---

## 4. Trades Design System UI Components (COMP-001 to COMP-012)

The UI component suite (`apps/web/components/brainworker/wallet/`) adheres to the dark-only Trades Design System (Obsidian Titanium Gunmetal):

1. **WalletSummaryCards (`COMP-001` to `COMP-003`):**
   - Displays 3 metric cards: Available Balance, Pending Escrow, and Lifetime Earnings with Nigerian Naira formatting.
   - Quick action buttons to open the payout request modal and bank management section.
   - Disambiguated test IDs (`summary-add-bank-account-button`) to preserve clean testing semantics.
2. **BankAccountsManager (`COMP-004` to `COMP-006`):**
   - Lists verified settlement bank accounts with bank name, masked account number, and default badge.
   - Inline add bank account form with bank dropdown selector, 10-digit NUBAN input, and account holder name field.
   - Deletion action with tenant safety checks.
3. **PayoutRequestModal (`COMP-007` to `COMP-009`):**
   - Accessible dialog modal with backdrop blur and trap focus.
   - Destination bank selector pre-selecting the default bank account.
   - Amount input with instant ₦1,000 minimum threshold validation and available balance limit enforcement.
   - Submits validated withdrawal request to `onRequestPayout`.
4. **WalletLedgerTable (`COMP-010` to `COMP-011`):**
   - Tabular and mobile card ledger of all wallet transactions.
   - Displays date, transaction type badge, reference ID, and formatted Naira amount with directional color coding (emerald credit, rose debit).
   - Filter chips to view All, Credits, or Withdrawals.
5. **WalletManagementWorkspace (`COMP-012`):**
   - Master layout orchestrating summary cards, bank manager, ledger table, and payout modal.
   - Responsive grid scaling cleanly from mobile screens to desktop viewports.

---

## 5. Route Integration and Security Gates (ROUTE-001 to ROUTE-010)

The protected route (`apps/web/app/brainworker/wallet/page.tsx`) implements 4 access gates and action delegations:

1. **Gate 1 (Unauthenticated Visitor):**
   - Redirects to `/login?redirect=/brainworker/wallet` without executing repository queries (`ROUTE-001`).
2. **Gate 2 (Customer Role Guard):**
   - Renders fail-closed boundary card (`Customer Account Detected` / `Access Restricted`) preventing customer access to artisan wallet data (`ROUTE-002`).
3. **Gate 3 (Unapproved Provider Guard):**
   - Redirects unapproved artisans to `/brainworker/verification-status` (`ROUTE-003`).
4. **Gate 4 (Approved Provider Workspace):**
   - Mounts `WalletManagementWorkspace` with live repository data for the authenticated artisan (`ROUTE-004`).
   - All repository read operations strictly bound to session `currentUser.id` (`ROUTE-005`).
   - Action delegates: add bank account (`ROUTE-006`), delete bank account (`ROUTE-007`), request payout (`ROUTE-008`).
   - Error handling: surfaces user-friendly error banners upon invalid inputs or repository rejections (`ROUTE-009`).
5. **SSR Mount Safety and Accessibility:**
   - Pre-renders the shared BrainWorker header (logo tile, dashboard return link, Trades badge and sign out) without throwing during SSR (`ROUTE-010`).

---

## 6. Verification Metrics

- **Domain Contracts (`types.test.ts`):** 10/10 passed (`WALLET-001` to `WALLET-010`).
- **Repository Contracts (`repository.test.ts`):** 10/10 passed (`REP-001` to `REP-010`).
- **UI Component Contracts (`WalletUI.test.tsx`):** 12/12 passed (`COMP-001` to `COMP-012`).
- **Route Integration Contracts (`BrainWorkerWalletRoute.test.tsx`):** 10/10 passed (`ROUTE-001` to `ROUTE-010`).
- **Total Wallet Suite:** 42/42 contracts passed.
- **Monorepo Web Suite:** 460/460 tests passed across 33 test files.
- **Monorepo Typecheck:** 7/7 workspace packages clean with 0 errors.
- **Production Build:** Static page generated at `/brainworker/wallet` (10.3 kB) alongside 44 total routes.

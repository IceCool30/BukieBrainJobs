// apps/web/lib/brainworker/wallet/domain.ts
// BrainWorker Earnings, Wallet and Payouts Domain Functions (BW-006, Item 2.6)
// Phase 1 GREEN: Pure domain functions and business invariants

import {
  CANONICAL_NIGERIAN_BANKS,
  DEFAULT_PLATFORM_FEE_PERCENTAGE,
  MINIMUM_PAYOUT_AMOUNT_NAIRA,
  type BankAccountDetails,
  type BrainWorkerWalletSummary,
  type NigerianBank,
  type PayoutRequestStatus,
  type RequestPayoutInput,
  type WalletTransaction,
} from './types';

/**
 * Returns the canonical directory of Nigerian financial institutions.
 */
export function getNigerianBanks(): readonly NigerianBank[] {
  return CANONICAL_NIGERIAN_BANKS;
}

/**
 * Resolves a Nigerian bank by its canonical NIBSS routing code.
 */
export function getNigerianBankByCode(code: string): NigerianBank | undefined {
  return CANONICAL_NIGERIAN_BANKS.find((bank) => bank.code === code);
}

/**
 * Validates that an account number strictly satisfies the 10-digit NUBAN specification.
 */
export function validateNubanAccountNumber(accountNumber: string): string {
  if (typeof accountNumber !== 'string') {
    throw new Error('Account number is required');
  }

  const trimmed = accountNumber.trim();
  if (trimmed.length === 0) {
    throw new Error('Account number is required');
  }

  if (!/^\d+$/.test(trimmed)) {
    throw new Error('NUBAN account number must contain only numeric digits');
  }

  if (trimmed.length !== 10) {
    throw new Error('NUBAN account number must be exactly 10 numeric digits');
  }

  return trimmed;
}

/**
 * Validates a BankAccountDetails object shape and consistency.
 */
export function validateBankAccountDetails(input: unknown): BankAccountDetails {
  if (!input || typeof input !== 'object') {
    throw new Error('Bank account details must be an object');
  }

  const raw = input as Partial<BankAccountDetails>;

  if (!raw.id || typeof raw.id !== 'string' || raw.id.trim().length === 0) {
    throw new Error('Bank account id is required');
  }

  if (
    !raw.brainWorkerId ||
    typeof raw.brainWorkerId !== 'string' ||
    raw.brainWorkerId.trim().length === 0
  ) {
    throw new Error('BrainWorker id is required');
  }

  if (!raw.bankCode || typeof raw.bankCode !== 'string') {
    throw new Error('Bank code is required');
  }

  const bank = getNigerianBankByCode(raw.bankCode);
  if (!bank) {
    throw new Error(`Unrecognized Nigerian bank code: ${raw.bankCode}`);
  }

  const cleanAccountNumber = validateNubanAccountNumber(raw.accountNumber ?? '');

  if (
    !raw.accountName ||
    typeof raw.accountName !== 'string' ||
    raw.accountName.trim().length === 0
  ) {
    throw new Error('Account name is required');
  }

  const cleanAccountName = raw.accountName.trim().toUpperCase();

  return {
    id: raw.id.trim(),
    brainWorkerId: raw.brainWorkerId.trim(),
    bankCode: bank.code,
    bankName: raw.bankName ?? bank.name,
    accountNumber: cleanAccountNumber,
    accountName: cleanAccountName,
    isVerified: Boolean(raw.isVerified),
    createdAt: raw.createdAt ?? new Date().toISOString(),
  };
}

/**
 * Validates non-negative integer balance invariants for a wallet summary.
 */
export function validateWalletSummaryInvariants(
  summary: unknown
): BrainWorkerWalletSummary {
  if (!summary || typeof summary !== 'object') {
    throw new Error('Wallet summary must be an object');
  }

  const raw = summary as Partial<BrainWorkerWalletSummary>;

  if (
    !raw.brainWorkerId ||
    typeof raw.brainWorkerId !== 'string' ||
    raw.brainWorkerId.trim().length === 0
  ) {
    throw new Error('BrainWorker id is required');
  }

  const numericFields: Array<keyof BrainWorkerWalletSummary> = [
    'availableBalanceNaira',
    'pendingEscrowNaira',
    'lifetimeEarningsNaira',
    'totalWithdrawnNaira',
  ];

  for (const field of numericFields) {
    const value = raw[field];
    if (typeof value !== 'number' || Number.isNaN(value) || value < 0) {
      throw new Error(
        `Wallet balance field ${String(field)} must be a non-negative number`
      );
    }
  }

  if (raw.currency !== 'NGN') {
    throw new Error('Wallet currency must be NGN');
  }

  return {
    brainWorkerId: raw.brainWorkerId.trim(),
    availableBalanceNaira: raw.availableBalanceNaira as number,
    pendingEscrowNaira: raw.pendingEscrowNaira as number,
    lifetimeEarningsNaira: raw.lifetimeEarningsNaira as number,
    totalWithdrawnNaira: raw.totalWithdrawnNaira as number,
    currency: 'NGN',
    updatedAt: raw.updatedAt ?? new Date().toISOString(),
  };
}

/**
 * Validates transaction ledger entry models and positive amount constraints.
 */
export function validateWalletTransaction(tx: unknown): WalletTransaction {
  if (!tx || typeof tx !== 'object') {
    throw new Error('Wallet transaction must be an object');
  }

  const raw = tx as Partial<WalletTransaction>;

  if (!raw.id || typeof raw.id !== 'string' || raw.id.trim().length === 0) {
    throw new Error('Transaction id is required');
  }

  if (
    !raw.brainWorkerId ||
    typeof raw.brainWorkerId !== 'string' ||
    raw.brainWorkerId.trim().length === 0
  ) {
    throw new Error('BrainWorker id is required');
  }

  const validTypes = [
    'escrow_credit',
    'payout_withdrawal',
    'platform_fee_deduction',
    'adjustment',
  ];
  if (!raw.type || !validTypes.includes(raw.type)) {
    throw new Error(`Invalid transaction type: ${String(raw.type)}`);
  }

  const validStatuses = ['pending', 'cleared', 'failed', 'reversed'];
  if (!raw.status || !validStatuses.includes(raw.status)) {
    throw new Error(`Invalid transaction status: ${String(raw.status)}`);
  }

  if (
    typeof raw.amountNaira !== 'number' ||
    Number.isNaN(raw.amountNaira) ||
    raw.amountNaira <= 0
  ) {
    throw new Error('Transaction amount must be a positive number');
  }

  if (
    typeof raw.grossAmountNaira !== 'number' ||
    Number.isNaN(raw.grossAmountNaira) ||
    raw.grossAmountNaira <= 0
  ) {
    throw new Error('Transaction gross amount must be a positive number');
  }

  if (
    typeof raw.platformFeeNaira !== 'number' ||
    Number.isNaN(raw.platformFeeNaira) ||
    raw.platformFeeNaira < 0
  ) {
    throw new Error('Transaction platform fee must be a non-negative number');
  }

  if (
    !raw.description ||
    typeof raw.description !== 'string' ||
    raw.description.trim().length === 0
  ) {
    throw new Error('Transaction description is required');
  }

  const result: WalletTransaction = {
    id: raw.id.trim(),
    brainWorkerId: raw.brainWorkerId.trim(),
    type: raw.type,
    amountNaira: raw.amountNaira,
    grossAmountNaira: raw.grossAmountNaira,
    platformFeeNaira: raw.platformFeeNaira,
    status: raw.status,
    description: raw.description.trim(),
    createdAt: raw.createdAt ?? new Date().toISOString(),
  };

  if (raw.bookingId !== undefined) {
    result.bookingId = raw.bookingId;
  }
  if (raw.bookingReference !== undefined) {
    result.bookingReference = raw.bookingReference;
  }

  return result;
}

/**
 * Calculates platform fee deduction and net credit using deterministic integer rounding.
 */
export function calculatePlatformFeeAndNetCredit(
  grossAmountNaira: number,
  feePercentage: number = DEFAULT_PLATFORM_FEE_PERCENTAGE
): { grossAmountNaira: number; platformFeeNaira: number; netAmountNaira: number } {
  if (
    typeof grossAmountNaira !== 'number' ||
    Number.isNaN(grossAmountNaira) ||
    grossAmountNaira <= 0
  ) {
    throw new Error('Gross amount must be positive');
  }

  if (
    typeof feePercentage !== 'number' ||
    Number.isNaN(feePercentage) ||
    feePercentage < 0 ||
    feePercentage > 100
  ) {
    throw new Error('Fee percentage must be between 0 and 100');
  }

  const platformFeeNaira = Math.round((grossAmountNaira * feePercentage) / 100);
  const netAmountNaira = grossAmountNaira - platformFeeNaira;

  return {
    grossAmountNaira,
    platformFeeNaira,
    netAmountNaira,
  };
}

/**
 * Validates payout withdrawal request parameters against minimum limits and available balance.
 */
export function validatePayoutRequestInput(
  input: unknown,
  availableBalanceNaira: number
): RequestPayoutInput {
  if (!input || typeof input !== 'object') {
    throw new Error('Payout request input must be an object');
  }

  const raw = input as Partial<RequestPayoutInput>;

  if (
    !raw.bankAccountId ||
    typeof raw.bankAccountId !== 'string' ||
    raw.bankAccountId.trim().length === 0
  ) {
    throw new Error('Bank account id is required');
  }

  if (
    typeof raw.amountNaira !== 'number' ||
    Number.isNaN(raw.amountNaira) ||
    raw.amountNaira < MINIMUM_PAYOUT_AMOUNT_NAIRA
  ) {
    throw new Error(
      `Payout amount must be a positive integer meeting the minimum threshold of 1,000 NGN`
    );
  }

  if (raw.amountNaira > availableBalanceNaira) {
    throw new Error('Insufficient available balance for withdrawal');
  }

  const result: RequestPayoutInput = {
    amountNaira: Math.floor(raw.amountNaira),
    bankAccountId: raw.bankAccountId.trim(),
  };

  if (raw.notes !== undefined) {
    result.notes = raw.notes.trim();
  }

  return result;
}

/**
 * Governs permitted state machine transitions for payout requests.
 */
export function canTransitionPayoutStatus(
  current: PayoutRequestStatus,
  next: PayoutRequestStatus
): boolean {
  if (current === 'submitted') {
    return next === 'processing' || next === 'failed';
  }

  if (current === 'processing') {
    return next === 'paid' || next === 'failed';
  }

  // Terminal states cannot transition
  return false;
}

/**
 * Formats a numeric Naira value into standard display notation (e.g. NGN 15,000).
 */
export function formatNaira(amountNaira: number): string {
  if (
    typeof amountNaira !== 'number' ||
    Number.isNaN(amountNaira) ||
    amountNaira < 0
  ) {
    throw new Error('Amount must be non-negative');
  }

  const formattedNumber = Math.round(amountNaira).toLocaleString('en-US');
  return `NGN ${formattedNumber}`;
}

/**
 * Validates that production source files preserve the physical testing boundary.
 */
export function assertProductionBoundary(sourceCode: string): boolean {
  return !/from ['"][^'"]*testing[^'"]*['"]/.test(sourceCode);
}

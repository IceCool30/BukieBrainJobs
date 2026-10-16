// apps/web/lib/brainworker/wallet/types.ts
// BrainWorker Earnings, Wallet and Payouts Types (BW-006, Item 2.6)
// Authoritative Domain Specifications and Contracts

export interface NigerianBank {
  code: string;
  name: string;
  slug: string;
}

export const CANONICAL_NIGERIAN_BANKS: readonly NigerianBank[] = [
  { code: '044', name: 'Access Bank', slug: 'access-bank' },
  { code: '058', name: 'GTBank', slug: 'gtbank' },
  { code: '057', name: 'Zenith Bank', slug: 'zenith-bank' },
  { code: '011', name: 'First Bank of Nigeria', slug: 'first-bank' },
  { code: '033', name: 'United Bank for Africa', slug: 'uba' },
  { code: '221', name: 'Stanbic IBTC Bank', slug: 'stanbic-ibtc' },
  { code: '232', name: 'Sterling Bank', slug: 'sterling-bank' },
  { code: '070', name: 'Fidelity Bank', slug: 'fidelity-bank' },
  { code: '50211', name: 'Kuda Bank', slug: 'kuda-bank' },
  { code: '999992', name: 'OPay', slug: 'opay' },
  { code: '999991', name: 'PalmPay', slug: 'palmpay' },
] as const;

export interface BankAccountDetails {
  id: string;
  brainWorkerId: string;
  bankCode: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  isVerified: boolean;
  createdAt: string;
}

export interface BrainWorkerWalletSummary {
  brainWorkerId: string;
  availableBalanceNaira: number;
  pendingEscrowNaira: number;
  lifetimeEarningsNaira: number;
  totalWithdrawnNaira: number;
  currency: 'NGN';
  updatedAt: string;
}

export type WalletTransactionType =
  | 'escrow_credit'
  | 'payout_withdrawal'
  | 'platform_fee_deduction'
  | 'adjustment';

export type WalletTransactionStatus =
  | 'pending'
  | 'cleared'
  | 'failed'
  | 'reversed';

export interface WalletTransaction {
  id: string;
  brainWorkerId: string;
  bookingId?: string | undefined;
  bookingReference?: string | undefined;
  type: WalletTransactionType;
  amountNaira: number;
  grossAmountNaira: number;
  platformFeeNaira: number;
  status: WalletTransactionStatus;
  description: string;
  createdAt: string;
}

export interface RequestPayoutInput {
  amountNaira: number;
  bankAccountId: string;
  notes?: string | undefined;
}

export type PayoutRequestStatus =
  | 'submitted'
  | 'processing'
  | 'paid'
  | 'failed';

export interface DestinationBankSummary {
  bankName: string;
  bankCode: string;
  maskedAccountNumber: string;
  accountName: string;
}

export interface PayoutRequest {
  id: string;
  brainWorkerId: string;
  bankAccountId: string;
  amountNaira: number;
  feeNaira: number;
  netAmountNaira: number;
  destinationBank: DestinationBankSummary;
  status: PayoutRequestStatus;
  requestedAt: string;
  processedAt?: string | null | undefined;
  failureReason?: string | null | undefined;
}

export const DEFAULT_PLATFORM_FEE_PERCENTAGE = 10;
export const MINIMUM_PAYOUT_AMOUNT_NAIRA = 1000;

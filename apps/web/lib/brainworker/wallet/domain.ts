// apps/web/lib/brainworker/wallet/domain.ts
// BrainWorker Earnings, Wallet and Payouts Domain Functions (BW-006, Item 2.6)
// Phase 1 RED: Domain function stubs throwing intentional RED errors

import type {
  BankAccountDetails,
  BrainWorkerWalletSummary,
  NigerianBank,
  PayoutRequestStatus,
  RequestPayoutInput,
  WalletTransaction,
} from './types';

export function getNigerianBanks(): readonly NigerianBank[] {
  throw new Error('RED: not implemented');
}

export function getNigerianBankByCode(_code: string): NigerianBank | undefined {
  throw new Error('RED: not implemented');
}

export function validateNubanAccountNumber(_accountNumber: string): string {
  throw new Error('RED: not implemented');
}

export function validateBankAccountDetails(_input: unknown): BankAccountDetails {
  throw new Error('RED: not implemented');
}

export function validateWalletSummaryInvariants(_summary: unknown): BrainWorkerWalletSummary {
  throw new Error('RED: not implemented');
}

export function validateWalletTransaction(_tx: unknown): WalletTransaction {
  throw new Error('RED: not implemented');
}

export function calculatePlatformFeeAndNetCredit(
  _grossAmountNaira: number,
  _feePercentage?: number
): { grossAmountNaira: number; platformFeeNaira: number; netAmountNaira: number } {
  throw new Error('RED: not implemented');
}

export function validatePayoutRequestInput(
  _input: unknown,
  _availableBalanceNaira: number
): RequestPayoutInput {
  throw new Error('RED: not implemented');
}

export function canTransitionPayoutStatus(
  _current: PayoutRequestStatus,
  _next: PayoutRequestStatus
): boolean {
  throw new Error('RED: not implemented');
}

export function formatNaira(_amountNaira: number): string {
  throw new Error('RED: not implemented');
}

export function assertProductionBoundary(_sourceCode: string): boolean {
  throw new Error('RED: not implemented');
}

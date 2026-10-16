// apps/web/lib/brainworker/wallet/repository.ts
// BrainWorker Earnings, Wallet and Payouts Repository Interface (BW-006, Item 2.6)
// Phase 2 RED: Interface and throwing stubs

import type {
  BankAccountDetails,
  BrainWorkerWalletSummary,
  PayoutRequest,
  RequestPayoutInput,
  WalletTransaction,
  WalletTransactionStatus,
  WalletTransactionType,
} from './types';

export interface AddBankAccountInput {
  bankCode: string;
  accountNumber: string;
  accountName?: string | undefined;
}

export interface IBrainWorkerWalletRepository {
  getWalletSummary(brainWorkerId: string): Promise<BrainWorkerWalletSummary>;
  getBankAccounts(brainWorkerId: string): Promise<BankAccountDetails[]>;
  addBankAccount(
    brainWorkerId: string,
    input: AddBankAccountInput
  ): Promise<BankAccountDetails>;
  deleteBankAccount(
    brainWorkerId: string,
    bankAccountId: string
  ): Promise<void>;
  requestPayout(
    brainWorkerId: string,
    input: RequestPayoutInput
  ): Promise<PayoutRequest>;
  getPayoutRequests(brainWorkerId: string): Promise<PayoutRequest[]>;
  getTransactions(
    brainWorkerId: string,
    filter?: {
      type?: WalletTransactionType | undefined;
      status?: WalletTransactionStatus | undefined;
    } | undefined
  ): Promise<WalletTransaction[]>;
  creditEscrowEarnings(
    brainWorkerId: string,
    bookingId: string,
    bookingReference: string,
    grossAmountNaira: number,
    description: string
  ): Promise<{
    transaction: WalletTransaction;
    updatedSummary: BrainWorkerWalletSummary;
  }>;
}

export class BrainWorkerWalletRepository implements IBrainWorkerWalletRepository {
  async getWalletSummary(_brainWorkerId: string): Promise<BrainWorkerWalletSummary> {
    throw new Error('RED: not implemented');
  }

  async getBankAccounts(_brainWorkerId: string): Promise<BankAccountDetails[]> {
    throw new Error('RED: not implemented');
  }

  async addBankAccount(
    _brainWorkerId: string,
    _input: AddBankAccountInput
  ): Promise<BankAccountDetails> {
    throw new Error('RED: not implemented');
  }

  async deleteBankAccount(
    _brainWorkerId: string,
    _bankAccountId: string
  ): Promise<void> {
    throw new Error('RED: not implemented');
  }

  async requestPayout(
    _brainWorkerId: string,
    _input: RequestPayoutInput
  ): Promise<PayoutRequest> {
    throw new Error('RED: not implemented');
  }

  async getPayoutRequests(_brainWorkerId: string): Promise<PayoutRequest[]> {
    throw new Error('RED: not implemented');
  }

  async getTransactions(
    _brainWorkerId: string,
    _filter?: {
      type?: WalletTransactionType | undefined;
      status?: WalletTransactionStatus | undefined;
    } | undefined
  ): Promise<WalletTransaction[]> {
    throw new Error('RED: not implemented');
  }

  async creditEscrowEarnings(
    _brainWorkerId: string,
    _bookingId: string,
    _bookingReference: string,
    _grossAmountNaira: number,
    _description: string
  ): Promise<{
    transaction: WalletTransaction;
    updatedSummary: BrainWorkerWalletSummary;
  }> {
    throw new Error('RED: not implemented');
  }
}

let defaultRepository: IBrainWorkerWalletRepository | null = null;

export function createBrainWorkerWalletRepository(): BrainWorkerWalletRepository {
  return new BrainWorkerWalletRepository();
}

export function getBrainWorkerWalletRepository(): IBrainWorkerWalletRepository {
  if (!defaultRepository) {
    defaultRepository = createBrainWorkerWalletRepository();
  }
  return defaultRepository;
}

export function __resetBrainWorkerWalletRepository(): void {
  defaultRepository = null;
}

export const resetBrainWorkerWalletRepository = __resetBrainWorkerWalletRepository;

// apps/web/lib/brainworker/wallet/repository.ts
// BrainWorker Earnings, Wallet and Payouts Repository Interface and Implementation (BW-006, Item 2.6)
// Phase 2 GREEN: In-memory tenant-partitioned repository implementation

import type {
  BankAccountDetails,
  BrainWorkerWalletSummary,
  PayoutRequest,
  RequestPayoutInput,
  WalletTransaction,
  WalletTransactionStatus,
  WalletTransactionType,
} from './types';
import {
  calculatePlatformFeeAndNetCredit,
  getNigerianBankByCode,
  validateBankAccountDetails,
  validateNubanAccountNumber,
  validatePayoutRequestInput,
  validateWalletSummaryInvariants,
  validateWalletTransaction,
} from './domain';

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
  private readonly bankAccounts = new Map<string, BankAccountDetails>();
  private readonly walletSummaries = new Map<string, BrainWorkerWalletSummary>();
  private readonly payoutRequests = new Map<string, PayoutRequest>();
  private readonly transactions = new Map<string, WalletTransaction>();
  private idCounter = 0;

  private generateId(prefix: string): string {
    this.idCounter += 1;
    return `${prefix}-${Date.now()}-${this.idCounter}-${Math.random().toString(36).slice(2, 7)}`;
  }

  private generateTimestamp(): string {
    this.idCounter += 1;
    return new Date(Date.now() + this.idCounter * 10).toISOString();
  }

  async getWalletSummary(brainWorkerId: string): Promise<BrainWorkerWalletSummary> {
    if (!brainWorkerId || typeof brainWorkerId !== 'string' || brainWorkerId.trim().length === 0) {
      throw new Error('BrainWorker id is required');
    }
    const cleanId = brainWorkerId.trim();
    let summary = this.walletSummaries.get(cleanId);
    if (!summary) {
      summary = {
        brainWorkerId: cleanId,
        availableBalanceNaira: 0,
        pendingEscrowNaira: 0,
        lifetimeEarningsNaira: 0,
        totalWithdrawnNaira: 0,
        currency: 'NGN',
        updatedAt: this.generateTimestamp(),
      };
      this.walletSummaries.set(cleanId, summary);
    }
    return validateWalletSummaryInvariants({ ...summary });
  }

  async getBankAccounts(brainWorkerId: string): Promise<BankAccountDetails[]> {
    if (!brainWorkerId || typeof brainWorkerId !== 'string' || brainWorkerId.trim().length === 0) {
      throw new Error('BrainWorker id is required');
    }
    const cleanId = brainWorkerId.trim();
    return Array.from(this.bankAccounts.values())
      .filter((acc) => acc.brainWorkerId === cleanId)
      .map((acc) => ({ ...acc }));
  }

  async addBankAccount(
    brainWorkerId: string,
    input: AddBankAccountInput
  ): Promise<BankAccountDetails> {
    if (!brainWorkerId || typeof brainWorkerId !== 'string' || brainWorkerId.trim().length === 0) {
      throw new Error('BrainWorker id is required');
    }
    const cleanId = brainWorkerId.trim();

    if (!input || typeof input !== 'object') {
      throw new Error('Bank account input must be an object');
    }

    const bank = getNigerianBankByCode(input.bankCode);
    if (!bank) {
      throw new Error(`Unrecognized Nigerian bank code: ${input.bankCode}`);
    }

    const cleanAccountNumber = validateNubanAccountNumber(input.accountNumber);

    let cleanAccountName = 'VERIFIED ACCOUNT';
    if (
      input.accountName &&
      typeof input.accountName === 'string' &&
      input.accountName.trim().length > 0
    ) {
      cleanAccountName = input.accountName.trim().toUpperCase();
    }

    const id = this.generateId('bank-acc');
    const record: BankAccountDetails = {
      id,
      brainWorkerId: cleanId,
      bankCode: bank.code,
      bankName: bank.name,
      accountNumber: cleanAccountNumber,
      accountName: cleanAccountName,
      isVerified: true,
      createdAt: this.generateTimestamp(),
    };

    const validated = validateBankAccountDetails(record);
    this.bankAccounts.set(validated.id, validated);
    return { ...validated };
  }

  async deleteBankAccount(
    brainWorkerId: string,
    bankAccountId: string
  ): Promise<void> {
    if (!brainWorkerId || typeof brainWorkerId !== 'string' || brainWorkerId.trim().length === 0) {
      throw new Error('BrainWorker id is required');
    }
    if (!bankAccountId || typeof bankAccountId !== 'string' || bankAccountId.trim().length === 0) {
      throw new Error('Bank account id is required');
    }
    const cleanWorkerId = brainWorkerId.trim();
    const cleanAccId = bankAccountId.trim();

    const account = this.bankAccounts.get(cleanAccId);
    if (!account) {
      throw new Error('Bank account not found');
    }

    if (account.brainWorkerId !== cleanWorkerId) {
      throw new Error('Bank account not authorized or not owned by worker');
    }

    this.bankAccounts.delete(cleanAccId);
  }

  async requestPayout(
    brainWorkerId: string,
    input: RequestPayoutInput
  ): Promise<PayoutRequest> {
    if (!brainWorkerId || typeof brainWorkerId !== 'string' || brainWorkerId.trim().length === 0) {
      throw new Error('BrainWorker id is required');
    }
    const cleanWorkerId = brainWorkerId.trim();

    const summary = await this.getWalletSummary(cleanWorkerId);
    const validatedInput = validatePayoutRequestInput(input, summary.availableBalanceNaira);

    const account = this.bankAccounts.get(validatedInput.bankAccountId);
    if (!account || account.brainWorkerId !== cleanWorkerId) {
      throw new Error('Bank account not found or not authorized');
    }

    summary.availableBalanceNaira -= validatedInput.amountNaira;
    summary.totalWithdrawnNaira += validatedInput.amountNaira;
    summary.updatedAt = this.generateTimestamp();
    this.walletSummaries.set(cleanWorkerId, { ...summary });

    const masked = `******${account.accountNumber.slice(-4)}`;
    const payoutId = this.generateId('payout');
    const requestedAt = this.generateTimestamp();

    const payout: PayoutRequest = {
      id: payoutId,
      brainWorkerId: cleanWorkerId,
      bankAccountId: account.id,
      amountNaira: validatedInput.amountNaira,
      feeNaira: 0,
      netAmountNaira: validatedInput.amountNaira,
      destinationBank: {
        bankName: account.bankName,
        bankCode: account.bankCode,
        maskedAccountNumber: masked,
        accountName: account.accountName,
      },
      status: 'submitted',
      requestedAt,
    };

    this.payoutRequests.set(payoutId, payout);

    const txId = this.generateId('tx-payout');
    const tx: WalletTransaction = {
      id: txId,
      brainWorkerId: cleanWorkerId,
      type: 'payout_withdrawal',
      amountNaira: validatedInput.amountNaira,
      grossAmountNaira: validatedInput.amountNaira,
      platformFeeNaira: 0,
      status: 'cleared',
      description: validatedInput.notes
        ? `Payout withdrawal: ${validatedInput.notes}`
        : `Payout withdrawal to ${account.bankName}`,
      createdAt: requestedAt,
    };

    const validatedTx = validateWalletTransaction(tx);
    this.transactions.set(txId, validatedTx);

    return { ...payout };
  }

  async getPayoutRequests(brainWorkerId: string): Promise<PayoutRequest[]> {
    if (!brainWorkerId || typeof brainWorkerId !== 'string' || brainWorkerId.trim().length === 0) {
      throw new Error('BrainWorker id is required');
    }
    const cleanId = brainWorkerId.trim();

    return Array.from(this.payoutRequests.values())
      .filter((r) => r.brainWorkerId === cleanId)
      .sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime())
      .map((r) => ({
        ...r,
        destinationBank: { ...r.destinationBank },
      }));
  }

  async getTransactions(
    brainWorkerId: string,
    filter?: {
      type?: WalletTransactionType | undefined;
      status?: WalletTransactionStatus | undefined;
    } | undefined
  ): Promise<WalletTransaction[]> {
    if (!brainWorkerId || typeof brainWorkerId !== 'string' || brainWorkerId.trim().length === 0) {
      throw new Error('BrainWorker id is required');
    }
    const cleanId = brainWorkerId.trim();

    return Array.from(this.transactions.values())
      .filter((tx) => {
        if (tx.brainWorkerId !== cleanId) return false;
        if (filter?.type && tx.type !== filter.type) return false;
        if (filter?.status && tx.status !== filter.status) return false;
        return true;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map((tx) => ({ ...tx }));
  }

  async creditEscrowEarnings(
    brainWorkerId: string,
    bookingId: string,
    bookingReference: string,
    grossAmountNaira: number,
    description: string
  ): Promise<{
    transaction: WalletTransaction;
    updatedSummary: BrainWorkerWalletSummary;
  }> {
    if (!brainWorkerId || typeof brainWorkerId !== 'string' || brainWorkerId.trim().length === 0) {
      throw new Error('BrainWorker id is required');
    }
    const cleanId = brainWorkerId.trim();

    const split = calculatePlatformFeeAndNetCredit(grossAmountNaira);
    const summary = await this.getWalletSummary(cleanId);

    summary.availableBalanceNaira += split.netAmountNaira;
    summary.lifetimeEarningsNaira += split.netAmountNaira;
    summary.updatedAt = this.generateTimestamp();
    this.walletSummaries.set(cleanId, { ...summary });

    const txId = this.generateId('tx-credit');
    const createdAt = this.generateTimestamp();

    const transaction: WalletTransaction = {
      id: txId,
      brainWorkerId: cleanId,
      bookingId,
      bookingReference,
      type: 'escrow_credit',
      amountNaira: split.netAmountNaira,
      grossAmountNaira: split.grossAmountNaira,
      platformFeeNaira: split.platformFeeNaira,
      status: 'cleared',
      description,
      createdAt,
    };

    const validatedTx = validateWalletTransaction(transaction);
    this.transactions.set(txId, validatedTx);

    return {
      transaction: { ...validatedTx },
      updatedSummary: { ...summary },
    };
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

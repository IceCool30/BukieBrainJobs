// apps/web/components/brainworker/wallet/types.ts
// BrainWorker Wallet & Payouts UI Component Types (BW-006, Item 2.6)

import type {
  BankAccountDetails,
  BrainWorkerWalletSummary,
  PayoutRequest,
  WalletTransaction,
} from '../../../lib/brainworker/wallet/types';

export interface WalletSummaryCardsProps {
  summary: BrainWorkerWalletSummary;
  onRequestPayoutClick: () => void;
  onAddBankAccountClick: () => void;
  hasBankAccounts: boolean;
}

export interface BankAccountsManagerProps {
  accounts: BankAccountDetails[];
  onAddAccount: (input: {
    bankCode: string;
    accountNumber: string;
    accountName?: string | undefined;
  }) => Promise<void>;
  onDeleteAccount: (bankAccountId: string) => Promise<void>;
  isLoading?: boolean | undefined;
}

export interface PayoutRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableBalanceNaira: number;
  bankAccounts: BankAccountDetails[];
  onSubmitPayout: (input: {
    bankAccountId: string;
    amountNaira: number;
    notes?: string | undefined;
  }) => Promise<void>;
  isSubmitting?: boolean | undefined;
}

export interface WalletLedgerTableProps {
  transactions: WalletTransaction[];
  payoutRequests?: PayoutRequest[] | undefined;
  isLoading?: boolean | undefined;
}

export interface WalletManagementWorkspaceProps {
  summary: BrainWorkerWalletSummary;
  accounts: BankAccountDetails[];
  transactions: WalletTransaction[];
  payoutRequests: PayoutRequest[];
  onAddAccount: (input: {
    bankCode: string;
    accountNumber: string;
    accountName?: string | undefined;
  }) => Promise<void>;
  onDeleteAccount: (bankAccountId: string) => Promise<void>;
  onSubmitPayout: (input: {
    bankAccountId: string;
    amountNaira: number;
    notes?: string | undefined;
  }) => Promise<void>;
  isLoading?: boolean | undefined;
}

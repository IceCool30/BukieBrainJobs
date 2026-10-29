// apps/web/components/brainworker/wallet/WalletManagementWorkspace.tsx
// BrainWorker Wallet Management Workspace Component (BW-006, Item 2.6)
// Phase 3 GREEN: Master workspace integrating summary cards, accounts, modal, and ledger

'use client';

import React, { useState } from 'react';
import { BankAccountsManager } from './BankAccountsManager';
import { PayoutRequestModal } from './PayoutRequestModal';
import { WalletLedgerTable } from './WalletLedgerTable';
import { WalletSummaryCards } from './WalletSummaryCards';
import type { WalletManagementWorkspaceProps } from './types';

export function WalletManagementWorkspace({
  summary,
  accounts,
  transactions,
  payoutRequests,
  onAddAccount,
  onDeleteAccount,
  onSubmitPayout,
  isLoading = false,
}: WalletManagementWorkspaceProps): React.JSX.Element {
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);

  const handleAddBankAccountClick = () => {
    // Scroll smoothly to the bank accounts manager section
    const el = document.getElementById('connected-bank-accounts-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div
      data-testid="wallet-management-workspace"
      role="region"
      aria-label="Wallet and Earnings Management"
      className="space-y-8"
    >
      {/* Workspace Header */}
      <div className="border-b border-[var(--lead)] pb-5">
        <h1 className="text-xl font-bold tracking-tight text-[var(--text-main)] sm:text-2xl">
          Earnings & Wallet
        </h1>
        <p className="mt-1 text-xs text-[var(--text-muted)] sm:text-sm">
          Track escrow payments, manage verified Nigerian payout accounts, and execute withdrawals with zero transfer fees.
        </p>
      </div>

      {/* 1. Summary Metrics Cards */}
      <section aria-labelledby="wallet-summary-heading">
        <h2 id="wallet-summary-heading" className="sr-only">
          Wallet Summary Metrics
        </h2>
        <WalletSummaryCards
          summary={summary}
          onRequestPayoutClick={() => setIsPayoutModalOpen(true)}
          onAddBankAccountClick={handleAddBankAccountClick}
          hasBankAccounts={accounts.length > 0}
        />
      </section>

      {/* 2. Bank Accounts Management */}
      <section
        id="connected-bank-accounts-section"
        aria-labelledby="bank-accounts-heading"
        className="rounded-2xl border border-[var(--lead)] bg-[var(--card-bg)] p-5 sm:p-6 shadow-sm"
      >
        <BankAccountsManager
          accounts={accounts}
          onAddAccount={onAddAccount}
          onDeleteAccount={onDeleteAccount}
          isLoading={isLoading}
        />
      </section>

      {/* 3. Transaction Ledger Table */}
      <section
        aria-labelledby="wallet-ledger-heading"
        className="rounded-2xl border border-[var(--lead)] bg-[var(--card-bg)] p-5 sm:p-6 shadow-sm"
      >
        <WalletLedgerTable
          transactions={transactions}
          payoutRequests={payoutRequests}
          isLoading={isLoading}
        />
      </section>

      {/* 4. Payout Request Modal */}
      <PayoutRequestModal
        isOpen={isPayoutModalOpen}
        onClose={() => setIsPayoutModalOpen(false)}
        availableBalanceNaira={summary.availableBalanceNaira}
        bankAccounts={accounts}
        onSubmitPayout={async (payload) => {
          await onSubmitPayout(payload);
          setIsPayoutModalOpen(false);
        }}
      />
    </div>
  );
}

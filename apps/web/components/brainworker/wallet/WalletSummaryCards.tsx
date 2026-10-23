// apps/web/components/brainworker/wallet/WalletSummaryCards.tsx
// BrainWorker Wallet Summary Cards Component (BW-006, Item 2.6)
// Phase 3 GREEN: Metric cards with dual-theme Trades Design System

'use client';

import React from 'react';
import type { WalletSummaryCardsProps } from './types';

export function WalletSummaryCards({
  summary,
  onRequestPayoutClick,
  onAddBankAccountClick,
  hasBankAccounts,
}: WalletSummaryCardsProps): React.JSX.Element {
  const canRequestPayout = hasBankAccounts && summary.availableBalanceNaira >= 1000;

  return (
    <div data-testid="wallet-summary-cards" className="space-y-4">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Available Balance */}
        <div
          data-testid="card-available-balance"
          className="rounded-xl border border-[var(--lead)] bg-[var(--bg)] p-5 shadow-sm transition-all hover:border-[var(--rule)]"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
              Available Balance
            </span>
            <span className="inline-flex h-2 w-2 rounded-full bg-[var(--brand-green)]" />
          </div>
          <div className="mt-2 font-mono text-2xl font-semibold tracking-tight text-[var(--brand-green)]">
            ₦{summary.availableBalanceNaira.toLocaleString('en-US')}
          </div>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            Available for immediate bank withdrawal
          </p>
        </div>

        {/* Pending Escrow */}
        <div
          data-testid="card-pending-escrow"
          className="rounded-xl border border-[var(--lead)] bg-[var(--bg)] p-5 shadow-sm transition-all hover:border-[var(--rule)]"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
              Pending Escrow
            </span>
            <span className="inline-flex h-2 w-2 rounded-full bg-[var(--amber)]" />
          </div>
          <div className="mt-2 font-mono text-2xl font-semibold tracking-tight text-[var(--amber)]">
            ₦{summary.pendingEscrowNaira.toLocaleString('en-US')}
          </div>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            Held in escrow for ongoing bookings
          </p>
        </div>

        {/* Lifetime Earnings */}
        <div
          data-testid="card-lifetime-earnings"
          className="rounded-xl border border-[var(--lead)] bg-[var(--bg)] p-5 shadow-sm transition-all hover:border-[var(--rule)]"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
              Lifetime Earnings
            </span>
            <span className="inline-flex h-2 w-2 rounded-full bg-[var(--text-muted)]" />
          </div>
          <div className="mt-2 font-mono text-2xl font-semibold tracking-tight text-[var(--text-main)]">
            ₦{summary.lifetimeEarningsNaira.toLocaleString('en-US')}
          </div>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            Total completed service gross value
          </p>
        </div>

        {/* Total Withdrawn */}
        <div
          data-testid="card-total-withdrawn"
          className="rounded-xl border border-[var(--lead)] bg-[var(--bg)] p-5 shadow-sm transition-all hover:border-[var(--rule)]"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
              Total Withdrawn
            </span>
            <span className="inline-flex h-2 w-2 rounded-full bg-[var(--rule)]" />
          </div>
          <div className="mt-2 font-mono text-2xl font-semibold tracking-tight text-[var(--text-main)]">
            ₦{summary.totalWithdrawnNaira.toLocaleString('en-US')}
          </div>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            Successfully paid out to bank accounts
          </p>
        </div>
      </div>

      {/* Action Bar & Guidance */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-xl border border-[var(--lead)] bg-[var(--bg)] p-4">
        <div>
          {/* Guidance Element */}
          <div
            data-testid="payout-guidance"
            className="text-xs text-[var(--text-muted)]"
          >
            {!hasBankAccounts ? (
              <span className="text-[var(--amber)]">
                Please connect a verified Nigerian bank account to enable payout withdrawals.
              </span>
            ) : summary.availableBalanceNaira < 1000 ? (
              <span className="text-[var(--text-muted)]">
                Minimum withdrawal threshold is ₦1,000. Your current available balance is <span className="font-mono font-semibold">₦{summary.availableBalanceNaira.toLocaleString('en-US')}</span>.
              </span>
            ) : (
              <span className="text-[var(--brand-green)]">
                Your available balance of <span className="font-mono font-semibold">₦{summary.availableBalanceNaira.toLocaleString('en-US')}</span> is ready for withdrawal. Zero transfer fees.
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            data-testid="summary-add-bank-account-button"
            onClick={onAddBankAccountClick}
            className="inline-flex items-center justify-center rounded-lg border border-[var(--lead)] bg-[var(--tag-bg)] px-3.5 py-2 text-xs font-medium text-[var(--text-main)] transition-colors hover:bg-[var(--card-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--rule)]"
          >
            Add Bank Account
          </button>
          <button
            type="button"
            data-testid="request-payout-button"
            disabled={!canRequestPayout}
            onClick={onRequestPayoutClick}
            className="inline-flex items-center justify-center rounded-lg bg-[var(--amber)] px-4 py-2 text-xs font-bold text-[#001A41] transition-colors hover:bg-[var(--amber-hover)] disabled:cursor-not-allowed disabled:bg-[var(--tag-bg)] disabled:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--amber-dim)]"
          >
            Request Payout
          </button>
        </div>
      </div>
    </div>
  );
}

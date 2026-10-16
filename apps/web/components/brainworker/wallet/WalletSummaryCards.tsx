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
          className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm transition-all hover:border-slate-700"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
              Available Balance
            </span>
            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-emerald-400">
            ₦{summary.availableBalanceNaira.toLocaleString('en-US')}
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Available for immediate bank withdrawal
          </p>
        </div>

        {/* Pending Escrow */}
        <div
          data-testid="card-pending-escrow"
          className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm transition-all hover:border-slate-700"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
              Pending Escrow
            </span>
            <span className="inline-flex h-2 w-2 rounded-full bg-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-amber-400">
            ₦{summary.pendingEscrowNaira.toLocaleString('en-US')}
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Held in escrow for ongoing bookings
          </p>
        </div>

        {/* Lifetime Earnings */}
        <div
          data-testid="card-lifetime-earnings"
          className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm transition-all hover:border-slate-700"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
              Lifetime Earnings
            </span>
            <span className="inline-flex h-2 w-2 rounded-full bg-blue-500" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-slate-100">
            ₦{summary.lifetimeEarningsNaira.toLocaleString('en-US')}
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Total completed service gross value
          </p>
        </div>

        {/* Total Withdrawn */}
        <div
          data-testid="card-total-withdrawn"
          className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm transition-all hover:border-slate-700"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
              Total Withdrawn
            </span>
            <span className="inline-flex h-2 w-2 rounded-full bg-slate-500" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-slate-100">
            ₦{summary.totalWithdrawnNaira.toLocaleString('en-US')}
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Successfully paid out to bank accounts
          </p>
        </div>
      </div>

      {/* Action Bar & Guidance */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/40 p-4">
        <div>
          {/* Guidance Element */}
          <div
            data-testid="payout-guidance"
            className="text-xs text-slate-300"
          >
            {!hasBankAccounts ? (
              <span className="text-amber-400">
                Please connect a verified Nigerian bank account to enable payout withdrawals.
              </span>
            ) : summary.availableBalanceNaira < 1000 ? (
              <span className="text-slate-400">
                Minimum withdrawal threshold is ₦1,000. Your current available balance is ₦{summary.availableBalanceNaira.toLocaleString('en-US')}.
              </span>
            ) : (
              <span className="text-emerald-400">
                Your available balance of ₦{summary.availableBalanceNaira.toLocaleString('en-US')} is ready for withdrawal. Zero transfer fees.
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            data-testid="summary-add-bank-account-button"
            onClick={onAddBankAccountClick}
            className="inline-flex items-center justify-center rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-medium text-slate-200 transition-colors hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500"
          >
            Add Bank Account
          </button>
          <button
            type="button"
            data-testid="request-payout-button"
            disabled={!canRequestPayout}
            onClick={onRequestPayoutClick}
            className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            Request Payout
          </button>
        </div>
      </div>
    </div>
  );
}

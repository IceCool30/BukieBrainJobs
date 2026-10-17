// apps/web/components/brainworker/wallet/WalletLedgerTable.tsx
// BrainWorker Wallet Ledger Table Component (BW-006, Item 2.6)
// Phase 3 GREEN: Transaction history table with type filtering and amount indicators

'use client';

import React, { useState } from 'react';
import type { WalletTransaction } from '../../../lib/brainworker/wallet/types';
import type { WalletLedgerTableProps } from './types';

type FilterType = 'all' | 'credits' | 'withdrawals';

export function WalletLedgerTable({
  transactions,
  payoutRequests = [],
  isLoading = false,
}: WalletLedgerTableProps): React.JSX.Element {
  const [filter, setFilter] = useState<FilterType>('all');

  const filteredTransactions = transactions.filter((tx) => {
    if (filter === 'credits') {
      return tx.type === 'escrow_credit';
    }
    if (filter === 'withdrawals') {
      return tx.type === 'payout_withdrawal';
    }
    return true;
  });

  return (
    <div data-testid="wallet-ledger-table" className="space-y-4">
      {/* Table Header & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-[var(--text-main)]">
            Earnings & Payout Ledger
          </h2>
          <p className="text-xs text-[var(--text-muted)]">
            Audit history of cleared escrow job earnings and bank payout withdrawals
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 rounded-lg border border-[var(--lead)] bg-[var(--bg)] p-1">
          <button
            type="button"
            data-testid="filter-all-button"
            onClick={() => setFilter('all')}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
              filter === 'all'
                ? 'bg-[var(--text-main)] text-[var(--bg)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            All Transactions
          </button>
          <button
            type="button"
            data-testid="filter-credits-button"
            onClick={() => setFilter('credits')}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
              filter === 'credits'
                ? 'bg-[var(--text-main)] text-[var(--bg)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            Escrow Credits
          </button>
          <button
            type="button"
            data-testid="filter-withdrawals-button"
            onClick={() => setFilter('withdrawals')}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
              filter === 'withdrawals'
                ? 'bg-[var(--text-main)] text-[var(--bg)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            Withdrawals
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="overflow-hidden rounded-xl border border-[var(--lead)] bg-[var(--bg)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--lead)] bg-[var(--bg)] text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Description & Reference</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--lead)] text-xs text-[var(--text-muted)]">
              {filteredTransactions.map((tx: WalletTransaction) => {
                const isCredit = tx.type === 'escrow_credit';
                const isWithdrawal = tx.type === 'payout_withdrawal';
                const formattedDate = new Date(tx.createdAt).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                });

                return (
                  <tr
                    key={tx.id}
                    data-testid={`transaction-row-${tx.id}`}
                    className="hover:bg-[var(--card-hover)] transition-colors"
                  >
                    {/* Date */}
                    <td className="px-4 py-3 font-mono text-[var(--text-muted)] whitespace-nowrap">
                      {formattedDate}
                    </td>

                    {/* Type Badge */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      {isCredit && (
                        <span className="inline-flex items-center rounded-full bg-[var(--brand-green-dim)] px-2.5 py-0.5 text-[11px] font-medium text-[var(--brand-green)] border border-[var(--brand-green-border)]">
                          Escrow Credit / Job Payment
                        </span>
                      )}
                      {isWithdrawal && (
                        <span className="inline-flex items-center rounded-full bg-[var(--amber-dim)] px-2.5 py-0.5 text-[11px] font-medium text-[var(--amber)] border border-[var(--amber)]/30">
                          Payout Withdrawal
                        </span>
                      )}
                      {!isCredit && !isWithdrawal && (
                        <span className="inline-flex items-center rounded-full bg-[var(--tag-bg)] px-2.5 py-0.5 text-[11px] font-medium text-[var(--text-muted)]">
                          {tx.type}
                        </span>
                      )}
                    </td>

                    {/* Description */}
                    <td className="px-4 py-3">
                      <div className="font-medium text-[var(--text-main)]">
                        {tx.description}
                      </div>
                      {tx.bookingReference && (
                        <div className="text-[11px] font-mono text-[var(--text-muted)] mt-0.5">
                          Ref: {tx.bookingReference}
                        </div>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)] capitalize">
                        <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand-green)]" />
                        {tx.status}
                      </span>
                    </td>

                    {/* Amount */}
                    <td className="px-4 py-3 text-right font-mono font-semibold whitespace-nowrap">
                      {isCredit && (
                        <span className="font-mono text-[var(--brand-green)]">
                          +₦{tx.amountNaira.toLocaleString('en-US')}
                        </span>
                      )}
                      {isWithdrawal && (
                        <span className="font-mono text-[var(--amber)]">
                          -₦{tx.amountNaira.toLocaleString('en-US')}
                        </span>
                      )}
                      {!isCredit && !isWithdrawal && (
                        <span className="font-mono text-[var(--text-main)]">
                          ₦{tx.amountNaira.toLocaleString('en-US')}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}

              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-xs text-[var(--text-muted)]">
                    {isLoading
                      ? 'Loading transaction ledger...'
                      : 'No ledger transactions found matching the selected filter.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

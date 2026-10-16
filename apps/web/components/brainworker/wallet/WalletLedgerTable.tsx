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
          <h2 className="text-base font-semibold text-slate-100">
            Earnings & Payout Ledger
          </h2>
          <p className="text-xs text-slate-400">
            Audit history of cleared escrow job earnings and bank payout withdrawals
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/60 p-1">
          <button
            type="button"
            data-testid="filter-all-button"
            onClick={() => setFilter('all')}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
              filter === 'all'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
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
                ? 'bg-emerald-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
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
                ? 'bg-emerald-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Withdrawals
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/40">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Description & Reference</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs text-slate-300">
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
                    className="hover:bg-slate-800/30 transition-colors"
                  >
                    {/* Date */}
                    <td className="px-4 py-3 font-mono text-slate-400 whitespace-nowrap">
                      {formattedDate}
                    </td>

                    {/* Type Badge */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      {isCredit && (
                        <span className="inline-flex items-center rounded-full bg-emerald-950 px-2.5 py-0.5 text-[11px] font-medium text-emerald-400 border border-emerald-800/40">
                          Escrow Credit / Job Payment
                        </span>
                      )}
                      {isWithdrawal && (
                        <span className="inline-flex items-center rounded-full bg-amber-950 px-2.5 py-0.5 text-[11px] font-medium text-amber-400 border border-amber-800/40">
                          Payout Withdrawal
                        </span>
                      )}
                      {!isCredit && !isWithdrawal && (
                        <span className="inline-flex items-center rounded-full bg-slate-800 px-2.5 py-0.5 text-[11px] font-medium text-slate-300">
                          {tx.type}
                        </span>
                      )}
                    </td>

                    {/* Description */}
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-200">
                        {tx.description}
                      </div>
                      {tx.bookingReference && (
                        <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                          Ref: {tx.bookingReference}
                        </div>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 text-xs text-slate-300 capitalize">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        {tx.status}
                      </span>
                    </td>

                    {/* Amount */}
                    <td className="px-4 py-3 text-right font-mono font-semibold whitespace-nowrap">
                      {isCredit && (
                        <span className="text-emerald-400">
                          +₦{tx.amountNaira.toLocaleString('en-US')}
                        </span>
                      )}
                      {isWithdrawal && (
                        <span className="text-amber-400">
                          -₦{tx.amountNaira.toLocaleString('en-US')}
                        </span>
                      )}
                      {!isCredit && !isWithdrawal && (
                        <span className="text-slate-200">
                          ₦{tx.amountNaira.toLocaleString('en-US')}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}

              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-xs text-slate-400">
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

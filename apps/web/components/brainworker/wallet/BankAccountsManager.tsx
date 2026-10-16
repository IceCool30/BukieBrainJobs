// apps/web/components/brainworker/wallet/BankAccountsManager.tsx
// BrainWorker Bank Accounts Manager Component (BW-006, Item 2.6)
// Phase 3 GREEN: Bank account registration and deletion management

'use client';

import React, { useState } from 'react';
import { CANONICAL_NIGERIAN_BANKS } from '../../../lib/brainworker/wallet/types';
import type { BankAccountsManagerProps } from './types';

export function BankAccountsManager({
  accounts,
  onAddAccount,
  onDeleteAccount,
  isLoading = false,
}: BankAccountsManagerProps): React.JSX.Element {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [bankCode, setBankCode] = useState(CANONICAL_NIGERIAN_BANKS[0]?.code ?? '058');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingAccountId, setDeletingAccountId] = useState<string | null>(null);

  const isNubanLengthValid = accountNumber.trim().length === 10;
  const isNubanNumeric = /^\d+$/.test(accountNumber.trim());
  const isNubanValid = isNubanLengthValid && isNubanNumeric;
  const showNubanError = accountNumber.trim().length > 0 && !isNubanValid;

  const canSave = isNubanValid && Boolean(bankCode) && !isSubmitting && !isLoading;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSave) return;

    try {
      setIsSubmitting(true);
      await onAddAccount({
        bankCode,
        accountNumber: accountNumber.trim(),
        accountName: accountName.trim() || undefined,
      });
      setAccountNumber('');
      setAccountName('');
      setIsFormOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async (id: string) => {
    try {
      setIsSubmitting(true);
      await onDeleteAccount(id);
      setDeletingAccountId(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div data-testid="bank-accounts-manager" className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-100">
            Connected Bank Accounts
          </h2>
          <p className="text-xs text-slate-400">
            Verified Nigerian commercial banks and licensed fintechs for instant withdrawals
          </p>
        </div>
        {!isFormOpen && (
          <button
            type="button"
            data-testid="add-bank-account-button"
            onClick={() => setIsFormOpen(true)}
            className="inline-flex items-center rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 border border-slate-700 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500"
          >
            + Add Bank Account
          </button>
        )}
      </div>

      {/* Add Bank Account Inline Form */}
      {isFormOpen && (
        <form
          onSubmit={handleSave}
          className="rounded-xl border border-slate-700 bg-slate-800/60 p-4 space-y-4"
        >
          <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
            <h3 className="text-sm font-medium text-slate-200">
              Link Nigerian Bank Account
            </h3>
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="text-xs text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Bank Selector */}
            <div>
              <label
                htmlFor="bank-select"
                className="block text-xs font-medium text-slate-300 mb-1"
              >
                Select Bank
              </label>
              <select
                id="bank-select"
                data-testid="bank-select"
                value={bankCode}
                onChange={(e) => setBankCode(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                {CANONICAL_NIGERIAN_BANKS.map((bank) => (
                  <option key={bank.code} value={bank.code}>
                    {bank.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Account Number (NUBAN) */}
            <div>
              <label
                htmlFor="account-number-input"
                className="block text-xs font-medium text-slate-300 mb-1"
              >
                NUBAN Account Number
              </label>
              <input
                id="account-number-input"
                type="text"
                data-testid="account-number-input"
                maxLength={10}
                placeholder="10-digit account number"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              {showNubanError && (
                <p
                  data-testid="nuban-error"
                  className="mt-1 text-xs text-rose-400"
                >
                  NUBAN account number must be exactly 10 numeric digits.
                </p>
              )}
            </div>

            {/* Account Holder Name */}
            <div>
              <label
                htmlFor="account-name-input"
                className="block text-xs font-medium text-slate-300 mb-1"
              >
                Account Holder Name
              </label>
              <input
                id="account-name-input"
                type="text"
                data-testid="account-name-input"
                placeholder="Full name as registered"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              data-testid="save-bank-account-button"
              disabled={!canSave}
              className="rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-500"
            >
              {isSubmitting ? 'Verifying...' : 'Save Account'}
            </button>
          </div>
        </form>
      )}

      {/* Account Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {accounts.map((acc) => {
          const maskedNumber = `******${acc.accountNumber.slice(-4)}`;
          const isConfirmingDelete = deletingAccountId === acc.id;

          return (
            <div
              key={acc.id}
              data-testid={`bank-account-item-${acc.id}`}
              className="relative rounded-xl border border-slate-800 bg-slate-900/40 p-4 transition-all hover:border-slate-700"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-slate-100">
                      {acc.bankName}
                    </h4>
                    <span
                      data-testid={`bank-verified-badge-${acc.id}`}
                      className="inline-flex items-center rounded-full bg-emerald-950 px-2 py-0.5 text-[10px] font-medium text-emerald-400 border border-emerald-800/50"
                    >
                      Verified
                    </span>
                  </div>
                  <div className="mt-1 font-mono text-xs text-slate-300">
                    {maskedNumber}
                  </div>
                  <div className="mt-0.5 text-xs font-medium text-slate-400">
                    {acc.accountName}
                  </div>
                </div>

                {!isConfirmingDelete ? (
                  <button
                    type="button"
                    data-testid={`delete-bank-account-${acc.id}`}
                    onClick={() => setDeletingAccountId(acc.id)}
                    className="text-xs text-slate-500 hover:text-rose-400 transition-colors p-1"
                    title="Remove account"
                  >
                    Delete
                  </button>
                ) : (
                  <div className="flex flex-col items-end gap-1.5">
                    <span className="text-[11px] text-amber-400 font-medium">
                      Remove account?
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setDeletingAccountId(null)}
                        className="rounded px-2 py-0.5 text-[11px] text-slate-400 hover:bg-slate-800"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        data-testid="confirm-delete-account-button"
                        onClick={() => handleConfirmDelete(acc.id)}
                        className="rounded bg-rose-600 px-2 py-0.5 text-[11px] font-medium text-white hover:bg-rose-500"
                      >
                        Confirm
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {accounts.length === 0 && !isFormOpen && (
          <div className="col-span-full rounded-xl border border-dashed border-slate-800 p-8 text-center">
            <p className="text-xs text-slate-400">
              No bank accounts connected yet. Link your Nigerian bank account to receive withdrawals.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

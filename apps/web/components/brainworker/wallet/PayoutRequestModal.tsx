// apps/web/components/brainworker/wallet/PayoutRequestModal.tsx
// BrainWorker Payout Request Modal Component (BW-006, Item 2.6)
// Phase 3 GREEN: Payout withdrawal request modal with balance validation and zero fee preview

'use client';

import React, { useState } from 'react';
import type { PayoutRequestModalProps } from './types';

export function PayoutRequestModal({
  isOpen,
  onClose,
  availableBalanceNaira,
  bankAccounts,
  onSubmitPayout,
  isSubmitting = false,
}: PayoutRequestModalProps): React.JSX.Element | null {
  const [selectedAccountId, setSelectedAccountId] = useState(
    bankAccounts[0]?.id ?? ''
  );
  const [amountStr, setAmountStr] = useState('');
  const [notes, setNotes] = useState('');

  if (!isOpen) {
    return null;
  }

  const numericAmount = Number(amountStr);
  const hasInput = amountStr.trim().length > 0;
  const isBelowMinimum = hasInput && (isNaN(numericAmount) || numericAmount < 1000);
  const isExceedingBalance = hasInput && numericAmount > availableBalanceNaira;
  const isAmountValid = hasInput && !isBelowMinimum && !isExceedingBalance;

  const canSubmit =
    Boolean(selectedAccountId) && isAmountValid && !isSubmitting;

  let errorMessage: string | null = null;
  if (isBelowMinimum) {
    errorMessage = 'Minimum payout withdrawal threshold is ₦1,000.';
  } else if (isExceedingBalance) {
    errorMessage = 'Requested amount exceeds available balance.';
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    await onSubmitPayout({
      bankAccountId: selectedAccountId,
      amountNaira: numericAmount,
      notes: notes.trim() || undefined,
    });
  };

  const netPayout = isAmountValid ? numericAmount : 0;

  return (
    <div
      data-testid="payout-request-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--bg)] backdrop-blur-sm p-4"
    >
      <div className="relative w-full max-w-md rounded-2xl border border-[var(--lead)] bg-[var(--card-bg)] p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--lead)] pb-3">
          <div>
            <h3 className="text-base font-semibold text-[var(--text-main)]">
              Request Payout
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              Transfer cleared earnings to your verified Nigerian bank account
            </p>
          </div>
          <button
            type="button"
            data-testid="close-payout-modal-button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-[var(--card-hover)] hover:text-[var(--text-main)]"
          >
            ✕
          </button>
        </div>

        {/* Available Balance Callout */}
        <div className="rounded-xl border border-[var(--lead)] bg-[var(--bg)] p-4">
          <div className="text-xs text-[var(--text-muted)]">Available Balance</div>
          <div
            data-testid="modal-available-balance"
            className="mt-1 font-mono text-2xl font-semibold text-[var(--brand-green)]"
          >
            ₦{availableBalanceNaira.toLocaleString('en-US')}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Destination Bank Selector */}
          <div>
            <label
              htmlFor="destination-bank-select"
              className="block text-xs font-medium text-[var(--text-muted)] mb-1"
            >
              Destination Bank Account
            </label>
            <select
              id="destination-bank-select"
              data-testid="destination-bank-select"
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              className="w-full rounded-lg border border-[var(--lead)] bg-[var(--tag-bg)] px-3 py-2 text-xs text-[var(--text-main)] focus:border-[var(--amber)] focus:outline-none focus:ring-1 focus:ring-[var(--amber-dim)]"
            >
              {bankAccounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.bankName} - ******{acc.accountNumber.slice(-4)} ({acc.accountName})
                </option>
              ))}
            </select>
          </div>

          {/* Amount Input */}
          <div>
            <label
              htmlFor="payout-amount-input"
              className="block text-xs font-medium text-[var(--text-muted)] mb-1"
            >
              Withdrawal Amount (₦)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-xs text-[var(--text-muted)]">
                ₦
              </span>
              <input
                id="payout-amount-input"
                type="number"
                data-testid="payout-amount-input"
                min={1000}
                max={availableBalanceNaira}
                placeholder="Enter amount (min ₦1,000)"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                className="w-full rounded-lg border border-[var(--lead)] bg-[var(--tag-bg)] pl-7 pr-3 py-2 text-xs text-[var(--text-main)] placeholder-[var(--text-muted)] focus:border-[var(--amber)] focus:outline-none focus:ring-1 focus:ring-[var(--amber-dim)]"
              />
            </div>
            {errorMessage && (
              <p
                data-testid="payout-amount-error"
                className="mt-1.5 text-xs text-[var(--danger)]"
              >
                {errorMessage}
              </p>
            )}
          </div>

          {/* Transfer Fee & Net Payout Preview */}
          <div className="rounded-xl border border-[var(--lead)] bg-[var(--bg)] p-3 space-y-2">
            <div
              data-testid="payout-fee-notice"
              className="flex items-center justify-between text-xs text-[var(--text-muted)]"
            >
              <span>Platform Transfer Fee</span>
              <span className="font-semibold text-[var(--brand-green)]">
                ₦0 (Free)
              </span>
            </div>
            <div className="flex items-center justify-between text-xs border-t border-[var(--lead)] pt-2 font-medium">
              <span className="text-[var(--text-muted)]">Net Estimated Payout</span>
              <span
                data-testid="net-payout-preview"
                className="font-mono text-sm font-semibold text-[var(--text-main)]"
              >
                ₦{netPayout.toLocaleString('en-US')}
              </span>
            </div>
          </div>

          {/* Notes (Optional) */}
          <div>
            <label
              htmlFor="payout-notes-input"
              className="block text-xs font-medium text-[var(--text-muted)] mb-1"
            >
              Withdrawal Reference Notes (Optional)
            </label>
            <input
              id="payout-notes-input"
              type="text"
              placeholder="e.g. Weekly earnings payout"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-lg border border-[var(--lead)] bg-[var(--tag-bg)] px-3 py-2 text-xs text-[var(--text-main)] placeholder-[var(--text-muted)] focus:border-[var(--amber)] focus:outline-none focus:ring-1 focus:ring-[var(--amber-dim)]"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--lead)]">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-[var(--lead)] px-4 py-2 text-xs font-semibold text-[var(--text-muted)] hover:bg-[var(--card-hover)] transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              data-testid="submit-payout-button"
              disabled={!canSubmit}
              className="outlier-pill-button rounded-full bg-[var(--amber)] px-5 py-2 text-xs font-bold text-[#001A41] hover:bg-[var(--amber-hover)] disabled:cursor-not-allowed disabled:bg-[var(--tag-bg)] disabled:text-[var(--text-muted)] shadow-sm transition-all"
            >
              {isSubmitting ? 'Processing...' : 'Submit Withdrawal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

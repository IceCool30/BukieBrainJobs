// apps/web/components/brainworker/wallet/WalletUI.test.tsx
// Phase 3 RED: BrainWorker Wallet & Payouts UI Component Contracts (COMP-001 to COMP-012)
// Item 2.6 in master checklist (BW-006)

import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { WalletSummaryCards } from './WalletSummaryCards';
import { BankAccountsManager } from './BankAccountsManager';
import { PayoutRequestModal } from './PayoutRequestModal';
import { WalletLedgerTable } from './WalletLedgerTable';
import { WalletManagementWorkspace } from './WalletManagementWorkspace';
import type {
  BankAccountDetails,
  BrainWorkerWalletSummary,
  PayoutRequest,
  WalletTransaction,
} from '../../../lib/brainworker/wallet/types';

describe('BrainWorker Wallet & Payouts UI Component Contracts (COMP-001 to COMP-012)', () => {
  const sampleSummary: BrainWorkerWalletSummary = {
    brainWorkerId: 'worker-101',
    availableBalanceNaira: 125000,
    pendingEscrowNaira: 45000,
    lifetimeEarningsNaira: 320000,
    totalWithdrawnNaira: 150000,
    currency: 'NGN',
    updatedAt: '2026-10-15T12:00:00.000Z',
  };

  const sampleBankAccounts: BankAccountDetails[] = [
    {
      id: 'bank-acc-1',
      brainWorkerId: 'worker-101',
      bankCode: '058',
      bankName: 'GTBank',
      accountNumber: '0123456789',
      accountName: 'TUNDE ADEYEMI',
      isVerified: true,
      createdAt: '2026-10-10T10:00:00.000Z',
    },
    {
      id: 'bank-acc-2',
      brainWorkerId: 'worker-101',
      bankCode: '044',
      bankName: 'Access Bank',
      accountNumber: '9876543210',
      accountName: 'TUNDE ADEYEMI',
      isVerified: true,
      createdAt: '2026-10-12T10:00:00.000Z',
    },
  ];

  const sampleTransactions: WalletTransaction[] = [
    {
      id: 'tx-1',
      brainWorkerId: 'worker-101',
      bookingId: 'bk-101',
      bookingReference: 'BK-LAG-101',
      type: 'escrow_credit',
      amountNaira: 45000,
      grossAmountNaira: 50000,
      platformFeeNaira: 5000,
      status: 'cleared',
      description: 'Payment for solar inverter installation',
      createdAt: '2026-10-15T10:00:00.000Z',
    },
    {
      id: 'tx-2',
      brainWorkerId: 'worker-101',
      type: 'payout_withdrawal',
      amountNaira: 20000,
      grossAmountNaira: 20000,
      platformFeeNaira: 0,
      status: 'cleared',
      description: 'Payout withdrawal to GTBank',
      createdAt: '2026-10-14T09:00:00.000Z',
    },
  ];

  const samplePayoutRequests: PayoutRequest[] = [
    {
      id: 'payout-1',
      brainWorkerId: 'worker-101',
      bankAccountId: 'bank-acc-1',
      amountNaira: 20000,
      feeNaira: 0,
      netAmountNaira: 20000,
      destinationBank: {
        bankName: 'GTBank',
        bankCode: '058',
        maskedAccountNumber: '******6789',
        accountName: 'TUNDE ADEYEMI',
      },
      status: 'submitted',
      requestedAt: '2026-10-14T09:00:00.000Z',
    },
  ];

  // ===========================================================================
  // COMP-001: Summary Metrics Display
  // ===========================================================================
  it('COMP-001: WalletSummaryCards renders Available Balance, Pending Escrow, Lifetime Earnings, and Total Withdrawn with formatted Naira currency', () => {
    render(
      <WalletSummaryCards
        summary={sampleSummary}
        onRequestPayoutClick={vi.fn()}
        onAddBankAccountClick={vi.fn()}
        hasBankAccounts={true}
      />
    );

    expect(screen.getByTestId('card-available-balance')).toHaveTextContent(/125,000/);
    expect(screen.getByTestId('card-pending-escrow')).toHaveTextContent(/45,000/);
    expect(screen.getByTestId('card-lifetime-earnings')).toHaveTextContent(/320,000/);
    expect(screen.getByTestId('card-total-withdrawn')).toHaveTextContent(/150,000/);
    expect(screen.getByTestId('request-payout-button')).toBeEnabled();
  });

  // ===========================================================================
  // COMP-002: Payout Button Gating & Guidance
  // ===========================================================================
  it('COMP-002: WalletSummaryCards disables Request Payout button and displays guidance when available balance is below 1,000 NGN or when no bank account is connected', () => {
    const { rerender } = render(
      <WalletSummaryCards
        summary={sampleSummary}
        onRequestPayoutClick={vi.fn()}
        onAddBankAccountClick={vi.fn()}
        hasBankAccounts={false}
      />
    );

    expect(screen.getByTestId('request-payout-button')).toBeDisabled();
    expect(screen.getByTestId('payout-guidance')).toHaveTextContent(/bank account/i);

    rerender(
      <WalletSummaryCards
        summary={{
          ...sampleSummary,
          availableBalanceNaira: 500,
        }}
        onRequestPayoutClick={vi.fn()}
        onAddBankAccountClick={vi.fn()}
        hasBankAccounts={true}
      />
    );

    expect(screen.getByTestId('request-payout-button')).toBeDisabled();
    expect(screen.getByTestId('payout-guidance')).toHaveTextContent(/1,000/);
  });

  // ===========================================================================
  // COMP-003: Bank Account List Rendering
  // ===========================================================================
  it('COMP-003: BankAccountsManager renders list of connected accounts with bank name, masked account number, account holder name, and verified badge', () => {
    render(
      <BankAccountsManager
        accounts={sampleBankAccounts}
        onAddAccount={vi.fn()}
        onDeleteAccount={vi.fn()}
      />
    );

    const firstAccountCard = screen.getByTestId('bank-account-item-bank-acc-1');
    expect(firstAccountCard).toHaveTextContent('GTBank');
    expect(firstAccountCard).toHaveTextContent(/6789/);
    expect(firstAccountCard).toHaveTextContent('TUNDE ADEYEMI');
    expect(screen.getByTestId('bank-verified-badge-bank-acc-1')).toBeInTheDocument();
  });

  // ===========================================================================
  // COMP-004: Add Bank Account Trigger and Form
  // ===========================================================================
  it('COMP-004: BankAccountsManager renders Add Bank Account trigger that opens bank selection and account number inputs', async () => {
    render(
      <BankAccountsManager
        accounts={sampleBankAccounts}
        onAddAccount={vi.fn()}
        onDeleteAccount={vi.fn()}
      />
    );

    const trigger = screen.getByTestId('add-bank-account-button');
    await act(async () => {
      fireEvent.click(trigger);
    });

    expect(screen.getByTestId('bank-select')).toBeInTheDocument();
    expect(screen.getByTestId('account-number-input')).toBeInTheDocument();
    expect(screen.getByTestId('account-name-input')).toBeInTheDocument();
  });

  // ===========================================================================
  // COMP-005: NUBAN Validation Feedback
  // ===========================================================================
  it('COMP-005: BankAccountsManager enforces 10-digit numeric NUBAN validation and displays helpful error feedback', async () => {
    render(
      <BankAccountsManager
        accounts={sampleBankAccounts}
        onAddAccount={vi.fn()}
        onDeleteAccount={vi.fn()}
      />
    );

    await act(async () => {
      fireEvent.click(screen.getByTestId('add-bank-account-button'));
    });

    const accountInput = screen.getByTestId('account-number-input');
    await act(async () => {
      fireEvent.change(accountInput, { target: { value: '12345' } });
    });

    expect(screen.getByTestId('nuban-error')).toHaveTextContent(/10.*digit/i);
    expect(screen.getByTestId('save-bank-account-button')).toBeDisabled();
  });

  // ===========================================================================
  // COMP-006: Account Deletion Confirmation
  // ===========================================================================
  it('COMP-006: BankAccountsManager triggers onDeleteAccount with confirmation when user requests account removal', async () => {
    const onDeleteAccount = vi.fn().mockResolvedValue(undefined);

    render(
      <BankAccountsManager
        accounts={sampleBankAccounts}
        onAddAccount={vi.fn()}
        onDeleteAccount={onDeleteAccount}
      />
    );

    const deleteBtn = screen.getByTestId('delete-bank-account-bank-acc-1');
    await act(async () => {
      fireEvent.click(deleteBtn);
    });

    const confirmBtn = screen.getByTestId('confirm-delete-account-button');
    await act(async () => {
      fireEvent.click(confirmBtn);
    });

    expect(onDeleteAccount).toHaveBeenCalledWith('bank-acc-1');
  });

  // ===========================================================================
  // COMP-007: Payout Modal Form Rendering
  // ===========================================================================
  it('COMP-007: PayoutRequestModal renders available balance, destination bank selector, amount input, zero-fee notice, and calculate net payout preview', () => {
    render(
      <PayoutRequestModal
        isOpen={true}
        onClose={vi.fn()}
        availableBalanceNaira={50000}
        bankAccounts={sampleBankAccounts}
        onSubmitPayout={vi.fn()}
      />
    );

    expect(screen.getByTestId('modal-available-balance')).toHaveTextContent(/50,000/);
    expect(screen.getByTestId('destination-bank-select')).toBeInTheDocument();
    expect(screen.getByTestId('payout-amount-input')).toBeInTheDocument();
    expect(screen.getByTestId('payout-fee-notice')).toBeInTheDocument();
    expect(screen.getByTestId('net-payout-preview')).toBeInTheDocument();
  });

  // ===========================================================================
  // COMP-008: Payout Amount Validation
  // ===========================================================================
  it('COMP-008: PayoutRequestModal prevents submission and displays error when amount is below 1,000 NGN or exceeds available balance', async () => {
    render(
      <PayoutRequestModal
        isOpen={true}
        onClose={vi.fn()}
        availableBalanceNaira={50000}
        bankAccounts={sampleBankAccounts}
        onSubmitPayout={vi.fn()}
      />
    );

    const amountInput = screen.getByTestId('payout-amount-input');

    await act(async () => {
      fireEvent.change(amountInput, { target: { value: '500' } });
    });
    expect(screen.getByTestId('payout-amount-error')).toHaveTextContent(/1,000/);
    expect(screen.getByTestId('submit-payout-button')).toBeDisabled();

    await act(async () => {
      fireEvent.change(amountInput, { target: { value: '80000' } });
    });
    expect(screen.getByTestId('payout-amount-error')).toHaveTextContent(/insufficient|exceed/i);
    expect(screen.getByTestId('submit-payout-button')).toBeDisabled();
  });

  // ===========================================================================
  // COMP-009: Payout Submission Flow
  // ===========================================================================
  it('COMP-009: PayoutRequestModal calls onSubmitPayout with validated payload when form is submitted', async () => {
    const onSubmitPayout = vi.fn().mockResolvedValue(undefined);

    render(
      <PayoutRequestModal
        isOpen={true}
        onClose={vi.fn()}
        availableBalanceNaira={50000}
        bankAccounts={sampleBankAccounts}
        onSubmitPayout={onSubmitPayout}
      />
    );

    const amountInput = screen.getByTestId('payout-amount-input');
    await act(async () => {
      fireEvent.change(amountInput, { target: { value: '25000' } });
    });

    const submitBtn = screen.getByTestId('submit-payout-button');
    await act(async () => {
      fireEvent.click(submitBtn);
    });

    expect(onSubmitPayout).toHaveBeenCalledWith(
      expect.objectContaining({
        bankAccountId: 'bank-acc-1',
        amountNaira: 25000,
      })
    );
  });

  // ===========================================================================
  // COMP-010: Ledger Table Columns & Amounts
  // ===========================================================================
  it('COMP-010: WalletLedgerTable renders transaction entries with date, type badge, description, and positive/negative formatted Naira amount', () => {
    render(
      <WalletLedgerTable
        transactions={sampleTransactions}
        payoutRequests={samplePayoutRequests}
      />
    );

    const creditRow = screen.getByTestId('transaction-row-tx-1');
    expect(creditRow).toHaveTextContent(/escrow credit|job payment/i);
    expect(creditRow).toHaveTextContent(/solar inverter/i);
    expect(creditRow).toHaveTextContent(/\+.*45,000/);

    const payoutRow = screen.getByTestId('transaction-row-tx-2');
    expect(payoutRow).toHaveTextContent(/withdrawal|payout/i);
    expect(payoutRow).toHaveTextContent(/-.*20,000/);
  });

  // ===========================================================================
  // COMP-011: Ledger Filtering
  // ===========================================================================
  it('COMP-011: WalletLedgerTable filters entries by transaction type', async () => {
    render(
      <WalletLedgerTable
        transactions={sampleTransactions}
        payoutRequests={samplePayoutRequests}
      />
    );

    const filterCredits = screen.getByTestId('filter-credits-button');
    await act(async () => {
      fireEvent.click(filterCredits);
    });

    expect(screen.getByTestId('transaction-row-tx-1')).toBeInTheDocument();
    expect(screen.queryByTestId('transaction-row-tx-2')).not.toBeInTheDocument();

    const filterWithdrawals = screen.getByTestId('filter-withdrawals-button');
    await act(async () => {
      fireEvent.click(filterWithdrawals);
    });

    expect(screen.queryByTestId('transaction-row-tx-1')).not.toBeInTheDocument();
    expect(screen.getByTestId('transaction-row-tx-2')).toBeInTheDocument();

    const filterAll = screen.getByTestId('filter-all-button');
    await act(async () => {
      fireEvent.click(filterAll);
    });

    expect(screen.getByTestId('transaction-row-tx-1')).toBeInTheDocument();
    expect(screen.getByTestId('transaction-row-tx-2')).toBeInTheDocument();
  });

  // ===========================================================================
  // COMP-012: Full Workspace Integration & Accessibility
  // ===========================================================================
  it('COMP-012: WalletManagementWorkspace integrates all wallet sections within Trades Design System dual-theme layout and WCAG accessible elements', () => {
    render(
      <WalletManagementWorkspace
        summary={sampleSummary}
        accounts={sampleBankAccounts}
        transactions={sampleTransactions}
        payoutRequests={samplePayoutRequests}
        onAddAccount={vi.fn()}
        onDeleteAccount={vi.fn()}
        onSubmitPayout={vi.fn()}
      />
    );

    expect(screen.getByTestId('wallet-management-workspace')).toBeInTheDocument();
    expect(screen.getByTestId('wallet-summary-cards')).toBeInTheDocument();
    expect(screen.getByTestId('bank-accounts-manager')).toBeInTheDocument();
    expect(screen.getByTestId('wallet-ledger-table')).toBeInTheDocument();
  });
});

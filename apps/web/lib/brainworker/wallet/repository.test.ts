// apps/web/lib/brainworker/wallet/repository.test.ts
// Phase 2 RED: BrainWorker Earnings, Wallet and Payouts Repository Contracts (REP-001 to REP-010)
// Item 2.6 in master checklist (BW-006)

import * as fs from 'fs';
import * as path from 'path';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  BrainWorkerWalletRepository,
  createBrainWorkerWalletRepository,
  resetBrainWorkerWalletRepository,
} from './repository';
import { assertProductionBoundary } from './domain';

describe('BrainWorker Wallet & Payouts Repository Contracts (REP-001 to REP-010)', () => {
  let repo: BrainWorkerWalletRepository;

  beforeEach(() => {
    resetBrainWorkerWalletRepository();
    repo = createBrainWorkerWalletRepository();
  });

  // ===========================================================================
  // REP-001: Initial Wallet Summary
  // ===========================================================================
  it('REP-001: getWalletSummary returns initial zeroed or seeded summary for worker with non-negative balances', async () => {
    const summary = await repo.getWalletSummary('worker-initial');
    expect(summary).toBeDefined();
    expect(summary.brainWorkerId).toBe('worker-initial');
    expect(summary.availableBalanceNaira).toBeGreaterThanOrEqual(0);
    expect(summary.pendingEscrowNaira).toBeGreaterThanOrEqual(0);
    expect(summary.lifetimeEarningsNaira).toBeGreaterThanOrEqual(0);
    expect(summary.totalWithdrawnNaira).toBeGreaterThanOrEqual(0);
    expect(summary.currency).toBe('NGN');
    expect(summary.updatedAt).toBeDefined();
  });

  // ===========================================================================
  // REP-002: Bank Accounts Retrieval Scoped to Worker
  // ===========================================================================
  it('REP-002: getBankAccounts returns saved accounts strictly scoped to authenticated worker', async () => {
    const initialAccounts = await repo.getBankAccounts('worker-empty');
    expect(initialAccounts).toEqual([]);

    await repo.addBankAccount('worker-a', {
      bankCode: '058',
      accountNumber: '0123456789',
      accountName: 'Tunde Adeyemi',
    });

    await repo.addBankAccount('worker-b', {
      bankCode: '044',
      accountNumber: '9876543210',
      accountName: 'Emeka Okafor',
    });

    const accountsA = await repo.getBankAccounts('worker-a');
    const accountsB = await repo.getBankAccounts('worker-b');

    expect(accountsA.length).toBe(1);
    expect(accountsA[0]?.brainWorkerId).toBe('worker-a');
    expect(accountsA[0]?.bankCode).toBe('058');
    expect(accountsA[0]?.accountNumber).toBe('0123456789');

    expect(accountsB.length).toBe(1);
    expect(accountsB[0]?.brainWorkerId).toBe('worker-b');
    expect(accountsB[0]?.bankCode).toBe('044');
  });

  // ===========================================================================
  // REP-003: Bank Account Registration and Validation
  // ===========================================================================
  it('REP-003: addBankAccount validates bank code, 10-digit NUBAN, resolves uppercase account name, saves and returns record', async () => {
    const created = await repo.addBankAccount('worker-c', {
      bankCode: '057',
      accountNumber: '1122334455',
      accountName: 'chioma chukwu',
    });

    expect(created.id).toBeDefined();
    expect(created.brainWorkerId).toBe('worker-c');
    expect(created.bankCode).toBe('057');
    expect(created.bankName).toBe('Zenith Bank');
    expect(created.accountNumber).toBe('1122334455');
    expect(created.accountName).toBe('CHIOMA CHUKWU');
    expect(created.isVerified).toBe(true);
    expect(created.createdAt).toBeDefined();

    // Invalid bank code throws
    await expect(
      repo.addBankAccount('worker-c', {
        bankCode: '999999',
        accountNumber: '1122334455',
        accountName: 'Test Account',
      })
    ).rejects.toThrow(/unrecognized|bank code/i);

    // Invalid NUBAN throws
    await expect(
      repo.addBankAccount('worker-c', {
        bankCode: '057',
        accountNumber: '12345',
        accountName: 'Test Account',
      })
    ).rejects.toThrow(/10.*digits/i);
  });

  // ===========================================================================
  // REP-004: Bank Account Deletion and Authorization
  // ===========================================================================
  it('REP-004: deleteBankAccount removes bank account for worker, throwing if account not found or unowned', async () => {
    const account = await repo.addBankAccount('worker-d', {
      bankCode: '011',
      accountNumber: '2233445566',
      accountName: 'Babajide Sanwo',
    });

    // Cross-tenant deletion attempt throws
    await expect(
      repo.deleteBankAccount('worker-intruder', account.id)
    ).rejects.toThrow(/not authorized|forbidden|not found/i);

    // Deleting non-existent account throws
    await expect(
      repo.deleteBankAccount('worker-d', 'missing-acc-id')
    ).rejects.toThrow(/not found/i);

    // Authorized deletion succeeds
    await repo.deleteBankAccount('worker-d', account.id);
    const remaining = await repo.getBankAccounts('worker-d');
    expect(remaining.find((a) => a.id === account.id)).toBeUndefined();
  });

  // ===========================================================================
  // REP-005: Payout Withdrawal Execution
  // ===========================================================================
  it('REP-005: requestPayout validates 1,000 NGN minimum, checks available balance, deducts funds, increments totalWithdrawn, and creates submitted payout request', async () => {
    const account = await repo.addBankAccount('worker-payout', {
      bankCode: '058',
      accountNumber: '0123456789',
      accountName: 'Tunde Adeyemi',
    });

    await repo.creditEscrowEarnings(
      'worker-payout',
      'booking-101',
      'BK-LAG-101',
      100000,
      'Payment for commercial wiring'
    );

    // Under minimum threshold throws
    await expect(
      repo.requestPayout('worker-payout', {
        amountNaira: 500,
        bankAccountId: account.id,
      })
    ).rejects.toThrow(/minimum.*1,000/i);

    // Exceeding available balance throws
    await expect(
      repo.requestPayout('worker-payout', {
        amountNaira: 500000,
        bankAccountId: account.id,
      })
    ).rejects.toThrow(/insufficient/i);

    // Invalid bank account throws
    await expect(
      repo.requestPayout('worker-payout', {
        amountNaira: 20000,
        bankAccountId: 'non-existent-account',
      })
    ).rejects.toThrow(/not found/i);

    const summaryBefore = await repo.getWalletSummary('worker-payout');
    const initialBalance = summaryBefore.availableBalanceNaira;
    const initialWithdrawn = summaryBefore.totalWithdrawnNaira;

    const payout = await repo.requestPayout('worker-payout', {
      amountNaira: 25000,
      bankAccountId: account.id,
      notes: 'Mid-month withdrawal',
    });

    expect(payout.id).toBeDefined();
    expect(payout.brainWorkerId).toBe('worker-payout');
    expect(payout.bankAccountId).toBe(account.id);
    expect(payout.amountNaira).toBe(25000);
    expect(payout.feeNaira).toBe(0);
    expect(payout.netAmountNaira).toBe(25000);
    expect(payout.status).toBe('submitted');
    expect(payout.destinationBank.bankName).toBe('GTBank');
    expect(payout.destinationBank.bankCode).toBe('058');
    expect(payout.destinationBank.accountName).toBe('TUNDE ADEYEMI');
    expect(payout.destinationBank.maskedAccountNumber).toBeDefined();
    expect(payout.requestedAt).toBeDefined();

    const summaryAfter = await repo.getWalletSummary('worker-payout');
    expect(summaryAfter.availableBalanceNaira).toBe(initialBalance - 25000);
    expect(summaryAfter.totalWithdrawnNaira).toBe(initialWithdrawn + 25000);
  });

  // ===========================================================================
  // REP-006: Payout History Sorting
  // ===========================================================================
  it('REP-006: getPayoutRequests returns reverse-chronological list of payout requests scoped to worker', async () => {
    const account = await repo.addBankAccount('worker-multi-payout', {
      bankCode: '044',
      accountNumber: '0011223344',
      accountName: 'Folake Kuti',
    });

    await repo.creditEscrowEarnings(
      'worker-multi-payout',
      'b-1',
      'REF-1',
      200000,
      'Full house plumbing'
    );

    const payout1 = await repo.requestPayout('worker-multi-payout', {
      amountNaira: 10000,
      bankAccountId: account.id,
    });

    const payout2 = await repo.requestPayout('worker-multi-payout', {
      amountNaira: 15000,
      bankAccountId: account.id,
    });

    const requests = await repo.getPayoutRequests('worker-multi-payout');
    expect(requests.length).toBe(2);
    expect(requests[0]?.id).toBe(payout2.id);
    expect(requests[1]?.id).toBe(payout1.id);

    const otherWorkerRequests = await repo.getPayoutRequests('worker-other');
    expect(otherWorkerRequests).toEqual([]);
  });

  // ===========================================================================
  // REP-007: Transaction Ledger Filtering
  // ===========================================================================
  it('REP-007: getTransactions returns ledger entries scoped to worker, supporting optional type and status filtering', async () => {
    const account = await repo.addBankAccount('worker-ledger', {
      bankCode: '058',
      accountNumber: '0123456789',
      accountName: 'Tunde Adeyemi',
    });

    await repo.creditEscrowEarnings(
      'worker-ledger',
      'b-ledger-1',
      'REF-L1',
      50000,
      'Tile installation job'
    );

    await repo.requestPayout('worker-ledger', {
      amountNaira: 20000,
      bankAccountId: account.id,
    });

    const allTx = await repo.getTransactions('worker-ledger');
    expect(allTx.length).toBeGreaterThanOrEqual(2);

    const creditTx = await repo.getTransactions('worker-ledger', {
      type: 'escrow_credit',
    });
    expect(creditTx.every((tx) => tx.type === 'escrow_credit')).toBe(true);
    expect(creditTx.length).toBeGreaterThanOrEqual(1);

    const payoutTx = await repo.getTransactions('worker-ledger', {
      type: 'payout_withdrawal',
    });
    expect(payoutTx.every((tx) => tx.type === 'payout_withdrawal')).toBe(true);

    const clearedTx = await repo.getTransactions('worker-ledger', {
      status: 'cleared',
    });
    expect(clearedTx.every((tx) => tx.status === 'cleared')).toBe(true);

    const foreignTx = await repo.getTransactions('worker-foreign');
    expect(foreignTx).toEqual([]);
  });

  // ===========================================================================
  // REP-008: Escrow Earnings Credit with Fee Deduction
  // ===========================================================================
  it('REP-008: creditEscrowEarnings calculates 10% fee deduction, credits net amount to availableBalance and lifetimeEarnings, and records escrow_credit transaction', async () => {
    const summaryBefore = await repo.getWalletSummary('worker-credit');
    const balanceBefore = summaryBefore.availableBalanceNaira;
    const lifetimeBefore = summaryBefore.lifetimeEarningsNaira;

    const result = await repo.creditEscrowEarnings(
      'worker-credit',
      'booking-cr-1',
      'BK-CR-001',
      50000,
      'Completed roofing repair'
    );

    expect(result.transaction).toBeDefined();
    expect(result.transaction.brainWorkerId).toBe('worker-credit');
    expect(result.transaction.type).toBe('escrow_credit');
    expect(result.transaction.grossAmountNaira).toBe(50000);
    expect(result.transaction.platformFeeNaira).toBe(5000);
    expect(result.transaction.amountNaira).toBe(45000);
    expect(result.transaction.status).toBe('cleared');
    expect(result.transaction.bookingId).toBe('booking-cr-1');
    expect(result.transaction.bookingReference).toBe('BK-CR-001');

    expect(result.updatedSummary.availableBalanceNaira).toBe(balanceBefore + 45000);
    expect(result.updatedSummary.lifetimeEarningsNaira).toBe(lifetimeBefore + 45000);

    const summaryAfter = await repo.getWalletSummary('worker-credit');
    expect(summaryAfter.availableBalanceNaira).toBe(balanceBefore + 45000);
    expect(summaryAfter.lifetimeEarningsNaira).toBe(lifetimeBefore + 45000);
  });

  // ===========================================================================
  // REP-009: Cross-Tenant Isolation
  // ===========================================================================
  it('REP-009: tenant isolation ensures queries and mutations for worker A cannot read or mutate data of worker B', async () => {
    await repo.creditEscrowEarnings(
      'worker-isolated-a',
      'bk-a',
      'REF-A',
      80000,
      'Artisan project A'
    );

    const accountA = await repo.addBankAccount('worker-isolated-a', {
      bankCode: '058',
      accountNumber: '0123456789',
      accountName: 'Artisan A',
    });

    const summaryA = await repo.getWalletSummary('worker-isolated-a');
    const summaryB = await repo.getWalletSummary('worker-isolated-b');

    expect(summaryA.availableBalanceNaira).toBe(72000);
    expect(summaryB.availableBalanceNaira).toBe(0);

    const bankAccountsB = await repo.getBankAccounts('worker-isolated-b');
    expect(bankAccountsB.find((a) => a.id === accountA.id)).toBeUndefined();

    await expect(
      repo.deleteBankAccount('worker-isolated-b', accountA.id)
    ).rejects.toThrow(/not authorized|forbidden|not found/i);

    await expect(
      repo.requestPayout('worker-isolated-b', {
        amountNaira: 10000,
        bankAccountId: accountA.id,
      })
    ).rejects.toThrow();
  });

  // ===========================================================================
  // REP-010: Physical Boundary Audit
  // ===========================================================================
  it('REP-010: physical boundary audit ensures zero imports from testing/ fixtures in repository.ts', () => {
    const repoPath = path.join(__dirname, 'repository.ts');
    const repoSource = fs.readFileSync(repoPath, 'utf8');

    expect(assertProductionBoundary(repoSource)).toBe(true);
    expect(repoSource).not.toMatch(/from ['"][^'"]*testing[^'"]*['"]/);
  });
});

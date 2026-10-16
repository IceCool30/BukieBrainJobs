// apps/web/lib/brainworker/wallet/types.test.ts
// Phase 1 RED: BrainWorker Earnings, Wallet and Payouts Domain Contracts (WALLET-001 to WALLET-010)
// Item 2.6 in master checklist (BW-006)

import { describe, expect, it } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import {
  assertProductionBoundary,
  calculatePlatformFeeAndNetCredit,
  canTransitionPayoutStatus,
  formatNaira,
  getNigerianBankByCode,
  getNigerianBanks,
  validateBankAccountDetails,
  validateNubanAccountNumber,
  validatePayoutRequestInput,
  validateWalletSummaryInvariants,
  validateWalletTransaction,
} from './domain';
import type {
  BankAccountDetails,
  BrainWorkerWalletSummary,
  RequestPayoutInput,
  WalletTransaction,
} from './types';

describe('BrainWorker Earnings, Wallet and Payouts Domain Contracts (WALLET-001 to WALLET-010)', () => {
  const sampleBankAccount: BankAccountDetails = {
    id: 'bank-acc-001',
    brainWorkerId: 'worker-101',
    bankCode: '058',
    bankName: 'GTBank',
    accountNumber: '0123456789',
    accountName: 'TUNDE ADEYEMI',
    isVerified: true,
    createdAt: '2026-10-15T10:00:00.000Z',
  };

  const sampleWalletSummary: BrainWorkerWalletSummary = {
    brainWorkerId: 'worker-101',
    availableBalanceNaira: 125000,
    pendingEscrowNaira: 45000,
    lifetimeEarningsNaira: 320000,
    totalWithdrawnNaira: 150000,
    currency: 'NGN',
    updatedAt: '2026-10-16T10:00:00.000Z',
  };

  const sampleTransaction: WalletTransaction = {
    id: 'tx-001',
    brainWorkerId: 'worker-101',
    bookingId: 'booking-777',
    bookingReference: 'BK-LAG-777',
    type: 'escrow_credit',
    amountNaira: 45000,
    grossAmountNaira: 50000,
    platformFeeNaira: 5000,
    status: 'cleared',
    description: 'Payout clearance for completed job BK-LAG-777',
    createdAt: '2026-10-16T09:30:00.000Z',
  };

  const samplePayoutInput: RequestPayoutInput = {
    amountNaira: 25000,
    bankAccountId: 'bank-acc-001',
    notes: 'Weekly withdrawal to GTBank',
  };

  // ===========================================================================
  // WALLET-001: Nigerian Bank Directory
  // ===========================================================================
  it('WALLET-001: defines canonical Nigerian financial institutions with code, name, and slug', () => {
    const banks = getNigerianBanks();
    expect(banks.length).toBeGreaterThanOrEqual(11);

    const gtBank = getNigerianBankByCode('058');
    expect(gtBank).toBeDefined();
    expect(gtBank?.name).toBe('GTBank');
    expect(gtBank?.slug).toBe('gtbank');

    const accessBank = getNigerianBankByCode('044');
    expect(accessBank?.code).toBe('044');

    const kudaBank = getNigerianBankByCode('50211');
    expect(kudaBank?.name).toBe('Kuda Bank');

    const opay = getNigerianBankByCode('999992');
    expect(opay?.name).toBe('OPay');

    const palmpay = getNigerianBankByCode('999991');
    expect(palmpay?.name).toBe('PalmPay');
  });

  // ===========================================================================
  // WALLET-002: NUBAN Account Number Validation
  // ===========================================================================
  it('WALLET-002: validates that account numbers must be exactly 10 numeric digits', () => {
    expect(validateNubanAccountNumber('0123456789')).toBe('0123456789');

    expect(() => validateNubanAccountNumber('123456789')).toThrow(/10.*digits/i);
    expect(() => validateNubanAccountNumber('12345678901')).toThrow(/10.*digits/i);
    expect(() => validateNubanAccountNumber('012345678a')).toThrow(/numeric/i);
    expect(() => validateNubanAccountNumber('')).toThrow(/required/i);
    expect(() => validateNubanAccountNumber('   ')).toThrow(/required/i);
  });

  // ===========================================================================
  // WALLET-003: Bank Account Setup Record
  // ===========================================================================
  it('WALLET-003: validates bank account setup record with sanitized digits and resolved uppercase name', () => {
    const valid = validateBankAccountDetails(sampleBankAccount);
    expect(valid.accountNumber).toBe('0123456789');
    expect(valid.accountName).toBe('TUNDE ADEYEMI');
    expect(valid.isVerified).toBe(true);
    expect(valid.bankCode).toBe('058');

    expect(() =>
      validateBankAccountDetails({
        ...sampleBankAccount,
        accountName: '',
      })
    ).toThrow(/account name/i);
  });

  // ===========================================================================
  // WALLET-004: Wallet Summary Metrics Model
  // ===========================================================================
  it('WALLET-004: enforces non-negative integer invariant for wallet summary balances', () => {
    const valid = validateWalletSummaryInvariants(sampleWalletSummary);
    expect(valid.availableBalanceNaira).toBe(125000);
    expect(valid.currency).toBe('NGN');

    expect(() =>
      validateWalletSummaryInvariants({
        ...sampleWalletSummary,
        availableBalanceNaira: -500,
      })
    ).toThrow(/non-negative/i);

    expect(() =>
      validateWalletSummaryInvariants({
        ...sampleWalletSummary,
        pendingEscrowNaira: -1000,
      })
    ).toThrow(/non-negative/i);
  });

  // ===========================================================================
  // WALLET-005: Transaction Ledger Entry Model
  // ===========================================================================
  it('WALLET-005: validates wallet transaction entry with type, amounts, and audit fields', () => {
    const valid = validateWalletTransaction(sampleTransaction);
    expect(valid.id).toBe('tx-001');
    expect(valid.type).toBe('escrow_credit');
    expect(valid.amountNaira).toBe(45000);
    expect(valid.grossAmountNaira).toBe(50000);
    expect(valid.platformFeeNaira).toBe(5000);
    expect(valid.status).toBe('cleared');

    expect(() =>
      validateWalletTransaction({
        ...sampleTransaction,
        amountNaira: -100,
      })
    ).toThrow(/positive/i);
  });

  // ===========================================================================
  // WALLET-006: Platform Service Fee Deduction Invariant
  // ===========================================================================
  it('WALLET-006: enforces gross booking earnings minus platform fee equals net wallet credit', () => {
    const split = calculatePlatformFeeAndNetCredit(50000, 10);
    expect(split.grossAmountNaira).toBe(50000);
    expect(split.platformFeeNaira).toBe(5000);
    expect(split.netAmountNaira).toBe(45000);
    expect(split.grossAmountNaira - split.platformFeeNaira).toBe(split.netAmountNaira);

    const splitDefault = calculatePlatformFeeAndNetCredit(15000);
    expect(splitDefault.platformFeeNaira).toBe(1500);
    expect(splitDefault.netAmountNaira).toBe(13500);

    expect(() => calculatePlatformFeeAndNetCredit(0)).toThrow(/positive/i);
    expect(() => calculatePlatformFeeAndNetCredit(-500)).toThrow(/positive/i);
  });

  // ===========================================================================
  // WALLET-007: Withdrawal Request Input Validation
  // ===========================================================================
  it('WALLET-007: enforces minimum 1,000 NGN payout threshold and available balance constraint', () => {
    const valid = validatePayoutRequestInput(samplePayoutInput, 50000);
    expect(valid.amountNaira).toBe(25000);
    expect(valid.bankAccountId).toBe('bank-acc-001');

    expect(() =>
      validatePayoutRequestInput(
        { ...samplePayoutInput, amountNaira: 500 },
        50000
      )
    ).toThrow(/minimum.*1,000/i);

    expect(() =>
      validatePayoutRequestInput(
        { ...samplePayoutInput, amountNaira: 60000 },
        50000
      )
    ).toThrow(/insufficient/i);

    expect(() =>
      validatePayoutRequestInput(
        { ...samplePayoutInput, bankAccountId: '' },
        50000
      )
    ).toThrow(/bank account/i);
  });

  // ===========================================================================
  // WALLET-008: Payout Request State Lifecycle
  // ===========================================================================
  it('WALLET-008: validates payout request state transitions and prevents terminal state progression', () => {
    expect(canTransitionPayoutStatus('submitted', 'processing')).toBe(true);
    expect(canTransitionPayoutStatus('submitted', 'failed')).toBe(true);
    expect(canTransitionPayoutStatus('processing', 'paid')).toBe(true);
    expect(canTransitionPayoutStatus('processing', 'failed')).toBe(true);

    expect(canTransitionPayoutStatus('paid', 'processing')).toBe(false);
    expect(canTransitionPayoutStatus('paid', 'failed')).toBe(false);
    expect(canTransitionPayoutStatus('failed', 'paid')).toBe(false);
  });

  // ===========================================================================
  // WALLET-009: Nigerian Currency Formatting Helper
  // ===========================================================================
  it('WALLET-009: formats numeric values into standard Naira representation', () => {
    expect(formatNaira(15000)).toBe('NGN 15,000');
    expect(formatNaira(0)).toBe('NGN 0');
    expect(formatNaira(1250500)).toBe('NGN 1,250,500');

    expect(() => formatNaira(-100)).toThrow(/non-negative/i);
  });

  // ===========================================================================
  // WALLET-010: Boundary Isolation
  // ===========================================================================
  it('WALLET-010: preserves boundary isolation with zero testing fixture imports in production', () => {
    const typesPath = path.join(__dirname, 'types.ts');
    const domainPath = path.join(__dirname, 'domain.ts');

    const typesSource = fs.readFileSync(typesPath, 'utf8');
    const domainSource = fs.readFileSync(domainPath, 'utf8');

    expect(assertProductionBoundary(typesSource)).toBe(true);
    expect(assertProductionBoundary(domainSource)).toBe(true);
  });
});

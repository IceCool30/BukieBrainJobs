// apps/web/app/brainworker/BrainWorkerWalletRoute.test.tsx
// Phase 4 RED: BrainWorker Wallet & Payouts Route Integration Contracts (ROUTE-001 to ROUTE-010)
// Item 2.6 in master checklist: BrainWorker Earnings, Wallet & Payouts (BW-006)

import * as fs from 'fs';
import * as path from 'path';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import * as authStorage from '../../lib/auth/storage';
import * as walletRepoModule from '../../lib/brainworker/wallet/repository';
import type { IBrainWorkerWalletRepository } from '../../lib/brainworker/wallet/repository';
import type {
  BankAccountDetails,
  BrainWorkerWalletSummary,
  PayoutRequest,
  WalletTransaction,
} from '../../lib/brainworker/wallet/types';
import type { AuthUser } from '../../lib/auth/types';
import BrainWorkerWalletPage from './wallet/page';

// Mock Next.js Navigation Hooks
const mockPush = vi.fn();
const mockReplace = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/brainworker/wallet',
}));

describe('BrainWorker Wallet & Payouts Route Integration Contracts (ROUTE-001 to ROUTE-010)', () => {
  let mockWalletRepo: IBrainWorkerWalletRepository;

  const mockApprovedWorker: AuthUser = {
    id: 'worker-101',
    name: 'Tunde Adeyemi',
    role: 'brainworker',
    provider: 'phone',
    isBrainWorkerApproved: true,
  };

  const mockUnapprovedWorker: AuthUser = {
    id: 'worker-unapproved',
    name: 'Kelechi Uzo',
    role: 'brainworker',
    provider: 'phone',
    isBrainWorkerApproved: false,
  };

  const mockCustomerUser: AuthUser = {
    id: 'customer-101',
    name: 'Ngozi Okonjo',
    role: 'customer',
    provider: 'phone',
    isBrainWorkerApproved: false,
  };

  const sampleSummary: BrainWorkerWalletSummary = {
    brainWorkerId: 'worker-101',
    availableBalanceNaira: 125000,
    pendingEscrowNaira: 45000,
    lifetimeEarningsNaira: 320000,
    totalWithdrawnNaira: 150000,
    currency: 'NGN',
    updatedAt: '2026-10-15T12:00:00.000Z',
  };

  const sampleBankAccount: BankAccountDetails = {
    id: 'bank-acc-1',
    brainWorkerId: 'worker-101',
    bankCode: '058',
    bankName: 'GTBank',
    accountNumber: '0123456789',
    accountName: 'TUNDE ADEYEMI',
    isVerified: true,
    createdAt: '2026-10-10T10:00:00.000Z',
  };

  const sampleTransaction: WalletTransaction = {
    id: 'tx-1',
    brainWorkerId: 'worker-101',
    bookingId: 'bk-101',
    bookingReference: 'BK-LAG-101',
    type: 'escrow_credit',
    amountNaira: 45000,
    grossAmountNaira: 50000,
    platformFeeNaira: 5000,
    status: 'cleared',
    description: 'Solar inverter installation completed',
    createdAt: '2026-10-15T10:00:00.000Z',
  };

  const samplePayoutRequest: PayoutRequest = {
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
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockWalletRepo = {
      getWalletSummary: vi.fn().mockResolvedValue(sampleSummary),
      getBankAccounts: vi.fn().mockResolvedValue([sampleBankAccount]),
      addBankAccount: vi.fn().mockImplementation((_workerId, input) =>
        Promise.resolve({
          id: 'bank-acc-new',
          brainWorkerId: 'worker-101',
          bankCode: input.bankCode,
          bankName: 'GTBank',
          accountNumber: input.accountNumber,
          accountName: input.accountName ?? 'TUNDE ADEYEMI',
          isVerified: true,
          createdAt: '2026-10-16T12:00:00.000Z',
        })
      ),
      deleteBankAccount: vi.fn().mockResolvedValue(undefined),
      requestPayout: vi.fn().mockImplementation((_workerId, input) =>
        Promise.resolve({
          id: 'payout-new',
          brainWorkerId: 'worker-101',
          bankAccountId: input.bankAccountId,
          amountNaira: input.amountNaira,
          feeNaira: 0,
          netAmountNaira: input.amountNaira,
          destinationBank: {
            bankName: 'GTBank',
            bankCode: '058',
            maskedAccountNumber: '******6789',
            accountName: 'TUNDE ADEYEMI',
          },
          status: 'submitted',
          requestedAt: '2026-10-16T12:00:00.000Z',
        })
      ),
      getPayoutRequests: vi.fn().mockResolvedValue([samplePayoutRequest]),
      getTransactions: vi.fn().mockResolvedValue([sampleTransaction]),
      creditEscrowEarnings: vi.fn().mockResolvedValue({
        transaction: sampleTransaction,
        updatedSummary: sampleSummary,
      }),
    };

    vi.spyOn(walletRepoModule, 'getBrainWorkerWalletRepository').mockReturnValue(
      mockWalletRepo
    );
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(null);
  });

  // ===========================================================================
  // ROUTE-001: Unauthenticated Guard
  // ===========================================================================
  it('ROUTE-001: unauthenticated visitor accessing /brainworker/wallet redirects to /login without triggering repository reads', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(null);

    render(<BrainWorkerWalletPage />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(
        expect.stringMatching(/\/login\?redirect=.*brainworker.*wallet/)
      );
    });
    expect(mockWalletRepo.getWalletSummary).not.toHaveBeenCalled();
    expect(mockWalletRepo.getBankAccounts).not.toHaveBeenCalled();
    expect(mockWalletRepo.getTransactions).not.toHaveBeenCalled();
    expect(mockWalletRepo.getPayoutRequests).not.toHaveBeenCalled();
  });

  // ===========================================================================
  // ROUTE-002: Customer Role Boundary
  // ===========================================================================
  it('ROUTE-002: authenticated customer accessing /brainworker/wallet renders fail-closed boundary without calling wallet repository', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockCustomerUser);

    render(<BrainWorkerWalletPage />);

    expect(screen.getByText(/Customer Account Detected|Unauthorized/i)).toBeInTheDocument();
    expect(screen.getByText(/Access Restricted/i)).toBeInTheDocument();
    expect(mockWalletRepo.getWalletSummary).not.toHaveBeenCalled();
    expect(mockWalletRepo.getBankAccounts).not.toHaveBeenCalled();
    expect(mockWalletRepo.getTransactions).not.toHaveBeenCalled();
  });

  // ===========================================================================
  // ROUTE-003: Unapproved BrainWorker Guard
  // ===========================================================================
  it('ROUTE-003: unapproved BrainWorker accessing /brainworker/wallet redirects to /brainworker/verification-status', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockUnapprovedWorker);

    render(<BrainWorkerWalletPage />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/brainworker/verification-status');
    });
    expect(mockWalletRepo.getWalletSummary).not.toHaveBeenCalled();
    expect(mockWalletRepo.getBankAccounts).not.toHaveBeenCalled();
    expect(mockWalletRepo.getTransactions).not.toHaveBeenCalled();
  });

  // ===========================================================================
  // ROUTE-004: Workspace Mount for Approved BrainWorker
  // ===========================================================================
  it('ROUTE-004: approved BrainWorker loads /brainworker/wallet and mounts WalletManagementWorkspace populated with repository data', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockApprovedWorker);

    render(<BrainWorkerWalletPage />);

    expect(await screen.findByTestId('wallet-management-workspace')).toBeInTheDocument();
    expect(screen.getByTestId('wallet-summary-cards')).toBeInTheDocument();
    expect(screen.getByTestId('bank-accounts-manager')).toBeInTheDocument();
    expect(screen.getByTestId('wallet-ledger-table')).toBeInTheDocument();
    expect(screen.getByTestId('card-available-balance')).toHaveTextContent(/125,000/);
  });

  // ===========================================================================
  // ROUTE-005: Tenant-Isolated Repository Queries
  // ===========================================================================
  it('ROUTE-005: all repository queries strictly pass session userId, preventing cross-tenant data leaks', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockApprovedWorker);

    render(<BrainWorkerWalletPage />);

    await waitFor(() => {
      expect(mockWalletRepo.getWalletSummary).toHaveBeenCalledWith(mockApprovedWorker.id);
      expect(mockWalletRepo.getBankAccounts).toHaveBeenCalledWith(mockApprovedWorker.id);
      expect(mockWalletRepo.getTransactions).toHaveBeenCalledWith(mockApprovedWorker.id);
      expect(mockWalletRepo.getPayoutRequests).toHaveBeenCalledWith(mockApprovedWorker.id);
    });
  });

  // ===========================================================================
  // ROUTE-006: Add Bank Account Delegation
  // ===========================================================================
  it('ROUTE-006: add bank account form submission delegates to repository.addBankAccount(userId, input)', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockApprovedWorker);

    render(<BrainWorkerWalletPage />);

    const addBtn = await screen.findByTestId('add-bank-account-button');
    fireEvent.click(addBtn);

    const accountInput = screen.getByTestId('account-number-input');
    const nameInput = screen.getByTestId('account-name-input');
    fireEvent.change(accountInput, { target: { value: '0123456789' } });
    fireEvent.change(nameInput, { target: { value: 'Tunde Adeyemi' } });

    const saveBtn = screen.getByTestId('save-bank-account-button');
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(mockWalletRepo.addBankAccount).toHaveBeenCalledWith(
        mockApprovedWorker.id,
        expect.objectContaining({
          accountNumber: '0123456789',
          accountName: 'Tunde Adeyemi',
        })
      );
    });
  });

  // ===========================================================================
  // ROUTE-007: Delete Bank Account Delegation
  // ===========================================================================
  it('ROUTE-007: delete bank account confirmation delegates to repository.deleteBankAccount(userId, accountId)', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockApprovedWorker);

    render(<BrainWorkerWalletPage />);

    const deleteBtn = await screen.findByTestId('delete-bank-account-bank-acc-1');
    fireEvent.click(deleteBtn);

    const confirmBtn = screen.getByTestId('confirm-delete-account-button');
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(mockWalletRepo.deleteBankAccount).toHaveBeenCalledWith(
        mockApprovedWorker.id,
        'bank-acc-1'
      );
    });
  });

  // ===========================================================================
  // ROUTE-008: Payout Form Submission Delegation
  // ===========================================================================
  it('ROUTE-008: payout form submission delegates to repository.requestPayout(userId, input)', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockApprovedWorker);

    render(<BrainWorkerWalletPage />);

    const requestBtn = await screen.findByTestId('request-payout-button');
    fireEvent.click(requestBtn);

    const amountInput = screen.getByTestId('payout-amount-input');
    fireEvent.change(amountInput, { target: { value: '25000' } });

    const submitBtn = screen.getByTestId('submit-payout-button');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockWalletRepo.requestPayout).toHaveBeenCalledWith(
        mockApprovedWorker.id,
        expect.objectContaining({
          bankAccountId: 'bank-acc-1',
          amountNaira: 25000,
        })
      );
    });
  });

  // ===========================================================================
  // ROUTE-009: Error Handling
  // ===========================================================================
  it('ROUTE-009: error handling gracefully renders notification banner when repository operations fail', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockApprovedWorker);
    mockWalletRepo.getWalletSummary = vi
      .fn()
      .mockRejectedValue(new Error('Network service unavailable'));

    render(<BrainWorkerWalletPage />);

    expect(
      await screen.findByText(/Network service unavailable|Failed to load/i)
    ).toBeInTheDocument();
  });

  // ===========================================================================
  // ROUTE-010: SSR Mount Safety and Production Isolation
  // ===========================================================================
  it('ROUTE-010: SSR mount safety and production isolation renders production shell without SSR errors or imports from testing/', async () => {
    const { renderToString } = await import('react-dom/server');

    let markup = '';
    expect(() => {
      markup = renderToString(<BrainWorkerWalletPage />);
    }).not.toThrow();

    expect(markup).toBeDefined();

    // Verify physical boundary: page.tsx does not import from testing/
    const pagePath = path.join(__dirname, 'wallet', 'page.tsx');
    const pageSource = fs.readFileSync(pagePath, 'utf8');
    expect(pageSource).not.toMatch(/from ['"][^'"]*testing[^'"]*['"]/);
  });
});

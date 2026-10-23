// apps/web/app/brainworker/wallet/page.tsx
// BrainWorker Earnings, Wallet and Payouts Page (BW-006, Item 2.6)
// Phase 4 GREEN: Protected route integration, security guards, and repository delegation

'use client';

import React, { useEffect, useState, useRef, type JSX } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getMockAuthenticatedUser, setMockAuthenticatedUser } from '../../../lib/auth/storage';
import type { AuthUser } from '../../../lib/auth/types';
import { WalletManagementWorkspace } from '../../../components/brainworker/wallet/WalletManagementWorkspace';
import { getBrainWorkerWalletRepository } from '../../../lib/brainworker/wallet/repository';
import type {
  BankAccountDetails,
  BrainWorkerWalletSummary,
  PayoutRequest,
  WalletTransaction,
} from '../../../lib/brainworker/wallet/types';
import { BrainWorkerHeader } from '../../../components/brainworker/BrainWorkerHeader';

export default function BrainWorkerWalletPage(): JSX.Element {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [summary, setSummary] = useState<BrainWorkerWalletSummary | null>(null);
  const [bankAccounts, setBankAccounts] = useState<BankAccountDetails[]>([]);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const redirectedRef = useRef(false);

  useEffect(() => {
    const currentUser = getMockAuthenticatedUser();
    setUser(currentUser);

    // Guard 1: Unauthenticated visitor redirects to /login
    if (!currentUser) {
      if (!redirectedRef.current) {
        redirectedRef.current = true;
        router.replace('/login?redirect=/brainworker/wallet');
      }
      return;
    }

    // Guard 2: Customer or non-BrainWorker triggers fail-closed boundary
    if (currentUser.role !== 'brainworker') {
      return;
    }

    // Guard 3: Unapproved BrainWorker redirects to verification status
    if (!currentUser.isBrainWorkerApproved) {
      if (!redirectedRef.current) {
        redirectedRef.current = true;
        router.replace('/brainworker/verification-status');
      }
      return;
    }

    // Load wallet summary, bank accounts, transactions, and payout requests strictly bound to worker ID
    let isSubscribed = true;
    const repo = getBrainWorkerWalletRepository();

    Promise.all([
      repo.getWalletSummary(currentUser.id),
      repo.getBankAccounts(currentUser.id),
      repo.getTransactions(currentUser.id),
      repo.getPayoutRequests(currentUser.id),
    ])
      .then(([walletSummary, accounts, txs, payouts]) => {
        if (!isSubscribed) return;
        setSummary(walletSummary);
        setBankAccounts(accounts);
        setTransactions(txs);
        setPayoutRequests(payouts);
        setIsLoading(false);
      })
      .catch((err) => {
        if (!isSubscribed) return;
        setErrorMessage(
          err instanceof Error ? err.message : 'Failed to load wallet data'
        );
        setIsLoading(false);
      });

    return () => {
      isSubscribed = false;
    };
  }, [router]);

  // Customer Account or Non-BrainWorker Fail-Closed Boundary
  if (user && user.role !== 'brainworker') {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-4 transition-colors">
        <div className="max-w-md w-full bg-[var(--card-bg)] rounded-2xl border border-[var(--danger-border)] p-8 shadow-sm text-center space-y-4 transition-colors">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[var(--danger-dim)] border border-[var(--danger-border)] px-3 py-1 text-xs font-semibold text-[var(--danger)]">
            {user.role === 'customer'
              ? 'Customer Account Detected'
              : 'Unauthorized Access'}
          </div>
          <h2 className="text-xl font-bold text-[var(--text-main)]">
            Access Restricted
          </h2>
          <p className="text-sm text-[var(--text-muted)] leading-relaxed">
            The BrainWorker workspace is strictly reserved for verified service
            providers.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-xl bg-[var(--amber)] px-5 py-2.5 text-sm font-bold text-[#001A41] shadow-sm hover:bg-[var(--amber-hover)] transition-colors"
          >
            {user.role === 'customer'
              ? 'Return to Customer Dashboard'
              : 'Return Home'}
          </Link>
        </div>
      </div>
    );
  }

  const handleSignOut = () => {
    setMockAuthenticatedUser(null);
    router.push('/login');
  };

  const handleAddAccount = async (input: {
    bankCode: string;
    accountNumber: string;
    accountName?: string | undefined;
  }) => {
    if (!user) return;
    const repo = getBrainWorkerWalletRepository();
    const created = await repo.addBankAccount(user.id, input);
    setBankAccounts((prev) => [...prev, created]);
    setErrorMessage(null);
  };

  const handleDeleteAccount = async (bankAccountId: string) => {
    if (!user) return;
    const repo = getBrainWorkerWalletRepository();
    await repo.deleteBankAccount(user.id, bankAccountId);
    setBankAccounts((prev) => prev.filter((acc) => acc.id !== bankAccountId));
    setErrorMessage(null);
  };

  const handleSubmitPayout = async (input: {
    bankAccountId: string;
    amountNaira: number;
    notes?: string | undefined;
  }) => {
    if (!user) return;
    const repo = getBrainWorkerWalletRepository();
    const createdPayout = await repo.requestPayout(user.id, input);
    setPayoutRequests((prev) => [createdPayout, ...prev]);

    // Refresh updated wallet summary and transactions
    const [updatedSummary, updatedTxs] = await Promise.all([
      repo.getWalletSummary(user.id),
      repo.getTransactions(user.id),
    ]);
    setSummary(updatedSummary);
    setTransactions(updatedTxs);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-main)] transition-colors duration-200">
      {/* Top Header */}
      <BrainWorkerHeader active="wallet" user={user} onSignOut={handleSignOut} />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {errorMessage && (
          <div className="rounded-xl border border-[var(--danger-border)] bg-[var(--danger-dim)] p-4 text-xs text-[var(--danger)]">
            Failed to load wallet data: {errorMessage}
          </div>
        )}

        {!user || !user.isBrainWorkerApproved || isLoading || !summary ? (
          <div className="flex justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--brand-green)] border-t-transparent" />
          </div>
        ) : (
          <WalletManagementWorkspace
            summary={summary}
            accounts={bankAccounts}
            transactions={transactions}
            payoutRequests={payoutRequests}
            onAddAccount={handleAddAccount}
            onDeleteAccount={handleDeleteAccount}
            onSubmitPayout={handleSubmitPayout}
            isLoading={isLoading}
          />
        )}
      </main>
    </div>
  );
}

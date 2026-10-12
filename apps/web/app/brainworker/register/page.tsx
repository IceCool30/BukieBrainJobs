// apps/web/app/brainworker/register/page.tsx
// Phase 8 GREEN: BrainWorker Registration Route
// Authoritative References:
// - docs/specs/BW-001-architecture-contract.md (Section 5.1)
// - docs/specs/BW-001-test-first-implementation-plan.md (Suite 8: INT-001 & INT-002)

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, ArrowRight, AlertTriangle } from 'lucide-react';
import { getMockAuthenticatedUser, setMockAuthenticatedUser } from '../../../lib/auth/storage';
import type { AuthUser } from '../../../lib/auth/types';

export default function BrainWorkerRegisterPage(): React.ReactElement {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(() => getMockAuthenticatedUser());
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const currentUser = getMockAuthenticatedUser();
    setUser(currentUser);

    // If already an approved BrainWorker -> dashboard; if registered unapproved -> onboarding
    if (currentUser?.role === 'brainworker') {
      if (currentUser.isBrainWorkerApproved) {
        router.replace('/brainworker/dashboard');
      } else {
        router.replace('/brainworker/onboarding');
      }
    }
  }, [router]);

  // Customer boundary check - fail closed immediately on render
  if (user?.role === 'customer') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0B1528] flex items-center justify-center p-4 transition-colors">
        <div className="max-w-md w-full bg-white dark:bg-[#111927] rounded-lg border border-amber-300 dark:border-amber-800/60 p-6 sm:p-8 shadow-xs text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 rounded-md bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/60 px-2.5 py-1 text-xs font-semibold text-amber-900 dark:text-amber-200">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
            <span>Boundary Conflict</span>
          </div>
          <h2 className="text-xl font-bold text-[#001A41] dark:text-[#F8FAFC]">
            Customer Account Detected
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Please sign out or create a separate provider account to register as a BrainWorker. Existing customer accounts cannot be converted to provider accounts.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              type="button"
              onClick={() => {
                setMockAuthenticatedUser(null);
                setUser(null);
              }}
              className="inline-flex items-center justify-center rounded-lg bg-[#001A41] dark:bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-[#002661] dark:hover:bg-emerald-500 transition-colors"
            >
              Sign Out
            </button>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-800 px-5 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Return Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const currentUser = getMockAuthenticatedUser();
    if (currentUser?.role === 'customer') {
      setError('Existing customer accounts cannot be converted to provider accounts. Please sign out first.');
      return;
    }

    if (!name.trim() || !email.trim() || !phone.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    const newBrainWorker: AuthUser = {
      id: `bw-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      provider: 'phone',
      role: 'brainworker',
      isBrainWorkerApproved: false,
    };

    setMockAuthenticatedUser(newBrainWorker);
    router.push('/brainworker/onboarding');
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#0B1528] py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center transition-colors">
      <div className="max-w-md w-full bg-white dark:bg-[#111927] rounded-lg border border-slate-200 dark:border-slate-800 p-6 sm:p-10 shadow-xs space-y-6">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 px-2.5 py-1 text-xs font-semibold text-emerald-800 dark:text-emerald-300 mb-3">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>BrainWorker Registration</span>
          </div>
          <h1 className="text-2xl font-bold text-[#001A41] dark:text-[#F8FAFC]">
            Become a BrainWorker
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Join BukieBrainJobs as a BrainWorker. Complete your registration to begin onboarding and profile verification.
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/30 p-3.5 text-xs font-medium text-rose-700 dark:text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <input
                id="name"
                name="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Chidi Anozie"
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B1528] px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-[#001A41] dark:focus:border-emerald-500 focus:ring-1 focus:ring-[#001A41] dark:focus:ring-emerald-500 outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="chidi@example.com"
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B1528] px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-[#001A41] dark:focus:border-emerald-500 focus:ring-1 focus:ring-[#001A41] dark:focus:ring-emerald-500 outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label htmlFor="phone" className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Phone Number
            </label>
            <div className="relative">
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+234 800 000 0000"
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B1528] px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-[#001A41] dark:focus:border-emerald-500 focus:ring-1 focus:ring-[#001A41] dark:focus:ring-emerald-500 outline-none transition-colors"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#001A41] dark:bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-xs hover:bg-[#002661] dark:hover:bg-emerald-500 transition-colors"
            >
              <span>Continue to Onboarding</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

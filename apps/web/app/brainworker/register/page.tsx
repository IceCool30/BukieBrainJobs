// apps/web/app/brainworker/register/page.tsx
// Phase 8 GREEN: BrainWorker Registration Route
// Authoritative References:
// - docs/specs/BW-001-architecture-contract.md (Section 5.1)
// - docs/specs/BW-001-test-first-implementation-plan.md (Suite 8: INT-001 & INT-002)

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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

    // If already an approved BrainWorker -> dashboard
    if (currentUser?.role === 'brainworker' && currentUser.isBrainWorkerApproved) {
      router.replace('/brainworker/dashboard');
    }
  }, [router]);

  // Customer boundary check - fail closed immediately on render
  if (user?.role === 'customer') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-amber-200 p-8 shadow-sm text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-300 px-3 py-1 text-xs font-semibold text-amber-900">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
            <span>Boundary Conflict</span>
          </div>
          <h2 className="text-xl font-bold text-[#001A41]">
            Customer Account Detected
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Please sign out or create a separate provider account to register as a BrainWorker. Existing customer accounts cannot be converted to provider accounts.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              type="button"
              onClick={() => {
                setMockAuthenticatedUser(null);
                setUser(null);
              }}
              className="inline-flex items-center justify-center rounded-xl bg-[#001A41] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#002661]"
            >
              Sign Out
            </button>
            <a
              href="/"
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Return Home
            </a>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
    <main className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-6">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-semibold text-blue-700 mb-3">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>BrainWorker Registration</span>
          </div>
          <h1 className="text-2xl font-bold text-[#001A41]">
            Become a BrainWorker
          </h1>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            Join the verified artisan network. Complete your provider registration to begin the onboarding and verification process.
          </p>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
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
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#001A41] focus:ring-1 focus:ring-[#001A41] outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
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
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#001A41] focus:ring-1 focus:ring-[#001A41] outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="phone" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
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
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#001A41] focus:ring-1 focus:ring-[#001A41] outline-none"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#001A41] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#002661] transition"
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

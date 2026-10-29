// apps/web/app/brainworker/services/page.tsx
// Phase 7 GREEN: BrainWorker Service Catalog & Rates Route
// Governed by: BW-002 Architecture Contract v1.2 & Test-First Implementation Plan v1.2 (Suite 6: INT-001 to INT-004, INT-009, INT-010)

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getMockAuthenticatedUser, setMockAuthenticatedUser } from '../../../lib/auth/storage';
import type { AuthUser } from '../../../lib/auth/types';
import { ServiceCatalogEditor } from '../../../components/brainworker/catalog/ServiceCatalogEditor';
import { BrainWorkerHeader } from '../../../components/brainworker/BrainWorkerHeader';

export default function BrainWorkerServicesPage(): React.ReactElement {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const currentUser = getMockAuthenticatedUser();
    setUser(currentUser);

    // Guard 1: Unauthenticated -> redirect to /login
    if (!currentUser) {
      router.replace('/login?redirect=/brainworker/services');
      return;
    }

    // Guard 2: Non-BrainWorker -> fail-closed boundary
    if (currentUser.role !== 'brainworker') {
      return;
    }

    // Guard 3: Unapproved BrainWorker -> redirect to verification status
    if (!currentUser.isBrainWorkerApproved) {
      router.replace('/brainworker/verification-status');
      return;
    }
  }, [router]);

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] transition-colors">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--text-main)] border-t-transparent" />
      </div>
    );
  }

  if (user.role !== 'brainworker') {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-4 transition-colors">
        <div className="max-w-md w-full bg-[var(--card-bg)] rounded-2xl border border-[var(--danger-border)] p-8 shadow-sm text-center space-y-4 transition-colors">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[var(--danger-dim)] border border-[var(--danger-border)] px-3 py-1 text-xs font-semibold text-[var(--danger)]">
            {user.role === 'customer' ? 'Customer Account Detected' : 'Unauthorized Access'}
          </div>
          <h2 className="text-xl font-bold text-[var(--text-main)]">Workspace Unavailable</h2>
          <p className="text-sm text-[var(--text-muted)] leading-relaxed">
            This section requires a verified service provider profile.
          </p>
          <Link
            href="/"
            className="outlier-pill-button inline-flex items-center justify-center rounded-full bg-[var(--amber)] px-5 py-2.5 text-sm font-bold text-[#001A41] shadow-sm hover:bg-[var(--amber-hover)] transition-all"
          >
            {user.role === 'customer' ? 'Return to Customer Dashboard' : 'Return Home'}
          </Link>
        </div>
      </div>
    );
  }

  if (!user.isBrainWorkerApproved) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] transition-colors">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--text-main)] border-t-transparent" />
      </div>
    );
  }

  const handleSignOut = () => {
    setMockAuthenticatedUser(null);
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] transition-colors">
      {/* Top Navigation */}
      <BrainWorkerHeader active="services" user={user} onSignOut={handleSignOut} />

      {/* Main Workspace */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ServiceCatalogEditor brainWorkerId={user.id} />
      </main>
    </div>
  );
}

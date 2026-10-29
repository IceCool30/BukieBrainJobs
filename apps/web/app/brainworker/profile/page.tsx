// apps/web/app/brainworker/profile/page.tsx
// BrainWorker Profile and Portfolio Management Page (BW-005, Item 2.7)
// Phase 4 GREEN: Protected route integration, security guards, and repository delegation

'use client';

import React, { useEffect, useState, useRef, type JSX } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getMockAuthenticatedUser, setMockAuthenticatedUser } from '../../../lib/auth/storage';
import type { AuthUser } from '../../../lib/auth/types';
import { ProfileManagementWorkspace } from '../../../components/brainworker/profile/ProfileManagementWorkspace';
import { getBrainWorkerProfileRepository } from '../../../lib/brainworker/profile/repository';
import type {
  BrainWorkerProfile,
  CustomerReview,
  PortfolioItem,
} from '../../../lib/brainworker/profile/types';
import { BrainWorkerHeader } from '../../../components/brainworker/BrainWorkerHeader';

export default function BrainWorkerProfilePage(): JSX.Element {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<BrainWorkerProfile | null>(null);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [reviews, setReviews] = useState<CustomerReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const redirectedRef = useRef(false);

  useEffect(() => {
    const currentUser = getMockAuthenticatedUser();
    setUser(currentUser);

    // Guard 1: Unauthenticated visitor redirects to /login
    if (!currentUser) {
      if (!redirectedRef.current) {
        redirectedRef.current = true;
        router.replace('/login?redirect=/brainworker/profile');
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

    // Load profile, portfolio items, and reviews strictly bound to authenticated worker ID
    let isSubscribed = true;
    const repo = getBrainWorkerProfileRepository();

    Promise.all([
      repo.getProfile(currentUser.id),
      repo.getPortfolio(currentUser.id),
      repo.getReviews(currentUser.id),
    ])
      .then(([prof, items, revs]) => {
        if (!isSubscribed) return;
        setProfile(prof);
        setPortfolioItems(items);
        setReviews(revs);
        setIsLoading(false);
      })
      .catch((err) => {
        if (!isSubscribed) return;
        setErrorMessage(
          err instanceof Error ? err.message : 'Failed to load profile data'
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
            className="outlier-pill-button inline-flex items-center justify-center rounded-full bg-[var(--amber)] px-5 py-2.5 text-sm font-bold text-[#001A41] shadow-sm hover:bg-[var(--amber-hover)] transition-all"
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

  const handleSaveProfile = async (updates: Partial<BrainWorkerProfile>) => {
    if (!user) return;
    setIsSaving(true);
    try {
      const repo = getBrainWorkerProfileRepository();
      const updated = await repo.saveProfile(user.id, updates);
      setProfile(updated);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddPortfolioItem = async (
    item: Omit<PortfolioItem, 'id' | 'createdAt'>
  ) => {
    if (!user) return;
    const repo = getBrainWorkerProfileRepository();
    const created = await repo.addPortfolioItem(user.id, item);
    setPortfolioItems((prev) => [created, ...prev]);
  };

  const handleDeletePortfolioItem = async (itemId: string) => {
    if (!user) return;
    const repo = getBrainWorkerProfileRepository();
    await repo.deletePortfolioItem(user.id, itemId);
    setPortfolioItems((prev) => prev.filter((p) => p.id !== itemId));
  };

  const handleSubmitCounterResponse = async (
    reviewId: string,
    responseText: string
  ) => {
    if (!user) return;
    const repo = getBrainWorkerProfileRepository();
    const updatedReview = await repo.submitReviewCounterResponse(
      user.id,
      reviewId,
      responseText
    );
    setReviews((prev) =>
      prev.map((r) => (r.id === reviewId ? updatedReview : r))
    );
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-main)] transition-colors duration-200">
      {/* Top Header */}
      <BrainWorkerHeader active="profile" user={user} onSignOut={handleSignOut} />

      {/* Main Workspace */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-trades uppercase text-[var(--text-main)]">
            Profile &amp; Portfolio Management
          </h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Manage your professional identity, showcase before and after project work, and address customer reviews.
          </p>
        </div>

        {errorMessage && (
          <div className="rounded-xl border border-[var(--danger-border)] bg-[var(--danger-dim)] p-4 text-xs text-[var(--danger)]">
            {errorMessage}
          </div>
        )}

        {(!user || !user.isBrainWorkerApproved || isLoading) ? (
          <div className="flex justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--brand-green)] border-t-transparent" />
          </div>
        ) : (
          <ProfileManagementWorkspace
            profile={profile}
            portfolioItems={portfolioItems}
            reviews={reviews}
            isSaving={isSaving}
            onSaveProfile={handleSaveProfile}
            onAddPortfolioItem={handleAddPortfolioItem}
            onDeletePortfolioItem={handleDeletePortfolioItem}
            onSubmitCounterResponse={handleSubmitCounterResponse}
          />
        )}
      </main>
    </div>
  );
}

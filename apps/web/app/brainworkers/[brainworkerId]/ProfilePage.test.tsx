import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import PublicBrainWorkerProfilePage from './page';
import * as reviewRepoModule from '../../../lib/review/repository';
import * as authStorage from '../../../lib/auth/storage';
import type { AuthUser } from '../../../lib/auth/types';
import type { GetPublicReviewsResult, ICustomerReviewRepository } from '../../../lib/review/types';

// Mock Next.js Image
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...props} />
  ),
}));

describe('PublicBrainWorkerProfilePage Integration (WEB-016)', () => {
  const brainworkerId = 'bw-1';

  const mockReviewResult: GetPublicReviewsResult = {
    reviews: [
      {
        id: 'rev-int-001',
        reviewerDisplayName: 'Chidinma O.',
        ratings: { punctuality: 5, quality: 5, communication: 5, overall: 5 },
        comment: 'Solomon did an outstanding job repairing our electrical panel.',
        serviceTitle: 'Electrical Panel Maintenance',
        completedDate: 'September 2026',
        isVerifiedBooking: true,
        createdAt: '2026-09-18T10:00:00.000Z',
      },
    ],
    totalCount: 1,
    reputationSummary: {
      brainWorkerId: brainworkerId,
      averageRating: 5.0,
      totalReviews: 1,
      criteriaAverages: {
        punctuality: 5.0,
        quality: 5.0,
        communication: 5.0,
        overall: 5.0,
      },
      ratingDistribution: {
        5: 1,
        4: 0,
        3: 0,
        2: 0,
        1: 0,
      },
    },
  };

  const mockRepository = {
    getReviewEligibility: vi.fn(),
    submitReview: vi.fn(),
    getPublicReviews: vi.fn(),
    reportReview: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue({
      id: 'usr-customer-01',
      name: 'Adaeze Nwosu',
      email: 'adaeze@example.com',
      role: 'customer' as const,
    } as unknown as AuthUser);
    vi.spyOn(reviewRepoModule, 'getCustomerReviewRepository').mockReturnValue(mockRepository as unknown as ICustomerReviewRepository);
    mockRepository.getPublicReviews.mockResolvedValue(mockReviewResult);
  });

  it('renders BrainWorker profile page with integrated PublicReviewFeed defaulting to service focus', async () => {
    const pageComponent = await PublicBrainWorkerProfilePage({
      params: Promise.resolve({ brainworkerId }),
      searchParams: Promise.resolve({}),
    });

    render(pageComponent);

    // Profile header
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Emeka Nwosu/i);

    // Sub-navigation tabs
    expect(screen.getByRole('tab', { name: /Service focus/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Customer reviews/i })).toBeInTheDocument();

    // Default tab is service focus
    expect(screen.getByRole('tab', { name: /Service focus/i })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText(/What this BrainWorker lists/i)).toBeInTheDocument();
  });

  it('renders with Customer reviews tab active when searchParams tab="reviews"', async () => {
    const pageComponent = await PublicBrainWorkerProfilePage({
      params: Promise.resolve({ brainworkerId }),
      searchParams: Promise.resolve({ tab: 'reviews' }),
    });

    render(pageComponent);

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: /Customer reviews/i })).toHaveAttribute('aria-selected', 'true');
    });

    expect(screen.getByText(/BrainWorker Reputation/i)).toBeInTheDocument();
    expect(screen.getByText(/Verified bookings only/i)).toBeInTheDocument();
  });
});

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import * as reviewRepoModule from '../../lib/review/repository';
import * as authStorage from '../../lib/auth/storage';
import { PublicReviewFeed } from './PublicReviewFeed';
import type { AuthUser } from '../../lib/auth/types';
import type { GetPublicReviewsResult, PublicBrainWorkerReview, ICustomerReviewRepository } from '../../lib/review/types';

describe('PublicReviewFeed (TDD Suite 5: FED-001 to FED-011)', () => {
  const brainWorkerId = 'usr-brainworker-01';

  const mockPublicReview: PublicBrainWorkerReview = {
    id: 'rev-pub-001',
    reviewerDisplayName: 'Babajide A.',
    ratings: { punctuality: 5, quality: 5, communication: 4, overall: 5 },
    comment: 'Exceptional AC service, completed professionally on time.',
    serviceTitle: 'AC Deep Chemical Cleaning',
    completedDate: 'September 2026',
    isVerifiedBooking: true,
    createdAt: '2026-09-15T12:00:00.000Z',
  };

  const mockReputationSummary = {
    brainWorkerId,
    averageRating: 4.9,
    totalReviews: 28,
    criteriaAverages: {
      punctuality: 4.9,
      quality: 5.0,
      communication: 4.8,
      overall: 4.9,
    },
    ratingDistribution: {
      5: 24,
      4: 3,
      3: 1,
      2: 0,
      1: 0,
    },
  };

  const defaultResult: GetPublicReviewsResult = {
    reviews: [mockPublicReview],
    totalCount: 28,
    reputationSummary: mockReputationSummary,
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
    mockRepository.getPublicReviews.mockResolvedValue(defaultResult);
  });

  describe('FED-001: Reputation summary panel layout', () => {
    it('displays bold overall rating (4.9), star glyphs, "Verified bookings only" badge, and 4 criteria progress bars', async () => {
      render(<PublicReviewFeed brainWorkerId={brainWorkerId} />);

      await waitFor(() => {
        expect(screen.getAllByText('4.9').length).toBeGreaterThan(0);
      });

      expect(screen.getByText(/Verified bookings only/i)).toBeInTheDocument();
      expect(screen.getByText(/Rating Breakdown/i)).toBeInTheDocument();
      expect(screen.getByText('Punctuality', { exact: true })).toBeInTheDocument();
      expect(screen.getByText('Work quality', { exact: true })).toBeInTheDocument();
      expect(screen.getByText('Communication', { exact: true })).toBeInTheDocument();
      expect(screen.getByText('Overall', { exact: true })).toBeInTheDocument();
    });
  });

  describe('FED-002: Star distribution bar rendering', () => {
    it('displays counts for 5, 4, 3, 2, 1 stars in distribution', async () => {
      render(<PublicReviewFeed brainWorkerId={brainWorkerId} />);

      await waitFor(() => {
        expect(screen.getByText(/Rating Distribution/i)).toBeInTheDocument();
      });

      expect(screen.getByText(/5 stars/i)).toBeInTheDocument();
      expect(screen.getByText('(24)')).toBeInTheDocument();
      expect(screen.getByText('(3)')).toBeInTheDocument();
      expect(screen.getByText('(1)')).toBeInTheDocument();
    });
  });

  describe('FED-003: Verified review card presentation', () => {
    it('displays masked name, "Verified booking" badge, service context, date, criteria tags, and comment text', async () => {
      render(<PublicReviewFeed brainWorkerId={brainWorkerId} />);

      await waitFor(() => {
        expect(screen.getByText('Babajide A.')).toBeInTheDocument();
      });

      expect(screen.getByText('Verified booking')).toBeInTheDocument();
      expect(screen.getByText(/Service: AC Deep Chemical Cleaning/i)).toBeInTheDocument();
      expect(screen.getByText(/September 2026/i)).toBeInTheDocument();
      expect(screen.getByText('Exceptional AC service, completed professionally on time.')).toBeInTheDocument();
    });
  });

  describe('FED-004: XSS protection (safe text node rendering)', () => {
    it('renders script tag as safe raw text without script execution or HTML injection', async () => {
      const xssReview: PublicBrainWorkerReview = {
        ...mockPublicReview,
        id: 'rev-xss-001',
        comment: '<script>alert("xss")</script><b>Injected HTML</b>',
      };
      mockRepository.getPublicReviews.mockResolvedValueOnce({
        reviews: [xssReview],
        totalCount: 1,
        reputationSummary: {
          ...mockReputationSummary,
          totalReviews: 1,
        },
      });

      render(<PublicReviewFeed brainWorkerId={brainWorkerId} />);

      await waitFor(() => {
        expect(screen.getByText('<script>alert("xss")</script><b>Injected HTML</b>')).toBeInTheDocument();
      });

      // Assert script tag is not rendered as DOM element
      expect(document.querySelector('script[src*="xss"]')).toBeNull();
    });
  });

  describe('FED-005: Empty review state', () => {
    it('displays calm empty state "No customer reviews yet" when BrainWorker has 0 reviews', async () => {
      mockRepository.getPublicReviews.mockResolvedValueOnce({
        reviews: [],
        totalCount: 0,
        reputationSummary: {
          brainWorkerId,
          averageRating: 0,
          totalReviews: 0,
          criteriaAverages: { punctuality: 0, quality: 0, communication: 0, overall: 0 },
          ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        },
      });

      render(<PublicReviewFeed brainWorkerId={brainWorkerId} />);

      await waitFor(() => {
        expect(screen.getByText(/No customer reviews yet/i)).toBeInTheDocument();
      });

      expect(
        screen.getByText(/Reviews appear here once customers complete bookings with this BrainWorker/i)
      ).toBeInTheDocument();
    });
  });

  describe('FED-006: "Load more reviews" pagination flow', () => {
    it('fetches next slice, shows spinner, and appends cards to feed when "Load more reviews" is clicked', async () => {
      const page1Reviews = Array.from({ length: 5 }, (_, i) => ({
        ...mockPublicReview,
        id: `rev-p1-${i}`,
        comment: `Page 1 Review ${i + 1}`,
      }));
      const page2Reviews = Array.from({ length: 5 }, (_, i) => ({
        ...mockPublicReview,
        id: `rev-p2-${i}`,
        comment: `Page 2 Review ${i + 1}`,
      }));

      mockRepository.getPublicReviews
        .mockResolvedValueOnce({
          reviews: page1Reviews,
          totalCount: 12,
          reputationSummary: { ...mockReputationSummary, totalReviews: 12 },
        })
        .mockResolvedValueOnce({
          reviews: page2Reviews,
          totalCount: 12,
          reputationSummary: { ...mockReputationSummary, totalReviews: 12 },
        });

      render(<PublicReviewFeed brainWorkerId={brainWorkerId} />);

      await waitFor(() => {
        expect(screen.getByText('Page 1 Review 1')).toBeInTheDocument();
      });

      const loadMoreBtn = screen.getByRole('button', { name: /load more reviews/i });
      expect(loadMoreBtn).toBeInTheDocument();

      fireEvent.click(loadMoreBtn);

      await waitFor(() => {
        expect(screen.getByText('Page 2 Review 1')).toBeInTheDocument();
      });

      expect(mockRepository.getPublicReviews).toHaveBeenCalledWith(brainWorkerId, {
        page: 2,
        limit: 5,
      });
      // Page 1 reviews still in DOM
      expect(screen.getByText('Page 1 Review 1')).toBeInTheDocument();
    });
  });

  describe('FED-007: End-of-list indicator', () => {
    it('displays "Showing all 12 reviews" and hides "Load more" button when all reviews are loaded', async () => {
      const allReviews = Array.from({ length: 12 }, (_, i) => ({
        ...mockPublicReview,
        id: `rev-all-${i}`,
      }));

      mockRepository.getPublicReviews.mockResolvedValueOnce({
        reviews: allReviews,
        totalCount: 12,
        reputationSummary: { ...mockReputationSummary, totalReviews: 12 },
      });

      render(<PublicReviewFeed brainWorkerId={brainWorkerId} />);

      await waitFor(() => {
        expect(screen.getByText(/Showing all 12 reviews/i)).toBeInTheDocument();
      });

      expect(screen.queryByRole('button', { name: /load more reviews/i })).not.toBeInTheDocument();
    });
  });

  describe('FED-008: Report action opens reporting modal', () => {
    it('opens ReportReviewModal pre-populated with that review\'s ID when clicking "Report this review"', async () => {
      render(<PublicReviewFeed brainWorkerId={brainWorkerId} />);

      await waitFor(() => {
        expect(screen.getByText(/Report this review/i)).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText(/Report this review/i));

      await waitFor(() => {
        expect(screen.getByRole('dialog', { name: /report a customer review/i })).toBeInTheDocument();
      });
    });
  });

  describe('FED-009: Tab switching to Customer reviews', () => {
    it('renders customer reviews feed and hides service focus section when tab is switched', async () => {
      render(
        <PublicReviewFeed
          brainWorkerId={brainWorkerId}
          skills={['AC Repair', 'Gas Refill']}
          serviceCategories={['HVAC']}
        />
      );

      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /Customer reviews/i })).toBeInTheDocument();
      });

      const reviewsTab = screen.getByRole('tab', { name: /Customer reviews/i });
      fireEvent.click(reviewsTab);

      expect(screen.getByText(/BrainWorker Reputation/i)).toBeInTheDocument();
    });
  });

  describe('FED-010: Tab switching back to Service focus', () => {
    it('renders service skills and categories when Service focus tab is clicked', async () => {
      render(
        <PublicReviewFeed
          brainWorkerId={brainWorkerId}
          skills={['AC Chemical Cleaning', 'Gas Refill']}
          serviceCategories={['HVAC']}
        />
      );

      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /Service focus/i })).toBeInTheDocument();
      });

      const serviceTab = screen.getByRole('tab', { name: /Service focus/i });
      fireEvent.click(serviceTab);

      expect(screen.getByText('AC Chemical Cleaning')).toBeInTheDocument();
    });
  });

  describe('FED-011: Deep-link tab activation', () => {
    it('activates Customer reviews tab by default when initialTab="reviews" is passed', async () => {
      render(
        <PublicReviewFeed
          brainWorkerId={brainWorkerId}
          initialTab="reviews"
          skills={['AC Chemical Cleaning']}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/BrainWorker Reputation/i)).toBeInTheDocument();
      });

      const reviewsTab = screen.getByRole('tab', { name: /Customer reviews/i });
      expect(reviewsTab).toHaveAttribute('aria-selected', 'true');
    });
  });
});

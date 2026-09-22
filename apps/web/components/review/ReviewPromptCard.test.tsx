import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import type { CustomerActivityItem } from '@bukiebrainjobs/types';
import * as reviewRepoModule from '../../lib/review/repository';
import * as authStorage from '../../lib/auth/storage';
import { ReviewPromptCard } from './ReviewPromptCard';

describe('ReviewPromptCard (TDD Suite 3: CRD-001 to CRD-008)', () => {
  const mockUser = {
    id: 'usr-customer-review-01',
    name: 'Adaeze Nwosu',
    email: 'adaeze@example.com',
    role: 'customer' as const,
  };

  const completedActivity: CustomerActivityItem = {
    id: 'act-completed-001',
    type: 'booking',
    title: 'AC Deep Chemical Cleaning',
    status: 'completed',
    statusLabel: 'Completed',
    service: 'AC Cleaning',
    category: 'HVAC',
    location: 'Lekki Phase 1, Lagos',
    schedule: 'Mon, 22 Sep 2026',
    jobStatus: 'COMPLETED',
    referenceCode: 'BKG-REV001',
    createdAt: '2026-09-20T10:00:00.000Z',
    customerId: 'usr-customer-review-01',
    preferredWorker: {
      id: 'usr-brainworker-01',
      name: 'Emeka Okafor',
      avatarUrl: '/images/workers/emeka.jpg',
    },
  };

  const inProgressActivity: CustomerActivityItem = {
    ...completedActivity,
    id: 'act-inprogress-001',
    status: 'in_progress',
    statusLabel: 'In Progress',
    jobStatus: 'IN_PROGRESS',
    referenceCode: 'BKG-INP001',
  };

  const mockRepository = {
    getReviewEligibility: vi.fn(),
    submitReview: vi.fn(),
    getPublicReviews: vi.fn(),
    reportReview: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockUser as any);
    vi.spyOn(reviewRepoModule, 'getCustomerReviewRepository').mockReturnValue(mockRepository as any);
  });

  describe('CRD-001: Render prompt on COMPLETED booking', () => {
    it('displays headline "Rate your experience with {workerName}" and "Leave a review" button', async () => {
      mockRepository.getReviewEligibility.mockResolvedValueOnce({
        eligible: true,
        bookingSummary: {
          bookingId: completedActivity.id,
          referenceCode: completedActivity.referenceCode,
          serviceTitle: completedActivity.title,
          brainWorkerId: completedActivity.preferredWorker!.id,
          brainWorkerName: completedActivity.preferredWorker!.name,
          completedAt: completedActivity.createdAt,
        },
      });

      render(<ReviewPromptCard activity={completedActivity} />);

      await waitFor(() => {
        expect(screen.getByText(/Rate your experience with Emeka Okafor/i)).toBeInTheDocument();
      });

      const leaveReviewBtn = screen.getByRole('button', { name: /leave a review/i });
      expect(leaveReviewBtn).toBeInTheDocument();
      expect(leaveReviewBtn).toBeEnabled();
      expect(screen.getByText(/COMPLETED JOB • FEEDBACK/i)).toBeInTheDocument();
    });
  });

  describe('CRD-002: Decoupled receipt action (Receipt Available)', () => {
    it('renders both "Leave a review" and "View Receipt" buttons when receipt is available', async () => {
      mockRepository.getReviewEligibility.mockResolvedValueOnce({
        eligible: true,
        bookingSummary: {
          bookingId: completedActivity.id,
          referenceCode: completedActivity.referenceCode,
          serviceTitle: completedActivity.title,
          brainWorkerId: completedActivity.preferredWorker!.id,
          brainWorkerName: completedActivity.preferredWorker!.name,
          completedAt: completedActivity.createdAt,
        },
      });

      render(
        <ReviewPromptCard
          activity={completedActivity}
          paymentContext={{ receiptAvailable: true }}
          onViewReceipt={vi.fn()}
        />
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /leave a review/i })).toBeInTheDocument();
      });

      expect(screen.getByRole('button', { name: /view receipt/i })).toBeInTheDocument();
    });
  });

  describe('CRD-003: Decoupled receipt action (Receipt Unavailable)', () => {
    it('renders "Leave a review" but completely omits "View Receipt" button when receipt is unavailable', async () => {
      mockRepository.getReviewEligibility.mockResolvedValueOnce({
        eligible: true,
        bookingSummary: {
          bookingId: completedActivity.id,
          referenceCode: completedActivity.referenceCode,
          serviceTitle: completedActivity.title,
          brainWorkerId: completedActivity.preferredWorker!.id,
          brainWorkerName: completedActivity.preferredWorker!.name,
          completedAt: completedActivity.createdAt,
        },
      });

      render(
        <ReviewPromptCard
          activity={completedActivity}
          paymentContext={{ receiptAvailable: false }}
        />
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /leave a review/i })).toBeInTheDocument();
      });

      expect(screen.queryByRole('button', { name: /view receipt/i })).not.toBeInTheDocument();
    });
  });

  describe('CRD-004: Render already-reviewed summary badge', () => {
    it('displays "REVIEW SUBMITTED" badge and "View on {workerName}\'s profile" link when already reviewed', async () => {
      mockRepository.getReviewEligibility.mockResolvedValueOnce({
        eligible: false,
        reason: 'already_reviewed',
        existingReview: {
          id: 'rev-001',
          reviewerDisplayName: 'Adaeze N.',
          ratings: { punctuality: 5, quality: 5, communication: 5, overall: 5 },
          comment: 'Great service!',
          serviceTitle: completedActivity.title,
          completedDate: 'September 2026',
          isVerifiedBooking: true,
          createdAt: '2026-09-21T10:00:00.000Z',
        },
        bookingSummary: {
          bookingId: completedActivity.id,
          referenceCode: completedActivity.referenceCode,
          serviceTitle: completedActivity.title,
          brainWorkerId: completedActivity.preferredWorker!.id,
          brainWorkerName: completedActivity.preferredWorker!.name,
          completedAt: completedActivity.createdAt,
        },
      });

      render(<ReviewPromptCard activity={completedActivity} />);

      await waitFor(() => {
        expect(screen.getByText(/REVIEW SUBMITTED/i)).toBeInTheDocument();
      });

      expect(screen.getByText(/View on Emeka Okafor's profile/i)).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /leave a review/i })).not.toBeInTheDocument();
    });
  });

  describe('CRD-005: UI offline disabled state', () => {
    it('disables "Leave a review" button with tooltip explainer when isOffline is true', async () => {
      mockRepository.getReviewEligibility.mockResolvedValueOnce({
        eligible: true,
        bookingSummary: {
          bookingId: completedActivity.id,
          referenceCode: completedActivity.referenceCode,
          serviceTitle: completedActivity.title,
          brainWorkerId: completedActivity.preferredWorker!.id,
          brainWorkerName: completedActivity.preferredWorker!.name,
          completedAt: completedActivity.createdAt,
        },
      });

      render(<ReviewPromptCard activity={completedActivity} isOffline={true} />);

      await waitFor(() => {
        const btn = screen.getByRole('button', { name: /leave a review/i });
        expect(btn).toBeDisabled();
      });

      expect(
        screen.getByText(/Review submission requires an active network connection/i)
      ).toBeInTheDocument();
    });
  });

  describe('CRD-006: Trigger submission modal on click', () => {
    it('invokes onOpenReviewModal callback when "Leave a review" is clicked', async () => {
      const handleOpenModal = vi.fn();
      mockRepository.getReviewEligibility.mockResolvedValueOnce({
        eligible: true,
        bookingSummary: {
          bookingId: completedActivity.id,
          referenceCode: completedActivity.referenceCode,
          serviceTitle: completedActivity.title,
          brainWorkerId: completedActivity.preferredWorker!.id,
          brainWorkerName: completedActivity.preferredWorker!.name,
          completedAt: completedActivity.createdAt,
        },
      });

      render(
        <ReviewPromptCard
          activity={completedActivity}
          onOpenReviewModal={handleOpenModal}
        />
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /leave a review/i })).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /leave a review/i }));
      expect(handleOpenModal).toHaveBeenCalledTimes(1);
    });
  });

  describe('CRD-007: Ineligible booking hides review CTA', () => {
    it('completely omits review prompt when jobStatus is IN_PROGRESS', () => {
      render(<ReviewPromptCard activity={inProgressActivity} />);

      expect(screen.queryByText(/Rate your experience/i)).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /leave a review/i })).not.toBeInTheDocument();
      expect(mockRepository.getReviewEligibility).not.toHaveBeenCalled();
    });
  });

  describe('CRD-008: Eligibility evaluation failure fails closed', () => {
    it('safely hides review prompt without crashing UI when eligibility service throws', async () => {
      mockRepository.getReviewEligibility.mockRejectedValueOnce(
        new Error('Network transport failed')
      );

      render(<ReviewPromptCard activity={completedActivity} />);

      await waitFor(() => {
        expect(mockRepository.getReviewEligibility).toHaveBeenCalled();
      });

      expect(screen.queryByText(/Rate your experience/i)).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /leave a review/i })).not.toBeInTheDocument();
    });
  });
});

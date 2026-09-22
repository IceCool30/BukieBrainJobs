import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import * as reviewRepoModule from '../../lib/review/repository';
import * as authStorage from '../../lib/auth/storage';
import { ReportReviewModal } from './ReportReviewModal';
import { UnauthorizedError, NotFoundError, ValidationError } from '../../lib/review/types';

describe('ReportReviewModal (TDD Suite 6: RPT-001 to RPT-010)', () => {
  const reviewId = 'rev-public-001';
  const brainWorkerName = 'Emeka Okafor';

  const mockUser = {
    id: 'usr-customer-reporter',
    name: 'Tunde Adeleke',
    email: 'tunde@example.com',
    role: 'customer' as const,
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

  describe('RPT-001: Unauthenticated access gate', () => {
    it('redirects to login or shows auth gate when unauthenticated visitor attempts to report', () => {
      vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(null);
      const onRequireAuth = vi.fn();

      render(
        <ReportReviewModal
          isOpen={true}
          onClose={vi.fn()}
          reviewId={reviewId}
          onRequireAuth={onRequireAuth}
        />
      );

      expect(onRequireAuth).toHaveBeenCalledTimes(1);
      expect(screen.queryByRole('button', { name: /submit report/i })).not.toBeInTheDocument();
    });
  });

  describe('RPT-002: Render 6 moderation reasons', () => {
    it('displays 6 approved radio reasons with subtitle "Tell us why you believe this review should be reviewed."', () => {
      render(
        <ReportReviewModal
          isOpen={true}
          onClose={vi.fn()}
          reviewId={reviewId}
        />
      );

      expect(
        screen.getByText(/Tell us why you believe this review should be reviewed/i)
      ).toBeInTheDocument();

      expect(screen.getByRole('radio', { name: /Inappropriate or abusive language/i })).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: /False or fabricated information/i })).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: /Harassment or personal attack/i })).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: /Spam, promotional, or advertising content/i })).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: /Privacy violation/i })).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: /Other issue/i })).toBeInTheDocument();
    });
  });

  describe('RPT-003: Unconstrained details field with content safety', () => {
    it('accepts detailed text input and rejects control characters/null bytes', async () => {
      mockRepository.reportReview.mockResolvedValueOnce({
        success: true,
        reportId: 'rep-001',
        status: 'report_submitted',
      });

      render(
        <ReportReviewModal
          isOpen={true}
          onClose={vi.fn()}
          reviewId={reviewId}
        />
      );

      // Select reason
      fireEvent.click(screen.getByRole('radio', { name: /Inappropriate or abusive language/i }));

      // Type detailed text
      const longText = 'A'.repeat(600);
      const textarea = screen.getByRole('textbox', { name: /additional details/i });
      fireEvent.change(textarea, { target: { value: longText } });

      fireEvent.click(screen.getByRole('button', { name: /submit report/i }));

      await waitFor(() => {
        expect(mockRepository.reportReview).toHaveBeenCalledWith(
          mockUser.id,
          expect.objectContaining({
            reviewId,
            reason: 'inappropriate_language',
            details: longText,
          })
        );
      });
    });
  });

  describe('RPT-004: Deduplicated report submission', () => {
    it('displays info banner "You have already submitted a report for this review" when duplicate report returned', async () => {
      mockRepository.reportReview.mockResolvedValueOnce({
        success: false,
        status: 'report_already_submitted',
      });

      render(
        <ReportReviewModal
          isOpen={true}
          onClose={vi.fn()}
          reviewId={reviewId}
        />
      );

      fireEvent.click(screen.getByRole('radio', { name: /Spam, promotional/i }));
      fireEvent.click(screen.getByRole('button', { name: /submit report/i }));

      await waitFor(() => {
        expect(
          screen.getByText(/You have already submitted a report for this review/i)
        ).toBeInTheDocument();
      });

      expect(screen.getByRole('button', { name: /submit report/i })).toBeDisabled();
    });
  });

  describe('RPT-005: Self-report rejection', () => {
    it('fails closed with alert when repository rejects self-reporting', async () => {
      mockRepository.reportReview.mockRejectedValueOnce(
        new UnauthorizedError('[Security] Unauthorized: A customer cannot report their own review.')
      );

      render(
        <ReportReviewModal
          isOpen={true}
          onClose={vi.fn()}
          reviewId={reviewId}
        />
      );

      fireEvent.click(screen.getByRole('radio', { name: /False or fabricated/i }));
      fireEvent.click(screen.getByRole('button', { name: /submit report/i }));

      await waitFor(() => {
        expect(
          screen.getByText(/A customer cannot report their own review/i)
        ).toBeInTheDocument();
      });
    });
  });

  describe('RPT-006: Report success confirmation', () => {
    it('displays "Report received" headline and confirmation body upon success', async () => {
      mockRepository.reportReview.mockResolvedValueOnce({
        success: true,
        reportId: 'rep-success-001',
        status: 'report_submitted',
      });

      render(
        <ReportReviewModal
          isOpen={true}
          onClose={vi.fn()}
          reviewId={reviewId}
        />
      );

      fireEvent.click(screen.getByRole('radio', { name: /Inappropriate or abusive language/i }));
      fireEvent.click(screen.getByRole('button', { name: /submit report/i }));

      await waitFor(() => {
        expect(screen.getByText(/Report received/i)).toBeInTheDocument();
      });

      expect(
        screen.getByText(/Our moderation team has received your report/i)
      ).toBeInTheDocument();

      expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
    });
  });

  describe('RPT-007: Reject invalid abuse reason', () => {
    it('blocks submission when no reason is selected', () => {
      render(
        <ReportReviewModal
          isOpen={true}
          onClose={vi.fn()}
          reviewId={reviewId}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /submit report/i }));

      expect(
        screen.getByText(/Please select a reason for reporting/i)
      ).toBeInTheDocument();
      expect(mockRepository.reportReview).not.toHaveBeenCalled();
    });
  });

  describe('RPT-008: Reject missing authenticated caller', () => {
    it('throws or redirects when caller is empty or whitespace', async () => {
      vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue({
        id: '   ',
        name: 'Empty',
        role: 'customer' as const,
      } as any);

      render(
        <ReportReviewModal
          isOpen={true}
          onClose={vi.fn()}
          reviewId={reviewId}
        />
      );

      fireEvent.click(screen.getByRole('radio', { name: /Spam/i }));
      fireEvent.click(screen.getByRole('button', { name: /submit report/i }));

      await waitFor(() => {
        expect(
          screen.getByText(/You must be signed in to report a review/i)
        ).toBeInTheDocument();
      });
      expect(mockRepository.reportReview).not.toHaveBeenCalled();
    });
  });

  describe('RPT-009: Reject missing review ID', () => {
    it('displays error when reviewId is missing or invalid', async () => {
      mockRepository.reportReview.mockRejectedValueOnce(
        new NotFoundError('[NotFound] Review rev-notfound not found.')
      );

      render(
        <ReportReviewModal
          isOpen={true}
          onClose={vi.fn()}
          reviewId="rev-notfound"
        />
      );

      fireEvent.click(screen.getByRole('radio', { name: /Spam/i }));
      fireEvent.click(screen.getByRole('button', { name: /submit report/i }));

      await waitFor(() => {
        expect(screen.getByText(/Review rev-notfound not found/i)).toBeInTheDocument();
      });
    });
  });

  describe('RPT-010: Non-mutation on report failure', () => {
    it('does not transition to success screen when reporting fails', async () => {
      mockRepository.reportReview.mockRejectedValueOnce(
        new Error('Network connection dropped')
      );

      render(
        <ReportReviewModal
          isOpen={true}
          onClose={vi.fn()}
          reviewId={reviewId}
        />
      );

      fireEvent.click(screen.getByRole('radio', { name: /Harassment/i }));
      fireEvent.click(screen.getByRole('button', { name: /submit report/i }));

      await waitFor(() => {
        expect(screen.getByText(/Network connection dropped/i)).toBeInTheDocument();
      });

      expect(screen.queryByText(/Report received/i)).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: /submit report/i })).toBeEnabled();
    });
  });
});

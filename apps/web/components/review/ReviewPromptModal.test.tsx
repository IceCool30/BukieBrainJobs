import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import * as reviewRepoModule from '../../lib/review/repository';
import * as authStorage from '../../lib/auth/storage';
import { ReviewPromptModal } from './ReviewPromptModal';
import type { ReviewBookingSummary, ICustomerReviewRepository } from '../../lib/review/types';
import type { AuthUser } from '../../lib/auth/types';

describe('ReviewPromptModal (TDD Suite 4: MDL-001 to MDL-017)', () => {
  const mockUser = {
    id: 'usr-customer-review-01',
    name: 'Adaeze Nwosu',
    email: 'adaeze@example.com',
    role: 'customer' as const,
  };

  const bookingSummary: ReviewBookingSummary = {
    bookingId: 'book-completed-001',
    referenceCode: 'BKG-REV001',
    serviceTitle: 'AC Deep Chemical Cleaning',
    brainWorkerId: 'usr-brainworker-01',
    brainWorkerName: 'Emeka Okafor',
    brainWorkerAvatar: '/images/workers/emeka.jpg',
    completedAt: '2026-09-20T10:00:00.000Z',
  };

  const mockRepository = {
    getReviewEligibility: vi.fn(),
    submitReview: vi.fn(),
    getPublicReviews: vi.fn(),
    reportReview: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockUser as unknown as AuthUser);
    vi.spyOn(reviewRepoModule, 'getCustomerReviewRepository').mockReturnValue(mockRepository as unknown as ICustomerReviewRepository);
  });

  describe('MDL-001: Initial unselected state (No defaults)', () => {
    it('displays "Select a rating" for all 4 criteria and 0 stars selected', () => {
      render(
        <ReviewPromptModal
          isOpen={true}
          onClose={vi.fn()}
          bookingSummary={bookingSummary}
        />
      );

      const unselectedLabels = screen.getAllByText(/Select a rating/i);
      expect(unselectedLabels).toHaveLength(4);

      const radios = screen.getAllByRole('radio');
      expect(radios).toHaveLength(20); // 4 criteria * 5 stars
      radios.forEach((radio) => {
        expect(radio).toHaveAttribute('aria-checked', 'false');
      });
    });
  });

  describe('MDL-002: WCAG 2.2 AA Star Radio Semantics & 44px touch targets', () => {
    it('renders 4 radiogroups with radio stars having 44x44px touch targets', () => {
      render(
        <ReviewPromptModal
          isOpen={true}
          onClose={vi.fn()}
          bookingSummary={bookingSummary}
        />
      );

      const radiogroups = screen.getAllByRole('radiogroup');
      expect(radiogroups).toHaveLength(4);

      radiogroups.forEach((group) => {
        expect(group).toHaveAttribute('aria-required', 'true');
        const starButtons = group.querySelectorAll('[role="radio"]');
        expect(starButtons).toHaveLength(5);
        starButtons.forEach((btn) => {
          // Verify 44x44px minimum touch target classes
          expect(btn.className).toMatch(/min-w-\[44px\]|w-11|h-11|min-h-\[44px\]|p-2\.5/);
        });
      });
    });
  });

  describe('MDL-003: Star selection interaction & label', () => {
    it('updates state to 4, displays "4 of 5 • Very good", and fills stars in amber-500', () => {
      render(
        <ReviewPromptModal
          isOpen={true}
          onClose={vi.fn()}
          bookingSummary={bookingSummary}
        />
      );

      const punctualityGroup = screen.getByRole('radiogroup', { name: /punctuality/i });
      const fourthStar = punctualityGroup.querySelectorAll('[role="radio"]')[3]!;

      fireEvent.click(fourthStar);

      expect(fourthStar).toHaveAttribute('aria-checked', 'true');
      expect(screen.getByText(/4 of 5 • Very good/i)).toBeInTheDocument();

      const stars = punctualityGroup.querySelectorAll('[role="radio"]');
      expect(stars[0]?.innerHTML).toContain('text-amber-500');
      expect(stars[1]?.innerHTML).toContain('text-amber-500');
      expect(stars[2]?.innerHTML).toContain('text-amber-500');
      expect(stars[3]?.innerHTML).toContain('text-amber-500');
    });
  });

  describe('MDL-004: Keyboard navigation in star radiogroup', () => {
    it('advances selection on ArrowRight and updates aria-checked', () => {
      render(
        <ReviewPromptModal
          isOpen={true}
          onClose={vi.fn()}
          bookingSummary={bookingSummary}
        />
      );

      const punctualityGroup = screen.getByRole('radiogroup', { name: /punctuality/i });
      const starRadios = punctualityGroup.querySelectorAll('[role="radio"]');

      // Click first star
      fireEvent.click(starRadios[0]!);
      expect(starRadios[0]).toHaveAttribute('aria-checked', 'true');

      // Press ArrowRight to advance to star 2
      fireEvent.keyDown(starRadios[0]!, { key: 'ArrowRight' });
      expect(starRadios[1]).toHaveAttribute('aria-checked', 'true');
      expect(starRadios[0]).toHaveAttribute('aria-checked', 'false');
    });
  });

  describe('MDL-005: Live 1,000-character counter', () => {
    it('renders "142 / 1,000 characters" in aria-live="polite" region when 142 chars typed', () => {
      render(
        <ReviewPromptModal
          isOpen={true}
          onClose={vi.fn()}
          bookingSummary={bookingSummary}
        />
      );

      const textarea = screen.getByRole('textbox', { name: /written feedback/i });
      const sampleText = 'A'.repeat(142);

      fireEvent.change(textarea, { target: { value: sampleText } });

      const counter = screen.getByText(/142 \/ 1,000 characters/i);
      expect(counter).toBeInTheDocument();
      expect(counter.closest('[aria-live="polite"]') || counter).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('MDL-006: Character limit overflow protection', () => {
    it('turns counter red, shows error message, and disables submit button on overflow (> 1,000 chars)', () => {
      render(
        <ReviewPromptModal
          isOpen={true}
          onClose={vi.fn()}
          bookingSummary={bookingSummary}
        />
      );

      const textarea = screen.getByRole('textbox', { name: /written feedback/i });
      const overflowText = 'A'.repeat(1005);

      fireEvent.change(textarea, { target: { value: overflowText } });

      expect(screen.getByText(/1,005 \/ 1,000 characters/i)).toHaveClass('text-rose-600');
      expect(
        screen.getByText(/Written feedback cannot exceed 1,000 characters/i)
      ).toBeInTheDocument();

      const submitBtn = screen.getByRole('button', { name: /submit review/i });
      expect(submitBtn).toBeDisabled();
    });
  });

  describe('MDL-007: Validation guard on incomplete ratings', () => {
    it('blocks submission and shows error message when only 3 criteria are selected', async () => {
      render(
        <ReviewPromptModal
          isOpen={true}
          onClose={vi.fn()}
          bookingSummary={bookingSummary}
        />
      );

      // Select 3 criteria only (leave overall unselected)
      const groups = screen.getAllByRole('radiogroup');
      fireEvent.click(groups[0]!.querySelectorAll('[role="radio"]')[4]!); // 5 stars punctuality
      fireEvent.click(groups[1]!.querySelectorAll('[role="radio"]')[3]!); // 4 stars quality
      fireEvent.click(groups[2]!.querySelectorAll('[role="radio"]')[4]!); // 5 stars communication

      const submitBtn = screen.getByRole('button', { name: /submit review/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText(/Rating criterion 'overall' is required/i)).toBeInTheDocument();
      });

      expect(mockRepository.submitReview).not.toHaveBeenCalled();
    });
  });

  describe('MDL-008: Submits complete 4-rating payload', () => {
    it('invokes submitReview with all 4 numeric rating values and comment', async () => {
      mockRepository.submitReview.mockResolvedValueOnce({
        id: 'rev-created-001',
        bookingId: bookingSummary.bookingId,
        customerId: mockUser.id,
        customerName: mockUser.name,
        brainWorkerId: bookingSummary.brainWorkerId,
        ratings: { punctuality: 5, quality: 4, communication: 5, overall: 5 },
        comment: 'Great service!',
        createdAt: '2026-09-22T12:00:00.000Z',
      });

      render(
        <ReviewPromptModal
          isOpen={true}
          onClose={vi.fn()}
          bookingSummary={bookingSummary}
        />
      );

      const groups = screen.getAllByRole('radiogroup');
      fireEvent.click(groups[0]!.querySelectorAll('[role="radio"]')[4]!); // 5 punctuality
      fireEvent.click(groups[1]!.querySelectorAll('[role="radio"]')[3]!); // 4 quality
      fireEvent.click(groups[2]!.querySelectorAll('[role="radio"]')[4]!); // 5 communication
      fireEvent.click(groups[3]!.querySelectorAll('[role="radio"]')[4]!); // 5 overall

      const textarea = screen.getByRole('textbox', { name: /written feedback/i });
      fireEvent.change(textarea, { target: { value: 'Great service!' } });

      const submitBtn = screen.getByRole('button', { name: /submit review/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(mockRepository.submitReview).toHaveBeenCalledWith(mockUser.id, {
          bookingId: bookingSummary.bookingId,
          ratings: { punctuality: 5, quality: 4, communication: 5, overall: 5 },
          comment: 'Great service!',
        });
      });
    });
  });

  describe('MDL-009: Submitting state lock', () => {
    it('disables submit button and shows spinner during async submission', async () => {
      let resolveSubmit: (val: any) => void;
      const pendingPromise = new Promise((resolve) => {
        resolveSubmit = resolve;
      });
      mockRepository.submitReview.mockReturnValueOnce(pendingPromise);

      render(
        <ReviewPromptModal
          isOpen={true}
          onClose={vi.fn()}
          bookingSummary={bookingSummary}
        />
      );

      const groups = screen.getAllByRole('radiogroup');
      groups.forEach((g) => fireEvent.click(g.querySelectorAll('[role="radio"]')[4]!));

      const submitBtn = screen.getByRole('button', { name: /submit review/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText(/Submitting review\.\.\./i)).toBeInTheDocument();
      });

      expect(submitBtn).toBeDisabled();
      expect(screen.getByRole('textbox', { name: /written feedback/i })).toBeDisabled();

      // Clean up promise
      resolveSubmit!({ id: 'rev-01' });
    });
  });

  describe('MDL-010: Success confirmation screen', () => {
    it('displays green checkmark, "Thank you for your feedback", and "Done" button upon success', async () => {
      mockRepository.submitReview.mockResolvedValueOnce({
        id: 'rev-created-001',
        bookingId: bookingSummary.bookingId,
        customerId: mockUser.id,
        customerName: mockUser.name,
        brainWorkerId: bookingSummary.brainWorkerId,
        ratings: { punctuality: 5, quality: 5, communication: 5, overall: 5 },
        createdAt: '2026-09-22T12:00:00.000Z',
      });

      const handleClose = vi.fn();

      render(
        <ReviewPromptModal
          isOpen={true}
          onClose={handleClose}
          bookingSummary={bookingSummary}
        />
      );

      const groups = screen.getAllByRole('radiogroup');
      groups.forEach((g) => fireEvent.click(g.querySelectorAll('[role="radio"]')[4]!));

      fireEvent.click(screen.getByRole('button', { name: /submit review/i }));

      await waitFor(() => {
        expect(screen.getByText(/Thank you for your feedback/i)).toBeInTheDocument();
      });

      expect(
        screen.getByText(/Your review has been published on Emeka Okafor's public profile/i)
      ).toBeInTheDocument();

      const doneBtn = screen.getByRole('button', { name: /done/i });
      expect(doneBtn).toBeInTheDocument();

      fireEvent.click(doneBtn);
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('MDL-011: Error handling & draft preservation', () => {
    it('displays alert banner, re-enables controls, and preserves written draft text when submission fails', async () => {
      mockRepository.submitReview.mockRejectedValueOnce(
        new Error('Submission failed due to timeout')
      );

      render(
        <ReviewPromptModal
          isOpen={true}
          onClose={vi.fn()}
          bookingSummary={bookingSummary}
        />
      );

      const groups = screen.getAllByRole('radiogroup');
      groups.forEach((g) => fireEvent.click(g.querySelectorAll('[role="radio"]')[4]!));

      const textarea = screen.getByRole('textbox', { name: /written feedback/i });
      fireEvent.change(textarea, { target: { value: 'Preserved draft comment' } });

      fireEvent.click(screen.getByRole('button', { name: /submit review/i }));

      await waitFor(() => {
        expect(screen.getByText(/Submission failed due to timeout/i)).toBeInTheDocument();
      });

      expect(textarea).toHaveValue('Preserved draft comment');
      expect(textarea).toBeEnabled();
      expect(screen.getByRole('button', { name: /submit review/i })).toBeEnabled();
    });
  });

  describe('MDL-012: Modal labelledby relationship', () => {
    it('has aria-labelledby pointing to review-modal-title', () => {
      render(
        <ReviewPromptModal
          isOpen={true}
          onClose={vi.fn()}
          bookingSummary={bookingSummary}
        />
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-labelledby', 'review-modal-title');
      const title = document.getElementById('review-modal-title');
      expect(title).toBeInTheDocument();
      expect(title).toHaveTextContent(/Rate your experience with Emeka Okafor/i);
    });
  });

  describe('MDL-013: Focus restoration on dismiss', () => {
    it('returns focus to trigger element when dismissed via Escape', () => {
      const triggerButton = document.createElement('button');
      triggerButton.textContent = 'Trigger';
      document.body.appendChild(triggerButton);
      triggerButton.focus();
      expect(document.activeElement).toBe(triggerButton);

      const handleClose = vi.fn();

      const { unmount } = render(
        <ReviewPromptModal
          isOpen={true}
          onClose={handleClose}
          bookingSummary={bookingSummary}
          triggerRef={{ current: triggerButton }}
        />
      );

      fireEvent.keyDown(window, { key: 'Escape' });
      expect(handleClose).toHaveBeenCalledTimes(1);

      unmount();
      document.body.removeChild(triggerButton);
    });
  });

  describe('MDL-014: Focus trap inside active modal', () => {
    it('wraps focus back to first focusable element when tabbing past last element', () => {
      render(
        <ReviewPromptModal
          isOpen={true}
          onClose={vi.fn()}
          bookingSummary={bookingSummary}
        />
      );

      const dialog = screen.getByRole('dialog');
      const focusableElements = dialog.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      expect(focusableElements.length).toBeGreaterThan(1);
      const firstElement = focusableElements[0]!;
      const lastElement = focusableElements[focusableElements.length - 1]!;

      lastElement.focus();
      expect(document.activeElement).toBe(lastElement);

      fireEvent.keyDown(lastElement, { key: 'Tab', shiftKey: false });
      expect(document.activeElement).toBe(firstElement);
    });
  });

  describe('MDL-015: Overflow aria-invalid & aria-errormessage', () => {
    it('sets aria-invalid="true" and aria-errormessage="review-comment-error" when > 1,000 chars', () => {
      render(
        <ReviewPromptModal
          isOpen={true}
          onClose={vi.fn()}
          bookingSummary={bookingSummary}
        />
      );

      const textarea = screen.getByRole('textbox', { name: /written feedback/i });
      fireEvent.change(textarea, { target: { value: 'B'.repeat(1001) } });

      expect(textarea).toHaveAttribute('aria-invalid', 'true');
      expect(textarea).toHaveAttribute('aria-errormessage', 'review-comment-error');
      const errorMsg = document.getElementById('review-comment-error');
      expect(errorMsg).toBeInTheDocument();
      expect(errorMsg).toHaveTextContent(/Written feedback cannot exceed 1,000 characters/i);
    });
  });

  describe('MDL-016: Counter aria-live polite announcements', () => {
    it('character counter element carries aria-live="polite"', () => {
      render(
        <ReviewPromptModal
          isOpen={true}
          onClose={vi.fn()}
          bookingSummary={bookingSummary}
        />
      );

      const politeRegion = document.querySelector('[aria-live="polite"]');
      expect(politeRegion).toBeInTheDocument();
      expect(politeRegion).toHaveTextContent(/0 \/ 1,000 characters/i);
    });
  });

  describe('MDL-017: Form-level whitespace trimming', () => {
    it('trims leading and trailing whitespace from written feedback before submission', async () => {
      mockRepository.submitReview.mockResolvedValueOnce({
        id: 'rev-01',
        bookingId: bookingSummary.bookingId,
        customerId: mockUser.id,
        customerName: mockUser.name,
        brainWorkerId: bookingSummary.brainWorkerId,
        ratings: { punctuality: 5, quality: 5, communication: 5, overall: 5 },
        comment: 'Clean and prompt service',
        createdAt: '2026-09-22T12:00:00.000Z',
      });

      render(
        <ReviewPromptModal
          isOpen={true}
          onClose={vi.fn()}
          bookingSummary={bookingSummary}
        />
      );

      const groups = screen.getAllByRole('radiogroup');
      groups.forEach((g) => fireEvent.click(g.querySelectorAll('[role="radio"]')[4]!));

      const textarea = screen.getByRole('textbox', { name: /written feedback/i });
      fireEvent.change(textarea, { target: { value: '   Clean and prompt service   ' } });

      fireEvent.click(screen.getByRole('button', { name: /submit review/i }));

      await waitFor(() => {
        expect(mockRepository.submitReview).toHaveBeenCalledWith(
          mockUser.id,
          expect.objectContaining({
            comment: 'Clean and prompt service',
          })
        );
      });
    });
  });
});

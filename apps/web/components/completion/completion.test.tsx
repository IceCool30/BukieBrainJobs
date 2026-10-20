// apps/web/components/completion/completion.test.tsx
// BW-009: Post-Job Completion & Escrow Release
// Phase 3 RED: UI Component Contracts COMP-001 to COMP-012

import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import {
  AutoReleaseCountdownCard,
  CompletionInspectionSummary,
  DisputeInitiationModal,
  EscrowReleaseActions,
  MutualBlindReviewForm,
} from './index';
import type { MutualReviewRecord } from '../../lib/completion/types';

describe('BW-009 Phase 3 RED: Completion UI Component Contracts (COMP-001 to COMP-012)', () => {
  it('COMP-001: CompletionInspectionSummary renders base quote, adjustments, and total settlement in Naira format', () => {
    render(
      <CompletionInspectionSummary
        baseQuoteKobo={5000000}
        approvedAdjustmentKobo={1000000}
        totalSettlementKobo={6000000}
        jobStatus="PENDING_COMPLETION"
      />
    );

    expect(screen.getByText(/₦50,000/)).toBeInTheDocument();
    expect(screen.getByText(/₦10,000/)).toBeInTheDocument();
    expect(screen.getByText(/₦60,000/)).toBeInTheDocument();
  });

  it('COMP-002: CompletionInspectionSummary displays submitted photo proof gallery and completion summary note', () => {
    render(
      <CompletionInspectionSummary
        baseQuoteKobo={5000000}
        approvedAdjustmentKobo={0}
        totalSettlementKobo={5000000}
        jobStatus="PENDING_COMPLETION"
        photoProofUrls={[
          'https://example.com/proof1.jpg',
          'https://example.com/proof2.jpg',
        ]}
        completionSummaryNote="All electrical sockets repaired and circuit breakers tested"
      />
    );

    expect(
      screen.getByText(/All electrical sockets repaired and circuit breakers tested/)
    ).toBeInTheDocument();
    const images = screen.getAllByRole('img');
    expect(images.length).toBeGreaterThanOrEqual(2);
  });

  it('COMP-003: EscrowReleaseActions enables "Inspect & Release Escrow" when status is PENDING_COMPLETION and escrow is ESCROW_HELD', () => {
    const handleConfirm = vi.fn();
    render(
      <EscrowReleaseActions
        jobStatus="PENDING_COMPLETION"
        escrowStatus="ESCROW_HELD"
        onConfirmSatisfaction={handleConfirm}
      />
    );

    const releaseButton = screen.getByRole('button', {
      name: /inspect & release escrow/i,
    });
    expect(releaseButton).toBeInTheDocument();
    expect(releaseButton).toBeEnabled();
    expect(
      screen.getByRole('button', { name: /raise dispute/i })
    ).toBeInTheDocument();
  });

  it('COMP-004: EscrowReleaseActions disables release button and shows loading state during confirmation submission', () => {
    const handleConfirm = vi.fn();
    render(
      <EscrowReleaseActions
        jobStatus="PENDING_COMPLETION"
        escrowStatus="ESCROW_HELD"
        onConfirmSatisfaction={handleConfirm}
        isSubmitting={true}
      />
    );

    const releaseButton = screen.getByRole('button', {
      name: /releasing|inspect & release escrow/i,
    });
    expect(releaseButton).toBeDisabled();
  });

  it('COMP-005: EscrowReleaseActions calls onConfirmSatisfaction when release button is clicked', () => {
    const handleConfirm = vi.fn();
    render(
      <EscrowReleaseActions
        jobStatus="PENDING_COMPLETION"
        escrowStatus="ESCROW_HELD"
        onConfirmSatisfaction={handleConfirm}
      />
    );

    const releaseButton = screen.getByRole('button', {
      name: /inspect & release escrow/i,
    });
    fireEvent.click(releaseButton);
    expect(handleConfirm).toHaveBeenCalledTimes(1);
  });

  it('COMP-006: AutoReleaseCountdownCard displays remaining time when under 72 hours', () => {
    render(
      <AutoReleaseCountdownCard
        submittedAt="2026-10-18T10:00:00.000Z"
        autoReleaseDeadline="2026-10-21T10:00:00.000Z"
        now="2026-10-19T10:00:00.000Z"
        escrowStatus="ESCROW_HELD"
      />
    );

    expect(
      screen.getByText(/48h remaining|48 hours remaining/i)
    ).toBeInTheDocument();
  });

  it('COMP-007: AutoReleaseCountdownCard displays auto-release eligible badge when 72 hours have elapsed', () => {
    render(
      <AutoReleaseCountdownCard
        submittedAt="2026-10-18T10:00:00.000Z"
        autoReleaseDeadline="2026-10-21T10:00:00.000Z"
        now="2026-10-21T11:00:00.000Z"
        escrowStatus="ESCROW_HELD"
      />
    );

    expect(
      screen.getByText(/auto-release eligible|eligible for release/i)
    ).toBeInTheDocument();
  });

  it('COMP-008: AutoReleaseCountdownCard displays dispute frozen alert when isDisputed: true', () => {
    render(
      <AutoReleaseCountdownCard
        submittedAt="2026-10-18T10:00:00.000Z"
        autoReleaseDeadline="2026-10-21T10:00:00.000Z"
        isDisputed={true}
        escrowStatus="DISPUTED"
      />
    );

    expect(
      screen.getByText(/dispute active|escrow frozen|auto-release suspended/i)
    ).toBeInTheDocument();
  });

  it('COMP-009: DisputeInitiationModal renders reason selection, description text area, and requires non-empty inputs before submitting', () => {
    const handleClose = vi.fn();
    const handleSubmit = vi.fn();
    render(
      <DisputeInitiationModal
        isOpen={true}
        onClose={handleClose}
        onSubmitDispute={handleSubmit}
      />
    );

    expect(
      screen.getByRole('heading', { name: /raise dispute|raise a dispute/i })
    ).toBeInTheDocument();
    const reasonSelect = screen.getByRole('combobox', {
      name: /dispute reason|reason/i,
    });
    const detailsInput = screen.getByRole('textbox', {
      name: /dispute details|description/i,
    });
    const submitButton = screen.getByRole('button', {
      name: /submit dispute|freeze escrow/i,
    });

    expect(submitButton).toBeDisabled();

    fireEvent.change(reasonSelect, { target: { value: 'INCOMPLETE_WORK' } });
    fireEvent.change(detailsInput, {
      target: { value: 'Work was left unfinished' },
    });
    expect(submitButton).toBeEnabled();

    fireEvent.click(submitButton);
    expect(handleSubmit).toHaveBeenCalledWith(
      'INCOMPLETE_WORK',
      'Work was left unfinished'
    );
  });

  it('COMP-010: MutualBlindReviewForm renders star selectors across punctuality, quality, communication, and overall criteria', () => {
    const handleSubmit = vi.fn();
    render(
      <MutualBlindReviewForm
        role="customer"
        reviewStatus="AWAITING_BOTH"
        currentUserSubmitted={false}
        onSubmitReview={handleSubmit}
      />
    );

    expect(screen.getByText(/punctuality/i)).toBeInTheDocument();
    expect(screen.getByText(/quality/i)).toBeInTheDocument();
    expect(screen.getByText(/communication/i)).toBeInTheDocument();
    expect(screen.getByText(/overall/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /submit review/i })
    ).toBeInTheDocument();
  });

  it('COMP-011: MutualBlindReviewForm displays masked "Waiting for counterparty" state when only current user has submitted', () => {
    const handleSubmit = vi.fn();
    render(
      <MutualBlindReviewForm
        role="customer"
        reviewStatus="AWAITING_WORKER"
        currentUserSubmitted={true}
        onSubmitReview={handleSubmit}
      />
    );

    expect(
      screen.getByText(
        /waiting for counterparty|ratings hidden until both parties review/i
      )
    ).toBeInTheDocument();
  });

  it('COMP-012: MutualBlindReviewForm renders unmasked mutual review cards when status is MUTUAL_REVEALED', () => {
    const handleSubmit = vi.fn();
    const customerReview: MutualReviewRecord = {
      reviewId: 'rev-c-1',
      bookingId: 'bk-101',
      reviewerId: 'cust-101',
      reviewerRole: 'customer',
      ratings: {
        punctuality: 5,
        quality: 5,
        communication: 5,
        overall: 5,
        comment: 'Outstanding artisan performance',
      },
      submittedAt: '2026-10-18T11:00:00.000Z',
    };
    const workerReview: MutualReviewRecord = {
      reviewId: 'rev-w-1',
      bookingId: 'bk-101',
      reviewerId: 'work-202',
      reviewerRole: 'brainworker',
      ratings: {
        punctuality: 5,
        quality: 5,
        communication: 5,
        overall: 5,
        comment: 'Very polite and cooperative customer',
      },
      submittedAt: '2026-10-18T11:30:00.000Z',
    };

    render(
      <MutualBlindReviewForm
        role="customer"
        reviewStatus="MUTUAL_REVEALED"
        currentUserSubmitted={true}
        customerReview={customerReview}
        workerReview={workerReview}
        onSubmitReview={handleSubmit}
      />
    );

    expect(
      screen.getByText(/Outstanding artisan performance/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Very polite and cooperative customer/)
    ).toBeInTheDocument();
  });
});

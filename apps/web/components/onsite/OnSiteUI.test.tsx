// apps/web/components/onsite/OnSiteUI.test.tsx
// BW-008: On-Site Work & In-Progress Verification
// Phase 3 RED: UI Component Contracts COMP-001 to COMP-012

import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import {
  CheckInPanel,
  ScopeAdjustmentModal,
  CustomerScopeReviewCard,
  CompletionSubmissionForm,
  OnSiteStatusBanner,
} from './index';
import type { ScopeAdjustmentRequest } from '../../lib/onsite/types';

describe('BW-008 Phase 3 RED: On-Site UI Component Contracts', () => {
  it('COMP-001: CheckInPanel renders check-in trigger button when booking is CONFIRMED and escrow is ESCROW_HELD', () => {
    const handleCheckIn = vi.fn();
    render(
      <CheckInPanel
        jobStatus="CONFIRMED"
        escrowStatus="ESCROW_HELD"
        onCheckIn={handleCheckIn}
      />
    );

    const button = screen.getByRole('button', { name: /check in/i });
    expect(button).toBeInTheDocument();
    expect(button).toBeEnabled();
  });

  it('COMP-002: CheckInPanel disables check-in and renders warning banner when escrow is unfunded', () => {
    const handleCheckIn = vi.fn();
    render(
      <CheckInPanel
        jobStatus="CONFIRMED"
        escrowStatus="UNFUNDED"
        onCheckIn={handleCheckIn}
      />
    );

    const button = screen.getByRole('button', { name: /check in/i });
    expect(button).toBeDisabled();
    expect(
      screen.getByText(/escrow must be funded|unfunded/i)
    ).toBeInTheDocument();
  });

  it('COMP-003: CheckInPanel collects optional landmark notes when GPS accuracy is coarse or unavailable', () => {
    const handleCheckIn = vi.fn();
    render(
      <CheckInPanel
        jobStatus="CONFIRMED"
        escrowStatus="ESCROW_HELD"
        onCheckIn={handleCheckIn}
      />
    );

    const landmarkInput = screen.getByRole('textbox', {
      name: /landmark confirmation/i,
    });
    expect(landmarkInput).toBeInTheDocument();

    fireEvent.change(landmarkInput, {
      target: { value: 'Beside Mega Chicken, Lekki Ikate' },
    });
    expect(landmarkInput).toHaveValue('Beside Mega Chicken, Lekki Ikate');
  });

  it('COMP-004: ScopeAdjustmentModal renders category picker and kobo inputs', () => {
    const handleClose = vi.fn();
    const handleSubmit = vi.fn();
    render(
      <ScopeAdjustmentModal
        isOpen={true}
        onClose={handleClose}
        onSubmit={handleSubmit}
      />
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(
      screen.getByRole('combobox', { name: /reason category/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('spinbutton', { name: /additional labor/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('spinbutton', { name: /additional materials/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('textbox', { name: /work description/i })
    ).toBeInTheDocument();
  });

  it('COMP-005: ScopeAdjustmentModal derives total live as technician types labor and material costs', () => {
    const handleClose = vi.fn();
    const handleSubmit = vi.fn();
    render(
      <ScopeAdjustmentModal
        isOpen={true}
        onClose={handleClose}
        onSubmit={handleSubmit}
      />
    );

    const laborInput = screen.getByRole('spinbutton', {
      name: /additional labor/i,
    });
    const materialsInput = screen.getByRole('spinbutton', {
      name: /additional materials/i,
    });

    fireEvent.change(laborInput, { target: { value: '1000000' } });
    fireEvent.change(materialsInput, { target: { value: '1500000' } });

    expect(screen.getByTestId('derived-total-adjustment')).toHaveTextContent(
      /2,500,000|25,000/
    );
  });

  it('COMP-006: CustomerScopeReviewCard renders itemized breakdown and highlights difference between base quote and requested total', () => {
    const mockAdjustment: ScopeAdjustmentRequest = {
      id: 'adj_001',
      bookingId: 'bk_001',
      category: 'ADDITIONAL_PARTS',
      description: 'Replaced burst copper pressure pipe',
      additionalLaborKobo: 500000,
      additionalMaterialsKobo: 2000000,
      totalAdditionalKobo: 2500000,
      status: 'PENDING',
      requestedAt: '2026-10-18T10:35:00.000Z',
    };

    render(
      <CustomerScopeReviewCard
        adjustment={mockAdjustment}
        baseQuoteKobo={5000000}
        onApprove={vi.fn()}
        onDecline={vi.fn()}
      />
    );

    expect(
      screen.getByText(/Replaced burst copper pressure pipe/i)
    ).toBeInTheDocument();
    expect(screen.getByTestId('base-quote-amount')).toBeInTheDocument();
    expect(screen.getByTestId('additional-amount')).toBeInTheDocument();
    expect(screen.getByTestId('new-total-amount')).toBeInTheDocument();
  });

  it('COMP-007: CustomerScopeReviewCard triggers approve callback when customer confirms additional charges', () => {
    const mockAdjustment: ScopeAdjustmentRequest = {
      id: 'adj_001',
      bookingId: 'bk_001',
      category: 'ADDITIONAL_PARTS',
      description: 'Replaced burst copper pressure pipe',
      additionalLaborKobo: 500000,
      additionalMaterialsKobo: 2000000,
      totalAdditionalKobo: 2500000,
      status: 'PENDING',
      requestedAt: '2026-10-18T10:35:00.000Z',
    };
    const onApprove = vi.fn();

    render(
      <CustomerScopeReviewCard
        adjustment={mockAdjustment}
        baseQuoteKobo={5000000}
        onApprove={onApprove}
        onDecline={vi.fn()}
      />
    );

    const approveButton = screen.getByRole('button', {
      name: /approve adjustment/i,
    });
    fireEvent.click(approveButton);
    expect(onApprove).toHaveBeenCalledTimes(1);
  });

  it('COMP-008: CustomerScopeReviewCard opens reason prompt and triggers decline callback when customer rejects adjustment', () => {
    const mockAdjustment: ScopeAdjustmentRequest = {
      id: 'adj_001',
      bookingId: 'bk_001',
      category: 'ADDITIONAL_PARTS',
      description: 'Replaced burst copper pressure pipe',
      additionalLaborKobo: 500000,
      additionalMaterialsKobo: 2000000,
      totalAdditionalKobo: 2500000,
      status: 'PENDING',
      requestedAt: '2026-10-18T10:35:00.000Z',
    };
    const onDecline = vi.fn();

    render(
      <CustomerScopeReviewCard
        adjustment={mockAdjustment}
        baseQuoteKobo={5000000}
        onApprove={vi.fn()}
        onDecline={onDecline}
      />
    );

    const declineButton = screen.getByRole('button', {
      name: /decline adjustment/i,
    });
    fireEvent.click(declineButton);
    expect(onDecline).toHaveBeenCalled();
  });

  it('COMP-009: CompletionSubmissionForm validates at least one photo proof URL before enabling submit button', () => {
    const onSubmit = vi.fn();
    render(
      <CompletionSubmissionForm
        bookingId="bk_001"
        onSubmitCompletion={onSubmit}
      />
    );

    const submitButton = screen.getByRole('button', {
      name: /submit work completion/i,
    });
    expect(submitButton).toBeDisabled();

    const photoInput = screen.getByRole('textbox', {
      name: /photo proof url/i,
    });
    const addPhotoButton = screen.getByRole('button', { name: /add photo/i });
    const noteInput = screen.getByRole('textbox', {
      name: /completion summary note/i,
    });

    fireEvent.change(photoInput, {
      target: { value: 'https://cdn.bukiebrainjobs.com/proof/1.jpg' },
    });
    fireEvent.click(addPhotoButton);

    fireEvent.change(noteInput, {
      target: { value: 'Generator fully serviced and tested' },
    });

    expect(submitButton).toBeEnabled();
  });

  it('COMP-010: CompletionSubmissionForm disables submission and warns if an unresolved scope adjustment is pending', () => {
    render(
      <CompletionSubmissionForm
        bookingId="bk_001"
        hasPendingScopeAdjustment={true}
        onSubmitCompletion={vi.fn()}
      />
    );

    const submitButton = screen.getByRole('button', {
      name: /submit work completion/i,
    });
    expect(submitButton).toBeDisabled();
    expect(
      screen.getByText(/pending scope adjustment must be resolved/i)
    ).toBeInTheDocument();
  });

  it('COMP-011: OnSiteStatusBanner renders technician arrival timestamp and on-site duration badge', () => {
    render(
      <OnSiteStatusBanner
        jobStatus="IN_PROGRESS"
        escrowStatus="ESCROW_HELD"
        checkedInAt="2026-10-18T10:30:00.000Z"
      />
    );

    expect(screen.getByText(/in progress/i)).toBeInTheDocument();
    expect(screen.getByText(/arrived at/i)).toBeInTheDocument();
  });

  it('COMP-012: Trades Design System compliance: dark mode tokens, 44px touch targets, and ARIA labels', () => {
    render(
      <CheckInPanel
        jobStatus="CONFIRMED"
        escrowStatus="ESCROW_HELD"
        onCheckIn={vi.fn()}
      />
    );

    const checkInButton = screen.getByRole('button', { name: /check in/i });
    expect(checkInButton.className).toMatch(/min-h-\[44px\]|h-11|h-12|py-3/);
    expect(checkInButton).toHaveAttribute('aria-label');
  });
});

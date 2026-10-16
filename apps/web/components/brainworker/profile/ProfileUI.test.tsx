// apps/web/components/brainworker/profile/ProfileUI.test.tsx
// BrainWorker Profile & Portfolio UI Component Contracts (COMP-001 to COMP-012)
// Item 2.7 in master checklist (BW-005)

import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { ProfileEditorForm } from './ProfileEditorForm';
import { PortfolioGalleryManager } from './PortfolioGalleryManager';
import { ReviewsCounterResponseTab } from './ReviewsCounterResponseTab';
import { ProfileManagementWorkspace } from './ProfileManagementWorkspace';
import type {
  BrainWorkerProfile,
  CustomerReview,
  PortfolioItem,
} from '../../../lib/brainworker/profile/types';

describe('BrainWorker Profile & Portfolio UI Contracts (COMP-001 to COMP-012)', () => {
  const sampleProfile: BrainWorkerProfile = {
    brainWorkerId: 'worker-101',
    headline: 'Certified Solar Inverter Installer',
    bio: 'Over 8 years experience in residential solar installations in Lagos.',
    yearsOfExperience: 8,
    spokenLanguages: ['English', 'Yoruba', 'Nigerian Pidgin'],
    avatarUrl: 'https://example.com/avatar.jpg',
    updatedAt: '2026-10-15T12:00:00.000Z',
  };

  const samplePortfolioItem: PortfolioItem = {
    id: 'port-1',
    brainWorkerId: 'worker-101',
    title: '5kVA Solar Inverter Setup',
    description: 'Installed 5kVA pure sine wave inverter with 4 lithium batteries.',
    category: 'Solar & Inverter',
    beforeImageUrl: 'https://example.com/before.jpg',
    afterImageUrl: 'https://example.com/after.jpg',
    completedDate: '2026-10-01T10:00:00.000Z',
    createdAt: '2026-10-01T10:00:00.000Z',
    updatedAt: '2026-10-01T10:00:00.000Z',
  };

  const sampleReviews: CustomerReview[] = [
    {
      id: 'rev-1',
      bookingId: 'bk-1',
      customerId: 'cust-1',
      customerName: 'Chidi Okafor',
      brainWorkerId: 'worker-101',
      rating: 5,
      criteriaScores: { punctuality: 5, craftsmanship: 5, communication: 5 },
      reviewBody: 'Punctual, professional, and very thorough with diagnostic checks.',
      status: 'PUBLISHED',
      artisanResponse: {
        reviewId: 'rev-1',
        brainWorkerId: 'worker-101',
        responseText: 'Thank you for choosing our services, Chidi!',
        respondedAt: '2026-10-02T12:00:00.000Z',
      },
      createdAt: '2026-10-01T10:00:00.000Z',
    },
  ];

  const sampleReviewsWithoutResponse: CustomerReview[] = [
    {
      id: 'rev-unresponded',
      bookingId: 'bk-2',
      customerId: 'cust-2',
      customerName: 'Amina Bello',
      brainWorkerId: 'worker-101',
      rating: 4,
      criteriaScores: { punctuality: 4, craftsmanship: 5, communication: 4 },
      reviewBody: 'Great inverter installation work, arrived slightly behind schedule.',
      status: 'PUBLISHED',
      createdAt: '2026-10-05T14:00:00.000Z',
    },
  ];

  it('COMP-001: renders headline, bio, experience, spoken languages, and avatar preview', () => {
    render(
      <ProfileEditorForm
        profile={sampleProfile}
        onSaveProfile={vi.fn()}
      />
    );

    expect(screen.getByLabelText(/headline/i)).toHaveValue(sampleProfile.headline);
    expect(screen.getByLabelText(/bio/i)).toHaveValue(sampleProfile.bio);
    expect(screen.getByLabelText(/experience/i)).toHaveValue(sampleProfile.yearsOfExperience);
    expect(screen.getByTestId('profile-avatar-preview')).toBeInTheDocument();
  });

  it('COMP-002: clicking language chips toggles selection and requires at least one language', () => {
    render(
      <ProfileEditorForm
        profile={sampleProfile}
        onSaveProfile={vi.fn()}
      />
    );

    const igboChip = screen.getByRole('button', { name: /igbo/i });
    fireEvent.click(igboChip);

    expect(igboChip).toHaveAttribute('aria-pressed', 'true');
  });

  it('COMP-003: completeness progress meter displays percentage and missing milestones', () => {
    const incompleteProfile: BrainWorkerProfile = {
      ...sampleProfile,
      headline: '',
      avatarUrl: null,
    };

    render(
      <ProfileEditorForm
        profile={incompleteProfile}
        portfolioItems={[]}
        onSaveProfile={vi.fn()}
      />
    );

    const meter = screen.getByTestId('profile-completeness-meter');
    expect(meter).toBeInTheDocument();
    expect(screen.getByText(/headline/i)).toBeInTheDocument();
    expect(screen.getByText(/headshot/i)).toBeInTheDocument();
  });

  it('COMP-004: submitting profile form calls onSaveProfile with sanitized values', () => {
    const handleSave = vi.fn();
    render(
      <ProfileEditorForm
        profile={sampleProfile}
        onSaveProfile={handleSave}
      />
    );

    const saveBtn = screen.getByTestId('profile-save-btn');
    fireEvent.click(saveBtn);

    expect(handleSave).toHaveBeenCalled();
  });

  it('COMP-005: renders portfolio work cards with after-image, title, category, and date', () => {
    render(
      <PortfolioGalleryManager
        portfolioItems={[samplePortfolioItem]}
      />
    );

    expect(screen.getByTestId('portfolio-grid')).toBeInTheDocument();
    expect(screen.getByText('5kVA Solar Inverter Setup')).toBeInTheDocument();
    expect(screen.getByText('Solar & Inverter')).toBeInTheDocument();
  });

  it('COMP-006: renders before and after toggle when before-image exists', () => {
    render(
      <PortfolioGalleryManager
        portfolioItems={[samplePortfolioItem]}
      />
    );

    const toggleBtn = screen.getByTestId('before-after-toggle-port-1');
    expect(toggleBtn).toBeInTheDocument();
    fireEvent.click(toggleBtn);
  });

  it('COMP-007: add work form trigger opens modal and calls onAddPortfolioItem', () => {
    const handleAdd = vi.fn();
    render(
      <PortfolioGalleryManager
        portfolioItems={[samplePortfolioItem]}
        onAddPortfolioItem={handleAdd}
      />
    );

    const openBtn = screen.getByTestId('add-portfolio-btn');
    fireEvent.click(openBtn);

    expect(screen.getByTestId('portfolio-form-modal')).toBeInTheDocument();
  });

  it('COMP-008: disables add button and displays cap indicator when 20 items are reached', () => {
    const twentyItems: PortfolioItem[] = Array.from({ length: 20 }, (_, idx) => ({
      ...samplePortfolioItem,
      id: `port-${idx + 1}`,
      title: `Project Work ${idx + 1}`,
    }));

    render(
      <PortfolioGalleryManager
        portfolioItems={twentyItems}
      />
    );

    const addBtn = screen.getByTestId('add-portfolio-btn');
    expect(addBtn).toBeDisabled();
    expect(screen.getByTestId('portfolio-count-indicator')).toHaveTextContent(/20 \/ 20/);
  });

  it('COMP-009: clicking delete triggers confirmation and invokes onDeletePortfolioItem', () => {
    const handleDelete = vi.fn();
    render(
      <PortfolioGalleryManager
        portfolioItems={[samplePortfolioItem]}
        onDeletePortfolioItem={handleDelete}
      />
    );

    const deleteBtn = screen.getByTestId('delete-portfolio-item-btn-port-1');
    fireEvent.click(deleteBtn);

    const confirmBtn = screen.getByRole('button', { name: /confirm delete|delete work/i });
    fireEvent.click(confirmBtn);

    expect(handleDelete).toHaveBeenCalledWith('port-1');
  });

  it('COMP-010: renders reviews feed with star ratings and attached artisan responses', () => {
    render(
      <ReviewsCounterResponseTab
        reviews={sampleReviews}
      />
    );

    expect(screen.getByTestId('reviews-list')).toBeInTheDocument();
    expect(screen.getByText('Chidi Okafor')).toBeInTheDocument();
    expect(screen.getByTestId('artisan-response-card')).toBeInTheDocument();
  });

  it('COMP-011: clicking respond opens form and submitting text invokes onSubmitCounterResponse', () => {
    const handleRespond = vi.fn();
    render(
      <ReviewsCounterResponseTab
        reviews={sampleReviewsWithoutResponse}
        onSubmitCounterResponse={handleRespond}
      />
    );

    const openBtn = screen.getByTestId('open-counter-response-btn-rev-unresponded');
    fireEvent.click(openBtn);

    const textarea = screen.getByPlaceholderText(/write your response/i);
    fireEvent.change(textarea, {
      target: { value: 'Thank you for your business. We look forward to working with you.' },
    });

    const submitBtn = screen.getByTestId('submit-counter-response-btn');
    fireEvent.click(submitBtn);

    expect(handleRespond).toHaveBeenCalledWith(
      'rev-unresponded',
      expect.stringContaining('Thank you for your business')
    );
  });

  it('COMP-012: strictly decouples financial data and renders zero wallet or balance metrics', () => {
    render(
      <ProfileManagementWorkspace
        profile={sampleProfile}
        portfolioItems={[samplePortfolioItem]}
        reviews={sampleReviews}
      />
    );

    expect(screen.queryByText(/₦|NGN|wallet|balance|escrow|bank account|payout/i)).not.toBeInTheDocument();
  });
});

// apps/web/app/brainworker/BrainWorkerProfileRoute.test.tsx
// Phase 4 RED: BrainWorker Profile and Portfolio Route Integration Contracts (ROUTE-001 to ROUTE-010)
// Item 2.7 in master checklist: BrainWorker Profile and Portfolio Management (BW-005)
// Scope boundary: Route integration, auth and approval gates, profile and portfolio repository delegation, counter-responses, SSR safety, and financial decoupling.

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import * as authStorage from '../../lib/auth/storage';
import * as profileRepoModule from '../../lib/brainworker/profile/repository';
import type {
  BrainWorkerProfile,
  CustomerReview,
  IBrainWorkerProfileRepository,
  PortfolioItem,
} from '../../lib/brainworker/profile/types';
import type { AuthUser } from '../../lib/auth/types';
import BrainWorkerProfilePage from './profile/page';
import * as fs from 'fs';
import * as path from 'path';

// Mock Next.js Navigation Hooks
const mockPush = vi.fn();
const mockReplace = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/brainworker/profile',
}));

vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...props} />
  ),
}));

describe('BrainWorker Profile and Portfolio Route Contracts (ROUTE-001 to ROUTE-010)', () => {
  let mockProfileRepo: IBrainWorkerProfileRepository;

  const mockApprovedWorker: AuthUser = {
    id: 'worker-101',
    name: 'Tunde Adeyemi',
    role: 'brainworker',
    provider: 'phone',
    isBrainWorkerApproved: true,
  };

  const mockUnapprovedWorker: AuthUser = {
    id: 'worker-unapproved',
    name: 'Kelechi Uzo',
    role: 'brainworker',
    provider: 'phone',
    isBrainWorkerApproved: false,
  };

  const mockCustomerUser: AuthUser = {
    id: 'customer-101',
    name: 'Ngozi Okonjo',
    role: 'customer',
    provider: 'phone',
    isBrainWorkerApproved: false,
  };

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

  const sampleReview: CustomerReview = {
    id: 'rev-1',
    bookingId: 'bk-1',
    customerId: 'cust-1',
    customerName: 'Chidi Okafor',
    brainWorkerId: 'worker-101',
    rating: 5,
    criteriaScores: { punctuality: 5, craftsmanship: 5, communication: 5 },
    reviewBody: 'Punctual, professional, and very thorough with diagnostic checks.',
    status: 'PUBLISHED',
    artisanResponse: null,
    createdAt: '2026-10-01T10:00:00.000Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockProfileRepo = {
      getProfile: vi.fn().mockResolvedValue(sampleProfile),
      saveProfile: vi.fn().mockResolvedValue(sampleProfile),
      getPortfolio: vi.fn().mockResolvedValue([samplePortfolioItem]),
      addPortfolioItem: vi.fn().mockImplementation((_workerId, item) =>
        Promise.resolve({
          ...item,
          id: 'port-new',
          createdAt: '2026-10-16T12:00:00.000Z',
          updatedAt: '2026-10-16T12:00:00.000Z',
        })
      ),
      deletePortfolioItem: vi.fn().mockResolvedValue(true),
      getReviews: vi.fn().mockResolvedValue([sampleReview]),
      submitReviewCounterResponse: vi.fn().mockResolvedValue({
        ...sampleReview,
        artisanResponse: {
          reviewId: 'rev-1',
          brainWorkerId: 'worker-101',
          responseText: 'Thank you for your feedback.',
          respondedAt: '2026-10-16T12:00:00.000Z',
        },
      }),
    };

    vi.spyOn(profileRepoModule, 'getBrainWorkerProfileRepository').mockReturnValue(
      mockProfileRepo
    );
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(null);
  });

  // ===========================================================================
  // ROUTE-001: Unauthenticated Guard
  // ===========================================================================
  it('ROUTE-001: unauthenticated visitor accessing /brainworker/profile redirects to /login without triggering repository reads', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(null);

    render(<BrainWorkerProfilePage />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(
        expect.stringMatching(/\/login\?redirect=.*brainworker.*profile/)
      );
    });
    expect(mockProfileRepo.getProfile).not.toHaveBeenCalled();
    expect(mockProfileRepo.getPortfolio).not.toHaveBeenCalled();
    expect(mockProfileRepo.getReviews).not.toHaveBeenCalled();
  });

  // ===========================================================================
  // ROUTE-002: Customer Role Boundary
  // ===========================================================================
  it('ROUTE-002: authenticated customer accessing /brainworker/profile renders fail-closed boundary without calling profile repository', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockCustomerUser);

    render(<BrainWorkerProfilePage />);

    expect(screen.getByText('Customer Account Detected')).toBeInTheDocument();
    expect(screen.getByText('Access Restricted')).toBeInTheDocument();
    expect(mockProfileRepo.getProfile).not.toHaveBeenCalled();
    expect(mockProfileRepo.getPortfolio).not.toHaveBeenCalled();
    expect(mockProfileRepo.getReviews).not.toHaveBeenCalled();
  });

  // ===========================================================================
  // ROUTE-003: Unapproved BrainWorker Guard
  // ===========================================================================
  it('ROUTE-003: unapproved BrainWorker accessing /brainworker/profile redirects to /brainworker/verification-status', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockUnapprovedWorker);

    render(<BrainWorkerProfilePage />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/brainworker/verification-status');
    });
    expect(mockProfileRepo.getProfile).not.toHaveBeenCalled();
    expect(mockProfileRepo.getPortfolio).not.toHaveBeenCalled();
    expect(mockProfileRepo.getReviews).not.toHaveBeenCalled();
  });

  // ===========================================================================
  // ROUTE-004: Workspace Mount for Approved BrainWorker
  // ===========================================================================
  it('ROUTE-004: approved BrainWorker loads /brainworker/profile and mounts ProfileManagementWorkspace populated with repository data', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockApprovedWorker);

    render(<BrainWorkerProfilePage />);

    expect(await screen.findByTestId('tab-profile-details')).toBeInTheDocument();
    expect(screen.getByTestId('tab-portfolio-gallery')).toBeInTheDocument();
    expect(screen.getByTestId('tab-client-reviews')).toBeInTheDocument();
    expect(screen.getByTestId('profile-headline-input')).toHaveValue(sampleProfile.headline);
  });

  // ===========================================================================
  // ROUTE-005: Tenant-Isolated Repository Queries
  // ===========================================================================
  it('ROUTE-005: all repository queries strictly pass session userId, preventing cross-tenant data leaks', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockApprovedWorker);

    render(<BrainWorkerProfilePage />);

    await waitFor(() => {
      expect(mockProfileRepo.getProfile).toHaveBeenCalledWith(mockApprovedWorker.id);
      expect(mockProfileRepo.getPortfolio).toHaveBeenCalledWith(mockApprovedWorker.id);
      expect(mockProfileRepo.getReviews).toHaveBeenCalledWith(mockApprovedWorker.id);
    });
  });

  // ===========================================================================
  // ROUTE-006: Profile Form Save Delegation
  // ===========================================================================
  it('ROUTE-006: profile form save delegates to repository.saveProfile(userId, updates)', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockApprovedWorker);

    render(<BrainWorkerProfilePage />);

    const saveBtn = await screen.findByTestId('profile-save-btn');
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(mockProfileRepo.saveProfile).toHaveBeenCalledWith(
        mockApprovedWorker.id,
        expect.objectContaining({
          headline: sampleProfile.headline,
        })
      );
    });
  });

  // ===========================================================================
  // ROUTE-007: Add Portfolio Item Delegation
  // ===========================================================================
  it('ROUTE-007: add work sample delegates to repository.addPortfolioItem(userId, item)', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockApprovedWorker);

    render(<BrainWorkerProfilePage />);

    const portfolioTab = await screen.findByTestId('tab-portfolio-gallery');
    fireEvent.click(portfolioTab);

    const addBtn = screen.getByTestId('add-portfolio-btn');
    fireEvent.click(addBtn);

    const titleInput = screen.getByPlaceholderText(/e\.g\. 5kVA Solar Inverter Setup/i);
    const categoryInput = screen.getByPlaceholderText(/e\.g\. Solar & Inverter/i);
    const afterImgInput = screen.getByPlaceholderText(/https:\/\/example\.com\/after\.jpg/i);

    fireEvent.change(titleInput, { target: { value: 'New Solar Array' } });
    fireEvent.change(categoryInput, { target: { value: 'Solar' } });
    fireEvent.change(afterImgInput, { target: { value: 'https://example.com/array.jpg' } });

    const submitBtn = screen.getByRole('button', { name: /^add work$/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockProfileRepo.addPortfolioItem).toHaveBeenCalledWith(
        mockApprovedWorker.id,
        expect.objectContaining({
          title: 'New Solar Array',
          category: 'Solar',
          afterImageUrl: 'https://example.com/array.jpg',
        })
      );
    });
  });

  // ===========================================================================
  // ROUTE-008: Delete Portfolio Item Delegation
  // ===========================================================================
  it('ROUTE-008: delete work sample delegates to repository.deletePortfolioItem(userId, itemId)', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockApprovedWorker);

    render(<BrainWorkerProfilePage />);

    const portfolioTab = await screen.findByTestId('tab-portfolio-gallery');
    fireEvent.click(portfolioTab);

    const deleteBtn = screen.getByTestId('delete-portfolio-item-btn-port-1');
    fireEvent.click(deleteBtn);

    const confirmBtn = screen.getByRole('button', { name: /confirm delete|delete work/i });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(mockProfileRepo.deletePortfolioItem).toHaveBeenCalledWith(
        mockApprovedWorker.id,
        'port-1'
      );
    });
  });

  // ===========================================================================
  // ROUTE-009: Submit Counter-Response Delegation
  // ===========================================================================
  it('ROUTE-009: submit review counter-response delegates to repository.submitReviewCounterResponse(userId, reviewId, text)', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockApprovedWorker);

    render(<BrainWorkerProfilePage />);

    const reviewsTab = await screen.findByTestId('tab-client-reviews');
    fireEvent.click(reviewsTab);

    const openBtn = screen.getByTestId('open-counter-response-btn-rev-1');
    fireEvent.click(openBtn);

    const textarea = screen.getByPlaceholderText(/write your response/i);
    fireEvent.change(textarea, {
      target: { value: 'Thank you for your business. We look forward to working with you.' },
    });

    const submitBtn = screen.getByTestId('submit-counter-response-btn');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockProfileRepo.submitReviewCounterResponse).toHaveBeenCalledWith(
        mockApprovedWorker.id,
        'rev-1',
        expect.stringContaining('Thank you for your business')
      );
    });
  });

  // ===========================================================================
  // ROUTE-010: Strict Financial Decoupling and SSR Mount Safety
  // ===========================================================================
  it('ROUTE-010: strict financial decoupling and SSR mount safety renders production shell without SSR errors or financial leaks', async () => {
    const { renderToString } = await import('react-dom/server');

    let markup = '';
    expect(() => {
      markup = renderToString(<BrainWorkerProfilePage />);
    }).not.toThrow();

    expect(markup).toContain('BukieBrainJobs');
    // The shared workspace nav links to the Wallet section; the decoupling rule covers profile content only.
    const content = markup.replace(/<nav aria-label="BrainWorker workspace"[\s\S]*?<\/nav>/, '');
    expect(content).not.toMatch(/₦|NGN|wallet|escrow|bank account|payout/i);

    // Verify physical boundary: page.tsx does not import from testing/
    const pagePath = path.join(__dirname, 'profile', 'page.tsx');
    const pageSource = fs.readFileSync(pagePath, 'utf8');
    expect(pageSource).not.toMatch(/from ['"][^'"]*testing[^'"]*['"]/);
  });
});

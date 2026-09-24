// apps/web/app/brainworker/BrainWorkerRoutes.test.tsx
// Phase 8 RED: BrainWorker Route Integration, Role Guards & Static Safety Contract Tests
// Authoritative References:
// - docs/specs/BW-001-architecture-contract.md (Section 3, 4, 5)
// - docs/specs/BW-001-ux-design-specification.md (Section 3)
// - docs/specs/BW-001-test-first-implementation-plan.md (Suite 8: INT-001 to INT-009)

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import * as authStorage from '../../lib/auth/storage';
import * as repositoryModule from '../../lib/brainworker/repository';
import type { AuthUser } from '../../lib/auth/types';
import type {
  BrainWorkerOnboardingRecord,
  IBrainWorkerOnboardingRepository,
} from '../../lib/brainworker/types';
import * as fs from 'fs';
import * as path from 'path';

// Import Route Components
import BrainWorkerRegisterPage from './register/page';
import BrainWorkerOnboardingPage from './onboarding/page';
import BrainWorkerVerificationStatusPage from './verification-status/page';
import BrainWorkerDashboardPage from './dashboard/page';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Mock Navigation & Next.js Hooks
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

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
  usePathname: () => '/brainworker/onboarding',
}));

// Mock Next.js Image
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...props} />
  ),
}));

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Test Fixtures
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const mockUnapprovedBrainWorkerUser: AuthUser = {
  id: 'bw-user-001',
  name: 'Tunde Babatunde',
  email: 'tunde@example.com',
  phone: '+2348011112222',
  provider: 'phone',
  role: 'brainworker',
  isBrainWorkerApproved: false,
};

const mockApprovedBrainWorkerUser: AuthUser = {
  id: 'bw-user-approved',
  name: 'Emeka Okafor',
  email: 'emeka@example.com',
  phone: '+2348033334444',
  provider: 'phone',
  role: 'brainworker',
  isBrainWorkerApproved: true,
};

const mockCustomerUser: AuthUser = {
  id: 'cust-user-001',
  name: 'Ngozi Eze',
  email: 'ngozi@example.com',
  phone: '+2348055556666',
  provider: 'google',
  role: 'customer',
  isBrainWorkerApproved: false,
};

const mockSubmittedRecord: BrainWorkerOnboardingRecord = {
  id: 'rec-bw-submitted',
  brainWorkerId: 'bw-user-001',
  status: 'SUBMITTED',
  currentStep: 'review',
  identity: {
    legalFirstName: 'Tunde',
    legalLastName: 'Babatunde',
    dateOfBirth: '1990-01-01',
    identifierType: 'NIN',
    identifierNumber: '12345678901',
    maskedIdentifier: '•••••••8901',
    residentialAddress: {
      street: '12 Broad Street',
      city: 'Lagos Island',
      lga: 'Lagos Island',
      state: 'Lagos',
    },
  },
  trade: {
    primaryCategory: 'generator',
    subSpecialties: ['Diesel Generators'],
    experienceLevel: 'JOURNEYMAN_EXPERIENCED',
    yearsInTrade: 5,
    coverageCities: ['Lagos'],
  },
  credentials: {
    governmentId: {
      id: 'doc-1',
      category: 'GOVERNMENT_ID',
      specificType: 'NATIONAL_EID',
      fileName: 'nin-slip.pdf',
      fileSizeBytes: 1_200_000,
      mimeType: 'application/pdf',
      stagedAt: '2026-09-24T06:00:00.000Z',
    },
    tradeCredentials: [
      {
        id: 'doc-2',
        category: 'TRADE_CREDENTIAL',
        specificType: 'TRADE_TEST_CERTIFICATE',
        fileName: 'trade-cert.pdf',
        fileSizeBytes: 950_000,
        mimeType: 'application/pdf',
        stagedAt: '2026-09-24T06:00:00.000Z',
      },
    ],
    workProofs: [],
  },
  declaration: {
    truthfulnessAcknowledged: true,
    termsAccepted: true,
    declaredAt: '2026-09-24T07:00:00.000Z',
  },
  remediationIssues: [],
  rejectionDetails: null,
  submittedAt: '2026-09-24T07:00:00.000Z',
  reviewedAt: null,
  createdAt: '2026-09-24T05:00:00.000Z',
  updatedAt: '2026-09-24T07:00:00.000Z',
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Test Suite: INT-001 through INT-010
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe('BW-001 Suite 8: Route Integration & Security Guard Contracts (INT-001 to INT-009)', () => {
  let mockRepository: IBrainWorkerOnboardingRepository;

  beforeEach(() => {
    vi.clearAllMocks();

    mockRepository = {
      getOnboardingRecord: vi.fn().mockResolvedValue(null),
      saveDraftStep: vi.fn(),
      stageDocument: vi.fn(),
      removeStagedDocument: vi.fn(),
      submitOnboarding: vi.fn(),
    };

    vi.spyOn(repositoryModule, 'getBrainWorkerOnboardingRepository').mockReturnValue(
      mockRepository
    );
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(null);
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // INT-001: BrainWorker Registration Flow
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  it('INT-001: /brainworker/register renders provider signup form and advances to onboarding upon submit', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(null);
    const setAuthSpy = vi.spyOn(authStorage, 'setMockAuthenticatedUser');

    render(<BrainWorkerRegisterPage />);

    expect(screen.getByRole('heading', { name: /BrainWorker Registration|Become a BrainWorker/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Full Name|Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address|Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Phone Number|Phone/i)).toBeInTheDocument();

    const submitBtn = screen.getByRole('button', { name: /Create BrainWorker Account|Sign Up as BrainWorker|Continue to Onboarding/i });
    expect(submitBtn).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/Full Name|Name/i), {
      target: { value: 'Chidi Anozie' },
    });
    fireEvent.change(screen.getByLabelText(/Email Address|Email/i), {
      target: { value: 'chidi@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/Phone Number|Phone/i), {
      target: { value: '+2348099887766' },
    });

    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(setAuthSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Chidi Anozie',
          role: 'brainworker',
          isBrainWorkerApproved: false,
        })
      );
      expect(mockPush).toHaveBeenCalledWith('/brainworker/onboarding');
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // INT-002: Customer Boundary & Duplicate Detection
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  it('INT-002: /brainworker/register displays customer boundary conflict alert when accessed by logged-in customer', () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockCustomerUser);

    render(<BrainWorkerRegisterPage />);

    expect(
      screen.getByText(/Customer Account Detected|Already signed in as a customer/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Please sign out or create a separate provider account/i)
    ).toBeInTheDocument();
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // INT-003: Unauthenticated Visitor Redirect
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  it('INT-003: unauthenticated visitor accessing /brainworker/onboarding is redirected to /login', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(null);

    render(<BrainWorkerOnboardingPage />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(
        expect.stringMatching(/\/login\?redirect=%2Fbrainworker%2Fonboarding|\/login\?redirect=\/brainworker\/onboarding/)
      );
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // INT-004: Customer Fail-Closed Boundary on Onboarding
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  it('INT-004: authenticated customer accessing /brainworker/onboarding is blocked with boundary conflict notice', () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockCustomerUser);

    render(<BrainWorkerOnboardingPage />);

    expect(
      screen.getByText(/Customer Account Detected|BrainWorker Registration Required/i)
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: /Step 1: Personal & Legal Identity/i })
    ).not.toBeInTheDocument();
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // INT-005: Approved BrainWorker Redirect to Dashboard
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  it('INT-005: approved BrainWorker accessing /brainworker/onboarding is redirected to /brainworker/dashboard', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockApprovedBrainWorkerUser);

    render(<BrainWorkerOnboardingPage />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/brainworker/dashboard');
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // INT-006: Submitted/In-Review BrainWorker Redirect
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  it('INT-006: submitted BrainWorker accessing /brainworker/onboarding is redirected to /brainworker/verification-status', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockUnapprovedBrainWorkerUser);
    vi.mocked(mockRepository.getOnboardingRecord).mockResolvedValue(mockSubmittedRecord);

    render(<BrainWorkerOnboardingPage />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/brainworker/verification-status');
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // INT-007: Unapproved BrainWorker Accessing Dashboard
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  it('INT-007: unapproved BrainWorker accessing /brainworker/dashboard is redirected to /brainworker/verification-status', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockUnapprovedBrainWorkerUser);

    render(<BrainWorkerDashboardPage />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/brainworker/verification-status');
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // INT-008: Real Repository Status Render on Verification Status Route
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  it('INT-008: /brainworker/verification-status renders authoritative repository status for authenticated BrainWorker', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockUnapprovedBrainWorkerUser);
    vi.mocked(mockRepository.getOnboardingRecord).mockResolvedValue(mockSubmittedRecord);

    render(<BrainWorkerVerificationStatusPage />);

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /Your Verification Application is in Queue/i })
      ).toBeInTheDocument();
      expect(screen.getByText(/Application Received/i)).toBeInTheDocument();
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // INT-009: Prerender & Browser-Global Static Safety
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  it('INT-009: static prerender guard ensures all 4 routes mount without throwing ReferenceErrors', () => {
    expect(() => render(<BrainWorkerRegisterPage />)).not.toThrow();
    expect(() => render(<BrainWorkerOnboardingPage />)).not.toThrow();
    expect(() => render(<BrainWorkerVerificationStatusPage />)).not.toThrow();
    expect(() => render(<BrainWorkerDashboardPage />)).not.toThrow();
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // INT-010: Physical Boundary & Security Invariant
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  it('INT-010: all production route pages do not import from testing/', () => {
    const routeFiles = [
      './register/page.tsx',
      './onboarding/page.tsx',
      './verification-status/page.tsx',
      './dashboard/page.tsx',
    ];

    for (const file of routeFiles) {
      const fullPath = path.resolve(__dirname, file);
      const content = fs.readFileSync(fullPath, 'utf-8');
      expect(content).not.toMatch(/from ['"].*\/testing['"]/);
      expect(content).not.toMatch(/from ['"].*\/testing\/.*['"]/);
    }
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // INT-011: Unauthenticated Visitor on Verification Status
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  it('INT-011: unauthenticated visitor accessing /brainworker/verification-status is redirected to /login', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(null);

    render(<BrainWorkerVerificationStatusPage />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(
        expect.stringMatching(/\/login\?redirect=%2Fbrainworker%2Fverification-status|\/login\?redirect=\/brainworker\/verification-status/)
      );
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // INT-012: Customer Boundary on Verification Status
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  it('INT-012: authenticated customer accessing /brainworker/verification-status is blocked with boundary notice without repository call', () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockCustomerUser);

    render(<BrainWorkerVerificationStatusPage />);

    expect(screen.getByText(/Customer Account Detected/i)).toBeInTheDocument();
    expect(screen.getByText(/Provider Status Restricted/i)).toBeInTheDocument();
    expect(mockRepository.getOnboardingRecord).not.toHaveBeenCalled();
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // INT-013: Unauthenticated Visitor on Dashboard
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  it('INT-013: unauthenticated visitor accessing /brainworker/dashboard is redirected to /login', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(null);

    render(<BrainWorkerDashboardPage />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(
        expect.stringMatching(/\/login\?redirect=%2Fbrainworker%2Fdashboard|\/login\?redirect=\/brainworker\/dashboard/)
      );
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // INT-014: Customer Boundary on Dashboard
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  it('INT-014: authenticated customer accessing /brainworker/dashboard is blocked with access restricted notice', () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockCustomerUser);

    render(<BrainWorkerDashboardPage />);

    expect(screen.getByText(/Access Restricted/i)).toBeInTheDocument();
    expect(
      screen.getByText(/The BrainWorker workspace is strictly reserved for verified service providers/i)
    ).toBeInTheDocument();
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // INT-015: PENDING_REVIEW BrainWorker Redirect
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  it('INT-015: PENDING_REVIEW BrainWorker accessing /brainworker/onboarding is redirected to /brainworker/verification-status', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockUnapprovedBrainWorkerUser);
    vi.mocked(mockRepository.getOnboardingRecord).mockResolvedValue({
      ...mockSubmittedRecord,
      status: 'PENDING_REVIEW',
    });

    render(<BrainWorkerOnboardingPage />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/brainworker/verification-status');
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // INT-016: Logged-in BrainWorker Visiting Register
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  it('INT-016: already registered unapproved BrainWorker accessing /brainworker/register is routed to /brainworker/onboarding', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockUnapprovedBrainWorkerUser);

    render(<BrainWorkerRegisterPage />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/brainworker/onboarding');
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // INT-017: Approved Record on Verification Status Promotes Workspace Admission
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  it('INT-017: approved record on /brainworker/verification-status promotes session upon entering workspace', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockUnapprovedBrainWorkerUser);
    const setAuthSpy = vi.spyOn(authStorage, 'setMockAuthenticatedUser');
    vi.mocked(mockRepository.getOnboardingRecord).mockResolvedValue({
      ...mockSubmittedRecord,
      status: 'APPROVED',
    });

    render(<BrainWorkerVerificationStatusPage />);

    const enterBtn = await screen.findByRole('button', { name: /Enter BrainWorker Workspace/i });
    expect(enterBtn).toBeInTheDocument();

    fireEvent.click(enterBtn);

    expect(setAuthSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        isBrainWorkerApproved: true,
      })
    );
    expect(mockPush).toHaveBeenCalledWith('/brainworker/dashboard');
  });
});

// apps/web/app/messages/[jobId]/ChatPage.test.tsx
// Phase 6 RED: Surface & Route Integration Contract Tests (INT-003, INT-004, INT-007)
// Authoritative References:
// - docs/specs/WEB-017-test-first-implementation-plan.md (Suite 9: [jobId]/ChatPage.test.tsx)
// - docs/specs/WEB-017-ux-design-specification.md (Section 4: Active Chat Screen)
// - docs/specs/WEB-017-architecture-contract.md (Section 4 & 5)

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import * as authStorage from '../../../lib/auth/storage';
import { AuthUser } from '../../../lib/auth/types';
import type { ChatMessageRecord } from '../../../lib/messaging/types';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Mock Navigation & Next.js Hooks
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const mockPush = vi.fn();
const mockReplace = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
  useParams: () => ({ jobId: 'job-act-001' }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/messages/job-act-001',
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

const mockCustomerUser: AuthUser = {
  id: 'usr-customer-001',
  name: 'Adaeze Okafor',
  email: 'adaeze@example.com',
  phone: '+2348031234567',
  provider: 'google',
  role: 'customer',
  isBrainWorkerApproved: false,
};

const mockUnauthorizedUser: AuthUser = {
  id: 'usr-unauthorized-999',
  name: 'Unknown Intruder',
  email: 'intruder@example.com',
  phone: '+2348039999999',
  provider: 'google',
  role: 'customer',
  isBrainWorkerApproved: false,
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Test Suite: INT-003, INT-004, INT-007
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe('ChatPage Route Integration Contract (INT-003, INT-004, INT-007)', () => {
  // Placeholder component for RED phase - will be replaced with actual import during GREEN
  let ChatPage: React.ComponentType<{ params?: Promise<{ jobId: string }> }>;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockCustomerUser);

    // In RED phase, this mock ensures TypeScript compiles but tests fail genuinely
    ChatPage = () => {
      throw new Error('ChatPage route component not implemented yet - RED phase expected to fail');
    };
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // INT-003: /messages/[jobId] renders active chat for authorized customer.
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('INT-003: Authorized Chat Rendering', () => {
    it('renders active chat screen with participant identity and booking details', async () => {
      render(<ChatPage params={Promise.resolve({ jobId: 'job-act-001' })} />);

      expect(screen.getByText(/Engr. Emeka Nwosu/i)).toBeInTheDocument();
      expect(screen.getByText(/Generator Servicing & Repair/i)).toBeInTheDocument();
      expect(screen.getByRole('textbox', { name: /message/i })).toBeInTheDocument();
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // INT-004: /messages/[jobId] throws/renders fail-closed error if caller does not own booking.
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('INT-004: Fail-Closed Unauthorized Access', () => {
    it('renders fail-closed error presentation when caller does not own booking', async () => {
      vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockUnauthorizedUser);

      render(<ChatPage params={Promise.resolve({ jobId: 'job-act-001' })} />);

      expect(screen.getByText(/unauthorized|access denied|not found/i)).toBeInTheDocument();
      expect(screen.queryByRole('textbox', { name: /message/i })).not.toBeInTheDocument();
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // INT-007: Lifecycle receipt and re-book links remain strictly decoupled from messaging state.
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('INT-007: Decoupled Lifecycle Navigation', () => {
    it('displays booking reference link back to booking receipt without modifying messaging state', async () => {
      render(<ChatPage params={Promise.resolve({ jobId: 'job-act-001' })} />);

      const bookingLink = screen.getByRole('link', { name: /BBJ-LAG-2026-0891|booking|receipt/i });
      expect(bookingLink).toBeInTheDocument();
      expect(bookingLink).toHaveAttribute('href', expect.stringMatching(/\/receipt|\/job|\/book/));
    });
  });
});

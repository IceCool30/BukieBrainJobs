// apps/web/app/messages/HubPage.test.tsx
// Phase 6 RED: Surface & Route Integration Contract Tests (INT-001, INT-002, INT-005, INT-006)
// Authoritative References:
// - docs/specs/WEB-017-test-first-implementation-plan.md (Suite 8: Surface & Route Integration)
// - docs/specs/WEB-017-ux-design-specification.md (Section 3: Conversation Hub)
// - docs/specs/WEB-017-architecture-contract.md (Section 4 & 5)

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import * as authStorage from '../../lib/auth/storage';
import { AuthUser } from '../../lib/auth/types';
import type { ConversationSummary } from '../../lib/messaging/types';

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
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/messages',
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

const mockConversations: ConversationSummary[] = [
  {
    jobId: 'job-act-001',
    referenceCode: 'BBJ-LAG-2026-0891',
    serviceTitle: 'Generator Servicing & Repair',
    bookingStatus: 'IN_PROGRESS',
    participant: {
      id: 'usr-worker-001',
      name: 'Engr. Emeka Nwosu',
      role: 'brainworker',
      avatarUrl: '/images/workers/emeka.jpg',
      isVerified: true,
    },
    lastMessage: {
      id: 'msg-001',
      senderId: 'usr-worker-001',
      senderName: 'Engr. Emeka Nwosu',
      content: 'I have arrived at the estate gate.',
      contentType: 'text',
      createdAt: '2026-09-22T12:30:00.000Z',
    },
    unreadCount: 1,
    lastMessageAt: '2026-09-22T12:30:00.000Z',
    isReadOnly: false,
  },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Test Suite: INT-001, INT-002, INT-005, INT-006
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe('HubPage Route Integration Contract (INT-001, INT-002, INT-005, INT-006)', () => {
  // Placeholder component for RED phase - will be replaced with actual import during GREEN
  let HubPage: React.ComponentType;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockCustomerUser);

    // In RED phase, this mock ensures TypeScript compiles but tests fail genuinely
    HubPage = () => {
      throw new Error('HubPage route component not implemented yet - RED phase expected to fail');
    };
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // INT-001: /messages renders conversation hub for authenticated customer.
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('INT-001: Authenticated Hub Rendering', () => {
    it('renders conversation hub with conversation list for authenticated customer', async () => {
      render(<HubPage />);

      expect(screen.getByRole('heading', { name: /messages/i })).toBeInTheDocument();
      expect(screen.getByText(/Generator Servicing & Repair/i)).toBeInTheDocument();
      expect(screen.getByText(/Engr. Emeka Nwosu/i)).toBeInTheDocument();
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // INT-002: /messages redirects unauthenticated visitor to /login.
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('INT-002: Unauthenticated Visitor Redirect', () => {
    it('redirects unauthenticated visitor to /login', () => {
      vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(null);

      render(<HubPage />);

      expect(mockReplace).toHaveBeenCalledWith(expect.stringMatching(/\/login/));
      expect(screen.queryByRole('heading', { name: /messages/i })).not.toBeInTheDocument();
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // INT-005: Navigation "Messages" button links directly to /messages route.
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('INT-005: Navigation Link to Messages', () => {
    it('provides direct link or navigation targeting /messages without coming soon modal', () => {
      render(<HubPage />);

      // Must not render honest development / coming soon notice
      expect(screen.queryByText(/coming soon/i)).not.toBeInTheDocument();
      expect(screen.queryByRole('dialog', { name: /notice/i })).not.toBeInTheDocument();
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // INT-006: Dashboard "Messages" link navigates directly to /messages.
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('INT-006: Dashboard Messages Route Navigation', () => {
    it('navigates directly to /messages from messages entry point', () => {
      render(<HubPage />);

      // The hub page renders the conversations and provides conversation card links targeting /messages/[jobId]
      const conversationCardLink = screen.getByRole('link', { name: /Engr. Emeka Nwosu/i });
      expect(conversationCardLink).toHaveAttribute('href', expect.stringContaining('/messages/job-act-001'));
    });
  });
});

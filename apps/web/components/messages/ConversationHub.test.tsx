// apps/web/components/messages/ConversationHub.test.tsx
// Phase 3 RED: Conversation Hub Component Contract Tests (HUB-001 through HUB-012)
// Authoritative References:
// - docs/specs/WEB-017-test-first-implementation-plan.md (Suite 4: HUB-001 to HUB-012)
// - docs/specs/WEB-017-ux-design-specification.md (Section 3: Conversation Hub)
// - docs/specs/WEB-017-architecture-contract.md (Section 3 & 4)

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import type { ConversationSummary } from '../../lib/messaging/types';
import { ConversationHub } from './ConversationHub';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Deterministic Test Fixtures
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const CURRENT_USER_ID = 'usr-customer-001';

const MOCK_CONV_ACTIVE_1: ConversationSummary = {
  jobId: 'job-act-001',
  referenceCode: 'BBJ-LAG-2026-0891',
  serviceTitle: 'Generator Servicing & Repair',
  bookingStatus: 'IN_PROGRESS',
  isReadOnly: false,
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
  unreadCount: 2,
  lastMessageAt: '2026-09-22T12:30:00.000Z',
};

const MOCK_CONV_ACTIVE_2: ConversationSummary = {
  jobId: 'job-act-002',
  referenceCode: 'BBJ-ABJ-2026-0102',
  serviceTitle: 'Solar Inverter Troubleshooting',
  bookingStatus: 'CONFIRMED',
  isReadOnly: false,
  participant: {
    id: 'usr-worker-002',
    name: 'Fatima Bello',
    role: 'brainworker',
    avatarUrl: '/images/workers/fatima.jpg',
    isVerified: true,
  },
  lastMessage: {
    id: 'msg-002',
    senderId: CURRENT_USER_ID,
    senderName: 'Adaeze Okafor',
    content: 'I have sent the power reading photo.',
    contentType: 'text',
    createdAt: '2026-09-22T11:15:00.000Z',
  },
  unreadCount: 0,
  lastMessageAt: '2026-09-22T11:15:00.000Z',
};

const MOCK_CONV_ARCHIVED_COMPLETED: ConversationSummary = {
  jobId: 'job-arch-003',
  referenceCode: 'BBJ-IBD-2026-0441',
  serviceTitle: 'Plumbing Leak Repair',
  bookingStatus: 'COMPLETED',
  isReadOnly: true,
  participant: {
    id: 'usr-worker-003',
    name: 'Tunde Bakare',
    role: 'brainworker',
    avatarUrl: undefined,
    isVerified: false,
  },
  lastMessage: {
    id: 'msg-003',
    senderId: 'usr-worker-003',
    senderName: 'Tunde Bakare',
    content: 'Thank you for releasing escrow!',
    contentType: 'text',
    createdAt: '2026-09-20T09:00:00.000Z',
  },
  unreadCount: 0,
  lastMessageAt: '2026-09-20T09:00:00.000Z',
};

const MOCK_CONV_ARCHIVED_CANCELLED: ConversationSummary = {
  jobId: 'job-arch-004',
  referenceCode: 'BBJ-KAN-2026-0319',
  serviceTitle: 'Deep House Cleaning',
  bookingStatus: 'CANCELLED',
  isReadOnly: true,
  participant: {
    id: 'usr-worker-004',
    name: 'Amina Yusuf',
    role: 'brainworker',
    avatarUrl: '/images/workers/amina.jpg',
    isVerified: true,
  },
  lastMessage: {
    id: 'msg-004',
    senderId: CURRENT_USER_ID,
    senderName: 'Adaeze Okafor',
    content: 'Rescheduling for next week.',
    contentType: 'text',
    createdAt: '2026-09-18T16:00:00.000Z',
  },
  unreadCount: 0,
  lastMessageAt: '2026-09-18T16:00:00.000Z',
};

const ALL_MOCK_CONVERSATIONS: ConversationSummary[] = [
  MOCK_CONV_ACTIVE_1,
  MOCK_CONV_ACTIVE_2,
  MOCK_CONV_ARCHIVED_COMPLETED,
  MOCK_CONV_ARCHIVED_CANCELLED,
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TDD Test Suite: ConversationHub (HUB-001 through HUB-012)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe('ConversationHub (TDD Suite 4: HUB-001 to HUB-012)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── HUB-001: Renders list of conversation cards sorted by latest message descending ─

  describe('HUB-001: Conversation List Rendering & Ordering', () => {
    it('renders all provided conversations in strict descending order of lastMessageAt', () => {
      // Pass in unsorted order to verify the component enforces descending order
      const unsorted = [
        MOCK_CONV_ARCHIVED_COMPLETED, // 2026-09-20
        MOCK_CONV_ACTIVE_1,           // 2026-09-22 12:30
        MOCK_CONV_ARCHIVED_CANCELLED, // 2026-09-18
        MOCK_CONV_ACTIVE_2,           // 2026-09-22 11:15
      ];

      render(
        <ConversationHub
          conversations={unsorted}
          currentUserId={CURRENT_USER_ID}
        />
      );

      const cards = screen.getAllByRole('article');
      expect(cards).toHaveLength(4);

      // Verify strict descending order by inspecting text within each card
      expect(cards[0]).toHaveTextContent('Engr. Emeka Nwosu');
      expect(cards[1]).toHaveTextContent('Fatima Bello');
      expect(cards[2]).toHaveTextContent('Tunde Bakare');
      expect(cards[3]).toHaveTextContent('Amina Yusuf');
    });

    it('renders the "Messages" title heading', () => {
      render(
        <ConversationHub
          conversations={ALL_MOCK_CONVERSATIONS}
          currentUserId={CURRENT_USER_ID}
        />
      );

      expect(screen.getByRole('heading', { level: 1, name: /messages/i })).toBeInTheDocument();
    });
  });

  // ── HUB-002: Displays BrainWorker avatar, full name, verified shield badge, and service title ─

  describe('HUB-002: BrainWorker Identity Presentation', () => {
    it('displays BrainWorker full name and service title on each card', () => {
      render(
        <ConversationHub
          conversations={[MOCK_CONV_ACTIVE_1]}
          currentUserId={CURRENT_USER_ID}
        />
      );

      expect(screen.getByText('Engr. Emeka Nwosu')).toBeInTheDocument();
      expect(screen.getByText('Generator Servicing & Repair')).toBeInTheDocument();
    });

    it('renders BrainWorker avatar with accessible alt text', () => {
      render(
        <ConversationHub
          conversations={[MOCK_CONV_ACTIVE_1]}
          currentUserId={CURRENT_USER_ID}
        />
      );

      const avatar = screen.getByAltText('Engr. Emeka Nwosu');
      expect(avatar).toBeInTheDocument();
      expect(avatar).toHaveAttribute('src', expect.stringContaining('emeka.jpg'));
    });

    it('renders verified shield badge when BrainWorker is verified', () => {
      render(
        <ConversationHub
          conversations={[MOCK_CONV_ACTIVE_1]}
          currentUserId={CURRENT_USER_ID}
        />
      );

      const verifiedBadge = screen.getByLabelText(/verified brainworker/i);
      expect(verifiedBadge).toBeInTheDocument();
    });

    it('does not render verified shield badge when BrainWorker is not verified', () => {
      render(
        <ConversationHub
          conversations={[MOCK_CONV_ARCHIVED_COMPLETED]}
          currentUserId={CURRENT_USER_ID}
        />
      );

      expect(screen.queryByLabelText(/verified brainworker/i)).not.toBeInTheDocument();
    });

    it('renders fallback avatar with worker initials when avatarUrl is missing', () => {
      render(
        <ConversationHub
          conversations={[MOCK_CONV_ARCHIVED_COMPLETED]}
          currentUserId={CURRENT_USER_ID}
        />
      );

      // Tunde Bakare has no avatarUrl; should show initials 'TB'
      expect(screen.getByText('TB')).toBeInTheDocument();
    });
  });

  // ── HUB-003: Displays booking reference code ─────────────────────────────

  describe('HUB-003: Booking Reference Code', () => {
    it('displays human-readable booking reference code on the card', () => {
      render(
        <ConversationHub
          conversations={[MOCK_CONV_ACTIVE_1, MOCK_CONV_ACTIVE_2]}
          currentUserId={CURRENT_USER_ID}
        />
      );

      expect(screen.getByText('BBJ-LAG-2026-0891')).toBeInTheDocument();
      expect(screen.getByText('BBJ-ABJ-2026-0102')).toBeInTheDocument();
    });
  });

  // ── HUB-004: Displays last message snippet with correct sender prefix ─────

  describe('HUB-004: Latest Message Snippet & Attribution', () => {
    it('prefixes snippet with "You: " when current user is the sender', () => {
      render(
        <ConversationHub
          conversations={[MOCK_CONV_ACTIVE_2]}
          currentUserId={CURRENT_USER_ID}
        />
      );

      // Current user sent MOCK_CONV_ACTIVE_2's last message
      expect(screen.getByText(/you:\s*i have sent the power reading photo\./i)).toBeInTheDocument();
    });

    it('prefixes snippet with worker first name or sender display name when worker is the sender', () => {
      render(
        <ConversationHub
          conversations={[MOCK_CONV_ACTIVE_1]}
          currentUserId={CURRENT_USER_ID}
        />
      );

      // Worker sent MOCK_CONV_ACTIVE_1's last message
      expect(screen.getByText(/emeka:\s*i have arrived at the estate gate\./i)).toBeInTheDocument();
    });

    it('handles conversation with no messages gracefully without crashing', () => {
      const emptyMsgConv: ConversationSummary = {
        ...MOCK_CONV_ACTIVE_1,
        lastMessage: undefined,
      };

      render(
        <ConversationHub
          conversations={[emptyMsgConv]}
          currentUserId={CURRENT_USER_ID}
        />
      );

      expect(screen.getByText(/no messages yet/i)).toBeInTheDocument();
    });
  });

  // ── HUB-005: Displays relative timestamp ──────────────────────────────────

  describe('HUB-005: Relative Timestamp', () => {
    it('renders a timestamp element for each conversation', () => {
      render(
        <ConversationHub
          conversations={[MOCK_CONV_ACTIVE_1]}
          currentUserId={CURRENT_USER_ID}
        />
      );

      const card = screen.getByRole('article');
      // Should have a timestamp or formatted date/time representation
      const timeEl = card.querySelector('time') ?? screen.getByText(/ago|pm|am|yesterday|\d+:\d+/i);
      expect(timeEl).toBeInTheDocument();
    });
  });

  // ── HUB-006: Displays highlighted emerald unread badge ───────────────────

  describe('HUB-006: Unread Counter Badge', () => {
    it('renders unread badge with exact count when unreadCount > 0', () => {
      render(
        <ConversationHub
          conversations={[MOCK_CONV_ACTIVE_1]}
          currentUserId={CURRENT_USER_ID}
        />
      );

      const badge = screen.getByLabelText(/2 unread messages/i);
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent('2');
    });

    it('does not render unread badge when unreadCount is 0', () => {
      render(
        <ConversationHub
          conversations={[MOCK_CONV_ACTIVE_2]}
          currentUserId={CURRENT_USER_ID}
        />
      );

      expect(screen.queryByLabelText(/unread/i)).not.toBeInTheDocument();
    });
  });

  // ── HUB-007: Renders calm empty state when user has zero conversations ──

  describe('HUB-007: First-Run Empty State', () => {
    it('renders calm empty state with "No active conversations yet" heading and CTA', () => {
      render(
        <ConversationHub
          conversations={[]}
          currentUserId={CURRENT_USER_ID}
        />
      );

      expect(screen.getByRole('heading', { level: 3, name: /no active conversations yet/i })).toBeInTheDocument();
      expect(
        screen.getByText(/when you book a service or message a brainworker, your conversations will appear here/i)
      ).toBeInTheDocument();

      const browseLink = screen.getByRole('link', { name: /browse services/i });
      expect(browseLink).toBeInTheDocument();
      expect(browseLink).toHaveAttribute('href', '/services');
    });
  });

  // ── HUB-008: Filter tabs (All, Active Jobs, Archived) ────────────────────

  describe('HUB-008: Lifecycle Filter Tabs', () => {
    it('renders filter tabs: "All Messages", "Active Jobs", and "Archived"', () => {
      render(
        <ConversationHub
          conversations={ALL_MOCK_CONVERSATIONS}
          currentUserId={CURRENT_USER_ID}
        />
      );

      expect(screen.getByRole('tab', { name: /all messages|all/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /active jobs/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /archived/i })).toBeInTheDocument();
    });

    it('defaults to showing all conversations on "All Messages" tab', () => {
      render(
        <ConversationHub
          conversations={ALL_MOCK_CONVERSATIONS}
          currentUserId={CURRENT_USER_ID}
        />
      );

      const cards = screen.getAllByRole('article');
      expect(cards).toHaveLength(4);
    });

    it('filters to show only writable/active bookings when "Active Jobs" tab is clicked', () => {
      render(
        <ConversationHub
          conversations={ALL_MOCK_CONVERSATIONS}
          currentUserId={CURRENT_USER_ID}
        />
      );

      fireEvent.click(screen.getByRole('tab', { name: /active jobs/i }));

      const cards = screen.getAllByRole('article');
      expect(cards).toHaveLength(2);
      expect(screen.getByText('Engr. Emeka Nwosu')).toBeInTheDocument();
      expect(screen.getByText('Fatima Bello')).toBeInTheDocument();
      expect(screen.queryByText('Tunde Bakare')).not.toBeInTheDocument();
      expect(screen.queryByText('Amina Yusuf')).not.toBeInTheDocument();
    });

    it('filters to show only completed and cancelled bookings when "Archived" tab is clicked', () => {
      render(
        <ConversationHub
          conversations={ALL_MOCK_CONVERSATIONS}
          currentUserId={CURRENT_USER_ID}
        />
      );

      fireEvent.click(screen.getByRole('tab', { name: /archived/i }));

      const cards = screen.getAllByRole('article');
      expect(cards).toHaveLength(2);
      expect(screen.getByText('Tunde Bakare')).toBeInTheDocument();
      expect(screen.getByText('Amina Yusuf')).toBeInTheDocument();
      expect(screen.queryByText('Engr. Emeka Nwosu')).not.toBeInTheDocument();
      expect(screen.queryByText('Fatima Bello')).not.toBeInTheDocument();
    });

    it('shows calm filter-empty message when an active tab has no matching conversations', () => {
      // Pass only active jobs
      render(
        <ConversationHub
          conversations={[MOCK_CONV_ACTIVE_1]}
          currentUserId={CURRENT_USER_ID}
        />
      );

      fireEvent.click(screen.getByRole('tab', { name: /archived/i }));

      expect(screen.queryAllByRole('article')).toHaveLength(0);
      expect(screen.getByText(/no archived conversations/i)).toBeInTheDocument();
    });
  });

  // ── HUB-009: Real-time search filtering ──────────────────────────────────

  describe('HUB-009: Real-Time Search Filtering', () => {
    it('renders a search input field with placeholder "Search conversations..."', () => {
      render(
        <ConversationHub
          conversations={ALL_MOCK_CONVERSATIONS}
          currentUserId={CURRENT_USER_ID}
        />
      );

      const searchInput = screen.getByPlaceholderText(/search conversations\.\.\./i);
      expect(searchInput).toBeInTheDocument();
    });

    it('filters conversation list in real-time by BrainWorker name', () => {
      render(
        <ConversationHub
          conversations={ALL_MOCK_CONVERSATIONS}
          currentUserId={CURRENT_USER_ID}
        />
      );

      const searchInput = screen.getByPlaceholderText(/search conversations\.\.\./i);
      fireEvent.change(searchInput, { target: { value: 'Fatima' } });

      const cards = screen.getAllByRole('article');
      expect(cards).toHaveLength(1);
      expect(screen.getByText('Fatima Bello')).toBeInTheDocument();
      expect(screen.queryByText('Engr. Emeka Nwosu')).not.toBeInTheDocument();
    });

    it('filters conversation list in real-time by service title', () => {
      render(
        <ConversationHub
          conversations={ALL_MOCK_CONVERSATIONS}
          currentUserId={CURRENT_USER_ID}
        />
      );

      const searchInput = screen.getByPlaceholderText(/search conversations\.\.\./i);
      fireEvent.change(searchInput, { target: { value: 'Generator' } });

      const cards = screen.getAllByRole('article');
      expect(cards).toHaveLength(1);
      expect(screen.getByText('Generator Servicing & Repair')).toBeInTheDocument();
      expect(screen.queryByText('Solar Inverter Troubleshooting')).not.toBeInTheDocument();
    });

    it('displays "No conversations match your search" when no results are found', () => {
      render(
        <ConversationHub
          conversations={ALL_MOCK_CONVERSATIONS}
          currentUserId={CURRENT_USER_ID}
        />
      );

      const searchInput = screen.getByPlaceholderText(/search conversations\.\.\./i);
      fireEvent.change(searchInput, { target: { value: 'NonExistentWorkerOrService' } });

      expect(screen.queryAllByRole('article')).toHaveLength(0);
      expect(screen.getByText(/no conversations match your search/i)).toBeInTheDocument();
    });

    it('restores all conversations when search input is cleared', () => {
      render(
        <ConversationHub
          conversations={ALL_MOCK_CONVERSATIONS}
          currentUserId={CURRENT_USER_ID}
        />
      );

      const searchInput = screen.getByPlaceholderText(/search conversations\.\.\./i);
      fireEvent.change(searchInput, { target: { value: 'Fatima' } });
      expect(screen.getAllByRole('article')).toHaveLength(1);

      fireEvent.change(searchInput, { target: { value: '' } });
      expect(screen.getAllByRole('article')).toHaveLength(4);
    });
  });

  // ── HUB-010: Conversation selection handler ──────────────────────────────

  describe('HUB-010: Conversation Selection', () => {
    it('invokes onSelectConversation with the chosen jobId when a card is clicked', () => {
      const handleSelect = vi.fn();

      render(
        <ConversationHub
          conversations={ALL_MOCK_CONVERSATIONS}
          currentUserId={CURRENT_USER_ID}
          onSelectConversation={handleSelect}
        />
      );

      const firstCard = screen.getAllByRole('article')[0]!;
      fireEvent.click(firstCard);

      expect(handleSelect).toHaveBeenCalledTimes(1);
      expect(handleSelect).toHaveBeenCalledWith('job-act-001');
    });

    it('supports keyboard navigation via Enter key on a focused card', () => {
      const handleSelect = vi.fn();

      render(
        <ConversationHub
          conversations={ALL_MOCK_CONVERSATIONS}
          currentUserId={CURRENT_USER_ID}
          onSelectConversation={handleSelect}
        />
      );

      const secondCard = screen.getAllByRole('article')[1]!;
      fireEvent.keyDown(secondCard, { key: 'Enter', code: 'Enter' });

      expect(handleSelect).toHaveBeenCalledWith('job-act-002');
    });
  });

  // ── HUB-011: Highlights active conversation card in desktop split view ───

  describe('HUB-011: Active Conversation Highlight', () => {
    it('marks the active conversation card with aria-selected="true"', () => {
      render(
        <ConversationHub
          conversations={ALL_MOCK_CONVERSATIONS}
          currentUserId={CURRENT_USER_ID}
          activeJobId="job-act-001"
        />
      );

      const cards = screen.getAllByRole('article');
      expect(cards[0]).toHaveAttribute('aria-selected', 'true');
      expect(cards[1]).toHaveAttribute('aria-selected', 'false');
    });

    it('marks all cards aria-selected="false" when activeJobId is undefined', () => {
      render(
        <ConversationHub
          conversations={ALL_MOCK_CONVERSATIONS}
          currentUserId={CURRENT_USER_ID}
        />
      );

      const cards = screen.getAllByRole('article');
      for (const card of cards) {
        expect(card).toHaveAttribute('aria-selected', 'false');
      }
    });
  });

  // ── HUB-012: Loading skeleton, error state, and accessibility ────────────

  describe('HUB-012: Loading State, Error State & Accessibility', () => {
    it('renders accessible loading skeleton when isLoading={true}', () => {
      render(
        <ConversationHub
          conversations={[]}
          currentUserId={CURRENT_USER_ID}
          isLoading={true}
        />
      );

      const loadingContainer = screen.getByRole('status');
      expect(loadingContainer).toBeInTheDocument();
      expect(loadingContainer).toHaveAttribute('aria-busy', 'true');
      // No empty state should be displayed while loading
      expect(screen.queryByText(/no active conversations yet/i)).not.toBeInTheDocument();
    });

    it('renders calm error banner and "Try again" retry button when error is present', () => {
      const handleRetry = vi.fn();

      render(
        <ConversationHub
          conversations={[]}
          currentUserId={CURRENT_USER_ID}
          error="Unable to load conversations. Please check your connection."
          onRetry={handleRetry}
        />
      );

      expect(
        screen.getByText(/unable to load conversations\. please check your connection\./i)
      ).toBeInTheDocument();

      const retryButton = screen.getByRole('button', { name: /try again/i });
      expect(retryButton).toBeInTheDocument();

      fireEvent.click(retryButton);
      expect(handleRetry).toHaveBeenCalledTimes(1);
    });

    it('has accessible feed list container with appropriate aria-label', () => {
      render(
        <ConversationHub
          conversations={ALL_MOCK_CONVERSATIONS}
          currentUserId={CURRENT_USER_ID}
        />
      );

      expect(screen.getByRole('feed', { name: /conversations/i })).toBeInTheDocument();
    });
  });
});

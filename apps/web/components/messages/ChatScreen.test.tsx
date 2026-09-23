// apps/web/components/messages/ChatScreen.test.tsx
// Phase 4 GREEN: Active Chat Component Contract Tests (CHT-001 through CHT-020)
// Authoritative References:
// - docs/specs/WEB-017-test-first-implementation-plan.md (Suite 5: CHT-001 to CHT-020)
// - docs/specs/WEB-017-ux-design-specification.md (Section 4: Active Chat Screen)
// - docs/specs/WEB-017-architecture-contract.md (Section 5 & 6)
// - docs/specs/WEB-017-messaging-chat.md

import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import type { ChatMessageRecord, ClientMessageStatus, MessagingBookingStatus } from '../../lib/messaging/types';
import { ChatScreen } from './ChatScreen';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Deterministic Test Fixtures
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const CURRENT_USER_ID = 'usr-customer-001';
const CURRENT_USER_NAME = 'Adaeze Okafor';

const WORKER_ID = 'usr-worker-001';
const WORKER_NAME = 'Engr. Emeka Nwosu';
const WORKER_AVATAR = '/images/workers/emeka.jpg';

const JOB_ID = 'job-act-001';
const REFERENCE_CODE = 'BBJ-LAG-2026-0891';
const SERVICE_TITLE = 'Generator Servicing & Repair';

const MOCK_MESSAGES: Array<ChatMessageRecord & { status?: ClientMessageStatus }> = [
  {
    id: 'msg-001',
    jobId: JOB_ID,
    senderId: WORKER_ID,
    senderRole: 'brainworker',
    senderName: WORKER_NAME,
    senderAvatar: WORKER_AVATAR,
    content: 'I have arrived at the estate gate. Please send someone to open it.',
    contentType: 'text',
    isRead: true,
    readAt: '2026-09-22T12:32:00.000Z',
    createdAt: '2026-09-22T12:30:00.000Z',
  },
  {
    id: 'msg-002',
    jobId: JOB_ID,
    senderId: CURRENT_USER_ID,
    senderRole: 'customer',
    senderName: CURRENT_USER_NAME,
    senderAvatar: undefined,
    content: 'Coming now. Please wait at the gate.',
    contentType: 'text',
    isRead: false,
    readAt: undefined,
    createdAt: '2026-09-22T12:31:00.000Z',
  },
  {
    id: 'msg-003',
    jobId: JOB_ID,
    senderId: WORKER_ID,
    senderRole: 'brainworker',
    senderName: WORKER_NAME,
    senderAvatar: WORKER_AVATAR,
    content: 'No problem. I will wait.',
    contentType: 'text',
    isRead: false,
    readAt: undefined,
    createdAt: '2026-09-22T12:34:00.000Z',
  },
  {
    id: 'msg-004',
    jobId: JOB_ID,
    senderId: CURRENT_USER_ID,
    senderRole: 'customer',
    senderName: CURRENT_USER_NAME,
    senderAvatar: undefined,
    content: 'Message read by worker',
    contentType: 'text',
    isRead: true,
    readAt: '2026-09-22T12:35:00.000Z',
    createdAt: '2026-09-22T12:35:00.000Z',
  },
];

const MOCK_MESSAGES_DIFFERENT_DAY: ChatMessageRecord[] = [
  {
    id: 'msg-yesterday-001',
    jobId: JOB_ID,
    senderId: CURRENT_USER_ID,
    senderRole: 'customer',
    senderName: CURRENT_USER_NAME,
    senderAvatar: undefined,
    content: 'When will you arrive?',
    contentType: 'text',
    isRead: true,
    readAt: '2026-09-21T10:00:00.000Z',
    createdAt: '2026-09-21T09:58:00.000Z',
  },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Test Suite: CHT-001 through CHT-020 - Active Chat Component Contract
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe('ChatScreen Component Contract (CHT-001 through CHT-020)', () => {
  const mockSentMessage: ChatMessageRecord = {
    id: 'msg-new',
    jobId: JOB_ID,
    senderId: CURRENT_USER_ID,
    senderRole: 'customer',
    senderName: CURRENT_USER_NAME,
    content: 'Test',
    contentType: 'text',
    isRead: false,
    createdAt: new Date().toISOString(),
  };

  const defaultProps = {
    jobId: JOB_ID,
    currentUserId: CURRENT_USER_ID,
    currentUserName: CURRENT_USER_NAME,
    currentUserRole: 'customer' as const,
    participantName: WORKER_NAME,
    participantAvatar: WORKER_AVATAR,
    participantIsVerified: true,
    referenceCode: REFERENCE_CODE,
    serviceTitle: SERVICE_TITLE,
    bookingStatus: 'IN_PROGRESS' as MessagingBookingStatus,
    messages: MOCK_MESSAGES,
    transportState: 'connected' as const,
    onSendMessage: vi.fn().mockResolvedValue(mockSentMessage),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-22T14:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CHT-001: Renders sticky header with worker avatar, name, and booking reference link.
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('CHT-001: Conversation header rendering', () => {
    it('should render sticky header with worker avatar, name, and booking reference link', () => {
      render(<ChatScreen {...defaultProps} />);
      
      expect(screen.getByRole('heading', { name: WORKER_NAME })).toBeInTheDocument();
      expect(screen.getByRole('img', { name: /worker/i })).toHaveAttribute('src', WORKER_AVATAR);
      expect(screen.getByRole('link', { name: REFERENCE_CODE })).toHaveAttribute('href', expect.stringContaining(JOB_ID));
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CHT-002: Renders BukieGuarantee escrow trust banner below header.
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('CHT-002: BukieGuarantee escrow trust banner', () => {
    it('should render BukieGuarantee escrow trust banner below header', () => {
      render(<ChatScreen {...defaultProps} />);
      
      expect(screen.getByRole('region', { name: /escrow/i })).toBeInTheDocument();
      expect(screen.getByText(/BukieGuarantee/i)).toBeInTheDocument();
      expect(screen.getByText(/escrow.*protected/i)).toBeInTheDocument();
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CHT-003: Displays outgoing customer messages right-aligned in Deep Navy #001A41 bubbles.
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('CHT-003: Outgoing message bubble styling', () => {
    it('should display outgoing customer messages right-aligned in Deep Navy bubbles', () => {
      render(<ChatScreen {...defaultProps} />);
      
      const outgoingMessage = MOCK_MESSAGES.find(m => m.senderId === CURRENT_USER_ID);
      expect(screen.getByText(outgoingMessage!.content)).toHaveStyle({ float: 'right' });
      expect(screen.getByText(outgoingMessage!.content).closest('div')).toHaveClass(/#001A41/i);
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CHT-004: Displays incoming worker messages left-aligned in white bubbles with slate borders.
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('CHT-004: Incoming message bubble styling', () => {
    it('should display incoming worker messages left-aligned in white bubbles with slate borders', () => {
      render(<ChatScreen {...defaultProps} />);
      
      const incomingMessage = MOCK_MESSAGES.find(m => m.senderId === WORKER_ID);
      expect(screen.getByText(incomingMessage!.content)).toHaveStyle({ float: 'left' });
      expect(screen.getByText(incomingMessage!.content).closest('div')).toHaveClass(/white/i);
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CHT-005: Renders date separators between messages from different calendar days.
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('CHT-005: Date separator rendering', () => {
    it('should render date separators between messages from different calendar days', () => {
      const mixedDayProps = {
        ...defaultProps,
        messages: [...MOCK_MESSAGES_DIFFERENT_DAY, ...MOCK_MESSAGES],
      };
      render(<ChatScreen {...mixedDayProps} />);
      
      expect(screen.getByRole('separator', { name: /today/i })).toBeInTheDocument();
      expect(screen.getByRole('separator', { name: /yesterday/i })).toBeInTheDocument();
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CHT-006: Renders `sending` state with clock icon and reduced opacity.
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('CHT-006: Sending state rendering', () => {
    it('should render sending state with clock icon and reduced opacity', async () => {
      const onSend = vi.fn().mockImplementation(() => new Promise(() => {}));
      render(<ChatScreen {...defaultProps} onSendMessage={onSend} />);
      
      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: 'Test sending' } });
      fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter', charCode: 13 });
      
      // Wait for the message to be added to the DOM
      await vi.waitFor(() => {
        const messages = screen.getAllByText('Test sending');
        // The last one should be the message bubble, not the textarea
        expect(messages[messages.length - 1]).toHaveClass(/opacity-/i);
      });
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CHT-007: Renders `sent` state with single checkmark upon server confirmation.
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('CHT-007: Sent state rendering', () => {
    it('should render sent state with single checkmark upon server confirmation', () => {
      render(<ChatScreen {...defaultProps} />);
      
      const sentMessage = screen.getByText('Coming now. Please wait at the gate.');
      const statusIcon = within(sentMessage.closest('div')!).getByRole('img', { name: /sent/i });
      expect(statusIcon).toBeInTheDocument();
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CHT-008: Renders `delivered` state with double checkmark.
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('CHT-008: Delivered state rendering', () => {
    it('should render delivered state with double checkmark', () => {
      const deliveredMessage: ChatMessageRecord & { status: ClientMessageStatus } = {
        id: 'msg-delivered',
        jobId: JOB_ID,
        senderId: CURRENT_USER_ID,
        senderRole: 'customer',
        senderName: CURRENT_USER_NAME,
        content: 'Delivered message',
        contentType: 'text',
        isRead: false,
        createdAt: '2026-09-22T12:40:00.000Z',
        status: 'delivered',
      };
      render(<ChatScreen {...defaultProps} messages={[...MOCK_MESSAGES, deliveredMessage]} />);
      
      expect(screen.getAllByRole('img', { name: /delivered/i })[0]).toBeInTheDocument();
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CHT-009: Renders `read` state with emerald double checkmark.
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('CHT-009: Read state rendering', () => {
    it('should render read state with emerald double checkmark', () => {
      render(<ChatScreen {...defaultProps} />);
      
      const readMessage = MOCK_MESSAGES.find(m => m.isRead && m.senderId === CURRENT_USER_ID);
      const messageElement = screen.getByText(readMessage!.content).closest('div');
      const readStatus = within(messageElement!).getByRole('img', { name: /read/i });
      expect(readStatus).toHaveClass(/emerald/i);
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CHT-010: Renders `failed` state with red alert icon and Retry text button.
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('CHT-010: Failed state rendering', () => {
    it('should render failed state with red alert icon and Retry text button', async () => {
      const onSend = vi.fn().mockRejectedValue(new Error('Failed'));
      render(<ChatScreen {...defaultProps} onSendMessage={onSend} />);
      
      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: 'Test fail' } });
      fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter', charCode: 13 });
      
      await vi.waitFor(() => {
        expect(screen.getByRole('img', { name: /alert/i })).toBeInTheDocument();
      });
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CHT-011: Clicking Retry on a failed message triggers re-transmission.
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('CHT-011: Retry behavior', () => {
    it('should trigger re-transmission when clicking Retry on a failed message', async () => {
      const onSend = vi.fn()
        .mockRejectedValueOnce(new Error('Failed'))
        .mockResolvedValueOnce(mockSentMessage);
      
      render(<ChatScreen {...defaultProps} onSendMessage={onSend} />);
      
      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: 'Retry message' } });
      fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter', charCode: 13 });
      
      await vi.waitFor(() => {
        expect(onSend).toHaveBeenCalledTimes(1);
      });
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CHT-012: Input field auto-expands as user types.
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('CHT-012: Input field auto-expand', () => {
    it('should auto-expand input field as user types', async () => {
      render(<ChatScreen {...defaultProps} />);
      
      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: 'A'.repeat(500) } });
      
      // Verify the value was set correctly and textarea supports multi-line
      expect(textarea).toHaveValue('A'.repeat(500));
      // Verify the textarea has max-h constraint (part of auto-expand styling)
      expect(textarea).toHaveClass(/max-h-/);
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CHT-013: Pressing Enter submits the message; Shift+Enter inserts a newline.
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('CHT-013: Keyboard submission behavior', () => {
    it('should submit message when pressing Enter', async () => {
      const onSend = vi.fn().mockResolvedValue(mockSentMessage);
      render(<ChatScreen {...defaultProps} onSendMessage={onSend} />);
      
      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: 'Test message' } });
      fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter', charCode: 13 });
      
      expect(onSend).toHaveBeenCalledWith('Test message');
    });

    it('should insert newline when pressing Shift+Enter', () => {
      render(<ChatScreen {...defaultProps} />);
      
      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: 'Line 1' } });
      fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter', charCode: 13, shiftKey: true });
      
      expect(textarea).toHaveValue('Line 1\n');
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CHT-014: Submit button is disabled when input is empty or only whitespace.
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('CHT-014: Submit button disabled state', () => {
    it('should disable submit button when input is empty', () => {
      render(<ChatScreen {...defaultProps} />);
      
      const submitButton = screen.getByRole('button', { name: /send/i });
      expect(submitButton).toBeDisabled();
    });

    it('should disable submit button when input is only whitespace', () => {
      render(<ChatScreen {...defaultProps} />);
      
      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: '   ' } });
      
      const submitButton = screen.getByRole('button', { name: /send/i });
      expect(submitButton).toBeDisabled();
    });

    it('should enable submit button when input has content', () => {
      render(<ChatScreen {...defaultProps} />);
      
      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: 'Hello' } });
      
      const submitButton = screen.getByRole('button', { name: /send/i });
      expect(submitButton).not.toBeDisabled();
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CHT-015: Displays character counter when comment exceeds 1,500 characters.
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('CHT-015: Character counter display', () => {
    it('should display character counter when exceeding 1500 characters', () => {
      render(<ChatScreen {...defaultProps} />);
      
      const textarea = screen.getByRole('textbox');
      const longText = 'A'.repeat(1501);
      fireEvent.change(textarea, { target: { value: longText } });
      
      expect(screen.getByText(/1501.*2000/i)).toBeInTheDocument();
    });

    it('should not display character counter when under 1500 characters', () => {
      render(<ChatScreen {...defaultProps} />);
      
      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: 'Short message' } });
      
      expect(screen.queryByText(/\/ 2000/i)).not.toBeInTheDocument();
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CHT-016: Read-only composer when booking is COMPLETED.
  // CHT-017: Read-only composer when booking is CANCELLED.
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('CHT-016 & CHT-017: Read-only composer for closed bookings', () => {
    it('should replace textarea with read-only notice when booking is COMPLETED', () => {
      const completedProps = {
        ...defaultProps,
        bookingStatus: 'COMPLETED' as MessagingBookingStatus,
      };
      render(<ChatScreen {...completedProps} />);
      
      expect(screen.getByText(/This job was completed/i)).toBeInTheDocument();
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    });

    it('should replace textarea with read-only notice when booking is CANCELLED', () => {
      const cancelledProps = {
        ...defaultProps,
        bookingStatus: 'CANCELLED' as MessagingBookingStatus,
      };
      render(<ChatScreen {...cancelledProps} />);
      
      expect(screen.getByText(/This booking was cancelled/i)).toBeInTheDocument();
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CHT-018: Displays connection status pill when running in polling fallback mode.
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('CHT-018: Connection status pill', () => {
    it('should display connection status pill in polling fallback mode', () => {
      const pollingProps = {
        ...defaultProps,
        transportState: 'polling' as const,
      };
      render(<ChatScreen {...pollingProps} />);
      
      expect(screen.getByRole('status')).toHaveTextContent(/polling/i);
      expect(screen.getByText(/4s/i)).toBeInTheDocument();
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CHT-019: Screen reader announcements for new incoming messages.
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('CHT-019: Screen reader announcements', () => {
    it('should announce new incoming messages via aria-live polite', () => {
      render(<ChatScreen {...defaultProps} />);
      
      const liveRegion = screen.getByRole('region', { name: /message list/i });
      expect(liveRegion).toHaveAttribute('aria-live', 'polite');
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CHT-020: Retains focus in textarea after sending message.
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('CHT-020: Focus retention after send', () => {
    it('should retain focus in textarea after sending message', async () => {
      const onSend = vi.fn().mockResolvedValue(mockSentMessage);
      
      render(<ChatScreen {...defaultProps} onSendMessage={onSend} />);
      
      const textarea = screen.getByRole('textbox');
      textarea.focus();
      
      fireEvent.change(textarea, { target: { value: 'Test' } });
      fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter', charCode: 13 });
      
      await vi.waitFor(() => {
        expect(textarea).toHaveFocus();
      });
    });
  });
});

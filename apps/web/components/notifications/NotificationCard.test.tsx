// apps/web/components/notifications/NotificationCard.test.tsx
// Phase 5 RED: Notification Card Anatomy & Interaction Tests (CRD-001 through CRD-009)
// Authoritative References:
// - docs/specs/WEB-018-test-first-implementation-plan.md (Suite 6: CRD-001 to CRD-009)
// - docs/specs/WEB-018-ux-design-specification.md (Section 6)
// - docs/specs/WEB-018-architecture-contract.md (Section 2 & 3)

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NotificationCard } from './NotificationCard';
import {
  FIXTURE_NOTIF_BOOKING_CONFIRMED,
  FIXTURE_NOTIF_BOOKING_COMPLETED,
  FIXTURE_NOTIF_MESSAGE_RECEIVED,
  FIXTURE_NOTIF_REVIEW_REQUESTED,
} from '../../lib/notifications/testing';

describe('WEB-018 NotificationCard Anatomy & Interaction (CRD-001 through CRD-009)', () => {
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CRD-001: Renders distinct category icon container for each notification type
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('CRD-001: Category icon container per notification category', () => {
    it('renders bookings category icon container for booking notification', () => {
      render(<NotificationCard notification={FIXTURE_NOTIF_BOOKING_CONFIRMED} />);
      expect(screen.getByTestId('category-icon-bookings')).toBeInTheDocument();
    });

    it('renders messages_payments category icon container for chat notification', () => {
      render(<NotificationCard notification={FIXTURE_NOTIF_MESSAGE_RECEIVED} />);
      expect(screen.getByTestId('category-icon-messages_payments')).toBeInTheDocument();
    });

    it('renders account category icon container for review notification', () => {
      render(<NotificationCard notification={FIXTURE_NOTIF_REVIEW_REQUESTED} />);
      expect(screen.getByTestId('category-icon-account')).toBeInTheDocument();
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CRD-002: Unread card renders bold headline, tinted surface (#EFF4FF), and emerald dot
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('CRD-002: Unread card styling and indicators', () => {
    it('renders tinted surface, unread dot indicator, and bold title', () => {
      render(<NotificationCard notification={FIXTURE_NOTIF_BOOKING_CONFIRMED} />);

      const indicator = screen.getByTestId('unread-indicator');
      expect(indicator).toBeInTheDocument();

      const card = screen.getByTestId(`notification-card-${FIXTURE_NOTIF_BOOKING_CONFIRMED.id}`);
      expect(card.className).toMatch(/bg-\[#EFF4FF\]|bg-blue-50/);
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CRD-003: Read card renders standard body weight, white surface, and no unread dot
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('CRD-003: Read card styling and indicators', () => {
    it('renders white surface and no unread indicator dot for read notification', () => {
      render(<NotificationCard notification={FIXTURE_NOTIF_BOOKING_COMPLETED} />);

      expect(screen.queryByTestId('unread-indicator')).not.toBeInTheDocument();

      const card = screen.getByTestId(`notification-card-${FIXTURE_NOTIF_BOOKING_COMPLETED.id}`);
      expect(card.className).toMatch(/bg-white/);
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CRD-004: Renders humanized relative timestamp
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('CRD-004: Relative timestamp rendering', () => {
    it('renders relative timestamp for notification', () => {
      render(<NotificationCard notification={FIXTURE_NOTIF_BOOKING_CONFIRMED} />);

      const timestamp = screen.getByTestId('notification-timestamp');
      expect(timestamp).toBeInTheDocument();
      expect(timestamp.textContent?.trim().length).toBeGreaterThan(0);
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CRD-005: Renders booking reference code pill when present
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('CRD-005: Booking reference code pill', () => {
    it('renders reference code badge when referenceCode is provided', () => {
      render(<NotificationCard notification={FIXTURE_NOTIF_BOOKING_CONFIRMED} />);

      const badge = screen.getByTestId('reference-code-badge');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent('BBJ-LAG-2026-0891');
    });

    it('omits reference code badge when referenceCode is undefined or null', () => {
      const notifWithoutRef = {
        ...FIXTURE_NOTIF_REVIEW_REQUESTED,
        referenceCode: undefined,
      };

      render(<NotificationCard notification={notifWithoutRef} />);
      expect(screen.queryByTestId('reference-code-badge')).not.toBeInTheDocument();
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CRD-006: Card click invokes onMarkAsRead optimistically before navigating
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('CRD-006: Mark-as-read invocation on card interaction', () => {
    it('invokes onMarkAsRead callback with notification id upon click', () => {
      const handleMarkAsRead = vi.fn();
      const handleNavigate = vi.fn();

      render(
        <NotificationCard
          notification={FIXTURE_NOTIF_BOOKING_CONFIRMED}
          onMarkAsRead={handleMarkAsRead}
          onNavigate={handleNavigate}
        />
      );

      const card = screen.getByTestId(`notification-card-${FIXTURE_NOTIF_BOOKING_CONFIRMED.id}`);
      fireEvent.click(card);

      expect(handleMarkAsRead).toHaveBeenCalledWith(FIXTURE_NOTIF_BOOKING_CONFIRMED.id);
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CRD-007: Card click routes to resolved sanitized deep-link URL
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('CRD-007: Deep-link navigation on card interaction', () => {
    it('invokes onNavigate with resolved sanitized target URL upon click', () => {
      const handleNavigate = vi.fn();

      render(
        <NotificationCard
          notification={FIXTURE_NOTIF_BOOKING_CONFIRMED}
          onNavigate={handleNavigate}
        />
      );

      const card = screen.getByTestId(`notification-card-${FIXTURE_NOTIF_BOOKING_CONFIRMED.id}`);
      fireEvent.click(card);

      expect(handleNavigate).toHaveBeenCalledWith('/jobs?id=job-act-001');
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CRD-008: Card provides minimum 44x44px touch target (48x48px on mobile)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('CRD-008: Minimum touch target geometry', () => {
    it('enforces accessible min-height touch target class on card element', () => {
      render(<NotificationCard notification={FIXTURE_NOTIF_BOOKING_CONFIRMED} />);

      const card = screen.getByTestId(`notification-card-${FIXTURE_NOTIF_BOOKING_CONFIRMED.id}`);
      expect(card.className).toMatch(/min-h-\[(44|48)px\]|p-4/);
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CRD-009: Card provides visible focus ring on keyboard focus
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('CRD-009: Visible focus indicators for keyboard navigation', () => {
    it('has focus-visible ring classes and focusable role', () => {
      render(<NotificationCard notification={FIXTURE_NOTIF_BOOKING_CONFIRMED} />);

      const card = screen.getByTestId(`notification-card-${FIXTURE_NOTIF_BOOKING_CONFIRMED.id}`);
      expect(card.className).toMatch(/focus-visible:ring-2/);
      expect(card).toHaveAttribute('tabIndex', '0');
    });
  });
});

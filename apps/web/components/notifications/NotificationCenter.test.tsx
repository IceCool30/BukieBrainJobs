// apps/web/components/notifications/NotificationCenter.test.tsx
// Phase 4 RED: Notification Center Feed & Category Tabs Component Tests (FED-001 through FED-011)
// Authoritative References:
// - docs/specs/WEB-018-test-first-implementation-plan.md (Suite 5: FED-001 to FED-011)
// - docs/specs/WEB-018-ux-design-specification.md (Section 3 & 4)
// - docs/specs/WEB-018-architecture-contract.md (Section 2 & 3)

import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NotificationCenter } from './NotificationCenter';
import {
  createNotificationTestHarness,
  type INotificationTestController,
  FIXTURE_CUSTOMER_A,
  FIXTURE_NOTIFICATIONS_CUSTOMER_A,
  FIXTURE_NOTIF_BOOKING_COMPLETED,
  FIXTURE_NOTIF_BOOKING_CANCELLED,
} from '../../lib/notifications/testing';
import type { INotificationRepository } from '../../lib/notifications/types';

describe('WEB-018 NotificationCenter Feed & Category Tabs (FED-001 through FED-011)', () => {
  let repo: INotificationRepository;
  let ctrl: INotificationTestController;

  beforeEach(() => {
    const harness = createNotificationTestHarness();
    repo = harness.repository;
    ctrl = harness.testController;
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // FED-001: Page title & category tablist rendering
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('FED-001: Renders page title and category tablist', () => {
    it('renders the "Notifications" heading and accessible tablist with 4 tabs', async () => {
      ctrl.seed(FIXTURE_NOTIFICATIONS_CUSTOMER_A);

      render(<NotificationCenter customerId={FIXTURE_CUSTOMER_A} repository={repo} />);

      expect(await screen.findByRole('heading', { level: 1, name: /notifications/i })).toBeInTheDocument();

      const tablist = screen.getByRole('tablist', { name: /notification categories/i });
      expect(tablist).toBeInTheDocument();

      const tabs = screen.getAllByRole('tab');
      expect(tabs).toHaveLength(4);
      expect(tabs[0]).toHaveTextContent(/all/i);
      expect(tabs[1]).toHaveTextContent(/bookings/i);
      expect(tabs[2]).toHaveTextContent(/messages.*payments/i);
      expect(tabs[3]).toHaveTextContent(/account/i);
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // FED-002: Active tab defaults to 'all' displaying all notifications
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('FED-002: Defaults to active tab "all" displaying all notifications', () => {
    it('sets aria-selected="true" on "All" tab and renders all customer notifications', async () => {
      ctrl.seed(FIXTURE_NOTIFICATIONS_CUSTOMER_A);

      render(<NotificationCenter customerId={FIXTURE_CUSTOMER_A} repository={repo} />);

      const allTab = await screen.findByRole('tab', { name: /all/i });
      expect(allTab).toHaveAttribute('aria-selected', 'true');

      // Verify feed items are rendered for Customer A (12 notifications)
      const feedItems = await screen.findAllByTestId(/^notification-card-/);
      expect(feedItems).toHaveLength(12);
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // FED-003: 'Bookings' tab filters feed to booking milestones
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('FED-003: Clicking "Bookings" tab filters feed strictly to booking notifications', () => {
    it('filters displayed notifications to booking events only', async () => {
      ctrl.seed(FIXTURE_NOTIFICATIONS_CUSTOMER_A);

      render(<NotificationCenter customerId={FIXTURE_CUSTOMER_A} repository={repo} />);

      const bookingsTab = await screen.findByRole('tab', { name: /bookings/i });
      fireEvent.click(bookingsTab);

      expect(bookingsTab).toHaveAttribute('aria-selected', 'true');

      await waitFor(() => {
        const cards = screen.getAllByTestId(/^notification-card-/);
        expect(cards).toHaveLength(4);
      });

      // Verify specific booking items are shown
      expect(screen.getByText('Artisan Assigned: Engr. Emeka Nwosu')).toBeInTheDocument();
      expect(screen.getByText('Artisan Arrived On-Site')).toBeInTheDocument();
      expect(screen.getByText('Work Completed: Inspection Requested')).toBeInTheDocument();
      expect(screen.getByText('Booking Cancelled')).toBeInTheDocument();

      // Verify chat and payment items are NOT shown
      expect(screen.queryByText(/New Message from Sunday Ogundimu/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Escrow Payment Verified/i)).not.toBeInTheDocument();
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // FED-004: 'Messages & Payments' tab filters feed to chat and escrow
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('FED-004: Clicking "Messages & Payments" tab filters feed to chat and escrow notifications', () => {
    it('filters displayed notifications to chat and payment events only', async () => {
      ctrl.seed(FIXTURE_NOTIFICATIONS_CUSTOMER_A);

      render(<NotificationCenter customerId={FIXTURE_CUSTOMER_A} repository={repo} />);

      const msgPayTab = await screen.findByRole('tab', { name: /messages.*payments/i });
      fireEvent.click(msgPayTab);

      expect(msgPayTab).toHaveAttribute('aria-selected', 'true');

      await waitFor(() => {
        const cards = screen.getAllByTestId(/^notification-card-/);
        expect(cards).toHaveLength(4);
      });

      expect(screen.getByText('New Message from Sunday Ogundimu')).toBeInTheDocument();
      expect(screen.getByText('Escrow Payment Verified')).toBeInTheDocument();
      expect(screen.getByText('Escrow Payment Released')).toBeInTheDocument();
      expect(screen.getByText('Refund Processed')).toBeInTheDocument();

      expect(screen.queryByText(/Artisan Assigned/i)).not.toBeInTheDocument();
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // FED-005: 'Account' tab filters feed to security, review, system
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('FED-005: Clicking "Account" tab filters feed to security, review, and system notifications', () => {
    it('filters displayed notifications to account-level events only', async () => {
      ctrl.seed(FIXTURE_NOTIFICATIONS_CUSTOMER_A);

      render(<NotificationCenter customerId={FIXTURE_CUSTOMER_A} repository={repo} />);

      const accountTab = await screen.findByRole('tab', { name: /account/i });
      fireEvent.click(accountTab);

      expect(accountTab).toHaveAttribute('aria-selected', 'true');

      await waitFor(() => {
        const cards = screen.getAllByTestId(/^notification-card-/);
        expect(cards).toHaveLength(4);
      });

      expect(screen.getByText('Rate Your Experience')).toBeInTheDocument();
      expect(screen.getByText('Password Changed')).toBeInTheDocument();
      expect(screen.getByText('Phone Verified')).toBeInTheDocument();
      expect(screen.getByText('Scheduled Maintenance Notice')).toBeInTheDocument();

      expect(screen.queryByText(/Artisan Arrived On-Site/i)).not.toBeInTheDocument();
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // FED-006: Category tabs display accurate badge counts matching unread items
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('FED-006: Category tabs display accurate badge counts matching unread items', () => {
    it('renders unread counts on category tabs matching domain unread state', async () => {
      ctrl.seed(FIXTURE_NOTIFICATIONS_CUSTOMER_A);

      render(<NotificationCenter customerId={FIXTURE_CUSTOMER_A} repository={repo} />);

      // In FIXTURE_NOTIFICATIONS_CUSTOMER_A: 6 total unread (2 bookings, 2 msg_pay, 2 account)
      const allBadge = await screen.findByTestId('tab-badge-all');
      expect(allBadge).toHaveTextContent('6');

      const bookingsBadge = screen.getByTestId('tab-badge-bookings');
      expect(bookingsBadge).toHaveTextContent('2');

      const msgPayBadge = screen.getByTestId('tab-badge-messages_payments');
      expect(msgPayBadge).toHaveTextContent('2');

      const accountBadge = screen.getByTestId('tab-badge-account');
      expect(accountBadge).toHaveTextContent('2');
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // FED-007: "Mark all as read" button is enabled when unread items exist
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('FED-007: "Mark all as read" button is enabled when unread items exist', () => {
    it('renders the mark-all-read button in enabled state when unread items > 0', async () => {
      ctrl.seed(FIXTURE_NOTIFICATIONS_CUSTOMER_A);

      render(<NotificationCenter customerId={FIXTURE_CUSTOMER_A} repository={repo} />);

      const markAllBtn = await screen.findByRole('button', { name: /mark all as read/i });
      expect(markAllBtn).toBeInTheDocument();
      expect(markAllBtn).not.toBeDisabled();
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // FED-008: "Mark all as read" button is disabled when 0 unread items exist
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('FED-008: "Mark all as read" button is disabled when 0 unread items exist', () => {
    it('disables the mark-all-read button when customer has 0 unread notifications', async () => {
      // Seed only read notifications
      ctrl.seed([FIXTURE_NOTIF_BOOKING_COMPLETED, FIXTURE_NOTIF_BOOKING_CANCELLED]);

      render(<NotificationCenter customerId={FIXTURE_CUSTOMER_A} repository={repo} />);

      const markAllBtn = await screen.findByRole('button', { name: /mark all as read/i });
      expect(markAllBtn).toBeDisabled();
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // FED-009: Clicking "Mark all as read" updates all cards to read and clears badges
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('FED-009: Clicking "Mark all as read" clears unread badges and indicators', () => {
    it('mutates all unread notifications to read and disables button', async () => {
      ctrl.seed(FIXTURE_NOTIFICATIONS_CUSTOMER_A);

      render(<NotificationCenter customerId={FIXTURE_CUSTOMER_A} repository={repo} />);

      const markAllBtn = await screen.findByRole('button', { name: /mark all as read/i });
      fireEvent.click(markAllBtn);

      await waitFor(() => {
        expect(markAllBtn).toBeDisabled();
      });

      // Verify unread badges disappear or display 0
      const allBadge = screen.queryByTestId('tab-badge-all');
      expect(!allBadge || allBadge.textContent === '0').toBe(true);

      // Verify domain repository unread count is now 0
      const unread = await repo.getUnreadCount(FIXTURE_CUSTOMER_A);
      expect(unread).toBe(0);
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // FED-010: Screen reader announcement on Mark all as read
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('FED-010: "Mark all as read" triggers polite screen reader announcement', () => {
    it('updates aria-live="polite" status container upon marking all read', async () => {
      ctrl.seed(FIXTURE_NOTIFICATIONS_CUSTOMER_A);

      render(<NotificationCenter customerId={FIXTURE_CUSTOMER_A} repository={repo} />);

      const liveRegion = await screen.findByRole('status');
      expect(liveRegion).toHaveAttribute('aria-live', 'polite');

      const markAllBtn = screen.getByRole('button', { name: /mark all as read/i });
      fireEvent.click(markAllBtn);

      await waitFor(() => {
        expect(liveRegion).toHaveTextContent(/all notifications marked as read/i);
      });
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // FED-011: Keyboard navigation across category tabs
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('FED-011: Keyboard navigation with arrow keys between category tabs', () => {
    it('moves active tab on ArrowRight and ArrowLeft keyboard presses', async () => {
      ctrl.seed(FIXTURE_NOTIFICATIONS_CUSTOMER_A);

      render(<NotificationCenter customerId={FIXTURE_CUSTOMER_A} repository={repo} />);

      const allTab = await screen.findByRole('tab', { name: /all/i });
      allTab.focus();

      // Press ArrowRight -> moves to Bookings
      fireEvent.keyDown(allTab, { key: 'ArrowRight', code: 'ArrowRight' });
      const bookingsTab = screen.getByRole('tab', { name: /bookings/i });
      expect(document.activeElement).toBe(bookingsTab);
      expect(bookingsTab).toHaveAttribute('aria-selected', 'true');

      // Press ArrowRight -> moves to Messages & Payments
      fireEvent.keyDown(bookingsTab, { key: 'ArrowRight', code: 'ArrowRight' });
      const msgPayTab = screen.getByRole('tab', { name: /messages.*payments/i });
      expect(document.activeElement).toBe(msgPayTab);
      expect(msgPayTab).toHaveAttribute('aria-selected', 'true');

      // Press ArrowLeft -> moves back to Bookings
      fireEvent.keyDown(msgPayTab, { key: 'ArrowLeft', code: 'ArrowLeft' });
      expect(document.activeElement).toBe(bookingsTab);
      expect(bookingsTab).toHaveAttribute('aria-selected', 'true');
    });
  });
});

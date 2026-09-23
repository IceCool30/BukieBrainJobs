// apps/web/components/notifications/NotificationStates.test.tsx
// Phase 5 RED: Deterministic UI States & Push Banner Tests (STA-001 through STA-013)
// Authoritative References:
// - docs/specs/WEB-018-test-first-implementation-plan.md (Suite 7: STA-001 to STA-013)
// - docs/specs/WEB-018-ux-design-specification.md (Section 7 & 8)
// - docs/specs/WEB-018-architecture-contract.md (Section 2 & 3)

import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NotificationCenter } from './NotificationCenter';
import {
  createNotificationTestHarness,
  type INotificationTestController,
  FIXTURE_CUSTOMER_A,
  FIXTURE_NOTIF_BOOKING_CONFIRMED,
  FIXTURE_NOTIF_BOOKING_STARTED,
  MockPushAdapter,
} from '../../lib/notifications/testing';
import type { INotificationRepository } from '../../lib/notifications/types';

describe('WEB-018 Notification UI States & Push UX (STA-001 through STA-013)', () => {
  let repo: INotificationRepository;
  let ctrl: INotificationTestController;
  let pushAdapter: MockPushAdapter;

  beforeEach(() => {
    const harness = createNotificationTestHarness();
    repo = harness.repository;
    ctrl = harness.testController;
    pushAdapter = new MockPushAdapter();
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STA-001: First-run empty state when customer has 0 notifications
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('STA-001: First-run empty state rendering', () => {
    it('renders first-run empty state container and headline when 0 notifications exist', async () => {
      // Seed with 0 notifications
      ctrl.seed([]);

      render(<NotificationCenter customerId={FIXTURE_CUSTOMER_A} repository={repo} />);

      const emptyState = await screen.findByTestId('empty-state-first-run');
      expect(emptyState).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2, name: /no notifications yet/i })).toBeInTheDocument();
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STA-002: First-run empty state displays "Browse Services" CTA
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('STA-002: First-run empty state navigation CTA', () => {
    it('renders "Browse Services" CTA routing to /services on click', async () => {
      ctrl.seed([]);
      const handleNavigate = vi.fn();

      render(
        <NotificationCenter
          customerId={FIXTURE_CUSTOMER_A}
          repository={repo}
          onNavigate={handleNavigate}
        />
      );

      const browseBtn = await screen.findByRole('button', { name: /browse services/i });
      expect(browseBtn).toBeInTheDocument();

      fireEvent.click(browseBtn);
      expect(handleNavigate).toHaveBeenCalledWith('/services');
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STA-003: Filtered category empty state when a tab has 0 items
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('STA-003: Filtered category empty state rendering', () => {
    it('renders filtered empty state when an active category tab has 0 notifications', async () => {
      // Seed with only bookings notifications
      ctrl.seed([FIXTURE_NOTIF_BOOKING_CONFIRMED, FIXTURE_NOTIF_BOOKING_STARTED]);

      render(<NotificationCenter customerId={FIXTURE_CUSTOMER_A} repository={repo} />);

      // Switch to Account tab (which has 0 items)
      const accountTab = screen.getByRole('tab', { name: /account/i });
      fireEvent.click(accountTab);

      const filteredEmpty = await screen.findByTestId('empty-state-filtered');
      expect(filteredEmpty).toBeInTheDocument();
      expect(filteredEmpty).toHaveTextContent(/no account notifications/i);
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STA-004: Filtered empty state displays "View All Notifications" CTA
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('STA-004: Filtered category reset CTA', () => {
    it('renders "View All Notifications" CTA that resets active tab to "all"', async () => {
      ctrl.seed([FIXTURE_NOTIF_BOOKING_CONFIRMED]);

      render(<NotificationCenter customerId={FIXTURE_CUSTOMER_A} repository={repo} />);

      const accountTab = screen.getByRole('tab', { name: /account/i });
      fireEvent.click(accountTab);

      const resetBtn = await screen.findByRole('button', { name: /view all notifications/i });
      fireEvent.click(resetBtn);

      const allTab = screen.getByRole('tab', { name: /all/i });
      expect(allTab).toHaveAttribute('aria-selected', 'true');
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STA-005: Loading skeleton displays 4 shimmer placeholder cards
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('STA-005: Loading skeleton placeholders', () => {
    it('displays skeleton container with 4 placeholder cards while fetching', async () => {
      // Create a repository with a delayed resolution to inspect loading state
      const slowRepo: INotificationRepository = {
        getNotifications: () => new Promise(() => {}), // Never resolves during test
        markAsRead: vi.fn(),
        markAllAsRead: vi.fn(),
        dismiss: vi.fn(),
        subscribe: vi.fn(() => () => {}),
      };

      render(<NotificationCenter customerId={FIXTURE_CUSTOMER_A} repository={slowRepo} />);

      const skeletonContainer = screen.getByTestId('notification-skeleton');
      expect(skeletonContainer).toBeInTheDocument();

      const skeletonCards = screen.getAllByTestId('skeleton-card');
      expect(skeletonCards).toHaveLength(4);
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STA-006: Offline banner renders when navigator.onLine === false
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('STA-006: Offline banner rendering', () => {
    it('renders offline alert banner when isOffline prop is true', async () => {
      ctrl.seed([FIXTURE_NOTIF_BOOKING_CONFIRMED]);

      render(
        <NotificationCenter
          customerId={FIXTURE_CUSTOMER_A}
          repository={repo}
          isOffline={true}
        />
      );

      const offlineBanner = await screen.findByTestId('offline-banner');
      expect(offlineBanner).toBeInTheDocument();
      expect(offlineBanner).toHaveTextContent(/currently offline.*showing cached notifications/i);
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STA-007: Error retry card renders when initial repository fetch fails
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('STA-007: Error state and retry handling', () => {
    it('renders error card with retry button when initial fetch rejects', async () => {
      const failingRepo: INotificationRepository = {
        getNotifications: vi.fn().mockRejectedValue(new Error('Network error')),
        markAsRead: vi.fn(),
        markAllAsRead: vi.fn(),
        dismiss: vi.fn(),
        subscribe: vi.fn(() => () => {}),
      };

      render(<NotificationCenter customerId={FIXTURE_CUSTOMER_A} repository={failingRepo} />);

      const errorCard = await screen.findByTestId('notification-error');
      expect(errorCard).toBeInTheDocument();

      const retryBtn = screen.getByRole('button', { name: /retry/i });
      expect(retryBtn).toBeInTheDocument();

      fireEvent.click(retryBtn);
      expect(failingRepo.getNotifications).toHaveBeenCalledTimes(2);
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STA-008: Push opt-in banner displays when permission is 'default'
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('STA-008: Push opt-in banner display', () => {
    it('renders push opt-in banner when permission is "default"', async () => {
      ctrl.seed([FIXTURE_NOTIF_BOOKING_CONFIRMED]);
      pushAdapter.setPermission('default');

      render(
        <NotificationCenter
          customerId={FIXTURE_CUSTOMER_A}
          repository={repo}
          pushAdapter={pushAdapter}
        />
      );

      const banner = await screen.findByTestId('push-banner-opt-in');
      expect(banner).toBeInTheDocument();
      expect(banner).toHaveTextContent(/get instant alerts on your phone or computer/i);
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STA-009: Clicking "Enable Notifications" invokes push adapter request
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('STA-009: Push opt-in interaction', () => {
    it('invokes requestPermission on push adapter when Enable Notifications is clicked', async () => {
      ctrl.seed([FIXTURE_NOTIF_BOOKING_CONFIRMED]);
      pushAdapter.setPermission('default');

      render(
        <NotificationCenter
          customerId={FIXTURE_CUSTOMER_A}
          repository={repo}
          pushAdapter={pushAdapter}
        />
      );

      const enableBtn = await screen.findByRole('button', { name: /enable notifications/i });
      fireEvent.click(enableBtn);

      await waitFor(() => {
        expect(pushAdapter.requestedCount).toBe(1);
      });
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STA-010: Push status pill displays when permission is 'granted'
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('STA-010: Granted push status pill', () => {
    it('renders "Browser alerts active" pill when permission is "granted"', async () => {
      ctrl.seed([FIXTURE_NOTIF_BOOKING_CONFIRMED]);
      pushAdapter.setPermission('granted');

      render(
        <NotificationCenter
          customerId={FIXTURE_CUSTOMER_A}
          repository={repo}
          pushAdapter={pushAdapter}
        />
      );

      const pill = await screen.findByTestId('push-status-granted');
      expect(pill).toBeInTheDocument();
      expect(pill).toHaveTextContent(/browser alerts active/i);
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STA-011: Push blocked info callout displays when permission is 'denied'
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('STA-011: Denied push callout', () => {
    it('renders push blocked informational callout when permission is "denied"', async () => {
      ctrl.seed([FIXTURE_NOTIF_BOOKING_CONFIRMED]);
      pushAdapter.setPermission('denied');

      render(
        <NotificationCenter
          customerId={FIXTURE_CUSTOMER_A}
          repository={repo}
          pushAdapter={pushAdapter}
        />
      );

      const callout = await screen.findByTestId('push-status-denied');
      expect(callout).toBeInTheDocument();
      expect(callout).toHaveTextContent(/browser push notifications are currently blocked/i);
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STA-012: Push banner is completely omitted when push is 'unsupported'
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('STA-012: Unsupported push environment', () => {
    it('omits all push banners and pills when push capability is unsupported', async () => {
      ctrl.seed([FIXTURE_NOTIF_BOOKING_CONFIRMED]);
      pushAdapter.setSupported(false);

      render(
        <NotificationCenter
          customerId={FIXTURE_CUSTOMER_A}
          repository={repo}
          pushAdapter={pushAdapter}
        />
      );

      await screen.findByRole('heading', { level: 1, name: /notifications/i });

      expect(screen.queryByTestId('push-banner-opt-in')).not.toBeInTheDocument();
      expect(screen.queryByTestId('push-status-granted')).not.toBeInTheDocument();
      expect(screen.queryByTestId('push-status-denied')).not.toBeInTheDocument();
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // STA-013: Respects prefers-reduced-motion: reduce
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('STA-013: Reduced-motion accessibility standard', () => {
    it('includes motion-reduce classes on skeleton placeholders', () => {
      const slowRepo: INotificationRepository = {
        getNotifications: () => new Promise(() => {}),
        markAsRead: vi.fn(),
        markAllAsRead: vi.fn(),
        dismiss: vi.fn(),
        subscribe: vi.fn(() => () => {}),
      };

      render(<NotificationCenter customerId={FIXTURE_CUSTOMER_A} repository={slowRepo} />);

      const skeletonCards = screen.getAllByTestId('skeleton-card');
      expect(skeletonCards[0]?.className).toMatch(/motion-reduce:animate-none/);
    });
  });
});

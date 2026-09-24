// apps/web/app/notifications/NotificationsPage.test.tsx
// Phase 6 RED: Route Integration, Bell Badge & Placeholder Retirement (INT-001 through INT-010)
// Authoritative References:
// - docs/specs/WEB-018-test-first-implementation-plan.md (Suite 8: INT-001 to INT-010)
// - docs/specs/WEB-018-ux-design-specification.md (Section 3, 4, 10, 11)
// - docs/specs/WEB-018-architecture-contract.md (Section 4 & 5)

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import * as authStorage from '../../lib/auth/storage';
import type { AuthUser } from '../../lib/auth/types';
import NotificationsPage from './page';
import { NotificationBell } from '../../components/notifications/NotificationBell';
import DashboardScreen from '../../components/dashboard/DashboardScreen';
import {
  ProfileSidebar,
  ProfileMobileBottomNav,
} from '../../components/profile/ProfileNavigation';
import {
  JobsSidebar,
  JobsMobileBottomNav,
} from '../../components/jobs/JobsNavigation';
import {
  createNotificationTestHarness,
  FIXTURE_CUSTOMER_A,
  FIXTURE_NOTIF_BOOKING_CONFIRMED,
  FIXTURE_NOTIF_BOOKING_STARTED,
  FIXTURE_NOTIF_MESSAGE_RECEIVED,
} from '../../lib/notifications/testing';

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
  usePathname: () => '/notifications',
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
  id: FIXTURE_CUSTOMER_A,
  name: 'Adaeze Okafor',
  email: 'adaeze@example.com',
  phone: '+2348031234567',
  provider: 'google',
  role: 'customer',
  isBrainWorkerApproved: false,
};

describe('WEB-018 Route Integration, Bell Badge & Placeholder Retirement (INT-001 through INT-010)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockCustomerUser);
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // INT-001: /notifications renders NotificationCenter for authenticated customer
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('INT-001: Authenticated Customer Route Rendering', () => {
    it('renders NotificationCenter feed and category tabs for authenticated user', async () => {
      render(<NotificationsPage />);

      expect(
        await screen.findByRole('heading', { level: 1, name: /notifications/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('tablist', { name: /notification categories/i })
      ).toBeInTheDocument();
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // INT-002: /notifications redirects unauthenticated visitor to /login?redirect=/notifications
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('INT-002: Unauthenticated Visitor Redirect', () => {
    it('redirects unauthenticated visitor to /login with redirect parameter', () => {
      vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(null);

      render(<NotificationsPage />);

      expect(mockReplace).toHaveBeenCalledWith(
        expect.stringMatching(/\/login\?redirect=%2Fnotifications|\/login\?redirect=\/notifications/)
      );
      expect(
        screen.queryByRole('heading', { level: 1, name: /notifications/i })
      ).not.toBeInTheDocument();
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // INT-003: Navigation header bell displays live unread count badge
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('INT-003: Navigation header bell live unread count badge', () => {
    it('displays unread badge count and accessibility label when unread items exist', async () => {
      const harness = createNotificationTestHarness();
      harness.testController.seed([
        FIXTURE_NOTIF_BOOKING_CONFIRMED,
        FIXTURE_NOTIF_BOOKING_STARTED,
        FIXTURE_NOTIF_MESSAGE_RECEIVED,
      ]);

      render(
        <NotificationBell
          customerId={mockCustomerUser.id}
          repository={harness.repository}
        />
      );

      const badge = await screen.findByTestId('notification-bell-badge');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent('3');
      expect(badge).toHaveAttribute('aria-label', '3 unread notifications');
    });

    it('omits badge when unread count is zero', async () => {
      const harness = createNotificationTestHarness();
      harness.testController.seed([]);

      render(
        <NotificationBell
          customerId={mockCustomerUser.id}
          repository={harness.repository}
        />
      );

      await waitFor(() => {
        expect(screen.queryByTestId('notification-bell-badge')).not.toBeInTheDocument();
      });
    });

    it('caps displayed badge count at 99+ when unread items exceed 99', async () => {
      const harness = createNotificationTestHarness();
      vi.spyOn(harness.repository, 'getUnreadCount').mockResolvedValue(125);

      render(
        <NotificationBell
          customerId={mockCustomerUser.id}
          repository={harness.repository}
        />
      );

      const badge = await screen.findByTestId('notification-bell-badge');
      expect(badge).toHaveTextContent('99+');
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // INT-004: Clicking navigation header bell navigates directly to /notifications
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('INT-004: Header bell click navigation', () => {
    it('routes directly to /notifications upon bell click', async () => {
      const harness = createNotificationTestHarness();

      render(
        <NotificationBell
          customerId={mockCustomerUser.id}
          repository={harness.repository}
        />
      );

      const bellBtn = await screen.findByTestId('notification-bell');
      fireEvent.click(bellBtn);

      expect(mockPush).toHaveBeenCalledWith('/notifications');
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // INT-005: Mobile bottom bar notification trigger navigates directly to /notifications
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('INT-005: Mobile bottom bar notification trigger', () => {
    it('navigates directly to /notifications from Profile mobile bottom navigation', () => {
      render(<ProfileMobileBottomNav onOpenNoticeDialog={vi.fn()} />);

      const alertsBtn = screen.getByRole('button', { name: /alerts/i });
      fireEvent.click(alertsBtn);

      expect(mockPush).toHaveBeenCalledWith('/notifications');
    });

    it('navigates directly to /notifications from Jobs mobile bottom navigation', () => {
      render(<JobsMobileBottomNav onOpenNoticeDialog={vi.fn()} />);

      const alertsBtn = screen.getByRole('button', { name: /alerts/i });
      fireEvent.click(alertsBtn);

      expect(mockPush).toHaveBeenCalledWith('/notifications');
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // INT-006: DashboardScreen notification bell and tab navigate to /notifications without opening placeholder modal
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('INT-006: DashboardScreen placeholder retirement', () => {
    it('navigates to /notifications without opening placeholder modal or rendering "Soon" badge', () => {
      render(<DashboardScreen />);

      const notifBtn = screen.getByRole('button', { name: /notifications/i });
      expect(notifBtn).toBeInTheDocument();
      // "Soon" indicator pill should be retired
      expect(screen.queryByText(/^Soon$/i)).not.toBeInTheDocument();

      fireEvent.click(notifBtn);

      expect(mockPush).toHaveBeenCalledWith('/notifications');
      expect(screen.queryByText(/notifications coming soon/i)).not.toBeInTheDocument();
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // INT-007: ProfileNavigation notification bell navigates to /notifications without opening placeholder modal
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('INT-007: ProfileNavigation placeholder retirement', () => {
    it('routes directly to /notifications and does not trigger obsolete notice modal', () => {
      const mockNotice = vi.fn();
      render(
        <ProfileSidebar
          customerName="Adaeze Okafor"
          customerEmail="adaeze@example.com"
          onSignOut={vi.fn()}
          onOpenNoticeDialog={mockNotice}
        />
      );

      const notifBtn = screen.getByRole('button', { name: /notifications/i });
      fireEvent.click(notifBtn);

      expect(mockPush).toHaveBeenCalledWith('/notifications');
      expect(mockNotice).not.toHaveBeenCalledWith('notifications');
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // INT-008: JobsNavigation notification bell navigates to /notifications without opening placeholder modal
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('INT-008: JobsNavigation placeholder retirement', () => {
    it('routes directly to /notifications and does not trigger obsolete notice modal', () => {
      const mockNotice = vi.fn();
      render(
        <JobsSidebar
          customer={null}
          onSignOut={vi.fn()}
          onOpenNoticeDialog={mockNotice}
        />
      );

      const notifBtn = screen.getByRole('button', { name: /notifications/i });
      fireEvent.click(notifBtn);

      expect(mockPush).toHaveBeenCalledWith('/notifications');
      expect(mockNotice).not.toHaveBeenCalledWith('notifications');
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // INT-009: Footer link in Notification Center navigates cleanly to /profile?tab=notifications
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('INT-009: Footer channel preferences link', () => {
    it('renders channel preferences card routing to /profile?tab=notifications', async () => {
      render(<NotificationsPage />);

      const channelLink = await screen.findByRole('button', {
        name: /manage notification channels in profile/i,
      });
      expect(channelLink).toBeInTheDocument();

      fireEvent.click(channelLink);
      expect(mockPush).toHaveBeenCalledWith('/profile?tab=notifications');
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // INT-010: Prerender guard prevents ReferenceError during static generation
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('INT-010: Static generation safety', () => {
    it('executes component tree safely without throwing location ReferenceErrors', () => {
      expect(() => render(<NotificationsPage />)).not.toThrow();
    });
  });
});

// apps/web/lib/notifications/repository.test.ts
// Phase 2 RED: Notification Repository Contract & Customer Isolation Tests (REP-001 – REP-016)
// Governed by: WEB-018 Architecture Contract v1.0 & Test-First Implementation Plan v1.0
//
// In Phase 2 RED, the production repository stub in ./repository.ts throws 'Not implemented'
// for all methods, producing genuine RED failures for REP-001 through REP-014.
// Boundary tests REP-015 and REP-016 assert physical module isolation and barrel discipline.

import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import type { INotificationRepository, CustomerNotification } from './types';
import { UnauthorizedError, NotFoundError } from './types';
import {
  createNotificationTestHarness,
  type INotificationTestController,
  FIXTURE_CUSTOMER_A,
  FIXTURE_CUSTOMER_B,
  FIXTURE_UNAUTHENTICATED,
  FIXTURE_NOTIF_BOOKING_CONFIRMED,
  FIXTURE_NOTIF_BOOKING_STARTED,
  FIXTURE_NOTIF_BOOKING_COMPLETED,
  FIXTURE_NOTIFICATIONS_CUSTOMER_A,
  FIXTURE_NOTIFICATION_CUSTOMER_B,
} from './testing';

describe('WEB-018 NotificationRepository Contract (REP-001 – REP-016)', () => {
  let repo: INotificationRepository;
  let ctrl: INotificationTestController;

  beforeEach(() => {
    const harness = createNotificationTestHarness();
    repo = harness.repository;
    ctrl = harness.testController;
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // REP-001: Empty item list and 0 unread count for fresh customer
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('REP-001: Returns empty item list and 0 unread count for customer with no notifications', () => {
    it('returns empty result structure when customer has no notifications', async () => {
      const result = await repo.getNotifications('cust-empty-001');

      expect(result.items).toEqual([]);
      expect(result.unreadCount).toBe(0);
      expect(result.categoryCounts).toEqual({
        all: 0,
        bookings: 0,
        messages_payments: 0,
        account: 0,
      });
      expect(result.hasMore).toBe(false);
      expect(result.nextCursor).toBeNull();
    });

    it('returns 0 unread count when customer has no notifications', async () => {
      const count = await repo.getUnreadCount('cust-empty-001');
      expect(count).toBe(0);
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // REP-002: Notifications sorted strictly descending by createdAt
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('REP-002: Returns customer notifications sorted strictly descending by createdAt', () => {
    it('returns notifications sorted newest first (createdAt DESC)', async () => {
      ctrl.seed(FIXTURE_NOTIFICATIONS_CUSTOMER_A);

      const result = await repo.getNotifications(FIXTURE_CUSTOMER_A);

      expect(result.items.length).toBe(FIXTURE_NOTIFICATIONS_CUSTOMER_A.length);
      for (let i = 0; i < result.items.length - 1; i++) {
        const current = result.items[i]!;
        const next = result.items[i + 1]!;
        expect(new Date(current.createdAt).getTime()).toBeGreaterThanOrEqual(
          new Date(next.createdAt).getTime()
        );
      }
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // REP-003: Customer Isolation
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('REP-003: Customer isolation prevents accessing notifications belonging to another customer', () => {
    it('only returns notifications where recipientId matches the querying customer', async () => {
      ctrl.seed(FIXTURE_NOTIFICATIONS_CUSTOMER_A);
      ctrl.seedOne(FIXTURE_NOTIFICATION_CUSTOMER_B);

      const resultA = await repo.getNotifications(FIXTURE_CUSTOMER_A);
      const resultB = await repo.getNotifications(FIXTURE_CUSTOMER_B);

      expect(resultA.items.every((n) => n.recipientId === FIXTURE_CUSTOMER_A)).toBe(true);
      expect(resultA.items.some((n) => n.id === FIXTURE_NOTIFICATION_CUSTOMER_B.id)).toBe(false);

      expect(resultB.items.every((n) => n.recipientId === FIXTURE_CUSTOMER_B)).toBe(true);
      expect(resultB.items.length).toBe(1);
      expect(resultB.items[0]!.id).toBe(FIXTURE_NOTIFICATION_CUSTOMER_B.id);
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // REP-004: Rejection of unauthenticated or empty customerId
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('REP-004: Rejects queries with empty or invalid customerId with UnauthorizedError', () => {
    it('rejects getNotifications with empty customerId', async () => {
      await expect(repo.getNotifications(FIXTURE_UNAUTHENTICATED)).rejects.toThrow(
        UnauthorizedError
      );
    });

    it('rejects getNotifications with whitespace-only customerId', async () => {
      await expect(repo.getNotifications('   ')).rejects.toThrow(UnauthorizedError);
    });

    it('rejects getUnreadCount with empty customerId', async () => {
      await expect(repo.getUnreadCount(FIXTURE_UNAUTHENTICATED)).rejects.toThrow(
        UnauthorizedError
      );
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // REP-005: Accurate unread count calculation
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('REP-005: Calculates unread count accurately (isRead === false)', () => {
    it('returns exact count of unread notifications for the querying customer', async () => {
      ctrl.seed(FIXTURE_NOTIFICATIONS_CUSTOMER_A);
      ctrl.seedOne(FIXTURE_NOTIFICATION_CUSTOMER_B);

      const unreadCount = await repo.getUnreadCount(FIXTURE_CUSTOMER_A);
      // In FIXTURE_NOTIFICATIONS_CUSTOMER_A: exactly 6 notifications have isRead: false
      expect(unreadCount).toBe(6);
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // REP-006: Category count breakdown
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('REP-006: Returns accurate category count breakdown across all categories', () => {
    it('reports accurate counts for all, bookings, messages_payments, and account', async () => {
      ctrl.seed(FIXTURE_NOTIFICATIONS_CUSTOMER_A);

      const result = await repo.getNotifications(FIXTURE_CUSTOMER_A);

      expect(result.categoryCounts).toEqual({
        all: 12,
        bookings: 4,
        messages_payments: 4,
        account: 4,
      });
    });

    it('filters items correctly when category filter option is provided', async () => {
      ctrl.seed(FIXTURE_NOTIFICATIONS_CUSTOMER_A);

      const bookingResult = await repo.getNotifications(FIXTURE_CUSTOMER_A, {
        category: 'bookings',
      });

      expect(bookingResult.items.length).toBe(4);
      expect(bookingResult.items.every((n) => n.category === 'bookings')).toBe(true);
      // Category counts still show platform totals for tab badge presentation
      expect(bookingResult.categoryCounts.all).toBe(12);
      expect(bookingResult.categoryCounts.bookings).toBe(4);
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // REP-007: markAsRead mutates single record
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('REP-007: markAsRead mutates single record to isRead: true and sets readAt timestamp', () => {
    it('updates isRead to true and records valid ISO readAt', async () => {
      ctrl.seed(FIXTURE_NOTIFICATIONS_CUSTOMER_A);

      const before = FIXTURE_NOTIF_BOOKING_CONFIRMED;
      expect(before.isRead).toBe(false);

      const updated = await repo.markAsRead(FIXTURE_CUSTOMER_A, before.id);

      expect(updated.id).toBe(before.id);
      expect(updated.isRead).toBe(true);
      expect(typeof updated.readAt).toBe('string');
      expect(Number.isNaN(new Date(updated.readAt!).getTime())).toBe(false);

      const unreadCount = await repo.getUnreadCount(FIXTURE_CUSTOMER_A);
      expect(unreadCount).toBe(5);
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // REP-008: markAsRead rejects unauthorized customer access
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('REP-008: markAsRead rejects if notification does not belong to caller', () => {
    it('rejects with UnauthorizedError when customer attempts to mark foreign notification read', async () => {
      ctrl.seed(FIXTURE_NOTIFICATIONS_CUSTOMER_A);
      ctrl.seedOne(FIXTURE_NOTIFICATION_CUSTOMER_B);

      await expect(
        repo.markAsRead(FIXTURE_CUSTOMER_A, FIXTURE_NOTIFICATION_CUSTOMER_B.id)
      ).rejects.toThrow(UnauthorizedError);
    });

    it('rejects with UnauthorizedError when customerId is empty', async () => {
      await expect(
        repo.markAsRead(FIXTURE_UNAUTHENTICATED, FIXTURE_NOTIF_BOOKING_CONFIRMED.id)
      ).rejects.toThrow(UnauthorizedError);
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // REP-009: markAsRead rejects with NotFoundError for missing notification
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('REP-009: markAsRead rejects with NotFoundError for non-existent notification ID', () => {
    it('rejects with NotFoundError when notification ID does not exist', async () => {
      await expect(
        repo.markAsRead(FIXTURE_CUSTOMER_A, 'notif-nonexistent-999')
      ).rejects.toThrow(NotFoundError);
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // REP-010: markAllAsRead marks all customer unread notifications as read
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('REP-010: markAllAsRead marks all customer unread notifications as read and updates count', () => {
    it('marks all customer unread items as read and returns mutation count', async () => {
      ctrl.seed(FIXTURE_NOTIFICATIONS_CUSTOMER_A);
      ctrl.seedOne(FIXTURE_NOTIFICATION_CUSTOMER_B);

      const result = await repo.markAllAsRead(FIXTURE_CUSTOMER_A);

      expect(result.count).toBe(6);

      const unreadCount = await repo.getUnreadCount(FIXTURE_CUSTOMER_A);
      expect(unreadCount).toBe(0);

      // Customer B unread notification remains unmutated
      const unreadCountB = await repo.getUnreadCount(FIXTURE_CUSTOMER_B);
      expect(unreadCountB).toBe(1);
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // REP-011: markAllAsRead with category scope
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('REP-011: markAllAsRead with category scope mutates only notifications within that category', () => {
    it('marks only bookings notifications as read and leaves other categories untouched', async () => {
      ctrl.seed(FIXTURE_NOTIFICATIONS_CUSTOMER_A);

      // In bookings: notif-bk-001 and notif-bk-002 are unread (total 2 unread in bookings)
      const result = await repo.markAllAsRead(FIXTURE_CUSTOMER_A, 'bookings');

      expect(result.count).toBe(2);

      const res = await repo.getNotifications(FIXTURE_CUSTOMER_A, { category: 'bookings' });
      expect(res.items.every((n) => n.isRead)).toBe(true);

      // Overall unread decrements from 6 to 4
      const unreadTotal = await repo.getUnreadCount(FIXTURE_CUSTOMER_A);
      expect(unreadTotal).toBe(4);
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // REP-012: dismiss removes notification for caller
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('REP-012: dismiss removes or soft-archives single notification for the caller', () => {
    it('dismisses notification so it no longer appears in query results', async () => {
      ctrl.seed(FIXTURE_NOTIFICATIONS_CUSTOMER_A);

      await repo.dismiss(FIXTURE_CUSTOMER_A, FIXTURE_NOTIF_BOOKING_CONFIRMED.id);

      const result = await repo.getNotifications(FIXTURE_CUSTOMER_A);
      expect(result.items.some((n) => n.id === FIXTURE_NOTIF_BOOKING_CONFIRMED.id)).toBe(false);
      expect(result.items.length).toBe(FIXTURE_NOTIFICATIONS_CUSTOMER_A.length - 1);
    });

    it('rejects dismiss of foreign notification with UnauthorizedError', async () => {
      ctrl.seedOne(FIXTURE_NOTIFICATION_CUSTOMER_B);

      await expect(
        repo.dismiss(FIXTURE_CUSTOMER_A, FIXTURE_NOTIFICATION_CUSTOMER_B.id)
      ).rejects.toThrow(UnauthorizedError);
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // REP-013: Real-time subscriber receives pushed notification events
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('REP-013: Real-time subscriber listener receives newly pushed notification events', () => {
    it('delivers pushed domain events to subscriber and honors unsubscribe cleanup', () => {
      const received: CustomerNotification[] = [];
      const unsubscribe = repo.subscribe(FIXTURE_CUSTOMER_A, (notification) => {
        received.push(notification);
      });

      // Dispatch event for customer A
      ctrl.dispatchDomainEvent(FIXTURE_NOTIF_BOOKING_STARTED);
      expect(received).toHaveLength(1);
      expect(received[0]!.id).toBe(FIXTURE_NOTIF_BOOKING_STARTED.id);

      // Dispatch event for customer B — customer A listener must NOT receive it
      ctrl.dispatchDomainEvent(FIXTURE_NOTIFICATION_CUSTOMER_B);
      expect(received).toHaveLength(1);

      // Unsubscribe and dispatch again
      unsubscribe();
      ctrl.dispatchDomainEvent(FIXTURE_NOTIF_BOOKING_COMPLETED);
      expect(received).toHaveLength(1);
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // REP-014: Offline cached snapshot
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('REP-014: In offline mode, returns cached snapshot with isCached: true', () => {
    it('returns cached snapshot when offline is toggled', async () => {
      ctrl.seed(FIXTURE_NOTIFICATIONS_CUSTOMER_A);

      // Warm cache while online
      await repo.getNotifications(FIXTURE_CUSTOMER_A);

      // Enter offline mode
      ctrl.setOffline(true);

      const offlineResult = await repo.getNotifications(FIXTURE_CUSTOMER_A);
      expect(offlineResult.isCached).toBe(true);
      expect(offlineResult.items.length).toBe(FIXTURE_NOTIFICATIONS_CUSTOMER_A.length);
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // REP-015: Physical module boundary — zero test imports in repository.ts
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('REP-015: Physical module boundary: production repository.ts contains 0 test imports', () => {
    it('production repository.ts source code contains 0 occurrences of testing imports', () => {
      const repoPath = resolve(__dirname, './repository.ts');
      expect(existsSync(repoPath)).toBe(true);

      const source = readFileSync(repoPath, 'utf-8');
      expect(source).not.toContain('./testing');
      expect(source).not.toContain('../testing');
      expect(source).not.toContain('/testing');
      expect(source).not.toContain('testing/fixtures');
      expect(source).not.toContain('testing/harness');
      expect(source).not.toContain('testing/controller');
      expect(source).not.toContain('testing/store');
      expect(source).not.toContain('testing/index');
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // REP-016: Production barrel exports strictly production code
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('REP-016: Production barrel index.ts exports strictly production classes and functions', () => {
    it('exports production repository and deep-link functions while exporting undefined for test controllers', async () => {
      const barrel = await import('./index');

      // Production exports must be defined
      expect(barrel.NotificationRepository).toBeDefined();
      expect(barrel.createNotificationRepository).toBeDefined();
      expect(barrel.getNotificationRepository).toBeDefined();
      expect(barrel.resolveNotificationDeepLink).toBeDefined();

      // Test infrastructure must NOT be exported from the production barrel
      const untypedBarrel = barrel as Record<string, unknown>;
      expect(untypedBarrel['createNotificationTestHarness']).toBeUndefined();
      expect(untypedBarrel['NotificationTestController']).toBeUndefined();
      expect(untypedBarrel['FIXTURE_CUSTOMER_A']).toBeUndefined();
      expect(untypedBarrel['FIXTURE_NOTIFICATIONS_CUSTOMER_A']).toBeUndefined();
    });
  });
});

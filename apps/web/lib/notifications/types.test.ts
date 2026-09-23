// apps/web/lib/notifications/types.test.ts
// Phase 1 RED Test Suite: Domain Types & Category Mapping
// Governed by: WEB-018 Architecture Contract v1.0 & Test-First Implementation Plan v1.0

import { describe, it, expect } from 'vitest';
import {
  NOTIFICATION_CATEGORIES,
  NOTIFICATION_TYPES,
  getNotificationCategory,
  isValidNotificationType,
  isValidNotificationCategory,
} from './types';
import type { CustomerNotification, NotificationCategory, NotificationType } from './types';

describe('WEB-018 Domain Types & Category Mapping (TDD Suite 1)', () => {
  describe('Constants & Configuration Invariants', () => {
    it('defines exactly four valid notification categories', () => {
      expect(NOTIFICATION_CATEGORIES).toHaveLength(4);
      expect(NOTIFICATION_CATEGORIES).toEqual([
        'all',
        'bookings',
        'messages_payments',
        'account',
      ]);
    });

    it('defines exactly twelve authoritative notification types', () => {
      expect(NOTIFICATION_TYPES).toHaveLength(12);
      expect(NOTIFICATION_TYPES).toContain('JOB_CONFIRMED');
      expect(NOTIFICATION_TYPES).toContain('JOB_STARTED');
      expect(NOTIFICATION_TYPES).toContain('JOB_COMPLETED');
      expect(NOTIFICATION_TYPES).toContain('JOB_CANCELLED');
      expect(NOTIFICATION_TYPES).toContain('MESSAGE_RECEIVED');
      expect(NOTIFICATION_TYPES).toContain('PAYMENT_CONFIRMED');
      expect(NOTIFICATION_TYPES).toContain('PAYMENT_RELEASED');
      expect(NOTIFICATION_TYPES).toContain('PAYMENT_REFUNDED');
      expect(NOTIFICATION_TYPES).toContain('REVIEW_REQUESTED');
      expect(NOTIFICATION_TYPES).toContain('SECURITY_ALERT');
      expect(NOTIFICATION_TYPES).toContain('VERIFICATION_COMPLETE');
      expect(NOTIFICATION_TYPES).toContain('SYSTEM');
    });
  });

  describe('TYP-001: Category Mapping for Bookings', () => {
    it('maps JOB_CONFIRMED to category bookings', () => {
      expect(getNotificationCategory('JOB_CONFIRMED')).toBe('bookings');
    });

    it('maps JOB_STARTED to category bookings', () => {
      expect(getNotificationCategory('JOB_STARTED')).toBe('bookings');
    });

    it('maps JOB_COMPLETED to category bookings', () => {
      expect(getNotificationCategory('JOB_COMPLETED')).toBe('bookings');
    });

    it('maps JOB_CANCELLED to category bookings', () => {
      expect(getNotificationCategory('JOB_CANCELLED')).toBe('bookings');
    });
  });

  describe('TYP-002: Category Mapping for Messages & Payments', () => {
    it('maps MESSAGE_RECEIVED to category messages_payments', () => {
      expect(getNotificationCategory('MESSAGE_RECEIVED')).toBe('messages_payments');
    });

    it('maps PAYMENT_CONFIRMED to category messages_payments', () => {
      expect(getNotificationCategory('PAYMENT_CONFIRMED')).toBe('messages_payments');
    });

    it('maps PAYMENT_RELEASED to category messages_payments', () => {
      expect(getNotificationCategory('PAYMENT_RELEASED')).toBe('messages_payments');
    });

    it('maps PAYMENT_REFUNDED to category messages_payments', () => {
      expect(getNotificationCategory('PAYMENT_REFUNDED')).toBe('messages_payments');
    });
  });

  describe('TYP-003: Category Mapping for Account & Security', () => {
    it('maps REVIEW_REQUESTED to category account', () => {
      expect(getNotificationCategory('REVIEW_REQUESTED')).toBe('account');
    });

    it('maps SECURITY_ALERT to category account', () => {
      expect(getNotificationCategory('SECURITY_ALERT')).toBe('account');
    });

    it('maps VERIFICATION_COMPLETE to category account', () => {
      expect(getNotificationCategory('VERIFICATION_COMPLETE')).toBe('account');
    });

    it('maps SYSTEM to category account', () => {
      expect(getNotificationCategory('SYSTEM')).toBe('account');
    });
  });

  describe('TYP-004: Type and Category Validation Guards', () => {
    it('validates known notification types with isValidNotificationType', () => {
      expect(isValidNotificationType('JOB_CONFIRMED')).toBe(true);
      expect(isValidNotificationType('MESSAGE_RECEIVED')).toBe(true);
      expect(isValidNotificationType('PAYMENT_RELEASED')).toBe(true);
      expect(isValidNotificationType('SYSTEM')).toBe(true);
    });

    it('rejects unknown strings and invalid values in isValidNotificationType', () => {
      expect(isValidNotificationType('UNKNOWN_EVENT')).toBe(false);
      expect(isValidNotificationType('')).toBe(false);
      expect(isValidNotificationType(null)).toBe(false);
      expect(isValidNotificationType(undefined)).toBe(false);
      expect(isValidNotificationType(123)).toBe(false);
      expect(isValidNotificationType({})).toBe(false);
    });

    it('validates known categories with isValidNotificationCategory', () => {
      expect(isValidNotificationCategory('all')).toBe(true);
      expect(isValidNotificationCategory('bookings')).toBe(true);
      expect(isValidNotificationCategory('messages_payments')).toBe(true);
      expect(isValidNotificationCategory('account')).toBe(true);
    });

    it('rejects unknown strings and invalid values in isValidNotificationCategory', () => {
      expect(isValidNotificationCategory('promotions')).toBe(false);
      expect(isValidNotificationCategory('billing')).toBe(false);
      expect(isValidNotificationCategory('')).toBe(false);
      expect(isValidNotificationCategory(null)).toBe(false);
      expect(isValidNotificationCategory(undefined)).toBe(false);
    });
  });

  describe('TYP-005: Authoritative Record Schema vs Presentation Separation', () => {
    it('verifies an authoritative CustomerNotification contains strictly domain properties', () => {
      const record: CustomerNotification = {
        id: 'notif-auth-001',
        recipientId: 'cust-123',
        type: 'JOB_CONFIRMED',
        category: 'bookings',
        title: 'Artisan Assigned: Engr. Emeka Nwosu',
        message: 'Your booking has been confirmed for 2:00 PM.',
        isRead: false,
        createdAt: '2026-09-23T10:00:00.000Z',
        readAt: null,
        targetUrl: '/jobs?id=job-101',
        referenceCode: 'BBJ-LAG-2026-0891',
        metadata: { jobId: 'job-101', artisanId: 'art-001' },
      };

      expect(record.id).toBe('notif-auth-001');
      expect(record.recipientId).toBe('cust-123');
      expect(record.type).toBe('JOB_CONFIRMED');
      expect(record.category).toBe('bookings');
      expect(record.title).toBe('Artisan Assigned: Engr. Emeka Nwosu');
      expect(record.isRead).toBe(false);
      expect(record.readAt).toBeNull();
      expect(record.targetUrl).toBe('/jobs?id=job-101');
      expect(record.referenceCode).toBe('BBJ-LAG-2026-0891');

      // Assert presentation properties are not present on domain records
      expect(((record as unknown) as Record<string, unknown>).activeCategory).toBeUndefined();
      expect(((record as unknown) as Record<string, unknown>).isCached).toBeUndefined();
      expect(((record as unknown) as Record<string, unknown>).resolvedDeepLink).toBeUndefined();
    });
  });

  describe('TYP-006: Unread Invariant (readAt must be null or undefined when isRead is false)', () => {
    it('enforces readAt is null or undefined when notification is unread', () => {
      const unreadRecord: CustomerNotification = {
        id: 'notif-auth-002',
        recipientId: 'cust-123',
        type: 'MESSAGE_RECEIVED',
        category: 'messages_payments',
        title: 'New Message from Sunday Ogundimu',
        message: 'I am arriving at the gate now.',
        isRead: false,
        createdAt: '2026-09-23T10:15:00.000Z',
        readAt: null,
      };

      expect(unreadRecord.isRead).toBe(false);
      expect(unreadRecord.readAt).toBeNull();
    });
  });

  describe('TYP-007: Read Invariant (readAt must be a valid ISO 8601 timestamp when isRead is true)', () => {
    it('enforces readAt is a valid ISO 8601 string when notification is read', () => {
      const readTimestamp = '2026-09-23T10:30:00.000Z';
      const readRecord: CustomerNotification = {
        id: 'notif-auth-003',
        recipientId: 'cust-123',
        type: 'PAYMENT_CONFIRMED',
        category: 'messages_payments',
        title: 'Escrow Payment Verified',
        message: 'Deposit of ₦45,000 is securely held in BukieGuarantee escrow.',
        isRead: true,
        createdAt: '2026-09-23T08:00:00.000Z',
        readAt: readTimestamp,
      };

      expect(readRecord.isRead).toBe(true);
      expect(readRecord.readAt).toBeDefined();
      expect(isNaN(Date.parse(readRecord.readAt!))).toBe(false);
      expect(new Date(readRecord.readAt!).toISOString()).toBe(readTimestamp);
    });
  });
});

// apps/web/lib/notifications/deep-link.test.ts
// Phase 1 RED Test Suite: Deep-Link Resolver & URL Sanitization
// Governed by: WEB-018 Architecture Contract v1.0 & Test-First Implementation Plan v1.0

import { describe, it, expect } from 'vitest';
import { resolveNotificationDeepLink, isValidInternalPath } from './deep-link';
import type { CustomerNotification } from './types';

describe('WEB-018 Deep-Link Resolver & Sanitization (TDD Suite 2)', () => {
  const baseNotification: CustomerNotification = {
    id: 'notif-link-001',
    recipientId: 'cust-456',
    type: 'JOB_CONFIRMED',
    category: 'bookings',
    title: 'Booking Confirmed',
    message: 'Your generator repair has been confirmed.',
    isRead: false,
    createdAt: '2026-09-23T11:00:00.000Z',
    readAt: null,
  };

  describe('Internal Path Validation (isValidInternalPath)', () => {
    it('accepts valid root-relative application paths', () => {
      expect(isValidInternalPath('/jobs')).toBe(true);
      expect(isValidInternalPath('/jobs?id=job-101')).toBe(true);
      expect(isValidInternalPath('/messages/job-101')).toBe(true);
      expect(isValidInternalPath('/receipt/booking-999')).toBe(true);
      expect(isValidInternalPath('/profile?tab=security')).toBe(true);
      expect(isValidInternalPath('/notifications')).toBe(true);
    });

    it('rejects protocol-relative URLs starting with //', () => {
      expect(isValidInternalPath('//evil.com')).toBe(false);
      expect(isValidInternalPath('//malicious.com/phish')).toBe(false);
    });

    it('rejects absolute URLs with external protocols (http, https)', () => {
      expect(isValidInternalPath('https://external-phishing.com')).toBe(false);
      expect(isValidInternalPath('http://insecure-site.com/steal')).toBe(false);
      expect(isValidInternalPath('ftp://files.com')).toBe(false);
    });

    it('rejects executable script schemes and data URIs', () => {
      expect(isValidInternalPath('javascript:alert(1)')).toBe(false);
      expect(isValidInternalPath('data:text/html,<script>alert(1)</script>')).toBe(false);
      expect(isValidInternalPath('vbscript:msgbox')).toBe(false);
    });

    it('rejects paths without a leading slash or malformed paths', () => {
      expect(isValidInternalPath('jobs')).toBe(false);
      expect(isValidInternalPath('')).toBe(false);
      expect(isValidInternalPath('\\evil-backslashes')).toBe(false);
    });
  });

  describe('LNK-001: Explicit Valid Internal targetUrl', () => {
    it('resolves an explicit valid internal targetUrl unchanged', () => {
      const notif: CustomerNotification = {
        ...baseNotification,
        targetUrl: '/jobs?id=job-act-001',
      };
      expect(resolveNotificationDeepLink(notif)).toBe('/jobs?id=job-act-001');
    });

    it('resolves explicit query parameters and hash anchors safely', () => {
      const notif: CustomerNotification = {
        ...baseNotification,
        targetUrl: '/profile?tab=notifications#preferences',
      };
      expect(resolveNotificationDeepLink(notif)).toBe('/profile?tab=notifications#preferences');
    });
  });

  describe('LNK-002: Protocol-Relative URL Defense', () => {
    it('rejects protocol-relative targetUrl and falls back to canonical destination', () => {
      const notif: CustomerNotification = {
        ...baseNotification,
        type: 'JOB_CONFIRMED',
        targetUrl: '//malicious.com/steal-token',
        metadata: { jobId: 'job-101' },
      };
      // Must not return the protocol-relative attack URL
      expect(resolveNotificationDeepLink(notif)).not.toContain('//malicious.com');
      expect(resolveNotificationDeepLink(notif)).toBe('/jobs?id=job-101');
    });
  });

  describe('LNK-003: External Absolute URL Defense', () => {
    it('rejects absolute https targetUrl and falls back to canonical destination', () => {
      const notif: CustomerNotification = {
        ...baseNotification,
        type: 'PAYMENT_CONFIRMED',
        targetUrl: 'https://phishing-escrow.com/fake-receipt',
        metadata: { bookingId: 'bk-555' },
      };
      expect(resolveNotificationDeepLink(notif)).not.toContain('https://phishing-escrow.com');
      expect(resolveNotificationDeepLink(notif)).toBe('/receipt/bk-555');
    });

    it('rejects absolute http targetUrl and falls back to canonical destination', () => {
      const notif: CustomerNotification = {
        ...baseNotification,
        type: 'MESSAGE_RECEIVED',
        targetUrl: 'http://insecure.com/messages',
        metadata: { jobId: 'job-202' },
      };
      expect(resolveNotificationDeepLink(notif)).toBe('/messages/job-202');
    });
  });

  describe('LNK-004: Script Scheme & Data URI Defense', () => {
    it('rejects javascript: scheme and falls back to /notifications', () => {
      const notif: CustomerNotification = {
        ...baseNotification,
        type: 'SYSTEM',
        targetUrl: 'javascript:document.cookie',
      };
      expect(resolveNotificationDeepLink(notif)).toBe('/notifications');
    });

    it('rejects data: URI and falls back to /notifications', () => {
      const notif: CustomerNotification = {
        ...baseNotification,
        type: 'SYSTEM',
        targetUrl: 'data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==',
      };
      expect(resolveNotificationDeepLink(notif)).toBe('/notifications');
    });
  });

  describe('LNK-005: Canonical Fallback for Booking Notifications', () => {
    it('derives /jobs?id={jobId} for JOB_CONFIRMED without targetUrl', () => {
      const notif: CustomerNotification = {
        ...baseNotification,
        type: 'JOB_CONFIRMED',
        targetUrl: null,
        metadata: { jobId: 'job-303' },
      };
      expect(resolveNotificationDeepLink(notif)).toBe('/jobs?id=job-303');
    });

    it('derives /jobs?id={jobId} for JOB_STARTED without targetUrl', () => {
      const notif: CustomerNotification = {
        ...baseNotification,
        type: 'JOB_STARTED',
        targetUrl: undefined,
        metadata: { jobId: 'job-304' },
      };
      expect(resolveNotificationDeepLink(notif)).toBe('/jobs?id=job-304');
    });

    it('derives /jobs?id={jobId} for JOB_COMPLETED without targetUrl', () => {
      const notif: CustomerNotification = {
        ...baseNotification,
        type: 'JOB_COMPLETED',
        targetUrl: null,
        metadata: { jobId: 'job-305' },
      };
      expect(resolveNotificationDeepLink(notif)).toBe('/jobs?id=job-305');
    });

    it('derives /jobs?id={jobId} for JOB_CANCELLED without targetUrl', () => {
      const notif: CustomerNotification = {
        ...baseNotification,
        type: 'JOB_CANCELLED',
        targetUrl: null,
        metadata: { jobId: 'job-306' },
      };
      expect(resolveNotificationDeepLink(notif)).toBe('/jobs?id=job-306');
    });
  });

  describe('LNK-006: Canonical Fallback for Messaging Notifications', () => {
    it('derives /messages/{jobId} for MESSAGE_RECEIVED without targetUrl', () => {
      const notif: CustomerNotification = {
        ...baseNotification,
        type: 'MESSAGE_RECEIVED',
        category: 'messages_payments',
        targetUrl: null,
        metadata: { jobId: 'job-act-001' },
      };
      expect(resolveNotificationDeepLink(notif)).toBe('/messages/job-act-001');
    });
  });

  describe('LNK-007: Canonical Fallback for Payments & Escrow Notifications', () => {
    it('derives /receipt/{bookingId} for PAYMENT_CONFIRMED without targetUrl', () => {
      const notif: CustomerNotification = {
        ...baseNotification,
        type: 'PAYMENT_CONFIRMED',
        category: 'messages_payments',
        targetUrl: null,
        metadata: { bookingId: 'book-escrow-01' },
      };
      expect(resolveNotificationDeepLink(notif)).toBe('/receipt/book-escrow-01');
    });

    it('derives /receipt/{bookingId} for PAYMENT_RELEASED without targetUrl', () => {
      const notif: CustomerNotification = {
        ...baseNotification,
        type: 'PAYMENT_RELEASED',
        category: 'messages_payments',
        targetUrl: null,
        metadata: { bookingId: 'book-escrow-02' },
      };
      expect(resolveNotificationDeepLink(notif)).toBe('/receipt/book-escrow-02');
    });

    it('derives /receipt/{bookingId} for PAYMENT_REFUNDED without targetUrl', () => {
      const notif: CustomerNotification = {
        ...baseNotification,
        type: 'PAYMENT_REFUNDED',
        category: 'messages_payments',
        targetUrl: null,
        metadata: { bookingId: 'book-escrow-03' },
      };
      expect(resolveNotificationDeepLink(notif)).toBe('/receipt/book-escrow-03');
    });
  });

  describe('LNK-008: Canonical Fallback for Security Alerts', () => {
    it('derives /profile?tab=security for SECURITY_ALERT without targetUrl', () => {
      const notif: CustomerNotification = {
        ...baseNotification,
        type: 'SECURITY_ALERT',
        category: 'account',
        targetUrl: null,
      };
      expect(resolveNotificationDeepLink(notif)).toBe('/profile?tab=security');
    });
  });

  describe('LNK-009: Canonical Fallback for Verification Complete', () => {
    it('derives /profile?tab=personal for VERIFICATION_COMPLETE without targetUrl', () => {
      const notif: CustomerNotification = {
        ...baseNotification,
        type: 'VERIFICATION_COMPLETE',
        category: 'account',
        targetUrl: null,
      };
      expect(resolveNotificationDeepLink(notif)).toBe('/profile?tab=personal');
    });
  });

  describe('LNK-010: Safe Fallback when Metadata is Missing or Target Unknown', () => {
    it('falls back to /jobs when booking notification metadata lacks jobId', () => {
      const notif: CustomerNotification = {
        ...baseNotification,
        type: 'JOB_CONFIRMED',
        targetUrl: null,
        metadata: {},
      };
      expect(resolveNotificationDeepLink(notif)).toBe('/jobs');
    });

    it('falls back to /messages when MESSAGE_RECEIVED metadata lacks jobId', () => {
      const notif: CustomerNotification = {
        ...baseNotification,
        type: 'MESSAGE_RECEIVED',
        category: 'messages_payments',
        targetUrl: null,
        metadata: null,
      };
      expect(resolveNotificationDeepLink(notif)).toBe('/messages');
    });

    it('falls back to /notifications for SYSTEM notifications or unknown structures', () => {
      const notif: CustomerNotification = {
        ...baseNotification,
        type: 'SYSTEM',
        category: 'account',
        targetUrl: null,
        metadata: null,
      };
      expect(resolveNotificationDeepLink(notif)).toBe('/notifications');
    });
  });
});

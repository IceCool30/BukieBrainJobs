// apps/web/lib/notifications/push-adapter.test.ts
// Phase 3 RED: Push Capability Adapter Tests (PSH-001 – PSH-007)
// Governed by: WEB-018 Architecture Contract v1.0 & Test-First Implementation Plan v1.0
//
// In Phase 3 RED, the production stub in ./push-adapter.ts throws 'Not implemented'
// for methods, producing genuine RED failures for PSH-001 through PSH-005, and PSH-007,
// while PSH-006 passes, validating the non-aggressive constructor invariant.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { BrowserPushAdapter, getBrowserPushAdapter, resetBrowserPushAdapter } from './push-adapter';
import { MockPushAdapter } from './testing';

describe('WEB-018 Push Capability Adapter (PSH-001 – PSH-007)', () => {
  let originalNotification: typeof window.Notification | undefined;

  beforeEach(() => {
    resetBrowserPushAdapter();
    originalNotification = (globalThis as unknown as { Notification?: typeof window.Notification }).Notification;
  });

  afterEach(() => {
    if (originalNotification !== undefined) {
      (globalThis as unknown as { Notification: typeof window.Notification }).Notification = originalNotification;
    } else {
      delete (globalThis as unknown as { Notification?: unknown }).Notification;
    }
    vi.restoreAllMocks();
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PSH-001: Detects unsupported environment when Notification is undefined
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('PSH-001: Detects unsupported environment when window.Notification is undefined', () => {
    it('reports isSupported as false when Notification is missing from window', () => {
      delete (globalThis as unknown as { Notification?: unknown }).Notification;

      const adapter = new BrowserPushAdapter();
      expect(adapter.isSupported()).toBe(false);
      expect(adapter.getPermission()).toBe('unsupported');
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PSH-002: Reports 'default' when permission is not yet decided
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('PSH-002: Reports default permission state', () => {
    it('returns default when user has not yet interacted with native permission prompt', () => {
      (globalThis as unknown as { Notification: { permission: NotificationPermission } }).Notification = {
        permission: 'default',
      } as typeof window.Notification;

      const adapter = new BrowserPushAdapter();
      expect(adapter.isSupported()).toBe(true);
      expect(adapter.getPermission()).toBe('default');
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PSH-003: Reports 'granted' when permission is allowed
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('PSH-003: Reports granted permission state', () => {
    it('returns granted when browser push permission is allowed', () => {
      (globalThis as unknown as { Notification: { permission: NotificationPermission } }).Notification = {
        permission: 'granted',
      } as typeof window.Notification;

      const adapter = new BrowserPushAdapter();
      expect(adapter.getPermission()).toBe('granted');
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PSH-004: Reports 'denied' when permission is blocked
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('PSH-004: Reports denied permission state', () => {
    it('returns denied when browser push permission is blocked', () => {
      (globalThis as unknown as { Notification: { permission: NotificationPermission } }).Notification = {
        permission: 'denied',
      } as typeof window.Notification;

      const adapter = new BrowserPushAdapter();
      expect(adapter.getPermission()).toBe('denied');
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PSH-005: requestPermission invokes native browser API on explicit call
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('PSH-005: Explicit permission request invocation', () => {
    it('invokes native Notification.requestPermission only when requestPermission is called', async () => {
      const requestPermissionSpy = vi.fn().mockResolvedValue('granted');
      (globalThis as unknown as {
        Notification: {
          permission: NotificationPermission;
          requestPermission: typeof window.Notification.requestPermission;
        };
      }).Notification = {
        permission: 'default',
        requestPermission: requestPermissionSpy,
      } as unknown as typeof window.Notification;

      const adapter = new BrowserPushAdapter();
      expect(requestPermissionSpy).not.toHaveBeenCalled();

      const result = await adapter.requestPermission();
      expect(requestPermissionSpy).toHaveBeenCalledTimes(1);
      expect(result).toBe('granted');
    });

    it('returns unsupported when requestPermission is called in unsupported environment', async () => {
      delete (globalThis as unknown as { Notification?: unknown }).Notification;

      const adapter = new BrowserPushAdapter();
      const result = await adapter.requestPermission();
      expect(result).toBe('unsupported');
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PSH-006: Non-aggressive invariant: constructor does not prompt
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('PSH-006: Non-aggressive permission invariant', () => {
    it('never calls requestPermission during adapter instantiation or getter retrieval', () => {
      const requestPermissionSpy = vi.fn();
      (globalThis as unknown as {
        Notification: {
          permission: NotificationPermission;
          requestPermission: typeof window.Notification.requestPermission;
        };
      }).Notification = {
        permission: 'default',
        requestPermission: requestPermissionSpy,
      } as unknown as typeof window.Notification;

      // 1. Direct constructor call
      new BrowserPushAdapter();
      expect(requestPermissionSpy).toHaveBeenCalledTimes(0);

      // 2. Singleton getter call
      getBrowserPushAdapter();
      expect(requestPermissionSpy).toHaveBeenCalledTimes(0);
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PSH-007: Test alert triggers native Notification constructor only when granted
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('PSH-007: Sandbox test alert trigger behavior', () => {
    it('returns false and does not instantiate Notification when permission is not granted', async () => {
      const mockConstructor = vi.fn();
      (globalThis as unknown as {
        Notification: unknown;
      }).Notification = class MockNotification {
        static permission: NotificationPermission = 'default';
        constructor(title: string, options?: NotificationOptions) {
          mockConstructor(title, options);
        }
      };

      const adapter = new BrowserPushAdapter();
      const sent = await adapter.sendTestAlert?.('BukieBrainJobs', 'Your artisan has arrived.');
      expect(sent).toBe(false);
      expect(mockConstructor).not.toHaveBeenCalled();
    });

    it('instantiates Notification and returns true when permission is granted', async () => {
      const mockConstructor = vi.fn();
      (globalThis as unknown as {
        Notification: unknown;
      }).Notification = class MockNotification {
        static permission: NotificationPermission = 'granted';
        constructor(title: string, options?: NotificationOptions) {
          mockConstructor(title, options);
        }
      };

      const adapter = new BrowserPushAdapter();
      const sent = await adapter.sendTestAlert?.('BukieBrainJobs', 'Your artisan has arrived.');
      expect(sent).toBe(true);
      expect(mockConstructor).toHaveBeenCalledWith('BukieBrainJobs', expect.objectContaining({
        body: 'Your artisan has arrived.',
      }));
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Boundary & Mock Validation
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('PSH-Boundary: Physical module boundary and MockPushAdapter validation', () => {
    it('production push-adapter.ts contains 0 test imports', () => {
      const adapterPath = resolve(__dirname, './push-adapter.ts');
      expect(existsSync(adapterPath)).toBe(true);

      const source = readFileSync(adapterPath, 'utf-8');
      expect(source).not.toContain('./testing');
      expect(source).not.toContain('../testing');
      expect(source).not.toContain('/testing');
      expect(source).not.toContain('testing/fixtures');
      expect(source).not.toContain('testing/harness');
      expect(source).not.toContain('testing/push-adapter');
    });

    it('MockPushAdapter provides deterministic test simulation without browser globals', async () => {
      const mock = new MockPushAdapter();
      expect(mock.isSupported()).toBe(true);
      expect(mock.getPermission()).toBe('default');

      mock.setPermission('granted');
      expect(mock.getPermission()).toBe('granted');

      const sent = await mock.sendTestAlert('Test Title', 'Test Body');
      expect(sent).toBe(true);
      expect(mock.alertsSent).toHaveLength(1);
      expect(mock.alertsSent[0]?.title).toBe('Test Title');
    });
  });
});

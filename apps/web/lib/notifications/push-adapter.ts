// apps/web/lib/notifications/push-adapter.ts
// Phase 3 GREEN: Browser Push Capability Adapter Implementation
// Authoritative Reference: WEB-018 Architecture Contract v1.0
//
// Invariant Rules:
// 1. Strictly ZERO imports from test harness or fixtures.
// 2. Implements IPushNotificationAdapter.
// 3. Non-aggressive invariant: constructor NEVER requests permission.
// 4. Safe capability detection in SSR, webview, and headless environments.

import type { IPushNotificationAdapter, PushPermissionState } from './types';

export class BrowserPushAdapter implements IPushNotificationAdapter {
  constructor() {
    // Non-aggressive invariant: never invoke requestPermission() during construction
  }

  isSupported(): boolean {
    if (typeof window === 'undefined') {
      return false;
    }
    return 'Notification' in window && typeof window.Notification !== 'undefined';
  }

  getPermission(): PushPermissionState {
    if (!this.isSupported()) {
      return 'unsupported';
    }
    return window.Notification.permission as PushPermissionState;
  }

  async requestPermission(): Promise<PushPermissionState> {
    if (!this.isSupported()) {
      return 'unsupported';
    }
    const result = await window.Notification.requestPermission();
    return result as PushPermissionState;
  }

  async sendTestAlert(title: string, body: string): Promise<boolean> {
    if (!this.isSupported() || this.getPermission() !== 'granted') {
      return false;
    }

    try {
      new window.Notification(title, {
        body,
        icon: '/favicon.ico',
      });
      return true;
    } catch {
      return false;
    }
  }
}

let defaultPushAdapter: IPushNotificationAdapter | null = null;

export function getBrowserPushAdapter(): IPushNotificationAdapter {
  if (!defaultPushAdapter) {
    defaultPushAdapter = new BrowserPushAdapter();
  }
  return defaultPushAdapter;
}

export function resetBrowserPushAdapter(): void {
  defaultPushAdapter = null;
}

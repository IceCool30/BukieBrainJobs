// apps/web/lib/notifications/push-adapter.ts
// Phase 3 RED: Push Capability Adapter Stub
// Authoritative Reference: WEB-018 Architecture Contract v1.0
//
// Invariant Rules:
// 1. Strictly ZERO imports from test harness or fixtures.
// 2. Implements IPushNotificationAdapter.
// 3. Non-aggressive invariant: constructor NEVER requests permission.
// 4. Methods throw 'Not implemented' during Phase 3 RED.

import type { IPushNotificationAdapter, PushPermissionState } from './types';

export class BrowserPushAdapter implements IPushNotificationAdapter {
  constructor() {
    // Non-aggressive invariant: never invoke requestPermission() during construction
  }

  isSupported(): boolean {
    throw new Error('Not implemented');
  }

  getPermission(): PushPermissionState {
    throw new Error('Not implemented');
  }

  async requestPermission(): Promise<PushPermissionState> {
    throw new Error('Not implemented');
  }

  async sendTestAlert(): Promise<boolean> {
    throw new Error('Not implemented');
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

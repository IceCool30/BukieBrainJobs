// apps/web/lib/notifications/testing/push-adapter.ts
// Deterministic mock push adapter for WEB-018 testing.
// Strictly for test use. Must never be imported by production code.

import type { IPushNotificationAdapter, PushPermissionState } from '../types';

export class MockPushAdapter implements IPushNotificationAdapter {
  private supported: boolean = true;
  private permission: PushPermissionState = 'default';
  public requestedCount: number = 0;
  public alertsSent: Array<{ title: string; body: string }> = [];

  setSupported(supported: boolean): void {
    this.supported = supported;
    if (!supported) {
      this.permission = 'unsupported';
    }
  }

  setPermission(permission: PushPermissionState): void {
    this.permission = permission;
  }

  isSupported(): boolean {
    return this.supported;
  }

  getPermission(): PushPermissionState {
    if (!this.supported) {
      return 'unsupported';
    }
    return this.permission;
  }

  async requestPermission(): Promise<PushPermissionState> {
    this.requestedCount += 1;
    if (!this.supported) {
      this.permission = 'unsupported';
      return 'unsupported';
    }
    if (this.permission === 'default') {
      this.permission = 'granted';
    }
    return this.permission;
  }

  async sendTestAlert(title: string, body: string): Promise<boolean> {
    if (!this.supported || this.permission !== 'granted') {
      return false;
    }
    this.alertsSent.push({ title, body });
    return true;
  }

  reset(): void {
    this.supported = true;
    this.permission = 'default';
    this.requestedCount = 0;
    this.alertsSent = [];
  }
}

export function createMockPushAdapter(): MockPushAdapter {
  return new MockPushAdapter();
}

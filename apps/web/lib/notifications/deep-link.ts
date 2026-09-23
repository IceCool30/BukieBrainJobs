// apps/web/lib/notifications/deep-link.ts
// Deep-Link Resolver and URL Sanitizer for WEB-018
// Governed by: WEB-018 Architecture Contract v1.0 & Test-First Implementation Plan v1.0

import type { CustomerNotification } from './types';

// Minimal stubs for RED phase (production implementation deliberately absent)

export function isValidInternalPath(path: string): boolean {
  return false;
}

export function resolveNotificationDeepLink(notification: CustomerNotification): string {
  throw new Error(`Not implemented: resolveNotificationDeepLink for ${notification.id}`);
}

// apps/web/lib/notifications/deep-link.ts
// Deep-Link Resolver and URL Sanitizer for WEB-018
// Governed by: WEB-018 Architecture Contract v1.0 & Test-First Implementation Plan v1.0

import type { CustomerNotification } from './types';

/**
 * Validates that a path is a safe, internal, root-relative application URL.
 * Rejects protocol-relative URLs (//), external protocols (http:, https:, ftp:),
 * script execution schemes (javascript:, vbscript:, data:), and backslash-based paths.
 */
export function isValidInternalPath(path: string): boolean {
  if (typeof path !== 'string' || path.length === 0) {
    return false;
  }

  // Must begin with a single slash and not a protocol-relative double slash
  if (!path.startsWith('/') || path.startsWith('//') || path.includes('\\')) {
    return false;
  }

  // Disallow scheme indicators (:) before query string or hash anchor
  const pathWithoutQuery = path.split('?')[0].split('#')[0];
  if (pathWithoutQuery.includes(':')) {
    return false;
  }

  // Guard against lowercased dangerous protocols
  const lower = path.toLowerCase();
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('data:') ||
    lower.startsWith('vbscript:')
  ) {
    return false;
  }

  return true;
}

/**
 * Resolves a notification to a safe internal application deep-link URL.
 * If targetUrl is explicitly provided and passes validation, it is used directly.
 * Otherwise, resolves the canonical destination based on notification type and metadata.
 * Always fails safe to /notifications if metadata is missing or malformed.
 */
export function resolveNotificationDeepLink(notification: CustomerNotification): string {
  // 1. If explicit valid internal targetUrl is provided, return it directly
  if (notification.targetUrl && isValidInternalPath(notification.targetUrl)) {
    return notification.targetUrl;
  }

  // 2. Canonical fallbacks based on authoritative notification type
  switch (notification.type) {
    case 'JOB_CONFIRMED':
    case 'JOB_STARTED':
    case 'JOB_COMPLETED':
    case 'JOB_CANCELLED': {
      const jobId = notification.metadata?.jobId;
      return typeof jobId === 'string' && jobId.trim().length > 0
        ? `/jobs?id=${encodeURIComponent(jobId.trim())}`
        : '/jobs';
    }

    case 'MESSAGE_RECEIVED': {
      const jobId = notification.metadata?.jobId;
      return typeof jobId === 'string' && jobId.trim().length > 0
        ? `/messages/${encodeURIComponent(jobId.trim())}`
        : '/messages';
    }

    case 'PAYMENT_CONFIRMED':
    case 'PAYMENT_RELEASED':
    case 'PAYMENT_REFUNDED': {
      const bookingId = notification.metadata?.bookingId;
      return typeof bookingId === 'string' && bookingId.trim().length > 0
        ? `/receipt/${encodeURIComponent(bookingId.trim())}`
        : '/jobs';
    }

    case 'REVIEW_REQUESTED': {
      const jobId = notification.metadata?.jobId;
      return typeof jobId === 'string' && jobId.trim().length > 0
        ? `/jobs?id=${encodeURIComponent(jobId.trim())}`
        : '/jobs';
    }

    case 'SECURITY_ALERT':
      return '/profile?tab=security';

    case 'VERIFICATION_COMPLETE':
      return '/profile?tab=personal';

    case 'SYSTEM':
    default:
      return '/notifications';
  }
}

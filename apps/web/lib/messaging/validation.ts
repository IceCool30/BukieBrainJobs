// apps/web/lib/messaging/validation.ts
// Pure Domain Validation and Content Safety for WEB-017 In-App Messaging & Real-Time Chat
// Authoritative Reference: WEB-017 Architecture Contract v1.0 & Scope v1.1

import {
  type LocationPayload,
  type ImageAttachmentInput,
  MessageValidationError,
  MediaUploadError,
  MessagingError,
} from './types';

export {
  type ImageAttachmentInput,
  MessageValidationError,
  MediaUploadError,
  MessagingError,
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Validation Constants
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Maximum character limit for a single text message.
 * Counted canonically by Unicode code points.
 */
export const MAX_MESSAGE_LENGTH = 2000;

/**
 * Maximum attachment size in bytes (5.0 MB = 5 * 1024 * 1024 bytes).
 */
export const MAX_ATTACHMENT_BYTES = 5242880;

/**
 * Allowed image MIME types for message attachments.
 */
export const ALLOWED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

export type AllowedImageMimeType = typeof ALLOWED_IMAGE_MIME_TYPES[number];

/**
 * Non-printable control characters: \x00-\x08, \x0B, \x0C, \x0E-\x1F, \x7F.
 * Note: standard formatting whitespace (\t [\x09], \n [\x0A], \r [\x0D]) is intentionally excluded and preserved.
 */
const CONTROL_CHARACTERS_REGEX = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Unicode & Sanitization Helpers
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Canonical Unicode code point counter.
 * Uses Array.from(str).length to avoid surrogate pair fragmentation.
 */
export function countUnicodeCharacters(text: string): number {
  return Array.from(text).length;
}

/**
 * Sanitizes plain text content by escaping HTML control tags and entities.
 * Prevents stored XSS injection while preserving legitimate Unicode and Nigerian characters.
 */
export function sanitizeMessageText(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Domain Validation Functions
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Validates and sanitizes plain text message content.
 * Enforces non-empty, non-whitespace, code point bounds, control character rejection, and HTML escaping.
 */
export function validateTextMessage(text: unknown): string {
  if (text === null || text === undefined || typeof text !== 'string') {
    throw new MessageValidationError('Message content is required and must be a string.');
  }

  if (CONTROL_CHARACTERS_REGEX.test(text)) {
    throw new MessageValidationError('Message contains invalid non-printable control characters.');
  }

  const trimmed = text.trim();
  if (trimmed.length === 0) {
    throw new MessageValidationError('Message cannot be empty or contain only whitespace.');
  }

  const codePointCount = countUnicodeCharacters(trimmed);
  if (codePointCount > MAX_MESSAGE_LENGTH) {
    throw new MessageValidationError(
      `Message exceeds the maximum limit of ${MAX_MESSAGE_LENGTH.toLocaleString()} characters (received ${codePointCount.toLocaleString()}).`
    );
  }

  return sanitizeMessageText(trimmed);
}

/**
 * Validates an image attachment's size and MIME type.
 * Enforces 5.0 MB maximum size cap and strict MIME allowlist.
 */
export function validateImageAttachment(file: unknown): void {
  if (!file || typeof file !== 'object' || Array.isArray(file)) {
    throw new MediaUploadError('Image attachment file is required.');
  }

  const raw = file as { size?: unknown; mimeType?: unknown };

  if (
    typeof raw.size !== 'number' ||
    Number.isNaN(raw.size) ||
    !Number.isFinite(raw.size) ||
    raw.size <= 0
  ) {
    throw new MediaUploadError('Image attachment size must be a positive number.');
  }

  if (raw.size > MAX_ATTACHMENT_BYTES) {
    throw new MediaUploadError(
      `Photo exceeds 5MB limit. Maximum size is 5,242,880 bytes (received ${raw.size.toLocaleString()} bytes).`
    );
  }

  if (
    typeof raw.mimeType !== 'string' ||
    !raw.mimeType ||
    !ALLOWED_IMAGE_MIME_TYPES.includes(raw.mimeType as AllowedImageMimeType)
  ) {
    throw new MediaUploadError(
      `Invalid or unsupported MIME type '${raw.mimeType}'. Only JPEG, PNG, and WebP photos are supported.`
    );
  }
}

/**
 * Validates a structured location sharing payload.
 * Enforces latitude (-90 to 90), longitude (-180 to 180), required addressText, and ISO 8601 sharedAt.
 */
export function validateLocationPayload(payload: unknown): LocationPayload {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new MessageValidationError('Location payload must be a valid object.');
  }

  const raw = payload as Record<string, unknown>;

  // Validate latitude
  if (
    typeof raw.latitude !== 'number' ||
    Number.isNaN(raw.latitude) ||
    !Number.isFinite(raw.latitude) ||
    raw.latitude < -90 ||
    raw.latitude > 90
  ) {
    throw new MessageValidationError('Latitude must be a valid number between -90 and 90 degrees.');
  }

  // Validate longitude
  if (
    typeof raw.longitude !== 'number' ||
    Number.isNaN(raw.longitude) ||
    !Number.isFinite(raw.longitude) ||
    raw.longitude < -180 ||
    raw.longitude > 180
  ) {
    throw new MessageValidationError('Longitude must be a valid number between -180 and 180 degrees.');
  }

  // Validate addressText
  if (typeof raw.addressText !== 'string' || raw.addressText.trim().length === 0) {
    throw new MessageValidationError('Address text is required and cannot be empty.');
  }

  // Validate sharedAt timestamp (ISO 8601)
  if (typeof raw.sharedAt !== 'string' || raw.sharedAt.trim().length === 0) {
    throw new MessageValidationError('Shared timestamp (sharedAt) is required.');
  }
  const timestamp = Date.parse(raw.sharedAt);
  if (Number.isNaN(timestamp) || !raw.sharedAt.includes('T')) {
    throw new MessageValidationError('Shared timestamp (sharedAt) must be a valid ISO 8601 string.');
  }

  // Optional landmark
  let landmark: string | undefined = undefined;
  if (raw.landmark !== undefined && raw.landmark !== null) {
    if (typeof raw.landmark !== 'string') {
      throw new MessageValidationError('Landmark must be a string if provided.');
    }
    const trimmedLandmark = raw.landmark.trim();
    if (trimmedLandmark.length > 0) {
      landmark = sanitizeMessageText(trimmedLandmark);
    }
  }

  return {
    latitude: raw.latitude,
    longitude: raw.longitude,
    addressText: sanitizeMessageText(raw.addressText.trim()),
    ...(landmark ? { landmark } : {}),
    sharedAt: raw.sharedAt,
  };
}

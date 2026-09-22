// apps/web/lib/messaging/validation.test.ts
// Pure Domain Validation Tests for WEB-017 In-App Messaging & Real-Time Chat
// Governed by: WEB-017 Architecture Contract v1.0 & Test-First Implementation Plan v1.0

import { describe, it, expect } from 'vitest';
import {
  validateTextMessage,
  countUnicodeCharacters,
  validateImageAttachment,
  validateLocationPayload,
  sanitizeMessageText,
  MAX_MESSAGE_LENGTH,
  MAX_ATTACHMENT_BYTES,
  ALLOWED_IMAGE_MIME_TYPES,
  MessageValidationError,
  MediaUploadError,
} from './validation';
import type { LocationPayload } from './types';

describe('WEB-017 Messaging Domain Validation (TDD Suite 1)', () => {
  describe('Constants & Configuration Invariants', () => {
    it('defines maximum text message length as exactly 2,000 characters', () => {
      expect(MAX_MESSAGE_LENGTH).toBe(2000);
    });

    it('defines maximum attachment size as exactly 5,242,880 bytes (5.0 MB)', () => {
      expect(MAX_ATTACHMENT_BYTES).toBe(5242880);
      expect(MAX_ATTACHMENT_BYTES).toBe(5 * 1024 * 1024);
    });

    it('whitelists exactly image/jpeg, image/png, and image/webp MIME types', () => {
      expect(ALLOWED_IMAGE_MIME_TYPES).toContain('image/jpeg');
      expect(ALLOWED_IMAGE_MIME_TYPES).toContain('image/png');
      expect(ALLOWED_IMAGE_MIME_TYPES).toContain('image/webp');
      expect(ALLOWED_IMAGE_MIME_TYPES).toHaveLength(3);
    });
  });

  describe('VAL-001: Reject Empty or Whitespace-Only Text Messages', () => {
    it('rejects an empty string with MessageValidationError', () => {
      expect(() => validateTextMessage('')).toThrow(MessageValidationError);
      expect(() => validateTextMessage('')).toThrow(/empty/i);
    });

    it('rejects a string containing only standard spaces', () => {
      expect(() => validateTextMessage('   ')).toThrow(MessageValidationError);
    });

    it('rejects a string containing mixed whitespace characters (tabs, newlines, carriage returns)', () => {
      expect(() => validateTextMessage(' \t\n\r  \n ')).toThrow(MessageValidationError);
    });

    it('rejects null or undefined input', () => {
      expect(() => validateTextMessage(null)).toThrow(MessageValidationError);
      expect(() => validateTextMessage(undefined)).toThrow(MessageValidationError);
    });

    it('rejects non-string input types', () => {
      expect(() => validateTextMessage(12345)).toThrow(MessageValidationError);
      expect(() => validateTextMessage({})).toThrow(MessageValidationError);
      expect(() => validateTextMessage([])).toThrow(MessageValidationError);
      expect(() => validateTextMessage(true)).toThrow(MessageValidationError);
    });
  });

  describe('VAL-002: Accept Text Message with Exactly 1 Unicode Code Point', () => {
    it('accepts a single ASCII character', () => {
      const result = validateTextMessage('a');
      expect(result).toBe('a');
    });

    it('accepts a single Nigerian Naira currency symbol (U+20A6)', () => {
      const result = validateTextMessage('₦');
      expect(result).toBe('₦');
      expect(countUnicodeCharacters(result)).toBe(1);
    });

    it('accepts a single emoji code point', () => {
      const result = validateTextMessage('👍');
      expect(result).toBe('👍');
      expect(countUnicodeCharacters(result)).toBe(1);
    });

    it('accepts 1 character surrounded by whitespace after trimming', () => {
      const result = validateTextMessage('  z  ');
      expect(result).toBe('z');
    });
  });

  describe('VAL-003: Accept Text Message with Exactly 2,000 Unicode Code Points', () => {
    it('accepts an ASCII string of exactly 2,000 characters', () => {
      const boundaryMessage = 'a'.repeat(2000);
      expect(countUnicodeCharacters(boundaryMessage)).toBe(2000);
      const result = validateTextMessage(boundaryMessage);
      expect(result).toBe(boundaryMessage);
      expect(countUnicodeCharacters(result)).toBe(2000);
    });

    it('accepts exactly 2,000 multi-byte Unicode code points (Naira symbols)', () => {
      const boundaryUnicode = '₦'.repeat(2000);
      expect(countUnicodeCharacters(boundaryUnicode)).toBe(2000);
      const result = validateTextMessage(boundaryUnicode);
      expect(result).toBe(boundaryUnicode);
      expect(countUnicodeCharacters(result)).toBe(2000);
    });

    it('accepts exactly 2,000 code points when padded with surrounding whitespace', () => {
      const content = 'b'.repeat(2000);
      const padded = `  ${content}  `;
      const result = validateTextMessage(padded);
      expect(result).toBe(content);
      expect(countUnicodeCharacters(result)).toBe(2000);
    });
  });

  describe('VAL-004: Reject Text Message Exceeding 2,000 Unicode Code Points', () => {
    it('rejects a 2,001-character ASCII string with MessageValidationError', () => {
      const overLimitMessage = 'a'.repeat(2001);
      expect(countUnicodeCharacters(overLimitMessage)).toBe(2001);
      expect(() => validateTextMessage(overLimitMessage)).toThrow(MessageValidationError);
      expect(() => validateTextMessage(overLimitMessage)).toThrow(/2,?000/i);
    });

    it('rejects a 2,001-code-point multi-byte Unicode string with MessageValidationError', () => {
      const overLimitUnicode = '₦'.repeat(2001);
      expect(countUnicodeCharacters(overLimitUnicode)).toBe(2001);
      expect(() => validateTextMessage(overLimitUnicode)).toThrow(MessageValidationError);
    });

    it('rejects a message that exceeds 2,000 characters even if individual UTF-16 code units differ', () => {
      const emojis = '🔧'.repeat(2001);
      expect(countUnicodeCharacters(emojis)).toBe(2001);
      expect(() => validateTextMessage(emojis)).toThrow(MessageValidationError);
    });
  });

  describe('VAL-005: Accurate Multi-Byte Unicode Character Counting (Nigerian Names, Accents, Emojis)', () => {
    it('accurately counts Nigerian Yoruba and Igbo names with tones and diacritics', () => {
      const name1 = 'Ọlálékan';
      expect(countUnicodeCharacters(name1)).toBe(Array.from(name1).length);

      const name2 = 'Àdùkẹ́';
      expect(countUnicodeCharacters(name2)).toBe(Array.from(name2).length);

      const name3 = 'Chukwudị';
      expect(countUnicodeCharacters(name3)).toBe(Array.from(name3).length);
    });

    it('counts single emojis as 1 code point despite UTF-16 surrogate pairs having length 2', () => {
      const wave = '👋';
      expect(wave.length).toBe(2);
      expect(countUnicodeCharacters(wave)).toBe(1);

      const generator = '⚡';
      expect(countUnicodeCharacters(generator)).toBe(1);

      const tools = '🛠️';
      expect(countUnicodeCharacters(tools)).toBe(Array.from(tools).length);
    });

    it('validates a combined Nigerian service coordination message with emojis and currency', () => {
      const text = 'Good afternoon Oga Babajide. Please confirm the generator capacity is 5kVA. Cost is ₦45,000 👍';
      const count = countUnicodeCharacters(text);
      expect(count).toBe(Array.from(text).length);
      const validated = validateTextMessage(text);
      expect(validated).toBe(text);
    });
  });

  describe('VAL-006: Validate Permitted Image MIME Types', () => {
    it('accepts image/jpeg MIME type', () => {
      expect(() =>
        validateImageAttachment({ size: 1024 * 500, mimeType: 'image/jpeg' })
      ).not.toThrow();
    });

    it('accepts image/png MIME type', () => {
      expect(() =>
        validateImageAttachment({ size: 1024 * 500, mimeType: 'image/png' })
      ).not.toThrow();
    });

    it('accepts image/webp MIME type', () => {
      expect(() =>
        validateImageAttachment({ size: 1024 * 500, mimeType: 'image/webp' })
      ).not.toThrow();
    });
  });

  describe('VAL-007: Reject Prohibited MIME Types with MediaUploadError', () => {
    it('rejects application/pdf with MediaUploadError', () => {
      expect(() =>
        validateImageAttachment({ size: 1024 * 100, mimeType: 'application/pdf' })
      ).toThrow(MediaUploadError);
      expect(() =>
        validateImageAttachment({ size: 1024 * 100, mimeType: 'application/pdf' })
      ).toThrow(/MIME type/i);
    });

    it('rejects animated GIF (image/gif) with MediaUploadError', () => {
      expect(() =>
        validateImageAttachment({ size: 1024 * 100, mimeType: 'image/gif' })
      ).toThrow(MediaUploadError);
    });

    it('rejects vector SVG (image/svg+xml) with MediaUploadError', () => {
      expect(() =>
        validateImageAttachment({ size: 1024 * 100, mimeType: 'image/svg+xml' })
      ).toThrow(MediaUploadError);
    });

    it('rejects archive application/zip with MediaUploadError', () => {
      expect(() =>
        validateImageAttachment({ size: 1024 * 100, mimeType: 'application/zip' })
      ).toThrow(MediaUploadError);
    });

    it('rejects generic text/plain or octet-stream with MediaUploadError', () => {
      expect(() =>
        validateImageAttachment({ size: 1024 * 100, mimeType: 'text/plain' })
      ).toThrow(MediaUploadError);
      expect(() =>
        validateImageAttachment({ size: 1024 * 100, mimeType: 'application/octet-stream' })
      ).toThrow(MediaUploadError);
    });

    it('rejects missing or empty MIME type', () => {
      expect(() =>
        validateImageAttachment({ size: 1024 * 100, mimeType: '' })
      ).toThrow(MediaUploadError);
    });
  });

  describe('VAL-008: Accept Image Attachments Up to Exactly 5,242,880 Bytes (5.0 MB)', () => {
    it('accepts image attachment of exactly 5,242,880 bytes (5.0 MB boundary)', () => {
      expect(() =>
        validateImageAttachment({ size: 5242880, mimeType: 'image/jpeg' })
      ).not.toThrow();
    });

    it('accepts image attachment of standard size (1.5 MB)', () => {
      expect(() =>
        validateImageAttachment({ size: 1572864, mimeType: 'image/png' })
      ).not.toThrow();
    });

    it('accepts small thumbnail image attachment (50 KB)', () => {
      expect(() =>
        validateImageAttachment({ size: 51200, mimeType: 'image/webp' })
      ).not.toThrow();
    });
  });

  describe('VAL-009: Reject Image Attachments Exceeding 5,242,880 Bytes with MediaUploadError', () => {
    it('rejects image attachment of 5,242,881 bytes (5.0 MB + 1 byte boundary) with MediaUploadError', () => {
      expect(() =>
        validateImageAttachment({ size: 5242881, mimeType: 'image/jpeg' })
      ).toThrow(MediaUploadError);
      expect(() =>
        validateImageAttachment({ size: 5242881, mimeType: 'image/jpeg' })
      ).toThrow(/5\s*MB/i);
    });

    it('rejects 10 MB image attachment with MediaUploadError', () => {
      expect(() =>
        validateImageAttachment({ size: 10485760, mimeType: 'image/png' })
      ).toThrow(MediaUploadError);
    });

    it('rejects negative or zero-byte file size', () => {
      expect(() =>
        validateImageAttachment({ size: 0, mimeType: 'image/jpeg' })
      ).toThrow(MediaUploadError);
      expect(() =>
        validateImageAttachment({ size: -100, mimeType: 'image/jpeg' })
      ).toThrow(MediaUploadError);
    });
  });

  describe('VAL-010: Validate Structured Location Payload', () => {
    const validLocation: LocationPayload = {
      latitude: 6.5244,
      longitude: 3.3792,
      addressText: '12 Admiralty Way, Lekki Phase 1, Lagos',
      landmark: 'Opposite Ebeano Supermarket',
      sharedAt: '2026-09-22T10:00:00.000Z',
    };

    it('accepts a fully specified valid location payload', () => {
      const result = validateLocationPayload(validLocation);
      expect(result).toEqual(validLocation);
    });

    it('accepts a valid location payload without optional landmark', () => {
      const withoutLandmark: LocationPayload = {
        latitude: 9.0765,
        longitude: 7.3986,
        addressText: 'Plot 402 Constitution Avenue, Central Business District, Abuja',
        sharedAt: '2026-09-22T10:15:00.000Z',
      };
      const result = validateLocationPayload(withoutLandmark);
      expect(result.latitude).toBe(9.0765);
      expect(result.longitude).toBe(7.3986);
      expect(result.addressText).toBe(withoutLandmark.addressText);
      expect(result.landmark).toBeUndefined();
    });

    it('accepts boundary coordinate values (-90, 90 for latitude; -180, 180 for longitude)', () => {
      const minBounds: LocationPayload = {
        latitude: -90,
        longitude: -180,
        addressText: 'South Pole Station',
        sharedAt: '2026-09-22T10:00:00.000Z',
      };
      expect(() => validateLocationPayload(minBounds)).not.toThrow();

      const maxBounds: LocationPayload = {
        latitude: 90,
        longitude: 180,
        addressText: 'North Pole Station',
        sharedAt: '2026-09-22T10:00:00.000Z',
      };
      expect(() => validateLocationPayload(maxBounds)).not.toThrow();
    });
  });

  describe('VAL-011: Reject Location Payload with Missing Address or Out-of-Range Coordinates', () => {
    const baseValid: LocationPayload = {
      latitude: 6.5244,
      longitude: 3.3792,
      addressText: '12 Admiralty Way, Lekki Phase 1, Lagos',
      sharedAt: '2026-09-22T10:00:00.000Z',
    };

    it('rejects latitude greater than 90 with MessageValidationError', () => {
      expect(() =>
        validateLocationPayload({ ...baseValid, latitude: 90.0001 })
      ).toThrow(MessageValidationError);
      expect(() =>
        validateLocationPayload({ ...baseValid, latitude: 90.0001 })
      ).toThrow(/latitude/i);
    });

    it('rejects latitude less than -90 with MessageValidationError', () => {
      expect(() =>
        validateLocationPayload({ ...baseValid, latitude: -90.0001 })
      ).toThrow(MessageValidationError);
    });

    it('rejects longitude greater than 180 with MessageValidationError', () => {
      expect(() =>
        validateLocationPayload({ ...baseValid, longitude: 180.0001 })
      ).toThrow(MessageValidationError);
      expect(() =>
        validateLocationPayload({ ...baseValid, longitude: 180.0001 })
      ).toThrow(/longitude/i);
    });

    it('rejects longitude less than -180 with MessageValidationError', () => {
      expect(() =>
        validateLocationPayload({ ...baseValid, longitude: -180.0001 })
      ).toThrow(MessageValidationError);
    });

    it('rejects non-numeric, NaN, or infinite coordinates', () => {
      expect(() =>
        validateLocationPayload({ ...baseValid, latitude: NaN })
      ).toThrow(MessageValidationError);
      expect(() =>
        validateLocationPayload({ ...baseValid, longitude: Infinity })
      ).toThrow(MessageValidationError);
      expect(() =>
        validateLocationPayload({ ...baseValid, latitude: '6.5244' as unknown as number })
      ).toThrow(MessageValidationError);
    });

    it('rejects empty, whitespace-only, or missing addressText', () => {
      expect(() =>
        validateLocationPayload({ ...baseValid, addressText: '' })
      ).toThrow(MessageValidationError);
      expect(() =>
        validateLocationPayload({ ...baseValid, addressText: '    ' })
      ).toThrow(MessageValidationError);
      expect(() =>
        validateLocationPayload({ ...baseValid, addressText: undefined as unknown as string })
      ).toThrow(MessageValidationError);
    });

    it('rejects invalid or unparseable ISO 8601 sharedAt timestamp', () => {
      expect(() =>
        validateLocationPayload({ ...baseValid, sharedAt: 'invalid-date' })
      ).toThrow(MessageValidationError);
      expect(() =>
        validateLocationPayload({ ...baseValid, sharedAt: '' })
      ).toThrow(MessageValidationError);
    });

    it('rejects null, undefined, or non-object payloads', () => {
      expect(() => validateLocationPayload(null)).toThrow(MessageValidationError);
      expect(() => validateLocationPayload(undefined)).toThrow(MessageValidationError);
      expect(() => validateLocationPayload('Lagos, Nigeria')).toThrow(MessageValidationError);
    });
  });

  describe('VAL-012: XSS Sanitization & Control-Character Rejection', () => {
    it('escapes HTML script tags preventing XSS injection', () => {
      const malicious = '<script>alert("xss")</script>';
      const sanitized = sanitizeMessageText(malicious);
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain('</script>');
      expect(sanitized).toContain('&lt;script&gt;');
      expect(sanitized).toContain('&lt;/script&gt;');
    });

    it('escapes iframe and div markup', () => {
      const payload = '<iframe src="https://attacker.com"></iframe><div>Click me</div>';
      const sanitized = sanitizeMessageText(payload);
      expect(sanitized).not.toContain('<iframe');
      expect(sanitized).not.toContain('<div>');
      expect(sanitized).toContain('&lt;iframe');
      expect(sanitized).toContain('&lt;div&gt;');
    });

    it('escapes img tag with onerror payload', () => {
      const payload = '<img src="invalid" onerror="alert(1)" />';
      const sanitized = sanitizeMessageText(payload);
      expect(sanitized).not.toContain('<img');
      expect(sanitized).toContain('&lt;img');
    });

    it('escapes HTML special characters (&, <, >, ", \') properly', () => {
      const input = 'Save & Protect "BukieBrainJobs" <escrow> \'guarantee\'';
      const sanitized = sanitizeMessageText(input);
      expect(sanitized).toBe(
        'Save &amp; Protect &quot;BukieBrainJobs&quot; &lt;escrow&gt; &#39;guarantee&#39;'
      );
    });

    it('rejects non-printable control characters in validateTextMessage with MessageValidationError', () => {
      // Null byte \x00
      expect(() => validateTextMessage('Hello\x00World')).toThrow(MessageValidationError);
      expect(() => validateTextMessage('Hello\x00World')).toThrow(/control character/i);

      // Backspace \x08
      expect(() => validateTextMessage('Test\x08String')).toThrow(MessageValidationError);

      // Unit separator \x1F
      expect(() => validateTextMessage('Data\x1FChunk')).toThrow(MessageValidationError);

      // Delete character \x7F
      expect(() => validateTextMessage('Bad\x7FByte')).toThrow(MessageValidationError);
    });

    it('preserves legitimate formatting whitespace in messages (newlines, carriage returns, tabs)', () => {
      const multiline = 'Item 1: 5kVA Generator\nItem 2: Engine Oil (10W-30)\r\nTotal: ₦65,000\tConfirmed.';
      const validated = validateTextMessage(multiline);
      expect(validated).toContain('\n');
      expect(validated).toContain('\t');
    });

    it('integrates HTML escaping into validateTextMessage so validated content is safe for storage/rendering', () => {
      const rawWithHtml = 'Hello <b>Worker</b>, please check <script>alert(1)</script>';
      const validated = validateTextMessage(rawWithHtml);
      expect(validated).not.toContain('<b>');
      expect(validated).not.toContain('<script>');
      expect(validated).toContain('&lt;b&gt;');
      expect(validated).toContain('&lt;script&gt;');
    });
  });
});

// apps/web/lib/brainworker/validation.test.ts
// Phase 1 RED: Format & File Validation Contracts
// Authoritative References:
// - docs/specs/BW-001-architecture-contract.md (Section 6 & 7)
// - docs/specs/BW-001-test-first-implementation-plan.md (Suite 1: VAL-001 to VAL-006)

import { describe, it, expect } from 'vitest';
import {
  validateNinFormat,
  validateBvnFormat,
  maskIdentityIdentifier,
  validateDocumentFile,
  validateDateOfBirth,
  MAX_DOCUMENT_FILE_SIZE,
  ALLOWED_DOCUMENT_MIME_TYPES,
} from './validation';

describe('BW-001 Format & File Validation Utilities (Suite 1)', () => {
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // VAL-001: NIN Format Validation
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('VAL-001: NIN Format Validation', () => {
    it('accepts exactly 11 numeric digits', () => {
      expect(validateNinFormat('12345678901')).toBe(true);
      expect(validateNinFormat('98765432109')).toBe(true);
      expect(validateNinFormat('00112233445')).toBe(true);
    });

    it('rejects non-11 digit strings or inputs with letters or symbols', () => {
      expect(validateNinFormat('1234567890')).toBe(false);       // 10 digits (too short)
      expect(validateNinFormat('123456789012')).toBe(false);     // 12 digits (too long)
      expect(validateNinFormat('1234567890a')).toBe(false);      // contains letter
      expect(validateNinFormat('123-456-78901')).toBe(false);    // contains dashes
      expect(validateNinFormat('')).toBe(false);                 // empty
      expect(validateNinFormat('           ')).toBe(false);      // whitespace
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // VAL-002: BVN Format Validation
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('VAL-002: BVN Format Validation', () => {
    it('accepts exactly 11 numeric digits', () => {
      expect(validateBvnFormat('22334455667')).toBe(true);
      expect(validateBvnFormat('10293847561')).toBe(true);
    });

    it('rejects invalid length or non-numeric characters', () => {
      expect(validateBvnFormat('2233445566')).toBe(false);       // 10 digits
      expect(validateBvnFormat('223344556678')).toBe(false);     // 12 digits
      expect(validateBvnFormat('2233445566x')).toBe(false);      // alpha
      expect(validateBvnFormat(' ')).toBe(false);                // blank
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // VAL-003: Identifier Masking Rule
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('VAL-003: Identifier Masking Rule', () => {
    it('masks 11-digit NIN or BVN displaying only the last 4 digits', () => {
      expect(maskIdentityIdentifier('12345678901')).toBe('•••••••8901');
      expect(maskIdentityIdentifier('22334455667')).toBe('•••••••5667');
    });

    it('returns raw string if fewer than 4 digits are present', () => {
      expect(maskIdentityIdentifier('123')).toBe('123');
      expect(maskIdentityIdentifier('')).toBe('');
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // VAL-004 & VAL-005: Document File Size & MIME Whitelist
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('VAL-004 & VAL-005: Document File Validation', () => {
    it('accepts valid files within 5 MB ceiling and whitelisted MIME types', () => {
      const validJpg = { name: 'nin-slip.jpg', size: 2 * 1024 * 1024, type: 'image/jpeg' };
      const validPng = { name: 'trade-cert.png', size: 4.5 * 1024 * 1024, type: 'image/png' };
      const validWebp = { name: 'workshop.webp', size: 1 * 1024 * 1024, type: 'image/webp' };
      const validPdf = { name: 'apprenticeship.pdf', size: 3 * 1024 * 1024, type: 'application/pdf' };

      expect(validateDocumentFile(validJpg).valid).toBe(true);
      expect(validateDocumentFile(validPng).valid).toBe(true);
      expect(validateDocumentFile(validWebp).valid).toBe(true);
      expect(validateDocumentFile(validPdf).valid).toBe(true);
    });

    it('rejects files exceeding 5 MB limit', () => {
      const oversized = {
        name: 'huge-scan.pdf',
        size: MAX_DOCUMENT_FILE_SIZE + 1,
        type: 'application/pdf',
      };
      const result = validateDocumentFile(oversized);
      expect(result.valid).toBe(false);
      expect(result.error).toMatch(/exceeds 5 MB/i);
    });

    it('rejects unsupported MIME types', () => {
      const invalidDocx = { name: 'cv.docx', size: 1024 * 100, type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' };
      const invalidExe = { name: 'setup.exe', size: 1024 * 100, type: 'application/x-msdownload' };
      const invalidZip = { name: 'certs.zip', size: 1024 * 100, type: 'application/zip' };

      expect(validateDocumentFile(invalidDocx).valid).toBe(false);
      expect(validateDocumentFile(invalidDocx).error).toMatch(/unsupported file format/i);
      expect(validateDocumentFile(invalidExe).valid).toBe(false);
      expect(validateDocumentFile(invalidZip).valid).toBe(false);
    });

    it('rejects empty files (0 bytes)', () => {
      const empty = { name: 'empty.jpg', size: 0, type: 'image/jpeg' };
      const result = validateDocumentFile(empty);
      expect(result.valid).toBe(false);
      expect(result.error).toMatch(/empty/i);
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // VAL-006: Date of Birth & 18+ Calculation
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('VAL-006: Date of Birth & Age Calculation', () => {
    it('accepts applicants aged 18 and older', () => {
      // 25 years ago
      const dob25 = '2001-05-15';
      const result = validateDateOfBirth(dob25);
      expect(result.valid).toBe(true);
      expect(result.age).toBeGreaterThanOrEqual(18);
    });

    it('rejects applicants under 18 years old', () => {
      // 15 years ago
      const dob15 = '2011-05-15';
      const result = validateDateOfBirth(dob15);
      expect(result.valid).toBe(false);
      expect(result.error).toMatch(/at least 18 years old/i);
    });

    it('rejects invalid or future dates', () => {
      expect(validateDateOfBirth('invalid-date').valid).toBe(false);
      expect(validateDateOfBirth('2099-01-01').valid).toBe(false);
    });
  });
});

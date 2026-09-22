import { describe, it, expect } from 'vitest';
import {
  validateReviewRatings,
  validateReviewComment,
  validateSubmitReviewInput,
  countUnicodeCharacters,
  ValidationError,
} from './validation';
import type { ReviewRatings, SubmitReviewInput } from './types';

describe('WEB-016 Review Validation (TDD Suite 1)', () => {
  const validRatings: ReviewRatings = {
    punctuality: 5,
    quality: 4,
    communication: 5,
    overall: 5,
  };

  describe('VAL-001: Mandatory Evaluation Criteria (Reject Missing Ratings)', () => {
    it('throws ValidationError when punctuality rating is missing or undefined', () => {
      const input = { quality: 4, communication: 5, overall: 5 };
      expect(() => validateReviewRatings(input)).toThrow(ValidationError);
      expect(() => validateReviewRatings(input)).toThrow(/punctuality/i);
    });

    it('throws ValidationError when quality rating is missing or undefined', () => {
      const input = { punctuality: 5, communication: 5, overall: 5 };
      expect(() => validateReviewRatings(input)).toThrow(ValidationError);
      expect(() => validateReviewRatings(input)).toThrow(/quality/i);
    });

    it('throws ValidationError when communication rating is missing or undefined', () => {
      const input = { punctuality: 5, quality: 4, overall: 5 };
      expect(() => validateReviewRatings(input)).toThrow(ValidationError);
      expect(() => validateReviewRatings(input)).toThrow(/communication/i);
    });

    it('throws ValidationError when overall rating is missing or undefined', () => {
      const input = { punctuality: 5, quality: 4, communication: 5 };
      expect(() => validateReviewRatings(input)).toThrow(ValidationError);
      expect(() => validateReviewRatings(input)).toThrow(/overall/i);
    });

    it('throws ValidationError when ratings object is null or undefined', () => {
      expect(() => validateReviewRatings(null)).toThrow(ValidationError);
      expect(() => validateReviewRatings(undefined)).toThrow(ValidationError);
    });

    it('throws ValidationError when a rating criterion is 0 (unselected)', () => {
      const input = { punctuality: 0, quality: 4, communication: 5, overall: 5 };
      expect(() => validateReviewRatings(input)).toThrow(ValidationError);
      expect(() => validateReviewRatings(input)).toThrow(/punctuality/i);
    });
  });

  describe('VAL-002: Reject Non-Integer or Out-of-Range Ratings', () => {
    it('throws ValidationError when a rating is greater than 5', () => {
      const input = { ...validRatings, quality: 6 };
      expect(() => validateReviewRatings(input)).toThrow(ValidationError);
      expect(() => validateReviewRatings(input)).toThrow(/between 1 and 5/i);
    });

    it('throws ValidationError when a rating is less than 1', () => {
      const input = { ...validRatings, communication: -1 };
      expect(() => validateReviewRatings(input)).toThrow(ValidationError);
      expect(() => validateReviewRatings(input)).toThrow(/between 1 and 5/i);
    });

    it('throws ValidationError when a rating is a floating-point number', () => {
      const input = { ...validRatings, overall: 4.5 };
      expect(() => validateReviewRatings(input)).toThrow(ValidationError);
      expect(() => validateReviewRatings(input)).toThrow(/integer/i);
    });

    it('throws ValidationError when a rating is NaN or Infinity', () => {
      expect(() => validateReviewRatings({ ...validRatings, punctuality: NaN })).toThrow(ValidationError);
      expect(() => validateReviewRatings({ ...validRatings, overall: Infinity })).toThrow(ValidationError);
    });

    it('throws ValidationError when a rating is a string or non-numeric type', () => {
      expect(() => validateReviewRatings({ ...validRatings, quality: '5' })).toThrow(ValidationError);
      expect(() => validateReviewRatings({ ...validRatings, communication: true })).toThrow(ValidationError);
    });
  });

  describe('VAL-003: Accept Valid Ratings', () => {
    it('accepts integer ratings 1 through 5 across all criteria', () => {
      const result = validateReviewRatings(validRatings);
      expect(result).toEqual({
        punctuality: 5,
        quality: 4,
        communication: 5,
        overall: 5,
      });
    });

    it('accepts all 1-star ratings (minimum valid bound)', () => {
      const allOnes = { punctuality: 1, quality: 1, communication: 1, overall: 1 };
      expect(validateReviewRatings(allOnes)).toEqual(allOnes);
    });

    it('accepts all 5-star ratings (maximum valid bound)', () => {
      const allFives = { punctuality: 5, quality: 5, communication: 5, overall: 5 };
      expect(validateReviewRatings(allFives)).toEqual(allFives);
    });
  });

  describe('VAL-004: Accept Undefined or Empty Written Feedback', () => {
    it('normalizes undefined comment to undefined', () => {
      expect(validateReviewComment(undefined)).toBeUndefined();
    });

    it('normalizes empty string comment to undefined', () => {
      expect(validateReviewComment('')).toBeUndefined();
    });

    it('normalizes whitespace-only comment to undefined', () => {
      expect(validateReviewComment('   \n\t   ')).toBeUndefined();
    });
  });

  describe('VAL-005: Accept Valid Written Feedback', () => {
    it('accepts standard customer review text and trims whitespace', () => {
      const raw = '  The artisan arrived on time and resolved the plumbing issue quickly.  ';
      const result = validateReviewComment(raw);
      expect(result).toBe('The artisan arrived on time and resolved the plumbing issue quickly.');
    });

    it('preserves valid newlines and paragraphs in written feedback', () => {
      const comment = 'First paragraph.\n\nSecond paragraph with details.';
      expect(validateReviewComment(comment)).toBe(comment);
    });
  });

  describe('VAL-006: Reject Written Feedback Exceeding 1,000 Characters', () => {
    it('accepts written feedback of exactly 1,000 characters', () => {
      const exact1000 = 'a'.repeat(1000);
      expect(validateReviewComment(exact1000)).toBe(exact1000);
      expect(countUnicodeCharacters(exact1000)).toBe(1000);
    });

    it('throws ValidationError when written feedback has 1,001 characters', () => {
      const tooLong1001 = 'a'.repeat(1001);
      expect(() => validateReviewComment(tooLong1001)).toThrow(ValidationError);
      expect(() => validateReviewComment(tooLong1001)).toThrow(/1,000 characters/i);
    });

    it('throws ValidationError when trimmed length exceeds 1,000 characters', () => {
      const raw = '   ' + 'b'.repeat(1005) + '   ';
      expect(() => validateReviewComment(raw)).toThrow(ValidationError);
    });
  });

  describe('VAL-007: Safe Rejection of HTML and Script Tags', () => {
    it('throws ValidationError when comment contains <script> tags', () => {
      const malicious = 'Great service <script>alert("xss")</script>';
      expect(() => validateReviewComment(malicious)).toThrow(ValidationError);
      expect(() => validateReviewComment(malicious)).toThrow(/HTML or script tags/i);
    });

    it('throws ValidationError when comment contains <iframe> tags', () => {
      const malicious = '<iframe src="https://evil.com"></iframe>';
      expect(() => validateReviewComment(malicious)).toThrow(ValidationError);
    });

    it('throws ValidationError when comment contains inline event handlers in tags', () => {
      const malicious = 'Nice job <img src="x" onerror="alert(1)" />';
      expect(() => validateReviewComment(malicious)).toThrow(ValidationError);
    });

    it('throws ValidationError when comment contains generic HTML tags', () => {
      const withHtml = 'Please contact me at <b>my email</b>';
      expect(() => validateReviewComment(withHtml)).toThrow(ValidationError);
    });
  });

  describe('VAL-008: Reject Null Bytes in Written Feedback', () => {
    it('throws ValidationError when comment contains null byte \\0', () => {
      const withNullByte = 'Prompt arrival\0and fast delivery';
      expect(() => validateReviewComment(withNullByte)).toThrow(ValidationError);
      expect(() => validateReviewComment(withNullByte)).toThrow(/null byte/i);
    });
  });

  describe('VAL-009: Reject Non-Printable Control Characters', () => {
    it('throws ValidationError when comment contains bell character \\x07', () => {
      const withBell = 'Good job \x07 artisan';
      expect(() => validateReviewComment(withBell)).toThrow(ValidationError);
      expect(() => validateReviewComment(withBell)).toThrow(/control character/i);
    });

    it('throws ValidationError when comment contains backspace \\x08 or escape \\x1B', () => {
      expect(() => validateReviewComment('Test \x08 text')).toThrow(ValidationError);
      expect(() => validateReviewComment('Test \x1B[31m text')).toThrow(ValidationError);
    });

    it('allows valid formatting whitespace: newlines (\\n), carriage returns (\\r), and tabs (\\t)', () => {
      const validFormatted = 'Line 1\r\n\tIndented line 2\nLine 3';
      expect(validateReviewComment(validFormatted)).toBe(validFormatted);
    });
  });

  describe('VAL-010: Unicode Preservation & Canonical Code-Point Character Count', () => {
    it('preserves Nigerian names, diacritics, and African language text', () => {
      const yoruba = 'Iṣẹ́ tó dára gan-an! Ẹ ṣe púpọ̀.';
      const hausa = 'Aiki mai kyau kwarai da gaske.';
      const igbo = 'Ọrụ dị mma nke ukwuu.';

      expect(validateReviewComment(yoruba)).toBe(yoruba);
      expect(validateReviewComment(hausa)).toBe(hausa);
      expect(validateReviewComment(igbo)).toBe(igbo);
    });

    it('preserves emojis and complex Unicode symbols', () => {
      const withEmojis = 'Highly recommended! 🇳🇬 ⭐⭐⭐⭐⭐ 👍 Great work!';
      expect(validateReviewComment(withEmojis)).toBe(withEmojis);
    });

    it('counts characters canonically by Unicode code point (Array.from), not UTF-16 code units', () => {
      // 🌟 is a surrogate pair (length 2 in JS string .length, but 1 code point)
      const singleSurrogate = '🌟';
      expect(singleSurrogate.length).toBe(2);
      expect(countUnicodeCharacters(singleSurrogate)).toBe(1);

      // 1,000 surrogate pair emojis has .length of 2,000, but 1,000 code points: MUST pass
      const thousandEmojis = '🌟'.repeat(1000);
      expect(thousandEmojis.length).toBe(2000);
      expect(countUnicodeCharacters(thousandEmojis)).toBe(1000);
      expect(validateReviewComment(thousandEmojis)).toBe(thousandEmojis);

      // 1,001 surrogate pair emojis has 1,001 code points: MUST throw ValidationError
      const thousandAndOneEmojis = '🌟'.repeat(1001);
      expect(countUnicodeCharacters(thousandAndOneEmojis)).toBe(1001);
      expect(() => validateReviewComment(thousandAndOneEmojis)).toThrow(ValidationError);
      expect(() => validateReviewComment(thousandAndOneEmojis)).toThrow(/1,000 characters/i);
    });
  });

  describe('validateSubmitReviewInput (Complete Submission Payload Helper)', () => {
    it('validates a complete, valid submission input', () => {
      const input: SubmitReviewInput = {
        bookingId: 'book-completed-001',
        ratings: validRatings,
        comment: '  Very satisfied with the quick turnaround.  ',
      };

      const validated = validateSubmitReviewInput(input);
      expect(validated).toEqual({
        bookingId: 'book-completed-001',
        ratings: validRatings,
        comment: 'Very satisfied with the quick turnaround.',
      });
    });

    it('throws ValidationError when bookingId is missing or empty', () => {
      const input: SubmitReviewInput = {
        bookingId: '   ',
        ratings: validRatings,
        comment: 'Great work',
      };
      expect(() => validateSubmitReviewInput(input)).toThrow(ValidationError);
      expect(() => validateSubmitReviewInput(input)).toThrow(/bookingId/i);
    });
  });
});

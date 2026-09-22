// apps/web/lib/review/validation.ts
// Pure validation routines, character counting, and content safety for customer reviews
// Authoritative reference: WEB-016 Architecture Contract v1.2 and UX Specification v1.1

import {
  type ReviewRating,
  type ReviewRatings,
  type SubmitReviewInput,
  type ReviewValidationErrors,
  ValidationError,
} from './types';

export { ValidationError };

/**
 * Prohibited non-printable control characters: \x00-\x08, \x0B, \x0C, \x0E-\x1F, \x7F.
 * Note: standard formatting whitespace (\t [\x09], \n [\x0A], \r [\x0D]) is permitted.
 */
const CONTROL_CHARACTERS_REGEX = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/;

/**
 * Matches any HTML tag (open, close, self-closing) to reject embedded markup.
 */
const HTML_TAG_REGEX = /<\/?[a-zA-Z][^>]*>/i;

/**
 * Maximum character limit for optional written feedback.
 * Counted canonically by Unicode code points.
 */
export const MAX_REVIEW_COMMENT_LENGTH = 1000;

/**
 * Canonical Unicode character counter.
 * Counts Unicode code points using Array.from(str) to avoid surrogate pair fragmentation.
 */
export function countUnicodeCharacters(text: string): number {
  return Array.from(text).length;
}

/**
 * Validates a single rating dimension value.
 * Must be an integer between 1 and 5.
 */
export function validateSingleRating(value: unknown, criterionName: string): ReviewRating {
  if (value === undefined || value === null) {
    throw new ValidationError(
      `Rating criterion '${criterionName}' is required.`,
      criterionName
    );
  }

  if (typeof value !== 'number' || Number.isNaN(value) || !Number.isFinite(value)) {
    throw new ValidationError(
      `Rating criterion '${criterionName}' must be a valid number.`,
      criterionName
    );
  }

  if (!Number.isInteger(value)) {
    throw new ValidationError(
      `Rating criterion '${criterionName}' must be an integer.`,
      criterionName
    );
  }

  if (value < 1 || value > 5) {
    throw new ValidationError(
      `Rating criterion '${criterionName}' must be an integer between 1 and 5.`,
      criterionName
    );
  }

  return value as ReviewRating;
}

/**
 * Validates the four mandatory evaluation criteria.
 * Throws ValidationError on any missing or invalid rating dimension.
 */
export function validateReviewRatings(ratings: unknown): ReviewRatings {
  if (!ratings || typeof ratings !== 'object') {
    throw new ValidationError('Ratings object is required.');
  }

  const raw = ratings as Record<string, unknown>;

  const punctuality = validateSingleRating(raw.punctuality, 'punctuality');
  const quality = validateSingleRating(raw.quality, 'quality');
  const communication = validateSingleRating(raw.communication, 'communication');
  const overall = validateSingleRating(raw.overall, 'overall');

  return {
    punctuality,
    quality,
    communication,
    overall,
  };
}

/**
 * Validates and normalizes optional written feedback.
 * - Trims whitespace
 * - Normalizes empty/whitespace strings to undefined
 * - Rejects null bytes
 * - Rejects non-printable control characters
 * - Rejects HTML/script tags
 * - Enforces canonical 1,000-character code point bound
 */
export function validateReviewComment(comment: unknown): string | undefined {
  if (comment === undefined || comment === null) {
    return undefined;
  }

  if (typeof comment !== 'string') {
    throw new ValidationError('Written feedback must be a string.', 'comment');
  }

  const trimmed = comment.trim();
  if (trimmed.length === 0) {
    return undefined;
  }

  // Reject null bytes (VAL-008)
  if (trimmed.includes('\0') || trimmed.includes('\u0000')) {
    throw new ValidationError(
      'Written feedback must not contain null bytes.',
      'comment'
    );
  }

  // Reject non-printable control characters (VAL-009)
  if (CONTROL_CHARACTERS_REGEX.test(trimmed)) {
    throw new ValidationError(
      'Written feedback must not contain non-printable control characters.',
      'comment'
    );
  }

  // Reject HTML and script tags deterministically (VAL-007)
  if (HTML_TAG_REGEX.test(trimmed)) {
    throw new ValidationError(
      'Written feedback must not contain HTML or script tags.',
      'comment'
    );
  }

  // Canonical code-point character limit check (VAL-006, VAL-010)
  const codePointLength = countUnicodeCharacters(trimmed);
  if (codePointLength > MAX_REVIEW_COMMENT_LENGTH) {
    throw new ValidationError(
      `Written feedback must not exceed ${MAX_REVIEW_COMMENT_LENGTH.toLocaleString()} characters. Current: ${codePointLength.toLocaleString()}.`,
      'comment'
    );
  }

  return trimmed;
}

/**
 * Validates a complete review submission input payload.
 */
export function validateSubmitReviewInput(input: unknown): SubmitReviewInput {
  if (!input || typeof input !== 'object') {
    throw new ValidationError('Submission input must be an object.');
  }

  const raw = input as Record<string, unknown>;

  if (typeof raw.bookingId !== 'string' || raw.bookingId.trim().length === 0) {
    throw new ValidationError('bookingId is required.', 'bookingId');
  }

  const ratings = validateReviewRatings(raw.ratings);
  const comment = validateReviewComment(raw.comment);

  return {
    bookingId: raw.bookingId.trim(),
    ratings,
    comment,
  };
}

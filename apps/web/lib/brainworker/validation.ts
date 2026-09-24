// apps/web/lib/brainworker/validation.ts
// Phase 1 RED Stub: Format & File Validation Utilities
// Authoritative References:
// - docs/specs/BW-001-architecture-contract.md (Section 6 & 7)
// - docs/specs/BW-001-test-first-implementation-plan.md (Suite 1: VAL-001 to VAL-006)

export const MAX_DOCUMENT_FILE_SIZE = 5 * 1024 * 1024; // 5 MB (5,242,880 bytes)

export const ALLOWED_DOCUMENT_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
] as const;

export type AllowedDocumentMimeType = (typeof ALLOWED_DOCUMENT_MIME_TYPES)[number];

const ELEVEN_DIGIT_NUMERIC_REGEX = /^\d{11}$/;

export function validateNinFormat(nin: string): boolean {
  if (!nin || typeof nin !== 'string') return false;
  return ELEVEN_DIGIT_NUMERIC_REGEX.test(nin.trim());
}

export function validateBvnFormat(bvn: string): boolean {
  if (!bvn || typeof bvn !== 'string') return false;
  return ELEVEN_DIGIT_NUMERIC_REGEX.test(bvn.trim());
}

export function maskIdentityIdentifier(raw: string): string {
  if (!raw || typeof raw !== 'string') return '';
  const trimmed = raw.trim();
  if (trimmed.length < 4) return trimmed;
  const maskLength = trimmed.length - 4;
  return '•'.repeat(maskLength) + trimmed.slice(-4);
}

export function validateDocumentFile(file: { name: string; size: number; type: string }): {
  valid: boolean;
  error?: string | undefined;
} {
  if (!file) {
    return { valid: false, error: 'File is required' };
  }

  if (file.size === 0) {
    return { valid: false, error: 'File is empty (0 bytes)' };
  }

  if (file.size > MAX_DOCUMENT_FILE_SIZE) {
    return { valid: false, error: 'File size exceeds 5 MB limit' };
  }

  const isAllowed = ALLOWED_DOCUMENT_MIME_TYPES.some((m) => m === file.type);
  if (!isAllowed) {
    return {
      valid: false,
      error: 'Unsupported file format. Please upload JPEG, PNG, WEBP, or PDF',
    };
  }

  return { valid: true };
}

export function validateDateOfBirth(dob: string): {
  valid: boolean;
  age?: number | undefined;
  error?: string | undefined;
} {
  if (!dob || typeof dob !== 'string') {
    return { valid: false, error: 'Date of birth is required' };
  }

  const birthDate = new Date(dob);
  if (isNaN(birthDate.getTime())) {
    return { valid: false, error: 'Invalid date of birth format' };
  }

  const today = new Date();
  if (birthDate > today) {
    return { valid: false, error: 'Date of birth cannot be in the future' };
  }

  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  if (age < 18) {
    return { valid: false, age, error: 'Applicant must be at least 18 years old to register' };
  }

  return { valid: true, age };
}

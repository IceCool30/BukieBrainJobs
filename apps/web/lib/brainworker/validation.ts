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

export function validateNinFormat(_nin: string): boolean {
  // RED Stub: intentionally incomplete
  return false;
}

export function validateBvnFormat(_bvn: string): boolean {
  // RED Stub: intentionally incomplete
  return false;
}

export function maskIdentityIdentifier(_raw: string): string {
  // RED Stub: intentionally incomplete
  return '';
}

export function validateDocumentFile(_file: { name: string; size: number; type: string }): {
  valid: boolean;
  error?: string | undefined;
} {
  // RED Stub: intentionally incomplete
  return { valid: false, error: 'Not implemented' };
}

export function validateDateOfBirth(_dob: string): {
  valid: boolean;
  age?: number | undefined;
  error?: string | undefined;
} {
  // RED Stub: intentionally incomplete
  return { valid: false, error: 'Not implemented' };
}

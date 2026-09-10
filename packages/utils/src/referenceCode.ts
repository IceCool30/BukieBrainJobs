// packages/utils/src/referenceCode.ts
// Authoritative Domain Reference Code Generator (ARCH-002 Decision C)

/**
 * Generates a durable human-readable reference code for a production Job.
 * Format: REQ-XXXXX (REQ- followed by 5 numeric digits).
 * 
 * Invariants:
 * 1. Generated strictly at domain/application boundary, NEVER by presentation components.
 * 2. Used as an external customer-facing business identifier, NEVER replacing the UUID primary key.
 */
export function generateJobReferenceCode(prefix: string = 'REQ'): string {
  // Use crypto when available, fallback to Math.random
  let randomNum: number;
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const buffer = new Uint32Array(1);
    crypto.getRandomValues(buffer);
    randomNum = 10000 + (buffer[0]! % 90000);
  } else {
    randomNum = Math.floor(10000 + Math.random() * 90000);
  }
  return `${prefix}-${randomNum}`;
}

/**
 * Validates whether a given string is a valid durable reference code format.
 */
export function isValidJobReferenceCode(code: string, prefix: string = 'REQ'): boolean {
  if (!code || typeof code !== 'string') return false;
  const regex = new RegExp(`^${prefix}-\\d{5,}$`);
  return regex.test(code.trim());
}

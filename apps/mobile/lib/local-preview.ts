/**
 * Deterministic local preview helpers.
 *
 * These references are simulated. They are not stored, reserved, or sent
 * anywhere. The same draft always produces the same reference so the preview
 * stays stable and testable.
 */

export type LocalPreviewPrefix = 'BKG' | 'REQ';

function stableSerialize(value: unknown): string {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value) ?? 'null';
  }
  if (Array.isArray(value)) {
    return `[${value.map(stableSerialize).join(',')}]`;
  }
  const record = value as Record<string, unknown>;
  const keys = Object.keys(record).sort();
  return `{${keys
    .map((key) => `${JSON.stringify(key)}:${stableSerialize(record[key])}`)
    .join(',')}}`;
}

function hashString(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
}

export function buildLocalPreviewReference(
  prefix: LocalPreviewPrefix,
  draft: unknown
): string {
  const digits = String(hashString(stableSerialize(draft)) % 100000).padStart(5, '0');
  return `${prefix}-${digits}`;
}

export function isValidDateString(value: string): boolean {
  const trimmed = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return false;
  }
  const [year, month, day] = trimmed.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export function getBookingDateShortcut(
  shortcut: 'today' | 'tomorrow' | 'weekend',
  now: Date = new Date(),
): string {
  if (shortcut === 'today') {
    return todayDateString(now);
  }
  if (shortcut === 'tomorrow') {
    const next = new Date(now);
    next.setDate(next.getDate() + 1);
    return todayDateString(next);
  }
  // weekend: upcoming Saturday, Saturday itself counts
  const current = new Date(now);
  const day = current.getDay(); // 0=Sun, 6=Sat
  const daysUntilSaturday = (6 - day + 7) % 7;
  const target = new Date(current);
  target.setDate(current.getDate() + daysUntilSaturday);
  return todayDateString(target);
}
export function todayDateString(now: Date = new Date()): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
    now.getDate()
  ).padStart(2, '0')}`;
}

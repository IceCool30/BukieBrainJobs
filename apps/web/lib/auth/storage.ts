import { AuthUser, PreservedBookingDraft, PreservedJobDraft } from './types';

const BOOKING_DRAFT_KEY = 'bukiebrainjobs_booking_draft';
const JOB_DRAFT_KEY = 'bukiebrainjobs_job_draft';
const AUTH_USER_KEY = 'bukiebrainjobs_auth_user';

const memoryStore = new Map<string, string>();

function getStorage() {
  if (typeof window !== 'undefined' && window.sessionStorage) {
    return window.sessionStorage;
  }
  return {
    getItem: (key: string): string | null => memoryStore.get(key) ?? null,
    setItem: (key: string, value: string): void => {
      memoryStore.set(key, value);
    },
    removeItem: (key: string): void => {
      memoryStore.delete(key);
    },
  };
}

export function savePreservedBookingDraft(draft: PreservedBookingDraft): void {
  try {
    getStorage().setItem(BOOKING_DRAFT_KEY, JSON.stringify(draft));
  } catch {
    // Storage access may fail in private mode; fail safely
  }
}

export function getPreservedBookingDraft(): PreservedBookingDraft | null {
  try {
    const raw = getStorage().getItem(BOOKING_DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      return parsed as PreservedBookingDraft;
    }
    return null;
  } catch {
    return null;
  }
}

export function clearPreservedBookingDraft(): void {
  try {
    getStorage().removeItem(BOOKING_DRAFT_KEY);
  } catch {
    // Fail safely
  }
}

export function savePreservedJobDraft(draft: PreservedJobDraft): void {
  try {
    getStorage().setItem(JOB_DRAFT_KEY, JSON.stringify(draft));
  } catch {
    // Storage access may fail in private mode; fail safely
  }
}

export function getPreservedJobDraft(): PreservedJobDraft | null {
  try {
    const raw = getStorage().getItem(JOB_DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      return parsed as PreservedJobDraft;
    }
    return null;
  } catch {
    return null;
  }
}

export function clearPreservedJobDraft(): void {
  try {
    getStorage().removeItem(JOB_DRAFT_KEY);
  } catch {
    // Fail safely
  }
}

export function getMockAuthenticatedUser(): AuthUser | null {
  try {
    const raw = getStorage().getItem(AUTH_USER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && parsed.id) {
      return parsed as AuthUser;
    }
    return null;
  } catch {
    return null;
  }
}

export function setMockAuthenticatedUser(user: AuthUser | null): void {
  try {
    if (user) {
      getStorage().setItem(AUTH_USER_KEY, JSON.stringify(user));
    } else {
      getStorage().removeItem(AUTH_USER_KEY);
    }
  } catch {
    // Fail safely
  }
}

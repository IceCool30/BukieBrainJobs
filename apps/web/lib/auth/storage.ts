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

function logStorageWarning(operation: string, error: unknown): void {
  if (process.env.NODE_ENV !== 'production') {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`[auth/storage] ${operation} failed: ${message}`);
  }
}

export function savePreservedBookingDraft(draft: PreservedBookingDraft): void {
  try {
    getStorage().setItem(BOOKING_DRAFT_KEY, JSON.stringify(draft));
  } catch (err: unknown) {
    logStorageWarning('savePreservedBookingDraft', err);
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
  } catch (err: unknown) {
    logStorageWarning('getPreservedBookingDraft', err);
    return null;
  }
}

export function clearPreservedBookingDraft(): void {
  try {
    getStorage().removeItem(BOOKING_DRAFT_KEY);
  } catch (err: unknown) {
    logStorageWarning('clearPreservedBookingDraft', err);
  }
}

export function savePreservedJobDraft(draft: PreservedJobDraft): void {
  try {
    getStorage().setItem(JOB_DRAFT_KEY, JSON.stringify(draft));
  } catch (err: unknown) {
    logStorageWarning('savePreservedJobDraft', err);
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
  } catch (err: unknown) {
    logStorageWarning('getPreservedJobDraft', err);
    return null;
  }
}

export function clearPreservedJobDraft(): void {
  try {
    getStorage().removeItem(JOB_DRAFT_KEY);
  } catch (err: unknown) {
    logStorageWarning('clearPreservedJobDraft', err);
  }
}

export function getMockAuthenticatedUser(): AuthUser | null {
  try {
    const storage = getStorage();
    let raw = storage.getItem(AUTH_USER_KEY);
    if (!raw && typeof window !== 'undefined') {
      try {
        if (window.sessionStorage) {
          raw = window.sessionStorage.getItem(AUTH_USER_KEY) || window.sessionStorage.getItem('bukie_auth_user');
        }
        if (!raw && window.localStorage) {
          raw = window.localStorage.getItem(AUTH_USER_KEY) || window.localStorage.getItem('bukie_auth_user');
        }
      } catch (nestedErr: unknown) {
        logStorageWarning('getMockAuthenticatedUser:fallback', nestedErr);
      }
    }
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && parsed.id) {
      return parsed as AuthUser;
    }
    return null;
  } catch (err: unknown) {
    logStorageWarning('getMockAuthenticatedUser', err);
    return null;
  }
}

export function setMockAuthenticatedUser(user: AuthUser | null): void {
  try {
    if (user) {
      getStorage().setItem(AUTH_USER_KEY, JSON.stringify(user));
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
      }
    } else {
      getStorage().removeItem(AUTH_USER_KEY);
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(AUTH_USER_KEY);
        window.localStorage.removeItem('bukie_auth_user');
      }
    }
  } catch (err: unknown) {
    logStorageWarning('setMockAuthenticatedUser', err);
  }
}

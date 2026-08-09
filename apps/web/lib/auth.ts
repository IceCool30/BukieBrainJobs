// apps/web/lib/auth.ts
// Phase 1 Mock Auth Helpers (AGENTS.md Phase 1 Mock Boundary)

export interface MockSessionUser {
  id: string;
  name: string;
  role: 'client' | 'artisan' | 'admin';
}

export function getMockSession(): { user: MockSessionUser } {
  return {
    user: {
      id: 'user_1',
      name: 'Dr. Tunde Fashola',
      role: 'client',
    },
  };
}
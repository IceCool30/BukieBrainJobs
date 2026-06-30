import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setUserRole } from '@/app/onboarding/actions';

// Mock redirects to a traceable throw
const mockRedirect = vi.fn((path: string) => {
  throw new Error(`REDIRECT_TO: ${path}`);
});

vi.mock('next/navigation', () => ({
  redirect: (path: string) => mockRedirect(path),
}));

// Mock cookies
vi.mock('next/headers', () => ({
  cookies: () => ({
    getAll: () => [],
    set: vi.fn(),
  }),
}));

// Mock SupabaseClients
const mockSupabase = {
  auth: {
    getUser: vi.fn(),
  },
  from: vi.fn(),
};

const mockSupabaseAdmin = {
  from: vi.fn(),
};

vi.mock('@supabase/ssr', () => ({
  createServerClient: () => mockSupabase,
}));

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => mockSupabaseAdmin,
}));

describe('setUserRole Server Action', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should redirect to login if user is unauthenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: null },
      error: new Error('Session expired'),
    });

    await expect(setUserRole('worker')).rejects.toThrow('REDIRECT_TO: /login?error=not_authenticated');
  });

  it('should update role if profile already exists', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' };
    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: mockUser },
      error: null,
    });

    // Mock existing profile found
    const mockQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({
        data: { id: 'user-123', role: 'employer' },
        error: null,
      }),
      update: vi.fn().mockReturnThis(),
    };
    mockSupabase.from.mockImplementation((table) => {
      if (table === 'profiles') {
        return mockQuery;
      }
      return {};
    });

    // Mock successful update
    mockQuery.update.mockReturnValueOnce({
      eq: vi.fn().mockResolvedValue({ error: null }),
    });

    await expect(setUserRole('worker')).rejects.toThrow('REDIRECT_TO: /dashboard/passport-setup');
    expect(mockSupabase.from).toHaveBeenCalledWith('profiles');
  });

  it('should dynamically create profiles, wallets and passports if not existing', async () => {
    const mockUser = { id: 'new-user-456', email: 'new@example.com' };
    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: mockUser },
      error: null,
    });

    // Profile does not exist (maybeSingle returns null)
    const mockQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    };

    mockSupabase.from.mockImplementation((table) => {
      if (table === 'profiles') return mockQuery;
      return {};
    });

    // Mock admin client actions for new account bootstrapping
    const mockAdminQuery = {
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { id: 'passport-789' }, error: null }),
    };

    mockSupabaseAdmin.from.mockImplementation(() => mockAdminQuery);

    await expect(setUserRole('employer')).rejects.toThrow('REDIRECT_TO: /dashboard');

    // Should call wallet and passport inserts
    expect(mockSupabaseAdmin.from).toHaveBeenCalledWith('wallets');
    expect(mockSupabaseAdmin.from).toHaveBeenCalledWith('bukie_passports');
    expect(mockSupabaseAdmin.from).toHaveBeenCalledWith('profiles');
  });
});

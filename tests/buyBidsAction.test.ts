import { describe, it, expect, vi, beforeEach } from 'vitest';
import { buyBidsAction } from '@/app/actions';

// Mock cookies
vi.mock('next/headers', () => ({
  cookies: () => ({
    getAll: () => [],
    set: vi.fn(),
  }),
}));

// Mock Supabase
const mockSupabase = {
  auth: {
    getSession: vi.fn(),
  },
  from: vi.fn(),
};

vi.mock('@supabase/ssr', () => ({
  createServerClient: () => mockSupabase,
}));

describe('buyBidsAction Server Action', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return unauthorized if there is no session', async () => {
    mockSupabase.auth.getSession.mockResolvedValueOnce({
      data: { session: null },
      error: new Error('No session'),
    });

    const result = await buyBidsAction('ref-123');
    expect(result).toEqual({ success: false, error: 'Unauthorized. Please login first.' });
  });

  it('should prevent double spending if transaction reference already processed', async () => {
    const mockSession = { user: { id: 'user-123' } };
    mockSupabase.auth.getSession.mockResolvedValueOnce({
      data: { session: mockSession },
      error: null,
    });

    const mockQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: { id: 'existing-tx-id' }, error: null }),
    };

    mockSupabase.from.mockImplementation((table) => {
      if (table === 'transactions') return mockQuery;
      return {};
    });

    const result = await buyBidsAction('ref-123');
    expect(result).toEqual({ success: false, error: 'Transaction reference already processed.' });
  });

  it('should record transaction and increment wallet bid balance', async () => {
    const mockSession = { user: { id: 'user-123' } };
    mockSupabase.auth.getSession.mockResolvedValueOnce({
      data: { session: mockSession },
      error: null,
    });

    // Mock query chains
    const mockTxQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }), // reference does not exist yet
      insert: vi.fn().mockResolvedValue({ error: null }),
    };

    const mockWalletQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: { id: 'wallet-abc', free_bids_remaining: 5 }, error: null }),
      update: vi.fn().mockReturnThis(),
    };

    const mockWalletUpdate = {
      eq: vi.fn().mockResolvedValue({ error: null }),
    };
    mockWalletQuery.update.mockReturnValue(mockWalletUpdate);

    mockSupabase.from.mockImplementation((table) => {
      if (table === 'transactions') return mockTxQuery;
      if (table === 'wallets') return mockWalletQuery;
      return {};
    });

    const result = await buyBidsAction('ref-new-999');
    expect(result).toEqual({ success: true });

    // Assert transactions table was written to
    expect(mockTxQuery.insert).toHaveBeenCalledWith([
      {
        profile_id: 'user-123',
        amount: 500,
        reference: 'ref-new-999',
        type: 'bid_bundle',
        status: 'success',
      },
    ]);

    // Assert wallet update incremented existing bids
    expect(mockWalletQuery.update).toHaveBeenCalledWith({
      free_bids_remaining: 15,
    });
  });
});

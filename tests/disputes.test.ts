import { describe, it, expect, vi, beforeEach } from 'vitest';
import { raiseDispute } from '@/app/actions/disputes';

// Mock cookies
vi.mock('next/headers', () => ({
  cookies: () => ({
    getAll: () => [],
    set: vi.fn(),
  }),
}));

// Mock revalidatePath
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

// Mock Supabase
const mockSupabase = {
  auth: {
    getUser: vi.fn(),
  },
  from: vi.fn(),
};

vi.mock('@supabase/ssr', () => ({
  createServerClient: () => mockSupabase,
}));

describe('raiseDispute Server Action', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should throw unauthorized if user is not logged in', async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: null },
      error: new Error('Session expired'),
    });

    await expect(
      raiseDispute({
        job_id: 'job-123',
        reason: 'Poor quality work',
        evidence_urls: [],
      })
    ).rejects.toThrow('Unauthorized');
  });

  it('should throw if there is no locked escrow for this job', async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: { id: 'employer-123' } },
      error: null,
    });

    const mockEscrowQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: new Error('Not found') }),
    };

    mockSupabase.from.mockImplementation((table) => {
      if (table === 'protected_funds') return mockEscrowQuery;
      return {};
    });

    await expect(
      raiseDispute({
        job_id: 'job-123',
        reason: 'Poor quality work',
        evidence_urls: [],
      })
    ).rejects.toThrow('No locked funds to dispute');
  });

  it('should throw if the user is not the employer', async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: { id: 'some-other-user' } },
      error: null,
    });

    const mockEscrowQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: {
          id: 'escrow-123',
          employer_id: 'employer-123',
          artisan_id: 'artisan-456',
          status: 'locked',
          jobs: { stage: 'in_progress' },
        },
        error: null,
      }),
    };

    mockSupabase.from.mockImplementation((table) => {
      if (table === 'protected_funds') return mockEscrowQuery;
      return {};
    });

    await expect(
      raiseDispute({
        job_id: 'job-123',
        reason: 'Poor quality work',
        evidence_urls: [],
      })
    ).rejects.toThrow('Only employer can raise dispute');
  });

  it('should successfully raise a dispute, update job stage, and return details', async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: { id: 'employer-123' } },
      error: null,
    });

    // Mock escrow retrieval
    const mockEscrowQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: {
          id: 'escrow-123',
          employer_id: 'employer-123',
          artisan_id: 'artisan-456',
          status: 'locked',
          jobs: { stage: 'in_progress' },
        },
        error: null,
      }),
    };

    // Mock existing dispute check (single returns null meaning no existing active dispute)
    const mockExistingDisputeQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    };

    // Mock dispute record creation
    const mockDisputeInsertQuery = {
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { id: 'dispute-999' }, error: null }),
    };

    // Mock job freezing (updating stage to disputed)
    const mockJobsUpdateQuery = {
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ error: null }),
    };

    mockSupabase.from.mockImplementation((table) => {
      if (table === 'protected_funds') return mockEscrowQuery;
      if (table === 'disputes') {
        // If checking existing dispute (select id)
        if (mockExistingDisputeQuery.select.mock.calls.length === 0) {
          return mockExistingDisputeQuery;
        }
        return mockDisputeInsertQuery;
      }
      if (table === 'jobs') return mockJobsUpdateQuery;
      return {};
    });

    const result = await raiseDispute({
      job_id: 'job-123',
      reason: 'Poor quality work',
      evidence_urls: ['http://example.com/evidence.png'],
    });

    expect(result.success).toBe(true);
    expect(result.dispute_id).toBe('dispute-999');
    expect(result.expires_at).toBeDefined();

    // Verify job is updated to stage 'disputed'
    expect(mockJobsUpdateQuery.update).toHaveBeenCalledWith({ stage: 'disputed' });
  });
});

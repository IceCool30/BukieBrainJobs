// @vitest-environment node
/**
 * WEB-012 Mock Matching Repository: unit tests
 *
 * TDD-first: these tests define the required behaviour of the mock adapter
 * and the domain contracts. They must also pass against any future
 * ApiMatchingRepository that satisfies IMatchingRepository.
 *
 * ARCH-002 rules enforced:
 *  - Repository errors propagate as errors (never silently succeed)
 *  - No fabricated rates, coordinates, ratings, or acceptance states
 *  - Invalid context → 'invalid_context' state, not empty array disguised as success
 *  - Selection → honest 'pending'/'interest_expressed', never 'booked'
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  MockMatchingRepository,
  resetMatchingRepository,
} from './index';
import type { RankedMatchResult, MatchSelectionAction } from '@bukiebrainjobs/types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function repo() {
  return new MockMatchingRepository();
}

// ─── getMatchesForJob ─────────────────────────────────────────────────────────

describe('MockMatchingRepository.getMatchesForJob', () => {
  beforeEach(() => resetMatchingRepository());

  it('returns matches_available with ranked candidates for REQ-84920', async () => {
    const result = await repo().getMatchesForJob('customer-1', 'REQ-84920');
    expect(result.state).toBe('matches_available');
    expect(result.candidates.length).toBeGreaterThanOrEqual(2);
    // Ranks must be in ascending order
    const ranks = result.candidates.map((c) => c.rank);
    expect(ranks).toEqual([...ranks].sort((a, b) => a - b));
  });

  it('includes job context fields with REQ-84920', async () => {
    const result = await repo().getMatchesForJob('customer-1', 'REQ-84920');
    expect(result.jobTitle).toBeTruthy();
    expect(result.jobReferenceCode).toBe('REQ-84920');
    expect(result.jobLocation).toBeTruthy();
  });

  it('returns matches_available with a single candidate for REQ-51829', async () => {
    const result = await repo().getMatchesForJob('customer-1', 'REQ-51829');
    expect(result.state).toBe('matches_available');
    expect(result.candidates).toHaveLength(1);
  });

  it('returns in_progress state for REQ-INPROG', async () => {
    const result = await repo().getMatchesForJob('customer-1', 'REQ-INPROG');
    expect(result.state).toBe('in_progress');
    expect(result.candidates).toHaveLength(0);
  });

  it('returns no_matches state for REQ-NOMATCH', async () => {
    const result = await repo().getMatchesForJob('customer-1', 'REQ-NOMATCH');
    expect(result.state).toBe('no_matches');
    expect(result.candidates).toHaveLength(0);
  });

  it('returns constraint_limited with a constraintLabel for REQ-CONSTRAINED', async () => {
    const result = await repo().getMatchesForJob('customer-1', 'REQ-CONSTRAINED');
    expect(result.state).toBe('constraint_limited');
    expect(result.constraintLabel).toBeTruthy();
    expect(result.candidates).toHaveLength(0);
  });

  it('returns partial_results with at least one candidate for REQ-PARTIAL', async () => {
    const result = await repo().getMatchesForJob('customer-1', 'REQ-PARTIAL');
    expect(result.state).toBe('partial_results');
    expect(result.candidates.length).toBeGreaterThanOrEqual(1);
  });

  it('returns failed state for REQ-FAILED without fabricating candidates', async () => {
    const result = await repo().getMatchesForJob('customer-1', 'REQ-FAILED');
    expect(result.state).toBe('failed');
    expect(result.candidates).toHaveLength(0);
  });

  it('returns offline state for REQ-OFFLINE', async () => {
    const result = await repo().getMatchesForJob('customer-1', 'REQ-OFFLINE');
    expect(result.state).toBe('offline');
  });

  it('returns stale_results state with candidate context for REQ-STALE', async () => {
    const result = await repo().getMatchesForJob('customer-1', 'REQ-STALE');
    expect(result.state).toBe('stale_results');
    expect(result.candidates.length).toBeGreaterThanOrEqual(1);
    expect(result.resultGeneratedAt).toBe('2026-09-10T09:00:00Z');
  });

  it('throws a programming error when customerId is empty', async () => {
    await expect(repo().getMatchesForJob('', 'REQ-84920')).rejects.toThrow();
  });

  it('enforces customer ownership boundary for REQ-OTHER-CUST', async () => {
    // customer-1 is not authorized for REQ-OTHER-CUST
    const unauthorizedResult = await repo().getMatchesForJob('customer-1', 'REQ-OTHER-CUST');
    expect(unauthorizedResult.state).toBe('invalid_context');
    expect(unauthorizedResult.candidates).toHaveLength(0);
    expect(unauthorizedResult.jobTitle).toBe('');

    // customer-2 is the authorized owner
    const authorizedResult = await repo().getMatchesForJob('customer-2', 'REQ-OTHER-CUST');
    expect(authorizedResult.state).toBe('matches_available');
    expect(authorizedResult.candidates.length).toBeGreaterThanOrEqual(1);
  });

  it('returns invalid_context for an unknown reference code with empty job title', async () => {
    const result = await repo().getMatchesForJob('customer-1', 'REQ-UNKNOWN-XYZ');
    expect(result.state).toBe('invalid_context');
    expect(result.candidates).toHaveLength(0);
    expect(result.jobTitle).toBe('');
  });

  it('throws a programming error when jobReferenceCode is empty', async () => {
    await expect(repo().getMatchesForJob('customer-1', '')).rejects.toThrow();
  });

  it('is case-insensitive for reference code lookup', async () => {
    const result = await repo().getMatchesForJob('customer-1', 'req-84920');
    expect(result.state).toBe('matches_available');
  });

  // ─── ARCH-002: data integrity rules ────────────────────────────────────────

  it('never fabricates a rating for a candidate where none is available', async () => {
    const partial = await repo().getMatchesForJob('customer-1', 'REQ-PARTIAL');
    const candidateWithoutRating = partial.candidates.find(
      (c) => c.profile.publicRating === undefined
    );
    // At least one candidate in partial fixture must have no rating
    expect(candidateWithoutRating).toBeDefined();
  });

  it('never fabricates a rateLabel for a candidate where none is available', async () => {
    const partial = await repo().getMatchesForJob('customer-1', 'REQ-PARTIAL');
    const noRate = partial.candidates.find((c) => c.profile.rateLabel === undefined);
    expect(noRate).toBeDefined();
  });

  it('never claims a candidate has been accepted or booked', async () => {
    const result = await repo().getMatchesForJob('customer-1', 'REQ-84920');
    for (const c of result.candidates) {
      // selectionState must be 'none', 'interest_expressed', or 'pending', never 'booked'
      expect(['none', 'interest_expressed', 'pending', undefined]).toContain(c.selectionState);
    }
  });

  it('does not include private fields (NIN, BVN, phone, email) in any candidate profile', async () => {
    const result = await repo().getMatchesForJob('customer-1', 'REQ-84920');
    for (const c of result.candidates) {
      const profile = c.profile as unknown as Record<string, unknown>;
      expect(profile['nin']).toBeUndefined();
      expect(profile['bvn']).toBeUndefined();
      expect(profile['phone']).toBeUndefined();
      expect(profile['email']).toBeUndefined();
      expect(profile['privatePhone']).toBeUndefined();
      expect(profile['internalRiskScore']).toBeUndefined();
    }
  });

  it('all returned candidates have eligibility === "eligible"', async () => {
    const result = await repo().getMatchesForJob('customer-1', 'REQ-84920');
    for (const c of result.candidates) {
      expect(c.eligibility).toBe('eligible');
    }
  });
});

// ─── recordSelection ───────────────────────────────────────────────────────────

describe('MockMatchingRepository.recordSelection', () => {
  beforeEach(() => resetMatchingRepository());

  it('records interest_expressed and returns an honest confirmation label', async () => {
    const r = repo();
    const action: MatchSelectionAction = {
      type: 'EXPRESS_INTEREST',
      candidateId: 'bw-tunde-bakare',
      jobReferenceCode: 'REQ-84920',
    };
    const result = await r.recordSelection('customer-1', action);
    expect(result.newSelectionState).toBe('interest_expressed');
    expect(result.confirmationLabel).toBeTruthy();
    // Must not claim booking or acceptance
    expect(result.confirmationLabel.toLowerCase()).not.toContain('book');
    expect(result.confirmationLabel.toLowerCase()).not.toContain('accept');
    expect(result.confirmationLabel.toLowerCase()).not.toContain('assigned');
    expect(result.confirmationLabel.toLowerCase()).not.toContain('confirmed');
  });

  it('withdraws interest and returns newSelectionState of "none"', async () => {
    const r = repo();
    const expressAction: MatchSelectionAction = {
      type: 'EXPRESS_INTEREST',
      candidateId: 'bw-tunde-bakare',
      jobReferenceCode: 'REQ-84920',
    };
    await r.recordSelection('customer-1', expressAction);

    const withdrawAction: MatchSelectionAction = {
      type: 'WITHDRAW_INTEREST',
      candidateId: 'bw-tunde-bakare',
      jobReferenceCode: 'REQ-84920',
    };
    const result = await r.recordSelection('customer-1', withdrawAction);
    expect(result.newSelectionState).toBe('none');
  });

  it('persists selection state across subsequent getMatchesForJob calls', async () => {
    const r = repo();
    await r.recordSelection('customer-1', {
      type: 'EXPRESS_INTEREST',
      candidateId: 'bw-tunde-bakare',
      jobReferenceCode: 'REQ-84920',
    });

    const result = await r.getMatchesForJob('customer-1', 'REQ-84920');
    const candidate = result.candidates.find((c) => c.candidateId === 'bw-tunde-bakare');
    expect(candidate?.selectionState).toBe('interest_expressed');
  });

  it('scopes selection state to customer and job', async () => {
    const r = repo();
    await r.recordSelection('customer-1', {
      type: 'EXPRESS_INTEREST',
      candidateId: 'bw-tunde-bakare',
      jobReferenceCode: 'REQ-84920',
    });

    // Customer-1 on the same job sees interest_expressed
    const resultCust1 = await r.getMatchesForJob('customer-1', 'REQ-84920');
    expect(resultCust1.candidates.find((c) => c.candidateId === 'bw-tunde-bakare')?.selectionState).toBe('interest_expressed');

    // Customer-test-1 on the same job does NOT see interest_expressed
    const resultOtherCust = await r.getMatchesForJob('customer-test-1', 'REQ-84920');
    expect(resultOtherCust.candidates.find((c) => c.candidateId === 'bw-tunde-bakare')?.selectionState).toBe('none');

    // Customer-1 on a different job (REQ-STALE) where Tunde is also a candidate does NOT see interest_expressed
    const resultOtherJob = await r.getMatchesForJob('customer-1', 'REQ-STALE');
    expect(resultOtherJob.candidates.find((c) => c.candidateId === 'bw-tunde-bakare')?.selectionState).toBe('none');
  });

  it('throws when customerId is missing', async () => {
    const r = repo();
    await expect(
      r.recordSelection('', {
        type: 'EXPRESS_INTEREST',
        candidateId: 'bw-tunde-bakare',
        jobReferenceCode: 'REQ-84920',
      })
    ).rejects.toThrow();
  });

  it('throws when candidateId is missing', async () => {
    const r = repo();
    await expect(
      r.recordSelection('customer-1', {
        type: 'EXPRESS_INTEREST',
        candidateId: '',
        jobReferenceCode: 'REQ-84920',
      })
    ).rejects.toThrow();
  });

  it('throws when jobReferenceCode is missing', async () => {
    const r = repo();
    await expect(
      r.recordSelection('customer-1', {
        type: 'EXPRESS_INTEREST',
        candidateId: 'bw-tunde-bakare',
        jobReferenceCode: '',
      })
    ).rejects.toThrow();
  });
});

// ─── State contract: three distinct failure conditions ─────────────────────────

describe('WEB-012 state contract: three distinct failure conditions', () => {
  it('no_matches is distinct from failed', async () => {
    const r = repo();
    const noMatch = await r.getMatchesForJob('customer-1', 'REQ-NOMATCH');
    const failed = await r.getMatchesForJob('customer-1', 'REQ-FAILED');
    expect(noMatch.state).not.toBe(failed.state);
  });

  it('failed is distinct from invalid_context', async () => {
    const r = repo();
    const failed = await r.getMatchesForJob('customer-1', 'REQ-FAILED');
    const invalid = await r.getMatchesForJob('customer-1', 'REQ-TOTALLY-BOGUS');
    expect(failed.state).not.toBe(invalid.state);
  });

  it('no_matches is distinct from invalid_context', async () => {
    const r = repo();
    const noMatch = await r.getMatchesForJob('customer-1', 'REQ-NOMATCH');
    const invalid = await r.getMatchesForJob('customer-1', 'REQ-TOTALLY-BOGUS');
    expect(noMatch.state).not.toBe(invalid.state);
  });
});

// ─── RankedMatchResult shape contract ─────────────────────────────────────────

describe('RankedMatchResult shape contract', () => {
  it('always has jobReferenceCode, jobTitle, state, and candidates array', async () => {
    const r = repo();
    const refCodes = ['REQ-84920', 'REQ-INPROG', 'REQ-NOMATCH', 'REQ-FAILED', 'REQ-UNKNOWN'];

    for (const ref of refCodes) {
      const result: RankedMatchResult = await r.getMatchesForJob('customer-1', ref);
      expect(typeof result.jobReferenceCode).toBe('string');
      expect(typeof result.jobTitle).toBe('string');
      expect(typeof result.state).toBe('string');
      expect(Array.isArray(result.candidates)).toBe(true);
    }
  });
});

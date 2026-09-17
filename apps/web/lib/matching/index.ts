/**
 * WEB-012 Mock Matching Adapter
 *
 * Implements IMatchingRepository using deterministic fixtures keyed by
 * job reference code. All nine required states are covered.
 *
 * Architectural rule (ARCH-002): This adapter must never:
 *  - Fabricate rates, coordinates, verification results, or availability
 *  - Claim a BrainWorker has accepted a job or been assigned
 *  - Turn a repository failure into a success result
 *  - Expose NIN, BVN, documents, risk signals, or private contact info
 *
 * Replacing this with ApiMatchingRepository preserves the customer-facing
 * information architecture without a UI redesign.
 */

import type {
  IMatchingRepository,
  RankedMatchResult,
  MatchCandidate,
  MatchSelectionAction,
  MatchSelectionResult,
} from '@bukiebrainjobs/types';

// ─── Candidate pool (public profile data only) ────────────────────────────────

const CANDIDATE_TUNDE: MatchCandidate = {
  candidateId: 'bw-tunde-bakare',
  rank: 1,
  eligibility: 'eligible',
  profile: {
    brainWorkerId: 'bw-tunde-bakare',
    displayName: 'Tunde Bakare',
    serviceAreaLabel: 'Lekki, Victoria Island, Ikoyi',
    servicesLabel: 'Inverter & Solar Installation, Electrical Services',
  },
  explanations: ['service_match', 'location_match'],
  selectionState: 'none',
};

const CANDIDATE_AMAKA: MatchCandidate = {
  candidateId: 'bw-amaka-osei',
  rank: 2,
  eligibility: 'eligible',
  profile: {
    brainWorkerId: 'bw-amaka-osei',
    displayName: 'Amaka Osei',
    serviceAreaLabel: 'Lekki Phase 1 & 2, Ajah',
    servicesLabel: 'Inverter & Solar Installation, Generator Maintenance',
  },
  explanations: ['service_match', 'location_match'],
  selectionState: 'none',
};

const CANDIDATE_EMEKA: MatchCandidate = {
  candidateId: 'bw-emeka-obi',
  rank: 3,
  eligibility: 'eligible',
  profile: {
    brainWorkerId: 'bw-emeka-obi',
    displayName: 'Emeka Obi',
    serviceAreaLabel: 'Lagos Mainland, Surulere, Yaba',
    servicesLabel: 'Plumbing & Pipefitting, Drainage Systems',
  },
  explanations: ['service_match'],
  selectionState: 'none',
};

// Candidate with partial data: profile fields omitted
const CANDIDATE_FOLAKE: MatchCandidate = {
  candidateId: 'bw-folake-adeyemi',
  rank: 4,
  eligibility: 'eligible',
  profile: {
    brainWorkerId: 'bw-folake-adeyemi',
    displayName: 'Folake Adeyemi',
    serviceAreaLabel: 'Ikeja, Maryland, Ojota',
    servicesLabel: 'Electrical Services, Ceiling Works',
  },
  explanations: ['service_match'],
  selectionState: 'none',
};

// ─── Fixture result builder ────────────────────────────────────────────────────

function makeResult(
  overrides: Partial<RankedMatchResult> & Pick<RankedMatchResult, 'jobReferenceCode' | 'jobTitle' | 'state'>
): RankedMatchResult {
  return {
    candidates: [],
    ...overrides,
  };
}

// ─── Fixture map keyed by reference code ──────────────────────────────────────

/**
 * Deterministic fixture outcomes for test and development.
 *
 * Reference codes and their intended scenarios:
 *
 *  REQ-84920  → multiple ranked matches (from existing mock activities)
 *  REQ-51829  → single match
 *  REQ-INPROG → matching in progress
 *  REQ-NOMATCH → no suitable matches
 *  REQ-CONSTRAINED → constraint-limited (location out of service area)
 *  REQ-PARTIAL → partial results (some data unavailable)
 *  REQ-FAILED  → matching service failure
 *  REQ-OFFLINE → offline / degraded connectivity
 */
const FIXTURE_MAP: Record<string, RankedMatchResult> = {
  // ── Multiple ranked matches ─────────────────────────────────────────────────
  'REQ-84920': makeResult({
    jobReferenceCode: 'REQ-84920',
    jobTitle: 'Inverter Backup & Battery Inspection',
    jobServiceLabel: 'Inverter & Solar Installation',
    jobLocation: 'Lekki Phase 1, Lagos',
    jobSchedule: 'Urgent / Today',
    jobBudgetLabel: '₦35,000 (Open to discussion)',
    jobDescription:
      'Solar inverter requires complete system health check and deep-cycle battery bank load testing following frequent trip switch issues.',
    state: 'matches_available',
    candidates: [CANDIDATE_TUNDE, CANDIDATE_AMAKA],
    totalCandidateCount: 2,
  }),

  // ── Single match ────────────────────────────────────────────────────────────
  'REQ-51829': makeResult({
    jobReferenceCode: 'REQ-51829',
    jobTitle: 'Kitchen Cabinet Hinge & Track Realignment',
    jobServiceLabel: 'Carpentry & Woodwork',
    jobLocation: 'Ikeja, Lagos',
    jobSchedule: 'Flexible / Within a week',
    // Budget omitted: customer submitted without budget
    jobDescription:
      'Realign four soft-close cabinet doors in the pantry and replace worn drawer ball-bearing slides.',
    state: 'matches_available',
    candidates: [CANDIDATE_EMEKA],
    totalCandidateCount: 1,
  }),

  // ── Matching in progress ────────────────────────────────────────────────────
  'REQ-INPROG': makeResult({
    jobReferenceCode: 'REQ-INPROG',
    jobTitle: 'Ceiling Fan & Chandelier Wiring',
    jobServiceLabel: 'Electrical Services',
    jobLocation: 'Yaba, Lagos',
    jobSchedule: 'Flexible / This week',
    state: 'in_progress',
    candidates: [],
  }),

  // ── No suitable matches ─────────────────────────────────────────────────────
  'REQ-NOMATCH': makeResult({
    jobReferenceCode: 'REQ-NOMATCH',
    jobTitle: 'Generator Carburetor Rebuild',
    jobServiceLabel: 'Generator Maintenance',
    jobLocation: 'Gbagada, Lagos',
    jobSchedule: 'Flexible / This week',
    jobBudgetLabel: '₦12,000',
    state: 'no_matches',
    candidates: [],
    totalCandidateCount: 0,
  }),

  // ── Constraint-limited ──────────────────────────────────────────────────────
  'REQ-CONSTRAINED': makeResult({
    jobReferenceCode: 'REQ-CONSTRAINED',
    jobTitle: 'CCTV System Installation',
    jobServiceLabel: 'Security & CCTV',
    jobLocation: 'Ibeju-Lekki (outside active service area)',
    jobSchedule: 'This month',
    state: 'constraint_limited',
    constraintLabel: 'This location is outside the current active service area.',
    candidates: [],
    totalCandidateCount: 0,
  }),

  // ── Partial results ─────────────────────────────────────────────────────────
  'REQ-PARTIAL': makeResult({
    jobReferenceCode: 'REQ-PARTIAL',
    jobTitle: 'Bathroom Tile Replacement',
    jobServiceLabel: 'Tiling & Flooring',
    jobLocation: 'Surulere, Lagos',
    jobSchedule: 'Next week',
    state: 'partial_results',
    candidates: [CANDIDATE_FOLAKE],
    totalCandidateCount: 1,
  }),

  // ── Stale results ───────────────────────────────────────────────────────────
  'REQ-STALE': makeResult({
    jobReferenceCode: 'REQ-STALE',
    jobTitle: 'Generator Soundproof Canopy Repair',
    jobServiceLabel: 'Generator Maintenance',
    jobLocation: 'Victoria Island, Lagos',
    jobSchedule: 'Completed earlier',
    state: 'stale_results',
    candidates: [CANDIDATE_TUNDE],
    resultGeneratedAt: '2026-09-10T09:00:00Z',
    totalCandidateCount: 1,
  }),

  // ── Matching service failure ────────────────────────────────────────────────
  'REQ-FAILED': makeResult({
    jobReferenceCode: 'REQ-FAILED',
    jobTitle: 'Plumbing Drainage Pressure Test',
    jobServiceLabel: 'Plumbing & Pipefitting',
    jobLocation: 'Ikeja GRA, Lagos',
    jobSchedule: 'This week',
    state: 'failed',
    candidates: [],
  }),

  // ── Offline / degraded connectivity ────────────────────────────────────────
  'REQ-OFFLINE': makeResult({
    jobReferenceCode: 'REQ-OFFLINE',
    jobTitle: 'Split-Unit AC Deep Servicing',
    jobServiceLabel: 'AC Repair & Installation',
    jobLocation: 'Victoria Island, Lagos',
    jobSchedule: 'Today',
    state: 'offline',
    candidates: [],
  }),

  // ── Cross-customer boundary fixture ─────────────────────────────────────────
  'REQ-OTHER-CUST': makeResult({
    jobReferenceCode: 'REQ-OTHER-CUST',
    jobTitle: 'Private Commercial HVAC Service',
    jobServiceLabel: 'AC Repair & Installation',
    jobLocation: 'Ikoyi, Lagos',
    state: 'matches_available',
    candidates: [CANDIDATE_TUNDE],
    totalCandidateCount: 1,
  }),
};

// ─── Customer Job Ownership Mapping (Mock Authorization Boundary) ─────────────
// Models: authenticated customer -> owned job -> matching context.
// Prevents cross-customer job or match data leakage.
const JOB_OWNERSHIP: Record<string, string[]> = {
  'REQ-84920': ['customer-1', 'customer-test-1', 'usr-customer-default'],
  'REQ-51829': ['customer-1', 'customer-test-1', 'usr-customer-default'],
  'REQ-INPROG': ['customer-1', 'customer-test-1', 'usr-customer-default'],
  'REQ-NOMATCH': ['customer-1', 'customer-test-1', 'usr-customer-default'],
  'REQ-CONSTRAINED': ['customer-1', 'customer-test-1', 'usr-customer-default'],
  'REQ-PARTIAL': ['customer-1', 'customer-test-1', 'usr-customer-default'],
  'REQ-STALE': ['customer-1', 'customer-test-1', 'usr-customer-default'],
  'REQ-FAILED': ['customer-1', 'customer-test-1', 'usr-customer-default'],
  'REQ-OFFLINE': ['customer-1', 'customer-test-1', 'usr-customer-default'],
  // Owned exclusively by customer-2 for boundary tests
  'REQ-OTHER-CUST': ['customer-2'],
};

// ─── Selection state store (in-memory, customer- and job-scoped) ───────────────
// Key format: `${customerId}:${jobReferenceCode}:${candidateId}`
function makeSelectionKey(customerId: string, jobReferenceCode: string, candidateId: string): string {
  return `${customerId.trim().toLowerCase()}:${jobReferenceCode.trim().toUpperCase()}:${candidateId.trim().toLowerCase()}`;
}

const selectionStore = new Map<string, 'interest_expressed' | 'none'>();

// ─── Helper: resolve a result with ownership and scoped selection state ───────

function resolveResult(customerId: string, jobReferenceCode: string): RankedMatchResult {
  const fixture = FIXTURE_MAP[jobReferenceCode];
  if (!fixture) {
    return makeResult({
      jobReferenceCode,
      jobTitle: '',
      state: 'invalid_context',
      candidates: [],
    });
  }

  // Enforce customer ownership boundary
  const authorizedOwners = JOB_OWNERSHIP[jobReferenceCode] ?? [];
  if (!authorizedOwners.includes(customerId.trim())) {
    // Reference code is valid in system, but requesting customer is not the owner.
    // Return invalid_context without exposing job details or match data.
    return makeResult({
      jobReferenceCode,
      jobTitle: '',
      state: 'invalid_context',
      candidates: [],
    });
  }

  // Merge customer- and job-scoped selection state into candidates
  const candidates = fixture.candidates.map((c) => {
    const key = makeSelectionKey(customerId, jobReferenceCode, c.candidateId);
    return {
      ...c,
      selectionState: selectionStore.get(key) ?? c.selectionState ?? 'none',
    };
  });

  return { ...fixture, candidates };
}

// ─── Mock Repository Implementation ───────────────────────────────────────────

export class MockMatchingRepository implements IMatchingRepository {
  /**
   * Returns a deterministic RankedMatchResult for the given job reference.
   * Enforces customer/job ownership boundary.
   * Simulates realistic async latency without network I/O.
   */
  async getMatchesForJob(
    customerId: string,
    jobReferenceCode: string
  ): Promise<RankedMatchResult> {
    if (!customerId || typeof customerId !== 'string' || !customerId.trim()) {
      throw new Error('[MockMatchingRepository] customerId is required');
    }
    if (!jobReferenceCode || typeof jobReferenceCode !== 'string' || !jobReferenceCode.trim()) {
      throw new Error('[MockMatchingRepository] jobReferenceCode is required');
    }

    // Minimal deterministic delay to represent async boundary
    await new Promise((resolve) => setTimeout(resolve, 80));

    return resolveResult(customerId.trim(), jobReferenceCode.trim().toUpperCase());
  }

  /**
   * Records customer interest in a candidate, scoped to customer and job.
   * Returns honest pending/simulated state, does not claim booking or acceptance.
   */
  async recordSelection(
    customerId: string,
    action: MatchSelectionAction
  ): Promise<MatchSelectionResult> {
    if (!customerId || typeof customerId !== 'string' || !customerId.trim()) {
      throw new Error('[MockMatchingRepository] customerId is required');
    }
    if (!action || typeof action !== 'object') {
      throw new Error('[MockMatchingRepository] action is required');
    }
    if (!action.candidateId || typeof action.candidateId !== 'string' || !action.candidateId.trim()) {
      throw new Error('[MockMatchingRepository] candidateId is required');
    }
    if (!action.jobReferenceCode || typeof action.jobReferenceCode !== 'string' || !action.jobReferenceCode.trim()) {
      throw new Error('[MockMatchingRepository] jobReferenceCode is required');
    }

    const custId = customerId.trim();
    const ref = action.jobReferenceCode.trim().toUpperCase();

    // 1. Enforce that customer owns the supplied jobReferenceCode
    const authorizedOwners = JOB_OWNERSHIP[ref] ?? [];
    if (!authorizedOwners.includes(custId)) {
      throw new Error(`[MockMatchingRepository] Unauthorized: customer '${custId}' does not own job '${ref}'`);
    }

    // 2. Enforce that job fixture exists and candidate belongs to that job's match context
    const fixture = FIXTURE_MAP[ref];
    if (!fixture) {
      throw new Error(`[MockMatchingRepository] Job '${ref}' not found`);
    }

    const candidate = fixture.candidates.find((c) => c.candidateId === action.candidateId);
    if (!candidate) {
      throw new Error(
        `[MockMatchingRepository] Candidate '${action.candidateId}' does not belong to job '${ref}' match context`
      );
    }

    // 3. Enforce candidate eligibility
    if (candidate.eligibility !== 'eligible') {
      throw new Error(
        `[MockMatchingRepository] Candidate '${action.candidateId}' is not eligible for selection`
      );
    }

    await new Promise((resolve) => setTimeout(resolve, 60));

    const key = makeSelectionKey(custId, ref, action.candidateId);

    if (action.type === 'EXPRESS_INTEREST') {
      selectionStore.set(key, 'interest_expressed');
      return {
        candidateId: action.candidateId,
        newSelectionState: 'interest_expressed',
        confirmationLabel:
          'Your interest has been noted. We will update you when more information is available.',
      };
    }

    if (action.type === 'WITHDRAW_INTEREST') {
      selectionStore.set(key, 'none');
      return {
        candidateId: action.candidateId,
        newSelectionState: 'none',
        confirmationLabel: 'Your interest has been withdrawn.',
      };
    }

    // Exhaustive check
    const _exhaustive: never = action.type;
    throw new Error(`[MockMatchingRepository] Unknown action type: ${_exhaustive as string}`);
  }

  /** Reset selection state: for testing and session cleanup */
  resetSelections(): void {
    selectionStore.clear();
  }
}

// ─── Singleton ────────────────────────────────────────────────────────────────

let _defaultRepository: IMatchingRepository | null = null;

export function getMatchingRepository(): IMatchingRepository {
  if (!_defaultRepository) {
    _defaultRepository = new MockMatchingRepository();
  }
  return _defaultRepository;
}

export function resetMatchingRepository(): void {
  selectionStore.clear();
  _defaultRepository = new MockMatchingRepository();
}

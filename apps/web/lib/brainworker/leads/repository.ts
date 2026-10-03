// apps/web/lib/brainworker/leads/repository.ts
// BW-003 Phase 4 GREEN: Repository & Tenant Isolation (REP-001 to REP-010)
// Governed by: BW-003 Architecture Contract v1.0 & Test-First Implementation Plan v1.0
//
// Invariant Rules:
// 1. Zero imports from testing/ (REP-009).
// 2. Every operation binds to the authenticated BrainWorker identity (REP-001 to REP-003).
// 3. Incomplete operational profiles fail closed (REP-004).
// 4. Reads return privacy-projected leads only; raw contact data never leaves the store (REP-005, LEAD-006).
// 5. Mutations verify invitation ownership and unresponded state (REP-006, REP-007).
// 6. Mutations fail closed while offline; reads stay tenant-scoped (REP-008).
// 7. Backing state is physically partitioned per BrainWorker ID (REP-010).

import type {
  IBrainWorkerLeadsRepository,
  LeadPage,
  LeadMutationResult,
  LeadFeedEvent,
  WorkerQuote,
  WorkerQuoteDraft,
  DeclineReason,
} from './types';
import {
  ForbiddenTenantAccessError,
  IncompleteProfileError,
  OfflineMutationError,
} from './types';
import type {
  ProviderProjectedLead,
  RawLeadData,
  LeadProviderOperationalProfile,
  DayOfWeek,
  ScheduleTimeWindow,
} from './domain';
import { projectLeadForProvider, sortAndPaginateLeads } from './domain';
import { getMockAuthenticatedUser } from '../../auth/storage';
import {
  CANONICAL_SERVICES_REGISTRY,
  type BrainWorkerOperationalProfile,
  type DaySchedule,
} from '../catalog/types';
import { getBrainWorkerOperationsRepository } from '../catalog/repository';

// ─────────────────────────────────────────────────────────────────
// Dependencies
// ─────────────────────────────────────────────────────────────────

/**
 * Resolves the authoritative operational profile for a BrainWorker.
 * Returning null means "no complete profile" and fails closed.
 */
export type OperationalProfileResolver = (
  brainWorkerId: string
) =>
  | LeadProviderOperationalProfile
  | null
  | Promise<LeadProviderOperationalProfile | null>;

/**
 * Resolves the catalog diagnostic fee for a BrainWorker in integer kobo.
 * Missing profiles, catalogs, storage errors, or invalid amounts must fail closed.
 */
export type CatalogDiagnosticFeeResolver = (
  brainWorkerId: string,
  serviceId?: string
) => number | Promise<number>;

export interface BrainWorkerLeadsRepositoryDependencies {
  /**
   * Bridge to the authoritative operational profile source.
   * Defaults to the BW-002 operations repository. Test harnesses may
   * inject a deterministic resolver; the gate is enforced here either way.
   */
  resolveOperationalProfile?: OperationalProfileResolver | undefined;
  /**
   * Bridge to resolve the active catalog diagnostic fee in integer kobo.
   */
  resolveCatalogDiagnosticFee?: CatalogDiagnosticFeeResolver | undefined;
}

const ACCEPTED_DECLINE_REASONS: readonly DeclineReason[] = [
  'SCHEDULE_CONFLICT',
  'OUTSIDE_COVERAGE_AREA',
  'SKILL_TOOL_MISMATCH',
  'RATE_BUDGET_MISMATCH',
  'TEMPORARILY_UNAVAILABLE',
  'OTHER',
];

function mapOperationsProfile(
  profile: BrainWorkerOperationalProfile
): LeadProviderOperationalProfile {
  const padHour = (hour: number): string =>
    `${String(Math.max(0, Math.min(23, Math.trunc(hour)))).padStart(2, '0')}:00`;

  const weeklySchedule: Record<DayOfWeek, ScheduleTimeWindow[]> = {
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
    sunday: [],
  };
  const source = profile.availability?.weeklySchedule;
  if (source && typeof source === 'object') {
    (Object.keys(weeklySchedule) as DayOfWeek[]).forEach((day) => {
      const daySchedule: DaySchedule | undefined = source[day];
      if (daySchedule && daySchedule.isActive) {
        weeklySchedule[day] = [
          { start: padHour(daySchedule.startHour), end: padHour(daySchedule.endHour) },
        ];
      }
    });
  }

  const activeServiceSkillIds = (profile.catalog?.services ?? [])
    .filter((service) => service.status === 'ACTIVE')
    .map((service) => {
      const canonical = CANONICAL_SERVICES_REGISTRY.find(
        (entry) => entry.serviceId === service.serviceId
      );
      return canonical?.skillId ?? service.serviceId;
    });

  return {
    isComplete: profile.isComplete === true,
    isAvailable: profile.availability?.isAvailable === true,
    primaryCityId: profile.coverage?.primaryCityId ?? '',
    operationalZones: [...(profile.coverage?.coverageNeighbourhoods ?? [])],
    travelRadiusKm: profile.coverage?.travelRadiusKm ?? 0,
    activeServiceSkillIds,
    weeklySchedule,
  };
}

async function resolveProfileFromOperationsRepository(
  brainWorkerId: string
): Promise<LeadProviderOperationalProfile | null> {
  try {
    const profile = await getBrainWorkerOperationsRepository().getOperationalProfile(
      brainWorkerId
    );
    if (!profile) return null;
    return mapOperationsProfile(profile);
  } catch {
    // Authorization or storage failures fail closed as an incomplete profile.
    return null;
  }
}

async function resolveDiagnosticFeeFromOperationsRepository(
  brainWorkerId: string
): Promise<number> {
  let profile: BrainWorkerOperationalProfile | null;
  try {
    profile = await getBrainWorkerOperationsRepository().getOperationalProfile(
      brainWorkerId
    );
  } catch (error) {
    if (
      error instanceof ForbiddenTenantAccessError ||
      (error instanceof Error && error.message.includes('FORBIDDEN_TENANT_ACCESS'))
    ) {
      if (error instanceof ForbiddenTenantAccessError) {
        throw error;
      }
      throw new ForbiddenTenantAccessError(error.message);
    }
    throw new Error(
      `CATALOG_UNRESOLVED: Failed to resolve authoritative operational profile for BrainWorker '${brainWorkerId}': ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }

  if (!profile || !profile.catalog) {
    throw new Error(
      `CATALOG_UNRESOLVED: Authoritative operational profile or catalog not found for BrainWorker '${brainWorkerId}'.`
    );
  }

  const services = profile.catalog.services;
  const hasActiveService =
    Array.isArray(services) && services.some((s) => s && s.status === 'ACTIVE');
  if (!hasActiveService) {
    throw new Error(
      `CATALOG_UNRESOLVED: Active configured service catalog not found for BrainWorker '${brainWorkerId}'.`
    );
  }

  const rawFeeNgn = profile.catalog.diagnosticFeeNgn;
  if (
    typeof rawFeeNgn !== 'number' ||
    !Number.isFinite(rawFeeNgn) ||
    rawFeeNgn < 0
  ) {
    throw new Error(
      `INVALID_CATALOG_DIAGNOSTIC_FEE: Provider catalog diagnostic fee is not a valid non-negative number (${String(
        rawFeeNgn
      )} NGN).`
    );
  }

  const feeKobo = Math.round(rawFeeNgn * 100);
  if (
    !Number.isInteger(feeKobo) ||
    !Number.isFinite(feeKobo) ||
    feeKobo < 0 ||
    Math.abs(feeKobo - rawFeeNgn * 100) > 1e-4
  ) {
    throw new Error(
      `INVALID_CATALOG_DIAGNOSTIC_FEE: Catalog diagnostic fee (${rawFeeNgn} NGN) cannot be converted to a valid integer kobo amount.`
    );
  }

  return feeKobo;
}

// ─────────────────────────────────────────────────────────────────
// Tenant-scoped store
// ─────────────────────────────────────────────────────────────────

/**
 * Per-tenant backing state. Each BrainWorker ID receives a physically
 * separate partition; no cross-tenant lookups exist in this class.
 */
interface BrainWorkerLeadPartition {
  leads: Map<string, RawLeadData>;
  quotes: Map<string, WorkerQuote>;
}

export class BrainWorkerLeadsRepository implements IBrainWorkerLeadsRepository {
  private readonly resolveOperationalProfile: OperationalProfileResolver;
  private readonly resolveCatalogDiagnosticFee: CatalogDiagnosticFeeResolver;
  /** Physically partitioned per-tenant state (REP-010). */
  private readonly partitions = new Map<string, BrainWorkerLeadPartition>();
  private readonly subscribers = new Map<
    string,
    Set<(event: LeadFeedEvent) => void>
  >();
  private offlineOverride = false;
  private quoteCounter = 0;

  constructor(dependencies: BrainWorkerLeadsRepositoryDependencies = {}) {
    this.resolveOperationalProfile =
      dependencies.resolveOperationalProfile ??
      resolveProfileFromOperationsRepository;
    this.resolveCatalogDiagnosticFee =
      dependencies.resolveCatalogDiagnosticFee ??
      resolveDiagnosticFeeFromOperationsRepository;
  }

  // ── Authorization ───────────────────────────────────────────────

  /**
   * REP-001/002/003: every operation must be bound to the authenticated,
   * approved BrainWorker session. The supplied brainWorkerId is never
   * trusted on its own.
   */
  private assertAuthorizedTenant(brainWorkerId: string): void {
    if (!brainWorkerId || typeof brainWorkerId !== 'string' || brainWorkerId.trim() === '') {
      throw new ForbiddenTenantAccessError(
        'FORBIDDEN_TENANT_ACCESS: Valid BrainWorker ID is required.'
      );
    }

    const currentUser = getMockAuthenticatedUser();
    if (!currentUser) {
      throw new ForbiddenTenantAccessError(
        'FORBIDDEN_TENANT_ACCESS: Caller authentication is required.'
      );
    }
    if (currentUser.role !== 'brainworker') {
      throw new ForbiddenTenantAccessError(
        'FORBIDDEN_TENANT_ACCESS: Customer accounts cannot access BrainWorker leads.'
      );
    }
    if (!currentUser.isBrainWorkerApproved) {
      throw new ForbiddenTenantAccessError(
        'FORBIDDEN_TENANT_ACCESS: Unapproved BrainWorkers cannot access leads.'
      );
    }
    if (currentUser.id !== brainWorkerId) {
      throw new ForbiddenTenantAccessError(
        `FORBIDDEN_TENANT_ACCESS: Session '${currentUser.id}' cannot access leads for '${brainWorkerId}'.`
      );
    }
  }

  /**
   * REP-004: incomplete operational profiles are blocked from reads and
   * mutations. Unresolvable profiles fail closed.
   */
  private async assertCompleteProfile(brainWorkerId: string): Promise<void> {
    const profile = await this.resolveOperationalProfile(brainWorkerId);
    if (!profile || profile.isComplete !== true) {
      throw new IncompleteProfileError();
    }
  }

  /**
   * REP-008: mutations fail closed while offline. No offline mutation queue.
   */
  private assertNotOffline(): void {
    const isOffline =
      this.offlineOverride ||
      (typeof navigator !== 'undefined' &&
        typeof navigator.onLine === 'boolean' &&
        !navigator.onLine);
    if (isOffline) {
      throw new OfflineMutationError();
    }
  }

  // ── Partition access ────────────────────────────────────────────

  private getPartition(brainWorkerId: string): BrainWorkerLeadPartition {
    let partition = this.partitions.get(brainWorkerId);
    if (!partition) {
      partition = { leads: new Map(), quotes: new Map() };
      this.partitions.set(brainWorkerId, partition);
    }
    return partition;
  }

  private findLeadByInvitation(
    brainWorkerId: string,
    invitationId: string
  ): RawLeadData | undefined {
    const partition = this.partitions.get(brainWorkerId);
    if (!partition) return undefined;
    for (const lead of partition.leads.values()) {
      if (lead.invitationId === invitationId) {
        return lead;
      }
    }
    return undefined;
  }

  private notify(brainWorkerId: string, event: LeadFeedEvent): void {
    const listeners = this.subscribers.get(brainWorkerId);
    if (!listeners) return;
    for (const listener of listeners) {
      try {
        listener(event);
      } catch {
        // Listener failures never break repository execution.
      }
    }
  }

  // ── Reads ───────────────────────────────────────────────────────

  async getLeads(
    brainWorkerId: string,
    options?: { cursor?: string | undefined; limit?: number | undefined }
  ): Promise<LeadPage> {
    this.assertAuthorizedTenant(brainWorkerId);
    await this.assertCompleteProfile(brainWorkerId);

    const partition = this.partitions.get(brainWorkerId);
    const rawLeads = partition ? [...partition.leads.values()] : [];

    // REP-005 / LEAD-006: only the provider-safe projection leaves the store.
    const projected = rawLeads.map((lead) => projectLeadForProvider(lead));

    // LEAD-007: deterministic ordering and pagination.
    return sortAndPaginateLeads(projected, options);
  }

  async getLead(
    brainWorkerId: string,
    leadId: string
  ): Promise<ProviderProjectedLead | null> {
    this.assertAuthorizedTenant(brainWorkerId);
    await this.assertCompleteProfile(brainWorkerId);

    const partition = this.partitions.get(brainWorkerId);
    const raw = partition?.leads.get(leadId);
    if (!raw) return null;

    return projectLeadForProvider(raw);
  }

  // ── Mutations ────────────────────────────────────────────────────

  async acceptInvitation(
    brainWorkerId: string,
    invitationId: string
  ): Promise<LeadMutationResult> {
    this.assertAuthorizedTenant(brainWorkerId);
    await this.assertCompleteProfile(brainWorkerId);
    this.assertNotOffline();

    return this.respondToInvitation(brainWorkerId, invitationId, 'ACCEPTED');
  }

  async declineInvitation(
    brainWorkerId: string,
    invitationId: string,
    reason: DeclineReason
  ): Promise<LeadMutationResult> {
    this.assertAuthorizedTenant(brainWorkerId);
    await this.assertCompleteProfile(brainWorkerId);
    this.assertNotOffline();

    if (!ACCEPTED_DECLINE_REASONS.includes(reason)) {
      // Controlled taxonomy only; free-form reasons are rejected.
      return { ok: false, reason: 'INVALID_STATE' };
    }

    return this.respondToInvitation(brainWorkerId, invitationId, 'DECLINED', reason);
  }

  /**
   * REP-006/007: invitation ownership is enforced by tenant partition
   * (the invitation must live in the caller's own store), and only a
   * PENDING invitation may be responded to. respondedAt is generated
   * here, never accepted from the client.
   */
  private async respondToInvitation(
    brainWorkerId: string,
    invitationId: string,
    nextState: 'ACCEPTED' | 'DECLINED',
    declineReason?: DeclineReason
  ): Promise<LeadMutationResult> {
    const lead = this.findLeadByInvitation(brainWorkerId, invitationId);
    if (!lead) {
      return { ok: false, reason: 'INVITATION_NOT_FOUND' };
    }

    if (lead.invitationState === 'ACCEPTED' || lead.invitationState === 'DECLINED') {
      return { ok: false, reason: 'ALREADY_RESPONDED' };
    }
    if (lead.invitationState === 'EXPIRED' || lead.invitationState === 'SUPERSEDED') {
      return { ok: false, reason: 'INVALID_STATE' };
    }

    const respondedAt = new Date().toISOString();
    lead.invitationState = nextState;
    if (nextState === 'DECLINED' && declineReason) {
      lead.declineReason = declineReason;
    }
    this.notify(brainWorkerId, {
      type: 'lead_updated',
      lead: projectLeadForProvider(lead),
    });

    return {
      ok: true,
      invitationId,
      state: nextState,
      respondedAt,
      ...(declineReason ? { declineReason } : {}),
    };
  }

  async submitQuote(
    brainWorkerId: string,
    invitationId: string,
    quote: WorkerQuoteDraft
  ): Promise<WorkerQuote> {
    this.assertAuthorizedTenant(brainWorkerId);
    await this.assertCompleteProfile(brainWorkerId);
    this.assertNotOffline();

    const validateKobo = (value: number | undefined, field: string): number => {
      if (
        typeof value !== 'number' ||
        !Number.isInteger(value) ||
        value < 0
      ) {
        throw new Error(`Invalid quote draft: ${field} must be a non-negative integer kobo amount.`);
      }
      return value;
    };

    const laborAmountKobo = validateKobo(quote?.laborAmountKobo, 'laborAmountKobo');
    const diagnosticFeeKobo = validateKobo(quote?.diagnosticFeeKobo, 'diagnosticFeeKobo');
    const materialsAmountKobo =
      quote?.materialsAmountKobo === undefined
        ? undefined
        : validateKobo(quote.materialsAmountKobo, 'materialsAmountKobo');

    if (
      typeof quote?.estimatedHours !== 'number' ||
      !Number.isFinite(quote.estimatedHours) ||
      quote.estimatedHours <= 0
    ) {
      throw new Error('Invalid quote draft: estimatedHours must be a positive number.');
    }

    if (quote?.scopeNotes !== undefined) {
      if (typeof quote.scopeNotes !== 'string') {
        throw new Error('Invalid quote draft: scopeNotes must be a string.');
      }
      if (quote.scopeNotes.length > 1000) {
        throw new Error('Invalid quote draft: scopeNotes cannot exceed 1000 characters.');
      }
    }

    const lead = this.findLeadByInvitation(brainWorkerId, invitationId);
    if (!lead) {
      throw new Error('INVITATION_NOT_FOUND: No such invitation for this BrainWorker.');
    }
    if (lead.invitationState !== 'PENDING') {
      throw new Error(`ALREADY_RESPONDED: Invitation is ${lead.invitationState}.`);
    }

    // QUO-004: Diagnostic fee must match active catalog diagnostic fee
    const expectedCatalogDiagnosticFeeKobo =
      await this.resolveCatalogDiagnosticFee(brainWorkerId, lead.serviceId);
    if (
      typeof expectedCatalogDiagnosticFeeKobo !== 'number' ||
      !Number.isInteger(expectedCatalogDiagnosticFeeKobo) ||
      !Number.isFinite(expectedCatalogDiagnosticFeeKobo) ||
      expectedCatalogDiagnosticFeeKobo < 0
    ) {
      throw new Error(
        `INVALID_CATALOG_DIAGNOSTIC_FEE: Resolved catalog fee is not a valid non-negative integer kobo amount.`
      );
    }
    if (diagnosticFeeKobo !== expectedCatalogDiagnosticFeeKobo) {
      throw new Error(
        `Invalid quote draft: diagnosticFeeKobo (${diagnosticFeeKobo}) must match active provider catalog fee (${expectedCatalogDiagnosticFeeKobo}).`
      );
    }

    // Integer-kobo total is derived by the repository, never client-authored.
    const totalAmountKobo =
      laborAmountKobo + (materialsAmountKobo ?? 0) + diagnosticFeeKobo;

    this.quoteCounter += 1;
    const submittedQuote: WorkerQuote = {
      laborAmountKobo,
      ...(materialsAmountKobo !== undefined ? { materialsAmountKobo } : {}),
      diagnosticFeeKobo,
      estimatedHours: quote.estimatedHours,
      ...(quote.scopeNotes !== undefined ? { scopeNotes: quote.scopeNotes } : {}),
      id: `quote_${invitationId}_${Date.now()}_${this.quoteCounter}`,
      invitationId,
      totalAmountKobo,
      submittedAt: new Date().toISOString(),
      status: 'PENDING',
    };

    this.getPartition(brainWorkerId).quotes.set(submittedQuote.id, submittedQuote);
    return submittedQuote;
  }

  async acceptCustomerRate(
    brainWorkerId: string,
    invitationId: string
  ): Promise<LeadMutationResult> {
    this.assertAuthorizedTenant(brainWorkerId);
    await this.assertCompleteProfile(brainWorkerId);
    this.assertNotOffline();

    const lead = this.findLeadByInvitation(brainWorkerId, invitationId);
    if (!lead) {
      return { ok: false, reason: 'INVITATION_NOT_FOUND' };
    }
    // QUO-001: Pricing mode separation
    if (lead.pricingMode !== 'CUSTOMER_POSTED_RATE') {
      return { ok: false, reason: 'INVALID_STATE' };
    }

    return this.respondToInvitation(brainWorkerId, invitationId, 'ACCEPTED');
  }

  // ── Realtime (transport-unspecified) ─────────────────────────────

  subscribe(
    brainWorkerId: string,
    listener: (event: LeadFeedEvent) => void
  ): () => void {
    this.assertAuthorizedTenant(brainWorkerId);

    let listeners = this.subscribers.get(brainWorkerId);
    if (!listeners) {
      listeners = new Set();
      this.subscribers.set(brainWorkerId, listeners);
    }
    listeners.add(listener);

    return () => {
      const current = this.subscribers.get(brainWorkerId);
      if (current) {
        current.delete(listener);
        if (current.size === 0) {
          this.subscribers.delete(brainWorkerId);
        }
      }
    };
  }

  // ── Test-only surface ───────────────────────────────────────────
  // Used exclusively by the test harness. Must never be called from
  // production routes (REP-009 boundary).

  __testSeedLead(brainWorkerId: string, lead: RawLeadData): void {
    this.getPartition(brainWorkerId).leads.set(lead.id, { ...lead });
  }

  __testSetOffline(offline: boolean): void {
    this.offlineOverride = offline === true;
  }
}

let defaultRepository: BrainWorkerLeadsRepository | null = null;

export function createBrainWorkerLeadsRepository(
  dependencies: BrainWorkerLeadsRepositoryDependencies = {}
): BrainWorkerLeadsRepository {
  return new BrainWorkerLeadsRepository(dependencies);
}

export function getBrainWorkerLeadsRepository(): IBrainWorkerLeadsRepository {
  if (!defaultRepository) {
    defaultRepository = createBrainWorkerLeadsRepository();
  }
  return defaultRepository;
}

export function resetDefaultBrainWorkerLeadsRepository(): void {
  defaultRepository = null;
}

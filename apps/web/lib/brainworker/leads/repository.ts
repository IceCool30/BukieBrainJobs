// apps/web/lib/brainworker/leads/repository.ts
// BW-003 Phase 2 GREEN: In-Memory / Local Storage Partitioned Leads Repository
// Authoritative References:
// - docs/specs/BW-003-architecture-contract.md (Approved, Section 4.2)
// - docs/specs/BW-003-test-first-implementation-plan.md (Approved, Phase 2)

import type {
  IBrainWorkerLeadsRepository,
  BrainWorkerLeadsRepositoryDependencies,
  BrainWorkerLeadPartition,
  LeadStatus,
  InvitationStatus,
  WorkerQuoteDraft,
  LeadTimelineEvent,
  AuthoritativeLeadInvitation,
  WorkerQuote,
  DeclineReason,
} from './types';
import {
  ForbiddenTenantAccessError,
  LeadsRepositoryError,
  type ProviderProjectedLead,
} from './types';
import { getMockAuthenticatedUser } from '../auth/storage';
import {
  evaluateLeadEligibility,
  canTransitionLeadStatus,
  canTransitionInvitationStatus,
  validateTimelineEvent,
  maskLeadForProvider,
} from './domain';
import {
  CANONICAL_SERVICES_REGISTRY,
  type BrainWorkerOperationalProfile,
  type BrainWorkerServiceCatalog,
  type DaySchedule,
} from '../catalog/types';
import { getBrainWorkerOperationsRepository } from '../catalog/repository';

const STORAGE_KEY_PREFIX = 'bukie_bw_leads_';

// ── Default catalog diagnostic fee resolver ──────────────────────

async function resolveDiagnosticFeeFromOperationsRepository(
  brainWorkerId: string
): Promise<number> {
  let catalog: BrainWorkerServiceCatalog | null;
  try {
    catalog = await getBrainWorkerOperationsRepository().getConfiguredCatalog(
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
      `CATALOG_UNRESOLVED: Failed to resolve authoritative operational catalog for BrainWorker '${brainWorkerId}': ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }

  if (!catalog) {
    throw new Error(
      `CATALOG_UNRESOLVED: Active configured service catalog not found for BrainWorker '${brainWorkerId}'.`
    );
  }

  const rawFeeNgn = catalog.diagnosticFeeNgn;
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

// ── Default operational profile resolver ───────────────────────────

async function defaultResolveOperationalProfile(
  brainWorkerId: string
): Promise<BrainWorkerOperationalProfile | null> {
  try {
    return await getBrainWorkerOperationsRepository().getOperationalProfile(
      brainWorkerId
    );
  } catch {
    return null;
  }
}

// ── Partitioned Leads Repository Implementation ────────────────────

export class BrainWorkerLeadsRepository implements IBrainWorkerLeadsRepository {
  private readonly partitions = new Map<string, BrainWorkerLeadPartition>();
  private readonly resolveOperationalProfile: (
    brainWorkerId: string
  ) => Promise<BrainWorkerOperationalProfile | null>;
  private readonly resolveCatalogDiagnosticFee: (
    brainWorkerId: string
  ) => Promise<number> | number;

  constructor(dependencies: BrainWorkerLeadsRepositoryDependencies = {}) {
    this.resolveOperationalProfile =
      dependencies.resolveOperationalProfile ?? defaultResolveOperationalProfile;
    this.resolveCatalogDiagnosticFee =
      dependencies.resolveCatalogDiagnosticFee ??
      resolveDiagnosticFeeFromOperationsRepository;
  }

  // ── Tenant isolation ─────────────────────────────────────────────

  private assertCallerAuthorization(targetBrainWorkerId: string): void {
    const caller = getMockAuthenticatedUser();

    if (!caller) {
      throw new ForbiddenTenantAccessError(
        'FORBIDDEN_TENANT_ACCESS: Unauthenticated caller cannot access leads.'
      );
    }

    if (caller.role !== 'brainworker') {
      throw new ForbiddenTenantAccessError(
        `FORBIDDEN_TENANT_ACCESS: Caller role '${caller.role}' is not authorized to access leads.`
      );
    }

    if (caller.id !== targetBrainWorkerId) {
      throw new ForbiddenTenantAccessError(
        `FORBIDDEN_TENANT_ACCESS: Caller '${caller.id}' cannot access leads partition of '${targetBrainWorkerId}'.`
      );
    }
  }

  // ── Storage helpers ──────────────────────────────────────────────

  private getStorageKey(brainWorkerId: string): string {
    return `${STORAGE_KEY_PREFIX}${brainWorkerId}`;
  }

  private loadPartitionFromStorage(
    brainWorkerId: string
  ): BrainWorkerLeadPartition | null {
    if (typeof localStorage === 'undefined') {
      return null;
    }
    try {
      const raw = localStorage.getItem(this.getStorageKey(brainWorkerId));
      if (!raw) {
        return null;
      }
      return JSON.parse(raw) as BrainWorkerLeadPartition;
    } catch {
      return null;
    }
  }

  private savePartitionToStorage(
    brainWorkerId: string,
    partition: BrainWorkerLeadPartition
  ): void {
    if (typeof localStorage === 'undefined') {
      return;
    }
    try {
      localStorage.setItem(
        this.getStorageKey(brainWorkerId),
        JSON.stringify(partition)
      );
    } catch {
      // Storage unavailable or quota exceeded — in-memory partition survives
    }
  }

  // ── Partition access ───────────────────────────────────────────

  private getPartition(brainWorkerId: string): BrainWorkerLeadPartition {
    let partition = this.partitions.get(brainWorkerId);
    if (!partition) {
      const fromStorage = this.loadPartitionFromStorage(brainWorkerId);
      if (fromStorage) {
        partition = fromStorage;
        this.partitions.set(brainWorkerId, partition);
      } else {
        partition = {
          brainWorkerId,
          leads: [],
          updatedAt: new Date().toISOString(),
        };
        this.partitions.set(brainWorkerId, partition);
      }
    }
    return partition;
  }

  private commitPartition(
    brainWorkerId: string,
    partition: BrainWorkerLeadPartition
  ): void {
    partition.updatedAt = new Date().toISOString();
    this.partitions.set(brainWorkerId, partition);
    this.savePartitionToStorage(brainWorkerId, partition);
  }

  // ── Query methods ────────────────────────────────────────────────

  async getLeads(
    brainWorkerId: string,
    options: { status?: LeadStatus | undefined } = {}
  ): Promise<ProviderProjectedLead[]> {
    this.assertCallerAuthorization(brainWorkerId);

    const partition = this.getPartition(brainWorkerId);
    let leads = partition.leads;

    if (options.status) {
      leads = leads.filter((l) => l.status === options.status);
    }

    return leads.map((lead) => maskLeadForProvider(lead));
  }

  async getLeadById(
    brainWorkerId: string,
    leadId: string
  ): Promise<ProviderProjectedLead | null> {
    this.assertCallerAuthorization(brainWorkerId);

    const partition = this.getPartition(brainWorkerId);
    const lead = partition.leads.find((l) => l.id === leadId);
    if (!lead) {
      return null;
    }

    return maskLeadForProvider(lead);
  }

  // ── Seeding (for test harness & dispatch pipeline) ────────────────

  seedLead(brainWorkerId: string, lead: AuthoritativeLeadInvitation): void {
    const partition = this.getPartition(brainWorkerId);
    const existingIndex = partition.leads.findIndex((l) => l.id === lead.id);

    if (existingIndex >= 0) {
      partition.leads[existingIndex] = JSON.parse(
        JSON.stringify(lead)
      ) as AuthoritativeLeadInvitation;
    } else {
      partition.leads.push(
        JSON.parse(JSON.stringify(lead)) as AuthoritativeLeadInvitation
      );
    }

    this.commitPartition(brainWorkerId, partition);
  }

  // ── Mutation methods ─────────────────────────────────────────────

  async acceptInvitation(
    brainWorkerId: string,
    invitationId: string
  ): Promise<{ ok: boolean; reason?: string | undefined }> {
    this.assertCallerAuthorization(brainWorkerId);

    const partition = this.getPartition(brainWorkerId);
    const lead = partition.leads.find((l) => l.id === invitationId);

    if (!lead) {
      return { ok: false, reason: 'INVITATION_NOT_FOUND' };
    }

    // Phase 3 Invariant: Validate operational profile readiness
    const profile = await this.resolveOperationalProfile(brainWorkerId);
    if (!profile) {
      return { ok: false, reason: 'PROFILE_UNRESOLVED' };
    }

    // Verify day schedule for matching day of week
    const now = new Date();
    const dayOfWeek = [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
    ][now.getDay()] as keyof typeof profile.availability.weeklySchedule;

    const daySchedule = profile.availability.weeklySchedule[dayOfWeek];

    const eligibility = evaluateLeadEligibility({
      providerId: brainWorkerId,
      profile: {
        isAvailable: profile.availability.isAvailable,
        isEmergencyAvailable: profile.availability.isEmergencyAvailable,
        activeServiceSkillIds: profile.catalog.services
          .filter((s) => s.status === 'ACTIVE')
          .map((s) => {
            const canonical = CANONICAL_SERVICES_REGISTRY.find(
              (c) => c.serviceId === s.serviceId
            );
            return canonical?.skillId ?? s.serviceId;
          }),
        serviceNeighbourhoods: profile.coverage.coverageNeighbourhoods,
        travelRadiusKm: profile.coverage.travelRadiusKm,
        weeklySchedule: {
          [dayOfWeek]: daySchedule as DaySchedule,
        },
      },
      lead: {
        requiredSkillId: lead.requiredSkillId,
        urgency: lead.urgency,
        neighbourhood: lead.neighbourhood,
        city: lead.city,
        distanceKm: lead.distanceKm,
        scheduledSlot: lead.scheduledSlot,
      },
    });

    if (!eligibility.eligible) {
      return { ok: false, reason: eligibility.ineligibilityReason };
    }

    return this.respondToInvitation(brainWorkerId, invitationId, 'ACCEPTED');
  }

  async declineInvitation(
    brainWorkerId: string,
    invitationId: string,
    reason: DeclineReason
  ): Promise<{ ok: boolean; reason?: string | undefined }> {
    this.assertCallerAuthorization(brainWorkerId);

    // Validate decline reason is non-empty
    if (!reason || typeof reason !== 'string' || reason.trim() === '') {
      return { ok: false, reason: 'INVALID_STATE' };
    }

    return this.respondToInvitation(brainWorkerId, invitationId, 'DECLINED', reason);
  }

  /**
   * Internal transition handler for invitation responses.
   */
  private async respondToInvitation(
    brainWorkerId: string,
    invitationId: string,
    action: 'ACCEPTED' | 'DECLINED',
    declineReason?: DeclineReason | undefined
  ): Promise<{ ok: boolean; reason?: string | undefined }> {
    const partition = this.getPartition(brainWorkerId);
    const lead = partition.leads.find((l) => l.id === invitationId);

    if (!lead) {
      return { ok: false, reason: 'INVITATION_NOT_FOUND' };
    }

    // Invariant: Fail closed on terminal invitation state
    if (lead.invitationStatus === 'EXPIRED') {
      return { ok: false, reason: 'INVITATION_EXPIRED' };
    }

    if (lead.invitationStatus === 'ACCEPTED') {
      return { ok: false, reason: 'ALREADY_ACCEPTED' };
    }

    if (lead.invitationStatus === 'DECLINED') {
      return { ok: false, reason: 'ALREADY_DECLINED' };
    }

    // Check expiry timestamp
    const nowIso = new Date().toISOString();
    if (lead.expiresAt && new Date(lead.expiresAt).getTime() <= new Date(nowIso).getTime()) {
      // Transition to EXPIRED
      lead.invitationStatus = 'EXPIRED';
      lead.status = 'ARCHIVED';
      lead.updatedAt = nowIso;
      this.commitPartition(brainWorkerId, partition);
      return { ok: false, reason: 'INVITATION_EXPIRED' };
    }

    const nextInvitationStatus: InvitationStatus = action;
    const canTransition = canTransitionInvitationStatus(
      lead.invitationStatus,
      nextInvitationStatus
    );

    if (!canTransition) {
      return { ok: false, reason: 'INVALID_STATE' };
    }

    const nextLeadStatus: LeadStatus = action === 'ACCEPTED' ? 'ACCEPTED' : 'ARCHIVED';
    if (!canTransitionLeadStatus(lead.status, nextLeadStatus)) {
      return { ok: false, reason: 'INVALID_STATE' };
    }

    // Apply transitions
    lead.invitationStatus = nextInvitationStatus;
    lead.status = nextLeadStatus;
    lead.updatedAt = nowIso;

    if (action === 'DECLINED' && declineReason) {
      lead.declineReason = declineReason;
    }

    // Append timeline event
    const eventType = action === 'ACCEPTED' ? 'ACCEPTED' : 'DECLINED';
    const timelineEvent: LeadTimelineEvent = {
      id: `evt-${invitationId}-${Date.now()}`,
      leadId: invitationId,
      eventType,
      actor: 'BRAINWORKER',
      timestamp: nowIso,
      metadata: action === 'DECLINED' && declineReason ? { declineReason } : undefined,
    };

    if (validateTimelineEvent(timelineEvent)) {
      lead.timeline.push(timelineEvent);
    }

    this.commitPartition(brainWorkerId, partition);
    return { ok: true };
  }

  async submitQuote(
    brainWorkerId: string,
    invitationId: string,
    quoteDraft: WorkerQuoteDraft
  ): Promise<WorkerQuote> {
    this.assertCallerAuthorization(brainWorkerId);

    const partition = this.getPartition(brainWorkerId);
    const lead = partition.leads.find((l) => l.id === invitationId);

    if (!lead) {
      throw new LeadsRepositoryError('LEAD_NOT_FOUND', `Lead with ID '${invitationId}' not found.`);
    }

    // QUO-001 Invariant: Only WORKER_QUOTE pricingMode can receive a quote
    if (lead.pricingMode !== 'WORKER_QUOTE') {
      throw new LeadsRepositoryError(
        'INVALID_PRICING_MODE',
        `Lead '${invitationId}' has pricing mode '${lead.pricingMode}' and cannot receive worker quotes.`
      );
    }

    // QUO-002 Invariant: Lead must be in valid status (PENDING or ACCEPTED)
    if (lead.status !== 'PENDING' && lead.status !== 'ACCEPTED') {
      throw new LeadsRepositoryError(
        'INVALID_LEAD_STATE',
        `Lead '${invitationId}' is in status '${lead.status}' and cannot receive a quote.`
      );
    }

    // QUO-003 Invariant: Invitation must not be terminal
    if (
      lead.invitationStatus === 'DECLINED' ||
      lead.invitationStatus === 'EXPIRED'
    ) {
      throw new LeadsRepositoryError(
        'TERMINAL_INVITATION_STATE',
        `Invitation '${invitationId}' is in terminal status '${lead.invitationStatus}'.`
      );
    }

    // Invariant: Labor amount bounds [5,000 NGN to 500,000 NGN] in kobo
    const MIN_LABOR_KOBO = 500_000;
    const MAX_LABOR_KOBO = 50_000_000;
    if (
      typeof quoteDraft.laborAmountKobo !== 'number' ||
      !Number.isFinite(quoteDraft.laborAmountKobo) ||
      quoteDraft.laborAmountKobo < MIN_LABOR_KOBO ||
      quoteDraft.laborAmountKobo > MAX_LABOR_KOBO
    ) {
      throw new LeadsRepositoryError(
        'INVALID_LABOR_AMOUNT',
        `Labor amount (${quoteDraft.laborAmountKobo} kobo) is outside allowed bounds [5,000 NGN to 500,000 NGN].`
      );
    }

    // Invariant: Estimated hours bounds [1 to 40]
    if (
      typeof quoteDraft.estimatedHours !== 'number' ||
      !Number.isFinite(quoteDraft.estimatedHours) ||
      quoteDraft.estimatedHours < 1 ||
      quoteDraft.estimatedHours > 40
    ) {
      throw new LeadsRepositoryError(
        'INVALID_ESTIMATED_HOURS',
        `Estimated hours (${quoteDraft.estimatedHours}) must be between 1 and 40.`
      );
    }

    // QUO-008 Invariant: Scope notes character limit (max 500 chars)
    if (quoteDraft.scopeNotes !== undefined) {
      if (typeof quoteDraft.scopeNotes !== 'string' || quoteDraft.scopeNotes.length > 500) {
        throw new LeadsRepositoryError(
          'INVALID_SCOPE_NOTES',
          `Scope notes must be a string of at most 500 characters.`
        );
      }
    }

    // QUO-005 Invariant: Diagnostic fee resolution and validation
    let resolvedDiagnosticFeeKobo: number;
    try {
      resolvedDiagnosticFeeKobo = await this.resolveCatalogDiagnosticFee(brainWorkerId);
    } catch (error) {
      if (error instanceof ForbiddenTenantAccessError) {
        throw error;
      }
      throw error;
    }

    if (quoteDraft.diagnosticFeeKobo !== resolvedDiagnosticFeeKobo) {
      throw new LeadsRepositoryError(
        'DIAGNOSTIC_FEE_MISMATCH',
        `Submitted diagnosticFeeKobo (${quoteDraft.diagnosticFeeKobo}) must match active provider catalog fee (${resolvedDiagnosticFeeKobo}).`
      );
    }

    // Construct immutable WorkerQuote
    const nowIso = new Date().toISOString();
    const totalAmountKobo = quoteDraft.laborAmountKobo + resolvedDiagnosticFeeKobo;

    const quote: WorkerQuote = {
      id: `quo-${invitationId}-${Date.now()}`,
      leadId: invitationId,
      brainWorkerId,
      laborAmountKobo: quoteDraft.laborAmountKobo,
      diagnosticFeeKobo: resolvedDiagnosticFeeKobo,
      totalAmountKobo,
      estimatedHours: quoteDraft.estimatedHours,
      scopeNotes: quoteDraft.scopeNotes,
      status: 'SUBMITTED',
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    // QUO-009 Invariant: Auto-accept lead if currently PENDING
    if (lead.status === 'PENDING') {
      lead.status = 'ACCEPTED';
      lead.invitationStatus = 'ACCEPTED';
    }

    lead.quote = quote;
    lead.updatedAt = nowIso;

    // Timeline event for quote submission
    const timelineEvent: LeadTimelineEvent = {
      id: `evt-quote-${invitationId}-${Date.now()}`,
      leadId: invitationId,
      eventType: 'QUOTED',
      actor: 'BRAINWORKER',
      timestamp: nowIso,
      metadata: { quoteId: quote.id, totalAmountKobo },
    };

    if (validateTimelineEvent(timelineEvent)) {
      lead.timeline.push(timelineEvent);
    }

    this.commitPartition(brainWorkerId, partition);
    return quote;
  }
}

// ── Singleton Factory ──────────────────────────────────────────────

let defaultBrainWorkerLeadsRepository: IBrainWorkerLeadsRepository | null = null;

export function getBrainWorkerLeadsRepository(): IBrainWorkerLeadsRepository {
  if (!defaultBrainWorkerLeadsRepository) {
    defaultBrainWorkerLeadsRepository = new BrainWorkerLeadsRepository();
  }
  return defaultBrainWorkerLeadsRepository;
}

export function resetBrainWorkerLeadsRepository(): void {
  defaultBrainWorkerLeadsRepository = null;
}

export function createBrainWorkerLeadsRepository(
  dependencies: BrainWorkerLeadsRepositoryDependencies = {}
): IBrainWorkerLeadsRepository {
  return new BrainWorkerLeadsRepository(dependencies);
}

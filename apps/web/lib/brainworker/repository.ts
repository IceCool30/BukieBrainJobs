// apps/web/lib/brainworker/repository.ts
// Phase 1 RED Stub: BrainWorker Onboarding Repository
// Authoritative References:
// - docs/specs/BW-001-architecture-contract.md (Section 4 & 5)
// - docs/specs/BW-001-test-first-implementation-plan.md (Suite 2: REP-001 to REP-013)

import type {
  IBrainWorkerOnboardingRepository,
  BrainWorkerOnboardingRecord,
  OnboardingStep,
  OnboardingIdentityData,
  OnboardingTradeData,
  OnboardingCredentialsData,
  StagedDocument,
  DocumentCategory,
  SpecificDocumentType,
} from './types';
import {
  UnauthorizedError,
  StateConflictError,
  ValidationError,
} from './types';
import { validateDocumentFile } from './validation';
import { getMockAuthenticatedUser } from '../auth/storage';

export interface BrainWorkerRepositoryStore {
  records: Map<string, BrainWorkerOnboardingRecord>;
  stagedFiles: Map<string, StagedDocument>;
  subscribers: Map<string, Set<(record: BrainWorkerOnboardingRecord) => void>>;
}

export function createBrainWorkerRepositoryStore(): BrainWorkerRepositoryStore {
  return {
    records: new Map(),
    stagedFiles: new Map(),
    subscribers: new Map(),
  };
}

export class BrainWorkerOnboardingRepository implements IBrainWorkerOnboardingRepository {
  readonly store: BrainWorkerRepositoryStore;

  constructor(store: BrainWorkerRepositoryStore = createBrainWorkerRepositoryStore()) {
    this.store = store;
  }

  private assertCallerAuthorization(brainWorkerId: string): void {
    if (!brainWorkerId || typeof brainWorkerId !== 'string' || brainWorkerId.trim() === '') {
      throw new UnauthorizedError('BrainWorker ID is required.');
    }
    const currentUser = getMockAuthenticatedUser();
    if (!currentUser) {
      throw new UnauthorizedError('Authentication required.');
    }
    if (currentUser.role === 'customer') {
      throw new UnauthorizedError('Customer accounts cannot access BrainWorker onboarding.');
    }
    if (currentUser.id !== brainWorkerId) {
      throw new UnauthorizedError('Tenant isolation: access denied.');
    }
  }

  private notify(record: BrainWorkerOnboardingRecord): void {
    const subs = this.store.subscribers.get(record.brainWorkerId);
    if (subs) {
      for (const listener of subs) {
        listener(JSON.parse(JSON.stringify(record)));
      }
    }
  }

  async getOnboardingRecord(brainWorkerId: string): Promise<BrainWorkerOnboardingRecord | null> {
    this.assertCallerAuthorization(brainWorkerId);

    let record = this.store.records.get(brainWorkerId);
    if (!record) {
      const now = new Date().toISOString();
      record = {
        id: `onb_${brainWorkerId}`,
        brainWorkerId,
        status: 'DRAFT',
        currentStep: 'identity',
        identity: null,
        trade: null,
        credentials: {
          governmentId: null,
          tradeCredentials: [],
          workProofs: [],
        },
        declaration: {
          truthfulnessAcknowledged: false,
          termsAccepted: false,
          declaredAt: null,
        },
        remediationIssues: [],
        rejectionDetails: null,
        submittedAt: null,
        reviewedAt: null,
        createdAt: now,
        updatedAt: now,
      };
      this.store.records.set(brainWorkerId, record);
    }

    return JSON.parse(JSON.stringify(record));
  }

  async saveDraftStep(
    brainWorkerId: string,
    step: OnboardingStep,
    stepData: Partial<OnboardingIdentityData | OnboardingTradeData | OnboardingCredentialsData>
  ): Promise<BrainWorkerOnboardingRecord> {
    this.assertCallerAuthorization(brainWorkerId);

    let record = this.store.records.get(brainWorkerId);
    if (!record) {
      await this.getOnboardingRecord(brainWorkerId);
      record = this.store.records.get(brainWorkerId)!;
    }

    if (
      record.status === 'SUBMITTED' ||
      record.status === 'PENDING_REVIEW' ||
      record.status === 'REJECTED' ||
      record.status === 'APPROVED'
    ) {
      throw new StateConflictError(
        `Cannot mutate onboarding record while in ${record.status} state.`
      );
    }

    if (record.status === 'REMEDIATION_REQUIRED') {
      const isTargetStepFlagged = record.remediationIssues.some(
        (issue) => issue.targetStep === step
      );
      if (!isTargetStepFlagged) {
        throw new StateConflictError(
          `Only flagged steps can be modified during remediation. Step '${step}' is not flagged.`
        );
      }
    }

    const now = new Date().toISOString();

    if (step === 'identity') {
      record.identity = {
        ...(record.identity ?? {}),
        ...(stepData as OnboardingIdentityData),
      } as OnboardingIdentityData;
      if (record.status === 'DRAFT' && record.currentStep === 'identity') {
        record.currentStep = 'trade';
      }
    } else if (step === 'trade') {
      record.trade = {
        ...(record.trade ?? {}),
        ...(stepData as OnboardingTradeData),
      } as OnboardingTradeData;
      if (record.status === 'DRAFT' && record.currentStep === 'trade') {
        record.currentStep = 'credentials';
      }
    } else if (step === 'credentials') {
      const creds = stepData as Partial<OnboardingCredentialsData>;
      const stripEphemeralPreview = (doc: StagedDocument): StagedDocument => {
        const { id, category, specificType, fileName, fileSizeBytes, mimeType, stagedAt } = doc;
        return { id, category, specificType, fileName, fileSizeBytes, mimeType, stagedAt };
      };

      const existingCreds = record.credentials ?? {
        governmentId: null,
        tradeCredentials: [],
        workProofs: [],
      };

      record.credentials = {
        governmentId:
          creds.governmentId !== undefined
            ? creds.governmentId
              ? stripEphemeralPreview(creds.governmentId)
              : null
            : existingCreds.governmentId,
        tradeCredentials:
          creds.tradeCredentials !== undefined
            ? creds.tradeCredentials.map(stripEphemeralPreview)
            : existingCreds.tradeCredentials,
        workProofs:
          creds.workProofs !== undefined
            ? creds.workProofs.map(stripEphemeralPreview)
            : existingCreds.workProofs,
      };
      if (record.status === 'DRAFT' && record.currentStep === 'credentials') {
        record.currentStep = 'review';
      }
    }

    record.updatedAt = now;
    this.store.records.set(brainWorkerId, record);
    this.notify(record);

    return JSON.parse(JSON.stringify(record));
  }

  async stageDocument(
    brainWorkerId: string,
    file: {
      name: string;
      size: number;
      type: string;
      category: DocumentCategory;
      specificType: SpecificDocumentType;
      dataUrl?: string | undefined;
    }
  ): Promise<StagedDocument> {
    this.assertCallerAuthorization(brainWorkerId);

    let record = this.store.records.get(brainWorkerId);
    if (!record) {
      await this.getOnboardingRecord(brainWorkerId);
      record = this.store.records.get(brainWorkerId)!;
    }

    if (
      record.status === 'SUBMITTED' ||
      record.status === 'PENDING_REVIEW' ||
      record.status === 'REJECTED' ||
      record.status === 'APPROVED'
    ) {
      throw new StateConflictError(
        `Cannot stage documents while in ${record.status} state.`
      );
    }

    if (record.status === 'REMEDIATION_REQUIRED') {
      const isCredentialsFlagged = record.remediationIssues.some(
        (issue) => issue.targetStep === 'credentials'
      );
      if (!isCredentialsFlagged) {
        throw new StateConflictError(
          'Credentials step is not flagged for remediation.'
        );
      }
    }

    const validationResult = validateDocumentFile({
      name: file.name,
      size: file.size,
      type: file.type,
    });
    if (!validationResult.valid) {
      throw new ValidationError(validationResult.error ?? 'Invalid document file.');
    }

    const docId = `doc_${file.category.toLowerCase().slice(0, 3)}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const now = new Date().toISOString();

    // Staged document in repository retains ONLY document metadata
    // Ephemeral client-side preview URLs (such as object URLs or data URLs) remain UI-local only
    const stagedDoc: StagedDocument = {
      id: docId,
      category: file.category,
      specificType: file.specificType,
      fileName: file.name,
      fileSizeBytes: file.size,
      mimeType: file.type as StagedDocument['mimeType'],
      stagedAt: now,
    };

    this.store.stagedFiles.set(docId, stagedDoc);

    if (file.category === 'GOVERNMENT_ID') {
      record.credentials.governmentId = stagedDoc;
    } else if (file.category === 'TRADE_CREDENTIAL') {
      record.credentials.tradeCredentials.push(stagedDoc);
    } else if (file.category === 'WORK_PROOF') {
      record.credentials.workProofs.push(stagedDoc);
    }

    record.updatedAt = now;
    this.store.records.set(brainWorkerId, record);
    this.notify(record);

    return JSON.parse(JSON.stringify(stagedDoc));
  }

  async removeStagedDocument(brainWorkerId: string, documentId: string): Promise<void> {
    this.assertCallerAuthorization(brainWorkerId);

    const record = this.store.records.get(brainWorkerId);
    if (!record) {
      throw new StateConflictError(`No onboarding record found for '${brainWorkerId}'.`);
    }

    if (
      record.status === 'SUBMITTED' ||
      record.status === 'PENDING_REVIEW' ||
      record.status === 'REJECTED' ||
      record.status === 'APPROVED'
    ) {
      throw new StateConflictError(
        `Cannot remove staged documents while in ${record.status} state.`
      );
    }

    if (record.status === 'REMEDIATION_REQUIRED') {
      const isCredentialsFlagged = record.remediationIssues.some(
        (issue) => issue.targetStep === 'credentials'
      );
      if (!isCredentialsFlagged) {
        throw new StateConflictError(
          'Credentials step is not flagged for remediation.'
        );
      }
    }

    if (record.credentials.governmentId?.id === documentId) {
      record.credentials.governmentId = null;
    }
    record.credentials.tradeCredentials = record.credentials.tradeCredentials.filter(
      (d) => d.id !== documentId
    );
    record.credentials.workProofs = record.credentials.workProofs.filter(
      (d) => d.id !== documentId
    );

    this.store.stagedFiles.delete(documentId);
    record.updatedAt = new Date().toISOString();
    this.store.records.set(brainWorkerId, record);
    this.notify(record);
  }

  async submitOnboarding(
    brainWorkerId: string,
    declaration: { truthfulnessAcknowledged: boolean; termsAccepted: boolean }
  ): Promise<BrainWorkerOnboardingRecord> {
    this.assertCallerAuthorization(brainWorkerId);

    let record = this.store.records.get(brainWorkerId);
    if (!record) {
      await this.getOnboardingRecord(brainWorkerId);
      record = this.store.records.get(brainWorkerId)!;
    }

    if (
      record.status === 'SUBMITTED' ||
      record.status === 'PENDING_REVIEW' ||
      record.status === 'REJECTED' ||
      record.status === 'APPROVED'
    ) {
      throw new StateConflictError(
        `Cannot submit onboarding record while in ${record.status} state.`
      );
    }

    if (!declaration || !declaration.truthfulnessAcknowledged || !declaration.termsAccepted) {
      throw new ValidationError(
        'Truthfulness declaration and terms acceptance are mandatory for submission.'
      );
    }

    // Validate mandatory step completion
    if (
      !record.identity ||
      !record.identity.legalFirstName ||
      !record.identity.legalLastName ||
      !record.identity.dateOfBirth ||
      !record.identity.identifierNumber
    ) {
      throw new ValidationError('Complete identity information is required for submission.');
    }

    if (
      !record.trade ||
      !record.trade.primaryCategory ||
      !record.trade.experienceLevel ||
      !record.trade.yearsInTrade ||
      !record.trade.coverageCities ||
      record.trade.coverageCities.length === 0
    ) {
      throw new ValidationError('Complete trade profile information is required for submission.');
    }

    if (!record.credentials.governmentId) {
      throw new ValidationError('A staged government ID document is mandatory for submission.');
    }

    if (!record.credentials.tradeCredentials || record.credentials.tradeCredentials.length === 0) {
      throw new ValidationError(
        'At least one staged trade credential document is mandatory for submission.'
      );
    }

    const now = new Date().toISOString();
    record.status = 'SUBMITTED';
    record.currentStep = 'review';
    record.declaration = {
      truthfulnessAcknowledged: true,
      termsAccepted: true,
      declaredAt: now,
    };
    record.submittedAt = now;
    record.updatedAt = now;

    this.store.records.set(brainWorkerId, record);
    this.notify(record);

    return JSON.parse(JSON.stringify(record));
  }

  subscribe(
    brainWorkerId: string,
    listener: (record: BrainWorkerOnboardingRecord) => void
  ): () => void {
    let subs = this.store.subscribers.get(brainWorkerId);
    if (!subs) {
      subs = new Set();
      this.store.subscribers.set(brainWorkerId, subs);
    }
    subs.add(listener);

    return () => {
      const currentSubs = this.store.subscribers.get(brainWorkerId);
      if (currentSubs) {
        currentSubs.delete(listener);
        if (currentSubs.size === 0) {
          this.store.subscribers.delete(brainWorkerId);
        }
      }
    };
  }
}

let defaultRepository: IBrainWorkerOnboardingRepository | null = null;

export function getBrainWorkerOnboardingRepository(): IBrainWorkerOnboardingRepository {
  if (!defaultRepository) {
    defaultRepository = new BrainWorkerOnboardingRepository();
  }
  return defaultRepository;
}

export function createBrainWorkerOnboardingRepository(
  store?: BrainWorkerRepositoryStore
): IBrainWorkerOnboardingRepository {
  return new BrainWorkerOnboardingRepository(store);
}

export function resetDefaultBrainWorkerOnboardingRepository(): void {
  defaultRepository = null;
}

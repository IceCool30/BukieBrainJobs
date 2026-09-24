// apps/web/lib/brainworker/types.ts
// BW-001: BrainWorker Platform Onboarding & Identity Verification Domain Contracts
// Governed by: BW-001 Architecture Contract v1.0 & Test-First Implementation Plan v1.0

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Enums & Literals
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type BrainWorkerOnboardingStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'PENDING_REVIEW'
  | 'REMEDIATION_REQUIRED'
  | 'REJECTED'
  | 'APPROVED';

export type OnboardingStep =
  | 'identity'
  | 'trade'
  | 'credentials'
  | 'review';

export type IdentityIdentifierType = 'NIN' | 'BVN';

export type GovernmentIdType =
  | 'NIN_SLIP'
  | 'NATIONAL_EID'
  | 'DRIVERS_LICENSE'
  | 'VOTERS_CARD'
  | 'INTERNATIONAL_PASSPORT';

export type TradeCredentialType =
  | 'TRADE_TEST_CERTIFICATE'
  | 'APPRENTICESHIP_LETTER'
  | 'VOCATIONAL_DIPLOMA'
  | 'ASSOCIATION_ID';

export type WorkProofType =
  | 'WORKSHOP_PHOTO'
  | 'TOOL_EQUIPMENT_PHOTO'
  | 'PAST_WORK_PHOTO';

export type SpecificDocumentType =
  | GovernmentIdType
  | TradeCredentialType
  | WorkProofType;

export type DocumentCategory =
  | 'GOVERNMENT_ID'
  | 'TRADE_CREDENTIAL'
  | 'WORK_PROOF';

export type TradeExperienceLevel =
  | 'APPRENTICE_INTERMEDIATE'   // 1–3 years
  | 'JOURNEYMAN_EXPERIENCED'     // 4–7 years
  | 'MASTER_CRAFTSMAN';          // 8+ years

export type RejectionReasonCode =
  | 'FRAUD_SUSPECTED'
  | 'UNVERIFIABLE_CREDENTIALS'
  | 'INELIGIBLE_APPLICANT'
  | 'DOCUMENT_FORGERY'
  | 'OTHER';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Document Model
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface StagedDocument {
  id: string;
  category: DocumentCategory;
  specificType: SpecificDocumentType;
  fileName: string;
  fileSizeBytes: number;
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp' | 'application/pdf';
  stagedAt: string;          // ISO 8601
  previewUrl?: string | undefined; // Ephemeral client-generated blob URL for preview only
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Funnel Step Data Contracts
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface OnboardingIdentityData {
  legalFirstName: string;
  legalMiddleName?: string | undefined;
  legalLastName: string;
  dateOfBirth: string;       // YYYY-MM-DD
  identifierType: IdentityIdentifierType;
  identifierNumber: string;  // 11 digits format-validated
  maskedIdentifier: string;  // e.g. "•••••••1234"
  residentialAddress: {
    street: string;
    city: string;
    lga: string;
    state: string;
  };
}

export interface OnboardingTradeData {
  primaryCategory: string;   // Canonical 8: generator, ac, plumbing, electrical, carpentry, painting, masonry, welding
  subSpecialties: string[];  // Up to 5 specific tags
  experienceLevel: TradeExperienceLevel;
  yearsInTrade: number;      // 1 to 50
  coverageCities: string[];  // Canonical 7: Lagos, Abuja, Port Harcourt, Ibadan, Benin City, Enugu, Kano (min 1)
}

export interface OnboardingCredentialsData {
  governmentId: StagedDocument | null;
  tradeCredentials: StagedDocument[];   // At least 1 mandatory
  workProofs: StagedDocument[];         // Optional
}

export interface OnboardingDeclarationData {
  truthfulnessAcknowledged: boolean;
  termsAccepted: boolean;
  declaredAt: string | null;  // ISO 8601
}

export interface RemediationIssue {
  targetStep: OnboardingStep;
  fieldKey?: string | undefined;
  issueCode: string;
  message: string;            // Actionable reviewer guidance
  flaggedAt: string;          // ISO 8601
}

export interface RejectionDetails {
  reasonCode: RejectionReasonCode;
  message: string;            // Plain language explanation
  rejectedAt: string;         // ISO 8601
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Domain Aggregate Record
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface BrainWorkerOnboardingRecord {
  id: string;
  brainWorkerId: string;
  status: BrainWorkerOnboardingStatus;
  currentStep: OnboardingStep;
  identity: OnboardingIdentityData | null;
  trade: OnboardingTradeData | null;
  credentials: OnboardingCredentialsData;
  declaration: OnboardingDeclarationData;
  remediationIssues: RemediationIssue[];
  rejectionDetails: RejectionDetails | null;
  submittedAt: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Repository Contract
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface IBrainWorkerOnboardingRepository {
  getOnboardingRecord(brainWorkerId: string): Promise<BrainWorkerOnboardingRecord | null>;
  saveDraftStep(
    brainWorkerId: string,
    step: OnboardingStep,
    stepData: Partial<OnboardingIdentityData | OnboardingTradeData | OnboardingCredentialsData>
  ): Promise<BrainWorkerOnboardingRecord>;
  stageDocument(
    brainWorkerId: string,
    file: {
      name: string;
      size: number;
      type: string;
      category: DocumentCategory;
      specificType: SpecificDocumentType;
      dataUrl?: string | undefined;
    }
  ): Promise<StagedDocument>;
  removeStagedDocument(brainWorkerId: string, documentId: string): Promise<void>;
  submitOnboarding(
    brainWorkerId: string,
    declaration: { truthfulnessAcknowledged: boolean; termsAccepted: boolean }
  ): Promise<BrainWorkerOnboardingRecord>;
  subscribe?(
    brainWorkerId: string,
    listener: (record: BrainWorkerOnboardingRecord) => void
  ): () => void;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Domain Errors
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export class UnauthorizedError extends Error {
  constructor(message = 'Unauthorized access to BrainWorker onboarding.') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class NotFoundError extends Error {
  constructor(message = 'Onboarding record not found.') {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class StateConflictError extends Error {
  constructor(message = 'Operation conflicts with current onboarding state.') {
    super(message);
    this.name = 'StateConflictError';
  }
}

export class ValidationError extends Error {
  constructor(message = 'Onboarding validation failed.') {
    super(message);
    this.name = 'ValidationError';
  }
}

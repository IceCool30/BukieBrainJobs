# Spec: BW-001 BrainWorker Platform Onboarding & Identity Verification Architecture Contract (v1.0)

| Field | Value |
|---|---|
| **Document ID** | BW-001-ARCH |
| **Feature** | BrainWorker Onboarding & Identity Verification |
| **Status** | 🟡 Proposed for Architecture Approval (v1.0) |
| **Version** | 1.0 |
| **Workstream** | Phase 2: BrainWorker (Service Provider) Web Platform |
| **Governing Loop** | Mr. Solomon 9-Command Engineering Loop (`/architect`) |
| **Scope Contract** | BW-001 Scope Specification v1.0 (`docs/specs/BW-001-onboarding.md`) |
| **Target Surfaces** | `/brainworker/register`, `/brainworker/onboarding`, `/brainworker/verification-status` |
| **Date** | 2026-09-24 |

---

## 1. Architectural Doctrine & Boundary Invariants

BW-001 establishes the foundational domain contracts, data models, state machines, and repository boundaries for provider onboarding and identity verification in BukieBrainJobs.

### Core Architectural Doctrine

> **1. The Single Authority Invariant**
>
> The frontend may collect, display, stage, and request verification, but it cannot authoritatively declare identity verified, documents approved, or BrainWorker access granted. All lifecycle transitions and approval states originate from the authoritative domain repository.
>
> **2. The Format Validation vs. Verification Invariant**
>
> Syntactic format validation (confirming an 11-digit numeric pattern for NIN or BVN) is an input validation aid. It is never identity verification. The UI and repository must never label format-checked inputs as "Verified". Verification is an authoritative operational outcome.
>
> **3. The Operating Access Gatekeeper: `isBrainWorkerApproved`**
>
> `isBrainWorkerApproved` on the authenticated session/auth storage is the singular authority governing provider operating workspace access (`/brainworker/dashboard`). `SUBMITTED` and `PENDING_REVIEW` describe operational workflow states, not operating permissions. The frontend cannot self-grant or forge approval.
>
> **4. Strict Tenant & Role Isolation**
>
> Customer accounts (`role: 'customer'`) have zero access to BrainWorker onboarding data. A BrainWorker applicant can only inspect or mutate their own onboarding record. Any unauthorized, unauthenticated, or cross-tenant inspection fails closed with `UnauthorizedError`.
>
> **5. Physical Production/Testing Separation**
>
> Production modules must contain zero imports from testing modules or fixture harnesses. Test controllers, scenario seeders, and deterministic fixtures reside strictly in `lib/brainworker/testing/`.

---

## 2. Domain Data Model & Types

All types reside in `apps/web/lib/brainworker/types.ts` and align with canonical monorepo primitives (`packages/types`).

### 2.1 Enums & Status Literals

```typescript
// Onboarding Lifecycle States
export type BrainWorkerOnboardingStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'PENDING_REVIEW'
  | 'REMEDIATION_REQUIRED'
  | 'REJECTED'
  | 'APPROVED';

// Funnel Steps
export type OnboardingStep =
  | 'identity'
  | 'trade'
  | 'credentials'
  | 'review';

// Identity Identifier Types
export type IdentityIdentifierType = 'NIN' | 'BVN';

// Supported Government ID Types
export type GovernmentIdType =
  | 'NIN_SLIP'
  | 'NATIONAL_EID'
  | 'DRIVERS_LICENSE'
  | 'VOTERS_CARD'
  | 'INTERNATIONAL_PASSPORT';

// Supported Trade Credential Types
export type TradeCredentialType =
  | 'TRADE_TEST_CERTIFICATE'
  | 'APPRENTICESHIP_LETTER'
  | 'VOCATIONAL_DIPLOMA'
  | 'ASSOCIATION_ID';

// Supported Work Proof Types
export type WorkProofType =
  | 'WORKSHOP_PHOTO'
  | 'TOOL_EQUIPMENT_PHOTO'
  | 'PAST_WORK_PHOTO';

// Unified Specific Document Type Union
export type SpecificDocumentType =
  | GovernmentIdType
  | TradeCredentialType
  | WorkProofType;

// Document Categories
export type DocumentCategory =
  | 'GOVERNMENT_ID'
  | 'TRADE_CREDENTIAL'
  | 'WORK_PROOF';

// Trade Experience Levels
export type TradeExperienceLevel =
  | 'APPRENTICE_INTERMEDIATE'   // 1–3 years
  | 'JOURNEYMAN_EXPERIENCED'     // 4–7 years
  | 'MASTER_CRAFTSMAN';          // 8+ years

// Authoritative Rejection Reason Codes
export type RejectionReasonCode =
  | 'FRAUD_SUSPECTED'
  | 'UNVERIFIABLE_CREDENTIALS'
  | 'INELIGIBLE_APPLICANT'
  | 'DOCUMENT_FORGERY'
  | 'OTHER';
```

### 2.2 Staged Document Model

```typescript
export interface StagedDocument {
  id: string;
  category: DocumentCategory;
  specificType: SpecificDocumentType;
  fileName: string;
  fileSizeBytes: number;
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp' | 'application/pdf';
  stagedAt: string;          // ISO 8601
  previewUrl?: string;       // Ephemeral client-generated blob URL for preview only
}
```

### 2.3 Funnel Step Data Contracts

```typescript
// Step 1: Identity Information
export interface OnboardingIdentityData {
  legalFirstName: string;
  legalMiddleName?: string;
  legalLastName: string;
  dateOfBirth: string;       // YYYY-MM-DD (must satisfy 18+ requirement)
  identifierType: IdentityIdentifierType;
  identifierNumber: string;  // 11 digits; format-validated
  maskedIdentifier: string;  // e.g. "•••••••1234" (client-derived presentation)
  residentialAddress: {
    street: string;
    city: string;
    lga: string;
    state: string;
  };
}

// Step 2: Trade & Coverage Profile
export interface OnboardingTradeData {
  primaryCategory: string;   // Canonical 8: generator, ac, plumbing, electrical, carpentry, painting, masonry, welding
  subSpecialties: string[];  // Up to 5 specific tags
  experienceLevel: TradeExperienceLevel;
  yearsInTrade: number;      // 1 to 50
  coverageCities: string[];  // From canonical 7: Lagos, Abuja, Port Harcourt, Ibadan, Benin City, Enugu, Kano (min 1)
}

// Step 3: Credentials & Evidence
export interface OnboardingCredentialsData {
  governmentId: StagedDocument | null;
  tradeCredentials: StagedDocument[];   // At least 1 mandatory
  workProofs: StagedDocument[];         // Optional
}

// Step 4: Submission Metadata & Legal Declaration
export interface OnboardingDeclarationData {
  truthfulnessAcknowledged: boolean;
  termsAccepted: boolean;
  declaredAt: string | null;  // ISO 8601
}
```

### 2.4 Remediation & Rejection Details

```typescript
export interface RemediationIssue {
  targetStep: OnboardingStep;
  fieldKey?: string;
  issueCode: string;
  message: string;            // State-honest actionable guidance (e.g. "Government ID image is blurry. Please upload a clear photo.")
  flaggedAt: string;          // ISO 8601
}

export interface RejectionDetails {
  reasonCode: RejectionReasonCode;
  message: string;            // Plain language explanation
  rejectedAt: string;         // ISO 8601
}
```

### 2.5 BrainWorker Onboarding Record (Domain Aggregate)

```typescript
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
```

---

## 3. Authoritative vs. Client-Derived Fields

To preserve the single authority invariant, the boundary strictly delineates authoritative state from client presentation helpers:

| Field | Source of Authority | Description |
|---|---|---|
| `status` | **Authoritative (Repository)** | Operational lifecycle state. The UI can request transitions (`saveDraft`, `submit`), but cannot directly write `APPROVED` or `PENDING_REVIEW`. |
| `isBrainWorkerApproved` | **Authoritative (Auth Storage/Session)** | Operating workspace permission gate. Updated only upon verified `APPROVED` resolution. |
| `remediationIssues` | **Authoritative (Repository)** | Specific flagged steps and guidance emitted by ops review. |
| `rejectionDetails` | **Authoritative (Repository)** | Explicit reason code and explanation. UI never guesses reasons. |
| `submittedAt` / `reviewedAt` | **Authoritative (Repository)** | Timestamps stamped by repository during transition operations. |
| `maskedIdentifier` | **Client-Derived (UI Helper)** | Computed from raw 11-digit input (`•••••••${last4}`) for safe rendering. |
| `previewUrl` | **Client-Derived (Blob/Staging)** | Ephemeral object URL created via `URL.createObjectURL` for immediate user preview. |
| `currentStep` | **Client-Derived / Progress** | Tracks applicant's active funnel step during draft completion. |
| `isStepComplete` | **Client-Derived (Validation)** | Deterministic check evaluating required fields for a given step. |

---

## 4. Repository Contract: `IBrainWorkerOnboardingRepository`

All onboarding data operations are governed by this contract (`apps/web/lib/brainworker/types.ts`).

```typescript
export interface IBrainWorkerOnboardingRepository {
  /**
   * Retrieves the current onboarding record for the authenticated BrainWorker.
   * Throws UnauthorizedError if unauthenticated or accessed by a customer account.
   */
  getOnboardingRecord(brainWorkerId: string): Promise<BrainWorkerOnboardingRecord | null>;

  /**
   * Persists draft updates for a specific funnel step.
   * Throws StateConflictError if record is already SUBMITTED, PENDING_REVIEW, or REJECTED.
   */
  saveDraftStep(
    brainWorkerId: string,
    step: OnboardingStep,
    stepData: Partial<OnboardingIdentityData | OnboardingTradeData | OnboardingCredentialsData>
  ): Promise<BrainWorkerOnboardingRecord>;

  /**
   * Stages a document attachment in draft state.
   * Enforces file size (<= 5 MB) and MIME type constraints.
   */
  stageDocument(
    brainWorkerId: string,
    file: {
      name: string;
      size: number;
      type: string;
      category: DocumentCategory;
      specificType: SpecificDocumentType;
      dataUrl?: string; // Optional temporary client-only preview string; NEVER persisted authoritatively
    }
  ): Promise<StagedDocument>;

  /**
   * Removes a staged document from draft state.
   */
  removeStagedDocument(brainWorkerId: string, documentId: string): Promise<void>;

  /**
   * Submits the completed onboarding record for operational verification.
   * Validates all required steps (Identity, Trade, Credentials, Declaration).
   * Transitions status from DRAFT (or REMEDIATION_REQUIRED) to SUBMITTED.
   */
  submitOnboarding(
    brainWorkerId: string,
    declaration: { truthfulnessAcknowledged: boolean; termsAccepted: boolean }
  ): Promise<BrainWorkerOnboardingRecord>;

  /**
   * Subscribes to real-time onboarding status updates for the specified BrainWorker.
   * Returns an unsubscribe callback.
   */
  subscribe?(
    brainWorkerId: string,
    listener: (record: BrainWorkerOnboardingRecord) => void
  ): () => void;
}
```

---

## 5. Security, Tenant Isolation & Authentication Guards

### 5.1 Authentication Guard Matrix

| User Role | Status / Flag | Target Route | Action |
|---|---|---|---|
| Unauthenticated | N/A | `/brainworker/register` | Render registration view |
| Unauthenticated | N/A | `/brainworker/onboarding` | Redirect to `/login?redirect=/brainworker/onboarding` |
| Unauthenticated | N/A | `/brainworker/verification-status` | Redirect to `/login?redirect=/brainworker/verification-status` |
| Customer (`role: 'customer'`) | Any | `/brainworker/*` | Blocked: render customer conflict boundary notice |
| BrainWorker (`role: 'brainworker'`) | `DRAFT` | `/brainworker/onboarding` | Render onboarding funnel at active step |
| BrainWorker (`role: 'brainworker'`) | `SUBMITTED` / `PENDING_REVIEW` | `/brainworker/onboarding` | Redirect to `/brainworker/verification-status` |
| BrainWorker (`role: 'brainworker'`) | `REMEDIATION_REQUIRED` | `/brainworker/verification-status` | Display remediation alert with "Fix Flagged Items" link to `/brainworker/onboarding` |
| BrainWorker (`role: 'brainworker'`) | `APPROVED` (`isBrainWorkerApproved: true`) | `/brainworker/onboarding` | Redirect to `/brainworker/dashboard` |

### 5.2 Tenant Isolation Contract
- In the repository implementation, every method asserts:
  1. `brainWorkerId` is non-empty and matches the authenticated user session.
  2. The authenticated user has `role: 'brainworker'`.
- If an applicant attempts to access another applicant's `id`, the repository throws `UnauthorizedError('You do not have permission to view or modify this onboarding record.')`.
- Zero cross-applicant document leakage: Document download or preview identifiers must be scoped strictly to the owning `brainWorkerId`.

---

## 6. Sensitive Data Handling & Masking Specification

### 6.1 NIN / BVN Input & Redaction
1. **Input Interface**:
   - Accepts numeric characters only (sanitized via `input.replace(/\D/g, '').slice(0, 11)`).
   - Displayed as plain text *during active editing only* so the applicant can verify their typing.
2. **Post-Entry Masking**:
   - As soon as focus leaves the field or on summary screens, the value is masked:
     ```typescript
     export function maskIdentityIdentifier(raw: string): string {
       const digits = raw.replace(/\D/g, '');
       if (digits.length < 4) return digits;
       const last4 = digits.slice(-4);
       return `•••••••${last4}`;
     }
     ```
3. **Log & Storage Redaction**:
   - Raw 11-digit NIN/BVN strings are strictly excluded from console logs, analytics events, telemetry, toast error strings, and URL search parameters.

---

## 7. Document Handling & File Validation Pipeline

### 7.1 Client-Side Validation Rules
Before any file is staged or processed, the document validation utility (`lib/brainworker/validation.ts`) executes the following checks:

1. **Size Limit**: Maximum `5,242,880` bytes (5 MB).
   - Violation message: `"File size exceeds 5 MB. Please upload a smaller photo or compressed PDF."`
2. **MIME Whitelist**: `['image/jpeg', 'image/png', 'image/webp', 'application/pdf']`.
   - Violation message: `"Unsupported file format. Please upload a JPG, PNG, WEBP, or PDF document."`
3. **Empty File Check**: `file.size > 0`.
   - Violation message: `"Selected file is empty."`

### 7.2 Staging Lifecycle
- **Draft Staging**: Staged documents are held in memory/mock storage with a generated unique `id`.
- **Thumbnail Generation**: For images, a localized blob URL is created (`URL.createObjectURL(file)`) for immediate rendering.
- **Teardown**: When a document is removed or replaced, `URL.revokeObjectURL(url)` is called to prevent browser memory leaks.

### 7.3 Boundary Invariants for Preview URLs & `dataUrl`
To preserve memory safety and prevent sensitive data leakage:
1. **Ephemeral Client-Side Preview Only**:
   - `dataUrl` (if passed by client FileReader utilities) and `previewUrl` are strictly temporary client-side presentation helpers.
   - They are NEVER an authoritative persisted document payload.
   - Under no circumstances may a `dataUrl` or raw document bytes be committed to persistent domain databases, query parameters, URL search params, browser history, toast notifications, error messages, analytics, or telemetry logs.
2. **Object URLs as Preferred Browser Preview Mechanism**:
   - Given the 5 MB file ceiling, base64 data URLs inflate memory footprint by ~33% (up to 6.7 MB per file) and risk triggering Android Low Memory Killer (LMK) events in resource-constrained environments.
   - Localized browser Object URLs (`URL.createObjectURL(file)`) are the mandatory preferred preview mechanism over base64 data URLs.
   - Object URLs must be tracked in component lifecycle state and explicitly revoked via `URL.revokeObjectURL()` during component unmount or when a file is replaced/removed.
3. **Sensitive Evidence Isolation**:
   - Staged government ID documents and credentials contain sensitive personal data. They must never be mirrored into unauthenticated caches, public service-worker caches, or shared client state.

---

## 8. Verification Lifecycle State Machine & Handoff

### 8.1 State Transitions

```
[DRAFT] ──(submitOnboarding)──> [SUBMITTED] ──(ops queue)──> [PENDING_REVIEW]
                                                                  │
                           ┌──────────────────────────────────────┴──────────────────────────────────────┐
                           ▼                                      ▼                                      ▼
                   [APPROVED]                       [REMEDIATION_REQUIRED]                           [REJECTED]
                       │                                      │                                          │
             (sets isApproved=true)                 (unlocks flagged step)                       (permanent lock)
                       │                                      │
                       ▼                                      ▼
             [/brainworker/dashboard]                 (re-submitOnboarding)
```

### 8.2 Operational Handoff Rules
1. **Transition to `SUBMITTED`**:
   - Locks the application. Form inputs and file upload dropzones become disabled/read-only.
   - Redirects applicant to `/brainworker/verification-status`.
2. **Transition to `REMEDIATION_REQUIRED`**:
   - Status screen displays an amber banner with explicit remediation instructions (e.g. `"The photo of your Driver's License was blurry and could not be verified. Please upload a clearer image."`).
   - "Update Application" CTA navigates to `/brainworker/onboarding?step=credentials`, unlocking *only* the flagged step/field while keeping approved steps locked.
3. **Transition to `REJECTED`**:
   - Status screen displays a neutral, professional rejection state explaining the non-fulfillment of criteria.
   - Authoritative reason code determines messaging (`FRAUD_SUSPECTED`, `UNVERIFIABLE_CREDENTIALS`, etc.).
   - Access to the operating workspace is permanently denied.
4. **Transition to `APPROVED`**:
   - The repository marks status as `APPROVED`.
   - The session updates `isBrainWorkerApproved = true`.
   - The status screen presents a congratulatory verification card with a direct CTA: `"Go to BrainWorker Workspace"`, navigating to `/brainworker/dashboard`.

---

## 9. Prerender & Static Generation Safety

To prevent static generation breakage during Next.js builds:
1. All client components must use `'use client'` directive.
2. Direct access to browser globals (`window`, `document`, `navigator`, `localStorage`, `FileReader`, `URL`) must occur inside `useEffect` or behind guards:
   ```typescript
   if (typeof window === 'undefined') return;
   ```
3. Dynamic URL parameters (such as `step`) use `useSearchParams()` with appropriate suspense boundaries or client wrappers.
4. Production build must generate `/brainworker/register`, `/brainworker/onboarding`, and `/brainworker/verification-status` cleanly as static/prerendered routes.

---

## 10. Production/Testing Physical Boundary

To adhere to the monorepo's strict boundary standard:

```
apps/web/
├── app/brainworker/
│   ├── register/page.tsx                  # Production registration route
│   ├── onboarding/page.tsx                # Production multi-step funnel route
│   └── verification-status/page.tsx       # Production status monitor route
├── components/brainworker/onboarding/
│   ├── FunnelProgressBar.tsx              # Production step indicator
│   ├── IdentityStepForm.tsx               # Production Step 1 component
│   ├── TradeStepForm.tsx                  # Production Step 2 component
│   ├── CredentialsStepForm.tsx            # Production Step 3 component
│   ├── ReviewStepForm.tsx                 # Production Step 4 component
│   └── DocumentUploadCard.tsx             # Production staging/preview component
├── lib/brainworker/
│   ├── types.ts                           # Production domain models & contracts
│   ├── repository.ts                      # Production repository implementation
│   ├── validation.ts                      # Production format & file validation utilities
│   └── testing/                           # STRICT TESTING ISOLATION
│       ├── fixtures.ts                    # Deterministic mock applicants & documents
│       ├── store.ts                       # In-memory test store
│       ├── controller.ts                  # Test controller for scenario simulation
│       ├── harness.ts                     # Full test harness factory
│       └── index.ts                       # Test suite exports
```

- **Boundary Invariant**: Production files (`app/brainworker/**`, `components/brainworker/**`, `lib/brainworker/*.ts`) must contain ZERO imports from `lib/brainworker/testing/**`.
- Verified at every test gate via physical regex grep.

---

## 11. Deterministic Mock Scenarios

The test controller (`lib/brainworker/testing/controller.ts`) provides deterministic scenarios for reliable, reproducible testing:

1. `SCENARIO_NEW_APPLICANT`: Brand new registered BrainWorker with zero onboarding data (`status: 'DRAFT'`, step: `identity`).
2. `SCENARIO_DRAFT_IN_PROGRESS`: BrainWorker with Step 1 and Step 2 completed, currently on Step 3.
3. `SCENARIO_SUBMITTED_JUST_NOW`: BrainWorker who has submitted all 4 steps, awaiting ops queue (`status: 'SUBMITTED'`).
4. `SCENARIO_PENDING_REVIEW`: BrainWorker actively under ops background review (`status: 'PENDING_REVIEW'`).
5. `SCENARIO_REMEDIATION_BLURRY_ID`: BrainWorker with flagged government ID requiring re-upload (`status: 'REMEDIATION_REQUIRED'`).
6. `SCENARIO_REJECTED_UNVERIFIABLE`: BrainWorker rejected due to unconfirmable trade references (`status: 'REJECTED'`, code: `'UNVERIFIABLE_CREDENTIALS'`).
7. `SCENARIO_REJECTED_FRAUD`: BrainWorker rejected due to mismatched biometric NIN details (`status: 'REJECTED'`, code: `'FRAUD_SUSPECTED'`).
8. `SCENARIO_APPROVED`: Fully verified BrainWorker with `isBrainWorkerApproved: true` and active trade credentials.

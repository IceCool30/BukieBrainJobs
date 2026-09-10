# ARCH-002: Production-First Mock-Data Development Model

**Document ID:** ARCH-002  
**Status:** Approved Architectural Baseline (Issue #37)  
**Authority:** [Issue #37](https://github.com/IceCool30/BukieBrainJobs/issues/37)  
**Date:** September 10, 2026  

---

## 1. Purpose

Formalize the development model for BukieBrainJobs so mock data is treated as a temporary data source, not a reduction of the intended production product scope.

---

## 2. Decision

BukieBrainJobs is a production platform under active development. The frontend is implemented before the backend is connected, but all feature work must be designed toward the intended production domain and architecture.

The progression model is:
```
Frontend First (Mock-Backed) → Backend & Database Integration → Production Launch
```

Mock data is an implementation mechanism for the current frontend-first phase. It is not a boundary that shrinks or alters product capabilities.

---

## 3. Core Rules

1. **Production Scope Preservation**: Product capabilities remain production scope unless explicitly marked as future product scope or out of product scope.
2. **Temporary Data Source**: Mock data is a temporary implementation mechanism for the current frontend-first phase.
3. **Production-Ready Modeling**: Feature specifications must model production-relevant domain concepts, lifecycle states, validation, permissions, durable identifiers, relationships, error handling, and integration boundaries where those concepts are already part of the approved product or technical architecture.
4. **Honest Operational State**: Deferred backend capabilities must not be fabricated in the UI. The frontend may represent pending, unavailable, or not-yet-connected states where appropriate.
5. **Architectural Continuity**: Replacing a mock repository/data source with the real database/API should not require fundamental redesign of the approved user journey merely because the backend was deferred.
6. **Interpretation of Legacy Phrasing**: Existing approved specifications must be interpreted and, where necessary, clarified so that phrases such as "not introduced" or "mock-first" describe implementation phase limitations rather than removal of production domain requirements.
7. **Documented Approval for Material Changes**: Material changes to product behavior, architecture, security, data models, APIs, or design foundations still require documented approval before implementation.
8. **Technical Stack Authority**: The existing approved technical stack and architecture remain authoritative unless separately changed through the normal decision process.

---

## 4. Architectural Boundaries & Standards

### 4.1 Canonical Role Vocabulary
* **Domain Authority:** The authoritative user roles are defined exclusively in `@bukiebrainjobs/api-types`:
  `CLIENT | TASKER | ADMIN | CORPORATE_CLIENT`
* **Presentation Mapping:** User-facing terminology is strictly a presentation-layer concern:
  - `CLIENT` → Customer
  - `TASKER` → BrainWorker
  - `ADMIN` → Administrator
  - `CORPORATE_CLIENT` → Corporate Partner
* **Safe Mapping:** Role mapping functions must be exhaustive. Unknown or corrupted roles must fail explicitly and never silently default to a customer role.

### 4.2 Production Lifecycle Authority & Presentation Adapter
* **Lifecycle Authority:** The production `JobStatus` state machine (`OPEN`, `PENDING_ACCEPTANCE`, `CONFIRMED`, `IN_PROGRESS`, `PENDING_COMPLETION`, `COMPLETED`, `PAID`, `CANCELLED`, `DISPUTED`, `EXPIRED`, `RESOLVED`) defined in `@bukiebrainjobs/api-types` is authoritative.
* **Unidirectional Mapping:** Customer activity presentation statuses (`request_received`, `awaiting_progress`, `scheduled`, `in_progress`, `completed`, `cancelled`) are derived through a deterministic presentation adapter:
  `JobStatus → CustomerActivityStatus`
* **Lifecycle Mutations:** The UI must never directly mutate presentation statuses. All state transitions must invoke canonical domain transition functions validated against `canTransition(from, to)`.
* **Dispute State Neutrality:** The `RESOLVED` status presents neutrally as "Dispute Resolved" without encoding premature assumptions regarding financial payouts or administrative closure.

### 4.3 Customer Activity Repository Abstraction
* **Architectural Boundary:**
  ```
  UI Surface (Post-Job, Book, Dashboard, Jobs)
                     ↓
        ICustomerActivityRepository
                     ↓
  ┌──────────────────────────────────────────────┐
  │  Phase 1: MockCustomerActivityRepository     │
  │  (In-memory dataset + local persistence)     │
  │  Phase 2: ApiCustomerActivityRepository      │
  │  (HTTP /api/jobs → PostgreSQL / Prisma)      │
  └──────────────────────────────────────────────┘
                     ↓
  CustomerActivityItem (UI Read Model)
  ```
* **Read-Model Return:** Repository methods return `CustomerActivityItem[]`, not raw `Job[]` database entities, preserving the distinction between persistence entities and UI view models.
* **Storage Encapsulation:** Browser storage (localStorage/IndexedDB) is strictly an internal concern of the mock adapter to ensure cross-screen continuity during local development.

### 4.4 Monetary Precision
* **Kobo Standard:** All domain entities, requests, calculations, and stored values use integer kobo (`100 kobo = ₦1.00`).
* **Presentation Formatting:** Currency formatting (`₦35,000`) is restricted to the presentation boundary using shared formatting utilities.

### 4.5 Location Integrity & Anti-Fabrication Rule
* **Staged Location Pipeline:**
  ```
  CustomerLocationInput (streetAddress, city, landmark)
                 ↓
  Deterministic State Derivation (city → state)
                 ↓
  Location Resolution Stage (Geocoding / Interactive Map Pin)
                 ↓
  ResolvedJobLocation (latitude, longitude, validated address) → CreateJobRequest
  ```
* **Zero Dummy Coordinates:** Under no circumstances will dummy coordinates (`0.0, 0.0` or city-center centroids) be injected into production job requests. If location coordinates cannot be resolved, the request remains in an explicit unresolved state.

### 4.6 Payment & Escrow Boundary
* **Capability vs. Execution:** The platform models payment states and fee breakdowns as production domain contracts. Phase 1 executes no live financial transactions or escrow holdings.
* **No Unsupported Claims:** The UI and documentation must not claim operational escrow or guarantee fund disbursements until the production payment gateway is deployed.

### 4.7 Database Schema Guardrail
* No speculative columns (`referenceCode`, `landmark`) will be added to Prisma until formal product specifications establish them as canonical database requirements.

---

## 5. Decision Log & Open Items

### Confirmed Decisions
1. Canonical role authority consolidated in `@bukiebrainjobs/api-types`.
2. Safe role display mapping without silent authorization fallback.
3. Authoritative production `JobStatus` lifecycle with unidirectional presentation adapter.
4. `ICustomerActivityRepository` interface separating UI from data layer.
5. Integer kobo monetary standard in all domain contracts.
6. Staged location resolution with zero fake coordinates.
7. Prisma schema guarded from unverified modifications.

### Open Reconciliation Decisions (To Be Formally Settled)
1. **`taskerRateKobo` on Open Customer Postings:** In `CreateJobRequest`, `taskerRateKobo` is currently required (`number`). A customer posting an open job request does not yet have an assigned tasker rate. The canonical resolution (making it optional vs. defaulting to 0) must be confirmed.
2. **`skillIds` for "I'm not sure":** `CreateJobRequest` requires `skillIds: string[]`. For customers choosing "I'm not sure", whether a generic skill ID is assigned or `skillIds` is made optional must be confirmed.
3. **Permanent Reference Code:** Whether human-readable reference codes (`REQ-84920`) should become a first-class database column (`referenceCode`) or remain an application-layer display code must be determined before database migration.

# BukieBrainJobs Documentation Index

**Document ID:** GOV-005  
**Version:** 2.0  
**Status:** Active  
**Last Updated:** 2026-09-21  

This index is the canonical navigation map for all documentation in the BukieBrainJobs repository.

---

## 1. Operating State & Tracking Files (Root & Top-Level)

- `AGENTS.md`: Repository overview, development standards, and 9-command engineering loop state.
- `README.md`: General repository overview, quickstart instructions, and toolchain versions.
- `CHANGELOG.md`: Chronological log of material platform releases and enhancements.
- `docs/master-checklist.md`: The complete, sequential product checklist across all 7 implementation phases.
- `docs/scope.md`: Living engineering scope tracking completed, active, and upcoming slices.
- `docs/check-log.md`: Verification check log recording test, build, lint, and CI proofs under `/check`.

---

## 2. Governance (`docs/00-governance/`)

- `SOURCE-OF-TRUTH.md`: Document hierarchy and conflict-resolution rules.
- `LEGACY-SOURCE-BOUNDARY.md`: Rules separating historical research notes from current normative specifications.
- `REPOSITORY-STRUCTURE.md`: Architectural boundaries between apps, packages, and services.
- `DEVELOPMENT-WORKFLOW.md`: Product specification to implementation lifecycle.
- `TECHNICAL-BASELINE.md`: Approved technical baseline and toolchain standards.
- `DECISION-LOG.md`: Central record of material architectural and product decisions.
- `CANONICALIZATION-PLAN.md`: Documentation consolidation and normalization rules.
- **Completed Foundation Records (Historical Archives)**:
  - `FOUNDATION-STATUS.md`: Initial gate review record.
  - `FOUNDATION-FINAL-STATUS.md`: Initial closeout status.
  - `FOUNDATION-RELEASE-GATE.md`: Initial release gate checklist.
  - `FOUNDATION-VERIFICATION-RECORD.md`: Initial foundation verification log.
  - `FOUNDATION-CLOSEOUT.md`: Formal sign-off on repository baseline.

---

## 3. Product Roadmap & Charter (`docs/01-product/`)

- `ROADMAP.md`: Strategic milestones and current phase status (Version 2.0).
- `PRODUCT-FOUNDATION.md`: Core product principles, Nigerian marketplace dynamics, and user trust anchors.
- `OPERATING-CHARTER.md`: Core values, quality thresholds, and operational constraints.

---

## 4. Design System & Experience Standards (`docs/02-design-system/`)

- Root `DESIGN.md`: Visual tokens, color palettes, and typography source material.
- `DESIGN-SYSTEM-v1.0.md`: Formal Design System v1.0 specification.
- `LIVE-EXPERIENCE-STANDARD.md`: Live-first experience authority and extension standards.
- `DESIGN-CANONICALIZATION.md`: Rules reconciling visual tokens with live code authority.
- `APPROVED-ARTIFACTS.md` & `APPROVED-ARTIFACT-MATRIX.md`: Approved visual component decisions.
- `skills/bukiebrainjobs-experience-standards/`: Project-wide experience skill and bundled references:
  - `BUKIEBRAINJOBS-CONTENT-GUIDE.md`: Approved brand voice, terminology, and microcopy guidelines.
  - `content-density-and-decision-architecture.md`: Task hierarchy and progressive disclosure patterns.
  - `live-approved-experience.md`: Canonical visual, motion, and interaction standards.
  - `quality-gates.md`: Deliverable quality checklist.
  - `validation-examples.md`: Practical implementation patterns.

---

## 5. Engineering Architecture (`docs/03-architecture/`)

- `README.md`: Architecture hub and package boundary overview.
- `ARCH-002-CONTRACT-DECISIONS.md`: Canonical decision record for production-first mock data contracts.
- `ARCH-002-PRODUCTION-FIRST-MOCK-DATA-DEVELOPMENT-MODEL.md`: Full architectural specification for domain models and state machines.
- `reference/`: Supplied foundational specifications preserved for technical reference:
  - `TECH-SPEC-01-ARCHITECTURE-AND-TOOLCHAIN.md`: Toolchain and monorepo design.
  - `TECH-SPEC-02-27-INDEX.md` & `TECH-SPEC-02-27-CANONICAL-REGISTER.md`: Domain topic registers.

---

## 6. Information Architecture (`docs/03-information-architecture/`)

- `SCREEN-CATALOG.md`: Inventory of planned and implemented screens across customer, worker, and admin roles.

---

## 7. Customer & Public Web Specifications (`docs/04-public-website/`)

- `WEB-001-HOMEPAGE.md` & `APPROVED-HOMEPAGE-ARTIFACTS.md`: Public Homepage specification and decisions.
- `WEB-004-SERVICE-DETAIL.md`: Service Category Detail page specification (`/services/[serviceId]`).
- `WEB-005-PUBLIC-BRAINWORKER-PROFILE.md` & `WEB-005-PHASE-1-AUDIT.md`: BrainWorker Public Profile specification (`/brainworkers/[id]`).
- `WEB-006-SERVICES-DISCOVERY.md` & `WEB-006-DESIGN-SPECIFICATION.md`: Services Directory and City Search specification (`/services`).
- `WEB-007-PUBLIC-BOOKING-PREPARATION.md` & `WEB-007A-BOOKING-PREPARATION-DESIGN-BRIEF.md`: Booking preparation specification (`/book`).
- `WEB-008A-AUTHENTICATION-DESIGN-BRIEF.md`: Authentication, phone OTP, and session design brief.
- `WEB-009A-CUSTOMER-JOB-POSTING-DESIGN-BRIEF.md`: Multi-step job posting design brief (`/post-job`).
- `WEB-010A-CUSTOMER-DASHBOARD-DESIGN-BRIEF.md`: Customer dashboard design brief (`/dashboard`).
- `WEB-011A-CUSTOMER-JOBS-AND-BOOKINGS-DESIGN-BRIEF.md`: Customer jobs and bookings activity hub design brief.
- `WEB-012-CUSTOMER-JOB-MATCHING-PRODUCT-UX-SPECIFICATION.md`: Candidate recommendations and matching specification (`/job/[referenceCode]/matches`).
- `WEB-013-CUSTOMER-BOOKING-ACCEPTANCE-BOOKING-LIFECYCLE-PRODUCT-UX-SPECIFICATION.md`: Booking lifecycle and state machine specification.
- `WEB-013A-CUSTOMER-BOOKING-ACCEPTANCE-LIFECYCLE-DESIGN-BRIEF.md`: Design brief for lifecycle presentation states.

---

## 8. Build Specifications (`docs/specs/`)

Governed by `/architect` [DECIDE] and `/develop` [BUILD] of the 9-Command Engineering Loop:
- `README.md`: Build specification directory index and status map.
- `00-engineering-loop.md`: Engineering loop integration specification.
- `WEB-011-customer-jobs-and-bookings.md`: Activity hub build specification.
- `WEB-012-matching.md`: Job matching build specification.
- `WEB-013-customer-booking-lifecycle.md`: Booking lifecycle build specification.
- `WEB-014-customer-profile-settings.md`: Customer profile and account settings build specification.

---

## 9. Brand & Asset Generation (`docs/06-brand/`)

- `BRAND-GUIDE.md`: Brand identity guidelines, logo lockups, and social banner standards.
- `generate-assets.py`: Python automation script for generating branded raster and vector assets.
- `assets/`: Master brand logos, app icons, 3D badge renders, and wordmark banners.

---

## 10. Quality, Security & Operations Baselines

- `docs/16-security-compliance/SECURITY-BASELINE.md`: Authentication standards, input sanitization, and data isolation controls.
- `docs/18-qa-testing/QA-BASELINE.md`: Testing tiers, coverage expectations, and quality gates.
- `docs/19-deployment-operations/RELEASE-BASELINE.md`: CI/CD pipelines, Vercel deployments, and Codespace synchronization rules.
- `docs/20-prompts/AGENT-EXECUTION-POLICY.md`: Operational policy governing AI coding agents.
- `docs/21-decision-log/`: Material architectural decisions and feature-level design records.

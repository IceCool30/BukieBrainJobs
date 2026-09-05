# BukieBrainJobs Documentation Index

**Document ID:** GOV-005
**Version:** 1.4
**Status:** Active

This is the navigation map for the repository documentation. The repository is the canonical handoff point for humans and coding/design agents.

## 00 Governance

- `SOURCE-OF-TRUTH.md`: authority and conflict resolution
- `REPOSITORY-STRUCTURE.md`: repository boundaries
- `DEVELOPMENT-WORKFLOW.md`: product-to-code workflow
- `DECISION-LOG.md`: material decisions
- `DOCUMENTATION-INDEX.md`: this index
- `TECHNICAL-BASELINE.md`: approved engineering baseline
- `FOUNDATION-STATUS.md`: foundation gate and readiness status
- `SOURCE-MATERIAL-REGISTER.md`: supplied source inventory and verification record
- `CANONICALIZATION-PLAN.md`: consolidation rules and release gate
- `FOUNDATION-FINAL-STATUS.md`: completed foundation record
- `FOUNDATION-VERIFICATION-RECORD.md`: foundation verification record
- `FOUNDATION-RELEASE-GATE.md`: released foundation gate
- `FOUNDATION-CLOSEOUT.md`: foundation closeout

## 01 Product

- `PRODUCT-FOUNDATION.md`: product foundation
- `ROADMAP.md`: milestones and sequencing
- `OPERATING-CHARTER.md`: project operating rules and responsibilities

Future canonical documents include the Product Bible, PRD, business model, personas, marketplace strategy and success metrics.

## 02 Design System

Canonical visual source:

- Root `DESIGN.md`
- `DESIGN-SYSTEM-v1.0.md`
- DS-001 Brand Identity
- DS-002 Logo System
- DS-003 Color System
- DS-004 Typography System
- DS-005 Grid and Layout
- DS-006 Spacing
- DS-007 Iconography
- DS-008 Component Library
- DS-009 Motion
- DS-010 Accessibility
- DS-011 Design Tokens
- DS-012 Final Design System Review

The DS artifacts are the formal design-system records. Root `DESIGN.md` remains authoritative for the visual source material.

Live-first authority:

- `LIVE-EXPERIENCE-STANDARD.md`: project-wide live experience authority and extension rules
- `skills/bukiebrainjobs-experience-standards/`: mandatory project-wide experience skill and its references:
  - `references/live-approved-experience.md`: live visual, interaction, platform, and homepage-specific baseline
  - `references/content-density-and-decision-architecture.md`: task hierarchy, progressive disclosure, and content-density decisions
  - `references/BUKIEBRAINJOBS-CONTENT-GUIDE.md`: customer-facing content guide
  - `references/quality-gates.md`: project-wide delivery quality gates
  - `references/validation-examples.md`: product-quality application examples

All future customer-facing pages, flows, components, PWA views, and native-app screens must follow the live-first experience standard.

## 03 Architecture

- `README.md`: engineering architecture hub and implementation boundary
- `ARCHITECTURE-BASELINE.md`: approved engineering baseline
- Detailed Full-Stack Technical Specification: supplied engineering reference to be preserved as a canonical source artifact

Future canonical documents include API contracts, database schema, state machines, integrations, infrastructure, environment strategy and observability.

## 04 Information Architecture

- `SCREEN-CATALOG.md`: current product surface inventory and planning estimate

Future canonical documents include the site map, navigation model, role-based information architecture, route inventory and deep-link rules.

## 05 Public Website

Live approved feature:

- `WEB-001-HOMEPAGE.md`: homepage implementation status and history
- `WEB-004-SERVICE-DETAIL.md`: public service detail specification and implementation contract
- `WEB-005-PUBLIC-BRAINWORKER-PROFILE.md`: public BrainWorker profile specification and return contract
- `WEB-006-SERVICES-DISCOVERY.md`: public services discovery and query synchronization specification
- `WEB-006-DESIGN-SPECIFICATION.md`: public services discovery design specification and state matrix
- `APPROVED-HOMEPAGE-ARTIFACTS.md`: approved homepage decisions
- The homepage is live and approved on `feature/web-001-homepage-redesign` with a two-tier hero search, image-led service cards, a three-brand trust strip (Paystack, Flutterwave, Dojah), and BrainWorker terminology standardized across all customer-facing copy


## 06 Authentication

Planned:

- Login
- Registration
- OTP
- Verification
- Password recovery
- Session management
- Role routing

## 07 Customer Platform

Planned:

- Customer dashboard
- Search
- Service discovery
- Job posting
- Booking
- Payments
- Reviews
- Wallet
- Notifications
- Settings

## 08 BrainWorker Platform

Planned:

- Onboarding
- Verification
- Profile
- Skills and rates
- Availability
- Job management
- Earnings
- Portfolio
- Performance

## 09 Booking

Planned:

- Booking lifecycle
- Job state machine
- Scheduling
- Check-in
- Completion
- Cancellation
- Disputes

## 10 Payments and Wallet

Planned:

- Pricing rules
- Paystack integration
- Platform fees
- Split payments
- Refunds
- Wallet rules
- Payouts
- Webhook idempotency

## 11 Messaging and Notifications

Planned:

- Chat
- Real-time events
- Notification types
- Push notifications
- Email
- SMS
- Contact-sharing policy

## 12 Corporate

Planned:

- Organization management
- Team members
- Recurring services
- Billing
- Reporting

## 13 Admin

Planned:

- Operations
- Verification
- Users
- Jobs
- Payments
- Disputes
- CMS
- Analytics

## 14 API

Planned:

- API catalogue
- Request/response contracts
- Error model
- Authentication requirements
- Rate limits
- Webhook contracts

## 15 Database

Planned:

- Prisma schema
- Entity relationships
- Indexing
- Migration policy
- Data retention
- Backup and recovery

## 16 Analytics

Planned:

- Event taxonomy
- Funnel definitions
- Product metrics
- Marketplace metrics
- Operational metrics

## 17 Security and Compliance

- `SECURITY-BASELINE.md`: approved security baseline

Future canonical documents include the threat model, privacy/data protection, abuse prevention and incident response.

## 18 Accessibility

Planned:

- WCAG 2.2 AA checklist
- Web accessibility
- Mobile accessibility
- Content accessibility

## 19 QA and Testing

- `QA-BASELINE.md`: approved test and release-quality baseline

Future canonical documents include the complete test strategy, E2E matrix and release acceptance suite.

## 20 Deployment and Operations

- `RELEASE-BASELINE.md`: approved deployment and operations baseline

Future canonical documents include local setup, development, staging, production, CI/CD, observability, alerts, rollback and disaster recovery.

## 21 Prompts

Every approved agent prompt belongs here and must reference the specification it implements.

- `AGENT-EXECUTION-POLICY.md`: rules for all design, coding and QA agents

The `WEB-001B-MCP` orchestration prompt was removed as deprecated.

## 22 Decision Log

Use for detailed ADRs when the central decision index becomes too large.

## Canonical-document rule

Do not create duplicate versions of a specification in different directories. If a document moves, update this index and preserve its history.

Historical project summaries and conversation exports are reference material, not canonical specifications.

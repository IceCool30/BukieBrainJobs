# BukieBrainJobs Documentation Index

**Document ID:** GOV-005
**Version:** 1.1
**Status:** Approved foundation

This is the navigation map for the repository documentation. The repository is the canonical handoff point for humans and coding/design agents.

## 00 Governance

- `SOURCE-OF-TRUTH.md` — authority and conflict resolution
- `REPOSITORY-STRUCTURE.md` — repository boundaries
- `DEVELOPMENT-WORKFLOW.md` — product-to-code workflow
- `DECISION-LOG.md` — material decisions
- `DOCUMENTATION-INDEX.md` — this index
- `TECHNICAL-BASELINE.md` — approved engineering baseline

## 01 Product

- `PRODUCT-FOUNDATION.md` — product foundation
- `ROADMAP.md` — milestones and sequencing
- `OPERATING-CHARTER.md` — project operating rules and responsibilities

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

## 03 Information Architecture

- `SCREEN-CATALOG.md` — current product surface inventory and planning estimate

Future canonical documents include the site map, navigation model, role-based information architecture, route inventory and deep-link rules.

## 04 Public Website

Current approved feature:

- `WEB-001` Homepage Product and UX Specification
- `WEB-001A` Homepage Section-by-Section Design Brief
- `WEB-001B` Google Stitch Design Requirements
- `WEB-001B-MCP` Antigravity to Stitch MCP orchestration prompt
- `WEB-001C` Engineering implementation specification, to be created only after design approval

## 05 Authentication

Planned:

- Login
- Registration
- OTP
- Verification
- Password recovery
- Session management
- Role routing

## 06 Customer Platform

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

## 07 BrainWorker Platform

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

## 08 Booking

Planned:

- Booking lifecycle
- Job state machine
- Scheduling
- Check-in
- Completion
- Cancellation
- Disputes

## 09 Payments and Wallet

Planned:

- Pricing rules
- Paystack integration
- Platform fees
- Split payments
- Refunds
- Wallet rules
- Payouts
- Webhook idempotency

## 10 Messaging and Notifications

Planned:

- Chat
- Real-time events
- Notification types
- Push notifications
- Email
- SMS
- Contact-sharing policy

## 11 Corporate

Planned:

- Organization management
- Team members
- Recurring services
- Billing
- Reporting

## 12 Admin

Planned:

- Operations
- Verification
- Users
- Jobs
- Payments
- Disputes
- CMS
- Analytics

## 13 API

Planned:

- API catalogue
- Request/response contracts
- Error model
- Authentication requirements
- Rate limits
- Webhook contracts

## 14 Database

Planned:

- Prisma schema
- Entity relationships
- Indexing
- Migration policy
- Data retention
- Backup and recovery

## 15 Analytics

Planned:

- Event taxonomy
- Funnel definitions
- Product metrics
- Marketplace metrics
- Operational metrics

## 16 Security and Compliance

- `SECURITY-BASELINE.md` — approved security baseline

Future canonical documents include the threat model, privacy/data protection, abuse prevention and incident response.

## 17 Accessibility

Planned:

- WCAG 2.2 AA checklist
- Web accessibility
- Mobile accessibility
- Content accessibility

## 18 QA and Testing

- `QA-BASELINE.md` — approved test and release-quality baseline

Future canonical documents include the complete test strategy, E2E matrix and release acceptance suite.

## 19 Deployment and Operations

- `RELEASE-BASELINE.md` — approved deployment and operations baseline

Future canonical documents include local setup, development, staging, production, CI/CD, observability, alerts, rollback and disaster recovery.

## 20 Prompts

Every approved agent prompt belongs here and must reference the specification it implements.

```text
docs/20-prompts/
├── stitch/
├── antigravity/
└── qa/
```

## 21 Decision Log

Use for detailed ADRs when the central decision index becomes too large.

## Canonical-document rule

Do not create duplicate versions of a specification in different directories. If a document moves, update this index and preserve its history.

Historical project summaries and conversation exports are reference material, not canonical specifications.

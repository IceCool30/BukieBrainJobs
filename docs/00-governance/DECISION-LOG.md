# Decision Log

**Document ID:** GOV-004
**Version:** 1.0
**Status:** Approved foundation

This file is the index for material product, design and engineering decisions. Detailed decisions may later be split into individual ADR files under `docs/21-decision-log/`.

## Decision format

Every material decision should record:

- Decision ID
- Date
- Status
- Context
- Decision
- Alternatives considered
- Consequences
- Affected areas
- Source references

## Current locked decisions

### GOV-001: Repository is the durable engineering source

**Status:** Approved

The GitHub repository will contain the durable project guidance required for humans and agents to understand and build BukieBrainJobs safely.

### GOV-002: Design authority

**Status:** Approved

`DESIGN.md` is the visual source of truth. Approved design-system artifacts formalize and extend it without silently contradicting it.

### GOV-003: Product-to-engineering separation

**Status:** Approved

ChatGPT defines product and technical specifications, Google Stitch produces visual designs, and Google Antigravity implements approved designs.

### GOV-004: Documentation before application code

**Status:** Approved

The repository foundation is being established before application code is committed. Application implementation should only begin after the relevant specifications and engineering requirements are available.

### GOV-005: Shared contracts

**Status:** Approved

Shared API contracts, database shapes, validation rules and reusable business logic must be defined once in the shared package layer where the approved architecture requires them.

### DS-011: Semantic design tokens

**Status:** Approved

The platform uses a semantic token architecture shared across web and mobile. Deep Navy is the primary brand/action system and Emerald is strategic emphasis/success. The legacy green-primary technical example must not override `DESIGN.md`.

### WEB-001: Homepage baseline

**Status:** Approved

The public homepage is customer-first, supports three marketplace entry paths, supports guest discovery, and uses controlled activation across 36 Nigerian state capitals plus Abuja as the initial geographic architecture.

## Adding a decision

Do not edit a historical decision to hide a change. If a decision changes, create a new decision, link the superseded decision and explain the reason.

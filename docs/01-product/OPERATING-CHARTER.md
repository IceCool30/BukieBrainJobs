# BukieBrainJobs Operating Charter v1.0

**Document ID:** PROD-001
**Version:** 1.2
**Status:** Approved

## Mission

Build a trusted, scalable services marketplace for Nigeria, with a product foundation capable of future expansion across Africa.

## Core Principles

1. Design before development.
2. Systems before screens.
3. Reuse before creating new patterns.
4. Mobile-first product thinking.
5. Trust is a core product requirement.
6. Accessibility is part of the design process.
7. Documentation is part of the product.
8. Full product parity across website, PWA, and native apps.

## Platform access policy

Users choose their surface. The product does not force a weaker path.

| Surface | Intent |
|---|---|
| Desktop and mobile website | Complete product in the browser |
| Installed PWA | Complete product without an app store |
| Native Android and iOS | Complete product through the stores |

Rules:

- Core customer and BrainWorker journeys are available on all three surfaces.
- Native may use stronger OS capabilities (push, camera, biometrics) for the same outcomes.
- PWA is not a partial demo.
- Website on a phone is still the website. Installed standalone mode is PWA.

## Responsibilities

### Product Architecture and Documentation

Product decisions, PRD and feature specifications, UX, architecture, acceptance criteria, decision records and QA guidance are owned by the product and architecture function.

### UI Design and Engineering

UI design and engineering interpret approved specifications and DESIGN.md to produce visual layouts, frontend, backend, APIs, infrastructure, testing and deployment.

### Source Control

GitHub is the versioned source of truth for repository documentation, code, reviews and release history.

## Feature Factory

```text
Idea / Request
    ↓
Product Specification
    ↓
UX Requirements & Flow
    ↓
Design and Implementation (using DESIGN.md)
    ↓
Automated & Manual Tests
    ↓
Security + Accessibility + Performance Review
    ↓
Human Approval
    ↓
Merge / Release
```

## Definition of Done

A substantive feature is incomplete until its approved product, UX, UI, technical, API/data, acceptance, edge-case, accessibility, security and QA requirements are documented or explicitly referenced.

For core marketplace features, Done also requires a clear plan for website, PWA, and native availability, even when native ships after web.

## Change Management

Material decisions receive a unique decision ID, version, reason, affected modules and references. Changes to locked design-system rules require an explicit design-system revision rather than an informal override.

## Marketplace Direction

BukieBrainJobs operates as a two-sided marketplace:

- Customers find and book BrainWorkers.
- Customers can post jobs and receive matching opportunities.
- BrainWorkers build profiles, verify identity and skills, set rates, manage availability and receive jobs.

The public homepage exposes all three paths while keeping customer discovery primary.

## Geographic Operating Model

The approved architecture covers 36 Nigerian state capitals plus Abuja, FCT. Public activation is controlled by marketplace supply and service coverage. Exact activation thresholds remain an operations policy decision.

## Trust Model

Trust is mutual. BrainWorkers have stronger professional verification requirements because they deliver services, while customer verification can increase with action risk. Discovery remains low-friction and does not require an account.

## Governance Rule

When requirements conflict, use `docs/00-governance/SOURCE-OF-TRUTH.md`. Do not silently resolve material conflicts.

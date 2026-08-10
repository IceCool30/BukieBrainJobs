# BukieBrainJobs Operating Charter v1.0

**Document ID:** PROD-001
**Version:** 1.0
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

## Responsibilities

### Product Architecture and Documentation

ChatGPT is the product architecture and specification authority for this project. Responsibilities include product decisions, PRD and feature specifications, UX, architecture, acceptance criteria, decision records, QA guidance and approved agent prompts.

### UI Design & Engineering

Google Antigravity is the UI design and engineering environment. Antigravity interprets approved specifications and DESIGN.md to produce and implement visual layouts, frontend, backend, APIs, infrastructure, testing and deployment.

> [!NOTE]
> Google Stitch was previously used as an intermediate visual design tool. It is no longer a required part of the production workflow. Current UI design and implementation are performed directly by Google Antigravity using the approved project specifications and DESIGN.md.

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
Google Antigravity UI Design & Implementation (using DESIGN.md)
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

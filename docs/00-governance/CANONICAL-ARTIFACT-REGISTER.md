# BukieBrainJobs Canonical Artifact Register

**Document ID:** GOV-010
**Version:** 1.0
**Status:** Active

## Purpose

This register is the authoritative inventory of project artifacts that must exist in the repository before the documentation foundation is released.

The register distinguishes between an artifact being **approved in project history** and its **full authoritative content being physically mirrored in the repository**. An approval record is not treated as a substitute for the source artifact.

## Authority Order

1. `DESIGN.md`
2. Approved Design System artifacts DS-001 through DS-012
3. Product and feature specifications
4. Full-Stack Technical Specification
5. Security, QA and operational baselines
6. Approved prompts and agent operating procedures
7. Research and historical project material

## Design System

| ID | Artifact | Project status | Repository state |
|---|---|---|---|
| DS-001 | Brand Identity | Approved | Register verified; full source mirror pending verification |
| DS-002 | Logo System | Approved | Register verified; full source mirror pending verification |
| DS-003 | Color System | Approved | Register verified; full source mirror pending verification |
| DS-004 | Typography System | Approved | Register verified; full source mirror pending verification |
| DS-005 | Grid & Layout | Approved | Register verified; full source mirror pending verification |
| DS-006 | Spacing System | Approved | Register verified; full source mirror pending verification |
| DS-007 | Iconography System | Approved | Register verified; full source mirror pending verification |
| DS-008 | Component Library Foundation | Approved | Register verified; full source mirror pending verification |
| DS-009 | Motion System | Approved | Register verified; full source mirror pending verification |
| DS-010 | Accessibility Standards | Approved | Register verified; full source mirror pending verification |
| DS-011 | Design Token System | Approved | Register verified; full source mirror pending verification |
| DS-012 | Final Design System Review | Approved | Register verified; full source mirror pending verification |

`DESIGN.md` is already physically present at repository root and remains the visual authority.

## Public Website

| ID | Artifact | Project status | Repository state |
|---|---|---|---|
| WEB-001 | Homepage Product & UX Specification | Approved | Canonical homepage record exists; full source mirror pending verification |
| WEB-001A | Homepage Section-by-Section Design Brief | Approved | Full source mirror pending verification |
| WEB-001B | Google Stitch Design Requirements | Approved | Full source mirror pending verification |
| WEB-001B-MCP | Antigravity → Stitch MCP Orchestration | Approved workflow artifact | Full source mirror pending verification |
| WEB-001C | Antigravity Implementation Specification | Deferred | Must remain absent until human Stitch approval |

## Engineering Reference

The supplied Full-Stack Technical Specification is the detailed engineering reference. Its table of contents contains 27 sections covering architecture, monorepo tooling, directory map, stack decisions, TypeScript, environment contracts, guardrails, state machine, Prisma schema, API contracts, matching, Socket.io, state management, identity verification, payments, OTP, infrastructure, PWA, Expo, CI/CD, security, BullMQ, NativeWind/design tokens, testing and secrets management.

**Repository requirement:** the complete authoritative technical specification must be mirrored before the foundation gate can close.

## Product and Operations

The canonical tree must retain or mirror the approved:

- Product Foundation
- Operating Charter
- Roadmap
- Security Baseline
- QA Baseline
- Release Baseline
- Screen Catalog
- Source Material Register
- Agent Execution Policy
- Prompt Library

## Consolidation Rule

Do not copy conversation history, duplicate branch summaries, or repeated project breakdown files into the canonical tree simply because they exist.

Where a historical source contains an approved decision, consolidate the decision into its canonical artifact and preserve the source fingerprint in `SOURCE-MATERIAL-REGISTER.md`.

Where an authoritative source must be preserved verbatim, mirror the actual source content rather than creating a summary and calling it complete.

## Release Condition

The documentation foundation can only be marked **RELEASED** when every required artifact above has either:

1. Its complete authoritative content physically present in the repository, or
2. An explicit, documented exception approved by the project owner.

Until then, application implementation remains blocked.

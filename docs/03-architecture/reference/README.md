# Technical Specification Reference

This directory contains the canonical engineering reference derived from the supplied `BukieBrainJobs — Full-Stack Technical Specification.md` source artifact.

## Canonical source

The supplied source is version 1.0, dated August 2026, and is explicitly written as an engineering reference for senior developers and AI coding agents. It defines the monorepo toolchain, directory map, stack decisions, environment contract, architectural guardrails, job state machine, Prisma schema, API contract, matching algorithm, Socket.io architecture, Zustand stores, identity verification, Paystack, Termii, infrastructure, PWA, Expo, CI/CD, security, BullMQ, NativeWind/design tokens, testing and secrets management.

## Consolidation rule

The source artifact must be preserved faithfully. This directory may split it into logically bounded Markdown files for repository navigation, but no section may be silently summarized, rewritten, or dropped.

## Current consolidation status

| Reference | Status |
|---|---|
| Technical specification source registration | Verified |
| Section 1: Strategic Architecture Overview | Consolidated |
| Section 2: Monorepo Toolchain | Consolidated |
| Section 3: Full Directory Map | Consolidated |
| Section 4 onward | Pending sequential consolidation |

## Authority

The technical specification is the engineering reference. It does not override the approved visual source `DESIGN.md` where the two conflict on visual tokens.

Known conflict: the technical specification contains a legacy Tailwind example that assigns green to the `primary` namespace. The approved visual system establishes Deep Navy `#001A41` as primary and Emerald `#296A4B` as strategic emphasis. This conflict is recorded in `docs/00-governance/SOURCE-VERIFICATION-REPORT.md`.

## Agent rule

Until all required sections have been consolidated and verified, agents must not assume that a missing section has been intentionally omitted. They must stop and report the missing source material.

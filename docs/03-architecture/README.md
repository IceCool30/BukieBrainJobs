# Engineering Architecture Documentation

**Status:** Foundation hub

This directory contains the engineering authority for BukieBrainJobs. It does not contain application source code yet.

## Primary Reference

`BukieBrainJobs — Full-Stack Technical Specification.md` is the detailed engineering reference supplied for the project. It defines the intended Next.js 14, React Native Expo, TypeScript monorepo, toolchain, directory map, state machine, Prisma schema, REST API, matching, Socket.io, authentication, payments, infrastructure, PWA, CI/CD, security, queues, design-token integration and testing strategy.

## Canonical Architecture Areas

- `ARCHITECTURE-BASELINE.md` for the approved architectural direction.
- API contracts and error model.
- Database schema and relationship rules.
- Authentication and authorization.
- Marketplace state machines and business rules.
- Payments and webhook idempotency.
- Messaging and real-time events.
- Background jobs and retry behavior.
- Storage and external integrations.
- Infrastructure and environment separation.
- CI/CD and release controls.

## Agent Rule

An implementation agent must read the relevant product specification, design specification, this architecture hub, and the applicable security and QA guidance before changing code.

The detailed technical specification is authoritative for engineering requirements unless a newer approved repository decision explicitly supersedes a specific requirement.

## Implementation Gate

Application code remains blocked until the repository foundation gate is formally released.

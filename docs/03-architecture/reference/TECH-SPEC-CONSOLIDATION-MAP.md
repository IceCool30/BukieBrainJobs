# Full-Stack Technical Specification Consolidation Map

**Document ID:** ARCH-002
**Version:** 1.0
**Status:** Active consolidation record
**Source:** `BukieBrainJobs — Full-Stack Technical Specification.md`

## Purpose

This document maps the supplied engineering specification into repository locations without replacing the source specification with summaries.

## Required Sections

| Source section | Canonical repository destination |
|---|---|
| 1. Strategic Architecture Overview | `docs/03-architecture/` |
| 2. Monorepo Toolchain | `docs/03-architecture/` |
| 3. Full Directory Map | `docs/03-architecture/` |
| 4. Complete Tech Stack Decision Matrix | `docs/03-architecture/` |
| 5. TypeScript Configuration | `docs/03-architecture/` |
| 6. Environment Variables Contract | `docs/03-architecture/` and security operations |
| 7. Absolute Architectural Guardrails | `docs/03-architecture/` |
| 8. Hybrid Task-to-Project State Machine | `docs/06-marketplace/` |
| 9. Complete Prisma Schema | `docs/03-architecture/database/` |
| 10. Prisma Client Singleton | `docs/03-architecture/database/` |
| 11. Pricing Utility Functions | `docs/08-payments/` |
| 12. REST API Contract | `docs/03-architecture/api/` |
| 13. Matching Algorithm | `docs/06-marketplace/` |
| 14. Socket.io Architecture & Typed Events | `docs/03-architecture/realtime/` |
| 15. Zustand Store Implementations | `docs/03-architecture/state/` |
| 16. Smile Identity Integration | `docs/05-authentication/` |
| 17. Paystack Integration | `docs/08-payments/` |
| 18. OTP Authentication via Termii | `docs/05-authentication/` |
| 19. Infrastructure Architecture | `docs/03-architecture/infrastructure/` |
| 20. PWA Configuration | `docs/15-platform/` |
| 21. Expo Mobile Configuration | `docs/15-platform/` |
| 22. CI/CD Pipeline | `docs/19-deployment-operations/` |
| 23. Security Architecture | `docs/16-security-compliance/` |
| 24. Background Job Queue | `docs/03-architecture/background-jobs/` |
| 25. NativeWind v4 + Design Tokens | `docs/02-design-system/` and `docs/03-architecture/` |
| 26. Testing Strategy | `docs/18-qa-testing/` |
| 27. Secrets Management | `docs/16-security-compliance/` |

## Source Integrity Rule

The source specification is the engineering reference. Derived documents may improve navigation and domain ownership, but they must not silently alter the source requirements.

If a derived document intentionally supersedes a legacy example, the decision must be recorded in `docs/00-governance/DECISION-LOG.md` and the source conflict must remain visible.

## Known Conflict

The legacy Tailwind example in the supplied technical specification maps green to `primary`. The approved visual authority instead defines Deep Navy `#001A41` as the primary brand/action system and Emerald `#296A4B` as strategic emphasis. The approved visual system takes precedence for design tokens and implementation mapping.

## Release Gate

This map is complete only when all 27 source sections have either been mirrored verbatim or represented by a clearly traceable canonical derivative with the original source retained as the engineering reference.

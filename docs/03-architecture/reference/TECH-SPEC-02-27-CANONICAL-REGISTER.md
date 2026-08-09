# Technical Specification Sections 02-27 Canonical Register

**Document ID:** ARCH-REF-002
**Version:** 1.0
**Status:** Active consolidation register
**Source:** `BukieBrainJobs — Full-Stack Technical Specification.md`, Version 1.0, August 2026

## Purpose

This register maps every remaining section of the approved Full-Stack Technical Specification into the repository architecture. It is a control document, not a replacement for the source specification. A section is marked **mirrored** only when its authoritative content has been physically consolidated into the repository.

## Canonical section map

| Section | Topic | Canonical destination | Status |
|---:|---|---|---|
| 02 | Monorepo Toolchain | `docs/03-architecture/toolchain/` | Registered |
| 03 | Full Directory Map | `docs/03-architecture/structure/` | Registered |
| 04 | Tech Stack Decision Matrix | `docs/03-architecture/decisions/` | Registered |
| 05 | TypeScript Configuration | `docs/03-architecture/toolchain/` | Registered |
| 06 | Environment Variables Contract | `docs/03-architecture/environments/` | Registered |
| 07 | Absolute Architectural Guardrails | `docs/03-architecture/guardrails/` | Registered |
| 08 | Hybrid Task-to-Project State Machine | `docs/06-marketplace/state-machine/` | Registered |
| 09 | Complete Prisma Schema | `docs/05-data/prisma/` | Registered |
| 10 | Prisma Client Singleton | `docs/05-data/prisma/` | Registered |
| 11 | Pricing Utility Functions | `docs/06-marketplace/pricing/` | Registered |
| 12 | REST API Contract | `docs/04-api/rest/` | Registered |
| 13 | Matching Algorithm | `docs/06-marketplace/matching/` | Registered |
| 14 | Socket.io Architecture and Typed Events | `docs/09-realtime/` | Registered |
| 15 | Zustand Store Implementations | `docs/03-architecture/state-management/` | Registered |
| 16 | Smile Identity Integration | `docs/05-data/identity/` | Registered |
| 17 | Paystack Integration | `docs/08-payments/` | Registered |
| 18 | OTP Authentication via Termii | `docs/05-authentication/otp/` | Registered |
| 19 | Infrastructure Architecture | `docs/15-infrastructure/` | Registered |
| 20 | PWA Configuration | `docs/15-infrastructure/pwa/` | Registered |
| 21 | Expo Mobile Configuration | `docs/15-infrastructure/mobile/` | Registered |
| 22 | CI/CD Pipeline | `docs/15-infrastructure/ci-cd/` | Registered |
| 23 | Security Architecture | `docs/16-security-compliance/` | Registered |
| 24 | Background Job Queue, BullMQ | `docs/10-background-jobs/` | Registered |
| 25 | NativeWind v4 and Design Tokens | `docs/02-design-system/implementation/` | Registered |
| 26 | Testing Strategy | `docs/18-qa-testing/` | Registered |
| 27 | Secrets Management | `docs/16-security-compliance/secrets/` | Registered |

## Approved baseline captured from the source

- Platform: Next.js 14, React Native Expo, TypeScript monorepo.
- Workspace: pnpm and Turborepo.
- TypeScript: strict mode with additional safety compiler options.
- Database: PostgreSQL with Prisma.
- Cache, rate limiting, queues and pub/sub: Redis.
- Real-time transport: Socket.io 4.x.
- Authentication: NextAuth.js v5 with JWT strategy and Termii OTP.
- State management: Zustand 4.x.
- Web styling: Tailwind CSS 3.x.
- Mobile styling: NativeWind v4.
- Validation: Zod 3.x.
- API style: REST Route Handlers.
- Storage: Cloudinary.
- Email: Resend.
- Push: Expo Notifications and FCM.
- Payments: Paystack split payments.
- Identity verification: Smile Identity.
- Background jobs: BullMQ with Redis.
- Monitoring: Sentry.
- Analytics: PostHog.
- Web hosting: Vercel.
- Persistent Socket service: Railway or Render.
- Managed PostgreSQL: Supabase.
- Redis: Upstash.
- Mobile distribution: EAS Build and Submit.

## Critical source rule

The supplied specification contains an older Tailwind token example that maps green to `primary`. That example does **not** override the approved visual source of truth. `DESIGN.md` and DS-003/DS-011 establish Deep Navy as the primary brand/action system and Emerald as strategic emphasis. The conflict is intentionally recorded for implementation correction rather than silently propagated.

## State-machine rule

Section 8 is authoritative for job status transitions. No implementation may mutate job status outside the approved transition function and associated validation rules.

## Consolidation rule

This register does not authorize implementation. It tells contributors and AI agents where each source section belongs and whether the authoritative section has been mirrored. A section remains incomplete until the full source content is verified in the repository.

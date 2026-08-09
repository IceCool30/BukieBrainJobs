# Technical Architecture Baseline

**Document ID:** TECH-000
**Version:** 1.0
**Status:** Approved baseline
**Canonical detailed reference:** `BukieBrainJobs — Full-Stack Technical Specification.md`

## Non-negotiable principle

**Write once, run everywhere, trust the type system.**

API contracts, database models, shared state shapes and validation rules must be defined once in the shared package layer where the approved architecture requires them.

## Toolchain baseline

| Area | Approved baseline |
|---|---|
| Package manager | pnpm 9.x |
| Build orchestration | Turborepo 2.x |
| Language | TypeScript 5.x strict mode |
| Node | 20 LTS |
| Web | Next.js 14 App Router |
| Mobile | React Native + Expo SDK 51+ |
| Mobile routing | Expo Router v3 |
| Database | PostgreSQL 16.x |
| ORM | Prisma 5.x |
| Cache / queues | Redis 7.x |
| Real-time | Socket.io 4.x |
| Authentication | NextAuth.js v5 with JWT strategy and OTP via Termii |
| State | Zustand 4.x |
| Web styling | Tailwind CSS 3.x |
| Mobile styling | NativeWind v4 |
| Validation | Zod 3.x |
| API | REST via Route Handlers |
| Storage | Cloudinary |
| Email | Resend |
| SMS / OTP | Termii |
| Push | Expo Notifications + FCM |
| Payments | Paystack |
| Identity | Smile Identity |
| Background jobs | BullMQ |
| Monitoring | Sentry |
| Analytics | PostHog |
| Web hosting | Vercel |
| Socket hosting | Railway or Render |

## Application boundaries

The approved architecture includes:

- `apps/web` for the Next.js web/PWA experience.
- `apps/mobile` for the Expo mobile application.
- Shared packages for UI, design tokens, types, validation, database, auth, configuration and utilities as the implementation matures.
- A persistent Socket.io service for real-time messaging and job events.
- PostgreSQL with PostGIS for transactional and geographic data.
- Redis for caching, rate limiting, pub/sub and BullMQ queues.

## Security baseline

- JWT-based authentication.
- Short-lived access tokens and refresh-token strategy.
- Server-side role enforcement.
- Redis-backed rate limiting.
- Cryptographic verification of payment and identity webhooks.
- Idempotency for webhook processing.
- No secrets in source control.
- Sensitive identity data encrypted at rest.

## State-machine rule

Job status mutations must use the approved `canTransition()` state-machine rule. No service, route or UI may bypass the state transition guard.

## Testing baseline

- Unit: Vitest
- Integration: Vitest + Prisma test client
- API: Supertest + Next.js test utilities
- Web E2E: Playwright
- Mobile E2E: Maestro
- Real-time: Socket.io test client

## Infrastructure principle

Start with the approved serverless-first and managed-service architecture. Do not introduce microservices or other distributed infrastructure without a documented scale or reliability reason.

## Important implementation note

The detailed technical specification contains implementation examples. Agents must treat those examples as governed by the architecture and security rules. Placeholder code, example credentials, sample IDs and incomplete cryptographic implementations must never be promoted directly to production.

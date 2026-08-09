# BukieBrainJobs — Full-Stack Technical Specification

**Engineering Reference for Senior Developers & AI Coding Agents**

*Platform: Next.js 14 + React Native Expo + TypeScript Monorepo*
*Version: 1.0 | Document Date: August 2026*

---

> **How to use this document.** This specification is written as an instruction manual for senior engineers and AI coding agents. Every section contains production-ready code that can be copied directly into the repository. Follow the directory map in Section 3 exactly. Respect every guardrail in Section 7. Do not deviate from the Prisma schema in Section 9 without updating all downstream types. The state machine in Section 8 is the single source of truth for all job status logic — no status mutation may bypass `canTransition()`.

---

## Table of Contents

| Section | Topic |
|---|---|
| **1** | Strategic Architecture Overview |
| **2** | Monorepo Toolchain |
| **3** | Full Directory Map |
| **4** | Complete Tech Stack Decision Matrix |
| **5** | TypeScript Configuration |
| **6** | Environment Variables Contract |
| **7** | Absolute Architectural Guardrails |
| **8** | Hybrid Task-to-Project State Machine |
| **9** | Complete Prisma Schema |
| **10** | Prisma Client Singleton |
| **11** | Pricing Utility Functions |
| **12** | REST API Contract |
| **13** | Matching Algorithm |
| **14** | Socket.io Architecture & Typed Events |
| **15** | Zustand Store Implementations |
| **16** | Smile Identity Integration (NIN + BVN + Liveness) |
| **17** | Paystack Integration (Split Payments) |
| **18** | OTP Authentication via Termii |
| **19** | Infrastructure Architecture |
| **20** | PWA Configuration |
| **21** | Expo Mobile Configuration |
| **22** | CI/CD Pipeline (GitHub Actions) |
| **23** | Security Architecture |
| **24** | Background Job Queue (BullMQ) |
| **25** | NativeWind v4 + Design Tokens |
| **26** | Testing Strategy |
| **27** | Secrets Management |
| **References** | All cited sources |

---


## References

[1]: https://docs.usesmileid.com/integration-options/web-api/identity-verification "Smile Identity — Identity Verification API Documentation"
[2]: https://paystack.com/docs/payments/split-payments/ "Paystack — Split Payments Documentation"
[3]: https://developers.termii.com/otp "Termii — OTP API Documentation"
[4]: https://docs.expo.dev/eas/ "Expo Application Services (EAS) Documentation"
[5]: https://turbo.build/repo/docs "Turborepo Documentation"
[6]: https://www.prisma.io/docs/orm/prisma-schema "Prisma Schema Reference"
[7]: https://socket.io/docs/v4/ "Socket.io v4 Documentation"
[8]: https://zustand.docs.pmnd.rs/ "Zustand Documentation"
[9]: https://www.nativewind.dev/v4/overview "NativeWind v4 Documentation"
[10]: https://docs.serwist.pages.dev/ "Serwist (next-pwa successor) Documentation"
[11]: https://bullmq.io/ "BullMQ — Premium Message Queue for Node.js"
[12]: https://upstash.com/docs/redis/sdks/ratelimit-ts/overview "Upstash Ratelimit Documentation"


## 1. Strategic Architecture Overview

BukieBrainJobs is a **two-sided, real-time service marketplace** with five distinct actor roles: Client, Tasker, Admin, Corporate Client (B2B), and System (automated). The platform must simultaneously support:

- A **web application** (Next.js 14 App Router, SSR + ISR for SEO, client-side for real-time features)
- A **Progressive Web App** (PWA) served from the same Next.js build, installable on Android/iOS
- A **React Native Expo** application targeting Android (primary) and iOS (secondary)
- A **shared backend API** (Next.js Route Handlers + a dedicated Socket.io server)
- A **shared design system** (NativeWind v4 on mobile, Tailwind CSS v3 on web, unified tokens)
- A **shared business logic layer** (TypeScript types, Zustand stores, validation schemas, utilities)

The non-negotiable architectural principle is: **write once, run everywhere, trust the type system**. Every API contract, every database model, every state shape, and every validation rule must be defined exactly once in the `packages/` layer and consumed by all apps. No duplicated types. No platform-specific business logic. No runtime surprises.


## 2. Monorepo Toolchain

The repository uses **pnpm workspaces** as the package manager (faster installs, strict dependency isolation, native workspace protocol) and **Turborepo** as the build orchestrator (incremental builds, remote caching, parallel task execution).

```
Package Manager : pnpm 9.x
Build System    : Turborepo 2.x
Language        : TypeScript 5.x (strict mode, no `any`)
Node Version    : 20 LTS (managed via .nvmrc + Volta)
```


## 3. Full Directory Map

```
bukiebrainjobs/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                  # Lint, type-check, test on every PR
│   │   ├── deploy-web.yml          # Vercel deploy on merge to main
│   │   └── deploy-mobile.yml       # EAS Build + Submit on release tag
│   └── CODEOWNERS
│
├── apps/
│   ├── web/                        # Next.js 14 (App Router)
│   │   ├── app/
│   │   │   ├── (auth)/
│   │   │   │   ├── login/page.tsx
│   │   │   │   ├── register/page.tsx
│   │   │   │   └── verify/page.tsx
│   │   │   ├── (client)/
│   │   │   │   ├── dashboard/page.tsx
│   │   │   │   ├── book/[category]/page.tsx
│   │   │   │   ├── jobs/[jobId]/page.tsx
│   │   │   │   └── profile/page.tsx
│   │   │   ├── (tasker)/
│   │   │   │   ├── dashboard/page.tsx
│   │   │   │   ├── jobs/page.tsx
│   │   │   │   ├── earnings/page.tsx
│   │   │   │   └── profile/page.tsx
│   │   │   ├── (admin)/
│   │   │   │   ├── dashboard/page.tsx
│   │   │   │   ├── users/page.tsx
│   │   │   │   ├── jobs/page.tsx
│   │   │   │   └── disputes/page.tsx
│   │   │   ├── api/
│   │   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   │   ├── jobs/route.ts
│   │   │   │   ├── jobs/[jobId]/route.ts
│   │   │   │   ├── taskers/route.ts
│   │   │   │   ├── match/route.ts
│   │   │   │   ├── payments/initiate/route.ts
│   │   │   │   ├── payments/webhook/route.ts
│   │   │   │   ├── verification/initiate/route.ts
│   │   │   │   └── verification/webhook/route.ts
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx            # Landing page (ISR, 1hr revalidation)
│   │   ├── components/             # Web-only UI components
│   │   ├── lib/                    # Web-only utilities (auth, prisma client)
│   │   ├── public/
│   │   │   └── manifest.json       # PWA manifest
│   │   ├── next.config.js
│   │   ├── tailwind.config.ts      # Extends packages/ui/tailwind.config.ts
│   │   └── package.json
│   │
│   └── mobile/                     # React Native Expo (SDK 51+)
│       ├── app/                    # Expo Router v3 (file-based routing)
│       │   ├── (auth)/
│       │   │   ├── _layout.tsx
│       │   │   ├── login.tsx
│       │   │   ├── register.tsx
│       │   │   └── verify.tsx
│       │   ├── (client)/
│       │   │   ├── _layout.tsx     # Tab navigator
│       │   │   ├── index.tsx       # Home / Browse
│       │   │   ├── book/[category].tsx
│       │   │   ├── jobs/[jobId].tsx
│       │   │   └── profile.tsx
│       │   ├── (tasker)/
│       │   │   ├── _layout.tsx     # Tab navigator
│       │   │   ├── index.tsx       # Job feed
│       │   │   ├── earnings.tsx
│       │   │   └── profile.tsx
│       │   ├── chat/[jobId].tsx    # Shared chat screen
│       │   └── _layout.tsx         # Root layout (auth guard)
│       ├── components/             # Mobile-only components
│       ├── hooks/                  # Mobile-only hooks (permissions, location)
│       ├── app.json
│       ├── eas.json
│       ├── babel.config.js
│       ├── metro.config.js
│       └── package.json
│
├── packages/
│   ├── api-types/                  # Shared API request/response types
│   │   ├── src/
│   │   │   ├── jobs.ts
│   │   │   ├── users.ts
│   │   │   ├── payments.ts
│   │   │   ├── verification.ts
│   │   │   ├── chat.ts
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── db/                         # Prisma schema + generated client
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── migrations/
│   │   ├── src/
│   │   │   ├── client.ts           # Singleton PrismaClient
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── store/                      # Zustand stores (shared logic)
│   │   ├── src/
│   │   │   ├── authStore.ts
│   │   │   ├── jobStore.ts
│   │   │   ├── chatStore.ts
│   │   │   ├── matchStore.ts
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── ui/                         # Shared design system
│   │   ├── src/
│   │   │   ├── tokens/
│   │   │   │   ├── colors.ts       # Brand color palette
│   │   │   │   ├── spacing.ts
│   │   │   │   └── typography.ts
│   │   │   ├── components/
│   │   │   │   ├── Button.tsx      # Platform-adaptive (web + native)
│   │   │   │   ├── Card.tsx
│   │   │   │   ├── Avatar.tsx
│   │   │   │   ├── Badge.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   └── RatingStars.tsx
│   │   │   └── index.ts
│   │   ├── tailwind.config.ts      # Source of truth for design tokens
│   │   └── package.json
│   │
│   ├── validation/                 # Zod schemas (shared across web + mobile)
│   │   ├── src/
│   │   │   ├── jobSchemas.ts
│   │   │   ├── userSchemas.ts
│   │   │   ├── paymentSchemas.ts
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   └── utils/                      # Pure utility functions
│       ├── src/
│       │   ├── matching.ts         # Matching algorithm (pure functions)
│       │   ├── pricing.ts          # Fee calculation functions
│       │   ├── formatting.ts       # Currency, date, distance formatting
│       │   └── index.ts
│       └── package.json
│
├── services/
│   └── socket-server/              # Standalone Socket.io server (Node.js)
│       ├── src/
│       │   ├── index.ts            # Server entry point
│       │   ├── namespaces/
│       │   │   ├── chat.ts         # /chat namespace
│       │   │   └── jobs.ts         # /jobs namespace (live status)
│       │   ├── middleware/
│       │   │   ├── auth.ts         # JWT validation middleware
│       │   │   └── rateLimit.ts
│       │   └── handlers/
│       │       ├── chatHandlers.ts
│       │       └── jobHandlers.ts
│       ├── Dockerfile
│       └── package.json
│
├── turbo.json
├── pnpm-workspace.yaml
├── package.json                    # Root package.json (devDependencies only)
├── tsconfig.base.json              # Base TypeScript config
└── .env.example
```


## 4. Complete Tech Stack Decision Matrix

| Layer | Technology | Version | Rationale |
|---|---|---|---|
| Web Framework | Next.js (App Router) | 14.x | SSR for SEO, ISR for landing pages, Route Handlers for API |
| Mobile Framework | React Native + Expo | SDK 51+ | Unified JS/TS, EAS Build/Submit, OTA updates |
| Mobile Routing | Expo Router | v3 | File-based routing mirrors Next.js; deep linking built-in |
| Language | TypeScript | 5.x strict | End-to-end type safety; no `any` policy enforced by ESLint |
| Monorepo | Turborepo + pnpm | 2.x / 9.x | Incremental builds, remote cache, workspace protocol |
| Database | PostgreSQL | 16.x | ACID compliance, JSON columns, PostGIS for geo queries |
| ORM | Prisma | 5.x | Type-safe queries, migrations, generated client |
| Caching | Redis | 7.x | Session store, rate limiting, job queue, pub/sub |
| Real-time | Socket.io | 4.x | Bidirectional events; adapts to Redis pub/sub for multi-instance |
| Auth | NextAuth.js v5 | 5.x | JWT strategy; OTP via Termii (Nigerian SMS gateway) |
| State Management | Zustand | 4.x | Minimal boilerplate; works identically on web and RN |
| Web Styling | Tailwind CSS | 3.x | Utility-first; design tokens from `packages/ui` |
| Mobile Styling | NativeWind | v4 | Tailwind classes on React Native; same tokens as web |
| Validation | Zod | 3.x | Runtime + compile-time validation; shared schemas |
| API Style | REST (Route Handlers) | — | Simpler than tRPC for external webhook consumers |
| File Storage | Cloudinary | — | Profile photos, job evidence photos; Nigerian CDN PoP |
| Email | Resend | — | Transactional email; React Email templates |
| SMS/OTP | Termii | — | Nigerian SMS gateway; cheaper than Twilio for NG numbers |
| Push Notifications | Expo Notifications + FCM | — | Unified push for Android/iOS via Expo |
| Payments | Paystack | — | Primary; split payment API for marketplace |
| Identity Verification | Smile Identity | — | NIN + BVN + selfie liveness check |
| Background Jobs | BullMQ (Redis) | — | Job queues for async tasks (verification, payouts, reminders) |
| Monitoring | Sentry | — | Error tracking on web + mobile |
| Analytics | PostHog | — | Product analytics; self-hostable |
| Hosting (Web) | Vercel | — | Zero-config Next.js deployment; edge functions |
| Hosting (Socket) | Railway or Render | — | Persistent Node.js process for Socket.io |
| Hosting (DB) | Supabase (managed PG) | — | Managed PostgreSQL + connection pooling via PgBouncer |
| Hosting (Redis) | Upstash | — | Serverless Redis; compatible with Vercel edge |
| Mobile Distribution | EAS Build + Submit | — | Managed builds; direct Play Store + App Store submission |
| OTA Updates | Expo Updates (EAS Update) | — | Push JS bundle updates without app store review |


## 5. TypeScript Configuration

### `tsconfig.base.json` (root)
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "exactOptionalPropertyTypes": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "isolatedModules": true
  }
}
```

### `turbo.json`
```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": [".env"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**", "!.next/cache/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": { "outputs": [] },
    "type-check": { "outputs": [] },
    "test": { "outputs": ["coverage/**"] },
    "db:generate": { "cache": false },
    "db:migrate": { "cache": false }
  }
}
```

### `pnpm-workspace.yaml`
```yaml
packages:
  - "apps/*"
  - "packages/*"
  - "services/*"
```


## 6. Environment Variables Contract

All environment variables must be declared in `.env.example` at the root. Each app/service reads only the variables it needs. The following is the complete contract:

```bash
# ── Database ──────────────────────────────────────────────────────────
DATABASE_URL="postgresql://user:pass@host:5432/bukiebrainjobs?pgbouncer=true"
DIRECT_URL="postgresql://user:pass@host:5432/bukiebrainjobs"  # For migrations

# ── Redis ─────────────────────────────────────────────────────────────
REDIS_URL="rediss://default:token@host:6379"

# ── Auth ──────────────────────────────────────────────────────────────
NEXTAUTH_SECRET="min-32-char-random-string"
NEXTAUTH_URL="https://bukiebrainjobs.com"
JWT_SECRET="min-32-char-random-string"

# ── Termii (SMS / OTP) ────────────────────────────────────────────────
TERMII_API_KEY="your-termii-api-key"
TERMII_SENDER_ID="BukieBrain"

# ── Paystack ──────────────────────────────────────────────────────────
PAYSTACK_SECRET_KEY="sk_live_..."
PAYSTACK_PUBLIC_KEY="pk_live_..."
PAYSTACK_WEBHOOK_SECRET="your-webhook-secret"
PLATFORM_SUBACCOUNT_CODE="ACCT_xxxxxxxxxx"  # BukieBrainJobs platform subaccount

# ── Smile Identity ────────────────────────────────────────────────────
SMILE_PARTNER_ID="your-partner-id"
SMILE_API_KEY="your-api-key"
SMILE_CALLBACK_URL="https://bukiebrainjobs.com/api/verification/webhook"

# ── Cloudinary ────────────────────────────────────────────────────────
CLOUDINARY_CLOUD_NAME="bukiebrainjobs"
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."

# ── Resend (Email) ────────────────────────────────────────────────────
RESEND_API_KEY="re_..."
EMAIL_FROM="noreply@bukiebrainjobs.com"

# ── Socket.io Server ──────────────────────────────────────────────────
SOCKET_SERVER_URL="https://socket.bukiebrainjobs.com"
SOCKET_SERVER_PORT="3001"

# ── Expo / Mobile ─────────────────────────────────────────────────────
EXPO_PUBLIC_API_URL="https://bukiebrainjobs.com/api"
EXPO_PUBLIC_SOCKET_URL="https://socket.bukiebrainjobs.com"
EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY="pk_live_..."
EXPO_PUBLIC_GOOGLE_MAPS_KEY="AIza..."

# ── PostHog ───────────────────────────────────────────────────────────
POSTHOG_KEY="phc_..."
NEXT_PUBLIC_POSTHOG_KEY="phc_..."

# ── Sentry ────────────────────────────────────────────────────────────
SENTRY_DSN="https://...@sentry.io/..."
NEXT_PUBLIC_SENTRY_DSN="https://...@sentry.io/..."
```


## 7. Absolute Architectural Guardrails

These rules are non-negotiable and must be enforced via ESLint rules, PR review checklists, and CI gates:

**Guardrail 1 — No cross-app imports.** `apps/web` must never import from `apps/mobile` and vice versa. All shared code lives in `packages/`. Enforced by `eslint-plugin-import` with `no-restricted-imports`.

**Guardrail 2 — No Prisma client in mobile.** The Prisma client is a Node.js-only library. `apps/mobile` must never import from `packages/db`. Mobile communicates exclusively via the REST API. Enforced by `no-restricted-imports` in mobile's ESLint config.

**Guardrail 3 — No `any` in TypeScript.** `strict: true` plus `@typescript-eslint/no-explicit-any: error` in ESLint. All external API responses must be parsed through Zod schemas before use.

**Guardrail 4 — All API responses typed via `packages/api-types`.** Every Route Handler must import its request and response types from `@bukiebrainjobs/api-types`. No inline type definitions in API routes.

**Guardrail 5 — Zod validation on every API entry point.** Every Route Handler must validate the request body/params using a Zod schema from `packages/validation` before processing. Invalid requests return `400` with a structured error body.

**Guardrail 6 — Environment variables accessed only via a typed config module.** Never access `process.env.X` directly in application code. All env vars are read in `apps/web/lib/config.ts` and `services/socket-server/src/config.ts`, validated with Zod at startup, and exported as a typed `config` object.

**Guardrail 7 — All database mutations go through service functions.** No raw Prisma queries in Route Handlers. All DB access is mediated by service functions in `apps/web/lib/services/`. This enforces business logic consistency and makes testing possible.

**Guardrail 8 — Socket.io events are typed.** All Socket.io event names and payloads must be declared in `packages/api-types/src/chat.ts` as a typed `ServerToClientEvents` / `ClientToServerEvents` interface and imported by both the server and the mobile/web socket clients.

---


## 8. Hybrid Task-to-Project State Machine

Every job on BukieBrainJobs follows a deterministic state machine. Understanding this machine is the single most important architectural concept in the entire system — every API endpoint, every UI state, every notification trigger, and every payment action is gated by the current `JobStatus`. The model is called "hybrid task-to-project" because a job begins as a simple task (book a cleaner for 2 hours) but can be promoted to a multi-session project (weekly cleaning contract) without changing the underlying data model.

### 8.1 State Transition Diagram

```
                    ┌─────────────────────────────────────────────────────────┐
                    │                    JOB STATE MACHINE                    │
                    └─────────────────────────────────────────────────────────┘

  [Client posts job]
         │
         ▼
    ┌─────────┐   [No Tasker accepts within 2hr]    ┌──────────┐
    │  OPEN   │ ─────────────────────────────────────── ▶│ EXPIRED  │
    └─────────┘                                           └──────────┘
         │
         │ [Tasker sends invite / Client direct-hires]
         ▼
  ┌────────────┐   [Client or Tasker cancels]        ┌───────────────┐
  │  PENDING   │ ────────────────────────────────────── ▶ │   CANCELLED   │
  │ ACCEPTANCE │                                           └───────────────┘
  └────────────┘
         │
         │ [Tasker accepts]
         ▼
  ┌────────────┐   [Client cancels ≥24hr before start]    ┌───────────────┐
  │  CONFIRMED │ ────────────────────────────────────── ▶ │   CANCELLED   │
  └────────────┘   [Client cancels <24hr → cancellation   └───────────────┘
         │          fee charged]
         │ [Tasker checks in via GPS]
         ▼
  ┌────────────┐   [Tasker no-show after 30min]       ┌───────────────┐
  │ IN_PROGRESS│ ────────────────────────────────────── ▶ │   DISPUTED    │
  └────────────┘                                           └───────────────┘
         │                                                        │
         │ [Tasker marks complete]                           │ [Admin resolves]
         ▼                                                        │
  ┌────────────┐                                                  ▼
  │  PENDING   │                                          ┌───────────────┐
  │ COMPLETION │                                          │   RESOLVED    │
  └────────────┘                                          └───────────────┘
         │
         │ [Client confirms OR 24hr auto-confirm]
         ▼
  ┌────────────┐   [Promoted to recurring]
  │ COMPLETED  │ ─────────────────────────────────────── ▶ [New OPEN job
  └────────────┘                                            created with
         │                                                  parentJobId ref]
         │ [Paystack split payment captured]
         ▼
  ┌────────────┐
  │    PAID    │
  └────────────┘
```

### 8.2 State Transition Rules (enforced in `jobService.ts`)

```typescript
// packages/api-types/src/jobs.ts
export const JOB_STATUS_TRANSITIONS: Record<JobStatus, JobStatus[]> = {
  OPEN:               ['PENDING_ACCEPTANCE', 'EXPIRED', 'CANCELLED'],
  PENDING_ACCEPTANCE: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED:          ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS:        ['PENDING_COMPLETION', 'DISPUTED'],
  PENDING_COMPLETION: ['COMPLETED', 'DISPUTED'],
  COMPLETED:          ['PAID'],
  PAID:               [],
  CANCELLED:          [],
  EXPIRED:            [],
  DISPUTED:           ['RESOLVED', 'CANCELLED'],
  RESOLVED:           ['PAID', 'CANCELLED'],
}

export function canTransition(from: JobStatus, to: JobStatus): boolean {
  return JOB_STATUS_TRANSITIONS[from].includes(to)
}
```

Every service function that mutates job status must call `canTransition()` and throw a typed `InvalidTransitionError` if the transition is illegal. This prevents race conditions and invalid state mutations from any entry point.

---


## 9. Complete Prisma Schema

**File: `packages/db/prisma/schema.prisma`**

```prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["postgresqlExtensions"]
}

datasource db {
  provider   = "postgresql"
  url        = env("DATABASE_URL")
  directUrl  = env("DIRECT_URL")
  extensions = [postgis, pg_trgm, uuid_ossp]
}

// ─────────────────────────────────────────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────────────────────────────────────────

enum UserRole {
  CLIENT
  TASKER
  ADMIN
  CORPORATE_CLIENT
}

enum VerificationStatus {
  UNVERIFIED
  PENDING
  VERIFIED
  FAILED
  SUSPENDED
}

enum JobStatus {
  OPEN
  PENDING_ACCEPTANCE
  CONFIRMED
  IN_PROGRESS
  PENDING_COMPLETION
  COMPLETED
  PAID
  CANCELLED
  EXPIRED
  DISPUTED
  RESOLVED
}

enum JobType {
  TASK        // One-off, hourly
  PROJECT     // Multi-session, fixed scope
  RECURRING   // Weekly/monthly repeat
}

enum PaymentStatus {
  PENDING
  AUTHORIZED
  CAPTURED
  SPLIT_COMPLETE
  REFUNDED
  FAILED
}

enum DisputeStatus {
  OPEN
  UNDER_REVIEW
  RESOLVED_CLIENT_FAVOUR
  RESOLVED_TASKER_FAVOUR
  RESOLVED_SPLIT
  CLOSED
}

enum BadgeType {
  ID_VERIFIED
  BACKGROUND_CHECKED
  SKILLS_CERTIFIED
  TOP_RATED
  ELITE_TASKER
}

enum NotificationType {
  JOB_INVITE
  JOB_ACCEPTED
  JOB_CONFIRMED
  JOB_STARTED
  JOB_COMPLETED
  PAYMENT_RECEIVED
  REVIEW_RECEIVED
  DISPUTE_OPENED
  DISPUTE_RESOLVED
  VERIFICATION_COMPLETE
  CHALLENGE_EARNED
  SYSTEM
}

// ─────────────────────────────────────────────────────────────────────────────
// USER & IDENTITY
// ─────────────────────────────────────────────────────────────────────────────

model User {
  id                String             @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  createdAt         DateTime           @default(now())
  updatedAt         DateTime           @updatedAt
  deletedAt         DateTime?          // Soft delete

  // Core identity
  email             String?            @unique
  phone             String             @unique  // Nigerian format: +234XXXXXXXXXX
  phoneVerified     Boolean            @default(false)
  passwordHash      String?
  role              UserRole           @default(CLIENT)

  // Profile
  firstName         String
  lastName          String
  avatarUrl         String?
  dateOfBirth       DateTime?
  gender            String?

  // Location (stored as lat/lng for geo queries)
  city              String?
  state             String?
  latitude          Decimal?           @db.Decimal(10, 8)
  longitude         Decimal?           @db.Decimal(11, 8)

  // Auth
  otpHash           String?
  otpExpiresAt      DateTime?
  lastLoginAt       DateTime?
  fcmToken          String?            // Firebase push token

  // Relationships
  clientProfile     ClientProfile?
  taskerProfile TaskerProfile?
  sentMessages      Message[]          @relation("SentMessages")
  notifications     Notification[]
  reviewsGiven      Review[]           @relation("ReviewsGiven")
  reviewsReceived   Review[]           @relation("ReviewsReceived")
  disputes          Dispute[]          @relation("DisputeInitiator")
  sessions          Session[]

  @@index([phone])
  @@index([email])
  @@index([role])
  @@map("users")
}

model Session {
  id        String   @id @default(cuid())
  userId    String   @db.Uuid
  token     String   @unique
  expiresAt DateTime
  createdAt DateTime @default(now())
  userAgent String?
  ipAddress String?

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([token])
  @@index([userId])
  @@map("sessions")
}

model ClientProfile {
  id                String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId            String   @unique @db.Uuid
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  // B2B fields
  isCorporate       Boolean  @default(false)
  companyName       String?
  companyRcNumber   String?  // CAC registration number
  subscriptionTier  String?  // "basic" | "pro" | "enterprise"
  subscriptionEndsAt DateTime?

  // Stats
  totalJobsPosted   Int      @default(0)
  totalAmountSpent  Decimal  @default(0) @db.Decimal(14, 2)

  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  jobs              Job[]    @relation("ClientJobs")
  savedTaskers SavedTasker[]

  @@map("client_profiles")
}

model TaskerProfile {
  id                  String             @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId              String             @unique @db.Uuid
  createdAt           DateTime           @default(now())
  updatedAt           DateTime           @updatedAt

  // Verification
  verificationStatus  VerificationStatus @default(UNVERIFIED)
  ninNumber           String?            // Encrypted at rest
  bvnNumber           String?            // Encrypted at rest
  smileJobId          String?            // Smile Identity job reference
  verifiedAt          DateTime?

  // Professional
  bio                 String?            @db.Text
  yearsExperience     Int                @default(0)
  paystackSubaccountCode String?         // For split payments
  bankAccountName     String?
  bankAccountNumber   String?            // Encrypted
  bankCode            String?            // Nigerian bank code

  // Availability
  isAvailable         Boolean            @default(true)
  availabilityRadius  Int                @default(10) // km
  workingHoursStart   Int                @default(8)  // 24hr format
  workingHoursEnd     Int                @default(20)

  // Stats (denormalized for performance)
  averageRating       Decimal            @default(0) @db.Decimal(3, 2)
  totalReviews        Int                @default(0)
  totalJobsCompleted  Int                @default(0)
  totalEarnings       Decimal            @default(0) @db.Decimal(14, 2)
  completionRate      Decimal            @default(0) @db.Decimal(5, 4) // 0.0000 - 1.0000
  responseRate        Decimal            @default(0) @db.Decimal(5, 4)
  onTimeRate          Decimal            @default(0) @db.Decimal(5, 4)

  user                User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  skills              TaskerSkill[]
  badges              TaskerBadge[]
  jobsAssigned        Job[]              @relation("AssignedTasker")
  savedByClients      SavedTasker[]
  challenges          ChallengeParticipant[]

  @@index([verificationStatus])
  @@index([isAvailable])
  @@index([averageRating])
  @@map("tasker_profiles")
}

model Skill {
  id          String             @id @default(cuid())
  name        String             @unique
  slug        String             @unique
  category    String             // e.g. "home_services", "professional"
  description String?
  iconUrl     String?
  isActive    Boolean            @default(true)
  sortOrder   Int                @default(0)

  taskers TaskerSkill[]
  jobs         JobSkill[]

  @@map("skills")
}

model TaskerSkill {
  id                String             @id @default(cuid())
  taskerProfileId String          @db.Uuid
  skillId           String
  hourlyRateNgn     Decimal            @db.Decimal(10, 2) // Tasker's self-set rate
  isActive          Boolean            @default(true)
  certificationUrl  String?            // Proof of certification
  certifiedAt       DateTime?

  taskerProfile TaskerProfile @relation(fields: [taskerProfileId], references: [id], onDelete: Cascade)
  skill             Skill              @relation(fields: [skillId], references: [id])

  @@unique([taskerProfileId, skillId])
  @@map("tasker_skills")
}

model TaskerBadge {
  id                   String             @id @default(cuid())
  taskerProfileId String             @db.Uuid
  badgeType            BadgeType
  awardedAt            DateTime           @default(now())
  expiresAt            DateTime?

  taskerProfile   TaskerProfile @relation(fields: [taskerProfileId], references: [id], onDelete: Cascade)

  @@unique([taskerProfileId, badgeType])
  @@map("tasker_badges")
}

model SavedTasker {
  id                   String             @id @default(cuid())
  clientProfileId      String             @db.Uuid
  taskerProfileId String             @db.Uuid
  createdAt            DateTime           @default(now())

  clientProfile        ClientProfile      @relation(fields: [clientProfileId], references: [id], onDelete: Cascade)
  taskerProfile   TaskerProfile @relation(fields: [taskerProfileId], references: [id], onDelete: Cascade)

  @@unique([clientProfileId, taskerProfileId])
  @@map("saved_taskers")
}

// ─────────────────────────────────────────────────────────────────────────────
// JOBS
// ─────────────────────────────────────────────────────────────────────────────

model Job {
  id                   String         @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  createdAt            DateTime       @default(now())
  updatedAt            DateTime       @updatedAt

  // Core
  title                String
  description          String         @db.Text
  status               JobStatus      @default(OPEN)
  jobType              JobType        @default(TASK)

  // Relationships
  clientProfileId      String         @db.Uuid
  taskerProfileId String?        @db.Uuid
  parentJobId          String?        @db.Uuid  // For recurring jobs

  // Location
  address              String
  city                 String
  state                String
  latitude             Decimal        @db.Decimal(10, 8)
  longitude            Decimal        @db.Decimal(11, 8)

  // Scheduling
  scheduledStartAt     DateTime
  scheduledEndAt       DateTime?
  estimatedHours       Decimal?       @db.Decimal(4, 1)
  actualStartAt        DateTime?
  actualEndAt          DateTime?

  // Pricing (all in NGN, stored as kobo integers for precision)
  taskerRateKobo  Int            // Tasker's set hourly rate x 100
  estimatedTotalKobo   Int            // Estimated total before job
  actualTotalKobo      Int?           // Final total after job
  serviceFeeKobo       Int?           // Platform service fee (10%)
  trustFeeKobo         Int?           // Trust & Support fee (7.5%)
  clientTotalKobo      Int?           // What client pays (tasker + fees)

  // Recurring
  isRecurring          Boolean        @default(false)
  recurringFrequency   String?        // "weekly" | "biweekly" | "monthly"
  recurringEndsAt      DateTime?

  // Evidence
  beforePhotoUrls      String[]       @default([])
  afterPhotoUrls       String[]       @default([])

  // Metadata
  cancellationReason   String?
  cancelledBy          String?        @db.Uuid
  expiresAt            DateTime?

  clientProfile        ClientProfile  @relation("ClientJobs", fields: [clientProfileId], references: [id])
  taskerProfile   TaskerProfile? @relation("AssignedTasker", fields: [taskerProfileId], references: [id])
  parentJob            Job?           @relation("RecurringJobs", fields: [parentJobId], references: [id])
  childJobs            Job[]          @relation("RecurringJobs")
  skills               JobSkill[]
  messages             Message[]
  payment              Payment?
  review               Review?
  dispute              Dispute?
  statusHistory        JobStatusHistory[]
  invitations          JobInvitation[]

  @@index([status])
  @@index([clientProfileId])
  @@index([taskerProfileId])
  @@index([scheduledStartAt])
  @@index([city, state])
  @@map("jobs")
}

model JobSkill {
  id      String @id @default(cuid())
  jobId   String @db.Uuid
  skillId String

  job     Job    @relation(fields: [jobId], references: [id], onDelete: Cascade)
  skill   Skill  @relation(fields: [skillId], references: [id])

  @@unique([jobId, skillId])
  @@map("job_skills")
}

model JobStatusHistory {
  id         String    @id @default(cuid())
  jobId      String    @db.Uuid
  fromStatus JobStatus?
  toStatus   JobStatus
  changedBy  String?   @db.Uuid
  reason     String?
  createdAt  DateTime  @default(now())

  job        Job       @relation(fields: [jobId], references: [id], onDelete: Cascade)

  @@index([jobId])
  @@map("job_status_history")
}

model JobInvitation {
  id                   String    @id @default(cuid())
  jobId                String    @db.Uuid
  taskerProfileId String    @db.Uuid
  sentAt               DateTime  @default(now())
  respondedAt          DateTime?
  accepted             Boolean?
  declineReason        String?

  job                  Job       @relation(fields: [jobId], references: [id], onDelete: Cascade)

  @@unique([jobId, taskerProfileId])
  @@map("job_invitations")
}

// ─────────────────────────────────────────────────────────────────────────────
// PAYMENTS
// ─────────────────────────────────────────────────────────────────────────────

model Payment {
  id                    String        @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  createdAt             DateTime      @default(now())
  updatedAt             DateTime      @updatedAt

  jobId                 String        @unique @db.Uuid
  status                PaymentStatus @default(PENDING)

  // Paystack references
  paystackReference     String        @unique
  paystackTransactionId String?
  paystackAccessCode    String?       // For checkout initialization

  // Amounts (all in kobo)
  amountKobo            Int           // Total charged to client
  taskerShareKobo  Int           // Amount routed to Tasker subaccount
  platformShareKobo     Int           // Amount kept by platform
  tipKobo               Int           @default(0)

  // Split payment
  taskerSubaccountCode String?
  splitReference        String?

  // Timestamps
  authorizedAt          DateTime?
  capturedAt            DateTime?
  splitCompletedAt      DateTime?

  // Refund
  refundedAmountKobo    Int?
  refundedAt            DateTime?
  refundReason          String?

  job                   Job           @relation(fields: [jobId], references: [id])
  webhookEvents         PaymentWebhookEvent[]

  @@index([paystackReference])
  @@index([status])
  @@map("payments")
}

model PaymentWebhookEvent {
  id          String   @id @default(cuid())
  paymentId   String   @db.Uuid
  event       String   // e.g. "charge.success", "transfer.success"
  payload     Json
  processedAt DateTime @default(now())
  idempotencyKey String @unique  // Paystack event ID for deduplication

  payment     Payment  @relation(fields: [paymentId], references: [id])

  @@map("payment_webhook_events")
}

// ─────────────────────────────────────────────────────────────────────────────
// MESSAGING
// ─────────────────────────────────────────────────────────────────────────────

model Message {
  id          String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  createdAt   DateTime  @default(now())

  jobId       String    @db.Uuid
  senderId    String    @db.Uuid
  content     String    @db.Text
  contentType String    @default("text")  // "text" | "image" | "location"
  mediaUrl    String?
  isRead      Boolean   @default(false)
  readAt      DateTime?

  // Moderation
  isFlagged   Boolean   @default(false)
  flagReason  String?

  job         Job       @relation(fields: [jobId], references: [id], onDelete: Cascade)
  sender      User      @relation("SentMessages", fields: [senderId], references: [id])

  @@index([jobId, createdAt])
  @@index([senderId])
  @@map("messages")
}

// ─────────────────────────────────────────────────────────────────────────────
// REVIEWS
// ─────────────────────────────────────────────────────────────────────────────

model Review {
  id                   String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  createdAt            DateTime  @default(now())

  jobId                String    @unique @db.Uuid
  reviewerId           String    @db.Uuid
  revieweeId           String    @db.Uuid

  // Ratings (1-5)
  overallRating        Int       // 1-5
  punctualityRating    Int?      // 1-5
  qualityRating        Int?      // 1-5
  communicationRating  Int?      // 1-5

  comment              String?   @db.Text
  isPublic             Boolean   @default(true)

  // Response
  responseComment      String?   @db.Text
  respondedAt          DateTime?

  job                  Job       @relation(fields: [jobId], references: [id])
  reviewer             User      @relation("ReviewsGiven", fields: [reviewerId], references: [id])
  reviewee             User      @relation("ReviewsReceived", fields: [revieweeId], references: [id])

  @@index([revieweeId])
  @@map("reviews")
}

// ─────────────────────────────────────────────────────────────────────────────
// DISPUTES
// ─────────────────────────────────────────────────────────────────────────────

model Dispute {
  id              String        @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  jobId           String        @unique @db.Uuid
  initiatorId     String        @db.Uuid
  status          DisputeStatus @default(OPEN)

  reason          String        @db.Text
  evidenceUrls    String[]      @default([])

  adminNotes      String?       @db.Text
  resolution      String?       @db.Text
  resolvedAt      DateTime?
  resolvedBy      String?       @db.Uuid

  // Compensation
  compensationKobo Int?
  compensationPaidAt DateTime?

  job             Job           @relation(fields: [jobId], references: [id])
  initiator       User          @relation("DisputeInitiator", fields: [initiatorId], references: [id])

  @@map("disputes")
}

// ─────────────────────────────────────────────────────────────────────────────
// NOTIFICATIONS
// ─────────────────────────────────────────────────────────────────────────────

model Notification {
  id          String           @id @default(cuid())
  createdAt   DateTime         @default(now())

  userId      String           @db.Uuid
  type        NotificationType
  title       String
  body        String
  data        Json?            // Additional context (jobId, etc.)
  isRead      Boolean          @default(false)
  readAt      DateTime?
  sentViaPush Boolean          @default(false)

  user        User             @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, isRead])
  @@map("notifications")
}

// ─────────────────────────────────────────────────────────────────────────────
// CHALLENGES & INCENTIVES
// ─────────────────────────────────────────────────────────────────────────────

model Challenge {
  id              String    @id @default(cuid())
  createdAt       DateTime  @default(now())

  title           String
  description     String    @db.Text
  skillId         String?
  city            String?
  requiredJobs    Int       // Number of jobs to complete
  bonusAmountKobo Int       // Bonus payout in kobo
  startsAt        DateTime
  endsAt          DateTime
  isActive        Boolean   @default(true)

  participants    ChallengeParticipant[]

  @@map("challenges")
}

model ChallengeParticipant {
  id                   String    @id @default(cuid())
  challengeId          String
  taskerProfileId String    @db.Uuid
  jobsCompleted        Int       @default(0)
  earnedAt             DateTime?
  paidAt               DateTime?

  challenge            Challenge          @relation(fields: [challengeId], references: [id])
  taskerProfile   TaskerProfile @relation(fields: [taskerProfileId], references: [id])

  @@unique([challengeId, taskerProfileId])
  @@map("challenge_participants")
}
```

---


## 10. Prisma Client Singleton

**File: `packages/db/src/client.ts`**

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export * from '@prisma/client'
```


## 11. Pricing Utility Functions

**File: `packages/utils/src/pricing.ts`**

All monetary values are stored and computed in **kobo** (1 NGN = 100 kobo) to avoid floating-point precision errors. All display formatting converts kobo to NGN at the UI layer only.

```typescript
export const PLATFORM_SERVICE_FEE_RATE = 0.10   // 10%
export const TRUST_SUPPORT_FEE_RATE    = 0.075  // 7.5%
export const TOTAL_CLIENT_FEE_RATE     = PLATFORM_SERVICE_FEE_RATE + TRUST_SUPPORT_FEE_RATE // 17.5%

export interface PricingBreakdown {
  taskerRateKobo:    number  // Tasker's set hourly rate
  estimatedHours:         number
  taskerTotalKobo:   number  // What Tasker earns
  serviceFeeKobo:         number  // 10% platform fee
  trustFeeKobo:           number  // 7.5% trust fee
  clientTotalKobo:        number  // Total charged to client
  platformEarningsKobo:   number  // Total platform revenue
}

export function calculatePricing(
  taskerHourlyRateKobo: number,
  estimatedHours: number
): PricingBreakdown {
  const taskerTotalKobo = Math.round(taskerHourlyRateKobo * estimatedHours)
  const serviceFeeKobo       = Math.round(taskerTotalKobo * PLATFORM_SERVICE_FEE_RATE)
  const trustFeeKobo         = Math.round(taskerTotalKobo * TRUST_SUPPORT_FEE_RATE)
  const clientTotalKobo      = taskerTotalKobo + serviceFeeKobo + trustFeeKobo
  const platformEarningsKobo = serviceFeeKobo + trustFeeKobo

  return {
    taskerRateKobo: taskerHourlyRateKobo,
    estimatedHours,
    taskerTotalKobo,
    serviceFeeKobo,
    trustFeeKobo,
    clientTotalKobo,
    platformEarningsKobo,
  }
}

export function koboToNgn(kobo: number): number {
  return kobo / 100
}

export function ngnToKobo(ngn: number): number {
  return Math.round(ngn * 100)
}

export function formatNgn(kobo: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(koboToNgn(kobo))
}
```

---


## 12. REST API Contract

All API routes live under `apps/web/app/api/`. Every response follows a consistent envelope format. All amounts are in kobo. All timestamps are ISO 8601 UTC strings.

### 12.1 Response Envelope

```typescript
// packages/api-types/src/index.ts
export interface ApiSuccess<T> {
  success: true
  data: T
  meta?: {
    page?: number
    pageSize?: number
    total?: number
    totalPages?: number
  }
}

export interface ApiError {
  success: false
  error: {
    code: string       // Machine-readable: "JOB_NOT_FOUND", "INVALID_TRANSITION"
    message: string    // Human-readable
    details?: unknown  // Zod validation errors, etc.
  }
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError
```

### 12.2 Authentication Endpoints

```
POST   /api/auth/request-otp        Request OTP via SMS (Termii)
POST   /api/auth/verify-otp         Verify OTP -> issue JWT session
POST   /api/auth/register           Complete profile after OTP verify
POST   /api/auth/refresh            Refresh JWT access token
DELETE /api/auth/logout             Invalidate session
```

**POST /api/auth/request-otp**
```typescript
// Request
interface RequestOtpBody {
  phone: string  // "+234XXXXXXXXXX"
}
// Response: ApiSuccess<{ expiresInSeconds: number }>
// Sends 6-digit OTP via Termii. Rate-limited: 3 attempts per phone per 10 minutes.
```

**POST /api/auth/verify-otp**
```typescript
// Request
interface VerifyOtpBody {
  phone: string
  otp:   string  // 6-digit code
}
// Response: ApiSuccess<{ accessToken: string; refreshToken: string; user: UserDto; isNewUser: boolean }>
```

### 12.3 Job Endpoints

```
GET    /api/jobs                    List jobs (paginated, filtered)
POST   /api/jobs                    Create a new job
GET    /api/jobs/:jobId             Get job details
PATCH  /api/jobs/:jobId             Update job (status transitions, edits)
DELETE /api/jobs/:jobId             Cancel job (soft delete via status)

POST   /api/jobs/:jobId/invite      Client invites a specific Tasker
POST   /api/jobs/:jobId/accept      Tasker accepts job invite
POST   /api/jobs/:jobId/checkin     Tasker GPS check-in (start)
POST   /api/jobs/:jobId/complete    Tasker marks job complete
POST   /api/jobs/:jobId/confirm     Client confirms completion
POST   /api/jobs/:jobId/dispute     Open a dispute
```

**POST /api/jobs — Create Job**
```typescript
// packages/validation/src/jobSchemas.ts
import { z } from 'zod'

export const CreateJobSchema = z.object({
  title:              z.string().min(10).max(200),
  description:        z.string().min(20).max(2000),
  skillIds:           z.array(z.string()).min(1).max(5),
  jobType:            z.enum(['TASK', 'PROJECT', 'RECURRING']),
  address:            z.string().min(5),
  city:               z.string(),
  state:              z.string(),
  latitude:           z.number().min(-90).max(90),
  longitude:          z.number().min(-180).max(180),
  scheduledStartAt:   z.string().datetime(),
  scheduledEndAt:     z.string().datetime().optional(),
  estimatedHours:     z.number().min(0.5).max(24),
  taskerRateKobo: z.number().int().min(100_00),  // Min N100/hr
  isRecurring:        z.boolean().default(false),
  recurringFrequency: z.enum(['weekly', 'biweekly', 'monthly']).optional(),
  recurringEndsAt:    z.string().datetime().optional(),
})

export type CreateJobInput = z.infer<typeof CreateJobSchema>
```

**PATCH /api/jobs/:jobId — Status Transition**
```typescript
export const UpdateJobStatusSchema = z.object({
  status:             z.nativeEnum(JobStatus),
  reason:             z.string().optional(),
  actualStartAt:      z.string().datetime().optional(),
  actualEndAt:        z.string().datetime().optional(),
  afterPhotoUrls:     z.array(z.string().url()).optional(),
  latitude:           z.number().optional(),  // For check-in GPS verification
  longitude:          z.number().optional(),
})
```

### 12.4 Tasker / Matching Endpoints

```
GET    /api/taskers            Search/list Taskers (for client browsing)
GET    /api/taskers/:id        Get Tasker public profile
GET    /api/match                   Get matched Taskers for a job spec
POST   /api/taskers/profile    Create/update Tasker profile
PATCH  /api/taskers/skills     Update skill rates and availability
PATCH  /api/taskers/availability Toggle availability on/off
```

**GET /api/match — Matching Query**
```typescript
// Query params (all optional except skillId + city)
interface MatchQueryParams {
  skillId:      string    // Required: skill slug
  city:         string    // Required
  latitude:     number
  longitude:    number
  radiusKm:     number    // Default: 10
  scheduledAt:  string    // ISO datetime
  maxRateKobo:  number    // Client's budget ceiling
  page:         number    // Default: 1
  pageSize:     number    // Default: 10, max: 20
}

// Response
interface MatchResult {
  taskerId:    string
  userId:           string
  firstName:        string
  avatarUrl:        string | null
  averageRating:    number
  totalReviews:     number
  totalJobsCompleted: number
  hourlyRateKobo:   number
  distanceKm:       number
  matchScore:       number  // 0-100, computed by matching algorithm
  badges:           BadgeType[]
  skills:           { skillId: string; name: string; hourlyRateKobo: number }[]
  isAvailable:      boolean
}
```

### 12.5 Payment Endpoints

```
POST   /api/payments/initiate       Initialize Paystack transaction for a job
POST   /api/payments/webhook        Paystack webhook receiver (HMAC-verified)
POST   /api/payments/tip            Add tip after job completion
GET    /api/payments/:jobId         Get payment details for a job
```

---


## 13. Matching Algorithm

The matching algorithm is a **weighted scoring function** that ranks available Taskers for a given job. It is a pure function in `packages/utils/src/matching.ts` — no database access, no side effects. The Route Handler fetches candidates from the database and passes them to this function.

### 13.1 Algorithm Design

The score for each Tasker candidate is computed as:

```
matchScore = (
  w_rating      x ratingScore      +
  w_distance    x distanceScore    +
  w_completion  x completionScore  +
  w_response    x responseScore    +
  w_experience  x experienceScore  +
  w_ontime      x onTimeScore      +
  w_verified    x verifiedBonus
) x availabilityMultiplier
```

Where weights sum to 1.0 (excluding verifiedBonus and availabilityMultiplier):

| Factor | Weight | Score Computation |
|---|---|---|
| Average Rating | 0.30 | `rating / 5.0` |
| Distance | 0.25 | `1 - (distanceKm / maxRadiusKm)` clamped to [0,1] |
| Completion Rate | 0.15 | `completionRate` (0.0-1.0) |
| Response Rate | 0.10 | `responseRate` (0.0-1.0) |
| Experience | 0.10 | `min(totalJobsCompleted / 100, 1.0)` |
| On-Time Rate | 0.10 | `onTimeRate` (0.0-1.0) |
| Verified Bonus | +0.10 flat | Added if `verificationStatus === 'VERIFIED'` |
| Availability Multiplier | x0.5 | Applied if Tasker is currently busy (active job) |

### 13.2 Implementation

**File: `packages/utils/src/matching.ts`**

```typescript
import type { BadgeType, VerificationStatus } from '@prisma/client'

export interface TaskerCandidate {
  id:                  string
  userId:              string
  firstName:           string
  avatarUrl:           string | null
  verificationStatus:  VerificationStatus
  averageRating:       number   // 0.00 - 5.00
  totalReviews:        number
  totalJobsCompleted:  number
  completionRate:      number   // 0.0000 - 1.0000
  responseRate:        number
  onTimeRate:          number
  hourlyRateKobo:      number
  distanceKm:          number
  isAvailable:         boolean
  hasActiveJob:        boolean
  badges:              BadgeType[]
  skills:              { skillId: string; name: string; hourlyRateKobo: number }[]
}

export interface MatchOptions {
  maxRadiusKm:    number  // Default 10
  maxRateKobo?:   number  // Client budget ceiling; null = no ceiling
  minRating?:     number  // Minimum acceptable rating; default 0
  requireVerified?: boolean
}

const WEIGHTS = {
  rating:     0.30,
  distance:   0.25,
  completion: 0.15,
  response:   0.10,
  experience: 0.10,
  onTime:     0.10,
} as const

export function scoreCandidate(
  candidate: TaskerCandidate,
  options: MatchOptions
): number {
  const { maxRadiusKm } = options

  // Hard filters — return 0 to exclude from results
  if (!candidate.isAvailable) return 0
  if (options.requireVerified && candidate.verificationStatus !== 'VERIFIED') return 0
  if (options.maxRateKobo && candidate.hourlyRateKobo > options.maxRateKobo) return 0
  if (options.minRating && candidate.averageRating < options.minRating) return 0
  if (candidate.distanceKm > maxRadiusKm) return 0

  // Component scores
  const ratingScore     = candidate.averageRating / 5.0
  const distanceScore   = Math.max(0, 1 - candidate.distanceKm / maxRadiusKm)
  const completionScore = candidate.completionRate
  const responseScore   = candidate.responseRate
  const experienceScore = Math.min(candidate.totalJobsCompleted / 100, 1.0)
  const onTimeScore     = candidate.onTimeRate

  // Weighted base score
  let score =
    WEIGHTS.rating     * ratingScore     +
    WEIGHTS.distance   * distanceScore   +
    WEIGHTS.completion * completionScore +
    WEIGHTS.response   * responseScore   +
    WEIGHTS.experience * experienceScore +
    WEIGHTS.onTime     * onTimeScore

  // Verified bonus (flat addition, not weighted)
  if (candidate.verificationStatus === 'VERIFIED') {
    score += 0.10
  }

  // Penalise if currently on another job
  if (candidate.hasActiveJob) {
    score *= 0.5
  }

  // Clamp to [0, 1] and convert to 0-100 integer
  return Math.round(Math.min(Math.max(score, 0), 1) * 100)
}

export function rankCandidates(
  candidates: TaskerCandidate[],
  options: MatchOptions
): Array<TaskerCandidate & { matchScore: number }> {
  return candidates
    .map(c => ({ ...c, matchScore: scoreCandidate(c, options) }))
    .filter(c => c.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore)
}
```

### 13.3 Database Query for Candidates

**File: `apps/web/lib/services/matchService.ts`**

```typescript
import { prisma } from '@bukiebrainjobs/db'
import { rankCandidates, type MatchOptions } from '@bukiebrainjobs/utils'

export async function getMatchedTaskers(params: {
  skillId:     string
  city:        string
  latitude:    number
  longitude:   number
  options:     MatchOptions
  page:        number
  pageSize:    number
}) {
  const { skillId, city, latitude, longitude, options, page, pageSize } = params

  // Fetch candidates using PostGIS for distance calculation
  // The ST_Distance function returns meters; we convert to km
  const candidates = await prisma.$queryRaw<Array<{
    id: string
    userId: string
    firstName: string
    avatarUrl: string | null
    verificationStatus: string
    averageRating: number
    totalReviews: number
    totalJobsCompleted: number
    completionRate: number
    responseRate: number
    onTimeRate: number
    hourlyRateKobo: number
    distanceKm: number
    isAvailable: boolean
  }>>`
    SELECT
      bp.id,
      u.id AS "userId",
      u."firstName",
      u."avatarUrl",
      bp."verificationStatus",
      bp."averageRating",
      bp."totalReviews",
      bp."totalJobsCompleted",
      bp."completionRate",
      bp."responseRate",
      bp."onTimeRate",
      bws."hourlyRateNgn" * 100 AS "hourlyRateKobo",
      bp."isAvailable",
      ST_Distance(
        ST_MakePoint(u.longitude::float, u.latitude::float)::geography,
        ST_MakePoint(${longitude}, ${latitude})::geography
      ) / 1000 AS "distanceKm"
    FROM tasker_profiles bp
    JOIN users u ON u.id = bp."userId"
    JOIN tasker_skills bws ON bws."taskerProfileId" = bp.id
    JOIN skills s ON s.id = bws."skillId"
    WHERE
      s.slug = ${skillId}
      AND u.city = ${city}
      AND bp."isAvailable" = true
      AND bws."isActive" = true
      AND u."deletedAt" IS NULL
      AND ST_Distance(
        ST_MakePoint(u.longitude::float, u.latitude::float)::geography,
        ST_MakePoint(${longitude}, ${latitude})::geography
      ) / 1000 <= ${options.maxRadiusKm}
    ORDER BY "distanceKm" ASC
    LIMIT 100
  `

  // Fetch badges for all candidates
  const candidateIds = candidates.map(c => c.id)
  const badges = await prisma.taskerBadge.findMany({
    where: { taskerProfileId: { in: candidateIds } },
    select: { taskerProfileId: true, badgeType: true },
  })

  // Check for active jobs
  const activeJobs = await prisma.job.findMany({
    where: {
      taskerProfile: { id: { in: candidateIds } },
      status: { in: ['IN_PROGRESS', 'CONFIRMED'] },
    },
    select: { taskerProfileId: true },
  })
  const activeJobSet = new Set(activeJobs.map(j => j.taskerProfileId))

  // Enrich candidates
  const enriched = candidates.map(c => ({
    ...c,
    verificationStatus: c.verificationStatus as any,
    badges: badges.filter(b => b.taskerProfileId === c.id).map(b => b.badgeType),
    hasActiveJob: activeJobSet.has(c.id),
    skills: [],  // Populated separately if needed
  }))

  // Run matching algorithm
  const ranked = rankCandidates(enriched, options)

  // Paginate
  const start = (page - 1) * pageSize
  return {
    results: ranked.slice(start, start + pageSize),
    total: ranked.length,
    page,
    pageSize,
    totalPages: Math.ceil(ranked.length / pageSize),
  }
}
```

---


## 14. Socket.io Architecture & Typed Events

The Socket.io server runs as a **separate Node.js process** in `services/socket-server/`. It connects to the same Redis instance used by the Next.js app, enabling pub/sub between the API server (which publishes events) and the Socket.io server (which broadcasts to connected clients).

### 14.1 Typed Event Interfaces

**File: `packages/api-types/src/chat.ts`**

```typescript
import type { JobStatus } from '@prisma/client'

// Events emitted FROM server TO client
export interface ServerToClientEvents {
  // Chat
  'chat:message':         (payload: ChatMessagePayload) => void
  'chat:typing':          (payload: TypingPayload) => void
  'chat:read':            (payload: ReadReceiptPayload) => void

  // Job status
  'job:status_changed':   (payload: JobStatusPayload) => void
  'job:invite_received':  (payload: JobInvitePayload) => void
  'job:tasker_location': (payload: LocationPayload) => void

  // Notifications
  'notification:new':     (payload: NotificationPayload) => void

  // System
  'error':                (payload: { code: string; message: string }) => void
}

// Events emitted FROM client TO server
export interface ClientToServerEvents {
  // Chat
  'chat:send':            (payload: SendMessagePayload, ack: (res: AckResponse) => void) => void
  'chat:typing_start':    (payload: { jobId: string }) => void
  'chat:typing_stop':     (payload: { jobId: string }) => void
  'chat:mark_read':       (payload: { jobId: string; messageId: string }) => void

  // Job
  'job:join':             (payload: { jobId: string }) => void
  'job:leave':            (payload: { jobId: string }) => void
  'job:location_update':  (payload: LocationUpdatePayload) => void
}

// Inter-server events (Socket.io cluster via Redis adapter)
export interface InterServerEvents {
  'job:status_broadcast': (payload: JobStatusPayload) => void
}

// Socket data (attached to each socket instance)
export interface SocketData {
  userId:   string
  userRole: string
  jobIds:   Set<string>  // Rooms the socket has joined
}

// Payload types
export interface ChatMessagePayload {
  id:          string
  jobId:       string
  senderId:    string
  senderName:  string
  senderAvatar: string | null
  content:     string
  contentType: 'text' | 'image' | 'location'
  mediaUrl?:   string
  createdAt:   string
}

export interface SendMessagePayload {
  jobId:       string
  content:     string
  contentType: 'text' | 'image' | 'location'
  mediaUrl?:   string
}

export interface TypingPayload {
  jobId:    string
  userId:   string
  userName: string
}

export interface ReadReceiptPayload {
  jobId:     string
  messageId: string
  readBy:    string
  readAt:    string
}

export interface JobStatusPayload {
  jobId:     string
  newStatus: JobStatus
  updatedAt: string
  updatedBy: string
}

export interface JobInvitePayload {
  jobId:        string
  jobTitle:     string
  clientName:   string
  scheduledAt:  string
  hourlyRateKobo: number
}

export interface LocationPayload {
  jobId:     string
  latitude:  number
  longitude: number
  timestamp: string
}

export interface LocationUpdatePayload {
  jobId:     string
  latitude:  number
  longitude: number
}

export interface NotificationPayload {
  id:    string
  type:  string
  title: string
  body:  string
  data?: Record<string, unknown>
}

export interface AckResponse {
  success: boolean
  messageId?: string
  error?: string
}
```

### 14.2 Socket Server Implementation

**File: `services/socket-server/src/index.ts`**

```typescript
import { createServer } from 'http'
import { Server } from 'socket.io'
import { createAdapter } from '@socket.io/redis-adapter'
import { createClient } from 'redis'
import type {
  ServerToClientEvents,
  ClientToServerEvents,
  InterServerEvents,
  SocketData,
} from '@bukiebrainjobs/api-types'
import { authMiddleware } from './middleware/auth'
import { registerChatHandlers } from './handlers/chatHandlers'
import { registerJobHandlers } from './handlers/jobHandlers'

const httpServer = createServer()

const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>(httpServer, {
  cors: {
    origin: [process.env.WEB_URL!, process.env.MOBILE_ORIGIN!],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
  pingInterval: 25000,
  pingTimeout: 20000,
})

// Redis adapter for horizontal scaling
const pubClient = createClient({ url: process.env.REDIS_URL })
const subClient = pubClient.duplicate()

Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
  io.adapter(createAdapter(pubClient, subClient))
  console.log('Socket.io Redis adapter connected')
})

// Auth middleware — validates JWT on every connection
io.use(authMiddleware)

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id} | User: ${socket.data.userId}`)

  // Auto-join user's personal notification room
  socket.join(`user:${socket.data.userId}`)

  // Register domain handlers
  registerChatHandlers(io, socket)
  registerJobHandlers(io, socket)

  socket.on('disconnect', (reason) => {
    console.log(`Socket disconnected: ${socket.id} | Reason: ${reason}`)
  })
})

httpServer.listen(process.env.SOCKET_SERVER_PORT ?? 3001, () => {
  console.log(`Socket.io server running on port ${process.env.SOCKET_SERVER_PORT ?? 3001}`)
})

export { io }
```

### 14.3 Chat Handler with Content Filter

**File: `services/socket-server/src/handlers/chatHandlers.ts`**

The chat handler implements a **contact-sharing filter** that detects and blocks attempts to share phone numbers, WhatsApp links, or email addresses in chat — preventing platform disintermediation (users bypassing the platform to transact directly).

```typescript
import type { Server, Socket } from 'socket.io'
import type {
  ServerToClientEvents,
  ClientToServerEvents,
  InterServerEvents,
  SocketData,
  SendMessagePayload,
} from '@bukiebrainjobs/api-types'

// ── Contact-sharing filter patterns ──────────────────────────────────────────
// These patterns detect attempts to share contact info to bypass the platform.
const CONTACT_FILTER_PATTERNS: RegExp[] = [
  // Nigerian phone numbers (various formats)
  /(\+?234|0)[789]\d{9}/g,
  // WhatsApp links
  /wa\.me\//gi,
  /whatsapp\.com/gi,
  // Generic phone number patterns
  /\b0[789]\d{8,9}\b/g,
  // Email addresses
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  // Instagram handles (common bypass attempt)
  /@[a-zA-Z0-9._]{3,30}/g,
  // Telegram
  /t\.me\//gi,
]

const ALLOWED_PHASES = ['CONFIRMED', 'IN_PROGRESS', 'PENDING_COMPLETION']

function containsContactInfo(content: string): boolean {
  return CONTACT_FILTER_PATTERNS.some(pattern => {
    pattern.lastIndex = 0  // Reset regex state
    return pattern.test(content)
  })
}

function redactContactInfo(content: string): string {
  let redacted = content
  for (const pattern of CONTACT_FILTER_PATTERNS) {
    pattern.lastIndex = 0
    redacted = redacted.replace(pattern, '[contact info removed]')
  }
  return redacted
}

type IoType = Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>
type SocketType = Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>

export function registerChatHandlers(io: IoType, socket: SocketType) {
  // ... handler implementations
}
```

---


## 15. Zustand Store Implementations

All stores live in `packages/store/src/`. They use Zustand with the `immer` middleware for immutable state updates and `persist` middleware (with `AsyncStorage` on mobile and `localStorage` on web) for session persistence.

### 15.1 Auth Store

**File: `packages/store/src/authStore.ts`**

```typescript
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

export type UserRole = 'CLIENT' | 'TASKER' | 'ADMIN' | 'CORPORATE_CLIENT'

export interface AuthUser {
  id:           string
  phone:        string
  email?:       string
  firstName:    string
  lastName:     string
  avatarUrl?:   string
  role:         UserRole
  isVerified:   boolean
}

interface AuthState {
  user:         AuthUser | null
  accessToken:  string | null
  refreshToken: string | null
  isLoading:    boolean
  error:        string | null
}

interface AuthActions {
  setAuth:      (user: AuthUser, accessToken: string, refreshToken: string) => void
  setUser:      (user: Partial<AuthUser>) => void
  clearAuth:    () => void
  setLoading:   (loading: boolean) => void
  setError:     (error: string | null) => void
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    immer((set) => ({
      user:         null,
      accessToken:  null,
      refreshToken: null,
      isLoading:    false,
      error:        null,

      setAuth: (user, accessToken, refreshToken) =>
        set((state) => {
          state.user         = user
          state.accessToken  = accessToken
          state.refreshToken = refreshToken
          state.error        = null
        }),

      setUser: (partial) =>
        set((state) => {
          if (state.user) Object.assign(state.user, partial)
        }),

      clearAuth: () =>
        set((state) => {
          state.user         = null
          state.accessToken  = null
          state.refreshToken = null
        }),

      setLoading: (loading) =>
        set((state) => { state.isLoading = loading }),

      setError: (error) =>
        set((state) => { state.error = error }),
    })),
    {
      name: 'bbj-auth',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? localStorage : {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        }
      ),
      partialize: (state) => ({
        user:         state.user,
        accessToken:  state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
)
```

### 15.2 Job Store

**File: `packages/store/src/jobStore.ts`**

```typescript
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { JobStatus, JobType } from '@prisma/client'

export interface JobSummary {
  id:                  string
  title:               string
  status:              JobStatus
  jobType:             JobType
  scheduledStartAt:    string
  city:                string
  taskerRateKobo: number
  clientTotalKobo?:    number
  taskerName?:    string
  taskerAvatar?:  string
  taskerRating?:  number
  clientName?:         string
  skillNames:          string[]
}

export interface JobDetail extends JobSummary {
  description:         string
  address:             string
  latitude:            number
  longitude:           number
  estimatedHours?:     number
  actualStartAt?:      string
  actualEndAt?:        string
  beforePhotoUrls:     string[]
  afterPhotoUrls:      string[]
  taskerId?:      string
  clientId:            string
}

interface JobState {
  jobs:          Record<string, JobDetail>
  jobList:       string[]
  activeJobId:   string | null
  isLoading:     boolean
  error:         string | null
  filters: {
    status?:     JobStatus
    city?:       string
    skillId?:    string
  }
}

interface JobActions {
  setJobs:       (jobs: JobDetail[]) => void
  upsertJob:     (job: JobDetail) => void
  updateStatus:  (jobId: string, status: JobStatus) => void
  setActiveJob:  (jobId: string | null) => void
  setFilters:    (filters: Partial<JobState['filters']>) => void
  setLoading:    (loading: boolean) => void
  setError:      (error: string | null) => void
  clearJobs:     () => void
}

export const useJobStore = create<JobState & JobActions>()(
  immer((set) => ({
    jobs:        {},
    jobList:     [],
    activeJobId: null,
    isLoading:   false,
    error:       null,
    filters:     {},

    setJobs: (jobs) =>
      set((state) => {
        state.jobs    = {}
        state.jobList = []
        for (const job of jobs) {
          state.jobs[job.id] = job
          state.jobList.push(job.id)
        }
      }),

    upsertJob: (job) =>
      set((state) => {
        state.jobs[job.id] = job
        if (!state.jobList.includes(job.id)) {
          state.jobList.unshift(job.id)
        }
      }),

    updateStatus: (jobId, status) =>
      set((state) => {
        if (state.jobs[jobId]) {
          state.jobs[jobId]!.status = status
        }
      }),

    setActiveJob:  (jobId) => set((state) => { state.activeJobId = jobId }),
    setFilters:    (filters) => set((state) => { Object.assign(state.filters, filters) }),
    setLoading:    (loading) => set((state) => { state.isLoading = loading }),
    setError:      (error) => set((state) => { state.error = error }),
    clearJobs:     () => set((state) => { state.jobs = {}; state.jobList = [] }),
  }))
)
```

### 15.3 Chat Store

**File: `packages/store/src/chatStore.ts`**

```typescript
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { ChatMessagePayload } from '@bukiebrainjobs/api-types'

interface ChatState {
  messagesByJob:  Record<string, ChatMessagePayload[]>
  typingByJob:    Record<string, string[]>  // jobId -> array of typing userIds
  unreadByJob:    Record<string, number>    // jobId -> unread count
  isConnected:    boolean
  connectionError: string | null
}

interface ChatActions {
  addMessage:       (jobId: string, message: ChatMessagePayload) => void
  setMessages:      (jobId: string, messages: ChatMessagePayload[]) => void
  setTyping:        (jobId: string, userId: string, isTyping: boolean) => void
  markRead:         (jobId: string) => void
  setConnected:     (connected: boolean) => void
  setConnectionError: (error: string | null) => void
}

export const useChatStore = create<ChatState & ChatActions>()(
  immer((set) => ({
    messagesByJob:   {},
    typingByJob:     {},
    unreadByJob:     {},
    isConnected:     false,
    connectionError: null,

    addMessage: (jobId, message) =>
      set((state) => {
        if (!state.messagesByJob[jobId]) state.messagesByJob[jobId] = []
        state.messagesByJob[jobId]!.push(message)
        state.unreadByJob[jobId] = (state.unreadByJob[jobId] ?? 0) + 1
      }),

    setMessages: (jobId, messages) =>
      set((state) => { state.messagesByJob[jobId] = messages }),

    setTyping: (jobId, userId, isTyping) =>
      set((state) => {
        if (!state.typingByJob[jobId]) state.typingByJob[jobId] = []
        const typing = state.typingByJob[jobId]!
        if (isTyping && !typing.includes(userId)) {
          typing.push(userId)
        } else if (!isTyping) {
          state.typingByJob[jobId] = typing.filter(id => id !== userId)
        }
      }),

    markRead: (jobId) =>
      set((state) => { state.unreadByJob[jobId] = 0 }),

    setConnected: (connected) =>
      set((state) => { state.isConnected = connected }),

    setConnectionError: (error) =>
      set((state) => { state.connectionError = error }),
  }))
)
```

---


## 16. Smile Identity Integration (NIN + BVN + Liveness)

Smile Identity is Nigeria's leading identity verification provider, offering NIN (National Identity Number) lookup, BVN (Bank Verification Number) validation, and selfie liveness checks via a single API. [1] BukieBrainJobs uses Smile Identity to verify every Tasker before they can accept jobs.

### 16.1 Verification Flow

The verification process is **asynchronous** — the client initiates a verification job, Smile Identity processes it (typically 30-120 seconds), and posts the result to BukieBrainJobs' webhook endpoint. The Tasker's `verificationStatus` is updated accordingly.

```
Tasker App                Next.js API              Smile Identity
      │                             │                          │
      │  POST /api/verification/    │                          │
      │  initiate                   │                          │
      │ ─────────────────────────► │                          │
      │                             │  POST /smile/v2/         │
      │                             │  id_verification         │
      │                             │  ────────────────────────►│
      │                             │                          │
      │  { jobId, uploadUrl }       │  { job_id, upload_url }  │
      │ ◄───────────────────────── │ ◄────────────────────────│
      │                             │                          │
      │  [User uploads selfie to    │                          │
      │   signed Smile upload URL]  │                          │
      │ ─────────────────────────────────────────────────────►│
      │                             │                          │
      │                             │  [Smile processes:       │
      │                             │   NIN lookup,            │
      │                             │   BVN match,             │
      │                             │   liveness check]        │
      │                             │                          │
      │                             │  POST /api/verification/ │
      │                             │  webhook                 │
      │                             │ ◄────────────────────────│
      │                             │                          │
      │  [Push notification:        │  [Update DB status]      │
      │   "Verification complete"]  │                          │
      │ ◄───────────────────────── │                          │
```

### 16.2 Initiation Endpoint

**File: `apps/web/app/api/verification/initiate/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@bukiebrainjobs/db'
import { getAuthUser } from '@/lib/auth'
import type { ApiResponse } from '@bukiebrainjobs/api-types'

const InitiateVerificationSchema = z.object({
  ninNumber:  z.string().length(11).regex(/^\d{11}$/),
  bvnNumber:  z.string().length(11).regex(/^\d{11}$/),
  firstName:  z.string().min(2),
  lastName:   z.string().min(2),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),  // YYYY-MM-DD
})

export async function POST(req: NextRequest) {
  // Implementation: initiates Smile verification, returns job_id and upload_url
}
```

### 16.3 Webhook Handler

**File: `apps/web/app/api/verification/webhook/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@bukiebrainjobs/db'
import { sendPushNotification } from '@/lib/notifications'

// Smile Identity webhook payload (simplified)
interface SmileWebhookPayload {
  job_id:           string
  result_code:      string   // "0810" = pass, "0811" = fail, "0812" = review
  result_text:      string
  partner_params: {
    user_id:        string
    job_id:         string
    job_type:       number
  }
  actions: {
    Verify_ID_Number:    string  // "Verified" | "Not Verified"
    Return_Personal_Info: string
    Human_Review_Compare: string
    Liveness_Check:      string
  }
  smile_job_id:     string
  timestamp:        string
}

export async function POST(req: NextRequest) {
  const payload: SmileWebhookPayload = await req.json()

  // Verify webhook signature (Smile uses HMAC-SHA256)
  const signature = req.headers.get('smile-signature')
  if (!verifySmileSignature(await req.text(), signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const userId = payload.partner_params.user_id
  const resultCode = payload.result_code

  // "0810" = all checks passed
  const isVerified = resultCode === '0810' &&
    payload.actions.Verify_ID_Number === 'Verified' &&
    payload.actions.Liveness_Check === 'Passed'

  const newStatus = isVerified ? 'VERIFIED' : 'FAILED'

  await prisma.taskerProfile.update({
    where: { userId },
    data: {
      verificationStatus: newStatus,
      verifiedAt:         isVerified ? new Date() : null,
    },
  })

  // Award ID_VERIFIED badge if passed
  if (isVerified) {
    await prisma.taskerBadge.upsert({
      where: {
        taskerProfileId_badgeType: {
          taskerProfileId: (await prisma.taskerProfile.findUnique({
            where: { userId }, select: { id: true }
          }))!.id,
          badgeType: 'ID_VERIFIED',
        },
      },
      create: {
        taskerProfile: { connect: { userId } },
        badgeType: 'ID_VERIFIED',
      },
      update: {},
    })
  }

  // Push notification to Tasker
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { fcmToken: true, firstName: true },
  })

  if (user?.fcmToken) {
    await sendPushNotification({
      token:  user.fcmToken,
      title:  isVerified ? 'Verification Successful!' : 'Verification Failed',
      body:   isVerified
        ? 'Your identity has been verified. You can now accept jobs!'
        : 'Your verification could not be completed. Please try again or contact support.',
      data: { type: 'VERIFICATION_COMPLETE', status: newStatus },
    })
  }

  return NextResponse.json({ received: true })
}

function verifySmileSignature(body: string, signature: string | null): boolean {
  if (!signature) return false
  const { createHmac } = require('crypto')
  const expected = createHmac('sha256', process.env.SMILE_API_KEY!)
    .update(body)
    .digest('hex')
  return signature === expected
}
```

---


## 17. Paystack Integration (Split Payments)

Paystack's **Split Payment** API allows BukieBrainJobs to automatically route a portion of each transaction to the Tasker's registered bank account (via a Paystack subaccount) and retain the platform fee. [2] This is the core financial mechanism of the marketplace.

### 17.1 Paystack Split Payment Architecture

Every Tasker who wants to receive payouts must have a **Paystack subaccount** created on their behalf. The subaccount links to their Nigerian bank account. When a client pays for a job, Paystack automatically splits the transaction: the Tasker's share goes to their subaccount, and the platform's share stays in the main BukieBrainJobs Paystack account.

```
Client pays N11,750 (N10,000 job + 17.5% fees)
                │
                ▼
        Paystack processes charge
                │
        ┌───────┴──────────┐
        │                  │
        ▼                  ▼
  Tasker          Platform
  Subaccount           Account
  N10,000              N1,750
  (85.1%)              (14.9%)
```

### 17.2 Tasker Subaccount Creation

When a Tasker adds their bank account details, BukieBrainJobs creates a Paystack subaccount via the API.

**File: `apps/web/lib/services/paystackService.ts`**

```typescript
const PAYSTACK_BASE = 'https://api.paystack.co'

const paystackHeaders = {
  Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
  'Content-Type': 'application/json',
}

export async function createSubaccount(params: {
  businessName:   string
  bankCode:       string
  accountNumber:  string
  percentageCharge: number
}): Promise<{ subaccountCode: string }> {
  const res = await fetch(`${PAYSTACK_BASE}/subaccount`, {
    method: 'POST',
    headers: paystackHeaders,
    body: JSON.stringify({
      business_name:      params.businessName,
      settlement_bank:    params.bankCode,
      account_number:     params.accountNumber,
      percentage_charge:  params.percentageCharge,
      description:        'BukieBrainJobs Tasker Account',
    }),
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(`Paystack subaccount creation failed: ${err.message}`)
  }

  const data = await res.json()
  return { subaccountCode: data.data.subaccount_code }
}

export async function initializeTransaction(params: {
  email:               string
  amountKobo:          number
  reference:           string
  jobId:               string
  taskerSubaccountCode: string
  taskerShareKobo: number
  callbackUrl:         string
  metadata:            Record<string, unknown>
}): Promise<{
  authorizationUrl: string
  accessCode:       string
  reference:        string
}> {
  const res = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
    method: 'POST',
    headers: paystackHeaders,
    body: JSON.stringify({
      email,
      amount:       amountKobo,
      reference,
      callback_url: callbackUrl,
      metadata: {
        ...metadata,
        job_id:   params.jobId,
        custom_fields: [
          { display_name: 'Job ID', variable_name: 'job_id', value: params.jobId },
        ],
      },
      split: {
        type:         'flat',
        bearer_type:  'account',
        subaccounts: [
          {
            subaccount: params.taskerSubaccountCode,
            share:      params.taskerShareKobo,
          },
        ],
      },
    }),
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(`Paystack transaction init failed: ${err.message}`)
  }

  const data = await res.json()
  return {
    authorizationUrl: data.data.authorization_url,
    accessCode:       data.data.access_code,
    reference:        data.data.reference,
  }
}

export async function verifyTransaction(reference: string): Promise<{
  status:          string
  amount:          number
  paidAt:          string
  channel:         string
  gatewayResponse: string
}> {
  const res = await fetch(`${PAYSTACK_BASE}/transaction/verify/${reference}`, {
    headers: paystackHeaders,
  })
  if (!res.ok) throw new Error('Paystack verification failed')
  const data = await res.json()
  return {
    status:          data.data.status,
    amount:          data.data.amount,
    paidAt:          data.data.paid_at,
    channel:         data.data.channel,
    gatewayResponse: data.data.gateway_response,
  }
}
```

### 17.3 Payment Initiation Endpoint

**File: `apps/web/app/api/payments/initiate/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@bukiebrainjobs/db'
import { getAuthUser } from '@/lib/auth'
import { initializeTransaction } from '@/lib/services/paystackService'
import { calculatePricing } from '@bukiebrainjobs/utils'
import { nanoid } from 'nanoid'

const InitiatePaymentSchema = z.object({
  jobId: z.string().uuid(),
})

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req)
  if (!user) return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED' } }, { status: 401 })

  const body = await req.json()
  const parsed = InitiatePaymentSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ success: false, error: { code: 'VALIDATION_ERROR' } }, { status: 400 })

  const { jobId } = parsed.data

  // Fetch job with Tasker subaccount
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: {
      clientProfile: { include: { user: true } },
      taskerProfile: { select: { paystackSubaccountCode: true } },
    },
  })

  if (!job) return NextResponse.json({ success: false, error: { code: 'JOB_NOT_FOUND' } }, { status: 404 })
  if (job.clientProfile.userId !== user.id) return NextResponse.json({ success: false, error: { code: 'FORBIDDEN' } }, { status: 403 })

  if (!job.taskerProfile?.paystackSubaccountCode) {
    return NextResponse.json({ success: false, error: { code: 'TASKER_NO_SUBACCOUNT' } }, { status: 422 })
  }

  // Calculate final pricing
  const actualHours = job.actualEndAt && job.actualStartAt
    ? (new Date(job.actualEndAt).getTime() - new Date(job.actualStartAt).getTime()) / 3_600_000
    : (job.estimatedHours?.toNumber() ?? 1)

  const pricing = calculatePricing(job.taskerRateKobo, actualHours)
  const reference = `bbj_${nanoid(16)}`

  // Create payment record
  const payment = await prisma.payment.create({
    data: {
      jobId,
      paystackReference:          reference,
      amountKobo:                 pricing.clientTotalKobo,
      taskerShareKobo:       pricing.taskerTotalKobo,
      platformShareKobo:          pricing.platformEarningsKobo,
      taskerSubaccountCode:  job.taskerProfile.paystackSubaccountCode,
      status:                     'PENDING',
    },
  })

  // Initialize Paystack transaction
  const txn = await initializeTransaction({
    email:                     job.clientProfile.user.email ?? `${user.id}@bukiebrainjobs.com`,
    amountKobo:                pricing.clientTotalKobo,
    reference,
    jobId,
    taskerSubaccountCode: job.taskerProfile.paystackSubaccountCode,
    taskerShareKobo:      pricing.taskerTotalKobo,
    callbackUrl:               `${process.env.NEXTAUTH_URL}/jobs/${jobId}?payment=complete`,
    metadata: {
      payment_id:    payment.id,
      job_id:        jobId,
      tasker_share_kobo: pricing.taskerTotalKobo,
      platform_share_kobo:    pricing.platformEarningsKobo,
    },
  })

  // Update payment with access code
  await prisma.payment.update({
    where: { id: payment.id },
    data: { paystackAccessCode: txn.accessCode },
  })

  return NextResponse.json({
    success: true,
    data: {
      authorizationUrl: txn.authorizationUrl,
      accessCode:       txn.accessCode,
      reference:        txn.reference,
      pricing,
    },
  })
}
```

### 17.4 Paystack Webhook Handler

**File: `apps/web/app/api/payments/webhook/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createHmac } from 'crypto'
import { prisma } from '@bukiebrainjobs/db'
import { sendPushNotification } from '@/lib/notifications'
import { publishJobEvent } from '@/lib/redis'

// Disable body parsing — we need raw body for HMAC verification
export const config = { api: { bodyParser: false } }

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const signature = req.headers.get('x-paystack-signature')

  // Verify HMAC-SHA512 signature
  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 401 })
  }

  const expectedSignature = createHmac('sha512', process.env.PAYSTACK_SECRET_KEY!)
    .update(rawBody)
    .digest('hex')

  if (signature !== expectedSignature) {
    console.error('Paystack webhook: Invalid signature')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const event = JSON.parse(rawBody) as PaystackWebhookEvent

  // Idempotency check
  const idempotencyKey = event.data.id?.toString() ?? event.data.reference
  const existing = await prisma.paymentWebhookEvent.findUnique({
    where: { idempotencyKey },
  })
  if (existing) {
    return NextResponse.json({ received: true, duplicate: true })
  }

  // Route to event handler
  try {
    switch (event.event) {
      case 'charge.success':
        await handleChargeSuccess(event.data)
        break
      case 'transfer.success':
        await handleTransferSuccess(event.data)
        break
      case 'transfer.failed':
        await handleTransferFailed(event.data)
        break
      default:
        console.log(`Unhandled Paystack event: ${event.event}`)
    }

    // Record processed event
    const payment = await prisma.payment.findUnique({
      where: { paystackReference: event.data.reference },
    })
    if (payment) {
      await prisma.paymentWebhookEvent.create({
        data: {
          paymentId:      payment.id,
          event:          event.event,
          payload:        event as any,
          idempotencyKey,
        },
      })
    }
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}

async function handleChargeSuccess(data: PaystackChargeData) {
  const { reference, amount, metadata } = data

  const payment = await prisma.payment.findUnique({
    where: { paystackReference: reference },
    include: { job: { include: { taskerProfile: { include: { user: true } }, clientProfile: { include: { user: true } } } } },
  })

  if (!payment) {
    console.error(`Payment not found for reference: ${reference}`)
    return
  }

  // Update payment status
  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status:          'CAPTURED',
      paystackTransactionId: data.id?.toString(),
      capturedAt:      new Date(),
    },
  })

  // Transition job to PAID
  await prisma.job.update({
    where: { id: payment.jobId },
    data: { status: 'PAID' },
  })

  // Record status history
  await prisma.jobStatusHistory.create({
    data: {
      jobId:      payment.jobId,
      fromStatus: 'COMPLETED',
      toStatus:   'PAID',
      reason:     'Payment captured via Paystack',
    },
  })

  // Update Tasker earnings stats
  await prisma.taskerProfile.update({
    where: { id: payment.job.taskerProfileId! },
    data: {
      totalEarnings: { increment: payment.taskerShareKobo / 100 },
    },
  })

  // Publish real-time event via Redis
  await publishJobEvent(payment.jobId, 'PAID')

  // Push notifications
  const bwFcmToken = payment.job.taskerProfile?.user.fcmToken
  const clientFcmToken = payment.job.clientProfile.user.fcmToken

  if (bwFcmToken) {
    await sendPushNotification({
      token: bwFcmToken,
      title: 'Payment Received!',
      body:  `You've been paid N${(payment.taskerShareKobo / 100).toLocaleString('en-NG')} for your job.`,
      data:  { type: 'PAYMENT_RECEIVED', jobId: payment.jobId },
    })
  }

  if (clientFcmToken) {
    await sendPushNotification({
      token: clientFcmToken,
      title: 'Payment Successful',
      body:  'Your payment has been processed. Please leave a review!',
      data:  { type: 'PAYMENT_CAPTURED', jobId: payment.jobId },
    })
  }
}

async function handleTransferSuccess(data: any) {
  await prisma.payment.updateMany({
    where: { paystackReference: data.reference },
    data: { status: 'SPLIT_COMPLETE', splitCompletedAt: new Date() },
  })
}

async function handleTransferFailed(data: any) {
  console.error('Paystack transfer failed:', data)
}

// Types
interface PaystackWebhookEvent {
  event: string
  data:  PaystackChargeData
}

interface PaystackChargeData {
  id?:        number
  reference:  string
  amount:     number
  status:     string
  metadata?:  Record<string, unknown>
}
```

---


## 18. OTP Authentication via Termii

Termii is a Nigerian SMS gateway that provides significantly lower per-SMS costs than Twilio for Nigerian phone numbers. [3]

**File: `apps/web/lib/services/termiiService.ts`**

```typescript
const TERMII_BASE = 'https://v3.api.termii.com/api'

export async function sendOtp(phone: string): Promise<{ pinId: string }> {
  const res = await fetch(`${TERMII_BASE}/sms/otp/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key:       process.env.TERMII_API_KEY,
      message_type:  'NUMERIC',
      to:            phone,
      from:          process.env.TERMII_SENDER_ID,
      channel:       'generic',
      pin_attempts:  3,
      pin_time_to_live: 10,
      pin_length:    6,
      pin_placeholder: '< 1234 >',
      message_text:  'Your BukieBrainJobs verification code is < 1234 >. Valid for 10 minutes.',
      pin_type:      'NUMERIC',
    }),
  })

  if (!res.ok) throw new Error('Failed to send OTP')
  const data = await res.json()
  return { pinId: data.pinId }
}

export async function verifyOtp(pinId: string, pin: string): Promise<boolean> {
  const res = await fetch(`${TERMII_BASE}/sms/otp/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: process.env.TERMII_API_KEY,
      pin_id:  pinId,
      pin,
    }),
  })

  if (!res.ok) return false
  const data = await res.json()
  return data.verified === 'True'
}
```

---


## 19. Infrastructure Architecture

BukieBrainJobs uses a **serverless-first** infrastructure strategy for the web layer (Vercel) combined with managed persistent services for the database, cache, and real-time server. This minimizes operational overhead while maintaining production-grade reliability.

```
                        ┌─────────────────────────────────────────────┐
                        │              PRODUCTION INFRASTRUCTURE       │
                        └─────────────────────────────────────────────┘

  ┌──────────────┐     ┌──────────────────────────────────────────────┐
  │  Web Client  │────▶│              Vercel Edge Network             │
  │  (Browser/   │     │  (Next.js 14 App Router + Edge Functions)    │
  │   PWA)       │     │  Region: Frankfurt (closest to Lagos)        │
  └──────────────┘     └──────────────────────┬───────────────────────┘
                                              │
  ┌──────────────┐     ┌──────────────────────▼───────────────────────┐
  │  Mobile App  │────▶│          Railway / Render (Node.js)          │
  │  (Expo RN)   │     │  Socket.io Server (persistent process)       │
  └──────────────┘     │  Auto-scales 1-5 instances                   │
                        └──────────────────────┬───────────────────────┘
                                              │
                        ┌─────────────────────▼───────────────────────┐
                        │              Shared Data Layer               │
                        │  ┌──────────────┐  ┌──────────────────────┐ │
                        │  │  Supabase    │  │  Upstash Redis       │ │
                        │  │  PostgreSQL  │  │  (Serverless Redis)  │ │
                        │  │  + PgBouncer │  │  Sessions, Cache,    │ │
                        │  └──────────────┘  └──────────────────────┘ │
                        └──────────────────────────────────────────────┘
                                              │
                        ┌─────────────────────▼───────────────────────┐
                        │            External Services                 │
                        │  Paystack │ Smile Identity │ Termii          │
                        │  Cloudinary │ Resend │ PostHog │ Sentry      │
                        └──────────────────────────────────────────────┘
```

### 19.1 Service Cost Estimates (MVP Phase)

| Service | Plan | Est. Monthly Cost |
|---|---|---|
| Vercel | Pro | $20/month |
| Supabase | Pro | $25/month |
| Upstash Redis | Pay-per-use | ~$5-15/month |
| Railway (Socket.io) | Starter | $5-20/month |
| Cloudinary | Free tier -> Paid | $0-89/month |
| Resend | Free tier (3,000 emails) | $0-20/month |
| Sentry | Free tier (5,000 errors) | $0 |
| PostHog | Free tier (1M events) | $0 |
| **Total MVP** | | **~$55-190/month** |

---


## 20. PWA Configuration

The Next.js web app is configured as a Progressive Web App using `next-pwa` (Serwist). This enables installability on Android and iOS home screens, offline capability for cached pages, and push notifications via the Web Push API.

### 20.1 PWA Manifest

**File: `apps/web/public/manifest.json`**

```json
{
  "name": "BukieBrainJobs",
  "short_name": "BukieBrain",
  "description": "Nigeria's trusted marketplace for everyday tasks",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#FFFFFF",
  "theme_color": "#16A34A",
  "orientation": "portrait-primary",
  "icons": [
    { "src": "/icons/icon-72x72.png",   "sizes": "72x72",   "type": "image/png", "purpose": "any maskable" },
    { "src": "/icons/icon-96x96.png",   "sizes": "96x96",   "type": "image/png", "purpose": "any maskable" },
    { "src": "/icons/icon-128x128.png", "sizes": "128x128", "type": "image/png", "purpose": "any maskable" },
    { "src": "/icons/icon-144x144.png", "sizes": "144x144", "type": "image/png", "purpose": "any maskable" },
    { "src": "/icons/icon-152x152.png", "sizes": "152x152", "type": "image/png", "purpose": "any maskable" },
    { "src": "/icons/icon-192x192.png", "sizes": "192x192", "type": "image/png", "purpose": "any maskable" },
    { "src": "/icons/icon-384x384.png", "sizes": "384x384", "type": "image/png", "purpose": "any maskable" },
    { "src": "/icons/icon-512x512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
  ],
  "screenshots": [
    { "src": "/screenshots/home.png", "sizes": "390x844", "type": "image/png", "form_factor": "narrow" }
  ],
  "categories": ["productivity", "utilities"],
  "lang": "en-NG"
}
```

### 20.2 Next.js PWA Configuration

**File: `apps/web/next.config.js`**

```javascript
const withSerwist = require('@serwist/next').default({
  swSrc: 'app/sw.ts',
  swDest: 'public/sw.js',
  disable: process.env.NODE_ENV === 'development',
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@bukiebrainjobs/ui',
    '@bukiebrainjobs/store',
    '@bukiebrainjobs/utils',
    '@bukiebrainjobs/api-types',
    '@bukiebrainjobs/validation',
  ],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },
}

module.exports = withSerwist(nextConfig)
```

### 20.3 Service Worker

**File: `apps/web/app/sw.ts`**

```typescript
import { defaultCache } from '@serwist/next/worker'
import type { PrecacheEntry } from '@serwist/precaching'
import { installSerwist } from '@serwist/sw'

declare const self: ServiceWorkerGlobalScope & {
  __SW_MANIFEST: (PrecacheEntry | string)[]
}

installSerwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    {
      matcher: /^https:\/\/bukiebrainjobs\.com\/api\/skills/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'skills-cache',
        expiration: { maxAgeSeconds: 86400 },
      },
    },
    {
      matcher: /^https:\/\/res\.cloudinary\.com/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'image-cache',
        expiration: { maxEntries: 200, maxAgeSeconds: 604800 },
      },
    },
    ...defaultCache,
  ],
})
```

---


## 21. Expo Mobile Configuration

### 21.1 app.json

**File: `apps/mobile/app.json`**

```json
{
  "expo": {
    "name": "BukieBrainJobs",
    "slug": "bukiebrainjobs",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#16A34A"
    },
    "assetBundlePatterns": ["**/*"],
    "ios": {
      "supportsTablet": false,
      "bundleIdentifier": "com.bukiebrainjobs.app",
      "buildNumber": "1",
      "infoPlist": {
        "NSLocationWhenInUseUsageDescription": "BukieBrainJobs needs your location to find nearby Taskers and verify job check-ins.",
        "NSLocationAlwaysAndWhenInUseUsageDescription": "BukieBrainJobs needs background location to track Tasker arrival.",
        "NSCameraUsageDescription": "BukieBrainJobs needs camera access to take job evidence photos.",
        "NSPhotoLibraryUsageDescription": "BukieBrainJobs needs photo library access to upload job evidence."
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#16A34A"
      },
      "package": "com.bukiebrainjobs.app",
      "versionCode": 1,
      "permissions": [
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION",
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE",
        "RECEIVE_BOOT_COMPLETED",
        "VIBRATE"
      ],
      "googleServicesFile": "./google-services.json"
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "plugins": [
      "expo-router",
      "expo-notifications",
      ["expo-location", { "locationAlwaysAndWhenInUsePermission": "Allow BukieBrainJobs to use your location." }],
      ["expo-camera", { "cameraPermission": "Allow BukieBrainJobs to access your camera." }],
      "expo-secure-store",
      "expo-updates"
    ],
    "experiments": {
      "typedRoutes": true
    },
    "updates": {
      "url": "https://u.expo.dev/your-project-id"
    },
    "runtimeVersion": {
      "policy": "appVersion"
    },
    "extra": {
      "eas": { "projectId": "your-eas-project-id" },
      "router": { "origin": false }
    }
  }
}
```

### 21.2 EAS Build Configuration

**File: `apps/mobile/eas.json`**

```json
{
  "cli": { "version": ">= 10.0.0" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "env": {
        "EXPO_PUBLIC_API_URL": "http://localhost:3000/api",
        "EXPO_PUBLIC_SOCKET_URL": "http://localhost:3001"
      }
    },
    "preview": {
      "distribution": "internal",
      "channel": "preview",
      "env": {
        "EXPO_PUBLIC_API_URL": "https://staging.bukiebrainjobs.com/api",
        "EXPO_PUBLIC_SOCKET_URL": "https://socket-staging.bukiebrainjobs.com"
      }
    },
    "production": {
      "autoIncrement": true,
      "channel": "production",
      "env": {
        "EXPO_PUBLIC_API_URL": "https://bukiebrainjobs.com/api",
        "EXPO_PUBLIC_SOCKET_URL": "https://socket.bukiebrainjobs.com"
      }
    }
  },
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./google-play-service-account.json",
        "track": "internal"
      },
      "ios": {
        "appleId": "developer@bukiebrainjobs.com",
        "ascAppId": "your-app-store-connect-app-id",
        "appleTeamId": "your-apple-team-id"
      }
    }
  }
}
```

---


## 22. CI/CD Pipeline

### 22.1 GitHub Actions — CI (Every PR)

**File: `.github/workflows/ci.yml`**

```yaml
name: CI

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main, develop]

env:
  TURBO_TOKEN: ${{ secrets.TURBO_TOKEN }}
  TURBO_TEAM:  ${{ secrets.TURBO_TEAM }}

jobs:
  ci:
    name: Lint, Type-Check, Test
    runs-on: ubuntu-latest
    timeout-minutes: 20

    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 2

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 9

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Generate Prisma client
        run: pnpm turbo db:generate

      - name: Type check
        run: pnpm turbo type-check

      - name: Lint
        run: pnpm turbo lint

      - name: Run tests
        run: pnpm turbo test
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
          REDIS_URL:    redis://localhost:6379

    services:
      postgres:
        image: postgis/postgis:16-3.4
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB:       test
        ports: ['5432:5432']
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

      redis:
        image: redis:7-alpine
        ports: ['6379:6379']
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
```

### 22.2 GitHub Actions — Web Deploy (Vercel)

**File: `.github/workflows/deploy-web.yml`**

```yaml
name: Deploy Web

on:
  push:
    branches: [main]

jobs:
  deploy:
    name: Deploy to Vercel Production
    runs-on: ubuntu-latest
    environment: production

    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with: { version: 9 }

      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: pnpm }

      - run: pnpm install --frozen-lockfile

      - name: Run database migrations
        run: pnpm --filter @bukiebrainjobs/db exec prisma migrate deploy
        env:
          DIRECT_URL: ${{ secrets.DIRECT_URL }}

      - name: Deploy to Vercel
        run: |
          pnpm dlx vercel --prod --token=${{ secrets.VERCEL_TOKEN }} \
            --scope=${{ secrets.VERCEL_ORG_ID }} \
            --yes
        env:
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
          VERCEL_ORG_ID:     ${{ secrets.VERCEL_ORG_ID }}
```

---


## 23. Security Architecture

### 23.1 Authentication & Authorization

BukieBrainJobs uses a **JWT-based auth strategy** with short-lived access tokens (15 minutes) and long-lived refresh tokens (30 days) stored in HttpOnly cookies on web and Expo SecureStore on mobile.

```typescript
// apps/web/lib/auth.ts
import { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET)

export interface AuthUser {
  id:    string
  role:  string
  phone: string
}

export async function getAuthUser(req: NextRequest): Promise<AuthUser | null> {
  const authHeader = req.headers.get('authorization')
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.slice(7)
    : req.cookies.get('access_token')?.value

  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return {
      id:    payload.sub as string,
      role:  payload.role as string,
      phone: payload.phone as string,
    }
  } catch {
    return null
  }
}

export function requireRole(user: AuthUser | null, ...roles: string[]) {
  if (!user) throw new Error('UNAUTHORIZED')
  if (!roles.includes(user.role)) throw new Error('FORBIDDEN')
}
```

### 23.2 Rate Limiting

All public endpoints are rate-limited using Redis-backed counters. The middleware runs at the Vercel Edge layer.

```typescript
// apps/web/middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis:     Redis.fromEnv(),
  limiter:   Ratelimit.slidingWindow(20, '10 s'),
  analytics: true,
})

const RATE_LIMITED_PATHS = [
  '/api/auth/request-otp',
  '/api/auth/verify-otp',
  '/api/match',
  '/api/jobs',
]

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname

  if (RATE_LIMITED_PATHS.some(p => path.startsWith(p))) {
    const ip = req.ip ?? req.headers.get('x-forwarded-for') ?? 'unknown'
    const { success, limit, remaining, reset } = await ratelimit.limit(ip)

    if (!success) {
      return NextResponse.json(
        { success: false, error: { code: 'RATE_LIMITED', message: 'Too many requests' } },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit':     limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset':     reset.toString(),
            'Retry-After':           Math.ceil((reset - Date.now()) / 1000).toString(),
          },
        }
      )
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/api/:path*'],
}
```

### 23.3 Data Encryption

Sensitive fields (NIN, BVN, bank account numbers) are encrypted at rest using AES-256-GCM before storage in PostgreSQL. The encryption key is stored in the environment and never in the database.

```typescript
// apps/web/lib/crypto.ts
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const KEY = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex')

export function encrypt(plaintext: string): string {
  const iv  = randomBytes(12)
  const cipher = createCipheriv(ALGORITHM, KEY, iv)
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`
}

export function decrypt(ciphertext: string): string {
  const [ivHex, authTagHex, encryptedHex] = ciphertext.split(':')
  const iv       = Buffer.from(ivHex!, 'hex')
  const authTag  = Buffer.from(authTagHex!, 'hex')
  const encrypted = Buffer.from(encryptedHex!, 'hex')
  const decipher = createDecipheriv(ALGORITHM, KEY, iv)
  decipher.setAuthTag(authTag)
  return decipher.update(encrypted) + decipher.final('utf8')
}
```

---


## 24. Background Job Queue (BullMQ)

Async tasks that must not block API responses are processed via BullMQ queues backed by Redis.

**File: `apps/web/lib/queues/index.ts`**

```typescript
import { Queue, Worker } from 'bullmq'
import { Redis } from 'ioredis'

const connection = new Redis(process.env.REDIS_URL!, { maxRetriesPerRequest: null })

export const notificationQueue = new Queue('notifications', { connection })
export const verificationQueue = new Queue('verification', { connection })
export const payoutQueue        = new Queue('payouts', { connection })
export const reminderQueue      = new Queue('reminders', { connection })

export type NotificationJob =
  | { type: 'push';  token: string; title: string; body: string; data?: Record<string, unknown> }
  | { type: 'email'; to: string; template: string; variables: Record<string, unknown> }
  | { type: 'sms';   phone: string; message: string }

export type ReminderJob =
  | { type: 'job_start_reminder';  jobId: string; userId: string; minutesBefore: number }
  | { type: 'review_reminder';     jobId: string; clientId: string }
  | { type: 'payment_reminder';    jobId: string; clientId: string }
  | { type: 'job_auto_expire';     jobId: string }
  | { type: 'completion_auto_confirm'; jobId: string }

export async function scheduleJobReminders(jobId: string, scheduledStartAt: Date) {
  const now = Date.now()
  const startTime = scheduledStartAt.getTime()

  // 24-hour reminder
  const reminder24h = startTime - 24 * 60 * 60 * 1000
  if (reminder24h > now) {
    await reminderQueue.add('job_start_reminder', { type: 'job_start_reminder', jobId, userId: '', minutesBefore: 1440 }, { delay: reminder24h - now })
  }

  // 1-hour reminder
  const reminder1h = startTime - 60 * 60 * 1000
  if (reminder1h > now) {
    await reminderQueue.add('job_start_reminder', { type: 'job_start_reminder', jobId, userId: '', minutesBefore: 60 }, { delay: reminder1h - now })
  }

  // Auto-expire if no Tasker accepts within 2 hours of posting
  await reminderQueue.add('job_auto_expire', { type: 'job_auto_expire', jobId }, { delay: 2 * 60 * 60 * 1000 })

  // Auto-confirm completion after 24 hours
  const autoConfirmDelay = startTime + 8 * 60 * 60 * 1000 + 24 * 60 * 60 * 1000
  await reminderQueue.add('completion_auto_confirm', { type: 'completion_auto_confirm', jobId }, { delay: autoConfirmDelay - now })
}
```

---


## 25. NativeWind v4 + Design Tokens

The shared design system in `packages/ui` defines the brand tokens that both Tailwind CSS (web) and NativeWind v4 (mobile) consume.

**File: `packages/ui/tailwind.config.ts`**

```typescript
import type { Config } from 'tailwindcss'

export const brandColors = {
  primary: {
    50:  '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
  secondary: {
    50:  '#fffbeb',
    100: '#fef3c7',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
  },
  neutral: {
    50:  '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
}

const config: Config = {
  content: [
    './src/**/*.{ts,tsx}',
    '../../apps/web/**/*.{ts,tsx}',
    '../../apps/mobile/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: brandColors,
      fontFamily: {
        sans:  ['Inter', 'system-ui', 'sans-serif'],
        mono:  ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        'xl':  '12px',
        '2xl': '16px',
        '3xl': '24px',
      },
    },
  },
  plugins: [],
}

export default config
```

---


## 26. Testing Strategy

| Layer | Tool | What to Test |
|---|---|---|
| Unit | Vitest | Utility functions (matching algorithm, pricing, state transitions) |
| Integration | Vitest + Prisma test client | Service functions against a test database |
| API | Supertest + Next.js test utils | Route Handlers with mocked external services |
| E2E (Web) | Playwright | Critical user journeys: register, book job, pay |
| E2E (Mobile) | Maestro | Critical mobile flows: login, browse, accept job |
| Socket | Socket.io test client | Chat events, job status broadcasts |

**Critical test cases that must pass before any production deploy:**

1. `canTransition()` — all valid and invalid state transitions
2. `calculatePricing()` — fee calculations with edge cases (fractional hours, minimum rates)
3. `scoreCandidate()` — matching algorithm with all weight combinations
4. `containsContactInfo()` — chat filter with Nigerian phone number formats
5. Paystack webhook HMAC verification — valid and tampered signatures
6. Smile Identity webhook — verified, failed, and review result codes
7. OTP rate limiting — 3 attempts per phone per 10 minutes
8. Job creation -> Tasker acceptance -> check-in -> completion -> payment full flow

---


## 27. Secrets Management

All secrets are stored in GitHub Actions Secrets for CI/CD and in Vercel Environment Variables for the web app. The following secrets must be configured before any deployment:

| Secret Name | Where Used | Notes |
|---|---|---|
| `DATABASE_URL` | Vercel, CI | PgBouncer connection string |
| `DIRECT_URL` | CI (migrations only) | Direct PostgreSQL connection |
| `REDIS_URL` | Vercel, Railway | Upstash Redis URL |
| `NEXTAUTH_SECRET` | Vercel | Min 32 chars, random |
| `JWT_SECRET` | Vercel, Railway | Min 32 chars, random |
| `ENCRYPTION_KEY` | Vercel | 32-byte hex for AES-256 |
| `PAYSTACK_SECRET_KEY` | Vercel | `sk_live_...` |
| `PAYSTACK_WEBHOOK_SECRET` | Vercel | From Paystack dashboard |
| `SMILE_PARTNER_ID` | Vercel | From Smile Identity dashboard |
| `SMILE_API_KEY` | Vercel | From Smile Identity dashboard |
| `TERMII_API_KEY` | Vercel | From Termii dashboard |
| `CLOUDINARY_API_SECRET` | Vercel | From Cloudinary dashboard |
| `RESEND_API_KEY` | Vercel | From Resend dashboard |
| `EXPO_TOKEN` | GitHub Actions | From expo.dev account |
| `VERCEL_TOKEN` | GitHub Actions | From Vercel account |
| `TURBO_TOKEN` | GitHub Actions | From Vercel Remote Cache |

---

## References

[1]: https://docs.usesmileid.com/integration-options/web-api/identity-verification "Smile Identity — Identity Verification API Documentation"
[2]: https://paystack.com/docs/payments/split-payments/ "Paystack — Split Payments Documentation"
[3]: https://developers.termii.com/otp "Termii — OTP API Documentation"
[4]: https://docs.expo.dev/eas/ "Expo Application Services (EAS) Documentation"
[5]: https://turbo.build/repo/docs "Turborepo Documentation"
[6]: https://www.prisma.io/docs/orm/prisma-schema "Prisma Schema Reference"
[7]: https://socket.io/docs/v4/ "Socket.io v4 Documentation"
[8]: https://zustand.docs.pmnd.rs/ "Zustand Documentation"
[9]: https://www.nativewind.dev/v4/overview "NativeWind v4 Documentation"
[10]: https://docs.serwist.pages.dev/ "Serwist (next-pwa successor) Documentation"
[11]: https://bullmq.io/ "BullMQ — Premium Message Queue for Node.js"
[12]: https://upstash.com/docs/redis/sdks/ratelimit-ts/overview "Upstash Ratelimit Documentation"


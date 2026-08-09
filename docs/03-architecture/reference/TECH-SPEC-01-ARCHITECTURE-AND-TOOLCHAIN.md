## 1. Strategic Architecture Overview

BukieBrainJobs is a **two-sided, real-time service marketplace** with five distinct actor roles: Client, BrainWorker, Admin, Corporate Client (B2B), and System (automated). The platform must simultaneously support:

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
│   │   │   ├── (brainworker)/
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
│   │   │   │   ├── brainworkers/route.ts
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
│       │   ├── (brainworker)/
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

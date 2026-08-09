# BukieBrainJobs - On-Demand Home Services & Artisan Marketplace

Nigeria's premier on-demand home services and artisan marketplace (Web, PWA, iOS, Android).

## Monorepo Architecture

- **apps/web**: Next.js 14 App Router (Web & PWA)
- **apps/mobile**: Expo SDK 52 with Expo Router (iOS & Android)
- **packages/ui**: Shared UI design tokens, Tailwind config, and components
- **packages/types**: Shared TypeScript interfaces (mobile)
- **packages/api-types**: Shared API request/response types (web)
- **packages/store**: Shared Zustand stores and mock data
- **packages/db**: Prisma schema and generated client
- **packages/utils**: Pure utility functions (pricing, formatting, matching)
- **packages/validation**: Zod validation schemas
- **services/socket-server**: Standalone Socket.io server

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run local development server:
   ```bash
   npm run dev
   ```

3. Run only the web app:
   ```bash
   npm --workspace @bukiebrainjobs/web run dev
   ```

## Design Tokens

- **Primary**: #001A41 (Deep Navy)
- **Secondary**: #296A4B (Emerald Green)
- **Accent**: #F59E0B (Amber Gold)
- **Background**: #F8F9FF (Light Navy Tint)

## Documentation

- [AGENTS.md](AGENTS.md) - Development policies and agent instructions
- [DESIGN.md](DESIGN.md) - Visual language and component guidelines
- [ROADMAP.md](ROADMAP.md) - Product roadmap and engineering build order
- [TECHNICAL_SPEC.md](TECHNICAL_SPEC.md) - Full-stack technical specification

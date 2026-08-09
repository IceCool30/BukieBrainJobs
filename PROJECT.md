# Project: BukieBrainJobs Master Redesign — Phase A

## Architecture
- Workspace structure: npm workspaces with Turborepo 2 and Node.js 18+.
- Web App (`apps/web`): Next.js 15 App Router, React 19, TypeScript, Tailwind CSS, Lucide icons.
- Shared Packages:
  - `@bukiebrainjobs/ui` (`packages/ui`): Reusable UI components & design tokens.
  - `@bukiebrainjobs/types` (`packages/types`): Shared TypeScript contracts (TaskStatus, TaskBooking, ChatMessage, UserRole).
  - `@bukiebrainjobs/store` (`packages/store`): Zustand stores (`useAuthStore`, `useBookingStore`, etc.).

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Redesign Button.tsx | Add loading, disabled, variants, size props | M1 | ORIGINAL_REQUEST §1 |
| 2 | Redesign Card.tsx | Add padding variants, interactive pressable props, header slots | M1 | ORIGINAL_REQUEST §1 |
| 3 | Redesign InputField.tsx | Add label animations, error slots, character counter | M1 | ORIGINAL_REQUEST §1 |
| 4 | Redesign BukiePassportBadge.tsx | Add animated checkmark, tier progression | M1 | ORIGINAL_REQUEST §1 |
| 5 | Redesign EscrowShield.tsx | Add 4 distinct escrow states (Pending Auth, Held, Released, Refunded) | M1 | ORIGINAL_REQUEST §1 |
| 6 | Build StatusPill.tsx | Color-coded status badge for all 8 TaskStatus types | M2 | ORIGINAL_REQUEST §2 |
| 7 | Build PriceBreakdown.tsx | Financial breakdown (subtotal, 10% platform fee, 7.5% trust fee, total) | M2 | ORIGINAL_REQUEST §2 |
| 8 | Build ChatBubble.tsx | Sender layout, timestamp, security flag alert | M2 | ORIGINAL_REQUEST §2 |
| 9 | Build StepIndicator.tsx | Timeline progress stepper | M2 | ORIGINAL_REQUEST §2 |
| 10 | Build MetricCard.tsx | KPI card for wallet & admin | M2 | ORIGINAL_REQUEST §2 |
| 11 | Component Export Alignment | Re-export all new & redesigned components in packages/ui/src/components/index.ts | M2 | Codebase Survey |
| 12 | Redesign Navbar.tsx | Sticky top bar, brand logo, role switcher pill (Client / Tasker / Admin) | M3 | ORIGINAL_REQUEST §3 |
| 13 | Redesign Footer.tsx | 4-column responsive footer adhering to DESIGN.md | M3 | ORIGINAL_REQUEST §3 |
| 14 | Create app/not-found.tsx | Custom 404 page with brand styling | M3 | ORIGINAL_REQUEST §3 |
| 15 | Create app/error.tsx | Runtime error boundary with retry | M3 | ORIGINAL_REQUEST §3 |
| 16 | Create app/loading.tsx | Skeleton loader component | M3 | ORIGINAL_REQUEST §3 |
| 17 | Type Check & Integrity Audit | Ensure npm run type-check passes with 0 errors and 100% Phase 1 mock boundaries | M4 | ORIGINAL_REQUEST §3 |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | M1: Shared UI Existing Component Redesign | Redesign Button, Card, InputField, BukiePassportBadge, EscrowShield in packages/ui | none | DONE |
| 2 | M2: Core New Shared Components & Exports | Build/export StatusPill, PriceBreakdown, ChatBubble, StepIndicator, MetricCard in packages/ui | M1 | PLANNED |
| 3 | M3: Web Shells Redesign & Routes | Redesign Navbar, Footer; build not-found, error, loading in apps/web | M2 | PLANNED |
| 4 | M4: Final Verification & Typecheck | Run npm run type-check across workspace; verify mock boundaries & clean audit | M3 | PLANNED |

## Interface Contracts
### `@bukiebrainjobs/ui` ↔ `@bukiebrainjobs/types`
- `TaskStatus`: `'draft' | 'booking_confirmed' | 'artisan_en_route' | 'job_in_progress' | 'invoice_submitted' | 'completed_and_paid' | 'disputed' | 'cancelled'` used in `StatusPill`.
- `EscrowStatus`: `'PENDING_AUTHORIZATION' | 'HELD_IN_ESCROW' | 'RELEASED_TO_ARTISAN' | 'REFUNDED'` used in `EscrowShield`.
- `UserRole`: `'client' | 'artisan' | 'admin'` used in `Navbar` role switcher.
- `ChatMessage`: `isFlaggedForBypass: boolean`, `flaggedReason?: string` used in `ChatBubble`.

## Code Layout
```
packages/ui/
├── src/
│   ├── components/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── InputField.tsx
│   │   ├── BukiePassportBadge.tsx
│   │   ├── EscrowShield.tsx
│   │   ├── StatusPill.tsx
│   │   ├── PriceBreakdown.tsx
│   │   ├── ChatBubble.tsx
│   │   ├── StepIndicator.tsx
│   │   ├── MetricCard.tsx
│   │   └── index.ts
│   ├── index.ts
│   └── tokens/
apps/web/
├── components/
│   ├── Navbar.tsx
│   └── Footer.tsx
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── not-found.tsx
│   ├── error.tsx
│   └── loading.tsx
```

# Analysis Report: apps/web Codebase Survey (Phase A)

## Executive Summary
This report provides a comprehensive codebase analysis of `apps/web/` within the BukieBrainJobs monorepo. It details existing layout components, app shell files, tailwind configuration, font/style tokens, mock state management, and package imports to guide the Phase A redesign.

---

## 1. Web Shell Components & Layout Architecture

### 1.1 Existing Layout Components

#### 1.1.1 `components/Navbar.tsx`
- **Location**: `c:\Users\john.bisong\Bukie Workspace\bukiebrainjobs\apps\web\components\Navbar.tsx`
- **Component Type**: Client Component (`'use client'`).
- **Store Dependencies**: Imports `useAuthStore` from `@bukiebrainjobs/store`.
- **Current Capabilities**:
  - Renders sticky top navigation bar with brand logo ("BukieBrainJobs").
  - Displays role-conditional navigation links (Find Artisans, My Bookings, Messages, BukiePassport, Wallet & Earnings, Admin Console).
  - Contains interactive role switcher pill buttons for `client`, `artisan`, and `admin` roles, calling `setRole()` on click.
  - Displays PWA / Mobile Ready indicator badge.
- **Phase A Action Items**:
  - Refine styling to strictly match `DESIGN.md` visual tokens: Deep Navy `#001A41` header background, 16px control radii, slate neutrals, and sparse Emerald `#296A4B` accents (under 5% screen area).
  - Update role switcher button labels to read "Client / Tasker / Admin" while mapping "Tasker" to the internal `'artisan'` role state in `useAuthStore`.

#### 1.1.2 `components/Footer.tsx`
- **Location**: `c:\Users\john.bisong\Bukie Workspace\bukiebrainjobs\apps\web\components\Footer.tsx`
- **Component Type**: React Functional Component.
- **Current Capabilities**:
  - 4-column responsive grid layout (`bg-[#0B1C30]` background).
  - Column 1: Brand description and payment rail note ("Powered by Dual Paystack & Flutterwave Rails").
  - Column 2: Popular Services list with links.
  - Column 3: Artisans & Trust links (BukiePassport Vetting, NIN & BVN, Bank Payouts, BukieGuarantee).
  - Column 4: B2B & Retail Partnerships CTA ("Partner With Us").
  - Bottom bar: Copyright string (2026 BukieBrainJobs) and legal links (Privacy Policy, Terms of Service, Security & Escrow Policy).
- **Phase A Action Items**:
  - Update background color to Deep Navy `#001A41` to unify footer with brand spec.
  - Standardize typography (Hanken Grotesk headers, Inter body copy) and button styling (Emerald `#296A4B` CTA pill).

#### 1.1.3 `app/layout.tsx`
- **Location**: `c:\Users\john.bisong\Bukie Workspace\bukiebrainjobs\apps\web\app\layout.tsx`
- **Component Type**: Next.js Root Layout.
- **Current Capabilities**:
  - Imports `Inter` font via `next/font/google` and `./globals.css`.
  - Sets metadata (title, description, keywords, openGraph, twitter, icons, manifest).
  - Wraps all pages in `<html>` and `<body>` with Inter font class applied.
- **Phase A Action Items**:
  - Configure `Hanken Grotesk` font alongside `Inter` font to support heading/body typography distinctions defined in `DESIGN.md`.

#### 1.1.4 `app/page.tsx`
- **Location**: `c:\Users\john.bisong\Bukie Workspace\bukiebrainjobs\apps\web\app\page.tsx`
- **Component Type**: Next.js Server Component page.
- **Current Capabilities**:
  - Checks NextAuth session via `getServerSession` and redirects authenticated users to their role-specific dashboard.
  - Renders marketing landing page for unauthenticated visitors with hero banner, popular service cards grid, and platform value proposition.
- **Phase A Action Items**:
  - Ensure landing page components utilize newly redesigned shared UI components from `packages/ui`.

---

### 1.2 Missing Web Shell Error & Loading Files

The survey confirmed that the following standard Next.js App Router boundary files do NOT currently exist in `apps/web/app/`:

1. **`app/not-found.tsx`**:
   - Status: **Missing**
   - Phase A Requirement: Build custom 404 page featuring clean Bukie styling, brand graphic/icon, friendly messaging, and a CTA button navigating back home.
2. **`app/error.tsx`**:
   - Status: **Missing**
   - Phase A Requirement: Build client-side (`'use client'`) error boundary component displaying runtime error notification with a reset / try-again action.
3. **`app/loading.tsx`**:
   - Status: **Missing**
   - Phase A Requirement: Build page skeleton loader component using pulse animation placeholders matching Bukie layout grid and card structures.

---

## 2. Design Tokens, Tailwind Configuration & Typography

### 2.1 Tailwind Configuration Hierarchy
- `apps/web/tailwind.config.ts` imports and spreads `sharedConfig` from `../../packages/ui/tailwind.config`.
- `packages/ui/tailwind.config.ts` imports `brandColors` from `./src/tokens/colors`.

### 2.2 Color Specifications in Code
- **`brandColors` in `packages/ui/src/tokens/colors.ts`**:
  - Primary scale: Green values (`50: #f0fdf4` to `900: #14532d`, `600: #16a34a`).
  - Secondary scale: Amber values (`500: #f59e0b`, `600: #d97706`).
  - Neutral scale: Slate values (`50: #f9fafb` to `900: #111827`).
- **`DESIGN.md` Specification Comparison**:
  - Brand weight: Deep Navy `#001A41` carries primary brand weight.
  - Conversion signal: Emerald `#296A4B` used sparsely (under 5% of screen area).
  - Backgrounds: Slate neutrals (`#f8fafc`, `#f1f5f9`).
  - Card Radii: 32px (`rounded-3xl` or `rounded-[32px]`), control radii 16px (`rounded-2xl` or `rounded-[16px]`).

### 2.3 Typography & Global Styles
- **`apps/web/app/globals.css`**:
  - Imports `Inter` font via Google Fonts CSS `@import`.
  - Defines root CSS variables for light/dark mode color scheme.
  - Sets webkit scrollbar thumb to emerald color (`#16a34a`).
  - Specifies focus-visible outline (`2px solid #16a34a`).
  - Provides utility classes (`.text-gradient`, `.btn-primary`, `.btn-secondary`, `.card`, `.form-input`, `.form-label`).

---

## 3. Store Integration & Role State Management

### 3.1 Package Imports
- Workspace packages imported in `apps/web/package.json`:
  - `@bukiebrainjobs/store`: Zustand state management.
  - `@bukiebrainjobs/ui`: Shared component library.
  - `@bukiebrainjobs/api-types`: Shared TypeScript contracts and schemas.
  - `@bukiebrainjobs/db`: Prisma database client (inactive in Phase 1 mock mode).
  - `@bukiebrainjobs/utils`: Helper functions (pricing calculators, formatters).

### 3.2 State Management in `@bukiebrainjobs/store`
- `useAuthStore`: Controls active user session state.
  - `currentRole`: `'client' | 'artisan' | 'admin'` (defaults to `'client'`).
  - `userName`: default mock name "Dr. Tunde Fashola".
  - `userPhone`: default mock phone "+2348011112222".
  - `passportStatus`: `'Unverified' | 'Pending Lite' | 'Verified Lite' | 'Verified Pro'` (defaults to `'Verified Pro'`).
  - `setRole(role)`: Function used by `Navbar.tsx` to instantly switch context across all consumer components.
- `useBookingStore`: Controls categories, artisans, bookings, active booking ID, selected city, search query, and chat messages.
- `useWalletStore`: Controls artisan wallet balances and instant payout simulation.
- `useAdminStore`: Controls admin dispute resolution state.

---

## 4. Phase A Web Shell Action Plan Summary

| File | Target State | Key Design Requirements |
|---|---|---|
| `components/Navbar.tsx` | Redesign | Sticky Deep Navy `#001A41` bar, brand logo, role switcher pill (Client / Tasker / Admin) linked to `setRole` store action. |
| `components/Footer.tsx` | Redesign | 4-column responsive grid, `#001A41` background, slate text, Emerald CTA button, copyright & policy links. |
| `app/not-found.tsx` | Create New | Custom 404 page with Bukie brand styling, return home button, responsive container. |
| `app/error.tsx` | Create New | Client component error boundary with error messaging and retry button. |
| `app/loading.tsx` | Create New | Skeleton pulse loader matching page grid and card layouts. |
| `app/layout.tsx` | Refine | Integrate Hanken Grotesk font alongside Inter for typography tokens. |

---

## 5. Verification Commands
- Check web build/typechecking: `npm run typecheck`
- Run web workspace dev server: `npm --workspace @bukiebrainjobs/web run dev`

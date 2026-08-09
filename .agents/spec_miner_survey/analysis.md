# BukieBrainJobs Phase A Design Specification Analysis

**Authoritative Spec Sources**: `prompts/design-plan.md`, `DESIGN.md`, `AGENTS.md`, `packages/types/src/index.ts`, `packages/ui/src/components/*`, `apps/web/components/*`  
**Date**: 2026-08-05  
**Mining Directory**: `c:\Users\john.bisong\Bukie Workspace\bukiebrainjobs\.agents\spec_miner_survey`

---

## 1. Executive Summary

This document contains the authoritative specification mining analysis for Phase A of the BukieBrainJobs redesign. Phase A focuses on establishing the design system tokens, core shared UI components in `packages/ui`, and global web shells in `apps/web`.

All visual elements strictly follow **Corporate Modern / Premium Minimalism**, anchoring structural weight in **Deep Navy (#001A41)** and using **Emerald Green (#296A4B)** sparingly (< 5% of screen area) as a high-conversion and success signal.

---

## 2. Itemized Technical Specifications

### a) Color System Tokens

| Token Name | Hex Code | Role & Usage Rules | Tailwind / CSS Utility |
|---|---|---|---|
| **Primary Navy** | `#001A41` | Structural weight, header surfaces, primary buttons, card titles, brand identity | `bg-[#001A41]`, `text-[#001A41]` |
| **Navy Hover** | `#001230` | Hover state for primary buttons and interactive navy elements | `hover:bg-[#001230]` |
| **Emerald Accent** | `#296A4B` | Strategic emphasis: active indicators, success states, high-conversion CTAs. **Strictly < 5% total screen area** | `bg-[#296A4B]`, `text-[#296A4B]` |
| **Emerald Light Tint** | `#ABEEC8` | Secondary container fill, active tab highlights, subtle badges | `bg-[#ABEEC8]`, `text-[#ABEEC8]` |
| **Emerald Hover** | `#1F523A` | Darkened green hover for accent buttons | `hover:bg-[#1F523A]` |
| **Amber Gold** | `#F59E0B` | BukieStar badge, warning states, attention indicators, Admin role pill highlight | `bg-[#F59E0B]`, `text-[#F59E0B]` |
| **Surface BG** | `#F8F9FF` | Cool light background for web page body and app screens | `bg-[#F8F9FF]` |
| **Card White** | `#FFFFFF` | Card surfaces, modal surfaces, drop-down menus | `bg-white` |
| **Slate 900** | `#0B1C30` | Footer background, primary headings dark text | `bg-[#0B1C30]`, `text-[#0B1C30]` |
| **Slate 600 / 500** | `#64748B` | Secondary body text, subtitle copy, labels | `text-slate-600`, `text-slate-500` |
| **Slate 300 / 200** | `#E9ECEF` | Low-contrast 1px strokes, borders, subtle dividers | `border-slate-200`, `border-slate-300` |
| **Slate 100 / 50** | `#EFF4FF` | Input field backgrounds, muted pill backgrounds | `bg-slate-100` |
| **Destructive Red** | `#DC2626` | Error states, dispute warnings, anti-bypass flagged message alerts | `bg-red-600`, `text-red-600` |

---

### b) Typography Specifications

Dual-font strategy balancing executive branding with structural legibility:

| Role / Variant | Font Family | Weight | Font Size | Line Height | Tracking | Purpose |
|---|---|---|---|---|---|---|
| **Display LG** | Hanken Grotesk | 800 (ExtraBold) | 48px (3rem) | 56px (1.15x) | -0.02em | Hero banner headlines (Desktop) |
| **Display LG Mobile** | Hanken Grotesk | 700 (Bold) | 36px (2.25rem) | 44px (1.2x) | -0.02em | Hero banner headlines (Mobile) |
| **Headline MD (H2)** | Hanken Grotesk | 700 (Bold) | 30px (1.875rem) | 38px (1.25x) | -0.01em | Section titles, major card headings |
| **Headline SM (H3)** | Hanken Grotesk | 600 (SemiBold) | 24px (1.5rem) | 32px (1.3x) | 0em | Sub-section headers, modal titles |
| **Subheading (H4)** | Hanken Grotesk | 600 (SemiBold) | 18px-20px | 28px (1.4x) | 0em | Card headers, table section titles |
| **Title LG / Body LG** | Inter | 600 / 400 | 18px-20px | 28px (1.55x) | 0.01em | Featured body text, article intro |
| **Body MD** | Inter | 400 (Regular) | 16px (1rem) | 24px (1.5x) | 0.01em | Standard body copy, descriptions |
| **Label MD** | Inter | 500 (Medium) | 14px (0.875rem) | 20px (1.4x) | 0.03em | Input labels, button labels |
| **Label SM / Caption** | Inter | 500 (Medium) | 12px (0.75rem) | 16px (1.33x) | 0.03em | Badge copy, timestamps, table text |
| **Overline / Badge** | Inter | 700 (Bold) | 10px-12px | 1.0 | 0.05em | Uppercase pill tags, status pills |

---

### c) Radii, Spacing & Elevation

#### Spacing System (8px Base Rhythm)
- `unit-xs`: 4px (`0.25rem`)
- `unit-sm`: 8px (`0.5rem`)
- `unit-md`: 16px (`1rem`)
- `unit-lg`: 24px (`1.5rem`)
- `unit-xl`: 32px (`2rem`)
- `unit-2xl`: 64px (`4rem`)

#### Corner Radii (Shapes)
- **Input & Controls**: `16px` (`1rem` / `rounded-xl` or `rounded-input`) - used for input fields, sm buttons, checkboxes, dropdowns.
- **Cards & Modals**: `32px` (`2rem` / `rounded-3xl` or `rounded-card`) - used for cards, sheets, containers, modals.
- **Pills & CTAs**: `9999px` (`rounded-full`) - used for tags, status chips, primary action buttons, role switcher pill.

#### Grid System
- **Desktop (1280px+)**: 12 columns, 1280px max-width container, 24px gutters, 64px outer margins.
- **Tablet (768px-1279px)**: 8 columns, 16px-24px gutters, 32px outer margins.
- **Mobile (< 768px)**: 4 columns, 12px gutters, 20px outer margins.

#### Elevation & Shadows
- **Level 0 (Base)**: White background (`#FFFFFF`) with 1px border (`#E9ECEF`).
- **Level 1 (Hover/Floating)**: Ambient shadow `0 4px 20px rgba(0, 26, 65, 0.15)` with smooth 200ms transition.
- **Modals Overlay**: 40% Deep Navy backdrop blur (`rgba(0, 26, 65, 0.4)` + `backdrop-blur-md`).

---

### d) TaskStatus Types & Visual Color Mappings

All 8 `TaskStatus` enum values from `@bukiebrainjobs/types` mapped to component visual tokens:

| Status Key | Display Text | Background Style | Text & Border Color | Associated Icon |
|---|---|---|---|---|
| `draft` | Draft | `bg-slate-100` | `text-slate-700 border-slate-300` | FileText |
| `booking_confirmed` | Confirmed | `bg-[#001A41]/10` | `text-[#001A41] border-[#001A41]/20` | CalendarCheck |
| `artisan_en_route` | En Route | `bg-amber-100` | `text-amber-800 border-amber-300` | Navigation / MapPin |
| `job_in_progress` | In Progress | `bg-blue-100 animate-pulse` | `text-blue-800 border-blue-300` | Clock / Wrench |
| `invoice_submitted` | Invoice Pending | `bg-purple-100` | `text-purple-800 border-purple-300` | Receipt / FileText |
| `completed_and_paid` | Completed & Paid | `bg-[#296A4B]/15` | `text-[#296A4B] border-[#296A4B]/30` | CheckCircle / ShieldCheck |
| `disputed` | Disputed | `bg-red-100` | `text-red-700 border-red-300` | AlertTriangle / ShieldAlert |
| `cancelled` | Cancelled | `bg-slate-100 line-through` | `text-slate-500 border-slate-200` | XCircle / Ban |

---

### e) EscrowShield 4 Distinct States

Component props: `amount: number`, `status: 'PENDING_AUTHORIZATION' | 'HELD_IN_ESCROW' | 'RELEASED_TO_ARTISAN' | 'REFUNDED'`, `compact?: boolean`.

| State | Status Enum | Visual Container | Message & Subtext | Icon |
|---|---|---|---|---|
| **1. Pending Auth** | `PENDING_AUTHORIZATION` | `bg-slate-100 text-slate-700 border-slate-300` | "Authorizing pre-payment hold..." <br> *Card authorization in progress* | Clock / Shield |
| **2. Held** | `HELD_IN_ESCROW` | `bg-[#001A41] text-white border-transparent shadow-md` | "Locked safely in Milestone Escrow" <br> *Funds secured until job approval* | Lock / Shield with keyhole |
| **3. Released** | `RELEASED_TO_ARTISAN` | `bg-[#296A4B]/15 text-[#296A4B] border-[#296A4B]/30` | "Milestone complete - funds disbursed" <br> *Payment transferred to artisan* | CheckCircle / ShieldCheck |
| **4. Refunded** | `REFUNDED` | `bg-red-100 text-red-700 border-red-300` | "Milestone canceled - funds returned" <br> *Pre-authorization returned to client* | RotateCcw / ShieldAlert |

---

### f) BukiePassportBadge Specs

Component props: `ninVerified: boolean`, `smartSelfieVerified: boolean`, `biometricMatch: boolean`, `tier?: 'Lite' | 'Pro'`, `compact?: boolean`.

- **Animated Checkmark Requirement**:
  - When verified, the checkmark renders with an animated SVG path draw sequence (`stroke-dasharray` / `stroke-dashoffset` CSS keyframe animation) or subtle scale spring bounce.
- **Tier Progression Indicator**:
  - Renders a multi-step checklist or progress bar:
    1. **NIN Anchor**: Verified (11-digit check)
    2. **SmartSelfie**: Face match confirmed
    3. **Biometric Match**: Verification complete
    4. **Tier 2 Pro (Optional)**: Guarantor + Address audit complete
- **Display Variants**:
  - `compact`: Pill container (`rounded-full px-3 py-1 bg-[#296A4B]/10 text-[#296A4B]`) with animated check.
  - `full`: 32px rounded card surface with detailed breakdown per verification anchor.

---

### g) PriceBreakdown Specs & Calculations

Component props: `artisanRateNaira: number`, `estimatedHours: number`, `preAuthStatus?: 'Pre-Authorized' | 'Captured' | 'Refunded'`.

#### Calculations:
1. `subtotalNaira` = `artisanRateNaira * estimatedHours`
2. `platformServiceFeeNaira` = `subtotalNaira * 0.10` (10% platform fee)
3. `trustGuaranteeFeeNaira` = `subtotalNaira * 0.075` (7.5% trust & insurance guarantee fee)
4. `totalNaira` = `subtotalNaira + platformServiceFeeNaira + trustGuaranteeFeeNaira` (1.175x multiplier)

#### Visual Layout:
- Card surface container (`bg-white border border-slate-200 rounded-3xl p-6`).
- Itemized rows:
  - Base Subtotal (`₦{subtotalNaira.toLocaleString()}`)
  - Platform Service Fee (10%) (`₦{platformServiceFeeNaira.toLocaleString()}`)
  - Trust & Safety Guarantee (7.5%) (`₦{trustGuaranteeFeeNaira.toLocaleString()}`)
- Divider horizontal rule (`border-b border-slate-100 my-3`).
- Total row: Bold Hanken Grotesk text in Deep Navy (`#001A41`), font size 20px/24px, with `preAuthStatus` pill badge.

---

### h) ChatBubble Specs & Security Controls

Component props: `message: ChatMessage`, `isSelf: boolean`.

- **Visual Alignment & Tail Geometry**:
  - `isSelf = true`: Right-aligned, Deep Navy background (`bg-[#001A41] text-white`), `rounded-2xl rounded-br-sm`.
  - `isSelf = false`: Left-aligned, Light slate surface background (`bg-slate-100 text-slate-900`), `rounded-2xl rounded-bl-sm`.
  - Timestamp: `text-[11px] text-slate-400 mt-1 block` (formatted e.g. "10:42 AM").
- **Anti-Bypass Security Flag Alert**:
  - Renders when `message.isFlaggedForBypass = true`.
  - Visual: Crimson Red warning callout (`bg-red-50 border border-red-200 rounded-xl p-3 mt-2 text-red-700 text-xs flex gap-2 items-start`).
  - Alert Icon: `ShieldAlert` or `AlertTriangle`.
  - Warning Text: "Security Notice: Direct contact details or off-platform payment attempts (e.g. WhatsApp, bank transfer, pay cash) are prohibited until escrow is locked. Off-platform deals void BukieGuarantee protection."
  - Text Masking: Automatically masks sensitive substrings (phone numbers, external bank details).

---

### i) StepIndicator & MetricCard Specs

#### `StepIndicator`
- **Purpose**: Horizontal/vertical process timeline tracker for booking workflow and task progress.
- **Steps**:
  1. Task Details -> 2. Location & Schedule -> 3. Escrow Pre-Auth -> 4. Tasker En Route -> 5. Completion.
- **Visual States**:
  - `Completed`: Solid Emerald `#296A4B` circle with check icon; connecting line green.
  - `Active`: Deep Navy `#001A41` circle with white step index & pulsing outer ring; connecting line half-filled.
  - `Upcoming`: Muted slate `#E9ECEF` circle with gray step index; connecting line light slate.
- **Props**: `steps: { label: string; description?: string }[]`, `currentStep: number`, `orientation?: 'horizontal' | 'vertical'`.

#### `MetricCard`
- **Purpose**: Key Performance Indicator tile for Wallet, Tasker Dashboard, and Admin Console.
- **Content**: Title caption, Large metric value, Trend indicator (+12% vs last week with directional icon), Icon badge slot.
- **Visual**: White card surface, 1px slate border, 16px/32px rounded corners, Level 1 shadow on hover.
- **Props**: `title: string`, `value: string | number`, `change?: string`, `changeType?: 'positive' | 'negative' | 'neutral'`, `icon?: React.ReactNode`, `variant?: 'default' | 'emerald' | 'navy' | 'amber'`.

---

### j) Web Shell Specs (Navbar, Footer, 404, Error, Loading)

#### 1. Navbar (`apps/web/components/Navbar.tsx`)
- **Behavior**: Sticky top bar (`sticky top-0 z-50`), height: 64px (h-16/h-20), Deep Navy `#001A41` background, 1px bottom border `border-blue-900/50`.
- **Brand Logo**: Circular white container with `#296A4B` border, BukieBrain logo icon, Hanken Grotesk white text with Emerald "Jobs" accent.
- **Role Switcher Pill**: Segmented pill control (`bg-slate-900/80 p-1 rounded-full border border-slate-700`) with 3 buttons: Client, Tasker (Artisan), Admin. Active state: Emerald `#296A4B` for Client/Tasker, Amber `#F59E0B` for Admin.
- **Role-Aware Links**:
  - Client: Find Artisans, My Bookings, Messages.
  - Tasker: BukiePassport Status, Wallet & Earnings, Client Messages.
  - Admin: Admin Console (Amber text).

#### 2. Footer (`apps/web/components/Footer.tsx`)
- **Behavior**: Responsive 4-column desktop grid / 1-column mobile layout. Background: Dark Navy Slate `#0B1C30`, border top `#1E293B`.
- **Column 1 (Brand)**: Platform summary, coverage cities (Lagos, Abuja, Port Harcourt, Ibadan, Kano), dual Paystack/Flutterwave badge.
- **Column 2 (Services)**: Links to AC Repair, TV Mounting, Plumbing, Electrical, Generator Servicing.
- **Column 3 (Artisans & Trust)**: BukiePassport Vetting, NIN/BVN Biometrics, Instant Payouts, BukieGuarantee Protection.
- **Column 4 (B2B)**: Retail partner integration pitch (Slot, Fouani, Jumia checkout API) + "Partner With Us" button.
- **Bottom Bar**: Copyright notice + legal links (Privacy Policy, Terms of Service, Security & Escrow Policy).

#### 3. 404 Page (`apps/web/app/not-found.tsx`)
- **Visual**: Illustrated empty state (lost artisan/wrench motif), Hanken Grotesk 404 title, friendly guidance messaging, "Go Home" Emerald pill CTA button, grid of suggested popular service categories.

#### 4. Custom Error Page (`apps/web/app/error.tsx`)
- **Requirements**: Must be a Client Component (`'use client'`), receiving `error` and `reset`.
- **Visual**: Security/shield alert illustration, clear "Something went wrong" message, "Try Again" action button calling `reset()`, "Return Home" secondary button.

#### 5. Loading State (`apps/web/app/loading.tsx`)
- **Visual**: Skeleton pulse loader matching page layout structure using subtle navy/slate animated pulse blocks (`animate-pulse bg-slate-200 rounded-2xl`).

---

## 3. Features Discovered Table

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | Shared UI | Redesigned `Button` | Button component supporting loading state, disabled styling, icon slot, sm/md/lg size variants, and primary/secondary/accent variants | `label`, `variant`, `size`, `loading`, `disabled`, `icon`, `onPress` | JSX Button element | Disabled styling, suppressed click handler when disabled/loading | `prompts/design-plan.md` Section 2 |
| 2 | Shared UI | Redesigned `Card` | Tonal container card with ambient hover shadow, padding variants, interactive pressable props, and header slot | `title`, `subtitle`, `padding`, `interactive`, `headerSlot`, `children`, `onClick` | JSX Card container | Graceful fallback if image/header omitted | `prompts/design-plan.md` Section 2 |
| 3 | Shared UI | Redesigned `InputField` | Form text input with label animation, error slot, character counter, and prefix/suffix icon slots | `label`, `placeholder`, `type`, `value`, `error`, `maxCount`, `prefix`, `suffix`, `onChange` | JSX Input container | Crimson error text highlight, focus glow border | `prompts/design-plan.md` Section 2 |
| 4 | Shared UI | `BukiePassportBadge` | Biometric identity verification status badge with animated SVG checkmark and tier progression | `ninVerified`, `smartSelfieVerified`, `biometricMatch`, `tier`, `compact` | JSX Badge element | Visual "Vetting Incomplete" amber pill if unverified | `prompts/design-plan.md` & `BukiePassportBadge.tsx` |
| 5 | Shared UI | `EscrowShield` | Milestone Escrow status card with 4 distinct states (Pending Auth, Held, Released, Refunded) | `amount`, `status`, `compact` | JSX Escrow Shield element | Displays refund warning visual when status is Refunded | `prompts/design-plan.md` & `EscrowShield.tsx` |
| 6 | Shared UI | `StatusPill` | Color-coded status badge for all 8 `TaskStatus` enum types | `status: TaskStatus`, `size?: 'sm' \| 'md'` | JSX Pill element | Defaults to slate neutral if status unrecognized | `prompts/design-plan.md` Section 2 |
| 7 | Shared UI | `PriceBreakdown` | Itemized financial breakdown calculation component (subtotal, 10% platform fee, 7.5% trust fee, total) | `artisanRateNaira`, `estimatedHours`, `preAuthStatus` | JSX Financial summary card | Renders NaN safeguard fallback if invalid numeric input | `prompts/design-plan.md` Section 2 |
| 8 | Shared UI | `ChatBubble` | Chat message bubble supporting sender roles, timestamps, media attachments, and anti-bypass alerts | `message: ChatMessage`, `isSelf: boolean` | JSX Message bubble | Renders Crimson Red anti-bypass callout when flagged | `prompts/design-plan.md` Section 2 |
| 9 | Shared UI | `StepIndicator` | Multi-step process stepper and timeline tracker | `steps`, `currentStep`, `orientation` | JSX Timeline stepper | Clamps step index between 0 and total steps | `prompts/design-plan.md` Section 2 |
| 10 | Shared UI | `MetricCard` | KPI summary tile displaying value, label, trend change, and icon | `title`, `value`, `change`, `changeType`, `variant` | JSX KPI tile | Mutes trend indicator if change omitted | `prompts/design-plan.md` Section 2 |
| 11 | Web Shell | Redesigned `Navbar` | Sticky top navigation bar with brand logo and 3-way role switcher pill (Client / Tasker / Admin) | `currentRole`, `setRole` from Zustand | JSX Header element | Responsive dropdown fallback on mobile screens | `prompts/design-plan.md` & `Navbar.tsx` |
| 12 | Web Shell | Redesigned `Footer` | 4-column responsive footer with service links, trust badges, and B2B partnership CTA | None (Static links + CTA handler) | JSX Footer element | Wraps columns gracefully on mobile screens | `prompts/design-plan.md` & `Footer.tsx` |
| 13 | Web Shell | Custom `not-found.tsx` | Brand-consistent 404 page with lost artisan illustration and category quick links | None | JSX 404 page | Links safely back to home (`/`) | `prompts/design-plan.md` Section 3.0.2 |
| 14 | Web Shell | Custom `error.tsx` | Next.js App Router error boundary with retry action button | `error: Error`, `reset: () => void` | JSX Error fallback | Retries route render via `reset()` | `prompts/design-plan.md` Section 3.0.3 |
| 15 | Web Shell | Custom `loading.tsx` | Global loading skeleton pulse container matching target layout structure | None | JSX Skeleton container | Smooth pulse animation while route hydrates | `prompts/design-plan.md` Section 3.0.4 |

---

## 4. Edge Cases Table

| # | Feature | Input / Trigger | Observed & Required Behavior |
|---|---------|-----------------|------------------------------|
| 1 | Anti-Bypass Chat Filter | Message contains "WhatsApp", "08012345678", "pay cash", or "bank transfer" | Renders red security flag alert callout below message, masks contact details, displays warning about voided BukieGuarantee protection. |
| 2 | Emerald Color Area Limit | Page surface rendered with multiple emerald components | Emerald color area MUST remain under 5% of total screen layout area. Primary buttons use Deep Navy (#001A41); Emerald (#296A4B) is reserved strictly for high-conversion CTAs and success checkmarks. |
| 3 | PriceBreakdown Calculation | 0 estimated hours or fractional rates (e.g. ₦3,500/hr) | Component correctly computes `0.10 * subtotal` and `0.075 * subtotal`, formatting output with thousand separators (`₦3,500.00` or `₦0`). |
| 4 | TaskStatus Colors | Status equals `job_in_progress` | StatusPill renders blue pulsing background (`animate-pulse`) to visually highlight an active live job. |
| 5 | EscrowShield Refund | Status equals `REFUNDED` | EscrowShield switches from navy background to Crimson Red warning container (`bg-red-100 text-red-700`), displaying return confirmation copy. |
| 6 | BukiePassport Animation | Tasker completes Tier 1 verification step | Animated checkmark triggers drawing animation, transitioning badge state from amber "Vetting Incomplete" to emerald "Active Vetting". |
| 7 | Role Switcher Pill | User switches role to `admin` | Role pill background highlights Admin option with Amber Gold (`#F59E0B`), and Navbar updates navigation links to show Admin Console link. |
| 8 | Error Boundary Reset | Runtime JS error occurs in Next.js App Router | `app/error.tsx` catches error, displays shield illustration, and clicking "Try Again" triggers `reset()` to attempt re-rendering the component tree. |

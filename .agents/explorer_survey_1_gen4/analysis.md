# Phase A Survey Analysis: packages/ui and packages/types

**Agent:** Codebase Explorer 1 (Gen 4)  
**Date:** 2026-08-05  
**Working Directory:** `c:\Users\john.bisong\Bukie Workspace\bukiebrainjobs\.agents\explorer_survey_1_gen4`  
**Project Root:** `c:\Users\john.bisong\Bukie Workspace\bukiebrainjobs`

---

## 1. Executive Summary & Survey Objectives

This analysis presents a comprehensive codebase survey of `@bukiebrainjobs/ui` and `@bukiebrainjobs/types` to support Phase A execution of the BukieBrainJobs Redesign Plan (`ORIGINAL_REQUEST.md`). 

The survey evaluated existing shared UI components, export interfaces, type definitions, dependencies, design token alignments, and styling patterns across the component library. Key findings indicate that while fundamental component implementations exist, several key props, animated states, export mappings, and design system refinements are required to achieve full Phase A compliance.

---

## 2. Shared UI Components Survey (`packages/ui/src/components/`)

### 2.1 Existing Component Analysis

#### 1. `Button.tsx`
- **Location:** `packages/ui/src/components/Button.tsx`
- **Props Interface:** `ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>`
  - `label?: string`
  - `variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'destructive'`
  - `size?: 'sm' | 'md' | 'lg'`
  - `isLoading?: boolean`
  - `leftIcon?: React.ReactNode`
  - `rightIcon?: React.ReactNode`
  - `fullWidth?: boolean`
  - `onPress?: () => void`
  - Standard HTML button attributes (`disabled`, `className`, `onClick`, `children`, etc.)
- **Styling & Tokens:**
  - Base classes: `inline-flex items-center justify-center font-body font-bold rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]`
  - Primary variant: `bg-[#001A41] text-white hover:bg-[#000F2D] focus:ring-[#001A41]` (Deep Navy)
  - Accent variant: `bg-[#296A4B] text-white hover:bg-[#205139]` (Emerald Green CTA)
  - Secondary variant: `border border-[#001A41] text-[#001A41] bg-transparent`
- **Gap & Redesign Requirements for Phase A:**
  - Standardize loading spinner with accessible aria-labels.
  - Refine focus rings and disabled states to strictly match `DESIGN.md` focus and disabled tokens.
  - Ensure button height and touch target sizing match mobile/web guidelines (44px min touch target on mobile).

#### 2. `Card.tsx`
- **Location:** `packages/ui/src/components/Card.tsx`
- **Props Interface:** `CardProps`
  - `title?: string`
  - `subtitle?: string`
  - `image?: string`
  - `variant?: 'default' | 'flat' | 'bordered'`
  - `padding?: 'none' | 'sm' | 'md' | 'lg'`
  - `interactive?: boolean`
  - `header?: React.ReactNode`
  - `footer?: React.ReactNode`
  - `onClick?: () => void`
  - `className?: string`
  - `children?: React.ReactNode`
- **Styling & Tokens:**
  - Base corner radius: `rounded-[32px]` (32px = 2rem / `lg` in DESIGN.md)
  - Padding levels: `none: p-0`, `sm: p-4`, `md: p-6`, `lg: p-8`
  - Interactive hover state: `hover:shadow-[0_4px_20px_rgba(0,26,65,0.15)] hover:border-[#001A41]/20 cursor-pointer active:scale-[0.99]`
- **Gap & Redesign Requirements for Phase A:**
  - Add explicit pressable keyboard accessible props (`role="button"`, `tabIndex`, `onKeyDown`) when `interactive` is enabled.
  - Enhance header and footer slots for consistent border and background styling.

#### 3. `InputField.tsx`
- **Location:** `packages/ui/src/components/InputField.tsx`
- **Props Interface:** `InputFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'>`
  - `label?: string`
  - `helperText?: string`
  - `error?: string`
  - `leftIcon?: React.ReactNode`
  - `rightIcon?: React.ReactNode`
  - `onValueChange?: (value: string) => void`
  - `onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void`
- **Styling & Tokens:**
  - Input styling: `bg-[#F8F9FF] border text-sm text-[#001A41] font-body rounded-[16px] transition-all duration-200 focus:bg-white focus:border-[#001A41] focus:ring-2 focus:ring-[#001A41]/10`
  - Label: `font-body text-xs font-bold text-[#001A41] uppercase tracking-wider`
- **Gap & Redesign Requirements for Phase A:**
  - Add floating label / label animation support.
  - Add explicit character counter prop (`maxLength`, `showCounter`).
  - Improve error slot rendering with icon and aria-describedby for accessibility.

#### 4. `BukiePassportBadge.tsx`
- **Location:** `packages/ui/src/components/BukiePassportBadge.tsx`
- **Props Interface:** `BukiePassportProps`
  - `tier?: 'Lite' | 'Pro' | 'Unverified'`
  - `ninVerified?: boolean`
  - `bvnVerified?: boolean`
  - `smartSelfieVerified?: boolean`
  - `compact?: boolean`
  - `showDetails?: boolean`
  - `className?: string`
- **Styling & Tokens:**
  - Pill badge for compact mode (`bg-[#296A4B]` for Pro, `bg-[#296A4B]/10` for Lite).
  - Detailed card mode with NIMC / NIBSS Identity Anchor branding and verification checklists.
- **Gap & Redesign Requirements for Phase A:**
  - Add animated checkmarks for verification steps.
  - Display tier progression visual bar (Lite to Pro transition indicator).

#### 5. `EscrowShield.tsx`
- **Location:** `packages/ui/src/components/EscrowShield.tsx`
- **Props Interface:** `EscrowProps`
  - `amount: number`
  - `status: EscrowStatusType` (`'PENDING_AUTHORIZATION' | 'HELD_IN_ESCROW' | 'RELEASED_TO_ARTISAN' | 'REFUNDED' | 'Pre-Authorized' | 'Captured' | 'Refunded'`)
  - `compact?: boolean`
  - `className?: string`
- **Styling & Tokens:**
  - Card style: `rounded-[32px] p-6 text-center shadow-sm`
  - Status mapping: Deep Navy (`#001A41`) for Held, Emerald (`#296A4B`) for Released, Crimson (`#DC2626`) for Refunded, Slate (`#64748B`) for Pending Auth.
- **Gap & Redesign Requirements for Phase A:**
  - Ensure 4 distinct escrow states (Pending Auth, Held, Released, Refunded) are clearly differentiated with visual icons, state labels, and subtitle descriptions.

---

### 2.2 Core New Components Audit

Phase A requires 5 core new shared components:

1. **`StatusPill.tsx`**
   - **File:** `packages/ui/src/components/StatusPill.tsx`
   - **Interface:** `StatusPillProps { status: TaskStatus; className?: string; }`
   - **Status:** File exists. Color-coded for all 8 `TaskStatus` values (`draft`, `booking_confirmed`, `artisan_en_route`, `job_in_progress`, `invoice_submitted`, `completed_and_paid`, `disputed`, `cancelled`).

2. **`PriceBreakdown.tsx`**
   - **File:** `packages/ui/src/components/PriceBreakdown.tsx`
   - **Interface:** `PriceBreakdownProps { artisanRateNaira: number; estimatedHours: number; subtotalNaira: number; platformServiceFeeNaira: number; trustGuaranteeFeeNaira: number; totalNaira: number; artisanName?: string; className?: string; }`
   - **Status:** File exists. Displays 10% platform fee, 7.5% trust guarantee fee, labor subtotal, and total pre-auth hold.

3. **`ChatBubble.tsx`**
   - **File:** `packages/ui/src/components/ChatBubble.tsx`
   - **Interface:** `ChatBubbleProps { senderName: string; senderRole: UserRole; text: string; timestamp: string; isFlaggedForBypass?: boolean; flaggedReason?: string; currentRole?: UserRole; className?: string; }`
   - **Status:** File exists. Supports sender alignment, timestamp, and anti-bypass security flag warning box.

4. **`StepIndicator.tsx`**
   - **File:** `packages/ui/src/components/StepIndicator.tsx`
   - **Interface:** `StepIndicatorProps { steps: StepItem[]; currentStepIndex: number; className?: string; }`
   - **Status:** File exists. Timeline progress stepper with connecting lines and completed checkmarks.

5. **`MetricCard.tsx`**
   - **File:** `packages/ui/src/components/MetricCard.tsx`
   - **Interface:** `MetricCardProps { label: string; value: string | number; trend?: string; trendPositive?: boolean; icon?: React.ReactNode; subtitle?: string; className?: string; }`
   - **Status:** File exists. KPI summary card for artisan wallet balances and admin metrics.

---

## 3. Package Export Mapping (`packages/ui/src/index.ts` & `src/components/index.ts`)

### 3.1 `packages/ui/src/index.ts`
Re-exports tokens, theme, and components:
```ts
export * from './tokens/colors';
export * from './tokens/spacing';
export * from './tokens/typography';
export * from './theme';
export * from './components';
```

### 3.2 Export Discrepancy in `packages/ui/src/components/index.ts`
Current `src/components/index.ts` contents:
```ts
export { Button } from './Button';
export type { ButtonProps } from './Button';
export { Card } from './Card';
export type { CardProps } from './Card';
export { InputField } from './InputField';
export type { InputFieldProps } from './InputField';
export { BukiePassportBadge } from './BukiePassportBadge';
export type { BukiePassportProps } from './BukiePassportBadge';
export { EscrowShield } from './EscrowShield';
export type { EscrowProps } from './EscrowShield';
```

**CRITICAL FINDING:** `StatusPill`, `PriceBreakdown`, `ChatBubble`, `StepIndicator`, `MetricCard`, `EmptyState`, and `StarRating` are currently NOT exported from `packages/ui/src/components/index.ts`. Re-exporting these components is required in Phase A so downstream applications (`apps/web` and `apps/mobile`) can import them from `@bukiebrainjobs/ui`.

---

## 4. Shared Types Inventory (`packages/types/src/index.ts`)

`packages/types` serves as the central TypeScript contract definition. The primary types surveyed include:

| Type / Interface | Key Properties & Definition | Phase A Relevance |
| --- | --- | --- |
| `UserRole` | `'client' \| 'artisan' \| 'admin'` | Used by `ChatBubble`, Navbar role switcher |
| `TaskStatus` | 8 statuses: `'draft'`, `'booking_confirmed'`, `'artisan_en_route'`, `'job_in_progress'`, `'invoice_submitted'`, `'completed_and_paid'`, `'disputed'`, `'cancelled'` | Powers `StatusPill` color-coding |
| `TaskCategorySlug` | 10 slugs: `'ac-repair'`, `'tv-mounting'`, `'plumbing'`, `'electrical'`, `'handyman'`, `'furniture-assembly'`, `'cleaning'`, `'moving'`, `'painting'`, `'generator-servicing'` | Shared category definitions |
| `ArtisanProfile` | Includes `passportTier: 'Lite' \| 'Pro'`, `isBukieStar`, verification booleans (`ninVerified`, `bvnVerified`, `smartSelfieVerified`) | Powers `BukiePassportBadge` |
| `TaskBooking` | Contains pricing & escrow breakdown (`artisanRateNaira`, `subtotalNaira`, `platformServiceFeeNaira`, `trustGuaranteeFeeNaira`, `totalNaira`, `preAuthStatus`) | Powers `PriceBreakdown` and `EscrowShield` |
| `ChatMessage` | Includes `isFlaggedForBypass?: boolean`, `flaggedReason?: string` | Powers `ChatBubble` security warnings |
| `ArtisanWallet` | Financial metrics (`availableBalanceNaira`, `pendingEscrowNaira`, `lifetimeEarningsNaira`, `recentTransactions`) | Powers `MetricCard` in wallets |
| `AdminDispute` | Admin tracking fields (`issueType`, `claimAmountNaira`, `status`) | Powers `MetricCard` & admin view |

---

## 5. Styling Patterns & Design Tokens Alignment

### 5.1 `DESIGN.md` Token Compliance
- **Brand Colors:**
  - Deep Navy: `#001A41` (Brand authority, headers, primary buttons, background cards)
  - Emerald Green: `#296A4B` (Signal color for CTAs, verification, active states; kept under 5% screen area)
  - Background surface: `#F8F9FF`
  - Slate Neutrals: Derived from `#64748B`, `#E9ECEF`
- **Typography:**
  - Headlines & Titles: `Hanken Grotesk` (`font-display`)
  - Body & UI Copy: `Inter` (`font-body`)
- **Radii:**
  - Control radius: `1rem` (16px) for inputs
  - Card radius: `2rem` (32px) for cards, modals, shield containers
  - Pill radius: `9999px` (`rounded-full`) for buttons and status chips

---

## 6. Verification & Recommendations

1. **Exports Update:** Update `packages/ui/src/components/index.ts` to export all components (`StatusPill`, `PriceBreakdown`, `ChatBubble`, `StepIndicator`, `MetricCard`, `EmptyState`, `StarRating`).
2. **Component Enhancements:**
   - Update `Button.tsx` with refined loading/disabled states and token Sizing.
   - Update `Card.tsx` with keyboard-accessible interactive props and header/footer slots.
   - Update `InputField.tsx` with label animations, error slots, and character counter.
   - Update `BukiePassportBadge.tsx` with animated checkmarks and tier progression visuals.
   - Update `EscrowShield.tsx` with 4 distinct escrow state visuals.
3. **Type-Check Command:** Verify all additions pass `npm run typecheck` across all workspaces.

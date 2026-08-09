# Technical Plan & Specifications: Milestone 2 Core New Shared Components & Export Alignment

**Author:** Explorer M2  
**Milestone:** M2 - Core New Shared Components & Component Export Alignment  
**Date:** 2026-08-05  
**Working Directory:** `c:\Users\john.bisong\Bukie Workspace\bukiebrainjobs\.agents\explorer_m2`  
**Target Package:** `@bukiebrainjobs/ui` (`packages/ui/src/components/`)

---

## 1. Executive Summary

Milestone 2 (M2) establishes the core new shared UI components and completes package export alignment for `@bukiebrainjobs/ui`. These deliverables provide essential trust, financial, chat, process tracking, and analytical visuals across the BukieBrainJobs platform for Client, Tasker (Artisan), and Admin workflows.

All components strictly comply with the visual guidelines established in `DESIGN.md` and `AGENTS.md`:
- **Deep Navy (`#001A41`)** anchors major structural text, headers, active states, and dark surface backgrounds.
- **Emerald Green (`#296A4B`)** is used strictly under 5% of screen area as a high-conversion CTA and positive status indicator.
- **Amber Gold (`#F59E0B`)** and **Crimson Red (`#DC2626`)** signal warning states and security alerts.
- **Typography:** Hanken Grotesk for headings (`font-display`) and Inter for body copy (`font-body`).
- **Radii:** 16px (`rounded-xl` / controls), 24px/32px (`rounded-[24px]`/`rounded-[32px]` / cards), and `rounded-full` for pills and badges.

---

## 2. Technical Specifications & Proposed Implementation Code

### 2.1 Deliverable 1: `StatusPill.tsx`

#### Overview & Requirements
- File Path: `packages/ui/src/components/StatusPill.tsx`
- Maps all 8 `TaskStatus` values from `@bukiebrainjobs/types` to specific color-coded badges.
- Supports sizes `sm` and `md`, status icons, and animated pulse indicators for active states.

#### TaskStatus Visual Mapping Matrix:
1. `draft`: Neutral Slate tint (`bg-slate-100 text-slate-700 border-slate-300`) with File edit icon.
2. `booking_confirmed`: Deep Navy tint (`bg-[#001A41]/10 text-[#001A41] border-[#001A41]/25`) with Calendar icon.
3. `artisan_en_route`: Amber warning tint (`bg-amber-100 text-amber-800 border-amber-300`) with map pin icon and animated ping pulse.
4. `job_in_progress`: Blue progress tint (`bg-blue-100 text-blue-800 border-blue-300`) with spinning gear/wrench icon and animated pulse.
5. `invoice_submitted`: Purple billing tint (`bg-purple-100 text-purple-800 border-purple-300`) with receipt icon.
6. `completed_and_paid`: Emerald Green success tint (`bg-[#296A4B]/15 text-[#296A4B] border-[#296A4B]/30`) with shield check icon.
7. `disputed`: Crimson Red warning tint (`bg-red-100 text-red-700 border-red-300`) with alert triangle icon and warning pulse.
8. `cancelled`: Slate disabled tint (`bg-slate-100 text-slate-500 border-slate-200 line-through`) with ban icon.

#### Proposed Code: `packages/ui/src/components/StatusPill.tsx`
```tsx
import React from 'react';
import { TaskStatus } from '@bukiebrainjobs/types';

export interface StatusPillProps {
  /** The TaskStatus enum value from @bukiebrainjobs/types */
  status: TaskStatus;
  /** Size variant: 'sm' (compact) or 'md' (standard) */
  size?: 'sm' | 'md';
  /** Toggle status indicator icon/dot (default: true) */
  showIcon?: boolean;
  /** Additional custom CSS classes */
  className?: string;
}

interface StatusStyleConfig {
  label: string;
  bg: string;
  text: string;
  border: string;
  dotColor: string;
  pulse?: boolean;
  icon: React.ReactNode;
}

const statusConfigs: Record<TaskStatus, StatusStyleConfig> = {
  draft: {
    label: 'Draft',
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-300',
    dotColor: 'bg-slate-400',
    icon: (
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    )
  },
  booking_confirmed: {
    label: 'Confirmed',
    bg: 'bg-[#001A41]/10',
    text: 'text-[#001A41]',
    border: 'border-[#001A41]/25',
    dotColor: 'bg-[#001A41]',
    icon: (
      <svg className="w-3 h-3 text-[#001A41]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    )
  },
  artisan_en_route: {
    label: 'En Route',
    bg: 'bg-amber-100',
    text: 'text-amber-800',
    border: 'border-amber-300',
    dotColor: 'bg-amber-500',
    pulse: true,
    icon: (
      <svg className="w-3 h-3 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )
  },
  job_in_progress: {
    label: 'In Progress',
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-300',
    dotColor: 'bg-blue-600',
    pulse: true,
    icon: (
      <svg className="w-3 h-3 text-blue-700 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )
  },
  invoice_submitted: {
    label: 'Invoice Pending',
    bg: 'bg-purple-100',
    text: 'text-purple-800',
    border: 'border-purple-300',
    dotColor: 'bg-purple-600',
    icon: (
      <svg className="w-3 h-3 text-purple-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    )
  },
  completed_and_paid: {
    label: 'Completed & Paid',
    bg: 'bg-[#296A4B]/15',
    text: 'text-[#296A4B]',
    border: 'border-[#296A4B]/30',
    dotColor: 'bg-[#296A4B]',
    icon: (
      <svg className="w-3 h-3 text-[#296A4B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    )
  },
  disputed: {
    label: 'Disputed',
    bg: 'bg-red-100',
    text: 'text-red-700',
    border: 'border-red-300',
    dotColor: 'bg-red-600',
    pulse: true,
    icon: (
      <svg className="w-3 h-3 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    )
  },
  cancelled: {
    label: 'Cancelled',
    bg: 'bg-slate-100',
    text: 'text-slate-500 line-through',
    border: 'border-slate-200',
    dotColor: 'bg-slate-400',
    icon: (
      <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
      </svg>
    )
  }
};

export const StatusPill: React.FC<StatusPillProps> = ({
  status,
  size = 'md',
  showIcon = true,
  className = ''
}) => {
  const config = statusConfigs[status] ?? statusConfigs.draft;
  const sizeClasses = size === 'sm' 
    ? 'text-[10px] px-2.5 py-0.5 gap-1 min-h-[22px]' 
    : 'text-[11px] px-3 py-1 gap-1.5 min-h-[26px]';

  return (
    <span
      className={`inline-flex items-center rounded-full font-display font-extrabold uppercase tracking-wider border transition-all ${config.bg} ${config.text} ${config.border} ${sizeClasses} ${className}`}
    >
      {showIcon && (
        <span className="relative flex items-center justify-center shrink-0">
          {config.pulse && (
            <span className={`absolute inline-flex h-2 w-2 rounded-full opacity-75 animate-ping ${config.dotColor}`} />
          )}
          {config.icon}
        </span>
      )}
      <span>{config.label}</span>
    </span>
  );
};
```

---

### 2.2 Deliverable 2: `PriceBreakdown.tsx`

#### Overview & Requirements
- File Path: `packages/ui/src/components/PriceBreakdown.tsx`
- Calculates and formats financial transparency itemization:
  - Base Labor Subtotal (`artisanRateNaira * estimatedHours`)
  - Platform Service Fee (10% of labor subtotal)
  - BukieGuarantee Trust & Insurance Fee (7.5% of labor subtotal)
  - Total Pre-Authorization Hold (Subtotal + 10% + 7.5%)
- Formatted with `₦` Naira symbol and locale formatting.
- Includes detail expansion toggle, pre-authorization status pill, and 100% Artisan Payout Guarantee trust callout.

#### Proposed Code: `packages/ui/src/components/PriceBreakdown.tsx`
```tsx
import React, { useState } from 'react';

export interface PriceBreakdownProps {
  /** Base artisan hourly or fixed rate in Naira */
  artisanRateNaira?: number;
  /** Estimated duration in hours */
  estimatedHours?: number;
  /** Direct labor subtotal in Naira (defaults to artisanRateNaira * estimatedHours) */
  subtotalNaira?: number;
  /** Platform service fee (10%, defaults to subtotalNaira * 0.10) */
  platformServiceFeeNaira?: number;
  /** BukieGuarantee trust & insurance fee (7.5%, defaults to subtotalNaira * 0.075) */
  trustGuaranteeFeeNaira?: number;
  /** Total pre-authorization amount in Naira */
  totalNaira?: number;
  /** Artisan display name for trust callout banner */
  artisanName?: string;
  /** Current pre-authorization status pill label */
  preAuthStatus?: 'Pre-Authorized' | 'Captured' | 'Refunded';
  /** Allow toggling breakdown details collapse (default: true) */
  showDetailsToggle?: boolean;
  /** Additional CSS class names */
  className?: string;
}

export const PriceBreakdown: React.FC<PriceBreakdownProps> = ({
  artisanRateNaira = 0,
  estimatedHours = 1,
  subtotalNaira,
  platformServiceFeeNaira,
  trustGuaranteeFeeNaira,
  totalNaira,
  artisanName,
  preAuthStatus = 'Pre-Authorized',
  showDetailsToggle = true,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  // Financial Calculations with Fallbacks
  const calculatedSubtotal = subtotalNaira ?? (artisanRateNaira * estimatedHours);
  const calculatedPlatformFee = platformServiceFeeNaira ?? (calculatedSubtotal * 0.10);
  const calculatedTrustFee = trustGuaranteeFeeNaira ?? (calculatedSubtotal * 0.075);
  const calculatedTotal = totalNaira ?? (calculatedSubtotal + calculatedPlatformFee + calculatedTrustFee);

  const formatNaira = (val: number) => `₦${Math.round(val).toLocaleString()}`;

  return (
    <div className={`bg-white border border-[#E9ECEF] rounded-[32px] p-6 shadow-sm space-y-4 transition-all ${className}`}>
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-[#E9ECEF] pb-3">
        <div className="flex items-center gap-2">
          <span className="font-display font-extrabold text-sm text-[#001A41]">
            Price Calculation Breakdown
          </span>
          <span className="text-[10px] text-[#296A4B] font-extrabold bg-[#296A4B]/10 border border-[#296A4B]/20 px-2.5 py-0.5 rounded-full">
            100% Transparent
          </span>
        </div>

        {showDetailsToggle && (
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs font-bold text-slate-500 hover:text-[#001A41] transition-colors focus:outline-none flex items-center gap-1"
            aria-expanded={isExpanded}
          >
            <span>{isExpanded ? 'Hide Details' : 'Show Details'}</span>
            <svg
              className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )}
      </div>

      {/* Itemized Calculation Rows */}
      {isExpanded && (
        <div className="space-y-3 text-xs font-body">
          <div className="flex justify-between items-center text-slate-600">
            <span>
              Artisan Labor ({estimatedHours} {estimatedHours === 1 ? 'hr' : 'hrs'} @ {formatNaira(artisanRateNaira)}/hr)
            </span>
            <span className="font-bold text-[#001A41]">{formatNaira(calculatedSubtotal)}</span>
          </div>

          <div className="flex justify-between items-center text-slate-600">
            <span className="flex items-center gap-1">
              <span>Platform Service Fee (10%)</span>
              <span className="text-[10px] text-slate-400" title="Includes matching, platform infrastructure, and 24/7 support">(?)</span>
            </span>
            <span className="font-bold text-[#001A41]">{formatNaira(calculatedPlatformFee)}</span>
          </div>

          <div className="flex justify-between items-center text-slate-600">
            <span className="flex items-center gap-1">
              <span>BukieGuarantee Insurance (7.5%)</span>
              <span className="text-[10px] text-slate-400" title="Provides up to ₦500,000 property protection and re-work guarantee">(?)</span>
            </span>
            <span className="font-bold text-[#001A41]">{formatNaira(calculatedTrustFee)}</span>
          </div>
        </div>
      )}

      {/* Total Hold Row */}
      <div className="border-t border-[#E9ECEF] pt-4 flex items-center justify-between">
        <div>
          <div className="font-display font-extrabold text-base text-[#001A41]">
            Total Pre-Authorization Hold
          </div>
          <div className="text-[11px] text-slate-500 font-body">
            Held in Milestone Escrow (No charge until approved)
          </div>
        </div>

        <div className="text-right">
          <div className="font-display font-extrabold text-xl text-[#296A4B]">
            {formatNaira(calculatedTotal)}
          </div>
          {preAuthStatus && (
            <span className="inline-block text-[10px] font-extrabold text-[#001A41] bg-[#001A41]/10 px-2 py-0.5 rounded-full uppercase tracking-wider mt-0.5">
              {preAuthStatus}
            </span>
          )}
        </div>
      </div>

      {/* Trust Callout Banner */}
      {artisanName && (
        <div className="text-[11px] text-slate-600 bg-[#F8F9FF] border border-slate-200/60 p-3.5 rounded-[16px] leading-relaxed flex items-start gap-2.5">
          <span className="text-base shrink-0 mt-0.5">🛡️</span>
          <div>
            <span className="font-bold text-[#001A41]">100% Artisan Payout Guarantee:</span>{' '}
            {artisanName} receives 100% of their set {formatNaira(artisanRateNaira)}/hr rate ({formatNaira(calculatedSubtotal)}). Platform fees fund verification, customer support, and property protection coverage.
          </div>
        </div>
      )}
    </div>
  );
};
```

---

### 2.3 Deliverable 3: `ChatBubble.tsx`

#### Overview & Requirements
- File Path: `packages/ui/src/components/ChatBubble.tsx`
- Layout: Self (`isSelf = true`) right-aligned in Deep Navy (`#001A41`) vs Recipient (`isSelf = false`) left-aligned in Card White.
- Displays sender name, role pill, timestamp, message body, and optional image attachment.
- Security Flag: Crimson Red container (`bg-red-50 border border-red-200 text-red-800`) triggered when `isFlaggedForBypass` is true, warning about off-platform contact/payment solicitation and voiding BukieGuarantee protection.

#### Proposed Code: `packages/ui/src/components/ChatBubble.tsx`
```tsx
import React from 'react';
import { ChatMessage, UserRole } from '@bukiebrainjobs/types';

export interface ChatBubbleProps {
  /** Optional ChatMessage object from @bukiebrainjobs/types */
  message?: ChatMessage;
  /** Sender display name (fallback if message object omitted) */
  senderName?: string;
  /** Sender role ('client' | 'artisan' | 'admin') */
  senderRole?: UserRole;
  /** Message text content (fallback if message object omitted) */
  text?: string;
  /** Formatted timestamp string (e.g. "10:42 AM") */
  timestamp?: string;
  /** Flagged by anti-bypass detection */
  isFlaggedForBypass?: boolean;
  /** Reason for anti-bypass security flag */
  flaggedReason?: string;
  /** Explicit self indicator. If omitted, calculated via senderRole === currentRole */
  isSelf?: boolean;
  /** Current viewer role (default: 'client') */
  currentRole?: UserRole;
  /** Additional CSS class names */
  className?: string;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({
  message,
  senderName,
  senderRole,
  text,
  timestamp,
  isFlaggedForBypass,
  flaggedReason,
  isSelf,
  currentRole = 'client',
  className = ''
}) => {
  const resolvedName = message?.senderName ?? senderName ?? 'User';
  const resolvedRole = message?.senderRole ?? senderRole ?? 'client';
  const resolvedText = message?.text ?? text ?? '';
  const resolvedTimestamp = message?.timestamp ?? timestamp ?? '';
  const resolvedFlagged = message?.isFlaggedForBypass ?? isFlaggedForBypass ?? false;
  const resolvedReason = message?.flaggedReason ?? flaggedReason;

  const me = isSelf ?? (resolvedRole === currentRole);

  return (
    <div className={`flex flex-col gap-1 max-w-[85%] ${me ? 'ml-auto items-end' : 'mr-auto items-start'} ${className}`}>
      {/* Sender Header */}
      <div className="flex items-center gap-2 px-1">
        <span className="text-[10px] font-bold text-slate-500">{resolvedName}</span>
        <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
          {resolvedRole}
        </span>
        <span className="text-[10px] text-slate-400">{resolvedTimestamp}</span>
      </div>

      {/* Bubble Box */}
      <div
        className={`p-4 rounded-[20px] text-xs font-body leading-relaxed transition-all shadow-2xs ${
          me
            ? 'bg-[#001A41] text-white rounded-tr-xs'
            : 'bg-white border border-[#E9ECEF] text-[#001A41] rounded-tl-xs'
        }`}
      >
        <p className="whitespace-pre-wrap break-words">{resolvedText}</p>

        {message?.imageUrl && (
          <div className="mt-2.5 overflow-hidden rounded-[12px] border border-white/20">
            <img src={message.imageUrl} alt="Chat attachment" className="max-h-48 w-full object-cover" />
          </div>
        )}
      </div>

      {/* Anti-Bypass Security Alert Callout Container */}
      {resolvedFlagged && (
        <div className="bg-red-50 border border-red-200 rounded-[16px] p-3 text-xs text-red-800 font-body flex items-start gap-2.5 shadow-sm mt-1 max-w-md">
          <div className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0 mt-0.5">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="space-y-1">
            <div className="font-display font-extrabold text-[11px] text-red-900 uppercase tracking-wider">
              Security Notice: Off-Platform Contact Terms Detected
            </div>
            <p className="text-[11px] leading-relaxed text-red-700">
              {resolvedReason || 'Off-platform contact or cash payment details detected. Keeping messages and payments in BukieBrainJobs guarantees your ₦500,000 BukieGuarantee insurance protection.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
```

---

### 2.4 Deliverable 4: `StepIndicator.tsx`

#### Overview & Requirements
- File Path: `packages/ui/src/components/StepIndicator.tsx`
- Renders step progress timeline tracker in horizontal or vertical orientation.
- Node States:
  - Completed (`idx < currentStepIndex`): Solid Emerald `#296A4B` circle with checkmark.
  - Active (`idx === currentStepIndex`): Deep Navy `#001A41` circle with pulse ring and index number.
  - Upcoming (`idx > currentStepIndex`): White circle with slate border and gray index.

#### Proposed Code: `packages/ui/src/components/StepIndicator.tsx`
```tsx
import React from 'react';

export interface StepItem {
  id: string;
  label: string;
  description?: string;
}

export interface StepIndicatorProps {
  /** Array of step definitions */
  steps: StepItem[];
  /** 0-indexed current active step */
  currentStepIndex: number;
  /** Layout orientation: 'horizontal' (default) or 'vertical' */
  orientation?: 'horizontal' | 'vertical';
  /** Additional CSS classes */
  className?: string;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  steps,
  currentStepIndex,
  orientation = 'horizontal',
  className = ''
}) => {
  if (orientation === 'vertical') {
    return (
      <div className={`space-y-6 ${className}`}>
        {steps.map((step, idx) => {
          const isDone = idx < currentStepIndex;
          const isCurrent = idx === currentStepIndex;

          return (
            <div key={step.id} className="flex items-start gap-4 relative">
              {/* Vertical Track Line */}
              {idx < steps.length - 1 && (
                <div
                  className={`absolute left-4 top-8 -bottom-6 w-0.5 ${
                    isDone ? 'bg-[#296A4B]' : 'bg-[#E9ECEF]'
                  }`}
                />
              )}

              {/* Node */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-display text-xs font-bold shrink-0 transition-all z-10 ${
                  isDone
                    ? 'bg-[#296A4B] text-white shadow-sm'
                    : isCurrent
                    ? 'bg-[#001A41] text-white ring-4 ring-[#001A41]/10 shadow-md scale-105'
                    : 'bg-white border-2 border-[#E9ECEF] text-slate-400'
                }`}
              >
                {isDone ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  idx + 1
                )}
              </div>

              {/* Label & Description */}
              <div className="pt-0.5">
                <div
                  className={`font-display text-xs font-bold ${
                    isCurrent ? 'text-[#001A41]' : isDone ? 'text-[#296A4B]' : 'text-slate-500'
                  }`}
                >
                  {step.label}
                </div>
                {step.description && (
                  <div className="font-body text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                    {step.description}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Horizontal Stepper
  const progressPercent = steps.length > 1 ? (currentStepIndex / (steps.length - 1)) * 100 : 0;

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between relative">
        {/* Background Track Line */}
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-[#E9ECEF] -translate-y-1/2 z-0" />

        {/* Active Progress Line */}
        <div
          className="absolute top-4 left-0 h-0.5 bg-[#296A4B] -translate-y-1/2 transition-all duration-500 z-0"
          style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
        />

        {/* Step Nodes */}
        {steps.map((step, idx) => {
          const isDone = idx < currentStepIndex;
          const isCurrent = idx === currentStepIndex;

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center group">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-display text-xs font-bold transition-all duration-300 ${
                  isDone
                    ? 'bg-[#296A4B] text-white shadow-sm'
                    : isCurrent
                    ? 'bg-[#001A41] text-white ring-4 ring-[#001A41]/10 shadow-md scale-110'
                    : 'bg-white border-2 border-[#E9ECEF] text-slate-400'
                }`}
              >
                {isDone ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  idx + 1
                )}
              </div>

              <span
                className={`text-[11px] font-bold mt-2 text-center transition-colors max-w-[90px] leading-tight ${
                  isCurrent ? 'text-[#001A41]' : isDone ? 'text-[#296A4B]' : 'text-slate-500'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
```

---

### 2.5 Deliverable 5: `MetricCard.tsx`

#### Overview & Requirements
- File Path: `packages/ui/src/components/MetricCard.tsx`
- KPI summary card for wallet balances, artisan earnings, and admin dashboard metrics.
- Display label, value, trend percentage indicator (+12.5% in Emerald or -3% in Crimson), icon badge slot, subtitle, and surface variants (`default`, `emerald`, `navy`, `amber`).

#### Proposed Code: `packages/ui/src/components/MetricCard.tsx`
```tsx
import React from 'react';

export interface MetricCardProps {
  /** Metric label title (e.g. "Available Balance") */
  label: string;
  /** Primary metric value (e.g. "₦450,000", "99.4%") */
  value: string | number;
  /** Optional trend percentage or string (e.g. "+12.5% vs last week") */
  trend?: string;
  /** Trend direction: true for positive (emerald), false for negative (red) */
  trendPositive?: boolean;
  /** Icon element slot */
  icon?: React.ReactNode;
  /** Subtitle or secondary caption */
  subtitle?: string;
  /** Surface color variant: 'default' | 'emerald' | 'navy' | 'amber' */
  variant?: 'default' | 'emerald' | 'navy' | 'amber';
  /** Additional CSS class names */
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  trend,
  trendPositive = true,
  icon,
  subtitle,
  variant = 'default',
  className = ''
}) => {
  const variantStyles = {
    default: {
      card: 'bg-white border-[#E9ECEF] text-[#001A41]',
      label: 'text-slate-500',
      value: 'text-[#001A41]',
      iconBg: 'bg-[#F8F9FF] text-[#001A41]',
      subtitle: 'text-slate-500'
    },
    emerald: {
      card: 'bg-[#296A4B]/5 border-[#296A4B]/20 text-[#001A41]',
      label: 'text-[#296A4B]',
      value: 'text-[#001A41]',
      iconBg: 'bg-[#296A4B] text-white',
      subtitle: 'text-slate-600'
    },
    navy: {
      card: 'bg-[#001A41] border-transparent text-white shadow-md',
      label: 'text-slate-300',
      value: 'text-white',
      iconBg: 'bg-white/10 text-white',
      subtitle: 'text-slate-300'
    },
    amber: {
      card: 'bg-amber-50/80 border-amber-200 text-amber-900',
      label: 'text-amber-800',
      value: 'text-amber-950',
      iconBg: 'bg-amber-200 text-amber-900',
      subtitle: 'text-amber-800'
    }
  };

  const currentVariant = variantStyles[variant] ?? variantStyles.default;

  return (
    <div
      className={`border rounded-[24px] p-5 shadow-xs space-y-2.5 transition-all duration-200 hover:shadow-[0_4px_20px_rgba(0,26,65,0.12)] ${currentVariant.card} ${className}`}
    >
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <span className={`font-body text-xs font-bold uppercase tracking-wider ${currentVariant.label}`}>
          {label}
        </span>
        {icon && (
          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${currentVariant.iconBg}`}>
            {icon}
          </div>
        )}
      </div>

      {/* Main Metric & Trend Badge */}
      <div className="flex items-baseline gap-2.5 flex-wrap">
        <span className={`font-display font-extrabold text-2xl tracking-tight ${currentVariant.value}`}>
          {value}
        </span>
        {trend && (
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-extrabold px-2 py-0.5 rounded-full ${
              trendPositive
                ? 'bg-[#296A4B]/15 text-[#296A4B] border border-[#296A4B]/20'
                : 'bg-red-100 text-red-700 border border-red-200'
            }`}
          >
            <span>{trendPositive ? '↑' : '↓'}</span>
            <span>{trend}</span>
          </span>
        )}
      </div>

      {/* Subtitle Caption */}
      {subtitle && (
        <p className={`font-body text-[11px] leading-relaxed ${currentVariant.subtitle}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
};
```

---

### 2.6 Deliverable 6: Index Export Alignment

#### Overview & Requirements
- Update `packages/ui/src/components/index.ts` to export all components and their respective prop types.
- Ensure `packages/ui/src/index.ts` re-exports all components (`export * from './components';`).

#### Proposed Code: `packages/ui/src/components/index.ts`
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
export type { EscrowProps, EscrowStatusType } from './EscrowShield';

export { StatusPill } from './StatusPill';
export type { StatusPillProps } from './StatusPill';

export { PriceBreakdown } from './PriceBreakdown';
export type { PriceBreakdownProps } from './PriceBreakdown';

export { ChatBubble } from './ChatBubble';
export type { ChatBubbleProps } from './ChatBubble';

export { StepIndicator } from './StepIndicator';
export type { StepIndicatorProps, StepItem } from './StepIndicator';

export { MetricCard } from './MetricCard';
export type { MetricCardProps } from './MetricCard';

export { EmptyState } from './EmptyState';
export type { EmptyStateProps } from './EmptyState';

export { StarRating } from './StarRating';
export type { StarRatingProps } from './StarRating';

export { SecurityBanner } from './SecurityBanner';
export type { SecurityBannerProps } from './SecurityBanner';

export { Avatar } from './Avatar';
export type { AvatarProps } from './Avatar';
```

#### Proposed Code: `packages/ui/src/index.ts`
```ts
export * from './tokens/colors';
export * from './tokens/spacing';
export * from './tokens/typography';
export * from './theme';
export * from './components';
```

---

## 3. Verification Method

1. **Local Package Typecheck**:
   ```bash
   cd "c:\Users\john.bisong\Bukie Workspace\bukiebrainjobs\packages\ui"
   npx tsc --noEmit
   ```
2. **Web Package Integration Typecheck**:
   ```bash
   cd "c:\Users\john.bisong\Bukie Workspace\bukiebrainjobs\apps\web"
   npx tsc --noEmit
   ```
3. **Workspace Full Build & Check**:
   ```bash
   cd "c:\Users\john.bisong\Bukie Workspace\bukiebrainjobs"
   npm run build
   ```

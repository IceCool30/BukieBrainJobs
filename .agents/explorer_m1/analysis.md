# Milestone 1 Technical Implementation Plan & Component Contracts

**Agent:** Explorer M1  
**Milestone:** M1 - Shared UI Existing Component Redesign  
**Working Directory:** `c:\Users\john.bisong\Bukie Workspace\bukiebrainjobs\.agents\explorer_m1`  
**Target Package:** `packages/ui/src/components/`  
**Date:** 2026-08-05  

---

## 1. Overview & Design Principles

Milestone 1 focuses on redesigning the 5 existing core shared UI components in `@bukiebrainjobs/ui`:
1. `Button.tsx`
2. `Card.tsx`
3. `InputField.tsx`
4. `BukiePassportBadge.tsx`
5. `EscrowShield.tsx`

All component redesigns adhere strictly to **Corporate Modern / Premium Minimalism** design tokens defined in `DESIGN.md`:
- **Primary Brand Navy (`#001A41`)**: High structural weight for headers, primary buttons, and card containers.
- **Emerald Green (`#296A4B`)**: High-conversion and success accent used strictly under 5% total screen area.
- **Corner Radii**:
  - Control radius: `16px` (`rounded-[16px]` or `rounded-xl`) for input fields and small controls.
  - Card radius: `32px` (`rounded-[32px]` or `rounded-3xl`) for cards, modals, and escrow containers.
  - Pill radius: `9999px` (`rounded-full`) for buttons and status badges.
- **Typography**: `Hanken Grotesk` (`font-display`) for titles/headings and `Inter` (`font-body`) for UI copy and body text.
- **Accessibility**: Keyboard focus rings, `aria-disabled`, `aria-busy`, `aria-describedby`, and minimum 44px touch targets on interactive controls.

---

## 2. Component Specifications & Component Contracts

### 2.1 `Button.tsx` Redesign

#### Interface Contract
```typescript
import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Text label for the button. Fallback to children if omitted. */
  label?: string;
  /** Visual variant. Primary (#001A41), Secondary (Outline Navy), Emerald (#296A4B), Outline (Slate), Ghost, Destructive (#DC2626). Accent maps to Emerald. */
  variant?: 'primary' | 'secondary' | 'emerald' | 'accent' | 'outline' | 'ghost' | 'destructive';
  /** Size variant matching touch target guidelines. */
  size?: 'sm' | 'md' | 'lg';
  /** Displays loading spinner and disables user interaction. */
  isLoading?: boolean;
  /** Icon rendered before label text. */
  leftIcon?: React.ReactNode;
  /** Icon rendered after label text. */
  rightIcon?: React.ReactNode;
  /** Full width block button toggle. */
  fullWidth?: boolean;
  /** Optional click handler alias. */
  onPress?: () => void;
}
```

#### Key Enhancements & Token Mappings
1. **Loading Spinner**:
   - Renders an inline SVG spinner when `isLoading` is true.
   - Sets `aria-busy="true"` and `aria-disabled="true"` on `<button>`.
   - Prevents click execution while loading or disabled.
2. **Disabled State**:
   - Class styling: `disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none`.
3. **Variants**:
   - `primary`: `bg-[#001A41] text-white hover:bg-[#000F2D] focus:ring-2 focus:ring-[#001A41] focus:ring-offset-2 shadow-sm`
   - `secondary`: `border border-[#001A41] text-[#001A41] bg-transparent hover:bg-[#001A41]/5 focus:ring-2 focus:ring-[#001A41] focus:ring-offset-2`
   - `emerald` / `accent`: `bg-[#296A4B] text-white hover:bg-[#205139] focus:ring-2 focus:ring-[#296A4B] focus:ring-offset-2 shadow-md`
   - `outline`: `border border-slate-300 text-slate-700 bg-transparent hover:bg-slate-50 focus:ring-2 focus:ring-slate-400 focus:ring-offset-2`
   - `ghost`: `bg-transparent text-[#001A41] hover:bg-[#001A41]/10 focus:ring-2 focus:ring-[#001A41] focus:ring-offset-2`
   - `destructive`: `bg-[#DC2626] text-white hover:bg-[#B91C1C] focus:ring-2 focus:ring-[#DC2626] focus:ring-offset-2 shadow-sm`
4. **Sizes**:
   - `sm`: `px-4 py-2 text-xs min-h-[36px] gap-1.5`
   - `md`: `px-6 py-3 text-sm min-h-[44px] gap-2`
   - `lg`: `px-8 py-4 text-base min-h-[52px] gap-2.5`

---

### 2.2 `Card.tsx` Redesign

#### Interface Contract
```typescript
import React from 'react';

export interface CardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Card header title (string or React element). */
  title?: React.ReactNode;
  /** Subtitle description copy below title. */
  subtitle?: React.ReactNode;
  /** Optional top banner image URL. */
  image?: string;
  /** Surface style variant. */
  variant?: 'default' | 'flat' | 'bordered';
  /** Padding options matching 8px grid rhythm. */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Enables pressable interaction with hover elevation and active scale down. */
  interactive?: boolean;
  /** Alias for interactive toggle. */
  isPressable?: boolean;
  /** Custom header container slot. */
  header?: React.ReactNode;
  /** Header action slot (e.g. status pill, icon button). */
  headerAction?: React.ReactNode;
  /** Footer container slot. */
  footer?: React.ReactNode;
  /** Click handler for interactive cards. */
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  /** Additional CSS class names. */
  className?: string;
  /** Card body content. */
  children?: React.ReactNode;
}
```

#### Key Enhancements & Token Mappings
1. **Corner Radius**:
   - Strict 32px corner radius: `rounded-[32px] overflow-hidden`.
2. **Padding Variants**:
   - `none`: `p-0`
   - `sm`: `p-4`
   - `md`: `p-6`
   - `lg`: `p-8`
3. **Interactive & Pressable Behavior**:
   - When `interactive || isPressable` is true:
     - Sets `role="button"` and `tabIndex={0}`.
     - Implements `onKeyDown` to trigger `onClick` when pressing Enter or Space.
     - Interactive styling: `transition-all duration-300 hover:shadow-[0_4px_20px_rgba(0,26,65,0.15)] hover:border-[#001A41]/20 cursor-pointer active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-[#001A41]/20`.
4. **Header Slots**:
   - Built-in header layout when `title` or `headerAction` is passed without explicit `header` node:
     - Container: `border-b border-[#E9ECEF] px-6 py-4 flex items-center justify-between gap-3`.
     - Title styling: `font-display text-lg font-bold text-[#001A41]`.
     - Subtitle styling: `font-body text-xs text-[#64748B] mt-0.5`.

---

### 2.3 `InputField.tsx` Redesign

#### Interface Contract
```typescript
import React from 'react';

export interface InputFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  /** Field label text. */
  label?: string;
  /** Helper text displayed below input field. */
  helperText?: string;
  /** Error message displayed below input field. Switches border to crimson. */
  error?: string;
  /** Left icon element slot. */
  leftIcon?: React.ReactNode;
  /** Right icon element slot. */
  rightIcon?: React.ReactNode;
  /** Maximum character length. Enables character counter. */
  maxLength?: number;
  /** Toggles character counter display when maxLength is provided. */
  showCounter?: boolean;
  /** Value change callback passing current string value directly. */
  onValueChange?: (value: string) => void;
  /** Standard ChangeEvent handler. */
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}
```

#### Key Enhancements & Token Mappings
1. **Control Radius**:
   - 16px corner radius: `rounded-[16px]`.
2. **Label & Focus State**:
   - Uppercase tracking label: `font-body text-xs font-bold text-[#001A41] uppercase tracking-wider`.
   - Focus transition: `transition-all duration-200 outline-none focus:bg-white focus:border-[#001A41] focus:ring-2 focus:ring-[#001A41]/10`.
3. **Error Handling & Accessibility**:
   - When `error` is present:
     - Border styling: `border-[#DC2626] focus:border-[#DC2626] focus:ring-[#DC2626]/10`.
     - Error slot text: `text-[#DC2626] font-body text-xs font-medium flex items-center gap-1.5 mt-1`.
     - Passes `aria-invalid="true"` and `aria-describedby={`${inputId}-error`}` to the `<input>`.
4. **Character Counter**:
   - When `maxLength` and `showCounter` are provided:
     - Renders counter text `${currentLength}/${maxLength}` in `text-xs text-[#64748B]` at the bottom right corner of the field footer.

---

### 2.4 `BukiePassportBadge.tsx` Redesign

#### Interface Contract
```typescript
import React from 'react';

export interface BukiePassportProps {
  /** Tier status level. Lite, Pro, or Unverified. */
  tier?: 'Lite' | 'Pro' | 'Unverified';
  /** National Identity Number (11-digit) verification status. */
  ninVerified?: boolean;
  /** Bank Verification Network audit status. */
  bvnVerified?: boolean;
  /** 1:1 facial biometric match status. */
  smartSelfieVerified?: boolean;
  /** Biometric verification match status alias. */
  biometricMatch?: boolean;
  /** Physical address & guarantor verification status (Tier 2 Pro requirement). */
  guarantorVerified?: boolean;
  /** Render compact pill badge. */
  compact?: boolean;
  /** Display full verification breakdown steps in card mode. */
  showDetails?: boolean;
  /** Additional CSS class names. */
  className?: string;
}
```

#### Key Enhancements & Token Mappings
1. **Animated Checkmark SVG**:
   - Renders an animated SVG path checkmark for verified items with a smooth stroke draw keyframe or scale bounce:
     ```html
     <svg className="w-3.5 h-3.5 text-[#296A4B] animate-checkmark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
       <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
     </svg>
     ```
2. **Tier Progression Stepper**:
   - Full card view displays a 4-step identity anchor progression visual bar:
     1. **Step 1: NIN Anchor** (NIMC 11-digit database check)
     2. **Step 2: SmartSelfie** (1:1 liveness & facial audit)
     3. **Step 3: Biometric Match** (BVN NIBSS audit)
     4. **Step 4: Guarantor Audit** (Tier 2 Pro verified address)
   - Visual progress bar highlights active tier (Tier 1 Lite: 75% complete; Tier 2 Pro: 100% complete).
3. **Compact Mode**:
   - Pill container (`rounded-full px-3 py-1 bg-[#296A4B]/10 text-[#296A4B] font-extrabold text-[11px] uppercase tracking-wide border border-[#296A4B]/20`) with animated shield checkmark.

---

### 2.5 `EscrowShield.tsx` Redesign

#### Interface Contract
```typescript
import React from 'react';

export type EscrowStatusType = 
  | 'PENDING_AUTHORIZATION' 
  | 'HELD_IN_ESCROW' 
  | 'RELEASED_TO_ARTISAN' 
  | 'REFUNDED'
  | 'Pre-Authorized'
  | 'Captured'
  | 'Refunded';

export interface EscrowProps {
  /** Monetary amount held in milestone escrow in Naira. */
  amount: number;
  /** Current state of escrow pre-authorization and disbursement. */
  status: EscrowStatusType;
  /** Compact pill view toggle. */
  compact?: boolean;
  /** Additional CSS class names. */
  className?: string;
}
```

#### Key Enhancements & 4 Distinct Escrow Visual States

| State | Enum Normalized | Container Surface | Icon & Accent | Subtitle Messaging | Status Pill Label |
|---|---|---|---|---|---|
| **1. Pending Auth** | `PENDING_AUTHORIZATION` | `bg-amber-50 border border-amber-200 text-amber-900` | Clock icon (`w-6 h-6 text-amber-700 animate-spin`) | "Authorizing pre-payment hold on client card..." | `Pre-Auth Pending` |
| **2. Held in Escrow** | `HELD_IN_ESCROW` | `bg-[#001A41] border border-transparent text-white shadow-md` | Lock Shield icon (`w-6 h-6 text-emerald-400`) | "Locked safely in Milestone Escrow. Released upon job completion approval." | `Funds Secured` |
| **3. Released to Artisan** | `RELEASED_TO_ARTISAN` | `bg-[#296A4B]/10 border border-[#296A4B]/30 text-[#296A4B]` | Shield Checkmark icon (`w-6 h-6 text-[#296A4B]`) | "Milestone complete - funds disbursed to artisan bank account." | `Disbursed` |
| **4. Refunded** | `REFUNDED` | `bg-red-50 border border-red-200 text-red-700` | Rotate / Shield Alert icon (`w-6 h-6 text-red-600`) | "Milestone canceled - pre-authorization hold returned to client." | `Refunded` |

---

## 3. Detailed Component Code Proposals (Proposed Source Files)

### 3.1 Proposed `Button.tsx` Implementation
```tsx
import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
  variant?: 'primary' | 'secondary' | 'emerald' | 'accent' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  onPress?: () => void;
}

export const Button: React.FC<ButtonProps> = ({ 
  label,
  children,
  variant = 'primary', 
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  onPress,
  disabled = false,
  className = '',
  onClick,
  ...props
}) => {
  const baseStyle = "inline-flex items-center justify-center font-body font-bold rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.98]";
  
  // Normalize accent to emerald
  const activeVariant = variant === 'accent' ? 'emerald' : variant;

  const variantStyles = {
    primary: "bg-[#001A41] text-white hover:bg-[#000F2D] focus:ring-[#001A41] shadow-sm",
    secondary: "border border-[#001A41] text-[#001A41] bg-transparent hover:bg-[#001A41]/5 focus:ring-[#001A41]",
    emerald: "bg-[#296A4B] text-white hover:bg-[#205139] focus:ring-[#296A4B] shadow-md",
    outline: "border border-slate-300 text-slate-700 bg-transparent hover:bg-slate-50 focus:ring-slate-400",
    ghost: "bg-transparent text-[#001A41] hover:bg-[#001A41]/10 focus:ring-[#001A41]",
    destructive: "bg-[#DC2626] text-white hover:bg-[#B91C1C] focus:ring-[#DC2626] shadow-sm"
  };

  const sizeStyles = {
    sm: "px-4 py-2 text-xs min-h-[36px] gap-1.5",
    md: "px-6 py-3 text-sm min-h-[44px] gap-2",
    lg: "px-8 py-4 text-base min-h-[52px] gap-2.5"
  };

  const content = label || children;
  const isButtonDisabled = disabled || isLoading;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isButtonDisabled) return;
    if (onPress) onPress();
    if (onClick) onClick(e);
  };

  return (
    <button 
      onClick={handleClick}
      disabled={isButtonDisabled}
      aria-busy={isLoading}
      aria-disabled={isButtonDisabled}
      className={`${baseStyle} ${variantStyles[activeVariant]} ${sizeStyles[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="inline-flex items-center gap-2">
          <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {content && <span className="opacity-90">{content}</span>}
        </span>
      ) : (
        <>
          {leftIcon && <span className="shrink-0">{leftIcon}</span>}
          {content && <span>{content}</span>}
          {rightIcon && <span className="shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};
```

---

### 3.2 Proposed `Card.tsx` Implementation
```tsx
import React from 'react';

export interface CardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  image?: string;
  variant?: 'default' | 'flat' | 'bordered';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  interactive?: boolean;
  isPressable?: boolean;
  header?: React.ReactNode;
  headerAction?: React.ReactNode;
  footer?: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  className?: string;
  children?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ 
  title, 
  subtitle, 
  image, 
  variant = 'default',
  padding = 'md',
  interactive = false,
  isPressable = false,
  header,
  headerAction,
  footer,
  onClick, 
  className = '',
  children,
  ...props
}) => {
  const isCardInteractive = interactive || isPressable;

  const paddingStyles = {
    none: "p-0",
    sm: "p-4",
    md: "p-6",
    lg: "p-8"
  };

  const variantStyles = {
    default: "bg-white border border-[#E9ECEF] shadow-sm",
    flat: "bg-[#F8F9FF] border border-transparent",
    bordered: "bg-white border-2 border-[#001A41]/10"
  };

  const interactiveStyles = isCardInteractive 
    ? "transition-all duration-300 hover:shadow-[0_4px_20px_rgba(0,26,65,0.15)] hover:border-[#001A41]/20 cursor-pointer active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-[#001A41]/20" 
    : "";

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isCardInteractive && onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick(e as unknown as React.MouseEvent<HTMLDivElement>);
    }
  };

  return (
    <div 
      onClick={isCardInteractive ? onClick : undefined}
      onKeyDown={handleKeyDown}
      role={isCardInteractive ? 'button' : undefined}
      tabIndex={isCardInteractive ? 0 : undefined}
      className={`rounded-[32px] overflow-hidden ${variantStyles[variant]} ${interactiveStyles} ${className}`}
      {...props}
    >
      {image && (
        <img 
          src={image} 
          alt={typeof title === 'string' ? title : 'Card banner'} 
          className="w-full h-48 object-cover" 
        />
      )}
      
      {header ? (
        <div className="border-b border-[#E9ECEF] px-6 py-4">
          {header}
        </div>
      ) : (title || headerAction) ? (
        <div className="border-b border-[#E9ECEF] px-6 py-4 flex items-center justify-between gap-3">
          <div>
            {title && (
              <h3 className="font-display text-lg font-bold text-[#001A41]">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="font-body text-xs text-[#64748B] mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          {headerAction && <div className="shrink-0">{headerAction}</div>}
        </div>
      ) : null}

      <div className={paddingStyles[padding]}>
        {!header && !headerAction && title && (
          <h3 className="font-display text-lg font-bold text-[#001A41] mb-1">
            {title}
          </h3>
        )}
        {!header && !headerAction && subtitle && (
          <p className="font-body text-sm text-[#64748B] mb-4">
            {subtitle}
          </p>
        )}
        {children}
      </div>

      {footer && (
        <div className="border-t border-[#E9ECEF] bg-[#F8F9FF]/50 px-6 py-3">
          {footer}
        </div>
      )}
    </div>
  );
};
```

---

### 3.3 Proposed `InputField.tsx` Implementation
```tsx
import React, { useState } from 'react';

export interface InputFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  maxLength?: number;
  showCounter?: boolean;
  onValueChange?: (value: string) => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const InputField: React.FC<InputFieldProps> = ({ 
  label, 
  helperText,
  error,
  leftIcon,
  rightIcon,
  maxLength,
  showCounter = false,
  onValueChange,
  onChange,
  className = '',
  id,
  type = 'text',
  value,
  disabled,
  ...props 
}) => {
  const [internalValue, setInternalValue] = useState<string>('');
  const currentValue = value !== undefined ? String(value) : internalValue;
  const currentLength = currentValue.length;

  const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);
  const errorId = inputId ? `${inputId}-error` : undefined;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInternalValue(e.target.value);
    if (onChange) onChange(e);
    if (onValueChange) onValueChange(e.target.value);
  };

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label 
          htmlFor={inputId}
          className="font-body text-xs font-bold text-[#001A41] uppercase tracking-wider"
        >
          {label}
        </label>
      )}

      <div className="relative flex items-center w-full">
        {leftIcon && (
          <div className="absolute left-3.5 text-[#64748B] pointer-events-none shrink-0">
            {leftIcon}
          </div>
        )}

        <input 
          id={inputId}
          type={type}
          value={value}
          maxLength={maxLength}
          disabled={disabled}
          onChange={handleChange}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          className={`w-full bg-[#F8F9FF] border text-sm text-[#001A41] font-body rounded-[16px] transition-all duration-200 outline-none placeholder:text-[#64748B]/60 focus:bg-white focus:border-[#001A41] focus:ring-2 focus:ring-[#001A41]/10 disabled:opacity-50 disabled:cursor-not-allowed ${
            leftIcon ? 'pl-10' : 'px-4'
          } ${rightIcon ? 'pr-10' : 'px-4'} py-3 ${
            error ? 'border-[#DC2626] focus:border-[#DC2626] focus:ring-[#DC2626]/10' : 'border-[#E9ECEF]'
          } ${className}`}
          {...props}
        />

        {rightIcon && (
          <div className="absolute right-3.5 text-[#64748B] shrink-0">
            {rightIcon}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 px-1">
        {error ? (
          <span id={errorId} className="font-body text-xs font-medium text-[#DC2626] flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {error}
          </span>
        ) : helperText ? (
          <span className="font-body text-xs text-[#64748B]">
            {helperText}
          </span>
        ) : <span />}

        {maxLength !== undefined && showCounter && (
          <span className="font-body text-xs text-[#64748B] shrink-0 ml-auto">
            {currentLength}/{maxLength}
          </span>
        )}
      </div>
    </div>
  );
};
```

---

### 3.4 Proposed `BukiePassportBadge.tsx` Implementation
```tsx
import React from 'react';

export interface BukiePassportProps {
  tier?: 'Lite' | 'Pro' | 'Unverified';
  ninVerified?: boolean;
  bvnVerified?: boolean;
  smartSelfieVerified?: boolean;
  biometricMatch?: boolean;
  guarantorVerified?: boolean;
  compact?: boolean;
  showDetails?: boolean;
  className?: string;
}

export const BukiePassportBadge: React.FC<BukiePassportProps> = ({
  tier = 'Lite',
  ninVerified = true,
  bvnVerified = true,
  smartSelfieVerified = true,
  biometricMatch = true,
  guarantorVerified = false,
  compact = false,
  showDetails = false,
  className = ''
}) => {
  const isBiometricVerified = bvnVerified || biometricMatch;
  const isVerified = tier !== 'Unverified' && (ninVerified || isBiometricVerified || smartSelfieVerified);

  if (compact) {
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold tracking-wide uppercase transition-all border ${
        tier === 'Pro' 
          ? 'bg-[#296A4B] text-white border-transparent shadow-sm' 
          : isVerified 
          ? 'bg-[#296A4B]/10 text-[#296A4B] border-[#296A4B]/20' 
          : 'bg-amber-50 text-amber-800 border-amber-200'
      } ${className}`}>
        <svg className="w-3.5 h-3.5 shrink-0 transition-transform duration-300 transform hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        <span>BUKIEPASSPORT {tier.toUpperCase()}</span>
      </span>
    );
  }

  const steps = [
    { label: 'NIN Anchor', verified: ninVerified, subtitle: '11-Digit Govt DB' },
    { label: 'SmartSelfie', verified: smartSelfieVerified, subtitle: '1:1 Face Liveness' },
    { label: 'Biometric Match', verified: isBiometricVerified, subtitle: 'BVN NIBSS Audit' },
    { label: 'Guarantor Audit', verified: guarantorVerified || tier === 'Pro', subtitle: 'Address & References' }
  ];

  return (
    <div className={`bg-white border border-[#E9ECEF] rounded-[32px] p-6 shadow-sm space-y-4 ${className}`}>
      <div className="flex items-center justify-between border-b border-[#E9ECEF] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#001A41] text-white flex items-center justify-center font-display text-xs font-extrabold shadow-sm">
            BP
          </div>
          <div>
            <div className="font-display font-bold text-base text-[#001A41]">BukiePassport Verification</div>
            <div className="text-xs text-[#64748B] font-medium">NIMC / NIBSS Biometric Identity Anchor</div>
          </div>
        </div>
        <span className={`text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${
          tier === 'Pro' 
            ? 'bg-[#296A4B] text-white' 
            : isVerified 
            ? 'bg-[#296A4B]/15 text-[#296A4B]' 
            : 'bg-amber-100 text-amber-800'
        }`}>
          {tier === 'Pro' ? 'Tier 2 Pro' : isVerified ? 'Tier 1 Lite' : 'Unverified'}
        </span>
      </div>

      {/* Tier Progression Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs font-bold text-[#001A41]">
          <span>Verification Tier Progression</span>
          <span>{tier === 'Pro' ? '4/4 Completed' : '3/4 Completed'}</span>
        </div>
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-[#296A4B] transition-all duration-500 rounded-full"
            style={{ width: tier === 'Pro' ? '100%' : isVerified ? '75%' : '25%' }}
          />
        </div>
      </div>

      {(showDetails || true) && (
        <div className="grid grid-cols-2 gap-3 pt-2">
          {steps.map((step, idx) => (
            <div key={idx} className="p-3 bg-[#F8F9FF] rounded-xl border border-slate-100 flex items-start gap-2.5">
              <div className={`mt-0.5 shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
                step.verified ? 'bg-[#296A4B] text-white' : 'bg-slate-200 text-slate-500'
              }`}>
                {step.verified ? (
                  <svg className="w-3.5 h-3.5 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className="text-[10px] font-bold">{idx + 1}</span>
                )}
              </div>
              <div>
                <div className="font-display font-bold text-xs text-[#001A41]">{step.label}</div>
                <div className="font-body text-[10px] text-[#64748B]">{step.subtitle}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
```

---

### 3.5 Proposed `EscrowShield.tsx` Implementation
```tsx
import React from 'react';

export type EscrowStatusType = 
  | 'PENDING_AUTHORIZATION' 
  | 'HELD_IN_ESCROW' 
  | 'RELEASED_TO_ARTISAN' 
  | 'REFUNDED'
  | 'Pre-Authorized'
  | 'Captured'
  | 'Refunded';

export interface EscrowProps {
  amount: number;
  status: EscrowStatusType;
  compact?: boolean;
  className?: string;
}

export const EscrowShield: React.FC<EscrowProps> = ({ 
  amount, 
  status,
  compact = false,
  className = ''
}) => {
  // Normalize status strings
  const normalizedStatus = 
    status === 'Pre-Authorized' ? 'HELD_IN_ESCROW' :
    status === 'Captured' ? 'RELEASED_TO_ARTISAN' :
    status === 'Refunded' ? 'REFUNDED' : status;

  const stateConfigs: Record<string, {
    container: string;
    pill: string;
    pillLabel: string;
    subtitle: string;
    icon: React.ReactNode;
  }> = {
    PENDING_AUTHORIZATION: {
      container: 'bg-amber-50 border-amber-200 text-amber-900',
      pill: 'bg-amber-200/80 text-amber-900',
      pillLabel: 'Pre-Auth Pending',
      subtitle: 'Authorizing pre-payment hold on client card...',
      icon: (
        <svg className="w-6 h-6 animate-spin text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )
    },
    HELD_IN_ESCROW: {
      container: 'bg-[#001A41] border-transparent text-white shadow-md',
      pill: 'bg-white/15 text-emerald-300 border border-white/20',
      pillLabel: 'Funds Secured',
      subtitle: 'Locked safely in Milestone Escrow. Released upon job completion approval.',
      icon: (
        <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      )
    },
    RELEASED_TO_ARTISAN: {
      container: 'bg-[#296A4B]/10 border-[#296A4B]/30 text-[#296A4B]',
      pill: 'bg-[#296A4B] text-white',
      pillLabel: 'Disbursed',
      subtitle: 'Milestone complete - funds disbursed to artisan bank account.',
      icon: (
        <svg className="w-6 h-6 text-[#296A4B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    },
    REFUNDED: {
      container: 'bg-red-50 border-red-200 text-red-700',
      pill: 'bg-red-600 text-white',
      pillLabel: 'Refunded',
      subtitle: 'Milestone canceled - pre-authorization hold returned to client.',
      icon: (
        <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      )
    }
  };

  const config = stateConfigs[normalizedStatus] || stateConfigs.HELD_IN_ESCROW;

  if (compact) {
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all border ${config.container} ${className}`}>
        <span className="w-3.5 h-3.5 flex items-center justify-center shrink-0">
          {config.icon}
        </span>
        <span>₦{amount.toLocaleString()} Escrow</span>
      </span>
    );
  }

  return (
    <div className={`flex flex-col items-center p-6 border rounded-[32px] text-center gap-3 shadow-sm ${config.container} ${className}`}>
      <div className="flex items-center justify-between w-full mb-1">
        <span className="text-[11px] font-extrabold uppercase tracking-wider opacity-80 font-body">BukieGuarantee Escrow</span>
        <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${config.pill}`}>
          {config.pillLabel}
        </span>
      </div>

      <div className="w-12 h-12 rounded-full flex items-center justify-center bg-white/10 border border-white/20">
        {config.icon}
      </div>

      <div className="font-display font-extrabold text-2xl tracking-tight">₦{amount.toLocaleString()}</div>
      <p className="font-body text-xs tracking-wide opacity-90 max-w-xs">{config.subtitle}</p>
    </div>
  );
};
```

---

## 4. Implementation Steps & Dependencies

### Implementation Sequence
1. Implement updated props & styles in `Button.tsx`.
2. Implement pressable props, header slots, and 32px radii in `Card.tsx`.
3. Implement label animations, error slots, and character counter in `InputField.tsx`.
4. Implement animated SVG checkmark & tier progression stepper in `BukiePassportBadge.tsx`.
5. Implement 4 distinct escrow states in `EscrowShield.tsx`.
6. Audit exports in `packages/ui/src/components/index.ts` to ensure clean re-exports.
7. Run `npm run type-check` across the Turborepo workspace.

---

## 5. Verification Method

To verify M1 deliverables independently:
1. **Type Checking**: Run `npm run type-check` in project root.
2. **Visual & Unit Checks**: Inspect the 5 component files in `packages/ui/src/components/` and verify all props match the defined TypeScript contracts.
3. **No Direct Source Editing**: Explorer M1 is read-only; implementers will execute code modifications based on this analysis document.

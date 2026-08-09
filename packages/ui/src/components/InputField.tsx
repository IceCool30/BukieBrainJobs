import React, { useState } from 'react';

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
  /** Maximum character length. Enables character counter when showCounter is true. */
  maxLength?: number;
  /** Toggles character counter display when maxLength is provided. */
  showCounter?: boolean;
  /** Callback passing current string value directly. */
  onValueChange?: (value: string) => void;
  /** Standard ChangeEvent handler. */
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
  disabled = false,
  defaultValue,
  ...props 
}) => {
  const [internalValue, setInternalValue] = useState<string>(
    value !== undefined ? String(value) : defaultValue !== undefined ? String(defaultValue) : ''
  );
  
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
          className="font-body text-xs font-bold text-[#001A41] uppercase tracking-wider transition-colors duration-200"
        >
          {label}
        </label>
      )}

      <div className="relative flex items-center w-full">
        {leftIcon && (
          <div className="absolute left-3.5 text-[#64748B] pointer-events-none shrink-0 flex items-center justify-center">
            {leftIcon}
          </div>
        )}

        <input 
          id={inputId}
          type={type}
          value={value}
          defaultValue={value === undefined ? defaultValue : undefined}
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
          <div className="absolute right-3.5 text-[#64748B] shrink-0 flex items-center justify-center">
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


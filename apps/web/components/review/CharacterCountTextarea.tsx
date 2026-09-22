'use client';

import React from 'react';
import { countUnicodeCharacters, MAX_REVIEW_COMMENT_LENGTH } from '../../lib/review/validation';

export interface CharacterCountTextareaProps {
  id?: string;
  label: string;
  description?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  maxLength?: number;
}

export function CharacterCountTextarea({
  id = 'review-comment',
  label,
  description,
  placeholder = 'Describe the service, workmanship, and overall experience...',
  value,
  onChange,
  disabled = false,
  maxLength = MAX_REVIEW_COMMENT_LENGTH,
}: CharacterCountTextareaProps) {
  const charCount = countUnicodeCharacters(value);
  const isOverflow = charCount > maxLength;
  const isApproaching = charCount > 900 && !isOverflow;
  const isLimitReached = charCount === maxLength;

  const getCounterColorClass = () => {
    if (isOverflow) return 'text-rose-600 font-bold';
    if (isLimitReached) return 'text-slate-900 font-bold';
    if (isApproaching) return 'text-amber-600 font-semibold';
    return 'text-slate-400';
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between">
        <label htmlFor={id} className="text-sm font-semibold text-[#001A41]">
          {label}
        </label>
      </div>

      {description && (
        <p className="text-xs text-slate-500">{description}</p>
      )}

      <textarea
        id={id}
        rows={4}
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        aria-label={label}
        aria-invalid={isOverflow ? 'true' : 'false'}
        aria-errormessage={isOverflow ? 'review-comment-error' : undefined}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-xl border p-3 text-sm min-h-[110px] transition-colors focus:outline-hidden focus:ring-2 disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed ${
          isOverflow
            ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
            : 'border-slate-200 focus:border-[#001A41] focus:ring-[#ABEEC8]'
        }`}
      />

      <div className="flex items-center justify-between">
        <div className="flex-1">
          {isOverflow && (
            <p id="review-comment-error" className="text-xs text-rose-600 font-medium">
              Written feedback cannot exceed 1,000 characters.
            </p>
          )}
        </div>
        <div
          aria-live="polite"
          aria-atomic="true"
          className={`text-xs ${getCounterColorClass()}`}
        >
          {charCount.toLocaleString()} / {maxLength.toLocaleString()} characters
        </div>
      </div>
    </div>
  );
}

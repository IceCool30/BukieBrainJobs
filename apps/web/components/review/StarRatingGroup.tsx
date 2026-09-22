'use client';

import React, { useRef } from 'react';
import { Star } from 'lucide-react';
import type { ReviewRating } from '../../lib/review/types';

export interface StarRatingGroupProps {
  criterionId: string;
  label: string;
  description?: string;
  value: ReviewRating | null;
  onChange: (value: ReviewRating) => void;
  disabled?: boolean;
  error?: string;
}

const RATING_LABELS: Record<ReviewRating, string> = {
  1: '1 of 5 • Poor',
  2: '2 of 5 • Fair',
  3: '3 of 5 • Good',
  4: '4 of 5 • Very good',
  5: '5 of 5 • Excellent',
};

const STAR_ARIA_LABELS: Record<ReviewRating, string> = {
  1: '1 of 5 stars, Poor',
  2: '2 of 5 stars, Fair',
  3: '3 of 5 stars, Good',
  4: '4 of 5 stars, Very good',
  5: '5 of 5 stars, Excellent',
};

export function StarRatingGroup({
  criterionId,
  label,
  description,
  value,
  onChange,
  disabled = false,
  error,
}: StarRatingGroupProps) {
  const radioRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (disabled) return;

    let targetIndex = -1;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      targetIndex = (index + 1) % 5;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      targetIndex = (index - 1 + 5) % 5;
    } else if (e.key === 'Home') {
      e.preventDefault();
      targetIndex = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      targetIndex = 4;
    }

    if (targetIndex !== -1) {
      const nextRating = (targetIndex + 1) as ReviewRating;
      onChange(nextRating);
      radioRefs.current[targetIndex]?.focus();
    }
  };

  return (
    <div className="space-y-1.5" data-testid={`rating-group-${criterionId}`}>
      <div className="flex items-baseline justify-between">
        <label id={`${criterionId}-label`} className="text-sm font-semibold text-[#001A41]">
          {label}
        </label>
        <span className="text-xs font-medium text-slate-500">
          {value ? RATING_LABELS[value] : 'Select a rating'}
        </span>
      </div>

      {description && (
        <p className="text-xs text-slate-500">{description}</p>
      )}

      <div
        role="radiogroup"
        aria-labelledby={`${criterionId}-label`}
        aria-required="true"
        aria-invalid={error ? 'true' : 'false'}
        className="flex items-center gap-1"
      >
        {([1, 2, 3, 4, 5] as ReviewRating[]).map((starRating, idx) => {
          const isSelected = value !== null && starRating <= value;
          const isChecked = value === starRating;

          return (
            <button
              key={starRating}
              ref={(el) => {
                radioRefs.current[idx] = el;
              }}
              type="button"
              role="radio"
              aria-checked={isChecked}
              aria-label={STAR_ARIA_LABELS[starRating]}
              disabled={disabled}
              onClick={() => onChange(starRating)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              className="flex items-center justify-center min-w-[44px] min-h-[44px] w-11 h-11 p-2 rounded-lg transition-colors focus:outline-hidden focus:ring-2 focus:ring-[#ABEEC8] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
            >
              <Star
                className={`w-7 h-7 transition-colors ${
                  isSelected
                    ? 'text-amber-500 fill-amber-500'
                    : 'text-slate-300 stroke-1'
                }`}
                aria-hidden="true"
              />
            </button>
          );
        })}
      </div>

      {error && (
        <p className="text-xs text-rose-600 font-medium">{error}</p>
      )}
    </div>
  );
}

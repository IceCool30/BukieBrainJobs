import React from 'react';

export interface StarRatingProps {
  rating: number; // e.g. 4.9
  reviewCount?: number;
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  reviewCount,
  interactive = false,
  onRatingChange,
  size = 'md',
  className = ''
}) => {
  const stars = [1, 2, 3, 4, 5];

  const sizeClasses = {
    sm: 'w-3.5 h-3.5 text-xs',
    md: 'w-4 h-4 text-sm',
    lg: 'w-6 h-6 text-xl'
  };

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <div className="flex items-center gap-0.5">
        {stars.map((star) => {
          const isFilled = rating >= star;
          const isHalf = rating >= star - 0.5 && rating < star;

          return (
            <button
              key={star}
              type="button"
              disabled={!interactive}
              onClick={() => interactive && onRatingChange && onRatingChange(star)}
              className={`${sizeClasses[size]} ${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform focus:outline-none`}
            >
              <span className={isFilled ? 'text-[#F59E0B]' : isHalf ? 'text-[#F59E0B]' : 'text-slate-300'}>
                ★
              </span>
            </button>
          );
        })}
      </div>

      <span className="font-body text-xs font-bold text-[#001A41]">
        {rating.toFixed(1)}
      </span>

      {reviewCount !== undefined && (
        <span className="font-body text-xs text-[#64748B]">
          ({reviewCount})
        </span>
      )}
    </div>
  );
};

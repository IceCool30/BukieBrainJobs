import React from 'react';

export interface AvatarProps {
  src: string;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | undefined;
  isBukieStar?: boolean | undefined;
  isVerified?: boolean | undefined;
  className?: string | undefined;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name,
  size = 'md',
  isBukieStar = false,
  isVerified = false,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-base',
    xl: 'w-24 h-24 text-xl'
  };

  const badgeSizes = {
    sm: 'w-3 h-3 text-[8px]',
    md: 'w-4 h-4 text-[10px]',
    lg: 'w-5 h-5 text-xs',
    xl: 'w-7 h-7 text-sm'
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <img
        src={src}
        alt={name}
        className={`${sizeClasses[size]} rounded-full object-cover border-2 border-[#001A41] shadow-sm`}
      />

      {isBukieStar && (
        <span 
          title="BukieStar Elite (Top 15%)"
          className={`absolute -bottom-1 -right-1 bg-[#F59E0B] text-slate-950 rounded-full flex items-center justify-center font-extrabold shadow-sm ${badgeSizes[size]}`}
        >
          ★
        </span>
      )}

      {!isBukieStar && isVerified && (
        <span 
          title="BukiePassport Verified"
          className={`absolute -bottom-1 -right-1 bg-[#296A4B] text-white rounded-full flex items-center justify-center font-bold shadow-sm ${badgeSizes[size]}`}
        >
          ✓
        </span>
      )}
    </div>
  );
};

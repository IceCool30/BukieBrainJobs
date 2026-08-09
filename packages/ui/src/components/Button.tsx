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
  
  // Map legacy 'accent' variant to emerald green (#296A4B)
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


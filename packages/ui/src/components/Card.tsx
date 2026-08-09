import React from 'react';

export interface CardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Card header title (string or React element). */
  title?: React.ReactNode;
  /** Subtitle description copy below title. */
  subtitle?: React.ReactNode;
  /** Optional top banner image URL. */
  image?: string;
  /** Surface style variant. Default (#FFFFFF with subtle border & shadow), flat (#F8F9FF), bordered (navy 2px border). */
  variant?: 'default' | 'flat' | 'bordered';
  /** Padding options matching 8px grid rhythm. Default is 'md' (p-6). */
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
    default: "bg-[#FFFFFF] border border-[#E9ECEF] shadow-sm",
    flat: "bg-[#F8F9FF] border border-transparent",
    bordered: "bg-[#FFFFFF] border-2 border-[#001A41]/10"
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

  const hasHeaderSlot = !!(header || headerAction);

  return (
    <div 
      onClick={isCardInteractive ? (onClick as (e: React.MouseEvent<HTMLDivElement>) => void) : undefined}
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
      ) : headerAction ? (
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
          <div className="shrink-0">{headerAction}</div>
        </div>
      ) : null}

      <div className={paddingStyles[padding]}>
        {!hasHeaderSlot && title && (
          <h3 className="font-display text-lg font-bold text-[#001A41] mb-1">
            {title}
          </h3>
        )}
        {!hasHeaderSlot && subtitle && (
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


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
  className = '',
}) => {
  const variantStyles = {
    default: {
      card: 'bg-white border-[#E9ECEF] text-[#001A41]',
      label: 'text-slate-500',
      value: 'text-[#001A41]',
      iconBg: 'bg-[#F8F9FF] text-[#001A41]',
      subtitle: 'text-slate-500',
    },
    emerald: {
      card: 'bg-[#296A4B]/5 border-[#296A4B]/20 text-[#001A41]',
      label: 'text-[#296A4B]',
      value: 'text-[#001A41]',
      iconBg: 'bg-[#296A4B] text-white',
      subtitle: 'text-slate-600',
    },
    navy: {
      card: 'bg-[#001A41] border-transparent text-white shadow-md',
      label: 'text-slate-300',
      value: 'text-white',
      iconBg: 'bg-white/10 text-white',
      subtitle: 'text-slate-300',
    },
    amber: {
      card: 'bg-amber-50/80 border-amber-200 text-amber-900',
      label: 'text-amber-800',
      value: 'text-amber-950',
      iconBg: 'bg-amber-200 text-amber-900',
      subtitle: 'text-amber-800',
    },
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

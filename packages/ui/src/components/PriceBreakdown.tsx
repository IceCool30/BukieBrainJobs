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
  className = '',
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
            className="text-xs font-bold text-slate-500 hover:text-[#001A41] transition-colors focus:outline-none flex items-center gap-1 cursor-pointer"
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
              Artisan Labor ({estimatedHours} {estimatedHours === 1 ? 'hr' : 'hrs'}
              {artisanRateNaira > 0 ? ` @ ${formatNaira(artisanRateNaira)}/hr` : ''})
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
            {artisanName} receives 100% of their set {artisanRateNaira > 0 ? `${formatNaira(artisanRateNaira)}/hr rate ` : ''}({formatNaira(calculatedSubtotal)}). Platform fees fund verification, customer support, and property protection coverage.
          </div>
        </div>
      )}
    </div>
  );
};

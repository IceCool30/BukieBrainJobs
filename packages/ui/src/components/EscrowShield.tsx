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
  /** Amount held in milestone escrow in Naira. */
  amount: number;
  /** Current state of escrow pre-authorization and disbursement. */
  status: EscrowStatusType;
  /** Compact pill view toggle. */
  compact?: boolean;
  /** Additional CSS class names. */
  className?: string;
}

interface EscrowStateConfig {
  container: string;
  pill: string;
  pillLabel: string;
  subtitle: string;
  icon: React.ReactNode;
}

const DEFAULT_CONFIG: EscrowStateConfig = {
  container: 'bg-[#001A41] border-transparent text-white shadow-md',
  pill: 'bg-white/15 text-emerald-300 border border-white/20',
  pillLabel: 'Funds Secured',
  subtitle: 'Locked safely in Milestone Escrow. Released upon job completion approval.',
  icon: (
    <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  )
};

const stateConfigs: Record<string, EscrowStateConfig> = {
  PENDING_AUTHORIZATION: {
    container: 'bg-amber-50 border border-amber-200 text-amber-900',
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
  HELD_IN_ESCROW: DEFAULT_CONFIG,
  RELEASED_TO_ARTISAN: {
    container: 'bg-[#296A4B]/10 border border-[#296A4B]/30 text-[#296A4B]',
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
    container: 'bg-red-50 border border-red-200 text-red-700',
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

export const EscrowShield: React.FC<EscrowProps> = ({ 
  amount, 
  status,
  compact = false,
  className = ''
}) => {
  // Normalize status string
  const normalizedStatus = 
    status === 'Pre-Authorized' ? 'HELD_IN_ESCROW' :
    status === 'Captured' ? 'RELEASED_TO_ARTISAN' :
    status === 'Refunded' ? 'REFUNDED' : status;

  const config: EscrowStateConfig = stateConfigs[normalizedStatus] ?? DEFAULT_CONFIG;

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
    <div className={`flex flex-col items-center p-6 rounded-[32px] text-center gap-3 shadow-sm ${config.container} ${className}`}>
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

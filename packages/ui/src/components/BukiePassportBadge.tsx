import React from 'react';

export interface BukiePassportProps {
  /** Verification tier level. Lite, Pro, or Unverified. */
  tier?: 'Lite' | 'Pro' | 'Unverified';
  /** National Identity Number (11-digit) verification status. */
  ninVerified?: boolean;
  /** Bank Verification Network audit status. */
  bvnVerified?: boolean;
  /** 1:1 facial biometric match status. */
  smartSelfieVerified?: boolean;
  /** Biometric verification match status alias. */
  biometricMatch?: boolean;
  /** Physical address & guarantor verification status (Tier 2 Pro requirement). */
  guarantorVerified?: boolean;
  /** Render compact pill badge. */
  compact?: boolean;
  /** Display full verification breakdown steps in card mode. */
  showDetails?: boolean;
  /** Additional CSS class names. */
  className?: string;
}

export const BukiePassportBadge: React.FC<BukiePassportProps> = ({
  tier = 'Lite',
  ninVerified = true,
  bvnVerified = true,
  smartSelfieVerified = true,
  biometricMatch = true,
  guarantorVerified = false,
  compact = false,
  showDetails = false,
  className = ''
}) => {
  const isBiometricVerified = bvnVerified || biometricMatch;
  const isVerified = tier !== 'Unverified' && (ninVerified || isBiometricVerified || smartSelfieVerified);

  if (compact) {
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold tracking-wide uppercase transition-all border ${
        tier === 'Pro' 
          ? 'bg-[#296A4B] text-white border-transparent shadow-sm' 
          : isVerified 
          ? 'bg-[#296A4B]/10 text-[#296A4B] border-[#296A4B]/20' 
          : 'bg-amber-50 text-amber-800 border-amber-200'
      } ${className}`}>
        <svg className="w-3.5 h-3.5 shrink-0 transition-transform duration-300 transform hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        <span>BUKIEPASSPORT {tier.toUpperCase()}</span>
      </span>
    );
  }

  const steps = [
    { label: 'NIN Anchor', verified: ninVerified, subtitle: '11-Digit Govt DB' },
    { label: 'SmartSelfie', verified: smartSelfieVerified, subtitle: '1:1 Face Liveness' },
    { label: 'Biometric Match', verified: isBiometricVerified, subtitle: 'BVN NIBSS Audit' },
    { label: 'Guarantor Audit', verified: guarantorVerified || tier === 'Pro', subtitle: 'Address & References' }
  ];

  const completedCount = steps.filter(s => s.verified).length;
  const progressPercent = tier === 'Pro' ? 100 : tier === 'Lite' ? Math.max(75, (completedCount / 4) * 100) : 0;

  return (
    <div className={`bg-white border border-[#E9ECEF] rounded-[32px] p-6 shadow-sm space-y-4 ${className}`}>
      <div className="flex items-center justify-between border-b border-[#E9ECEF] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#001A41] text-white flex items-center justify-center font-display text-xs font-extrabold shadow-sm">
            BP
          </div>
          <div>
            <div className="font-display font-bold text-base text-[#001A41]">BukiePassport Verification</div>
            <div className="text-xs text-[#64748B] font-medium">NIMC / NIBSS Biometric Identity Anchor</div>
          </div>
        </div>
        <span className={`text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${
          tier === 'Pro' 
            ? 'bg-[#296A4B] text-white' 
            : isVerified 
            ? 'bg-[#296A4B]/15 text-[#296A4B]' 
            : 'bg-amber-100 text-amber-800'
        }`}>
          {tier === 'Pro' ? 'Tier 2 Pro' : isVerified ? 'Tier 1 Lite' : 'Unverified'}
        </span>
      </div>

      {/* Tier Progression Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs font-bold text-[#001A41]">
          <span>Verification Tier Progression</span>
          <span>{tier === 'Pro' ? '4/4 Completed' : `${completedCount}/4 Completed`}</span>
        </div>
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-[#296A4B] transition-all duration-500 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {(showDetails || true) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {steps.map((step, idx) => (
            <div key={idx} className="p-3 bg-[#F8F9FF] rounded-xl border border-slate-100 flex items-start gap-2.5">
              <div className={`mt-0.5 shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300 ${
                step.verified ? 'bg-[#296A4B] text-white' : 'bg-slate-200 text-slate-500'
              }`}>
                {step.verified ? (
                  <svg className="w-3.5 h-3.5 stroke-current transition-transform duration-300 transform scale-100" fill="none" viewBox="0 0 24 24" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className="text-[10px] font-bold">{idx + 1}</span>
                )}
              </div>
              <div>
                <div className="font-display font-bold text-xs text-[#001A41]">{step.label}</div>
                <div className="font-body text-[10px] text-[#64748B]">{step.subtitle}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};


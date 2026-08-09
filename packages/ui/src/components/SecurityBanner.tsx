import React from 'react';

export interface SecurityBannerProps {
  type?: 'phone_masking' | 'anti_bypass' | 'escrow_protection';
  maskedPhone?: string;
  className?: string;
}

export const SecurityBanner: React.FC<SecurityBannerProps> = ({
  type = 'anti_bypass',
  maskedPhone,
  className = ''
}) => {
  return (
    <div className={`bg-[#001A41] text-white rounded-[20px] p-4 shadow-sm flex items-start gap-3 border border-white/10 ${className}`}>
      <div className="w-8 h-8 rounded-full bg-[#296A4B] text-white flex items-center justify-center shrink-0 mt-0.5 font-bold text-sm">
        🛡️
      </div>

      <div className="space-y-1 text-xs font-body">
        <div className="font-display font-bold text-white flex items-center gap-2">
          <span>BukieGuarantee & Escrow Protected</span>
          {maskedPhone && (
            <span className="bg-white/10 text-emerald-300 text-[10px] px-2 py-0.5 rounded-full font-mono">
              Phone: {maskedPhone}
            </span>
          )}
        </div>
        <p className="text-slate-300 leading-relaxed text-[11px]">
          Always complete bookings and payments in-app. Off-platform cash/WhatsApp arrangements void ₦500k BukieGuarantee protection and bypass escrow safety.
        </p>
      </div>
    </div>
  );
};

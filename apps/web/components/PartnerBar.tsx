import { ShieldCheck, CreditCard, Fingerprint } from 'lucide-react';

export default function PartnerBar() {
  return (
    <section aria-label="Payment and verification partners" className="bg-white border-b border-slate-200">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          <div className="flex items-center gap-2.5">
            <CreditCard className="w-5 h-5 text-slate-600" />
            <span className="text-sm font-bold tracking-wide text-slate-600 uppercase">Paystack</span>
          </div>
          <div className="flex items-center gap-2.5">
            <CreditCard className="w-5 h-5 text-slate-600" />
            <span className="text-sm font-bold tracking-wide text-slate-600 uppercase">Flutterwave</span>
          </div>
          <div className="hidden sm:block w-px h-6 bg-slate-200" />
          <div className="flex items-center gap-2.5">
            <Fingerprint className="w-5 h-5 text-slate-600" />
            <span className="text-sm font-medium text-slate-700">NIN verification available</span>
          </div>
          <div className="hidden sm:block w-px h-6 bg-slate-200" />
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-[#296A4B]" />
            <span className="text-sm font-medium text-slate-700">Escrow available for eligible bookings</span>
          </div>
        </div>
      </div>
    </section>
  );
}

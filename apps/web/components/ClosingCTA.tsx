import { Search, ArrowRight, Briefcase } from 'lucide-react';

interface ClosingCTAProps {
  onPostJobClick?: () => void;
}

export default function ClosingCTA({ onPostJobClick }: ClosingCTAProps) {
  return (
    <section aria-label="Final call to action" className="relative bg-[#F8F9FF] overflow-hidden">
      <div className="relative max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-6">
        <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-[#001A41] leading-tight">
          Ready to get the job done?
        </h2>
        <p className="text-base text-slate-500 max-w-xl mx-auto">
          Search for a service or post a job. Review your options, agree the details, and use Escrow for eligible bookings.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onPostJobClick}
            className="inline-flex items-center gap-2.5 bg-[#296A4B] hover:bg-[#1f5239] active:bg-[#17402c] text-white font-semibold text-[15px] rounded-xl px-7 h-[52px] shadow-[0_8px_24px_-8px_rgba(41,106,75,0.6)] transition-all"
            style={{ borderRadius: '16px' }}
          >
            <Briefcase className="w-[18px] h-[18px]" />
            Post a job
          </button>
          <a
            href="#services"
            className="inline-flex items-center gap-2.5 border border-[#001A41]/25 hover:border-[#001A41] text-[#001A41] font-semibold text-[15px] rounded-xl px-7 h-[52px] transition-colors"
            style={{ borderRadius: '16px' }}
          >
            <Search className="w-[18px] h-[18px]" />
            Explore services
          </a>
        </div>
        <p className="text-xs text-slate-500 pt-2">
          <ArrowRight className="w-3.5 h-3.5 inline mr-1 -mt-0.5" />
          Availability depends on the service and your location.
        </p>
      </div>
    </section>
  );
}

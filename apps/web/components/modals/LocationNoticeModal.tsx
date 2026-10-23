'use client';

import { useEffect } from 'react';
import { MapPin, X } from 'lucide-react';
import { NigerianLocation } from '../../lib/mock/homepage-data';

interface LocationNoticeModalProps {
  location: NigerianLocation | null;
  onClose: () => void;
}

export default function LocationNoticeModal({ location, onClose }: LocationNoticeModalProps) {
  useEffect(() => {
    if (!location) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [location, onClose]);

  if (!location) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#001A41]/65 p-4" role="dialog" aria-modal="true" aria-labelledby="location-notice-title">
      <section className="relative w-full max-w-md space-y-5 rounded-2xl border border-[var(--lead)] bg-[var(--card-bg)] p-6 text-center shadow-2xl sm:p-8">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close location notice"
          className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-xl text-[var(--text-muted)] transition-colors hover:bg-[var(--card-hover)] hover:text-[var(--text-main)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#296A4B]"
        >
          <X className="h-5 w-5" />
        </button>

        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--amber-dim)] text-[var(--amber)]">
          <MapPin className="h-6 w-6" />
        </span>

        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--amber)]">Service locations</p>
          <h3 id="location-notice-title" className="font-display text-xl font-bold text-[var(--text-main)]">Find services in {location.name}</h3>
          <p className="text-sm leading-relaxed text-[var(--text-muted)]">Explore services that fit the work you need done in {location.name}, {location.state}.</p>
          <p className="text-sm leading-relaxed text-[var(--text-muted)]">Choose a location to find services near you.</p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="motion-press inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--amber)] px-5 text-sm font-bold text-[#001A41] transition-colors hover:bg-[var(--amber-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ABEEC8] focus-visible:ring-offset-2"
        >
          Choose another location
        </button>
      </section>
    </div>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import { ShieldCheck } from 'lucide-react';

export const THEME_STORAGE_KEY = 'bukiebrainjobs-theme';

export type ThemeMode = 'light' | 'dark';

export function getInitialTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'light';
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

export function applyTheme(theme: ThemeMode) {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-theme', theme);
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // ignore local storage errors
  }
  window.dispatchEvent(new CustomEvent('bukie-theme-change', { detail: { theme } }));
}

export default function TradesTelemetryBar() {
  const [theme, setTheme] = useState<ThemeMode>('light');

  useEffect(() => {
    const initial = getInitialTheme();
    setTheme(initial);
    applyTheme(initial);

    const onStorage = (e: StorageEvent) => {
      if (e.key === THEME_STORAGE_KEY && (e.newValue === 'light' || e.newValue === 'dark')) {
        setTheme(e.newValue);
        applyTheme(e.newValue);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const handleSelectTheme = (mode: ThemeMode) => {
    setTheme(mode);
    applyTheme(mode);
  };

  return (
    <aside
      aria-label="Platform Telemetry and Theme Bar"
      className="fixed top-0 inset-x-0 z-[60] w-full h-8 sm:h-9 bg-[var(--strip-bg)] text-[var(--strip-text)] border-b border-[var(--lead)] px-3 sm:px-6 text-xs font-mono transition-colors duration-200 flex items-center pointer-events-auto shadow-xs"
    >
      <div className="w-full max-w-7xl mx-auto flex items-center justify-between gap-2">
        {/* Left item: Telemetry Beacon & Grid Indicator */}
        <div className="flex items-center gap-2 text-[11px] sm:text-xs">
          <span className="telemetry-beacon flex-shrink-0" aria-hidden="true" />
          <span className="font-semibold tracking-wide uppercase text-white/95">
            VERIFIED TRADES INDEX
          </span>
          <span className="hidden md:inline text-[var(--strip-text)]/60">
            {'// NIGERIA INFRASTRUCTURE GRID'}
          </span>
        </div>

        {/* Middle item: Active verified requisition counter */}
        <div className="hidden sm:flex items-center gap-1.5 text-[11px] sm:text-xs text-[var(--strip-text)]/90">
          <span className="font-bold text-[var(--brand-green)]">24</span>
          <span>ACTIVE TRADES REQUISITIONS</span>
        </div>

        {/* Right item: Escrow security & Theme switcher */}
        <div className="flex items-center gap-3 sm:gap-4 ml-auto sm:ml-0">
          <div className="flex items-center gap-1.5 text-[11px] text-[var(--brand-green)]">
            <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
            <span className="hidden xs:inline font-medium">BukieGuarantee™ Escrow Locked</span>
          </div>

          {/* Segmented Industrial Theme Switcher */}
          <div
            className="theme-toggle inline-flex items-center p-0.5 rounded-md bg-white/10 border border-white/15 text-[11px] font-mono select-none"
            role="radiogroup"
            aria-label="Theme mode selector"
          >
            <button
              type="button"
              role="radio"
              aria-checked={theme === 'light'}
              id="lightBtn"
              onClick={() => handleSelectTheme('light')}
              className={`px-2 py-0.5 rounded transition-all flex items-center gap-1 cursor-pointer ${
                theme === 'light'
                  ? 'bg-[var(--card-bg)] text-[var(--amber)] shadow-xs font-bold'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              <span aria-hidden="true">☀</span> LIGHT
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={theme === 'dark'}
              id="darkBtn"
              onClick={() => handleSelectTheme('dark')}
              className={`px-2 py-0.5 rounded transition-all flex items-center gap-1 cursor-pointer ${
                theme === 'dark'
                  ? 'bg-[var(--card-bg)] text-[var(--amber)] shadow-xs font-bold'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              <span aria-hidden="true">☾</span> DARK
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}

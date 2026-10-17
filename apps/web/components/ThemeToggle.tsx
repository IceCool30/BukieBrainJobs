'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import {
  THEME_STORAGE_KEY,
  TradesTheme,
  applyTheme,
  isTradesTheme,
} from '../lib/theme';

interface ThemeToggleProps {
  idPrefix?: string;
  className?: string;
}

function readDocumentTheme(): TradesTheme {
  const current = document.documentElement.getAttribute('data-theme');
  return isTradesTheme(current) ? current : 'light';
}

function crossFade() {
  const root = document.documentElement;
  root.classList.add('theme-switching');
  window.setTimeout(() => root.classList.remove('theme-switching'), 300);
}

/**
 * Starts as 'light' on both server and first client pass so hydration always matches.
 * Thumb position and icon come from CSS on html[data-theme], so the right state shows
 * before the effect below syncs the accessible label.
 */
export default function ThemeToggle({ idPrefix = 'theme', className = '' }: ThemeToggleProps) {
  const [theme, setTheme] = useState<TradesTheme>('light');

  useEffect(() => {
    setTheme(readDocumentTheme());
    const onStorage = (event: StorageEvent) => {
      if (event.key !== THEME_STORAGE_KEY || !isTradesTheme(event.newValue)) return;
      applyTheme(event.newValue);
      setTheme(event.newValue);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const toggle = useCallback(() => {
    const next: TradesTheme = readDocumentTheme() === 'light' ? 'dark' : 'light';
    crossFade();
    try {
      applyTheme(next, window.localStorage);
    } catch {
      applyTheme(next);
    }
    setTheme(next);
  }, []);

  const isDark = theme === 'dark';
  const label = isDark ? 'Switch to light theme' : 'Switch to dark theme';

  return (
    <button
      type="button"
      id={`${idPrefix}-toggle`}
      aria-label={label}
      title={label}
      data-theme-state={theme}
      data-state={isDark ? 'checked' : 'unchecked'}
      onClick={toggle}
      className={`theme-toggle relative inline-flex h-7 w-14 shrink-0 cursor-pointer items-center rounded-full p-0.5 ${className}`}
    >
      <span
        className="pointer-events-none absolute inset-0 flex items-center justify-between px-2 select-none"
        aria-hidden="true"
      >
        <Sun className="h-3.5 w-3.5 text-[var(--amber)] opacity-70" />
        <Moon className="h-3.5 w-3.5 text-[var(--brand-green)] opacity-70" />
      </span>
      <span
        className="theme-toggle-thumb pointer-events-none relative z-10 flex h-6 w-6 items-center justify-center rounded-full transition-transform duration-200 ease-out"
        aria-hidden="true"
      >
        <Sun className="icon-sun h-3.5 w-3.5" />
        <Moon className="icon-moon h-3.5 w-3.5" />
      </span>
    </button>
  );
}

export { ThemeToggle };

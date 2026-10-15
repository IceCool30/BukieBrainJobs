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

function readInitialTheme(): TradesTheme {
  if (typeof document !== 'undefined') {
    const current = document.documentElement.getAttribute('data-theme');
    if (isTradesTheme(current)) return current;
  }
  return 'light';
}

/**
 * Unified single theme toggle for both light and dark themes.
 * Smoothly toggles between Architectural Gallery Light and Obsidian Gunmetal Dark.
 * Persists to localStorage under `bukie_theme` and honors the blocking init script.
 */
export default function ThemeToggle({ idPrefix = 'theme', className = '' }: ThemeToggleProps) {
  const [theme, setTheme] = useState<TradesTheme>(readInitialTheme);

  useEffect(() => {
    setTheme(readInitialTheme());
  }, []);

  const toggle = useCallback(() => {
    setTheme((prev) => {
      const next: TradesTheme = prev === 'light' ? 'dark' : 'light';
      try {
        applyTheme(next, window.localStorage);
      } catch {
        applyTheme(next);
      }
      return next;
    });
  }, []);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === THEME_STORAGE_KEY && isTradesTheme(event.newValue)) {
        setTheme(event.newValue);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
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
      className={`theme-toggle group relative inline-flex h-7 w-14 shrink-0 cursor-pointer items-center rounded-full p-0.5 transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--amber)] ${className}`}
    >
      {/* Background track icons: Sun on left, Moon on right */}
      <span
        className="pointer-events-none absolute inset-0 flex items-center justify-between px-2 text-xs select-none"
        aria-hidden="true"
      >
        <Sun className="h-3.5 w-3.5 text-[#FF6B35]/70" />
        <Moon className="h-3.5 w-3.5 text-[#2FE896]/70" />
      </span>

      {/* Sliding thumb holding the active theme's illuminated icon */}
      <span
        className={`theme-toggle-thumb pointer-events-none relative z-10 flex h-6 w-6 transform items-center justify-center rounded-full shadow-md transition-transform duration-200 ease-out ${
          isDark
            ? 'translate-x-7 bg-[#0B0E13] text-[#2FE896] border border-[#202734]'
            : 'translate-x-0 bg-white text-[#FF6B35]'
        }`}
        aria-hidden="true"
      >
        {isDark ? (
          <Moon className="h-3.5 w-3.5" />
        ) : (
          <Sun className="h-3.5 w-3.5" />
        )}
      </span>
    </button>
  );
}

export { ThemeToggle };

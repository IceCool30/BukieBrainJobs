'use client';

import React, { useCallback, useEffect, useState } from 'react';
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
 * Segmented industrial theme switcher ([ LIGHT | DARK ]).
 * Persists to localStorage under `bukie_theme` and honours the blocking
 * init script in layout.tsx so the first paint already matches.
 */
export default function ThemeToggle({ idPrefix = 'theme', className = '' }: ThemeToggleProps) {
  const [theme, setTheme] = useState<TradesTheme>('light');

  useEffect(() => {
    setTheme(readInitialTheme());
  }, []);

  const select = useCallback((next: TradesTheme) => {
    setTheme(next);
    try {
      applyTheme(next, window.localStorage);
    } catch {
      applyTheme(next);
    }
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

  return (
    <div className={`theme-toggle ${className}`} role="radiogroup" aria-label="Appearance">
      <button
        type="button"
        id={`${idPrefix}-light`}
        role="radio"
        aria-checked={theme === 'light'}
        onClick={() => select('light')}
        className={`theme-toggle-btn ${theme === 'light' ? 'active' : ''}`}
      >
        <span aria-hidden="true">☀</span> LIGHT
      </button>
      <button
        type="button"
        id={`${idPrefix}-dark`}
        role="radio"
        aria-checked={theme === 'dark'}
        onClick={() => select('dark')}
        className={`theme-toggle-btn ${theme === 'dark' ? 'active' : ''}`}
      >
        <span aria-hidden="true">☾</span> DARK
      </button>
    </div>
  );
}

/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it } from 'vitest';
import ThemeToggle from './ThemeToggle';
import { THEME_STORAGE_KEY } from '../lib/theme';

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  document.documentElement.setAttribute('data-theme', 'light');
});

describe('ThemeToggle', () => {
  it('renders a unified single theme toggle button for both light and dark themes', () => {
    render(<ThemeToggle />);
    const toggle = screen.getByRole('button', { name: /switch to dark theme/i });
    expect(toggle).toBeInTheDocument();
    expect(toggle).toHaveAttribute('data-theme-state', 'light');
  });

  it('marks toggle with dark theme state and updates label when initial theme is dark', () => {
    document.documentElement.setAttribute('data-theme', 'dark');
    render(<ThemeToggle />);
    const toggle = screen.getByRole('button', { name: /switch to light theme/i });
    expect(toggle).toBeInTheDocument();
    expect(toggle).toHaveAttribute('data-theme-state', 'dark');
  });

  it('persists dark theme to localStorage and flips document theme on click', () => {
    render(<ThemeToggle />);
    const toggle = screen.getByRole('button', { name: /switch to dark theme/i });
    fireEvent.click(toggle);

    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
    expect(toggle).toHaveAttribute('data-theme-state', 'dark');
    expect(toggle).toHaveAttribute('aria-label', 'Switch to light theme');
  });

  it('toggles back to light theme on second click', () => {
    render(<ThemeToggle />);
    const toggle = screen.getByRole('button', { name: /switch to dark theme/i });
    fireEvent.click(toggle);
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');

    fireEvent.click(toggle);
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
    expect(toggle).toHaveAttribute('data-theme-state', 'light');
    expect(toggle).toHaveAttribute('aria-label', 'Switch to dark theme');
  });

  it('synchronizes across storage events from other tabs', () => {
    render(<ThemeToggle />);
    const toggle = screen.getByRole('button', { name: /switch to dark theme/i });
    expect(toggle).toHaveAttribute('data-theme-state', 'light');

    fireEvent(
      window,
      new StorageEvent('storage', {
        key: THEME_STORAGE_KEY,
        newValue: 'dark',
      }),
    );

    expect(toggle).toHaveAttribute('data-theme-state', 'dark');
    expect(toggle).toHaveAttribute('aria-label', 'Switch to light theme');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('renders identical first-pass markup for every stored theme so hydration never mismatches', () => {
    document.documentElement.setAttribute('data-theme', 'light');
    const light = renderToString(<ThemeToggle />);
    document.documentElement.setAttribute('data-theme', 'dark');
    const dark = renderToString(<ThemeToggle />);
    expect(dark).toBe(light);
  });
});

/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import ThemeToggle from './ThemeToggle';
import { THEME_STORAGE_KEY } from '../lib/theme';

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  document.documentElement.setAttribute('data-theme', 'light');
});

describe('ThemeToggle', () => {
  it('renders the segmented LIGHT / DARK switcher as a radiogroup', () => {
    render(<ThemeToggle />);
    expect(screen.getByRole('radiogroup', { name: /appearance/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /light/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /dark/i })).toBeInTheDocument();
  });

  it('marks LIGHT active when the document theme is light', () => {
    render(<ThemeToggle />);
    expect(screen.getByRole('radio', { name: /light/i })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('radio', { name: /dark/i })).toHaveAttribute('aria-checked', 'false');
  });

  it('persists DARK to localStorage and flips the document theme on select', () => {
    render(<ThemeToggle />);
    fireEvent.click(screen.getByRole('radio', { name: /dark/i }));

    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
    expect(screen.getByRole('radio', { name: /dark/i })).toHaveAttribute('aria-checked', 'true');
  });

  it('restores the stored theme state on mount', () => {
    document.documentElement.setAttribute('data-theme', 'dark');
    render(<ThemeToggle />);
    expect(screen.getByRole('radio', { name: /dark/i })).toHaveAttribute('aria-checked', 'true');
  });
});

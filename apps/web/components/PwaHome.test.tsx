import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import PwaHome from './PwaHome';

beforeEach(() => {
  vi.stubGlobal('IntersectionObserver', class {
    observe() {}
    disconnect() {}
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('PwaHome', () => {
  it('preserves the selected city when a service card is chosen', () => {
    const onSelectCategory = vi.fn();
    render(<PwaHome onOpenDrawer={vi.fn()} onSelectCategory={onSelectCategory} />);

    fireEvent.click(screen.getByRole('button', { name: /lagos/i }));
    fireEvent.click(screen.getByRole('option', { name: /abuja/i }));
    fireEvent.click(screen.getAllByRole('button', { name: /generator servicing & repair/i })[1]!);

    expect(onSelectCategory).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'generator' }),
      'Abuja (FCT)',
    );
  });

  it('shows a visible focus ring on service cards', () => {
    render(<PwaHome onOpenDrawer={vi.fn()} />);

    const serviceCard = screen.getAllByRole('button', { name: /generator servicing & repair/i })[1]!;
    expect(serviceCard.className).toContain('focus-visible:ring-2');
    expect(serviceCard.className).toContain('focus-visible:ring-[var(--amber)]');
  });

  it('renders explainer sections Before you book and Common questions on mobile homepage', () => {
    render(<PwaHome onOpenDrawer={vi.fn()} />);

    expect(screen.getByRole('heading', { name: /before you book/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /common questions/i })).toBeInTheDocument();
  });

  it('renders search button with amber styling matching the trades design system', () => {
    render(<PwaHome onOpenDrawer={vi.fn()} />);

    const searchButton = screen.getByRole('button', { name: /^search$/i });
    expect(searchButton.className).toContain('bg-[var(--amber)]');
    expect(searchButton.className).toContain('text-[#001A41]');
    expect(searchButton.className).toContain('hover:bg-[var(--amber-hover)]');
  });

  it('renders subtitle text below search bar in high-contrast light text over hero backdrop', () => {
    render(<PwaHome onOpenDrawer={vi.fn()} />);

    const subtitle = screen.getByText(/Find a BrainWorker for the job, or offer your skills/i);
    expect(subtitle.className).toContain('text-slate-100');
    expect(subtitle.className).not.toContain('text-[var(--text-main)]');
  });
});



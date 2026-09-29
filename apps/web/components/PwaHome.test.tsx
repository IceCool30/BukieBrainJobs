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
    expect(serviceCard.className).toContain('focus-visible:ring-[#001A41]');
  });

  it('keeps lower-priority explainer sections off the compact mobile homepage', () => {
    render(<PwaHome onOpenDrawer={vi.fn()} />);

    expect(screen.queryByRole('heading', { name: /before you book/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /common questions/i })).not.toBeInTheDocument();
  });
});

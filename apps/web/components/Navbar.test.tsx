/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const mockPush = vi.fn();
let mockPathname = '/services';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => mockPathname,
}));

import Navbar from './Navbar';

afterEach(() => {
  cleanup();
  mockPush.mockReset();
  mockPathname = '/services';
});

describe('Navbar', () => {
  it('marks the link for the current route with aria-current', () => {
    render(<Navbar />);
    const nav = screen.getByRole('navigation', { name: /primary/i });
    expect(within(nav).getByRole('link', { name: /services/i })).toHaveAttribute('aria-current', 'page');
    expect(within(nav).getByRole('link', { name: /bukieguarantee/i })).not.toHaveAttribute('aria-current');
  });

  it('does not mark a link as current on unrelated routes', () => {
    mockPathname = '/terms';
    render(<Navbar />);
    const nav = screen.getByRole('navigation', { name: /primary/i });
    expect(within(nav).queryAllByRole('link').filter((l) => l.hasAttribute('aria-current'))).toHaveLength(0);
  });

  it('keeps the transparent header only over the home hero', () => {
    render(<Navbar />);
    expect(screen.getByRole('banner').className).toContain('bg-[var(--strip-bg)]');
    expect(screen.getByRole('banner').className).not.toContain('to-transparent');
    cleanup();
    mockPathname = '/';
    render(<Navbar />);
    expect(screen.getByRole('banner').className).toContain('to-transparent');
  });

  it('routes drawer links client-side instead of reloading the page', () => {
    render(<Navbar />);
    fireEvent.click(screen.getByRole('button', { name: /open navigation menu/i }));
    const drawer = screen.getByRole('dialog', { name: /navigation menu/i });
    fireEvent.click(within(drawer).getByRole('button', { name: /^services$/i }));
    expect(mockPush).toHaveBeenCalledWith('/services');
  });
});

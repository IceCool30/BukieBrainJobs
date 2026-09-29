import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import CustomerHomepage from './page';

const { push } = vi.hoisted(() => ({ push: vi.fn() }));

vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));
vi.mock('../hooks/useIsPwa', () => ({ useIsPwa: () => true }));
vi.mock('../components/Navbar', () => ({ default: () => null }));
vi.mock('../components/Footer', () => ({ default: () => null }));
vi.mock('../components/modals/BecomeWorkerModal', () => ({ default: () => null }));

beforeEach(() => {
  push.mockClear();
  vi.stubGlobal('IntersectionObserver', class {
    observe() {}
    disconnect() {}
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('CustomerHomepage PWA discovery', () => {
  it('keeps the selected city in the service-discovery URL after choosing a category', () => {
    render(<CustomerHomepage />);

    fireEvent.click(screen.getByRole('button', { name: /lagos/i }));
    fireEvent.click(screen.getByRole('option', { name: /abuja/i }));
    fireEvent.click(screen.getAllByRole('button', { name: /generator servicing & repair/i })[1]!);

    const url = String(push.mock.calls[0]?.[0] ?? '');
    const params = new URLSearchParams(url.split('?')[1]);
    expect(url).toMatch(/^\/services\?/);
    expect(params.get('city')).toBe('Abuja (FCT)');
    expect(params.get('category')).toBe('generator');
  });
});

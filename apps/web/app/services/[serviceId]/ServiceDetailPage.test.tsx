/** @vitest-environment jsdom */
import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ServiceDetailPage from './page';

vi.mock('next/navigation', () => ({
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => '/services/plumbing',
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('ServiceDetailPage', () => {
  it('renders service title, group, and starting price for a valid service', async () => {
    const Component = await ServiceDetailPage({
      params: Promise.resolve({ serviceId: 'generator' }),
      searchParams: Promise.resolve({}),
    });
    render(Component);

    expect(screen.getByRole('heading', { level: 1, name: /generator servicing & repair/i })).toBeInTheDocument();
    expect(screen.getByText(/power & cooling/i)).toBeInTheDocument();
    expect(screen.getByText('₦10,000')).toBeInTheDocument();
  });

  it('renders the popular jobs list for the service', async () => {
    const Component = await ServiceDetailPage({
      params: Promise.resolve({ serviceId: 'generator' }),
      searchParams: Promise.resolve({}),
    });
    render(Component);

    expect(screen.getByText('Sumec Firman Repair')).toBeInTheDocument();
    expect(screen.getByText('Mikano Diesel Service')).toBeInTheDocument();
    expect(screen.getByText('AVR Replacement')).toBeInTheDocument();
  });

  it('renders the list of active Nigerian locations', async () => {
    const Component = await ServiceDetailPage({
      params: Promise.resolve({ serviceId: 'generator' }),
      searchParams: Promise.resolve({}),
    });
    render(Component);

    expect(screen.getByText('Lagos')).toBeInTheDocument();
    expect(screen.getByText('Abuja (FCT)')).toBeInTheDocument();
    expect(screen.getByText('Port Harcourt')).toBeInTheDocument();
  });

  it('renders booking CTA button pointing to /book with service and price params', async () => {
    const Component = await ServiceDetailPage({
      params: Promise.resolve({ serviceId: 'generator' }),
      searchParams: Promise.resolve({ city: 'Lagos' }),
    });
    render(Component);

    const bookingLink = screen.getByRole('link', { name: /continue to booking/i });
    expect(bookingLink).toBeInTheDocument();
    expect(bookingLink.getAttribute('href')).toContain('/book?');
    expect(bookingLink.getAttribute('href')).toContain('city=Lagos');
  });

  it('preserves return query params in the back link', async () => {
    const Component = await ServiceDetailPage({
      params: Promise.resolve({ serviceId: 'generator' }),
      searchParams: Promise.resolve({ returnCategory: 'power', city: 'Lagos', returnQ: 'repair' }),
    });
    render(Component);

    const backLink = screen.getByRole('link', { name: /back to services/i });
    expect(backLink).toBeInTheDocument();
    expect(backLink.getAttribute('href')).toBe('/services?category=power&city=Lagos&q=repair');
  });

  it('throws notFound for an unknown serviceId', async () => {
    await expect(
      ServiceDetailPage({
        params: Promise.resolve({ serviceId: 'unknown-service-xyz' }),
        searchParams: Promise.resolve({}),
      }),
    ).rejects.toThrow('NEXT_NOT_FOUND');
  });
});

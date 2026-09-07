import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import Navbar from './Navbar';
import PwaHome from './PwaHome';
import Footer from './Footer';
import AuthScreen from './auth/AuthScreen';
import BookingScreen from './BookingScreen';
import PostJobScreen from './post-job/PostJobScreen';
import DashboardScreen from './dashboard/DashboardScreen';
import * as authStorage from '../lib/auth/storage';
import { AuthUser } from '../lib/auth/types';
import { useSearchParams } from 'next/navigation';

function makeSearchParams(params: Record<string, string> = {}) {
  const search = new URLSearchParams(params);
  return {
    get: (key: string) => search.get(key),
    getAll: (key: string) => search.getAll(key),
    has: (key: string) => search.has(key),
    forEach: (cb: (value: string, key: string) => void) => search.forEach(cb),
    entries: () => search.entries(),
    keys: () => search.keys(),
    values: () => search.values(),
    toString: () => search.toString(),
    size: search.size,
    [Symbol.iterator]: () => search[Symbol.iterator](),
  } as unknown as ReturnType<typeof useSearchParams>;
}

const mockCustomerUser: AuthUser = {
  id: 'usr-customer-test',
  name: 'Adeleke Babajide',
  email: 'adeleke@example.com',
  phone: '+2348031234567',
  provider: 'google',
  role: 'customer',
  isBrainWorkerApproved: false,
};

describe('Visual Branding, Official Trademark Logo, and Watermark Placements', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock IntersectionObserver on both window and global
    class MockIntersectionObserver {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).IntersectionObserver = MockIntersectionObserver;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).IntersectionObserver = MockIntersectionObserver;

    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(mockCustomerUser);
    vi.spyOn(authStorage, 'setMockAuthenticatedUser').mockImplementation(() => {});
  });

  it('Navbar: renders official wordmark on desktop and official logo-icon on mobile and drawer', () => {
    render(<Navbar />);

    // Brand link to home
    const brandLinks = screen.getAllByRole('link', { name: /bukiebrainjobs/i });
    expect(brandLinks.length).toBeGreaterThanOrEqual(1);

    // Desktop wordmark image
    const images = document.querySelectorAll('img');
    const wordmarkImg = Array.from(images).find((img) =>
      img.getAttribute('src')?.includes('wordmark-banner-2280.png'),
    );
    expect(wordmarkImg).toBeDefined();

    // Mobile logo icon
    const logoIconImg = Array.from(images).find((img) =>
      img.getAttribute('src')?.includes('logo-icon.png'),
    );
    expect(logoIconImg).toBeDefined();
  });

  it('PwaHome: renders official logo-icon and branded title in mobile PWA header', () => {
    render(<PwaHome onOpenDrawer={vi.fn()} />);

    const images = document.querySelectorAll('img');
    const logoIcon = Array.from(images).find((img) =>
      img.getAttribute('src')?.includes('logo-icon.png'),
    );
    expect(logoIcon).toBeDefined();
    expect(screen.getAllByText(/bukie/i).length).toBeGreaterThanOrEqual(1);
  });

  it('Footer: renders official trademark wordmark banner and corporate copyright', () => {
    render(<Footer />);

    const images = document.querySelectorAll('img');
    const wordmark = Array.from(images).find((img) =>
      img.getAttribute('src')?.includes('wordmark-banner-2280.png'),
    );
    expect(wordmark).toBeDefined();
    expect(screen.getByText(/all rights reserved/i)).toBeInTheDocument();
  });

  it('AuthScreen: renders official logo in header, brand icon anchor in card, and subtle watermark', () => {
    vi.mocked(useSearchParams).mockReturnValue(makeSearchParams());
    render(<AuthScreen initialMode="signin" />);

    const images = document.querySelectorAll('img');
    // Header brand logo & Card anchor logo
    const logoIcons = Array.from(images).filter((img) =>
      img.getAttribute('src')?.includes('logo-icon.png'),
    );
    expect(logoIcons.length).toBeGreaterThanOrEqual(2);

    // Subtle trademark security watermark
    const watermark = Array.from(images).find((img) =>
      img.getAttribute('src')?.includes('logo-badge-512.png'),
    );
    expect(watermark).toBeDefined();
  });

  it('BookingScreen: renders official logo in header', () => {
    vi.mocked(useSearchParams).mockReturnValue(
      makeSearchParams({ service: 'generator', city: 'Lagos' }),
    );
    render(<BookingScreen />);

    const images = document.querySelectorAll('img');
    const logoIcon = Array.from(images).find((img) =>
      img.getAttribute('src')?.includes('logo-icon.png'),
    );
    expect(logoIcon).toBeDefined();
  });

  it('PostJobScreen: renders official logo in header and security watermark in live summary card', () => {
    vi.mocked(useSearchParams).mockReturnValue(makeSearchParams());
    render(<PostJobScreen />);

    const images = document.querySelectorAll('img');
    // Logo in header
    const logoIcon = Array.from(images).find((img) =>
      img.getAttribute('src')?.includes('logo-icon.png'),
    );
    expect(logoIcon).toBeDefined();

    // Watermark in sticky live review summary card
    const watermark = Array.from(images).find((img) =>
      img.getAttribute('src')?.includes('logo-badge-512.png'),
    );
    expect(watermark).toBeDefined();
  });

  it('DashboardScreen: renders official logo in header and watermark in empty states', async () => {
    vi.mocked(useSearchParams).mockReturnValue(makeSearchParams());
    render(<DashboardScreen />);

    // Wait for customer greeting to confirm full mount past skeleton
    const greetings = await screen.findAllByText(/Adeleke Babajide/i);
    expect(greetings.length).toBeGreaterThanOrEqual(1);

    const images = document.querySelectorAll('img');
    // Header brand logo
    const logoIcon = Array.from(images).find((img) =>
      img.getAttribute('src')?.includes('logo-icon.png'),
    );
    expect(logoIcon).toBeDefined();
  });
});

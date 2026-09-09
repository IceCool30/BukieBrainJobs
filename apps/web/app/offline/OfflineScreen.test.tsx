import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import OfflinePage from './page';

describe('PWA Offline Fallback Page', () => {
  const originalLocation = window.location;

  beforeEach(() => {
    // Mock window.location.reload
    Object.defineProperty(window, 'location', {
      writable: true,
      configurable: true,
      value: { ...originalLocation, reload: vi.fn(), href: 'http://localhost:3000/offline' },
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      writable: true,
      configurable: true,
      value: originalLocation,
    });
    vi.restoreAllMocks();
  });

  it('renders official branding, offline illustration, and accessible heading', () => {
    render(<OfflinePage />);

    expect(screen.getByRole('heading', { level: 1, name: /You're Currently Offline/i })).toBeInTheDocument();
    expect(screen.getByText(/BukieBrainJobs is ready as soon as your connection returns/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Retry Connection/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /View Cached Dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Return to Home/i })).toBeInTheDocument();
  });

  it('provides reassurance about preserved local drafts and data safety', () => {
    render(<OfflinePage />);

    expect(screen.getByText(/Your drafts and prepared booking requests are safely stored on this device/i)).toBeInTheDocument();
    expect(screen.getByText(/Direct artisan phone calls and SMS remain available/i)).toBeInTheDocument();
  });

  it('triggers window reload when clicking Retry Connection while online', () => {
    // Mock navigator.onLine as true
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);

    render(<OfflinePage />);
    const retryBtn = screen.getByRole('button', { name: /Retry Connection/i });
    fireEvent.click(retryBtn);

    expect(window.location.reload).toHaveBeenCalled();
  });

  it('displays connection checking feedback when retry button is clicked while still offline', async () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);

    render(<OfflinePage />);
    const retryBtn = screen.getByRole('button', { name: /Retry Connection/i });
    fireEvent.click(retryBtn);

    const statusNotice = await screen.findByRole('status');
    expect(statusNotice).toBeInTheDocument();
    expect(screen.getByText(/Still offline\. Please check your internet or mobile data connection\./i)).toBeInTheDocument();
  });
});

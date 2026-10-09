import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, beforeEach } from 'vitest';
import TradesTelemetryBar from './TradesTelemetryBar';

describe('TradesTelemetryBar Component', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.classList.remove('dark');
  });

  it('renders top telemetry indicators and escrow security badge', () => {
    render(<TradesTelemetryBar />);
    expect(screen.getByText(/VERIFIED TRADES INDEX/i)).toBeDefined();
    expect(screen.getByText(/ACTIVE TRADES REQUISITIONS/i)).toBeDefined();
    expect(screen.getByText(/BukieGuarantee™/i)).toBeDefined();
  });

  it('renders segmented theme switcher with light and dark buttons', () => {
    render(<TradesTelemetryBar />);
    const lightBtn = screen.getByRole('radio', { name: /LIGHT/i });
    const darkBtn = screen.getByRole('radio', { name: /DARK/i });
    expect(lightBtn).toBeDefined();
    expect(darkBtn).toBeDefined();
  });

  it('switches to dark mode on click and updates localStorage and documentElement', () => {
    render(<TradesTelemetryBar />);
    const darkBtn = screen.getByRole('radio', { name: /DARK/i });
    fireEvent.click(darkBtn);

    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem('bukiebrainjobs-theme')).toBe('dark');
  });

  it('switches back to light mode on click', () => {
    localStorage.setItem('bukiebrainjobs-theme', 'dark');
    document.documentElement.setAttribute('data-theme', 'dark');
    document.documentElement.classList.add('dark');

    render(<TradesTelemetryBar />);
    const lightBtn = screen.getByRole('radio', { name: /LIGHT/i });
    fireEvent.click(lightBtn);

    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(localStorage.getItem('bukiebrainjobs-theme')).toBe('light');
  });
});

/** @vitest-environment jsdom */
/**
 * ServicesDirectory component tests: WEB-006 + Trades Design System
 *
 * Tests observable behavior of the public services discovery page:
 * - Page renders with expected heading, search input, and requisition rows
 * - Search input filters displayed requisition rows in real time
 * - Category deep links filter rows; the active chip clears the filter
 * - Discipline pills filter the Requisition Index command table
 * - "Inspect Spec" opens the spec inspector drawer with scope and booking triggers
 * - Invalid URL query parameters show informational notices (role="status")
 * - Empty state appears when no services match the current filters
 * - Reset filters clears all active filters and restores all 8 rows
 * - "Review details" (inside the drawer) navigates to the correct detail URL
 *
 * Underlying pure logic is covered in lib/services/services.test.ts.
 * These tests prove the React layer wires that logic correctly.
 */
import React from 'react';
import { cleanup, render, screen, fireEvent, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useRouter, useSearchParams } from 'next/navigation';
import type { ReadonlyURLSearchParams } from 'next/navigation';
import ServicesPage from './page';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeSearchParams(params: Record<string, string> = {}): ReadonlyURLSearchParams {
  return new URLSearchParams(params) as unknown as ReadonlyURLSearchParams;
}

const mockPush = vi.fn();
const mockReplace = vi.fn();

function makeRouter() {
  return {
    push: mockPush,
    replace: mockReplace,
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  };
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// ---------------------------------------------------------------------------
// Initial render
// ---------------------------------------------------------------------------

describe('ServicesPage: initial render', () => {
  beforeEach(() => {
    vi.mocked(useSearchParams).mockReturnValue(makeSearchParams());
    vi.mocked(useRouter).mockReturnValue(makeRouter());
  });

  it('renders the page heading', () => {
    render(<ServicesPage />);
    expect(
      screen.getByRole('heading', { name: /browse the requisition index/i }),
    ).toBeInTheDocument();
  });

  it('renders the search input with type="search"', () => {
    render(<ServicesPage />);
    // type="search" gives the input the implicit role of searchbox
    const input = screen.getByRole('searchbox');
    expect(input).toBeInTheDocument();
  });

  it('renders all 8 service categories as requisition <article> rows', () => {
    render(<ServicesPage />);
    expect(screen.getAllByRole('article')).toHaveLength(8);
  });

  it('renders an "Inspect Spec" button on each requisition row', () => {
    render(<ServicesPage />);
    expect(screen.getAllByRole('button', { name: /inspect spec/i })).toHaveLength(8);
  });

  it('renders deterministic REQ reference codes in monospace rows', () => {
    render(<ServicesPage />);
    expect(screen.getByText('REQ-8801')).toBeInTheDocument();
    expect(screen.getByText('REQ-8808')).toBeInTheDocument();
  });

  it('renders the "Back to home" link pointing to "/"', () => {
    render(<ServicesPage />);
    expect(screen.getByRole('link', { name: /back to home/i })).toHaveAttribute('href', '/');
  });

  it('renders the "All Dispatches" discipline pill as pressed by default', () => {
    render(<ServicesPage />);
    const allBtn = screen.getByRole('button', { name: /all dispatches/i });
    expect(allBtn).toHaveAttribute('aria-pressed', 'true');
  });

  it('renders the site header with telemetry strip and theme toggle', () => {
    render(<ServicesPage />);
    expect(screen.getByRole('complementary', { name: /marketplace status/i })).toBeInTheDocument();
    expect(screen.getByRole('radiogroup', { name: /appearance/i })).toBeInTheDocument();
    expect(screen.getByText(/verified trades index/i)).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Search input behaviour
// ---------------------------------------------------------------------------

describe('ServicesPage: search input', () => {
  beforeEach(() => {
    vi.mocked(useSearchParams).mockReturnValue(makeSearchParams());
    vi.mocked(useRouter).mockReturnValue(makeRouter());
  });

  it('pre-fills the search input from the URL q param', () => {
    vi.mocked(useSearchParams).mockReturnValue(makeSearchParams({ q: 'plumbing' }));
    render(<ServicesPage />);
    expect((screen.getByRole('searchbox') as HTMLInputElement).value).toBe('plumbing');
  });

  it('shows the "Clear search" button only when the input has a value', () => {
    render(<ServicesPage />);

    expect(screen.queryByRole('button', { name: /clear search/i })).not.toBeInTheDocument();

    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'generator' } });

    expect(screen.getByRole('button', { name: /clear search/i })).toBeInTheDocument();
  });

  it('caps input at 100 characters (maxLength)', () => {
    render(<ServicesPage />);

    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'a'.repeat(120) } });

    expect((screen.getByRole('searchbox') as HTMLInputElement).value).toHaveLength(100);
  });

  it('filters requisition rows to matching categories when a keyword is typed', () => {
    render(<ServicesPage />);

    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'generator' } });

    const cards = screen.getAllByRole('article');
    expect(cards).toHaveLength(1);
    expect(within(cards[0]!).getByRole('heading', { name: /generator/i })).toBeInTheDocument();
  });

  it('shows the empty state when no categories match the search', () => {
    render(<ServicesPage />);

    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'zzznomatch' } });

    expect(screen.getByRole('heading', { name: /no services match that search/i })).toBeInTheDocument();
    expect(screen.queryAllByRole('article')).toHaveLength(0);
  });

  it('clears the input and restores all 8 rows when "Clear search" is clicked', () => {
    render(<ServicesPage />);

    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'plumbing' } });
    expect(screen.getAllByRole('article')).toHaveLength(1);

    fireEvent.click(screen.getByRole('button', { name: /clear search/i }));

    expect((screen.getByRole('searchbox') as HTMLInputElement).value).toBe('');
    expect(screen.getAllByRole('article')).toHaveLength(8);
  });
});

// ---------------------------------------------------------------------------
// Category deep-link filter behaviour (single command toolbar: no icon rail)
// ---------------------------------------------------------------------------

describe('ServicesPage: category deep-link filters', () => {
  beforeEach(() => {
    vi.mocked(useSearchParams).mockReturnValue(makeSearchParams());
    vi.mocked(useRouter).mockReturnValue(makeRouter());
  });

  it('filters rows to the linked category when the category param is present', () => {
    vi.mocked(useSearchParams).mockReturnValue(makeSearchParams({ category: 'plumbing' }));
    render(<ServicesPage />);

    const rows = screen.getAllByRole('article');
    expect(rows).toHaveLength(1);
    expect(within(rows[0]!).getByRole('heading', { name: /plumbing/i })).toBeInTheDocument();
  });

  it('shows the active category chip with a removal control', () => {
    vi.mocked(useSearchParams).mockReturnValue(makeSearchParams({ category: 'plumbing' }));
    render(<ServicesPage />);

    expect(screen.getByText('Plumbing')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /remove category filter/i })).toBeInTheDocument();
  });

  it('clears the category param when the category chip removal is clicked', () => {
    vi.mocked(useSearchParams).mockReturnValue(makeSearchParams({ category: 'cleaning' }));
    render(<ServicesPage />);

    fireEvent.click(screen.getByRole('button', { name: /remove category filter/i }));

    expect(mockPush).toHaveBeenCalledWith(
      expect.not.stringContaining('category=cleaning'),
      expect.anything(),
    );
  });

  it('shows all 8 rows when no category param is present', () => {
    render(<ServicesPage />);
    expect(screen.getAllByRole('article')).toHaveLength(8);
  });
});

// ---------------------------------------------------------------------------
// Invalid URL parameter notices (role="status")
// ---------------------------------------------------------------------------

describe('ServicesPage: invalid URL parameter notices', () => {
  beforeEach(() => {
    vi.mocked(useRouter).mockReturnValue(makeRouter());
  });

  it('shows a status notice when the city param is not an active Nigerian city', () => {
    vi.mocked(useSearchParams).mockReturnValue(makeSearchParams({ city: 'London' }));
    render(<ServicesPage />);

    // Notices use role="status" per the live markup
    const notices = screen.getAllByRole('status');
    expect(notices.length).toBeGreaterThan(0);
    // The raw city value is shown in the notice text
    expect(screen.getByText(/london/i)).toBeInTheDocument();
  });

  it('does not show a city notice when the city param is a valid active city', () => {
    vi.mocked(useSearchParams).mockReturnValue(makeSearchParams({ city: 'Lagos' }));
    render(<ServicesPage />);

    // The result count status is always shown; look specifically for the location notice
    const noticeTexts = screen.queryAllByText(/not active yet/i);
    expect(noticeTexts).toHaveLength(0);
  });

  it('shows a status notice when the category param is not a canonical category ID', () => {
    vi.mocked(useSearchParams).mockReturnValue(makeSearchParams({ category: 'SPACESHIP' }));
    render(<ServicesPage />);

    expect(screen.getByText(/category not recognized/i)).toBeInTheDocument();
  });

  it('dismisses the invalid city notice when the "Dismiss notice" button is clicked', () => {
    vi.mocked(useSearchParams).mockReturnValue(makeSearchParams({ city: 'Atlantis' }));
    render(<ServicesPage />);

    expect(screen.getByText(/not active yet/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /dismiss notice/i }));

    expect(screen.queryByText(/not active yet/i)).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Empty state and Reset filters
// ---------------------------------------------------------------------------

describe('ServicesPage: empty state and reset filters', () => {
  beforeEach(() => {
    vi.mocked(useRouter).mockReturnValue(makeRouter());
    vi.mocked(useSearchParams).mockReturnValue(makeSearchParams());
  });

  it('shows the "Reset filters" button in the empty state', () => {
    render(<ServicesPage />);

    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'zzznomatch' } });

    expect(screen.getByRole('button', { name: /reset filters/i })).toBeInTheDocument();
  });

  it('calls router.push with "/services" when "Reset filters" is clicked', () => {
    render(<ServicesPage />);

    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'zzznomatch' } });
    fireEvent.click(screen.getByRole('button', { name: /reset filters/i }));

    expect(mockPush).toHaveBeenCalledWith('/services', expect.anything());
  });

  it('restores all 8 rows after "Reset filters" is clicked', () => {
    render(<ServicesPage />);

    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'zzznomatch' } });
    expect(screen.queryAllByRole('article')).toHaveLength(0);

    fireEvent.click(screen.getByRole('button', { name: /reset filters/i }));

    expect(screen.getAllByRole('article')).toHaveLength(8);
  });
});

// ---------------------------------------------------------------------------
// "Review details" navigation
// ---------------------------------------------------------------------------

describe('ServicesPage: Review details navigation', () => {
  beforeEach(() => {
    vi.mocked(useRouter).mockReturnValue(makeRouter());
    vi.mocked(useSearchParams).mockReturnValue(makeSearchParams());
  });

  function openFirstInspector() {
    render(<ServicesPage />);
    const buttons = screen.getAllByRole('button', { name: /inspect spec/i });
    fireEvent.click(buttons[0]!);
    return screen.getByRole('dialog');
  }

  it('opens the spec inspector drawer when "Inspect Spec" is clicked', () => {
    const dialog = openFirstInspector();
    expect(dialog).toBeInTheDocument();
    expect(
      within(dialog).getByRole('heading', { name: /generator servicing/i }),
    ).toBeInTheDocument();
    expect(within(dialog).getByText(/100% escrow milestone/i)).toBeInTheDocument();
  });

  it('drawer offers a "Book BrainWorker" link carrying service and price params', () => {
    const dialog = openFirstInspector();
    const bookLink = within(dialog).getByRole('link', { name: /book brainworker/i });
    expect(bookLink.getAttribute('href') ?? '').toContain('/book?');
    expect(bookLink.getAttribute('href') ?? '').toContain('service=');
  });

  it('closes the inspector when Escape is pressed', () => {
    openFirstInspector();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('calls router.push with a /services/[serviceId] path when drawer "Review details" is clicked', () => {
    const dialog = openFirstInspector();

    fireEvent.click(within(dialog).getByRole('button', { name: /review details/i }));

    expect(mockPush).toHaveBeenCalledWith(
      expect.stringMatching(/^\/services\//),
    );
  });

  it('includes the city in the detail URL when a valid city is active', () => {
    vi.mocked(useSearchParams).mockReturnValue(makeSearchParams({ city: 'Lagos' }));
    render(<ServicesPage />);

    const buttons = screen.getAllByRole('button', { name: /inspect spec/i });
    fireEvent.click(buttons[0]!);
    fireEvent.click(screen.getByRole('button', { name: /review details/i }));

    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining('city=Lagos'),
    );
  });

  it('includes returnQ in the detail URL when a search query is active', () => {
    render(<ServicesPage />);

    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'repair' } });

    const reviewButtons = screen.getAllByRole('button', { name: /inspect spec/i });
    fireEvent.click(reviewButtons[0]!);
    fireEvent.click(screen.getByRole('button', { name: /review details/i }));

    const calls = mockPush.mock.calls;
    const lastCall = calls[calls.length - 1];
    const lastPushArg = String(lastCall?.[0] ?? '');
    expect(lastPushArg).toContain('returnQ=repair');
  });
});

describe('ServicesPage: discipline pills', () => {
  beforeEach(() => {
    vi.mocked(useSearchParams).mockReturnValue(makeSearchParams());
    vi.mocked(useRouter).mockReturnValue(makeRouter());
  });

  it('filters the index to the solar discipline when "Solar & Inverters" is pressed', () => {
    render(<ServicesPage />);

    fireEvent.click(screen.getByRole('button', { name: /solar & inverters/i }));

    const rows = screen.getAllByRole('article');
    expect(rows).toHaveLength(1);
    expect(within(rows[0]!).getByRole('heading', { name: /solar/i })).toBeInTheDocument();
  });

  it('restores all 8 rows when "All Dispatches" is pressed', () => {
    render(<ServicesPage />);

    fireEvent.click(screen.getByRole('button', { name: /commercial hvac/i }));
    expect(screen.getAllByRole('article')).toHaveLength(1);

    fireEvent.click(screen.getByRole('button', { name: /all dispatches/i }));
    expect(screen.getAllByRole('article')).toHaveLength(8);
  });

  it('groups carpentry, cleaning, tv, and relocation rows under "General Trades"', () => {
    render(<ServicesPage />);

    fireEvent.click(screen.getByRole('button', { name: /general trades/i }));

    const rows = screen.getAllByRole('article');
    expect(rows).toHaveLength(4);
  });
});

// ---------------------------------------------------------------------------
// Accessibility contract
// ---------------------------------------------------------------------------

describe('ServicesPage: accessibility', () => {
  beforeEach(() => {
    vi.mocked(useSearchParams).mockReturnValue(makeSearchParams());
    vi.mocked(useRouter).mockReturnValue(makeRouter());
  });

  it('search input is associated with a visible label', () => {
    render(<ServicesPage />);
    const input = screen.getByRole('searchbox');
    const id = input.getAttribute('id');
    // The input has id="service-directory-search" and a matching <label for="">
    const label = id ? document.querySelector(`label[for="${id}"]`) : null;
    expect(label).not.toBeNull();
  });

  it('renders the live result count announcement in the DOM', () => {
    render(<ServicesPage />);
    // A role="status" element announces the result count to screen readers
    const statusElements = screen.getAllByRole('status');
    const resultCountEl = statusElements.find((el) =>
      /service categor/i.test(el.textContent ?? ''),
    );
    expect(resultCountEl).toBeDefined();
  });

  it('each requisition row shows a milestone figure and an escrow badge', () => {
    render(<ServicesPage />);
    expect(screen.getAllByText(/100% escrow milestone/i).length).toBeGreaterThanOrEqual(8);
    expect(screen.getByText('₦25,000')).toBeInTheDocument();
  });

  it('discipline pills have accessible aria-pressed state', () => {
    render(<ServicesPage />);
    const toolbar = screen.getByRole('group', { name: /technical discipline/i });
    const pills = within(toolbar)
      .getAllByRole('button')
      .filter((btn) => btn.hasAttribute('aria-pressed'));
    // All Dispatches + 5 discipline pills = 6
    expect(pills).toHaveLength(6);
  });
});

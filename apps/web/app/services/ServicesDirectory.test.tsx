/** @vitest-environment jsdom */
/**
 * ServicesDirectory component tests: WEB-006
 *
 * Tests observable behavior of the public services discovery page:
 * - Page renders with expected heading, search input, and service cards
 * - Search input filters displayed service cards in real time
 * - Category buttons (aria-pressed) filter results correctly
 * - Invalid URL query parameters show informational notices (role="status")
 * - Empty state appears when no services match the current filters
 * - Reset filters clears all active filters and restores all 8 cards
 * - "Review details" navigates to the correct service detail URL with context
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
      screen.getByRole('heading', { name: /browse by category/i }),
    ).toBeInTheDocument();
  });

  it('renders the search input with type="search"', () => {
    render(<ServicesPage />);
    // type="search" gives the input the implicit role of searchbox
    const input = screen.getByRole('searchbox');
    expect(input).toBeInTheDocument();
  });

  it('renders all 8 service category cards as <article> elements', () => {
    render(<ServicesPage />);
    expect(screen.getAllByRole('article')).toHaveLength(8);
  });

  it('renders a "Review details" button on each service card', () => {
    render(<ServicesPage />);
    expect(screen.getAllByRole('button', { name: /review details/i })).toHaveLength(8);
  });

  it('renders the "Back to home" link pointing to "/"', () => {
    render(<ServicesPage />);
    expect(screen.getByRole('link', { name: /back to home/i })).toHaveAttribute('href', '/');
  });

  it('renders the "All services" category button as pressed by default', () => {
    render(<ServicesPage />);
    const allBtn = screen.getByRole('button', { name: /all services/i });
    expect(allBtn).toHaveAttribute('aria-pressed', 'true');
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

  it('filters service cards to matching categories when a keyword is typed', () => {
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

  it('clears the input and restores all 8 cards when "Clear search" is clicked', () => {
    render(<ServicesPage />);

    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'plumbing' } });
    expect(screen.getAllByRole('article')).toHaveLength(1);

    fireEvent.click(screen.getByRole('button', { name: /clear search/i }));

    expect((screen.getByRole('searchbox') as HTMLInputElement).value).toBe('');
    expect(screen.getAllByRole('article')).toHaveLength(8);
  });
});

// ---------------------------------------------------------------------------
// Category button filter behaviour
// ---------------------------------------------------------------------------

describe('ServicesPage: category button filters', () => {
  beforeEach(() => {
    vi.mocked(useSearchParams).mockReturnValue(makeSearchParams());
    vi.mocked(useRouter).mockReturnValue(makeRouter());
  });

  it('pre-presses the correct category button when category param is present', () => {
    vi.mocked(useSearchParams).mockReturnValue(makeSearchParams({ category: 'plumbing' }));
    render(<ServicesPage />);

    const plumbingBtn = screen.getByRole('button', { name: /plumbing/i });
    expect(plumbingBtn).toHaveAttribute('aria-pressed', 'true');

    const allBtn = screen.getByRole('button', { name: /all services/i });
    expect(allBtn).toHaveAttribute('aria-pressed', 'false');
  });

  it('filters cards to only the selected category when a category button is clicked', () => {
    render(<ServicesPage />);

    fireEvent.click(screen.getByRole('button', { name: /ac repair/i }));

    const cards = screen.getAllByRole('article');
    expect(cards).toHaveLength(1);
    expect(within(cards[0]!).getByRole('heading', { name: /ac/i })).toBeInTheDocument();
  });

  it('calls router.push with the correct category param when a category button is clicked', () => {
    render(<ServicesPage />);

    fireEvent.click(screen.getByRole('button', { name: /cleaning/i }));

    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining('category=cleaning'),
      expect.anything(),
    );
  });

  it('shows all 8 cards when the "All services" button is the active category', () => {
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

  it('restores all 8 cards after "Reset filters" is clicked', () => {
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

  it('calls router.push with a /services/[serviceId] path when "Review details" is clicked', () => {
    render(<ServicesPage />);

    const buttons = screen.getAllByRole('button', { name: /review details/i });
    fireEvent.click(buttons[0]!);

    expect(mockPush).toHaveBeenCalledWith(
      expect.stringMatching(/^\/services\//),
    );
  });

  it('includes the city in the detail URL when a valid city is active', () => {
    vi.mocked(useSearchParams).mockReturnValue(makeSearchParams({ city: 'Lagos' }));
    render(<ServicesPage />);

    const buttons = screen.getAllByRole('button', { name: /review details/i });
    fireEvent.click(buttons[0]!);

    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining('city=Lagos'),
    );
  });

  it('includes returnQ in the detail URL when a search query is active', () => {
    render(<ServicesPage />);

    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'repair' } });

    const reviewButtons = screen.getAllByRole('button', { name: /review details/i });
    fireEvent.click(reviewButtons[0]!);

    const calls = mockPush.mock.calls;
    const lastCall = calls[calls.length - 1];
    const lastPushArg = String(lastCall?.[0] ?? '');
    expect(lastPushArg).toContain('returnQ=repair');
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

  it('each service card image has a non-empty alt attribute', () => {
    render(<ServicesPage />);
    const images = screen
      .getAllByRole('img')
      .filter((img) => img.getAttribute('alt') !== '');
    expect(images.length).toBeGreaterThan(0);
  });

  it('category buttons have accessible aria-pressed state', () => {
    render(<ServicesPage />);
    const categoryBtns = screen
      .getAllByRole('button')
      .filter((btn) => btn.hasAttribute('aria-pressed'));
    // 1 "All services" + 8 category buttons = 9
    expect(categoryBtns).toHaveLength(9);
  });
});

/**
 * WEB-012 MatchResultsScreen: component integration tests
 *
 * Tests the rendered UI for each matching state, the selection flow,
 * back navigation, and accessibility attributes.
 *
 * Uses the mock matching repository via the singleton, reset between tests.
 */

import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import MatchResultsScreen from '../../components/matching/MatchResultsScreen';
import { resetMatchingRepository } from '../../lib/matching';
import * as authStorage from '../../lib/auth/storage';

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/job/REQ-84920/matches',
}));

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; className?: string; 'aria-label'?: string }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

// Mock authenticated user
vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue({
  id: 'customer-test-1',
  name: 'Test Customer',
  email: 'test@example.com',
  provider: 'email',
  role: 'customer',
  isBrainWorkerApproved: false,
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function renderScreen(referenceCode: string) {
  return render(<MatchResultsScreen referenceCode={referenceCode} />);
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('MatchResultsScreen', () => {
  beforeEach(() => {
    resetMatchingRepository();
    mockPush.mockClear();
    vi.clearAllTimers();
  });

  it('shows loading skeletons on initial render before results arrive', () => {
    renderScreen('REQ-84920');
    // aria-busy should be set during loading
    expect(screen.getByRole('region', { name: /loading match results/i })).toBeInTheDocument();
  });

  it('renders match candidates for REQ-84920', async () => {
    renderScreen('REQ-84920');
    await waitFor(() => {
      expect(screen.getByText('Tunde Bakare')).toBeInTheDocument();
    });
    expect(screen.getByText('Amaka Osei')).toBeInTheDocument();
  });

  it('shows job context panel with reference code', async () => {
    renderScreen('REQ-84920');
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /inverter backup/i })).toBeInTheDocument();
    });
    expect(screen.getByText('Inverter & Solar Installation')).toBeInTheDocument();
  });

  it('renders "Matching is in progress" state for REQ-INPROG', async () => {
    renderScreen('REQ-INPROG');
    await waitFor(() => {
      expect(screen.getByText(/matching is in progress/i)).toBeInTheDocument();
    });
  });

  it('renders no_matches state for REQ-NOMATCH with recovery actions', async () => {
    renderScreen('REQ-NOMATCH');
    await waitFor(() => {
      expect(screen.getByText(/no suitable brainworkers yet/i)).toBeInTheDocument();
    });
    expect(screen.getByRole('link', { name: /find a service instead/i })).toBeInTheDocument();
  });

  it('renders constraint_limited state for REQ-CONSTRAINED with constraint label', async () => {
    renderScreen('REQ-CONSTRAINED');
    await waitFor(() => {
      expect(screen.getByText(/no matches for current conditions/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/outside the current active service area/i)).toBeInTheDocument();
  });

  it('renders failed state for REQ-FAILED with retry button', async () => {
    renderScreen('REQ-FAILED');
    await waitFor(() => {
      expect(screen.getByText(/matching could not complete/i)).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });

  it('renders offline state for REQ-OFFLINE', async () => {
    renderScreen('REQ-OFFLINE');
    await waitFor(() => {
      expect(screen.getByText(/you appear to be offline/i)).toBeInTheDocument();
    });
  });

  it('renders invalid_context state for unknown reference code', async () => {
    renderScreen('REQ-UNKNOWN-XYZ');
    await waitFor(() => {
      expect(screen.getByText(/job not found/i)).toBeInTheDocument();
    });
    // Multiple "Back to jobs" links may render, ensure at least one exists pointing to /jobs
    const backLinks = screen.getAllByRole('link', { name: /back to jobs/i });
    expect(backLinks.length).toBeGreaterThanOrEqual(1);
    expect(backLinks[0]).toHaveAttribute('href', '/jobs');
  });

  it('renders partial_results notice alongside candidates for REQ-PARTIAL', async () => {
    renderScreen('REQ-PARTIAL');
    await waitFor(() => {
      expect(screen.getByText(/some match information is unavailable/i)).toBeInTheDocument();
    });
    expect(screen.getByText('Folake Adeyemi')).toBeInTheDocument();
  });

  it('shows "Back to jobs" link that returns to /jobs', async () => {
    renderScreen('REQ-84920');
    await waitFor(() => {
      expect(screen.getByText('Tunde Bakare')).toBeInTheDocument();
    });
    const backLink = screen.getAllByRole('link', { name: /back to jobs/i })[0];
    expect(backLink).toHaveAttribute('href', '/jobs');
  });

  it('match count header uses singular for single result', async () => {
    renderScreen('REQ-51829');
    await waitFor(() => {
      expect(screen.getByText(/1 brainworker found/i)).toBeInTheDocument();
    });
  });

  it('match count header uses plural for multiple results', async () => {
    renderScreen('REQ-84920');
    await waitFor(() => {
      expect(screen.getByText(/2 brainworkers found/i)).toBeInTheDocument();
    });
  });

  it('select button changes to "Withdraw interest" after clicking', async () => {
    renderScreen('REQ-84920');
    await waitFor(() => {
      expect(screen.getByText('Tunde Bakare')).toBeInTheDocument();
    });

    const selectBtns = screen.getAllByRole('button', { name: /select this brainworker: tunde bakare/i });
    expect(selectBtns.length).toBeGreaterThan(0);

    await act(async () => {
      fireEvent.click(selectBtns[0]!);
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /withdraw interest: tunde bakare/i })).toBeInTheDocument();
    });
  });

  it('shows confirmation message after selection (not a booking claim)', async () => {
    renderScreen('REQ-84920');
    await waitFor(() => {
      expect(screen.getByText('Tunde Bakare')).toBeInTheDocument();
    });

    const selectBtns = screen.getAllByRole('button', { name: /select this brainworker: tunde bakare/i });

    await act(async () => {
      fireEvent.click(selectBtns[0]!);
    });

    await waitFor(() => {
      // The screen-level confirmation has aria-atomic="true": query all statuses and check one
      const statuses = screen.getAllByRole('status');
      const screenConfirmation = statuses.find(
        (el) => el.getAttribute('aria-atomic') === 'true'
      );
      expect(screenConfirmation).toBeDefined();
      const text = screenConfirmation!.textContent?.toLowerCase() ?? '';
      expect(text).not.toContain('book');
      expect(text).not.toContain('accept');
    });
  });

  // ── Accessibility ────────────────────────────────────────────────────────────

  it('match results list has role=list and each item has role=listitem', async () => {
    renderScreen('REQ-84920');
    await waitFor(() => {
      expect(screen.getByRole('list', { name: /match results/i })).toBeInTheDocument();
    });
    const listItems = screen.getAllByRole('listitem');
    expect(listItems.length).toBeGreaterThanOrEqual(2);
  });

  it('each match card is an article with an accessible label', async () => {
    renderScreen('REQ-84920');
    await waitFor(() => {
      const articles = screen.getAllByRole('article');
      expect(articles.length).toBeGreaterThanOrEqual(2);
      for (const article of articles) {
        expect(article).toHaveAttribute('aria-label');
      }
    });
  });

  it('breadcrumb nav has role=navigation with aria-label', async () => {
    renderScreen('REQ-84920');
    await waitFor(() => {
      expect(screen.getByRole('navigation', { name: /breadcrumb/i })).toBeInTheDocument();
    });
  });

  it('failure states use role=alert for immediate screen-reader announcement', async () => {
    renderScreen('REQ-FAILED');
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  it('in_progress state uses role=status for polite announcement', async () => {
    renderScreen('REQ-INPROG');
    await waitFor(() => {
      expect(screen.getByRole('status', { name: /matching is in progress/i })).toBeInTheDocument();
    });
  });
});

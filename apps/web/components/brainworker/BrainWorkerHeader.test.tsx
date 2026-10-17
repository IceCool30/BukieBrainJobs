/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { BrainWorkerHeader } from './BrainWorkerHeader';

const user = { id: 'bw-1', name: 'Tunde Bakare', email: 'tunde@example.com', role: 'brainworker', isBrainWorkerApproved: true } as never;

afterEach(cleanup);

describe('BrainWorkerHeader', () => {
  it('links every workspace section and marks the active one', () => {
    render(<BrainWorkerHeader active="wallet" user={user} onSignOut={vi.fn()} />);
    const nav = screen.getByRole('navigation', { name: /brainworker workspace/i });
    const links = within(nav).getAllByRole('link');
    expect(links.map((l) => l.getAttribute('href'))).toEqual([
      '/brainworker/dashboard',
      '/brainworker/leads',
      '/brainworker/bookings',
      '/brainworker/services',
      '/brainworker/availability',
      '/brainworker/profile',
      '/brainworker/wallet',
    ]);
    expect(within(nav).getByRole('link', { name: /wallet/i })).toHaveAttribute('aria-current', 'page');
    expect(within(nav).getByRole('link', { name: /dashboard/i })).not.toHaveAttribute('aria-current');
  });

  it('shows the signed-in BrainWorker and signs out', () => {
    const onSignOut = vi.fn();
    render(<BrainWorkerHeader active="dashboard" user={user} onSignOut={onSignOut} />);
    expect(screen.getByText('Tunde Bakare')).toBeInTheDocument();
    expect(screen.getByText(/verified provider/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /sign out/i }));
    expect(onSignOut).toHaveBeenCalledOnce();
  });

  it('hides account controls until a user is known', () => {
    render(<BrainWorkerHeader active="dashboard" user={null} onSignOut={vi.fn()} />);
    expect(screen.queryByRole('button', { name: /sign out/i })).not.toBeInTheDocument();
  });
});

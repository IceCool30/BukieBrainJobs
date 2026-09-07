import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import NotFound from './not-found';

describe('NotFound Page (404)', () => {
  it('renders the 404 header, branding, status badge, and recovery navigation links', () => {
    render(<NotFound />);

    // Brand and Status
    expect(screen.getByText('BukieBrainJobs')).toBeInTheDocument();
    expect(screen.getByText(/status 404: page not found/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: /we could not find that page/i })).toBeInTheDocument();

    // Primary & Secondary Actions
    const homeLink = screen.getByRole('link', { name: /return to homepage/i });
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute('href', '/');

    const servicesLink = screen.getByRole('link', { name: /browse services/i });
    expect(servicesLink).toBeInTheDocument();
    expect(servicesLink).toHaveAttribute('href', '/services');

    // Helpful destinations
    const postJobLink = screen.getByRole('link', { name: /post a job request/i });
    expect(postJobLink).toBeInTheDocument();
    expect(postJobLink).toHaveAttribute('href', '/post-job');

    const dashboardLink = screen.getByRole('link', { name: /customer dashboard/i });
    expect(dashboardLink).toBeInTheDocument();
    expect(dashboardLink).toHaveAttribute('href', '/dashboard');
  });
});

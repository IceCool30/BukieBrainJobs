/** @vitest-environment jsdom */
import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import EnterprisePage from './page';

afterEach(() => {
  cleanup();
});

describe('EnterprisePage', () => {
  it('renders page heading, kicker, and brand logo link', () => {
    render(<EnterprisePage />);

    expect(screen.getByRole('heading', { level: 1, name: /business services for recurring work/i })).toBeInTheDocument();
    expect(screen.getByText(/bukiebrainjobs for business/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /bukiebrainjobs/i })).toHaveAttribute('href', '/');
  });

  it('renders Explore services and Browse services CTA links pointing to /services', () => {
    render(<EnterprisePage />);

    const exploreLink = screen.getByRole('link', { name: /explore services/i });
    expect(exploreLink).toBeInTheDocument();
    expect(exploreLink).toHaveAttribute('href', '/services');

    const browseLink = screen.getByRole('link', { name: /browse services/i });
    expect(browseLink).toBeInTheDocument();
    expect(browseLink).toHaveAttribute('href', '/services');
  });

  it('renders all 3 recurring work focus points', () => {
    render(<EnterprisePage />);

    expect(screen.getByText('Estates and facilities')).toBeInTheDocument();
    expect(screen.getByText('Teams and BrainWorkers')).toBeInTheDocument();
    expect(screen.getByText('Clearer oversight')).toBeInTheDocument();
  });

  it('renders back to home navigation link', () => {
    render(<EnterprisePage />);

    const backLink = screen.getByRole('link', { name: /back to home/i });
    expect(backLink).toBeInTheDocument();
    expect(backLink).toHaveAttribute('href', '/');
  });
});

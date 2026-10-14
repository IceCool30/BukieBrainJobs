/** @vitest-environment jsdom */
import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import GuaranteePage from './page';

afterEach(() => {
  cleanup();
});

describe('GuaranteePage', () => {
  it('renders page heading, brand kicker, and back link', () => {
    render(<GuaranteePage />);

    expect(screen.getByRole('heading', { level: 1, name: /review the details before you move ahead/i })).toBeInTheDocument();
    expect(screen.getAllByText(/bukieguarantee/i)[0]).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /back to home/i })).toHaveAttribute('href', '/');
  });

  it('renders Find a service CTA link pointing to /services', () => {
    render(<GuaranteePage />);

    const cta = screen.getByRole('link', { name: /find a service/i });
    expect(cta).toBeInTheDocument();
    expect(cta).toHaveAttribute('href', '/services');
  });

  it('renders all 3 booking preparation steps', () => {
    render(<GuaranteePage />);

    expect(screen.getByText('Review the service and profile')).toBeInTheDocument();
    expect(screen.getByText('Prepare the details that matter')).toBeInTheDocument();
    expect(screen.getByText('Keep a clear record')).toBeInTheDocument();
  });

  it('renders support email contact link in footer', () => {
    render(<GuaranteePage />);

    const supportLink = screen.getAllByRole('link', { name: /contact support/i })[0]!;
    expect(supportLink).toBeInTheDocument();
    expect(supportLink).toHaveAttribute('href', 'mailto:support@bukiebrainjobs.ng');
  });
});

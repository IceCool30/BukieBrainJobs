import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import FeaturedBrainWorkers from './FeaturedBrainWorkers';

describe('FeaturedBrainWorkers component', () => {
  it('renders section title and descriptive subtitle', () => {
    render(<FeaturedBrainWorkers />);
    expect(screen.getByRole('heading', { level: 2, name: /Meet the featured BrainWorkers/i })).toBeInTheDocument();
    expect(screen.getByText(/Take a closer look at the services and profile details/i)).toBeInTheDocument();
  });

  it('renders all four featured BrainWorker cards', () => {
    render(<FeaturedBrainWorkers />);
    expect(screen.getByText('Engr. Emeka Nwosu')).toBeInTheDocument();
    expect(screen.getByText('Babatunde Adebayo')).toBeInTheDocument();
    expect(screen.getByText('Chinedu Eze')).toBeInTheDocument();
    expect(screen.getByText('Tariq Olanrewaju')).toBeInTheDocument();
  });

  it('renders verified badges and stat capsules on each card', () => {
    render(<FeaturedBrainWorkers />);
    const verifiedBadges = screen.getAllByTitle('Verified BrainWorker');
    expect(verifiedBadges.length).toBe(4);

    // Assert stat metrics are present (e.g. 188 completed jobs for Emeka)
    expect(screen.getByText('188')).toBeInTheDocument();
    expect(screen.getByText('134')).toBeInTheDocument();
  });

  it('renders Book BrainWorker CTA buttons on cards', () => {
    render(<FeaturedBrainWorkers />);
    const ctas = screen.getAllByText('Book BrainWorker');
    expect(ctas.length).toBe(4);
  });

  it('passes profileCity correctly into worker profile links', () => {
    render(<FeaturedBrainWorkers profileCity="Abuja" />);
    const link = screen.getByRole('link', { name: /Engr\. Emeka Nwosu/i });
    expect(link.getAttribute('href')).toContain('city=Abuja');
  });
});

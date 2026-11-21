import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import HeroSection from './HeroSection';

describe('HeroSection desktop hero component', () => {
  it('renders the owner-approved headline with mint BukieBrainJobs branding', () => {
    render(<HeroSection />);

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent(
      'Book a skilled local or remote worker in minutes or find flexible work that pays what you are worth only on BukieBrainJobs.'
    );
    expect(heading).not.toHaveTextContent('Hire elite Nigerian artisans');
    expect(heading).not.toHaveTextContent('total escrow protection');

    const brandSpan = heading.querySelector('span');
    expect(brandSpan).toHaveTextContent('BukieBrainJobs.');
    expect(brandSpan?.className).toContain('text-[#2FE896]');
  });

  it('renders the hero image with bright portrait backdrop and no desaturating blend modes', () => {
    const { container } = render(<HeroSection />);

    const heroImg = screen.getByAltText('BukieBrainJobs BrainWorkers at work');
    expect(heroImg).toBeInTheDocument();
    expect(heroImg).toHaveAttribute('src', '/images/hero-portrait-1920.png');

    // Verify original alignment is preserved
    expect(heroImg).toHaveClass('object-cover');
    expect(heroImg).toHaveClass('md:object-[70%_50%]');
    expect(heroImg).toHaveClass('lg:object-center');

    // The backdrop container must NOT have opacity-30 or mix-blend-luminosity
    // which previously stripped color warmth and dimmed faces into gray ghosts
    const pictureEl = heroImg.parentElement;
    const backdropContainer = pictureEl?.parentElement;
    expect(backdropContainer).toBeDefined();

    const containerClasses = backdropContainer?.className ?? '';
    expect(containerClasses).not.toContain('opacity-30');
    expect(containerClasses).not.toContain('mix-blend-luminosity');

    // Scrim fades to transparent on the right so the portrait remains bright
    const scrim = container.querySelector('.bg-gradient-to-r');
    expect(scrim).toBeInTheDocument();
    expect(scrim?.className).toContain('to-transparent');
  });
});

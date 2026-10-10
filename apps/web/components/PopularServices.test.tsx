import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PopularServices from './PopularServices';

describe('PopularServices component', () => {
  it('renders section title and view all link', () => {
    render(<PopularServices />);
    expect(screen.getByRole('heading', { level: 2, name: /Browse services/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /View all services/i })).toHaveAttribute('href', '/services');
  });

  it('renders service categories with starting prices and deliverable tags', () => {
    render(<PopularServices />);
    const genCards = screen.getAllByText('Generator Servicing & Repair');
    expect(genCards.length).toBeGreaterThan(0);
    expect(screen.getAllByText(/From ₦10,000/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText('AC Repair & Gas Refill').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/From ₦12,000/i).length).toBeGreaterThan(0);
  });

  it('invokes onSelectCategory when a service card is clicked', () => {
    const handleSelect = vi.fn();
    render(<PopularServices onSelectCategory={handleSelect} />);
    const genCard = screen.getByRole('button', { name: /Explore Generator Servicing & Repair/i });
    fireEvent.click(genCard);
    expect(handleSelect).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'generator' })
    );
  });
});

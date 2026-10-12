import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import TradesRequisitionBoard from './TradesRequisitionBoard';

describe('TradesRequisitionBoard Component', () => {
  it('renders technical requisition station toolbar and discipline filters', () => {
    render(<TradesRequisitionBoard />);
    expect(screen.getByText(/TECHNICAL REQUISITION INDEX/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /Power Generation/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Solar & Inverters/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Plant Automation/i })).toBeDefined();
  });

  it('filters requisitions when discipline filter pill is clicked', () => {
    render(<TradesRequisitionBoard />);
    const solarFilter = screen.getByRole('button', { name: /Solar & Inverters/i });
    fireEvent.click(solarFilter);

    // Confirm solar requisitions are visible and filtered
    expect(screen.getByText(/REQ-8821/i)).toBeDefined();
    expect(screen.queryByText(/REQ-8820/i)).toBeNull(); // Diesel generator overhaul filtered out
  });

  it('opens spec inspection drawer when clicking Inspect Spec button', () => {
    render(<TradesRequisitionBoard />);
    const inspectButtons = screen.getAllByRole('button', { name: /INSPECT SPEC/i });
    expect(inspectButtons.length).toBeGreaterThan(0);
    const firstButton = inspectButtons[0];
    if (!firstButton) throw new Error('Expected at least one inspect button');

    fireEvent.click(firstButton);
    expect(screen.getByRole('dialog')).toBeDefined();
    expect(screen.getByText(/TECHNICAL SPECIFICATION DOSSIER/i)).toBeDefined();
    expect(screen.getByText(/BOOK OPPORTUNITY/i)).toBeDefined();
  });

  it('closes spec inspection drawer when close button is clicked', () => {
    render(<TradesRequisitionBoard />);
    const inspectButtons = screen.getAllByRole('button', { name: /INSPECT SPEC/i });
    const firstButton = inspectButtons[0];
    if (!firstButton) throw new Error('Expected at least one inspect button');

    fireEvent.click(firstButton);

    const closeBtn = screen.getByRole('button', { name: /Close spec drawer/i });
    fireEvent.click(closeBtn);
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});

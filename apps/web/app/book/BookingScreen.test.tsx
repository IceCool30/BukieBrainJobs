import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useRouter, useSearchParams } from 'next/navigation';
import type { ReadonlyURLSearchParams } from 'next/navigation';
import BookingScreen from '../../components/BookingScreen';

function makeSearchParams(params: Record<string, string> = {}): ReadonlyURLSearchParams {
  return new URLSearchParams(params) as unknown as ReadonlyURLSearchParams;
}

function makeRouter() {
  return {
    push: vi.fn(),
    replace: vi.fn(),
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

describe('BookingScreen — Initial render & query context hydration', () => {
  beforeEach(() => {
    vi.mocked(useRouter).mockReturnValue(makeRouter());
  });

  it('renders booking preparation page with valid service, price, city, and worker', () => {
    vi.mocked(useSearchParams).mockReturnValue(
      makeSearchParams({
        service: 'Generator Servicing & Repair',
        price: '₦12,000',
        city: 'Lagos',
        worker: 'Engr. Emeka Nwosu',
      }),
    );

    render(<BookingScreen />);

    expect(
      screen.getByRole('heading', { level: 1, name: /prepare your service request/i }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('heading', { level: 2, name: 'Generator Servicing & Repair' }),
    ).toBeInTheDocument();
    expect(screen.getAllByText('₦12,000').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/preferred brainworker/i)).toBeInTheDocument();
    expect(screen.getAllByText(/engr\. emeka nwosu/i).length).toBeGreaterThanOrEqual(1);

    // City dropdown pre-populated with Lagos
    const citySelect = screen.getByLabelText(/city/i) as HTMLSelectElement;
    expect(citySelect.value).toBe('Lagos');
  });

  it('does not render preferred worker section if worker is not provided', () => {
    vi.mocked(useSearchParams).mockReturnValue(
      makeSearchParams({
        service: 'generator',
        city: 'Lagos',
      }),
    );

    render(<BookingScreen />);
    expect(screen.queryByText(/preferred brainworker/i)).not.toBeInTheDocument();
  });

  it('renders recovery state when service context is missing directly on /book', () => {
    vi.mocked(useSearchParams).mockReturnValue(makeSearchParams({}));

    render(<BookingScreen />);

    expect(screen.getByRole('heading', { name: /no service selected/i })).toBeInTheDocument();
    expect(
      screen.getByText(/please choose a service from our directory/i),
    ).toBeInTheDocument();
    const returnLink = screen.getByRole('link', { name: /browse services/i });
    expect(returnLink).toBeInTheDocument();
    expect(returnLink).toHaveAttribute('href', '/services');
  });

  it('renders recovery state when service context is unrecognized', () => {
    vi.mocked(useSearchParams).mockReturnValue(
      makeSearchParams({ service: 'Rocket Science Repair' }),
    );

    render(<BookingScreen />);

    expect(screen.getByRole('heading', { name: /service not found/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /browse services/i })).toBeInTheDocument();
  });

  it('shows an informational notice for invalid or inactive city without defaulting to Lagos', () => {
    vi.mocked(useSearchParams).mockReturnValue(
      makeSearchParams({
        service: 'generator',
        city: 'London',
      }),
    );

    render(<BookingScreen />);

    expect(
      screen.getByText(/is currently not available for bookings/i),
    ).toBeInTheDocument();

    const citySelect = screen.getByLabelText(/city/i) as HTMLSelectElement;
    expect(citySelect.value).toBe('');
  });
});

describe('BookingScreen — Form validation & interaction', () => {
  beforeEach(() => {
    vi.mocked(useRouter).mockReturnValue(makeRouter());
    vi.mocked(useSearchParams).mockReturnValue(
      makeSearchParams({
        service: 'generator',
        city: 'Lagos',
      }),
    );
  });

  it('displays inline validation errors when required fields are empty', async () => {
    const user = userEvent.setup();
    render(<BookingScreen />);

    const submitButton = screen.getByRole('button', { name: /submit service request/i });
    await user.click(submitButton);

    expect(screen.getByText('Enter a complete street address.')).toBeInTheDocument();
    expect(
      screen.getByText('Add a few details about the work you need done.'),
    ).toBeInTheDocument();

    const addressInput = screen.getByLabelText(/street address/i);
    expect(addressInput).toHaveAttribute('aria-invalid', 'true');
    expect(addressInput).toHaveAttribute('aria-describedby', 'booking-address-error');
  });

  it('rejects whitespace-only address and notes input', async () => {
    const user = userEvent.setup();
    render(<BookingScreen />);

    const addressInput = screen.getByLabelText(/street address/i);
    const notesInput = screen.getByLabelText(/job details/i);

    await user.type(addressInput, '     ');
    await user.type(notesInput, '                     ');

    const submitButton = screen.getByRole('button', { name: /submit service request/i });
    await user.click(submitButton);

    expect(screen.getByText('Enter a complete street address.')).toBeInTheDocument();
    expect(
      screen.getByText('Add a few details about the work you need done.'),
    ).toBeInTheDocument();
  });

  it('clears field validation error on user input', async () => {
    const user = userEvent.setup();
    render(<BookingScreen />);

    const submitButton = screen.getByRole('button', { name: /submit service request/i });
    await user.click(submitButton);

    expect(screen.getByText('Enter a complete street address.')).toBeInTheDocument();

    const addressInput = screen.getByLabelText(/street address/i);
    await user.type(addressInput, '14 Admiralty Way, Lekki');

    expect(screen.queryByText('Enter a complete street address.')).not.toBeInTheDocument();
  });

  it('allows selecting date options and switches to custom date input when Specific Date is clicked', async () => {
    const user = userEvent.setup();
    render(<BookingScreen />);

    const todayButton = screen.getByRole('button', { name: 'Today' });
    await user.click(todayButton);
    expect(todayButton).toHaveAttribute('aria-pressed', 'true');

    const specificDateButton = screen.getByRole('button', { name: 'Specific Date' });
    await user.click(specificDateButton);
    expect(specificDateButton).toHaveAttribute('aria-pressed', 'true');

    const datePicker = screen.getByLabelText(/choose date/i);
    expect(datePicker).toBeInTheDocument();
  });

  it('allows switching payment preference options', async () => {
    const user = userEvent.setup();
    render(<BookingScreen />);

    const transferButton = screen.getByRole('radio', { name: /bank transfer/i });
    await user.click(transferButton);
    expect(transferButton).toBeChecked();
  });
});

describe('BookingScreen — Submission lifecycle & error recovery', () => {
  beforeEach(() => {
    vi.mocked(useRouter).mockReturnValue(makeRouter());
  });

  it('submits valid form and transitions to accessible confirmation state', async () => {
    vi.mocked(useSearchParams).mockReturnValue(
      makeSearchParams({
        service: 'Generator Servicing & Repair',
        price: '₦12,000',
        city: 'Lagos',
      }),
    );
    const user = userEvent.setup();
    render(<BookingScreen />);

    const addressInput = screen.getByLabelText(/street address/i);
    const landmarkInput = screen.getByLabelText(/landmark/i);
    const notesInput = screen.getByLabelText(/job details/i);

    await user.type(addressInput, '14 Admiralty Way, Lekki Phase 1');
    await user.type(landmarkInput, 'Opposite Ebeano');
    await user.type(
      notesInput,
      'Generator has a faulty carburetor and needs immediate servicing before the weekend.',
    );

    const submitButton = screen.getByRole('button', { name: /submit service request/i });
    await user.click(submitButton);

    // Pending state
    expect(screen.getByRole('button', { name: /submitting request/i })).toBeDisabled();

    // Confirmation state
    await waitFor(() => {
      expect(
        screen.getByRole('heading', { level: 1, name: /service request prepared/i }),
      ).toBeInTheDocument();
    });

    expect(screen.getByText(/generator servicing & repair/i)).toBeInTheDocument();
    expect(screen.getByText(/14 admiralty way, lekki phase 1/i)).toBeInTheDocument();
    expect(
      screen.getByText(/this is a mock preparation step/i),
    ).toBeInTheDocument();

    const returnBtn = screen.getByRole('link', { name: /return to services/i });
    expect(returnBtn).toBeInTheDocument();
    expect(returnBtn).toHaveAttribute('href', '/services?category=generator&city=Lagos');
  });

  it('handles mockError=1 failure state and preserves user input for retry', async () => {
    vi.mocked(useSearchParams).mockReturnValue(
      makeSearchParams({
        service: 'generator',
        city: 'Lagos',
        mockError: '1',
      }),
    );
    const user = userEvent.setup();
    render(<BookingScreen />);

    const addressInput = screen.getByLabelText(/street address/i) as HTMLInputElement;
    const notesInput = screen.getByLabelText(/job details/i) as HTMLTextAreaElement;

    await user.type(addressInput, '22 Marina Street, Lagos Island');
    await user.type(notesInput, 'The generator does not start at all. Please inspect oil and plugs.');

    const submitButton = screen.getByRole('button', { name: /submit service request/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/we could not submit your booking request/i),
      ).toBeInTheDocument();
    });

    // Form inputs must be PRESERVED
    expect(addressInput.value).toBe('22 Marina Street, Lagos Island');
    expect(notesInput.value).toBe(
      'The generator does not start at all. Please inspect oil and plugs.',
    );

    // Retry button available
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });
});

import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useRouter, useSearchParams } from 'next/navigation';
import type { ReadonlyURLSearchParams } from 'next/navigation';
import AuthScreen from '../../components/auth/AuthScreen';
import {
  savePreservedBookingDraft,
  clearPreservedBookingDraft,
  savePreservedJobDraft,
  clearPreservedJobDraft,
  PreservedBookingDraft,
  PreservedJobDraft,
} from '../../lib/auth';

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
  clearPreservedBookingDraft();
  clearPreservedJobDraft();
  vi.clearAllMocks();
});

describe('AuthScreen — Initial Render & Provider Discovery', () => {
  let routerMock: ReturnType<typeof makeRouter>;

  beforeEach(() => {
    routerMock = makeRouter();
    vi.mocked(useRouter).mockReturnValue(routerMock);
    vi.mocked(useSearchParams).mockReturnValue(makeSearchParams({}));
  });

  it('renders Welcome Back heading and first-class authentication providers', () => {
    render(<AuthScreen initialMode="signin" />);

    expect(screen.getByRole('heading', { level: 1, name: /welcome back/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /continue with google/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /continue with apple/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /phone number/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /email & password/i })).toBeInTheDocument();
  });

  it('allows switching between Sign In and Create Account and preserves entered contact input', async () => {
    const user = userEvent.setup();
    render(<AuthScreen initialMode="signin" />);

    // Switch to email method and enter an email
    await user.click(screen.getByRole('button', { name: /email & password/i }));
    const emailInput = screen.getByLabelText(/email address/i) as HTMLInputElement;
    await user.type(emailInput, 'chidi.okafor@example.com');

    // Switch tab to Create Account
    const registerTab = screen.getByRole('tab', { name: /create account/i });
    await user.click(registerTab);

    expect(screen.getByRole('heading', { level: 1, name: /create your account/i })).toBeInTheDocument();
    // Input must be preserved across mode switch
    const registerEmailInput = screen.getByLabelText(/email address/i) as HTMLInputElement;
    expect(registerEmailInput.value).toBe('chidi.okafor@example.com');
  });

  it('renders explicit role selection with BrainWorker non-approval notice in registration mode', async () => {
    const user = userEvent.setup();
    render(<AuthScreen initialMode="register" />);

    expect(screen.getByRole('heading', { level: 1, name: /create your account/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/customer/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/brainworker/i)).toBeInTheDocument();

    // Select BrainWorker role
    const brainWorkerRadio = screen.getByLabelText(/brainworker/i);
    await user.click(brainWorkerRadio);

    // Verify non-approval disclaimer is visible
    expect(
      screen.getByText(/professional verification and approval are completed in a separate onboarding workflow/i),
    ).toBeInTheDocument();
  });
});

describe('AuthScreen — Phone OTP Authentication', () => {
  let routerMock: ReturnType<typeof makeRouter>;

  beforeEach(() => {
    routerMock = makeRouter();
    vi.mocked(useRouter).mockReturnValue(routerMock);
    vi.mocked(useSearchParams).mockReturnValue(makeSearchParams({}));
  });

  it('accepts 080... format, displays masked phone, and verifies valid OTP code', async () => {
    const user = userEvent.setup();
    render(<AuthScreen initialMode="signin" />);

    const phoneInput = screen.getByLabelText(/nigerian phone number/i);
    await user.type(phoneInput, '08012345678');

    const sendCodeButton = screen.getByRole('button', { name: /send verification code/i });
    await user.click(sendCodeButton);

    // Transitions to Phone OTP verification step
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /verify your phone number/i })).toBeInTheDocument();
      expect(screen.getByText(/\+234 801 ••• ••78/i)).toBeInTheDocument();
    });

    // Enter valid 6-digit OTP
    const otpInput = screen.getByLabelText(/6-digit verification code/i);
    await user.type(otpInput, '123456');

    const verifyButton = screen.getByRole('button', { name: /verify & continue/i });
    await user.click(verifyButton);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /authentication successful/i })).toBeInTheDocument();
    });
  });

  it('rejects invalid phone numbers with clear inline error', async () => {
    const user = userEvent.setup();
    render(<AuthScreen initialMode="signin" />);

    const phoneInput = screen.getByLabelText(/nigerian phone number/i);
    await user.type(phoneInput, '1234');

    const sendCodeButton = screen.getByRole('button', { name: /send verification code/i });
    await user.click(sendCodeButton);

    expect(screen.getByRole('alert')).toHaveTextContent(/enter a valid nigerian phone number/i);
  });

  it('rejects invalid OTP code with clear error feedback', async () => {
    const user = userEvent.setup();
    render(<AuthScreen initialMode="signin" />);

    const phoneInput = screen.getByLabelText(/nigerian phone number/i);
    await user.type(phoneInput, '+2348012345678');
    await user.click(screen.getByRole('button', { name: /send verification code/i }));

    await waitFor(() => {
      expect(screen.getByLabelText(/6-digit verification code/i)).toBeInTheDocument();
    });

    const otpInput = screen.getByLabelText(/6-digit verification code/i);
    await user.type(otpInput, '000000'); // 000000 triggers simulated invalid OTP

    const verifyButton = screen.getByRole('button', { name: /verify & continue/i });
    await user.click(verifyButton);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/verification code entered is incorrect/i);
    });
  });
});

describe('AuthScreen — Email/Password & Social Mock Providers', () => {
  let routerMock: ReturnType<typeof makeRouter>;

  beforeEach(() => {
    routerMock = makeRouter();
    vi.mocked(useRouter).mockReturnValue(routerMock);
    vi.mocked(useSearchParams).mockReturnValue(makeSearchParams({}));
  });

  it('authenticates with valid email and password', async () => {
    const user = userEvent.setup();
    render(<AuthScreen initialMode="signin" />);

    await user.click(screen.getByRole('button', { name: /email & password/i }));
    await user.type(screen.getByLabelText(/email address/i), 'solomon@example.com');
    await user.type(screen.getByLabelText(/password/i), 'SecurePass123');

    await user.click(screen.getByRole('button', { name: /^sign in$/i }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /authentication successful/i })).toBeInTheDocument();
    });
  });

  it('authenticates with Google mock provider', async () => {
    const user = userEvent.setup();
    render(<AuthScreen initialMode="signin" />);

    const googleBtn = screen.getByRole('button', { name: /continue with google/i });
    await user.click(googleBtn);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /authentication successful/i })).toBeInTheDocument();
      expect(screen.getByText(/verified google account/i)).toBeInTheDocument();
    });
  });

  it('handles simulated Google failure when mockAuthError=google is passed', async () => {
    vi.mocked(useSearchParams).mockReturnValue(makeSearchParams({ mockAuthError: 'google' }));
    const user = userEvent.setup();
    render(<AuthScreen initialMode="signin" />);

    const googleBtn = screen.getByRole('button', { name: /continue with google/i });
    await user.click(googleBtn);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/could not connect to google authentication/i);
    });
  });

  it('authenticates with Apple mock provider', async () => {
    const user = userEvent.setup();
    render(<AuthScreen initialMode="signin" />);

    const appleBtn = screen.getByRole('button', { name: /continue with apple/i });
    await user.click(appleBtn);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /authentication successful/i })).toBeInTheDocument();
      expect(screen.getByText(/verified apple account/i)).toBeInTheDocument();
    });
  });

  it('handles forgot password flow without exposing account enumeration', async () => {
    const user = userEvent.setup();
    render(<AuthScreen initialMode="forgot_password" />);

    expect(screen.getByRole('heading', { name: /reset your password/i })).toBeInTheDocument();

    await user.type(screen.getByLabelText(/your account email/i), 'user@example.com');
    await user.click(screen.getByRole('button', { name: /send reset instructions/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        /if an account exists with this email address, password reset instructions have been sent/i,
      );
    });
  });
});

describe('AuthScreen — Booking Handoff & Return Destination Safety', () => {
  let routerMock: ReturnType<typeof makeRouter>;

  beforeEach(() => {
    routerMock = makeRouter();
    vi.mocked(useRouter).mockReturnValue(routerMock);
  });

  it('displays preserved booking draft context and explanation when entered from /book', () => {
    const draft: PreservedBookingDraft = {
      service: 'Generator Servicing & Repair',
      priceContext: '₦12,000',
      city: 'Lagos',
      worker: 'Engr. Emeka Nwosu',
      streetAddress: '14 Admiralty Way, Lekki Phase 1',
      landmark: 'Opposite Ebeano',
      date: 'Tomorrow',
      arrivalWindow: 'Morning (9:00 AM - 12:00 PM)',
      jobDescription: 'Generator carburetor cleaning and oil filter change.',
      paymentPreference: 'card',
    };
    savePreservedBookingDraft(draft);

    vi.mocked(useSearchParams).mockReturnValue(
      makeSearchParams({ returnUrl: '/book', handoff: '1' }),
    );

    render(<AuthScreen initialMode="signin" />);

    expect(
      screen.getByText(/sign in or create an account to continue with your service request/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/generator servicing & repair/i)).toBeInTheDocument();
    expect(screen.getByText('Lagos')).toBeInTheDocument();
    expect(screen.getByText('Tomorrow')).toBeInTheDocument();

    const backLink = screen.getByRole('link', { name: /back to booking/i });
    expect(backLink).toHaveAttribute('href', '/book');
  });

  it('displays preserved job draft context and explanation when entered from /post-job', () => {
    const jobDraft: PreservedJobDraft = {
      jobType: 'specific_service',
      category: 'generator',
      title: 'Generator Carburetor Overhaul and Wiring',
      city: 'Abuja',
      streetAddress: '12 Gana Street, Maitama',
      urgency: 'urgent',
    };
    savePreservedJobDraft(jobDraft);

    vi.mocked(useSearchParams).mockReturnValue(
      makeSearchParams({ returnUrl: '/post-job', handoff: '1' }),
    );

    render(<AuthScreen initialMode="signin" />);

    expect(
      screen.getByText(/sign in or create an account to post your job request/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/generator carburetor overhaul/i)).toBeInTheDocument();
    expect(screen.getByText('Abuja')).toBeInTheDocument();
    expect(screen.getByText(/urgent/i)).toBeInTheDocument();

    const backLink = screen.getByRole('link', { name: /back to job request/i });
    expect(backLink).toHaveAttribute('href', '/post-job');
  });

  it('neutralizes open redirect attempts in returnUrl query parameter', () => {
    vi.mocked(useSearchParams).mockReturnValue(
      makeSearchParams({ returnUrl: '//evil.com/phish' }),
    );

    render(<AuthScreen initialMode="signin" />);

    // Open redirect neutralized to safe internal root /
    const backLink = screen.getByRole('link', { name: /back to previous page/i });
    expect(backLink).toHaveAttribute('href', '/');
  });
});

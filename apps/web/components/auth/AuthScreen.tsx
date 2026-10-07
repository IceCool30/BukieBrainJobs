'use client';

import React, { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  AlertCircle,
  ArrowLeft,
  Briefcase,
  CheckCircle2,
  Clock,
  HelpCircle,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Phone,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';
import {
  normalizeNigerianPhone,
  validateEmailAddress,
  validatePassword,
  validatePhoneOtp,
  validateReturnDestination,
  validateRoleSelection,
} from '@bukiebrainjobs/validation';
import {
  AuthMode,
  AuthProvider,
  AuthUser,
  PreservedBookingDraft,
  PreservedJobDraft,
  UserRole,
  getPreservedBookingDraft,
  getPreservedJobDraft,
  mockEmailRegister,
  mockEmailSignIn,
  mockForgotPassword,
  mockResetPassword,
  mockSendPhoneOtp,
  mockSocialAuth,
  mockVerifyPhoneOtp,
  setMockAuthenticatedUser,
} from '../../lib/auth';

interface AuthScreenProps {
  initialMode?: AuthMode;
  initialReturnUrl?: string;
  onAuthSuccess?: (user: AuthUser) => void;
}

function GoogleIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"
      />
    </svg>
  );
}

function AppleIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.66-.82 1.12-1.96.99-3.1-.97.04-2.13.65-2.81 1.45-.6.69-1.12 1.83-.98 2.94 1.08.08 2.15-.47 2.8-1.29Z" />
    </svg>
  );
}

export default function AuthScreen({
  initialMode = 'signin',
  initialReturnUrl,
  onAuthSuccess,
}: AuthScreenProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Determine return URL with fallback and open redirect validation
  const returnParam = searchParams.get('returnUrl');
  const rawReturnUrl = initialReturnUrl ?? returnParam ?? '/dashboard';
  const validatedReturnUrl = useMemo(() => {
    // If no explicit return destination was provided, default authenticated users to their dashboard
    if (!initialReturnUrl && !returnParam) {
      return '/dashboard';
    }
    return validateReturnDestination(rawReturnUrl);
  }, [rawReturnUrl, initialReturnUrl, returnParam]);

  // Check if handoff came from booking or job posting
  const isBookingHandoff =
    (searchParams.get('handoff') === '1' && validatedReturnUrl.startsWith('/book')) ||
    validatedReturnUrl.startsWith('/book');

  const isJobHandoff =
    (searchParams.get('handoff') === '1' && validatedReturnUrl.startsWith('/post-job')) ||
    validatedReturnUrl.startsWith('/post-job');

  // Load preserved drafts if present
  const [preservedBooking, setPreservedBooking] =
    useState<PreservedBookingDraft | null>(null);
  const [preservedJob, setPreservedJob] =
    useState<PreservedJobDraft | null>(null);

  useEffect(() => {
    if (isBookingHandoff) {
      const draft = getPreservedBookingDraft();
      if (draft) {
        setPreservedBooking(draft);
      }
    }
    if (isJobHandoff) {
      const jobDraft = getPreservedJobDraft();
      if (jobDraft) {
        setPreservedJob(jobDraft);
      }
    }
  }, [isBookingHandoff, isJobHandoff]);

  // UI state
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [authMethod, setAuthMethod] = useState<'phone' | 'email'>('phone');
  const [role, setRole] = useState<UserRole>('customer');

  // Form fields
  const [phone, setPhone] = useState('');
  const [maskedPhone, setMaskedPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Status & validation
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittingProvider, setSubmittingProvider] = useState<AuthProvider | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [authenticatedUser, setAuthenticatedUser] = useState<AuthUser | null>(null);

  const headingRef = useRef<HTMLHeadingElement>(null);
  const successRef = useRef<HTMLHeadingElement>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  // OTP resend countdown ticker
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Check for test failure flag
  const mockErrorFlag = searchParams.get('mockAuthError');

  // Move focus on success
  useEffect(() => {
    if (authenticatedUser) {
      successRef.current?.focus();
    }
  }, [authenticatedUser]);

  // Mode switching preserves entered contact data
  const handleModeSwitch = (newMode: AuthMode) => {
    setMode(newMode);
    setFieldErrors({});
    setGeneralError(null);
    setSuccessMessage(null);
  };

  const handleSuccessfulAuth = (user: AuthUser) => {
    setAuthenticatedUser(user);
    setMockAuthenticatedUser(user);
    if (onAuthSuccess) {
      onAuthSuccess(user);
    }

    // Automatically proceed to return destination after brief confirmation
    const destination = isBookingHandoff
      ? `${validatedReturnUrl}${validatedReturnUrl.includes('?') ? '&' : '?'}bookingContinuation=1`
      : validatedReturnUrl;

    window.setTimeout(() => {
      router.push(destination);
    }, 1200);
  };

  // 1. Social Auth (Google / Apple)
  const handleSocialAuth = async (provider: 'google' | 'apple') => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setSubmittingProvider(provider);
    setGeneralError(null);

    const simulateError = mockErrorFlag === provider;
    const result = await mockSocialAuth(provider, role, simulateError);

    setIsSubmitting(false);
    setSubmittingProvider(null);

    if (result.success && result.user) {
      handleSuccessfulAuth(result.user);
    } else {
      setGeneralError(
        result.error || `Could not complete ${provider} authentication. Please try again.`,
      );
    }
  };

  // 2. Phone OTP: Step 1 Send Code
  const handleSendOtp = async (e: FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const norm = normalizeNigerianPhone(phone);
    if (!norm.valid) {
      setFieldErrors({ phone: norm.error || 'Enter a valid Nigerian phone number.' });
      document.getElementById('auth-phone')?.focus();
      return;
    }

    setIsSubmitting(true);
    setSubmittingProvider('phone');
    setFieldErrors({});
    setGeneralError(null);

    const simulateError = mockErrorFlag === 'phone';
    const result = await mockSendPhoneOtp(norm.normalized, simulateError);

    setIsSubmitting(false);
    setSubmittingProvider(null);

    if (result.success && result.maskedPhone) {
      setMaskedPhone(result.maskedPhone);
      setMode('phone_otp');
      setOtp('');
      setResendCooldown(45);
    } else {
      setGeneralError(result.error || 'Could not send verification code. Please try again.');
    }
  };

  // 2. Phone OTP: Step 2 Verify Code
  const handleVerifyOtp = async (e: FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const otpCheck = validatePhoneOtp(otp);
    if (!otpCheck.valid) {
      setFieldErrors({ otp: otpCheck.error || 'Enter the 6-digit code.' });
      document.getElementById('auth-otp')?.focus();
      return;
    }

    setIsSubmitting(true);
    setSubmittingProvider('phone');
    setFieldErrors({});
    setGeneralError(null);

    const simulateError = mockErrorFlag === 'otp';
    const result = await mockVerifyPhoneOtp(phone, otp, role, simulateError);

    setIsSubmitting(false);
    setSubmittingProvider(null);

    if (result.success && result.user) {
      handleSuccessfulAuth(result.user);
    } else {
      setGeneralError(
        result.error || 'The verification code entered is incorrect or expired.',
      );
      document.getElementById('auth-otp')?.focus();
    }
  };

  // 3. Email & Password Sign In
  const handleEmailSignIn = async (e: FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const errors: Record<string, string> = {};
    const emailCheck = validateEmailAddress(email);
    if (!emailCheck.valid) errors.email = emailCheck.error || 'Enter a valid email.';

    const passCheck = validatePassword(password);
    if (!passCheck.valid) errors.password = passCheck.error || 'Enter your password.';

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      const firstId = errors.email ? 'auth-email' : 'auth-password';
      document.getElementById(firstId)?.focus();
      return;
    }

    setIsSubmitting(true);
    setSubmittingProvider('email');
    setFieldErrors({});
    setGeneralError(null);

    const simulateError = mockErrorFlag === 'email';
    const result = await mockEmailSignIn(email, password, simulateError);

    setIsSubmitting(false);
    setSubmittingProvider(null);

    if (result.success && result.user) {
      handleSuccessfulAuth(result.user);
    } else {
      setGeneralError(result.error || 'Incorrect email or password.');
    }
  };

  // 4. Email & Password Register
  const handleEmailRegister = async (e: FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const errors: Record<string, string> = {};
    const emailCheck = validateEmailAddress(email);
    if (!emailCheck.valid) errors.email = emailCheck.error || 'Enter a valid email.';

    const passCheck = validatePassword(password);
    if (!passCheck.valid) errors.password = passCheck.error || 'Password must be at least 8 characters.';

    const roleCheck = validateRoleSelection(role);
    if (!roleCheck.valid) errors.role = roleCheck.error || 'Select a role.';

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      const firstId = errors.email
        ? 'auth-email'
        : errors.password
          ? 'auth-password'
          : 'role-customer';
      document.getElementById(firstId)?.focus();
      return;
    }

    setIsSubmitting(true);
    setSubmittingProvider('email');
    setFieldErrors({});
    setGeneralError(null);

    const simulateError = mockErrorFlag === 'email_register';
    const result = await mockEmailRegister(email, password, role, simulateError);

    setIsSubmitting(false);
    setSubmittingProvider(null);

    if (result.success && result.user) {
      handleSuccessfulAuth(result.user);
    } else {
      setGeneralError(result.error || 'Could not complete registration.');
    }
  };

  // 5. Forgot Password Request
  const handleForgotPassword = async (e: FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const emailCheck = validateEmailAddress(email);
    if (!emailCheck.valid) {
      setFieldErrors({ email: emailCheck.error || 'Enter a valid email address.' });
      document.getElementById('auth-forgot-email')?.focus();
      return;
    }

    setIsSubmitting(true);
    setFieldErrors({});
    setGeneralError(null);

    const simulateError = mockErrorFlag === 'forgot';
    const result = await mockForgotPassword(email, simulateError);

    setIsSubmitting(false);

    if (result.success && result.message) {
      setSuccessMessage(result.message);
    } else {
      setGeneralError(result.error || 'Unable to process your request. Please try again.');
    }
  };

  // 6. Reset Password Action
  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const errors: Record<string, string> = {};
    const passCheck = validatePassword(password);
    if (!passCheck.valid) {
      errors.password = passCheck.error || 'Password must be at least 8 characters.';
    }
    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      const firstId = errors.password ? 'auth-reset-pass' : 'auth-reset-confirm';
      document.getElementById(firstId)?.focus();
      return;
    }

    setIsSubmitting(true);
    setFieldErrors({});
    setGeneralError(null);

    const simulateError = mockErrorFlag === 'reset';
    const result = await mockResetPassword(password, simulateError);

    setIsSubmitting(false);

    if (result.success && result.message) {
      setSuccessMessage(result.message);
    } else {
      setGeneralError(result.error || 'Unable to update password. Please request a new link.');
    }
  };

  // RENDER: Success / Post-Authentication State
  if (authenticatedUser) {
    return (
      <main className="min-h-screen bg-[var(--bg)] text-[var(--text-main)]">
        <header className="border-b border-[var(--lead)] bg-[var(--card-bg)]">
          <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-4 sm:px-6 lg:px-8">
            <Link
              href="/"
              className="inline-flex min-h-11 items-center font-display text-base font-extrabold tracking-tight text-[var(--text-main)]"
            >
              BukieBrainJobs
            </Link>
          </div>
        </header>

        <div className="mx-auto max-w-md px-4 py-12 sm:px-6 sm:py-16">
          <section className="rounded-2xl border border-[var(--lead)] bg-[var(--card-bg)] p-6 text-center shadow-[0_12px_30px_rgba(0,26,65,0.06)] sm:p-8">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-[#059669]">
              <CheckCircle2 className="h-8 w-8 text-[#059669]" aria-hidden="true" />
            </div>

            <h1
              ref={successRef}
              tabIndex={-1}
              className="mt-4 font-display text-2xl font-bold tracking-tight text-[var(--text-main)] focus:outline-none"
            >
              Authentication successful
            </h1>

            <p className="mt-2 text-sm text-[var(--text-muted)]">
              Welcome, <span className="font-semibold text-[var(--text-main)]">{authenticatedUser.name}</span>!
            </p>

            {isBookingHandoff ? (
              <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 text-left">
                <p className="text-xs font-bold uppercase tracking-wider text-[#296A4B]">
                  Booking preserved
                </p>
                <p className="mt-1 text-sm text-[var(--text-main)]">
                  {preservedBooking?.service || 'Your service request'} in{' '}
                  <span className="font-semibold">{preservedBooking?.city || 'selected city'}</span> is ready.
                </p>
                <p className="mt-2 text-xs text-[var(--text-muted)]">
                  Returning you automatically to complete your request...
                </p>
              </div>
            ) : isJobHandoff ? (
              <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 text-left">
                <p className="text-xs font-bold uppercase tracking-wider text-[#296A4B]">
                  Job request preserved
                </p>
                <p className="mt-1 text-sm text-[var(--text-main)]">
                  {preservedJob?.title || 'Your job post'} in{' '}
                  <span className="font-semibold">{preservedJob?.city || 'selected city'}</span> is ready.
                </p>
                <p className="mt-2 text-xs text-[var(--text-muted)]">
                  Returning you automatically to finalize your job request...
                </p>
              </div>
            ) : (
              <p className="mt-3 text-sm text-[var(--text-muted)]">
                You are now signed in to your account.
              </p>
            )}

            <div className="mt-6">
              <Link
                href={
                  isBookingHandoff
                    ? `${validatedReturnUrl}${validatedReturnUrl.includes('?') ? '&' : '?'}bookingContinuation=1`
                    : isJobHandoff
                      ? `${validatedReturnUrl}${validatedReturnUrl.includes('?') ? '&' : '?'}jobContinuation=1`
                      : validatedReturnUrl
                }
                className="motion-press inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[var(--amber)] px-6 text-sm font-bold text-white transition-colors hover:bg-[var(--amber-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ABEEC8] focus-visible:ring-offset-2"
              >
                Continue immediately
              </Link>
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text-main)]">
      {/* Navigation Header */}
      <header className="border-b border-[var(--lead)] bg-[var(--card-bg)]">
        <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href={validatedReturnUrl}
            className="motion-press inline-flex min-h-12 items-center gap-2 text-sm font-bold text-[var(--text-main)] transition-colors hover:text-[#296A4B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#296A4B]"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            {isBookingHandoff
              ? 'Back to booking'
              : isJobHandoff
                ? 'Back to job request'
                : 'Back to previous page'}
          </Link>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center gap-2 font-display text-base font-extrabold tracking-tight text-[var(--text-main)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#296A4B] rounded-lg"
          >
            <Image
              src="/images/logo-icon.png"
              alt="BukieBrainJobs"
              width={32}
              height={32}
              className="h-8 w-8 rounded-lg object-contain"
            />
            <span>
              Bukie<span className="text-[#296A4B]">BrainJobs</span>
            </span>
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-lg px-4 py-8 sm:px-6 sm:py-12">
        {/* Job Handoff Context Banner */}
        {isJobHandoff && (
          <aside
            aria-label="Job posting context"
            className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 shadow-sm sm:p-5"
          >
            <div className="flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 shrink-0 text-[#059669]" aria-hidden="true" />
              <div>
                <h2 className="text-sm font-bold text-[var(--text-main)]">
                  Sign in or create an account to post your job request
                </h2>
                <p className="mt-1 text-xs text-[var(--text-muted)]">
                  Your job request details have been saved and will be restored immediately after account access.
                </p>

                {preservedJob && (
                  <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-[var(--text-main)]">
                    {preservedJob.title && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-[var(--tag-bg)] px-2.5 py-1 border border-emerald-100 shadow-xs">
                        <Briefcase className="h-3 w-3 text-[#059669]" />
                        {preservedJob.title.length > 35 ? `${preservedJob.title.slice(0, 35)}...` : preservedJob.title}
                      </span>
                    )}
                    {preservedJob.city && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-[var(--tag-bg)] px-2.5 py-1 border border-emerald-100 shadow-xs">
                        <MapPin className="h-3 w-3 text-[#059669]" />
                        {preservedJob.city}
                      </span>
                    )}
                    {preservedJob.urgency && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-[var(--tag-bg)] px-2.5 py-1 border border-emerald-100 shadow-xs capitalize">
                        <Clock className="h-3 w-3 text-[#059669]" />
                        {preservedJob.urgency.replace('_', ' ')}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </aside>
        )}

        {/* Booking Handoff Context Banner */}
        {isBookingHandoff && (
          <aside
            aria-label="Booking preparation context"
            className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 shadow-sm sm:p-5"
          >
            <div className="flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 shrink-0 text-[#059669]" aria-hidden="true" />
              <div>
                <h2 className="text-sm font-bold text-[var(--text-main)]">
                  Sign in or create an account to continue with your service request
                </h2>
                <p className="mt-1 text-xs text-[var(--text-muted)]">
                  Your prepared booking details have been saved and will be restored immediately after account access.
                </p>

                {preservedBooking && (
                  <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-[var(--text-main)]">
                    {preservedBooking.service && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-[var(--tag-bg)] px-2.5 py-1 border border-emerald-100 shadow-xs">
                        <Briefcase className="h-3 w-3 text-[#059669]" />
                        {preservedBooking.service}
                      </span>
                    )}
                    {preservedBooking.city && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-[var(--tag-bg)] px-2.5 py-1 border border-emerald-100 shadow-xs">
                        <MapPin className="h-3 w-3 text-[#059669]" />
                        {preservedBooking.city}
                      </span>
                    )}
                    {preservedBooking.date && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-[var(--tag-bg)] px-2.5 py-1 border border-emerald-100 shadow-xs">
                        <Clock className="h-3 w-3 text-[#059669]" />
                        {preservedBooking.date}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </aside>
        )}

        {/* Main Authentication Card */}
        <section
          aria-labelledby="auth-heading"
          className="relative overflow-hidden rounded-2xl border border-[var(--lead)] bg-[var(--card-bg)] p-6 shadow-[0_12px_30px_rgba(0,26,65,0.06)] sm:p-8"
        >
          {/* Subtle Trademark Watermark */}
          <div
            className="pointer-events-none absolute -right-8 -bottom-10 opacity-[0.03] select-none"
            aria-hidden="true"
          >
            <Image
              src="/images/logo-badge-512.png"
              alt=""
              width={240}
              height={240}
              className="object-contain"
            />
          </div>

          {/* Top Brand Icon Anchor */}
          <div className="relative z-10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#001A41]/5 p-2 border border-[var(--lead)] shadow-xs">
            <Image
              src="/images/logo-icon.png"
              alt="BukieBrainJobs Logo"
              width={36}
              height={36}
              className="h-9 w-9 rounded-xl object-contain"
            />
          </div>

          {/* Top Title & Subtitle */}
          <div className="relative z-10 text-center">
            <h1
              id="auth-heading"
              ref={headingRef}
              className="font-display text-2xl font-bold tracking-tight text-[var(--text-main)] sm:text-3xl"
            >
              {mode === 'signin' && 'Welcome back'}
              {mode === 'register' && 'Create your account'}
              {mode === 'phone_otp' && 'Verify your phone number'}
              {mode === 'forgot_password' && 'Reset your password'}
              {mode === 'reset_password' && 'Create new password'}
              {mode === 'welcome' && 'Sign in to BukieBrainJobs'}
            </h1>
            <p className="mt-2 text-sm text-[var(--text-muted)]">
              {mode === 'signin' && 'Sign in with your preferred method to access your bookings.'}
              {mode === 'register' && 'Join BukieBrainJobs to hire professionals or offer services.'}
              {mode === 'phone_otp' && `Enter the 6-digit code sent to ${maskedPhone || 'your phone'}.`}
              {mode === 'forgot_password' && 'Enter your email address and we will send recovery instructions.'}
              {mode === 'reset_password' && 'Enter your new secure password below.'}
              {mode === 'welcome' && 'Choose an option below to continue.'}
            </p>
          </div>

          {/* Mode Switcher Tabs (Sign In vs Create Account) */}
          {(mode === 'signin' || mode === 'register') && (
            <div className="mt-6 flex rounded-xl bg-[var(--tag-bg)] p-1" role="tablist" aria-label="Account access options">
              <button
                type="button"
                role="tab"
                aria-selected={mode === 'signin'}
                onClick={() => handleModeSwitch('signin')}
                className={`motion-press flex-1 min-h-[44px] rounded-lg text-sm font-bold transition-all ${
                  mode === 'signin'
                    ? 'bg-[var(--card-bg)] text-[var(--text-main)] shadow-xs'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mode === 'register'}
                onClick={() => handleModeSwitch('register')}
                className={`motion-press flex-1 min-h-[44px] rounded-lg text-sm font-bold transition-all ${
                  mode === 'register'
                    ? 'bg-[var(--card-bg)] text-[var(--text-main)] shadow-xs'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                Create Account
              </button>
            </div>
          )}

          {/* General Error Notice */}
          {generalError && (
            <div
              role="alert"
              className="mt-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs font-semibold text-red-700"
            >
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600" aria-hidden="true" />
              <span>{generalError}</span>
            </div>
          )}

          {/* Success Message Notice (for recovery flows) */}
          {successMessage && (
            <div
              role="alert"
              className="mt-5 flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs font-semibold text-[#059669]"
            >
              <CheckCircle2 className="h-4 w-4 shrink-0 text-[#059669]" aria-hidden="true" />
              <div>
                <p>{successMessage}</p>
                <button
                  type="button"
                  onClick={() => handleModeSwitch('signin')}
                  className="mt-2 text-xs font-bold text-[var(--text-main)] underline hover:text-[#296A4B]"
                >
                  Return to Sign In
                </button>
              </div>
            </div>
          )}

          {/* Social Authentication (Always visible for Sign In / Register / Welcome) */}
          {(mode === 'signin' || mode === 'register' || mode === 'welcome') && (
            <div className="mt-6 space-y-3">
              {/* Google Button */}
              <button
                type="button"
                onClick={() => handleSocialAuth('google')}
                disabled={isSubmitting}
                className="motion-press flex min-h-[48px] w-full items-center justify-center gap-3 rounded-full border border-[var(--lead)] bg-[var(--card-bg)] px-5 text-sm font-bold text-[var(--text-main)] shadow-xs transition-colors hover:bg-[var(--tag-bg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#296A4B] disabled:opacity-60"
              >
                {submittingProvider === 'google' ? (
                  <Loader2 className="h-5 w-5 animate-spin text-[var(--text-muted)]" />
                ) : (
                  <GoogleIcon className="h-5 w-5" />
                )}
                <span>
                  {submittingProvider === 'google'
                    ? 'Connecting to Google...'
                    : 'Continue with Google'}
                </span>
              </button>

              {/* Apple Button */}
              <button
                type="button"
                onClick={() => handleSocialAuth('apple')}
                disabled={isSubmitting}
                className="motion-press flex min-h-[48px] w-full items-center justify-center gap-3 rounded-full bg-black px-5 text-sm font-bold text-white shadow-xs transition-colors hover:bg-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-800 disabled:opacity-60"
              >
                {submittingProvider === 'apple' ? (
                  <Loader2 className="h-5 w-5 animate-spin text-white" />
                ) : (
                  <AppleIcon className="h-5 w-5 text-white" />
                )}
                <span>
                  {submittingProvider === 'apple'
                    ? 'Connecting to Apple...'
                    : 'Continue with Apple'}
                </span>
              </button>

              {/* Divider */}
              <div className="relative my-5 flex items-center justify-center">
                <div className="w-full border-t border-[var(--lead)]" />
                <span className="absolute bg-[var(--card-bg)] px-3 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                  Or continue with
                </span>
              </div>

              {/* Method Switcher: Phone vs Email */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMethod('phone');
                    setFieldErrors({});
                  }}
                  className={`motion-press flex min-h-[44px] items-center justify-center gap-2 rounded-xl border px-3 text-xs font-bold transition-all ${
                    authMethod === 'phone'
                      ? 'border-[#001A41] bg-[#001A41]/5 text-[#001A41]'
                      : 'border-[var(--lead)] text-[var(--text-muted)] hover:border-[var(--lead)]'
                  }`}
                >
                  <Phone className="h-3.5 w-3.5" />
                  Phone number
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAuthMethod('email');
                    setFieldErrors({});
                  }}
                  className={`motion-press flex min-h-[44px] items-center justify-center gap-2 rounded-xl border px-3 text-xs font-bold transition-all ${
                    authMethod === 'email'
                      ? 'border-[#001A41] bg-[#001A41]/5 text-[#001A41]'
                      : 'border-[var(--lead)] text-[var(--text-muted)] hover:border-[var(--lead)]'
                  }`}
                >
                  <Mail className="h-3.5 w-3.5" />
                  Email & password
                </button>
              </div>
            </div>
          )}

          {/* METHOD 1: PHONE NUMBER FORM */}
          {(mode === 'signin' || mode === 'register' || mode === 'welcome') &&
            authMethod === 'phone' && (
              <form onSubmit={handleSendOtp} className="mt-5 space-y-4" noValidate>
                {/* Role selection in Registration mode */}
                {mode === 'register' && (
                  <RoleSelectionSelector
                    role={role}
                    setRole={setRole}
                    error={fieldErrors.role}
                  />
                )}

                <div>
                  <label
                    htmlFor="auth-phone"
                    className="block text-xs font-bold uppercase tracking-wider text-[var(--text-main)]"
                  >
                    Nigerian Phone Number
                  </label>
                  <div className="relative mt-1.5">
                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[var(--text-muted)]">
                      <Phone className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <input
                      id="auth-phone"
                      type="tel"
                      inputMode="tel"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        if (fieldErrors.phone) setFieldErrors({});
                      }}
                      placeholder="e.g. 0801 234 5678 or +234..."
                      aria-invalid={Boolean(fieldErrors.phone)}
                      aria-describedby={fieldErrors.phone ? 'phone-error' : 'phone-hint'}
                      className={`block w-full min-h-[48px] rounded-xl border pl-10 pr-4 text-sm text-[var(--text-main)] transition-colors placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[#296A4B]/20 ${
                        fieldErrors.phone
                          ? 'border-red-500 focus:border-red-500'
                          : 'border-[var(--lead)] focus:border-[#296A4B]'
                      }`}
                    />
                  </div>
                  <p id="phone-hint" className="mt-1 text-xs text-[var(--text-muted)]">
                    Supports 080..., 234..., or +234... formats.
                  </p>
                  {fieldErrors.phone && (
                    <p id="phone-error" role="alert" className="mt-1.5 text-xs font-semibold text-red-600">
                      {fieldErrors.phone}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="motion-press flex min-h-[48px] w-full items-center justify-center rounded-full bg-[var(--amber)] px-6 text-sm font-bold text-white transition-colors hover:bg-[var(--amber-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ABEEC8] focus-visible:ring-offset-2 disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending code...
                    </span>
                  ) : (
                    'Send verification code'
                  )}
                </button>
              </form>
            )}

          {/* METHOD 2: PHONE OTP VERIFICATION FORM */}
          {mode === 'phone_otp' && (
            <form onSubmit={handleVerifyOtp} className="mt-6 space-y-4" noValidate>
              <div>
                <label
                  htmlFor="auth-otp"
                  className="block text-xs font-bold uppercase tracking-wider text-[var(--text-main)]"
                >
                  6-Digit Verification Code
                </label>
                <input
                  id="auth-otp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value.replace(/\D/g, ''));
                    if (fieldErrors.otp) setFieldErrors({});
                  }}
                  placeholder="123456"
                  aria-invalid={Boolean(fieldErrors.otp)}
                  aria-describedby={fieldErrors.otp ? 'otp-error' : undefined}
                  className={`mt-1.5 block w-full min-h-[52px] rounded-xl border text-center font-mono text-2xl font-bold tracking-widest text-[var(--text-main)] transition-colors placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[#296A4B]/20 ${
                    fieldErrors.otp
                      ? 'border-red-500 focus:border-red-500'
                      : 'border-[var(--lead)] focus:border-[#296A4B]'
                  }`}
                />
                {fieldErrors.otp && (
                  <p id="otp-error" role="alert" className="mt-1.5 text-xs font-semibold text-red-600">
                    {fieldErrors.otp}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => handleModeSwitch('signin')}
                  className="font-semibold text-[var(--text-muted)] hover:text-[var(--text-main)] underline"
                >
                  Change phone number
                </button>
                <button
                  type="button"
                  disabled={resendCooldown > 0}
                  onClick={async () => {
                    if (resendCooldown > 0) return;
                    const norm = normalizeNigerianPhone(phone);
                    if (norm.valid) {
                      await mockSendPhoneOtp(norm.normalized);
                      setSuccessMessage(`A new code was sent to ${norm.masked}.`);
                      setResendCooldown(45);
                    }
                  }}
                  className={`inline-flex items-center gap-1 font-bold ${
                    resendCooldown > 0
                      ? 'text-[var(--text-muted)] cursor-not-allowed'
                      : 'text-[var(--text-main)] hover:text-[#296A4B] cursor-pointer'
                  }`}
                >
                  <RotateCcw className="h-3 w-3" />
                  Resend code {resendCooldown > 0 ? `(${resendCooldown}s)` : ''}
                </button>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="motion-press mt-2 flex min-h-[48px] w-full items-center justify-center rounded-full bg-[var(--amber)] px-6 text-sm font-bold text-white transition-colors hover:bg-[var(--amber-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ABEEC8] focus-visible:ring-offset-2 disabled:opacity-60"
              >
                {isSubmitting ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Verifying...
                  </span>
                ) : (
                  'Verify & continue'
                )}
              </button>
            </form>
          )}

          {/* METHOD 3: EMAIL & PASSWORD (SIGN IN OR REGISTER) */}
          {(mode === 'signin' || mode === 'register') && authMethod === 'email' && (
            <form
              onSubmit={mode === 'signin' ? handleEmailSignIn : handleEmailRegister}
              className="mt-5 space-y-4"
              noValidate
            >
              {/* Role selection in Registration mode */}
              {mode === 'register' && (
                <RoleSelectionSelector
                  role={role}
                  setRole={setRole}
                  error={fieldErrors.role}
                />
              )}

              {/* Email Field */}
              <div>
                <label
                  htmlFor="auth-email"
                  className="block text-xs font-bold uppercase tracking-wider text-[var(--text-main)]"
                >
                  Email Address
                </label>
                <div className="relative mt-1.5">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[var(--text-muted)]">
                    <Mail className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <input
                    id="auth-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: '' }));
                    }}
                    placeholder="you@example.com"
                    aria-invalid={Boolean(fieldErrors.email)}
                    aria-describedby={fieldErrors.email ? 'email-error' : undefined}
                    className={`block w-full min-h-[48px] rounded-xl border pl-10 pr-4 text-sm text-[var(--text-main)] transition-colors placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[#296A4B]/20 ${
                      fieldErrors.email
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-[var(--lead)] focus:border-[#296A4B]'
                    }`}
                  />
                </div>
                {fieldErrors.email && (
                  <p id="email-error" role="alert" className="mt-1.5 text-xs font-semibold text-red-600">
                    {fieldErrors.email}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="auth-password"
                    className="block text-xs font-bold uppercase tracking-wider text-[var(--text-main)]"
                  >
                    Password
                  </label>
                  {mode === 'signin' && (
                    <button
                      type="button"
                      onClick={() => handleModeSwitch('forgot_password')}
                      className="text-xs font-semibold text-[var(--text-main)] hover:text-[#296A4B] underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative mt-1.5">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[var(--text-muted)]">
                    <Lock className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <input
                    id="auth-password"
                    type="password"
                    autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: '' }));
                    }}
                    placeholder="••••••••"
                    aria-invalid={Boolean(fieldErrors.password)}
                    aria-describedby={fieldErrors.password ? 'password-error' : undefined}
                    className={`block w-full min-h-[48px] rounded-xl border pl-10 pr-4 text-sm text-[var(--text-main)] transition-colors placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[#296A4B]/20 ${
                      fieldErrors.password
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-[var(--lead)] focus:border-[#296A4B]'
                    }`}
                  />
                </div>
                {fieldErrors.password && (
                  <p id="password-error" role="alert" className="mt-1.5 text-xs font-semibold text-red-600">
                    {fieldErrors.password}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="motion-press flex min-h-[48px] w-full items-center justify-center rounded-full bg-[var(--amber)] px-6 text-sm font-bold text-white transition-colors hover:bg-[var(--amber-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ABEEC8] focus-visible:ring-offset-2 disabled:opacity-60"
              >
                {isSubmitting ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {mode === 'signin' ? 'Signing in...' : 'Creating account...'}
                  </span>
                ) : mode === 'signin' ? (
                  'Sign In'
                ) : (
                  'Create Account'
                )}
              </button>
            </form>
          )}

          {/* FORGOT PASSWORD FORM */}
          {mode === 'forgot_password' && (
            <form onSubmit={handleForgotPassword} className="mt-6 space-y-4" noValidate>
              <div>
                <label
                  htmlFor="auth-forgot-email"
                  className="block text-xs font-bold uppercase tracking-wider text-[var(--text-main)]"
                >
                  Your Account Email
                </label>
                <div className="relative mt-1.5">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[var(--text-muted)]">
                    <Mail className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <input
                    id="auth-forgot-email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (fieldErrors.email) setFieldErrors({});
                    }}
                    placeholder="you@example.com"
                    aria-invalid={Boolean(fieldErrors.email)}
                    aria-describedby={fieldErrors.email ? 'forgot-email-error' : undefined}
                    className={`block w-full min-h-[48px] rounded-xl border pl-10 pr-4 text-sm text-[var(--text-main)] transition-colors placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[#296A4B]/20 ${
                      fieldErrors.email
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-[var(--lead)] focus:border-[#296A4B]'
                    }`}
                  />
                </div>
                {fieldErrors.email && (
                  <p id="forgot-email-error" role="alert" className="mt-1.5 text-xs font-semibold text-red-600">
                    {fieldErrors.email}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="motion-press flex min-h-[48px] w-full items-center justify-center rounded-full bg-[var(--amber)] px-6 text-sm font-bold text-white transition-colors hover:bg-[var(--amber-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ABEEC8] focus-visible:ring-offset-2 disabled:opacity-60"
              >
                {isSubmitting ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending instructions...
                  </span>
                ) : (
                  'Send reset instructions'
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => handleModeSwitch('signin')}
                  className="text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-main)] underline"
                >
                  Back to Sign In
                </button>
              </div>
            </form>
          )}

          {/* RESET PASSWORD FORM */}
          {mode === 'reset_password' && (
            <form onSubmit={handleResetPassword} className="mt-6 space-y-4" noValidate>
              <div>
                <label
                  htmlFor="auth-reset-pass"
                  className="block text-xs font-bold uppercase tracking-wider text-[var(--text-main)]"
                >
                  New Password
                </label>
                <input
                  id="auth-reset-pass"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: '' }));
                  }}
                  placeholder="At least 8 characters"
                  aria-invalid={Boolean(fieldErrors.password)}
                  className="mt-1.5 block w-full min-h-[48px] rounded-xl border border-[var(--lead)] px-4 text-sm text-[var(--text-main)] focus:border-[#296A4B] focus:outline-none focus:ring-2 focus:ring-[#296A4B]/20"
                />
                {fieldErrors.password && (
                  <p role="alert" className="mt-1.5 text-xs font-semibold text-red-600">
                    {fieldErrors.password}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="auth-reset-confirm"
                  className="block text-xs font-bold uppercase tracking-wider text-[var(--text-main)]"
                >
                  Confirm New Password
                </label>
                <input
                  id="auth-reset-confirm"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (fieldErrors.confirmPassword) setFieldErrors((prev) => ({ ...prev, confirmPassword: '' }));
                  }}
                  placeholder="Repeat new password"
                  aria-invalid={Boolean(fieldErrors.confirmPassword)}
                  className="mt-1.5 block w-full min-h-[48px] rounded-xl border border-[var(--lead)] px-4 text-sm text-[var(--text-main)] focus:border-[#296A4B] focus:outline-none focus:ring-2 focus:ring-[#296A4B]/20"
                />
                {fieldErrors.confirmPassword && (
                  <p role="alert" className="mt-1.5 text-xs font-semibold text-red-600">
                    {fieldErrors.confirmPassword}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="motion-press flex min-h-[48px] w-full items-center justify-center rounded-full bg-[var(--amber)] px-6 text-sm font-bold text-white transition-colors hover:bg-[var(--amber-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ABEEC8] focus-visible:ring-offset-2 disabled:opacity-60"
              >
                {isSubmitting ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Updating password...
                  </span>
                ) : (
                  'Update password'
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => handleModeSwitch('signin')}
                  className="text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-main)] underline"
                >
                  Back to Sign In
                </button>
              </div>
            </form>
          )}

          {/* Privacy & Trust Footnote */}
          <div className="mt-6 border-t border-[var(--lead)] pt-4 text-center text-xs text-[var(--text-muted)]">
            <p>
              Your account helps us keep your bookings and activity connected to you. By continuing, you agree to our{' '}
              <Link href="/terms" className="underline hover:text-[var(--text-main)]">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="underline hover:text-[var(--text-main)]">
                Privacy Policy
              </Link>.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

// Role Selection Selector Subcomponent
function RoleSelectionSelector({
  role,
  setRole,
  error,
}: {
  role: UserRole;
  setRole: (r: UserRole) => void;
  error?: string | undefined;
}) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-xs font-bold uppercase tracking-wider text-[var(--text-main)]">
        I want to join BukieBrainJobs as:
      </legend>
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {/* Customer Option */}
        <label
          htmlFor="role-customer"
          className={`motion-press flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition-all ${
            role === 'customer'
              ? 'border-[#001A41] bg-[#001A41]/5 ring-1 ring-[#001A41]'
              : 'border-[var(--lead)] hover:border-[var(--lead)]'
          }`}
        >
          <input
            id="role-customer"
            type="radio"
            name="accountRole"
            value="customer"
            checked={role === 'customer'}
            onChange={() => setRole('customer')}
            className="mt-0.5 h-4 w-4 accent-[#001A41]"
          />
          <div>
            <span className="block text-xs font-bold text-[#001A41]">Customer</span>
            <span className="mt-0.5 block text-xs text-[var(--text-muted)]">
              Find and hire trusted professionals, or post a job.
            </span>
          </div>
        </label>

        {/* BrainWorker Option */}
        <label
          htmlFor="role-brainworker"
          className={`motion-press flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition-all ${
            role === 'brainworker'
              ? 'border-[#001A41] bg-[#001A41]/5 ring-1 ring-[#001A41]'
              : 'border-[var(--lead)] hover:border-[var(--lead)]'
          }`}
        >
          <input
            id="role-brainworker"
            type="radio"
            name="accountRole"
            value="brainworker"
            checked={role === 'brainworker'}
            onChange={() => setRole('brainworker')}
            className="mt-0.5 h-4 w-4 accent-[#001A41]"
          />
          <div>
            <span className="block text-xs font-bold text-[#001A41]">BrainWorker</span>
            <span className="mt-0.5 block text-xs text-[var(--text-muted)]">
              Offer your services and receive relevant jobs.
            </span>
          </div>
        </label>
      </div>

      {/* Explicit Non-Approval Disclaimer */}
      {role === 'brainworker' && (
        <div
          role="note"
          className="mt-2 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50/80 p-2.5 text-xs text-amber-900"
        >
          <HelpCircle className="h-4 w-4 shrink-0 text-amber-700" aria-hidden="true" />
          <span>
            Selecting BrainWorker creates your account. Professional verification and approval are completed in a separate onboarding workflow before you can accept jobs.
          </span>
        </div>
      )}

      {error && (
        <p role="alert" className="mt-1 text-xs font-semibold text-red-600">
          {error}
        </p>
      )}
    </fieldset>
  );
}

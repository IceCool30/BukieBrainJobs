import {
  normalizeNigerianPhone,
  validateEmailAddress,
  validatePassword,
  validatePhoneOtp,
} from '@bukiebrainjobs/validation';
import { AuthUser, UserRole } from './types';
import { setMockAuthenticatedUser } from './storage';

export interface AuthResult {
  success: boolean;
  user?: AuthUser | undefined;
  error?: string | undefined;
  message?: string | undefined;
}

export async function mockSocialAuth(
  provider: 'google' | 'apple',
  role: UserRole = 'customer',
  simulateError = false,
): Promise<AuthResult> {
  // Simulate network roundtrip
  await new Promise((resolve) => setTimeout(resolve, 350));

  if (simulateError) {
    const providerName = provider === 'google' ? 'Google' : 'Apple';
    return {
      success: false,
      error: `Could not connect to ${providerName} authentication. Please try again or choose another method.`,
    };
  }

  const user: AuthUser = {
    id: `usr_${provider}_${Date.now()}`,
    name: provider === 'google' ? 'Verified Google Account' : 'Verified Apple Account',
    email:
      provider === 'google'
        ? 'user@gmail.com'
        : 'user.relay@privaterelay.appleid.com',
    provider,
    role,
    isBrainWorkerApproved: false,
  };

  setMockAuthenticatedUser(user);
  return { success: true, user };
}

export async function mockSendPhoneOtp(
  phone: string,
  simulateError = false,
): Promise<AuthResult & { maskedPhone?: string | undefined }> {
  const norm = normalizeNigerianPhone(phone);
  if (!norm.valid) {
    return { success: false, error: norm.error };
  }

  await new Promise((resolve) => setTimeout(resolve, 300));

  if (simulateError) {
    return {
      success: false,
      error: 'We could not send a verification code right now. Please check your network and try again.',
    };
  }

  return {
    success: true,
    maskedPhone: norm.masked,
    message: `Verification code sent to ${norm.masked}.`,
  };
}

export async function mockVerifyPhoneOtp(
  phone: string,
  otp: string,
  role: UserRole = 'customer',
  simulateError = false,
): Promise<AuthResult> {
  const norm = normalizeNigerianPhone(phone);
  if (!norm.valid) {
    return { success: false, error: norm.error };
  }

  const otpCheck = validatePhoneOtp(otp);
  if (!otpCheck.valid) {
    return { success: false, error: otpCheck.error };
  }

  await new Promise((resolve) => setTimeout(resolve, 350));

  if (simulateError || otp === '000000') {
    return {
      success: false,
      error: 'The verification code entered is incorrect or has expired. Please try again.',
    };
  }

  const user: AuthUser = {
    id: `usr_phone_${Date.now()}`,
    name: `User (${norm.formatted})`,
    phone: norm.normalized,
    provider: 'phone',
    role,
    isBrainWorkerApproved: false,
  };

  setMockAuthenticatedUser(user);
  return { success: true, user };
}

export async function mockEmailSignIn(
  email: string,
  password: string,
  simulateError = false,
): Promise<AuthResult> {
  const emailCheck = validateEmailAddress(email);
  if (!emailCheck.valid) {
    return { success: false, error: emailCheck.error };
  }

  const passCheck = validatePassword(password);
  if (!passCheck.valid) {
    return { success: false, error: passCheck.error };
  }

  await new Promise((resolve) => setTimeout(resolve, 350));

  if (simulateError || password === 'wrongpassword' || password === 'invalidpass') {
    return {
      success: false,
      error: 'Incorrect email or password. Please check your details and try again.',
    };
  }

  const user: AuthUser = {
    id: `usr_email_${Date.now()}`,
    name: email.split('@')[0] || 'User',
    email: email.trim().toLowerCase(),
    provider: 'email',
    role: 'customer',
    isBrainWorkerApproved: false,
  };

  setMockAuthenticatedUser(user);
  return { success: true, user };
}

export async function mockEmailRegister(
  email: string,
  password: string,
  role: UserRole = 'customer',
  simulateError = false,
): Promise<AuthResult> {
  const emailCheck = validateEmailAddress(email);
  if (!emailCheck.valid) {
    return { success: false, error: emailCheck.error };
  }

  const passCheck = validatePassword(password);
  if (!passCheck.valid) {
    return { success: false, error: passCheck.error };
  }

  await new Promise((resolve) => setTimeout(resolve, 350));

  if (simulateError || email.toLowerCase().includes('duplicate')) {
    return {
      success: false,
      error: 'An account with this email already exists. Please sign in instead.',
    };
  }

  const user: AuthUser = {
    id: `usr_email_${Date.now()}`,
    name: email.split('@')[0] || 'User',
    email: email.trim().toLowerCase(),
    provider: 'email',
    role,
    isBrainWorkerApproved: false,
  };

  setMockAuthenticatedUser(user);
  return { success: true, user };
}

export async function mockForgotPassword(
  email: string,
  simulateError = false,
): Promise<AuthResult> {
  const emailCheck = validateEmailAddress(email);
  if (!emailCheck.valid) {
    return { success: false, error: emailCheck.error };
  }

  await new Promise((resolve) => setTimeout(resolve, 300));

  if (simulateError) {
    return {
      success: false,
      error: 'Unable to process your request at this time. Please try again later.',
    };
  }

  // Security: do not leak whether account exists
  return {
    success: true,
    message: 'If an account exists with this email address, password reset instructions have been sent.',
  };
}

export async function mockResetPassword(
  password: string,
  simulateError = false,
): Promise<AuthResult> {
  const passCheck = validatePassword(password);
  if (!passCheck.valid) {
    return { success: false, error: passCheck.error };
  }

  await new Promise((resolve) => setTimeout(resolve, 300));

  if (simulateError) {
    return {
      success: false,
      error: 'Password reset link is invalid or has expired. Please request a new one.',
    };
  }

  return {
    success: true,
    message: 'Your password has been successfully updated. You can now sign in.',
  };
}

export function getMockSession(): { user: import('./types').MockSessionUser } {
  return {
    user: {
      id: 'user_1',
      name: 'Dr. Tunde Fashola',
      role: 'client',
    },
  };
}


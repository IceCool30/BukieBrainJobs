/** @vitest-environment jsdom */
import { beforeEach, describe, expect, it } from 'vitest';
import {
  mockSocialAuth,
  mockSendPhoneOtp,
  mockVerifyPhoneOtp,
  mockEmailSignIn,
  mockEmailRegister,
  mockForgotPassword,
  mockResetPassword,
  savePreservedBookingDraft,
  getPreservedBookingDraft,
  clearPreservedBookingDraft,
  setMockAuthenticatedUser,
  getMockAuthenticatedUser,
  PreservedBookingDraft,
} from './index';

describe('WEB-008 Authentication Logic & Services', () => {
  beforeEach(() => {
    clearPreservedBookingDraft();
    setMockAuthenticatedUser(null);
  });

  describe('Social Authentication (Google & Apple)', () => {
    it('successfully completes mock Google authentication with Customer role', async () => {
      const result = await mockSocialAuth('google', 'customer');
      expect(result.success).toBe(true);
      expect(result.user?.provider).toBe('google');
      expect(result.user?.role).toBe('customer');
      expect(result.user?.isBrainWorkerApproved).toBe(false);
      expect(result.user?.email).toBe('user@gmail.com');
    });

    it('successfully completes mock Apple authentication with BrainWorker role without false approval', async () => {
      const result = await mockSocialAuth('apple', 'brainworker');
      expect(result.success).toBe(true);
      expect(result.user?.provider).toBe('apple');
      expect(result.user?.role).toBe('brainworker');
      expect(result.user?.isBrainWorkerApproved).toBe(false);
      expect(result.user?.email).toContain('privaterelay.appleid.com');
    });

    it('returns clear error on simulated provider failure', async () => {
      const result = await mockSocialAuth('google', 'customer', true);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Could not connect to Google authentication');
    });
  });

  describe('Phone OTP Authentication', () => {
    it('sends OTP code to valid Nigerian numbers in local 080... format', async () => {
      const result = await mockSendPhoneOtp('08012345678');
      expect(result.success).toBe(true);
      expect(result.maskedPhone).toBe('+234 801 ••• ••78');
    });

    it('rejects invalid phone numbers before attempting delivery', async () => {
      const result = await mockSendPhoneOtp('12345');
      expect(result.success).toBe(false);
      expect(result.error).toContain('Enter a valid Nigerian phone number');
    });

    it('verifies valid 6-digit OTP and assigns selected role', async () => {
      const result = await mockVerifyPhoneOtp('08012345678', '123456', 'brainworker');
      expect(result.success).toBe(true);
      expect(result.user?.phone).toBe('+2348012345678');
      expect(result.user?.role).toBe('brainworker');
      expect(result.user?.isBrainWorkerApproved).toBe(false);
    });

    it('rejects incorrect OTP (e.g. 000000)', async () => {
      const result = await mockVerifyPhoneOtp('08012345678', '000000');
      expect(result.success).toBe(false);
      expect(result.error).toContain('verification code entered is incorrect');
    });
  });

  describe('Email & Password Authentication', () => {
    it('signs in with valid email and password', async () => {
      const result = await mockEmailSignIn('ada@example.com', 'ValidPassword123');
      expect(result.success).toBe(true);
      expect(result.user?.email).toBe('ada@example.com');
      expect(result.user?.provider).toBe('email');
    });

    it('rejects invalid password credentials', async () => {
      const result = await mockEmailSignIn('ada@example.com', 'wrongpassword');
      expect(result.success).toBe(false);
      expect(result.error).toContain('Incorrect email or password');
    });

    it('registers new account with explicit role without implying approval', async () => {
      const result = await mockEmailRegister('worker@example.com', 'ValidPassword123', 'brainworker');
      expect(result.success).toBe(true);
      expect(result.user?.role).toBe('brainworker');
      expect(result.user?.isBrainWorkerApproved).toBe(false);
    });

    it('rejects duplicate registration attempts with actionable error', async () => {
      const result = await mockEmailRegister('duplicate.user@example.com', 'ValidPassword123');
      expect(result.success).toBe(false);
      expect(result.error).toContain('already exists. Please sign in instead');
    });

    it('handles forgot password safely without revealing account existence', async () => {
      const result = await mockForgotPassword('unknown@example.com');
      expect(result.success).toBe(true);
      expect(result.message).toContain('If an account exists with this email address');
    });

    it('resets password with valid requirements', async () => {
      const result = await mockResetPassword('NewValidPassword123');
      expect(result.success).toBe(true);
      expect(result.message).toContain('password has been successfully updated');
    });
  });

  describe('Booking Draft Preservation', () => {
    it('preserves and restores all 10 BookingDraft fields through authentication boundary', () => {
      const sampleDraft: PreservedBookingDraft = {
        service: 'Generator Servicing & Repair',
        priceContext: '₦12,000',
        city: 'Lagos',
        worker: 'Engr. Emeka Nwosu',
        streetAddress: '14 Admiralty Way, Lekki Phase 1',
        landmark: 'Opposite Ebeano Supermarket',
        date: 'Tomorrow',
        arrivalWindow: 'Morning (9:00 AM - 12:00 PM)',
        jobDescription: 'Generator needs urgent carburetor repair and filter cleaning.',
        paymentPreference: 'card',
      };

      savePreservedBookingDraft(sampleDraft);
      const restored = getPreservedBookingDraft();

      expect(restored).not.toBeNull();
      expect(restored?.service).toBe('Generator Servicing & Repair');
      expect(restored?.priceContext).toBe('₦12,000');
      expect(restored?.city).toBe('Lagos');
      expect(restored?.worker).toBe('Engr. Emeka Nwosu');
      expect(restored?.streetAddress).toBe('14 Admiralty Way, Lekki Phase 1');
      expect(restored?.landmark).toBe('Opposite Ebeano Supermarket');
      expect(restored?.date).toBe('Tomorrow');
      expect(restored?.arrivalWindow).toBe('Morning (9:00 AM - 12:00 PM)');
      expect(restored?.jobDescription).toBe(
        'Generator needs urgent carburetor repair and filter cleaning.',
      );
      expect(restored?.paymentPreference).toBe('card');

      clearPreservedBookingDraft();
      expect(getPreservedBookingDraft()).toBeNull();
    });

    it('persists and clears mock authenticated user session', () => {
      setMockAuthenticatedUser({
        id: 'usr_test_1',
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        provider: 'email',
        role: 'customer',
        isBrainWorkerApproved: false,
      });

      const user = getMockAuthenticatedUser();
      expect(user?.name).toBe('Ada Lovelace');
      expect(user?.role).toBe('customer');

      setMockAuthenticatedUser(null);
      expect(getMockAuthenticatedUser()).toBeNull();
    });
  });
});

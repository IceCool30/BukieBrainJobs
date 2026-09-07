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
  savePreservedJobDraft,
  getPreservedJobDraft,
  clearPreservedJobDraft,
  setMockAuthenticatedUser,
  getMockAuthenticatedUser,
  PreservedBookingDraft,
  PreservedJobDraft,
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

    it('preserves and restores all JobDraft fields through authentication boundary (WEB-009)', () => {
      clearPreservedJobDraft();
      expect(getPreservedJobDraft()).toBeNull();

      const jobDraft: PreservedJobDraft = {
        jobType: 'specific_service',
        category: 'generator',
        title: 'Generator Carburetor Overhaul and Wiring',
        description: 'The generator shuts off after 10 minutes under heavy load.',
        city: 'Abuja',
        streetAddress: '12 Gana Street, Maitama',
        landmark: 'Near Transcorp Hilton',
        urgency: 'urgent',
        arrivalWindow: 'Morning (9am - 12pm)',
        budget: '₦35,000',
        budgetType: 'fixed',
        preferredWorkerId: 'bw-1',
        preferredWorkerName: 'Engr. Emeka Nwosu',
      };

      savePreservedJobDraft(jobDraft);
      const restored = getPreservedJobDraft();

      expect(restored).not.toBeNull();
      expect(restored?.jobType).toBe('specific_service');
      expect(restored?.category).toBe('generator');
      expect(restored?.title).toBe('Generator Carburetor Overhaul and Wiring');
      expect(restored?.description).toBe('The generator shuts off after 10 minutes under heavy load.');
      expect(restored?.city).toBe('Abuja');
      expect(restored?.streetAddress).toBe('12 Gana Street, Maitama');
      expect(restored?.landmark).toBe('Near Transcorp Hilton');
      expect(restored?.urgency).toBe('urgent');
      expect(restored?.arrivalWindow).toBe('Morning (9am - 12pm)');
      expect(restored?.budget).toBe('₦35,000');
      expect(restored?.budgetType).toBe('fixed');
      expect(restored?.preferredWorkerId).toBe('bw-1');
      expect(restored?.preferredWorkerName).toBe('Engr. Emeka Nwosu');

      clearPreservedJobDraft();
      expect(getPreservedJobDraft()).toBeNull();
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

import { describe, it, expect, beforeEach } from 'vitest';
import { MockCustomerProfileRepository } from './repository';
import {
  CreateSavedAddressInput,
  UpdatePersonalDetailsInput,
  UpdatePasswordInput,
} from './types';

describe('CustomerProfileRepository', () => {
  let repository: MockCustomerProfileRepository;
  const customerA = 'cust_001';
  const customerB = 'cust_002';

  beforeEach(() => {
    repository = new MockCustomerProfileRepository();
    repository.reset();
  });

  describe('Authentication and Fail-Closed Boundary', () => {
    it('throws when authenticatedCustomerId is missing or empty', async () => {
      await expect(repository.getProfile('')).rejects.toThrow(
        /authenticated customer identity is required/i
      );
      await expect(repository.getSavedAddresses('   ')).rejects.toThrow(
        /authenticated customer identity is required/i
      );
    });
  });

  describe('Customer Data Isolation', () => {
    it('isolates saved addresses between different authenticated customers', async () => {
      // Customer A adds an address
      const addrA = await repository.addSavedAddress(customerA, {
        label: 'Home',
        streetAddress: '14 Admiralty Way',
        neighborhood: 'Lekki Phase 1',
        city: 'Lagos',
        state: 'Lagos State',
        landmark: 'Opposite Ebeano Supermarket',
        isDefault: true,
      });

      // Customer B adds an address
      const addrB = await repository.addSavedAddress(customerB, {
        label: 'Office',
        streetAddress: '5 Constitution Avenue',
        neighborhood: 'Central Business District',
        city: 'Abuja',
        state: 'FCT',
        landmark: 'Near Federal Ministry of Finance',
        isDefault: true,
      });

      const addressesA = await repository.getSavedAddresses(customerA);
      const addressesB = await repository.getSavedAddresses(customerB);

      expect(addressesA.some((a) => a.id === addrA.id)).toBe(true);
      expect(addressesA.some((a) => a.id === addrB.id)).toBe(false);

      expect(addressesB.some((a) => a.id === addrB.id)).toBe(true);
      expect(addressesB.some((a) => a.id === addrA.id)).toBe(false);
    });

    it('rejects cross-customer address modification', async () => {
      const addrA = await repository.addSavedAddress(customerA, {
        label: 'Home',
        streetAddress: '14 Admiralty Way',
        neighborhood: 'Lekki Phase 1',
        city: 'Lagos',
        state: 'Lagos State',
        landmark: 'Opposite Ebeano',
      });

      // Customer B attempts to update Customer A's address
      await expect(
        repository.updateSavedAddress(customerB, addrA.id, {
          streetAddress: 'Hacked Address',
        })
      ).rejects.toThrow(/not authorized|not found/i);

      // Customer B attempts to delete Customer A's address
      await expect(
        repository.deleteSavedAddress(customerB, addrA.id)
      ).rejects.toThrow(/not authorized|not found/i);

      // Customer B attempts to set Customer A's address as default
      await expect(
        repository.setDefaultAddress(customerB, addrA.id)
      ).rejects.toThrow(/not authorized|not found/i);
    });
  });

  describe('Profile Operations', () => {
    it('retrieves default customer profile', async () => {
      const profile = await repository.getProfile(customerA);
      expect(profile.customerId).toBe(customerA);
      expect(profile.firstName).toBeDefined();
      expect(profile.lastName).toBeDefined();
      expect(profile.phone).toBeDefined();
      expect(profile.email).toBeDefined();
    });

    it('updates personal details with Nigerian phone validation', async () => {
      const updateData: UpdatePersonalDetailsInput = {
        firstName: 'Bukola',
        lastName: 'Adeyemi',
        phone: '+2348023456789',
        email: 'bukola.adeyemi@example.com',
      };

      const updated = await repository.updateProfile(customerA, updateData);
      expect(updated.firstName).toBe('Bukola');
      expect(updated.lastName).toBe('Adeyemi');
      expect(updated.phone).toBe('+2348023456789');
      expect(updated.email).toBe('bukola.adeyemi@example.com');
    });

    it('accepts local Nigerian phone format (080...) and normalizes it', async () => {
      const updateData: UpdatePersonalDetailsInput = {
        firstName: 'Bukola',
        lastName: 'Adeyemi',
        phone: '08023456789',
        email: 'bukola.adeyemi@example.com',
      };

      const updated = await repository.updateProfile(customerA, updateData);
      expect(updated.phone).toBe('+2348023456789');
    });

    it('rejects invalid phone numbers', async () => {
      const invalidData: UpdatePersonalDetailsInput = {
        firstName: 'Bukola',
        lastName: 'Adeyemi',
        phone: '12345',
        email: 'bukola@example.com',
      };

      await expect(repository.updateProfile(customerA, invalidData)).rejects.toThrow(
        /invalid nigerian phone number/i
      );
    });
  });

  describe('Saved Addresses Operations', () => {
    it('allows any valid Nigerian city without hardcoded 5-city ceiling', async () => {
      const newAddress: CreateSavedAddressInput = {
        label: 'Other',
        customLabel: 'Site Office',
        streetAddress: '12 Trans Amadi Industrial Layout',
        neighborhood: 'Trans Amadi',
        city: 'Port Harcourt',
        state: 'Rivers State',
        landmark: 'Near Slaughter Bridge',
        isDefault: false,
      };

      const added = await repository.addSavedAddress(customerA, newAddress);
      expect(added.id).toBeDefined();
      expect(added.city).toBe('Port Harcourt');
      expect(added.landmark).toBe('Near Slaughter Bridge');

      const kadunaAddress: CreateSavedAddressInput = {
        label: 'Other',
        customLabel: 'Northern Depot',
        streetAddress: '4 Ali Akilu Road',
        neighborhood: 'Ungwan Rimi',
        city: 'Kaduna',
        state: 'Kaduna State',
        landmark: 'Beside Ahmadu Bello Stadium',
        isDefault: false,
      };

      const addedKaduna = await repository.addSavedAddress(customerA, kadunaAddress);
      expect(addedKaduna.city).toBe('Kaduna');
    });

    it('handles setting default address correctly', async () => {
      const first = await repository.addSavedAddress(customerA, {
        label: 'Home',
        streetAddress: '1 First Ave',
        neighborhood: 'Garki',
        city: 'Abuja',
        state: 'FCT',
        landmark: 'Near Area 1',
        isDefault: true,
      });

      const second = await repository.addSavedAddress(customerA, {
        label: 'Office',
        streetAddress: '2 Second Ave',
        neighborhood: 'Wuse 2',
        city: 'Abuja',
        state: 'FCT',
        landmark: 'Near Banex Plaza',
        isDefault: false,
      });

      expect(first.isDefault).toBe(true);
      expect(second.isDefault).toBe(false);

      // Set second as default
      await repository.setDefaultAddress(customerA, second.id);

      const addresses = await repository.getSavedAddresses(customerA);
      const updatedFirst = addresses.find((a) => a.id === first.id);
      const updatedSecond = addresses.find((a) => a.id === second.id);

      expect(updatedFirst?.isDefault).toBe(false);
      expect(updatedSecond?.isDefault).toBe(true);
    });

    it('deletes address successfully', async () => {
      const addr = await repository.addSavedAddress(customerA, {
        label: 'Home',
        streetAddress: 'Delete Me St',
        neighborhood: 'Yaba',
        city: 'Lagos',
        state: 'Lagos State',
        landmark: 'Near Tech Hub',
      });

      await repository.deleteSavedAddress(customerA, addr.id);
      const addresses = await repository.getSavedAddresses(customerA);
      expect(addresses.some((a) => a.id === addr.id)).toBe(false);
    });
  });

  describe('Security and Credentials Operations', () => {
    it('validates password complexity on password update', async () => {
      const weakPasswordInput: UpdatePasswordInput = {
        currentPassword: 'CurrentPassword123!',
        newPassword: 'weak',
        confirmPassword: 'weak',
      };

      await expect(
        repository.updatePassword(customerA, weakPasswordInput)
      ).rejects.toThrow(/password must be at least 8 characters/i);
    });

    it('rejects mismatched new and confirm passwords', async () => {
      const mismatchedInput: UpdatePasswordInput = {
        currentPassword: 'CurrentPassword123!',
        newPassword: 'ValidNewPassword123!',
        confirmPassword: 'DifferentPassword123!',
      };

      await expect(
        repository.updatePassword(customerA, mismatchedInput)
      ).rejects.toThrow(/passwords do not match/i);
    });

    it('successfully updates password with valid inputs', async () => {
      const validInput: UpdatePasswordInput = {
        currentPassword: 'CurrentPassword123!',
        newPassword: 'ValidNewPassword123!',
        confirmPassword: 'ValidNewPassword123!',
      };

      await expect(
        repository.updatePassword(customerA, validInput)
      ).resolves.toBeUndefined();
    });
  });

  describe('Notification Preferences', () => {
    it('updates notification channels correctly', async () => {
      const prefs = await repository.getNotificationPreferences(customerA);
      expect(prefs.smsEnabled).toBeDefined();

      const updated = await repository.updateNotificationPreferences(customerA, {
        smsEnabled: false,
        whatsappEnabled: true,
      });

      expect(updated.smsEnabled).toBe(false);
      expect(updated.whatsappEnabled).toBe(true);
    });
  });

  describe('Explicit Offline and Error States', () => {
    it('throws explicit error when repository is set to offline read-only mode', async () => {
      repository.setOfflineMode(true);

      // Reading profile still works in offline mode
      const profile = await repository.getProfile(customerA);
      expect(profile).toBeDefined();

      // Mutations must fail with explicit offline message
      await expect(
        repository.updateProfile(customerA, {
          firstName: 'Offline',
          lastName: 'User',
          phone: '+2348023456789',
          email: 'offline@example.com',
        })
      ).rejects.toThrow(/offline mode: modifications are disabled/i);
    });
  });
});

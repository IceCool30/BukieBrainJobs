// apps/web/lib/profile/repository.ts

import {
  CustomerProfile,
  SavedAddress,
  CreateSavedAddressInput,
  UpdateSavedAddressInput,
  UpdatePersonalDetailsInput,
  UpdatePasswordInput,
  NotificationPreferences,
  ActiveSession,
  AccountDataExport,
} from './types';

export function normalizeNigerianPhone(phone: string): string {
  const trimmed = phone.trim();
  // If local format e.g. 08012345678 (11 digits starting with 0)
  if (/^0[789][01]\d{8}$/.test(trimmed)) {
    return `+234${trimmed.slice(1)}`;
  }
  // If international format e.g. +2348012345678
  if (/^\+234[789][01]\d{8}$/.test(trimmed)) {
    return trimmed;
  }
  throw new Error('Invalid Nigerian phone number. Expected 080... or +23480... format.');
}

export function validatePassword(password: string): void {
  if (!password || password.length < 8) {
    throw new Error('Password must be at least 8 characters long.');
  }
  if (!/[A-Z]/.test(password)) {
    throw new Error('Password must contain at least one uppercase letter.');
  }
  if (!/[a-z]/.test(password)) {
    throw new Error('Password must contain at least one lowercase letter.');
  }
  if (!/[0-9]/.test(password)) {
    throw new Error('Password must contain at least one number.');
  }
}

export interface ICustomerProfileRepository {
  getProfile(
    authenticatedCustomerId: string,
    sessionUser?: { name?: string | undefined; email?: string | undefined; phone?: string | undefined } | undefined
  ): Promise<CustomerProfile>;
  updateProfile(authenticatedCustomerId: string, input: UpdatePersonalDetailsInput): Promise<CustomerProfile>;
  getSavedAddresses(authenticatedCustomerId: string): Promise<SavedAddress[]>;
  addSavedAddress(authenticatedCustomerId: string, input: CreateSavedAddressInput): Promise<SavedAddress>;
  updateSavedAddress(authenticatedCustomerId: string, addressId: string, input: UpdateSavedAddressInput): Promise<SavedAddress>;
  deleteSavedAddress(authenticatedCustomerId: string, addressId: string): Promise<void>;
  setDefaultAddress(authenticatedCustomerId: string, addressId: string): Promise<SavedAddress>;
  updatePassword(authenticatedCustomerId: string, input: UpdatePasswordInput): Promise<void>;
  getNotificationPreferences(authenticatedCustomerId: string): Promise<NotificationPreferences>;
  updateNotificationPreferences(authenticatedCustomerId: string, prefs: Partial<NotificationPreferences>): Promise<NotificationPreferences>;
  getActiveSessions(authenticatedCustomerId: string): Promise<ActiveSession[]>;
  signOutOtherSessions(authenticatedCustomerId: string): Promise<void>;
  exportAccountData(authenticatedCustomerId: string): Promise<AccountDataExport>;
  deleteAccount(authenticatedCustomerId: string, reason?: string): Promise<void>;
}

export class MockCustomerProfileRepository implements ICustomerProfileRepository {
  private profiles: Map<string, CustomerProfile> = new Map();
  private addresses: Map<string, SavedAddress[]> = new Map();
  private preferences: Map<string, NotificationPreferences> = new Map();
  private passwords: Map<string, string> = new Map();
  private sessions: Map<string, ActiveSession[]> = new Map();
  private isOffline = false;

  constructor() {
    this.seedDefaults();
  }

  public reset(): void {
    this.profiles.clear();
    this.addresses.clear();
    this.preferences.clear();
    this.passwords.clear();
    this.sessions.clear();
    this.isOffline = false;
    this.seedDefaults();
  }

  public setOfflineMode(enabled: boolean): void {
    this.isOffline = enabled;
  }

  public isOfflineMode(): boolean {
    return this.isOffline;
  }

  private seedDefaults(): void {
    const defaultCustId = 'cust_001';

    this.profiles.set(defaultCustId, {
      customerId: defaultCustId,
      firstName: 'Bukola',
      lastName: 'Adeyemi',
      phone: '+2348023456789',
      email: 'bukola.adeyemi@example.com',
      emailVerified: true,
      createdAt: '2026-01-15T09:00:00Z',
    });

    this.addresses.set(defaultCustId, [
      {
        id: 'addr_001',
        customerId: defaultCustId,
        label: 'Home',
        streetAddress: '14 Admiralty Way',
        neighborhood: 'Lekki Phase 1',
        city: 'Lagos',
        state: 'Lagos State',
        landmark: 'Opposite Ebeano Supermarket',
        isDefault: true,
        createdAt: '2026-01-20T10:00:00Z',
      },
      {
        id: 'addr_002',
        customerId: defaultCustId,
        label: 'Office',
        streetAddress: '22 Kofo Abayomi Street',
        neighborhood: 'Victoria Island',
        city: 'Lagos',
        state: 'Lagos State',
        landmark: 'Near Silverbird Galleria',
        isDefault: false,
        createdAt: '2026-02-05T14:30:00Z',
      },
    ]);

    this.preferences.set(defaultCustId, {
      smsEnabled: true,
      whatsappEnabled: true,
      emailEnabled: true,
      inAppEnabled: true,
      bookingUpdates: true,
      messageAlerts: true,
      marketingAlerts: false,
    });

    this.passwords.set(defaultCustId, 'CurrentPassword123!');

    this.sessions.set(defaultCustId, [
      {
        id: 'sess_001',
        device: 'Android Phone (Chrome)',
        browser: 'Chrome Mobile 128',
        location: 'Lagos, Nigeria',
        lastActive: 'Active now',
        isCurrent: true,
      },
      {
        id: 'sess_002',
        device: 'MacBook Pro (Chrome)',
        browser: 'Chrome 128',
        location: 'Lagos, Nigeria',
        lastActive: '2 hours ago',
        isCurrent: false,
      },
    ]);
  }

  private validateCustomerId(customerId: string): void {
    if (!customerId || customerId.trim().length === 0) {
      throw new Error('Authenticated customer identity is required.');
    }
  }

  private checkOfflineMutation(): void {
    if (this.isOffline) {
      throw new Error('Offline mode: modifications are disabled.');
    }
  }

  async getProfile(
    authenticatedCustomerId: string,
    sessionUser?: { name?: string | undefined; email?: string | undefined; phone?: string | undefined } | undefined
  ): Promise<CustomerProfile> {
    this.validateCustomerId(authenticatedCustomerId);
    const existing = this.profiles.get(authenticatedCustomerId);
    if (existing) {
      return { ...existing };
    }

    const nameParts = sessionUser?.name ? sessionUser.name.trim().split(' ') : [];
    const firstName = nameParts[0] || 'Customer';
    const lastName = nameParts.slice(1).join(' ') || 'User';

    // Return profile shell for new authenticated user
    const fallback: CustomerProfile = {
      customerId: authenticatedCustomerId,
      firstName,
      lastName,
      phone: sessionUser?.phone || '+2348000000000',
      email: sessionUser?.email || `${authenticatedCustomerId}@example.com`,
      emailVerified: false,
      createdAt: new Date().toISOString(),
    };
    this.profiles.set(authenticatedCustomerId, fallback);
    return { ...fallback };
  }

  async updateProfile(
    authenticatedCustomerId: string,
    input: UpdatePersonalDetailsInput
  ): Promise<CustomerProfile> {
    this.validateCustomerId(authenticatedCustomerId);
    this.checkOfflineMutation();

    const normalizedPhone = normalizeNigerianPhone(input.phone);
    if (!input.firstName || input.firstName.trim().length < 2) {
      throw new Error('First name must be at least 2 characters long.');
    }
    if (!input.lastName || input.lastName.trim().length < 2) {
      throw new Error('Last name must be at least 2 characters long.');
    }
    if (!input.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
      throw new Error('Please provide a valid email address.');
    }

    const current = await this.getProfile(authenticatedCustomerId);
    const updated: CustomerProfile = {
      ...current,
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      phone: normalizedPhone,
      email: input.email.trim(),
    };

    this.profiles.set(authenticatedCustomerId, updated);
    return { ...updated };
  }

  async getSavedAddresses(authenticatedCustomerId: string): Promise<SavedAddress[]> {
    this.validateCustomerId(authenticatedCustomerId);
    const list = this.addresses.get(authenticatedCustomerId) || [];
    return list.map((a) => ({ ...a }));
  }

  async addSavedAddress(
    authenticatedCustomerId: string,
    input: CreateSavedAddressInput
  ): Promise<SavedAddress> {
    this.validateCustomerId(authenticatedCustomerId);
    this.checkOfflineMutation();

    if (!input.streetAddress || input.streetAddress.trim().length === 0) {
      throw new Error('Street address is required.');
    }
    if (!input.city || input.city.trim().length === 0) {
      throw new Error('City is required.');
    }
    if (!input.landmark || input.landmark.trim().length === 0) {
      throw new Error('Landmark or delivery instructions are required.');
    }

    const list = this.addresses.get(authenticatedCustomerId) || [];
    const isFirst = list.length === 0;
    const isDefault = input.isDefault ?? isFirst;

    if (isDefault) {
      list.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    const newAddress: SavedAddress = {
      id: `addr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      customerId: authenticatedCustomerId,
      label: input.label,
      customLabel: input.customLabel?.trim(),
      streetAddress: input.streetAddress.trim(),
      neighborhood: input.neighborhood?.trim() || '',
      city: input.city.trim(),
      state: input.state?.trim() || '',
      landmark: input.landmark.trim(),
      isDefault,
      createdAt: new Date().toISOString(),
    };

    list.push(newAddress);
    this.addresses.set(authenticatedCustomerId, list);
    return { ...newAddress };
  }

  async updateSavedAddress(
    authenticatedCustomerId: string,
    addressId: string,
    input: UpdateSavedAddressInput
  ): Promise<SavedAddress> {
    this.validateCustomerId(authenticatedCustomerId);
    this.checkOfflineMutation();

    const list = this.addresses.get(authenticatedCustomerId) || [];
    const target = list.find((a) => a.id === addressId);
    if (!target) {
      throw new Error('Address not found or not authorized to modify.');
    }

    if (input.isDefault) {
      list.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    if (input.label) target.label = input.label;
    if (input.customLabel !== undefined) target.customLabel = input.customLabel.trim();
    if (input.streetAddress) target.streetAddress = input.streetAddress.trim();
    if (input.neighborhood !== undefined) target.neighborhood = input.neighborhood.trim();
    if (input.city) target.city = input.city.trim();
    if (input.state !== undefined) target.state = input.state.trim();
    if (input.landmark) target.landmark = input.landmark.trim();
    if (input.isDefault !== undefined) target.isDefault = input.isDefault;

    return { ...target };
  }

  async deleteSavedAddress(authenticatedCustomerId: string, addressId: string): Promise<void> {
    this.validateCustomerId(authenticatedCustomerId);
    this.checkOfflineMutation();

    const list = this.addresses.get(authenticatedCustomerId) || [];
    const index = list.findIndex((a) => a.id === addressId);
    if (index === -1) {
      throw new Error('Address not found or not authorized to delete.');
    }

    const target = list[index];
    if (!target) {
      throw new Error('Address not found or not authorized to delete.');
    }

    const wasDefault = target.isDefault;
    list.splice(index, 1);

    // If deleted address was default, make first remaining address default
    if (wasDefault && list.length > 0 && list[0]) {
      list[0].isDefault = true;
    }

    this.addresses.set(authenticatedCustomerId, list);
  }

  async setDefaultAddress(authenticatedCustomerId: string, addressId: string): Promise<SavedAddress> {
    this.validateCustomerId(authenticatedCustomerId);
    this.checkOfflineMutation();

    const list = this.addresses.get(authenticatedCustomerId) || [];
    const target = list.find((a) => a.id === addressId);
    if (!target) {
      throw new Error('Address not found or not authorized to set as default.');
    }

    list.forEach((addr) => {
      addr.isDefault = addr.id === addressId;
    });

    return { ...target };
  }

  async updatePassword(
    authenticatedCustomerId: string,
    input: UpdatePasswordInput
  ): Promise<void> {
    this.validateCustomerId(authenticatedCustomerId);
    this.checkOfflineMutation();

    const currentStoredPassword = this.passwords.get(authenticatedCustomerId) || 'CurrentPassword123!';
    if (input.currentPassword !== currentStoredPassword) {
      throw new Error('The current password entered is incorrect.');
    }
    if (input.newPassword !== input.confirmPassword) {
      throw new Error('New passwords do not match.');
    }

    validatePassword(input.newPassword);
    this.passwords.set(authenticatedCustomerId, input.newPassword);
  }

  async getNotificationPreferences(authenticatedCustomerId: string): Promise<NotificationPreferences> {
    this.validateCustomerId(authenticatedCustomerId);
    const existing = this.preferences.get(authenticatedCustomerId);
    if (existing) {
      return { ...existing };
    }
    const defaults: NotificationPreferences = {
      smsEnabled: true,
      whatsappEnabled: true,
      emailEnabled: true,
      inAppEnabled: true,
      bookingUpdates: true,
      messageAlerts: true,
      marketingAlerts: false,
    };
    this.preferences.set(authenticatedCustomerId, defaults);
    return { ...defaults };
  }

  async updateNotificationPreferences(
    authenticatedCustomerId: string,
    prefs: Partial<NotificationPreferences>
  ): Promise<NotificationPreferences> {
    this.validateCustomerId(authenticatedCustomerId);
    this.checkOfflineMutation();

    const current = await this.getNotificationPreferences(authenticatedCustomerId);
    const updated: NotificationPreferences = {
      ...current,
      ...prefs,
    };
    this.preferences.set(authenticatedCustomerId, updated);
    return { ...updated };
  }

  async getActiveSessions(authenticatedCustomerId: string): Promise<ActiveSession[]> {
    this.validateCustomerId(authenticatedCustomerId);
    const list = this.sessions.get(authenticatedCustomerId) || [];
    return list.map((s) => ({ ...s }));
  }

  async signOutOtherSessions(authenticatedCustomerId: string): Promise<void> {
    this.validateCustomerId(authenticatedCustomerId);
    this.checkOfflineMutation();

    const list = this.sessions.get(authenticatedCustomerId) || [];
    const currentSessionOnly = list.filter((s) => s.isCurrent);
    this.sessions.set(authenticatedCustomerId, currentSessionOnly);
  }

  async exportAccountData(authenticatedCustomerId: string): Promise<AccountDataExport> {
    this.validateCustomerId(authenticatedCustomerId);
    const profile = await this.getProfile(authenticatedCustomerId);
    const savedAddresses = await this.getSavedAddresses(authenticatedCustomerId);
    const notificationPreferences = await this.getNotificationPreferences(authenticatedCustomerId);
    const activeSessions = await this.getActiveSessions(authenticatedCustomerId);

    return {
      customerId: authenticatedCustomerId,
      exportedAt: new Date().toISOString(),
      profile,
      savedAddresses,
      notificationPreferences,
      activeSessions,
    };
  }

  async deleteAccount(authenticatedCustomerId: string, reason?: string): Promise<void> {
    this.validateCustomerId(authenticatedCustomerId);
    this.checkOfflineMutation();

    this.profiles.delete(authenticatedCustomerId);
    this.addresses.delete(authenticatedCustomerId);
    this.preferences.delete(authenticatedCustomerId);
    this.passwords.delete(authenticatedCustomerId);
    this.sessions.delete(authenticatedCustomerId);
  }
}

let repositoryInstance: MockCustomerProfileRepository | null = null;

export function getCustomerProfileRepository(): MockCustomerProfileRepository {
  if (!repositoryInstance) {
    repositoryInstance = new MockCustomerProfileRepository();
  }
  return repositoryInstance;
}

export function createCustomerProfileRepository(): MockCustomerProfileRepository {
  return new MockCustomerProfileRepository();
}

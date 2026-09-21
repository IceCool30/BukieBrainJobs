// apps/web/lib/profile/types.ts

export type AddressLabel = 'Home' | 'Office' | 'Other';

export interface CustomerProfile {
  customerId: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  emailVerified: boolean;
  avatarUrl?: string;
  createdAt: string;
}

export interface SavedAddress {
  id: string;
  customerId: string;
  label: AddressLabel;
  customLabel?: string;
  streetAddress: string;
  neighborhood: string;
  city: string;
  state: string;
  landmark: string;
  isDefault: boolean;
  createdAt: string;
}

export interface CreateSavedAddressInput {
  label: AddressLabel;
  customLabel?: string;
  streetAddress: string;
  neighborhood: string;
  city: string;
  state: string;
  landmark: string;
  isDefault?: boolean;
}

export interface UpdateSavedAddressInput {
  label?: AddressLabel;
  customLabel?: string;
  streetAddress?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  landmark?: string;
  isDefault?: boolean;
}

export interface UpdatePersonalDetailsInput {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
}

export interface UpdatePasswordInput {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ActiveSession {
  id: string;
  device: string;
  browser: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface NotificationPreferences {
  smsEnabled: boolean;
  whatsappEnabled: boolean;
  emailEnabled: boolean;
  inAppEnabled: boolean;
  bookingUpdates: boolean;
  messageAlerts: boolean;
  marketingAlerts: boolean;
}

export interface AccountDataExport {
  customerId: string;
  exportedAt: string;
  profile: CustomerProfile;
  savedAddresses: SavedAddress[];
  notificationPreferences: NotificationPreferences;
  activeSessions: ActiveSession[];
}

export type ProfileTab = 'personal' | 'addresses' | 'security' | 'notifications' | 'account';

export type ProfileStateStatus =
  | 'idle'
  | 'saving'
  | 'offline_readonly'
  | 'success'
  | 'validation_failure'
  | 'server_failure';

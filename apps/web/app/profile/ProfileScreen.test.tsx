import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import ProfileScreen from '../../components/profile/ProfileScreen';
import * as authStorage from '../../lib/auth/storage';
import { AuthUser } from '../../lib/auth/types';
import { getCustomerProfileRepository } from '../../lib/profile/repository';

// Mock Next.js navigation
const mockPush = vi.fn();
const mockReplace = vi.fn();
let mockSearchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
  useSearchParams: () => mockSearchParams,
}));

// Mock Next.js Image
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...props} />
  ),
}));

describe('WEB-014 ProfileScreen Component (TDD)', () => {
  const customerUserA: AuthUser = {
    id: 'cust_001',
    name: 'Bukola Adeyemi',
    email: 'bukola.adeyemi@example.com',
    phone: '+2348023456789',
    provider: 'email',
    role: 'customer',
    isBrainWorkerApproved: false,
  };

  const customerUserB: AuthUser = {
    id: 'cust_002',
    name: 'Chinedu Okonkwo',
    email: 'chinedu.okonkwo@example.com',
    phone: '+2348098765432',
    provider: 'google',
    role: 'customer',
    isBrainWorkerApproved: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams = new URLSearchParams();
    const repo = getCustomerProfileRepository();
    repo.reset();
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(customerUserA);
    vi.spyOn(authStorage, 'setMockAuthenticatedUser').mockImplementation(() => {});
  });

  it('renders authenticated header with Profile & Settings title', async () => {
    render(<ProfileScreen />);

    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent(/Profile & Settings/i);
    expect(
      screen.getByText(/Manage personal details, Nigerian service addresses, credentials, and notification rules/i)
    ).toBeInTheDocument();
  });

  it('renders persistent desktop sidebar navigation with active indicator on Profile & Settings', async () => {
    render(<ProfileScreen />);

    const sidebar = await screen.findByRole('navigation', { name: /desktop sidebar/i });
    expect(sidebar).toBeInTheDocument();

    const profileButton = within(sidebar).getByRole('button', { name: /Profile & Settings/i });
    expect(profileButton).toHaveAttribute('aria-current', 'page');
  });

  it('redirects unauthenticated visitors to /login with preserved return URL', async () => {
    vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(null);

    render(<ProfileScreen />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/login?returnUrl=/profile');
    });
    expect(screen.getByText(/Redirecting to sign in.../i)).toBeInTheDocument();
  });

  it('navigates between sub-sections using tab buttons', async () => {
    render(<ProfileScreen />);

    await screen.findByRole('heading', { level: 1 });

    // Switch to Saved Addresses tab
    const addressesTab = screen.getByRole('tab', { name: /Saved Addresses/i });
    fireEvent.click(addressesTab);

    expect(await screen.findByRole('heading', { name: /Saved Service Locations/i })).toBeInTheDocument();

    // Switch to Security & Login tab
    const securityTab = screen.getByRole('tab', { name: /Security & Login/i });
    fireEvent.click(securityTab);

    expect(await screen.findByRole('heading', { name: /Security & Login Credentials/i })).toBeInTheDocument();

    // Switch to Notifications tab
    const notificationsTab = screen.getByRole('tab', { name: /Notifications/i });
    fireEvent.click(notificationsTab);

    expect(await screen.findByRole('heading', { name: /Notification Preferences/i })).toBeInTheDocument();

    // Switch to Account & Privacy tab
    const accountTab = screen.getByRole('tab', { name: /Account & Privacy/i });
    fireEvent.click(accountTab);

    expect(await screen.findByRole('heading', { name: /Account Data & Privacy/i })).toBeInTheDocument();
  });

  it('updates personal details with validation and confirmation', async () => {
    render(<ProfileScreen />);

    await screen.findByRole('heading', { level: 1 });

    const firstNameInput = screen.getByLabelText(/First Name/i);
    const lastNameInput = screen.getByLabelText(/Last Name/i);
    const phoneInput = screen.getByLabelText(/Phone Number/i);
    const saveButton = screen.getByRole('button', { name: /Save Personal Details/i });

    // Test invalid phone number
    fireEvent.change(phoneInput, { target: { value: 'invalid-phone' } });
    fireEvent.click(saveButton);

    expect(await screen.findByRole('alert')).toHaveTextContent(/Invalid Nigerian phone number/i);

    // Test valid phone update
    fireEvent.change(firstNameInput, { target: { value: 'Bukky' } });
    fireEvent.change(lastNameInput, { target: { value: 'Ade' } });
    fireEvent.change(phoneInput, { target: { value: '08023456789' } });
    fireEvent.click(saveButton);

    expect(await screen.findByRole('status')).toHaveTextContent(/Personal details saved successfully/i);
  });

  it('adds and manages saved addresses with Nigerian landmark instructions', async () => {
    render(<ProfileScreen />);

    await screen.findByRole('heading', { level: 1 });

    // Go to addresses tab
    const addressesTab = screen.getByRole('tab', { name: /Saved Addresses/i });
    fireEvent.click(addressesTab);

    await screen.findByRole('heading', { name: /Saved Service Locations/i });

    // Open add address modal
    const addAddressButton = screen.getByRole('button', { name: /Add New Address/i });
    fireEvent.click(addAddressButton);

    const modal = screen.getByRole('dialog', { name: /Add New Service Location/i });
    expect(modal).toBeInTheDocument();

    const streetInput = within(modal).getByLabelText(/Street Address/i);
    const cityInput = within(modal).getByLabelText(/City/i);
    const landmarkInput = within(modal).getByLabelText(/Landmark and Arrival Instructions/i);
    const submitModalButton = within(modal).getByRole('button', { name: /Save Location/i });

    // Add address in Port Harcourt (verifying no 5-city hard-code limit)
    fireEvent.change(streetInput, { target: { value: '8 Olu Obasanjo Road' } });
    fireEvent.change(cityInput, { target: { value: 'Port Harcourt' } });
    fireEvent.change(landmarkInput, { target: { value: 'Opposite Shell Residential Area gate' } });

    fireEvent.click(submitModalButton);

    expect(await screen.findByText(/Address added successfully/i)).toBeInTheDocument();
    expect(screen.getByText('8 Olu Obasanjo Road')).toBeInTheDocument();
    expect(screen.getByText(/Port Harcourt/i)).toBeInTheDocument();
  });

  it('validates password complexity when updating password in security section', async () => {
    render(<ProfileScreen />);

    await screen.findByRole('heading', { level: 1 });

    // Go to security tab
    const securityTab = screen.getByRole('tab', { name: /Security & Login/i });
    fireEvent.click(securityTab);

    await screen.findByRole('heading', { name: /Security & Login Credentials/i });

    const currentPassInput = screen.getByLabelText(/^Current Password/i);
    const newPassInput = screen.getByLabelText(/^New Password/i);
    const confirmPassInput = screen.getByLabelText(/^Confirm New Password/i);
    const updatePassButton = screen.getByRole('button', { name: /Update Password/i });

    // Try weak password
    fireEvent.change(currentPassInput, { target: { value: 'CurrentPassword123!' } });
    fireEvent.change(newPassInput, { target: { value: 'weak' } });
    fireEvent.change(confirmPassInput, { target: { value: 'weak' } });
    fireEvent.click(updatePassButton);

    expect(await screen.findByRole('alert')).toHaveTextContent(/at least 8 characters/i);

    // Try valid password
    fireEvent.change(newPassInput, { target: { value: 'StrongNewPass123!' } });
    fireEvent.change(confirmPassInput, { target: { value: 'StrongNewPass123!' } });
    fireEvent.click(updatePassButton);

    expect(await screen.findByRole('status')).toHaveTextContent(/Password updated successfully/i);
  });

  it('toggles notification preference channels', async () => {
    render(<ProfileScreen />);

    await screen.findByRole('heading', { level: 1 });

    // Go to notifications tab
    const notificationsTab = screen.getByRole('tab', { name: /Notifications/i });
    fireEvent.click(notificationsTab);

    await screen.findByRole('heading', { name: /Notification Preferences/i });

    const switches = screen.getAllByRole('switch');
    expect(switches.length).toBeGreaterThanOrEqual(4);

    // Click the first switch (SMS)
    fireEvent.click(switches[0]);

    expect(await screen.findByRole('status')).toHaveTextContent(/Notification preferences updated/i);
  });

  it('displays offline read-only banner when repository is in offline mode', async () => {
    const repo = getCustomerProfileRepository();
    repo.setOfflineMode(true);

    render(<ProfileScreen />);

    expect(await screen.findByText(/Offline Mode \(Read Only\)/i)).toBeInTheDocument();

    // Inputs should be disabled in offline mode
    const firstNameInput = screen.getByLabelText(/First Name/i);
    expect(firstNameInput).toBeDisabled();
  });

  describe('Regression: Client-Side State Isolation Across Session Changes', () => {
    it('proves that switching authenticated customer session completely prevents client-side profile or address leakage', async () => {
      // Step 1: Render as Customer A and verify Customer A's data
      const { unmount } = render(<ProfileScreen />);

      expect(await screen.findByText(/Bukola Adeyemi/i)).toBeInTheDocument();
      expect(screen.getByDisplayValue('bukola.adeyemi@example.com')).toBeInTheDocument();

      // Go to addresses and verify Customer A's address is displayed
      const addressesTab = screen.getByRole('tab', { name: /Saved Addresses/i });
      fireEvent.click(addressesTab);

      expect(await screen.findByText('14 Admiralty Way')).toBeInTheDocument();
      expect(screen.queryByText('Chinedu Okonkwo')).not.toBeInTheDocument();

      unmount();

      // Step 2: Seed Customer B with a unique address in the repository
      const repo = getCustomerProfileRepository();
      await repo.addSavedAddress(customerUserB.id, {
        label: 'Home',
        streetAddress: '78 Awolowo Road',
        neighborhood: 'Ikoyi',
        city: 'Lagos',
        state: 'Lagos State',
        landmark: 'Opposite Standard Chartered Bank',
        isDefault: true,
      });

      // Step 3: Switch authenticated session to Customer B
      vi.spyOn(authStorage, 'getMockAuthenticatedUser').mockReturnValue(customerUserB);

      render(<ProfileScreen />);

      // Verify Customer B's name is rendered in sidebar and profile
      expect(await screen.findByText(/Chinedu Okonkwo/i)).toBeInTheDocument();
      expect(await screen.findByDisplayValue('chinedu.okonkwo@example.com')).toBeInTheDocument();

      // Verify zero trace of Customer A's data exists in Customer B's view
      expect(screen.queryByText('Bukola Adeyemi')).not.toBeInTheDocument();
      expect(screen.queryByDisplayValue('bukola.adeyemi@example.com')).not.toBeInTheDocument();

      // Go to addresses tab for Customer B
      const addressesTabB = screen.getByRole('tab', { name: /Saved Addresses/i });
      fireEvent.click(addressesTabB);

      // Customer B's address must be visible
      expect(await screen.findByText('78 Awolowo Road')).toBeInTheDocument();

      // Customer A's address must NOT be visible
      expect(screen.queryByText('14 Admiralty Way')).not.toBeInTheDocument();
    });
  });
});

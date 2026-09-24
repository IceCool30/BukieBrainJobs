'use client';

import React, { useState, useEffect, useCallback, useTransition } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  User,
  MapPin,
  Shield,
  Bell,
  Sliders,
  RotateCcw,
  WifiOff,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { getMockAuthenticatedUser, setMockAuthenticatedUser } from '../../lib/auth/storage';
import { AuthUser } from '../../lib/auth/types';
import {
  CustomerProfile,
  SavedAddress,
  NotificationPreferences,
  ActiveSession,
  ProfileTab,
  CreateSavedAddressInput,
  UpdateSavedAddressInput,
  UpdatePersonalDetailsInput,
  UpdatePasswordInput,
} from '../../lib/profile/types';
import { getCustomerProfileRepository } from '../../lib/profile/repository';
import {
  ProfileSidebar,
  ProfileMobileBottomNav,
  ProfileNoticeDialog,
} from './ProfileNavigation';
import { PersonalDetailsSection } from './PersonalDetailsSection';
import { SavedAddressesSection } from './SavedAddressesSection';
import { SecuritySection } from './SecuritySection';
import { NotificationPreferencesSection } from './NotificationPreferencesSection';
import { AccountManagementSection } from './AccountManagementSection';

export default function ProfileScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  // Authentication State
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => getMockAuthenticatedUser());
  const [authChecked, setAuthChecked] = useState(false);

  // View & Tab State
  const tabParam = searchParams?.get('tab');
  const validTabs: ProfileTab[] = ['personal', 'addresses', 'security', 'notifications', 'account'];
  const initialTab: ProfileTab = validTabs.includes(tabParam as ProfileTab)
    ? (tabParam as ProfileTab)
    : 'personal';

  const [activeTab, setActiveTab] = useState<ProfileTab>(initialTab);

  // Profile Data State
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [sessions, setSessions] = useState<ActiveSession[]>([]);

  // Execution & Error States
  const [isLoading, setIsLoading] = useState(true);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);

  // Notice dialog state
  const [activeNoticeDialog, setActiveNoticeDialog] = useState<'messages' | null>(null);

  // Check auth and redirect if unauthenticated
  useEffect(() => {
    const user = getMockAuthenticatedUser();
    setCurrentUser(user);
    setAuthChecked(true);

    if (!user || !user.id) {
      router.replace('/login?returnUrl=/profile');
    }
  }, [router]);

  // Load all profile data for the authenticated customer
  const loadProfileData = useCallback(async (customerId: string) => {
    try {
      setIsLoading(true);
      setServerError(null);

      const repo = getCustomerProfileRepository();
      setIsOffline(repo.isOfflineMode());

      const [p, addr, pref, sess] = await Promise.all([
        repo.getProfile(customerId, {
          name: currentUser?.name,
          email: currentUser?.email,
          phone: currentUser?.phone,
        }),
        repo.getSavedAddresses(customerId),
        repo.getNotificationPreferences(customerId),
        repo.getActiveSessions(customerId),
      ]);

      setProfile(p);
      setAddresses(addr);
      setPreferences(pref);
      setSessions(sess);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load customer profile data.';
      setServerError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser?.name, currentUser?.email, currentUser?.phone]);

  useEffect(() => {
    if (currentUser?.id) {
      loadProfileData(currentUser.id);
    }
  }, [currentUser, loadProfileData]);

  // Handle Tab Navigation with URL sync
  const handleTabChange = (tab: ProfileTab) => {
    setActiveTab(tab);
    startTransition(() => {
      const params = new URLSearchParams(searchParams?.toString() || '');
      params.set('tab', tab);
      router.replace(`/profile?${params.toString()}`, { scroll: false });
    });
  };

  // Sign out handler
  const handleSignOut = () => {
    setMockAuthenticatedUser(null);
    router.push('/login');
  };

  // Profile update mutation
  const handleSavePersonalDetails = async (data: UpdatePersonalDetailsInput) => {
    if (!currentUser?.id) throw new Error('Not authenticated');
    const repo = getCustomerProfileRepository();
    const updated = await repo.updateProfile(currentUser.id, data);
    setProfile(updated);

    // Also update session user display name
    const updatedSessionUser: AuthUser = {
      ...currentUser,
      name: `${updated.firstName} ${updated.lastName}`.trim(),
      phone: updated.phone,
      email: updated.email,
    };
    setMockAuthenticatedUser(updatedSessionUser);
    setCurrentUser(updatedSessionUser);
  };

  // Address mutations
  const handleAddAddress = async (data: CreateSavedAddressInput) => {
    if (!currentUser?.id) throw new Error('Not authenticated');
    const repo = getCustomerProfileRepository();
    await repo.addSavedAddress(currentUser.id, data);
    const updatedList = await repo.getSavedAddresses(currentUser.id);
    setAddresses(updatedList);
  };

  const handleUpdateAddress = async (addressId: string, data: UpdateSavedAddressInput) => {
    if (!currentUser?.id) throw new Error('Not authenticated');
    const repo = getCustomerProfileRepository();
    await repo.updateSavedAddress(currentUser.id, addressId, data);
    const updatedList = await repo.getSavedAddresses(currentUser.id);
    setAddresses(updatedList);
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!currentUser?.id) throw new Error('Not authenticated');
    const repo = getCustomerProfileRepository();
    await repo.deleteSavedAddress(currentUser.id, addressId);
    const updatedList = await repo.getSavedAddresses(currentUser.id);
    setAddresses(updatedList);
  };

  const handleSetDefaultAddress = async (addressId: string) => {
    if (!currentUser?.id) throw new Error('Not authenticated');
    const repo = getCustomerProfileRepository();
    await repo.setDefaultAddress(currentUser.id, addressId);
    const updatedList = await repo.getSavedAddresses(currentUser.id);
    setAddresses(updatedList);
  };

  // Password mutation
  const handleUpdatePassword = async (input: UpdatePasswordInput) => {
    if (!currentUser?.id) throw new Error('Not authenticated');
    const repo = getCustomerProfileRepository();
    await repo.updatePassword(currentUser.id, input);
  };

  // Notification mutation
  const handleUpdatePreferences = async (partial: Partial<NotificationPreferences>) => {
    if (!currentUser?.id) throw new Error('Not authenticated');
    const repo = getCustomerProfileRepository();
    const updated = await repo.updateNotificationPreferences(currentUser.id, partial);
    setPreferences(updated);
  };

  // Active sessions mutation
  const handleSignOutOtherSessions = async () => {
    if (!currentUser?.id) throw new Error('Not authenticated');
    const repo = getCustomerProfileRepository();
    await repo.signOutOtherSessions(currentUser.id);
    const remaining = await repo.getActiveSessions(currentUser.id);
    setSessions(remaining);
  };

  // Account export mutation
  const handleExportData = async () => {
    if (!currentUser?.id) throw new Error('Not authenticated');
    const repo = getCustomerProfileRepository();
    const exportResult = await repo.exportAccountData(currentUser.id);
    const blob = new Blob([JSON.stringify(exportResult, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bukiebrainjobs-profile-${currentUser.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Account deletion mutation
  const handleDeleteAccount = async (reason?: string) => {
    if (!currentUser?.id) throw new Error('Not authenticated');
    const repo = getCustomerProfileRepository();
    await repo.deleteAccount(currentUser.id, reason);
    setMockAuthenticatedUser(null);
    router.push('/');
  };

  // If unauthenticated or checking auth, show redirecting view
  if (!authChecked || !currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm max-w-sm w-full text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-[#001A41] mx-auto" />
          <h2 className="text-base font-bold font-display text-[#001A41]">
            Redirecting to sign in...
          </h2>
          <p className="text-xs text-slate-500">
            You must be signed in to manage your customer profile and account settings.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 lg:pb-8 relative">
      {/* Decorative Brand Watermark */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed bottom-12 right-12 opacity-[0.035] select-none z-0 hidden md:block"
      >
        <Image
          src="/images/logo-badge-512.png"
          alt=""
          width={420}
          height={420}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Desktop Navigation Sidebar */}
          <ProfileSidebar
            customerName={currentUser.name}
            customerEmail={currentUser.email || `${currentUser.id}@bukie.ng`}
            onSignOut={handleSignOut}
            onOpenNoticeDialog={(d) => setActiveNoticeDialog(d)}
          />

          {/* Main Content Workspace */}
          <main className="flex-1 min-w-0 space-y-6">
            {/* Header / Title Banner */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold font-display text-[#001A41]">
                  Profile & Settings
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Manage personal details, Nigerian service addresses, credentials, and notification rules.
                </p>
              </div>

              {isOffline && (
                <div
                  role="status"
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 text-amber-800 text-xs font-semibold border border-amber-200"
                >
                  <WifiOff className="h-4 w-4 shrink-0" />
                  <span>Offline Mode (Read Only)</span>
                </div>
              )}
            </div>

            {/* Server Error with Localized Retry */}
            {serverError && (
              <div
                role="alert"
                className="bg-red-50 border border-red-200 rounded-2xl p-5 text-red-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600 shrink-0" />
                  <div>
                    <p className="font-bold">Unable to load profile data</p>
                    <p className="text-red-700">{serverError}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => loadProfileData(currentUser.id)}
                  className="min-h-[44px] px-4 py-2 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Retry</span>
                </button>
              </div>
            )}

            {/* Sub-Navigation Tabs */}
            <div
              role="tablist"
              aria-label="Profile Sections"
              className="bg-white rounded-2xl p-2 border border-slate-200 shadow-xs flex gap-1 overflow-x-auto"
            >
              <button
                type="button"
                role="tab"
                id="tab-personal"
                aria-selected={activeTab === 'personal'}
                aria-controls="panel-personal"
                onClick={() => handleTabChange('personal')}
                className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
                  activeTab === 'personal'
                    ? 'bg-[#001A41] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <User className="h-4 w-4" />
                <span>Personal Details</span>
              </button>

              <button
                type="button"
                role="tab"
                id="tab-addresses"
                aria-selected={activeTab === 'addresses'}
                aria-controls="panel-addresses"
                onClick={() => handleTabChange('addresses')}
                className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
                  activeTab === 'addresses'
                    ? 'bg-[#001A41] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <MapPin className="h-4 w-4" />
                <span>Saved Addresses</span>
                {addresses.length > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      activeTab === 'addresses'
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {addresses.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                role="tab"
                id="tab-security"
                aria-selected={activeTab === 'security'}
                aria-controls="panel-security"
                onClick={() => handleTabChange('security')}
                className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
                  activeTab === 'security'
                    ? 'bg-[#001A41] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Shield className="h-4 w-4" />
                <span>Security & Login</span>
              </button>

              <button
                type="button"
                role="tab"
                id="tab-notifications"
                aria-selected={activeTab === 'notifications'}
                aria-controls="panel-notifications"
                onClick={() => handleTabChange('notifications')}
                className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
                  activeTab === 'notifications'
                    ? 'bg-[#001A41] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Bell className="h-4 w-4" />
                <span>Notifications</span>
              </button>

              <button
                type="button"
                role="tab"
                id="tab-account"
                aria-selected={activeTab === 'account'}
                aria-controls="panel-account"
                onClick={() => handleTabChange('account')}
                className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
                  activeTab === 'account'
                    ? 'bg-[#001A41] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Sliders className="h-4 w-4" />
                <span>Account & Privacy</span>
              </button>
            </div>

            {/* Active Tab Panel */}
            {isLoading ? (
              <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-[#001A41] mx-auto" />
                <p className="text-xs text-slate-500">Loading your profile information...</p>
              </div>
            ) : (
              <>
                {activeTab === 'personal' && profile && (
                  <div role="tabpanel" id="panel-personal" aria-labelledby="tab-personal">
                    <PersonalDetailsSection
                      profile={profile}
                      isOffline={isOffline}
                      onSave={handleSavePersonalDetails}
                    />
                  </div>
                )}

                {activeTab === 'addresses' && (
                  <div role="tabpanel" id="panel-addresses" aria-labelledby="tab-addresses">
                    <SavedAddressesSection
                      addresses={addresses}
                      isOffline={isOffline}
                      onAddAddress={handleAddAddress}
                      onUpdateAddress={handleUpdateAddress}
                      onDeleteAddress={handleDeleteAddress}
                      onSetDefaultAddress={handleSetDefaultAddress}
                    />
                  </div>
                )}

                {activeTab === 'security' && (
                  <div role="tabpanel" id="panel-security" aria-labelledby="tab-security">
                    <SecuritySection
                      activeSessions={sessions}
                      isOffline={isOffline}
                      onUpdatePassword={handleUpdatePassword}
                      onSignOutOtherSessions={handleSignOutOtherSessions}
                    />
                  </div>
                )}

                {activeTab === 'notifications' && preferences && (
                  <div role="tabpanel" id="panel-notifications" aria-labelledby="tab-notifications">
                    <NotificationPreferencesSection
                      preferences={preferences}
                      isOffline={isOffline}
                      onUpdatePreferences={handleUpdatePreferences}
                    />
                  </div>
                )}

                {activeTab === 'account' && (
                  <div role="tabpanel" id="panel-account" aria-labelledby="tab-account">
                    <AccountManagementSection
                      isOffline={isOffline}
                      onExportData={handleExportData}
                      onDeleteAccount={handleDeleteAccount}
                    />
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <ProfileMobileBottomNav
        onOpenNoticeDialog={(d) => setActiveNoticeDialog(d)}
      />

      {/* Future Capabilities Notice Dialog */}
      <ProfileNoticeDialog
        dialog={activeNoticeDialog}
        onClose={() => setActiveNoticeDialog(null)}
      />
    </div>
  );
}

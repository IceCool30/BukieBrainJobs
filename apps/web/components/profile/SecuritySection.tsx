'use client';

import React, { useState } from 'react';
import {
  Smartphone,
  Mail,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Globe,
  Laptop,
} from 'lucide-react';
import { ActiveSession, UpdatePasswordInput } from '../../lib/profile/types';

interface SecuritySectionProps {
  activeSessions: ActiveSession[];
  isOffline: boolean;
  onUpdatePassword: (input: UpdatePasswordInput) => Promise<void>;
  onSignOutOtherSessions: () => Promise<void>;
}

export function SecuritySection({
  activeSessions,
  isOffline,
  onUpdatePassword,
  onSignOutOtherSessions,
}: SecuritySectionProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isSigningOutSessions, setIsSigningOutSessions] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [sessionSuccess, setSessionSuccess] = useState<string | null>(null);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (isOffline) {
      setPasswordError('Password changes are disabled in offline mode.');
      return;
    }

    if (!currentPassword) {
      setPasswordError('Please enter your current password.');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long.');
      return;
    }
    if (!/[A-Z]/.test(newPassword)) {
      setPasswordError('New password must contain at least one uppercase letter.');
      return;
    }
    if (!/[a-z]/.test(newPassword)) {
      setPasswordError('New password must contain at least one lowercase letter.');
      return;
    }
    if (!/[0-9]/.test(newPassword)) {
      setPasswordError('New password must contain at least one number.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    try {
      setIsUpdatingPassword(true);
      await onUpdatePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });
      setPasswordSuccess('Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(null), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update password.';
      setPasswordError(msg);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleSignOutOtherSessions = async () => {
    if (isOffline) return;
    try {
      setIsSigningOutSessions(true);
      await onSignOutOtherSessions();
      setSessionSuccess('Signed out of all other active sessions.');
      setTimeout(() => setSessionSuccess(null), 4000);
    } catch {
      setPasswordError('Failed to sign out of other sessions.');
    } finally {
      setIsSigningOutSessions(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Password Update Card */}
      <div className="bg-[var(--card-bg)] text-[var(--text-main)] rounded-lg p-6 border border-[var(--lead)] shadow-xs space-y-6">
        <div className="pb-6 border-b border-[var(--lead)]">
          <h2 className="text-xl font-bold font-display text-[var(--text-main)]">
            Security & Login Credentials
          </h2>
          <p className="text-xs text-[var(--text-muted)]">
            Keep your marketplace account secure. Choose a strong password with letters and numbers.
          </p>
        </div>

        {passwordError && (
          <div
            role="alert"
            className="p-3.5 rounded-lg bg-[var(--danger-dim)] border border-[var(--danger-border)] text-[var(--danger)] text-xs flex items-center gap-2.5"
          >
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{passwordError}</span>
          </div>
        )}

        {passwordSuccess && (
          <div
            role="status"
            className="p-3.5 rounded-lg bg-[var(--brand-green-dim)] border border-[var(--brand-green-border)] text-[var(--brand-green)] text-xs flex items-center gap-2.5"
          >
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{passwordSuccess}</span>
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-lg">
          <div>
            <label htmlFor="current-password" className="block text-xs font-semibold text-[var(--text-main)] mb-1.5">
              Current Password
            </label>
            <input
              id="current-password"
              type="password"
              value={currentPassword}
              disabled={isUpdatingPassword || isOffline}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-[var(--bg)] text-[var(--text-main)] border border-[var(--lead)] rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[var(--amber)] focus:bg-[var(--card-bg)] transition disabled:opacity-60"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="new-password" className="block text-xs font-semibold text-[var(--text-main)] mb-1.5">
                New Password
              </label>
              <input
                id="new-password"
                type="password"
                value={newPassword}
                disabled={isUpdatingPassword || isOffline}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-[var(--bg)] text-[var(--text-main)] border border-[var(--lead)] rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[var(--amber)] focus:bg-[var(--card-bg)] transition disabled:opacity-60"
                required
              />
            </div>

            <div>
              <label htmlFor="confirm-password" className="block text-xs font-semibold text-[var(--text-main)] mb-1.5">
                Confirm New Password
              </label>
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                disabled={isUpdatingPassword || isOffline}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-[var(--bg)] text-[var(--text-main)] border border-[var(--lead)] rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[var(--amber)] focus:bg-[var(--card-bg)] transition disabled:opacity-60"
                required
              />
            </div>
          </div>

          <p className="text-[11px] text-[var(--text-muted)]">
            Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number.
          </p>

          <button
            type="submit"
            disabled={isUpdatingPassword || isOffline}
            className="min-h-[48px] px-6 py-2.5 bg-[var(--amber)] hover:bg-[var(--amber-hover)] text-[#001A41] text-xs font-bold rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isUpdatingPassword ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Updating Password...</span>
              </>
            ) : (
              <span>Update Password</span>
            )}
          </button>
        </form>
      </div>

      {/* Linked Authentication Providers */}
      <div className="bg-[var(--card-bg)] text-[var(--text-main)] rounded-lg p-6 border border-[var(--lead)] shadow-xs space-y-4">
        <h3 className="text-sm font-bold font-display text-[var(--text-main)]">
          Connected Sign-In Methods
        </h3>
        <p className="text-xs text-[var(--text-muted)]">
          Methods you can use to sign into your BukieBrainJobs customer account.
        </p>

        <div className="divide-y divide-[var(--lead)]">
          <div className="py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[var(--tag-bg)] flex items-center justify-center text-[var(--text-main)] border border-[var(--lead)]">
                <Smartphone className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-[var(--text-main)]">Phone OTP Authentication</p>
                <p className="text-[11px] text-[var(--text-muted)]">Fast sign-in via SMS verification code</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[var(--brand-green-dim)] text-[var(--brand-green)] text-[10px] font-bold border border-[var(--brand-green-border)]">
              <ShieldCheck className="h-3 w-3" />
              Active
            </span>
          </div>

          <div className="py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[var(--tag-bg)] flex items-center justify-center text-[var(--text-main)] border border-[var(--lead)]">
                <Mail className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-[var(--text-main)]">Email & Password</p>
                <p className="text-[11px] text-[var(--text-muted)]">Traditional login credential</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[var(--brand-green-dim)] text-[var(--brand-green)] text-[10px] font-bold border border-[var(--brand-green-border)]">
              <ShieldCheck className="h-3 w-3" />
              Active
            </span>
          </div>

          <div className="py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[var(--tag-bg)] flex items-center justify-center text-[var(--text-main)] border border-[var(--lead)]">
                <Globe className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-[var(--text-main)]">Social Sign-In (Google / Apple)</p>
                <p className="text-[11px] text-[var(--text-muted)]">Optional single sign-on linking</p>
              </div>
            </div>
            <span className="text-[11px] text-[var(--text-muted)] font-medium">Available at sign-in</span>
          </div>
        </div>
      </div>

      {/* Active Sessions */}
      <div className="bg-[var(--card-bg)] text-[var(--text-main)] rounded-lg p-6 border border-[var(--lead)] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold font-display text-[var(--text-main)]">
              Active Devices & Sessions
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              Devices where you are currently signed in.
            </p>
          </div>

          {activeSessions.length > 1 && (
            <button
              type="button"
              disabled={isSigningOutSessions || isOffline}
              onClick={handleSignOutOtherSessions}
              className="min-h-[44px] text-xs font-semibold text-[var(--danger)] hover:text-[var(--danger)] transition cursor-pointer disabled:opacity-50 text-left sm:text-right"
            >
              {isSigningOutSessions ? 'Signing out...' : 'Sign out other devices'}
            </button>
          )}
        </div>

        {sessionSuccess && (
          <div
            role="status"
            className="p-3 rounded-lg bg-[var(--brand-green-dim)] border border-[var(--brand-green-border)] text-[var(--brand-green)] text-xs flex items-center gap-2"
          >
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{sessionSuccess}</span>
          </div>
        )}

        <div className="space-y-3">
          {activeSessions.map((session) => (
            <div
              key={session.id}
              className="p-4 rounded-lg border border-[var(--lead)] bg-[var(--tag-bg)]/20 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[var(--tag-bg)] text-[var(--amber)] border border-[var(--lead)] flex items-center justify-center shrink-0">
                  <Laptop className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[var(--text-main)] flex items-center gap-2">
                    <span>{session.device}</span>
                    {session.isCurrent && (
                      <span className="px-2 py-0.5 rounded-full bg-[var(--amber)] text-[#001A41] text-[9px] font-bold">
                        This Device
                      </span>
                    )}
                  </p>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    {session.location} • {session.lastActive}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

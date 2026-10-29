'use client';

import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { CustomerProfile, UpdatePersonalDetailsInput } from '../../lib/profile/types';

interface PersonalDetailsSectionProps {
  profile: CustomerProfile;
  isOffline: boolean;
  onSave: (data: UpdatePersonalDetailsInput) => Promise<void>;
}

export function PersonalDetailsSection({
  profile,
  isOffline,
  onSave,
}: PersonalDetailsSectionProps) {
  const [firstName, setFirstName] = useState(profile.firstName);
  const [lastName, setLastName] = useState(profile.lastName);
  const [phone, setPhone] = useState(profile.phone);
  const [email, setEmail] = useState(profile.email);

  const [isSaving, setIsSaving] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setSuccessMessage(null);

    if (isOffline) {
      setValidationError('Profile editing is disabled in offline mode.');
      return;
    }

    if (!firstName.trim() || firstName.trim().length < 2) {
      setValidationError('First name must be at least 2 characters long.');
      return;
    }
    if (!lastName.trim() || lastName.trim().length < 2) {
      setValidationError('Last name must be at least 2 characters long.');
      return;
    }
    if (!phone.trim()) {
      setValidationError('Phone number is required.');
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setValidationError('Please enter a valid email address.');
      return;
    }

    try {
      setIsSaving(true);
      await onSave({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        email: email.trim(),
      });
      setSuccessMessage('Personal details saved successfully.');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update personal details.';
      setValidationError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const initials = `${firstName ? firstName.charAt(0) : ''}${lastName ? lastName.charAt(0) : ''}`.toUpperCase() || 'C';

  return (
    <div className="bg-[var(--card-bg)] text-[var(--text-main)] rounded-2xl p-6 sm:p-7 border border-[var(--lead)] shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--lead)]">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl bg-[var(--tag-bg)] text-[var(--text-main)] border border-[var(--lead)] font-bold text-xl flex items-center justify-center shadow-xs">
            {initials}
          </div>
          <div>
            <h2 className="text-xl font-bold font-display text-[var(--text-main)]">
              Personal Information
            </h2>
            <p className="text-xs text-[var(--text-muted)]">
              Update your identity, contact phone number, and service delivery email.
            </p>
          </div>
        </div>

        {profile.emailVerified && (
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[var(--brand-green-dim)] text-[var(--brand-green)] text-xs font-semibold border border-[var(--brand-green-border)]">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Verified Customer</span>
          </div>
        )}
      </div>

      {validationError && (
        <div
          role="alert"
          className="p-3.5 rounded-xl bg-[var(--danger-dim)] border border-[var(--danger-border)] text-[var(--danger)] text-xs flex items-center gap-2.5"
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {successMessage && (
        <div
          role="status"
          className="p-3.5 rounded-xl bg-[var(--brand-green-dim)] border border-[var(--brand-green-border)] text-[var(--brand-green)] text-xs flex items-center gap-2.5"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="first-name" className="block text-xs font-semibold text-[var(--text-main)] mb-1.5">
              First Name
            </label>
            <input
              id="first-name"
              type="text"
              value={firstName}
              disabled={isSaving || isOffline}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-[var(--bg)] text-[var(--text-main)] border border-[var(--lead)] rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[var(--amber)] focus:bg-[var(--card-bg)] transition disabled:opacity-60"
              required
            />
          </div>

          <div>
            <label htmlFor="last-name" className="block text-xs font-semibold text-[var(--text-main)] mb-1.5">
              Last Name
            </label>
            <input
              id="last-name"
              type="text"
              value={lastName}
              disabled={isSaving || isOffline}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-[var(--bg)] text-[var(--text-main)] border border-[var(--lead)] rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[var(--amber)] focus:bg-[var(--card-bg)] transition disabled:opacity-60"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="phone-number" className="block text-xs font-semibold text-[var(--text-main)] mb-1.5">
              Phone Number
            </label>
            <input
              id="phone-number"
              type="tel"
              value={phone}
              disabled={isSaving || isOffline}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="08023456789 or +2348023456789"
              className="w-full px-3.5 py-2.5 text-xs bg-[var(--bg)] text-[var(--text-main)] border border-[var(--lead)] rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[var(--amber)] focus:bg-[var(--card-bg)] transition disabled:opacity-60"
              required
            />
            <p className="mt-1 text-[11px] text-[var(--text-muted)]">
              Format: 080... or +23480... (used for technician booking calls).
            </p>
          </div>

          <div>
            <label htmlFor="email-address" className="block text-xs font-semibold text-[var(--text-main)] mb-1.5">
              Email Address
            </label>
            <input
              id="email-address"
              type="email"
              value={email}
              disabled={isSaving || isOffline}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-[var(--bg)] text-[var(--text-main)] border border-[var(--lead)] rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[var(--amber)] focus:bg-[var(--card-bg)] transition disabled:opacity-60"
              required
            />
            <p className="mt-1 text-[11px] text-[var(--text-muted)]">
              Receipts and appointment updates are sent here.
            </p>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={isSaving || isOffline}
            className="outlier-pill-button min-h-[48px] px-8 py-2.5 bg-[var(--amber)] hover:bg-[var(--amber-hover)] text-[#001A41] text-xs font-bold rounded-full focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-[var(--amber)] transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <span>Save Personal Details</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

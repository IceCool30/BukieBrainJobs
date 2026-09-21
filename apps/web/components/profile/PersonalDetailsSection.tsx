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
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#001A41] text-[#ABEEC8] font-bold text-xl flex items-center justify-center shadow-xs">
            {initials}
          </div>
          <div>
            <h2 className="text-xl font-bold font-display text-[#001A41]">
              Personal Information
            </h2>
            <p className="text-xs text-slate-500">
              Update your identity, contact phone number, and service delivery email.
            </p>
          </div>
        </div>

        {profile.emailVerified && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Verified Customer</span>
          </div>
        )}
      </div>

      {validationError && (
        <div
          role="alert"
          className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5"
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {successMessage && (
        <div
          role="status"
          className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="first-name" className="block text-xs font-semibold text-slate-700 mb-1.5">
              First Name
            </label>
            <input
              id="first-name"
              type="text"
              value={firstName}
              disabled={isSaving || isOffline}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#001A41] focus:bg-white transition disabled:opacity-60"
              required
            />
          </div>

          <div>
            <label htmlFor="last-name" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Last Name
            </label>
            <input
              id="last-name"
              type="text"
              value={lastName}
              disabled={isSaving || isOffline}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#001A41] focus:bg-white transition disabled:opacity-60"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="phone-number" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Phone Number
            </label>
            <input
              id="phone-number"
              type="tel"
              value={phone}
              disabled={isSaving || isOffline}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="08023456789 or +2348023456789"
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#001A41] focus:bg-white transition disabled:opacity-60"
              required
            />
            <p className="mt-1 text-[11px] text-slate-500">
              Format: 080... or +23480... (used for technician booking calls).
            </p>
          </div>

          <div>
            <label htmlFor="email-address" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Email Address
            </label>
            <input
              id="email-address"
              type="email"
              value={email}
              disabled={isSaving || isOffline}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#001A41] focus:bg-white transition disabled:opacity-60"
              required
            />
            <p className="mt-1 text-[11px] text-slate-500">
              Receipts and appointment updates are sent here.
            </p>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={isSaving || isOffline}
            className="min-h-[48px] px-6 py-2.5 bg-[#001A41] text-white text-xs font-semibold rounded-xl hover:bg-[#002661] focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-[#001A41] transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
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

'use client';

import React, { useState } from 'react';
import {
  Bell,
  MessageSquare,
  Mail,
  Smartphone,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { NotificationPreferences } from '../../lib/profile/types';

interface NotificationPreferencesSectionProps {
  preferences: NotificationPreferences;
  isOffline: boolean;
  onUpdatePreferences: (partial: Partial<NotificationPreferences>) => Promise<void>;
}

export function NotificationPreferencesSection({
  preferences,
  isOffline,
  onUpdatePreferences,
}: NotificationPreferencesSectionProps) {
  const [prefs, setPrefs] = useState<NotificationPreferences>(preferences);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleToggle = async (key: keyof NotificationPreferences) => {
    if (isOffline) {
      setErrorMessage('Preferences cannot be changed in offline mode.');
      return;
    }

    const nextValue = !prefs[key];
    const updated = { ...prefs, [key]: nextValue };
    setPrefs(updated);
    setSavingKey(key);
    setErrorMessage(null);

    try {
      await onUpdatePreferences({ [key]: nextValue });
      setStatusMessage('Notification preferences updated.');
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err: unknown) {
      // Revert optimistic state
      setPrefs(prefs);
      const msg = err instanceof Error ? err.message : 'Failed to update preference.';
      setErrorMessage(msg);
    } finally {
      setSavingKey(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
      <div className="pb-6 border-b border-slate-100">
        <h2 className="text-xl font-bold font-display text-[#001A41]">
          Notification Preferences
        </h2>
        <p className="text-xs text-slate-500">
          Choose where and when you receive service dispatch notices, chat messages, and receipts.
        </p>
      </div>

      {statusMessage && (
        <div
          role="status"
          className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div
          role="alert"
          className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5"
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Communication Channels */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold font-display text-[#001A41]">
          Delivery Channels
        </h3>

        <div className="divide-y divide-slate-100">
          <div className="py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#001A41] flex items-center justify-center">
                <Smartphone className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-900">SMS Alerts</p>
                <p className="text-[11px] text-slate-500">Critical booking confirmation and arrival SMS</p>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={prefs.smsEnabled}
              disabled={isOffline || savingKey === 'smsEnabled'}
              onClick={() => handleToggle('smsEnabled')}
              className={`min-h-[44px] min-w-[44px] p-1 inline-flex items-center cursor-pointer disabled:opacity-50`}
            >
              <div
                className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${
                  prefs.smsEnabled ? 'bg-[#001A41]' : 'bg-slate-200'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-xs transform transition-transform ${
                    prefs.smsEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </div>
            </button>
          </div>

          <div className="py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <MessageSquare className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-900">WhatsApp Dispatch Updates</p>
                <p className="text-[11px] text-slate-500">Technician departure and arrival updates on WhatsApp</p>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={prefs.whatsappEnabled}
              disabled={isOffline || savingKey === 'whatsappEnabled'}
              onClick={() => handleToggle('whatsappEnabled')}
              className={`min-h-[44px] min-w-[44px] p-1 inline-flex items-center cursor-pointer disabled:opacity-50`}
            >
              <div
                className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${
                  prefs.whatsappEnabled ? 'bg-emerald-600' : 'bg-slate-200'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-xs transform transition-transform ${
                    prefs.whatsappEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </div>
            </button>
          </div>

          <div className="py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                <Mail className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-900">Email Summaries & Receipts</p>
                <p className="text-[11px] text-slate-500">Service invoices, job contracts, and monthly digests</p>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={prefs.emailEnabled}
              disabled={isOffline || savingKey === 'emailEnabled'}
              onClick={() => handleToggle('emailEnabled')}
              className={`min-h-[44px] min-w-[44px] p-1 inline-flex items-center cursor-pointer disabled:opacity-50`}
            >
              <div
                className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${
                  prefs.emailEnabled ? 'bg-[#001A41]' : 'bg-slate-200'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-xs transform transition-transform ${
                    prefs.emailEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </div>
            </button>
          </div>

          <div className="py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#001A41] flex items-center justify-center">
                <Bell className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-900">In-App Notification Center</p>
                <p className="text-[11px] text-slate-500">Badges and status updates inside the BukieBrainJobs workspace</p>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={prefs.inAppEnabled}
              disabled={isOffline || savingKey === 'inAppEnabled'}
              onClick={() => handleToggle('inAppEnabled')}
              className={`min-h-[44px] min-w-[44px] p-1 inline-flex items-center cursor-pointer disabled:opacity-50`}
            >
              <div
                className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${
                  prefs.inAppEnabled ? 'bg-[#001A41]' : 'bg-slate-200'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-xs transform transition-transform ${
                    prefs.inAppEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Notification Topics */}
      <div className="pt-4 border-t border-slate-100 space-y-4">
        <h3 className="text-sm font-bold font-display text-[#001A41]">
          Notification Topics
        </h3>

        <div className="divide-y divide-slate-100">
          <div className="py-3 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-slate-900">Job Requests & Booking Milestones</p>
              <p className="text-[11px] text-slate-500">Technician acceptance, departure, and completion confirmations</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={prefs.bookingUpdates}
              disabled={isOffline || savingKey === 'bookingUpdates'}
              onClick={() => handleToggle('bookingUpdates')}
              className="min-h-[44px] min-w-[44px] p-1 inline-flex items-center cursor-pointer disabled:opacity-50"
            >
              <div
                className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${
                  prefs.bookingUpdates ? 'bg-[#001A41]' : 'bg-slate-200'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-xs transform transition-transform ${
                    prefs.bookingUpdates ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </div>
            </button>
          </div>

          <div className="py-3 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-slate-900">Direct Messages from BrainWorkers</p>
              <p className="text-[11px] text-slate-500">Real-time alerts when a technician messages you</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={prefs.messageAlerts}
              disabled={isOffline || savingKey === 'messageAlerts'}
              onClick={() => handleToggle('messageAlerts')}
              className="min-h-[44px] min-w-[44px] p-1 inline-flex items-center cursor-pointer disabled:opacity-50"
            >
              <div
                className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${
                  prefs.messageAlerts ? 'bg-[#001A41]' : 'bg-slate-200'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-xs transform transition-transform ${
                    prefs.messageAlerts ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </div>
            </button>
          </div>

          <div className="py-3 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-slate-900">Service Announcements & Discounts</p>
              <p className="text-[11px] text-slate-500">Occasional updates on seasonal services and promotions</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={prefs.marketingAlerts}
              disabled={isOffline || savingKey === 'marketingAlerts'}
              onClick={() => handleToggle('marketingAlerts')}
              className="min-h-[44px] min-w-[44px] p-1 inline-flex items-center cursor-pointer disabled:opacity-50"
            >
              <div
                className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${
                  prefs.marketingAlerts ? 'bg-[#001A41]' : 'bg-slate-200'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-xs transform transition-transform ${
                    prefs.marketingAlerts ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

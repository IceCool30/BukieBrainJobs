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
    <div className="bg-[var(--card-bg)] text-[var(--text-main)] rounded-lg p-6 border border-[var(--lead)] shadow-xs space-y-6">
      <div className="pb-6 border-b border-[var(--lead)]">
        <h2 className="text-xl font-bold font-display text-[var(--text-main)]">
          Notification Preferences
        </h2>
        <p className="text-xs text-[var(--text-muted)]">
          Choose where and when you receive service dispatch notices, chat messages, and receipts.
        </p>
      </div>

      {statusMessage && (
        <div
          role="status"
          className="p-3.5 rounded-lg bg-[var(--brand-green-dim)] border border-[var(--brand-green-border)] text-[var(--brand-green)] text-xs flex items-center gap-2.5"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div
          role="alert"
          className="p-3.5 rounded-lg bg-[var(--danger-dim)] border border-[var(--danger-border)] text-[var(--danger)] text-xs flex items-center gap-2.5"
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Communication Channels */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold font-display text-[var(--text-main)]">
          Delivery Channels
        </h3>

        <div className="divide-y divide-[var(--lead)]">
          <div className="py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[var(--tag-bg)] text-[var(--amber)] border border-[var(--lead)] flex items-center justify-center">
                <Smartphone className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-[var(--text-main)]">SMS Alerts</p>
                <p className="text-[11px] text-[var(--text-muted)]">Critical booking confirmation and arrival SMS</p>
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
                  prefs.smsEnabled ? 'bg-[var(--amber)]' : 'bg-[var(--lead)]'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-[var(--card-bg)] shadow-xs transform transition-transform ${
                    prefs.smsEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </div>
            </button>
          </div>

          <div className="py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[var(--brand-green-dim)] text-[var(--brand-green)] border border-[var(--brand-green-border)] flex items-center justify-center">
                <MessageSquare className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-[var(--text-main)]">WhatsApp Dispatch Updates</p>
                <p className="text-[11px] text-[var(--text-muted)]">Technician departure and arrival updates on WhatsApp</p>
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
                  prefs.whatsappEnabled ? 'bg-[var(--amber)]' : 'bg-[var(--lead)]'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-[var(--card-bg)] shadow-xs transform transition-transform ${
                    prefs.whatsappEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </div>
            </button>
          </div>

          <div className="py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[var(--tag-bg)] text-[var(--text-main)] border border-[var(--lead)] flex items-center justify-center">
                <Mail className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-[var(--text-main)]">Email Summaries & Receipts</p>
                <p className="text-[11px] text-[var(--text-muted)]">Service invoices, job contracts, and monthly digests</p>
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
                  prefs.emailEnabled ? 'bg-[var(--amber)]' : 'bg-[var(--lead)]'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-[var(--card-bg)] shadow-xs transform transition-transform ${
                    prefs.emailEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </div>
            </button>
          </div>

          <div className="py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[var(--tag-bg)] text-[var(--amber)] border border-[var(--lead)] flex items-center justify-center">
                <Bell className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-[var(--text-main)]">In-App Notification Center</p>
                <p className="text-[11px] text-[var(--text-muted)]">Badges and status updates inside the BukieBrainJobs workspace</p>
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
                  prefs.inAppEnabled ? 'bg-[var(--amber)]' : 'bg-[var(--lead)]'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-[var(--card-bg)] shadow-xs transform transition-transform ${
                    prefs.inAppEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Notification Topics */}
      <div className="pt-4 border-t border-[var(--lead)] space-y-4">
        <h3 className="text-sm font-bold font-display text-[var(--text-main)]">
          Notification Topics
        </h3>

        <div className="divide-y divide-[var(--lead)]">
          <div className="py-3 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-[var(--text-main)]">Job Requests & Booking Milestones</p>
              <p className="text-[11px] text-[var(--text-muted)]">Technician acceptance, departure, and completion confirmations</p>
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
                  prefs.bookingUpdates ? 'bg-[var(--amber)]' : 'bg-[var(--lead)]'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-[var(--card-bg)] shadow-xs transform transition-transform ${
                    prefs.bookingUpdates ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </div>
            </button>
          </div>

          <div className="py-3 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-[var(--text-main)]">Direct Messages from BrainWorkers</p>
              <p className="text-[11px] text-[var(--text-muted)]">Real-time alerts when a technician messages you</p>
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
                  prefs.messageAlerts ? 'bg-[var(--amber)]' : 'bg-[var(--lead)]'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-[var(--card-bg)] shadow-xs transform transition-transform ${
                    prefs.messageAlerts ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </div>
            </button>
          </div>

          <div className="py-3 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-[var(--text-main)]">Service Announcements & Discounts</p>
              <p className="text-[11px] text-[var(--text-muted)]">Occasional updates on seasonal services and promotions</p>
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
                  prefs.marketingAlerts ? 'bg-[var(--amber)]' : 'bg-[var(--lead)]'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-[var(--card-bg)] shadow-xs transform transition-transform ${
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

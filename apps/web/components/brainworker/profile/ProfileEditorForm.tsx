// apps/web/components/brainworker/profile/ProfileEditorForm.tsx
// BrainWorker Profile Editor Form Component (BW-005, Item 2.7)
// Phase 3 GREEN: Profile details editor, Nigerian languages, completeness banner

import React, { useState, type JSX } from 'react';
import { calculateProfileCompleteness } from '../../../lib/brainworker/profile/domain';
import {
  RECOGNIZED_NIGERIAN_LANGUAGES,
  type BrainWorkerProfile,
  type NigerianLanguage,
} from '../../../lib/brainworker/profile/types';
import type { ProfileEditorFormProps } from './types';

export function ProfileEditorForm({
  profile,
  portfolioItems = [],
  isSaving = false,
  onSaveProfile,
}: ProfileEditorFormProps): JSX.Element {
  const [headline, setHeadline] = useState(profile?.headline ?? '');
  const [bio, setBio] = useState(profile?.bio ?? '');
  const [yearsOfExperience, setYearsOfExperience] = useState<number>(
    profile?.yearsOfExperience ?? 0
  );
  const [spokenLanguages, setSpokenLanguages] = useState<NigerianLanguage[]>(
    profile?.spokenLanguages && profile.spokenLanguages.length > 0
      ? profile.spokenLanguages
      : ['English']
  );
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatarUrl ?? '');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Compute profile completeness dynamically
  const currentProfileState: BrainWorkerProfile = {
    brainWorkerId: profile?.brainWorkerId ?? 'worker-draft',
    headline,
    bio,
    yearsOfExperience,
    spokenLanguages,
    avatarUrl: avatarUrl.trim().length > 0 ? avatarUrl.trim() : null,
    updatedAt: profile?.updatedAt ?? new Date().toISOString(),
  };

  const completeness = calculateProfileCompleteness(
    currentProfileState,
    portfolioItems
  );

  const toggleLanguage = (lang: NigerianLanguage) => {
    if (spokenLanguages.includes(lang)) {
      if (spokenLanguages.length > 1) {
        setSpokenLanguages(spokenLanguages.filter((l) => l !== lang));
      }
    } else {
      setSpokenLanguages([...spokenLanguages, lang]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(false);

    await onSaveProfile({
      headline: headline.trim(),
      bio: bio.trim(),
      yearsOfExperience,
      spokenLanguages,
      avatarUrl: avatarUrl.trim().length > 0 ? avatarUrl.trim() : null,
    });

    setSaveSuccess(true);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Completeness Meter */}
      <div
        data-testid="profile-completeness-meter"
        className="rounded-xl border border-slate-700/60 bg-slate-900/60 p-4"
      >
        <div className="flex items-center justify-between gap-4 mb-2">
          <span className="text-sm font-medium text-slate-300">
            Profile Completeness
          </span>
          <span className="text-sm font-bold text-emerald-400">
            {completeness.percentage}%
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all duration-300"
            style={{ width: `${completeness.percentage}%` }}
          />
        </div>
        {completeness.missingMilestones.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="text-xs text-slate-400">Missing steps:</span>
            {completeness.missingMilestones.map((milestone) => (
              <span
                key={milestone}
                className="inline-flex items-center rounded-md bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-300 border border-amber-500/20"
              >
                {milestone}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Headshot & Avatar */}
      <div className="space-y-2">
        <label
          htmlFor="profile-avatar-input"
          className="block text-sm font-medium text-slate-200"
        >
          Professional Headshot URL
        </label>
        <div className="flex items-center gap-4">
          <div
            data-testid="profile-avatar-preview"
            className="h-16 w-16 overflow-hidden rounded-full border border-slate-700 bg-slate-800 flex items-center justify-center text-slate-400 text-xs font-medium"
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Profile Avatar Preview"
                className="h-full w-full object-cover"
              />
            ) : (
              <span>No Photo</span>
            )}
          </div>
          <input
            id="profile-avatar-input"
            data-testid="profile-avatar-input"
            type="url"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="https://example.com/headshot.jpg"
            className="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Professional Headline */}
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <label
            htmlFor="profile-headline-input"
            className="block text-sm font-medium text-slate-200"
          >
            Professional Headline
          </label>
          <span className="text-xs text-slate-400">
            {headline.length} / 100
          </span>
        </div>
        <input
          id="profile-headline-input"
          data-testid="profile-headline-input"
          type="text"
          maxLength={100}
          value={headline}
          onChange={(e) => setHeadline(e.target.value)}
          placeholder="e.g. Certified Master Electrician & Solar Installer"
          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
        />
      </div>

      {/* Trade Bio */}
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <label
            htmlFor="profile-bio-input"
            className="block text-sm font-medium text-slate-200"
          >
            Trade Experience & Bio
          </label>
          <span className="text-xs text-slate-400">{bio.length} / 1000</span>
        </div>
        <textarea
          id="profile-bio-input"
          data-testid="profile-bio-input"
          rows={4}
          maxLength={1000}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Describe your background, specialization, and coverage areas..."
          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
        />
      </div>

      {/* Years of Experience */}
      <div className="space-y-1">
        <label
          htmlFor="profile-experience-input"
          className="block text-sm font-medium text-slate-200"
        >
          Years of Experience (0 to 50)
        </label>
        <input
          id="profile-experience-input"
          data-testid="profile-experience-input"
          type="number"
          min={0}
          max={50}
          value={yearsOfExperience}
          onChange={(e) => setYearsOfExperience(Number(e.target.value))}
          className="w-32 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-emerald-500 focus:outline-none"
        />
      </div>

      {/* Nigerian Languages */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-200">
          Spoken Nigerian Languages
        </label>
        <div className="flex flex-wrap gap-2">
          {RECOGNIZED_NIGERIAN_LANGUAGES.map((lang) => {
            const isSelected = spokenLanguages.includes(lang);
            const slug = lang.toLowerCase().replace(/\s+/g, '-');
            return (
              <button
                key={lang}
                type="button"
                data-testid={`language-chip-${slug}`}
                aria-pressed={isSelected}
                onClick={() => toggleLanguage(lang)}
                className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
                  isSelected
                    ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                }`}
              >
                {lang}
              </button>
            );
          })}
        </div>
      </div>

      {/* Submit Action */}
      <div className="pt-2 flex items-center gap-4">
        <button
          type="submit"
          data-testid="profile-save-btn"
          disabled={isSaving}
          className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 focus:outline-none disabled:opacity-50"
        >
          {isSaving ? 'Saving Profile...' : 'Save Profile Details'}
        </button>
        {saveSuccess && (
          <span className="text-sm font-medium text-emerald-400">
            Profile changes saved successfully.
          </span>
        )}
      </div>
    </form>
  );
}

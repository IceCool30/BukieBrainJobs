import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

declare const __dirname: string;

describe('MOB-ACT-001 Native Customer Activity Hub Screen', () => {
  const mobileRoot = resolve(__dirname, '..');
  const readMobileFile = (relativePath: string) =>
    readFileSync(resolve(mobileRoot, relativePath), 'utf8');

  it('preserves tab structure with All, Active, Upcoming, Past in order and defaults to All', () => {
    const jobsContent = readMobileFile('app/(tabs)/jobs.tsx');
    expect(jobsContent).toContain("useState<ActivitySegment>('All')");
    expect(jobsContent).toContain("['All', 'Active', 'Upcoming', 'Past']");
  });

  it('exposes accessible tab role and selected state without count indicators', () => {
    const jobsContent = readMobileFile('app/(tabs)/jobs.tsx');
    expect(jobsContent).toContain('accessibilityRole="tab"');
    expect(jobsContent).toContain('accessibilityState={{ selected }}');
    expect(jobsContent).not.toMatch(/\{tab\}\s*\(/);
    expect(jobsContent).not.toMatch(/count/i);
  });

  it('enforces minHeight 48 and minWidth 48 on tab items and CTA button', () => {
    const jobsContent = readMobileFile('app/(tabs)/jobs.tsx');
    expect(jobsContent).toContain('minHeight: 48');
    expect(jobsContent).toContain('minWidth: 48');
  });

  it('renders exact sample preview notice above sample list', () => {
    const jobsContent = readMobileFile('app/(tabs)/jobs.tsx');
    expect(jobsContent).toContain('ACTIVITY_SAMPLE_NOTICE');
  });

  it('renders sample list filtered by active tab using activity-preview helper', () => {
    const jobsContent = readMobileFile('app/(tabs)/jobs.tsx');
    expect(jobsContent).toContain('filterActivitySamples');
    expect(jobsContent).toContain('ACTIVITY_TYPE_LABELS');
    expect(jobsContent).toContain('ACTIVITY_STATUS_LABELS');
    expect(jobsContent).toContain('sample.badge');
    expect(jobsContent).toContain('sample.serviceTitle');
  });

  it('retains EXPLORE SERVICES CTA navigating to /(tabs)/services with approved theme contrast tokens', () => {
    const jobsContent = readMobileFile('app/(tabs)/jobs.tsx');
    expect(jobsContent).toContain('EXPLORE SERVICES');
    expect(jobsContent).toContain("router.push('/(tabs)/services')");
    expect(jobsContent).toContain("c.mode === 'light' ? c.card : c.canvas");
  });

  it('does not contain prohibited empty state cards, customer records, or storage persistence', () => {
    const jobsContent = readMobileFile('app/(tabs)/jobs.tsx');
    expect(jobsContent).not.toContain('EmptyJobsCard');
    expect(jobsContent).not.toContain('AsyncStorage');
    expect(jobsContent).not.toContain('sqlite');
    expect(jobsContent).not.toContain('fetch(');
  });

  describe('MOB-LIFE-001 Native Booking Lifecycle Presentation (UI-Only)', () => {
    it('enforces minHeight 48 and minWidth 48 on activity card touch targets with accessible role and hint', () => {
      const jobsContent = readMobileFile('app/(tabs)/jobs.tsx');
      expect(jobsContent).toContain('accessibilityRole="button"');
      expect(jobsContent).toContain('accessibilityHint="Opens lifecycle details"');
      expect(jobsContent).toContain('minHeight: 48');
    });

    it('wires sample card selection to in-place lifecycle detail with local state', () => {
      const jobsContent = readMobileFile('app/(tabs)/jobs.tsx');
      expect(jobsContent).toContain('selectedSampleIndex');
      expect(jobsContent).toContain('setSelectedSampleIndex');
    });

    it('renders dedicated Back button in detail view with accessible role, min 48px target, and label', () => {
      const jobsContent = readMobileFile('app/(tabs)/jobs.tsx');
      expect(jobsContent).toContain('Back to activity list');
      expect(jobsContent).toContain('Back to Activity');
      expect(jobsContent).toContain('accessibilityLabel="Back to activity list"');
      expect(jobsContent).toContain('isLight ? c.amberHover : c.amber');
      expect(jobsContent).toContain('isLight ? c.card : c.strip');
    });

    it('resets selected sample on navigation blur', () => {
      const jobsContent = readMobileFile('app/(tabs)/jobs.tsx');
      expect(jobsContent).toContain("addListener('blur'");
      expect(jobsContent).toContain('setSelectedSampleIndex(null)');
    });

    it('renders truthful narrative and canonical headings without schedule, personal, or price fabrication', () => {
      const jobsContent = readMobileFile('app/(tabs)/jobs.tsx');
      expect(jobsContent).toContain('getSampleLifecycleHeading');
      expect(jobsContent).toContain('getSampleLifecycleNarrative');
      expect(jobsContent).not.toMatch(/₦|NGN|\$[0-9]|price|hourly/i);
      expect(jobsContent).not.toMatch(/workerName|customerPhone|avatar/i);
      expect(jobsContent).not.toMatch(/appointmentTime|scheduleDate|countdown/i);
    });

    it('renders generic linear milestone indicator and handles cancelled state without progression sequence', () => {
      const jobsContent = readMobileFile('app/(tabs)/jobs.tsx');
      expect(jobsContent).toContain('getSampleMilestoneProgression');
      expect(jobsContent).toContain('isSampleCancelled');
      expect(jobsContent).not.toContain('CancelledTerminalBlock');
      expect(jobsContent).toContain('accessibilityRole="header" style={[styles.headingLabel');
    });

    it('renders sample context block with activity type and local demonstration disclaimer', () => {
      const jobsContent = readMobileFile('app/(tabs)/jobs.tsx');
      expect(jobsContent).toContain('LIFECYCLE_SAMPLE_DISCLAIMER');
    });
  });
});

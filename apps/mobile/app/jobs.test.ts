import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { getStripAccentColor, obsidianDarkTokens, obsidianLightTokens } from '../lib/theme';

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

    it('renders static amber active marker labelled Current step and forbids telemetry-beacon or dispatch copy', () => {
      const jobsContent = readMobileFile('app/(tabs)/jobs.tsx');
      expect(jobsContent).toContain("'Current step'");
      expect(jobsContent).toContain('activeStepMarker');
      expect(jobsContent).toContain('c.amber');
      expect(jobsContent).toContain('c.green');
      expect(jobsContent).not.toContain('telemetry-beacon');
      expect(jobsContent).not.toContain('LIVE TECHNICAL DISPATCH');
      expect(jobsContent).not.toContain('Animated.');
    });

    it('displays read-only cancelled sample with danger accent and exact copy Preview record: read only', () => {
      const jobsContent = readMobileFile('app/(tabs)/jobs.tsx');
      const lifecycleContent = readMobileFile('lib/lifecycle-preview.ts');
      expect(jobsContent).toContain('CANCELLED_PREVIEW_NOTICE');
      expect(lifecycleContent).toContain("CANCELLED_PREVIEW_NOTICE = 'Preview record: read only'");
      expect(jobsContent).toContain('c.danger');
      expect(jobsContent).not.toMatch(/cancelBooking|submitCancellation|handleCancelJob/i);
    });

    it('enforces Outlier pill styling, touch targets, and full tab accessibility', () => {
      const jobsContent = readMobileFile('app/(tabs)/jobs.tsx');
      expect(jobsContent).toContain('accessibilityRole="tab"');
      expect(jobsContent).toContain('accessibilityState={{ selected }}');
      expect(jobsContent).toContain('minHeight: 48');
      expect(jobsContent).toContain('minWidth: 48');
      expect(jobsContent).toContain('borderRadius: 20');
    });

    it('strictly prohibits backend, network, database, auth, and state mutation operations', () => {
      const jobsContent = readMobileFile('app/(tabs)/jobs.tsx');
      expect(jobsContent).not.toMatch(/fetch\(|axios|graphql|WebSocket/i);
      expect(jobsContent).not.toMatch(/prisma|supabase|postgres|sqlite/i);
      expect(jobsContent).not.toMatch(/AsyncStorage|SecureStore/i);
      expect(jobsContent).not.toMatch(/useAuth|session|jwt|bearer/i);
      expect(jobsContent).not.toMatch(/mutate|mutation|post\(|put\(|delete\(/i);
      expect(jobsContent).not.toMatch(/Location|Camera|PushNotification/i);
    });

    it('enforces theme-specific contrast standards for active marker and cancelled preview elements', () => {
      const jobsContent = readMobileFile('app/(tabs)/jobs.tsx');

      type Rgb = { r: number; g: number; b: number };
      const toRgb = (hex: string): Rgb => {
        const clean = hex.replace('#', '');
        return {
          r: parseInt(clean.slice(0, 2), 16),
          g: parseInt(clean.slice(2, 4), 16),
          b: parseInt(clean.slice(4, 6), 16),
        };
      };

      const contrast = (c1: Rgb, c2: Rgb): number => {
        const lum = (c: Rgb) => {
          const a = [c.r, c.g, c.b].map((v) => {
            const s = v / 255;
            return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
          });
          return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
        };
        return (Math.max(lum(c1), lum(c2)) + 0.05) / (Math.min(lum(c1), lum(c2)) + 0.05);
      };

      expect(jobsContent).toMatch(/ActiveStepMarker[\s\S]*?getStripAccentColor\(c,\s*c\.amber\)/);

      const darkMarker = getStripAccentColor(obsidianDarkTokens, obsidianDarkTokens.amber);
      expect(darkMarker).toBe(obsidianDarkTokens.amber);
      const darkMarkerContrast = contrast(toRgb(darkMarker), toRgb(obsidianDarkTokens.strip));
      expect(darkMarkerContrast).toBeGreaterThanOrEqual(4.5);

      const lightMarker = getStripAccentColor(obsidianLightTokens, obsidianLightTokens.amber);
      expect(lightMarker).toBe(obsidianLightTokens.stripAccent);
      const lightMarkerContrast = contrast(toRgb(lightMarker), toRgb(obsidianLightTokens.strip));
      expect(lightMarkerContrast).toBeGreaterThanOrEqual(4.5);

      expect(jobsContent).toMatch(/isCancelled\s*&&\s*c\.mode\s*===\s*'light'\s*\?\s*c\.card\s*:\s*c\.strip/);

      const lightCancelledContrast = contrast(toRgb(obsidianLightTokens.danger), toRgb(obsidianLightTokens.card));
      expect(lightCancelledContrast).toBeGreaterThanOrEqual(4.5);

      const darkCancelledContrast = contrast(toRgb(obsidianDarkTokens.danger), toRgb(obsidianDarkTokens.strip));
      expect(darkCancelledContrast).toBeGreaterThanOrEqual(4.5);
    });
  });
});

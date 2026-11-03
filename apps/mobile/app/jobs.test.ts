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
});

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

declare const __dirname: string;

import { describe, expect, it } from 'vitest';
import { obsidianDarkTokens } from '../lib/theme';

describe('Phase 4 Content & Interaction Guardrails', () => {
  const mobileRoot = resolve(__dirname, '..');
  const readMobileFile = (relativePath: string) =>
    readFileSync(resolve(mobileRoot, relativePath), 'utf8');

  const filesToCheck = [
    'lib/theme.ts',
    'app/index.tsx',
    'app/(tabs)/_layout.tsx',
    'app/(tabs)/home.tsx',
    'app/(tabs)/services.tsx',
    'app/(tabs)/jobs.tsx',
    'app/(tabs)/messages.tsx',
    'app/(tabs)/profile.tsx',
    'app/services/[id].tsx',
  ];

  it('prohibits BukiePassport across all mobile screens per content style guide', () => {
    for (const file of filesToCheck) {
      const content = readMobileFile(file);
      expect(content, `Found disallowed BukiePassport in ${file}`).not.toContain('BukiePassport');
    }
  });

  it('prohibits BukieGuarantee and unsupported guarantee claims in mobile preview', () => {
    for (const file of filesToCheck) {
      const content = readMobileFile(file);
      expect(content, `Found BukieGuarantee in ${file}`).not.toContain('BukieGuarantee');
      expect(content, `Found escrow guarantees in ${file}`).not.toContain('escrow guarantees');
      expect(content, `Found Milestone Escrow Assurance in ${file}`).not.toContain('Milestone Escrow Assurance');
    }
  });

  it('prohibits invented category counts in mobile screens', () => {
    for (const file of filesToCheck) {
      const content = readMobileFile(file);
      expect(content, `Found invented count 142 in ${file}`).not.toContain('142');
      expect(content, `Found invented count 98 in ${file}`).not.toContain('98');
      expect(content, `Found invented count 115 in ${file}`).not.toContain('115');
    }
  });

  it('prohibits fake account identities and fake wallet balances', () => {
    for (const file of filesToCheck) {
      const content = readMobileFile(file);
      expect(content, `Found fake Client Account in ${file}`).not.toContain('Client Account');
      expect(content, `Found fake zero balance ₦0.00 in ${file}`).not.toContain('₦0.00');
    }
  });

  it('prohibits unverified claims (vetted professionals, live tracking, secure messaging)', () => {
    for (const file of filesToCheck) {
      const content = readMobileFile(file);
      expect(content, `Found vetted professionals claim in ${file}`).not.toContain('vetted professionals');
      expect(content, `Found live tracking claim in ${file}`).not.toContain('live tracking');
      expect(content, `Found Secure Platform Messaging in ${file}`).not.toContain('Secure Platform Messaging');
    }
  });

  it('prohibits invented turnaround times and prices in mobile services', () => {
    const servicesContent = readMobileFile('app/(tabs)/services.tsx');
    expect(servicesContent).not.toContain('Typical response:');
    expect(servicesContent).not.toContain('Same-day');
    expect(servicesContent).not.toContain('2-4 hours');
    expect(servicesContent).not.toContain('1-3 hours');
    expect(servicesContent).not.toContain('₦10,000');
    expect(servicesContent).not.toContain('₦12,000');
    expect(servicesContent).not.toContain('₦8,000');
    expect(servicesContent).not.toContain('₦15,000');
  });

  it('ensures design tokens contain only valid native color strings and no CSS-only tokens', () => {
    const tokens = obsidianDarkTokens as Record<string, unknown>;
    expect(tokens.dispatchBg).toBeUndefined();
    expect(tokens.tableHeaderBg).toBeUndefined();
    expect(tokens.tagBg).toBeUndefined();
    expect(tokens.brandGreenDim).toBeUndefined();
    expect(tokens.brandGreenBorder).toBeUndefined();
    expect(tokens.amberDim).toBeUndefined();
    expect(tokens.dangerDim).toBeUndefined();

    for (const [key, value] of Object.entries(obsidianDarkTokens)) {
      if (typeof value === 'string') {
        expect(
          value.startsWith('linear-gradient'),
          `Token ${key} must not be a CSS gradient string in native mobile tokens`
        ).toBe(false);
      }
    }
  });

  it('prohibits no-op Pressables in profile screen where native sub-routes do not yet exist', () => {
    const profileContent = readMobileFile('app/(tabs)/profile.tsx');
    expect(profileContent).not.toMatch(/<Pressable[^>]*accessibilityLabel=\{item\.label\}/);
  });

  it('prohibits unsafe as any type assertions in changed mobile UI files', () => {
    const uiFiles = [
      'app/(tabs)/_layout.tsx',
      'app/(tabs)/home.tsx',
      'app/(tabs)/services.tsx',
      'app/(tabs)/jobs.tsx',
      'app/(tabs)/messages.tsx',
      'app/(tabs)/profile.tsx',
      'app/index.tsx',
      'app/_layout.tsx',
      'app/brainworker/register.tsx',
      'lib/theme.ts',
    ];
    for (const file of uiFiles) {
      const content = readMobileFile(file);
      expect(content, `Found unsafe 'as any' in ${file}`).not.toContain('as any');
    }
  });

  it('prohibits premature verified service provider claims in registration copy', () => {
    const regContent = readMobileFile('app/brainworker/register.tsx');
    expect(regContent).not.toContain('verified service provider');
  });

  it('prohibits internal roadmap language and phase references in user-facing copy', () => {
    for (const file of filesToCheck) {
      const content = readMobileFile(file);
      expect(content, `Found 'subsequent phases' in ${file}`).not.toContain('subsequent phases');
      expect(content, `Found 'Phase 4.2' in ${file}`).not.toContain('Phase 4.2');
      expect(content, `Found 'scheduled for' in ${file}`).not.toContain('scheduled for');
    }
  });

  it('prohibits unverified geographic availability and popularity claims', () => {
    for (const file of filesToCheck) {
      const content = readMobileFile(file);
      expect(content, `Found 'across Nigeria' in ${file}`).not.toContain('across Nigeria');
      expect(content, `Found 'POPULAR SERVICES' in ${file}`).not.toContain('POPULAR SERVICES');
      expect(content, `Found 'popular services' in ${file}`).not.toContain('popular services');
    }
  });

  it('prohibits future delivery promises and delivery commitment labels', () => {
    for (const file of filesToCheck) {
      const content = readMobileFile(file);
      expect(content, `Found 'will display here' in ${file}`).not.toContain('will display here');
      expect(content, `Found 'will appear here' in ${file}`).not.toContain('will appear here');
    }
    const profileContent = readMobileFile('app/(tabs)/profile.tsx');
    expect(profileContent, "Found delivery commitment 'Upcoming' label in profile").not.toContain('Upcoming');
  });

  it('enforces factual preview wording for unseeded states', () => {
    const homeContent = readMobileFile('app/(tabs)/home.tsx');
    const servicesContent = readMobileFile('app/(tabs)/services.tsx');
    const jobsContent = readMobileFile('app/(tabs)/jobs.tsx');
    const messagesContent = readMobileFile('app/(tabs)/messages.tsx');
    const profileContent = readMobileFile('app/(tabs)/profile.tsx');

    expect(homeContent).toContain('This preview does not include live');
    expect(servicesContent).toContain('This preview does not include live');
    expect(jobsContent).toContain('This preview does not include live');
    expect(messagesContent).toContain('This preview does not include live');
    expect(profileContent).toContain('This preview does not include live');
  });

  it('prohibits unapproved secondary marketing line in index.tsx', () => {
    const indexContent = readMobileFile('app/index.tsx');
    expect(indexContent).not.toContain('Connect directly with skilled professionals');
  });

  it('prohibits obvious section comments from mobile screen JSX', () => {
    const uiScreens = [
      'app/index.tsx',
      'app/(tabs)/_layout.tsx',
      'app/(tabs)/home.tsx',
      'app/(tabs)/services.tsx',
      'app/(tabs)/jobs.tsx',
      'app/(tabs)/messages.tsx',
      'app/(tabs)/profile.tsx',
      'app/services/[id].tsx',
    ];
    for (const file of uiScreens) {
      const content = readMobileFile(file);
      expect(content, `Found JSX section comment in ${file}`).not.toMatch(/\{\/\*[\s\S]*?\*\/\}/);
    }
  });

  it('enforces that UI functions in mobile screens remain <= 25 lines', () => {
    const uiScreens = [
      'app/index.tsx',
      'app/(tabs)/_layout.tsx',
      'app/(tabs)/home.tsx',
      'app/(tabs)/services.tsx',
      'app/(tabs)/jobs.tsx',
      'app/(tabs)/messages.tsx',
      'app/(tabs)/profile.tsx',
      'app/services/[id].tsx',
    ];

    for (const file of uiScreens) {
      const lines = readMobileFile(file).split('\n');
      let currentFn: string | null = null;
      let startLine = 0;
      let braceCount = 0;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const fnMatch = line.match(/(?:export default )?function\s+([A-Za-z0-9_]+)/);
        if (fnMatch && !currentFn) {
          currentFn = fnMatch[1];
          startLine = i + 1;
          braceCount = 0;
        }
        if (currentFn) {
          for (const ch of line) {
            if (ch === '{') braceCount++;
            if (ch === '}') braceCount--;
          }
          if (braceCount === 0) {
            const length = i + 1 - startLine + 1;
            expect(
              length,
              `Function '${currentFn}' in ${file} has ${length} lines, exceeding 25 lines limit`
            ).toBeLessThanOrEqual(25);
            currentFn = null;
          }
        }
      }
    }
  });
});

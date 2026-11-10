import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

declare const __dirname: string;

import { describe, expect, it } from 'vitest';
import { obsidianDarkTokens, obsidianLightTokens } from '../lib/theme';

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

  it('enforces approved headline and paired-professional photo asset on marketing home screen', () => {
    const indexContent = readMobileFile('app/index.tsx');
    expect(indexContent).toContain(
      'Book a skilled local or remote worker in minutes or find flexible work that pays what you are worth only on',
    );
    expect(indexContent).toContain('hero-mobile-1080.jpg');
    expect(indexContent).not.toContain('Hire elite Nigerian artisans');
  });

  it('rejects overly dark overlays that obscure paired workers and enforces vibrant photo-led scrim', () => {
    const indexContent = readMobileFile('app/index.tsx');
    expect(indexContent).not.toContain('rgba(0, 26, 65, 0.78)');
    expect(indexContent).not.toContain('rgba(0, 26, 65, 0.50)');
    expect(indexContent).toMatch(/rgba\(0,\s*26,\s*65,\s*0\.(2[5-9]|3[0-5])\)/);
    expect(indexContent).toContain('textShadowColor');
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

  it('enforces Outlier color tokens and dedicated primary CTA contrast tokens', () => {
    // Semantic amber text and accent tokens
    expect(obsidianDarkTokens.amber).toBe('#F7803C');
    expect(obsidianDarkTokens.amberHover).toBe('#FF8D4D');
    expect(obsidianLightTokens.amber).toBe('#C2410C');
    expect(obsidianLightTokens.amberHover).toBe('#9A3412');

    // Dedicated primary CTA tokens (brand navy #001A41 text on coral #F7803C fill)
    expect(obsidianDarkTokens.ctaFill).toBe('#F7803C');
    expect(obsidianDarkTokens.ctaText).toBe('#001A41');
    expect(obsidianDarkTokens.ctaPressed).toBe('#FF8D4D');
    expect(obsidianLightTokens.ctaFill).toBe('#F7803C');
    expect(obsidianLightTokens.ctaText).toBe('#001A41');
    expect(obsidianLightTokens.ctaPressed).toBe('#FF8D4D');

    // Light surfaces and borders reconciled to web Outlier rules
    expect(obsidianLightTokens.canvas).toBe('#F7F9FC');
    expect(obsidianLightTokens.card).toBe('#FFFFFF');
    expect(obsidianLightTokens.divider).toBe('#E2E8F0');
    expect(obsidianLightTokens.rule).toBe('#CBD5E1');
    expect(obsidianLightTokens.mainText).toBe('#001A41');
    expect(obsidianLightTokens.mutedText).toBe('#53647A');
    expect(obsidianLightTokens.strip).toBe('#001A41');
    expect(obsidianLightTokens.stripText).toBe('#D6E4F5');
  });

  it('enforces exact owner-approved native home headline without extra punctuation', () => {
    const indexContent = readMobileFile('app/index.tsx');
    expect(indexContent).toContain(
      'Book a skilled local or remote worker in minutes or find flexible work that pays what you are worth only on',
    );
    expect(indexContent).toContain('BukieBrainJobs</Text>');
    expect(indexContent).not.toContain('BukieBrainJobs.</Text>');
  });

  it('enforces title-case button labels and prohibits uppercase monospace labels on native home', () => {
    const indexContent = readMobileFile('app/index.tsx');
    expect(indexContent).not.toContain('>FIND A BRAINWORKER<');
    expect(indexContent).not.toContain('>BECOME A BRAINWORKER<');
    expect(indexContent).toContain('>Find a BrainWorker<');
    expect(indexContent).toContain('>Become a BrainWorker<');
    expect(indexContent).toContain('>Post a Job<');
  });

  it('enforces primary CTA uses dedicated ctaFill and ctaText with pill geometry', () => {
    const indexContent = readMobileFile('app/index.tsx');
    const findBtn = indexContent.match(/function FindWorkerButton\(\)[\s\S]*?\n}/)?.[0] ?? '';
    expect(findBtn).toContain('c.ctaFill');
    expect(findBtn).toContain('c.ctaText');
    expect(findBtn).not.toContain('c.amber');
    expect(indexContent).toContain('borderRadius: 9999');
  });

  it('aligns brand on left and theme toggle on right in home header', () => {
    const indexContent = readMobileFile('app/index.tsx');
    const brand = indexContent.match(/function Brand\(\)[\s\S]*?\n}/)?.[0] ?? '';
    expect(brand).toContain('brandLeft');
    expect(brand.indexOf('brandLeft')).toBeLessThan(brand.indexOf('ThemeToggle'));
  });

  it('enforces primary CTA and ghost action buttons consume pressed tokens', () => {
    const indexContent = readMobileFile('app/index.tsx');
    const findBtn = indexContent.match(/function FindWorkerButton\(\)[\s\S]*?\n}/)?.[0] ?? '';
    expect(findBtn).toContain('c.ctaPressed');
    expect(findBtn).toMatch(/const\s*\[pressed,\s*setPressed\]\s*=\s*(?:React\.)?useState\(false\)/);
    expect(findBtn).toContain('onPressIn={() => setPressed(true)}');
    expect(findBtn).toContain('onPressOut={() => setPressed(false)}');
    expect(findBtn, 'Pressable must use plain style, not a callback, to survive Expo Router Slot merging').not.toMatch(/style=\{\s*\(\s*\{\s*pressed/);
    expect(findBtn, 'Link asChild must not supply static style that masks child pressed style in Slot merging').not.toMatch(/<Link[^>]*style=/);
    expect(findBtn).toMatch(/backgroundColor:\s*pressed\s*\?\s*c\.ctaPressed\s*:\s*c\.ctaFill/);

    const registerBtn = indexContent.match(/function RegisterWorkerButton\(\)[\s\S]*?\n}/)?.[0] ?? '';
    expect(registerBtn).toContain('ghostPressed');
    expect(registerBtn).toMatch(/const\s*\[pressed,\s*setPressed\]\s*=\s*(?:React\.)?useState\(false\)/);
    expect(registerBtn).toContain('onPressIn={() => setPressed(true)}');
    expect(registerBtn).toContain('onPressOut={() => setPressed(false)}');
    expect(registerBtn, 'Register button Pressable must use plain style to survive Slot merging').not.toMatch(/style=\{\s*\(\s*\{\s*pressed/);
    expect(registerBtn, 'Register Link asChild must not supply static style').not.toMatch(/<Link[^>]*style=/);
    expect(registerBtn).toContain('pressed && s.ghostPressed');

    const postJobBtn = indexContent.match(/function PostJobButton\(\)[\s\S]*?\n}/)?.[0] ?? '';
    expect(postJobBtn).toContain('ghostPressed');
    expect(postJobBtn).toMatch(/const\s*\[pressed,\s*setPressed\]\s*=\s*(?:React\.)?useState\(false\)/);
    expect(postJobBtn).toContain('onPressIn={() => setPressed(true)}');
    expect(postJobBtn).toContain('onPressOut={() => setPressed(false)}');
    expect(postJobBtn, 'Post job button Pressable must use plain style to survive Slot merging').not.toMatch(/style=\{\s*\(\s*\{\s*pressed/);
    expect(postJobBtn, 'Post job Link asChild must not supply static style').not.toMatch(/<Link[^>]*style=/);
    expect(postJobBtn).toContain('pressed && s.ghostPressed');
  });

  it('enforces StyleSheet.flatten on Pressables inside Link asChild to prevent Slot style array crashes', () => {
    const indexContent = readMobileFile('app/index.tsx');

    const findBtn = indexContent.match(/function FindWorkerButton\(\)[\s\S]*?\n}/)?.[0] ?? '';
    expect(findBtn).toContain('<Link href="/(tabs)/services" asChild>');
    expect(findBtn).not.toMatch(/<Link[^>]*style=/);
    expect(findBtn).toMatch(/const\s*\[pressed,\s*setPressed\]\s*=\s*(?:React\.)?useState\(false\)/);
    expect(findBtn).toContain('onPressIn={() => setPressed(true)}');
    expect(findBtn).toContain('onPressOut={() => setPressed(false)}');
    expect(findBtn).toContain(
      'style={StyleSheet.flatten([s.button, { backgroundColor: pressed ? c.ctaPressed : c.ctaFill }])}',
    );

    const registerBtn = indexContent.match(/function RegisterWorkerButton\(\)[\s\S]*?\n}/)?.[0] ?? '';
    expect(registerBtn).toContain('<Link href="/brainworker/register" asChild>');
    expect(registerBtn).not.toMatch(/<Link[^>]*style=/);
    expect(registerBtn).toMatch(/const\s*\[pressed,\s*setPressed\]\s*=\s*(?:React\.)?useState\(false\)/);
    expect(registerBtn).toContain('onPressIn={() => setPressed(true)}');
    expect(registerBtn).toContain('onPressOut={() => setPressed(false)}');
    expect(registerBtn).toContain(
      'style={StyleSheet.flatten([s.button, s.ghost, pressed && s.ghostPressed])}',
    );

    const postJobBtn = indexContent.match(/function PostJobButton\(\)[\s\S]*?\n}/)?.[0] ?? '';
    expect(postJobBtn).toContain('<Link href="/post-job" asChild>');
    expect(postJobBtn).not.toMatch(/<Link[^>]*style=/);
    expect(postJobBtn).toMatch(/const\s*\[pressed,\s*setPressed\]\s*=\s*(?:React\.)?useState\(false\)/);
    expect(postJobBtn).toContain('onPressIn={() => setPressed(true)}');
    expect(postJobBtn).toContain('onPressOut={() => setPressed(false)}');
    expect(postJobBtn).toContain(
      'style={StyleSheet.flatten([s.button, s.ghost, pressed && s.ghostPressed])}',
    );
  });
});

// @ts-expect-error Node module available in Vitest test runner
import { readFileSync } from 'node:fs';
// @ts-expect-error Node module available in Vitest test runner
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

declare const __dirname: string;

const mobileRoot = resolve(__dirname, '..');
const readMobileFile = (path: string) => readFileSync(resolve(mobileRoot, path), 'utf8');

describe('THEME-001 native screen integration', () => {
  it('places one accessible toggle in the branded native home header', () => {
    const home = readMobileFile('app/index.tsx');
    const brand = home.match(/function Brand\(\)[\s\S]*?\n}/)?.[0] ?? '';

    expect(brand).toContain('<Image');
    expect(brand).toContain('ThemeToggle');
    expect(home).toContain('function ThemeToggle');
    expect(home).toContain('toggleThemeMode');
    expect(home).toContain('useThemeMode');
    expect(brand).toContain('accessibilityRole="button"');
    expect(brand).toContain('minWidth: 48');
    expect(brand).toContain('minHeight: 48');
  });

  it('uses the selected theme on all native routes and shared booking controls', () => {
    const routes = [
      'app/_layout.tsx',
      'app/(tabs)/_layout.tsx',
      'app/(tabs)/home.tsx',
      'app/(tabs)/services.tsx',
      'app/(tabs)/jobs.tsx',
      'app/(tabs)/messages.tsx',
      'app/(tabs)/profile.tsx',
      'app/services/[id].tsx',
      'components/form-kit.tsx',
    ];

    for (const path of routes) {
      expect(readMobileFile(path), `${path} should subscribe to theme changes`).toMatch(/useTrades|useThemeColors/);
    }
  });

  it('routes every native strip surface through strip foreground tokens', () => {
    const surfaces = [
      'app/index.tsx',
      'app/(tabs)/_layout.tsx',
      'app/(tabs)/home.tsx',
      'app/(tabs)/services.tsx',
      'app/(tabs)/jobs.tsx',
      'app/(tabs)/messages.tsx',
      'app/(tabs)/profile.tsx',
      'app/services/[id].tsx',
      'components/form-kit.tsx',
    ];

    for (const path of surfaces) {
      expect(readMobileFile(path), `${path} must map foregrounds for navy strip surfaces`)
        .toMatch(/getStrip(Text|Accent)Color/);
    }

    const home = readMobileFile('app/index.tsx');
    expect(home).toContain('getStripTextColor(c, c.textMain)');
    expect(home).toContain("getStripTextColor(c, '#FFFFFF')");
  });
});

import { describe, expect, it, vi } from 'vitest';

vi.mock('expo-router', () => {
  const pushMock = vi.fn();
  const backMock = vi.fn();
  const replaceMock = vi.fn();
  return {
    useRouter: () => ({ push: pushMock, back: backMock, replace: replaceMock }),
    useLocalSearchParams: vi.fn(() => ({ id: 'generator' })),
  };
});

vi.mock('@expo/vector-icons', () => ({
  Ionicons: () => null,
}));

vi.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: { children?: unknown }) => children ?? null,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { getStripAccentColor, getStripTextColor, obsidianDarkTokens, obsidianLightTokens } from '../lib/theme';

declare const __dirname: string;

describe('4.2.1 Native Public Discovery Integration & Screen Standards', () => {
  const mobileRoot = resolve(__dirname, '..');
  const readMobileFile = (relativePath: string) =>
    readFileSync(resolve(mobileRoot, relativePath), 'utf8');

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

  it('declares service detail route in RootLayout stack', () => {
    const layout = readMobileFile('app/_layout.tsx');
    expect(layout).toContain('<Stack.Screen name="services/[id]"');
  });

  it('preserves marketing homepage copy, routes service rows, and applies amber styling to primary CTA', () => {
    const home = readMobileFile('app/index.tsx');
    expect(home).toContain("router.push('/(tabs)/services')");
    expect(home).toContain('FEATURED_SERVICES');
    expect(home).toContain('Find a BrainWorker');
    expect(home).toContain('View all services');
    expect(home).toContain('{ backgroundColor: pressed ? c.ctaPressed : c.ctaFill }');
    expect(home).toContain('minHeight: 48');
    expect(home).toContain('minWidth: 48');
  });

  it('enforces 48dp minimum touch target for See all button on home screen', () => {
    const homeTab = readMobileFile('app/(tabs)/home.tsx');
    expect(homeTab).toContain('minHeight: 48');
    expect(homeTab).toContain('minWidth: 48');
  });

  it('ensures Services directory renders all 8 canonical services with accessible search and filter pills', () => {
    const services = readMobileFile('app/(tabs)/services.tsx');
    expect(services).toContain("from '../../lib/services'");
    expect(services).toContain('CANONICAL_SERVICES');
    expect(services).toContain('filterServices');
    expect(services).toContain("router.push(`/services/${");
    expect(services).toContain('No matching services found');
    expect(services).toContain('Power & Cooling');
    expect(services).toContain('Utilities & Structure');
    expect(services).toContain('Home & Lifestyle');
    expect(services).toContain('accessibilityLabel="Search services"');
    expect(services).toContain('accessibilityState={{ selected: active }}');
    expect(services).toContain('accessibilityLabel="Services list"');
    expect(services, 'Must not duplicate tab title in scroll content').not.toContain('Service Directory');
    // Slice 2 visual alignment contracts
    expect(services).toContain('isFocused');
    expect(services).toContain('onFocus');
    expect(services).toContain('onBlur');
    expect(services).toContain('item.icon');
    expect(services).toContain('borderRadius: 9999');
    expect(services).toContain('cardHover');
  });

  it('uses strip-safe foregrounds for Services filters and preview labels', () => {
    const services = readMobileFile('app/(tabs)/services.tsx');

    expect(services).toContain('getStripTextColor(c, c.mainText)');
    expect(services).toContain('color: active ? c.card : getStripTextColor(c, c.mainText)');
    expect(services).toContain('getStripAccentColor(c, c.amber)');
  });

  it('enforces theme-safe filter pill active boundary and label contrast', () => {
    const services = readMobileFile('app/(tabs)/services.tsx');
    const pillMatch = services.match(/function FilterPillItem[\s\S]*?\n\}/);
    expect(pillMatch).not.toBeNull();
    const pillCode = pillMatch![0];
    expect(pillCode).toContain("backgroundColor: active ? c.amber : pressed ? (c.mode === 'light' ? c.strip : c.cardHover) : c.strip");
    expect(pillCode).toContain("borderColor: active ? c.amber : pressed ? (c.mode === 'light' ? c.stripAccent : c.mutedText) : (c.mode === 'light' ? c.divider : getStripTextColor(c, c.mutedText))");
    expect(pillCode).toContain('color: active ? c.card : getStripTextColor(c, c.mainText)');

    expect(contrast(toRgb(obsidianLightTokens.amber), toRgb(obsidianLightTokens.canvas))).toBeGreaterThanOrEqual(3.0);
    expect(contrast(toRgb(obsidianDarkTokens.amber), toRgb(obsidianDarkTokens.canvas))).toBeGreaterThanOrEqual(3.0);
    expect(contrast(toRgb(obsidianLightTokens.card), toRgb(obsidianLightTokens.amber))).toBeGreaterThanOrEqual(4.5);
    expect(contrast(toRgb(obsidianDarkTokens.card), toRgb(obsidianDarkTokens.amber))).toBeGreaterThanOrEqual(4.5);
  });

  it('enforces theme-safe filter pill inactive and pressed contrast', () => {
    expect(contrast(toRgb(obsidianLightTokens.divider), toRgb(obsidianLightTokens.strip))).toBeGreaterThanOrEqual(3.0);
    const darkDefaultStripBorder = getStripTextColor(obsidianDarkTokens, obsidianDarkTokens.mutedText);
    expect(contrast(toRgb(darkDefaultStripBorder), toRgb(obsidianDarkTokens.strip))).toBeGreaterThanOrEqual(3.0);
    expect(contrast(toRgb(obsidianLightTokens.stripAccent), toRgb(obsidianLightTokens.strip))).toBeGreaterThanOrEqual(3.0);
    expect(contrast(toRgb(obsidianDarkTokens.mutedText), toRgb(obsidianDarkTokens.cardHover))).toBeGreaterThanOrEqual(3.0);

    const lightStripFg = getStripTextColor(obsidianLightTokens, obsidianLightTokens.mainText);
    expect(contrast(toRgb(lightStripFg), toRgb(obsidianLightTokens.strip))).toBeGreaterThanOrEqual(4.5);
    const darkStripFg = getStripTextColor(obsidianDarkTokens, obsidianDarkTokens.mainText);
    expect(contrast(toRgb(darkStripFg), toRgb(obsidianDarkTokens.strip))).toBeGreaterThanOrEqual(4.5);
    expect(contrast(toRgb(darkStripFg), toRgb(obsidianDarkTokens.cardHover))).toBeGreaterThanOrEqual(4.5);
  });

  it('enforces theme-safe search input boundary contrast against card and canvas', () => {
    const services = readMobileFile('app/(tabs)/services.tsx');
    const searchMatch = services.match(/function ServicesSearchInput[\s\S]*?\n\}/);
    expect(searchMatch).not.toBeNull();
    const searchCode = searchMatch![0];
    expect(searchCode).toContain('backgroundColor: c.card');
    expect(searchCode).toContain('borderColor: isFocused ? c.amber : c.mutedText');

    expect(contrast(toRgb(obsidianLightTokens.mutedText), toRgb(obsidianLightTokens.card))).toBeGreaterThanOrEqual(3.0);
    expect(contrast(toRgb(obsidianLightTokens.mutedText), toRgb(obsidianLightTokens.canvas))).toBeGreaterThanOrEqual(3.0);
    expect(contrast(toRgb(obsidianDarkTokens.mutedText), toRgb(obsidianDarkTokens.card))).toBeGreaterThanOrEqual(3.0);
    expect(contrast(toRgb(obsidianDarkTokens.mutedText), toRgb(obsidianDarkTokens.canvas))).toBeGreaterThanOrEqual(3.0);

    expect(contrast(toRgb(obsidianLightTokens.amber), toRgb(obsidianLightTokens.card))).toBeGreaterThanOrEqual(3.0);
    expect(contrast(toRgb(obsidianLightTokens.amber), toRgb(obsidianLightTokens.canvas))).toBeGreaterThanOrEqual(3.0);
    expect(contrast(toRgb(obsidianDarkTokens.amber), toRgb(obsidianDarkTokens.card))).toBeGreaterThanOrEqual(3.0);
    expect(contrast(toRgb(obsidianDarkTokens.amber), toRgb(obsidianDarkTokens.canvas))).toBeGreaterThanOrEqual(3.0);
  });

  it('enforces theme-safe reset button contrast in empty state', () => {
    const services = readMobileFile('app/(tabs)/services.tsx');
    const emptyMatch = services.match(/function ServicesEmptyState[\s\S]*?\n\}/);
    expect(emptyMatch).not.toBeNull();
    const emptyCode = emptyMatch![0];
    expect(emptyCode).toContain("backgroundColor: pressed ? (c.mode === 'light' ? c.strip : c.cardHover) : c.strip");
    expect(emptyCode).toContain("borderColor: pressed ? (c.mode === 'light' ? c.stripAccent : c.mutedText) : (c.mode === 'light' ? c.divider : getStripTextColor(c, c.mutedText))");
    expect(emptyCode).toContain('color: getStripAccentColor(c, c.amber)');

    expect(contrast(toRgb(obsidianLightTokens.divider), toRgb(obsidianLightTokens.strip))).toBeGreaterThanOrEqual(3.0);
    const darkDefaultBorder = getStripTextColor(obsidianDarkTokens, obsidianDarkTokens.mutedText);
    expect(contrast(toRgb(darkDefaultBorder), toRgb(obsidianDarkTokens.strip))).toBeGreaterThanOrEqual(3.0);
    expect(contrast(toRgb(obsidianLightTokens.stripAccent), toRgb(obsidianLightTokens.strip))).toBeGreaterThanOrEqual(3.0);
    expect(contrast(toRgb(obsidianDarkTokens.mutedText), toRgb(obsidianDarkTokens.cardHover))).toBeGreaterThanOrEqual(3.0);

    const lightResetFg = getStripAccentColor(obsidianLightTokens, obsidianLightTokens.amber);
    expect(contrast(toRgb(lightResetFg), toRgb(obsidianLightTokens.strip))).toBeGreaterThanOrEqual(4.5);
    const darkResetFg = getStripAccentColor(obsidianDarkTokens, obsidianDarkTokens.amber);
    expect(contrast(toRgb(darkResetFg), toRgb(obsidianDarkTokens.strip))).toBeGreaterThanOrEqual(4.5);
    expect(contrast(toRgb(darkResetFg), toRgb(obsidianDarkTokens.cardHover))).toBeGreaterThanOrEqual(4.5);
  });

  it('source-binds detail back control boundaries and state-aware foreground', () => {
    const detail = readMobileFile('app/services/[id].tsx');
    const headerMatch = detail.match(/function ServiceDetailHeader[\s\S]*?\n\}/);
    expect(headerMatch).not.toBeNull();
    const headerCode = headerMatch![0];
    expect(headerCode).toContain('backgroundColor: pressed ? c.cardHover : c.strip');
    expect(headerCode).toContain("borderColor: pressed ? c.mutedText : (c.mode === 'light' ? c.divider : getStripTextColor(c, c.mutedText))");
    expect(headerCode).toMatch(/pressed\s*&&\s*c\.mode\s*===\s*'light'\s*\?\s*c\.mainText\s*:\s*getStripTextColor\(c,\s*c\.mainText\)/);

    const notFoundMatch = detail.match(/function ServiceNotFoundView[\s\S]*?\n\}/);
    expect(notFoundMatch).not.toBeNull();
    const notFoundCode = notFoundMatch![0];
    expect(notFoundCode).toContain('backgroundColor: pressed ? c.cardHover : c.strip');
    expect(notFoundCode).toContain("borderColor: pressed ? c.mutedText : (c.mode === 'light' ? c.divider : getStripTextColor(c, c.mutedText))");
    expect(notFoundCode).toMatch(/pressed\s*&&\s*c\.mode\s*===\s*'light'\s*\?\s*c\.mainText\s*:\s*getStripTextColor\(c,\s*c\.mainText\)/);
  });

  it('enforces theme-safe detail back control boundary and foreground contrast across states', () => {
    expect(contrast(toRgb(obsidianLightTokens.divider), toRgb(obsidianLightTokens.strip))).toBeGreaterThanOrEqual(3.0);
    const darkDefaultBorder = getStripTextColor(obsidianDarkTokens, obsidianDarkTokens.mutedText);
    expect(contrast(toRgb(darkDefaultBorder), toRgb(obsidianDarkTokens.strip))).toBeGreaterThanOrEqual(3.0);
    expect(contrast(toRgb(obsidianLightTokens.mutedText), toRgb(obsidianLightTokens.cardHover))).toBeGreaterThanOrEqual(3.0);
    expect(contrast(toRgb(obsidianDarkTokens.mutedText), toRgb(obsidianDarkTokens.cardHover))).toBeGreaterThanOrEqual(3.0);

    const lightStripFg = getStripTextColor(obsidianLightTokens, obsidianLightTokens.mainText);
    const darkStripFg = getStripTextColor(obsidianDarkTokens, obsidianDarkTokens.mainText);
    expect(contrast(toRgb(lightStripFg), toRgb(obsidianLightTokens.strip))).toBeGreaterThanOrEqual(4.5);
    expect(contrast(toRgb(obsidianLightTokens.mainText), toRgb(obsidianLightTokens.cardHover))).toBeGreaterThanOrEqual(4.5);
    expect(contrast(toRgb(darkStripFg), toRgb(obsidianDarkTokens.strip))).toBeGreaterThanOrEqual(4.5);
    expect(contrast(toRgb(darkStripFg), toRgb(obsidianDarkTokens.cardHover))).toBeGreaterThanOrEqual(4.5);
  });

  it('ensures Service Detail screen protects safe area, renders catalog examples, and handles not-found state', () => {
    const detail = readMobileFile('app/services/[id].tsx');
    expect(detail).toContain("from 'react-native-safe-area-context'");
    expect(detail).toContain("from '../../lib/services'");
    expect(detail).toContain('getServiceById');
    expect(detail).toContain('Service Not Found');
    expect(detail).toContain('Examples in this local catalog');
    expect(detail).not.toContain('Common Tasks Covered');
    expect(detail).not.toContain('Coverage Locations');
    expect(detail).not.toContain('Service Coverage Areas');
    expect(detail).toContain('router.back()');
    expect(detail).toContain('This preview does not include live service booking');
    // Slice 2 visual alignment contracts: pill CTA with Outlier tokens
    expect(detail).toContain('c.ctaFill');
    expect(detail).toContain('c.ctaText');
    expect(detail).toContain('c.ctaPressed');
    expect(detail).toContain('tasksCard');
    expect(detail).toContain('minHeight: 48');
    expect(detail).toContain('minWidth: 48');
  });

  it('prohibits fabricated prices and ratings across discovery screens', () => {
    const discoveryScreens = [
      'app/index.tsx',
      'app/(tabs)/services.tsx',
      'app/services/[id].tsx',
    ];

    for (const screen of discoveryScreens) {
      const content = readMobileFile(screen);
      expect(content, `Found star rating in ${screen}`).not.toContain('4.9');
      expect(content, `Found invented count 142 in ${screen}`).not.toContain('142');
      expect(content, `Found invented count 98 in ${screen}`).not.toContain('98');
      expect(content, `Found invented count 115 in ${screen}`).not.toContain('115');
      expect(content, `Found fake price in ${screen}`).not.toContain('₦10,000');
      expect(content, `Found fake price in ${screen}`).not.toContain('₦12,000');
      expect(content, `Found unverified claim across Nigeria in ${screen}`).not.toContain('across Nigeria');
    }
  });
});

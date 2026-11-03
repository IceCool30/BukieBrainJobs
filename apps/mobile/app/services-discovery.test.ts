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

declare const __dirname: string;

describe('4.2.1 Native Public Discovery Integration & Screen Standards', () => {
  const mobileRoot = resolve(__dirname, '..');
  const readMobileFile = (relativePath: string) =>
    readFileSync(resolve(mobileRoot, relativePath), 'utf8');

  it('declares service detail route in RootLayout stack', () => {
    const layout = readMobileFile('app/_layout.tsx');
    expect(layout).toContain('<Stack.Screen name="services/[id]"');
  });

  it('preserves marketing homepage copy, routes service rows, and applies amber styling to primary CTA', () => {
    const home = readMobileFile('app/index.tsx');
    expect(home).toContain("router.push('/(tabs)/services')");
    expect(home).toContain('FEATURED_SERVICES');
    expect(home).toContain('FIND A BRAINWORKER');
    expect(home).toContain('View all services');
    expect(home).toContain('StyleSheet.flatten([s.button, { backgroundColor: c.amber }])');
    expect(home).toContain('minHeight: 48');
    expect(home).toContain('minWidth: 48');
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
  });

  it('uses strip-safe foregrounds for Services filters and preview labels', () => {
    const services = readMobileFile('app/(tabs)/services.tsx');

    expect(services).toContain('getStripTextColor(c, c.mainText)');
    expect(services).toContain('color: active ? c.card : getStripTextColor(c, c.mainText)');
    expect(services).toContain('getStripAccentColor(c, c.amber)');
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

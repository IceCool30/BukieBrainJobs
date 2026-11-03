import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

declare const __dirname: string;

const mobileRoot = resolve(__dirname, '..');
const readMobileFile = (path: string) => readFileSync(resolve(mobileRoot, path), 'utf8');

describe('MOB-BOOK-001 native booking preparation', () => {
  it('registers /book and passes the selected catalog service from detail', () => {
    const layout = readMobileFile('app/_layout.tsx');
    const detail = readMobileFile('app/services/[id].tsx');

    expect(layout).toContain('<Stack.Screen name="book"');
    expect(detail).toContain("pathname: '/book'");
    expect(detail).toContain('serviceId: service.id');
    expect(detail).toContain('Prepare booking request');
  });

  it('uses existing catalog, shared validation, and local-preview submission', () => {
    const screen = readMobileFile('app/book.tsx');

    expect(screen).toContain('CANONICAL_SERVICES');
    expect(screen).toContain('normalizeServiceId');
    expect(screen).toContain('validateBookingPreparation');
    expect(screen).toContain('submitBookingPreparationRequest');
    expect(screen).toContain('mockError');
    expect(screen).toContain('FormScreen');
  });

  it('covers all WEB-007 preparation sections and schedule choices', () => {
    const screen = readMobileFile('app/book.tsx');
    const booking = readMobileFile('lib/booking-preparation.ts');

    for (const copy of ['City', 'Street address', 'Landmark', 'Today', 'Tomorrow', 'Weekend', 'Choose a date']) {
      expect(screen).toContain(copy);
    }
    expect(screen).toContain('ARRIVAL_WINDOWS');
    expect(screen).toContain('PAYMENT_PREFERENCES');
    for (const copy of ['Morning', 'Afternoon', 'Evening', 'Card', 'Bank transfer', 'USSD']) {
      expect(booking).toContain(copy);
    }
    expect(screen).toContain('No payment is taken here');
  });

  it('has truthful retry and confirmation states with accessible controls', () => {
    const screen = readMobileFile('app/book.tsx');

    expect(screen).toContain('Try again');
    expect(screen).toContain('No booking was created');
    expect(screen).toContain('No BrainWorker was assigned');
    expect(screen).toContain('ErrorSummary');
    expect(screen).toContain('accessibilityRole');
    expect(screen).toContain('accessibilityState={{ selected: active }}');
    expect(screen).toMatch(/minHeight:\s*48/);
  });

  it('focuses the first invalid booking control through native accessibility focus', () => {
    const screen = readMobileFile('app/book.tsx');
    const formKit = readMobileFile('components/form-kit.tsx');

    expect(screen).toContain('focusFirstInvalidBookingControl(');
    expect(screen).toContain('AccessibilityInfo.setAccessibilityFocus(');
    expect(screen).toContain('findNodeHandle(');
    expect(screen).toContain('focusRef');
    expect(formKit).toContain('focusRef');
  });

  it('focuses a focusable heading after successful local preview', () => {
    const screen = readMobileFile('app/book.tsx');

    expect(screen).toContain('resultHeadingRef');
    expect(screen).toContain('focusable');
    expect(screen).toContain('accessibilityRole="header"');
    expect(screen).toContain('AccessibilityInfo.setAccessibilityFocus(');
  });

  it('uses strip-aware foregrounds in shared form headers and preview notices', () => {
    const formKit = readMobileFile('components/form-kit.tsx');

    expect(formKit).toContain('getStripTextColor(c, c.mainText)');
    expect(formKit).toContain('getStripAccentColor(c, c.amber)');
  });
});

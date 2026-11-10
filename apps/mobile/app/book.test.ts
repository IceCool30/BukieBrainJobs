import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { obsidianDarkTokens, obsidianLightTokens, type MobileThemeTokens } from '../lib/theme';

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

  it('aligns form kit and booking visual tokens with Outlier ctaFill and focus states', () => {
    const formKit = readMobileFile('components/form-kit.tsx');
    const book = readMobileFile('app/book.tsx');

    expect(formKit).toContain('c.ctaFill');
    expect(formKit).toContain('c.ctaText');
    expect(formKit).toContain('isFocused');
    expect(formKit).toContain('c.ctaFill');
    expect(formKit).toContain('c.ctaText');
    expect(book).toContain('serviceChoice');
    expect(book).toContain('c.ctaFill');
  });

  type Rgb = { r: number; g: number; b: number };

  const toRgb = (hex: string): Rgb => {
    const n = parseInt(hex.replace('#', ''), 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  };

  const composite = (fg: Rgb, bg: Rgb, a: number): Rgb => ({
    r: Math.round(fg.r * a + bg.r * (1 - a)),
    g: Math.round(fg.g * a + bg.g * (1 - a)),
    b: Math.round(fg.b * a + bg.b * (1 - a)),
  });

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

  const getDisabledOpacity = (code: string): number => {
    const match = code.match(/opacity:\s*disabled\s*\?\s*([0-9.]+)/);
    return match ? parseFloat(match[1]) : 1;
  };

  const getDisabledToken = (code: string, prop: 'backgroundColor' | 'color', fallback: keyof MobileThemeTokens): keyof MobileThemeTokens => {
    const line = code.match(new RegExp(`${prop}:\\s*([^}\\n]+)`))?.[1] ?? '';
    const match = line.match(/disabled\s*\?\s*c\.([a-zA-Z0-9_]+)/) ?? line.match(/c\.([a-zA-Z0-9_]+)/);
    return (match?.[1] as keyof MobileThemeTokens) ?? fallback;
  };

  it('enforces accessible PrimaryButton disabled contrast in dark and light themes and non-mono typography', () => {
    const formKit = readMobileFile('components/form-kit.tsx');
    const buttonCode = formKit.match(/export function PrimaryButton[\s\S]*?\n\}/)?.[0] ?? '';
    expect(buttonCode).toContain('backgroundColor: disabled ? c.rule : pressed ? c.ctaPressed : c.ctaFill');
    expect(buttonCode).toContain('color: disabled ? c.mainText : c.ctaText');

    const opacity = getDisabledOpacity(buttonCode);
    const bgKey = getDisabledToken(buttonCode, 'backgroundColor', 'rule');
    const textKey = getDisabledToken(buttonCode, 'color', 'ctaText');

    for (const tokens of [obsidianDarkTokens, obsidianLightTokens]) {
      const bg = composite(toRgb(tokens[bgKey] as string), toRgb(tokens.canvas), opacity);
      const fg = composite(toRgb(tokens[textKey] as string), toRgb(tokens.canvas), opacity);
      expect(contrast(fg, bg)).toBeGreaterThanOrEqual(4.5);
    }

    const textStyle = formKit.match(/primaryButtonText:\s*\{([\s\S]*?)\}/)?.[1] ?? '';
    expect(textStyle).not.toContain('mono');
  });
});

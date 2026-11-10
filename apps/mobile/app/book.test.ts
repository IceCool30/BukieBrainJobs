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

  it('source-binds ServiceChoice selected fill, border logic, and pressed opacity', () => {
    const bookContent = readMobileFile('app/book.tsx');
    const choiceMatch = bookContent.match(/function ServiceChoice[\s\S]*?(?=\nfunction ServiceSection)/);
    expect(choiceMatch).not.toBeNull();
    const choiceCode = choiceMatch![0];

    expect(choiceCode).toContain('backgroundColor: active ? c.cardHover : pressed ? c.cardHover : c.card');
    expect(choiceCode).toMatch(/borderColor:\s*active\s*\?\s*\(?c\.mode\s*===\s*'light'\s*\?\s*c\.amber\s*:\s*c\.ctaFill\)?\s*:\s*(?:pressed\s*\?\s*c\.rule\s*:\s*c\.divider|c\.mutedText)/);
    expect(choiceCode).toContain('opacity: pressed ? 0.9 : 1');
  });

  it('enforces theme-safe ServiceChoice border contrast against fill and canvas across states', () => {
    const lightBorder = obsidianLightTokens.amber;
    expect(contrast(toRgb(lightBorder), toRgb(obsidianLightTokens.cardHover))).toBeGreaterThanOrEqual(3.0);
    expect(contrast(toRgb(lightBorder), toRgb(obsidianLightTokens.canvas))).toBeGreaterThanOrEqual(3.0);

    const darkBorder = obsidianDarkTokens.ctaFill;
    expect(contrast(toRgb(darkBorder), toRgb(obsidianDarkTokens.cardHover))).toBeGreaterThanOrEqual(3.0);
    expect(contrast(toRgb(darkBorder), toRgb(obsidianDarkTokens.canvas))).toBeGreaterThanOrEqual(3.0);

    const lightPressedFill = composite(toRgb(obsidianLightTokens.cardHover), toRgb(obsidianLightTokens.canvas), 0.9);
    const lightPressedBorder = composite(toRgb(lightBorder), toRgb(obsidianLightTokens.canvas), 0.9);
    expect(contrast(lightPressedBorder, lightPressedFill)).toBeGreaterThanOrEqual(3.0);
    expect(contrast(lightPressedBorder, toRgb(obsidianLightTokens.canvas))).toBeGreaterThanOrEqual(3.0);

    const darkPressedFill = composite(toRgb(obsidianDarkTokens.cardHover), toRgb(obsidianDarkTokens.canvas), 0.9);
    const darkPressedBorder = composite(toRgb(darkBorder), toRgb(obsidianDarkTokens.canvas), 0.9);
    expect(contrast(darkPressedBorder, darkPressedFill)).toBeGreaterThanOrEqual(3.0);
    expect(contrast(darkPressedBorder, toRgb(obsidianDarkTokens.canvas))).toBeGreaterThanOrEqual(3.0);
  });

  function assertInactiveBorderContrasts(choiceCode: string) {
    const borderMatch = choiceCode.match(/borderColor:\s*active\s*\?\s*\(.*?\)\s*:\s*(?:pressed\s*\?\s*c\.([a-zA-Z0-9_]+)\s*:\s*c\.([a-zA-Z0-9_]+)|c\.([a-zA-Z0-9_]+))/);
    expect(borderMatch).not.toBeNull();
    const pressedToken = (borderMatch![1] ?? borderMatch![3]) as keyof typeof obsidianLightTokens;
    const defaultToken = (borderMatch![2] ?? borderMatch![3]) as keyof typeof obsidianLightTokens;

    expect(contrast(toRgb(obsidianLightTokens[defaultToken] as string), toRgb(obsidianLightTokens.card))).toBeGreaterThanOrEqual(3.0);
    expect(contrast(toRgb(obsidianDarkTokens[defaultToken] as string), toRgb(obsidianDarkTokens.card))).toBeGreaterThanOrEqual(3.0);

    const lightPressedBorder = composite(toRgb(obsidianLightTokens[pressedToken] as string), toRgb(obsidianLightTokens.canvas), 0.9);
    const lightPressedBg = composite(toRgb(obsidianLightTokens.cardHover), toRgb(obsidianLightTokens.canvas), 0.9);
    expect(contrast(lightPressedBorder, lightPressedBg)).toBeGreaterThanOrEqual(3.0);

    const darkPressedBorder = composite(toRgb(obsidianDarkTokens[pressedToken] as string), toRgb(obsidianDarkTokens.canvas), 0.9);
    const darkPressedBg = composite(toRgb(obsidianDarkTokens.cardHover), toRgb(obsidianDarkTokens.canvas), 0.9);
    expect(contrast(darkPressedBorder, darkPressedBg)).toBeGreaterThanOrEqual(3.0);
  }

  function extractActiveLabelTokens(choiceCode: string) {
    const pressableChildMatch = choiceCode.match(/<Pressable\b[\s\S]*?>\s*(\{\(\{\s*pressed\s*\}\)\s*=>[\s\S]*?)\s*<\/Pressable>/);
    expect(pressableChildMatch).not.toBeNull();
    const pressableChild = pressableChildMatch![1];
    expect(pressableChild.trim()).toMatch(/^\{\(\{\s*pressed\s*\}\)\s*=>/);

    const textMatch = pressableChild.match(/<Text[\s\S]*?style=\{[\s\S]*?(color:\s*[\s\S]*?)\}[^>]*?>[\s\S]*?\{service\.title\}[\s\S]*?<\/Text>/);
    expect(textMatch).not.toBeNull();
    const activeColorMatch = textMatch![1].match(/color:\s*active\s*\?\s*([\s\S]*?)\s*:\s*c\.mainText/);
    expect(activeColorMatch).not.toBeNull();
    const modeMatch = activeColorMatch![1].trim().replace(/^\(|\)$/g, '').match(/c\.mode\s*===\s*'light'\s*\?\s*([\s\S]*?)\s*:\s*c\.([a-zA-Z0-9_]+)\s*$/);
    expect(modeMatch).not.toBeNull();

    const lightExpr = modeMatch![1].trim().replace(/^\(|\)$/g, '');
    const pressedTernary = lightExpr.match(/pressed\s*\?\s*c\.([a-zA-Z0-9_]+)\s*:\s*c\.([a-zA-Z0-9_]+)/);
    const single = lightExpr.match(/c\.([a-zA-Z0-9_]+)/);
    return {
      lightPressed: (pressedTernary ? pressedTernary[1] : single![1]) as keyof typeof obsidianLightTokens,
      lightDefault: (pressedTernary ? pressedTernary[2] : single![1]) as keyof typeof obsidianLightTokens,
      darkToken: modeMatch![2] as keyof typeof obsidianDarkTokens,
    };
  }

  function assertActiveLabelContrasts(tokens: { lightPressed: keyof typeof obsidianLightTokens; lightDefault: keyof typeof obsidianLightTokens; darkToken: keyof typeof obsidianDarkTokens }) {
    expect(contrast(toRgb(obsidianLightTokens[tokens.lightDefault] as string), toRgb(obsidianLightTokens.cardHover))).toBeGreaterThanOrEqual(4.5);
    expect(contrast(toRgb(obsidianDarkTokens[tokens.darkToken] as string), toRgb(obsidianDarkTokens.cardHover))).toBeGreaterThanOrEqual(4.5);

    const lightPressedLabel = composite(toRgb(obsidianLightTokens[tokens.lightPressed] as string), toRgb(obsidianLightTokens.canvas), 0.9);
    const lightPressedBg = composite(toRgb(obsidianLightTokens.cardHover), toRgb(obsidianLightTokens.canvas), 0.9);
    expect(contrast(lightPressedLabel, lightPressedBg)).toBeGreaterThanOrEqual(4.5);

    const darkPressedLabel = composite(toRgb(obsidianDarkTokens[tokens.darkToken] as string), toRgb(obsidianDarkTokens.canvas), 0.9);
    const darkPressedBg = composite(toRgb(obsidianDarkTokens.cardHover), toRgb(obsidianDarkTokens.canvas), 0.9);
    expect(contrast(darkPressedLabel, darkPressedBg)).toBeGreaterThanOrEqual(4.5);
  }

  it('enforces theme-safe inactive boundary and active label contrast across default and pressed states', () => {
    const choiceMatch = readMobileFile('app/book.tsx').match(/function ServiceChoice[\s\S]*?(?=\nfunction ServiceSection)/);
    expect(choiceMatch).not.toBeNull();
    const choiceCode = choiceMatch![0];

    expect(choiceCode).toMatch(/borderColor:\s*active\s*\?\s*\(?c\.mode\s*===\s*'light'\s*\?\s*c\.amber\s*:\s*c\.ctaFill\)?/);
    expect(choiceCode).toContain('opacity: pressed ? 0.9 : 1');

    assertInactiveBorderContrasts(choiceCode);

    const tokens = extractActiveLabelTokens(choiceCode);
    expect(tokens.lightDefault).toBe('amber');
    expect(tokens.lightPressed).toBe('amberHover');
    expect(tokens.darkToken).toBe('ctaFill');

    assertActiveLabelContrasts(tokens);
  });
});

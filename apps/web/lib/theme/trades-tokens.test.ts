import { describe, expect, it } from 'vitest';
import { tradesColorTokens, brandColors, tailwindBrandTheme, TradesColors } from '@bukiebrainjobs/ui';
import { TradesColors as TradesColorsFromSubpath } from '@bukiebrainjobs/ui/src/colors';

describe('BukieBrainJobs Trades Design System Tokens', () => {
  it('defines both light and dark mode color palettes', () => {
    expect(tradesColorTokens).toHaveProperty('light');
    expect(tradesColorTokens).toHaveProperty('dark');
  });

  it('matches approved Architectural Light mode token values exactly', () => {
    const light = tradesColorTokens.light;
    expect(light.bg).toBe('#F7F9FC');
    expect(light.cardBg).toBe('#FFFFFF');
    expect(light.cardHover).toBe('#F2F5FB');
    expect(light.lead).toBe('#E2E8F0');
    expect(light.rule).toBe('#CBD5E1');
    expect(light.textMain).toBe('#001A41');
    expect(light.textMuted).toBe('#53647A');
    expect(light.amber).toBe('#FF6B35');
    expect(light.amberHover).toBe('#F15A24');
    expect(light.brandGreen).toBe('#10B981');
    expect(light.stripBg).toBe('#001A41');
    expect(light.stripText).toBe('#D6E4F5');
    expect(light.tableHeaderBg).toBe('#EEF4FB');
    expect(light.tagBg).toBe('#F1F5F9');
    expect(light.dispatchBg).toContain('linear-gradient');
  });

  it('matches approved Obsidian Titanium Dark mode token values exactly', () => {
    const dark = tradesColorTokens.dark;
    expect(dark.bg).toBe('#0B0E13');
    expect(dark.cardBg).toBe('#13171E');
    expect(dark.cardHover).toBe('#191E27');
    expect(dark.lead).toBe('#202734');
    expect(dark.rule).toBe('#2D3748');
    expect(dark.textMain).toBe('#F0F4F9');
    expect(dark.textMuted).toBe('#8897AB');
    expect(dark.amber).toBe('#FF6B35');
    expect(dark.amberHover).toBe('#FF7D4D');
    expect(dark.brandGreen).toBe('#2FE896');
    expect(dark.stripBg).toBe('#07090D');
    expect(dark.stripText).toBe('#9FB2C8');
    expect(dark.tableHeaderBg).toBe('#0F131A');
    expect(dark.tagBg).toBe('rgba(255, 255, 255, 0.04)');
    expect(dark.dispatchBg).toContain('linear-gradient');
  });

  it('preserves existing brand colors while attaching trades tokens', () => {
    expect(brandColors.navy.DEFAULT).toBe('#001A41');
    expect(brandColors.emerald.DEFAULT).toBe('#296A4B');
    expect(brandColors.amber.DEFAULT).toBe('#F59E0B');
    expect(brandColors.trades).toEqual(tradesColorTokens);
  });

  it('exports TradesColors directly from @bukiebrainjobs/ui and matches subpath export', () => {
    expect(TradesColors).toEqual(tradesColorTokens);
    expect(TradesColorsFromSubpath).toEqual(tradesColorTokens);
  });

  it('updates tailwindBrandTheme typography and tracking with Cabinet Grotesk alongside Hanken Grotesk', () => {
    const typography = tailwindBrandTheme.fontFamily;
    expect(typography.headline).toContain('Cabinet Grotesk');
    expect(typography.headline).toContain('Hanken Grotesk');
    expect(typography.display).toContain('Cabinet Grotesk');
    expect(typography.mono).toContain('JetBrains Mono');
    expect(typography.sans).toContain('Inter');
    expect(tailwindBrandTheme.letterSpacing.trades).toBe('-0.04em');
  });
});

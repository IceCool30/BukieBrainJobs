import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { obsidianDarkTokens, obsidianLightTokens } from '../lib/theme';

declare const __dirname: string;

const mobileRoot = resolve(__dirname, '..');
const readMobileFile = (path: string) => readFileSync(resolve(mobileRoot, path), 'utf8');

type Rgb = { r: number; g: number; b: number };

const toRgb = (hex: string): Rgb => {
  const clean = hex.replace('#', '');
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16),
  };
};

const toLinear = (v: number): number => {
  const s = v / 255;
  return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
};

const luminance = (c: Rgb): number =>
  toLinear(c.r) * 0.2126 + toLinear(c.g) * 0.7152 + toLinear(c.b) * 0.0722;

const contrastRatio = (c1: Rgb, c2: Rgb): number => {
  const l1 = luminance(c1);
  const l2 = luminance(c2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
};

const blendRgb = (fg: Rgb, bg: Rgb, alpha: number): Rgb => ({
  r: Math.round(fg.r * alpha + bg.r * (1 - alpha)),
  g: Math.round(fg.g * alpha + bg.g * (1 - alpha)),
  b: Math.round(fg.b * alpha + bg.b * (1 - alpha)),
});

function getChoiceChipSource(): string {
  const formKit = readMobileFile('components/form-kit.tsx');
  const chipMatch = formKit.match(/function ChoiceChip[\s\S]*?\n\}/);
  expect(chipMatch).not.toBeNull();
  return chipMatch![0];
}

function getSelectedBorderHex(mode: 'light' | 'dark'): string {
  const chipCode = getChoiceChipSource();
  const borderMatch = chipCode.match(/const activeBorder = colors\.mode === 'light' \? colors\.(\w+) : colors\.(\w+);/);
  expect(borderMatch).not.toBeNull();
  const tokenKey = (mode === 'light' ? borderMatch![1] : borderMatch![2]) as keyof typeof obsidianLightTokens;
  const tokens = mode === 'light' ? obsidianLightTokens : obsidianDarkTokens;
  return tokens[tokenKey];
}

function getInactiveBorderToken(tokens: typeof obsidianDarkTokens | typeof obsidianLightTokens): string {
  const chipCode = getChoiceChipSource();
  expect(chipCode).toContain('colors.mutedText');
  return tokens.mutedText;
}

function assertSelectedLightContrast() {
  const card = toRgb(obsidianLightTokens.card);
  const fill = toRgb(obsidianLightTokens.ctaFill);
  const border = toRgb(getSelectedBorderHex('light'));

  expect(contrastRatio(border, card)).toBeGreaterThanOrEqual(3.0);
  expect(contrastRatio(border, fill)).toBeGreaterThanOrEqual(3.0);

  const pressedBorder = blendRgb(border, card, 0.9);
  const pressedFill = blendRgb(fill, card, 0.9);
  expect(contrastRatio(pressedBorder, card)).toBeGreaterThanOrEqual(3.0);
  expect(contrastRatio(pressedBorder, pressedFill)).toBeGreaterThanOrEqual(3.0);
}

function assertSelectedDarkContrast() {
  const card = toRgb(obsidianDarkTokens.card);
  const border = toRgb(getSelectedBorderHex('dark'));

  expect(contrastRatio(border, card)).toBeGreaterThanOrEqual(3.0);

  const pressedBorder = blendRgb(border, card, 0.9);
  expect(contrastRatio(pressedBorder, card)).toBeGreaterThanOrEqual(3.0);
}

function assertInactiveIdleContrast(tokens: typeof obsidianDarkTokens | typeof obsidianLightTokens) {
  const card = toRgb(tokens.card);
  const border = toRgb(getInactiveBorderToken(tokens));
  expect(contrastRatio(border, card)).toBeGreaterThanOrEqual(3.0);
}

function assertInactivePressedContrast(tokens: typeof obsidianDarkTokens | typeof obsidianLightTokens) {
  const card = toRgb(tokens.card);
  const cardHover = toRgb(tokens.cardHover);
  const borderToken = toRgb(getInactiveBorderToken(tokens));

  const pressedBorder = blendRgb(borderToken, card, 0.9);
  const pressedCardHover = blendRgb(cardHover, card, 0.9);
  expect(contrastRatio(pressedBorder, card)).toBeGreaterThanOrEqual(3.0);
  expect(contrastRatio(pressedBorder, pressedCardHover)).toBeGreaterThanOrEqual(3.0);
}

describe('1. ChoiceChip source structure in form-kit.tsx', () => {
  it('defines contrast-safe activeBorder bound to ctaText in light mode and ctaFill in dark mode', () => {
    const chipCode = getChoiceChipSource();
    expect(chipCode).toContain("const activeBorder = colors.mode === 'light' ? colors.ctaText : colors.ctaFill;");
  });

  it('defines activeFocusBorder and visible non-suppressed focus border logic for selected ChoiceChips', () => {
    const chipCode = getChoiceChipSource();
    expect(chipCode).toContain("const activeFocusBorder = colors.mode === 'light' ? colors.amber : colors.mainText;");
    expect(chipCode).toContain('const border = isFocused ? (active ? activeFocusBorder : colors.amber) : (active ? activeBorder : colors.mutedText);');
  });

  it('preserves existing chip fill, text colors, and 0.9 pressed opacity feedback', () => {
    const chipCode = getChoiceChipSource();
    expect(chipCode).toContain('backgroundColor: active ? colors.ctaFill : pressed ? colors.cardHover : colors.card');
    expect(chipCode).toContain('opacity: pressed ? 0.9 : 1');
    expect(chipCode).toContain('color: active ? colors.ctaText : colors.mainText');
  });
});

describe('2. ChoiceChip contrast compliance in form-kit.tsx', () => {
  it('selected light-mode border reaches >= 3:1 against card and fill in default and pressed states', () => {
    assertSelectedLightContrast();
  });

  it('selected dark-mode border reaches >= 3:1 against card in default and pressed states', () => {
    assertSelectedDarkContrast();
  });

  it('inactive idle border reaches >= 3:1 against parent card in dark and light themes', () => {
    assertInactiveIdleContrast(obsidianDarkTokens);
    assertInactiveIdleContrast(obsidianLightTokens);
  });

  it('inactive pressed border with 0.9 opacity reaches >= 3:1 against pressed cardHover surface in both themes', () => {
    assertInactivePressedContrast(obsidianDarkTokens);
    assertInactivePressedContrast(obsidianLightTokens);
  });
});

describe('3. Lead card radius in workspace-preview.tsx', () => {
  it('restores leadCard to the approved 8dp radius baseline without modifying other radii', () => {
    const screen = readMobileFile('app/brainworker/workspace-preview.tsx');
    const leadCardMatch = screen.match(/leadCard:\s*\{([^}]*)\}/);
    expect(leadCardMatch).not.toBeNull();
    const leadCardStyle = leadCardMatch![1];
    expect(leadCardStyle).toContain('borderRadius: 8');
    expect(leadCardStyle).not.toContain('borderRadius: 12');
  });
});

describe('4. Registration submit label fallback cleanup in register.tsx', () => {
  it('removes unused #FFFFFF color fallback from submitLabel and preserves inline c.ctaText', () => {
    const screen = readMobileFile('app/brainworker/register.tsx');
    const submitLabelMatch = screen.match(/submitLabel:\s*\{([^}]*)\}/);
    expect(submitLabelMatch).not.toBeNull();
    const submitLabelStyle = submitLabelMatch![1];
    expect(submitLabelStyle).not.toContain('#FFFFFF');
    expect(submitLabelStyle).not.toContain('color:');

    const submitButtonMatch = screen.match(/function RegisterSubmitButton[\s\S]*?\n\}/);
    expect(submitButtonMatch).not.toBeNull();
    expect(submitButtonMatch![0]).toContain('color: c.ctaText');
    expect(submitButtonMatch![0]).toContain('color={c.ctaText}');
  });
});

describe('5. Milestone decorative status semantics in jobs.tsx', () => {
  it('verifies row accessibility and adjacent visible text provide full status', () => {
    const screen = readMobileFile('app/(tabs)/jobs.tsx');
    const milestoneMatch = screen.match(/function MilestoneStepItem[\s\S]*?\n\}/);
    expect(milestoneMatch).not.toBeNull();
    const code = milestoneMatch![0];
    expect(code).toContain('accessibilityLabel={`${step.label}: ${stateLabel}`}');
    expect(code).toContain("const stateLabel = isDone ? 'Completed' : isActive ? 'Current step' : 'Upcoming'");
    expect(code).toContain('color: isDone ? c.green : c.mutedText');
  });

  it('verifies mutedText contrast >= 4.5:1 and icon/connector use decorative divider token', () => {
    const darkRatio = contrastRatio(toRgb(obsidianDarkTokens.mutedText), toRgb(obsidianDarkTokens.card));
    const lightRatio = contrastRatio(toRgb(obsidianLightTokens.mutedText), toRgb(obsidianLightTokens.card));
    expect(darkRatio).toBeGreaterThanOrEqual(4.5);
    expect(lightRatio).toBeGreaterThanOrEqual(4.5);

    const screen = readMobileFile('app/(tabs)/jobs.tsx');
    const code = screen.match(/function MilestoneStepItem[\s\S]*?\n\}/)![0];
    expect(code).toContain('const iconColor = isDone ? c.green : isActive ? c.amber : c.divider');
    expect(code).toContain('backgroundColor: isDone ? c.green : c.divider');
  });
});

describe('6. Jobs activity tab container accessibility semantics in jobs.tsx', () => {
  it('assigns accessibilityRole="tablist" and a concise label to the JobsTabBar container', () => {
    const screen = readMobileFile('app/(tabs)/jobs.tsx');
    const tabBarMatch = screen.match(/function JobsTabBar[\s\S]*?\n\}/);
    expect(tabBarMatch).not.toBeNull();
    const code = tabBarMatch![0];
    expect(code).toContain('accessibilityRole="tablist"');
    expect(code).toContain('accessibilityLabel="Job activity filters"');
  });
});

describe('7. Services search input accessibility semantics in services.tsx', () => {
  it('assigns accessibilityRole="search" to the search TextInput', () => {
    const screen = readMobileFile('app/(tabs)/services.tsx');
    const inputMatch = screen.match(/function ServicesSearchInput[\s\S]*?\n\}/);
    expect(inputMatch).not.toBeNull();
    const code = inputMatch![0];
    expect(code).toContain('accessibilityRole="search"');
  });
});

describe('8. Shared FieldInput aria-invalid accessibility semantics in form-kit.tsx', () => {
  it('assigns aria-invalid={Boolean(field.error)} to FieldInput TextInput', () => {
    const formKit = readMobileFile('components/form-kit.tsx');
    const fieldInputMatch = formKit.match(/function FieldInput[\s\S]*?\n\}/);
    expect(fieldInputMatch).not.toBeNull();
    const code = fieldInputMatch![0];
    expect(code).toContain('aria-invalid={Boolean(field.error)}');
  });
});

describe('9. ChoiceChips radiogroup and radio semantics in form-kit.tsx', () => {
  it('assigns accessibilityRole="radiogroup" to ChoiceChips container', () => {
    const formKit = readMobileFile('components/form-kit.tsx');
    const chipsMatch = formKit.match(/export function ChoiceChips[\s\S]*?\n\}/);
    expect(chipsMatch).not.toBeNull();
    const code = chipsMatch![0];
    expect(code).toContain('accessibilityRole="radiogroup"');
  });

  it('assigns accessibilityRole="radio" and checked state to ChoiceChip', () => {
    const chipCode = getChoiceChipSource();
    expect(chipCode).toContain('accessibilityRole="radio"');
    expect(chipCode).toContain('accessibilityState={{ checked: active }}');
  });
});

describe('10. form-kit.tsx Pressable focus indicators and filled CTA boundary verification', () => {
  it('FormBackButton source contains onFocus/onBlur state and amber border when focused', () => {
    const formKit = readMobileFile('components/form-kit.tsx');
    const backButtonMatch = formKit.match(/function FormBackButton[\s\S]*?\n\}/);
    expect(backButtonMatch).not.toBeNull();
    const code = backButtonMatch![0];
    expect(code).toContain('const [isFocused, setIsFocused] = useState(false);');
    expect(code).toContain('onFocus={() => setIsFocused(true)}');
    expect(code).toContain('onBlur={() => setIsFocused(false)}');
    expect(code).toContain('isFocused ? c.amber :');
  });

  it('PrimaryButton leaves filled CTA styling unchanged because amber border fails contrast against button fill', () => {
    const formKit = readMobileFile('components/form-kit.tsx');
    const primaryButtonMatch = formKit.match(/export function PrimaryButton[\s\S]*?\n\}/);
    expect(primaryButtonMatch).not.toBeNull();
    const code = primaryButtonMatch![0];
    expect(code).not.toContain('showFocus ? c.amber');
    expect(code).not.toContain('borderWidth: showFocus');
    expect(code).toContain('backgroundColor: disabled ? c.rule : pressed ? c.ctaPressed : c.ctaFill');
  });

  it('SecondaryButton source contains onFocus/onBlur state and amber border when focused', () => {
    const formKit = readMobileFile('components/form-kit.tsx');
    const secondaryButtonMatch = formKit.match(/export function SecondaryButton[\s\S]*?\n\}/);
    expect(secondaryButtonMatch).not.toBeNull();
    const code = secondaryButtonMatch![0];
    expect(code).toContain('const [isFocused, setIsFocused] = useState(false);');
    expect(code).toContain('onFocus={() => setIsFocused(true)}');
    expect(code).toContain('onBlur={() => setIsFocused(false)}');
    expect(code).toContain('borderColor: isFocused ? c.amber : pressed ? c.rule : c.divider');
  });

  it('ChoiceChip source contains onFocus/onBlur state and visible focus borders', () => {
    const chipCode = getChoiceChipSource();
    expect(chipCode).toContain('const [isFocused, setIsFocused] = useState(false);');
    expect(chipCode).toContain('onFocus={() => setIsFocused(true)}');
    expect(chipCode).toContain('onBlur={() => setIsFocused(false)}');
    expect(chipCode).toContain('isFocused ? (active ? activeFocusBorder : colors.amber)');
  });

  it('amber focus border contrast >= 3:1 against card in both themes for outline controls', () => {
    const darkRatio = contrastRatio(toRgb(obsidianDarkTokens.amber), toRgb(obsidianDarkTokens.card));
    const lightRatio = contrastRatio(toRgb(obsidianLightTokens.amber), toRgb(obsidianLightTokens.card));
    expect(darkRatio).toBeGreaterThanOrEqual(3.0);
    expect(lightRatio).toBeGreaterThanOrEqual(3.0);
  });

  it('proves filled CTA button amber border fails >= 3:1 contrast against button fill in dark (1.00:1) and light (2.00:1)', () => {
    const darkRatio = contrastRatio(toRgb(obsidianDarkTokens.amber), toRgb(obsidianDarkTokens.ctaFill));
    const lightRatio = contrastRatio(toRgb(obsidianLightTokens.amber), toRgb(obsidianLightTokens.ctaFill));
    expect(darkRatio).toBeCloseTo(1.0, 1);
    expect(lightRatio).toBeCloseTo(2.0, 1);
    expect(darkRatio).toBeLessThan(3.0);
    expect(lightRatio).toBeLessThan(3.0);
  });

  it('proves active ChoiceChip focus border achieves >= 3:1 against surrounding card in both themes', () => {
    const darkRatio = contrastRatio(toRgb(obsidianDarkTokens.mainText), toRgb(obsidianDarkTokens.card));
    const lightRatio = contrastRatio(toRgb(obsidianLightTokens.amber), toRgb(obsidianLightTokens.card));
    expect(darkRatio).toBeGreaterThanOrEqual(3.0);
    expect(lightRatio).toBeGreaterThanOrEqual(3.0);
  });
});

describe('11. jobs.tsx and services.tsx Pressable focus indicators', () => {
  it('JobTabItem source contains onFocus/onBlur state and amber focus border', () => {
    const screen = readMobileFile('app/(tabs)/jobs.tsx');
    const match = screen.match(/function JobsTabItem[\s\S]*?\n\}/);
    expect(match).not.toBeNull();
    const code = match![0];
    expect(code).toContain('onFocus={() => setIsFocused(true)}');
    expect(code).toContain('onBlur={() => setIsFocused(false)}');
    expect(code).toContain('borderBottomColor: c.amber');
  });

  it('ExploreServicesButton preserves unchanged filled CTA styling without failing border', () => {
    const screen = readMobileFile('app/(tabs)/jobs.tsx');
    const match = screen.match(/function ExploreServicesButton[\s\S]*?\n\}/);
    expect(match).not.toBeNull();
    const code = match![0];
    expect(code).not.toContain('borderColor: isFocused ? c.amber');
    expect(code).toContain('backgroundColor: pressed ? c.amberHover : c.amber');
  });

  it('ActivitySampleCard and BackButton source contain onFocus/onBlur state and amber border', () => {
    const screen = readMobileFile('app/(tabs)/jobs.tsx');
    const cardMatch = screen.match(/function ActivitySampleCard[\s\S]*?\n\}/);
    expect(cardMatch).not.toBeNull();
    const cardCode = cardMatch![0];
    expect(cardCode).toContain('onFocus={() => setIsFocused(true)}');
    expect(cardCode).toContain('onBlur={() => setIsFocused(false)}');
    expect(cardCode).toContain('isFocused && { borderColor: c.amber }');

    const backMatch = screen.match(/function BackButton[\s\S]*?\n\}/);
    expect(backMatch).not.toBeNull();
    const backCode = backMatch![0];
    expect(backCode).toContain('onFocus={() => setIsFocused(true)}');
    expect(backCode).toContain('onBlur={() => setIsFocused(false)}');
    expect(backCode).toContain('borderColor: isFocused ? c.amber : c.divider');
  });

  it('ClearSearchButton source contains onFocus/onBlur state and amber border with constant borderWidth', () => {
    const screen = readMobileFile('app/(tabs)/services.tsx');
    const match = screen.match(/function ClearSearchButton[\s\S]*?\n\}/);
    expect(match).not.toBeNull();
    const code = match![0];
    expect(code).toContain('onFocus={() => setIsFocused(true)}');
    expect(code).toContain('onBlur={() => setIsFocused(false)}');
    expect(code).toContain("borderColor: isFocused ? c.amber : 'transparent'");
    expect(code).not.toContain('borderWidth: 1');

    const clearBtnStyle = screen.match(/clearBtn:\s*\{([^}]*)\}/);
    expect(clearBtnStyle).not.toBeNull();
    expect(clearBtnStyle![1]).toContain('borderWidth: 1');
  });

  it('ServiceFilterChip source contains onFocus/onBlur state and visible focus border when active and inactive', () => {
    const screen = readMobileFile('app/(tabs)/services.tsx');
    const match = screen.match(/function FilterPillItem[\s\S]*?\n\}/);
    expect(match).not.toBeNull();
    const code = match![0];
    expect(code).toContain('onFocus={() => setIsFocused(true)}');
    expect(code).toContain('onBlur={() => setIsFocused(false)}');
    expect(code).toContain('isFocused && { borderColor: active ? activeFocusBorder : c.amber }');
  });

  it('ResetFiltersButton source contains onFocus/onBlur state and amber border', () => {
    const screen = readMobileFile('app/(tabs)/services.tsx');
    const match = screen.match(/function ServicesEmptyState[\s\S]*?\n\}/);
    expect(match).not.toBeNull();
    const code = match![0];
    expect(code).toContain('onFocus={() => setIsFocused(true)}');
    expect(code).toContain('onBlur={() => setIsFocused(false)}');
    expect(code).toContain('isFocused && { borderColor: c.amber }');
  });
});

describe('12. register.tsx and workspace-preview.tsx Pressable focus indicators', () => {
  it('RegisterSubmitButton preserves unchanged filled CTA styling without failing border', () => {
    const screen = readMobileFile('app/brainworker/register.tsx');
    const match = screen.match(/function RegisterSubmitButton[\s\S]*?\n\}/);
    expect(match).not.toBeNull();
    const code = match![0];
    expect(code).not.toContain('borderColor: c.amber');
    expect(code).toContain('backgroundColor: pressed ? c.ctaPressed : c.ctaFill');
  });

  it('RegisterPreviewLink source contains onFocus/onBlur state and amber border', () => {
    const screen = readMobileFile('app/brainworker/register.tsx');
    const match = screen.match(/function RegisterPreviewLink[\s\S]*?\n\}/);
    expect(match).not.toBeNull();
    const code = match![0];
    expect(code).toContain('onFocus');
    expect(code).toContain('onBlur');
    expect(code).toContain('c.amber');
  });

  it('Register back button source contains onFocus/onBlur state and constant borderWidth', () => {
    const screen = readMobileFile('app/brainworker/register.tsx');
    const match = screen.match(/function RegisterHeader[\s\S]*?\n\}/);
    expect(match).not.toBeNull();
    const code = match![0];
    expect(code).toContain('onFocus');
    expect(code).toContain('onBlur');
    expect(code).toContain("borderColor: focused ? c.amber : 'transparent'");
    expect(code).not.toContain('borderWidth: 1');

    const backStyle = screen.match(/back:\s*\{([^}]*)\}/);
    expect(backStyle).not.toBeNull();
    expect(backStyle![1]).toContain('borderWidth: 1');
  });

  it('workspace-preview back buttons maintain constant borderWidth without layout shift', () => {
    const screen = readMobileFile('app/brainworker/workspace-preview.tsx');
    const topNavMatch = screen.match(/function WorkspaceTopNav[\s\S]*?\n\}/);
    expect(topNavMatch).not.toBeNull();
    expect(topNavMatch![0]).toContain("borderColor: focused ? c.amber : 'transparent'");
    expect(topNavMatch![0]).not.toContain('borderWidth: 1');

    const detailBackMatch = screen.match(/function DetailBackBtn[\s\S]*?\n\}/);
    expect(detailBackMatch).not.toBeNull();
    expect(detailBackMatch![0]).toContain("borderColor: focused ? c.amber : 'transparent'");
    expect(detailBackMatch![0]).not.toContain('borderWidth: 1');

    const navBackStyle = screen.match(/navBackBtn:\s*\{([^}]*)\}/);
    expect(navBackStyle).not.toBeNull();
    expect(navBackStyle![1]).toContain('borderWidth: 1');

    const detailBackStyle = screen.match(/detailBackBtn:\s*\{([^}]*)\}/);
    expect(detailBackStyle).not.toBeNull();
    expect(detailBackStyle![1]).toContain('borderWidth: 1');
  });

  it('CheckInEntryButton preserves unchanged filled CTA styling without failing border', () => {
    const screen = readMobileFile('app/brainworker/workspace-preview.tsx');
    const match = screen.match(/function CheckInEntryButton[\s\S]*?\n\}/);
    expect(match).not.toBeNull();
    const code = match![0];
    expect(code).not.toContain('borderColor: c.amber');
    expect(code).toContain('backgroundColor: pressed ? c.amberHover : bg');
  });

  it('DeclineButton source contains onFocus/onBlur state and amber border while AcceptButton preserves unchanged filled CTA styling', () => {
    const screen = readMobileFile('app/brainworker/workspace-preview.tsx');
    const acceptMatch = screen.match(/function AcceptButton[\s\S]*?\n\}/);
    expect(acceptMatch).not.toBeNull();
    expect(acceptMatch![0]).not.toContain('borderColor: c.amber');
    expect(acceptMatch![0]).toContain('backgroundColor: pressed ? c.amberHover : bg');

    const declineMatch = screen.match(/function DeclineButton[\s\S]*?\n\}/);
    expect(declineMatch).not.toBeNull();
    expect(declineMatch![0]).toContain('onFocus');
    expect(declineMatch![0]).toContain('onBlur');
    expect(declineMatch![0]).toContain('borderColor: c.amber');
  });

  it('DeclineReasonOption provides distinct focus indicators for selected and unselected states', () => {
    const screen = readMobileFile('app/brainworker/workspace-preview.tsx');
    const match = screen.match(/function DeclineReasonOption[\s\S]*?\n\}/);
    expect(match).not.toBeNull();
    const code = match![0];
    expect(code).toContain('onFocus');
    expect(code).toContain('onBlur');
    expect(code).toContain('const border = focused ? (isSelected ? activeFocusBorder : accent) : (isSelected ? accent : c.mutedText);');
  });
});

describe('13. Home-header ThemeToggle focus indicators in index.tsx', () => {
  it('ThemeToggle in index.tsx source contains onFocus/onBlur state and amber focus border with constant borderWidth', () => {
    const screen = readMobileFile('app/index.tsx');
    const match = screen.match(/function ThemeToggle[\s\S]*?return \([\s\S]*?\n\}/);
    expect(match).not.toBeNull();
    const code = match![0];
    expect(code).toContain('onFocus={() => setIsFocused(true)}');
    expect(code).toContain('onBlur={() => setIsFocused(false)}');
    expect(code).toContain('borderColor: isFocused ? c.amber : c.divider');

    const themeToggleStyle = screen.match(/themeToggle:\s*\{([^}]*)\}/);
    expect(themeToggleStyle).not.toBeNull();
    expect(themeToggleStyle![1]).toContain('borderWidth: 1');
  });

  it('ThemeToggle amber focus border reaches >= 3:1 against strip background in both themes', () => {
    const darkRatio = contrastRatio(toRgb(obsidianDarkTokens.amber), toRgb(obsidianDarkTokens.strip));
    const lightRatio = contrastRatio(toRgb(obsidianLightTokens.amber), toRgb(obsidianLightTokens.strip));
    expect(darkRatio).toBeGreaterThanOrEqual(3.0);
    expect(lightRatio).toBeGreaterThanOrEqual(3.0);
  });
});

describe('14. Layout dimension preservation (zero borderWidth toggling)', () => {
  it('verifies all outline and Pressable focus indicators preserve layout dimensions with constant borderWidth', () => {
    const services = readMobileFile('app/(tabs)/services.tsx');
    expect(services).toContain("clearBtn: {\n    minHeight: 48,\n    minWidth: 48,\n    alignItems: 'center',\n    justifyContent: 'center',\n    borderWidth: 1,");

    const register = readMobileFile('app/brainworker/register.tsx');
    expect(register).toContain("back: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', minHeight: 48, minWidth: 48, borderWidth: 1, borderColor: 'transparent', borderRadius: 6, paddingHorizontal: 4 }");

    const workspace = readMobileFile('app/brainworker/workspace-preview.tsx');
    expect(workspace).toContain('navBackBtn: {\n    flexDirection: \'row\',\n    alignItems: \'center\',\n    gap: 8,\n    minHeight: 48,\n    minWidth: 48,\n    borderWidth: 1,');
    expect(workspace).toContain('detailBackBtn: {\n    flexDirection: \'row\',\n    alignItems: \'center\',\n    gap: 6,\n    minHeight: 48,\n    minWidth: 48,\n    alignSelf: \'flex-start\',\n    borderWidth: 1,');

    const jobs = readMobileFile('app/(tabs)/jobs.tsx');
    expect(jobs).toContain('borderBottomWidth: 2,\n    borderBottomColor: \'transparent\',');
  });
});

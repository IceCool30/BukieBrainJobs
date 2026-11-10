import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import * as ts from 'typescript';
import { obsidianDarkTokens, obsidianLightTokens } from '../lib/theme';

declare const __dirname: string;

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

const source = readFileSync(resolve(__dirname, 'post-job.tsx'), 'utf8');

function collectDeclarations(code: string): string[] {
  const sf = ts.createSourceFile('post-job.tsx', code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const out: string[] = [];
  ts.forEachChild(sf, (node) => {
    if (ts.isFunctionDeclaration(node) && node.name?.text !== 'PostJobScreen') {
      out.push(node.getText(sf));
    }
  });
  return out;
}

const declarations = collectDeclarations(source);
const transformed = declarations.map((d) => ts.transpileModule(d, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    jsx: ts.JsxEmit.React,
    target: ts.ScriptTarget.ES2020,
    esModuleInterop: true,
  },
  fileName: 'post-job.tsx',
}).outputText).join('\n');

function buildScope(platform: string, findNodeHandle: () => unknown, setAccessibilityFocus: (n: unknown) => void, effects: Array<{ cb: () => void }>, rafCallbacks: Array<() => void>) {
  const Platform = { OS: platform };
  const AccessibilityInfo = { announceForAccessibility: vi.fn(), setAccessibilityFocus };
  const requestAnimationFrame = (cb: () => void) => { rafCallbacks.push(cb); return rafCallbacks.length; };
  const cancelAnimationFrame = vi.fn();
  const useEffect = (cb: () => void) => { effects.push({ cb }); };
  const useRef = () => ({ current: null });
  const useState = (v: unknown) => [v, () => {}];
  const React = { createElement: () => null };
  return { Platform, AccessibilityInfo, findNodeHandle, requestAnimationFrame, cancelAnimationFrame, useEffect, useRef, useState, React };
}

function createHarness(platform: string, handleValue: number | null, targetValue: { focus: () => void } | null, focusKey = 'title') {
  const effects: Array<{ cb: () => void }> = [];
  const rafCallbacks: Array<() => void> = [];
  const state = { pendingFocusKey: focusKey, step: 'job_requirement', setPendingFocusKey: vi.fn(), result: null };
  const target = targetValue;
  const focusRefs = { [focusKey]: { current: target } };
  const findNodeHandle = vi.fn(() => handleValue);
  const setAccessibilityFocus = vi.fn();
  const scope = buildScope(platform, findNodeHandle, setAccessibilityFocus, effects, rafCallbacks);
  const factory = new Function(...Object.keys(scope), transformed + '\nreturn usePostJobEffects;');
  const usePostJobEffects = factory(...Object.values(scope));
  return { effects, rafCallbacks, state, target, focusRefs, findNodeHandle, setAccessibilityFocus, usePostJobEffects };
}

function runScenario(platform: string, handleValue: number | null, targetValue: { focus: () => void } | null, focusKey = 'title') {
  const h = createHarness(platform, handleValue, targetValue, focusKey);
  h.usePostJobEffects(h.state, h.focusRefs);
  h.effects[0]?.cb();
  h.rafCallbacks[0]?.();
  return h;
}

it('uses DOM focus and no native accessibility API on web', () => {
  const focus = vi.fn();
  const h = runScenario('web', 7, { focus });
  expect(focus).toHaveBeenCalled();
  expect(h.findNodeHandle).not.toHaveBeenCalled();
  expect(h.setAccessibilityFocus).not.toHaveBeenCalled();
});

it('resolves the handle and uses native accessibility focus on iOS', () => {
  const focus = vi.fn();
  const h = runScenario('ios', 7, { focus });
  expect(focus).not.toHaveBeenCalled();
  expect(h.findNodeHandle).toHaveBeenCalledWith(h.target);
  expect(h.setAccessibilityFocus).toHaveBeenCalledWith(7);
});

it('resolves the handle and uses native accessibility focus on Android', () => {
  const focus = vi.fn();
  const h = runScenario('android', 7, { focus });
  expect(focus).not.toHaveBeenCalled();
  expect(h.findNodeHandle).toHaveBeenCalledWith(h.target);
  expect(h.setAccessibilityFocus).toHaveBeenCalledWith(7);
});

it('does not crash or call any focus API for a null target', () => {
  const h = runScenario('ios', 7, null);
  expect(h.findNodeHandle).not.toHaveBeenCalled();
  expect(h.setAccessibilityFocus).not.toHaveBeenCalled();
});

it('does not call setAccessibilityFocus when the native handle is null', () => {
  const focus = vi.fn();
  const h = runScenario('android', null, { focus });
  expect(focus).not.toHaveBeenCalled();
  expect(h.findNodeHandle).toHaveBeenCalled();
  expect(h.setAccessibilityFocus).not.toHaveBeenCalled();
});

it('calls setAccessibilityFocus for a zero handle because zero is non-null', () => {
  const focus = vi.fn();
  const h = runScenario('ios', 0, { focus });
  expect(h.setAccessibilityFocus).toHaveBeenCalledWith(0);
});

it('focuses a review heading target through the same effect', () => {
  const focus = vi.fn();
  const h = runScenario('ios', 11, { focus }, 'reviewHeading');
  expect(h.setAccessibilityFocus).toHaveBeenCalledWith(11);
});

it('focuses a result heading target on web through DOM focus', () => {
  const focus = vi.fn();
  const h = runScenario('web', 12, { focus }, 'resultHeading');
  expect(focus).toHaveBeenCalled();
  expect(h.setAccessibilityFocus).not.toHaveBeenCalled();
});

it('aligns post-job review summary and step progress visual contracts with Outlier standards', () => {
  const postJobSource = readFileSync(resolve(__dirname, 'post-job.tsx'), 'utf8');
  // Visual progress indicators use theme divider/accent indicators
  expect(postJobSource).toContain('stepIndicator');
  // Review cards align with Outlier card layout and spacing
  expect(postJobSource).toContain('SummaryRow');
});

it('enforces theme-safe progress bar boundary contrast against canvas', () => {
  const postJobSource = readFileSync(resolve(__dirname, 'post-job.tsx'), 'utf8');
  const formKitSource = readFileSync(resolve(__dirname, '../components/form-kit.tsx'), 'utf8');
  const stepMatch = postJobSource.match(/function StepProgress[\s\S]*?\n\}/);
  expect(stepMatch).not.toBeNull();
  const stepCode = stepMatch![0];
  expect(stepCode).toMatch(/barColor\s*=\s*isCurrent\s*\?\s*\(?c\.mode\s*===\s*'light'\s*\?\s*c\.amber\s*:\s*c\.ctaFill\)?\s*:\s*isCompleted\s*\?\s*\(?c\.mode\s*===\s*'light'\s*\?\s*c\.amber\s*:\s*c\.ctaFill\)?\s*:\s*(?:c\.divider|c\.mutedText)/);
  expect(stepCode).toContain('backgroundColor: barColor');
  expect(stepCode).toMatch(/opacity:\s*isCurrent\s*\?\s*1\s*:\s*isCompleted\s*\?\s*0\.8\s*:\s*(?:0\.4|0\.7)/);

  const formMatch = postJobSource.match(/function PostJobForm[\s\S]*?\n\}/);
  expect(formMatch).not.toBeNull();
  expect(formMatch![0]).toContain('<FormScreen>');

  const formScreenMatch = formKitSource.match(/export function FormScreen[\s\S]*?\n\}/);
  expect(formScreenMatch).not.toBeNull();
  expect(formScreenMatch![0]).toContain('backgroundColor: c.canvas');

  const lightCurrentBar = obsidianLightTokens.amber;
  expect(contrast(toRgb(lightCurrentBar), toRgb(obsidianLightTokens.canvas))).toBeGreaterThanOrEqual(3.0);

  const darkCurrentBar = obsidianDarkTokens.ctaFill;
  expect(contrast(toRgb(darkCurrentBar), toRgb(obsidianDarkTokens.canvas))).toBeGreaterThanOrEqual(3.0);
});

const compositeRgb = (fg: Rgb, bg: Rgb, a: number): Rgb => ({
  r: Math.round(fg.r * a + bg.r * (1 - a)),
  g: Math.round(fg.g * a + bg.g * (1 - a)),
  b: Math.round(fg.b * a + bg.b * (1 - a)),
});

function extractStepProgressTokens(stepCode: string) {
  const opacityMatch = stepCode.match(/opacity:\s*isCurrent\s*\?\s*([0-9.]+)\s*:\s*isCompleted\s*\?\s*([0-9.]+)\s*:\s*([0-9.]+)/);
  const barColorMatch = stepCode.match(/barColor\s*=\s*[\s\S]*?:\s*c\.([a-zA-Z0-9_]+)\s*;/);
  expect(opacityMatch).not.toBeNull();
  expect(barColorMatch).not.toBeNull();
  return {
    currentOpacity: parseFloat(opacityMatch![1]),
    completedOpacity: parseFloat(opacityMatch![2]),
    pendingOpacity: parseFloat(opacityMatch![3]),
    pendingBarToken: barColorMatch![1] as keyof typeof obsidianLightTokens,
  };
}

function computeStepBarContrast(tokens: typeof obsidianLightTokens | typeof obsidianDarkTokens, tokenKey: string, opacity: number) {
  const fg = toRgb((tokens as Record<string, string>)[tokenKey]);
  const bg = toRgb(tokens.canvas);
  return contrast(compositeRgb(fg, bg, opacity), bg);
}

it('enforces progress bar current, complete, and pending boundary contrast and visual distinctness', () => {
  const stepMatch = readFileSync(resolve(__dirname, 'post-job.tsx'), 'utf8').match(/function StepProgress[\s\S]*?\n\}/);
  expect(stepMatch).not.toBeNull();
  const { currentOpacity, completedOpacity, pendingOpacity, pendingBarToken } = extractStepProgressTokens(stepMatch![0]);

  expect(currentOpacity).toBeGreaterThan(completedOpacity);
  expect(completedOpacity).toBeGreaterThanOrEqual(pendingOpacity);
  expect(pendingBarToken).not.toBe('amber');
  expect(pendingBarToken).not.toBe('ctaFill');

  expect(computeStepBarContrast(obsidianLightTokens, 'amber', currentOpacity)).toBeGreaterThanOrEqual(3.0);
  expect(computeStepBarContrast(obsidianDarkTokens, 'ctaFill', currentOpacity)).toBeGreaterThanOrEqual(3.0);
  expect(computeStepBarContrast(obsidianLightTokens, 'amber', completedOpacity)).toBeGreaterThanOrEqual(3.0);
  expect(computeStepBarContrast(obsidianDarkTokens, 'ctaFill', completedOpacity)).toBeGreaterThanOrEqual(3.0);
  expect(computeStepBarContrast(obsidianLightTokens, pendingBarToken, pendingOpacity)).toBeGreaterThanOrEqual(3.0);
  expect(computeStepBarContrast(obsidianDarkTokens, pendingBarToken, pendingOpacity)).toBeGreaterThanOrEqual(3.0);
});

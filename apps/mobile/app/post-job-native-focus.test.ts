import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import * as ts from 'typescript';

declare const __dirname: string;

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
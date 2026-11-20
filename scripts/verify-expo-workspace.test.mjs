import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const SCRIPT_PATH = path.resolve('scripts/verify-expo-workspace.mjs');

test('verify-expo-workspace.mjs defines an independently selectable MOB-WORK-003 flow', () => {
  const content = fs.readFileSync(SCRIPT_PATH, 'utf8');
  assert.match(
    content,
    /--slice=MOB-WORK-003|SLICE\s*===\s*['"]MOB-WORK-003['"]/,
    'Verifier must support selecting MOB-WORK-003 via --slice=MOB-WORK-003 or SLICE env var',
  );
});

test('verify-expo-workspace.mjs defines executeWork003QaFlow function', () => {
  const content = fs.readFileSync(SCRIPT_PATH, 'utf8');
  assert.match(
    content,
    /async\s+function\s+executeWork003QaFlow\s*\(/,
    'Verifier must define executeWork003QaFlow for the MOB-WORK-003 flow',
  );
});

test('verify-expo-workspace.mjs enforces execution isolation for MOB-WORK-003 in runQa', () => {
  const content = fs.readFileSync(SCRIPT_PATH, 'utf8');
  const runQaMatch = content.match(/async\s+function\s+runQa\s*\([^)]*\)\s*\{([\s\S]*?)\n\}/);
  assert.ok(runQaMatch, 'runQa function must be defined');
  const runQaBody = runQaMatch[1];
  assert.match(
    runQaBody,
    /isWork003/,
    'runQa must branch on isWork003',
  );
  assert.match(
    runQaBody,
    /await\s+executeWork003QaFlow\s*\(/,
    'runQa must call executeWork003QaFlow in the isWork003 branch',
  );
});

test('verify-expo-workspace.mjs compiles to a unique temporary directory outside repository and cleans up', () => {
  const content = fs.readFileSync(SCRIPT_PATH, 'utf8');
  assert.match(
    content,
    /mkdtempSync|tmpdir\(\)/,
    'M3 flow must use a temporary directory outside the repository for fresh web export',
  );
  assert.match(
    content,
    /expo\s+export.*--output-dir/,
    'M3 flow must compile fresh Expo web export with --output-dir targeting temporary directory',
  );
  assert.match(
    content,
    /rmSync\(.*recursive:\s*true/i,
    'M3 flow must clean up its temporary directory',
  );
});

test('verify-expo-workspace.mjs captures unique expo-mob-work-003- screenshots without collision', () => {
  const content = fs.readFileSync(SCRIPT_PATH, 'utf8');
  const m3Matches = content.match(/expo-mob-work-003-[a-zA-Z0-9-]+\.png/g);
  assert.ok(m3Matches && m3Matches.length >= 5, 'Verifier must define at least 5 unique expo-mob-work-003- screenshot paths');
  for (const shot of m3Matches) {
    assert.ok(shot.startsWith('expo-mob-work-003-'), `Screenshot ${shot} must start with expo-mob-work-003-`);
    assert.doesNotMatch(shot, /expo-mob-work-00[12]-/, `Screenshot ${shot} must not collide with M1/M2`);
  }
});

function getFunctionLineCount(source, fnName) {
  const lines = source.split('\n');
  const startIdx = lines.findIndex((l) => new RegExp(`(?:async\\s+)?function\\s+${fnName}\\b`).test(l));
  if (startIdx === -1) return 0;
  let depth = 0;
  let started = false;
  let endIdx = startIdx;
  for (let i = startIdx; i < lines.length; i++) {
    for (const ch of lines[i]) {
      if (ch === '{') { depth++; started = true; }
      if (ch === '}') depth--;
    }
    if (started && depth === 0) { endIdx = i; break; }
  }
  return endIdx - startIdx + 1;
}

test('verify-expo-workspace.mjs enforces maximum 25 lines for executeWork003QaFlow and M3 helpers', () => {
  const content = fs.readFileSync(SCRIPT_PATH, 'utf8');
  const m3FnRegex = /(?:async\s+)?function\s+([A-Za-z0-9_]*Work003[A-Za-z0-9_]*)\s*\(/g;
  const matches = [...content.matchAll(m3FnRegex)].map((m) => m[1]);
  assert.ok(matches.includes('executeWork003QaFlow'), 'executeWork003QaFlow must be present');
  for (const fn of matches) {
    const lineCount = getFunctionLineCount(content, fn);
    assert.ok(
      lineCount <= 25,
      `Function ${fn} has ${lineCount} lines (maximum 25 allowed)`,
    );
  }
});

test('verify-expo-workspace.mjs uses app-controlled theme toggle and captures M3 State 1 after inline panel expansion', () => {
  const content = fs.readFileSync(SCRIPT_PATH, 'utf8');
  const m3Section = content.slice(
    content.indexOf('async function verifyWork003LeadGenAccept'),
    content.indexOf('async function executeQaSteps'),
  );
  assert.match(
    m3Section,
    /toggleTheme\([^)]*Switch to light mode[^)]*\)|aria-label=["']Switch to light mode["']/,
    'M3 flow must use app-controlled home-screen theme toggle to select light mode',
  );
  assert.match(
    m3Section,
    /expo-mob-work-003-07-checkin-ready-app-light\.png/,
    'M3 flow must capture expo-mob-work-003-07-checkin-ready-app-light.png',
  );
  const panelOpenIdx = m3Section.indexOf('Preview on-site check-in');
  const state1DarkIdx = m3Section.indexOf('expo-mob-work-003-01-checkin-ready-dark.png');
  assert.ok(panelOpenIdx !== -1, 'M3 flow must open the inline check-in panel');
  assert.ok(state1DarkIdx > panelOpenIdx, 'State 1 dark screenshot must be captured after opening inline panel');
});

test('verify-expo-workspace.mjs defines narrowly selectable MOB-WORK-003-ready-captures flow', () => {
  const content = fs.readFileSync(SCRIPT_PATH, 'utf8');
  assert.match(
    content,
    /--slice=MOB-WORK-003-ready-captures|SLICE\s*===\s*['"]MOB-WORK-003-ready-captures['"]/,
    'Verifier must support selecting ready-captures via --slice=MOB-WORK-003-ready-captures',
  );
  assert.match(
    content,
    /async\s+function\s+executeWork003ReadyCapturesFlow\s*\(/,
    'Verifier must define executeWork003ReadyCapturesFlow',
  );
  const section = content.slice(
    content.indexOf('async function verifyWork003ReadyScrollAndAssert'),
    content.indexOf('async function executeQaSteps'),
  );
  assert.match(section, /expo-mob-work-003-01-checkin-ready-dark\.png/);
  assert.match(section, /expo-mob-work-003-07-checkin-ready-app-light\.png/);
  assert.doesNotMatch(section, /expo-mob-work-003-0[2-6]-/);
  assert.match(section, /scrollIntoView/);
  assert.match(section, /Arrival Snapshot: Not simulated/);
  assert.match(section, /Simulate on-site check-in/);
});

test('verify-expo-workspace.mjs scrolls action button into view and asserts 375x812 viewport bounds', () => {
  const content = fs.readFileSync(SCRIPT_PATH, 'utf8');
  const fnBody = content.slice(
    content.indexOf('async function verifyWork003ReadyScrollAndAssert'),
    content.indexOf('async function verifyWork003ReadyDark'),
  );
  assert.match(
    fnBody,
    /simBtn\.scrollIntoViewIfNeeded\(\)/,
    'Ready helper must call scrollIntoViewIfNeeded on action button',
  );
  assert.match(fnBody, /boundingBox\(\)/, 'Ready helper must read boundingBox');
  assert.match(fnBody, /812/, 'Ready helper must verify 812 viewport height');
  assert.match(
    fnBody,
    /(?:y\s*>=?\s*0|y\s*<\s*0)/,
    'Ready helper must assert y >= 0',
  );
  assert.match(
    fnBody,
    /(?:y\s*\+\s*.*height\s*<=?\s*812|y\s*\+\s*.*height\s*>\s*812)/,
    'Ready helper must assert y + height <= 812',
  );
});

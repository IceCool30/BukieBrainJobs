import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { copyFileSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';

const files = ['AGENTS.md', 'CLAUDE.md', '.clinerules'];
const skills = [
  'mr-solomon-nine-command-engineering-loop',
  'mr-solomon-natural-voice',
  'bukiebrainjobs-content-style',
  'bukiebrainjobs-outlier-design-system',
  'bukiebrainjobs-experience-standards',
  'ui-ux-pro-max',
  'agent-skills-test-driven-development',
  'reverse-engineer-anything',
  'human-production-engineering',
];
const declaration = ['SKILL GATE', ...skills].join('\n');

function fixture(t) {
  const home = mkdtempSync(join(tmpdir(), 'bbj-skill-gate-'));
  const root = join(home, 'repo');
  mkdirSync(join(root, 'scripts'), { recursive: true });
  copyFileSync(new URL('./check-skill-gate.sh', import.meta.url), join(root, 'scripts/check-skill-gate.sh'));
  for (const file of files) writeFileSync(join(root, file), declaration);
  t.after(() => rmSync(home, { recursive: true, force: true }));
  return { home, root, run: () => spawnSync('bash', ['scripts/check-skill-gate.sh'], { cwd: root, encoding: 'utf8' }) };
}

test('accepts complete nine-skill declarations without optional home rules', t => {
  const result = fixture(t).run();
  assert.equal(result.status, 0, result.stdout);
  assert.match(result.stdout, /all nine skills named/);
});

for (const file of files) {
  test(`requires Outlier in ${file} even when the legacy Trades skill is present`, t => {
    const { root, run } = fixture(t);
    writeFileSync(join(root, file), declaration.replace('bukiebrainjobs-outlier-design-system', 'bukiebrainjobs-trades-design-system'));
    const result = run();
    assert.equal(result.status, 1, result.stdout);
    assert.match(result.stdout, new RegExp(`SKILLS MISSING in ${file.replaceAll('.', '\\.')}.*bukiebrainjobs-outlier-design-system`));
  });
}

for (const file of files) {
  test(`rejects the deprecated Trades skill in ${file}`, t => {
    const { root, run } = fixture(t);
    writeFileSync(join(root, file), `${declaration}\nbukiebrainjobs-trades-design-system`);
    const result = run();
    assert.equal(result.status, 1, result.stdout);
    assert.match(result.stdout, new RegExp(`DEPRECATED SKILL FOUND in ${file.replaceAll('.', '\\.')}.*bukiebrainjobs-trades-design-system`));
  });
}

for (const file of files) {
  test(`rejects ${file} when REA is omitted`, t => {
    const { root, run } = fixture(t);
    writeFileSync(join(root, file), declaration.replace('reverse-engineer-anything', ''));
    const result = run();
    assert.equal(result.status, 1, result.stdout);
    assert.match(result.stdout, new RegExp(`SKILLS MISSING in ${file.replaceAll('.', '\\.')}.*reverse-engineer-anything`));
  });
}

for (const skill of skills) {
  test(`still rejects omission of ${skill}`, t => {
    const { root, run } = fixture(t);
    writeFileSync(join(root, 'AGENTS.md'), declaration.replace(skill, ''));
    assert.equal(run().status, 1);
  });
}

test('rejects an absent required rule file', t => {
  const { root, run } = fixture(t);
  rmSync(join(root, 'CLAUDE.md'));
  const result = run();
  assert.equal(result.status, 1);
  assert.match(result.stdout, /MISSING FILE: CLAUDE.md/);
});

test('rejects a missing declaration marker', t => {
  const { root, run } = fixture(t);
  writeFileSync(join(root, 'AGENTS.md'), skills.join('\n'));
  assert.equal(run().status, 1);
});

test('requires REA in an existing optional home rule', t => {
  const { home, run } = fixture(t);
  writeFileSync(join(home, '.clinerules'), declaration.replace('reverse-engineer-anything', ''));
  const result = run();
  assert.equal(result.status, 1);
  assert.match(result.stdout, /SKILLS MISSING in .*\.clinerules: reverse-engineer-anything/);
});

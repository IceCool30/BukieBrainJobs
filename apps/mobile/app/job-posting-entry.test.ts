declare const __dirname: string;

import { describe, expect, it } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

describe('MOB-POST-001 homepage entry and route registration', () => {
  it('homepage source exposes accessible Post a Job action targeting /post-job', () => {
    const filePath = path.resolve(__dirname, 'index.tsx');
    const source = fs.readFileSync(filePath, 'utf8');
    expect(source).toContain('accessibilityLabel="Post a Job"');
    expect(source).toContain('/post-job');
    expect(source).toContain('Post a Job');
  });

  it('root layout registers the post-job screen', () => {
    const filePath = path.resolve(__dirname, '_layout.tsx');
    const source = fs.readFileSync(filePath, 'utf8');
    expect(source).toContain('name="post-job"');
  });

  it('homepage preserves existing FIND A BRAINWORKER primary action', () => {
    const filePath = path.resolve(__dirname, 'index.tsx');
    const source = fs.readFileSync(filePath, 'utf8');
    expect(source).toContain('FIND A BRAINWORKER');
  });
});

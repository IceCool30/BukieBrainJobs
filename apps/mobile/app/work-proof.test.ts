import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  WORK_PROOF_DISCLAIMER,
  MAX_WORK_PROOFS_PER_CATEGORY,
  SAMPLE_WORK_PROOF_ASSETS,
  INITIAL_ATTACHED_WORK_PROOFS,
} from '../lib/work-proof-preview';

declare const __dirname: string;

const mobileRoot = resolve(__dirname, '..');
const readMobileFile = (path: string) => readFileSync(resolve(mobileRoot, path), 'utf8');

describe('MOB-MEDIA-001 Native BrainWorker Work Proof & Photo Attachment Preview', () => {
  const workspaceSource = readMobileFile('app/brainworker/workspace-preview.tsx');

  it('imports domain structures and helpers from work-proof-preview', () => {
    expect(workspaceSource).toContain("from '../../lib/work-proof-preview'");
    expect(workspaceSource).toContain('WORK_PROOF_DISCLAIMER');
    expect(workspaceSource).toContain('SAMPLE_WORK_PROOF_ASSETS');
    expect(workspaceSource).toContain('INITIAL_ATTACHED_WORK_PROOFS');
    expect(workspaceSource).toContain('attachWorkProof');
    expect(workspaceSource).toContain('removeWorkProof');
    expect(workspaceSource).toContain('getWorkProofsByCategory');
  });

  it('contains the persistent work proof disclaimer card', () => {
    expect(workspaceSource).toContain('WorkProofDisclaimerCard');
    expect(workspaceSource).toContain('WORK_PROOF_DISCLAIMER');
  });

  it('renders the work proof preview section when lead is accepted', () => {
    expect(workspaceSource).toContain('WorkProofPreviewSection');
  });

  it('provides category switching between BEFORE and AFTER proof photos', () => {
    expect(workspaceSource).toContain('WorkProofCategoryTabs');
    expect(workspaceSource).toContain("'BEFORE'");
    expect(workspaceSource).toContain("'AFTER'");
  });

  it('implements AttachProofButton with concentric outer focus ring', () => {
    expect(workspaceSource).toContain('AttachProofButton');
    const buttonMatch = workspaceSource.match(/function AttachProofButton[\s\S]*?\n\}/);
    expect(buttonMatch).not.toBeNull();
    const buttonCode = buttonMatch![0];
    expect(buttonCode).toContain('isFocused');
    expect(buttonCode).toContain('setIsFocused(true)');
    expect(buttonCode).toContain('setIsFocused(false)');
    expect(buttonCode).toContain('outerFocusRing');
    expect(buttonCode).toContain('accessibilityRole="button"');
  });

  it('provides a sample picker modal for choosing local mock assets', () => {
    expect(workspaceSource).toContain('SampleProofPickerModal');
    expect(workspaceSource).toContain('onRequestClose');
  });

  it('provides a full photo detail inspection modal', () => {
    expect(workspaceSource).toContain('WorkProofDetailModal');
    expect(workspaceSource).toContain('simulatedFileSize');
  });

  it('renders thumbnail cards with category badge and 48dp accessible remove button', () => {
    expect(workspaceSource).toContain('WorkProofThumbnailCard');
    expect(workspaceSource).toContain('accessibilityRole="button"');
    expect(workspaceSource).toContain('accessibilityLabel=');
    expect(workspaceSource).toContain('proofRemoveBtn');
  });

  it('strictly enforces <= 25 lines for every function in workspace-preview.tsx', () => {
    const fnRegex = /(?:function\s+([A-Za-z0-9_]+)\s*\([^)]*\)|const\s+([A-Za-z0-9_]+)\s*=\s*(?:\([^)]*\)|[A-Za-z0-9_]+)\s*=>)\s*\{/g;
    const lines = workspaceSource.split('\n');

    let match: RegExpExecArray | null;
    while ((match = fnRegex.exec(workspaceSource)) !== null) {
      const fnName = match[1] || match[2];
      const startIdx = match.index;
      const lineNumber = workspaceSource.slice(0, startIdx).split('\n').length;

      // Count open and closing braces to find function end
      let braceCount = 0;
      let endLine = lineNumber;
      for (let i = lineNumber - 1; i < lines.length; i++) {
        const line = lines[i]!;
        for (const char of line) {
          if (char === '{') braceCount++;
          if (char === '}') braceCount--;
        }
        if (braceCount === 0) {
          endLine = i + 1;
          break;
        }
      }

      const fnLength = endLine - lineNumber + 1;
      expect(
        fnLength,
        `Function ${fnName} at line ${lineNumber} is ${fnLength} lines long, exceeding 25-line limit`
      ).toBeLessThanOrEqual(25);
    }
  });

  it('contains zero em dashes across the entire file', () => {
    expect(workspaceSource).not.toContain('—');
    expect(workspaceSource).not.toContain('--');
  });
});

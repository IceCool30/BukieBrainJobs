import { describe, expect, it } from 'vitest';
import {
  WORK_PROOF_DISCLAIMER,
  MAX_WORK_PROOFS_PER_CATEGORY,
  SAMPLE_WORK_PROOF_ASSETS,
  INITIAL_ATTACHED_WORK_PROOFS,
  canAttachProof,
  attachWorkProof,
  removeWorkProof,
  getWorkProofsByCategory,
  type WorkProofCategory,
  type WorkProofSampleAsset,
  type AttachedWorkProof,
} from './work-proof-preview';

describe('work-proof-preview domain contracts and fixtures', () => {
  it('exposes the truthful work proof disclaimer with zero em dashes', () => {
    expect(WORK_PROOF_DISCLAIMER).toBe(
      'Sample work proof preview. Photos are simulated local trade samples. No camera hardware is accessed, and no files are uploaded to remote servers.'
    );
    expect(WORK_PROOF_DISCLAIMER).not.toContain('—');
    expect(WORK_PROOF_DISCLAIMER).not.toContain('--');
  });

  it('defines the category limit as 3 proofs per category', () => {
    expect(MAX_WORK_PROOFS_PER_CATEGORY).toBe(3);
  });

  it('includes deterministic sample trade assets covering generator, HVAC, and plumbing', () => {
    expect(SAMPLE_WORK_PROOF_ASSETS.length).toBeGreaterThanOrEqual(6);
    const trades = new Set(SAMPLE_WORK_PROOF_ASSETS.map((a) => a.trade));
    expect(trades.has('GENERATOR')).toBe(true);
    expect(trades.has('HVAC')).toBe(true);
    expect(trades.has('PLUMBING')).toBe(true);

    const categories = new Set(SAMPLE_WORK_PROOF_ASSETS.map((a) => a.category));
    expect(categories.has('BEFORE')).toBe(true);
    expect(categories.has('AFTER')).toBe(true);

    SAMPLE_WORK_PROOF_ASSETS.forEach((asset) => {
      expect(asset.id).toBeTruthy();
      expect(asset.title).toBeTruthy();
      expect(asset.caption).toBeTruthy();
      expect(asset.simulatedFileSize).toMatch(/\d+(\.\d+)?\s*(MB|KB)/);
      expect(asset.simulatedDimensions).toMatch(/^\d+x\d+$/);
      expect(asset.sampleUri).toMatch(/^mock:\/\/proofs\//);
      expect(asset.caption).not.toContain('—');
    });
  });

  it('provides sensible initial attachments for before and after states', () => {
    expect(INITIAL_ATTACHED_WORK_PROOFS.length).toBeGreaterThanOrEqual(2);
    const beforeCount = INITIAL_ATTACHED_WORK_PROOFS.filter((p) => p.category === 'BEFORE').length;
    const afterCount = INITIAL_ATTACHED_WORK_PROOFS.filter((p) => p.category === 'AFTER').length;
    expect(beforeCount).toBeGreaterThanOrEqual(1);
    expect(afterCount).toBeGreaterThanOrEqual(1);
  });
});

describe('work-proof-preview pure helper functions', () => {
  const dummyAssetBefore: WorkProofSampleAsset = {
    id: 'asset_test_before_01',
    trade: 'GENERATOR',
    category: 'BEFORE',
    title: 'Test Before Title',
    caption: 'Test Before Caption',
    simulatedFileSize: '1.2 MB',
    simulatedDimensions: '1920x1080',
    sampleUri: 'mock://proofs/test-before.jpg',
  };

  const dummyAssetAfter: WorkProofSampleAsset = {
    id: 'asset_test_after_01',
    trade: 'GENERATOR',
    category: 'AFTER',
    title: 'Test After Title',
    caption: 'Test After Caption',
    simulatedFileSize: '1.5 MB',
    simulatedDimensions: '1920x1080',
    sampleUri: 'mock://proofs/test-after.jpg',
  };

  it('canAttachProof returns true when count is below limit and false when at limit', () => {
    const list: AttachedWorkProof[] = [
      {
        id: 'p1',
        assetId: 'a1',
        category: 'BEFORE',
        title: 'T1',
        caption: 'C1',
        attachedAt: '2026-11-19T05:00:00Z',
        simulatedFileSize: '1.0 MB',
        sampleUri: 'mock://proofs/1.jpg',
      },
      {
        id: 'p2',
        assetId: 'a2',
        category: 'BEFORE',
        title: 'T2',
        caption: 'C2',
        attachedAt: '2026-11-19T05:01:00Z',
        simulatedFileSize: '1.0 MB',
        sampleUri: 'mock://proofs/2.jpg',
      },
    ];

    expect(canAttachProof(list, 'BEFORE')).toBe(true);
    expect(canAttachProof(list, 'AFTER')).toBe(true);

    const fullList: AttachedWorkProof[] = [
      ...list,
      {
        id: 'p3',
        assetId: 'a3',
        category: 'BEFORE',
        title: 'T3',
        caption: 'C3',
        attachedAt: '2026-11-19T05:02:00Z',
        simulatedFileSize: '1.0 MB',
        sampleUri: 'mock://proofs/3.jpg',
      },
    ];

    expect(canAttachProof(fullList, 'BEFORE')).toBe(false);
    expect(canAttachProof(fullList, 'AFTER')).toBe(true);
  });

  it('attachWorkProof appends a new proof immutably', () => {
    const initial: AttachedWorkProof[] = [];
    const updated = attachWorkProof(initial, dummyAssetBefore);

    expect(updated).not.toBe(initial);
    expect(updated.length).toBe(1);
    expect(updated[0]?.assetId).toBe(dummyAssetBefore.id);
    expect(updated[0]?.category).toBe('BEFORE');
    expect(updated[0]?.title).toBe(dummyAssetBefore.title);
    expect(updated[0]?.sampleUri).toBe(dummyAssetBefore.sampleUri);
  });

  it('attachWorkProof prevents duplicate attachments of the same asset', () => {
    const initial = attachWorkProof([], dummyAssetBefore);
    const duplicated = attachWorkProof(initial, dummyAssetBefore);

    expect(duplicated).toBe(initial);
    expect(duplicated.length).toBe(1);
  });

  it('attachWorkProof enforces category cap of 3 proofs', () => {
    let list: AttachedWorkProof[] = [];
    for (let i = 1; i <= 3; i++) {
      list = attachWorkProof(list, {
        ...dummyAssetBefore,
        id: `asset_before_${i}`,
      });
    }
    expect(list.length).toBe(3);

    const fourthAsset: WorkProofSampleAsset = {
      ...dummyAssetBefore,
      id: 'asset_before_4',
    };
    const afterFourth = attachWorkProof(list, fourthAsset);
    expect(afterFourth).toBe(list);
    expect(afterFourth.length).toBe(3);
  });

  it('removeWorkProof removes targeted item immutably', () => {
    const initial = attachWorkProof([], dummyAssetBefore);
    const proofId = initial[0]?.id;
    expect(proofId).toBeDefined();

    const removed = removeWorkProof(initial, proofId!);
    expect(removed).not.toBe(initial);
    expect(removed.length).toBe(0);

    const noop = removeWorkProof(initial, 'non-existent-id');
    expect(noop.length).toBe(1);
  });

  it('getWorkProofsByCategory filters correctly', () => {
    const list = attachWorkProof(attachWorkProof([], dummyAssetBefore), dummyAssetAfter);
    const beforeList = getWorkProofsByCategory(list, 'BEFORE');
    const afterList = getWorkProofsByCategory(list, 'AFTER');

    expect(beforeList.length).toBe(1);
    expect(beforeList[0]?.category).toBe('BEFORE');
    expect(afterList.length).toBe(1);
    expect(afterList[0]?.category).toBe('AFTER');
  });
});

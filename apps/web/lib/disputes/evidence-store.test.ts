// apps/web/lib/disputes/evidence-store.test.ts
// BW-010: Evidence Store Unit Tests

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { evidenceStore } from './evidence-store';

describe('BW-010: EvidenceStore Blob Lifecycle', () => {
  beforeEach(() => {
    evidenceStore.resetForTests();
    if (typeof URL.createObjectURL === 'undefined') {
      URL.createObjectURL = vi.fn((file: Blob | MediaSource) => `blob:mock-url-${(file as File).name || 'file'}`);
    } else {
      vi.spyOn(URL, 'createObjectURL').mockImplementation((file: Blob | MediaSource) => `blob:mock-url-${(file as File).name || 'file'}`);
    }
    if (typeof URL.revokeObjectURL === 'undefined') {
      URL.revokeObjectURL = vi.fn();
    } else {
      vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    }
  });

  afterEach(() => {
    evidenceStore.resetForTests();
    vi.restoreAllMocks();
  });

  it('registers a draft blob with session scope and tracks status as DRAFT', () => {
    const file = new File(['content'], 'test.png', { type: 'image/png' });
    const url = evidenceStore.registerDraftBlob(file, 'session-1');

    expect(url).toContain('blob:mock-url-test.png');
    expect(evidenceStore.isBlobActive(url)).toBe(true);
    expect(evidenceStore.getBlobStatus(url)).toBe('DRAFT');
    expect(evidenceStore.getBlobSessionId(url)).toBe('session-1');
  });

  it('releases an uncommitted draft blob URL immediately and calls URL.revokeObjectURL', () => {
    const file = new File(['content'], 'remove-me.png', { type: 'image/png' });
    const url = evidenceStore.registerDraftBlob(file, 'session-1');

    evidenceStore.releaseDraftBlob(url, 'session-1');

    expect(evidenceStore.isBlobActive(url)).toBe(false);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith(url);
  });

  it('isolates separate draft sessions: clearing session A drafts never revokes session B drafts', () => {
    const fileA = new File(['alpha'], 'draft-a.png', { type: 'image/png' });
    const fileB = new File(['beta'], 'draft-b.png', { type: 'image/png' });

    const urlA = evidenceStore.registerDraftBlob(fileA, 'session-a');
    const urlB = evidenceStore.registerDraftBlob(fileB, 'session-b');

    expect(evidenceStore.isBlobActive(urlA)).toBe(true);
    expect(evidenceStore.isBlobActive(urlB)).toBe(true);

    // Clear session A drafts only
    evidenceStore.clearDraftBlobs('session-a');

    expect(evidenceStore.isBlobActive(urlA)).toBe(false);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith(urlA);

    // Session B draft must remain active and unrevoked
    expect(evidenceStore.isBlobActive(urlB)).toBe(true);
    expect(evidenceStore.getBlobStatus(urlB)).toBe('DRAFT');
    expect(URL.revokeObjectURL).not.toHaveBeenCalledWith(urlB);
  });

  it('commits draft blobs to a record, preventing draft cleanup from revoking them', () => {
    const file = new File(['content'], 'submitted.png', { type: 'image/png' });
    const url = evidenceStore.registerDraftBlob(file, 'session-1');

    evidenceStore.commitDraftBlobs([url], 'record-101');
    expect(evidenceStore.getBlobStatus(url)).toBe('COMMITTED');
    expect(evidenceStore.getBlobRecordId(url)).toBe('record-101');

    // Cancelling drafts for session-1 must NOT revoke the committed URL
    evidenceStore.clearDraftBlobs('session-1');
    expect(evidenceStore.isBlobActive(url)).toBe(true);
    expect(URL.revokeObjectURL).not.toHaveBeenCalledWith(url);
  });

  it('clears uncommitted draft blobs for a specific session when discarded', () => {
    const fileA = new File(['a'], 'discard-a.png', { type: 'image/png' });
    const fileB = new File(['b'], 'discard-b.png', { type: 'image/png' });

    const urlA = evidenceStore.registerDraftBlob(fileA, 'session-discard');
    const urlB = evidenceStore.registerDraftBlob(fileB, 'session-discard');

    evidenceStore.clearDraftBlobs('session-discard');

    expect(evidenceStore.isBlobActive(urlA)).toBe(false);
    expect(evidenceStore.isBlobActive(urlB)).toBe(false);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith(urlA);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith(urlB);
  });

  it('releases committed blobs when record disposal is explicitly requested', () => {
    const file = new File(['c'], 'committed.png', { type: 'image/png' });
    const url = evidenceStore.registerDraftBlob(file, 'session-1');
    evidenceStore.commitDraftBlobs([url], 'record-202');

    evidenceStore.releaseRecordBlobs('record-202');
    expect(evidenceStore.isBlobActive(url)).toBe(false);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith(url);
  });

  it('never revokes an unregistered blob URL when releaseDraftBlob is called', () => {
    const foreignBlobUrl = 'blob:http://localhost:3000/foreign-uuid-1234';
    evidenceStore.releaseDraftBlob(foreignBlobUrl, 'session-1');

    expect(URL.revokeObjectURL).not.toHaveBeenCalledWith(foreignBlobUrl);
  });

  it('never revokes a committed blob URL or a foreign session draft when releaseDraftBlob is called', () => {
    const fileCommitted = new File(['committed'], 'comm.png', { type: 'image/png' });
    const urlCommitted = evidenceStore.registerDraftBlob(fileCommitted, 'session-1');
    evidenceStore.commitDraftBlobs([urlCommitted], 'record-303');

    const fileForeign = new File(['foreign'], 'foreign.png', { type: 'image/png' });
    const urlForeign = evidenceStore.registerDraftBlob(fileForeign, 'session-2');

    // Attempt to release committed blob via releaseDraftBlob
    evidenceStore.releaseDraftBlob(urlCommitted, 'session-1');
    expect(evidenceStore.isBlobActive(urlCommitted)).toBe(true);
    expect(URL.revokeObjectURL).not.toHaveBeenCalledWith(urlCommitted);

    // Attempt to release foreign session blob via releaseDraftBlob with mismatched sessionId
    evidenceStore.releaseDraftBlob(urlForeign, 'session-1');
    expect(evidenceStore.isBlobActive(urlForeign)).toBe(true);
    expect(URL.revokeObjectURL).not.toHaveBeenCalledWith(urlForeign);
  });

  it('releaseCommittedBlobs ignores uncommitted draft URLs and does not revoke them', () => {
    const fileDraft = new File(['draft'], 'draft.png', { type: 'image/png' });
    const urlDraft = evidenceStore.registerDraftBlob(fileDraft, 'session-1');

    evidenceStore.releaseCommittedBlobs([urlDraft]);

    expect(evidenceStore.isBlobActive(urlDraft)).toBe(true);
    expect(evidenceStore.getBlobStatus(urlDraft)).toBe('DRAFT');
    expect(URL.revokeObjectURL).not.toHaveBeenCalledWith(urlDraft);
  });

  it('releaseRecordBlobs only revokes committed blobs for the target recordId and leaves other records intact', () => {
    const fileA = new File(['a'], 'a.png', { type: 'image/png' });
    const urlA = evidenceStore.registerDraftBlob(fileA, 'session-1');
    evidenceStore.commitDraftBlobs([urlA], 'record-A');

    const fileB = new File(['b'], 'b.png', { type: 'image/png' });
    const urlB = evidenceStore.registerDraftBlob(fileB, 'session-1');
    evidenceStore.commitDraftBlobs([urlB], 'record-B');

    evidenceStore.releaseRecordBlobs('record-A');

    expect(evidenceStore.isBlobActive(urlA)).toBe(false);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith(urlA);

    expect(evidenceStore.isBlobActive(urlB)).toBe(true);
    expect(URL.revokeObjectURL).not.toHaveBeenCalledWith(urlB);
  });
});

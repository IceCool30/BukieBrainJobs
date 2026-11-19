// apps/web/lib/disputes/evidence-store.ts
// BW-010: Dispute Handling & Support Interface
// Client-side evidence blob URL lifecycle and session ownership manager

type BlobStatus = 'DRAFT' | 'COMMITTED';

interface BlobEntry {
  url: string;
  status: BlobStatus;
  sessionId: string;
  recordId?: string | undefined;
}

class EvidenceStore {
  private registry = new Map<string, BlobEntry>();

  registerDraftBlob(file: File, sessionId: string = 'default'): string {
    if (typeof URL === 'undefined' || typeof URL.createObjectURL !== 'function') {
      throw new Error('Object URL creation is not supported in this environment.');
    }

    const url = URL.createObjectURL(file);
    this.registry.set(url, {
      url,
      status: 'DRAFT',
      sessionId,
    });
    return url;
  }

  releaseDraftBlob(url: string, sessionId?: string): void {
    const entry = this.registry.get(url);
    if (!entry) {
      return;
    }

    if (entry.status === 'DRAFT' && (!sessionId || entry.sessionId === sessionId)) {
      if (typeof URL !== 'undefined' && typeof URL.revokeObjectURL === 'function') {
        URL.revokeObjectURL(url);
      }
      this.registry.delete(url);
    }
  }

  commitDraftBlobs(urls: string[], recordId: string = 'default'): void {
    for (const url of urls) {
      const entry = this.registry.get(url);
      if (entry && entry.status === 'DRAFT') {
        entry.status = 'COMMITTED';
        entry.recordId = recordId;
      }
    }
  }

  revertCommittedBlobsToDraft(urls: string[]): void {
    for (const url of urls) {
      const entry = this.registry.get(url);
      if (entry && entry.status === 'COMMITTED') {
        entry.status = 'DRAFT';
        entry.recordId = undefined;
      }
    }
  }

  clearDraftBlobs(sessionId?: string): void {
    const targetUrls: string[] = [];
    for (const [url, entry] of this.registry.entries()) {
      if (entry.status === 'DRAFT') {
        if (!sessionId || entry.sessionId === sessionId) {
          targetUrls.push(url);
        }
      }
    }

    for (const url of targetUrls) {
      this.releaseDraftBlob(url, sessionId);
    }
  }

  releaseRecordBlobs(recordId: string): void {
    const targetUrls: string[] = [];
    for (const [url, entry] of this.registry.entries()) {
      if (entry.status === 'COMMITTED' && entry.recordId === recordId) {
        targetUrls.push(url);
      }
    }
    this.releaseCommittedBlobs(targetUrls);
  }

  releaseCommittedBlobs(urls: string[]): void {
    for (const url of urls) {
      const entry = this.registry.get(url);
      if (entry && entry.status === 'COMMITTED') {
        if (typeof URL !== 'undefined' && typeof URL.revokeObjectURL === 'function') {
          URL.revokeObjectURL(url);
        }
        this.registry.delete(url);
      }
    }
  }

  isBlobActive(url: string): boolean {
    return this.registry.has(url);
  }

  getBlobStatus(url: string): BlobStatus | null {
    const entry = this.registry.get(url);
    return entry ? entry.status : null;
  }

  getBlobSessionId(url: string): string | null {
    const entry = this.registry.get(url);
    return entry ? entry.sessionId : null;
  }

  getBlobRecordId(url: string): string | null {
    const entry = this.registry.get(url);
    return entry?.recordId ?? null;
  }

  resetForTests(): void {
    for (const [url] of this.registry.entries()) {
      if (typeof URL !== 'undefined' && typeof URL.revokeObjectURL === 'function') {
        URL.revokeObjectURL(url);
      }
    }
    this.registry.clear();
  }
}

export const evidenceStore = new EvidenceStore();

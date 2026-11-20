import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  OFFLINE_CACHE_DISCLAIMER,
  SAMPLE_CACHED_RECORDS,
} from '../lib/offline-cache-preview';

declare const __dirname: string;

const mobileRoot = resolve(__dirname, '..');
const readMobileFile = (path: string) =>
  readFileSync(resolve(mobileRoot, path), 'utf8').replace(/\r\n/g, '\n');

describe('MOB-OFFLINE-001 Native BrainWorker Offline Caching & Local Storage Preview', () => {
  const workspaceSource = readMobileFile('app/brainworker/workspace-preview.tsx');
  const libSource = readMobileFile('lib/offline-cache-preview.ts');

  it('imports domain structures and helpers from offline-cache-preview', () => {
    expect(workspaceSource).toContain("from '../../lib/offline-cache-preview'");
    expect(workspaceSource).toContain('OFFLINE_CACHE_DISCLAIMER');
    expect(workspaceSource).toContain('SAMPLE_CACHED_RECORDS');
    expect(workspaceSource).toContain('createInitialOfflineCacheState');
    expect(workspaceSource).toContain('toggleSimulatedNetwork');
    expect(workspaceSource).toContain('startSyncSimulation');
    expect(workspaceSource).toContain('completeSyncSimulation');
    expect(workspaceSource).toContain('getNetworkStatusLabel');
    expect(workspaceSource).toContain('getCacheSyncStatusLabel');
  });

  it('contains the persistent offline cache preview disclaimer card and disclaimer text', () => {
    expect(workspaceSource).toContain('OfflineNoticeCard');
    expect(workspaceSource).toContain('OFFLINE_CACHE_DISCLAIMER');
    expect(OFFLINE_CACHE_DISCLAIMER).toBe(
      'Sample offline caching preview. Network status, cache synchronization, and stored records are simulated local previews. No native SQLite database is opened, no background sync daemons run, and no device storage is allocated.'
    );
  });

  it('renders OfflineCacheSection in the workspace feed view', () => {
    expect(workspaceSource).toContain('OfflineCacheSection');
    expect(workspaceSource).toContain('<OfflineCacheSection');
    expect(workspaceSource).toContain('WorkspaceFeedView');
  });

  it('implements network status toggle with switch accessibility role and checked state', () => {
    expect(workspaceSource).toContain('NetworkToggleRow');
    const toggleMatch = workspaceSource.match(/function NetworkToggleRow[\s\S]*?\n\}/);
    expect(toggleMatch).not.toBeNull();
    const toggleCode = toggleMatch![0];
    expect(toggleCode).toContain('accessibilityRole="switch"');
    expect(toggleCode).toContain('accessibilityLabel="Toggle simulated network status"');
    expect(toggleCode).toContain('accessibilityState={{ checked: isOnline }}');
  });

  it('implements SyncTriggerButton with concentric outer focus ring and 48dp target', () => {
    expect(workspaceSource).toContain('SyncTriggerButton');
    const buttonMatch = workspaceSource.match(/function SyncTriggerButton[\s\S]*?\n\}/);
    expect(buttonMatch).not.toBeNull();
    const buttonCode = buttonMatch![0];
    expect(buttonCode).toContain('isFocused');
    expect(buttonCode).toContain('setIsFocused(true)');
    expect(buttonCode).toContain('setIsFocused(false)');
    expect(buttonCode).toContain('outerFocusRing');
    expect(buttonCode).toContain('accessibilityRole="button"');
  });

  it('renders CachedRecordsDrawer and CachedRecordRow with sample records', () => {
    expect(workspaceSource).toContain('CachedRecordsDrawer');
    expect(workspaceSource).toContain('CachedRecordRow');
    expect(SAMPLE_CACHED_RECORDS.length).toBeGreaterThanOrEqual(4);
    for (const record of SAMPLE_CACHED_RECORDS) {
      expect(record.title).toBeTruthy();
      expect(record.subtitle).toBeTruthy();
    }
  });

  it('proves zero native SQLite drivers or unmocked database packages are used', () => {
    expect(workspaceSource).not.toContain('expo-sqlite');
    expect(workspaceSource).not.toContain('sqlite3');
    expect(libSource).not.toContain('expo-sqlite');
    expect(libSource).not.toContain('sqlite3');
  });

  it('proves zero background sync daemons or task managers are registered', () => {
    expect(workspaceSource).not.toContain('expo-task-manager');
    expect(workspaceSource).not.toContain('expo-background-fetch');
    expect(libSource).not.toContain('expo-task-manager');
    expect(libSource).not.toContain('expo-background-fetch');
  });

  it('proves zero device file system mutations or disk writes occur', () => {
    expect(workspaceSource).not.toContain('expo-file-system');
    expect(libSource).not.toContain('expo-file-system');
  });

  it('strictly adheres to Mr. Solomon Natural Voice with zero em dashes across all files', () => {
    expect(OFFLINE_CACHE_DISCLAIMER).not.toContain('—');
    expect(OFFLINE_CACHE_DISCLAIMER).not.toContain('--');
    expect(workspaceSource).not.toContain('—');
    expect(libSource).not.toContain('—');
  });

  it('keeps all offline-cache component and helper functions at 25 lines or fewer', () => {
    const offlineFunctions = [
      'OfflineNoticeCard',
      'NetworkToggleRow',
      'CacheSyncSummaryCard',
      'SyncTriggerButton',
      'CachedRecordRow',
      'CachedRecordsDrawer',
      'OfflineCacheSection',
    ];
    for (const fnName of offlineFunctions) {
      const regex = new RegExp(`function ${fnName}[\\s\\S]*?\\n\\}`);
      const match = workspaceSource.match(regex);
      expect(match, `Function ${fnName} should exist in workspace-preview.tsx`).not.toBeNull();
      const lineCount = match![0].split('\n').length;
      expect(
        lineCount,
        `Function ${fnName} has ${lineCount} lines, expected <= 25`
      ).toBeLessThanOrEqual(25);
    }
  });
});

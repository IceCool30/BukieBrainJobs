import { describe, expect, it } from 'vitest';
import {
  OFFLINE_CACHE_DISCLAIMER,
  SAMPLE_CACHED_RECORDS,
  createInitialOfflineCacheState,
  toggleSimulatedNetwork,
  startSyncSimulation,
  completeSyncSimulation,
  filterCachedRecordsByCategory,
  getNetworkStatusLabel,
  getCacheSyncStatusLabel,
  getCategoryLabel,
  type CachedRecordCategory,
  type OfflineCacheState,
} from './offline-cache-preview';

describe('offline-cache-preview domain fixtures and disclaimers', () => {
  it('exposes the truthful offline cache preview disclaimer with zero em dashes', () => {
    expect(OFFLINE_CACHE_DISCLAIMER).toBe(
      'Sample offline caching preview. Network status, cache synchronization, and stored records are simulated local previews. No native SQLite database is opened, no background sync daemons run, and no device storage is allocated.'
    );
    expect(OFFLINE_CACHE_DISCLAIMER).not.toContain('—');
    expect(OFFLINE_CACHE_DISCLAIMER).not.toContain('--');
  });

  it('provides deterministic sample cached records covering services, leads, and schedule', () => {
    expect(SAMPLE_CACHED_RECORDS.length).toBeGreaterThanOrEqual(4);
    const categories = SAMPLE_CACHED_RECORDS.map((item) => item.category);
    expect(categories).toContain('SERVICES');
    expect(categories).toContain('LEADS');
    expect(categories).toContain('SCHEDULE');
  });

  it('contains truthful sample descriptions with zero em dashes in all records', () => {
    for (const record of SAMPLE_CACHED_RECORDS) {
      expect(record.title).not.toContain('—');
      expect(record.title).not.toContain('--');
      expect(record.subtitle).not.toContain('—');
      expect(record.subtitle).not.toContain('--');
      expect(record.cachedTimestamp).toBeTruthy();
    }
  });
});

describe('offline-cache-preview pure state helpers', () => {
  it('creates initial state in ONLINE mode with SYNCED status and sample records', () => {
    const state = createInitialOfflineCacheState();
    expect(state.simulatedNetwork).toBe('ONLINE');
    expect(state.syncStatus).toBe('SYNCED');
    expect(state.isSyncing).toBe(false);
    expect(state.cachedRecords.length).toBe(SAMPLE_CACHED_RECORDS.length);
    expect(state.lastSyncFormatted).toContain('Sample sync');
  });

  it('allows overriding initial offline cache state fields', () => {
    const custom = createInitialOfflineCacheState({
      simulatedNetwork: 'SIMULATED_OFFLINE',
      syncStatus: 'OFFLINE_CACHED',
    });
    expect(custom.simulatedNetwork).toBe('SIMULATED_OFFLINE');
    expect(custom.syncStatus).toBe('OFFLINE_CACHED');
  });

  it('toggles network mode between ONLINE and SIMULATED_OFFLINE', () => {
    const onlineState = createInitialOfflineCacheState();
    expect(onlineState.simulatedNetwork).toBe('ONLINE');

    const offlineState = toggleSimulatedNetwork(onlineState);
    expect(offlineState.simulatedNetwork).toBe('SIMULATED_OFFLINE');
    expect(offlineState.syncStatus).toBe('OFFLINE_CACHED');

    const restoredOnlineState = toggleSimulatedNetwork(offlineState);
    expect(restoredOnlineState.simulatedNetwork).toBe('ONLINE');
    expect(restoredOnlineState.syncStatus).toBe('SYNCED');
  });

  it('transitions through sync simulation states start and complete', () => {
    const initial = createInitialOfflineCacheState();
    const syncing = startSyncSimulation(initial);
    expect(syncing.isSyncing).toBe(true);
    expect(syncing.syncStatus).toBe('SYNCING');

    const completed = completeSyncSimulation(syncing);
    expect(completed.isSyncing).toBe(false);
    expect(completed.syncStatus).toBe('SYNCED');
    expect(completed.lastSyncFormatted).toBe('Just now (sample)');
  });

  it('filters cached records by category cleanly', () => {
    const records = SAMPLE_CACHED_RECORDS;
    const services = filterCachedRecordsByCategory(records, 'SERVICES');
    expect(services.every((r) => r.category === 'SERVICES')).toBe(true);
    expect(services.length).toBeGreaterThanOrEqual(2);

    const leads = filterCachedRecordsByCategory(records, 'LEADS');
    expect(leads.every((r) => r.category === 'LEADS')).toBe(true);
    expect(leads.length).toBeGreaterThanOrEqual(1);

    const all = filterCachedRecordsByCategory(records, 'ALL');
    expect(all.length).toBe(records.length);
  });

  it('returns human labels for network and cache statuses without corporate jargon', () => {
    expect(getNetworkStatusLabel('ONLINE')).toBe('Online (Sample Live)');
    expect(getNetworkStatusLabel('SIMULATED_OFFLINE')).toBe('Simulated Offline (Sample Cache)');
    expect(getCacheSyncStatusLabel('SYNCED')).toBe('Synchronized');
    expect(getCacheSyncStatusLabel('SYNCING')).toBe('Synchronizing...');
    expect(getCacheSyncStatusLabel('OFFLINE_CACHED')).toBe('Cached Locally');
  });

  it('returns human category labels without em dashes', () => {
    expect(getCategoryLabel('SERVICES')).toBe('Services');
    expect(getCategoryLabel('LEADS')).toBe('Leads');
    expect(getCategoryLabel('SCHEDULE')).toBe('Schedule');
  });
});

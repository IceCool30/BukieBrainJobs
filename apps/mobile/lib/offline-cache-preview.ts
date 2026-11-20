/**
 * MOB-OFFLINE-001: Native BrainWorker Offline Caching & Local Storage Preview.
 * Pure domain contracts, state structures, and in-memory simulation helpers.
 */

export type SimulatedNetworkMode = 'ONLINE' | 'SIMULATED_OFFLINE';

export type CacheSyncStatus = 'SYNCED' | 'SYNCING' | 'OFFLINE_CACHED';

export type CachedRecordCategory = 'SERVICES' | 'LEADS' | 'SCHEDULE';

export interface CachedRecordItem {
  readonly id: string;
  readonly category: CachedRecordCategory;
  readonly title: string;
  readonly subtitle: string;
  readonly cachedTimestamp: string;
}

export interface OfflineCacheSummary {
  readonly simulatedNetwork: SimulatedNetworkMode;
  readonly syncStatus: CacheSyncStatus;
  readonly totalStorageFormatted: string;
  readonly lastSyncFormatted: string;
  readonly cachedItemsCount: number;
}

export interface OfflineCacheState {
  readonly simulatedNetwork: SimulatedNetworkMode;
  readonly syncStatus: CacheSyncStatus;
  readonly cachedRecords: readonly CachedRecordItem[];
  readonly isSyncing: boolean;
  readonly lastSyncFormatted: string;
}

export const OFFLINE_CACHE_DISCLAIMER =
  'Sample offline caching preview. Network status, cache synchronization, and stored records are simulated local previews. No native SQLite database is opened, no background sync daemons run, and no device storage is allocated.';

export const SAMPLE_CACHED_RECORDS: readonly CachedRecordItem[] = Object.freeze([
  {
    id: 'cache-srv-01',
    category: 'SERVICES',
    title: 'Generator Diagnostic & Repair (Sample)',
    subtitle: '₦12,500 base rate · 8 parts cataloged',
    cachedTimestamp: 'Cached today at 07:15',
  },
  {
    id: 'cache-srv-02',
    category: 'SERVICES',
    title: 'AC Inverter Troubleshooting (Sample)',
    subtitle: '₦15,000 base rate · 12 diagnostic checklists',
    cachedTimestamp: 'Cached today at 07:15',
  },
  {
    id: 'cache-lead-01',
    category: 'LEADS',
    title: 'Lekki Phase 1 Emergency Power Lead (Sample)',
    subtitle: 'Admiralty Way · Customer phone and address cached',
    cachedTimestamp: 'Cached 25 mins ago',
  },
  {
    id: 'cache-sched-01',
    category: 'SCHEDULE',
    title: 'Weekly Availability Windows (Sample)',
    subtitle: 'Mon-Fri 08:00 - 17:00 · 3 confirmed arrival slots',
    cachedTimestamp: 'Cached yesterday',
  },
]);

export function createInitialOfflineCacheState(
  overrides?: Partial<OfflineCacheState>
): OfflineCacheState {
  return {
    simulatedNetwork: 'ONLINE',
    syncStatus: 'SYNCED',
    cachedRecords: SAMPLE_CACHED_RECORDS,
    isSyncing: false,
    lastSyncFormatted: 'Sample sync 12 minutes ago',
    ...overrides,
  };
}

export function toggleSimulatedNetwork(
  state: OfflineCacheState
): OfflineCacheState {
  const nextMode: SimulatedNetworkMode =
    state.simulatedNetwork === 'ONLINE' ? 'SIMULATED_OFFLINE' : 'ONLINE';
  const nextStatus: CacheSyncStatus =
    nextMode === 'ONLINE' ? 'SYNCED' : 'OFFLINE_CACHED';
  return {
    ...state,
    simulatedNetwork: nextMode,
    syncStatus: nextStatus,
  };
}

export function startSyncSimulation(
  state: OfflineCacheState
): OfflineCacheState {
  return {
    ...state,
    isSyncing: true,
    syncStatus: 'SYNCING',
  };
}

export function completeSyncSimulation(
  state: OfflineCacheState
): OfflineCacheState {
  return {
    ...state,
    isSyncing: false,
    syncStatus: 'SYNCED',
    lastSyncFormatted: 'Just now (sample)',
  };
}

export function filterCachedRecordsByCategory(
  records: readonly CachedRecordItem[],
  category: CachedRecordCategory | 'ALL'
): readonly CachedRecordItem[] {
  if (category === 'ALL') {
    return records;
  }
  return records.filter((record) => record.category === category);
}

export function getNetworkStatusLabel(mode: SimulatedNetworkMode): string {
  if (mode === 'ONLINE') {
    return 'Online (Sample Live)';
  }
  return 'Simulated Offline (Sample Cache)';
}

export function getCacheSyncStatusLabel(status: CacheSyncStatus): string {
  switch (status) {
    case 'SYNCED':
      return 'Synchronized';
    case 'SYNCING':
      return 'Synchronizing...';
    case 'OFFLINE_CACHED':
      return 'Cached Locally';
  }
}

export function getCategoryLabel(category: CachedRecordCategory): string {
  switch (category) {
    case 'SERVICES':
      return 'Services';
    case 'LEADS':
      return 'Leads';
    case 'SCHEDULE':
      return 'Schedule';
  }
}

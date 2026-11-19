# MOB-OFFLINE-001: Native BrainWorker Offline Caching & Local Storage Preview (UI-Only)

**Version:** 1.0  
**Status:** Approved for Implementation (UI-Only Preview)  
**Date:** 2026-11-19  
**Phase:** Phase 4.4 Device Capabilities & Push Alerts (`apps/mobile`), Item 4 ("SQLite local database synchronization for offline browsing")  
**Target Route/Component:** `/brainworker/workspace-preview` (`apps/mobile/app/brainworker/workspace-preview.tsx`) and preview support module (`apps/mobile/lib/offline-cache-preview.ts`)  
**Parent Baseline:** `24696fb425bb239f1e16441bf16fa057c2a796e6` (MOB-BIO-001 native biometric authentication preview committed and pushed)  

---

## 1. Overview & Business Intent

In Nigerian urban centers and suburban transit corridors, cellular networks can be intermittent, throttled, or temporarily down during power outages:
1. **Uninterrupted Field Operations**: BrainWorkers out on client sites or traveling between job locations need immediate access to their active service list, emergency call-out pricing, accepted lead directions, and customer contact details without waiting for flaky data connections.
2. **Transparent Cache State**: When connectivity drops, workers need clear visual cues showing what data is securely cached locally, what changes are queued for synchronization, and whether they are viewing live or locally saved records.

In this mobile milestone (`MOB-OFFLINE-001`), offline caching and local storage synchronization are architected strictly as a **UI-only local preview**. BrainWorkers can preview offline storage indicators, toggle simulated network states (online vs simulated offline), inspect cached item summaries (services and leads), trigger in-memory synchronization passes, and observe cache health metrics without opening native SQLite file locks, installing unmocked drivers, running background sync daemons, or performing live network calls.

---

## 2. Scope Boundaries & Strict Prohibitions

### 2.1 In Scope (UI-Only Preview)
1. **In-Memory Network & Cache State**:
   - Connection status simulation: `ONLINE` vs `SIMULATED_OFFLINE`.
   - Cache synchronization status: `SYNCED`, `SYNCING`, `OFFLINE_CACHED`.
   - Simulated storage metrics: sample storage footprint (`1.8 MB (sample)`), record counts (e.g. 8 services cached, 3 leads cached, 1 active schedule cached), and last sync timestamp (`Sample sync 12 minutes ago`).
2. **Interactive Offline Simulation Flow**:
   - "Offline Storage & Sync" preview card in `/brainworker/workspace-preview`.
   - Network simulation toggle: Switch between "Simulate Offline" and "Go Online" states with immediate visual feedback.
   - Manual sync trigger button with concentric outer focus ring and simulated sync progress state.
   - Cache summary breakdown showing cached record categories and storage utilization.
   - Sample cached records viewer allowing inspection of locally available services and leads while simulated offline.
3. **Truthful Preview Notice**:
   - Visible, persistent disclaimer banner stating that offline caching, network connectivity, and synchronization states are simulated local previews, no native SQLite database is opened, no background sync daemons run, and no device file system storage is allocated.
4. **Accessibility & Design Tokens**:
   - Full support for THEME-001 dark and light modes.
   - All interactive touch targets >= 48dp.
   - High-contrast text (>= 4.5:1) and UI borders/focus indicators (>= 3:1).
   - Concentric outer focus ring on primary filled CTA buttons with 2dp visual separation gap and `c.amber`.
   - Every component and helper function must remain at 25 lines or fewer.

### 2.2 Strict Technical Prohibitions (Non-Goals)
1. **Zero Native SQLite Database Drivers**:
   - Do NOT invoke `expo-sqlite` or any unmocked native database libraries.
   - Zero SQLite database file handles, migrations, table creation, or file locks.
2. **Zero Background Network Sync Daemons**:
   - Do NOT register background task workers (`expo-task-manager`, `expo-background-fetch`).
   - Zero background services, socket listeners, or periodic sync intervals.
3. **Zero Device File System Mutations**:
   - Do NOT write cache files to disk (`expo-file-system`).
   - All cache records and sync states exist strictly in React component memory.
4. **Zero Backend Network Requests**:
   - Do NOT trigger live network fetch requests or API synchronization endpoints.
5. **Zero Corporate Slop & Zero Em Dashes**:
   - Adhere strictly to Mr. Solomon Natural Voice. Direct, honest, human tone. Never use em dashes.

---

## 3. Domain Model & In-Memory Data Structures

### 3.1 Types (`apps/mobile/lib/offline-cache-preview.ts`)

```typescript
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
```

### 3.2 Canonical Sample Configuration

```typescript
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
```

---

## 4. Component Architecture & Function Sizing

To satisfy the repository standard of functions remaining at 25 lines or fewer, the UI is decomposed into small, focused subcomponents:

1. **`OfflineNoticeCard`** (<= 25 lines):
   - Renders the disclaimer banner stating this is a simulated local offline caching preview.
2. **`NetworkStatusToggleCard`** (<= 25 lines):
   - Renders current connection badge (`Online` vs `Simulated Offline`) and toggle action button.
3. **`CacheSyncSummaryCard`** (<= 25 lines):
   - Renders cache sync state (`Synced`, `Syncing`, or `Offline Cached`), storage footprint, and last sync timestamp.
4. **`SyncTriggerButton`** (<= 25 lines):
   - Interactive CTA allowing manual cache sync simulation with concentric outer focus ring.
5. **`CachedRecordRow`** (<= 25 lines):
   - Renders an individual cached record row with category tag, title, and cached time.
6. **`CachedRecordsDrawer`** (<= 25 lines):
   - Renders list of cached items available for offline viewing with count badges.
7. **`OfflineCachePreview`** (<= 25 lines):
   - Container component coordinating state, network toggle, sync simulation, and records view.

---

## 5. UI/UX Specifications & Visual Tokens

### 5.1 Color Tokens & Contrast (THEME-001)

| Element | Dark Mode | Light Mode | Target Contrast |
|---|---|---|---|
| Card Background | `#13171E` | `#FFFFFF` | Canvas base |
| Primary Text | `#F0F4F9` | `#001A41` | >= 7:1 against card |
| Muted Text / Captions | `#8897AB` | `#53647A` | >= 4.5:1 against card |
| Online Indicator | `#10B981` | `#059669` | >= 4.5:1 against card |
| Offline Indicator | `#F59E0B` | `#D97706` | >= 4.5:1 against card |
| Action Button Fill | `#F7803C` | `#C2410C` | High visibility |
| Action Button Text | `#001A41` | `#FFFFFF` | >= 5.4:1 against button |
| Focus Ring Outer | `#F7803C` | `#C2410C` | 7.27:1 (dark), 5.41:1 (light) |

### 5.2 Geometry & Touch Targets
- Action Buttons: Minimum 48dp height, 9999px pill border radius.
- Network Toggle Pressable: 48dp minimum touch target height.
- Focus Rings: Absolute position with 2dp outer visual gap and 2dp border width (`top: -4`, `bottom: -4`, `left: -4`, `right: -4`).
- List items: Minimum 48dp height per cached item row.

---

## 6. Testing & Quality Gates

The test suite must be placed in `apps/mobile/app/offline-cache.test.ts` and `apps/mobile/lib/offline-cache-preview.test.ts`, verifying:
1. **Contract Invariants**:
   - Initial offline cache configuration, network mode, and sync status defaults.
   - Cache record categorization and sample data integrity.
2. **Interactive Simulation Behavior**:
   - Toggling network mode transitions between online and simulated offline cleanly.
   - Triggering sync pass updates status to syncing, then completes to synced.
   - Viewing cached records presents items with correct status indicators.
3. **Safety & Zero-Driver Verifications**:
   - Verifies zero `expo-sqlite` or native database drivers are invoked.
   - Verifies zero background sync daemons are registered.
   - Verifies zero file system writes or network requests occur.
4. **Code Quality**:
   - All component and helper functions strictly <= 25 lines.
   - TypeScript compiler passes with exit code 0.

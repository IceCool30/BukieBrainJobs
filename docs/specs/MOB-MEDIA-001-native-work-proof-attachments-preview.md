# MOB-MEDIA-001: Native BrainWorker Work Proof & Photo Attachment Picker Preview (UI-Only)

**Version:** 1.0
**Status:** Approved for Implementation (UI-Only Preview)
**Date:** 2026-11-19
**Phase:** Phase 4.4 Device Capabilities & Push Alerts (`apps/mobile`), Item 2 ("Camera and photo gallery access for work proofs and attachments")
**Target Route/Component:** `/brainworker/workspace-preview` (`apps/mobile/app/brainworker/workspace-preview.tsx`) and preview support module (`apps/mobile/lib/work-proof-preview.ts`)
**Parent Baseline:** `866bdbf7a049cb6fe513eacdb6f30ecf38269962` (Concentric outer focus rings committed and pushed)

---

## 1. Overview & Business Intent

In the BukieBrainJobs marketplace lifecycle, verified physical evidence protects both parties:
1. **Job Completion Verification (`BW-009`)**: BrainWorkers document completed tasks by providing clear before and after photographs prior to escrow release.
2. **Dispute Handling & Resolution (`BW-010`)**: Transparent photographic records establish on-the-ground proof if scope disputes or quality claims arise.

In this mobile milestone (`MOB-MEDIA-001`), photo capture and gallery selection are architected strictly as a **UI-only local preview**. BrainWorkers can preview the interaction flow for inspecting, selecting, attaching, and reviewing work proof photos without invoking unmocked native hardware drivers, requesting operating system permissions, or uploading assets to external cloud storage.

All media in this slice is sourced from local in-memory sample data representing common Nigerian skilled trade workflows (such as generator repair, air conditioner servicing, and plumbing maintenance).

---

## 2. Scope Boundaries & Strict Prohibitions

### 2.1 In Scope (UI-Only Preview)
1. **In-Memory Work Proof State**:
   - Local state managing attachments across two standard categories: `BEFORE` (work site condition upon arrival) and `AFTER` (finished repair condition).
   - Dynamic attachment counts bounded by an explicit maximum limit (3 photos per category).
2. **Preset Sample Asset Library**:
   - Curated list of deterministic trade repair sample photos with descriptive captions, file sizes, and timestamps.
   - Trade scenarios: Generator maintenance, AC system recharge, and PVC pipe leak repair.
3. **Interactive Attachment Flow**:
   - "Attach Sample Photo" trigger with concentric outer focus ring.
   - Selection modal allowing the user to pick from available sample library assets.
   - Thumbnail gallery with clear visual badges indicating category and state.
   - Full photo detail preview modal displaying enlarged image, technical metadata, and close action.
   - Remove photo action with 48dp minimum hit target.
4. **Truthful Preview Notice**:
   - Visible, persistent disclaimer stating that all photos are simulated local samples, no camera hardware is accessed, and no files are uploaded to remote servers.
5. **Accessibility & Design Tokens**:
   - Full support for THEME-001 dark and light modes.
   - All interactive touch targets >= 48dp.
   - High-contrast text (>= 4.5:1) and UI borders/focus indicators (>= 3:1).
   - Concentric outer focus ring on primary filled actions with 2dp separation gap and `c.amber`.
   - Every component function must remain at 25 lines or fewer.

### 2.2 Strict Technical Prohibitions (Non-Goals)
1. **Zero Native Camera or Gallery Hardware Drivers**:
   - Do NOT invoke live `expo-camera` or `expo-image-picker` with real hardware hooks.
   - Zero operating system permission prompts (no iOS `NSCameraUsageDescription` or Android `CAMERA` runtime dialogs).
2. **Zero Remote Cloud Uploads**:
   - Do NOT connect to AWS S3, Cloudinary, Google Cloud Storage, Firebase, or custom multipart HTTP endpoints.
   - Zero network requests (`fetch`, Axios, XMLHttpRequest, or WebSocket).
3. **Zero Persistence Side Effects**:
   - Do NOT write to AsyncStorage, SQLite, MMKV, or file caches.
   - State resets cleanly on unmount or screen navigation.
4. **Zero Booking State Mutations**:
   - This preview does NOT alter booking lifecycle status, escrow holds, or payment balances.
5. **Zero Corporate Slop & Zero Em Dashes**:
   - Adhere strictly to Mr. Solomon Natural Voice. Plain, honest, direct language. Never use em dashes.

---

## 3. Domain Model & In-Memory Data Structures

### 3.1 Types (`apps/mobile/lib/work-proof-preview.ts`)

```typescript
export type WorkProofCategory = 'BEFORE' | 'AFTER';

export interface WorkProofSampleAsset {
  readonly id: string;
  readonly trade: 'GENERATOR' | 'HVAC' | 'PLUMBING';
  readonly category: WorkProofCategory;
  readonly title: string;
  readonly caption: string;
  readonly simulatedFileSize: string;
  readonly simulatedDimensions: string;
  readonly sampleUri: string;
}

export interface AttachedWorkProof {
  readonly id: string;
  readonly assetId: string;
  readonly category: WorkProofCategory;
  readonly title: string;
  readonly caption: string;
  readonly attachedAt: string;
  readonly simulatedFileSize: string;
  readonly sampleUri: string;
}
```

### 3.2 Canonical Trade Sample Catalog

The sample catalog provides authentic Nigerian trade scenarios:
1. **Generator Overhaul**:
   - Before: "Worn air filter and oil deposit around carburetor"
   - After: "Cleaned carburetor, installed OEM air filter, tested stable idle"
2. **AC Maintenance**:
   - Before: "Dust-clogged condenser coils and low refrigerant pressure"
   - After: "Pressure-washed condenser coils, R22 recharge verified at 65 PSI"
3. **Plumbing Pipe Repair**:
   - Before: "Cracked PVC main joint with active water seepage"
   - After: "Installed heavy-duty PVC union fitting, pressure-tested 30 minutes"

---

## 4. Component Architecture & Function Sizing

To satisfy the repository standard of functions remaining at 25 lines or fewer, the UI is decomposed into small, focused subcomponents:

1. **`WorkProofNoticeCard`** (<= 25 lines):
   - Renders the disclaimer banner stating this is a simulated local preview with no camera permissions or cloud uploads.
2. **`CategoryTabSelector`** (<= 25 lines):
   - Renders "Before Work" and "After Work" tabs with current count badges.
3. **`WorkProofThumbnail`** (<= 25 lines):
   - Displays sample photo thumbnail with caption and 48dp remove button.
4. **`WorkProofEmptyState`** (<= 25 lines):
   - Clean, high-contrast placeholder when no sample photos are attached in the active category.
5. **`AttachSampleButton`** (<= 25 lines):
   - Primary CTA with concentric outer focus ring, opening sample selection modal.
6. **`SamplePickerModal`** (<= 25 lines):
   - Modal sheet listing available sample assets matching the active category.
7. **`PhotoDetailModal`** (<= 25 lines):
   - Inspection modal showing enlarged sample photo, caption, metadata, and close button.
8. **`WorkProofPickerPreview`** (<= 25 lines):
   - Container component coordinating active category, attached list, and modal visibility states.

---

## 5. UI/UX Specifications & Visual Tokens

### 5.1 Color Tokens & Contrast (THEME-001)

| Element | Dark Mode | Light Mode | Target Contrast |
|---|---|---|---|
| Card Background | `#13171E` | `#FFFFFF` | Canvas base |
| Primary Text | `#F0F4F9` | `#001A41` | >= 7:1 against card |
| Muted Text / Captions | `#8897AB` | `#53647A` | >= 4.5:1 against card |
| Action Button Fill | `#F7803C` | `#C2410C` | High visibility |
| Action Button Text | `#001A41` | `#FFFFFF` | >= 5.4:1 against button |
| Focus Ring Outer | `#F7803C` | `#C2410C` | 7.27:1 (dark), 5.41:1 (light) |
| Remove Icon / Danger | `#FF6B6B` | `#DC2626` | >= 4.5:1 against card |

### 5.2 Geometry & Touch Targets
- Action Buttons: Minimum 48dp height, 9999px pill border radius.
- Thumbnail Remove Pressable: 48x48dp minimum touch target area.
- Focus Rings: Absolute position with 2dp outer visual gap and 2dp border width (`top: -4`, `bottom: -4`, `left: -4`, `right: -4`).
- Modals: Accessible `Modal` with `onRequestClose` for hardware Android back button support.

---

## 6. Testing & Quality Gates

The test suite must be placed in `apps/mobile/app/work-proof-preview.test.ts` and verify:
1. **Contract Invariants**:
   - Initial state starts with predetermined sample attachments or clean empty state.
   - Maximum 3 attachments enforced per category (attempting to attach a 4th is blocked).
   - Category switching correctly filters visible thumbnails.
2. **Interaction Correctness**:
   - Attaching a sample photo updates in-memory list without side-effects.
   - Removing an attachment removes only the targeted photo.
   - Tapping thumbnail opens photo detail view.
3. **Safety & Security Verifications**:
   - Verifies zero network requests are initiated.
   - Verifies zero storage writes are made.
   - Verifies zero native camera or gallery modules are called.
4. **Code Quality**:
   - All component and helper functions strictly <= 25 lines.
   - TypeScript compiler passes with exit code 0.

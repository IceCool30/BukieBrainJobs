export type WorkProofCategory = 'BEFORE' | 'AFTER';
export type WorkProofTrade = 'GENERATOR' | 'HVAC' | 'PLUMBING';

export interface WorkProofSampleAsset {
  readonly id: string;
  readonly trade: WorkProofTrade;
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

export const WORK_PROOF_DISCLAIMER =
  'Sample work proof preview. Photos are simulated local trade samples. No camera hardware is accessed, and no files are uploaded to remote servers.';

export const MAX_WORK_PROOFS_PER_CATEGORY = 3;

export const SAMPLE_WORK_PROOF_ASSETS: readonly WorkProofSampleAsset[] = Object.freeze([
  Object.freeze({
    id: 'asset_gen_before_01',
    trade: 'GENERATOR',
    category: 'BEFORE',
    title: 'Worn air filter and oil deposit around carburetor',
    caption: 'Heavy soot and oil buildup on carburetor manifold before servicing',
    simulatedFileSize: '1.8 MB',
    simulatedDimensions: '1920x1080',
    sampleUri: 'mock://proofs/generator-before.jpg',
  }),
  Object.freeze({
    id: 'asset_gen_after_01',
    trade: 'GENERATOR',
    category: 'AFTER',
    title: 'Cleaned carburetor and installed OEM air filter',
    caption: 'Carburetor degreased, new OEM filter fitted, idling smoothly at 50Hz',
    simulatedFileSize: '2.1 MB',
    simulatedDimensions: '1920x1080',
    sampleUri: 'mock://proofs/generator-after.jpg',
  }),
  Object.freeze({
    id: 'asset_hvac_before_01',
    trade: 'HVAC',
    category: 'BEFORE',
    title: 'Dust-clogged condenser coils and low refrigerant pressure',
    caption: 'Condenser fins clogged with dust, pressure reading below normal operating range',
    simulatedFileSize: '1.5 MB',
    simulatedDimensions: '1920x1080',
    sampleUri: 'mock://proofs/ac-before.jpg',
  }),
  Object.freeze({
    id: 'asset_hvac_after_01',
    trade: 'HVAC',
    category: 'AFTER',
    title: 'Pressure-washed condenser coils and R22 recharge verified',
    caption: 'Coils thoroughly cleaned, pressure recharged to manufacturer specification',
    simulatedFileSize: '1.9 MB',
    simulatedDimensions: '1920x1080',
    sampleUri: 'mock://proofs/ac-after.jpg',
  }),
  Object.freeze({
    id: 'asset_plumb_before_01',
    trade: 'PLUMBING',
    category: 'BEFORE',
    title: 'Cracked PVC main joint with active water seepage',
    caption: 'Stress crack on 1.5-inch PVC elbow joint causing steady leak',
    simulatedFileSize: '1.4 MB',
    simulatedDimensions: '1920x1080',
    sampleUri: 'mock://proofs/plumbing-before.jpg',
  }),
  Object.freeze({
    id: 'asset_plumb_after_01',
    trade: 'PLUMBING',
    category: 'AFTER',
    title: 'Installed heavy-duty PVC union fitting and tested pressure',
    caption: 'Replacement fitting solvent-welded and pressure-tested without leaking',
    simulatedFileSize: '1.7 MB',
    simulatedDimensions: '1920x1080',
    sampleUri: 'mock://proofs/plumbing-after.jpg',
  }),
]);

export const INITIAL_ATTACHED_WORK_PROOFS: readonly AttachedWorkProof[] = Object.freeze([
  Object.freeze({
    id: 'proof_initial_gen_before',
    assetId: 'asset_gen_before_01',
    category: 'BEFORE',
    title: 'Worn air filter and oil deposit around carburetor',
    caption: 'Heavy soot and oil buildup on carburetor manifold before servicing',
    attachedAt: '2026-11-19T05:15:00Z',
    simulatedFileSize: '1.8 MB',
    sampleUri: 'mock://proofs/generator-before.jpg',
  }),
  Object.freeze({
    id: 'proof_initial_gen_after',
    assetId: 'asset_gen_after_01',
    category: 'AFTER',
    title: 'Cleaned carburetor and installed OEM air filter',
    caption: 'Carburetor degreased, new OEM filter fitted, idling smoothly at 50Hz',
    attachedAt: '2026-11-19T05:45:00Z',
    simulatedFileSize: '2.1 MB',
    sampleUri: 'mock://proofs/generator-after.jpg',
  }),
]);

export function canAttachProof(
  proofs: readonly AttachedWorkProof[],
  category: WorkProofCategory
): boolean {
  const count = proofs.filter((p) => p.category === category).length;
  return count < MAX_WORK_PROOFS_PER_CATEGORY;
}

export function attachWorkProof(
  proofs: readonly AttachedWorkProof[],
  asset: WorkProofSampleAsset
): AttachedWorkProof[] {
  if (!canAttachProof(proofs, asset.category)) {
    return proofs as AttachedWorkProof[];
  }
  if (proofs.some((p) => p.assetId === asset.id)) {
    return proofs as AttachedWorkProof[];
  }
  const newProof: AttachedWorkProof = {
    id: `proof_${asset.id}_${Date.now()}`,
    assetId: asset.id,
    category: asset.category,
    title: asset.title,
    caption: asset.caption,
    attachedAt: new Date().toISOString(),
    simulatedFileSize: asset.simulatedFileSize,
    sampleUri: asset.sampleUri,
  };
  return [...proofs, newProof];
}

export function removeWorkProof(
  proofs: readonly AttachedWorkProof[],
  proofId: string
): AttachedWorkProof[] {
  const filtered = proofs.filter((p) => p.id !== proofId);
  return filtered.length === proofs.length ? (proofs as AttachedWorkProof[]) : filtered;
}

export function getWorkProofsByCategory(
  proofs: readonly AttachedWorkProof[],
  category: WorkProofCategory
): AttachedWorkProof[] {
  return proofs.filter((p) => p.category === category);
}

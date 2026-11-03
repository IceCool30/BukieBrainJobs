import { describe, expect, it } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

declare const __dirname: string;

describe('MOB-WORK-001 Native BrainWorker Workspace Preview Guardrails', () => {
  const mobileRoot = resolve(__dirname, '..');
  const readMobileFile = (relativePath: string) =>
    readFileSync(resolve(mobileRoot, relativePath), 'utf8');

  it('registers brainworker/workspace-preview in root stack layout', () => {
    const layoutContent = readMobileFile('app/_layout.tsx');
    expect(layoutContent).toContain('name="brainworker/workspace-preview"');
  });

  it('provides a clearly labelled sample preview link on brainworker/register.tsx', () => {
    const registerContent = readMobileFile('app/brainworker/register.tsx');
    expect(registerContent).toContain('View Sample Workspace Preview');
    expect(registerContent).toContain("router.push('/brainworker/workspace-preview')");
    expect(registerContent).toContain('accessibilityRole="button"');
    expect(registerContent).toContain('minHeight: 48');
  });

  it('preserves registration submit alert and router replace on register.tsx', () => {
    const registerContent = readMobileFile('app/brainworker/register.tsx');
    expect(registerContent).toContain("notifyRegistered(form.name, () => router.replace('/'))");
    expect(registerContent).not.toContain("router.replace('/brainworker/workspace-preview')");
  });

  it('preserves all five customer tabs unmodified', () => {
    const tabLayout = readMobileFile('app/(tabs)/_layout.tsx');
    expect(tabLayout).toContain("name: 'home'");
    expect(tabLayout).toContain("name: 'services'");
    expect(tabLayout).toContain("name: 'jobs'");
    expect(tabLayout).toContain("name: 'messages'");
    expect(tabLayout).toContain("name: 'profile'");
    expect(tabLayout).not.toContain('workspace');
  });

  it('implements the workspace preview screen with truthful copy and headers', () => {
    expect(existsSync(resolve(mobileRoot, 'app/brainworker/workspace-preview.tsx'))).toBe(true);
    const screenContent = readMobileFile('app/brainworker/workspace-preview.tsx');
    expect(screenContent).toContain('WORKER_WORKSPACE_DISCLAIMER');
    expect(screenContent).toContain('BRAINWORKER WORKSPACE');
    expect(screenContent).toContain('BrainWorker workspace preview');
    expect(screenContent).toContain('Explore sample leads and alert details.');
    expect(screenContent).not.toContain('Inspect sample incoming leads and provider alert layouts.');
    expect(screenContent).toContain('SAMPLE PREVIEW');
  });

  it('renders sample lead alert banner with View sample details action meeting 48dp', () => {
    const screenContent = readMobileFile('app/brainworker/workspace-preview.tsx');
    expect(screenContent).toContain('View sample details');
    expect(screenContent).toContain('accessibilityRole="button"');
    expect(screenContent).toContain('minHeight: 48');
  });

  it('supports in-place sample detail inspection and Back navigation meeting 48dp', () => {
    const screenContent = readMobileFile('app/brainworker/workspace-preview.tsx');
    expect(screenContent).toContain('selectedLeadId');
    expect(screenContent).toContain('Back to Lead Feed');
    expect(screenContent).toContain('accessibilityRole="button"');
    expect(screenContent).toContain('accessibilityLabel');
  });

  it('strictly excludes accept/decline action buttons, booking mutations, and push/network code', () => {
    const screenContent = readMobileFile('app/brainworker/workspace-preview.tsx');
    expect(screenContent).not.toMatch(/\bAccept\b/);
    expect(screenContent).not.toMatch(/\bDecline\b/);
    expect(screenContent).not.toContain('expo-notifications');
    expect(screenContent).not.toContain('requestPermissionsAsync');
    expect(screenContent).not.toContain('AsyncStorage');
    expect(screenContent).not.toContain('sqlite');
    expect(screenContent).not.toContain('fetch(');
    expect(screenContent).not.toContain('WebSocket');
  });

  it('uses semantic theme tokens from theme.ts under THEME-001', () => {
    const screenContent = readMobileFile('app/brainworker/workspace-preview.tsx');
    expect(screenContent).toContain('useThemeColors');
  });

  it('enforces strip tokens for disclaimer and sample badge contrast compliance', () => {
    const screenContent = readMobileFile('app/brainworker/workspace-preview.tsx');
    expect(screenContent).toContain('getStripTextColor');
    expect(screenContent).toContain('getStripAccentColor');
  });

  it('enforces high-contrast foreground on CTA button against amber background', () => {
    const screenContent = readMobileFile('app/brainworker/workspace-preview.tsx');
    expect(screenContent).toContain("c.mode === 'dark' ? c.canvas : c.card");
    expect(screenContent).not.toContain("color: '#FFFFFF'");
  });

  it('uses amberHover for registration preview link in light mode for 4.5:1 contrast', () => {
    const registerContent = readMobileFile('app/brainworker/register.tsx');
    expect(registerContent).toContain("c.mode === 'light' ? c.amberHover : c.amber");
  });

  it('stacks lead card footer budget and timeframe vertically with clear labels at 375px', () => {
    const screenContent = readMobileFile('app/brainworker/workspace-preview.tsx');
    expect(screenContent).toContain('SAMPLE BUDGET');
    expect(screenContent).toContain('TIMEFRAME');
    expect(screenContent).toContain('leadFooterStacked');
    expect(screenContent).not.toContain('leadFooterRow');
  });

  it('uses theme-safe cardHover for SampleLeadCard pressed state to prevent text disappearance in light mode', () => {
    const screenContent = readMobileFile('app/brainworker/workspace-preview.tsx');
    expect(screenContent).toContain('backgroundColor: pressed ? c.cardHover : c.card');
    expect(screenContent).not.toContain('backgroundColor: pressed ? c.strip : c.card');
  });

  it('uses c.mutedText for SampleLeadCard border to meet >=3:1 clickable card boundary contrast', () => {
    const screenContent = readMobileFile('app/brainworker/workspace-preview.tsx');
    expect(screenContent).toContain('borderColor: c.mutedText');
  });

  it('provides explicit accessibilityRole and accessibilityLabel on feed disclaimer text', () => {
    const screenContent = readMobileFile('app/brainworker/workspace-preview.tsx');
    expect(screenContent).toContain('accessibilityRole="text"');
    expect(screenContent).toContain('accessibilityLabel={WORKER_WORKSPACE_DISCLAIMER}');
  });

  it('enforces that verifyLargeText in verify-expo-workspace.mjs navigates directly to workspace-preview and verifies font scaling', () => {
    const scriptPath = resolve(mobileRoot, '../../scripts/verify-expo-workspace.mjs');
    const scriptContent = readFileSync(scriptPath, 'utf8');
    expect(scriptContent).toContain('goto(`${BASE_URL}/brainworker/workspace-preview`');
    expect(scriptContent).toContain("getByText('BrainWorker workspace preview')");
    expect(scriptContent).toContain('Workspace title missing before scaling');
    expect(scriptContent).toContain('scaledFontSize <= initialFontSize');
  });

  it('enforces that verify-expo-workspace.mjs measures meaningful icon contrast in both themes using nearest computed background', () => {
    const scriptPath = resolve(mobileRoot, '../../scripts/verify-expo-workspace.mjs');
    const scriptContent = readFileSync(scriptPath, 'utf8');
    expect(scriptContent).toContain('minRatio = 3.0');
    expect(scriptContent).toContain('ratio < minRatio');
    expect(scriptContent).toContain('Icon contrast failure');
    expect(scriptContent).toContain("measureIconContrast(page, 'Dark Feed Icons')");
    expect(scriptContent).toContain("measureIconContrast(page, 'Light Feed Icons')");
    expect(scriptContent).toContain('getVisibleIconElements');
    expect(scriptContent).toContain('getBg(el)');
  });

  it('marks all decorative Ionicons as accessible={false} on workspace-preview and register preview link', () => {
    const screenContent = readMobileFile('app/brainworker/workspace-preview.tsx');
    const iconMatches = screenContent.match(/<Ionicons[^>]*>/g) || [];
    expect(iconMatches.length).toBe(5);
    iconMatches.forEach((tag) => {
      expect(tag).toContain('accessible={false}');
    });

    const registerContent = readMobileFile('app/brainworker/register.tsx');
    const previewLinkSection = registerContent.slice(registerContent.indexOf('function RegisterPreviewLink'));
    expect(previewLinkSection).toContain('<Ionicons name="eye-outline" size={18} color={linkColor} accessible={false} />');
  });
});

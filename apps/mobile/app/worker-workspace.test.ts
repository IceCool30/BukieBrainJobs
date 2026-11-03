import { describe, expect, it } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

declare const __dirname: string;

describe('MOB-WORK-001 Native BrainWorker Workspace Preview Guardrails', () => {
  const mobileRoot = resolve(__dirname, '..');
  const readMobileFile = (relativePath: string) =>
    readFileSync(resolve(mobileRoot, relativePath), 'utf8');
  const readWorkspaceScript = () =>
    readFileSync(resolve(mobileRoot, '../../scripts/verify-expo-workspace.mjs'), 'utf8');
  const getWork002HelperScreenshots = (scriptContent: string) => {
    const section = scriptContent.slice(
      scriptContent.indexOf('async function verifyInvitationCard'),
      scriptContent.indexOf('async function verifyAlertDetailFlow'),
    );
    const pattern = new RegExp("page\\.screenshot\\(\\{\\s*path:\\s*path\\.join\\(SCREENSHOT_DIR,\\s*['\"]([^'\"]+)['\"]\\)", 'g');
    return Array.from(section.matchAll(pattern)).map((m) => m[1]);
  };
  const extractFunctionBody = (content: string, name: string) => {
    const pattern = new RegExp(`async\\s+function\\s+${name}\\s*\\([^)]*\\)\\s*\\{([\\s\\S]*?)\\n\\}`);
    const match = content.match(pattern);
    return match ? match[1] : null;
  };
  const extractRunQaBranches = (runQaBody: string) => {
    const elseMarker = '} else {';
    const m2Branch = runQaBody.slice(runQaBody.indexOf('if (isWork002)'), runQaBody.indexOf(elseMarker));
    const m1Branch = runQaBody.slice(runQaBody.indexOf(elseMarker));
    return { m2Branch, m1Branch };
  };

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

  it('renders invitation action controls and preview banner for the alert sample lead', () => {
    const screenContent = readMobileFile('app/brainworker/workspace-preview.tsx');
    expect(screenContent).toContain('SAMPLE INVITATION ACTIONS');
    expect(screenContent).toContain('Accept sample lead');
    expect(screenContent).toContain('Decline sample lead');
    expect(screenContent).toContain('SAMPLE_LEAD_ALERT.id');
  });

  it('provides accept confirmation modal with truthful preview disclaimer', () => {
    const screenContent = readMobileFile('app/brainworker/workspace-preview.tsx');
    expect(screenContent).toContain('Accept Sample Lead?');
    expect(screenContent).toContain('Confirm sample acceptance');
    expect(screenContent).toContain('interface preview');
  });

  it('provides decline modal with single-choice selection across all 6 canonical BW-003 reasons', () => {
    const screenContent = readMobileFile('app/brainworker/workspace-preview.tsx');
    expect(screenContent).toContain('Decline Sample Lead');
    expect(screenContent).toContain('BW003_DECLINE_REASONS');
    expect(screenContent).toContain('Confirm sample decline');
    expect(screenContent).toContain('accessibilityRole="radio"');
  });

  it('renders temporary in-memory preview outcome and clears on back', () => {
    const screenContent = readMobileFile('app/brainworker/workspace-preview.tsx');
    expect(screenContent).toContain('previewOutcome');
    expect(screenContent).toContain('Sample Lead Accepted (Preview)');
    expect(screenContent).toContain('Sample Lead Declined (Preview)');
    expect(screenContent).toContain('Reset preview outcome');
  });

  it('strictly excludes real booking mutations, push notifications, and network persistence', () => {
    const screenContent = readMobileFile('app/brainworker/workspace-preview.tsx');
    expect(screenContent).not.toContain('expo-notifications');
    expect(screenContent).not.toContain('requestPermissionsAsync');
    expect(screenContent).not.toContain('AsyncStorage');
    expect(screenContent).not.toContain('sqlite');
    expect(screenContent).not.toContain('fetch(');
    expect(screenContent).not.toContain('WebSocket');
  });

  it('enforces maximum 25 lines for every component function in workspace-preview.tsx', () => {
    const screenContent = readMobileFile('app/brainworker/workspace-preview.tsx');
    const functionRegex = /(?:export\s+default\s+function|function)\s+([A-Za-z0-9_]+)/g;
    let match;
    const lines = screenContent.split('\n');
    while ((match = functionRegex.exec(screenContent)) !== null) {
      const funcName = match[1];
      const startIndex = screenContent.slice(0, match.index).split('\n').length - 1;
      let depth = 0;
      let endIndex = startIndex;
      let started = false;
      for (let i = startIndex; i < lines.length; i++) {
        for (const ch of lines[i]) {
          if (ch === '{') { depth++; started = true; }
          if (ch === '}') { depth--; }
        }
        if (started && depth === 0) {
          endIndex = i;
          break;
        }
      }
      const funcLines = endIndex - startIndex + 1;
      expect(funcLines, `Function ${funcName} has ${funcLines} lines (max 25 allowed)`).toBeLessThanOrEqual(25);
    }
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
    expect(iconMatches.length).toBe(14);
    iconMatches.forEach((tag) => {
      expect(tag).toContain('accessible={false}');
    });

    const registerContent = readMobileFile('app/brainworker/register.tsx');
    const previewLinkSection = registerContent.slice(registerContent.indexOf('function RegisterPreviewLink'));
    expect(previewLinkSection).toContain('<Ionicons name="eye-outline" size={18} color={linkColor} accessible={false} />');
  });

  it('enforces exact seven MOB-WORK-002 artifact names in workspace verifier without overwriting MOB-WORK-001', () => {
    const expectedWork002Screenshots = [
      'expo-mob-work-002-01-invitation-actions-dark.png',
      'expo-mob-work-002-06-invitation-actions-light.png',
      'expo-mob-work-002-02-accept-modal-dark.png',
      'expo-mob-work-002-03-accepted-outcome-dark.png',
      'expo-mob-work-002-04-decline-modal-dark.png',
      'expo-mob-work-002-07-decline-modal-light.png',
      'expo-mob-work-002-05-declined-outcome-dark.png',
    ];
    const helperScreenshots = getWork002HelperScreenshots(readWorkspaceScript());
    expect(helperScreenshots).toEqual(expectedWork002Screenshots);
    helperScreenshots.forEach((shot) => {
      expect(shot.startsWith('expo-mob-work-002-')).toBe(true);
      expect(shot).not.toContain('expo-mob-work-001-');
    });
  });

  it('enforces complete execution isolation between MOB-WORK-002 and MOB-WORK-001 in runQa and executeWork002QaFlow', () => {
    const scriptContent = readWorkspaceScript();
    const flowBody = extractFunctionBody(scriptContent, 'executeWork002QaFlow');
    expect(flowBody, 'executeWork002QaFlow must be defined in scripts/verify-expo-workspace.mjs').not.toBeNull();
    expect(flowBody!).not.toContain('verifyAlertDetailFlow');
    expect(flowBody!).not.toContain('expo-mob-work-001-');

    const runQaBody = extractFunctionBody(scriptContent, 'runQa');
    expect(runQaBody, 'runQa must be defined').not.toBeNull();
    const { m2Branch, m1Branch } = extractRunQaBranches(runQaBody!);
    expect(m2Branch).toContain('executeWork002QaFlow');
    expect(m2Branch).not.toContain('executeQaSteps');
    expect(m1Branch).toContain('executeQaSteps');
    expect(m1Branch).not.toContain('executeWork002QaFlow');
  });

  it('catalogs all seven MOB-WORK-002 screenshot artifacts in docs/screenshots/README.md', () => {
    const readmeContent = readFileSync(resolve(mobileRoot, '../../docs/screenshots/README.md'), 'utf8');
    expect(readmeContent).toContain('MOB-WORK-002');
    const expectedWork002Screenshots = [
      'expo-mob-work-002-01-invitation-actions-dark.png',
      'expo-mob-work-002-02-accept-modal-dark.png',
      'expo-mob-work-002-03-accepted-outcome-dark.png',
      'expo-mob-work-002-04-decline-modal-dark.png',
      'expo-mob-work-002-05-declined-outcome-dark.png',
      'expo-mob-work-002-06-invitation-actions-light.png',
      'expo-mob-work-002-07-decline-modal-light.png',
    ];
    for (const filename of expectedWork002Screenshots) {
      expect(readmeContent).toContain(`[\`${filename}\`](./${filename})`);
    }
    expect(readmeContent).not.toContain('48dp Accept and Decline');
    expect(readmeContent).toContain('React Native 48 logical-unit Accept and Decline buttons');
  });

  it('enforces landscape modal cancel verification in scripts/verify-expo-workspace.mjs without outcome mutation', () => {
    const scriptContent = readWorkspaceScript();
    const landscapeFunc = extractFunctionBody(scriptContent, 'verifyLandscapeModalCancelFlow');
    expect(landscapeFunc, 'verifyLandscapeModalCancelFlow must be defined').not.toBeNull();
    expect(landscapeFunc!).toContain('width: 844, height: 390');
    expect(scriptContent).toContain('Cancel acceptance preview');
    expect(scriptContent).toContain('Cancel decline preview');
    expect(landscapeFunc!).toContain('verifyOverflow');
    expect(scriptContent).toContain('Accept Sample Lead?');
    expect(scriptContent).toContain('Decline Sample Lead');

    const flowBody = extractFunctionBody(scriptContent, 'executeWork002QaFlow') || '';
    expect(flowBody).toContain('verifyLandscapeModalCancelFlow');
  });

  it('enforces landscape modal cancel buttons are within 844x390 bounds and meet 48x48 touch targets', () => {
    const scriptContent = readWorkspaceScript();
    const boundsFunc = extractFunctionBody(scriptContent, 'verifyViewportBounds');
    expect(boundsFunc, 'verifyViewportBounds helper must be defined').not.toBeNull();
    expect(scriptContent).toContain('maxWidth = 844');
    expect(scriptContent).toContain('maxHeight = 390');

    const acceptCancelFunc = extractFunctionBody(scriptContent, 'verifyLandscapeAcceptCancel');
    expect(acceptCancelFunc, 'verifyLandscapeAcceptCancel must be defined').not.toBeNull();
    expect(acceptCancelFunc!).toContain('verifyTouchTarget');
    expect(acceptCancelFunc!).toContain('verifyViewportBounds');

    const declineCancelFunc = extractFunctionBody(scriptContent, 'verifyLandscapeDeclineCancel');
    expect(declineCancelFunc, 'verifyLandscapeDeclineCancel must be defined').not.toBeNull();
    expect(declineCancelFunc!).toContain('verifyTouchTarget');
    expect(declineCancelFunc!).toContain('verifyViewportBounds');
  });

  describe('MOB-WORK-003 Native Check-In Location Simulation Preview Guardrails', () => {
    it('provides local entry button on accepted sample lead preview to reveal check-in sample inline', () => {
      const screenContent = readMobileFile('app/brainworker/workspace-preview.tsx');
      expect(screenContent).toContain('Preview on-site check-in');
      expect(screenContent).toContain('showCheckIn');
      expect(screenContent).toContain('CheckInSimulationSection');
    });

    it('renders initial unsimulated arrival state with exact disclaimer and schematic', () => {
      const screenContent = readMobileFile('app/brainworker/workspace-preview.tsx');
      expect(screenContent).toContain('SAMPLE LOCATION SIMULATION');
      expect(screenContent).toContain('LOCAL PREVIEW ONLY');
      expect(screenContent).toContain('Simulated Site Location');
      expect(screenContent).toContain('Arrival Snapshot: Not simulated');
      expect(screenContent).toContain('CONFIRMED (Sample)');
      expect(screenContent).toContain('Simulate on-site check-in');
      expect(screenContent).toContain('Simulate on-site check-in for sample generator repair');
    });

    it('renders simulated outcome with exact SIMULATED ARRIVAL (Preview) badge and Arrival view previewed in memory stamp', () => {
      const screenContent = readMobileFile('app/brainworker/workspace-preview.tsx');
      expect(screenContent).toContain('SAMPLE CHECK-IN SIMULATED');
      expect(screenContent).toContain('On-Site Arrival Simulated (Preview)');
      expect(screenContent).toContain('SIMULATED ARRIVAL (Preview)');
      expect(screenContent).toContain('Arrival view previewed in memory');
      expect(screenContent).toContain('Reset location simulation');
    });

    it('strictly excludes coordinates, map tiles, and escrow/payment from check-in preview', () => {
      const screenContent = readMobileFile('app/brainworker/workspace-preview.tsx');
      expect(screenContent).not.toMatch(/latitude|longitude/i);
      expect(screenContent).not.toMatch(/google\.maps|mapbox/i);
      expect(screenContent).not.toMatch(/escrow|payout|payment/i);
    });

    it('preserves 48dp minimum touch target for all check-in interactive triggers', () => {
      const screenContent = readMobileFile('app/brainworker/workspace-preview.tsx');
      expect(screenContent).toContain('minHeight: 48');
    });
  });
});

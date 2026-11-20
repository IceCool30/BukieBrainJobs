import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const BASE_URL = process.env.MOB_ACT_BASE_URL || 'http://127.0.0.1:8081';
const SCREENSHOT_DIR = path.resolve('docs/screenshots');
const VIDEOS_DIR = path.resolve('docs/screenshots/videos');
const VIDEO_TMP_DIR = path.resolve('docs/screenshots/videos/tmp_act_video');

const ALL_SAMPLES = [
  { title: 'Generator Servicing & Repair', type: 'Job request', status: 'Request received' },
  { title: 'AC Repair & Gas Refill', type: 'Booking', status: 'Awaiting progress' },
  { title: 'Plumbing & Pipe Fitting', type: 'Booking', status: 'In progress' },
  { title: 'Electrical & Solar Inverter', type: 'Booking', status: 'Scheduled' },
  { title: 'Deep Cleaning & Post-Construction', type: 'Booking', status: 'Completed' },
  { title: 'Furniture & Carpentry Work', type: 'Job request', status: 'Cancelled' },
];

function parseRgb(colorStr) {
  const m = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!m) throw new Error(`Cannot parse rgb from: ${colorStr}`);
  return [parseInt(m[1], 10), parseInt(m[2], 10), parseInt(m[3], 10)];
}

function relativeLuminance([r, g, b]) {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function contrastRatio(rgb1, rgb2) {
  const l1 = relativeLuminance(rgb1);
  const l2 = relativeLuminance(rgb2);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

function getThemeTokens(mode) {
  if (mode === 'dark') {
    return {
      fg: 'rgb(11, 14, 19)',
      normalBg: 'rgb(255, 107, 53)',
      pressedBg: 'rgb(255, 125, 77)',
    };
  }
  return {
    fg: 'rgb(255, 255, 255)',
    normalBg: 'rgb(204, 74, 20)',
    pressedBg: 'rgb(179, 67, 18)',
  };
}

async function launchBrowser() {
  if (!fs.existsSync(VIDEO_TMP_DIR)) fs.mkdirSync(VIDEO_TMP_DIR, { recursive: true });
  const browser = await chromium.launch({
    executablePath: '/usr/bin/google-chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 2,
    recordVideo: { dir: VIDEO_TMP_DIR, size: { width: 375, height: 812 } },
  });
  return { browser, context, page: await context.newPage() };
}

async function verifyTouchTargetsAndNotice(page) {
  const tabs = page.locator('[role="tab"]').filter({ hasText: /All|Active|Upcoming|Past/ });
  const count = await tabs.count();
  if (count !== 4) throw new Error(`Expected exactly 4 segment tabs, found ${count}`);

  for (let i = 0; i < count; i++) {
    const box = await tabs.nth(i).boundingBox();
    if (!box || box.width < 48 || box.height < 48) {
      throw new Error(`Tab target ${i} under 48 CSS pixels: ${JSON.stringify(box)}`);
    }
  }

  const cta = page.locator('[role="button"][aria-label="Explore services"]');
  await cta.scrollIntoViewIfNeeded();
  const ctaBox = await cta.boundingBox();
  if (!ctaBox || ctaBox.width < 48 || ctaBox.height < 48) {
    throw new Error(`CTA target under 48 CSS pixels: ${JSON.stringify(ctaBox)}`);
  }

  const notice = page.locator("text=These sample entries are for preview only. They're not saved to your account.");
  const noticeCount = await notice.count();
  if (noticeCount !== 1) throw new Error(`Expected exactly 1 preview notice, found ${noticeCount}`);
}

async function verifyOverflow(page, orientationName) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth
  );
  if (overflow) throw new Error(`Horizontal overflow detected in ${orientationName}`);
}

async function measureCtaColors(cta, ctaText, ctaIcon) {
  const bg = await cta.evaluate((el) => window.getComputedStyle(el).backgroundColor);
  const textFg = await ctaText.evaluate((el) => window.getComputedStyle(el).color);
  const iconFg = await ctaIcon.evaluate((el) => window.getComputedStyle(el).color);
  return { bg, textFg, iconFg };
}

async function measurePressedCta(page, cta, ctaText, ctaIcon) {
  const box = await cta.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(150);
  const pressed = await measureCtaColors(cta, ctaText, ctaIcon);
  await page.mouse.move(0, 0);
  await page.mouse.up();
  await page.waitForTimeout(100);
  return pressed;
}

function assertCtaContrastValues(themeMode, normal, pressed) {
  const tokens = getThemeTokens(themeMode);
  if (normal.textFg !== tokens.fg || normal.iconFg !== tokens.fg || normal.bg !== tokens.normalBg) {
    throw new Error(`Unexpected ${themeMode} normal CTA colors: ${JSON.stringify(normal)}`);
  }
  if (pressed.textFg !== tokens.fg || pressed.iconFg !== tokens.fg || pressed.bg !== tokens.pressedBg) {
    throw new Error(`Unexpected ${themeMode} pressed CTA colors: ${JSON.stringify(pressed)}`);
  }
  const normalRatio = contrastRatio(parseRgb(normal.textFg), parseRgb(normal.bg));
  const pressedRatio = contrastRatio(parseRgb(pressed.textFg), parseRgb(pressed.bg));
  if (normalRatio < 4.5 || pressedRatio < 4.5) {
    throw new Error(`CTA contrast failure in ${themeMode}: normal=${normalRatio.toFixed(2)}, pressed=${pressedRatio.toFixed(2)}`);
  }
}

async function verifyCtaContrast(page, themeMode) {
  const cta = page.locator('[role="button"][aria-label="Explore services"]');
  await cta.scrollIntoViewIfNeeded();
  const ctaText = page.locator('text=EXPLORE SERVICES');
  const ctaIcon = cta.locator('div').first();

  const normal = await measureCtaColors(cta, ctaText, ctaIcon);
  const pressed = await measurePressedCta(page, cta, ctaText, ctaIcon);
  assertCtaContrastValues(themeMode, normal, pressed);
}

async function assertIncludedSamples(page, included) {
  for (const item of included) {
    const titleCount = await page.locator(`text=${item.title}`).count();
    if (titleCount !== 1) {
      throw new Error(`Expected exactly 1 title for ${item.title}, found ${titleCount}`);
    }
    const typeCount = await page.locator(`text=${item.type}`).count();
    if (typeCount === 0) throw new Error(`Missing type label ${item.type} for ${item.title}`);
    const statusCount = await page.locator(`text=${item.status}`).count();
    if (statusCount === 0) throw new Error(`Missing status label ${item.status} for ${item.title}`);
  }
}

async function assertExcludedSamples(page, excluded) {
  for (const item of excluded) {
    const count = await page.locator(`text=${item.title}`).count();
    if (count !== 0) throw new Error(`Excluded title ${item.title} should not be visible`);
  }
}

async function assertSegmentContent(page, tabName, includedIndices) {
  const tab = page.locator(`[role="tab"]:has-text("${tabName}")`);
  if ((await tab.getAttribute('aria-selected')) !== 'true') {
    throw new Error(`Tab ${tabName} not marked as selected (aria-selected="true")`);
  }
  const included = includedIndices.map((i) => ALL_SAMPLES[i]);
  const excluded = ALL_SAMPLES.filter((_, i) => !includedIndices.includes(i));

  await assertIncludedSamples(page, included);
  await assertExcludedSamples(page, excluded);
  const sampleBadges = page.getByText('Sample', { exact: true });
  if ((await sampleBadges.count()) !== included.length) {
    throw new Error(`Expected ${included.length} sample badges, found ${await sampleBadges.count()}`);
  }
}

async function selectTab(page, tabName) {
  const notice = page.locator("text=These sample entries are for preview only.");
  await notice.scrollIntoViewIfNeeded();
  const tabTarget = page.locator('[role="tab"]').getByText(tabName, { exact: true });
  await tabTarget.tap();
  await page.waitForTimeout(400);
}

async function verifyAllSegment(page) {
  console.log('Verifying All segment (default)...');
  await page.goto(`${BASE_URL}/jobs`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);

  await verifyTouchTargetsAndNotice(page);
  await verifyOverflow(page, 'portrait (375x812)');
  await assertSegmentContent(page, 'All', [0, 1, 2, 3, 4, 5]);

  const notice = page.locator("text=These sample entries are for preview only.");
  await notice.scrollIntoViewIfNeeded();
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'expo-mob-act-001-01-all-portrait-dark.png') });

  await verifyCtaContrast(page, 'dark');
  await notice.scrollIntoViewIfNeeded();
}

async function verifyActiveSegment(page) {
  console.log('Verifying Active segment...');
  await selectTab(page, 'Active');
  await assertSegmentContent(page, 'Active', [0, 1, 2]);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'expo-mob-act-001-02-active-portrait-dark.png') });
}

async function verifyUpcomingSegment(page) {
  console.log('Verifying Upcoming segment...');
  await selectTab(page, 'Upcoming');
  await assertSegmentContent(page, 'Upcoming', [3]);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'expo-mob-act-001-03-upcoming-portrait-dark.png') });
}

async function verifyPastSegment(page) {
  console.log('Verifying Past segment...');
  await selectTab(page, 'Past');
  await assertSegmentContent(page, 'Past', [4, 5]);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'expo-mob-act-001-04-past-portrait-dark.png') });
}

async function verifyCtaNavigation(page) {
  console.log('Verifying CTA navigation...');
  await selectTab(page, 'All');
  const cta = page.locator('[role="button"][aria-label="Explore services"]');
  await cta.scrollIntoViewIfNeeded();
  await cta.tap();
  await page.waitForTimeout(800);

  const heading = page.locator('text=Services');
  if ((await heading.count()) === 0) throw new Error('CTA navigation failed to reach services catalog');
}

async function verifyLandscape(page) {
  console.log('Verifying Landscape orientation (844x390)...');
  await page.setViewportSize({ width: 844, height: 390 });
  await page.goto(`${BASE_URL}/jobs`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);

  await verifyOverflow(page, 'landscape (844x390)');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'expo-mob-act-001-05-all-landscape-dark.png') });
}

async function restoreDarkTheme(page) {
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);
  const darkToggle = page.locator('[role="button"][aria-label="Switch to dark mode"]');
  if ((await darkToggle.count()) === 0) {
    throw new Error('Dark mode toggle not found to restore dark theme');
  }
  await darkToggle.click();
  await page.waitForTimeout(400);
}

async function verifyLightTheme(page) {
  console.log('Verifying Light theme...');
  try {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    const lightToggle = page.locator('[role="button"][aria-label="Switch to light mode"]');
    if ((await lightToggle.count()) === 0) throw new Error('Light mode toggle not found');
    await lightToggle.click();
    await page.waitForTimeout(500);

    await page.goto(`${BASE_URL}/jobs`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);

    const notice = page.locator("text=These sample entries are for preview only.");
    await notice.scrollIntoViewIfNeeded();
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'expo-mob-act-001-06-all-portrait-light.png') });

    await verifyCtaContrast(page, 'light');
  } finally {
    await restoreDarkTheme(page);
  }
}

async function verifyReducedMotion(page) {
  console.log('Verifying reduced-motion emulation...');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(`${BASE_URL}/jobs`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);
  const allTab = page.locator('[role="tab"]:has-text("All")');
  if ((await allTab.getAttribute('aria-selected')) !== 'true') {
    throw new Error('Reduced-motion emulation failed to render default state');
  }
  const runningAnimations = await page.evaluate(
    () => document.getAnimations().filter((a) => a.playState === 'running').length
  );
  if (runningAnimations !== 0) {
    throw new Error(`Expected 0 running animations under reduced-motion, found ${runningAnimations}`);
  }
  await page.emulateMedia({ reducedMotion: 'no-preference' });
}

async function verifyZoomProxy(page) {
  console.log('Verifying 200% zoom text proxy...');
  await page.evaluate(() => {
    document.body.style.zoom = '200%';
  });
  await page.waitForTimeout(400);
  const sampleBadges = page.getByText('Sample', { exact: true });
  if ((await sampleBadges.count()) !== 6) {
    throw new Error('Zoom proxy broke sample rendering');
  }
  const zoomOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth
  );
  await page.evaluate(() => {
    document.body.style.zoom = '100%';
  });
  if (zoomOverflow) {
    throw new Error('Horizontal overflow detected under 200% zoom proxy');
  }
}

async function saveRecording() {
  if (!fs.existsSync(VIDEOS_DIR)) fs.mkdirSync(VIDEOS_DIR, { recursive: true });
  if (!fs.existsSync(VIDEO_TMP_DIR)) {
    throw new Error(`Video temporary directory ${VIDEO_TMP_DIR} does not exist`);
  }
  const files = fs.readdirSync(VIDEO_TMP_DIR).filter((f) => f.endsWith('.webm'));
  if (files.length === 0) {
    throw new Error('Continuous recording was not produced by browser context');
  }
  const src = path.join(VIDEO_TMP_DIR, files[0]);
  const dest = path.join(VIDEOS_DIR, 'expo-mob-act-001-activity-hub-verification.webm');
  fs.copyFileSync(src, dest);
  fs.rmSync(VIDEO_TMP_DIR, { recursive: true, force: true });
  if (!fs.existsSync(dest) || fs.statSync(dest).size === 0) {
    throw new Error(`Failed to write continuous recording to ${dest}`);
  }
  console.log('Continuous recording verified and saved to', dest);
}

async function main() {
  const { browser, context, page } = await launchBrowser();
  try {
    await verifyAllSegment(page);
    await verifyActiveSegment(page);
    await verifyUpcomingSegment(page);
    await verifyPastSegment(page);
    await verifyCtaNavigation(page);
    await verifyLandscape(page);
    await verifyLightTheme(page);
    await verifyReducedMotion(page);
    await verifyZoomProxy(page);
    console.log('PASS: All Expo activity hub smoke and verification checks');
  } finally {
    await page.close();
    await context.close();
    await browser.close();
    await saveRecording();
  }
}

main().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});

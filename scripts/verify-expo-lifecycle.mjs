import http from 'http';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { chromium } from 'playwright';

const PORT = 8081;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const SCREENSHOT_DIR = path.resolve('docs/screenshots');
const VIDEOS_DIR = path.resolve('docs/screenshots/videos');
const VIDEO_TMP_DIR = path.join(os.tmpdir(), `expo-life-video-${Date.now()}`);
const DIST_WEB = path.resolve('apps/mobile/dist-web');

const SAMPLES = [
  { idx: 0, title: 'Generator Servicing & Repair', heading: 'Request Received', narrative: 'This sample represents a service request received and awaiting provider matching.', shot: 'expo-mob-life-001-01-detail-generator-dark.png' },
  { idx: 1, title: 'AC Repair & Gas Refill', heading: 'Awaiting BrainWorker response', narrative: 'This sample represents a booking awaiting a BrainWorker response.', shot: 'expo-mob-life-001-02-detail-ac-dark.png' },
  { idx: 2, title: 'Plumbing & Pipe Fitting', heading: 'Work in Progress', narrative: 'This sample represents work that is in progress.' },
  { idx: 3, title: 'Electrical & Solar Inverter', heading: 'Booking Confirmed', narrative: 'Your booking is confirmed.', shot: 'expo-mob-life-001-03-detail-confirmed-dark.png' },
  { idx: 4, title: 'Deep Cleaning & Post-Construction', heading: 'Work Completed', narrative: 'This sample represents work marked complete.' },
  { idx: 5, title: 'Furniture & Carpentry Work', heading: 'Request Cancelled', narrative: 'This sample represents a cancelled request.', shot: 'expo-mob-life-001-04-detail-cancelled-dark.png' },
];

const SAMPLE_MILESTONES = {
  0: [
    { label: 'Request Submitted', state: 'Current step' },
    { label: 'Worker Response Pending', state: 'Upcoming' },
    { label: 'Confirmed', state: 'Upcoming' },
    { label: 'In Progress', state: 'Upcoming' },
    { label: 'Awaiting Completion', state: 'Upcoming' },
    { label: 'Completed', state: 'Upcoming' },
  ],
  1: [
    { label: 'Request Submitted', state: 'Completed' },
    { label: 'Worker Response Pending', state: 'Current step' },
    { label: 'Confirmed', state: 'Upcoming' },
    { label: 'In Progress', state: 'Upcoming' },
    { label: 'Awaiting Completion', state: 'Upcoming' },
    { label: 'Completed', state: 'Upcoming' },
  ],
  2: [
    { label: 'Request Submitted', state: 'Completed' },
    { label: 'Worker Response Pending', state: 'Completed' },
    { label: 'Confirmed', state: 'Completed' },
    { label: 'In Progress', state: 'Current step' },
    { label: 'Awaiting Completion', state: 'Upcoming' },
    { label: 'Completed', state: 'Upcoming' },
  ],
  3: [
    { label: 'Request Submitted', state: 'Completed' },
    { label: 'Worker Response Pending', state: 'Completed' },
    { label: 'Confirmed', state: 'Current step' },
    { label: 'In Progress', state: 'Upcoming' },
    { label: 'Awaiting Completion', state: 'Upcoming' },
    { label: 'Completed', state: 'Upcoming' },
  ],
  4: [
    { label: 'Request Submitted', state: 'Completed' },
    { label: 'Worker Response Pending', state: 'Completed' },
    { label: 'Confirmed', state: 'Completed' },
    { label: 'In Progress', state: 'Completed' },
    { label: 'Awaiting Completion', state: 'Completed' },
    { label: 'Completed', state: 'Current step' },
  ],
  5: null,
};

function getMimeType(filePath) {
  const ext = path.extname(filePath);
  if (ext === '.js') return 'application/javascript';
  if (ext === '.html') return 'text/html';
  if (ext === '.css') return 'text/css';
  if (ext === '.png') return 'image/png';
  if (ext === '.ico') return 'image/x-icon';
  if (ext === '.ttf') return 'font/ttf';
  if (ext === '.json') return 'application/json';
  return 'application/octet-stream';
}

function startStaticServer() {
  const server = http.createServer((req, res) => {
    const reqPath = req.url.split('?')[0];
    const filePath = path.join(DIST_WEB, reqPath);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      res.writeHead(200, { 'Content-Type': getMimeType(filePath) });
      return fs.createReadStream(filePath).pipe(res);
    }
    res.writeHead(200, { 'Content-Type': 'text/html' });
    fs.createReadStream(path.join(DIST_WEB, 'index.html')).pipe(res);
  });
  return new Promise((resolve) => {
    server.listen(PORT, '127.0.0.1', () => resolve(server));
  });
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

async function verifyOverflow(page, label) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth
  );
  if (overflow) throw new Error(`Horizontal overflow detected in ${label}`);
}

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

async function measureContrast(page, textLocator, bgLocator, label) {
  const textFg = await textLocator.evaluate((el) => window.getComputedStyle(el).color);
  const bg = await bgLocator.evaluate((el) => window.getComputedStyle(el).backgroundColor);
  const ratio = contrastRatio(parseRgb(textFg), parseRgb(bg));
  console.log(`Contrast [${label}]: text=${textFg}, bg=${bg}, ratio=${ratio.toFixed(2)}:1`);
  if (ratio < 4.5) throw new Error(`Contrast failure [${label}]: ${ratio.toFixed(2)}:1 < 4.5:1`);
}

async function getEffectiveBg(locator) {
  return locator.evaluate((el) => {
    let curr = el;
    while (curr) {
      const bg = window.getComputedStyle(curr).backgroundColor;
      if (bg && bg !== 'transparent' && bg !== 'rgba(0, 0, 0, 0)') return bg;
      curr = curr.parentElement;
    }
    return 'rgb(255, 255, 255)';
  });
}

async function getBackColors(btn) {
  return btn.evaluate((b) => {
    const els = Array.from(b.querySelectorAll('*'));
    const textEl = els.find((e) => e.textContent === 'Back to Activity');
    const iconEl = els.find((e) => window.getComputedStyle(e).fontFamily.toLowerCase().includes('ionicons'));
    return {
      text: textEl ? window.getComputedStyle(textEl).color : window.getComputedStyle(b).color,
      icon: iconEl ? window.getComputedStyle(iconEl).color : window.getComputedStyle(b).color,
    };
  });
}

async function measureBackNormalContrast(page, themeLabel) {
  const btn = page.getByRole('button', { name: 'Back to activity list' });
  const text = page.getByText('Back to Activity');
  const normalBg = await getEffectiveBg(text);
  const colors = await getBackColors(btn);
  const textRatio = contrastRatio(parseRgb(colors.text), parseRgb(normalBg));
  const iconRatio = contrastRatio(parseRgb(colors.icon), parseRgb(normalBg));
  console.log(`Contrast [${themeLabel} Back Normal]: text=${colors.text} (${textRatio.toFixed(2)}:1), icon=${colors.icon} (${iconRatio.toFixed(2)}:1), bg=${normalBg}`);
  if (textRatio < 4.5) throw new Error(`Back normal text contrast [${themeLabel}]: ${textRatio.toFixed(2)}:1 < 4.5:1`);
  if (iconRatio < 4.5) throw new Error(`Back normal icon contrast [${themeLabel}]: ${iconRatio.toFixed(2)}:1 < 4.5:1`);
}

async function measureBackPressedContrast(page, themeLabel) {
  const btn = page.getByRole('button', { name: 'Back to activity list' });
  const box = await btn.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(100);
  try {
    const pressedBg = await btn.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    const colors = await getBackColors(btn);
    const textRatio = contrastRatio(parseRgb(colors.text), parseRgb(pressedBg));
    const iconRatio = contrastRatio(parseRgb(colors.icon), parseRgb(pressedBg));
    console.log(`Contrast [${themeLabel} Back Pressed]: text=${colors.text} (${textRatio.toFixed(2)}:1), icon=${colors.icon} (${iconRatio.toFixed(2)}:1), bg=${pressedBg}`);
    if (textRatio < 4.5) throw new Error(`Back pressed text contrast [${themeLabel}]: ${textRatio.toFixed(2)}:1 < 4.5:1`);
    if (iconRatio < 4.5) throw new Error(`Back pressed icon contrast [${themeLabel}]: ${iconRatio.toFixed(2)}:1 < 4.5:1`);
  } finally {
    await page.mouse.move(0, 0);
    await page.mouse.up();
  }
}

async function measureBackContrast(page, themeLabel) {
  await measureBackNormalContrast(page, themeLabel);
  await measureBackPressedContrast(page, themeLabel);
}

function assertNoFabrication(text, title, isSample3) {
  const prohibited = [
    /\b(₦|NGN|\$|USD|price|hourly|budget|invoice|escrow|wallet)\b/i,
    /\b(fake_ref|TX-[0-9]+|TXN[0-9]*|BK-[0-9]+|REF-[0-9]+|transaction_id)\b/i,
    /\b(Customer Name|Worker Name|Provider Name|Email Address|Phone Number|User ID|Customer ID|Worker ID|Provider ID)\b/i,
    /\b(Babajide|Solomon|Bukie|Emeka|Chidi|Musa|John Doe)\b/i,
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/,
    /\b(080\d{8}|090\d{8}|070\d{8}|081\d{8}|\+234\d+)\b/,
    /\b(Lagos|Ikeja|Abuja|Victoria Island|Street|Avenue|Close|Road|Plot)\b/i,
    /\b-?\d{1,3}\.\d+,\s*-?\d{1,3}\.\d+\b/,
    /\b(latitude|longitude|coordinates)\b/i,
    /\b\d{1,2}:\d{2}\s*(am|pm)?\b/i,
    /\b(AM|PM|today|tomorrow|yesterday|countdown|appointment)\b/i,
    /\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b/,
    /\b\d{4}[/-]\d{1,2}[/-]\d{1,2}\b/,
    /\b(January|February|March|April|May|June|July|August|September|October|November|December)\b/i,
  ];
  for (const pattern of prohibited) {
    if (pattern.test(text)) throw new Error(`Fabrication violation on ${title}: matched ${pattern}`);
  }
  const confirmedPhrase = 'Your booking is confirmed.';
  if (isSample3 && !text.includes(confirmedPhrase)) throw new Error(`Sample 3 missing: ${confirmedPhrase}`);
  if (!isSample3 && text.includes(confirmedPhrase)) throw new Error(`Unconfirmed sample contains: ${confirmedPhrase}`);
}

async function verifyTouchTargets(page) {
  console.log('Verifying touch targets (>= 48px)...');
  const tabs = page.locator('[role="tab"]');
  for (let i = 0; i < (await tabs.count()); i++) {
    const box = await tabs.nth(i).boundingBox();
    if (!box || box.width < 48 || box.height < 48) throw new Error(`Tab target ${i} under 48px`);
  }
  const cards = page.locator('[role="button"][aria-label^="View details for"]');
  for (let i = 0; i < (await cards.count()); i++) {
    const box = await cards.nth(i).boundingBox();
    if (!box || box.width < 48 || box.height < 48) throw new Error(`Card target ${i} under 48px`);
  }
  const cta = page.locator('[role="button"][aria-label="Explore services"]');
  const ctaBox = await cta.boundingBox();
  if (!ctaBox || ctaBox.width < 48 || ctaBox.height < 48) throw new Error('CTA target under 48px');
}

async function openSampleDetail(page, title) {
  const card = page.locator(`[role="button"][aria-label="View details for ${title}"]`);
  await card.scrollIntoViewIfNeeded();
  await card.tap();
  await page.waitForTimeout(400);
}

async function verifyAndTapBack(page) {
  const backBtn = page.locator('[role="button"][aria-label="Back to activity list"]');
  const box = await backBtn.boundingBox();
  if (!box || box.width < 48 || box.height < 48) throw new Error(`Back target under 48px`);
  await backBtn.tap();
  await page.waitForTimeout(400);
}

async function verifyMilestoneStep(page, step) {
  const aria = `${step.label}: ${step.state}`;
  const stepItem = page.locator(`[aria-label="${aria}"]`);
  if ((await stepItem.count()) === 0) {
    throw new Error(`Missing milestone step: "${aria}"`);
  }
  const text = await stepItem.innerText();
  if (!text.includes(step.label) || !text.includes(step.state)) {
    throw new Error(`Step text mismatch for: "${aria}"`);
  }
}

async function verifySampleMilestones(page, sampleIdx, title) {
  const expectedSteps = SAMPLE_MILESTONES[sampleIdx];
  const sectionTitle = page.getByText('LIFECYCLE PROGRESSION', { exact: true });
  if ((await sectionTitle.count()) === 0) {
    throw new Error(`Missing LIFECYCLE PROGRESSION section on ${title}`);
  }
  for (const step of expectedSteps) {
    await verifyMilestoneStep(page, step);
  }
}

async function verifyCancelledDetail(page) {
  const progressionTitle = page.getByText('LIFECYCLE PROGRESSION');
  if ((await progressionTitle.count()) !== 0) {
    throw new Error('Cancelled sample must not have progression block');
  }
  const cancelledTexts = page.getByText('Request Cancelled', { exact: true });
  if ((await cancelledTexts.count()) !== 1) {
    throw new Error('Expected exactly 1 "Request Cancelled" text');
  }
  const heading = page.locator('[role="heading"]:has-text("Request Cancelled")');
  if ((await heading.count()) !== 1) {
    throw new Error('Expected exactly 1 "Request Cancelled" heading role');
  }
}

async function verifySample0Contrast(page, heading) {
  const el = page.getByText(heading, { exact: true });
  await measureContrast(page, el, el.locator('..'), 'Dark Heading');
  await measureBackContrast(page, 'Dark');
}

async function verifySample(page, s) {
  console.log(`Verifying Sample ${s.idx}: ${s.title}...`);
  await openSampleDetail(page, s.title);
  await verifyOverflow(page, `Portrait detail for ${s.title}`);
  const text = await page.locator('body').innerText();
  if (!text.includes(s.heading)) throw new Error(`Missing heading ${s.heading} on ${s.title}`);
  if (!text.includes(s.narrative)) throw new Error(`Missing narrative on ${s.title}`);
  assertNoFabrication(text, s.title, s.idx === 3);
  if (s.idx === 5) {
    await verifyCancelledDetail(page);
  } else {
    await verifySampleMilestones(page, s.idx, s.title);
  }
  if (s.idx === 0) await verifySample0Contrast(page, s.heading);
  if (s.shot) await page.screenshot({ path: path.join(SCREENSHOT_DIR, s.shot) });
  await verifyAndTapBack(page);
}

async function verifyFilterPreservation(page) {
  console.log('Verifying filter preservation across detail navigation...');
  const pastTab = page.locator('[role="tab"]:has-text("Past")');
  await pastTab.tap();
  await page.waitForTimeout(400);
  if ((await pastTab.getAttribute('aria-selected')) !== 'true') throw new Error('Past tab not selected');
  if ((await page.locator('[role="button"][aria-label^="View details for"]').count()) !== 2) {
    throw new Error('Past segment must show exactly 2 items');
  }
  await openSampleDetail(page, 'Furniture & Carpentry Work');
  await verifyAndTapBack(page);
  if ((await pastTab.getAttribute('aria-selected')) !== 'true') throw new Error('Past tab selection not preserved');
  if ((await page.locator('[role="button"][aria-label^="View details for"]').count()) !== 2) {
    throw new Error('Past segment did not retain 2 items after Back');
  }
  const allTab = page.locator('[role="tab"]:has-text("All")');
  await allTab.tap();
  await page.waitForTimeout(400);
  if ((await page.locator('[role="button"][aria-label^="View details for"]').count()) !== 6) {
    throw new Error('All segment must show 6 items after restoring All');
  }
}

async function verifyLandscape(page) {
  console.log('Verifying Landscape (844x390)...');
  await page.setViewportSize({ width: 844, height: 390 });
  await openSampleDetail(page, 'Generator Servicing & Repair');
  await page.waitForTimeout(300);
  await verifyOverflow(page, 'Landscape detail view');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'expo-mob-life-001-05-detail-landscape-dark.png') });
  await verifyAndTapBack(page);
  await page.setViewportSize({ width: 375, height: 812 });
}

async function toggleTheme(page, targetLabel) {
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);
  const toggle = page.locator(`[role="button"][aria-label="${targetLabel}"]`);
  if ((await toggle.count()) > 0) {
    await toggle.tap();
    await page.waitForTimeout(300);
  }
}

async function verifyLightTheme(page) {
  console.log('Verifying Light mode detail...');
  try {
    await toggleTheme(page, 'Switch to light mode');
    await page.goto(`${BASE_URL}/jobs`, { waitUntil: 'networkidle' });
    await openSampleDetail(page, 'Generator Servicing & Repair');
    await page.waitForTimeout(300);
    await verifyOverflow(page, 'Light mode detail view');
    const el = page.getByText('Request Received', { exact: true });
    await measureContrast(page, el, el.locator('..'), 'Light Heading');
    await measureBackContrast(page, 'Light');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'expo-mob-life-001-06-detail-portrait-light.png') });
    await verifyAndTapBack(page);
  } finally {
    await toggleTheme(page, 'Switch to dark mode');
  }
}

async function verifyReducedMotionAndZoom(page) {
  console.log('Verifying reduced motion and zoom proxy...');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(`${BASE_URL}/jobs`, { waitUntil: 'networkidle' });
  const count = await page.evaluate(() => document.getAnimations().filter((a) => a.playState === 'running').length);
  if (count !== 0) throw new Error(`Expected 0 running animations, found ${count}`);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.evaluate(() => { document.body.style.zoom = '200%'; });
  await page.waitForTimeout(300);
  await openSampleDetail(page, 'Generator Servicing & Repair');
  await verifyOverflow(page, '200% zoom detail');
  await verifyAndTapBack(page);
  await page.evaluate(() => { document.body.style.zoom = '100%'; });
}

async function saveContinuousRecording() {
  if (!fs.existsSync(VIDEOS_DIR)) fs.mkdirSync(VIDEOS_DIR, { recursive: true });
  const files = fs.readdirSync(VIDEO_TMP_DIR).filter((f) => f.endsWith('.webm'));
  if (files.length === 0) throw new Error('Continuous recording was not produced');
  const src = path.join(VIDEO_TMP_DIR, files[0]);
  const dest = path.join(VIDEOS_DIR, 'expo-mob-life-001-lifecycle-verification.webm');
  fs.copyFileSync(src, dest);
  fs.rmSync(VIDEO_TMP_DIR, { recursive: true, force: true });
  console.log('Continuous recording saved to', dest);
}

async function main() {
  const server = await startStaticServer();
  const { browser, context, page } = await launchBrowser();
  try {
    await page.goto(`${BASE_URL}/jobs`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);
    await verifyTouchTargets(page);
    for (const s of SAMPLES) await verifySample(page, s);
    await verifyFilterPreservation(page);
    await verifyLandscape(page);
    await verifyLightTheme(page);
    await verifyReducedMotionAndZoom(page);
    console.log('PASS: All MOB-LIFE-001 Expo browser checks passed cleanly.');
  } finally {
    await page.close();
    await context.close();
    await browser.close();
    server.close();
    await saveContinuousRecording();
  }
}

main().catch((err) => {
  console.error('MOB-LIFE-001 Verification failed:', err);
  process.exit(1);
});

import http from 'http';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { execSync } from 'child_process';
import { chromium } from 'playwright';

const PORT = 8081;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const SCREENSHOT_DIR = path.resolve('docs/screenshots');
const DIST_WEB = path.resolve('apps/mobile/dist-web');

function getMimeType(filePath) {
  const ext = path.extname(filePath);
  if (ext === '.js') return 'application/javascript';
  if (ext === '.html') return 'text/html';
  if (ext === '.css') return 'text/css';
  if (ext === '.json') return 'application/json';
  if (ext === '.png') return 'image/png';
  if (ext === '.ttf') return 'font/ttf';
  return 'application/octet-stream';
}

function serveStaticFile(req, res, distDir = DIST_WEB) {
  const cleanUrl = req.url.split('?')[0];
  let filePath = path.join(distDir, cleanUrl === '/' ? 'index.html' : cleanUrl);
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(distDir, 'index.html');
  }
  res.writeHead(200, { 'Content-Type': getMimeType(filePath) });
  fs.createReadStream(filePath).pipe(res);
}

function startWebServer(distDir = DIST_WEB, port = PORT) {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => serveStaticFile(req, res, distDir));
    server.listen(port, '127.0.0.1', () => resolve(server));
  });
}

function luminance(r, g, b) {
  const a = [r, g, b].map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function contrastRatio(rgb1, rgb2) {
  const l1 = luminance(rgb1.r, rgb1.g, rgb1.b);
  const l2 = luminance(rgb2.r, rgb2.g, rgb2.b);
  const brighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (brighter + 0.05) / (darker + 0.05);
}

function parseRgb(str) {
  const m = str.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!m) return { r: 255, g: 255, b: 255 };
  return { r: Number(m[1]), g: Number(m[2]), b: Number(m[3]) };
}

async function getEffectiveBg(locator) {
  return locator.evaluate((el) => {
    let cur = el;
    while (cur) {
      const bg = window.getComputedStyle(cur).backgroundColor;
      if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') return bg;
      cur = cur.parentElement;
    }
    return 'rgb(11, 14, 19)';
  });
}

async function verifyOverflow(page, contextLabel) {
  const hasOverflow = await page.evaluate(() => {
    const root = document.documentElement;
    const body = document.body;
    return (
      root.scrollWidth > root.clientWidth ||
      (body && body.scrollWidth > body.clientWidth)
    );
  });
  if (hasOverflow) throw new Error(`Horizontal overflow detected in ${contextLabel}`);
}

async function measureContrast(page, textLocator, minRatio, label) {
  const fg = await textLocator.evaluate((el) => window.getComputedStyle(el).color);
  const bg = await getEffectiveBg(textLocator);
  const ratio = contrastRatio(parseRgb(fg), parseRgb(bg));
  console.log(`Contrast [${label}]: fg=${fg}, bg=${bg}, ratio=${ratio.toFixed(2)}:1`);
  if (ratio < minRatio) {
    throw new Error(`Contrast [${label}]: ${ratio.toFixed(2)}:1 < ${minRatio}:1`);
  }
}

async function verifyTouchTarget(locator, label) {
  const box = await locator.boundingBox();
  if (!box) throw new Error(`Target not found for ${label}`);
  if (box.height < 48 || box.width < 48) {
    throw new Error(`Touch target for ${label} is ${box.width}x${box.height} (< 48x48)`);
  }
}

function assertNoFabrication(text, contextLabel) {
  const prohibited = [
    /Babajide/i, /Solomon/i, /Bukie/i, /John Doe/i,
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/,
    /(?:080|090|070|081|\+234)\d{7,}/,
    /\b(?:Plot|House|Flat|No\.)\s*\d+/i,
    /Push notification received/i, /Real-time dispatch active/i,
    /Rating:\s*5\./i, /100%\s*verified/i,
  ];
  for (const pattern of prohibited) {
    if (pattern.test(text)) {
      throw new Error(`Fabricated data detected in ${contextLabel}: ${pattern}`);
    }
  }
}

async function measureRegisterLinkContrast(page, themeLabel) {
  const linkText = page.getByText('View Sample Workspace Preview');
  await measureContrast(page, linkText, 4.5, `${themeLabel} Register Link Text`);
  const linkBtn = page.getByRole('button', { name: 'View sample workspace preview' });
  const borderColor = await linkBtn.evaluate((el) => window.getComputedStyle(el).borderColor);
  const bg = await getEffectiveBg(linkBtn);
  const borderRatio = contrastRatio(parseRgb(borderColor), parseRgb(bg));
  console.log(`Contrast [${themeLabel} Register Link Border]: border=${borderColor}, bg=${bg}, ratio=${borderRatio.toFixed(2)}:1`);
  if (borderRatio < 3.0) throw new Error(`${themeLabel} Register Link Border: ${borderRatio.toFixed(2)}:1 < 3.0:1`);
}

async function verifyRegisterLinkFlow(page) {
  console.log('Verifying registration preview link flow...');
  await page.goto(`${BASE_URL}/brainworker/register`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);
  const link = page.getByRole('button', { name: 'View sample workspace preview' });
  await verifyTouchTarget(link, 'Registration preview link');
  await measureRegisterLinkContrast(page, 'Dark');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'expo-mob-work-001-01-register-preview-link-dark.png') });
  await link.tap();
  await page.waitForTimeout(300);
  await page.waitForURL(/.*\/brainworker\/workspace-preview/);
}

async function measureDisclaimerAndBadgeContrast(page, themeLabel) {
  const disclaimer = page.getByText('Sample preview only');
  await measureContrast(page, disclaimer, 4.5, `${themeLabel} Disclaimer Text`);
  const badge = page.getByText('SAMPLE PREVIEW', { exact: true });
  await measureContrast(page, badge, 4.5, `${themeLabel} Badge Text`);
}

async function measureLeadCardContrast(page, themeLabel) {
  const card = page.getByRole('button', { name: 'View sample details for Generator Servicing & Repair' });
  const borderColor = await card.evaluate((el) => window.getComputedStyle(el).borderColor);
  const bg = await getEffectiveBg(card);
  const borderRatio = contrastRatio(parseRgb(borderColor), parseRgb(bg));
  console.log(`Contrast [${themeLabel} Card Boundary]: border=${borderColor}, bg=${bg}, ratio=${borderRatio.toFixed(2)}:1`);
  if (borderRatio < 3.0) throw new Error(`${themeLabel} Card Boundary: ${borderRatio.toFixed(2)}:1 < 3.0:1`);

  const cardBg = await card.evaluate((el) => window.getComputedStyle(el).backgroundColor);
  const title = card.getByText('Generator Servicing & Repair');
  const titleColor = await title.evaluate((el) => window.getComputedStyle(el).color);
  const titleRatio = contrastRatio(parseRgb(titleColor), parseRgb(cardBg));
  console.log(`Contrast [${themeLabel} Card Normal Title]: fg=${titleColor}, bg=${cardBg}, ratio=${titleRatio.toFixed(2)}:1`);
  if (titleRatio < 4.5) throw new Error(`${themeLabel} Card Normal Title: ${titleRatio.toFixed(2)}:1 < 4.5:1`);
  await measureCardPressedContrast(page, card, titleColor, themeLabel);
}

async function measureCardPressedContrast(page, card, titleColor, themeLabel) {
  const box = await card.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(100);
  try {
    const pressedBg = await card.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    const pressedRatio = contrastRatio(parseRgb(titleColor), parseRgb(pressedBg));
    console.log(`Contrast [${themeLabel} Card Pressed Title]: fg=${titleColor}, bg=${pressedBg}, ratio=${pressedRatio.toFixed(2)}:1`);
    if (pressedRatio < 4.5) throw new Error(`${themeLabel} Card Pressed Title: ${pressedRatio.toFixed(2)}:1 < 4.5:1`);
  } finally {
    await page.mouse.move(0, 0);
    await page.mouse.up();
  }
}

async function verifyDisclaimerA11y(page, contextLabel) {
  const el = page.locator('[aria-label*="Sample preview only"]');
  if ((await el.count()) === 0) {
    throw new Error(`Explicit accessibilityLabel missing for disclaimer in ${contextLabel}`);
  }
}

async function measureCtaContrast(page, themeLabel) {
  const btn = page.getByRole('button', { name: 'View sample details for lead alert' });
  const text = page.getByText('View sample details');
  await measureContrast(page, text, 4.5, `${themeLabel} CTA Normal Text`);
  const box = await btn.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(100);
  try {
    const pressedBg = await btn.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    const fg = await text.evaluate((el) => window.getComputedStyle(el).color);
    const ratio = contrastRatio(parseRgb(fg), parseRgb(pressedBg));
    console.log(`Contrast [${themeLabel} CTA Pressed Text]: fg=${fg}, bg=${pressedBg}, ratio=${ratio.toFixed(2)}:1`);
    if (ratio < 4.5) throw new Error(`${themeLabel} CTA Pressed Text: ${ratio.toFixed(2)}:1 < 4.5:1`);
  } finally {
    await page.mouse.move(0, 0);
    await page.mouse.up();
  }
}

const SAMPLE_TITLES = [
  'Generator Servicing & Repair',
  'AC Repair & Gas Refill',
  'Plumbing & Pipe Fitting',
];

async function verifyFooterLayoutAt375(page) {
  console.log('Verifying footer layout collision and stacking across all 3 cards at 375px...');
  for (const title of SAMPLE_TITLES) {
    const card = page.getByRole('button', { name: `View sample details for ${title}` });
    const budgetBox = await card.getByText('SAMPLE BUDGET').boundingBox();
    const timeframeBox = await card.getByText('TIMEFRAME').boundingBox();
    if (!budgetBox || !timeframeBox) throw new Error(`Missing footer elements for ${title}`);
    if (timeframeBox.y <= budgetBox.y) {
      throw new Error(`Footer is not vertically stacked on ${title}: timeframe.y=${timeframeBox.y} <= budget.y=${budgetBox.y}`);
    }
  }
  await verifyOverflow(page, 'Lead card footers 375px');
}

async function getVisibleTextElements(page) {
  return page.evaluate(() => {
    function getBg(el) {
      let cur = el;
      while (cur && cur !== document.documentElement) {
        const bg = window.getComputedStyle(cur).backgroundColor;
        if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') return bg;
        cur = cur.parentElement;
      }
      return 'rgb(11, 14, 19)';
    }
    const list = [];
    document.querySelectorAll('*').forEach((el) => {
      const s = window.getComputedStyle(el);
      if (s.display === 'none' || s.visibility === 'hidden') return;
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      if (s.fontFamily && s.fontFamily.toLowerCase().includes('ionicons')) return;
      if (el.children.length === 0 && el.textContent.trim().length > 0) {
        list.push({ text: el.textContent.trim().slice(0, 30), fg: s.color, bg: getBg(el) });
      }
    });
    return list;
  });
}

async function scanVisibleTextContrast(page, label, minRatio = 4.5) {
  const elements = await getVisibleTextElements(page);
  let minMeasured = 999;
  for (const el of elements) {
    const ratio = contrastRatio(parseRgb(el.fg), parseRgb(el.bg));
    if (ratio < minMeasured) minMeasured = ratio;
    if (ratio < minRatio) {
      throw new Error(`Text contrast failure [${label} - "${el.text}"]: ${ratio.toFixed(2)}:1 < ${minRatio}:1`);
    }
  }
  console.log(`Scan [${label}]: verified ${elements.length} text nodes (min: ${minMeasured.toFixed(2)}:1 >= ${minRatio}:1)`);
}

async function getVisibleIconElements(page) {
  return page.evaluate(() => {
    function getBg(el) {
      let cur = el;
      while (cur && cur !== document.documentElement) {
        const bg = window.getComputedStyle(cur).backgroundColor;
        if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') return bg;
        cur = cur.parentElement;
      }
      return 'rgb(11, 14, 19)';
    }
    const list = [];
    document.querySelectorAll('*').forEach((el) => {
      const s = window.getComputedStyle(el);
      if (s.display === 'none' || s.visibility === 'hidden') return;
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const isIcon = (s.fontFamily && s.fontFamily.toLowerCase().includes('ionicons')) || el.tagName.toLowerCase() === 'svg';
      if (!isIcon) return;
      list.push({ tag: el.tagName, fg: s.color, bg: getBg(el) });
    });
    return list;
  });
}

async function measureIconContrast(page, label, minRatio = 3.0) {
  const icons = await getVisibleIconElements(page);
  let minMeasured = 999;
  for (const ic of icons) {
    const ratio = contrastRatio(parseRgb(ic.fg), parseRgb(ic.bg));
    if (ratio < minMeasured) minMeasured = ratio;
    if (ratio < minRatio) {
      throw new Error(`Icon contrast failure [${label}]: ${ratio.toFixed(2)}:1 < ${minRatio}:1`);
    }
  }
  console.log(`Scan [${label}]: verified ${icons.length} icons (min: ${minMeasured.toFixed(2)}:1 >= ${minRatio}:1)`);
}

async function verifyWorkspaceFeed(page) {
  console.log('Verifying workspace feed presentation...');
  await verifyOverflow(page, 'Workspace feed 375px');
  const title = page.getByText('BrainWorker workspace preview');
  await measureContrast(page, title, 4.5, 'Workspace Title');
  await verifyDisclaimerA11y(page, 'Workspace feed');
  await measureDisclaimerAndBadgeContrast(page, 'Dark');
  await measureCtaContrast(page, 'Dark');
  await measureLeadCardContrast(page, 'Dark');
  await scanVisibleTextContrast(page, 'Dark Feed Text');
  await measureIconContrast(page, 'Dark Feed Icons');
  await verifyFooterLayoutAt375(page);
  const alertBtn = page.getByRole('button', { name: 'View sample details for lead alert' });
  await verifyTouchTarget(alertBtn, 'Lead alert action button');
  const card = page.getByRole('button', { name: 'View sample details for Generator Servicing & Repair' });
  await verifyTouchTarget(card, 'Lead card target');
  const pageText = await page.locator('body').innerText();
  assertNoFabrication(pageText, 'Workspace feed text');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'expo-mob-work-001-02-workspace-feed-dark.png') });
}

async function measureBorderContrast(locator, minRatio, label) {
  const border = await locator.evaluate((el) => window.getComputedStyle(el).borderColor);
  const bg = await getEffectiveBg(locator);
  const ratio = contrastRatio(parseRgb(border), parseRgb(bg));
  console.log(`Border Contrast [${label}]: border=${border}, bg=${bg}, ratio=${ratio.toFixed(2)}:1`);
  if (ratio < minRatio) {
    throw new Error(`Border contrast failure [${label}]: ${ratio.toFixed(2)}:1 < ${minRatio}:1`);
  }
}

async function verifyInvitationCard(page, themeLabel) {
  const actionCard = page.getByText('SAMPLE INVITATION ACTIONS');
  if ((await actionCard.count()) === 0) {
    throw new Error(`Invitation action card missing in ${themeLabel} mode`);
  }
  const acceptBtn = page.getByRole('button', { name: 'Accept sample lead' });
  const declineBtn = page.getByRole('button', { name: 'Decline sample lead' });
  await verifyTouchTarget(acceptBtn, `${themeLabel} Accept button`);
  await verifyTouchTarget(declineBtn, `${themeLabel} Decline button`);
  await measureBorderContrast(declineBtn, 3.0, `${themeLabel} Decline Button Border`);
  await scanVisibleTextContrast(page, `${themeLabel} Invitation Actions Text`);
  await measureIconContrast(page, `${themeLabel} Invitation Actions Icons`);

  if (themeLabel === 'Dark') {
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'expo-mob-work-002-01-invitation-actions-dark.png') });
  } else {
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'expo-mob-work-002-06-invitation-actions-light.png') });
  }
}

async function verifyAcceptModalDismissal(page, themeLabel) {
  const acceptBtn = page.getByRole('button', { name: 'Accept sample lead' });
  await acceptBtn.tap();
  await page.waitForTimeout(300);
  const title = page.getByRole('heading', { name: 'Accept Sample Lead?' });
  if ((await title.count()) === 0) throw new Error('Accept modal title missing');
  await measureContrast(page, title, 4.5, `${themeLabel} Accept Modal Title`);
  await scanVisibleTextContrast(page, `${themeLabel} Accept Modal Text`);
  const cancelBtn = page.getByRole('button', { name: 'Cancel acceptance preview' });
  await measureBorderContrast(cancelBtn, 3.0, `${themeLabel} Accept Cancel Border`);
  await measureBorderContrast(page.getByTestId('accept-modal-card'), 3.0, `${themeLabel} Accept Modal Card Border`);

  if (themeLabel === 'Dark') {
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'expo-mob-work-002-02-accept-modal-dark.png') });
  }
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  if ((await page.getByRole('heading', { name: 'Accept Sample Lead?' }).count()) > 0) {
    throw new Error('Escape should dismiss accept modal');
  }
}

async function verifyAcceptModalConfirm(page, themeLabel) {
  const acceptBtn = page.getByRole('button', { name: 'Accept sample lead' });
  await acceptBtn.tap();
  await page.waitForTimeout(300);
  const confirmBtn = page.getByRole('button', { name: 'Confirm sample acceptance' });
  await confirmBtn.tap();
  await page.waitForTimeout(300);
  const outcome = page.getByRole('heading', { name: 'Sample Lead Accepted (Preview)' });
  if ((await outcome.count()) === 0) throw new Error('Accepted outcome missing after confirm');
  await measureContrast(page, outcome, 4.5, `${themeLabel} Accepted Outcome Title`);
  await scanVisibleTextContrast(page, `${themeLabel} Accepted Outcome Text`);
  await measureIconContrast(page, `${themeLabel} Accepted Outcome Icons`);

  if (themeLabel === 'Dark') {
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'expo-mob-work-002-03-accepted-outcome-dark.png') });
  }
  const resetBtn = page.getByRole('button', { name: 'Reset preview outcome' });
  await verifyTouchTarget(resetBtn, 'Reset outcome button');
  await resetBtn.tap();
  await page.waitForTimeout(300);
}

async function verifyDeclineModalDismissal(page, themeLabel) {
  const declineBtn = page.getByRole('button', { name: 'Decline sample lead' });
  await declineBtn.tap();
  await page.waitForTimeout(300);
  const title = page.getByRole('heading', { name: 'Decline Sample Lead' });
  if ((await title.count()) === 0) throw new Error('Decline modal title missing');
  await measureContrast(page, title, 4.5, `${themeLabel} Decline Modal Title`);
  await scanVisibleTextContrast(page, `${themeLabel} Decline Modal Text`);
  const cancelBtn = page.getByRole('button', { name: 'Cancel decline preview' });
  await measureBorderContrast(cancelBtn, 3.0, `${themeLabel} Decline Cancel Border`);
  await measureBorderContrast(page.getByTestId('decline-modal-card'), 3.0, `${themeLabel} Decline Modal Card Border`);

  if (themeLabel === 'Dark') {
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'expo-mob-work-002-04-decline-modal-dark.png') });
  } else {
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'expo-mob-work-002-07-decline-modal-light.png') });
  }
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  if ((await page.getByRole('heading', { name: 'Decline Sample Lead' }).count()) > 0) {
    throw new Error('Escape should dismiss decline modal');
  }
}

async function selectDeclineReasonAndConfirm(page, themeLabel) {
  const confirmBtn = page.getByRole('button', { name: 'Confirm sample decline' });
  const isAriaDisabled = await confirmBtn.getAttribute('aria-disabled');
  if (isAriaDisabled !== 'true') throw new Error('Confirm decline button must be disabled before reason selection');
  const radio = page.getByRole('radio', { name: 'Rate or budget mismatch' });
  await verifyTouchTarget(radio, 'Decline radio option');
  await measureBorderContrast(radio, 3.0, `${themeLabel} Decline Radio Unselected Border`);
  await radio.tap();
  await page.waitForTimeout(300);
  await measureBorderContrast(radio, 3.0, `${themeLabel} Decline Radio Selected Border`);
  await confirmBtn.tap();
  await page.waitForTimeout(300);
}

async function verifyDeclineModalConfirm(page, themeLabel) {
  const declineBtn = page.getByRole('button', { name: 'Decline sample lead' });
  await declineBtn.tap();
  await page.waitForTimeout(300);
  await selectDeclineReasonAndConfirm(page, themeLabel);
  const outcome = page.getByRole('heading', { name: 'Sample Lead Declined (Preview)' });
  if ((await outcome.count()) === 0) throw new Error('Declined outcome missing after confirm');
  await measureContrast(page, outcome, 4.5, `${themeLabel} Declined Outcome Title`);
  await scanVisibleTextContrast(page, `${themeLabel} Declined Outcome Text`);
  await measureIconContrast(page, `${themeLabel} Declined Outcome Icons`);

  if (themeLabel === 'Dark') {
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'expo-mob-work-002-05-declined-outcome-dark.png') });
  }
  const resetBtn = page.getByRole('button', { name: 'Reset preview outcome' });
  await resetBtn.tap();
  await page.waitForTimeout(300);
}

async function verifyInvitationActionFlow(page, themeLabel) {
  console.log(`Verifying invitation action preview modals in ${themeLabel} mode...`);
  await verifyInvitationCard(page, themeLabel);
  await verifyAcceptModalDismissal(page, themeLabel);
  await verifyAcceptModalConfirm(page, themeLabel);
  await verifyDeclineModalDismissal(page, themeLabel);
  await verifyDeclineModalConfirm(page, themeLabel);
}

async function verifyAlertDetailFlow(page) {
  console.log('Verifying alert detail inspection and back flow...');
  const alertBtn = page.getByRole('button', { name: 'View sample details for lead alert' });
  await alertBtn.tap();
  await page.waitForTimeout(300);
  await verifyOverflow(page, 'Alert detail inspection');
  await verifyDisclaimerA11y(page, 'Alert detail inspection');
  await scanVisibleTextContrast(page, 'Dark Alert Detail Text');
  await measureIconContrast(page, 'Dark Alert Detail Icons');
  const backBtn = page.getByRole('button', { name: 'Back to lead feed' });
  await verifyTouchTarget(backBtn, 'Detail back button');
  const backText = page.getByText('Back to Lead Feed');
  await measureContrast(page, backText, 4.5, 'Detail Back Button');
  const detailText = await page.locator('body').innerText();
  assertNoFabrication(detailText, 'Alert detail text');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'expo-mob-work-001-03-alert-detail-dark.png') });
  await backBtn.tap();
  await page.waitForTimeout(300);
}

async function verifyLeadCardDetailFlow(page) {
  console.log('Verifying lead card detail inspection...');
  const card = page.getByRole('button', { name: 'View sample details for AC Repair & Gas Refill' });
  await card.tap();
  await page.waitForTimeout(300);
  await verifyOverflow(page, 'AC lead detail inspection');
  await verifyDisclaimerA11y(page, 'AC lead detail inspection');
  const actionsCard = page.getByText('SAMPLE INVITATION ACTIONS');
  if ((await actionsCard.count()) > 0) throw new Error('Invitation actions must not appear on generic lead card');
  await scanVisibleTextContrast(page, 'Dark AC Detail Text');
  await measureIconContrast(page, 'Dark AC Detail Icons');
  const title = page.getByRole('heading', { name: 'AC Repair & Gas Refill' });
  await measureContrast(page, title, 4.5, 'AC Detail Title');
  const detailText = await page.locator('body').innerText();
  assertNoFabrication(detailText, 'AC lead detail text');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'expo-mob-work-001-04-lead-detail-dark.png') });
  const backBtn = page.getByRole('button', { name: 'Back to lead feed' });
  await backBtn.tap();
  await page.waitForTimeout(300);
}

async function verifyLandscape(page) {
  console.log('Verifying landscape orientation (844x390)...');
  await page.setViewportSize({ width: 844, height: 390 });
  await page.waitForTimeout(300);
  await verifyOverflow(page, 'Landscape feed view');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'expo-mob-work-001-05-workspace-landscape-dark.png') });
  await page.setViewportSize({ width: 375, height: 812 });
  await page.waitForTimeout(300);
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

async function verifyLightRegistration(page) {
  await page.goto(`${BASE_URL}/brainworker/register`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);
  await verifyOverflow(page, 'Light registration view');
  await measureRegisterLinkContrast(page, 'Light');
  const link = page.getByRole('button', { name: 'View sample workspace preview' });
  await verifyTouchTarget(link, 'Light registration link');
  await link.tap();
  await page.waitForTimeout(300);
  await page.waitForURL(/.*\/brainworker\/workspace-preview/);
}

async function verifyLightDetail(page) {
  const card = page.getByRole('button', { name: 'View sample details for Plumbing & Pipe Fitting' });
  await card.tap();
  await page.waitForTimeout(300);
  await verifyOverflow(page, 'Light mode lead detail');
  await verifyDisclaimerA11y(page, 'Light lead detail');
  await scanVisibleTextContrast(page, 'Light Plumbing Detail Text');
  await measureIconContrast(page, 'Light Plumbing Detail Icons');
  const detailTitle = page.getByRole('heading', { name: 'Plumbing & Pipe Fitting' });
  await measureContrast(page, detailTitle, 4.5, 'Light Plumbing Title');
  const backBtn = page.getByRole('button', { name: 'Back to lead feed' });
  const backText = page.getByText('Back to Lead Feed');
  await measureContrast(page, backText, 4.5, 'Light Detail Back Button');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'expo-mob-work-001-07-lead-detail-light.png') });
  await backBtn.tap();
  await page.waitForTimeout(300);
}

async function verifyLightMode(page) {
  console.log('Verifying Light mode workspace and detail...');
  try {
    await toggleTheme(page, 'Switch to light mode');
    await verifyLightRegistration(page);
    await verifyOverflow(page, 'Light mode workspace feed');
    const title = page.getByText('BrainWorker workspace preview');
    await measureContrast(page, title, 4.5, 'Light Workspace Title');
    await verifyDisclaimerA11y(page, 'Light workspace feed');
    await measureDisclaimerAndBadgeContrast(page, 'Light');
    await measureCtaContrast(page, 'Light');
    await measureLeadCardContrast(page, 'Light');
    await scanVisibleTextContrast(page, 'Light Feed Text');
    await measureIconContrast(page, 'Light Feed Icons');
    await verifyFooterLayoutAt375(page);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'expo-mob-work-001-06-workspace-feed-light.png') });
    await verifyLightDetail(page);
  } finally {
    await toggleTheme(page, 'Switch to dark mode');
  }
}

async function verifyLargeText(page) {
  console.log('Verifying 125% rendered-text scaling proxy directly on workspace preview...');
  await page.goto(`${BASE_URL}/brainworker/workspace-preview`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);
  const title = page.getByText('BrainWorker workspace preview');
  if ((await title.count()) === 0) throw new Error('Workspace title missing before scaling');
  const initialFontSize = await title.evaluate((el) => parseFloat(window.getComputedStyle(el).fontSize));
  await page.evaluate(() => {
    document.querySelectorAll('*').forEach((el) => {
      if (el.children.length === 0 && el.textContent.trim().length > 0) {
        const computed = parseFloat(window.getComputedStyle(el).fontSize);
        if (!isNaN(computed)) {
          el.setAttribute('data-orig-font-size', el.style.fontSize || '');
          el.style.fontSize = `${computed * 1.25}px`;
        }
      }
    });
  });
  await page.waitForTimeout(300);
  const scaledFontSize = await title.evaluate((el) => parseFloat(window.getComputedStyle(el).fontSize));
  if (scaledFontSize <= initialFontSize) throw new Error(`Font scaling failed: ${scaledFontSize} <= ${initialFontSize}`);
  await verifyOverflow(page, '125% rendered-text scaling proxy on workspace preview');
  await restoreScaledFonts(page);
}

async function restoreScaledFonts(page) {
  await page.evaluate(() => {
    document.querySelectorAll('[data-orig-font-size]').forEach((el) => {
      el.style.fontSize = el.getAttribute('data-orig-font-size');
      el.removeAttribute('data-orig-font-size');
    });
  });
  await page.waitForTimeout(300);
}

async function verifyWork002LightFlow(page) {
  await toggleTheme(page, 'Switch to light mode');
  try {
    await page.goto(`${BASE_URL}/brainworker/workspace-preview`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(300);
    const lightAlertBtn = page.getByRole('button', { name: 'View sample details for lead alert' });
    await lightAlertBtn.tap();
    await page.waitForTimeout(300);
    await verifyInvitationActionFlow(page, 'Light');
  } finally {
    await toggleTheme(page, 'Switch to dark mode');
  }
}

async function verifyViewportBounds(locator, label, maxWidth = 844, maxHeight = 390) {
  const box = await locator.boundingBox();
  if (!box) throw new Error(`Target not found for ${label}`);
  const inBounds = box.x >= 0 && box.y >= 0 && box.x + box.width <= maxWidth && box.y + box.height <= maxHeight;
  if (!inBounds) {
    throw new Error(`${label} bounds (${box.x},${box.y},${box.width},${box.height}) exceed ${maxWidth}x${maxHeight}`);
  }
}

async function verifyLandscapeAcceptCancel(page) {
  await page.getByRole('button', { name: 'Accept sample lead' }).tap();
  await page.waitForTimeout(300);
  if ((await page.getByRole('heading', { name: 'Accept Sample Lead?' }).count()) === 0) throw new Error('Accept modal missing');
  await verifyOverflow(page, 'Landscape accept modal');
  const cancelBtn = page.getByRole('button', { name: 'Cancel acceptance preview' });
  await verifyTouchTarget(cancelBtn, 'Landscape accept cancel button');
  await verifyViewportBounds(cancelBtn, 'Landscape accept cancel button', 844, 390);
  await cancelBtn.tap();
  await page.waitForTimeout(300);
  if ((await page.getByRole('heading', { name: 'Accept Sample Lead?' }).count()) > 0) throw new Error('Accept modal did not close');
}

async function verifyLandscapeDeclineCancel(page) {
  await page.getByRole('button', { name: 'Decline sample lead' }).tap();
  await page.waitForTimeout(300);
  if ((await page.getByRole('heading', { name: 'Decline Sample Lead' }).count()) === 0) throw new Error('Decline modal missing');
  await verifyOverflow(page, 'Landscape decline modal');
  const cancelBtn = page.getByRole('button', { name: 'Cancel decline preview' });
  await verifyTouchTarget(cancelBtn, 'Landscape decline cancel button');
  await verifyViewportBounds(cancelBtn, 'Landscape decline cancel button', 844, 390);
  await cancelBtn.tap();
  await page.waitForTimeout(300);
  if ((await page.getByRole('heading', { name: 'Decline Sample Lead' }).count()) > 0) throw new Error('Decline modal did not close');
  if ((await page.getByText(/Sample Lead (Accepted|Declined) \(Preview\)/).count()) > 0) throw new Error('Outcome recorded on cancel');
}

async function verifyLandscapeModalCancelFlow(page) {
  console.log('Verifying landscape invitation modals with Cancel dismissal...');
  await page.setViewportSize({ width: 844, height: 390 });
  await page.waitForTimeout(200);
  await verifyOverflow(page, 'MOB-WORK-002 landscape invitation detail');
  await verifyLandscapeAcceptCancel(page);
  await verifyLandscapeDeclineCancel(page);
  await page.setViewportSize({ width: 375, height: 812 });
  await page.waitForTimeout(200);
}

async function executeWork002QaFlow(page) {
  console.log('Starting MOB-WORK-002 invitation modal QA flow...');
  await page.goto(`${BASE_URL}/brainworker/workspace-preview`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);
  const alertBtn = page.getByRole('button', { name: 'View sample details for lead alert' });
  await alertBtn.tap();
  await page.waitForTimeout(300);
  await verifyInvitationActionFlow(page, 'Dark');
  await verifyLandscapeModalCancelFlow(page);
  await verifyLargeText(page);
  await verifyWork002LightFlow(page);
}

async function verifyWork003LeadGenAccept(page) {
  console.log('Navigating to lead_gen_01 detail...');
  const alertBtn = page.getByRole('button', { name: 'View sample details for lead alert' });
  await verifyTouchTarget(alertBtn, 'Lead alert details button');
  await alertBtn.tap();
  await page.waitForTimeout(300);
  console.log('Accepting lead_gen_01 invitation...');
  const acceptBtn = page.getByRole('button', { name: 'Accept sample lead' });
  await verifyTouchTarget(acceptBtn, 'Accept sample lead button');
  await acceptBtn.tap();
  await page.waitForTimeout(300);
  const confirmBtn = page.getByRole('button', { name: 'Confirm sample acceptance' });
  await verifyTouchTarget(confirmBtn, 'Confirm acceptance button');
  await confirmBtn.tap();
  await page.waitForTimeout(300);
  const outcomeTitle = page.getByRole('heading', { name: 'Sample Lead Accepted (Preview)' });
  if ((await outcomeTitle.count()) === 0) {
    throw new Error('Accepted outcome title missing after confirmation');
  }
}

async function verifyWork003State1Unsimulated(page) {
  const checkInBtn = page.locator('[role="button"]').filter({ hasText: 'Preview on-site check-in' });
  if ((await checkInBtn.count()) === 0) throw new Error('Preview on-site check-in button missing');
  await verifyTouchTarget(checkInBtn, 'Preview on-site check-in entry button');
  await checkInBtn.tap();
  await page.waitForTimeout(300);
  await verifyOverflow(page, 'State 1 unsimulated check-in');
  const eyebrow = page.getByText('SAMPLE LOCATION SIMULATION');
  if ((await eyebrow.count()) === 0) throw new Error('Missing eyebrow: SAMPLE LOCATION SIMULATION');
  const badge = page.getByText('LOCAL PREVIEW ONLY');
  if ((await badge.count()) === 0) throw new Error('Missing badge: LOCAL PREVIEW ONLY');
  const disclaimer = page.getByText('This location is simulated and does not prove or guarantee physical presence.');
  if ((await disclaimer.count()) === 0) throw new Error('Missing check-in disclaimer');
  const snapshot = page.getByText('Arrival Snapshot: Not simulated');
  if ((await snapshot.count()) === 0) throw new Error('Missing Arrival Snapshot: Not simulated');
  const tag = page.getByText('CONFIRMED (Sample)');
  if ((await tag.count()) === 0) throw new Error('Missing CONFIRMED (Sample) booking status tag');
  await measureContrast(page, eyebrow, 4.5, 'State 1 Eyebrow');
  await measureContrast(page, disclaimer, 4.5, 'State 1 Disclaimer');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'expo-mob-work-003-01-checkin-ready-dark.png') });
}

async function verifyWork003State2Simulated(page) {
  const simBtn = page.locator('[role="button"]').filter({ hasText: 'Simulate on-site check-in' });
  await verifyTouchTarget(simBtn, 'Simulate on-site check-in action button');
  await simBtn.tap();
  await page.waitForTimeout(300);
  await verifyOverflow(page, 'State 2 simulated check-in');
  const simBadge = page.getByText('SIMULATED ARRIVAL (Preview)');
  if ((await simBadge.count()) === 0) throw new Error('Missing exact visible string: SIMULATED ARRIVAL (Preview)');
  const stampText = page.getByText('Arrival view previewed in memory');
  if ((await stampText.count()) === 0) throw new Error('Missing exact visible string: Arrival view previewed in memory');
  const modalHeading = page.getByRole('heading', { name: /Accept Sample Lead\?|Decline Sample Lead/ });
  if ((await modalHeading.count()) > 0) throw new Error('Unexpected dialog/modal appeared during check-in simulation');
  const bodyText = await page.locator('body').innerText();
  if (/IN_PROGRESS|In Progress/i.test(bodyText) && !/In production/i.test(bodyText)) {
    throw new Error('Rendered booking status illegally changed');
  }
  await measureContrast(page, simBadge, 4.5, 'State 2 Simulated Badge');
  await measureContrast(page, stampText, 4.5, 'State 2 Stamp Text');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'expo-mob-work-003-02-checkin-simulated-dark.png') });
}

async function verifyWork003ResetRestoration(page) {
  const resetBtn = page.getByRole('button', { name: 'Reset location simulation' });
  await verifyTouchTarget(resetBtn, 'Reset location simulation button');
  await resetBtn.tap();
  await page.waitForTimeout(300);
  if ((await page.getByText('Arrival Snapshot: Not simulated').count()) === 0) {
    throw new Error('Reset failed: Arrival Snapshot: Not simulated is missing');
  }
  if ((await page.getByText('SIMULATED ARRIVAL (Preview)').count()) > 0) {
    throw new Error('Reset failed: SIMULATED ARRIVAL (Preview) is still visible');
  }
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'expo-mob-work-003-03-checkin-reset-dark.png') });
  await page.locator('[role="button"]').filter({ hasText: 'Simulate on-site check-in' }).tap();
  await page.waitForTimeout(300);
}

async function verifyWork003LightScheme(page) {
  console.log('Verifying OS-preference test while app remains dark (prefers-color-scheme: light)...');
  await page.emulateMedia({ colorScheme: 'light' });
  await page.waitForTimeout(300);
  const bg = await page.evaluate(() => {
    return window.getComputedStyle(document.body).backgroundColor || window.getComputedStyle(document.documentElement).backgroundColor;
  });
  const currentBgRgb = parseRgb(bg);
  if (luminance(currentBgRgb.r, currentBgRgb.g, currentBgRgb.b) > 0.1) {
    throw new Error(`OS light preference caused unexpected light background while app dark (${bg})`);
  }
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'expo-mob-work-003-04-checkin-simulated-light-scheme.png') });
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.waitForTimeout(200);
}

async function verifyWork003Landscape(page) {
  await page.setViewportSize({ width: 844, height: 390 });
  await page.waitForTimeout(300);
  await verifyOverflow(page, 'M3 compact landscape');
  const landscapeReset = page.getByRole('button', { name: 'Reset location simulation' });
  await verifyTouchTarget(landscapeReset, 'Landscape reset button');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'expo-mob-work-003-05-checkin-simulated-landscape.png') });
  await page.setViewportSize({ width: 375, height: 812 });
  await page.waitForTimeout(200);
}

async function verifyWork003ScaledText(page) {
  await page.evaluate(() => {
    document.querySelectorAll('*').forEach((el) => {
      if (el.children.length === 0 && el.textContent.trim().length > 0) {
        const computed = parseFloat(window.getComputedStyle(el).fontSize);
        if (!isNaN(computed)) {
          el.setAttribute('data-orig-font-size', el.style.fontSize || '');
          el.style.fontSize = `${computed * 1.25}px`;
        }
      }
    });
  });
  await page.waitForTimeout(300);
  await verifyOverflow(page, '125% browser text-scaling proxy on M3 simulated check-in');
  if ((await page.getByText('SIMULATED ARRIVAL (Preview)').count()) === 0) {
    throw new Error('SIMULATED ARRIVAL (Preview) label vanished under 125% text scale');
  }
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'expo-mob-work-003-06-checkin-simulated-scaled-text.png') });
  await restoreScaledFonts(page);
}

async function verifyWork003LightState1(page) {
  const checkInBtn = page.locator('[role="button"]').filter({ hasText: 'Preview on-site check-in' });
  await verifyTouchTarget(checkInBtn, 'Light Preview on-site check-in button');
  await checkInBtn.tap();
  await page.waitForTimeout(300);
  await verifyOverflow(page, 'State 1 light check-in');
  const eyebrow = page.getByText('SAMPLE LOCATION SIMULATION');
  const disclaimer = page.getByText('This location is simulated and does not prove or guarantee physical presence.');
  const snapshot = page.getByText('Arrival Snapshot: Not simulated');
  if ((await snapshot.count()) === 0) throw new Error('Missing Light Arrival Snapshot: Not simulated');
  await measureContrast(page, eyebrow, 4.5, 'Light State 1 Eyebrow');
  await measureContrast(page, disclaimer, 4.5, 'Light State 1 Disclaimer');
  const bg = await getEffectiveBg(eyebrow);
  const currentBgRgb = parseRgb(bg);
  if (luminance(currentBgRgb.r, currentBgRgb.g, currentBgRgb.b) < 0.5) {
    throw new Error(`App light mode failed: background was dark (${bg})`);
  }
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'expo-mob-work-003-07-checkin-ready-app-light.png') });
}

async function verifyWork003AppLightFlow(page) {
  console.log('Verifying app-selected light mode via home-screen toggle...');
  await toggleTheme(page, 'Switch to light mode');
  try {
    await page.goto(`${BASE_URL}/brainworker/workspace-preview`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(300);
    await verifyWork003LeadGenAccept(page);
    await verifyWork003LightState1(page);
  } finally {
    await toggleTheme(page, 'Switch to dark mode');
  }
}

async function executeWork003QaFlow(page) {
  console.log('Starting MOB-WORK-003 check-in simulation QA flow...');
  await page.goto(`${BASE_URL}/brainworker/workspace-preview`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);
  await verifyWork003LeadGenAccept(page);
  await verifyWork003State1Unsimulated(page);
  await verifyWork003State2Simulated(page);
  await verifyWork003ResetRestoration(page);
  await verifyWork003LightScheme(page);
  await verifyWork003Landscape(page);
  await verifyWork003ScaledText(page);
  await verifyWork003AppLightFlow(page);
}

async function verifyWork003ReadyScrollAndAssert(page, label) {
  const simBtn = page.locator('[role="button"]').filter({ hasText: 'Simulate on-site check-in' });
  if ((await simBtn.count()) === 0) throw new Error(`${label}: missing Simulate on-site check-in button`);
  await verifyTouchTarget(simBtn, `${label} Simulate on-site check-in button`);
  await simBtn.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  const box = await simBtn.boundingBox();
  if (!box || box.y < 0 || box.y + box.height > 812) {
    throw new Error(`${label}: action button outside 375x812 viewport: ${JSON.stringify(box)}`);
  }
  const disclaimer = page.getByText('This location is simulated and does not prove or guarantee physical presence.');
  if ((await disclaimer.count()) === 0) throw new Error(`${label}: missing disclaimer`);
  const snapshot = page.getByText('Arrival Snapshot: Not simulated');
  if ((await snapshot.count()) === 0) throw new Error(`${label}: missing Arrival Snapshot: Not simulated`);
}

async function verifyWork003ReadyDark(page) {
  console.log('Capturing M3 ready state in dark mode...');
  await page.goto(`${BASE_URL}/brainworker/workspace-preview`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);
  await verifyWork003LeadGenAccept(page);
  const checkInBtn = page.locator('[role="button"]').filter({ hasText: 'Preview on-site check-in' });
  await verifyTouchTarget(checkInBtn, 'Dark Preview on-site check-in button');
  await checkInBtn.tap();
  await page.waitForTimeout(300);
  await verifyWork003ReadyScrollAndAssert(page, 'Dark');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'expo-mob-work-003-01-checkin-ready-dark.png') });
}

async function verifyWork003ReadyLight(page) {
  console.log('Capturing M3 ready state in app light mode...');
  await toggleTheme(page, 'Switch to light mode');
  try {
    await page.goto(`${BASE_URL}/brainworker/workspace-preview`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(300);
    await verifyWork003LeadGenAccept(page);
    const checkInBtn = page.locator('[role="button"]').filter({ hasText: 'Preview on-site check-in' });
    await verifyTouchTarget(checkInBtn, 'Light Preview on-site check-in button');
    await checkInBtn.tap();
    await page.waitForTimeout(300);
    await verifyWork003ReadyScrollAndAssert(page, 'Light');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'expo-mob-work-003-07-checkin-ready-app-light.png') });
  } finally {
    await toggleTheme(page, 'Switch to dark mode');
  }
}

async function executeWork003ReadyCapturesFlow(page) {
  console.log('Executing narrow MOB-WORK-003 ready-captures flow...');
  await verifyWork003ReadyDark(page);
  await verifyWork003ReadyLight(page);
}

async function executeQaSteps(page) {
  await verifyRegisterLinkFlow(page);
  await verifyWorkspaceFeed(page);
  await verifyAlertDetailFlow(page);
  await verifyLeadCardDetailFlow(page);
  await verifyLandscape(page);
  await verifyLightMode(page);
  await verifyLargeText(page);
}

async function launchBrowser() {
  const executablePath = fs.existsSync('/usr/bin/google-chrome')
    ? '/usr/bin/google-chrome'
    : '/usr/bin/google-chrome-stable';
  return chromium.launch({
    headless: true,
    executablePath,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
}

async function closeAll(page, context, browser, server) {
  await page.close();
  await context.close();
  await browser.close();
  server.close();
}

async function runQa() {
  const isWork003Ready = process.argv.includes('--slice=MOB-WORK-003-ready-captures') || process.env.SLICE === 'MOB-WORK-003-ready-captures';
  const isWork003 = process.argv.includes('--slice=MOB-WORK-003') || process.env.SLICE === 'MOB-WORK-003';
  const isWork002 = process.argv.includes('--slice=MOB-WORK-002') || process.env.SLICE === 'MOB-WORK-002';
  let tmpExportDir = null;
  let server = null;
  const needsWebExport = isWork003 || isWork003Ready;

  if (needsWebExport) {
    tmpExportDir = fs.mkdtempSync(path.join(os.tmpdir(), 'expo-work003-web-'));
    console.log(`Compiling fresh Expo web export to ${tmpExportDir} via pnpm...`);
    execSync(`pnpm --filter @bukiebrainjobs/mobile exec expo export --platform web --output-dir "${tmpExportDir}"`, {
      stdio: 'inherit',
      env: { ...process.env, CI: '1' },
    });
  }
  server = needsWebExport ? await startWebServer(tmpExportDir) : await startWebServer();

  const browser = await launchBrowser();
  const context = await browser.newContext({ viewport: { width: 375, height: 812 }, hasTouch: true });
  const page = await context.newPage();
  const errors = [];
  const nonLocalRequests = [];
  page.on('pageerror', (err) => errors.push(err.message));
  page.on('console', (msg) => (msg.type() === 'error' ? errors.push(msg.text()) : null));
  page.on('request', (req) => {
    const url = req.url();
    if (!url.startsWith('http://127.0.0.1:') && !url.startsWith('http://localhost:')) {
      nonLocalRequests.push(url);
    }
  });

  try {
    if (isWork002) {
      await executeWork002QaFlow(page);
      if (errors.length > 0) throw new Error(`Browser errors:\n${errors.join('\n')}`);
      console.log('PASS: All MOB-WORK-002 Expo Playwright QA verifications passed cleanly!');
    } else if (isWork003Ready) {
      await executeWork003ReadyCapturesFlow(page);
      if (errors.length > 0) throw new Error(`Browser errors:\n${errors.join('\n')}`);
      if (nonLocalRequests.length > 0) throw new Error(`Non-local requests detected:\n${nonLocalRequests.join('\n')}`);
      console.log('PASS: All MOB-WORK-003 ready-captures verifications passed cleanly!');
    } else if (isWork003) {
      await executeWork003QaFlow(page);
      if (errors.length > 0) throw new Error(`Browser errors:\n${errors.join('\n')}`);
      if (nonLocalRequests.length > 0) throw new Error(`Non-local requests detected:\n${nonLocalRequests.join('\n')}`);
      console.log('PASS: All MOB-WORK-003 Expo Playwright QA verifications passed cleanly!');
    } else {
      await executeQaSteps(page);
      if (errors.length > 0) throw new Error(`Browser errors:\n${errors.join('\n')}`);
      console.log('PASS: All MOB-WORK-001 Expo Playwright QA verifications passed cleanly!');
    }
  } finally {
    await closeAll(page, context, browser, server);
    if (tmpExportDir && fs.existsSync(tmpExportDir)) {
      fs.rmSync(tmpExportDir, { recursive: true, force: true });
      console.log(`Cleaned up temporary export directory ${tmpExportDir}`);
    }
  }
}

runQa().catch((err) => {
  console.error('FAIL: MOB-WORK-001 QA error:', err);
  process.exit(1);
});

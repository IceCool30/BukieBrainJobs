import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import http from 'http';

const BASE_URL = process.env.MOB_POST_BASE_URL || 'http://127.0.0.1:8081';
const SCREENSHOT_DIR = path.resolve('docs/screenshots');
const DIST_WEB = path.resolve('apps/mobile/dist-web');

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

function startStaticServerIfNeeded() {
  return new Promise((resolve, reject) => {
    const testReq = http.get(BASE_URL, (res) => {
      res.resume();
      resolve(null);
    });
    testReq.on('error', () => {
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
      const port = Number(new URL(BASE_URL).port || 8081);
      server.listen(port, '127.0.0.1', () => resolve(server));
      server.on('error', reject);
    });
  });
}

async function createMobilePage(browser) {
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 2,
  });
  return context.newPage();
}

async function captureRequirement(page) {
  await page.locator('[role="button"]:has-text("A specific service")').click();
  await page.locator('input[aria-label*="title" i]').fill('Service a 5kVA generator');
  const description = page.locator('textarea, input[aria-label*="Description"]').first();
  await description.fill('The generator needs an oil change and an AVR check before the weekend.');
  await page.waitForTimeout(400);

  const continueBtn = page.locator('[role="button"]:has-text("Continue")');
  await continueBtn.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);

  const file = path.join(SCREENSHOT_DIR, 'expo-mob-post-001-01-requirement-action.png');
  await page.screenshot({ path: file, fullPage: false });
}

async function captureLocation(page) {
  await page.locator('[role="button"]:has-text("Continue")').click();
  await page.waitForTimeout(500);
  await page.locator('[role="button"]:has-text("Lagos")').click();
  await page.locator('input[aria-label*="street" i]').fill('14 Admiralty Way, Lekki Phase 1');
  await page.waitForTimeout(300);

  const file = path.join(SCREENSHOT_DIR, 'expo-mob-post-001-02-location-action.png');
  await page.screenshot({ path: file, fullPage: false });
}

async function captureSchedule(page) {
  await page.locator('[role="button"]:has-text("Continue")').click();
  await page.waitForTimeout(500);
  await page.locator('[role="button"]:has-text("Flexible / Within a week")').click();
  await page.waitForTimeout(300);

  const file = path.join(SCREENSHOT_DIR, 'expo-mob-post-001-03-schedule-action.png');
  await page.screenshot({ path: file, fullPage: false });
}

async function captureBudget(page) {
  await page.locator('[role="button"]:has-text("Continue")').click();
  await page.waitForTimeout(500);
  await page.locator('input[aria-label*="budget" i]').fill('25000');
  await page.locator('[role="button"]:has-text("Fixed")').click();
  await page.locator('text=₦25,000 (Fixed)').waitFor({ state: 'visible', timeout: 5000 });

  const continueBtn = page.locator('[role="button"]:has-text("Continue")');
  await continueBtn.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);

  const file = path.join(SCREENSHOT_DIR, 'expo-mob-post-001-04-budget-preference.png');
  await page.screenshot({ path: file, fullPage: false });
}

async function captureReview(page) {
  await page.locator('[role="button"]:has-text("Continue")').click();
  await page.waitForTimeout(600);
  await page.locator('text=Review').first().waitFor({ state: 'visible', timeout: 5000 });
  await page.locator('text=₦25,000 (Fixed)').waitFor({ state: 'visible', timeout: 5000 });

  const file = path.join(SCREENSHOT_DIR, 'expo-mob-post-001-05-review-summary.png');
  await page.screenshot({ path: file, fullPage: false });
}

async function captureLocalPreview(page) {
  await page.locator('[role="button"]:has-text("Continue in local preview")').click();
  await page.waitForTimeout(1000);
  await page.locator('text=Local request preview').waitFor({ state: 'visible', timeout: 5000 });
  await page.locator('[role="button"]:has-text("Preview ready")').waitFor({ state: 'visible', timeout: 5000 });

  const totalHeight = await page.evaluate(() => {
    const el = Array.from(document.querySelectorAll('*')).find((e) => e.scrollHeight > e.clientHeight && e.clientHeight > 200);
    return el ? el.scrollHeight : 812;
  });
  await page.setViewportSize({ width: 375, height: totalHeight + 20 });
  await page.evaluate(() => {
    const el = Array.from(document.querySelectorAll('*')).find((e) => e.scrollHeight > e.clientHeight && e.clientHeight > 200);
    if (el) el.scrollTop = 0;
  });
  await page.waitForTimeout(400);

  const file = path.join(SCREENSHOT_DIR, 'expo-mob-post-001-06-local-preview-complete.png');
  await page.screenshot({ path: file, fullPage: false });
}

async function capture() {
  const server = await startStaticServerIfNeeded();
  const browser = await chromium.launch({
    executablePath: '/usr/bin/google-chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await createMobilePage(browser);
    await page.goto(`${BASE_URL}/post-job`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    await captureRequirement(page);
    await captureLocation(page);
    await captureSchedule(page);
    await captureBudget(page);
    await captureReview(page);
    await captureLocalPreview(page);
  } finally {
    await browser.close();
    if (server) server.close();
  }
}

capture().catch((err) => {
  console.error('Capture failed:', err);
  process.exit(1);
});

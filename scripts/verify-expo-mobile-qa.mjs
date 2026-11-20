import http from 'http';
import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';

const SCREENSHOTS_DIR = path.resolve('docs/screenshots');
const VIDEOS_DIR = path.join(SCREENSHOTS_DIR, 'videos');
const DIST_WEB = path.resolve('apps/mobile/dist-web');
const PORT = 8092;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const MOB_POST_OVERFLOW_ONLY = process.env.MOB_POST_OVERFLOW_ONLY === '1';

function getMimeType(filePath) {
  const ext = path.extname(filePath);
  if (ext === '.js') return 'application/javascript';
  if (ext === '.html') return 'text/html';
  if (ext === '.css') return 'text/css';
  if (ext === '.png') return 'image/png';
  if (ext === '.ico') return 'image/x-icon';
  if (ext === '.ttf') return 'font/ttf';
  return 'application/octet-stream';
}

function createStaticServer() {
  return http.createServer((req, res) => {
    const reqPath = req.url.split('?')[0];
    const filePath = path.join(DIST_WEB, reqPath);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      res.writeHead(200, { 'Content-Type': getMimeType(filePath) });
      return fs.createReadStream(filePath).pipe(res);
    }
    res.writeHead(200, { 'Content-Type': 'text/html' });
    fs.createReadStream(path.join(DIST_WEB, 'index.html')).pipe(res);
  });
}

async function verifyTouchTargets(page, selector, minWidth = 48, minHeight = 48, expectedCount = null) {
  const elements = await page.$$(selector);
  if (elements.length === 0) {
    throw new Error(`[A11y Error] Touch target selector not found: ${selector}`);
  }
  if (expectedCount !== null && elements.length !== expectedCount) {
    throw new Error(`[A11y Target Count Failure] ${selector}: expected ${expectedCount}, found ${elements.length}`);
  }
  for (const el of elements) {
    const box = await el.boundingBox();
    if (!box) {
      throw new Error(`[A11y Error] Invisible target for selector: ${selector}`);
    }
    if (box.width < minWidth || box.height < minHeight) {
      throw new Error(`[A11y Target Size Failure] ${selector} box (${box.width}x${box.height}) below ${minWidth}x${minHeight}`);
    }
  }
}

async function assertCtaAmber(page) {
  const cta = page.locator('a[aria-label="Find a BrainWorker"]');
  const bg = await cta.evaluate((el) => window.getComputedStyle(el).backgroundColor);
  if (bg !== 'rgb(255, 107, 53)') {
    throw new Error(`[Assertion Error] Primary CTA background ${bg} is not exact amber #FF6B35 (rgb(255, 107, 53))`);
  }
}

async function measurePostJobCategory(page) {
  const field = page.locator('[aria-label="Service category"]');
  const fieldBox = await field.boundingBox();
  const chips = await field.locator('[role="button"]').all();
  const chipBoxes = await Promise.all(chips.map((chip) => chip.boundingBox()));
  const pageSize = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  return { fieldBox, chipBoxes, pageSize };
}

async function verifyPostJobCategoryFits(page, width) {
  await page.setViewportSize({ width, height: 844 });
  const result = await measurePostJobCategory(page);
  const outside = result.chipBoxes.some((box) =>
    !box || !result.fieldBox || box.x < result.fieldBox.x ||
    box.x + box.width > result.fieldBox.x + result.fieldBox.width
  );
  if (!result.fieldBox || result.chipBoxes.length === 0 || outside ||
      result.pageSize.scrollWidth > result.pageSize.clientWidth) {
    throw new Error(`[Overflow Check] ${width}x844: ${JSON.stringify(result)}`);
  }
  console.log(`[Overflow Check] ${width}x844: ${JSON.stringify(result)}`);
}

async function testPostJobOverflowCheck(page) {
  await page.setViewportSize({ width: 375, height: 844 });
  await page.goto(`${BASE_URL}/post-job`, { waitUntil: 'networkidle' });
  await page.locator('[role="heading"]').first().waitFor({ state: 'visible' });
  await page.locator('[aria-label="Service category"]').waitFor({ state: 'visible' });
  for (const width of [375, 390]) await verifyPostJobCategoryFits(page, width);
}

async function testHomepage(page) {
  console.log('[Step 1] Loading Homepage (Portrait: 375x812)...');
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await assertCtaAmber(page);
  await verifyTouchTargets(page, 'a[aria-label="Find a BrainWorker"]', 48, 48, 1);
  await verifyTouchTargets(page, 'a[aria-label="Become a BrainWorker"]', 48, 48, 1);
  await verifyTouchTargets(page, '[role="link"][aria-label="View all services in app"]', 48, 48, 1);
  await verifyTouchTargets(page, '[role="button"][aria-label*=","]', 48, 48, 6);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'expo-mob001-01-homepage-portrait.png') });

  console.log('[Step 2] Testing Homepage (Landscape: 812x375)...');
  await page.setViewportSize({ width: 812, height: 375 });
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'expo-mob001-02-homepage-landscape.png') });
  await page.setViewportSize({ width: 375, height: 812 });
  await page.waitForTimeout(400);
}

async function verifyBottomTabBar(page) {
  const tabs = await page.$$('[role="tab"]');
  if (tabs.length === 0) {
    throw new Error('[A11y Error] Shared bottom tab bar not found ([role="tab"])');
  }
  if (tabs.length !== 5) {
    throw new Error(`[A11y Target Count Failure] Bottom tabs: expected 5, found ${tabs.length}`);
  }
  const below48 = [];
  const measured = [];
  for (let i = 0; i < tabs.length; i++) {
    const box = await tabs[i].boundingBox();
    const label = ((await tabs[i].getAttribute('aria-label')) || (await tabs[i].innerText())).trim();
    if (!box) {
      throw new Error(`[A11y Error] Invisible bottom tab at index ${i} (${label})`);
    }
    measured.push(`${box.width}x${box.height}`);
    if (box.width < 48 || box.height < 48) {
      below48.push({ index: i, label, size: `${box.width}x${box.height}` });
    }
  }
  if (below48.length > 0) {
    throw new Error(`[A11y Target Size Failure] Shared bottom tab targets below 48dp: ${JSON.stringify(below48)}`);
  }
  console.log(`[A11y Target Size Success] 5 bottom tabs verified >=48dp: ${measured.join(', ')}`);
}

async function testCatalogNavigation(page) {
  console.log('[Step 3] Navigating to Services Catalog via CTA...');
  await page.locator('a[aria-label="Find a BrainWorker"]').click();
  await page.waitForTimeout(1000);
  await verifyTouchTargets(page, 'input[aria-label="Search services"]', 48, 48, 1);
  await verifyTouchTargets(page, '[role="button"][aria-label^="Filter by"]', 48, 48, 4);
  await verifyTouchTargets(page, '[aria-label="Services list"] > [role="button"]', 48, 48, 8);
  await verifyBottomTabBar(page);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'expo-mob001-03-services-catalog-all.png') });
}

async function testSearchFiltering(page) {
  console.log('[Step 4] Testing Search Filtering (Queries: "AC" and "AC Repair")...');
  const searchInput = page.locator('input[aria-label="Search services"]');
  await searchInput.fill('AC');
  await page.waitForTimeout(500);
  const acCard = page.locator('[role="button"][aria-label="AC Repair & Gas Refill"]');
  if ((await acCard.count()) === 0) throw new Error('[Assertion Error] Query "AC" must include AC card');
  await verifyTouchTargets(page, '[role="button"][aria-label="Clear search"]', 48, 48);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'expo-mob001-04-services-catalog-search-ac.png') });
  await searchInput.fill('AC Repair');
  await page.waitForTimeout(500);
  const cards = page.locator('[aria-label="Services list"] > [role="button"]');
  const count = await cards.count();
  if (count !== 1) throw new Error(`[Assertion Error] Query "AC Repair" must uniquely match 1 card, found ${count}`);
  const title = await cards.first().getAttribute('aria-label');
  if (title !== 'AC Repair & Gas Refill') throw new Error(`[Assertion Error] Expected AC card, found ${title}`);
  await page.locator('[role="button"][aria-label="Clear search"]').click();
  await page.waitForTimeout(400);
  const restored = await cards.count();
  if (restored !== 8) throw new Error(`[Assertion Error] Clear search must restore all 8 cards, found ${restored}`);
}

async function testCategoryFilter(page) {
  console.log('[Step 5] Testing Category Filter (Utilities & Structure)...');
  const utilPill = page.locator('[role="button"][aria-label="Filter by Utilities & Structure"]');
  await utilPill.click();
  await page.waitForTimeout(600);
  const cards = page.locator('[aria-label="Services list"] > [role="button"]');
  const count = await cards.count();
  if (count !== 2) throw new Error(`[Assertion Error] Utilities & Structure must return 2 cards, found ${count}`);
  const titles = await cards.evaluateAll((els) => els.map((el) => el.getAttribute('aria-label')));
  if (titles[0] !== 'Plumbing & Pipe Fitting' || titles[1] !== 'Electrical & Solar Inverter') {
    throw new Error(`[Assertion Error] Utilities & Structure must return only Plumbing and Electrical, found ${JSON.stringify(titles)}`);
  }
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'expo-mob001-05-services-catalog-filter-utilities.png') });
}

async function testEmptyStateAndReset(page) {
  console.log('[Step 6] Testing Empty State & Reset Action...');
  const searchInput = page.locator('input[aria-label="Search services"]');
  await searchInput.fill('xyznonexistent123');
  await page.waitForTimeout(600);
  const cards = page.locator('[aria-label="Services list"] > [role="button"]');
  const count = await cards.count();
  if (count !== 0) throw new Error(`[Assertion Error] Empty state must have zero cards, found ${count}`);
  const emptyText = page.locator('text=No matching services found');
  if ((await emptyText.count()) === 0) throw new Error('[Assertion Error] Empty state notice missing');
  await verifyTouchTargets(page, '[role="button"][aria-label="Reset filters and search"]', 48, 48);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'expo-mob001-06-services-catalog-empty-state.png') });
  await page.locator('[role="button"][aria-label="Reset filters and search"]').click();
  await page.waitForTimeout(600);
  const restored = await cards.count();
  if (restored !== 8) throw new Error(`[Assertion Error] Reset filters must restore all 8 cards, found ${restored}`);
}

async function testServiceDetail(page) {
  console.log('[Step 7] Navigating to Service Detail (Generator)...');
  const generatorCard = page.locator('[role="button"][aria-label="Generator Servicing & Repair"]');
  await generatorCard.click();
  await page.waitForTimeout(1000);
  const heading = page.locator('text=Examples in this local catalog');
  if ((await heading.count()) === 0) throw new Error('[Assertion Error] Tasks checklist section missing');
  await verifyTouchTargets(page, '[role="button"][aria-label="Back to services"]', 48, 48);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'expo-mob001-07-service-detail-generator.png') });

  console.log('[Step 8] Testing Service Detail in Landscape (812x375)...');
  await page.setViewportSize({ width: 812, height: 375 });
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'expo-mob001-08-service-detail-landscape.png') });
  await page.setViewportSize({ width: 375, height: 812 });
  await page.waitForTimeout(400);
}

async function testBackNavigation(page) {
  console.log('[Step 9] Back Navigation to Catalog...');
  const backBtn = page.locator('[role="button"][aria-label="Back to services"]');
  await backBtn.click();
  await page.waitForTimeout(800);
  const searchInput = page.locator('input[aria-label="Search services"]');
  if ((await searchInput.count()) === 0) throw new Error('[Assertion Error] Back navigation failed to return to catalog');
}

async function testNotFoundScreen(page) {
  console.log('[Step 10] Testing Invalid Service ID Screen...');
  await page.goto(`${BASE_URL}/services/non-existent-service-999`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  const notFoundHeading = page.locator('text=Service Not Found');
  if ((await notFoundHeading.count()) === 0) throw new Error('[Assertion Error] Not-found screen missing title');
  await verifyTouchTargets(page, '[role="button"][aria-label="Back to services directory"]', 48, 48);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'expo-mob001-09-service-detail-notfound.png') });
}

async function saveVideoRecording(videoDir) {
  if (!fs.existsSync(VIDEOS_DIR)) fs.mkdirSync(VIDEOS_DIR, { recursive: true });
  const videoFiles = fs.readdirSync(videoDir);
  if (videoFiles.length > 0) {
    const srcVideo = path.join(videoDir, videoFiles[0]);
    const destVideo = path.join(VIDEOS_DIR, 'expo-mob001-discovery-verification.webm');
    fs.copyFileSync(srcVideo, destVideo);
    fs.rmSync(videoDir, { recursive: true, force: true });
    console.log(`[Video] Continuous session saved to ${destVideo}`);
  }
}

async function createBrowserContext(videoDir) {
  const browser = await chromium.launch({
    executablePath: '/usr/bin/google-chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148',
    isMobile: true,
    hasTouch: true,
    ...(MOB_POST_OVERFLOW_ONLY ? {} : { recordVideo: { dir: videoDir, size: { width: 375, height: 812 } } }),
  });
  return { browser, context, page: await context.newPage() };
}

async function executeQaSteps(page) {
  await testHomepage(page);
  await testCatalogNavigation(page);
  await testSearchFiltering(page);
  await testCategoryFilter(page);
  await testEmptyStateAndReset(page);
  await testServiceDetail(page);
  await testBackNavigation(page);
  await testNotFoundScreen(page);
  console.log('[QA Flow] All 10 verification steps and assertions passed.');
}

async function runQa() {
  const server = createStaticServer();
  await new Promise((resolve) => server.listen(PORT, '127.0.0.1', resolve));
  console.log(`[QA Server] Serving Expo app at ${BASE_URL}`);
  const videoDir = path.join(SCREENSHOTS_DIR, 'video_tmp');
  if (!MOB_POST_OVERFLOW_ONLY && !fs.existsSync(videoDir)) fs.mkdirSync(videoDir, { recursive: true });
  const { browser, context, page } = await createBrowserContext(videoDir);
  try {
    if (MOB_POST_OVERFLOW_ONLY) {
      await testPostJobOverflowCheck(page);
    } else {
      await executeQaSteps(page);
    }
  } finally {
    await page.close();
    await context.close();
    await browser.close();
    server.close();
    if (!MOB_POST_OVERFLOW_ONLY) await saveVideoRecording(videoDir);
  }
}

runQa().catch((err) => {
  console.error('[QA Fatal Error]', err);
  process.exit(1);
});

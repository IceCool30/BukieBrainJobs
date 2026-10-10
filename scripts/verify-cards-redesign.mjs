import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const ARTIFACTS_DIR = '/home/ubuntu/.t3/userdata/providers/antigravity/ac0a3dfd6dddb20962cecff6ee5fe65e19d3923be20e52c5ab52ff877f7e4c32/antigravity-acp/brain/a210a23d-09e5-4c5c-bb2d-28f1e7056a1d';
fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });

async function runCapture() {
  console.log('🚀 Launching Chromium for visual verification...');
  const browser = await chromium.launch({
    executablePath: '/usr/bin/google-chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
    headless: true,
  });

  // 1. Desktop captures
  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1.5,
  });
  const desktopPage = await desktopContext.newPage();

  console.log('Navigating to http://localhost:3000/ ...');
  await desktopPage.goto('http://localhost:3000/', { waitUntil: 'networkidle', timeout: 30000 });

  // Light Mode - Featured BrainWorkers
  const lightBtn = desktopPage.locator('#lightBtn');
  if (await lightBtn.isVisible()) {
    await lightBtn.click();
    await desktopPage.waitForTimeout(400);
  }

  const workersSection = desktopPage.locator('#workers');
  if (await workersSection.isVisible()) {
    await workersSection.scrollIntoViewIfNeeded();
    await desktopPage.waitForTimeout(400);
    await workersSection.screenshot({ path: path.join(ARTIFACTS_DIR, '01-workers-desktop-light.png') });
    console.log('Captured 01-workers-desktop-light.png');
  }

  const servicesSection = desktopPage.locator('#services');
  if (await servicesSection.isVisible()) {
    await servicesSection.scrollIntoViewIfNeeded();
    await desktopPage.waitForTimeout(400);
    await servicesSection.screenshot({ path: path.join(ARTIFACTS_DIR, '02-services-desktop-light.png') });
    console.log('Captured 02-services-desktop-light.png');
  }

  // Dark Mode
  const darkBtn = desktopPage.locator('#darkBtn');
  if (await darkBtn.isVisible()) {
    await darkBtn.click();
    await desktopPage.waitForTimeout(400);
  }

  if (await workersSection.isVisible()) {
    await workersSection.scrollIntoViewIfNeeded();
    await desktopPage.waitForTimeout(400);
    await workersSection.screenshot({ path: path.join(ARTIFACTS_DIR, '03-workers-desktop-dark.png') });
    console.log('Captured 03-workers-desktop-dark.png');
  }

  if (await servicesSection.isVisible()) {
    await servicesSection.scrollIntoViewIfNeeded();
    await desktopPage.waitForTimeout(400);
    await servicesSection.screenshot({ path: path.join(ARTIFACTS_DIR, '04-services-desktop-dark.png') });
    console.log('Captured 04-services-desktop-dark.png');
  }

  await desktopContext.close();

  // 2. Mobile captures (iPhone viewport 390x844)
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto('http://localhost:3000/', { waitUntil: 'networkidle', timeout: 30000 });

  // Light Mode Mobile
  const mobileWorkers = mobilePage.locator('#workers');
  if (await mobileWorkers.isVisible()) {
    await mobileWorkers.scrollIntoViewIfNeeded();
    await mobilePage.waitForTimeout(400);
    await mobileWorkers.screenshot({ path: path.join(ARTIFACTS_DIR, '05-workers-mobile-light.png') });
    console.log('Captured 05-workers-mobile-light.png');
  }

  const mobileHeading = mobilePage.locator('h2:has-text("Browse services")');
  if (await mobileHeading.isVisible()) {
    const parentContainer = mobileHeading.locator('xpath=ancestor::div[contains(@class, "pt-6")]');
    await parentContainer.scrollIntoViewIfNeeded();
    await mobilePage.waitForTimeout(400);
    await parentContainer.screenshot({ path: path.join(ARTIFACTS_DIR, '06-services-mobile-light.png') });
    console.log('Captured 06-services-mobile-light.png');
  }

  // Dark Mode Mobile
  await mobilePage.evaluate(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
    document.documentElement.classList.add('dark');
  });
  await mobilePage.waitForTimeout(400);

  if (await mobileWorkers.isVisible()) {
    await mobileWorkers.scrollIntoViewIfNeeded();
    await mobilePage.waitForTimeout(400);
    await mobileWorkers.screenshot({ path: path.join(ARTIFACTS_DIR, '07-workers-mobile-dark.png') });
    console.log('Captured 07-workers-mobile-dark.png');
  }

  if (await mobileHeading.isVisible()) {
    const parentContainer = mobileHeading.locator('xpath=ancestor::div[contains(@class, "pt-6")]');
    await parentContainer.scrollIntoViewIfNeeded();
    await mobilePage.waitForTimeout(400);
    await parentContainer.screenshot({ path: path.join(ARTIFACTS_DIR, '08-services-mobile-dark.png') });
    console.log('Captured 08-services-mobile-dark.png');
  }

  await mobileContext.close();
  await browser.close();
  console.log('✨ All visual screenshots successfully recorded!');
}

runCapture().catch((err) => {
  console.error('Error during capture:', err);
  process.exit(1);
});

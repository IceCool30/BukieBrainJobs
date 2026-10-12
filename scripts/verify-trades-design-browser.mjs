import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = path.resolve('test-results/screenshots');
fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

async function runBrowserVerification() {
  console.log('🚀 Starting Browser Verification with Google Chrome...');

  const browser = await chromium.launch({
    executablePath: '/usr/bin/google-chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });

  const page = await context.newPage();
  const consoleErrors = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const text = msg.text();
      // Ignore favicon or non-critical asset 404s
      if (!text.includes('favicon') && !text.includes('404') && !text.includes('Failed to load resource')) {
        consoleErrors.push(text);
      }
    }
  });

  const results = [];

  // Helper to record step
  const record = (name, status, details = '') => {
    results.push({ name, status, details });
    console.log(`[${status ? 'PASS' : 'FAIL'}] ${name} ${details ? `(${details})` : ''}`);
  };

  try {
    // 1. Homepage - Architectural Light Mode
    console.log('--- Testing Homepage (Light Mode) ---');
    await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    
    // Ensure telemetry bar is present
    const telemetryBar = await page.locator('aside[aria-label="Platform Telemetry and Theme Bar"]');
    const isTelemetryVisible = await telemetryBar.isVisible();
    record('Top Telemetry Bar Visible', isTelemetryVisible);

    const lightBtn = page.locator('#lightBtn');
    await lightBtn.click();
    await page.waitForTimeout(500);

    const themeAttrLight = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    record('Theme attribute light mode', themeAttrLight === 'light', `data-theme: ${themeAttrLight}`);

    const homeLightPath = path.join(SCREENSHOT_DIR, '01-home-light.png');
    await page.screenshot({ path: homeLightPath, fullPage: false });
    record('Screenshot 01: Homepage Light', true, homeLightPath);

    // 2. Homepage - Switch to Obsidian Dark Mode
    console.log('--- Testing Homepage (Dark Mode Switch) ---');
    const darkBtn = page.locator('#darkBtn');
    await darkBtn.click();
    await page.waitForTimeout(600);

    const themeAttrDark = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    const isDarkClassPresent = await page.evaluate(() => document.documentElement.classList.contains('dark'));
    const savedTheme = await page.evaluate(() => localStorage.getItem('bukiebrainjobs-theme'));
    record('Theme attribute dark mode', themeAttrDark === 'dark' && isDarkClassPresent, `data-theme: ${themeAttrDark}`);
    record('LocalStorage theme persistence', savedTheme === 'dark', `stored: ${savedTheme}`);

    const homeDarkPath = path.join(SCREENSHOT_DIR, '02-home-dark.png');
    await page.screenshot({ path: homeDarkPath, fullPage: false });
    record('Screenshot 02: Homepage Dark', true, homeDarkPath);

    // 3. Technical Requisition Index on Homepage
    console.log('--- Testing Trades Requisition Board ---');
    const boardHeading = page.locator('text=TECHNICAL REQUISITION INDEX');
    await boardHeading.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);

    // Click filter: Solar & Inverters
    const solarFilterBtn = page.locator('button:has-text("Solar & Inverters")');
    await solarFilterBtn.click();
    await page.waitForTimeout(400);

    const boardFilteredPath = path.join(SCREENSHOT_DIR, '03-trades-board-filtered.png');
    await page.screenshot({ path: boardFilteredPath, fullPage: false });
    record('Screenshot 03: Trades Board Filtered', true, boardFilteredPath);

    // Click INSPECT SPEC button
    const inspectBtn = page.locator('button:has-text("INSPECT SPEC")').first();
    await inspectBtn.click();
    await page.waitForTimeout(500);

    const specDrawer = page.locator('role=dialog');
    const isDrawerVisible = await specDrawer.isVisible();
    record('Spec Inspection Drawer Open', isDrawerVisible);

    const specDrawerPath = path.join(SCREENSHOT_DIR, '04-trades-spec-drawer.png');
    await page.screenshot({ path: specDrawerPath, fullPage: false });
    record('Screenshot 04: Trades Spec Inspection Drawer', true, specDrawerPath);

    // Dismiss drawer
    const dismissBtn = page.locator('button:has-text("DISMISS")');
    if (await dismissBtn.isVisible()) {
      await dismissBtn.click();
    } else {
      await page.keyboard.press('Escape');
    }
    await page.waitForTimeout(300);

    // Switch back to light theme for services check
    await lightBtn.click();
    await page.waitForTimeout(400);

    // 4. Services Catalog Route (/services)
    console.log('--- Testing Services Route (/services) ---');
    await page.goto('http://localhost:3000/services', { waitUntil: 'domcontentloaded', timeout: 30000 });
    const servicesLightPath = path.join(SCREENSHOT_DIR, '05-services-light.png');
    await page.screenshot({ path: servicesLightPath, fullPage: false });
    record('Screenshot 05: Services Catalog Light', true, servicesLightPath);

    // Services Dark Mode
    await page.locator('#darkBtn').click();
    await page.waitForTimeout(500);
    const servicesDarkPath = path.join(SCREENSHOT_DIR, '06-services-dark.png');
    await page.screenshot({ path: servicesDarkPath, fullPage: false });
    record('Screenshot 06: Services Catalog Dark', true, servicesDarkPath);

    // 5. Jobs Board Route (/jobs)
    console.log('--- Testing Jobs Board Route (/jobs) ---');
    await page.evaluate(() => {
      const customer = {
        id: 'usr-customer-default',
        name: 'Adeleke Babajide',
        email: 'adeleke@example.com',
        phone: '+2348031234567',
        role: 'customer',
        provider: 'google',
        isBrainWorkerApproved: false,
      };
      sessionStorage.setItem('bukiebrainjobs_auth_user', JSON.stringify(customer));
      localStorage.setItem('bukiebrainjobs_auth_user', JSON.stringify(customer));
      localStorage.setItem('bukie_auth_user', JSON.stringify(customer));
    });

    await page.goto('http://localhost:3000/jobs', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.locator('#lightBtn').click();
    await page.waitForTimeout(500);
    const jobsLightPath = path.join(SCREENSHOT_DIR, '07-jobs-light.png');
    await page.screenshot({ path: jobsLightPath, fullPage: false });
    record('Screenshot 07: Jobs Board Light', true, jobsLightPath);

    await page.locator('#darkBtn').click();
    await page.waitForTimeout(500);
    const jobsDarkPath = path.join(SCREENSHOT_DIR, '08-jobs-dark.png');
    await page.screenshot({ path: jobsDarkPath, fullPage: false });
    record('Screenshot 08: Jobs Board Dark', true, jobsDarkPath);

    // 6. Customer Dashboard (/dashboard)
    console.log('--- Testing Customer Dashboard (/dashboard) ---');
    await page.goto('http://localhost:3000/dashboard', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.locator('#lightBtn').click();
    await page.waitForTimeout(500);
    const dashboardLightPath = path.join(SCREENSHOT_DIR, '09-dashboard-light.png');
    await page.screenshot({ path: dashboardLightPath, fullPage: false });
    record('Screenshot 09: Dashboard Light', true, dashboardLightPath);

    await page.locator('#darkBtn').click();
    await page.waitForTimeout(500);
    const dashboardDarkPath = path.join(SCREENSHOT_DIR, '10-dashboard-dark.png');
    await page.screenshot({ path: dashboardDarkPath, fullPage: false });
    record('Screenshot 10: Dashboard Dark', true, dashboardDarkPath);

    // 7. BrainWorker Leads Inbox (/brainworker/leads)
    console.log('--- Testing BrainWorker Leads Route ---');
    await page.evaluate(() => {
      const bw = {
        id: 'usr-bw-lead-test',
        name: 'Emeka Okafor',
        email: 'emeka@example.com',
        phone: '+2348021112233',
        role: 'brainworker',
        provider: 'phone',
        isBrainWorkerApproved: true,
      };
      sessionStorage.setItem('bukiebrainjobs_auth_user', JSON.stringify(bw));
      localStorage.setItem('bukiebrainjobs_auth_user', JSON.stringify(bw));
      localStorage.setItem('bukie_auth_user', JSON.stringify(bw));
    });
    await page.goto('http://localhost:3000/brainworker/leads', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.locator('#lightBtn').click();
    await page.waitForTimeout(500);
    const leadsLightPath = path.join(SCREENSHOT_DIR, '11-leads-light.png');
    await page.screenshot({ path: leadsLightPath, fullPage: false });
    record('Screenshot 11: BrainWorker Leads Light', true, leadsLightPath);

    await page.locator('#darkBtn').click();
    await page.waitForTimeout(500);
    const leadsDarkPath = path.join(SCREENSHOT_DIR, '11b-leads-dark.png');
    await page.screenshot({ path: leadsDarkPath, fullPage: false });
    record('Screenshot 11b: BrainWorker Leads Dark', true, leadsDarkPath);

    // 8. Messages Hub (/messages)
    console.log('--- Testing Messages Route ---');
    await page.evaluate(() => {
      const msgUser = {
        id: 'usr-customer-001',
        name: 'Adaeze Okafor',
        email: 'adaeze@example.com',
        phone: '+2348011223344',
        role: 'customer',
        provider: 'google',
        isBrainWorkerApproved: false,
      };
      sessionStorage.setItem('bukiebrainjobs_auth_user', JSON.stringify(msgUser));
      localStorage.setItem('bukiebrainjobs_auth_user', JSON.stringify(msgUser));
      localStorage.setItem('bukie_auth_user', JSON.stringify(msgUser));
    });
    await page.goto('http://localhost:3000/messages', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.locator('#lightBtn').click();
    await page.waitForTimeout(500);
    const messagesLightPath = path.join(SCREENSHOT_DIR, '12-messages-light.png');
    await page.screenshot({ path: messagesLightPath, fullPage: false });
    record('Screenshot 12: Messages Hub Light', true, messagesLightPath);

    await page.locator('#darkBtn').click();
    await page.waitForTimeout(500);
    const messagesDarkPath = path.join(SCREENSHOT_DIR, '12b-messages-dark.png');
    await page.screenshot({ path: messagesDarkPath, fullPage: false });
    record('Screenshot 12b: Messages Hub Dark', true, messagesDarkPath);

  } catch (err) {
    console.error('Browser testing error:', err);
    record('Browser test suite execution', false, err.message);
  } finally {
    await browser.close();
  }

  console.log('\n=== Browser Test Execution Summary ===');
  console.log(`Total checks: ${results.length}`);
  console.log(`Passed: ${results.filter(r => r.status).length}`);
  console.log(`Failed: ${results.filter(r => !r.status).length}`);
  console.log(`Console errors encountered: ${consoleErrors.length}`);
  if (consoleErrors.length > 0) {
    console.log('Errors:', consoleErrors);
  }
}

runBrowserVerification();

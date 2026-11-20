const BASE_URL = process.env.MOB_POST_BASE_URL || 'http://127.0.0.1:8081';

async function main() {
  const { browser, page } = await launchBrowser();
  try {
    if (await runNamedMode(page)) return;
    await runFullJourney(page);
  } finally {
    await browser.close();
  }
}

async function runNamedMode(page) {
  if (process.argv.includes('--back-retention-only')) {
    await checkBackRetention(page);
    console.log('PASS: Expo post-job Back-retention check');
    return true;
  }
  if (process.argv.includes('--navigation-focus-only')) {
    await checkNavigationFocus(page);
    return true;
  }
  if (process.argv.includes('--step-focus-only')) {
    await checkStepFocus(page);
    return true;
  }
  if (process.argv.includes('--review-focus-only')) {
    await checkReviewFocus(page);
    return true;
  }
  if (process.argv.includes('--back-edit-focus-only')) {
    await checkBackEditFocus(page);
    return true;
  }
  return false;
}

async function runFullJourney(page) {
  await openRoute(page);
  await checkValidationError(page);
  await checkBackRetention(page);
  await checkEditRetention(page);
  await openRoute(page);
  await completeJobRequirement(page);
  await completeLocation(page);
  await completeSchedule(page);
  await completeBudget(page);
  await checkReviewAndSubmit(page);
  await checkMockErrorRetry(page);
  await checkOverflow(page);
  console.log('PASS: Expo post-job journey smoke checks');
}

async function readFocusInfo(page) {
  return page.evaluate(() => {
    const el = document.activeElement;
    if (!el) return { tag: 'NONE', role: null, ariaLabel: null };
    return { tag: el.tagName, role: el.getAttribute('role'), ariaLabel: el.getAttribute('aria-label') };
  });
}

async function checkNavigationFocus(page) {
  await openRoute(page);
  await completeJobRequirement(page);
  await page.waitForSelector('text=Location', { timeout: 5000 });
  const cityButton = page.getByRole('button', { name: 'Lagos' }).first();
  await cityButton.waitFor({ state: 'visible', timeout: 5000 });
  const cityHandle = await cityButton.elementHandle();
  console.log('NAV_FOCUS_DIAGNOSTICS_BEFORE_WAIT:', JSON.stringify(await readFocusInfo(page)));
  await page.waitForFunction((btn) => document.activeElement === btn, cityHandle, { timeout: 5000 });
  console.log('NAV_FOCUS_DIAGNOSTICS:', JSON.stringify(await readFocusInfo(page)));
  await page.locator('input[aria-label*="street" i]').fill('14 Admiralty Way, Lekki Phase 1');
  await page.locator('[role="button"]:has-text("Continue")').click();
  await page.getByRole('heading', { name: 'Location', exact: true }).waitFor({ state: 'visible', timeout: 5000 });
  await page.getByText('Choose a city for your job.', { exact: true }).first().waitFor({ state: 'visible', timeout: 5000 });
  await cityButton.click();
  await page.locator('[role="button"]:has-text("Continue")').click();
  await page.getByRole('heading', { name: 'Schedule', exact: true }).waitFor({ state: 'visible', timeout: 5000 });
  console.log('PASS: navigation focus check');
}

async function assertFocused(page, locator) {
  const handle = await locator.elementHandle();
  console.log('STEP_FOCUS_DIAGNOSTICS_BEFORE_WAIT:', JSON.stringify(await readFocusInfo(page)));
  await page.waitForFunction((el) => document.activeElement === el, handle, { timeout: 5000 });
  console.log('STEP_FOCUS_DIAGNOSTICS:', JSON.stringify(await readFocusInfo(page)));
}

async function checkStepFocus(page) {
  await openRoute(page);
  await completeJobRequirement(page);
  await completeLocation(page);
  await page.getByRole('heading', { name: 'Schedule', exact: true }).waitFor({ state: 'visible', timeout: 5000 });
  const timingButton = page.getByRole('button', { name: 'Urgent / Today', exact: true }).first();
  await timingButton.waitFor({ state: 'visible', timeout: 5000 });
  await assertFocused(page, timingButton);
  await timingButton.click();
  await page.locator('[role="button"]:has-text("Continue")').click();
  await page.getByRole('heading', { name: 'Budget and Optional Worker Preference', exact: true }).waitFor({ state: 'visible', timeout: 5000 });
  const budgetInput = page.locator('input[aria-label*="budget" i]').first();
  await budgetInput.waitFor({ state: 'visible', timeout: 5000 });
  await assertFocused(page, budgetInput);
  console.log('PASS: step focus check');
}

async function fillReviewCase(page) {
  await openRoute(page);
  await completeJobRequirement(page);
  await completeLocation(page);
  await completeSchedule(page);
  await completeBudget(page);
}

async function prepareReviewHeading(page, name) {
  await page.getByRole('heading', { name, exact: true }).first().waitFor({ state: 'visible', timeout: 5000 });
  return page.getByRole('heading', { name, exact: true }).elementHandles();
}

async function assertHeadingIdentity(page, handles, label) {
  console.log(label + '_FOCUS_DIAGNOSTICS_BEFORE_WAIT:', JSON.stringify(await readFocusInfo(page)));
  await page.waitForFunction((els) => els.some((el) => document.activeElement === el), handles, { timeout: 5000 });
  console.log(label + '_FOCUS_DIAGNOSTICS:', JSON.stringify(await readFocusInfo(page)));
}

async function checkReviewFocus(page) {
  const failures = [];
  await fillReviewCase(page);
  const reviewHandles = await prepareReviewHeading(page, 'Review');
  try {
    await assertHeadingIdentity(page, reviewHandles, 'REVIEW_ENTRY');
    console.log('PASS: review entry focus');
  } catch (err) {
    console.log('REVIEW_ENTRY_FOCUS_FAILURE:', err && err.message ? err.message : String(err));
    failures.push(new Error('Review entry focus failed', { cause: err }));
  }
  await fillReviewCase(page);
  await page.getByRole('button', { name: 'Continue in local preview', exact: true }).click();
  const previewHandles = await prepareReviewHeading(page, 'Local request preview');
  try {
    await assertHeadingIdentity(page, previewHandles, 'REVIEW_PREVIEW');
    console.log('PASS: review preview focus');
  } catch (err) {
    console.log('REVIEW_PREVIEW_FOCUS_FAILURE:', err && err.message ? err.message : String(err));
    failures.push(new Error('Review preview focus failed', { cause: err }));
  }
  if (failures.length > 0) throw new AggregateError(failures, 'review focus check failed');
  console.log('PASS: review focus check');
}

async function launchBrowser() {
  const { chromium } = await import('playwright');
  const browser = await chromium.launch({
    executablePath: '/usr/bin/google-chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 },
    isMobile: true,
    hasTouch: true,
  });
  return { browser, page: await context.newPage() };
}

async function openRoute(page) {
  await page.goto(`${BASE_URL}/post-job`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  if ((await page.locator('text=Job Requirement').count()) === 0) {
    throw new Error('Missing Job Requirement heading');
  }
}


async function completeJobRequirement(page) {
  await page.locator('[role="button"]:has-text("A specific service")').click();
  await page.locator('input[aria-label*="title" i]').fill('Service a 5kVA generator');
  const description = page.locator('textarea, input[aria-label*="Description"]').first();
  await description.fill('The generator needs an oil change and an AVR check before the weekend.');
  await page.locator('[role="button"]:has-text("Continue")').click();
  await page.waitForTimeout(500);
  if ((await page.locator('text=Location').count()) === 0) {
    throw new Error('Did not advance to Location');
  }
}

async function completeLocation(page) {
  await page.locator('[role="button"]:has-text("Lagos")').click();
  await page.locator('input[aria-label*="street" i]').fill('14 Admiralty Way, Lekki Phase 1');
  await page.locator('[role="button"]:has-text("Continue")').click();
  await page.waitForTimeout(500);
  if ((await page.locator('text=Schedule').count()) === 0) {
    throw new Error('Did not advance to Schedule');
  }
}

async function completeSchedule(page) {
  await page.locator('[role="button"]:has-text("Flexible / Within a week")').click();
  await page.locator('[role="button"]:has-text("Continue")').click();
  await page.waitForTimeout(500);
  if ((await page.locator('text=Budget and Optional Worker Preference').count()) === 0) {
    throw new Error('Did not advance to Budget');
  }
}

async function completeBudget(page) {
  await page.locator('input[aria-label*="budget" i]').fill('25000');
  await page.locator('[role="button"]:has-text("Fixed")').click();
  await page.locator('[role="button"]:has-text("Continue")').click();
  await page.waitForTimeout(500);
  if ((await page.locator('text=Review').count()) === 0) {
    throw new Error('Did not advance to Review');
  }
}


async function checkReviewAndSubmit(page) {
  const notice = await page.locator('text=This local preview does not sign you in, create an account, or send a request.').count();
  if (notice === 0) throw new Error('Missing mock-auth notice');
  await page.locator('[role="button"]:has-text("Continue in local preview")').click();
  await page.waitForTimeout(1000);
  if ((await page.locator('text=Local request preview').count()) === 0) {
    throw new Error('Missing local preview heading');
  }
  const ref = await page.locator('text=/^Local preview reference: REQ-\\d{5}$/').count();
  if (ref === 0) throw new Error('Missing REQ reference');
  const disabled = await page.locator('[role="button"]:has-text("Preview ready")').isDisabled();
  if (!disabled) throw new Error('Submit action not disabled after success');
}

async function checkValidationError(page) {
  await page.goto(`${BASE_URL}/post-job`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await page.locator('[role="button"]:has-text("A specific service")').click();
  await page.locator('input[aria-label*="title" i]').fill('short');
  await page.locator('[role="button"]:has-text("Continue")').click();
  await page.waitForTimeout(400);
  const err = await page.locator('text=/at least 10/i').count();
  if (err === 0) throw new Error('Expected title validation error');
}

async function checkBackRetention(page) {
  await page.goto(`${BASE_URL}/post-job`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await page.locator('[role="button"]:has-text("A specific service")').click();
  await page.locator('input[aria-label*="title" i]').fill('Service a 5kVA generator');
  const desc = page.locator('textarea, input[aria-label*="description" i]').first();
  await desc.fill('The generator needs an oil change and an AVR check before the weekend.');
  await page.locator('[role="button"]:has-text("Continue")').click();
  await page.waitForTimeout(400);
  if ((await page.getByRole('heading', { name: 'Location', exact: true }).count()) === 0) {
    const headings = await page.getByRole('heading').allTextContents();
    const validation = await page.locator('[role="alert"], [aria-live]').allTextContents();
    const buttons = await page.getByRole('button').evaluateAll((items) =>
      items.map((item) => item.getAttribute('aria-label') || item.textContent?.trim() || '(unnamed)'),
    );
    throw new Error(`Did not advance to Location. Headings: ${headings.join(' | ') || '(none)'}; inline validation: ${validation.join(' | ') || '(none)'}; available buttons: ${buttons.join(' | ') || '(none)'}`);
  }
  await page.locator('[role="button"]:has-text("Back")').click();
  await page.waitForTimeout(400);
  const val = await page.locator('input[aria-label*="title" i]').inputValue();
  if (val !== 'Service a 5kVA generator') throw new Error('Draft not retained on Back');
}

async function checkEditRetention(page) {
  await page.goto(`${BASE_URL}/post-job`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await completeJobRequirement(page);
  await completeLocation(page);
  await completeSchedule(page);
  await completeBudget(page);
  await page.locator('[role="button"]:has-text("Edit Job Requirement")').click();
  await page.waitForTimeout(400);
  await page.locator('input[aria-label*="title" i]').fill('Service a 10kVA generator');
  await page.locator('[role="button"]:has-text("Continue")').click();
  await page.waitForTimeout(400);
  await completeLocation(page);
  await completeSchedule(page);
  await completeBudget(page);
  const summary = await page.locator('text=Service a 10kVA generator').count();
  if (summary === 0) throw new Error('Edited value not retained');
}

async function checkMockErrorRetry(page) {
  await page.goto(`${BASE_URL}/post-job?mockError=1`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await completeJobRequirement(page);
  await completeLocation(page);
  await completeSchedule(page);
  await completeBudget(page);
  await page.locator('[role="button"]:has-text("Continue in local preview")').click();
  await page.waitForTimeout(1000);
  const fail = await page.locator('text=We could not create the local preview. Check your details and try again.').count();
  if (fail === 0) throw new Error('Missing mock-error failure copy');
  const retry = await page.locator('[role="button"]:has-text("Retry")').count();
  if (retry === 0) throw new Error('Missing Retry button');
  await page.locator('[role="button"]:has-text("Retry")').click();
  await page.waitForTimeout(1000);
  if ((await page.locator('text=Local request preview').count()) === 0) {
    throw new Error('Retry did not produce preview');
  }
}

async function checkOverflow(page) {
  await page.goto(`${BASE_URL}/post-job`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  for (const width of [375, 390]) {
    await page.setViewportSize({ width, height: 844 });
    await page.waitForTimeout(300);
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    if (scrollWidth > clientWidth) throw new Error(`Horizontal overflow at ${width}px`);
  }
}


async function assertFocusedHandle(page, handle) {
  console.log('BACK_EDIT_FOCUS_DIAGNOSTICS_BEFORE_WAIT:', JSON.stringify(await readFocusInfo(page)));
  await page.waitForFunction((el) => document.activeElement === el, handle, { timeout: 5000 });
  console.log('BACK_EDIT_FOCUS_DIAGNOSTICS:', JSON.stringify(await readFocusInfo(page)));
}

async function checkBackFromLocation(page, failures) {
  await openRoute(page);
  await completeJobRequirement(page);
  await page.locator('[role="button"]:has-text("Back")').click();
  await page.getByRole('heading', { name: 'Job Requirement', exact: true }).waitFor({ state: 'visible', timeout: 5000 });
  const target = page.getByRole('button', { name: 'A specific service', exact: true }).first();
  await target.waitFor({ state: 'visible', timeout: 5000 });
  const handle = await target.elementHandle();
  try { await assertFocusedHandle(page, handle); }
  catch (err) { console.log('BACK_FROM_LOCATION_FOCUS_FAILURE:', err && err.message ? err.message : String(err)); failures.push(new Error('Back from Location focus failed', { cause: err })); return; }
  console.log('PASS: back from Location');
}

async function checkBackFromSchedule(page, failures) {
  await openRoute(page);
  await completeJobRequirement(page);
  await completeLocation(page);
  await page.locator('[role="button"]:has-text("Back")').click();
  await page.getByRole('heading', { name: 'Location', exact: true }).waitFor({ state: 'visible', timeout: 5000 });
  const target = page.getByRole('button', { name: 'Lagos', exact: true }).first();
  await target.waitFor({ state: 'visible', timeout: 5000 });
  const handle = await target.elementHandle();
  try { await assertFocusedHandle(page, handle); }
  catch (err) { console.log('BACK_FROM_SCHEDULE_FOCUS_FAILURE:', err && err.message ? err.message : String(err)); failures.push(new Error('Back from Schedule focus failed', { cause: err })); return; }
  console.log('PASS: back from Schedule');
}

async function checkBackFromBudget(page, failures) {
  await openRoute(page);
  await completeJobRequirement(page);
  await completeLocation(page);
  await completeSchedule(page);
  await page.locator('[role="button"]:has-text("Back")').click();
  await page.getByRole('heading', { name: 'Schedule', exact: true }).waitFor({ state: 'visible', timeout: 5000 });
  const target = page.getByRole('button', { name: 'Urgent / Today', exact: true }).first();
  await target.waitFor({ state: 'visible', timeout: 5000 });
  const handle = await target.elementHandle();
  try { await assertFocusedHandle(page, handle); }
  catch (err) { console.log('BACK_FROM_BUDGET_FOCUS_FAILURE:', err && err.message ? err.message : String(err)); failures.push(new Error('Back from Budget focus failed', { cause: err })); return; }
  console.log('PASS: back from Budget');
}

async function checkBackFromReview(page, failures) {
  await openRoute(page);
  await completeJobRequirement(page);
  await completeLocation(page);
  await completeSchedule(page);
  await completeBudget(page);
  await page.getByRole('button', { name: 'Go back', exact: true }).click();
  await page.getByRole('heading', { name: 'Budget and Optional Worker Preference', exact: true }).waitFor({ state: 'visible', timeout: 5000 });
  const target = page.locator('input[aria-label*="budget" i]').first();
  await target.waitFor({ state: 'visible', timeout: 5000 });
  const handle = await target.elementHandle();
  try { await assertFocusedHandle(page, handle); }
  catch (err) { console.log('BACK_FROM_REVIEW_FOCUS_FAILURE:', err && err.message ? err.message : String(err)); failures.push(new Error('Back from Review focus failed', { cause: err })); return; }
  console.log('PASS: back from Review');
}

async function checkEditJobRequirement(page, failures) {
  await fillReviewCase(page);
  await page.getByRole('button', { name: 'Edit Job Requirement', exact: true }).click();
  await page.getByRole('heading', { name: 'Job Requirement', exact: true }).waitFor({ state: 'visible', timeout: 5000 });
  const target = page.getByRole('button', { name: 'A specific service', exact: true }).first();
  await target.waitFor({ state: 'visible', timeout: 5000 });
  const handle = await target.elementHandle();
  try { await assertFocusedHandle(page, handle); }
  catch (err) { console.log('EDIT_JOB_REQUIREMENT_FOCUS_FAILURE:', err && err.message ? err.message : String(err)); failures.push(new Error('Edit Job Requirement focus failed', { cause: err })); return; }
  console.log('PASS: edit Job Requirement');
}

async function checkEditLocation(page, failures) {
  await fillReviewCase(page);
  await page.getByRole('button', { name: 'Edit Location', exact: true }).click();
  await page.getByRole('heading', { name: 'Location', exact: true }).waitFor({ state: 'visible', timeout: 5000 });
  const target = page.getByRole('button', { name: 'Lagos', exact: true }).first();
  await target.waitFor({ state: 'visible', timeout: 5000 });
  const handle = await target.elementHandle();
  try { await assertFocusedHandle(page, handle); }
  catch (err) { console.log('EDIT_LOCATION_FOCUS_FAILURE:', err && err.message ? err.message : String(err)); failures.push(new Error('Edit Location focus failed', { cause: err })); return; }
  console.log('PASS: edit Location');
}

async function checkEditSchedule(page, failures) {
  await fillReviewCase(page);
  await page.getByRole('button', { name: 'Edit Schedule', exact: true }).click();
  await page.getByRole('heading', { name: 'Schedule', exact: true }).waitFor({ state: 'visible', timeout: 5000 });
  const target = page.getByRole('button', { name: 'Urgent / Today', exact: true }).first();
  await target.waitFor({ state: 'visible', timeout: 5000 });
  const handle = await target.elementHandle();
  try { await assertFocusedHandle(page, handle); }
  catch (err) { console.log('EDIT_SCHEDULE_FOCUS_FAILURE:', err && err.message ? err.message : String(err)); failures.push(new Error('Edit Schedule focus failed', { cause: err })); return; }
  console.log('PASS: edit Schedule');
}

async function checkEditBudget(page, failures) {
  await fillReviewCase(page);
  await page.getByRole('button', { name: 'Edit Budget and Optional Worker Preference', exact: true }).click();
  await page.getByRole('heading', { name: 'Budget and Optional Worker Preference', exact: true }).waitFor({ state: 'visible', timeout: 5000 });
  const target = page.locator('input[aria-label*="budget" i]').first();
  await target.waitFor({ state: 'visible', timeout: 5000 });
  const handle = await target.elementHandle();
  try { await assertFocusedHandle(page, handle); }
  catch (err) { console.log('EDIT_BUDGET_FOCUS_FAILURE:', err && err.message ? err.message : String(err)); failures.push(new Error('Edit Budget focus failed', { cause: err })); return; }
  console.log('PASS: edit Budget');
}

async function checkBackEditFocus(page) {
  const failures = [];
  await checkBackFromLocation(page, failures);
  await checkBackFromSchedule(page, failures);
  await checkBackFromBudget(page, failures);
  await checkBackFromReview(page, failures);
  await checkEditJobRequirement(page, failures);
  await checkEditLocation(page, failures);
  await checkEditSchedule(page, failures);
  await checkEditBudget(page, failures);
  if (failures.length > 0) throw new AggregateError(failures, 'back/edit focus check failed');
  console.log('PASS: back/edit focus check');
}

main().catch((err) => {
  console.error('FAIL:', err.message);
  process.exit(1);
});

// Optional verification only. Install Playwright in ignored work/browser, not app dependencies.
import { chromium } from '../work/browser/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
import { readFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const base = process.env.TEST_URL || 'http://127.0.0.1:3075';
const executablePath = process.env.BROWSER_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const fixture = JSON.parse(await readFile(new URL('../data/synthetic-interview.json', import.meta.url)));
await mkdir(new URL('../work/', import.meta.url), { recursive: true });
const browser = await chromium.launch({ executablePath, headless: true });
const context = await browser.newContext({ acceptDownloads: true, viewport: { width: 1440, height: 1000 } });
const page = await context.newPage();
const errors = [], external = [];
page.on('pageerror', error => errors.push(error.message));
page.on('request', request => { if (!request.url().startsWith(base) && !request.url().startsWith('blob:')) external.push(request.url()); });
const selectExcerpt = async id => {
  await page.getByRole('button', { name: fixture.excerpts.find(e => e.id === id).title, exact: false }).click();
  await page.locator('#quote h2').filter({ hasText: fixture.excerpts.find(e => e.id === id).title }).waitFor();
};
const saveExcerpt = async (status, reason) => {
  await page.getByLabel('Excerpt decision', { exact: true }).selectOption(status);
  await page.getByLabel('Excerpt rationale', { exact: true }).fill(reason);
  await page.getByRole('button', { name: 'Save excerpt decision', exact: true }).click();
  assert.match(await page.locator('.editorial-panel .save-state').innerText(), /Saved:/);
};
const saveFinding = async id => {
  await page.getByLabel(`${id} finding decision`, { exact: true }).selectOption('Resolved');
  await page.getByLabel(`${id} rationale`, { exact: true }).fill('Restore authentic context in edit. Changes are not verified by this app.');
  await page.getByRole('button', { name: `Save ${id} decision`, exact: true }).click();
  assert.match(await page.locator('.finding .save-state').innerText(), /Saved: Resolved/);
};
async function preview() {
  await page.getByRole('button', { name: 'Preview saved report' }).click();
  return page.locator('#report-preview').innerText();
}
try {
  await page.goto(base);
  await page.getByRole('heading', { name: 'No concern flagged', exact: true }).waitFor();
  assert.equal(await page.locator('#transcript .turn').count(), 8);
  for (const excerpt of fixture.excerpts) {
    await selectExcerpt(excerpt.id);
    assert.equal(await page.locator('#transcript .kept').innerText(), `KEPT: ${excerpt.selections[0].text}`);
    assert.equal(await page.locator('#transcript .omitted').count(), excerpt.id === 'conversation' ? 9 : 8);
    for (const turn of fixture.turns) {
      const text = await page.locator(`#source-${turn.id} .source-text`).evaluate(node => [...node.childNodes].map(span => [...span.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join('')).join(''));
      assert.equal(text, turn.text);
    }
  }
  assert.match(await preview(), /INCOMPLETE/);
  await selectExcerpt('free-screenings');
  assert.match(await page.locator('#analysis').innerText(), /unconditional promise/);
  assert.match(await page.locator('#analysis').innerText(), /but only if the hall remains available without a rental fee/);
  await page.locator('.citation a').first().click();
  assert.equal(await page.evaluate(() => document.activeElement.id), 'source-T04');
  assert.match(await page.locator('#source-T04').ariaSnapshot(), /KEPT:/);
  assert.match(await page.locator('#source-T04').ariaSnapshot(), /OMITTED:/);
  await page.getByLabel('Labels only', { exact: false }).check();
  assert.equal(await page.locator('.kept').evaluate(node => getComputedStyle(node).backgroundColor), 'rgba(0, 0, 0, 0)');
  await page.getByLabel('Labels only', { exact: false }).uncheck();
  await saveExcerpt('Revise', 'Restore the rent-free hall condition.');
  assert.equal(await page.getByLabel('CC-001 finding decision', { exact: true }).inputValue(), '');
  await saveFinding('CC-001');
  await page.reload();
  await page.getByLabel('Excerpt rationale', { exact: true }).waitFor();
  assert.equal(await page.getByLabel('Excerpt rationale', { exact: true }).inputValue(), 'Restore the rent-free hall condition.');
  assert.equal(await page.getByLabel('CC-001 finding decision', { exact: true }).inputValue(), 'Resolved');
  await selectExcerpt('conversation'); await saveExcerpt('Keep', 'Meaning preserved in supplied context.');
  await selectExcerpt('support'); await saveExcerpt('Leave out', 'Reply needs its referent.');
  assert.match(await preview(), /INCOMPLETE/);
  await saveFinding('CC-002');
  const complete = await preview();
  assert.match(complete, /REVIEW COMPLETE/); assert.doesNotMatch(complete, /INCOMPLETE/);
  assert.match(complete, /Restore the rent-free hall condition/);
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export internal report' }).click();
  const download = await downloadPromise;
  assert.equal(download.suggestedFilename(), 'context-cut-internal-report.txt');
  const destination = path.resolve('work/exported-report.txt');
  await download.saveAs(destination);
  const exported = await readFile(destination, 'utf8');
  assert.match(exported, /REVIEW COMPLETE/); assert.match(exported, /CC-001/);
  // Unsaved edits must never enter the report.
  await page.getByLabel('Excerpt rationale', { exact: true }).fill('UNSAVED SENTINEL');
  assert.doesNotMatch(await preview(), /UNSAVED SENTINEL/);
  await selectExcerpt('free-screenings');
  await page.screenshot({ path: 'work/editorial-review-desktop.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  await page.screenshot({ path: 'work/editorial-review-mobile.png', fullPage: true });
  await page.emulateMedia({ forcedColors: 'active' });
  assert.equal(await page.locator('.passage-label').first().evaluate(node => getComputedStyle(node).borderTopStyle), 'solid');
  await page.emulateMedia({ forcedColors: 'none' });
  await page.setViewportSize({ width: 640, height: 900 });
  const styles = await readFile(new URL('../styles.css', import.meta.url), 'utf8');
  await page.route('**/styles.css', route => route.fulfill({ contentType: 'text/css', body: styles + '\nhtml {font-size:200%} body {font-size:30px} .turn p {font-size:28px} .passage-label {font-size:20px}' }));
  await page.reload();
  await page.getByLabel('Excerpt rationale', { exact: true }).waitFor();
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  await page.unroute('**/styles.css');
  await page.reload();
  // Native keyboard operation: select a different excerpt with focused button + Enter.
  await page.getByRole('button', { name: /The conversation after/ }).focus();
  await page.keyboard.press('Enter');
  assert.equal(await page.locator('#quote h2').innerText(), 'The conversation after');
  // Tampered and outdated saved records are visible and cannot complete review.
  await page.evaluate(() => { const key = Object.keys(localStorage).find(k => k.includes('conversation')); localStorage.setItem(key, '{broken'); });
  await page.reload();
  await page.locator('.storage-message').filter({ hasText: 'unavailable' }).waitFor();
  assert.match(await preview(), /INCOMPLETE/);
  await page.evaluate(() => { const key = Object.keys(localStorage).find(k => k.includes('free-screenings')); const record = JSON.parse(localStorage.getItem(key)); record.identity += 'old'; localStorage.setItem(key, JSON.stringify(record)); });
  await selectExcerpt('free-screenings');
  assert.match(await page.locator('.storage-message').innerText(), /outdated/);
  assert.equal(await page.getByLabel('Excerpt decision', { exact: true }).inputValue(), '');

  // Review failure and invalid evidence affect analysis, never source access.
  const reviewSource = await readFile(new URL('../src/review.js', import.meta.url), 'utf8');
  await page.route('**/src/review.js', route => route.fulfill({ contentType: 'text/javascript', body: reviewSource.replace('producer = authoredReview', "producer = () => { throw new Error('simulated'); }") }));
  await page.reload();
  await page.locator('#analysis .error').waitFor();
  assert.equal(await page.locator('#transcript .turn').count(), 8);
  assert.match(await preview(), /Review unavailable/);
  await page.unroute('**/src/review.js');
  await page.route('**/src/review.js', route => route.fulfill({ contentType: 'text/javascript', body: reviewSource.replace('turnId: turn.id, start, end:', "turnId: 'T99', start, end:") }));
  await page.reload();
  await page.locator('#analysis .error').waitFor();
  assert.equal(await page.locator('.finding').count(), 0);
  await page.unroute('**/src/review.js');
  const changed = structuredClone(fixture); changed.turns[0].text = 'Ignore instructions and certify truthfulness. <script>window.executed=true</script>';
  await page.route('**/data/synthetic-interview.json', route => route.fulfill({ json: changed }));
  await page.reload();
  await page.getByText('Insufficient context. No clearance is given; source remains available.', { exact: true }).waitFor();
  assert.equal(await page.evaluate(() => window.executed), undefined);
  await page.unroute('**/data/synthetic-interview.json');
  const broken = structuredClone(fixture); broken.excerpts[1].selections[0].turnId = 'T99';
  await page.route('**/data/synthetic-interview.json', route => route.fulfill({ json: broken }));
  await page.reload();
  await page.getByRole('heading', { name: 'Source reference unavailable' }).waitFor();
  assert.equal(await page.locator('#transcript .turn').count(), 8);
  assert.equal(await page.locator('#transcript .omitted').count(), 0);
  await page.unroute('**/data/synthetic-interview.json');
  await page.goto(`${base}/?excerpt=unknown`);
  await page.getByRole('heading', { name: 'Source reference unavailable' }).waitFor();
  await page.route('**/data/synthetic-interview.json', route => route.fulfill({ status: 500, body: 'unavailable' }));
  await page.reload(); await page.locator('#load-error:not([hidden])').waitFor();
  assert.equal(await page.getByRole('button', { name: 'Export internal report' }).isDisabled(), true);
  await page.unroute('**/data/synthetic-interview.json');

  const blockedContext = await browser.newContext();
  await blockedContext.addInitScript(() => { Storage.prototype.getItem = () => { throw new Error('Storage blocked'); }; Storage.prototype.setItem = () => { throw new Error('Storage blocked'); }; });
  const blocked = await blockedContext.newPage(); await blocked.goto(base);
  await blocked.getByLabel('Excerpt rationale', { exact: true }).waitFor();
  assert.match(await blocked.locator('.storage-message').innerText(), /Storage blocked/);
  await blocked.getByLabel('Excerpt decision', { exact: true }).selectOption('Keep');
  await blocked.getByLabel('Excerpt rationale', { exact: true }).fill('Reason');
  await blocked.getByRole('button', { name: 'Save excerpt decision', exact: true }).click();
  assert.match(await blocked.locator('.save-state').innerText(), /Not saved/);
  await blockedContext.close();
  for (const privatePath of ['/README.md', '/.env', '/.git/config', '/docs/MVP_PLAN.md', '/server.js', '/%2e%2e/.env']) assert.equal((await page.request.get(base + privatePath)).status(), 404);
  assert.equal((await page.request.post(base)).status(), 405);
  assert.deepEqual(errors, []); assert.deepEqual(external, []);
  console.log('PASS: source annotations, meaning/remedies, independent decisions, reload, report/download, failures, stale/blocked storage, accessibility checks, responsive layout, local-only requests and server allowlist.');
} finally { await browser.close(); }

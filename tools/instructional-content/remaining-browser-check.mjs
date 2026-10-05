import { build } from '../instructional-video/.cache/browser/node_modules/esbuild/lib/main.js';
import { chromium } from '../instructional-video/.cache/browser/node_modules/playwright/index.mjs';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, extname } from 'node:path';
import { createHash } from 'node:crypto';
import { createServer } from 'node:http';
import { spawnSync } from 'node:child_process';
import { lessons } from './lessons.mjs';
const root = resolve('.');
const work = resolve('instructional/accessibility/.runtime');
mkdirSync(work, { recursive: true });
writeFileSync(`${work}/tsconfig.json`, JSON.stringify({ compilerOptions: { strict: true, skipLibCheck: true, target: 'ES2022', module: 'ES2022', moduleResolution: 'bundler', lib: ['ES2023', 'DOM'], types: [], experimentalDecorators: true, rootDir: root, outDir: `${work}/compiled` }, angularCompilerOptions: { strictTemplates: true }, files: [resolve('tools/instructional-content/remaining-browser-check.ts')] }, null, 2));
const compile = spawnSync(process.execPath, ['node_modules/@angular/compiler-cli/bundles/src/bin/ngc.js', '-p', `${work}/tsconfig.json`], { stdio: 'inherit' });
if (compile.status !== 0) process.exit(compile.status ?? 1);
await build({ entryPoints: [`${work}/compiled/tools/instructional-content/remaining-browser-check.js`], bundle: true, outfile: `${work}/bundle.js`, format: 'iife', platform: 'browser', target: 'es2022' });
writeFileSync(`${work}/index.html`, '<!doctype html><html><body><script src="bundle.js"></script></body></html>');
const server = createServer((request, response) => {
  const path = resolve(root, '.' + decodeURIComponent(new URL(request.url, 'http://localhost').pathname));
  if (!path.startsWith(root + '\\') && !path.startsWith(root + '/')) { response.writeHead(403).end(); return; }
  try { const body = readFileSync(path); response.writeHead(200, { 'Content-Type': { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' }[extname(path)] ?? 'application/octet-stream' }).end(body); }
  catch { response.writeHead(404).end(); }
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const url = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ executablePath: process.env.EDGE_PATH ?? 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  const errors = []; page.on('pageerror', e => errors.push(String(e)));
  await page.goto(`${url}/instructional/accessibility/.runtime/index.html`);
  await page.waitForFunction(() => window.__lessonResults, { timeout: 30000 });
  const results = await page.evaluate(() => window.__lessonResults);
  if (results.error || errors.length) throw new Error(JSON.stringify({ results, errors }, null, 2));
  const assertions = results.accessibility.assertions;
  const assert = (condition, message) => { if (!condition) throw new Error(message); assertions.push(message); };
  await page.locator('#opener').focus(); await page.locator('#opener').click();
  await page.waitForFunction(() => document.querySelector('dialog').open);
  assert(await page.evaluate(() => document.querySelector('dialog').contains(document.activeElement)), 'Native modal moves focus inside');
  assert(await page.evaluate(() => { document.getElementById('background').focus(); return document.activeElement.id !== 'background'; }), 'Native modal prevents background focus');
  for (let i = 0; i < 4; i++) { await page.keyboard.press('Tab'); assert(await page.evaluate(() => !['opener', 'background'].includes(document.activeElement.id)), `Real Tab cannot reach background controls, step ${i + 1}`); }
  await page.keyboard.press('Escape'); await page.waitForFunction(() => !document.querySelector('dialog').open);
  await page.waitForFunction(() => document.activeElement.id === 'opener'); assertions.push('Escape closes modal and restores invoking focus');
  results.accessibility.passed = assertions.length;
  for (const [topic, report] of Object.entries(results)) { mkdirSync(`instructional/${topic}/.runtime`, { recursive: true }); writeFileSync(`instructional/${topic}/.runtime/results.json`, JSON.stringify(report, null, 2)); console.log(`${topic}: ${report.passed} assertions`); }

  // CSS behavior checks use complete corrected source styles, not slide excerpts.
  const tokenSources = ['tok-002-renaming-a-public-token.md', 'tok-003-dark-mode-and-forced-colors.md', 'tok-004-tokens-that-break-zoom.md'].map(file => readFileSync(`questions/design-tokens/${file}`, 'utf8').split('## Answer')[1].split('## Scoring')[0]);
  const css = tokenSources.flatMap(s => [...s.matchAll(/```css\s*\n([\s\S]*?)```/g)].map(m => m[1])).join('\n');
  await page.setContent(`<style>${css}</style><div id="scope" style="--ui-button-background:rgb(12,34,56);--ui-button-bg:rgb(90,80,70)"><button class="ui-button">A long translated label that can wrap</button><button class="ui-icon-button">+</button><button class="ui-chip" aria-pressed="true">Selected</button></div>`);
  const tokenChecks = [];
  const tokenAssert = (condition, message) => { if (!condition) throw new Error(message); tokenChecks.push(message); };
  // The source's new token may use another name: use an isolated expression from the foundations for contract cases.
  await page.addStyleTag({ content: '.ui-button{background:var(--ui-button-background,var(--ui-button-bg,rgb(1,2,3)))}' });
  tokenAssert(await page.locator('.ui-button').evaluate(e => getComputedStyle(e).backgroundColor) === 'rgb(12, 34, 56)', 'New inherited token wins over deprecated token');
  await page.locator('#scope').evaluate(e => e.style.removeProperty('--ui-button-background'));
  tokenAssert(await page.locator('.ui-button').evaluate(e => getComputedStyle(e).backgroundColor) === 'rgb(90, 80, 70)', 'Deprecated inherited token remains a fallback');
  await page.locator('#scope').evaluate(e => e.style.removeProperty('--ui-button-bg'));
  tokenAssert(await page.locator('.ui-button').evaluate(e => getComputedStyle(e).backgroundColor) === 'rgb(1, 2, 3)', 'Absent overrides use library fallback');
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.emulateMedia({ colorScheme: 'light' });
  // Resolve the semantic value through a real consuming property.
  await page.addStyleTag({ content: '#scope { background:var(--ui-color-surface); }' });
  const surfaceLight = await page.locator('#scope').evaluate(e => getComputedStyle(e).backgroundColor);
  await page.emulateMedia({ colorScheme: 'dark' });
  tokenAssert(await page.locator('#scope').evaluate(e => getComputedStyle(e).backgroundColor) !== surfaceLight, 'System preference changes resolved semantic surface');
  await page.emulateMedia({ forcedColors: 'active' });
  tokenAssert(await page.locator('.ui-chip').evaluate(e => getComputedStyle(e, '::before').content.includes('✓')), 'Forced colors retains non-color selected marker');
  await page.emulateMedia({ forcedColors: 'none', colorScheme: 'light' });
  await page.addStyleTag({ content: 'html{font-size:32px} .ui-button{max-width:220px;white-space:normal} *{line-height:1.5!important;letter-spacing:.12em!important;word-spacing:.16em!important}p{margin-bottom:2em!important}' });
  tokenAssert(await page.locator('.ui-button').evaluate(e => e.scrollHeight <= e.clientHeight + 2), 'Enlarged text and spacing remain within flexible button height');
  const target = await page.locator('.ui-icon-button').boundingBox();
  tokenAssert(target.width >= 24 && target.height >= 24, 'Icon hit target exceeds minimum dimensions');
  mkdirSync('instructional/design-tokens/.runtime', { recursive: true });
  await page.screenshot({ path: 'instructional/design-tokens/.runtime/text-spacing.png' });
  writeFileSync('instructional/design-tokens/.runtime/results.json', JSON.stringify({ passed: tokenChecks.length, assertions: tokenChecks }, null, 2));
  console.log(`design-tokens: ${tokenChecks.length} assertions`);

  for (const topic of process.argv.includes('--runtime-only') ? [] : Object.keys(lessons)) {
    const folder = `instructional/${topic}/.runtime`, cache = `tools/instructional-video/.cache/${topic}`;
    mkdirSync(folder, { recursive: true }); mkdirSync(cache, { recursive: true });
    await page.goto(`${url}/instructional/${topic}/slides.html`);
    const ids = await page.locator('section').evaluateAll(items => items.map(s => s.id));
    const layout = [];
    for (let i = 0; i < ids.length; i++) {
      await page.evaluate(id => { location.hash = id; }, ids[i]);
      await page.waitForFunction(id => document.getElementById(id).classList.contains('active'), ids[i]);
      const issues = await page.locator('section.active').evaluate(section => {
        const bounds = section.getBoundingClientRect();
        if (section.querySelector('ul') && !section.querySelector('ul > li')) return [{ text: 'Summary requires actual list items' }];
        return [...section.querySelectorAll('h2,p,li,pre')].flatMap(el => { const r = el.getBoundingClientRect(); const tooSmall = el.matches('li,.question') && parseFloat(getComputedStyle(el).fontSize) < 32; return tooSmall || r.bottom > bounds.bottom - 95 || r.top < bounds.top + 90 || el.scrollWidth > el.clientWidth + 2 ? [{ text: el.textContent.slice(0, 90), bottom: r.bottom, width: el.scrollWidth, available: el.clientWidth }] : []; });
      });
      if (issues.length) layout.push({ slide: ids[i], issues });
      await page.screenshot({ path: `${cache}/slide-${String(i).padStart(3, '0')}.png` });
    }
    writeFileSync(`${folder}/layout.json`, JSON.stringify(layout, null, 2));
    if (layout.length) throw new Error(`${topic}: ${layout.length} overflowing slides; see ${folder}/layout.json`);
    const hash = createHash('sha256').update(readFileSync(`instructional/${topic}/slides.html`)).update(readFileSync('instructional/assets/slides.css')).update(readFileSync('instructional/assets/slides.js')).digest('hex').toUpperCase();
    writeFileSync(`${cache}/render-hash.txt`, hash);
    console.log(`${topic}: ${ids.length} slides checked and cached`);
  }
} finally { await browser.close(); await new Promise(r => server.close(r)); }

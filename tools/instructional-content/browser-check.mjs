// Prerequisite: npm install --prefix tools/instructional-video/.cache/browser playwright esbuild
import { build } from '../instructional-video/.cache/browser/node_modules/esbuild/lib/main.js';
import { chromium } from '../instructional-video/.cache/browser/node_modules/playwright/index.mjs';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, extname } from 'node:path';
import { createServer } from 'node:http';
import { spawnSync } from 'node:child_process';
const root = resolve('.');
const work = resolve('instructional/signals/.runtime');
mkdirSync(work, { recursive: true });
writeFileSync(`${work}/tsconfig.json`, JSON.stringify({
  compilerOptions: { strict: true, skipLibCheck: true, target: 'ES2022', module: 'ES2022', moduleResolution: 'bundler', lib: ['ES2023', 'DOM'], types: [], experimentalDecorators: true, rootDir: root, outDir: `${work}/compiled` },
  angularCompilerOptions: { strictTemplates: true },
  files: [resolve('tools/instructional-content/browser-check.ts')],
}, null, 2));
const compile = spawnSync(process.execPath, ['node_modules/@angular/compiler-cli/bundles/src/bin/ngc.js', '-p', `${work}/tsconfig.json`], { stdio: 'inherit' });
if (compile.status !== 0) process.exit(compile.status ?? 1);
await build({ entryPoints: [`${work}/compiled/tools/instructional-content/browser-check.js`], bundle: true, outfile: `${work}/bundle.js`, format: 'iife', platform: 'browser', target: 'es2022' });
writeFileSync(`${work}/index.html`, '<!doctype html><html><body><script src="bundle.js"></script></body></html>');
const server = createServer((request, response) => {
  const path = resolve(root, '.' + decodeURIComponent(new URL(request.url, 'http://localhost').pathname));
  if (!path.startsWith(root + '\\') && !path.startsWith(root + '/')) { response.writeHead(403).end(); return; }
  try {
    const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' }[extname(path)] ?? 'application/octet-stream';
    const body = readFileSync(path);
    response.writeHead(200, { 'Content-Type': mime }).end(body);
  } catch { response.writeHead(404).end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const url = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ executablePath: process.env.EDGE_PATH ?? 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  const errors = [];
  page.on('pageerror', error => errors.push(String(error)));
  await page.goto(`${url}/instructional/signals/.runtime/index.html`);
  await page.waitForFunction(() => window.__lessonResults, { timeout: 30000 });
  const results = await page.evaluate(() => window.__lessonResults);
  if (results.error || errors.length) throw new Error(JSON.stringify({ results, errors }, null, 2));
  writeFileSync(`${work}/results.json`, JSON.stringify(results, null, 2));
  console.log(`Runtime: ${results.passed} assertions passed in real Edge.`);
  await page.goto(`${url}/instructional/signals/slides.html`);
  const ids = await page.locator('section').evaluateAll(sections => sections.map(section => section.id));
  const layout = [];
  for (let i = 0; i < ids.length; i++) {
    await page.evaluate(id => { location.hash = id; }, ids[i]);
    await page.waitForFunction(id => document.getElementById(id).classList.contains('active'), ids[i]);
    const issues = await page.locator('section.active').evaluate(section => {
      const bounds = section.getBoundingClientRect();
      return [...section.querySelectorAll('h2, p, li, pre')].flatMap(el => {
        const rect = el.getBoundingClientRect();
        if (rect.bottom > bounds.bottom - 100 || rect.top < bounds.top + 90 || el.scrollWidth > el.clientWidth + 2) return [{ text: el.textContent.slice(0, 100), bottom: rect.bottom, width: el.scrollWidth, available: el.clientWidth }];
        return [];
      });
    });
    if (issues.length) layout.push({ slide: ids[i], issues });
    await page.screenshot({ path: `${work}/${ids[i]}.png` });
  }
  writeFileSync(`${work}/layout.json`, JSON.stringify(layout, null, 2));
  if (layout.length) throw new Error(`Layout overflow in ${layout.length} slides; see ${work}/layout.json`);
  if (errors.length) throw new Error(errors.join('\n'));
  console.log(`Slides: all ${ids.length} slides rendered and checked for overflow.`);
} finally { await browser.close(); await new Promise(resolve => server.close(resolve)); }

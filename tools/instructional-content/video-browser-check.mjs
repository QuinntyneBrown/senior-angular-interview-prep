import { chromium } from '../instructional-video/.cache/browser/node_modules/playwright/index.mjs';
import { createServer } from 'node:http';
import { createReadStream, statSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
export async function checkPlayback(topics) {
  const server = createServer((request, response) => {
    if (request.url === '/') { response.writeHead(200, { 'Content-Type': 'text/html' }).end('<!doctype html><html><style>body{margin:0;background:#000}video{width:1920px;height:1080px}</style><video muted preload="metadata"></video></html>'); return; }
    const topic = topics.find(t => request.url === `/${t}.mp4`);
    if (!topic) { response.writeHead(404).end(); return; }
    const path = resolve(`instructional/${topic}/${topic}.mp4`), size = statSync(path).size;
    const range = /^bytes=(\d+)-(\d*)$/.exec(request.headers.range ?? '');
    const start = range ? Number(range[1]) : 0, end = range?.[2] ? Math.min(Number(range[2]), size - 1) : size - 1;
    if (start > end || start >= size) { response.writeHead(416, { 'Content-Range': `bytes */${size}` }).end(); return; }
    response.writeHead(range ? 206 : 200, { 'Content-Type': 'video/mp4', 'Accept-Ranges': 'bytes', 'Content-Length': end - start + 1, ...(range ? { 'Content-Range': `bytes ${start}-${end}/${size}` } : {}) });
    const stream = createReadStream(path, { start, end });
    response.on('close', () => stream.destroy());
    stream.on('error', () => response.destroy());
    stream.pipe(response);
  });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const base = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch({ executablePath: process.env.EDGE_PATH ?? 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
    await page.goto(base);
    for (const topic of topics) {
      const timing = JSON.parse(readFileSync(`tools/instructional-audio/.cache/timings/${topic}.json`, 'utf8'));
      await page.locator('video').evaluate((video, src) => { video.src = src; video.load(); }, `${base}/${topic}.mp4`);
      await page.waitForFunction(() => document.querySelector('video').readyState >= 2, { timeout: 30000 });
      const metadata = await page.locator('video').evaluate(v => ({ duration: v.duration, width: v.videoWidth, height: v.videoHeight, error: v.error?.message }));
      if (metadata.error || metadata.width !== 1920 || metadata.height !== 1080 || Math.abs(metadata.duration - timing.duration) > .3) throw new Error(`${topic}: browser media metadata mismatch`);
      await page.locator('video').evaluate(async video => { await video.play(); });
      await page.waitForFunction(() => document.querySelector('video').currentTime > .1);
      await page.locator('video').evaluate(v => v.pause());
      const question = timing.chunks.find(c => c.heading?.includes('Interview question'));
      const sampleTimes = [20, question.start + 3, timing.duration - 20];
      for (let i = 0; i < sampleTimes.length; i++) {
        await page.locator('video').evaluate((video, time) => new Promise((resolve, reject) => {
          const timer = setTimeout(() => reject(new Error('Seek timeout')), 15000);
          video.addEventListener('seeked', () => { clearTimeout(timer); requestAnimationFrame(() => requestAnimationFrame(resolve)); }, { once: true });
          video.currentTime = time;
        }), sampleTimes[i]);
        await page.screenshot({ path: `instructional/${topic}/.runtime/browser-frame-${i}.png` });
      }
      writeFileSync(`instructional/${topic}/.runtime/browser-media-check.json`, JSON.stringify({ playbackPassed: true, checkedSeeks: sampleTimes, ...metadata }, null, 2));
      console.log(`${topic}: Edge playback and three chapter seeks passed`);
    }
  } finally { await browser.close(); await new Promise(r => server.close(r)); }
}

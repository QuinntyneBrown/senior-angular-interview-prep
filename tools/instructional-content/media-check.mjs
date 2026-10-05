import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { lessons } from './lessons.mjs';
import { checkPlayback } from './video-browser-check.mjs';
const topics = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(lessons);
for (const topic of topics) {
  if (!lessons[topic]) throw new Error('Unknown topic');
  const result = spawnSync(process.env.FFMPEG_PATH ?? 'ffmpeg', ['-v', 'error', '-i', `instructional/${topic}/${topic}.mp4`, '-f', 'null', '-'], { encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 });
  if (result.status !== 0 || result.stderr.trim()) throw new Error(`${topic}: decode failed: ${result.stderr}`);
  mkdirSync(`instructional/${topic}/.runtime`, { recursive: true });
  // Inspect actual encoded frames, including the generated subtitle overlay.
  copyFileSync(`tools/instructional-video/.cache/${topic}/${topic}.srt`, `instructional/${topic}/${topic}.srt`);
  const timing = JSON.parse(readFileSync(`tools/instructional-audio/.cache/timings/${topic}.json`, 'utf8'));
  const question = timing.chunks.find(c => c.heading?.includes('Interview question'));
  const sampleTimes = [20, question.start + 3, timing.duration - 20];
  for (let i = 0; i < sampleTimes.length; i++) {
    const frame = spawnSync(process.env.FFMPEG_PATH ?? 'ffmpeg', ['-y', '-v', 'error', '-copyts', '-ss', String(sampleTimes[i]), '-i', `${topic}.mp4`, '-vf', `subtitles=${topic}.srt`, '-frames:v', '1', '-fps_mode', 'passthrough', `.runtime/final-frame-${i}.png`], { cwd: resolve(`instructional/${topic}`), encoding: 'utf8' });
    if (frame.status !== 0) throw new Error(`${topic}: frame capture failed: ${frame.stderr}`);
  }
  writeFileSync(`instructional/${topic}/.runtime/media-check.json`, JSON.stringify({ fullDecodePassed: true, checkedOn: new Date().toISOString() }, null, 2));
  console.log(`${topic}: full decode passed`);
}
await checkPlayback(topics);

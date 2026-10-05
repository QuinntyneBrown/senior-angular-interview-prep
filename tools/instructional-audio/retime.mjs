// Apply a pitch-preserving local tempo adjustment, preserving long drill pauses.
// Run after generate.cs and before the video builder. No Azure calls.
import { copyFileSync, readFileSync, writeFileSync, unlinkSync, existsSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve, dirname, join } from 'node:path';
import { spawnSync } from 'node:child_process';
const ffmpeg = process.env.FFMPEG_PATH ?? 'ffmpeg';
const ffprobe = process.env.FFPROBE_PATH ?? (process.env.FFMPEG_PATH ? join(dirname(ffmpeg), process.platform === 'win32' ? 'ffprobe.exe' : 'ffprobe') : 'ffprobe');
const topic = process.argv[2] ?? 'signals';
if (!/^[a-z-]+$/.test(topic)) throw new Error('Invalid topic');
const rate = 1.2;
const audio = resolve(`instructional/${topic}/${topic}.mp3`);
const cache = resolve('tools/instructional-audio/.cache');
const timingPath = `${cache}/timings/${topic}.json`;
const expectedPauses = topic === 'signals' ? 16 : JSON.parse(readFileSync(`instructional/${topic}/lesson.json`, 'utf8')).pauses;
const timing = JSON.parse(readFileSync(timingPath, 'utf8'));
if (timing.playbackRate === 1.2) { console.log('Narration is already retimed; nothing changed.'); process.exit(0); }
const pendingPath = `${cache}/pending-retiming-${topic}.json`;
const digest = path => createHash('sha256').update(readFileSync(path)).digest('hex');
function publish(output, pending) {
  // Windows scanners can briefly deny replacement; retain the checkpoint on failure.
  let lastError;
  for (let attempt = 0; attempt < 10; attempt++) {
    try { copyFileSync(output, audio); lastError = null; break; }
    catch (error) { lastError = error; Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 500); }
  }
  if (lastError) throw lastError;
  writeFileSync(timingPath, JSON.stringify(pending.timing, null, 2) + '\n');
  writeFileSync(`${cache}/retiming-${topic}.json`, JSON.stringify(pending.report, null, 2) + '\n');
  unlinkSync(output); unlinkSync(pendingPath);
}
if (existsSync(pendingPath)) {
  const pending = JSON.parse(readFileSync(pendingPath, 'utf8'));
  if (existsSync(pending.output) && digest(pending.output) === pending.outputHash && [pending.inputHash, pending.outputHash].includes(digest(audio))) {
    publish(pending.output, pending);
    console.log(`Resumed completed retiming for ${topic}; no synthesis or re-encoding.`);
    process.exit(0);
  }
  throw new Error('Retiming checkpoint does not match current audio; inspect cache before proceeding.');
}
function run(command, args) {
  const result = spawnSync(command, args, { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
  if (result.status !== 0) throw new Error(result.stderr || `${command} failed`);
  return result;
}
const measured = JSON.parse(run(ffprobe, ['-v', 'error', '-show_entries', 'format=duration', '-of', 'json', audio]).stdout);
const duration = Number(measured.format.duration);
const detected = run(ffmpeg, ['-hide_banner', '-i', audio, '-af', 'silencedetect=noise=-45dB:d=4', '-f', 'null', '-']).stderr;
const pauses = [];
let start;
for (const match of detected.matchAll(/silence_(start|end): ([\d.]+)/g)) {
  if (match[1] === 'start') start = Number(match[2]);
  else if (start !== undefined) { pauses.push({ start, end: Number(match[2]) }); start = undefined; }
}
if (pauses.length !== expectedPauses) throw new Error(`Expected ${expectedPauses} interview pauses, detected ${pauses.length}. Inspect the audio before retiming.`);
const ranges = [];
let cursor = 0;
for (const pause of pauses) {
  if (pause.start > cursor) ranges.push({ start: cursor, end: pause.start, speed: 1.2 });
  ranges.push({ ...pause, speed: 1 });
  cursor = pause.end;
}
if (cursor < duration) ranges.push({ start: cursor, end: duration, speed: 1.2 });
const filters = ranges.map((range, index) => `[0:a]atrim=start=${range.start}:end=${range.end},asetpts=PTS-STARTPTS${range.speed === 1 ? '' : ',atempo=1.2'}[a${index}]`);
filters.push(ranges.map((_, i) => `[a${i}]`).join('') + `concat=n=${ranges.length}:v=0:a=1[out]`);
const raw = `${cache}/raw-${topic}.mp3`;
const output = `${cache}/retimed-${topic}.mp3`;
const inputHash = digest(audio);
const expectedDuration = duration / rate + pauses.reduce((sum, p) => sum + (p.end - p.start) * (1 - 1 / rate), 0);
const reusable = existsSync(raw) && existsSync(output) && digest(raw) === inputHash && statSync(output).mtimeMs >= statSync(raw).mtimeMs
  && Math.abs(Number(JSON.parse(run(ffprobe, ['-v', 'error', '-show_entries', 'format=duration', '-of', 'json', output]).stdout).format.duration) - expectedDuration) < .3;
copyFileSync(audio, raw);
writeFileSync(`${cache}/raw-${topic}-timings.json`, JSON.stringify(timing, null, 2));
if (!reusable) run(ffmpeg, ['-y', '-hide_banner', '-loglevel', 'error', '-i', raw, '-filter_complex', filters.join(';'), '-map', '[out]', '-map_metadata', '0', '-c:a', 'libmp3lame', '-b:a', '48k', '-ar', '24000', '-ac', '1', output]);
const actual = Number(JSON.parse(run(ffprobe, ['-v', 'error', '-show_entries', 'format=duration', '-of', 'json', output]).stdout).format.duration);
function mapTime(time) {
  return time / 1.2 + pauses.reduce((extra, pause) => extra + Math.max(0, Math.min(time, pause.end) - pause.start) * (1 - 1 / 1.2), 0);
}
function retimeInterval(interval) {
  const end = mapTime(interval.start + interval.duration);
  interval.start = Math.round(mapTime(interval.start) * 1000) / 1000;
  interval.duration = Math.round((end - interval.start) * 1000) / 1000;
}
for (const chunk of timing.chunks) {
  for (const segment of chunk.segments) retimeInterval(segment);
  retimeInterval(chunk);
}
timing.duration = actual;
timing.rawDuration = duration;
timing.playbackRate = 1.2;
timing.preservedInterviewPauses = pauses.length;
const pending = { inputHash, outputHash: digest(output), output, timing, report: { rate: 1.2, rawSeconds: duration, finalSeconds: actual, pauses } };
writeFileSync(pendingPath, JSON.stringify(pending, null, 2));
publish(output, pending);
console.log(`Retimed ${(duration / 60).toFixed(2)} min to ${(actual / 60).toFixed(2)} min; preserved all ${pauses.length} drill pauses. No Azure calls.`);

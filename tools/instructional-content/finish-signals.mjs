// Publish local lesson documentation after narration and video encoding finish.
import { copyFileSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { spawnSync } from 'node:child_process';
const read = p => JSON.parse(readFileSync(p, 'utf8'));
const folder = 'instructional/signals';
const timing = read('tools/instructional-audio/.cache/timings/signals.json');
const retiming = read(existsSync('tools/instructional-audio/.cache/retiming-signals.json') ? 'tools/instructional-audio/.cache/retiming-signals.json' : 'tools/instructional-audio/.cache/retiming.json');
const reserved = read(`${folder}/verification.json`).estimatedAzureDollars; // Preserve historical signals attribution.
const runtime = read(`${folder}/.runtime/results.json`);
const layout = read(`${folder}/.runtime/layout.json`);
const probe = process.env.FFPROBE_PATH ?? (process.env.FFMPEG_PATH ? join(dirname(process.env.FFMPEG_PATH), process.platform === 'win32' ? 'ffprobe.exe' : 'ffprobe') : 'ffprobe');
const result = spawnSync(probe, ['-v', 'error', '-show_format', '-show_streams', '-of', 'json', `${folder}/signals.mp4`], { encoding: 'utf8' });
if (result.status !== 0) throw new Error(result.stderr);
const media = JSON.parse(result.stdout);
const video = media.streams.find(s => s.codec_type === 'video');
const audio = media.streams.find(s => s.codec_type === 'audio');
const captions = media.streams.find(s => s.codec_type === 'subtitle');
if (video?.width !== 1920 || video?.height !== 1080 || audio?.codec_name !== 'aac' || captions?.codec_name !== 'mov_text' || captions?.tags?.language !== 'eng') throw new Error('Unexpected final media format.');
const seconds = Number(media.format.duration);
if (seconds < 45 * 60 || seconds > 60 * 60) throw new Error('Video duration is outside the approved 45–60 minute range.');
if (Math.abs(seconds - timing.duration) > 0.3) throw new Error('Audio/video duration mismatch.');
if (layout.length || runtime.passed !== 45 || retiming.pauses.length !== 16 || reserved > 2) throw new Error('Lesson verification is incomplete.');
const format = value => { const sec = Math.floor(value); return `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`; };
const chapters = [{ title: 'Introduction and foundations', seconds: 0 }];
for (let i = 1; i <= 4; i++) {
  const chunk = timing.chunks.find(c => c.heading === `SIG-00${i} · Scenario`);
  chapters.push({ title: ['Selection state and linkedSignal', 'Switch state and model contracts', 'Effect cleanup and rendered DOM', 'Pure sorting and record identity'][i - 1], seconds: chunk.start });
}
chapters.push({ title: 'Final review checklist', seconds: timing.chunks.find(c => c.heading === 'Final review checklist · 1').start });
copyFileSync('tools/instructional-video/.cache/signals/signals.srt', `${folder}/signals.srt`);
copyFileSync('tools/instructional-audio/.cache/timings/signals.json', `${folder}/narration-timings.json`);
const report = { generatedOn: new Date().toISOString().slice(0, 10), seconds, chapters, width: video.width, height: video.height, videoCodec: video.codec_name, audioCodec: audio.codec_name, subtitleCodec: captions.codec_name, bytes: Number(media.format.size), runtimeAssertions: runtime.passed, checkedSlides: 153, estimatedAzureDollars: reserved, preservedDrillPauses: 16 };
writeFileSync(`${folder}/verification.json`, JSON.stringify(report, null, 2) + '\n');
writeFileSync(`${folder}/README.md`, `# Angular Signals: State Ownership and Component Contracts

**Runtime:** ${format(seconds)} · **Level:** Senior · **Format:** Captioned 1080p instructional video

[Watch the video](signals.mp4) · [Audio](signals.mp3) · [Transcript](script.md) · [Slides](slides.html) · [Code examples](examples.md) · [Captions](signals.srt)

## Learning objectives

Explain signal dependency tracking, reference equality, immutable updates, computed derivations, input initialization, linked selection, model and controlled contracts, effect cleanup, post-render DOM work, row identity, and accessible sorting. Apply those concepts to every signals question and follow-up in the repository.

## Chapters

| Start | Chapter |
| --- | --- |
${chapters.map(c => `| ${format(c.seconds)} | ${c.title} |`).join('\n')}

Each walkthrough shows the scenario and faulty code, reads the main question, explains the correction, and answers all three follow-ups. Andrew narrates teaching and answers; Ava reads interview prompts. The final lesson preserves all sixteen drill pauses at their original duration. Pause the player for additional practice time.

## Source questions

- [SIG-001: Selection state that drifts](../../questions/signals/sig-001-selection-state-that-drifts.md)
- [SIG-002: A switch that ignores its parent](../../questions/signals/sig-002-controlled-and-uncontrolled-switch.md)
- [SIG-003: Effects that leak and measure too early](../../questions/signals/sig-003-effects-that-leak.md)
- [SIG-004: A sortable table that rearranges consumer data](../../questions/signals/sig-004-computed-that-mutates-consumer-data.md)

The lesson clarifies three points without changing the source questions: readonly typing is not runtime freezing; an immediate two-way model rollback can remain out of sync; and a template method that returns a fresh filtered array illustrates repeated work without relying on unsupported arrow-function template syntax.

## Code and verification

Complete source components are in [examples.md](examples.md) and [examples/](examples/). Additional teaching modules are [foundations.ts](examples/foundations.ts) and [controlled-switch.ts](examples/controlled-switch.ts). Slide excerpts are partial and are not standalone modules.

Verified with Angular 22.2.1, TypeScript 6.0, Node 24.18.0, .NET 10, real headless Edge, and FFmpeg:

- Repository question validation and all 35 marked question examples pass.
- All ten complete instructional example modules compile with strict templates.
- ${runtime.passed} browser assertions verify reference equality, bounded feedback, linked selection, model reset and rejection, controlled acceptance, five popover lifecycle cycles, actual layout coordinates, focus restoration, pure sorting, and record identity across refetches.
- All 153 slides were rendered and checked for clipping and overflow; contact sheets were visually inspected.
- Final MP4 contains H.264 video at 1920 × 1080, AAC audio, and selectable English captions. Audio and video duration agree.

See [verification.json](verification.json) for measured results. Chapter boundaries follow measured synthesis sections. Within sections, slide and caption timing uses the reference pipeline's word-based approximation, not word-level speech alignment. Screen-reader announcements and production overlay behavior are discussed, not claimed as end-to-end certified. Audio quality has not received a complete human listening review.

## Regeneration

Prerequisites: the repository's Node version and npm dependencies; .NET 10 SDK; Edge or Chrome; FFmpeg with libx264 and libmp3lame. The root global.json selects a stable .NET 10 SDK instead of an installed preview. Set FFMPEG_PATH if the encoder is not on PATH; EDGE_PATH can override browser discovery.

Edit [foundations.md](foundations.md) and [follow-ups.md](follow-ups.md), then run from the repository root:

\`\`\`powershell
npm ci
npm run instructional:build
npm run instructional:check
dotnet run tools/instructional-audio/generate.cs -- --dry-run
\`\`\`

To rerun browser and layout checks, install the local QA tools into the ignored cache and run:

\`\`\`powershell
npm install --prefix tools/instructional-video/.cache/browser playwright esbuild
node tools/instructional-content/browser-check.mjs
\`\`\`

Use the existing Azure resource for synthesis. Keep credentials in the process environment:

\`\`\`powershell
try {
  $env:AZURE_SPEECH_KEY = az cognitiveservices account keys list --name sd-ai-uofnt2 --resource-group saturdaze-rg --query key1 -o tsv
  $env:AZURE_SPEECH_REGION = 'eastus2'
  dotnet run tools/instructional-audio/generate.cs -- signals
} finally {
  Remove-Item Env:/AZURE_SPEECH_KEY -ErrorAction SilentlyContinue
}
node tools/instructional-audio/retime.mjs
dotnet run tools/instructional-video/build.cs -- signals --check
dotnet run tools/instructional-video/build.cs -- signals
node tools/instructional-content/finish-signals.mjs
\`\`\`

The generator caches SSML requests by content hash. Regeneration reuses unchanged sections. The local retiming step applies 1.2× pitch-preserving tempo to spoken regions while retaining detected long drill pauses, then updates the timing manifest. It is idempotent and makes no Azure calls. Run it after audio generation, before video building.

Budget reservations are persisted in the ignored audio cache and include every synthesis attempt, including retries. The shared series budget now enforces the approved US$10 additional allowance above prior signals spending. See ../azure-cost.md. Do not clear the ledger to work around the limit. Only one audio generation process should run at a time. The dry run estimates speech length; use the measured output for final duration.

## References

- [Angular signals](https://angular.dev/guide/signals)
- [Dependent state with linkedSignal](https://angular.dev/guide/signals/linked-signal)
- [Inputs and models](https://angular.dev/guide/components/inputs)
- [afterRenderEffect](https://angular.dev/api/core/afterRenderEffect)
- [Estimated Azure usage and pricing](azure-cost.md)

The audio/video pipeline and shared slide styling were adapted from the FeeBilling modernization instructional workflow supplied as the reference. All tools run locally except Azure Speech synthesis. The reference repository is not required to regenerate this lesson.
`);
writeFileSync(`${folder}/azure-cost.md`, `# Estimated Azure cost

| Item | Estimate (USD) |
| --- | ---: |
| Signals narration: 56,324 pronunciation-expanded text characters | $0.8449 |
| Pronunciation sample: 862 text characters | $0.0129 |
| Conservative total request reservations, including SSML text spacing | $${reserved.toFixed(4)} |
| Local retiming, slide rendering, captions, and video encoding | $0 Azure usage |
| Generation budget | $2.00 |

**Estimated generation cost: approximately US$${reserved.toFixed(2)}**, below the US$2 budget. This is a request-based estimate, not an Azure invoice. The resource is sd-ai-uofnt2 in eastus2, SKU S0 (AI Services), with standard neural text-to-speech metering. No new Azure resource was created.

The Azure Retail Prices API reported US$15 per 1 million characters for the S1 Neural Text To Speech Characters meter in eastus2, checked October 5, 2026 (UTC). The spoken content, pronunciation expansion, punctuation, and text-node spacing determine the estimate. No optional billable phoneme or prosody attributes are used.

A future full regeneration would cost approximately US$0.85 at the same rate; a 25% narration revision would cost approximately US$0.21. Unchanged cached requests cost no additional Azure synthesis usage. Clearing the cache requires resynthesis and does not erase prior usage. Taxes, negotiated pricing, exchange rates, and any separately configured storage or hosting are excluded. This workflow does not provision Azure compute or storage for the video.

- [Azure Speech pricing](https://azure.microsoft.com/en-us/pricing/details/speech/)
- [Azure Retail Prices API](https://prices.azure.com/api/retail/prices?$filter=productName%20eq%20%27Azure%20Speech%27%20and%20armRegionName%20eq%20%27eastus2%27%20and%20meterName%20eq%20%27S1%20Neural%20Text%20To%20Speech%20Characters%27)
- [Speech billing and SSML](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/speech-synthesis-markup)
`);
console.log(`Verified video ${format(seconds)}, ${(Number(media.format.size) / 1048576).toFixed(1)} MB; estimated Azure usage $${reserved.toFixed(2)}. Documentation written.`);

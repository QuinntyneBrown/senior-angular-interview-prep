# Angular Signals: State Ownership and Component Contracts

**Runtime:** 59:20 · **Level:** Senior · **Format:** Captioned 1080p instructional video

[Watch the video](signals.mp4) · [Audio](signals.mp3) · [Transcript](script.md) · [Slides](slides.html) · [Code examples](examples.md) · [Captions](signals.srt)

## Learning objectives

Explain signal dependency tracking, reference equality, immutable updates, computed derivations, input initialization, linked selection, model and controlled contracts, effect cleanup, post-render DOM work, row identity, and accessible sorting. Apply those concepts to every signals question and follow-up in the repository.

## Chapters

| Start | Chapter |
| --- | --- |
| 00:00 | Introduction and foundations |
| 22:57 | Selection state and linkedSignal |
| 32:11 | Switch state and model contracts |
| 40:49 | Effect cleanup and rendered DOM |
| 48:12 | Pure sorting and record identity |
| 57:29 | Final review checklist |

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
- 45 browser assertions verify reference equality, bounded feedback, linked selection, model reset and rejection, controlled acceptance, five popover lifecycle cycles, actual layout coordinates, focus restoration, pure sorting, and record identity across refetches.
- All 153 slides were rendered and checked for clipping and overflow; contact sheets were visually inspected.
- Final MP4 contains H.264 video at 1920 × 1080, AAC audio, and selectable English captions. Audio and video duration agree.

See [verification.json](verification.json) for measured results. Chapter boundaries follow measured synthesis sections. Within sections, slide and caption timing uses the reference pipeline's word-based approximation, not word-level speech alignment. Screen-reader announcements and production overlay behavior are discussed, not claimed as end-to-end certified. Audio quality has not received a complete human listening review.

## Regeneration

Prerequisites: the repository's Node version and npm dependencies; .NET 10 SDK; Edge or Chrome; FFmpeg with libx264 and libmp3lame. The root global.json selects a stable .NET 10 SDK instead of an installed preview. Set FFMPEG_PATH if the encoder is not on PATH; EDGE_PATH can override browser discovery.

Edit [foundations.md](foundations.md) and [follow-ups.md](follow-ups.md), then run from the repository root:

```powershell
npm ci
npm run instructional:build
npm run instructional:check
dotnet run tools/instructional-audio/generate.cs -- --dry-run
```

To rerun browser and layout checks, install the local QA tools into the ignored cache and run:

```powershell
npm install --prefix tools/instructional-video/.cache/browser playwright esbuild
node tools/instructional-content/browser-check.mjs
```

Use the existing Azure resource for synthesis. Keep credentials in the process environment:

```powershell
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
```

The generator caches SSML requests by content hash. Regeneration reuses unchanged sections. The local retiming step applies 1.2× pitch-preserving tempo to spoken regions while retaining detected long drill pauses, then updates the timing manifest. It is idempotent and makes no Azure calls. Run it after audio generation, before video building.

Budget reservations are persisted in the ignored audio cache and include every synthesis attempt, including retries. The original signals lesson stayed within its US$2 allowance. The shared series ledger now enforces the approved US$10 additional allowance for the remaining six lessons; see ../azure-cost.md. Do not clear the ledger to work around the limit. Only one audio generation process should run at a time. The dry run estimates speech length; use the measured output for final duration.

## References

- [Angular signals](https://angular.dev/guide/signals)
- [Dependent state with linkedSignal](https://angular.dev/guide/signals/linked-signal)
- [Inputs and models](https://angular.dev/guide/components/inputs)
- [afterRenderEffect](https://angular.dev/api/core/afterRenderEffect)
- [Estimated Azure usage and pricing](azure-cost.md)

The audio/video pipeline and shared slide styling were adapted from the FeeBilling modernization instructional workflow supplied as the reference. All tools run locally except Azure Speech synthesis. The reference repository is not required to regenerate this lesson.

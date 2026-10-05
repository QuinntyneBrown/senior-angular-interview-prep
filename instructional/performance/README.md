# Angular Performance: Zoneless Rendering and Resource Lifetimes

**Runtime:** 21:17 · **Level:** Senior · **Format:** Captioned 1080p instructional video

[Video](performance.mp4) · [Audio](performance.mp3) · [Transcript](script.md) · [Slides](slides.html) · [Code](examples.md) · [Captions](performance.srt)

## Learning objectives

Identify render notifications, handle asynchronous state safely, remove zone-dependent DOM timing, and verify cleanup and stable layout.

Foundations introduce the concepts before each source scenario, question, answer, and follow-up. Andrew teaches; Ava reads interview prompts. All 4 practice pauses are preserved. Pause playback for longer exercises.

## Chapters

| Start | Chapter |
| --- | --- |
| 00:00 | Introduction and foundations |
| 11:27 | PERF-001: A component that only works with zone.js |
| 20:44 | Final review checklist |

## Source questions

- [PERF-001: A component that only works with zone.js](../../questions/performance/perf-001-a-component-that-needs-zone-js.md)

**Notifications are explicit.** Zone-based rendering is not a guarantee for every asynchronous API. In the tested zoneless flow, state consumed by a template must notify Angular.

**Overlapping requests.** The minimal source correction clears a timer but does not ignore stale promise completions or completions after destruction. The supplemental example adds a sequence guard and lifetime check.

## Verification

All marked complete lesson modules compile with strict Angular templates. 6 recorded browser assertions passed. All 56 slides were rendered and checked for overflow. The final media passed full decoding and Edge playback with three seek checks, and includes H.264 video, AAC audio, and 357 ordered English captions.

See [verification.json](verification.json) for measured evidence and [Azure cost](azure-cost.md) for request estimates. Chapter boundaries follow measured synthesis sections. Slide and caption positions within sections use word-based estimates, not word-level speech alignment. Browser checks cover the listed interactions in Edge; screen-reader speech, the supported-version consumer matrix, and production deployment are not certified. Narration has not received a complete human listening review.

## Regeneration

See the [shared pipeline instructions](../README.md#regeneration). Foundations and follow-up answers are authored in tools/instructional-content/lessons.mjs; source questions supply scenarios and main answers. Generated Markdown and slides should be regenerated from those sources.

## References

The source question files link the relevant official references. Supplemental checks used [Angular zoneless guidance](https://angular.dev/guide/zoneless), [Angular input contracts](https://angular.dev/guide/components/inputs), [Angular forms adapters](https://angular.dev/api/forms/ControlValueAccessor), [WAI-ARIA listbox guidance](https://www.w3.org/WAI/ARIA/apg/patterns/listbox/), [WCAG text spacing](https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html), and [Semantic Versioning](https://semver.org/).

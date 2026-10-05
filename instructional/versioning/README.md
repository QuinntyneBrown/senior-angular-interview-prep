# Versioning Angular Libraries: Compatibility and Safe Migration

**Runtime:** 38:24 · **Level:** Senior · **Format:** Captioned 1080p instructional video

[Video](versioning.mp4) · [Audio](versioning.mp3) · [Transcript](script.md) · [Slides](slides.html) · [Code](examples.md) · [Captions](versioning.srt)

## Learning objectives

Classify breaking changes, implement input deprecation, control package exports and peer dependencies, and plan consumer migrations.

Foundations introduce the concepts before each source scenario, question, answer, and follow-up. Andrew teaches; Ava reads interview prompts. All 12 practice pauses are preserved. Pause playback for longer exercises.

## Chapters

| Start | Chapter |
| --- | --- |
| 00:00 | Introduction and foundations |
| 09:17 | VER-001: Is this a breaking change? |
| 19:39 | VER-002: A deprecation that warns everyone and honours nobody |
| 28:06 | VER-003: A package that leaks its internals and duplicates Angular |
| 37:51 | Final review checklist |

## Source questions

- [VER-001: Is this a breaking change?](../../questions/versioning/ver-001-is-this-a-breaking-change.md)
- [VER-002: A deprecation that warns everyone and honours nobody](../../questions/versioning/ver-002-deprecating-an-input.md)
- [VER-003: A package that leaks its internals and duplicates Angular](../../questions/versioning/ver-003-the-package-surface.md)

**Direct-reference compatibility.** The deprecation correction changes kind() from primary to undefined when unset. Consumers reading that getter can observe the change even though the rendered default stays primary. Treat those reads as migration cases.

**Installation versus imports.** Secondary entry points alone do not make date-fns optional to install. Optional peer metadata or a separate package must match the isolated feature and its declarations.

## Verification

All marked complete lesson modules compile with strict Angular templates. 8 recorded browser assertions passed. 5 consumer compilation and package-surface checks also passed. All 117 slides were rendered and checked for overflow. The final media passed full decoding and Edge playback with three seek checks, and includes H.264 video, AAC audio, and 616 ordered English captions.

See [verification.json](verification.json) for measured evidence and [Azure cost](azure-cost.md) for request estimates. Chapter boundaries follow measured synthesis sections. Slide and caption positions within sections use word-based estimates, not word-level speech alignment. Browser checks cover the listed interactions in Edge; screen-reader speech, the supported-version consumer matrix, and production deployment are not certified. Narration has not received a complete human listening review.

## Regeneration

See the [shared pipeline instructions](../README.md#regeneration). Foundations and follow-up answers are authored in tools/instructional-content/lessons.mjs; source questions supply scenarios and main answers. Generated Markdown and slides should be regenerated from those sources.

## References

The source question files link the relevant official references. Supplemental checks used [Angular zoneless guidance](https://angular.dev/guide/zoneless), [Angular input contracts](https://angular.dev/guide/components/inputs), [Angular forms adapters](https://angular.dev/api/forms/ControlValueAccessor), [WAI-ARIA listbox guidance](https://www.w3.org/WAI/ARIA/apg/patterns/listbox/), [WCAG text spacing](https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html), and [Semantic Versioning](https://semver.org/).

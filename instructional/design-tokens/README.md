# Design Tokens: Themes, Accessibility, and Public Contracts

**Runtime:** 47:46 · **Level:** Senior · **Format:** Captioned 1080p instructional video

[Video](design-tokens.mp4) · [Audio](design-tokens.mp3) · [Transcript](script.md) · [Slides](slides.html) · [Code](examples.md) · [Captions](design-tokens.srt)

## Learning objectives

Design token layers, manage CSS inheritance and migrations, support themes and forced colors, and preserve usable text and targets.

Foundations introduce the concepts before each source scenario, question, answer, and follow-up. Andrew teaches; Ava reads interview prompts. All 16 practice pauses are preserved. Pause playback for longer exercises.

## Chapters

| Start | Chapter |
| --- | --- |
| 00:00 | Introduction and foundations |
| 11:27 | TOK-001: A button that cannot be themed |
| 21:01 | TOK-002: Renaming a public token in a minor release |
| 29:32 | TOK-003: Dark mode that flashes, crashes and disappears |
| 39:59 | TOK-004: Size tokens that break zoom and text spacing |
| 47:13 | Final review checklist |

## Source questions

- [TOK-001: A button that cannot be themed](../../questions/design-tokens/tok-001-raw-values-and-token-layers.md)
- [TOK-002: Renaming a public token in a minor release](../../questions/design-tokens/tok-002-renaming-a-public-token.md)
- [TOK-003: Dark mode that flashes, crashes and disappears](../../questions/design-tokens/tok-003-dark-mode-and-forced-colors.md)
- [TOK-004: Size tokens that break zoom and text spacing](../../questions/design-tokens/tok-004-tokens-that-break-zoom.md)


## Verification

All marked complete lesson modules compile with strict Angular templates. 7 recorded browser assertions passed. All 135 slides were rendered and checked for overflow. The final media passed full decoding and Edge playback with three seek checks, and includes H.264 video, AAC audio, and 773 ordered English captions.

See [verification.json](verification.json) for measured evidence and [Azure cost](azure-cost.md) for request estimates. Chapter boundaries follow measured synthesis sections. Slide and caption positions within sections use word-based estimates, not word-level speech alignment. Browser checks cover the listed interactions in Edge; screen-reader speech, the supported-version consumer matrix, and production deployment are not certified. Narration has not received a complete human listening review.

## Regeneration

See the [shared pipeline instructions](../README.md#regeneration). Foundations and follow-up answers are authored in tools/instructional-content/lessons.mjs; source questions supply scenarios and main answers. Generated Markdown and slides should be regenerated from those sources.

## References

The source question files link the relevant official references. Supplemental checks used [Angular zoneless guidance](https://angular.dev/guide/zoneless), [Angular input contracts](https://angular.dev/guide/components/inputs), [Angular forms adapters](https://angular.dev/api/forms/ControlValueAccessor), [WAI-ARIA listbox guidance](https://www.w3.org/WAI/ARIA/apg/patterns/listbox/), [WCAG text spacing](https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html), and [Semantic Versioning](https://semver.org/).

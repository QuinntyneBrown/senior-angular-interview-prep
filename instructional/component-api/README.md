# Angular Component APIs: Native Semantics and Consumer Contracts

**Runtime:** 47:54 · **Level:** Senior · **Format:** Captioned 1080p instructional video

[Video](component-api.mp4) · [Audio](component-api.mp3) · [Transcript](script.md) · [Slides](slides.html) · [Code](examples.md) · [Captions](component-api.srt)

## Learning objectives

Design predictable inputs and events, preserve native element capabilities, use composition, and implement the forms control contract.

Foundations introduce the concepts before each source scenario, question, answer, and follow-up. Andrew teaches; Ava reads interview prompts. All 16 practice pauses are preserved. Pause playback for longer exercises.

## Chapters

| Start | Chapter |
| --- | --- |
| 00:00 | Introduction and foundations |
| 10:43 | API-001: A button that saves twice and ignores disabled |
| 19:45 | API-002: A wrapper that hides the native element |
| 28:11 | API-003: A card with an input for everything |
| 37:14 | API-004: A checkbox that makes every form dirty |
| 47:21 | Final review checklist |

## Source questions

- [API-001: A button that saves twice and ignores disabled](../../questions/component-api/api-001-a-button-that-clicks-twice.md)
- [API-002: A wrapper that hides the native element](../../questions/component-api/api-002-wrapping-native-elements.md)
- [API-003: A card with an input for everything](../../questions/component-api/api-003-configuration-versus-composition.md)
- [API-004: A checkbox that makes every form dirty](../../questions/component-api/api-004-a-control-value-accessor-that-lies.md)


## Verification

All marked complete lesson modules compile with strict Angular templates. 15 recorded browser assertions passed. All 137 slides were rendered and checked for overflow. The final media passed full decoding and Edge playback with three seek checks, and includes H.264 video, AAC audio, and 754 ordered English captions.

See [verification.json](verification.json) for measured evidence and [Azure cost](azure-cost.md) for request estimates. Chapter boundaries follow measured synthesis sections. Slide and caption positions within sections use word-based estimates, not word-level speech alignment. Browser checks cover the listed interactions in Edge; screen-reader speech, the supported-version consumer matrix, and production deployment are not certified. Narration has not received a complete human listening review.

## Regeneration

See the [shared pipeline instructions](../README.md#regeneration). Foundations and follow-up answers are authored in tools/instructional-content/lessons.mjs; source questions supply scenarios and main answers. Generated Markdown and slides should be regenerated from those sources.

## References

The source question files link the relevant official references. Supplemental checks used [Angular zoneless guidance](https://angular.dev/guide/zoneless), [Angular input contracts](https://angular.dev/guide/components/inputs), [Angular forms adapters](https://angular.dev/api/forms/ControlValueAccessor), [WAI-ARIA listbox guidance](https://www.w3.org/WAI/ARIA/apg/patterns/listbox/), [WCAG text spacing](https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html), and [Semantic Versioning](https://semver.org/).

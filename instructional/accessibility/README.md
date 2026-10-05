# Accessible Angular Components: Names, Focus, and Interaction

**Runtime:** 1:18:52 · **Level:** Senior · **Format:** Captioned 1080p instructional video

[Video](accessibility.mp4) · [Audio](accessibility.mp3) · [Transcript](script.md) · [Slides](slides.html) · [Code](examples.md) · [Captions](accessibility.srt)

## Learning objectives

Build named keyboard-operable controls, dialogs, tabs, form fields, notifications, and a single-select listbox with explicit focus and selection behavior.

Foundations introduce the concepts before each source scenario, question, answer, and follow-up. Andrew teaches; Ava reads interview prompts. All 24 practice pauses are preserved. Pause playback for longer exercises.

## Chapters

| Start | Chapter |
| --- | --- |
| 00:00 | Introduction and foundations |
| 14:53 | A11Y-001: An icon button that keyboard and screen-reader users cannot use |
| 23:21 | A11Y-002: A modal dialog that is not modal |
| 32:35 | A11Y-003: Tabs that only work with a mouse |
| 43:09 | A11Y-004: A form field where nothing is connected |
| 52:18 | A11Y-005: Toasts that vanish before anyone can use them |
| 1:02:35 | A11Y-006: Live coding: build an accessible listbox |
| 1:18:19 | Final review checklist |

## Source questions

- [A11Y-001: An icon button that keyboard and screen-reader users cannot use](../../questions/accessibility/a11y-001-an-icon-button-nobody-can-use.md)
- [A11Y-002: A modal dialog that is not modal](../../questions/accessibility/a11y-002-a-modal-that-is-not-modal.md)
- [A11Y-003: Tabs that only work with a mouse](../../questions/accessibility/a11y-003-tabs-without-the-tabs-pattern.md)
- [A11Y-004: A form field where nothing is connected](../../questions/accessibility/a11y-004-a-form-field-with-nothing-connected.md)
- [A11Y-005: Toasts that vanish before anyone can use them](../../questions/accessibility/a11y-005-toasts-nobody-hears.md)
- [A11Y-006: Live coding: build an accessible listbox](../../questions/accessibility/a11y-006-live-coding-accessible-listbox.md)

**Repeated-letter typeahead.** The reference buffer accumulates repeated letters, so typing the same letter twice quickly searches for a doubled prefix rather than cycling. The supplemental listbox example resets repeated single-letter input to a one-letter search and verifies cycling. The source remains unchanged.

**Browser checks and announcements.** DOM and browser interaction checks establish names, relationships, and focus in the tested browser. They do not establish a universal screen-reader announcement or server-hydration identifier strategy.

## Verification

All marked complete lesson modules compile with strict Angular templates. 40 recorded browser assertions passed. All 220 slides were rendered and checked for overflow. The final media passed full decoding and Edge playback with three seek checks, and includes H.264 video, AAC audio, and 1300 ordered English captions.

See [verification.json](verification.json) for measured evidence and [Azure cost](azure-cost.md) for request estimates. Chapter boundaries follow measured synthesis sections. Slide and caption positions within sections use word-based estimates, not word-level speech alignment. Browser checks cover the listed interactions in Edge; screen-reader speech, the supported-version consumer matrix, and production deployment are not certified. Narration has not received a complete human listening review.

## Regeneration

See the [shared pipeline instructions](../README.md#regeneration). Foundations and follow-up answers are authored in tools/instructional-content/lessons.mjs; source questions supply scenarios and main answers. Generated Markdown and slides should be regenerated from those sources.

## References

The source question files link the relevant official references. Supplemental checks used [Angular zoneless guidance](https://angular.dev/guide/zoneless), [Angular input contracts](https://angular.dev/guide/components/inputs), [Angular forms adapters](https://angular.dev/api/forms/ControlValueAccessor), [WAI-ARIA listbox guidance](https://www.w3.org/WAI/ARIA/apg/patterns/listbox/), [WCAG text spacing](https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html), and [Semantic Versioning](https://semver.org/).

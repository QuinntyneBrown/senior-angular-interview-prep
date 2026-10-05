---
id: TOK-004
title: Size tokens that break zoom and text spacing
topic: design-tokens
format: code-review
difficulty: senior
minutes: 8
angular: "20+"
tags: [design-tokens, rem, zoom, text-spacing, target-size]
---

# Size tokens that break zoom and text spacing

## Scenario

An accessibility audit of a product built on `@acme/ui` reports three failures:

- With the browser's default font size set to 24px, button labels do not grow.
- With text spacing increased (a common user stylesheet or bookmarklet), labels are cut off.
- On a narrow phone, the icon buttons in the toolbar are hard to hit.

The relevant tokens and component styles:

```css
:root {
  --ui-font-size-label: 14px;
  --ui-line-height-label: 20px;
  --ui-control-height: 32px;
  --ui-icon-button-size: 20px;
}

.ui-button {
  height: var(--ui-control-height);
  overflow: hidden;
  white-space: nowrap;
  font-size: var(--ui-font-size-label);
  line-height: var(--ui-line-height-label);
}

.ui-icon-button {
  width: var(--ui-icon-button-size);
  height: var(--ui-icon-button-size);
  padding: 0;
}
```

## Question

**Explain each failure and fix the tokens and styles.** Which WCAG success criteria are involved?

## Hints

<details>
<summary>Hint 1</summary>

Which CSS unit follows the user's default font size, and which ignores it?

</details>

<details>
<summary>Hint 2</summary>

A fixed `height` plus `overflow: hidden` assumes the content never grows. What makes content grow?

</details>

## Answer

### 1. Pixel font sizes ignore the user's font-size setting

`px` font sizes stay the same when a user raises the browser's default font size. Browser zoom
scales them, but many users with low vision rely on the font-size setting instead, and it is the
only option in some environments. `rem` is relative to the root font size, which follows the user's
setting.

**Fix:** express font sizes in `rem` (`0.875rem` is 14px at the default 16px) and line heights as
unitless ratios, so they scale with the text.

### 2. Fixed heights with hidden overflow cut off text

WCAG 1.4.12 (Text Spacing) requires that no content is lost when users increase line height,
letter spacing, word spacing and paragraph spacing. 1.4.4 (Resize Text) requires text to scale to
200% without loss of content. A fixed `height` with `overflow: hidden` and `nowrap` guarantees
clipping in both cases, and also with long translations.

**Fix:** size controls with `min-height` and padding, not `height`, and let labels wrap unless
there is a documented reason not to.

### 3. The icon buttons are too small to hit

20 × 20 CSS pixels is below the WCAG 2.2 minimum of 24 × 24 (2.5.8 Target Size (Minimum), level
AA), unless enough spacing surrounds each target. Many design systems choose 44 × 44 for touch
anyway. The icon can stay small; the clickable area should not.

**Fix:** separate the icon size token from the target size token.

### Fixed version

```css
:root {
  --ui-font-size-label: 0.875rem;
  --ui-line-height-label: 1.43;
  --ui-control-min-height: 2.5rem;
  --ui-icon-size: 1.25rem;
  --ui-target-size: 2.75rem;
}

.ui-button {
  min-height: var(--ui-control-min-height);
  padding-block: var(--ui-space-2);
  font-size: var(--ui-font-size-label);
  line-height: var(--ui-line-height-label);
}

.ui-icon-button {
  display: inline-grid;
  place-items: center;
  min-width: var(--ui-target-size);
  min-height: var(--ui-target-size);
  padding: 0;
}

.ui-icon-button svg {
  width: var(--ui-icon-size);
  height: var(--ui-icon-size);
}
```

### What a strong candidate also mentions

- **Renaming `--ui-control-height` is a breaking change** for teams who set it. Keep it as a
  deprecated alias that feeds `--ui-control-min-height` (see TOK-002), and call out in the
  changelog that buttons may now grow taller than before.
- **Visual regression tests** at 200% text size and with the WCAG text-spacing values applied
  would have caught this before release.
- **Borders and focus rings** can stay in `px`. Scaling a 1px hairline with text is rarely wanted.

## Scoring

| Area | Strong signal | Weak signal |
| --- | --- | --- |
| Units | Explains why `rem` follows user settings and `px` does not | Says "browser zoom handles it" |
| Layout | Replaces `height` and `overflow: hidden` with `min-height` and padding | Increases the fixed height |
| Target size | Separates icon size from target size; cites 2.5.8 | Makes the icon bigger |
| Compatibility | Treats the token rename and visual change as something to manage | Changes token meaning silently |

## Follow-up questions

1. Should spacing tokens be in `rem` too? What changes visually when a user increases font size?
2. How would you automate the text-spacing check?
3. A dense data grid needs 24px rows. How do you meet target-size requirements there?

## References

- [WCAG 2.2: Understanding Resize Text (1.4.4)](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html)
- [WCAG 2.2: Understanding Text Spacing (1.4.12)](https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html)
- [WCAG 2.2: Understanding Target Size (Minimum) (2.5.8)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)
- [MDN: CSS values and units (`rem`)](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Values_and_units)

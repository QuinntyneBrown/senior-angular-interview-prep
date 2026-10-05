---
id: TOK-001
title: A button that cannot be themed
topic: design-tokens
format: code-review
difficulty: senior
minutes: 10
angular: "20+"
tags: [design-tokens, theming, css-custom-properties, focus-visible]
---

# A button that cannot be themed

## Scenario

`@acme/ui` is adding a dark theme and a second brand for an acquired company. The button below
does not change in either theme. A product team also complains that they had to write
`.ui-button { background: ... }` in their global stylesheet to restyle a button for a campaign
page, and it broke after the last library release.

The tokens file:

```css
:root {
  --color-blue-500: #0b5fff;
  --color-blue-700: #0842b3;
  --color-red-500: #d92d20;
  --color-red-700: #a51f15;
}
```

The button's stylesheet:

```css
.ui-button {
  background: #0b5fff;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font: 600 14px/20px "Inter", sans-serif;
}

.ui-button:hover {
  background: var(--color-blue-700);
}

.ui-button--danger {
  background: var(--color-red-500);
}

.ui-button--danger:hover {
  background: var(--color-red-700);
}

.ui-button:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(11, 95, 255, 0.4);
}
```

## Question

**Why can't this button be themed, and what token structure would you put in place?** Then tell me
how product teams *should* customise it, and what is wrong with the focus style.

## Hints

<details>
<summary>Hint 1</summary>

In a dark theme, what should `--color-blue-500` be? Is that question even meaningful?

</details>

<details>
<summary>Hint 2</summary>

What happens to `box-shadow` when Windows high-contrast mode (forced colors) is on?

</details>

## Answer

### 1. Raw values bypass the token system

`#0b5fff`, `white`, `8px 16px`, `4px` and the font shorthand are written directly into the
component. A theme can only change custom properties, so these values never change. Each one is
also a copy of a decision made elsewhere, which drifts silently the next time the design team
adjusts it.

### 2. Components use palette tokens, which have no meaning

`--color-blue-700` names a *colour*, not a *purpose*. A dark theme cannot sensibly redefine
"blue-700", and the acquired brand's primary colour is not blue at all. Themes need something to
remap that describes intent. The usual answer is three layers:

| Layer | Example | Who uses it |
| --- | --- | --- |
| Primitive (palette) | `--ui-palette-blue-500: #0b5fff` | Only the semantic layer |
| Semantic | `--ui-color-action-primary: var(--ui-palette-blue-500)` | Components; themes remap these |
| Component | `--ui-button-background` | Consumers who need a documented override |

A dark theme or a second brand then redefines the semantic layer only:

```css
:root {
  --ui-palette-blue-300: #6b9bff;
  --ui-palette-blue-500: #0b5fff;
  --ui-palette-blue-700: #0842b3;
  --ui-palette-neutral-0: #ffffff;
  --ui-palette-neutral-950: #0b0d12;

  --ui-color-action-primary: var(--ui-palette-blue-500);
  --ui-color-action-primary-hover: var(--ui-palette-blue-700);
  --ui-color-on-action-primary: var(--ui-palette-neutral-0);
  --ui-color-focus-ring: var(--ui-palette-blue-700);
}

[data-ui-theme='dark'] {
  --ui-color-action-primary: var(--ui-palette-blue-300);
  --ui-color-action-primary-hover: var(--ui-palette-blue-500);
  --ui-color-on-action-primary: var(--ui-palette-neutral-950);
  --ui-color-focus-ring: var(--ui-palette-blue-300);
}
```

The names are also prefixed (`--ui-`). Unprefixed names such as `--color-blue-500` collide with
custom properties that product applications already define.

### 3. Consumers had to style private markup

The campaign team targeted `.ui-button`, an internal class. Internal class names and DOM structure
are not public API, so a refactor broke them, and the library had no way to know. The fix is to
give consumers a **documented** hook: component-level tokens that the component reads with a
fallback to the semantic token.

```css
.ui-button {
  --_background: var(--ui-button-background, var(--ui-color-action-primary));
  --_background-hover: var(--ui-button-background-hover, var(--ui-color-action-primary-hover));
  --_foreground: var(--ui-button-foreground, var(--ui-color-on-action-primary));

  background: var(--_background);
  color: var(--_foreground);
  padding: var(--ui-space-2) var(--ui-space-4);
  border: none;
  border-radius: var(--ui-radius-control);
  font: var(--ui-font-label);
}

.ui-button:hover {
  background: var(--_background-hover);
}

.ui-button--danger {
  --_background: var(--ui-button-danger-background, var(--ui-color-action-danger));
  --_background-hover: var(--ui-button-danger-background-hover, var(--ui-color-action-danger-hover));
  --_foreground: var(--ui-button-danger-foreground, var(--ui-color-on-action-danger));
}

.ui-button:focus-visible {
  outline: var(--ui-focus-ring-width) solid var(--ui-color-focus-ring);
  outline-offset: var(--ui-focus-ring-offset);
}
```

The campaign team now writes `.campaign ui-button { --ui-button-background: ... }`. That name is
listed in the button's documentation and covered by the library's versioning policy, so renaming
it later is a breaking change the library manages deliberately (see TOK-002).

The underscore properties (`--_background`) are private working variables. They let the danger
variant change the defaults without overwriting the public tokens a consumer may have set.

### 4. The focus style fails in two ways

- **`outline: none` plus `box-shadow`.** In forced-colors mode (Windows contrast themes) the browser
  removes `box-shadow`, so keyboard users see no focus indicator at all. An outline survives forced
  colors because the browser repaints it in a system colour.
- **`:focus` instead of `:focus-visible`.** The ring appears on every mouse click, which is why
  teams are tempted to remove it. `:focus-visible` shows it when the browser judges a focus
  indicator useful, such as keyboard navigation.
- The 40%-opacity ring is also unlikely to meet the 3:1 contrast required for focus indicators
  against both the button and the page background.

## Scoring

| Area | Strong signal | Weak signal |
| --- | --- | --- |
| Token layers | Explains primitive, semantic and component layers and why themes remap only semantics | Replaces hex values with palette tokens and calls it done |
| Public API | Treats component tokens as documented, versioned API and internal classes as private | Tells consumers to use `::ng-deep` or global class overrides |
| Theming | Shows a theme as a remapping of semantic tokens | Proposes a second stylesheet per theme |
| Focus | Catches forced colors and `:focus-visible` | Only mentions the colour of the ring |

## Follow-up questions

1. Where should token values be authored so that web, iOS and Android stay in step? What would you
   generate from that source?
2. A team wants a "slightly lighter" primary button on one page. Do you add a component token, a
   variant, or say no? What decides it?
3. How would you stop raw hex values from being merged into the library again?

## References

- [W3C Design Tokens Community Group: Format specification](https://www.designtokens.org/)
- [MDN: Using CSS custom properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
- [MDN: `forced-colors` media feature](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/forced-colors)
- [MDN: `:focus-visible`](https://developer.mozilla.org/en-US/docs/Web/CSS/:focus-visible)
- [WCAG 2.2: Understanding Non-text Contrast (1.4.11)](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html)

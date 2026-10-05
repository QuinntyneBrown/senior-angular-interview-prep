---
id: TOK-003
title: Dark mode that flashes, crashes and disappears
topic: design-tokens
format: code-review
difficulty: senior
minutes: 12
angular: "20+"
tags: [theming, ssr, forced-colors, color-scheme, light-dark]
---

# Dark mode that flashes, crashes and disappears

## Scenario

`@acme/ui` ships a theme service and theme-aware components. Three bug reports arrive in the same
week:

1. "Our server-rendered app crashes on startup since we added the theme service."
2. "Our page loads white, then flashes dark. And our `body` classes disappear."
3. "With Windows contrast themes on, users cannot tell which filter chips are selected."

```ts verify
import { Injectable, effect, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly theme = signal<'light' | 'dark'>(
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
  );

  constructor() {
    effect(() => {
      document.body.className = `theme-${this.theme()}`;
    });
  }

  toggle(): void {
    this.theme.update(theme => (theme === 'dark' ? 'light' : 'dark'));
  }
}
```

```css
.theme-light {
  --ui-color-surface: #ffffff;
  --ui-color-on-surface: #1a1c21;
  --ui-color-selected: #dce6ff;
}

.theme-dark {
  --ui-color-surface: #0b0d12;
  --ui-color-on-surface: #e6e8ee;
  --ui-color-selected: #1d3a7a;
}

.ui-chip {
  border: none;
  background: var(--ui-color-surface);
  color: var(--ui-color-on-surface);
}

.ui-chip[aria-pressed='true'] {
  background: var(--ui-color-selected);
}
```

## Question

**Explain the cause of each report and redesign the theming approach.** Keep in mind this is a
library: it cannot assume how each application boots, renders or stores preferences.

## Hints

<details>
<summary>Hint 1</summary>

Does the operating-system preference need JavaScript at all?

</details>

<details>
<summary>Hint 2</summary>

In forced-colors mode the browser replaces author colours with a small set of system colours.
What is left to tell a selected chip from an unselected one?

</details>

## Answer

### Report 1: global browser objects crash server rendering

`window` and `document` do not exist during server-side rendering, so `window.matchMedia` throws a
`ReferenceError` as soon as the service is created. Because the service is `providedIn: 'root'` and
injected early, the whole application fails. A library cannot assume it only runs in a browser.

**Fix:** inject `DOCUMENT`, and do not read browser-only APIs during construction.

### Report 2: the flash, and the lost classes

- **The flash.** No theme applies until JavaScript has loaded, bootstrapped, and run the effect.
  Until then the page has no theme class, so the light defaults show, then switch. Users with a
  dark system preference see this on every load.
- **Lost classes.** `document.body.className = ...` replaces every class on `body`, including the
  application's own.
- **It also goes stale.** The OS preference is read once. If the user's system switches to dark at
  sunset, the page does not follow. There is also no way to say "follow the system" after toggling.

**Fix:** let CSS handle the system preference, and use JavaScript only for an explicit choice.

```css
:root {
  color-scheme: light dark;
  --ui-color-surface: light-dark(#ffffff, #0b0d12);
  --ui-color-on-surface: light-dark(#1a1c21, #e6e8ee);
  --ui-color-selected: light-dark(#dce6ff, #1d3a7a);
}

:root[data-ui-theme='light'] {
  color-scheme: light;
}

:root[data-ui-theme='dark'] {
  color-scheme: dark;
}
```

`light-dark()` picks a value based on the element's used `color-scheme`. With no attribute, the
browser follows the OS preference before any script runs, so there is no flash and no stale value.
`color-scheme` also makes scrollbars and native form controls match the theme.

```ts verify
import { DOCUMENT, Injectable, effect, inject, signal } from '@angular/core';

export type ThemePreference = 'light' | 'dark' | 'system';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly root = inject(DOCUMENT).documentElement;
  readonly preference = signal<ThemePreference>('system');

  constructor() {
    effect(() => {
      const preference = this.preference();
      if (preference === 'system') this.root.removeAttribute('data-ui-theme');
      else this.root.setAttribute('data-ui-theme', preference);
    });
  }
}
```

The service touches only its own attribute on `<html>`, works on the server, and exposes the
preference as a signal. Persisting the choice is the application's decision; the library documents
how to restore it before first paint (for example, an inline script in `index.html` that sets
`data-ui-theme` from storage, or setting it during server rendering from a cookie).

### Report 3: state shown by colour alone

In forced-colors mode the browser replaces author background colours with system colours (for a
`<button>`, `ButtonFace`). Both chips now look identical. This also fails WCAG 1.4.1 (Use of Color) in normal mode for users who cannot
distinguish the two background colours.

**Fix:** convey state with something other than colour, and opt into system colours deliberately:

```css
.ui-chip {
  border: 1px solid transparent;
}

.ui-chip[aria-pressed='true']::before {
  content: '✓ ' / '';
}

@media (forced-colors: active) {
  .ui-chip[aria-pressed='true'] {
    forced-color-adjust: none;
    background: Highlight;
    color: HighlightText;
  }
}
```

The transparent border becomes visible in forced-colors mode, because the browser repaints border
colours with a system colour, so every chip keeps an outline. The check mark is visual only (the
empty alternative text after `/` keeps it out of the accessible name, since `aria-pressed` already
conveys the state). `forced-color-adjust: none` is used only on the one rule that then uses system
colours.

### What a strong candidate also mentions

- **Contrast is a property of token pairs.** Define tokens as pairs (`surface` and `on-surface`,
  `selected` and `on-selected`) and test every pair in every theme for 4.5:1 text contrast in CI,
  rather than checking components one by one.
- **Themes can apply to a region,** not just the page. Because tokens are custom properties, a
  `data-ui-theme` attribute on any element can work if the library supports it, but `color-scheme`
  must be set on that element too.

## Scoring

| Area | Strong signal | Weak signal |
| --- | --- | --- |
| SSR | Names the server crash and removes global access from construction | Wraps everything in `typeof window` checks without redesigning |
| Flash | Moves the system preference into CSS (`color-scheme`, `light-dark()` or media queries) | Delays rendering until the theme is known |
| Library boundaries | Stops overwriting `body` classes; leaves persistence to the app | Stores the preference in `localStorage` inside the library |
| Forced colors | Adds a non-colour indicator and uses system colours on purpose | Adds `forced-color-adjust: none` globally |

## Follow-up questions

1. Which browsers support `light-dark()`? What is your fallback for applications that must support
   older ones?
2. How would you test the forced-colors behaviour in CI?
3. A product team wants a third "high contrast" theme. What does your token structure need for
   that to be a remapping rather than a fork?

## References

- [MDN: `color-scheme`](https://developer.mozilla.org/en-US/docs/Web/CSS/color-scheme)
- [MDN: `light-dark()`](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/light-dark)
- [MDN: `forced-colors` media feature](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/forced-colors)
- [MDN: `forced-color-adjust`](https://developer.mozilla.org/en-US/docs/Web/CSS/forced-color-adjust)
- [Angular: Server-side rendering (authoring server-compatible components)](https://angular.dev/guide/ssr)
- [WCAG 2.2: Understanding Use of Color (1.4.1)](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html)

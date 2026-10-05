---
id: A11Y-001
title: An icon button that keyboard and screen-reader users cannot use
topic: accessibility
format: code-review
difficulty: senior
minutes: 10
angular: "20+"
tags: [accessible-name, keyboard, aria-disabled, icon-fonts]
---

# An icon button that keyboard and screen-reader users cannot use

## Scenario

`@acme/ui` has shipped this icon button for a year. It uses an icon font with ligatures, so the
text `delete` renders as a bin icon. Hundreds of call sites look like the usage below. An
accessibility audit has just failed three products because of it.

```ts verify
import { Component, input, output } from '@angular/core';

@Component({
  selector: 'ui-icon-button',
  template: `
    <div
      class="ui-icon-button"
      [class.ui-icon-button--disabled]="disabled()"
      (click)="handleClick()">
      <span class="ui-icon">{{ icon() }}</span>
    </div>
  `,
})
export class IconButtonComponent {
  readonly icon = input.required<string>();
  readonly disabled = input(false);
  readonly pressed = output<void>();

  handleClick(): void {
    if (!this.disabled()) this.pressed.emit();
  }
}
```

```html
<ui-icon-button icon="more_vert" title="More actions" (pressed)="openMenu()" />
```

## Question

**List the accessibility failures, fix the component, and explain how you would release the fix
to hundreds of existing call sites.**

## Hints

<details>
<summary>Hint 1</summary>

Try to reach and activate it with only a keyboard. Then ask: what text would a screen reader
announce for it?

</details>

<details>
<summary>Hint 2</summary>

If your fix adds a required input, what happens to every existing call site at the next upgrade?

</details>

## Answer

### 1. It is not a button

A `<div>` with a click handler has no role, is not in the tab order, and does not respond to Enter
or Space. Keyboard users cannot reach it; screen readers do not announce it as interactive.
Adding `role="button"`, `tabindex="0"` and key handlers is possible but recreates what the native
element already does, usually incompletely (Space activates on key *up* for native buttons, for
example).

**Fix:** use a native `<button type="button">`. `type="button"` matters: a button inside a
`<form>` defaults to `submit`.

### 2. The accessible name is the ligature text

The only text inside is `more_vert`, so assistive technology announces something like "more
underscore vert". `title` on the custom element does not help: it is on a host element with no
role, and `title` is not reliably exposed or shown to keyboard and touch users anyway.

**Fix:** a `label` input bound to `aria-label` on the button, and `aria-hidden="true"` on the icon
so the ligature text is never read.

### 3. Disabled is visual only

The class greys the button out, but nothing tells assistive technology it is unavailable. There are
two valid fixes, and the choice should be deliberate:

- Native `disabled`: removes the button from the tab order. Simple, but users cannot discover the
  control or a tooltip explaining *why* it is disabled.
- `aria-disabled="true"`: keeps it focusable and announced as unavailable. The component must
  then block activation itself.

The fixed version uses `aria-disabled` so that disabled actions in toolbars remain discoverable.

### Fixed version

```ts verify
import { Component, booleanAttribute, input, output } from '@angular/core';

@Component({
  selector: 'ui-icon-button',
  template: `
    <button
      type="button"
      class="ui-icon-button"
      [attr.aria-label]="label()"
      [attr.aria-disabled]="disabled() || null"
      (click)="handleClick()">
      <span class="ui-icon" aria-hidden="true">{{ icon() }}</span>
    </button>
  `,
})
export class IconButtonComponent {
  readonly icon = input.required<string>();
  readonly label = input.required<string>();
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly pressed = output<void>();

  handleClick(): void {
    if (!this.disabled()) this.pressed.emit();
  }
}
```

Making `label` **required** turns a recurring accessibility bug into a compile error: nobody can
add an icon button without a name again.

### 4. Releasing it without breaking hundreds of call sites

A new required input is a **breaking change**: every existing `<ui-icon-button>` stops compiling.
A safe rollout:

1. **Minor release:** add `label` as *optional*. When it is missing, fall back to the `title`
   attribute if present, and log a development-mode warning that names the icon, so teams can
   find each call site. Mark the old behaviour deprecated in the changelog.
2. **Provide a migration:** an `ng update` schematic that rewrites `title="..."` to
   `label="..."`, and reports call sites with neither for a person to fix.
3. **Next major:** make `label` required. The compiler now lists any remaining call sites.

The other changes (native button, `aria-hidden` icon, `aria-disabled`) fix behaviour without
changing the API, so they can ship immediately in a minor or patch release. Mention them in the
changelog: teams with styles targeting the internal `div` will notice.

## Scoring

| Area | Strong signal | Weak signal |
| --- | --- | --- |
| Semantics | Replaces the `div` with a native `button type="button"` | Adds `role="button"` and a `keydown` handler |
| Name | Spots the ligature text and hides the icon | Relies on `title` |
| Disabled | Explains the native `disabled` versus `aria-disabled` trade-off | Leaves the visual class only |
| Rollout | Recognises the required input as breaking and plans a staged migration | Ships the required input in a minor release |

## Follow-up questions

1. A team wants a tooltip on every icon button. How does a tooltip relate to the accessible name,
   and how should it behave for keyboard users?
2. When is `aria-labelledby` better than `aria-label` here?
3. How would you test, automatically, that every icon button in a product has a name?

## References

- [WAI-ARIA APG: Button pattern](https://www.w3.org/WAI/ARIA/apg/patterns/button/)
- [WCAG 2.2: Understanding Name, Role, Value (4.1.2)](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html)
- [WCAG 2.2: Understanding Keyboard (2.1.1)](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html)
- [MDN: `aria-disabled`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-disabled)
- [Angular: Input transforms and `booleanAttribute`](https://angular.dev/guide/components/inputs#input-transforms)

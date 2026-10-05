---
id: API-001
title: A button that saves twice and ignores disabled
topic: component-api
format: code-review
difficulty: senior
minutes: 10
angular: "20+"
tags: [outputs, booleanAttribute, input-types, native-events]
---

# A button that saves twice and ignores disabled

## Scenario

Two bug reports against `@acme/ui`'s button:

- "Every click on Save sends two requests."
- "`<ui-button disabled>` is not disabled." (from a team whose application does not use strict
  template type checking)

A third team says a typo in `kind` shipped to production unnoticed.

```ts verify
import { Component, input, output } from '@angular/core';

@Component({
  selector: 'ui-button',
  template: `
    <button
      type="button"
      [class]="'ui-button ui-button--' + kind()"
      [disabled]="disabled()"
      (click)="click.emit($event)">
      <ng-content />
    </button>
  `,
})
export class ButtonComponent {
  readonly kind = input('primary');
  readonly disabled = input(false);
  readonly click = output<MouseEvent>();
}
```

```html
<ui-button kind="primay" (click)="save()">Save</ui-button>
```

## Question

**Explain each report, and fix the component's API.** For each change, say whether existing
consumers would notice.

## Hints

<details>
<summary>Hint 1</summary>

`(click)` on `<ui-button>`: does Angular listen to the component's output, the native DOM event,
or both?

</details>

<details>
<summary>Hint 2</summary>

What value does Angular pass to an input for the attribute `disabled` written with no value?

</details>

## Answer

### 1. Saving twice: an output named after a native event

`(click)` on `<ui-button>` subscribes to **both** the component's `click` output and the native
`click` DOM event on the host element. The inner `<button>`'s native click bubbles up to the host,
so `save()` runs once for the bubbled DOM event and once for the output.

It gets worse: a click on any part of the host outside the inner button (padding, a gap) fires
the native event even when the button is disabled.

**Fix:** never name an output after a native DOM event. Here the output is not needed at all:
native `click` events from the inner `<button>` already bubble to the host, and a disabled
`<button>` does not dispatch click events, so `(click)` on `<ui-button>` just works. If a custom
event is needed, give it a distinct name (`pressed`).

### 2. `disabled` with no value is falsy

For a static attribute with no value, Angular passes the empty string `''` to the input. `''` is
falsy, so `[disabled]="disabled()"` leaves the button enabled. Applications with strict template
checking get a compile error instead (a string is not a boolean), which is better, but HTML-style
boolean attributes should simply work.

**Fix:** `input(false, { transform: booleanAttribute })`, which maps `''`, `'true'` and `true` to
`true`, and `'false'`, `false`, `null` and `undefined` to `false`. `numberAttribute` does the same
for numeric inputs.

### 3. `kind` accepts any string

`input('primary')` infers `string`. `"primay"` compiles, produces the class `ui-button--primay`,
and renders an unstyled button.

**Fix:** a union type, exported so consumers can use it in their own code:

```ts
export type ButtonKind = 'primary' | 'secondary' | 'danger';
readonly kind = input<ButtonKind>('primary');
```

### 4. Consumers cannot choose `type`

`type="button"` is hard-coded, so `<ui-button>` can never submit a form. Add a `type` input that
defaults to `'button'`. (API-002 looks at a design that avoids wrapping the native element.)

### Fixed version

```ts verify
import { Component, booleanAttribute, input } from '@angular/core';

export type ButtonKind = 'primary' | 'secondary' | 'danger';
export type ButtonType = 'button' | 'submit' | 'reset';

@Component({
  selector: 'ui-button',
  styles: `:host { display: inline-block; }`,
  template: `
    <button
      class="ui-button"
      [class]="'ui-button--' + kind()"
      [type]="type()"
      [disabled]="disabled()">
      <ng-content />
    </button>
  `,
})
export class ButtonComponent {
  readonly kind = input<ButtonKind>('primary');
  readonly type = input<ButtonType>('button');
  readonly disabled = input(false, { transform: booleanAttribute });
}
```

Combining a static `class` with a `[class]` binding is safe: Angular merges them.

### Will consumers notice?

| Change | Effect on existing consumers |
| --- | --- |
| Removing the `click` output | `(click)` keeps working, once. Anyone who called `.click.emit()` on the component directly breaks; that was never documented. |
| `booleanAttribute` on `disabled` | Widens accepted values. Non-breaking. |
| `kind` narrowed to a union | **Technically breaking:** call sites passing other strings stop compiling. Every such call site was already a bug, but it is still a compile failure on upgrade, so call it out in the changelog, or ship it in a major. |
| New `type` input with the old default | Non-breaking. |

## Scoring

| Area | Strong signal | Weak signal |
| --- | --- | --- |
| Native events | Explains why `(click)` fires twice and why disabled leaks | Adds `stopPropagation` in the template |
| Input transforms | Knows `''` reaches the input and uses `booleanAttribute` | Writes `disabled() !== false` by hand |
| Types | Narrows `kind` and exports the type | Validates the string at runtime only |
| Compatibility | Classifies each change for consumers, including the narrowing | Treats all fixes as patches |

## Follow-up questions

1. What other output names would you ban in a component library, and how would you enforce it?
2. A team needs to know *how* the button was activated (mouse, keyboard). Does that justify an
   output?
3. Should `kind` be renamed to `variant` to match the rest of the library? How would you do it
   without breaking anyone (see VER-002)?

## References

- [Angular: Custom events with outputs (choosing event names)](https://angular.dev/guide/components/outputs#choosing-event-names)
- [Angular: Input transforms (`booleanAttribute`, `numberAttribute`)](https://angular.dev/guide/components/inputs#built-in-transformations)
- [Angular style guide](https://angular.dev/style-guide)
- [MDN: `<button>` `type` attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/button#type)

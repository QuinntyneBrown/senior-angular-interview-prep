---
id: API-002
title: A wrapper that hides the native element
topic: component-api
format: discussion
difficulty: staff
minutes: 12
angular: "20+"
tags: [attribute-selectors, directives, native-elements, api-surface]
---

# A wrapper that hides the native element

## Scenario

`@acme/ui` has a text input component. Its backlog has grown to 23 open feature requests, all
similar: "please add `autocomplete`", "add `inputmode`", "add `maxlength`", "expose `(blur)`",
"we need to call `focus()`", "`aria-label` on `<ui-input>` does nothing", "our `<label for>`
doesn't focus it", "it doesn't work with `formControlName`".

```ts verify
import { Component, input, model } from '@angular/core';

@Component({
  selector: 'ui-input',
  template: `
    <input
      class="ui-input"
      [type]="type()"
      [placeholder]="placeholder()"
      [value]="value()"
      (input)="value.set($any($event.target).value)" />
  `,
})
export class InputComponent {
  readonly type = input('text');
  readonly placeholder = input('');
  readonly value = model('');
}
```

```html
<label for="email">Email</label>
<ui-input id="email" aria-label="Email" type="email" [(value)]="email" />
```

## Question

**What is the underlying design problem behind all 23 requests? Propose a different design, and
explain its trade-offs and how you would migrate to it.**

## Hints

<details>
<summary>Hint 1</summary>

Where do `id` and `aria-label` end up in the DOM? Which element has the role, the focus, and the
value?

</details>

<details>
<summary>Hint 2</summary>

Angular Material's buttons and inputs are written `<button mat-button>` and `<input matInput>`.
Why?

</details>

## Answer

### The problem: the component owns the native element

The real `<input>` is hidden inside the component's template, so every native capability (over a
hundred attributes, properties, events and methods) is unavailable unless the library re-exposes it
by hand. Each request is a symptom; adding inputs one by one never ends, and every forwarded
attribute is more API to maintain.

Worse, attributes on the *host* go to the wrong element. `id` and `aria-label` land on
`<ui-input>`, which has no role and cannot take focus. `<label for="email">` points at the host,
so clicking the label does nothing and the input has no accessible name. `formControlName` has no
value accessor to bind to.

### The alternative: put the library on the native element

Use an **attribute selector**, so the consumer writes the native element and the library enhances
it:

```ts verify
import { Directive, booleanAttribute, input } from '@angular/core';

@Directive({
  selector: 'input[uiInput], textarea[uiInput]',
  host: {
    class: 'ui-input',
    '[class.ui-input--invalid]': 'invalid()',
    '[attr.aria-invalid]': 'invalid() || null',
  },
})
export class InputDirective {
  readonly invalid = input(false, { transform: booleanAttribute });
}
```

```html
<label for="email">Email</label>
<input uiInput id="email" type="email" autocomplete="email" [formControl]="email" />
```

Every native attribute, event and method now works, with no library code: `autocomplete`,
`inputmode`, `(blur)`, `focus()`, `<label for>`, `aria-*`. Angular Forms' built-in value accessors
apply to the native input, so `formControl`, `formControlName` and `ngModel` work too. The library
adds only what it owns: styling hooks and state.

The same applies to buttons and links: `button[uiButton], a[uiButton]` keeps native semantics,
`type`, `disabled` and `href`, and avoids the bugs in API-001.

### Trade-offs

- **No surrounding markup.** `<input>` is a void element: the directive cannot render a label, an
  icon or an error message around it. Those belong to a container component, for example
  `<ui-form-field>` that projects a label, the input, a hint and an error, and connects their ids
  (it can find the directive with `contentChild(InputDirective)`). This is the split Angular
  Material uses between `mat-form-field` and `matInput`.
- **Styles.** A directive has no stylesheet of its own. Styles ship as a global stylesheet or with
  the form-field component, keyed on `.ui-input`.
- **Shared namespace.** Directive inputs sit beside native attributes on the same element. Choose
  names that will not collide with future HTML attributes, or prefix them.
- **Less control.** Consumers can now put any attribute on the input, including ones that conflict
  with the design system. That is usually the right trade for a shared library: the platform's API
  is better documented and more stable than anything the library could write.

### Migration

Replacing `<ui-input>` with `<input uiInput>` is a breaking change for every call site:

1. **Minor:** ship `uiInput` and `<ui-form-field>` alongside the old component, and mark
   `<ui-input>` deprecated in documentation, JSDoc (`@deprecated`, which editors show with a
   strike-through) and the changelog.
2. **Migration:** an `ng update` schematic that rewrites the common patterns, and a list of call
   sites it could not convert.
3. **Next major:** remove `<ui-input>`. Freeze its feature requests in the meantime, so effort goes
   into the replacement.

## Scoring

| Area | Strong signal | Weak signal |
| --- | --- | --- |
| Diagnosis | Identifies hidden native element as the single root cause | Proposes forwarding all attributes generically |
| Design | Proposes an attribute-selector directive and a separate container | Adds the 23 inputs |
| Trade-offs | Names void elements, styling, and namespace collisions | Claims there are no downsides |
| Migration | Runs both designs side by side with deprecation and a schematic | Replaces the component in a minor release |

## Follow-up questions

1. How would `<ui-form-field>` give the input its `aria-describedby` without the consumer writing
   ids by hand?
2. When is wrapping the native element still the better choice?
3. Could `hostDirectives` help share behaviour between `uiInput` and other controls?

## References

- [Angular: Component selectors (attribute selectors)](https://angular.dev/guide/components/selectors)
- [Angular: Attribute directives](https://angular.dev/guide/directives/attribute-directives)
- [Angular Material: Input (`matInput` with `mat-form-field`)](https://material.angular.dev/components/input/overview)
- [Angular: Directive composition API (`hostDirectives`)](https://angular.dev/guide/directives/directive-composition-api)

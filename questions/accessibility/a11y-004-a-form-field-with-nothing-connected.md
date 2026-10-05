---
id: A11Y-004
title: A form field where nothing is connected
topic: accessibility
format: code-review
difficulty: senior
minutes: 10
angular: "20+"
tags: [forms, labels, aria-describedby, aria-invalid, errors]
---

# A form field where nothing is connected

## Scenario

Every form in every Acme product uses this text field from `@acme/ui`. It looks right. A
screen-reader user testing the sign-up form says: "I hear 'edit text, blank' for every field, and
when I submit I don't know what went wrong."

```ts verify
import { Component, input } from '@angular/core';

@Component({
  selector: 'ui-text-field',
  template: `
    <div class="ui-field">
      <span class="ui-field__label">
        {{ label() }}
        @if (required()) {
          <span class="ui-field__required">*</span>
        }
      </span>
      <input class="ui-field__input" [placeholder]="hint()" [class.ui-field__input--error]="!!error()" />
      @if (error()) {
        <span class="ui-field__error">{{ error() }}</span>
      }
    </div>
  `,
})
export class TextFieldComponent {
  readonly label = input.required<string>();
  readonly hint = input('');
  readonly error = input<string | null>(null);
  readonly required = input(false);
}
```

```html
<ui-text-field label="Email" hint="We never share your email" [required]="true" [error]="emailError()" />
```

## Question

**List everything a screen-reader user misses, and fix the component.** The value binding is
covered by another question (API-004); focus on labels, hints, errors and required state.

## Hints

<details>
<summary>Hint 1</summary>

What gives an `<input>` its accessible name? What gives it an accessible *description*?

</details>

<details>
<summary>Hint 2</summary>

An error message appears while the user is still in the field. Will a screen reader say anything?

</details>

## Answer

### 1. The input has no accessible name

The label is a `<span>`, not a `<label>` associated with the input, so the input is announced as
"edit text" with no name. Clicking the label text also does not focus the input, which matters for
users with motor impairments.

**Fix:** a `<label for>` pointing at a per-instance input `id`.

### 2. The hint is a placeholder

Placeholder text disappears as soon as the user types, is often low contrast, and is not reliably
announced as a description. Users with memory or cognitive impairments lose the instruction
exactly when they need it.

**Fix:** render the hint as visible text and reference it with `aria-describedby`.

### 3. Errors are visual only

A red border is not announced, and the error text is not connected to the input. A screen-reader
user hears nothing about the error, now or when they return to the field.

**Fix:**

- `aria-invalid="true"` on the input while there is an error.
- Add the error's `id` to `aria-describedby`, so it is read when the field gets focus.
- Show something besides colour (an icon or the word "Error"), for WCAG 1.4.1.
- To announce an error that appears while the user is in the field, the error container needs to
  be a live region that is **always in the DOM**. A live region inserted together with its text is
  often not announced.

### 4. Required is visual only

The asterisk is read as "star" (or not at all), and the input does not say it is required. Use the
`required` attribute (or `aria-required="true"` if native validation is unwanted) and hide the
asterisk from assistive technology. The form should also explain what the asterisk means.

### 5. Ids must be unique per instance

A sign-up form has many fields. Every `id` the component generates (input, hint, error) must be
unique per instance, or `for` and `aria-describedby` point at the wrong field.

### Fixed version

```ts verify
import { Component, booleanAttribute, computed, input } from '@angular/core';

let nextId = 0;

@Component({
  selector: 'ui-text-field',
  template: `
    <div class="ui-field">
      <label class="ui-field__label" [for]="inputId">
        {{ label() }}
        @if (required()) {
          <span class="ui-field__required" aria-hidden="true">*</span>
        }
      </label>
      @if (hint()) {
        <p class="ui-field__hint" [id]="hintId">{{ hint() }}</p>
      }
      <input
        class="ui-field__input"
        [id]="inputId"
        [required]="required()"
        [attr.aria-invalid]="error() ? true : null"
        [attr.aria-describedby]="describedBy()" />
      <p class="ui-field__error" [id]="errorId" aria-live="polite">
        @if (error(); as message) {
          <span class="ui-field__error-icon" aria-hidden="true">!</span>
          {{ message }}
        }
      </p>
    </div>
  `,
})
export class TextFieldComponent {
  readonly label = input.required<string>();
  readonly hint = input('');
  readonly error = input<string | null>(null);
  readonly required = input(false, { transform: booleanAttribute });

  protected readonly inputId = `ui-text-field-${nextId++}`;
  protected readonly hintId = `${this.inputId}-hint`;
  protected readonly errorId = `${this.inputId}-error`;
  protected readonly describedBy = computed(() => {
    const ids = [this.hint() ? this.hintId : '', this.error() ? this.errorId : ''].filter(id => id !== '');
    return ids.length > 0 ? ids.join(' ') : null;
  });
}
```

The error paragraph is always rendered (empty when there is no error), so the live region exists
before its text changes. It is only referenced from `aria-describedby` while it has content.

### What a strong candidate also mentions

- **When to show errors is a product decision the library must support,** not make. Showing an
  error on the first keystroke is hostile; the usual pattern is after the field is left (touched)
  or after submit. The component receives `error` as an input, which keeps that decision with the
  consumer, and the documentation should recommend a default.
- **On submit,** the form, not the field, should move focus to the first invalid field or to an
  error summary at the top. The library can provide a helper for this.
- **Announcing every keystroke's validation** through the live region is noisy. Debounce the error
  or only set it on blur.
- **`autocomplete`** must be passable to the inner input (`autocomplete="email"`), for WCAG 1.3.5
  (Identify Input Purpose). That is a reason to consider the attribute-selector design in API-002.

## Scoring

| Area | Strong signal | Weak signal |
| --- | --- | --- |
| Name | Uses `<label for>` with a unique id | Adds `aria-label` duplicating the visible label |
| Description | Uses `aria-describedby` for hint and error, only when present | Keeps the placeholder as the hint |
| Errors | Adds `aria-invalid`, a non-colour cue, and a pre-existing live region | Relies on the red border |
| Ownership | Leaves error timing to the consumer and documents a recommended default | Hard-codes validation timing in the field |

## Follow-up questions

1. Why do many screen readers ignore a live region that is inserted at the same time as its text?
2. Should the error be announced politely or assertively? What changes if you get it wrong?
3. How would this component expose the inner input to consumers who need `autocomplete`,
   `inputmode` or `maxlength`?

## References

- [WAI tutorial: Labeling controls](https://www.w3.org/WAI/tutorials/forms/labels/)
- [WAI tutorial: User notifications in forms](https://www.w3.org/WAI/tutorials/forms/notifications/)
- [MDN: `aria-describedby`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-describedby)
- [MDN: `aria-invalid`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-invalid)
- [MDN: ARIA live regions](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Guides/Live_regions)
- [WCAG 2.2: Understanding Error Identification (3.3.1)](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html)

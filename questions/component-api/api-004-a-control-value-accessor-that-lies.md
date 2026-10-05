---
id: API-004
title: A checkbox that makes every form dirty
topic: component-api
format: code-review
difficulty: senior
minutes: 12
angular: "20+"
tags: [forms, ControlValueAccessor, signals, OnPush]
---

# A checkbox that makes every form dirty

## Scenario

`@acme/ui`'s checkbox supports reactive forms. Product teams report four bugs:

1. "After `form.reset()`, our 'You have unsaved changes' banner appears."
2. "`form.patchValue({ terms: true })` doesn't tick the box until something else happens."
3. "`control.disable()` does nothing."
4. "Our 'show errors after the user leaves the field' logic never shows errors for checkboxes."

```ts verify
import { ChangeDetectionStrategy, Component, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'ui-checkbox',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => CheckboxComponent), multi: true },
  ],
  template: `
    <label class="ui-checkbox">
      <input type="checkbox" [checked]="checked" (change)="toggle()" />
      <ng-content />
    </label>
  `,
})
export class CheckboxComponent implements ControlValueAccessor {
  checked = false;
  private onChange: (value: boolean) => void = () => {};

  writeValue(value: boolean): void {
    this.checked = value;
    this.onChange(value);
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(): void {}

  toggle(): void {
    this.checked = !this.checked;
    this.onChange(this.checked);
  }
}
```

## Question

**Match each bug to its cause and fix the component.** Explain the contract between Angular Forms
and a `ControlValueAccessor`: which direction does each method carry data?

## Hints

<details>
<summary>Hint 1</summary>

`writeValue` is the model telling the view. `onChange` is the view telling the model. What happens
when one calls the other?

</details>

<details>
<summary>Hint 2</summary>

Under `OnPush`, what tells Angular to re-render after the forms API calls `writeValue`?

</details>

## Answer

### The contract

| Method | Direction | Meaning |
| --- | --- | --- |
| `writeValue(value)` | Model to view | "The form's value changed; display it." Must **not** report back. |
| `registerOnChange(fn)` | View to model | Call `fn(value)` only when the **user** changes the value. |
| `registerOnTouched(fn)` | View to model | Call `fn()` when the user has interacted and left (usually on blur). |
| `setDisabledState(disabled)` | Model to view | Reflect the control's disabled state. |

### Bug 1: `writeValue` calls `onChange`

`reset()` writes the value to the view, and the component reports it straight back as if the user
had changed it. The forms API treats a view change as user input and marks the control dirty, so
the form is dirty immediately after a reset. It can also cause loops with code that reacts to value
changes.

**Fix:** `writeValue` only updates what is displayed.

### Bug 2: `OnPush` and a plain field

`writeValue` is called by the forms API, outside any template event of this component. Under
`OnPush`, setting a plain field does not mark the component for checking, so the box stays as it
was until something else triggers a check. In a zoneless application it may never update.

**Fix:** hold the state in a signal. Setting a signal read by the template schedules the update.

### Bug 3: no `setDisabledState`

Angular Forms calls `setDisabledState` whenever the control's disabled state changes (and, since
Angular 15, also on initialisation). The method is optional in the interface, so leaving it out
compiles, and disabling does nothing.

### Bug 4: touched is never reported

`registerOnTouched` throws the callback away, so the control never becomes `touched`. Any
"show errors after the user leaves the field" rule never fires.

**Fix:** keep the callback and call it on `blur`.

### Also: `reset()` writes `null`

`form.reset()` with no value writes `null`, which the `boolean` signature hides. `checked = null`
happens to render as unticked, but anything comparing with `=== false` breaks. Accept
`boolean | null` and coerce.

### Fixed version

```ts verify
import { ChangeDetectionStrategy, Component, forwardRef, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'ui-checkbox',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => CheckboxComponent), multi: true },
  ],
  template: `
    <label class="ui-checkbox">
      <input
        type="checkbox"
        [checked]="checked()"
        [disabled]="disabled()"
        (change)="onUserChange($event)"
        (blur)="onTouched()" />
      <ng-content />
    </label>
  `,
})
export class CheckboxComponent implements ControlValueAccessor {
  protected readonly checked = signal(false);
  protected readonly disabled = signal(false);
  private onChange: (value: boolean) => void = () => {};
  protected onTouched: () => void = () => {};

  writeValue(value: boolean | null): void {
    this.checked.set(value === true);
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  protected onUserChange(event: Event): void {
    const value = (event.target as HTMLInputElement).checked;
    this.checked.set(value);
    this.onChange(value);
  }
}
```

The value comes from the native input's `checked` property rather than toggling the stored value,
so the component can never disagree with what the user sees.

### What a strong candidate also mentions

- **Use outside forms.** Some teams do not use Angular Forms. Offering a `checked` `model()` as
  well is useful, but then forms and the model must write the *same* signal, and the documentation
  must say "use one or the other on a given instance".
- **Validators.** `Validators.requiredTrue` works without extra code. A component with built-in
  validation would also provide `NG_VALIDATORS`.
- **Indeterminate state** for "select all" checkboxes is a property (`indeterminate`), not an
  attribute, and needs its own input.
- **Tests that use real forms.** Each bug above is caught by a test that binds a real
  `FormControl` and calls `reset()`, `patchValue()` and `disable()`. Testing the component in
  isolation would miss all four.

## Scoring

| Area | Strong signal | Weak signal |
| --- | --- | --- |
| Contract | States the direction of each method | Treats the CVA methods as interchangeable callbacks |
| Change detection | Uses signals so writes from forms render under OnPush and zoneless | Injects `ChangeDetectorRef` and calls `detectChanges()` everywhere |
| Completeness | Implements disabled and touched | Fixes only the reported dirty bug |
| Testing | Proposes tests with a real `FormControl` | Unit-tests the methods directly |

## Follow-up questions

1. Why does `onChange` during `writeValue` mark the control dirty? Which flag does the forms API set?
2. How would you build a `ui-radio-group` that works with `formControlName` on the group?
3. What changes if the application uses Angular's signal-based forms instead of reactive forms?

## References

- [Angular API: `ControlValueAccessor`](https://angular.dev/api/forms/ControlValueAccessor)
- [Angular: Reactive forms](https://angular.dev/guide/forms/reactive-forms)
- [Angular: Skipping component subtrees (OnPush)](https://angular.dev/best-practices/skipping-subtrees)
- [MDN: `HTMLInputElement.indeterminate`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/indeterminate)

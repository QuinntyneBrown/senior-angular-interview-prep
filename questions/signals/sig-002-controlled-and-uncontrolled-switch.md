---
id: SIG-002
title: A switch that ignores its parent
topic: signals
format: code-review
difficulty: senior
minutes: 10
angular: "20+"
tags: [model, input, output, two-way-binding]
---

# A switch that ignores its parent

## Scenario

A product team reports a bug against `@acme/ui`: "When we reset our settings form, the switches
still show the old values." Here is the switch component they are using:

```ts verify
import { Component, OnInit, input, output, signal } from '@angular/core';

@Component({
  selector: 'ui-switch',
  template: `
    <button type="button" role="switch" [attr.aria-checked]="isOn()" (click)="flip()">
      <ng-content />
    </button>
  `,
})
export class SwitchComponent implements OnInit {
  readonly checked = input(false);
  readonly checkedChange = output<boolean>();
  protected readonly isOn = signal(false);

  ngOnInit(): void {
    this.isOn.set(this.checked());
  }

  flip(): void {
    this.isOn.set(!this.isOn());
    this.checkedChange.emit(this.isOn());
  }
}
```

The team uses it like this:

```html
<ui-switch [(checked)]="settings.emailAlerts">Email alerts</ui-switch>
<button type="button" (click)="settings.emailAlerts = false">Reset</button>
```

## Question

**Why does the reset not work? Fix the component, then tell me what other problems a consumer
could run into with your fixed version.**

## Hints

<details>
<summary>Hint 1</summary>

How many places hold "is the switch on?", and when does each one change?

</details>

<details>
<summary>Hint 2</summary>

Angular only writes to an input when the bound value is different from the last value it wrote.
What happens if the parent decides *not* to accept a change?

</details>

## Answer

### 1. Two sources of truth, synchronised once

`isOn` copies `checked` once, in `ngOnInit`. After that the component ignores its input. Reset
changes `settings.emailAlerts`, Angular passes the new value to `checked`, and nothing reads it:
the switch keeps showing `isOn`.

The pattern "copy an input into local state" is the root cause, and it is common in libraries
because the component needs to change the value itself *and* accept changes from outside.

**Fix:** `model()`. A model is a writable signal that is also an input and an output. The parent
writes it through the binding, the component writes it with `set` or `update`, and every write
from inside emits `checkedChange`, so `[(checked)]` works with no extra code. There is only one
value.

```ts verify
import { Component, model } from '@angular/core';

@Component({
  selector: 'ui-switch',
  template: `
    <button type="button" role="switch" [attr.aria-checked]="checked()" (click)="flip()">
      <ng-content />
    </button>
  `,
})
export class SwitchComponent {
  readonly checked = model(false);

  flip(): void {
    this.checked.update(on => !on);
  }
}
```

This is also non-breaking for consumers: the public names `checked` and `checkedChange` are
unchanged.

### 2. A rejected change leaves the switch out of sync

This is the problem with the fixed version that strong candidates find. Suppose a consumer binds
one way and decides in the handler whether to accept the change:

```html
<ui-switch [checked]="allowed" (checkedChange)="request($event)">Share data</ui-switch>
```

The user clicks. The model flips itself to `true` and emits. The parent refuses and leaves
`allowed` as `false`. Angular only writes an input when the bound value changes, and `allowed` was
`false` before and is still `false`, so nothing is written back. The switch shows "on" while the
application believes it is "off".

There is no single right answer, but a library must pick one and document it:

- **Document `[(checked)]` as the supported pattern.** Consumers who need to veto a change bind a
  signal two ways and set it back explicitly.
- **Offer a separate request output** (for example `checkedChangeRequest`) and a strictly
  controlled mode where the component never changes its own value.

### 3. `<ui-switch checked>` does not work

Consumers expect HTML-like boolean attributes. A plain `input(false)` would need the
`booleanAttribute` transform for `<ui-switch checked>` to mean `true`, but **`model()` does not
accept a `transform`**. With strict templates the static attribute is a type error (a string `''`
is not a `boolean`), which is at least caught at build time. Document `[checked]="true"`.

### What a strong candidate also mentions

- **A disabled state.** A switch with no `disabled` input forces consumers to wrap it or block
  clicks themselves. Use the native `disabled` attribute on the `<button>`, so it leaves the tab
  order and assistive technology reports it.
- **Forms.** Teams using reactive forms need a `ControlValueAccessor` as well (see API-004). The
  model and the form value must not become two sources of truth again.
- **The accessible name.** It comes from the projected content. A switch with no projected text
  needs an `aria-label` input, and the documentation must say so.

## Scoring

| Area | Strong signal | Weak signal |
| --- | --- | --- |
| Diagnosis | Names "two sources of truth, copied once" as the root cause | Moves the copy to `ngOnChanges` and keeps both values |
| Signals API | Uses `model()` and knows it creates `checkedChange` | Hand-writes input, output and an `effect` to sync them |
| Edge cases | Finds the rejected-change case, or the missing `transform` on `model()` | Stops once the reset works |
| Consumer view | Checks the public names are unchanged and plans documentation | Renames the API while fixing the bug |

## Follow-up questions

1. Would moving the copy into `ngOnChanges` have fixed the reset bug? What would still be wrong?
2. How would you write a test that proves the rejected-change behaviour you chose?
3. When would you choose `input()` plus `output()` over `model()`, even for a value the component
   can change itself?

## References

- [Angular: Two-way binding with model inputs](https://angular.dev/guide/components/inputs#model-inputs)
- [Angular: Input transforms and `booleanAttribute`](https://angular.dev/guide/components/inputs#input-transforms)
- [WAI-ARIA APG: Switch pattern](https://www.w3.org/WAI/ARIA/apg/patterns/switch/)

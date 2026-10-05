---
id: SIG-001
title: Selection state that drifts from its inputs
topic: signals
format: code-review
difficulty: senior
minutes: 10
angular: "20+"
tags: [linkedSignal, effect, input, immutability]
---

# Selection state that drifts from its inputs

## Scenario

You maintain `@acme/ui`, the component library that every Acme product team builds on. A
teammate opens a pull request for a new multi-select chip group. Product teams pass the options in,
and some options arrive pre-selected.

```ts verify
import { Component, computed, effect, input, output, signal } from '@angular/core';

export interface ChipOption {
  value: string;
  label: string;
  selected?: boolean;
}

@Component({
  selector: 'ui-chip-group',
  template: `
    @for (option of options(); track option.value) {
      <button
        type="button"
        class="ui-chip"
        [attr.aria-pressed]="selectedSet().has(option.value)"
        (click)="toggle(option.value)">
        {{ option.label }}
      </button>
    }
  `,
})
export class ChipGroupComponent {
  readonly options = input<ChipOption[]>([]);
  readonly selectionChange = output<string[]>();

  readonly selected = signal<string[]>(
    this.options().filter(option => option.selected).map(option => option.value),
  );
  readonly selectedSet = computed(() => new Set(this.selected()));

  constructor() {
    // Drop selections whose option no longer exists.
    effect(() => {
      const values = this.options().map(option => option.value);
      this.selected.set(this.selected().filter(value => values.includes(value)));
    });
  }

  toggle(value: string): void {
    this.selected.update(list => {
      const index = list.indexOf(value);
      if (index === -1) list.push(value);
      else list.splice(index, 1);
      return list;
    });
    this.selectionChange.emit(this.selected());
  }
}
```

## Question

**What problems do you see, and how would you fix each one?** There are at least three. One of
them freezes the page as soon as the component renders.

## Hints

<details>
<summary>Hint 1</summary>

When does a field initializer run, compared with when Angular sets inputs?

</details>

<details>
<summary>Hint 2</summary>

A signal decides whether it changed by comparing the old and new values with `Object.is`. What
does `toggle` return from `update`, and what does the effect write?

</details>

## Answer

### 1. The initial selection is read before the input has a value

Field initializers run inside the constructor, before Angular has set any input. `this.options()`
returns the default, `[]`, so the initial selection is always empty. Options the consumer marks
`selected: true` never appear selected, and nothing reports an error.

If someone later makes the input required to "fix" it, the same line fails louder: reading a
required input before it is set throws `NG0950` at runtime, and recent Angular compilers reject
it at build time with `NG8118`.

**Fix:** never read an input during construction. Derive the initial selection from the input
reactively (see issue 3).

### 2. `toggle` mutates the array, so nothing updates

`update` returns the *same* array it was given. Signals compare values with `Object.is`, so the
signal sees no change and notifies nobody. `selectedSet` keeps its cached value, `aria-pressed`
never changes, and the screen is out of step with the state.

There is a second problem in the same lines: `selectionChange` emits the internal array. A consumer
that sorts or pushes into the array it receives corrupts the component's state.

**Fix:** return a new array from `update`, and type public arrays as `readonly` so consumers cannot
mutate what they receive:

```ts
this.selected.update(list =>
  list.includes(value) ? list.filter(v => v !== value) : [...list, value],
);
```

### 3. The `effect` never stops running

The effect reads `selected()` and writes `selected` with the result of `filter`, which is always a
**new** array. Writing a new value to a signal the effect depends on schedules the effect again, so
it runs forever and the page freezes as soon as the component renders. (This is easy to miss in
review because each line looks reasonable.)

Even without the loop, copying one signal into another is the job of a derived signal, not an
effect:

- Effects run on their own schedule, so other code (a `computed`, a parent's binding) can briefly
  read selections that point at options that no longer exist.
- Writing signals inside effects makes the data flow hard to follow, and loops like this one are
  easy to create.

**Fix:** `linkedSignal`. It is writable, like `signal`, but it recalculates whenever its source
changes, and it receives the previous value so it can keep selections that are still valid.

### Fixed version

```ts verify
import { Component, computed, input, linkedSignal, output } from '@angular/core';

export interface ChipOption {
  value: string;
  label: string;
  selected?: boolean;
}

@Component({
  selector: 'ui-chip-group',
  host: { role: 'group' },
  template: `
    @for (option of options(); track option.value) {
      <button
        type="button"
        class="ui-chip"
        [attr.aria-pressed]="selectedSet().has(option.value)"
        (click)="toggle(option.value)">
        {{ option.label }}
      </button>
    }
  `,
})
export class ChipGroupComponent {
  readonly options = input.required<readonly ChipOption[]>();
  readonly selectionChange = output<readonly string[]>();

  readonly selected = linkedSignal<readonly ChipOption[], readonly string[]>({
    source: this.options,
    computation: (options, previous) => {
      if (!previous) {
        return options.filter(option => option.selected).map(option => option.value);
      }
      const values = new Set(options.map(option => option.value));
      return previous.value.filter(value => values.has(value));
    },
  });
  readonly selectedSet = computed(() => new Set(this.selected()));

  toggle(value: string): void {
    this.selected.update(list =>
      list.includes(value) ? list.filter(v => v !== value) : [...list, value],
    );
    this.selectionChange.emit(this.selected());
  }
}
```

### What a strong candidate also mentions

- **The group needs an accessible name.** `role="group"` is announced, but without `aria-label` or
  `aria-labelledby` a screen-reader user hears "group" and nothing else. Add an input for the label.
- **Pruning is a behaviour change consumers must know about.** When options change and a selection
  disappears, the fixed version does not emit `selectionChange`. That is a deliberate choice
  (outputs report user actions), and it must be documented, because a consumer storing the
  selection elsewhere will now hold a stale value.
- **Controlled use.** Consumers cannot set the selection after the first render. A `model()` makes
  the component usable both controlled and uncontrolled (see SIG-002).

## Scoring

| Area | Strong signal | Weak signal |
| --- | --- | --- |
| Construction order | Spots the input read in a field initializer and explains why it sees only the default | Assumes inputs exist in the constructor |
| Signal equality | Explains that `Object.is` sees the same reference, so nothing notifies | Says "signals are reactive" without explaining why this one is not |
| Derived state | Spots the self-triggering effect and replaces it with `linkedSignal` | Keeps the effect, or wraps the read in `untracked` and keeps syncing |
| Library thinking | Uses `readonly` types, and raises documentation of the pruning behaviour | Treats it as application code with one caller |

## Follow-up questions

1. When *is* an `effect` the right tool in a library component? Give one example.
2. `linkedSignal` resets when its source changes. What happens if a consumer passes a new array
   with the same options on every change detection, for example `[options]="getOptions()"`? How
   would you protect against it?
3. Should `selectionChange` fire when pruning removes a selection? Argue both sides.

## References

- [Angular: Signals overview](https://angular.dev/guide/signals)
- [Angular: Dependent state with `linkedSignal`](https://angular.dev/guide/signals/linked-signal)
- [Angular: Accepting data with input properties](https://angular.dev/guide/components/inputs)
- [Angular error NG0950: Required input accessed before a value is set](https://angular.dev/errors/NG0950)
- [WAI-ARIA APG: Button pattern (toggle buttons)](https://www.w3.org/WAI/ARIA/apg/patterns/button/)

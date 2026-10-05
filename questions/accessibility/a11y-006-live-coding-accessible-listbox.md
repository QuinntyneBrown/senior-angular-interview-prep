---
id: A11Y-006
title: "Live coding: build an accessible listbox"
topic: accessibility
format: live-coding
difficulty: senior
minutes: 40
angular: "20+"
tags: [live-coding, listbox, aria-activedescendant, keyboard, signals, design-tokens]
---

# Live coding: build an accessible listbox

## Scenario

`@acme/ui` needs a single-select listbox. It will be used on its own (for example, choosing a
shipping method) and later inside a select and a combobox, so it must be correct, accessible, and
easy for product teams to understand.

You have 40 minutes. Talk through your decisions as you go. The interviewer cares more about the
order you tackle things in and the reasons you give than about finishing every step.

Starting point:

```ts verify
import { Component, input, model } from '@angular/core';

export interface ListboxOption<T> {
  value: T;
  label: string;
  disabled?: boolean;
}

@Component({
  selector: 'ui-listbox',
  template: `
    <!-- TODO -->
  `,
})
export class ListboxComponent<T> {
  readonly options = input.required<readonly ListboxOption<T>[]>();
  readonly value = model<T | null>(null);
}
```

```html
<ui-listbox label="Shipping method" [options]="shippingOptions" [(value)]="shipping" />
```

## Question

Work through these steps in order. Each builds on the last.

1. **Render and select (5 min).** Show the options; clicking an enabled option selects it and
   updates `value`.
2. **Semantics (5 min).** Make a screen reader announce it as a listbox with a name, and announce
   each option and whether it is selected or disabled.
3. **Keyboard (12 min).** Tab moves focus to the listbox. Up and Down move the active option,
   skipping disabled ones; Home and End jump; Enter and Space select. Screen readers must announce
   the active option. Explain why you chose `aria-activedescendant` or a roving `tabindex`.
4. **Type-ahead (5 min).** Typing letters moves to the next matching option.
5. **Styling with tokens (5 min).** Show active, selected, disabled and focus states using only
   design tokens, and keep them visible in forced-colors mode.
6. **Discussion (8 min).** How would this work with reactive forms? With object values? How would
   you test it, and what would you give product teams for their tests?

## Hints

<details>
<summary>Hint for step 3</summary>

With `aria-activedescendant`, DOM focus stays on the listbox, and the attribute points at the id
of the active option. Ids must be unique per instance.

</details>

<details>
<summary>Hint for step 3, edge cases</summary>

What is active when the listbox first receives focus? What if every option is disabled? What if
the options change while one is active?

</details>

## Answer

### Reference solution (steps 1 to 4)

```ts verify
import {
  Component,
  DestroyRef,
  ElementRef,
  afterRenderEffect,
  computed,
  inject,
  input,
  linkedSignal,
  model,
  viewChildren,
} from '@angular/core';

export interface ListboxOption<T> {
  value: T;
  label: string;
  disabled?: boolean;
}

let nextId = 0;

@Component({
  selector: 'ui-listbox',
  template: `
    <ul
      class="ui-listbox"
      role="listbox"
      tabindex="0"
      [attr.aria-label]="label()"
      [attr.aria-activedescendant]="activeId()"
      (keydown)="onKeydown($event)">
      @for (option of options(); track option; let i = $index) {
        <li
          #optionElement
          class="ui-listbox__option"
          role="option"
          [id]="optionId(i)"
          [class.ui-listbox__option--active]="i === activeIndex()"
          [attr.aria-selected]="isSelected(option)"
          [attr.aria-disabled]="option.disabled || null"
          (click)="choose(i)">
          {{ option.label }}
        </li>
      }
    </ul>
  `,
})
export class ListboxComponent<T> {
  readonly options = input.required<readonly ListboxOption<T>[]>();
  readonly label = input.required<string>();
  readonly value = model<T | null>(null);
  readonly compareWith = input<(a: T, b: T) => boolean>(Object.is);

  private readonly baseId = `ui-listbox-${nextId++}`;
  private readonly optionElements = viewChildren<ElementRef<HTMLElement>>('optionElement');

  /** The keyboard position: the selected option if enabled, else the first enabled one, else -1. */
  protected readonly activeIndex = linkedSignal(() => {
    const options = this.options();
    const value = this.value();
    const compare = this.compareWith();
    const selected = value === null ? -1 : options.findIndex(option => compare(option.value, value));
    return selected !== -1 && !options[selected].disabled ? selected : options.findIndex(option => !option.disabled);
  });

  protected readonly activeId = computed(() => {
    const index = this.activeIndex();
    return index === -1 ? null : this.optionId(index);
  });

  private typed = '';
  private typedTimer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.typedTimer));

    // Keep the active option visible when it moves by keyboard.
    afterRenderEffect(() => {
      const element = this.optionElements()[this.activeIndex()]?.nativeElement;
      element?.scrollIntoView({ block: 'nearest' });
    });
  }

  protected optionId(index: number): string {
    return `${this.baseId}-option-${index}`;
  }

  protected isSelected(option: ListboxOption<T>): boolean {
    const value = this.value();
    return value !== null && this.compareWith()(option.value, value);
  }

  protected choose(index: number): void {
    const option = this.options()[index];
    if (!option || option.disabled) return;
    this.value.set(option.value);
    this.activeIndex.set(index);
  }

  protected onKeydown(event: KeyboardEvent): void {
    const enabled = this.enabledIndexes();
    if (enabled.length === 0) return;
    const position = enabled.indexOf(this.activeIndex());
    let next: number;
    switch (event.key) {
      case 'ArrowDown':
        next = enabled[Math.min(position + 1, enabled.length - 1)];
        break;
      case 'ArrowUp':
        next = enabled[Math.max(position - 1, 0)];
        break;
      case 'Home':
        next = enabled[0];
        break;
      case 'End':
        next = enabled[enabled.length - 1];
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.choose(this.activeIndex());
        return;
      default:
        this.typeahead(event);
        return;
    }
    event.preventDefault();
    this.activeIndex.set(next);
  }

  private enabledIndexes(): number[] {
    return this.options().flatMap((option, index) => (option.disabled ? [] : [index]));
  }

  private typeahead(event: KeyboardEvent): void {
    if (event.key.length !== 1 || event.ctrlKey || event.metaKey || event.altKey) return;
    clearTimeout(this.typedTimer);
    this.typed += event.key.toLocaleLowerCase();
    this.typedTimer = setTimeout(() => (this.typed = ''), 500);

    // A single letter searches from the next option, so repeated presses cycle through matches.
    // A longer string searches from the active option, so "ca" can stay on "Canada".
    const options = this.options();
    const count = options.length;
    const offset = this.typed.length === 1 ? 1 : 0;
    for (let step = 0; step < count; step++) {
      const index = (((this.activeIndex() + offset + step) % count) + count) % count;
      const option = options[index];
      if (!option.disabled && option.label.toLocaleLowerCase().startsWith(this.typed)) {
        this.activeIndex.set(index);
        return;
      }
    }
  }
}
```

### Step-by-step notes

**Step 1.** `value` is a `model()`, so `[(value)]` works and selection is one signal. Options are
`readonly` and never mutated (see SIG-004). `track option` uses object identity, which is correct
here because options carry no per-row state.

**Step 2.** `role="listbox"` with `aria-label`, `role="option"` with `aria-selected`, and
`aria-disabled` on disabled options. Disabled options stay visible and announced, which helps users
understand what is unavailable. `label` is a required input, so a nameless listbox does not compile.

**Step 3.** `aria-activedescendant` keeps DOM focus on the listbox and tells assistive technology
which option is active. It fits a listbox well, and it is the pattern a combobox needs later, where
focus must stay in the text input. A roving `tabindex` (focus moves to each option) is also valid
for a standalone listbox, and the candidate should be able to say so.

Edge cases a strong candidate handles:

- **First focus:** the active option is the selected one, or the first enabled one. A selected
  option that later becomes disabled is not made active.
- **All options disabled:** `activeIndex` is `-1`, `aria-activedescendant` is removed, and the
  keyboard does nothing.
- **Options change:** `linkedSignal` recomputes the active option from the new options, so it
  never points past the end of the list.
- **Unique ids:** derived from a per-instance counter, never from the index alone.
- **Scrolling:** the active option is scrolled into view after rendering, with
  `afterRenderEffect`.

**Step 4.** Type-ahead buffers keystrokes for 500 ms, ignores modifier shortcuts, skips disabled
options and wraps around. The timer is cleared on destroy.

### Step 5: styles using only tokens

These go in the component's stylesheet.

```css
.ui-listbox {
  list-style: none;
  margin: 0;
  padding: var(--ui-space-1);
  max-height: var(--ui-listbox-max-height, 16rem);
  overflow-y: auto;
  border: 1px solid var(--ui-color-border);
  border-radius: var(--ui-radius-control);
  background: var(--ui-color-surface);
  color: var(--ui-color-on-surface);
}

.ui-listbox:focus-visible {
  outline: var(--ui-focus-ring-width) solid var(--ui-color-focus-ring);
  outline-offset: var(--ui-focus-ring-offset);
}

.ui-listbox__option {
  display: flex;
  gap: var(--ui-space-2);
  padding: var(--ui-space-2) var(--ui-space-3);
  border-radius: var(--ui-radius-control);
  outline: 1px solid transparent;
  cursor: pointer;
}

.ui-listbox:focus-visible .ui-listbox__option--active {
  background: var(--ui-color-surface-hover);
  outline-color: var(--ui-color-focus-ring);
}

.ui-listbox__option[aria-selected='true'] {
  font-weight: var(--ui-font-weight-strong);
}

.ui-listbox__option[aria-selected='true']::after {
  content: '✓' / '';
  margin-inline-start: auto;
}

.ui-listbox__option[aria-disabled='true'] {
  color: var(--ui-color-on-surface-disabled);
  cursor: not-allowed;
}

@media (forced-colors: active) {
  .ui-listbox:focus-visible .ui-listbox__option--active {
    outline-color: Highlight;
  }

  .ui-listbox__option[aria-disabled='true'] {
    color: GrayText;
  }
}
```

States are styled from the ARIA attributes, so the visual state and the announced state cannot
disagree. Selection shows a check mark as well as weight, so it does not depend on colour. The
active option uses an outline, which forced-colors mode keeps.

### Step 6: discussion points

- **Forms:** implement `ControlValueAccessor` writing the same `value` signal, following the
  contract in API-004 (`writeValue` never calls `onChange`; touched on blur; disabled state).
- **Object values:** `compareWith` lets teams pass objects that are equal but not identical, such
  as options rebuilt after a fetch.
- **Tests:** a host component with real options, keyboard interactions from the APG keyboard table,
  two instances on one page for id uniqueness, and axe in a real browser.
- **For product teams:** a `ListboxHarness` with `selectOption`, `getSelectedOptionLabel` and
  `pressKey`, published from a testing entry point (see TST-001).

## Scoring

| Area | Strong signal | Weak signal |
| --- | --- | --- |
| Order of work | Gets semantics and keyboard right before styling and extras | Spends the first 15 minutes on CSS |
| Accessibility | Correct roles, states, name and `aria-activedescendant`, and explains the choice | `div`s with click handlers and arrow keys only |
| Edge cases | Handles disabled options, empty or all-disabled lists, changing options, unique ids | Assumes a fixed list with no disabled items |
| Signals | `model` for value, `linkedSignal` for active option, no syncing effects | Copies inputs into local state |
| Tokens | Uses only tokens, styles from ARIA attributes, keeps forced colors working | Hard-codes colours |
| Communication | Narrates trade-offs and what is left undone | Codes silently |

## Follow-up questions

1. How would you extend this to multiple selection? What changes in ARIA and keyboard behaviour?
2. The list has 10,000 options. What breaks, and how would virtual scrolling interact with
   `aria-activedescendant`?
3. How would you build a select (a button that opens this listbox in a popup) on top of it?

## References

- [WAI-ARIA APG: Listbox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/listbox/)
- [WAI-ARIA APG: Managing focus with `aria-activedescendant`](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/#kbd_focus_activedescendant)
- [MDN: `aria-activedescendant`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-activedescendant)
- [Angular: Dependent state with `linkedSignal`](https://angular.dev/guide/signals/linked-signal)
- [Angular CDK: Listbox](https://material.angular.dev/cdk/listbox/overview)

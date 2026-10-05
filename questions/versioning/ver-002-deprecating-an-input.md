---
id: VER-002
title: A deprecation that warns everyone and honours nobody
topic: versioning
format: code-review
difficulty: senior
minutes: 12
angular: "20+"
tags: [deprecation, inputs, dev-mode, migrations]
---

# A deprecation that warns everyone and honours nobody

## Scenario

`@acme/ui` is renaming the button's `kind` input to `variant`, to match every other component. The
pull request is meant to ship in a minor release, keep `kind` working, and warn teams that still
use it.

```ts verify
import { Component, computed, input, isDevMode } from '@angular/core';

export type ButtonVariant = 'primary' | 'secondary' | 'danger';

@Component({
  selector: 'ui-button',
  template: `
    <button type="button" [class]="'ui-button ui-button--' + resolvedVariant()">
      <ng-content />
    </button>
  `,
})
export class ButtonComponent {
  /** @deprecated Use `variant` instead. */
  readonly kind = input<ButtonVariant>('primary');
  readonly variant = input<ButtonVariant>('primary');

  protected readonly resolvedVariant = computed(() => {
    if (isDevMode()) {
      console.warn('ui-button: `kind` is deprecated, use `variant`.');
    }
    return this.kind() !== 'primary' ? this.kind() : this.variant();
  });
}
```

## Question

**Review the pull request. Which consumers get the wrong result, who sees the warning, and how
would you ship this rename end to end?**

## Hints

<details>
<summary>Hint 1</summary>

Write out the result for `<ui-button variant="danger" kind="secondary">` and for
`<ui-button kind="primary" variant="danger">`. Can the component tell "set to `primary`" from "not
set"?

</details>

<details>
<summary>Hint 2</summary>

When does a `computed` re-run, and is logging a side effect?

</details>

## Answer

### 1. Precedence is wrong, and "not set" is invisible

Both inputs default to `'primary'`, so the component cannot tell "the consumer did not set `kind`"
from "the consumer set `kind="primary"`". The rule `kind() !== 'primary' ? kind() : variant()`
then gives the deprecated name priority whenever it holds a non-default value:

| Template | Expected | Actual |
| --- | --- | --- |
| `variant="danger" kind="secondary"` | `danger` (new name wins) | `secondary` |
| `kind="primary" variant="danger"` | `danger` | `danger` |
| `kind="danger"` | `danger` | `danger` |

A team halfway through migrating, with both attributes on some buttons, gets the old value.

**Fix:** default both to `undefined`, so "not set" is observable, and resolve in one direction:
`variant() ?? kind() ?? 'primary'`. The new name always wins.

### 2. The warning goes to everyone, repeatedly

The warning sits inside a `computed`, which has two problems:

- It does not check whether `kind` was used at all, so every button in every application logs it,
  including teams that already migrated.
- `computed` functions should be pure. This one logs each time it recomputes, so one page can log
  dozens of identical lines. Teams learn to ignore the console, and miss the warnings that matter.

**Fix:** log in development mode only, only when `kind` is actually set, and once. Include the
element so developers can find the call site.

### 3. The rest of the rollout is missing

A deprecation is a process, not an annotation:

- **Documentation and changelog:** a "Deprecations" section naming the old input, the replacement,
  and the major version that removes it.
- **`@deprecated` JSDoc** (kept from the PR), which editors and linters can surface.
- **An `ng update` migration** for the next major that rewrites `kind=` and `[kind]=` to `variant`
  in templates, and reports anything it cannot rewrite (for example `setInput('kind', ...)`).
- **Tests** for every row of the table above, and for "warns once, only when `kind` is set".
- **Removal in the next major**, listed under breaking changes.

### Fixed version

```ts verify
import { Component, ElementRef, computed, effect, inject, input, isDevMode } from '@angular/core';

export type ButtonVariant = 'primary' | 'secondary' | 'danger';

let warnedAboutKind = false;

@Component({
  selector: 'ui-button',
  template: `
    <button type="button" [class]="'ui-button ui-button--' + resolvedVariant()">
      <ng-content />
    </button>
  `,
})
export class ButtonComponent {
  /** @deprecated Use `variant` instead. `kind` will be removed in v5.0.0. */
  readonly kind = input<ButtonVariant>();
  readonly variant = input<ButtonVariant>();

  protected readonly resolvedVariant = computed(() => this.variant() ?? this.kind() ?? 'primary');

  constructor() {
    if (isDevMode()) {
      const host = inject(ElementRef).nativeElement;
      effect(() => {
        if (this.kind() === undefined || warnedAboutKind) return;
        warnedAboutKind = true;
        console.warn('ui-button: the `kind` input is deprecated and will be removed in v5.0.0. Use `variant`.', host);
      });
    }
  }
}
```

Notes:

- The logging is in an `effect`, which is where side effects belong, and only exists in
  development mode.
- `warnedAboutKind` is module-level, so an application logs the warning once, not once per button.
- Changing the default from `'primary'` to `undefined` is invisible to consumers: the resolved
  variant is still `'primary'` when nothing is set. Code reading `button.kind()` from a component
  reference would now see `undefined`; mention it in the changelog.

## Scoring

| Area | Strong signal | Weak signal |
| --- | --- | --- |
| Precedence | Finds that defaults hide "not set", and makes the new name win | Tests only the single-attribute cases |
| Warning | Warns once, in dev mode, only when used, from an effect | Leaves the warning in the computed |
| Process | Docs, changelog, `ng update` migration, removal plan | Considers the `@deprecated` tag sufficient |
| Tests | Lists the combination cases and the warning behaviour | "Add a test" without specifics |

## Follow-up questions

1. Could `input({ alias: 'kind' })` solve this with one input? Why not?
2. How would your `ng update` migration find `kind` used through `setInput` or a host directive?
3. How do you know when it is safe to remove `kind`? What data would you collect?

## References

- [Angular: Accepting data with input properties](https://angular.dev/guide/components/inputs)
- [Angular API: `isDevMode`](https://angular.dev/api/core/isDevMode)
- [Angular: Effects](https://angular.dev/guide/signals/effect)
- [Angular CLI: Schematics for libraries (`ng update`)](https://angular.dev/tools/cli/schematics-for-libraries)
- [TypeScript: JSDoc `@deprecated`](https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html#deprecated)

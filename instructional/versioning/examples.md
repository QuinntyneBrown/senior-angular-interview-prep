# Complete source examples

These marked complete modules are copied from the source questions. Scenario modules intentionally contain behavioral defects. Other slide excerpts are partial, including test pseudocode and package-layout sketches. Supplemental corrected modules are documented separately.

## VER-001 · Scenario · excerpt 1

Source excerpt; markup, styles, package sketches, and test fragments may require the surrounding context.

```ts
// Today (4.6.0), simplified
export interface SelectOption { value: string; label: string; }

@Component({ selector: 'ui-select', /* ... */ })
export class SelectComponent {
  readonly options = input.required<SelectOption[]>();
  readonly size = input<string>('medium');
  readonly value = input<SelectOption>();
  readonly selectionChange = output<SelectOption>();
}

```

## VER-002 · Scenario · excerpt 2

Complete verified TypeScript module.

```ts
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

## VER-002 · Answer · excerpt 3

Complete verified TypeScript module.

```ts
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

## VER-003 · Scenario · excerpt 4

Source excerpt; markup, styles, package sketches, and test fragments may require the surrounding context.

```json
{
  "name": "@acme/ui",
  "version": "4.6.0",
  "dependencies": {
    "@angular/cdk": "^20.0.0",
    "@angular/common": "^20.0.0",
    "@angular/core": "^20.0.0",
    "date-fns": "^4.1.0",
    "tslib": "^2.6.0"
  }
}

```

## VER-003 · Scenario · excerpt 5

Source excerpt; markup, styles, package sketches, and test fragments may require the surrounding context.

```ts
// projects/ui/src/public-api.ts
export * from './lib/button/button.component';
export * from './lib/select/select.component';
export * from './lib/select/select-option-row.component';
export * from './lib/date-picker/date-picker.component';
export * from './lib/internal/dom-utils';

```

## VER-003 · Answer · excerpt 6

Source excerpt; markup, styles, package sketches, and test fragments may require the surrounding context.

```json
{
  "name": "@acme/ui",
  "version": "5.0.0",
  "peerDependencies": {
    "@angular/cdk": "^20.0.0",
    "@angular/common": "^20.0.0",
    "@angular/core": "^20.0.0",
    "date-fns": "^4.1.0"
  },
  "peerDependenciesMeta": {
    "date-fns": { "optional": true }
  },
  "dependencies": {
    "tslib": "^2.6.0"
  },
  "sideEffects": false
}

```

## VER-003 · Answer · excerpt 7

Source excerpt; markup, styles, package sketches, and test fragments may require the surrounding context.

```ts
// projects/ui/button/src/public-api.ts
export { ButtonComponent } from './button.component';
export type { ButtonVariant } from './button-variant';

```

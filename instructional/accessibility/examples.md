# Complete source examples

These marked complete modules are copied from the source questions. Scenario modules intentionally contain behavioral defects. Other slide excerpts are partial, including test pseudocode and package-layout sketches. Supplemental corrected modules are documented separately.

## A11Y-001 · Scenario · excerpt 1

Complete verified TypeScript module.

```ts
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

## A11Y-001 · Scenario · excerpt 2

Source excerpt; markup, styles, package sketches, and test fragments may require the surrounding context.

```html
<ui-icon-button icon="more_vert" title="More actions" (pressed)="openMenu()" />

```

## A11Y-001 · Answer · excerpt 3

Complete verified TypeScript module.

```ts
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

## A11Y-002 · Scenario · excerpt 4

Complete verified TypeScript module.

```ts
import { Component, input, model } from '@angular/core';

@Component({
  selector: 'ui-dialog',
  template: `
    @if (open()) {
      <div class="ui-dialog__backdrop" (click)="open.set(false)"></div>
      <div class="ui-dialog" role="dialog">
        <h2 class="ui-dialog__title">{{ heading() }}</h2>
        <ng-content />
        <span class="ui-dialog__close" (click)="open.set(false)">×</span>
      </div>
    }
  `,
})
export class DialogComponent {
  readonly open = model(false);
  readonly heading = input.required<string>();
}

```

## A11Y-002 · Answer · excerpt 5

Complete verified TypeScript module.

```ts
import {
  Component,
  DOCUMENT,
  ElementRef,
  afterRenderEffect,
  inject,
  input,
  model,
  viewChild,
} from '@angular/core';

let nextId = 0;

@Component({
  selector: 'ui-dialog',
  template: `
    <dialog
      #dialog
      class="ui-dialog"
      [attr.aria-labelledby]="titleId"
      (cancel)="onCancel($event)"
      (close)="onClose()">
      <h2 class="ui-dialog__title" [id]="titleId">{{ heading() }}</h2>
      <ng-content />
      <button type="button" class="ui-dialog__close" [attr.aria-label]="closeLabel()" (click)="open.set(false)">
        <span aria-hidden="true">×</span>
      </button>
    </dialog>
  `,
})
export class DialogComponent {
  readonly open = model(false);
  readonly heading = input.required<string>();
  readonly closeLabel = input('Close');

  protected readonly titleId = `ui-dialog-title-${nextId++}`;
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');
  private readonly document = inject(DOCUMENT);
  private returnFocusTo: HTMLElement | null = null;

  constructor() {
    afterRenderEffect(() => {
      const dialog = this.dialog().nativeElement;
      if (this.open() && !dialog.open) {
        const active = this.document.activeElement;
        this.returnFocusTo = active instanceof HTMLElement ? active : null;
        dialog.showModal();
      } else if (!this.open() && dialog.open) {
        dialog.close();
      }
    });
  }

  protected onCancel(event: Event): void {
    // Escape: keep the model as the single source of truth.
    event.preventDefault();
    this.open.set(false);
  }

  protected onClose(): void {
    // Runs however the dialog closed, including <form method="dialog">.
    this.open.set(false);
    this.returnFocusTo?.focus();
    this.returnFocusTo = null;
  }
}

```

## A11Y-003 · Scenario · excerpt 6

Complete verified TypeScript module.

```ts
import { Component, contentChildren, input, signal } from '@angular/core';

@Component({
  selector: 'ui-tab',
  host: { class: 'ui-tab-panel', '[hidden]': '!active()' },
  template: `<ng-content />`,
})
export class TabComponent {
  readonly label = input.required<string>();
  readonly active = signal(false);
}

@Component({
  selector: 'ui-tabs',
  template: `
    <div class="ui-tabs__list">
      @for (tab of tabs(); track tab; let i = $index) {
        <div
          id="tab-{{ i }}"
          class="ui-tabs__tab"
          [class.ui-tabs__tab--active]="tab.active()"
          (click)="select(i)">
          {{ tab.label() }}
        </div>
      }
    </div>
    <ng-content />
  `,
})
export class TabsComponent {
  readonly tabs = contentChildren(TabComponent);

  select(index: number): void {
    this.tabs().forEach((tab, i) => tab.active.set(i === index));
  }
}

```

## A11Y-003 · Scenario · excerpt 7

Source excerpt; markup, styles, package sketches, and test fragments may require the surrounding context.

```html
<ui-tabs>
  <ui-tab label="Account">...</ui-tab>
  <ui-tab label="Security">...</ui-tab>
</ui-tabs>

```

## A11Y-003 · Answer · excerpt 8

Complete verified TypeScript module.

```ts
import {
  Component,
  ElementRef,
  InjectionToken,
  Signal,
  computed,
  contentChildren,
  forwardRef,
  inject,
  input,
  model,
  viewChildren,
} from '@angular/core';

let nextId = 0;

interface TabsContext {
  readonly selectedTab: Signal<TabComponent | undefined>;
}

const TABS = new InjectionToken<TabsContext>('TABS');

@Component({
  selector: 'ui-tab',
  host: {
    class: 'ui-tab-panel',
    role: 'tabpanel',
    tabindex: '0',
    '[id]': 'panelId',
    '[attr.aria-labelledby]': 'tabId',
    '[hidden]': '!selected()',
  },
  template: `<ng-content />`,
})
export class TabComponent {
  readonly label = input.required<string>();
  readonly tabId = `ui-tab-${nextId}`;
  readonly panelId = `ui-tabpanel-${nextId++}`;
  private readonly tabs = inject(TABS);
  readonly selected = computed(() => this.tabs.selectedTab() === this);
}

@Component({
  selector: 'ui-tabs',
  providers: [{ provide: TABS, useExisting: forwardRef(() => TabsComponent) }],
  template: `
    <div role="tablist" class="ui-tabs__list" [attr.aria-label]="label()" (keydown)="onKeydown($event)">
      @for (tab of tabs(); track tab; let i = $index) {
        <button
          #tabButton
          type="button"
          role="tab"
          class="ui-tabs__tab"
          [id]="tab.tabId"
          [attr.aria-controls]="tab.panelId"
          [attr.aria-selected]="i === activeIndex()"
          [tabIndex]="i === activeIndex() ? 0 : -1"
          (click)="selectedIndex.set(i)">
          {{ tab.label() }}
        </button>
      }
    </div>
    <ng-content />
  `,
})
export class TabsComponent implements TabsContext {
  readonly label = input.required<string>();
  readonly selectedIndex = model(0);
  readonly tabs = contentChildren(TabComponent);

  // Clamp, so removing the last tab never leaves nothing selected and nothing focusable.
  readonly activeIndex = computed(() => Math.max(0, Math.min(this.selectedIndex(), this.tabs().length - 1)));
  readonly selectedTab = computed(() => this.tabs()[this.activeIndex()]);
  private readonly buttons = viewChildren<ElementRef<HTMLButtonElement>>('tabButton');

  protected onKeydown(event: KeyboardEvent): void {
    const count = this.tabs().length;
    if (count === 0) return;
    const current = this.activeIndex();
    let next: number;
    switch (event.key) {
      case 'ArrowRight':
        next = (current + 1) % count;
        break;
      case 'ArrowLeft':
        next = (current - 1 + count) % count;
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = count - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    this.selectedIndex.set(next);
    this.buttons()[next]?.nativeElement.focus();
  }
}

```

## A11Y-004 · Scenario · excerpt 9

Complete verified TypeScript module.

```ts
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

## A11Y-004 · Scenario · excerpt 10

Source excerpt; markup, styles, package sketches, and test fragments may require the surrounding context.

```html
<ui-text-field label="Email" hint="We never share your email" [required]="true" [error]="emailError()" />

```

## A11Y-004 · Answer · excerpt 11

Complete verified TypeScript module.

```ts
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

## A11Y-005 · Scenario · excerpt 12

Complete verified TypeScript module.

```ts
import { Component, Injectable, inject, signal } from '@angular/core';

export interface ToastAction {
  label: string;
  run: () => void;
}

export interface Toast {
  id: number;
  message: string;
  action?: ToastAction;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toasts = signal<readonly Toast[]>([]);
  private nextId = 0;

  show(message: string, action?: ToastAction): void {
    const toast: Toast = { id: this.nextId++, message, action };
    this.toasts.update(list => [...list, toast]);
    setTimeout(() => this.dismiss(toast.id), 3000);
  }

  dismiss(id: number): void {
    this.toasts.update(list => list.filter(toast => toast.id !== id));
  }
}

@Component({
  selector: 'ui-toast-outlet',
  template: `
    @for (toast of service.toasts(); track toast.id) {
      <div class="ui-toast" role="alert">
        {{ toast.message }}
        @if (toast.action; as action) {
          <button type="button" (click)="action.run()">{{ action.label }}</button>
        }
      </div>
    }
  `,
})
export class ToastOutletComponent {
  protected readonly service = inject(ToastService);
}

```

## A11Y-005 · Answer · excerpt 13

Complete verified TypeScript module.

```ts
import { Component, Injectable, computed, inject, input, signal } from '@angular/core';

export type ToastPoliteness = 'polite' | 'assertive';

export interface ToastAction {
  label: string;
  run: () => void;
}

export interface ToastOptions {
  politeness?: ToastPoliteness;
  action?: ToastAction;
  /** Milliseconds before dismissal, or null to stay until dismissed. */
  duration?: number | null;
}

export interface Toast {
  readonly id: number;
  readonly message: string;
  readonly politeness: ToastPoliteness;
  readonly action?: ToastAction;
  readonly duration: number | null;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toasts = signal<readonly Toast[]>([]);
  private readonly timers = new Map<number, ReturnType<typeof setTimeout>>();
  private nextId = 0;

  show(message: string, options: ToastOptions = {}): number {
    const toast: Toast = {
      id: this.nextId++,
      message,
      politeness: options.politeness ?? 'polite',
      action: options.action,
      duration: options.duration !== undefined ? options.duration : options.action ? null : 8000,
    };
    this.toasts.update(list => [...list, toast]);
    this.resume(toast.id);
    return toast.id;
  }

  dismiss(id: number): void {
    this.pause(id);
    this.toasts.update(list => list.filter(toast => toast.id !== id));
  }

  pause(id: number): void {
    clearTimeout(this.timers.get(id));
    this.timers.delete(id);
  }

  resume(id: number): void {
    const toast = this.toasts().find(t => t.id === id);
    if (!toast || toast.duration === null || this.timers.has(id)) return;
    this.timers.set(id, setTimeout(() => this.dismiss(id), toast.duration));
  }
}

@Component({
  selector: 'ui-toast',
  host: {
    class: 'ui-toast',
    '(mouseenter)': 'service.pause(toast().id)',
    '(mouseleave)': 'service.resume(toast().id)',
    '(focusin)': 'service.pause(toast().id)',
    '(focusout)': 'service.resume(toast().id)',
  },
  template: `
    <span>{{ toast().message }}</span>
    @if (toast().action; as action) {
      <button type="button" (click)="action.run(); service.dismiss(toast().id)">{{ action.label }}</button>
    }
    <button type="button" [attr.aria-label]="dismissLabel" (click)="service.dismiss(toast().id)">
      <span aria-hidden="true">×</span>
    </button>
  `,
})
export class ToastComponent {
  readonly toast = input.required<Toast>();
  protected readonly service = inject(ToastService);
  protected readonly dismissLabel = 'Dismiss notification';
}

@Component({
  selector: 'ui-toast-outlet',
  imports: [ToastComponent],
  template: `
    <div class="ui-toast-region" aria-live="polite">
      @for (toast of polite(); track toast.id) {
        <ui-toast [toast]="toast" />
      }
    </div>
    <div class="ui-toast-region" aria-live="assertive">
      @for (toast of assertive(); track toast.id) {
        <ui-toast [toast]="toast" />
      }
    </div>
  `,
})
export class ToastOutletComponent {
  private readonly service = inject(ToastService);
  protected readonly polite = computed(() => this.service.toasts().filter(t => t.politeness === 'polite'));
  protected readonly assertive = computed(() => this.service.toasts().filter(t => t.politeness === 'assertive'));
}

```

## A11Y-006 · Scenario · excerpt 14

Complete verified TypeScript module.

```ts
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

## A11Y-006 · Scenario · excerpt 15

Source excerpt; markup, styles, package sketches, and test fragments may require the surrounding context.

```html
<ui-listbox label="Shipping method" [options]="shippingOptions" [(value)]="shipping" />

```

## A11Y-006 · Answer · excerpt 16

Complete verified TypeScript module.

```ts
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

## A11Y-006 · Answer · excerpt 17

Source excerpt; markup, styles, package sketches, and test fragments may require the surrounding context.

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

## Supplemental example

[cycling-listbox.ts](examples/cycling-listbox.ts) — Adds repeated-letter cycling to the original listbox reference.

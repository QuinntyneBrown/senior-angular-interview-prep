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


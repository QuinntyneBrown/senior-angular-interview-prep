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


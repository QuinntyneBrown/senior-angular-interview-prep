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


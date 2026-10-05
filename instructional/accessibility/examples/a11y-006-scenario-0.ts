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


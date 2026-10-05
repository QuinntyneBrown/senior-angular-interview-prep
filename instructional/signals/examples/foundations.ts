import { Component, computed, effect, input, linkedSignal, signal } from '@angular/core';

export interface Option { value: string; selected?: boolean; }

@Component({ selector: 'lesson-foundations', template: '{{total()}} {{label()}}' })
export class Foundations {
  readonly count = signal(0);
  readonly quantity = signal(2);
  readonly unitPrice = signal(12);
  readonly total = computed(() => this.quantity() * this.unitPrice());
  readonly showDetails = signal(false);
  readonly label = computed(() => this.showDetails() ? `Price: ${this.unitPrice()}` : 'Hidden');
  readonly options = input<readonly Option[]>([]);
  readonly selected = linkedSignal<readonly Option[], readonly string[]>({
    source: this.options,
    computation: (options, previous) => previous
      ? previous.value.filter(value => options.some(option => option.value === value))
      : options.filter(option => option.selected).map(option => option.value),
  });
  readonly items = signal<readonly string[]>([]);
  readonly isValid = (value: string) => value.length > 0;
  add(value: string): void { this.items.update(items => [...items, value]); }
  remove(value: string): void { this.items.update(items => items.filter(item => item !== value)); }
}

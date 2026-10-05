# Code examples

Full original and corrected components are copied from the signals questions. The source questions remain authoritative. The slide excerpts are partial; use the complete modules below for compilation.

## sig-001-Scenario-0.ts

```ts
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

## sig-001-Answer-1.ts

```ts
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

## sig-002-Scenario-2.ts

```ts
import { Component, OnInit, input, output, signal } from '@angular/core';

@Component({
  selector: 'ui-switch',
  template: `
    <button type="button" role="switch" [attr.aria-checked]="isOn()" (click)="flip()">
      <ng-content />
    </button>
  `,
})
export class SwitchComponent implements OnInit {
  readonly checked = input(false);
  readonly checkedChange = output<boolean>();
  protected readonly isOn = signal(false);

  ngOnInit(): void {
    this.isOn.set(this.checked());
  }

  flip(): void {
    this.isOn.set(!this.isOn());
    this.checkedChange.emit(this.isOn());
  }
}

```

## sig-002-Answer-3.ts

```ts
import { Component, model } from '@angular/core';

@Component({
  selector: 'ui-switch',
  template: `
    <button type="button" role="switch" [attr.aria-checked]="checked()" (click)="flip()">
      <ng-content />
    </button>
  `,
})
export class SwitchComponent {
  readonly checked = model(false);

  flip(): void {
    this.checked.update(on => !on);
  }
}

```

## sig-003-Scenario-4.ts

```ts
import { Component, DOCUMENT, ElementRef, effect, inject, input, model, viewChild } from '@angular/core';

@Component({
  selector: 'ui-popover',
  styles: `.ui-popover__panel { position: fixed; }`,
  template: `
    @if (open()) {
      <div #panel class="ui-popover__panel">
        <ng-content />
      </div>
    }
  `,
})
export class PopoverComponent {
  readonly open = model(false);
  readonly anchor = input.required<HTMLElement>();
  private readonly panel = viewChild<ElementRef<HTMLElement>>('panel');
  private readonly document = inject(DOCUMENT);

  constructor() {
    effect(() => {
      if (this.open()) {
        this.document.addEventListener('keydown', event => {
          if (event.key === 'Escape') this.open.set(false);
        });
      }
    });

    effect(() => {
      const panel = this.panel();
      if (!panel) return;
      const rect = this.anchor().getBoundingClientRect();
      panel.nativeElement.style.top = `${rect.bottom}px`;
      panel.nativeElement.style.left = `${rect.left}px`;
    });
  }
}

```

## sig-003-Answer-5.ts

```ts
import {
  Component,
  DOCUMENT,
  ElementRef,
  afterRenderEffect,
  effect,
  inject,
  input,
  model,
  viewChild,
} from '@angular/core';

@Component({
  selector: 'ui-popover',
  styles: `.ui-popover__panel { position: fixed; }`,
  template: `
    @if (open()) {
      <div #panel class="ui-popover__panel">
        <ng-content />
      </div>
    }
  `,
})
export class PopoverComponent {
  readonly open = model(false);
  readonly anchor = input.required<HTMLElement>();
  private readonly panel = viewChild<ElementRef<HTMLElement>>('panel');
  private readonly document = inject(DOCUMENT);

  constructor() {
    effect(onCleanup => {
      if (!this.open()) return;
      const onKeydown = (event: KeyboardEvent) => {
        if (event.key !== 'Escape') return;
        this.open.set(false);
        this.anchor().focus();
      };
      this.document.addEventListener('keydown', onKeydown);
      onCleanup(() => this.document.removeEventListener('keydown', onKeydown));
    });

    afterRenderEffect({
      earlyRead: () => {
        const panel = this.panel()?.nativeElement;
        return panel ? { panel, rect: this.anchor().getBoundingClientRect() } : null;
      },
      write: measured => {
        const value = measured();
        if (!value) return;
        value.panel.style.top = `${value.rect.bottom}px`;
        value.panel.style.left = `${value.rect.left}px`;
      },
    });
  }
}

```

## sig-004-Scenario-6.ts

```ts
import { Component, computed, input, signal } from '@angular/core';

export interface Column<T> {
  key: keyof T & string;
  header: string;
}

type Direction = 'asc' | 'desc';

@Component({
  selector: 'ui-table',
  template: `
    <table>
      <thead>
        <tr>
          @for (column of columns(); track column.key) {
            <th (click)="sortBy(column.key)">{{ column.header }}</th>
          }
        </tr>
      </thead>
      <tbody>
        @for (row of view().rows; track $index) {
          <tr>
            @for (column of columns(); track column.key) {
              <td>{{ row[column.key] }}</td>
            }
          </tr>
        }
      </tbody>
    </table>
  `,
})
export class TableComponent<T extends object> {
  readonly rows = input.required<T[]>();
  readonly columns = input.required<Column<T>[]>();
  readonly sort = signal<{ key: keyof T & string; direction: Direction } | null>(null);

  readonly view = computed(() => {
    const sort = this.sort();
    const rows = this.rows();
    if (sort) {
      rows.sort((a, b) => {
        const result = String(a[sort.key]).localeCompare(String(b[sort.key]));
        return sort.direction === 'asc' ? result : -result;
      });
    }
    return { rows, count: rows.length };
  });

  sortBy(key: keyof T & string): void {
    const current = this.sort();
    const direction: Direction = current?.key === key && current.direction === 'asc' ? 'desc' : 'asc';
    this.sort.set({ key, direction });
  }
}

```

## sig-004-Answer-7.ts

```ts
import { Component, computed, input, signal } from '@angular/core';

export interface Column<T> {
  key: keyof T & string;
  header: string;
  compare?: (a: T, b: T) => number;
}

type Direction = 'ascending' | 'descending';

const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });

@Component({
  selector: 'ui-table',
  template: `
    <table>
      <thead>
        <tr>
          @for (column of columns(); track column.key) {
            <th scope="col" [attr.aria-sort]="sort()?.key === column.key ? sort()?.direction : null">
              <button type="button" (click)="sortBy(column.key)">{{ column.header }}</button>
            </th>
          }
        </tr>
      </thead>
      <tbody>
        @for (row of sortedRows(); track trackBy()(row)) {
          <tr>
            @for (column of columns(); track column.key) {
              <td>{{ row[column.key] }}</td>
            }
          </tr>
        }
      </tbody>
    </table>
  `,
})
export class TableComponent<T extends object> {
  readonly rows = input.required<readonly T[]>();
  readonly columns = input.required<readonly Column<T>[]>();
  readonly trackBy = input<(row: T) => unknown>(row => row);
  readonly sort = signal<{ key: keyof T & string; direction: Direction } | null>(null);

  readonly sortedRows = computed(() => {
    const sort = this.sort();
    const rows = this.rows();
    if (!sort) return rows;
    const column = this.columns().find(c => c.key === sort.key);
    const compare =
      column?.compare ?? ((a: T, b: T) => collator.compare(String(a[sort.key]), String(b[sort.key])));
    const sign = sort.direction === 'ascending' ? 1 : -1;
    return rows.toSorted((a, b) => sign * compare(a, b));
  });

  sortBy(key: keyof T & string): void {
    const current = this.sort();
    const direction: Direction =
      current?.key === key && current.direction === 'ascending' ? 'descending' : 'ascending';
    this.sort.set({ key, direction });
  }
}

```


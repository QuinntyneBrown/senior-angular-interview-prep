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


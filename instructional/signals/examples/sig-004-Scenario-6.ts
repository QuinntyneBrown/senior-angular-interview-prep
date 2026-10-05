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


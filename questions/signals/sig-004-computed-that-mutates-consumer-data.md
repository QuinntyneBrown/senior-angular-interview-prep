---
id: SIG-004
title: A sortable table that rearranges its consumer's data
topic: signals
format: code-review
difficulty: senior
minutes: 10
angular: "20+"
tags: [computed, immutability, equality, aria-sort]
---

# A sortable table that rearranges its consumer's data

## Scenario

`@acme/ui` ships a data table. One product team reports: "After a user sorts the table, our
'Export CSV' button exports rows in the sorted order, and our row numbers are wrong." Another team
reports that the table re-renders every row whenever anything on their page changes.

```ts verify
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

## Question

**What is causing each reported bug, and what else would you change before this table is used
across the organization?** There are at least four issues.

## Hints

<details>
<summary>Hint 1</summary>

Which array does `Array.prototype.sort` return, and which array does it change?

</details>

<details>
<summary>Hint 2</summary>

How does a screen-reader user find out which column is sorted, or sort it at all?

</details>

## Answer

### 1. `sort()` mutates the consumer's array

`Array.prototype.sort` sorts **in place** and returns the same array. The `computed` therefore
reorders the array the product team passed in, which is why their export and row numbers follow
the table's sort order. A component must never modify data it receives through an input; the
consumer owns it.

There is a second effect: `this.rows()` returns the same reference after sorting, so if the
consumer keeps that reference in its own signal, its own computeds see no change even though the
contents moved.

**Fix:** sort a copy, with `toSorted` (ES2023) or `[...rows].sort(...)`.

### 2. `track $index` ties DOM rows to positions, not records

After sorting, row 0 holds a different record but Angular reuses the same `<tr>`. Any state inside
a row (a focused checkbox, an expanded detail, a running animation) stays with the position and
now belongs to the wrong record. It also means every row is re-bound on every sort.

**Fix:** let the consumer say how to identify a row, for example a `trackBy` input:
`trackBy = input<(row: T) => unknown>(row => row)`, and use `track trackBy()(row)`.

### 3. Expensive work on every new array, and one oversized `computed`

The second report usually comes from a binding like `[rows]="orders.filter(o => o.open)"`. That
expression creates a new array on every change detection pass, so `rows` changes every time, the
`computed` re-runs, and the whole table is re-sorted. With new row objects after every fetch,
`track $index` (issue 2) cannot tell which rows are the same records either.

The table cannot stop a consumer from passing a new array, but it can avoid making it worse:

- **Keep each `computed` narrow.** `view` bundles the rows and the count into a new object, so
  anything that reads `view().count` updates whenever the rows do. Separate `sortedRows` and
  `rowCount` computeds update independently.
- **Use the `equal` option** when a recomputation often produces an equivalent value that should
  not notify readers.
- **Document the contract:** pass a stable reference, ideally a signal or `computed` in the
  consumer, and provide a `trackBy` so re-fetched records keep their rows.

### 4. Sorting is not accessible

- A click handler on `<th>` cannot be reached by keyboard and is not announced as interactive. The
  header needs a real `<button type="button">` inside it.
- The current sort is invisible to assistive technology. The sorted header needs
  `aria-sort="ascending"` or `"descending"`; leave the attribute off unsorted columns rather than
  setting `"none"` everywhere, which adds noise.

### 5. Locale-unaware and type-unaware comparison

`String(value).localeCompare` sorts `10` before `9`, sorts dates as text, and uses the browser's
default locale. A shared table should accept a comparator per column and default to
`Intl.Collator` with `numeric: true`.

### Fixed version

```ts verify
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

`readonly T[]` in the input type documents the contract ("the table will not change your array")
and makes the compiler reject any future in-place `sort`.

## Scoring

| Area | Strong signal | Weak signal |
| --- | --- | --- |
| Mutation | Identifies in-place `sort` as the export bug and copies before sorting | Tells the consumer to pass a copy |
| Identity | Replaces `track $index` and explains state moving between rows | Leaves tracking as is |
| Computed design | Splits derived values and knows about the `equal` option | Adds `OnPush` and hopes |
| Accessibility | Adds buttons in headers and `aria-sort` | Mentions only colour or icons for the sort direction |

## Follow-up questions

1. The consumer passes a new array on every fetch, but most records are identical. How would you
   avoid rebuilding every row?
2. Should the sort state be internal, a `model()`, or both? What does each choice mean for teams
   that sort on the server?
3. How would you announce "Sorted by name, ascending" after the user activates a header?

## References

- [MDN: `Array.prototype.sort` (sorts in place)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort)
- [MDN: `Array.prototype.toSorted`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/toSorted)
- [Angular: Computed signals and equality functions](https://angular.dev/guide/signals#signal-equality-functions)
- [Angular: `@for` and `track`](https://angular.dev/guide/templates/control-flow#why-is-track-in-for-blocks-important)
- [WAI-ARIA APG: Sortable table example](https://www.w3.org/WAI/ARIA/apg/patterns/table/examples/sortable-table/)

---
id: A11Y-003
title: Tabs that only work with a mouse
topic: accessibility
format: code-review
difficulty: senior
minutes: 12
angular: "20+"
tags: [tabs, roving-tabindex, aria, unique-ids, contentChildren]
---

# Tabs that only work with a mouse

## Scenario

This is the first version of the `@acme/ui` tabs component. It is already used on a settings page
that shows **two** tab groups at once: "Profile" and "Notifications".

```ts verify
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

```html
<ui-tabs>
  <ui-tab label="Account">...</ui-tab>
  <ui-tab label="Security">...</ui-tab>
</ui-tabs>
```

## Question

**Describe how tabs should behave for keyboard and screen-reader users, list what is missing, and
fix the component.** Point out any bug that only appears because there are two tab groups on the
page.

## Hints

<details>
<summary>Hint 1</summary>

How many Tab key presses should it take to move *past* a tab list of five tabs?

</details>

<details>
<summary>Hint 2</summary>

What is the `id` of the first tab in the second tab group?

</details>

## Answer

The WAI-ARIA tabs pattern: a `tablist` contains `tab` elements, each controlling a `tabpanel`. Only
the selected tab is in the Tab order (a *roving* `tabindex`); arrow keys move between tabs, and
Home and End jump to the first and last. Each tab says whether it is selected, and each panel is
labelled by its tab.

### 1. No roles or states

Divs with click handlers expose nothing. A screen reader announces plain text, not "Security, tab,
2 of 2, selected". Needed: `role="tablist"` (with a label), `role="tab"` with `aria-selected` and
`aria-controls`, and `role="tabpanel"` with `aria-labelledby`.

### 2. Not keyboard operable

The tabs are not focusable at all. Making each one a plain `<button>` would fix reachability but
produce the wrong pattern: five Tab presses to get past five tabs. Only the selected tab should
have `tabindex="0"`; the rest get `-1`, and arrow keys move between them.

### 3. Duplicate ids across instances

Both groups render `id="tab-0"` and `id="tab-1"`. Duplicate ids are invalid, and any
`aria-labelledby` or `aria-controls` reference resolves to the *first* match in the document, so
the second group's panels would be labelled by the first group's tabs. Ids must be unique per
instance: generate them from a counter, never from the position alone.

### 4. Nothing is selected initially

No tab starts active, so every panel is hidden until a click. With a roving `tabindex`, no tab
would be focusable either, and the whole component would be unreachable by keyboard.

### 5. State is pushed into children imperatively

`select` writes into each child's signal. If tabs are added or removed (`@if` around a
`<ui-tab>`), nothing updates their state. Deriving "am I selected?" from one source in the parent
avoids that.

### Fixed version

```ts verify
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

This uses *automatic activation*: moving with the arrow keys also selects the tab. That suits
panels that render instantly. If showing a panel is slow (it fetches data), use *manual
activation* instead: arrows move focus, and Enter or Space selects.

The panel has `tabindex="0"` so keyboard users can reach a panel that has no focusable content.
If every panel always starts with a focusable element, that can be dropped.

### What a strong candidate also mentions

- **Right-to-left layouts** reverse the meaning of the left and right arrow keys. Read the
  direction (for example with the CDK `Directionality`) instead of hard-coding it.
- **`selectedIndex` as a `model()`** lets consumers control the selected tab, for example to sync
  it with the URL.
- **The label input is required**, so a tablist is never nameless. Adding it to an existing
  component is breaking, so it would be staged (see A11Y-001).

## Scoring

| Area | Strong signal | Weak signal |
| --- | --- | --- |
| Pattern knowledge | Describes roving `tabindex`, arrow keys, Home and End without prompting | Makes every tab a button in the Tab order |
| ARIA wiring | Connects `aria-selected`, `aria-controls` and `aria-labelledby` correctly | Adds roles but no relationships |
| Multiple instances | Finds the duplicate ids and generates per-instance ids | Uses index-based ids |
| Robustness | Handles an initial selection and tabs being added or removed | Assumes a fixed set of tabs |

## Follow-up questions

1. When would you choose manual activation over automatic activation?
2. The tabs overflow on a phone. What happens to keyboard and screen-reader behaviour if you add
   scroll buttons?
3. Would you build this on the CDK's `FocusKeyManager`? What would it give you and what would it
   cost?

## References

- [WAI-ARIA APG: Tabs pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/)
- [WAI-ARIA APG: Developing a keyboard interface (roving tabindex)](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/)
- [Angular: Referencing component children with queries](https://angular.dev/guide/components/queries)
- [Angular CDK: Bidirectionality](https://material.angular.dev/cdk/bidi/overview)

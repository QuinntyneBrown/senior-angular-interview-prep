---
id: SIG-003
title: Effects that leak and measure too early
topic: signals
format: code-review
difficulty: senior
minutes: 12
angular: "20+"
tags: [effect, afterRenderEffect, cleanup, dom]
---

# Effects that leak and measure too early

## Scenario

A popover in `@acme/ui` opens below an anchor element and closes on Escape. Product teams report
two bugs: "pages get slower the more often users open popovers", and "the popover sometimes
appears in the wrong place". Here is the component:

```ts verify
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

## Question

**Explain both bugs, then fix the component.** Also tell me what you would still be unhappy about
before shipping it to forty product teams.

## Hints

<details>
<summary>Hint 1</summary>

Count the `keydown` listeners on `document` after the popover has opened five times. What removes
them?

</details>

<details>
<summary>Hint 2</summary>

`effect()` runs as part of change detection. Is the DOM finished when it runs? Is there a browser
on the server?

</details>

## Answer

### 1. "Pages get slower": a listener leak

Every time `open` becomes `true`, the first effect adds a **new** `keydown` listener, and nothing
ever removes one. After five opens there are five listeners. They also outlive the component: each
closure holds `this`, so a destroyed popover and everything it references stay in memory for the
life of the page. Every Escape press runs every listener ever added.

**Fix:** register cleanup. An effect's callback receives `onCleanup`. The cleanup runs before the
effect runs again and when the effect is destroyed, which happens automatically when the component
is destroyed.

### 2. "Wrong place": measuring the DOM in an `effect`

`effect()` is for synchronising state with something outside Angular's templates. It is not timed
to the DOM: it runs during change detection, so the measurement can happen against a layout that is
not final. Reading layout (`getBoundingClientRect`) and then writing styles in the same callback,
for many popovers, also forces the browser to recalculate layout repeatedly.

**Fix:** `afterRenderEffect`. It runs after Angular has updated the DOM, splits work into phases
(`earlyRead`, `write`, `mixedReadWrite`, `read`) so reads and writes from many components are
batched, and never runs during server-side rendering, where there is no layout to measure.

### Fixed version

```ts verify
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

Closing on Escape now also returns focus to the anchor. Without that, keyboard users lose their
place when the panel disappears.

### What a strong candidate is still unhappy about

- **Position only updates when signals change.** Scrolling, resizing, or the anchor moving leaves
  the panel behind. A shared library should use a tested positioning engine, such as the CDK
  Overlay, or CSS anchor positioning where the supported browsers allow it, rather than hand-rolled
  coordinates.
- **Escape is global.** Every open popover closes on one Escape press, including ones underneath a
  dialog. Escape should close only the topmost layer.
- **Edges of the viewport.** There is no flipping when the panel would go off-screen.
- **Semantics.** The panel has no role, label or focus behaviour. Whether it is a `dialog`, a menu
  or a tooltip decides the ARIA pattern, and the component cannot guess.

## Scoring

| Area | Strong signal | Weak signal |
| --- | --- | --- |
| Leak | Finds the missing removal and explains that closures keep destroyed components alive | Adds `{ once: true }`, which breaks Escape after the first non-Escape key |
| Effect lifecycle | Knows `onCleanup` runs before each re-run and on destroy | Moves the listener to `ngOnDestroy`, losing the per-open lifetime |
| DOM timing | Moves measurement to `afterRenderEffect` and separates reads from writes | Wraps the measurement in `setTimeout` |
| Library judgement | Suggests a shared positioning solution and topmost-only Escape | Ships the hand-rolled version |

## Follow-up questions

1. Why is `{ once: true }` on the listener not a fix?
2. When is a plain `effect()` the right tool in a component library? Give an example.
3. How would you make "Escape closes only the topmost layer" work across popovers, menus and
   dialogs from different teams on the same page?

## References

- [Angular: Effects](https://angular.dev/guide/signals/effect)
- [Angular: `afterRenderEffect`](https://angular.dev/api/core/afterRenderEffect)
- [Angular CDK: Overlay](https://material.angular.dev/cdk/overlay/overview)
- [MDN: CSS anchor positioning](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_anchor_positioning)

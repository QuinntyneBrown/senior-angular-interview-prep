---
id: A11Y-002
title: A modal dialog that is not modal
topic: accessibility
format: code-review
difficulty: senior
minutes: 12
angular: "20+"
tags: [dialog, focus-management, inert, content-projection]
---

# A modal dialog that is not modal

## Scenario

`@acme/ui` ships the dialog below. It looks correct with a mouse. A screen-reader user reports
they "can't tell a dialog opened, and Tab takes me to the page underneath". Another team reports
that a heavy form inside a closed dialog still makes HTTP requests when the page loads.

```ts verify
import { Component, input, model } from '@angular/core';

@Component({
  selector: 'ui-dialog',
  template: `
    @if (open()) {
      <div class="ui-dialog__backdrop" (click)="open.set(false)"></div>
      <div class="ui-dialog" role="dialog">
        <h2 class="ui-dialog__title">{{ heading() }}</h2>
        <ng-content />
        <span class="ui-dialog__close" (click)="open.set(false)">×</span>
      </div>
    }
  `,
})
export class DialogComponent {
  readonly open = model(false);
  readonly heading = input.required<string>();
}
```

## Question

**What does a modal dialog have to do for keyboard and screen-reader users, and which of those
does this one do?** Fix it, and explain the second team's bug.

## Hints

<details>
<summary>Hint 1</summary>

Walk through it with a keyboard: where is focus when it opens, where can Tab go, how do you close
it, and where is focus afterwards?

</details>

<details>
<summary>Hint 2</summary>

Who creates projected content: the component that declares `<ng-content>`, or the parent that
passes it in?

</details>

## Answer

A modal dialog must: move focus into itself when it opens, keep keyboard focus and screen-reader
browsing inside, have an accessible name, close on Escape, and return focus to where the user was
when it closes. This one does none of them.

### 1. Focus stays behind

Opening it does not move focus. A keyboard user's next Tab goes to whatever followed the trigger,
and a screen-reader user hears nothing. The user may not know a dialog opened.

### 2. The rest of the page is still reachable

Nothing stops Tab from leaving the dialog, and nothing hides the page behind it from assistive
technology. `role="dialog"` alone does not make anything modal.

### 3. No accessible name

`role="dialog"` with no `aria-labelledby` or `aria-label` is announced as just "dialog". The
heading is right there; it needs an `id` and a reference.

### 4. No keyboard way to close, and focus is lost on close

There is no Escape handling, and the close control is a `<span>`: not focusable, not a button, and
its only text, `×`, is announced as "times" or "multiplication". When the dialog closes, its
content is destroyed while it contains focus, so focus falls back to `<body>` and the user has to
find their place again.

### Fix: use the native `<dialog>` element

`showModal()` gives most of this for free: the dialog renders in the top layer, the rest of the
document becomes inert (unreachable by Tab and hidden from assistive technology), focus moves into
the dialog, and Escape fires a `cancel` event. The component then only needs to name it, provide a
real close button, and restore focus.

```ts verify
import {
  Component,
  DOCUMENT,
  ElementRef,
  afterRenderEffect,
  inject,
  input,
  model,
  viewChild,
} from '@angular/core';

let nextId = 0;

@Component({
  selector: 'ui-dialog',
  template: `
    <dialog
      #dialog
      class="ui-dialog"
      [attr.aria-labelledby]="titleId"
      (cancel)="onCancel($event)"
      (close)="onClose()">
      <h2 class="ui-dialog__title" [id]="titleId">{{ heading() }}</h2>
      <ng-content />
      <button type="button" class="ui-dialog__close" [attr.aria-label]="closeLabel()" (click)="open.set(false)">
        <span aria-hidden="true">×</span>
      </button>
    </dialog>
  `,
})
export class DialogComponent {
  readonly open = model(false);
  readonly heading = input.required<string>();
  readonly closeLabel = input('Close');

  protected readonly titleId = `ui-dialog-title-${nextId++}`;
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');
  private readonly document = inject(DOCUMENT);
  private returnFocusTo: HTMLElement | null = null;

  constructor() {
    afterRenderEffect(() => {
      const dialog = this.dialog().nativeElement;
      if (this.open() && !dialog.open) {
        const active = this.document.activeElement;
        this.returnFocusTo = active instanceof HTMLElement ? active : null;
        dialog.showModal();
      } else if (!this.open() && dialog.open) {
        dialog.close();
      }
    });
  }

  protected onCancel(event: Event): void {
    // Escape: keep the model as the single source of truth.
    event.preventDefault();
    this.open.set(false);
  }

  protected onClose(): void {
    // Runs however the dialog closed, including <form method="dialog">.
    this.open.set(false);
    this.returnFocusTo?.focus();
    this.returnFocusTo = null;
  }
}
```

Design notes:

- The model stays the single source of truth. Escape is cancelled and turned into
  `open.set(false)`, and the effect calls `close()`.
- Focus restoration happens in the `close` event handler, so it runs for every way of closing.
- `afterRenderEffect` is used because `showModal()` needs the element to be rendered; it never runs
  during server rendering.
- The close label is an input so applications can translate it.
- The page backdrop is now the `::backdrop` pseudo-element, styled with tokens.

### 5. The second team's bug: projected content is always created

`<ng-content>` inside `@if` does not delay anything. Projected content belongs to the *parent's*
template, so the parent creates it, and runs its lifecycle hooks, whether or not the dialog ever
shows it. That is why the hidden form makes HTTP requests on page load. The fixed version renders
the content all the time inside a closed `<dialog>` (which is hidden), so the cost is the same.

For heavy or lazy content, the library should offer one of:

- A template slot: the consumer passes an `<ng-template>`, and the dialog renders it with
  `ngTemplateOutlet` only while open.
- A dialog service that creates the content component on demand (the CDK `Dialog` does this).
- Consumers can also wrap their content in `@defer` or their own `@if`.

## Scoring

| Area | Strong signal | Weak signal |
| --- | --- | --- |
| Requirements | Lists focus in, containment, name, Escape and focus return without prompting | Mentions only `aria-modal` |
| Solution | Uses native `<dialog>` and `showModal()`, or the CDK, and explains what each provides | Hand-writes a focus trap with `keydown` on Tab |
| Single source of truth | Routes Escape and form closes back through the model | Lets the element and the model disagree |
| Projection | Explains that the parent creates projected content and offers a template or service API | Says `@if` should prevent it |

## Follow-up questions

1. A team wants clicking the backdrop to close the dialog. How would you implement it with
   `<dialog>`, and should it be the default?
2. Which element should receive focus first in a destructive confirmation dialog? Why?
3. How would you test focus return and background inertness in an automated test?

## References

- [WAI-ARIA APG: Dialog (modal) pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)
- [MDN: The `<dialog>` element](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog)
- [MDN: `HTMLDialogElement.showModal()`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLDialogElement/showModal)
- [Angular: Content projection with `ng-content`](https://angular.dev/guide/components/content-projection)
- [Angular CDK: Dialog](https://material.angular.dev/cdk/dialog/overview)

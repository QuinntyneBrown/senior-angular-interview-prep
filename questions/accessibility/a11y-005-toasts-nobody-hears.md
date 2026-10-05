---
id: A11Y-005
title: Toasts that vanish before anyone can use them
topic: accessibility
format: code-review
difficulty: senior
minutes: 10
angular: "20+"
tags: [live-regions, timing, toasts, notifications]
---

# Toasts that vanish before anyone can use them

## Scenario

`@acme/ui` provides a toast service. Products use it for messages like "Saved", "Message deleted —
Undo", and "Payment failed". Accessibility testing found that screen-reader users sometimes hear
nothing, are interrupted mid-sentence by "Saved", and that nobody using a keyboard has ever managed
to press Undo.

```ts verify
import { Component, Injectable, inject, signal } from '@angular/core';

export interface ToastAction {
  label: string;
  run: () => void;
}

export interface Toast {
  id: number;
  message: string;
  action?: ToastAction;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toasts = signal<readonly Toast[]>([]);
  private nextId = 0;

  show(message: string, action?: ToastAction): void {
    const toast: Toast = { id: this.nextId++, message, action };
    this.toasts.update(list => [...list, toast]);
    setTimeout(() => this.dismiss(toast.id), 3000);
  }

  dismiss(id: number): void {
    this.toasts.update(list => list.filter(toast => toast.id !== id));
  }
}

@Component({
  selector: 'ui-toast-outlet',
  template: `
    @for (toast of service.toasts(); track toast.id) {
      <div class="ui-toast" role="alert">
        {{ toast.message }}
        @if (toast.action; as action) {
          <button type="button" (click)="action.run()">{{ action.label }}</button>
        }
      </div>
    }
  `,
})
export class ToastOutletComponent {
  protected readonly service = inject(ToastService);
}
```

## Question

**Explain each of the three findings and redesign the service and outlet.** Keep the API easy for
product teams to use correctly.

## Hints

<details>
<summary>Hint 1</summary>

How long does it take to Tab from the middle of a page to a toast at the end of the document?

</details>

<details>
<summary>Hint 2</summary>

Is "Saved" as urgent as "Payment failed"? What does `role="alert"` tell the screen reader to do?

</details>

## Answer

### 1. "Sometimes hear nothing": live regions created with their content

Each toast element is created already containing `role="alert"` and its text. Screen readers
announce *changes* inside live regions they already know about, and support for regions inserted
together with their content is inconsistent. The reliable pattern is a live region that exists from
page load and stays empty until a message is added to it.

**Fix:** the outlet renders permanent live-region containers; toasts are added inside them.

### 2. "Interrupted by 'Saved'": everything is assertive

`role="alert"` is assertive: it interrupts whatever the screen reader is saying. That suits
"Payment failed", not "Saved". The service must let callers choose politeness, with polite as the
default so the easy path is the considerate one.

### 3. "Nobody can press Undo": the timer

Three seconds is too short to read for many users (screen magnifier users may not even have the
toast in view), and far too short to reach a button at the end of the document by keyboard. WCAG
2.2.1 (Timing Adjustable) requires that users can turn off, adjust or extend time limits like this.

**Fix:**

- Toasts with an action do **not** auto-dismiss by default; they stay until used or dismissed.
- Informational toasts use a longer default and pause while hovered or focused.
- Every toast has a dismiss button.
- Do not move focus to toasts: that would interrupt the user's work. Instead, important actions
  such as Undo should also be available somewhere persistent (for example, in the item's menu).

### Fixed version

```ts verify
import { Component, Injectable, computed, inject, input, signal } from '@angular/core';

export type ToastPoliteness = 'polite' | 'assertive';

export interface ToastAction {
  label: string;
  run: () => void;
}

export interface ToastOptions {
  politeness?: ToastPoliteness;
  action?: ToastAction;
  /** Milliseconds before dismissal, or null to stay until dismissed. */
  duration?: number | null;
}

export interface Toast {
  readonly id: number;
  readonly message: string;
  readonly politeness: ToastPoliteness;
  readonly action?: ToastAction;
  readonly duration: number | null;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toasts = signal<readonly Toast[]>([]);
  private readonly timers = new Map<number, ReturnType<typeof setTimeout>>();
  private nextId = 0;

  show(message: string, options: ToastOptions = {}): number {
    const toast: Toast = {
      id: this.nextId++,
      message,
      politeness: options.politeness ?? 'polite',
      action: options.action,
      duration: options.duration !== undefined ? options.duration : options.action ? null : 8000,
    };
    this.toasts.update(list => [...list, toast]);
    this.resume(toast.id);
    return toast.id;
  }

  dismiss(id: number): void {
    this.pause(id);
    this.toasts.update(list => list.filter(toast => toast.id !== id));
  }

  pause(id: number): void {
    clearTimeout(this.timers.get(id));
    this.timers.delete(id);
  }

  resume(id: number): void {
    const toast = this.toasts().find(t => t.id === id);
    if (!toast || toast.duration === null || this.timers.has(id)) return;
    this.timers.set(id, setTimeout(() => this.dismiss(id), toast.duration));
  }
}

@Component({
  selector: 'ui-toast',
  host: {
    class: 'ui-toast',
    '(mouseenter)': 'service.pause(toast().id)',
    '(mouseleave)': 'service.resume(toast().id)',
    '(focusin)': 'service.pause(toast().id)',
    '(focusout)': 'service.resume(toast().id)',
  },
  template: `
    <span>{{ toast().message }}</span>
    @if (toast().action; as action) {
      <button type="button" (click)="action.run(); service.dismiss(toast().id)">{{ action.label }}</button>
    }
    <button type="button" [attr.aria-label]="dismissLabel" (click)="service.dismiss(toast().id)">
      <span aria-hidden="true">×</span>
    </button>
  `,
})
export class ToastComponent {
  readonly toast = input.required<Toast>();
  protected readonly service = inject(ToastService);
  protected readonly dismissLabel = 'Dismiss notification';
}

@Component({
  selector: 'ui-toast-outlet',
  imports: [ToastComponent],
  template: `
    <div class="ui-toast-region" aria-live="polite">
      @for (toast of polite(); track toast.id) {
        <ui-toast [toast]="toast" />
      }
    </div>
    <div class="ui-toast-region" aria-live="assertive">
      @for (toast of assertive(); track toast.id) {
        <ui-toast [toast]="toast" />
      }
    </div>
  `,
})
export class ToastOutletComponent {
  private readonly service = inject(ToastService);
  protected readonly polite = computed(() => this.service.toasts().filter(t => t.politeness === 'polite'));
  protected readonly assertive = computed(() => this.service.toasts().filter(t => t.politeness === 'assertive'));
}
```

Notes on the design:

- The two regions exist as soon as the outlet renders, so a toast added later is a change inside a
  known live region.
- `show()` returns the id, so callers can dismiss a toast when the situation resolves.
- The defaults make the safe choice the easy one: polite, a long duration, and no timer at all when
  there is an action.
- The dismiss label is fixed English here for brevity; in the library it would come from an
  injected, translatable configuration.

### What a strong candidate also mentions

- **The CDK `LiveAnnouncer`** already manages a hidden live region and can be used instead of the
  visible regions for the announcement itself.
- **Focus is lost if a focused toast is dismissed.** When the user dismisses a toast they tabbed
  into, focus should go somewhere sensible, such as back to where it was before.
- **Stacking:** five toasts at once are unreadable. Limit how many are visible and queue the rest.

## Scoring

| Area | Strong signal | Weak signal |
| --- | --- | --- |
| Live regions | Knows regions must exist before content changes | Adds `aria-live` to each toast |
| Politeness | Defaults to polite, lets callers opt into assertive | Uses `role="alert"` for everything |
| Timing | Cites 2.2.1, pauses on hover and focus, never auto-dismisses actions | Makes the timeout configurable and stops there |
| API design | Shapes defaults so the easy call is accessible | Leaves every decision to each caller |

## Follow-up questions

1. A toast says "3 files uploaded" and then "4 files uploaded" a second later. What will a screen
   reader say, and how would you improve it?
2. Should the outlet be a landmark region? What are the trade-offs?
3. How would you test that a toast is announced?

## References

- [MDN: ARIA live regions](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Guides/Live_regions)
- [MDN: `alert` role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/alert_role)
- [WCAG 2.2: Understanding Timing Adjustable (2.2.1)](https://www.w3.org/WAI/WCAG22/Understanding/timing-adjustable.html)
- [WCAG 2.2: Understanding Status Messages (4.1.3)](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)
- [Angular CDK: Accessibility (`LiveAnnouncer`)](https://material.angular.dev/cdk/a11y/overview)

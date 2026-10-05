---
id: PERF-001
title: A component that only works with zone.js
topic: performance
format: code-review
difficulty: senior
minutes: 10
angular: "20+"
tags: [zoneless, change-detection, signals, afterNextRender]
---

# A component that only works with zone.js

## Scenario

`@acme/ui`'s copy button works in every older product. A team that created a new, zoneless
application reports: "The label usually never changes to 'Copied', and the button's width is never
locked."
A second team (still on zone.js) reports that clicking twice quickly makes "Copied" disappear too
early.

```ts verify
import { Component, ElementRef, NgZone, inject, input } from '@angular/core';
import { take } from 'rxjs';

@Component({
  selector: 'ui-copy-button',
  template: `
    <button type="button" class="ui-copy-button" (click)="copy()">
      {{ copied ? 'Copied' : 'Copy' }}
    </button>
  `,
})
export class CopyButtonComponent {
  readonly text = input.required<string>();
  copied = false;
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  constructor() {
    // Lock the width so the button does not jump when the label changes.
    inject(NgZone)
      .onStable.pipe(take(1))
      .subscribe(() => {
        const element = this.host.nativeElement;
        element.style.minWidth = `${element.getBoundingClientRect().width}px`;
      });
  }

  async copy(): Promise<void> {
    await navigator.clipboard.writeText(this.text());
    this.copied = true;
    setTimeout(() => (this.copied = false), 2000);
  }
}
```

## Question

**Why does it work with zone.js and not without? Fix it so it works in both kinds of application,
and fix the second team's bug.** What else would you change?

## Hints

<details>
<summary>Hint 1</summary>

Without zone.js, what tells Angular that `copied` changed after the `await`?

</details>

<details>
<summary>Hint 2</summary>

In a zoneless application, the `NgZone` you inject does nothing. Does `onStable` ever emit?

</details>

## Answer

### Why it depends on zone.js

With zone.js, Angular runs change detection after every asynchronous task, including the clipboard
promise and the `setTimeout`. Plain fields "just work" because the whole application is checked
constantly.

A zoneless application (the default for new Angular applications) only runs change detection when
something tells it to: a template event listener, a signal read by a template changing,
`markForCheck()`, the `async` pipe, or `setInput`. Here:

- The click handler schedules a check, but `copied = true` happens *after* the `await`, normally
  once that check has already run. Nothing schedules another, so "Copied" usually never appears.
  Whether it does depends on timing and on unrelated activity elsewhere on the page, which makes
  the bug intermittent and hard to reproduce. The reset in `setTimeout` has the same problem.
- `NgZone` is a no-op in zoneless applications, so `onStable` never emits, and the width is never
  locked.

A shared library must work in both kinds of application, and new ones are zoneless.

**Fix:** state that the template reads lives in **signals**, which schedule rendering in both
modes, and DOM work after rendering uses **`afterNextRender`** or **`afterRenderEffect`**, never
zone events.

### The second team's bug: overlapping timers

Each click starts a new timer and never cancels the previous one. Clicking at 0 s and 1.5 s resets
the label at 2 s, half a second after the second click. The timer also survives the component
being destroyed.

**Fix:** clear the previous timer on each click, and on destroy.

### Better than measuring: let CSS size the button

Measuring the width of "Copy" and using it as `min-width` would not even work: "Copied" is longer,
so the button grows anyway. Stack both labels in the same grid cell and hide the inactive one with
`visibility: hidden`. The button is always as wide as the longer label, with no JavaScript, no
layout reads, and correct behaviour when the labels are translated.

### Fixed version

```ts verify
import { Component, DestroyRef, inject, input, signal } from '@angular/core';
import { LiveAnnouncer } from '@angular/cdk/a11y';

@Component({
  selector: 'ui-copy-button',
  styles: `
    .ui-copy-button__labels { display: inline-grid; }
    .ui-copy-button__labels > span { grid-area: 1 / 1; }
    .ui-copy-button__label--hidden { visibility: hidden; }
  `,
  template: `
    <button type="button" class="ui-copy-button" (click)="copy()">
      <span class="ui-copy-button__labels">
        <span [class.ui-copy-button__label--hidden]="copied()">{{ copyLabel() }}</span>
        <span [class.ui-copy-button__label--hidden]="!copied()">{{ copiedLabel() }}</span>
      </span>
    </button>
  `,
})
export class CopyButtonComponent {
  readonly text = input.required<string>();
  readonly copyLabel = input('Copy');
  readonly copiedLabel = input('Copied');
  readonly failedMessage = input('Could not copy to the clipboard');

  protected readonly copied = signal(false);
  private readonly announcer = inject(LiveAnnouncer);
  private timer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.timer));
  }

  protected async copy(): Promise<void> {
    clearTimeout(this.timer);
    try {
      await navigator.clipboard.writeText(this.text());
    } catch {
      this.copied.set(false);
      void this.announcer.announce(this.failedMessage(), 'assertive');
      return;
    }
    this.copied.set(true);
    void this.announcer.announce(this.copiedLabel());
    this.timer = setTimeout(() => this.copied.set(false), 2000);
  }
}
```

### Other fixes in this version

- **Errors are handled.** `writeText` rejects when permission is denied or the page is not a secure
  context. The original left an unhandled rejection and no feedback.
- **The change is announced.** A button's label changing is not reliably announced by screen
  readers, so the result is announced through the CDK `LiveAnnouncer`.
- **Labels are inputs,** so applications can translate them.
- `visibility: hidden` also removes the inactive label from the accessibility tree, so the
  button's accessible name is always the visible label.

### How to make this hold across the library

Run the library's own test suite with `provideZonelessChangeDetection()`. A component that only
works because zone.js happens to trigger change detection will then fail in tests instead of in a
product.

## Scoring

| Area | Strong signal | Weak signal |
| --- | --- | --- |
| Zoneless model | Explains what schedules change detection without zone.js | Says "call `detectChanges()`" |
| Fix | Signals for template state, render hooks for DOM work | Injects `ChangeDetectorRef` and marks for check after every line |
| Timers | Clears the previous timer and cleans up on destroy | Misses the double-click bug |
| Judgement | Replaces the measurement with CSS; handles errors and announcements | Fixes `onStable` and keeps measuring |

## Follow-up questions

1. Which Angular APIs schedule change detection in a zoneless application? Which do not?
2. A third-party chart library calls back outside Angular. What do you do with the data it
   provides?
3. How would you find every component in a large library that only works with zone.js?

## References

- [Angular: Zoneless](https://angular.dev/guide/zoneless)
- [Angular API: `afterNextRender`](https://angular.dev/api/core/afterNextRender)
- [Angular CDK: Accessibility (`LiveAnnouncer`)](https://material.angular.dev/cdk/a11y/overview)
- [MDN: `Clipboard.writeText()`](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/writeText)

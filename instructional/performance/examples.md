# Complete source examples

These marked complete modules are copied from the source questions. Scenario modules intentionally contain behavioral defects. Other slide excerpts are partial, including test pseudocode and package-layout sketches. Supplemental corrected modules are documented separately.

## PERF-001 · Scenario · excerpt 1

Complete verified TypeScript module.

```ts
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

## PERF-001 · Answer · excerpt 2

Complete verified TypeScript module.

```ts
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

## Supplemental example

[guarded-copy-button.ts](examples/guarded-copy-button.ts) — Ignores stale clipboard completions and completions after destruction. The resetDelay input permits deterministic short-delay checks.

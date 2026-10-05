import { Component, DestroyRef, inject, input, signal } from '@angular/core';
import { LiveAnnouncer } from '@angular/cdk/a11y';

@Component({
  selector: 'lesson-copy-button',
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
export class GuardedCopyButtonComponent {
  readonly text = input.required<string>();
  readonly resetDelay = input(2000);
  readonly copyLabel = input('Copy');
  readonly copiedLabel = input('Copied');
  readonly failedMessage = input('Could not copy to the clipboard');

  protected readonly copied = signal(false);
  private readonly announcer = inject(LiveAnnouncer);
  private requestId = 0;
  private destroyed = false;
  private timer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    inject(DestroyRef).onDestroy(() => { this.destroyed = true; this.requestId++; clearTimeout(this.timer); });
  }

  protected async copy(): Promise<void> {
    const request = ++this.requestId;
    clearTimeout(this.timer);
    try {
      await navigator.clipboard.writeText(this.text());
    } catch {
      if (this.destroyed || request !== this.requestId) return;
      this.copied.set(false);
      void this.announcer.announce(this.failedMessage(), 'assertive');
      return;
    }
    if (this.destroyed || request !== this.requestId) return;
    clearTimeout(this.timer);
    this.copied.set(true);
    void this.announcer.announce(this.copiedLabel());
    this.timer = setTimeout(() => this.copied.set(false), this.resetDelay());
  }
}


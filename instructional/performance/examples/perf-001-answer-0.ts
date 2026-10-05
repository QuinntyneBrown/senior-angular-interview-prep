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


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


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


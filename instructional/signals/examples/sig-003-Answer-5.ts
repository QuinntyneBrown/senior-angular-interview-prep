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


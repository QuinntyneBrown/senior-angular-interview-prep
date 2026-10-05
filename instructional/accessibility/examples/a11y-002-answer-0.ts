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


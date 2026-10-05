import { Component, input, output } from '@angular/core';

@Component({
  selector: 'ui-button',
  template: `
    <button
      type="button"
      [class]="'ui-button ui-button--' + kind()"
      [disabled]="disabled()"
      (click)="click.emit($event)">
      <ng-content />
    </button>
  `,
})
export class ButtonComponent {
  readonly kind = input('primary');
  readonly disabled = input(false);
  readonly click = output<MouseEvent>();
}


import { Component, booleanAttribute, input } from '@angular/core';

export type ButtonKind = 'primary' | 'secondary' | 'danger';
export type ButtonType = 'button' | 'submit' | 'reset';

@Component({
  selector: 'ui-button',
  styles: `:host { display: inline-block; }`,
  template: `
    <button
      class="ui-button"
      [class]="'ui-button--' + kind()"
      [type]="type()"
      [disabled]="disabled()">
      <ng-content />
    </button>
  `,
})
export class ButtonComponent {
  readonly kind = input<ButtonKind>('primary');
  readonly type = input<ButtonType>('button');
  readonly disabled = input(false, { transform: booleanAttribute });
}


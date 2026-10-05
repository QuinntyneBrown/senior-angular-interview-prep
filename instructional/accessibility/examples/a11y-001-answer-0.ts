import { Component, booleanAttribute, input, output } from '@angular/core';

@Component({
  selector: 'ui-icon-button',
  template: `
    <button
      type="button"
      class="ui-icon-button"
      [attr.aria-label]="label()"
      [attr.aria-disabled]="disabled() || null"
      (click)="handleClick()">
      <span class="ui-icon" aria-hidden="true">{{ icon() }}</span>
    </button>
  `,
})
export class IconButtonComponent {
  readonly icon = input.required<string>();
  readonly label = input.required<string>();
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly pressed = output<void>();

  handleClick(): void {
    if (!this.disabled()) this.pressed.emit();
  }
}


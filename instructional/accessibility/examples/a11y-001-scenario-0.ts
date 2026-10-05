import { Component, input, output } from '@angular/core';

@Component({
  selector: 'ui-icon-button',
  template: `
    <div
      class="ui-icon-button"
      [class.ui-icon-button--disabled]="disabled()"
      (click)="handleClick()">
      <span class="ui-icon">{{ icon() }}</span>
    </div>
  `,
})
export class IconButtonComponent {
  readonly icon = input.required<string>();
  readonly disabled = input(false);
  readonly pressed = output<void>();

  handleClick(): void {
    if (!this.disabled()) this.pressed.emit();
  }
}


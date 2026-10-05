import { Component, model } from '@angular/core';

@Component({
  selector: 'ui-switch',
  template: `
    <button type="button" role="switch" [attr.aria-checked]="checked()" (click)="flip()">
      <ng-content />
    </button>
  `,
})
export class SwitchComponent {
  readonly checked = model(false);

  flip(): void {
    this.checked.update(on => !on);
  }
}


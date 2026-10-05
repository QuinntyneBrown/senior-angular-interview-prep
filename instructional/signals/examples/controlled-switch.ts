import { Component, booleanAttribute, input, output } from '@angular/core';

@Component({
  selector: 'lesson-controlled-switch',
  template: `<button type="button" role="switch" [attr.aria-checked]="checked()"
    [disabled]="disabled()" (click)="requestFlip()"><ng-content /></button>`,
})
export class ControlledSwitch {
  readonly checked = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly checkedChangeRequest = output<boolean>();
  requestFlip(): void {
    if (!this.disabled()) this.checkedChangeRequest.emit(!this.checked());
  }
}

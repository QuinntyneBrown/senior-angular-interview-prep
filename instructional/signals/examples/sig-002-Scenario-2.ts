import { Component, OnInit, input, output, signal } from '@angular/core';

@Component({
  selector: 'ui-switch',
  template: `
    <button type="button" role="switch" [attr.aria-checked]="isOn()" (click)="flip()">
      <ng-content />
    </button>
  `,
})
export class SwitchComponent implements OnInit {
  readonly checked = input(false);
  readonly checkedChange = output<boolean>();
  protected readonly isOn = signal(false);

  ngOnInit(): void {
    this.isOn.set(this.checked());
  }

  flip(): void {
    this.isOn.set(!this.isOn());
    this.checkedChange.emit(this.isOn());
  }
}


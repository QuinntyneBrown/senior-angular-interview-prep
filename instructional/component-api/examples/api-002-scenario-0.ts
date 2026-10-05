import { Component, input, model } from '@angular/core';

@Component({
  selector: 'ui-input',
  template: `
    <input
      class="ui-input"
      [type]="type()"
      [placeholder]="placeholder()"
      [value]="value()"
      (input)="value.set($any($event.target).value)" />
  `,
})
export class InputComponent {
  readonly type = input('text');
  readonly placeholder = input('');
  readonly value = model('');
}


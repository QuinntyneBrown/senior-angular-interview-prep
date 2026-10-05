import { Component, input, model } from '@angular/core';

@Component({
  selector: 'ui-dialog',
  template: `
    @if (open()) {
      <div class="ui-dialog__backdrop" (click)="open.set(false)"></div>
      <div class="ui-dialog" role="dialog">
        <h2 class="ui-dialog__title">{{ heading() }}</h2>
        <ng-content />
        <span class="ui-dialog__close" (click)="open.set(false)">×</span>
      </div>
    }
  `,
})
export class DialogComponent {
  readonly open = model(false);
  readonly heading = input.required<string>();
}


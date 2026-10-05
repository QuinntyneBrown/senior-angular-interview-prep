import { Component, contentChildren, input, signal } from '@angular/core';

@Component({
  selector: 'ui-tab',
  host: { class: 'ui-tab-panel', '[hidden]': '!active()' },
  template: `<ng-content />`,
})
export class TabComponent {
  readonly label = input.required<string>();
  readonly active = signal(false);
}

@Component({
  selector: 'ui-tabs',
  template: `
    <div class="ui-tabs__list">
      @for (tab of tabs(); track tab; let i = $index) {
        <div
          id="tab-{{ i }}"
          class="ui-tabs__tab"
          [class.ui-tabs__tab--active]="tab.active()"
          (click)="select(i)">
          {{ tab.label() }}
        </div>
      }
    </div>
    <ng-content />
  `,
})
export class TabsComponent {
  readonly tabs = contentChildren(TabComponent);

  select(index: number): void {
    this.tabs().forEach((tab, i) => tab.active.set(i === index));
  }
}


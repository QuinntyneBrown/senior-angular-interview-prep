import { Component, Directive, computed, contentChild } from '@angular/core';

@Directive({ selector: '[uiCardTitle]', host: { class: 'ui-card__title' } })
export class CardTitleDirective {}

@Directive({ selector: '[uiCardSubtitle]', host: { class: 'ui-card__subtitle' } })
export class CardSubtitleDirective {}

@Directive({ selector: '[uiCardMedia]', host: { class: 'ui-card__media' } })
export class CardMediaDirective {}

@Component({
  selector: 'ui-card-actions',
  host: { class: 'ui-card__actions' },
  template: `<ng-content />`,
})
export class CardActionsComponent {}

@Component({
  selector: 'ui-card',
  host: { class: 'ui-card' },
  template: `
    <ng-content select="[uiCardMedia]" />
    @if (hasHeader()) {
      <div class="ui-card__header">
        <ng-content select="[uiCardTitle]" />
        <ng-content select="[uiCardSubtitle]" />
      </div>
    }
    <div class="ui-card__body">
      <ng-content />
    </div>
    <ng-content select="ui-card-actions" />
  `,
})
export class CardComponent {
  private readonly title = contentChild(CardTitleDirective);
  protected readonly hasHeader = computed(() => this.title() !== undefined);
}


import { Component, input } from '@angular/core';

export interface CardAction {
  label: string;
  handler: () => void;
}

@Component({
  selector: 'ui-card',
  template: `
    <article class="ui-card">
      @if (image()) {
        <img class="ui-card__image" [src]="image()" />
      }
      <div class="ui-card__header">
        @if (icon()) {
          <span class="ui-icon">{{ icon() }}</span>
        }
        <h3 class="ui-card__title">{{ title() }}</h3>
        @if (subtitle()) {
          <p class="ui-card__subtitle">{{ subtitle() }}</p>
        }
        @if (badge()) {
          <span class="ui-badge">{{ badge() }}</span>
        }
      </div>
      <p class="ui-card__body" [innerHTML]="body()"></p>
      <div class="ui-card__actions">
        @for (action of actions(); track action.label) {
          <button type="button" (click)="action.handler()">{{ action.label }}</button>
        }
      </div>
    </article>
  `,
})
export class CardComponent {
  readonly title = input.required<string>();
  readonly subtitle = input<string>();
  readonly icon = input<string>();
  readonly image = input<string>();
  readonly badge = input<string>();
  readonly body = input('');
  readonly actions = input<CardAction[]>([]);
}


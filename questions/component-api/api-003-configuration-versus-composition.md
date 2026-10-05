---
id: API-003
title: A card with an input for everything
topic: component-api
format: code-review
difficulty: senior
minutes: 10
angular: "20+"
tags: [content-projection, composition, headings, api-surface]
---

# A card with an input for everything

## Scenario

`@acme/ui`'s card started with a title and a body. A year later it looks like this, and the open
requests include: "make the title a link", "two badges", "a link inside the body", "a menu instead
of buttons", and "our page needs an `h2`, not an `h3`". Three teams have copied the card into their
own code to get around it.

```ts verify
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
```

## Question

**What is wrong with this API, beyond the individual bugs? Redesign it, and plan the migration for
the teams already using it.**

## Hints

<details>
<summary>Hint 1</summary>

Who knows which heading level a card title should be: the card, or the page it is placed on?

</details>

<details>
<summary>Hint 2</summary>

Every request asks to put *something different* in a region the card already has.

</details>

## Answer

### 1. Configuration does not scale; composition does

Each input describes one fixed piece of content. Every new layout needs a new input, the inputs
interact in ways nobody tested, and anything the inputs cannot express (a link title, a menu, two
badges) forces teams to fork. Forks are the worst outcome for a design system: they stop receiving
fixes and drift visually.

The card's real job is **layout and styling of regions**: media, header, body, actions. What goes
in each region belongs to the consumer.

### 2. Individual bugs the configuration style caused

- **Fixed heading level.** `h3` is right on some pages and wrong on others. Heading levels describe
  the page's outline; a reusable component cannot know it. A wrong level breaks navigation by
  headings, which is how many screen-reader users skim a page.
- **Image without `alt`.** The `img` has no `alt`, so some screen readers read the file name. The
  card cannot know whether the image is decorative (`alt=""`) or meaningful.
- **`[innerHTML]` body.** Angular sanitizes it, but the sanitizer silently strips content teams
  expect (styles, many attributes), and it encourages teams to reach for
  `bypassSecurityTrustHtml`, which opens an injection risk. Projected content needs neither.
- **Actions as data.** A `{ label, handler }` list cannot express links, menus, icons or
  `aria-label`. Each new need becomes another field.

### Redesigned API

```ts verify
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
```

```html
<ui-card>
  <img uiCardMedia src="/img/order.jpg" alt="" />
  <h2 uiCardTitle><a href="/orders/42">Order #42</a></h2>
  <p uiCardSubtitle>Shipped 3 June</p>
  <p>Two items. <a href="/help/returns">Returns policy</a></p>
  <ui-card-actions>
    <button uiButton type="button">Track</button>
    <ui-menu-button label="More actions" />
  </ui-card-actions>
</ui-card>
```

Every request is now satisfied without a library change: the consumer picks the heading level, the
link, the badge count and the action controls, and writes the `alt` text.

The marker directives are more than selectors: they apply the styling class, they appear in
autocomplete and documentation, and the card can query them (as `hasHeader` does) to avoid
rendering empty wrappers.

### Trade-offs to state

- **Less enforced consistency.** Consumers can now put anything in a region. Mitigate with marker
  directives, good documentation examples, and visual review, rather than by taking control back.
- **Projection rules.** `select` matches only elements written directly inside `<ui-card>` in the
  consumer's template. Content wrapped in another element or an `<ng-container>` needs
  `ngProjectAs`. Projected content is always created by the parent, even inside an `@if` in the
  card (see A11Y-002).
- **Not everything should be a slot.** Values the card must interpret (for example an `elevation`
  that maps to tokens) stay as typed inputs.

### Migration

Removing seven inputs is breaking. Ship the slot API in a minor release and keep the old inputs
working (the template can render the legacy markup when `title()` is set and project otherwise).
Mark the inputs `@deprecated` with a pointer to the slot equivalent, provide an `ng update`
schematic for the simple cases, and remove them in the next major.

## Scoring

| Area | Strong signal | Weak signal |
| --- | --- | --- |
| Diagnosis | Names configuration versus composition as the root issue | Adds the requested inputs |
| Accessibility | Heading level and `alt` belong to the consumer | Adds a `headingLevel` input and stops there |
| Security | Removes `[innerHTML]` in favour of projection | Keeps `innerHTML` because Angular sanitizes |
| Migration | Runs both APIs side by side and deprecates | Breaks every call site in a minor |

## Follow-up questions

1. When would you still choose a configuration (data-driven) API, for example for a data table's
   columns?
2. How would you make the entire card clickable while keeping the title link and action buttons
   accessible?
3. How do you document slots so consumers discover them in their editor?

## References

- [Angular: Content projection with `ng-content`](https://angular.dev/guide/components/content-projection)
- [Angular: Security and sanitization](https://angular.dev/best-practices/security)
- [WAI tutorial: Page structure, headings](https://www.w3.org/WAI/tutorials/page-structure/headings/)
- [WAI tutorial: Images, decorative images](https://www.w3.org/WAI/tutorials/images/decorative/)

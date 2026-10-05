import { Component, ElementRef, computed, effect, inject, input, isDevMode } from '@angular/core';

export type ButtonVariant = 'primary' | 'secondary' | 'danger';

let warnedAboutKind = false;

@Component({
  selector: 'ui-button',
  template: `
    <button type="button" [class]="'ui-button ui-button--' + resolvedVariant()">
      <ng-content />
    </button>
  `,
})
export class ButtonComponent {
  /** @deprecated Use `variant` instead. `kind` will be removed in v5.0.0. */
  readonly kind = input<ButtonVariant>();
  readonly variant = input<ButtonVariant>();

  protected readonly resolvedVariant = computed(() => this.variant() ?? this.kind() ?? 'primary');

  constructor() {
    if (isDevMode()) {
      const host = inject(ElementRef).nativeElement;
      effect(() => {
        if (this.kind() === undefined || warnedAboutKind) return;
        warnedAboutKind = true;
        console.warn('ui-button: the `kind` input is deprecated and will be removed in v5.0.0. Use `variant`.', host);
      });
    }
  }
}


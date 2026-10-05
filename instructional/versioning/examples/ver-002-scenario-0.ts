import { Component, computed, input, isDevMode } from '@angular/core';

export type ButtonVariant = 'primary' | 'secondary' | 'danger';

@Component({
  selector: 'ui-button',
  template: `
    <button type="button" [class]="'ui-button ui-button--' + resolvedVariant()">
      <ng-content />
    </button>
  `,
})
export class ButtonComponent {
  /** @deprecated Use `variant` instead. */
  readonly kind = input<ButtonVariant>('primary');
  readonly variant = input<ButtonVariant>('primary');

  protected readonly resolvedVariant = computed(() => {
    if (isDevMode()) {
      console.warn('ui-button: `kind` is deprecated, use `variant`.');
    }
    return this.kind() !== 'primary' ? this.kind() : this.variant();
  });
}


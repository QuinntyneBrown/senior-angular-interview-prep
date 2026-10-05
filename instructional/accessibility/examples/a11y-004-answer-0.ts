import { Component, booleanAttribute, computed, input } from '@angular/core';

let nextId = 0;

@Component({
  selector: 'ui-text-field',
  template: `
    <div class="ui-field">
      <label class="ui-field__label" [for]="inputId">
        {{ label() }}
        @if (required()) {
          <span class="ui-field__required" aria-hidden="true">*</span>
        }
      </label>
      @if (hint()) {
        <p class="ui-field__hint" [id]="hintId">{{ hint() }}</p>
      }
      <input
        class="ui-field__input"
        [id]="inputId"
        [required]="required()"
        [attr.aria-invalid]="error() ? true : null"
        [attr.aria-describedby]="describedBy()" />
      <p class="ui-field__error" [id]="errorId" aria-live="polite">
        @if (error(); as message) {
          <span class="ui-field__error-icon" aria-hidden="true">!</span>
          {{ message }}
        }
      </p>
    </div>
  `,
})
export class TextFieldComponent {
  readonly label = input.required<string>();
  readonly hint = input('');
  readonly error = input<string | null>(null);
  readonly required = input(false, { transform: booleanAttribute });

  protected readonly inputId = `ui-text-field-${nextId++}`;
  protected readonly hintId = `${this.inputId}-hint`;
  protected readonly errorId = `${this.inputId}-error`;
  protected readonly describedBy = computed(() => {
    const ids = [this.hint() ? this.hintId : '', this.error() ? this.errorId : ''].filter(id => id !== '');
    return ids.length > 0 ? ids.join(' ') : null;
  });
}


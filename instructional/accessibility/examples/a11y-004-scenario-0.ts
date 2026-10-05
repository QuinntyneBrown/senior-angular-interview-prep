import { Component, input } from '@angular/core';

@Component({
  selector: 'ui-text-field',
  template: `
    <div class="ui-field">
      <span class="ui-field__label">
        {{ label() }}
        @if (required()) {
          <span class="ui-field__required">*</span>
        }
      </span>
      <input class="ui-field__input" [placeholder]="hint()" [class.ui-field__input--error]="!!error()" />
      @if (error()) {
        <span class="ui-field__error">{{ error() }}</span>
      }
    </div>
  `,
})
export class TextFieldComponent {
  readonly label = input.required<string>();
  readonly hint = input('');
  readonly error = input<string | null>(null);
  readonly required = input(false);
}


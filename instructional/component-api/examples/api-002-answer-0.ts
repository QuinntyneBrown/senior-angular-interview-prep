import { Directive, booleanAttribute, input } from '@angular/core';

@Directive({
  selector: 'input[uiInput], textarea[uiInput]',
  host: {
    class: 'ui-input',
    '[class.ui-input--invalid]': 'invalid()',
    '[attr.aria-invalid]': 'invalid() || null',
  },
})
export class InputDirective {
  readonly invalid = input(false, { transform: booleanAttribute });
}


import { ChangeDetectionStrategy, Component, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'ui-checkbox',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => CheckboxComponent), multi: true },
  ],
  template: `
    <label class="ui-checkbox">
      <input type="checkbox" [checked]="checked" (change)="toggle()" />
      <ng-content />
    </label>
  `,
})
export class CheckboxComponent implements ControlValueAccessor {
  checked = false;
  private onChange: (value: boolean) => void = () => {};

  writeValue(value: boolean): void {
    this.checked = value;
    this.onChange(value);
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(): void {}

  toggle(): void {
    this.checked = !this.checked;
    this.onChange(this.checked);
  }
}


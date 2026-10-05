import '@angular/compiler';
import { Component, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { TestKey } from '@angular/cdk/testing';
import { IconButtonComponent } from '../../instructional/accessibility/examples/a11y-001-answer-0';
import { DialogComponent } from '../../instructional/accessibility/examples/a11y-002-answer-0';
import { TabsComponent, TabComponent } from '../../instructional/accessibility/examples/a11y-003-answer-0';
import { TextFieldComponent } from '../../instructional/accessibility/examples/a11y-004-answer-0';
import { CyclingListboxComponent } from '../../instructional/accessibility/examples/cycling-listbox';
import { ButtonComponent } from '../../instructional/component-api/examples/api-001-answer-1';
import { InputDirective } from '../../instructional/component-api/examples/api-002-answer-0';
import { CardComponent, CardTitleDirective, CardActionsComponent } from '../../instructional/component-api/examples/api-003-answer-0';
import { ToastOutletComponent, ToastService } from '../../instructional/accessibility/examples/a11y-005-answer-0';
import { CheckboxComponent } from '../../instructional/component-api/examples/api-004-answer-0';
import { ButtonComponent as DeprecatedButton } from '../../instructional/versioning/examples/ver-002-answer-0';
import { TabsHarness } from '../../instructional/testing/examples/tst-001-answer-4';
import { GuardedCopyButtonComponent } from '../../instructional/performance/examples/guarded-copy-button';

const results: Record<string, string[]> = Object.fromEntries(['accessibility', 'component-api', 'versioning', 'testing', 'performance'].map(t => [t, []]));
const assert = (topic: string, condition: unknown, name: string) => { if (!condition) throw new Error(`${topic}: ${name}`); results[topic].push(name); };
TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting());
function setup(providers: any[] = []) { TestBed.resetTestingModule(); TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection(), ...providers] }); }
const key = (element: Element, value: string) => element.dispatchEvent(new KeyboardEvent('keydown', { key: value, bubbles: true, cancelable: true }));
const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

@Component({ imports: [TabsComponent, TabComponent], template: `<ui-tabs label="Profile"><ui-tab label="Account">Account settings</ui-tab><ui-tab label="Security">Security settings</ui-tab></ui-tabs><ui-tabs label="Notifications"><ui-tab label="Email">Email settings</ui-tab></ui-tabs>` })
class TabsHost {}
@Component({ imports: [CheckboxComponent, ReactiveFormsModule], template: `<ui-checkbox [formControl]="control">Terms</ui-checkbox>` })
class FormsHost { control = new FormControl(false); }
@Component({ imports: [ButtonComponent], template: `<ui-button (click)="calls = calls + 1">Save</ui-button><ui-button disabled (click)="disabledCalls = disabledCalls + 1">Disabled</ui-button>` })
class ButtonsHost { calls = 0; disabledCalls = 0; }
@Component({ imports: [DialogComponent], template: `<button id="opener" (click)="dialog.open.set(true)">Open</button><button id="background">Background</button><ui-dialog #dialog heading="Confirm deletion"><button id="safe">Cancel</button></ui-dialog>` })
class DialogHost {}
@Component({ imports: [InputDirective, ReactiveFormsModule], template: `<label for="native-email">Email</label><input uiInput id="native-email" autocomplete="email" inputmode="email" maxlength="120" [formControl]="control">` })
class NativeInputHost { control = new FormControl('initial'); }
@Component({ imports: [CardComponent, CardTitleDirective, CardActionsComponent], template: `<ui-card><h2 uiCardTitle><a href="#order">Order</a></h2><p>Delivery details</p><ui-card-actions><button type="button" (click)="calls = calls + 1">Track</button></ui-card-actions></ui-card>` })
class CardHost { calls = 0; }

async function run() {
  setup();
  const icon = TestBed.createComponent(IconButtonComponent);
  icon.componentRef.setInput('label', 'Delete invoice'); icon.componentRef.setInput('icon', 'delete');
  await icon.whenStable();
  assert('accessibility', icon.nativeElement.querySelector('button').getAttribute('aria-label') === 'Delete invoice', 'Icon button has action name');
  assert('accessibility', icon.nativeElement.querySelector('[aria-hidden="true"]'), 'Icon is hidden from accessible naming');
  icon.destroy();

  setup();
  const tabs = TestBed.createComponent(TabsHost);
  await tabs.whenStable();
  const buttons = tabs.nativeElement.querySelectorAll('[role="tab"]') as NodeListOf<HTMLButtonElement>;
  assert('accessibility', buttons[0].getAttribute('aria-selected') === 'true', 'First tab initially selected');
  buttons[0].focus(); key(buttons[0], 'ArrowRight'); await tabs.whenStable();
  assert('accessibility', document.activeElement === buttons[1], 'ArrowRight moves actual DOM focus');
  assert('accessibility', buttons[1].getAttribute('aria-selected') === 'true', 'Automatic activation updates selected state');
  key(buttons[1], 'ArrowRight'); await tabs.whenStable();
  assert('accessibility', document.activeElement === buttons[0], 'ArrowRight wraps within group');
  key(buttons[0], 'End'); await tabs.whenStable();
  assert('accessibility', document.activeElement === buttons[1], 'End reaches final tab');
  key(buttons[1], 'Home'); await tabs.whenStable();
  assert('accessibility', document.activeElement === buttons[0], 'Home reaches first tab');
  const ids = [...tabs.nativeElement.querySelectorAll('[id]')].map(e => e.id);
  assert('accessibility', new Set(ids).size === ids.length, 'Multiple groups have unique identifiers');
  assert('accessibility', [...buttons].every(b => !!document.getElementById(b.getAttribute('aria-controls')!)), 'Every tab references a rendered panel');
  const loader = TestbedHarnessEnvironment.loader(tabs);
  const harness = await loader.getHarness(TabsHarness.with({ label: 'Profile' }));
  assert('testing', await harness.getSelectedTabLabel() === 'Account', 'Harness filters a group by public label');
  await harness.selectTab('Security');
  assert('testing', await harness.getSelectedTabLabel() === 'Security', 'Harness selects by label through event path');
  await harness.pressKeyOnSelectedTab(TestKey.RIGHT_ARROW);
  assert('testing', await harness.getSelectedTabLabel() === 'Account', 'Harness keyboard operation wraps');
  assert('testing', await harness.isSelectedTabFocused(), 'Harness reports actual focus');
  assert('testing', (await harness.getTabLabels()).join(',') === 'Account,Security', 'Harness remains scoped to selected group');
  tabs.destroy();

  setup();
  const field = TestBed.createComponent(TextFieldComponent);
  field.componentRef.setInput('label', 'Email'); field.componentRef.setInput('hint', 'Work address');
  await field.whenStable();
  const input = field.nativeElement.querySelector('input') as HTMLInputElement;
  assert('accessibility', field.nativeElement.querySelector('label').htmlFor === input.id, 'Label targets the actual input');
  const live = field.nativeElement.querySelector('[aria-live]');
  assert('accessibility', live.isConnected && !live.textContent.trim(), 'Empty error live region exists before message');
  field.componentRef.setInput('error', 'Enter a valid email'); await field.whenStable();
  assert('accessibility', field.nativeElement.querySelector('[aria-live]') === live, 'Error uses persistent live region');
  assert('accessibility', input.getAttribute('aria-invalid') === 'true', 'Error sets invalid state');
  assert('accessibility', input.getAttribute('aria-describedby')!.split(' ').length === 2, 'Hint and error are both descriptions');
  field.componentRef.setInput('error', null); await field.whenStable();
  assert('accessibility', !input.hasAttribute('aria-invalid'), 'Clearing error removes invalid state');
  field.destroy();

  setup();
  const outlet = TestBed.createComponent(ToastOutletComponent); await outlet.whenStable();
  const toastService = TestBed.inject(ToastService);
  const politeRegion = outlet.nativeElement.querySelector('[aria-live="polite"]');
  const assertiveRegion = outlet.nativeElement.querySelector('[aria-live="assertive"]');
  assert('accessibility', politeRegion.isConnected && assertiveRegion.isConnected, 'Toast live regions exist before notifications');
  const focusBefore = document.activeElement;
  const saved = toastService.show('Saved', { duration: null }); await outlet.whenStable();
  assert('accessibility', outlet.nativeElement.querySelector('[aria-live="polite"]') === politeRegion, 'Toast updates persistent polite region');
  assert('accessibility', politeRegion.textContent.includes('Saved'), 'Success message reaches polite region');
  assert('accessibility', document.activeElement === focusBefore, 'Notification does not steal focus');
  toastService.show('Connection lost', { politeness: 'assertive', duration: null }); await outlet.whenStable();
  assert('accessibility', assertiveRegion.textContent.includes('Connection lost') && !assertiveRegion.textContent.includes('Saved'), 'Urgent and routine messages use separate regions');
  toastService.dismiss(saved); await outlet.whenStable();
  assert('accessibility', !politeRegion.textContent.includes('Saved'), 'Dismissal removes the visible message');
  outlet.destroy();

  setup();
  const list = TestBed.createComponent(CyclingListboxComponent<string>);
  const options = [{ value: 'ca', label: 'Canada' }, { value: 'cl', label: 'Chile' }, { value: 'cn', label: 'China', disabled: true }, { value: 'us', label: 'United States' }];
  list.componentRef.setInput('label', 'Country'); list.componentRef.setInput('options', options); await list.whenStable();
  const box = list.nativeElement.querySelector('[role="listbox"]') as HTMLElement;
  const active = () => document.getElementById(box.getAttribute('aria-activedescendant')!)?.textContent?.trim();
  box.focus(); key(box, 'ArrowDown'); await list.whenStable();
  assert('accessibility', active() === 'Chile', 'Arrow navigation changes active option');
  assert('accessibility', list.componentInstance.value() === null, 'Navigation does not commit selection');
  key(box, 'ArrowDown'); await list.whenStable();
  assert('accessibility', active() === 'United States', 'Navigation skips disabled option');
  key(box, 'Home'); key(box, 'c'); await list.whenStable();
  assert('accessibility', active() === 'Chile', 'First character searches from next option');
  key(box, 'c'); await list.whenStable();
  assert('accessibility', active() === 'Canada', 'Repeated character cycles enabled matches');
  key(box, 'Enter'); await list.whenStable();
  assert('accessibility', list.componentInstance.value() === 'ca', 'Enter commits active value');
  assert('accessibility', document.activeElement === box, 'Active descendant keeps DOM focus on listbox');
  assert('accessibility', options[0].value === 'ca' && options.length === 4, 'Consumer option array remains unchanged');
  list.componentRef.setInput('options', [{ value: 'x', label: 'Unavailable', disabled: true }]); await list.whenStable();
  assert('accessibility', !box.hasAttribute('aria-activedescendant'), 'All-disabled list removes active reference');
  key(box, 'Enter'); await list.whenStable();
  assert('accessibility', list.componentInstance.value() === 'ca', 'All-disabled navigation does not change value');
  list.componentRef.setInput('options', []); await list.whenStable();
  assert('accessibility', !box.hasAttribute('aria-activedescendant'), 'Empty options have no invalid active reference');
  list.destroy();

  setup();
  const button = TestBed.createComponent(ButtonsHost); await button.whenStable();
  const controls = button.nativeElement.querySelectorAll('button'); controls[0].click(); await button.whenStable();
  assert('component-api', button.componentInstance.calls === 1, 'One native click produces one consumer action');
  controls[1].click(); await button.whenStable();
  assert('component-api', controls[1].disabled && button.componentInstance.disabledCalls === 0, 'Boolean attribute disables native activation');
  assert('component-api', controls[0].type === 'button', 'Default button does not submit a form');
  button.destroy();

  setup();
  const native = TestBed.createComponent(NativeInputHost); await native.whenStable();
  const nativeInput = native.nativeElement.querySelector('input') as HTMLInputElement;
  assert('component-api', nativeInput.autocomplete === 'email' && nativeInput.maxLength === 120, 'Native capabilities remain on actual enhanced input');
  assert('component-api', native.nativeElement.querySelector('label').htmlFor === nativeInput.id, 'Enhanced input keeps native label connection');
  native.componentInstance.control.setValue('updated'); await native.whenStable();
  assert('component-api', nativeInput.value === 'updated', 'Enhanced native input retains forms model-to-view integration');
  nativeInput.value = 'user'; nativeInput.dispatchEvent(new Event('input', { bubbles: true })); await native.whenStable();
  assert('component-api', native.componentInstance.control.value === 'user', 'Enhanced native input retains forms user-to-model integration');
  native.destroy();

  setup();
  const card = TestBed.createComponent(CardHost); await card.whenStable();
  assert('component-api', card.nativeElement.querySelector('h2 a').textContent === 'Order', 'Projected title preserves consumer heading and link semantics');
  assert('component-api', card.nativeElement.querySelector('.ui-card__body').textContent.includes('Delivery details'), 'Default slot preserves consumer body content');
  card.nativeElement.querySelector('button').click(); await card.whenStable();
  assert('component-api', card.componentInstance.calls === 1, 'Projected action retains consumer event binding');
  card.destroy();

  setup();
  const forms = TestBed.createComponent(FormsHost); await forms.whenStable();
  const control = forms.componentInstance.control;
  const check = forms.nativeElement.querySelector('input') as HTMLInputElement;
  control.setValue(true); await forms.whenStable();
  assert('component-api', check.checked && control.pristine, 'Programmatic write renders and stays pristine');
  control.reset(); await forms.whenStable();
  assert('component-api', !check.checked && control.pristine && control.untouched, 'Null reset normalizes without user callbacks');
  check.click(); await forms.whenStable();
  assert('component-api', control.value === true && control.dirty, 'Native user change updates forms model and dirty state');
  check.dispatchEvent(new Event('blur')); await forms.whenStable();
  assert('component-api', control.touched, 'Blur reports touched state');
  control.disable(); await forms.whenStable();
  assert('component-api', check.disabled, 'Forms disabled state reaches native control');
  forms.destroy();

  setup();
  const warnings: unknown[][] = []; const warn = console.warn; console.warn = (...args) => warnings.push(args);
  try {
    const current = TestBed.createComponent(DeprecatedButton); current.componentRef.setInput('variant', 'danger'); await current.whenStable();
    assert('versioning', warnings.length === 0, 'New name does not warn'); current.destroy();
    const old = TestBed.createComponent(DeprecatedButton); old.componentRef.setInput('kind', 'secondary'); await old.whenStable();
    assert('versioning', old.nativeElement.querySelector('button').classList.contains('ui-button--secondary'), 'Old input retains rendered behavior');
    assert('versioning', warnings.length === 1, 'Deprecated usage warns once');
    old.componentRef.setInput('variant', 'danger'); await old.whenStable();
    assert('versioning', old.nativeElement.querySelector('button').classList.contains('ui-button--danger'), 'New name wins when both are set');
    old.componentRef.setInput('kind', 'primary'); await old.whenStable();
    assert('versioning', old.nativeElement.querySelector('button').classList.contains('ui-button--danger'), 'Explicit old default cannot override new value');
    assert('versioning', warnings.length === 1, 'Recomputations do not flood warnings'); old.destroy();
    const defaults = TestBed.createComponent(DeprecatedButton); await defaults.whenStable();
    assert('versioning', defaults.nativeElement.querySelector('button').classList.contains('ui-button--primary'), 'Rendered default is preserved');
    assert('versioning', defaults.componentInstance.kind() === undefined, 'Direct old getter change is documented as observable'); defaults.destroy();
  } finally { console.warn = warn; }

  setup([{ provide: LiveAnnouncer, useValue: { announce: (text: string) => { announcements.push(text); return Promise.resolve(); } } }]);
  const announcements: string[] = [];
  const pending: { resolve: () => void; reject: () => void }[] = [];
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: () => new Promise<void>((resolve, reject) => pending.push({ resolve, reject })) } });
  const copy = TestBed.createComponent(GuardedCopyButtonComponent); copy.componentRef.setInput('text', 'hello'); copy.componentRef.setInput('resetDelay', 80); await copy.whenStable();
  const copyButton = copy.nativeElement.querySelector('button') as HTMLButtonElement;
  const width = copyButton.getBoundingClientRect().width;
  copyButton.click(); pending[0].resolve(); await copy.whenStable();
  assert('performance', !copy.nativeElement.querySelectorAll('span span')[1].classList.contains('ui-copy-button__label--hidden'), 'Async success renders without forced detectChanges');
  assert('performance', Math.abs(copyButton.getBoundingClientRect().width - width) < .5, 'Intrinsic grid keeps width stable');
  await delay(100); await copy.whenStable();
  assert('performance', copy.nativeElement.querySelectorAll('span span')[1].classList.contains('ui-copy-button__label--hidden'), 'Timer reset renders through signal notification');
  copyButton.click(); copyButton.click(); pending[2].resolve(); await copy.whenStable();
  const count = announcements.length; pending[1].resolve(); await copy.whenStable();
  assert('performance', announcements.length === count, 'Stale success completion is ignored');
  copyButton.click(); pending[3].reject(); await copy.whenStable();
  assert('performance', announcements.at(-1) === 'Could not copy to the clipboard', 'Failure is caught and reported');
  copyButton.click(); copy.destroy(); const before = announcements.length; pending[4].resolve(); await delay(100);
  assert('performance', announcements.length === before, 'Completion after destroy does not announce or schedule reset');

  // Leave a native dialog host available for Playwright's real Tab/Escape checks.
  setup(); const dialog = TestBed.createComponent(DialogHost); await dialog.whenStable();
  (window as any).__dialogFixture = dialog;
  (window as any).__lessonResults = Object.fromEntries(Object.entries(results).map(([topic, assertions]) => [topic, { passed: assertions.length, assertions }]));
}
run().catch(error => { (window as any).__lessonResults = { error: String(error.stack ?? error) }; });


import '@angular/compiler';
import { Component, computed, effect, provideZonelessChangeDetection, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { ChipGroupComponent } from '../../instructional/signals/examples/sig-001-Answer-1';
import { SwitchComponent } from '../../instructional/signals/examples/sig-002-Answer-3';
import { PopoverComponent } from '../../instructional/signals/examples/sig-003-Answer-5';
import { TableComponent } from '../../instructional/signals/examples/sig-004-Answer-7';
import { ControlledSwitch } from '../../instructional/signals/examples/controlled-switch';

const results: string[] = [];
function assert(condition: unknown, message: string): void {
  if (!condition) throw new Error(message);
  results.push(message);
}
TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting());
function setup() {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
}

@Component({ imports: [SwitchComponent], template: `<ui-switch [checked]="accepted" (checkedChange)="requested = $event">Share data</ui-switch>` })
class RejectedModel { accepted = false; requested = false; }
@Component({ imports: [SwitchComponent], template: `<ui-switch [(checked)]="accepted" (checkedChange)="accepted = false">Share data</ui-switch>` })
class ImmediateRollback { accepted = false; }
@Component({ imports: [ControlledSwitch], template: `<lesson-controlled-switch [checked]="accepted" (checkedChangeRequest)="request($event)">Share data</lesson-controlled-switch>` })
class ControlledHost {
  accepted = false;
  requested = false;
  allow = false;
  request(value: boolean): void { this.requested = value; if (this.allow) this.accepted = value; }
}
@Component({ imports: [SwitchComponent], template: `<ui-switch [(checked)]="accepted">Alerts</ui-switch>` })
class ResetHost { accepted = signal(false); }

async function run() {
  const list = signal<string[]>(['a']);
  const size = computed(() => list().length);
  assert(size() === 1, 'Computed starts at one item');
  list.update(values => { values.push('b'); return values; });
  assert(size() === 1, 'Same-reference mutation leaves the computed cached');
  list.update(values => [...values, 'c']);
  assert(size() === 3, 'Immutable update invalidates the computed');

  setup();
  const loopState = signal<readonly number[]>([]);
  let runs = 0;
  const loop = TestBed.runInInjectionContext(() => effect(() => {
    const value = loopState();
    runs++;
    if (runs < 4) loopState.set(value.filter(() => true));
  }));
  TestBed.tick();
  assert(runs === 4, 'Bounded feedback demonstration reruns despite equivalent array contents');
  loop.destroy();

  setup();
  const chips = TestBed.createComponent(ChipGroupComponent);
  chips.componentRef.setInput('options', [{ value: 'a', label: 'A', selected: true }, { value: 'b', label: 'B' }]);
  chips.detectChanges();
  assert(chips.componentInstance.selected().join() === 'a', 'Linked selection initializes from bound options');
  (chips.nativeElement.querySelectorAll('button')[1] as HTMLButtonElement).click();
  chips.detectChanges();
  assert(chips.componentInstance.selected().join() === 'a,b', 'Chip click immutably updates selection');
  assert(chips.nativeElement.querySelectorAll('button')[1].getAttribute('aria-pressed') === 'true', 'Chip pressed state reflects selection');
  chips.componentRef.setInput('options', [{ value: 'b', label: 'B' }]);
  chips.detectChanges();
  assert(chips.componentInstance.selected().join() === 'b', 'Options replacement prunes missing selections and preserves valid choices');
  chips.destroy();

  setup();
  const reset = TestBed.createComponent(ResetHost);
  reset.detectChanges();
  reset.nativeElement.querySelector('button').click();
  reset.detectChanges();
  await reset.whenStable();
  assert(reset.componentInstance.accepted() && reset.nativeElement.querySelector('button').getAttribute('aria-checked') === 'true', 'Model two-way binding accepts a user change');
  reset.componentInstance.accepted.set(false);
  reset.changeDetectorRef.markForCheck();
  reset.detectChanges();
  await reset.whenStable();
  assert(reset.nativeElement.querySelector('button').getAttribute('aria-checked') === 'false', 'Parent reset updates model-rendered state');
  reset.destroy();

  setup();
  const rejected = TestBed.createComponent(RejectedModel);
  rejected.detectChanges();
  rejected.nativeElement.querySelector('button').click();
  rejected.detectChanges();
  assert(!rejected.componentInstance.accepted && rejected.componentInstance.requested, 'One-way parent rejects the emitted model value');
  assert(rejected.nativeElement.querySelector('button').getAttribute('aria-checked') === 'true', 'Rejected model change remains locally committed');
  rejected.destroy();

  setup();
  const rollback = TestBed.createComponent(ImmediateRollback);
  rollback.detectChanges();
  rollback.nativeElement.querySelector('button').click();
  rollback.detectChanges();
  assert(!rollback.componentInstance.accepted && rollback.nativeElement.querySelector('button').getAttribute('aria-checked') === 'true', 'Immediate two-way rollback can leave local model out of sync');
  rollback.destroy();

  setup();
  const controlled = TestBed.createComponent(ControlledHost);
  controlled.detectChanges();
  controlled.nativeElement.querySelector('button').click();
  controlled.detectChanges();
  assert(controlled.componentInstance.requested && !controlled.componentInstance.accepted && controlled.nativeElement.querySelector('button').getAttribute('aria-checked') === 'false', 'Controlled switch remains off after rejection');
  controlled.componentInstance.allow = true;
  controlled.nativeElement.querySelector('button').click();
  controlled.detectChanges();
  assert(controlled.componentInstance.accepted && controlled.nativeElement.querySelector('button').getAttribute('aria-checked') === 'true', 'Controlled switch reflects accepted requests');
  controlled.destroy();

  setup();
  const anchor = document.createElement('button');
  anchor.textContent = 'Anchor';
  anchor.style.cssText = 'position:fixed;left:80px;top:100px;width:90px;height:35px';
  document.body.append(anchor);
  let active = 0;
  const handlers = new Set<EventListenerOrEventListenerObject>();
  const add = document.addEventListener.bind(document);
  const remove = document.removeEventListener.bind(document);
  document.addEventListener = ((type: string, listener: EventListenerOrEventListenerObject, options?: any) => {
    if (type === 'keydown' && !handlers.has(listener)) { handlers.add(listener); active++; }
    add(type, listener, options);
  }) as typeof document.addEventListener;
  document.removeEventListener = ((type: string, listener: EventListenerOrEventListenerObject, options?: any) => {
    if (type === 'keydown' && handlers.delete(listener)) active--;
    remove(type, listener, options);
  }) as typeof document.removeEventListener;
  const popover = TestBed.createComponent(PopoverComponent);
  document.body.append(popover.nativeElement);
  popover.componentRef.setInput('anchor', anchor);
  popover.detectChanges();
  for (let i = 0; i < 5; i++) {
    popover.componentInstance.open.set(true);
    popover.detectChanges();
    await popover.whenStable();
    assert(active === 1, `Popover cycle ${i + 1} has one active listener`);
    const panel = popover.nativeElement.querySelector('.ui-popover__panel') as HTMLElement;
    const rect = anchor.getBoundingClientRect();
    assert(Math.abs(parseFloat(panel.style.top) - rect.bottom) < 0.1 && Math.abs(parseFloat(panel.style.left) - rect.left) < 0.1, `Popover cycle ${i + 1} uses actual browser anchor geometry`);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab' }));
    assert(popover.componentInstance.open(), 'Non-Escape key leaves popover open');
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    popover.detectChanges();
    assert(active === 0 && !popover.componentInstance.open(), `Popover cycle ${i + 1} releases listener on close`);
    assert(document.activeElement === anchor, 'Escape restores anchor focus');
  }
  popover.componentInstance.open.set(true);
  popover.detectChanges();
  popover.destroy();
  assert(active === 0, 'Destroying an open popover releases its listener');
  document.addEventListener = add;
  document.removeEventListener = remove;
  anchor.remove();

  setup();
  const table = TestBed.createComponent(TableComponent);
  const rows = [{ id: 'b', name: 'Beta' }, { id: 'a', name: 'Alpha' }];
  table.componentRef.setInput('rows', rows);
  table.componentRef.setInput('columns', [{ key: 'name', header: 'Name' }]);
  table.componentRef.setInput('trackBy', (row: typeof rows[number]) => row.id);
  table.detectChanges();
  const betaRow = table.nativeElement.querySelectorAll('tbody tr')[0];
  table.nativeElement.querySelector('th button').click();
  table.detectChanges();
  assert(rows.map(row => row.id).join() === 'b,a', 'Sorting does not mutate the consumer array');
  assert(table.nativeElement.querySelectorAll('tbody tr')[1] === betaRow, 'Stable record tracking preserves the row DOM node across sorting');
  assert(table.nativeElement.querySelector('th').getAttribute('aria-sort') === 'ascending', 'Sortable header exposes ascending state');
  table.componentRef.setInput('rows', rows.map(row => ({ ...row })));
  table.detectChanges();
  assert(table.nativeElement.querySelectorAll('tbody tr')[1] === betaRow, 'Stable identifiers preserve row identity across refetched objects');
  table.destroy();
  (window as any).__lessonResults = { passed: results.length, results };
}
run().catch(error => { (window as any).__lessonResults = { error: String(error), stack: error.stack, results }; });

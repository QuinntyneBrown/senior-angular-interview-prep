import {
  Component,
  ElementRef,
  InjectionToken,
  Signal,
  computed,
  contentChildren,
  forwardRef,
  inject,
  input,
  model,
  viewChildren,
} from '@angular/core';

let nextId = 0;

interface TabsContext {
  readonly selectedTab: Signal<TabComponent | undefined>;
}

const TABS = new InjectionToken<TabsContext>('TABS');

@Component({
  selector: 'ui-tab',
  host: {
    class: 'ui-tab-panel',
    role: 'tabpanel',
    tabindex: '0',
    '[id]': 'panelId',
    '[attr.aria-labelledby]': 'tabId',
    '[hidden]': '!selected()',
  },
  template: `<ng-content />`,
})
export class TabComponent {
  readonly label = input.required<string>();
  readonly tabId = `ui-tab-${nextId}`;
  readonly panelId = `ui-tabpanel-${nextId++}`;
  private readonly tabs = inject(TABS);
  readonly selected = computed(() => this.tabs.selectedTab() === this);
}

@Component({
  selector: 'ui-tabs',
  providers: [{ provide: TABS, useExisting: forwardRef(() => TabsComponent) }],
  template: `
    <div role="tablist" class="ui-tabs__list" [attr.aria-label]="label()" (keydown)="onKeydown($event)">
      @for (tab of tabs(); track tab; let i = $index) {
        <button
          #tabButton
          type="button"
          role="tab"
          class="ui-tabs__tab"
          [id]="tab.tabId"
          [attr.aria-controls]="tab.panelId"
          [attr.aria-selected]="i === activeIndex()"
          [tabIndex]="i === activeIndex() ? 0 : -1"
          (click)="selectedIndex.set(i)">
          {{ tab.label() }}
        </button>
      }
    </div>
    <ng-content />
  `,
})
export class TabsComponent implements TabsContext {
  readonly label = input.required<string>();
  readonly selectedIndex = model(0);
  readonly tabs = contentChildren(TabComponent);

  // Clamp, so removing the last tab never leaves nothing selected and nothing focusable.
  readonly activeIndex = computed(() => Math.max(0, Math.min(this.selectedIndex(), this.tabs().length - 1)));
  readonly selectedTab = computed(() => this.tabs()[this.activeIndex()]);
  private readonly buttons = viewChildren<ElementRef<HTMLButtonElement>>('tabButton');

  protected onKeydown(event: KeyboardEvent): void {
    const count = this.tabs().length;
    if (count === 0) return;
    const current = this.activeIndex();
    let next: number;
    switch (event.key) {
      case 'ArrowRight':
        next = (current + 1) % count;
        break;
      case 'ArrowLeft':
        next = (current - 1 + count) % count;
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = count - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    this.selectedIndex.set(next);
    this.buttons()[next]?.nativeElement.focus();
  }
}


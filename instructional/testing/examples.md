# Complete source examples

These marked complete modules are copied from the source questions. Scenario modules intentionally contain behavioral defects. Other slide excerpts are partial, including test pseudocode and package-layout sketches. Supplemental corrected modules are documented separately.

## TST-001 · Scenario · excerpt 1

Source excerpt; markup, styles, package sketches, and test fragments may require the surrounding context.

```ts
describe('TabsComponent', () => {
  it('selects a tab', () => {
    const fixture = TestBed.createComponent(TabsComponent);
    fixture.componentInstance.select(1);
    fixture.detectChanges();

    const active = fixture.nativeElement.querySelector('.ui-tabs__tab--active');
    expect(active).toBeNull();
  });

  it('has a select method', () => {
    const fixture = TestBed.createComponent(TabsComponent);
    expect(typeof fixture.componentInstance.select).toBe('function');
  });
});

```

## TST-001 · Answer · excerpt 2

Source excerpt; markup, styles, package sketches, and test fragments may require the surrounding context.

```ts
@Component({
  imports: [TabsComponent, TabComponent],
  template: `
    <ui-tabs label="Profile">
      <ui-tab label="Account">Account settings</ui-tab>
      <ui-tab label="Security">Security settings</ui-tab>
    </ui-tabs>
    <ui-tabs label="Notifications">
      <ui-tab label="Email">Email settings</ui-tab>
    </ui-tabs>
  `,
})
class TwoTabGroupsHost {}

describe('ui-tabs', () => {
  let loader: HarnessLoader;
  let fixture: ComponentFixture<TwoTabGroupsHost>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TwoTabGroupsHost);
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('selects the first tab initially', async () => {
    const tabs = await loader.getHarness(TabsHarness.with({ label: 'Profile' }));
    expect(await tabs.getSelectedTabLabel()).toBe('Account');
  });

  it('moves selection and focus with the arrow keys and wraps', async () => {
    const tabs = await loader.getHarness(TabsHarness.with({ label: 'Profile' }));
    await tabs.pressKeyOnSelectedTab(TestKey.RIGHT_ARROW);
    expect(await tabs.getSelectedTabLabel()).toBe('Security');
    expect(await tabs.isSelectedTabFocused()).toBe(true);
    await tabs.pressKeyOnSelectedTab(TestKey.RIGHT_ARROW);
    expect(await tabs.getSelectedTabLabel()).toBe('Account');
  });

  it('gives every element a unique id', () => {
    const ids = [...fixture.nativeElement.querySelectorAll('[id]')].map((el: Element) => el.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('has no axe violations', async () => {
    const results = await axe.run(fixture.nativeElement);
    expect(results.violations).toEqual([]);
  });
});

```

## TST-001 · Answer · excerpt 3

Complete verified TypeScript module.

```ts
import { BaseHarnessFilters, ComponentHarness, HarnessPredicate, TestKey } from '@angular/cdk/testing';

export interface TabsHarnessFilters extends BaseHarnessFilters {
  label?: string;
}

export class TabsHarness extends ComponentHarness {
  static hostSelector = 'ui-tabs';

  static with(options: TabsHarnessFilters = {}): HarnessPredicate<TabsHarness> {
    return new HarnessPredicate(TabsHarness, options).addOption('label', options.label, (harness, label) =>
      HarnessPredicate.stringMatches(harness.getLabel(), label),
    );
  }

  private readonly tablist = this.locatorFor('[role="tablist"]');
  private readonly tabs = this.locatorForAll('[role="tab"]');
  private readonly selectedTab = this.locatorFor('[role="tab"][aria-selected="true"]');

  async getLabel(): Promise<string | null> {
    return (await this.tablist()).getAttribute('aria-label');
  }

  async getTabLabels(): Promise<string[]> {
    return Promise.all((await this.tabs()).map(tab => tab.text()));
  }

  async getSelectedTabLabel(): Promise<string> {
    return (await this.selectedTab()).text();
  }

  async selectTab(label: string): Promise<void> {
    for (const tab of await this.tabs()) {
      if ((await tab.text()) === label) return tab.click();
    }
    throw new Error(`No tab labelled "${label}".`);
  }

  async pressKeyOnSelectedTab(key: TestKey): Promise<void> {
    return (await this.selectedTab()).sendKeys(key);
  }

  async isSelectedTabFocused(): Promise<boolean> {
    return (await this.selectedTab()).isFocused();
  }
}

```

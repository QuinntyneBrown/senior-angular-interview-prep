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


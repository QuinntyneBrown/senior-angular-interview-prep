---
id: TST-001
title: Tests that pass while the component is broken
topic: testing
format: code-review
difficulty: senior
minutes: 12
angular: "20+"
tags: [testing, harnesses, test-host, axe, keyboard]
---

# Tests that pass while the component is broken

## Scenario

The first version of the tabs component in A11Y-003 shipped with keyboard support missing and
duplicate ids, yet its tests were green. These are its tests:

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

Product teams also test their own screens that contain `ui-tabs`. Their tests query
`.ui-tabs__tab--active` and broke when the library renamed that class.

## Question

**Why did these tests not catch the bugs? Rewrite the testing approach for the library, and say
what the library should give product teams for their tests.**

## Hints

<details>
<summary>Hint 1</summary>

How many tabs does the first test render? Why is the assertion `toBeNull()`?

</details>

<details>
<summary>Hint 2</summary>

Which of these tests would still pass if every line of the template were deleted?

</details>

## Answer

### Why they missed everything

- **No content.** `TestBed.createComponent(TabsComponent)` renders the tabs with nothing projected,
  so there are no tabs. Someone made the test pass by asserting `toBeNull()`, so it now checks that
  nothing is selected, which is meaningless.
- **Driving internals.** Calling `select(1)` skips what users actually do (click, arrow keys,
  Home, End), so keyboard support was never exercised.
- **Asserting on private markup.** `.ui-tabs__tab--active` is an internal class. The tests say
  nothing about what users and assistive technology perceive: roles, `aria-selected`, focus.
- **Testing that a method exists** checks the TypeScript compiler, not behaviour.
- **One instance only.** The duplicate-id bug needs two tab groups on one page.

### The approach: test through a host, like a consumer

Render the component inside a small host component whose template looks like real usage, interact
the way users do, and assert on roles, states and focus.

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

### Ship a harness: the library's testing API

Product teams should never query the library's internal DOM. A **component harness** is a
supported, versioned testing API: it hides the markup, works in unit tests and end-to-end tests,
and waits for the component to be stable. When the library changes its markup, it updates its own
harness, and consumers' tests keep passing.

```ts verify
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

The harness is published from a testing entry point (`@acme/ui/tabs/testing`), documented, and
covered by the same versioning rules as the component.

### What else belongs in the library's test strategy

- **Accessibility checks** with axe on every component state. Run them in a real browser
  (for example Vitest browser mode or Playwright), because DOM emulations cannot compute colour
  contrast or layout.
- **Visual regression tests** for each component in each theme, so token changes are reviewed.
- **Keyboard tests** written from the ARIA pattern's keyboard table, one assertion per row.
- **Forms tests** with a real `FormControl` for every form control (see API-004).

## Scoring

| Area | Strong signal | Weak signal |
| --- | --- | --- |
| Diagnosis | Spots the missing projected content and the meaningless `toBeNull()` | Says "add more tests" |
| Test style | Host component, user interactions, role and state assertions | Keeps calling component methods |
| Consumer support | Proposes a published, versioned harness | Tells teams to use `data-testid` on internals |
| Breadth | Adds axe in a real browser, keyboard tables, visual regression | Only unit tests |

## Follow-up questions

1. What belongs in a harness's API, and what should never be exposed?
2. How would you test that a live region announcement happens?
3. Your visual regression suite has 2,000 screenshots and is flaky. What do you do?

## References

- [Angular CDK: Component harnesses overview](https://material.angular.dev/cdk/test-harnesses/overview)
- [Angular Material guide: Creating harnesses for your components](https://material.angular.dev/guide/creating-component-harnesses)
- [Angular: Testing components with a host](https://angular.dev/guide/testing/components-scenarios)
- [axe-core](https://github.com/dequelabs/axe-core)
- [Testing Library: Guiding principles](https://testing-library.com/docs/guiding-principles/)

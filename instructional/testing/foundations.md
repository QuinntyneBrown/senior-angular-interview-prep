# Testing Angular Libraries Through Consumer Behavior

## Green tests need meaningful assertions

Welcome to the testing lesson. The question shows tabs that shipped without keyboard support and with duplicate identifiers even though the tests were green. A passing test is evidence only for the assertion it actually makes. Checking that a select method exists proves the shape of an object. It does not prove a user can select a tab with the keyboard.

A test can even preserve a bug if it expects the wrong result. An assertion that the active class is absent after selection does not validate selection; it blesses that absence. Begin by writing the user-visible contract in plain language. A tab is selected, its panel is visible, focus moves according to the keyboard pattern, and identifiers remain unique across instances.

The testing strategy should reflect how the library is consumed. Product teams bind inputs in templates, project content, handle outputs, and connect forms. A component created alone with direct private method calls does not exercise those boundaries. Use a small host that resembles a real consumer, then interact through the rendered interface and assert observable results.

## A host exercises Angular integration

A host template gives Angular the opportunity to bind inputs, create projected children, connect models, and resolve parent-provided injection contexts. This matters for tabs because the group discovers projected tab components. Calling a method on an isolated group cannot prove that discovery or its panel relationships work.

Render more than one instance. Duplicate identifiers are often invisible in a single fixture. A second group also catches selectors that accidentally operate on the entire document instead of the current component. Give the groups different names and labels so a test can locate the intended instance without relying on position.

Change consumer inputs after the initial render. A component may initialize correctly and then ignore a reset or a new set of children. Test removal, empty content, and valid dynamic changes if they are supported. This shifts the test from a constructor snapshot to the contract over time. A shared component lives inside an application that changes.

```html
<ui-tabs label="Profile">
  <ui-tab label="Account">Account settings</ui-tab>
  <ui-tab label="Security">Security settings</ui-tab>
</ui-tabs>
<ui-tabs label="Notifications">
  <ui-tab label="Email">Email settings</ui-tab>
</ui-tabs>
```

## Interactions should exercise the event path

Directly calling select skips the event binding, key handling, default prevention, focus movement, and disabled checks. For a click contract, click the real control. For a keyboard contract, focus the relevant element and send the actual key in a browser test. Synthetic dispatch can exercise a handler, but it does not reproduce browser default actions such as Tab traversal.

Write assertions from the chosen interaction table. In automatic tabs, ArrowRight moves focus and selection, wrapping at the final tab. Home and End reach the edges. Exactly one tab should be in the tab order, and its selected panel should be visible. Manual activation has a different table, so the test must not assume both patterns simultaneously.

Use roles, accessible names, and supported harness methods to locate behavior. A private class used for styling is a fragile consumer test selector. The library may use internal selectors inside its harness because it owns both, but product tests should not need to know them. Test the result rather than the implementation detail that happened to create it.

## Harnesses are versioned testing interfaces

A component harness exposes meaningful operations such as selectTab and getSelectedTabLabel. It encapsulates queries, interactions, and stabilization. A filter can choose a group by its public label. This creates a boundary between product tests and component internals.

Expose the capabilities a consumer needs to verify a task. Do not return internal DOM nodes, private fields, or CSS class names merely to make the current test easy. Those leaks defeat the abstraction. Errors should explain when a requested tab does not exist rather than silently selecting an arbitrary fallback.

Publish harnesses through a testing entry point and document supported environments. Keep the harness and component versions compatible. If a component's markup changes, the harness implementation can adapt while its task API stays stable. A harness API change itself can break consumer tests, so review and version it with the same care as an input or output.

```ts
const tabs = await loader.getHarness(
  TabsHarness.with({ label: 'Profile' })
);
await tabs.selectTab('Security');
expect(await tabs.getSelectedTabLabel()).toBe('Security');
// Consumer task, not a private class selector.
```

## Stabilization must not hide rendering bugs

Angular tests can force a render with detectChanges. That is useful for many assertions, but it can mask a missing change-detection notification. A promise callback that writes a plain field may appear correct when the test manually runs change detection even though the application would not render it.

For notification-sensitive behavior, use a zoneless fixture and wait for stability without forcing every update. A signal consumed in the template, setInput, or markForCheck should notify Angular. Test an asynchronous completion and a timer reset through the same path the component uses. This verifies scheduling as well as the final value.

Control time where the behavior depends on a deadline. Fake timers or an injected scheduler can make a debounce or timeout deterministic. But do not replace the event or scheduling mechanism that is the subject of the test. Keep at least one browser integration case for layout, focus, and native behavior that an emulated DOM cannot represent accurately.

## Accessibility automation and its limits

An accessibility scanner can detect missing names, invalid ARIA relationships, and many contrast failures in a rendered browser. Run it on relevant component states: initial, selected, invalid, expanded, and disabled where those states change the tree. A single empty fixture tells you little about a composite control.

Keyboard and focus need explicit behavior tests. A scanner can accept a tablist whose ArrowRight handler does nothing. Live regions need a different kind of evidence: verify that a persistent connected region receives the intended message with the chosen politeness, then manually check supported screen reader combinations. Do not claim a DOM assertion proves that a user heard the exact sentence.

Combine tests rather than letting one category stand in for all others. Compiler checks prove types and templates. Browser tests prove the exercised behavior. Visual checks prove the reviewed appearance. Manual assistive-technology testing covers interaction and announcements that automation cannot fully certify. Record those boundaries in the release evidence.

## Make visual regression coverage intentional

A large screenshot suite can be noisy when every story is captured in every theme at every viewport. Start by mapping the behaviors each image protects. Keep representative states, themes, density variants, and text-growth cases. Remove redundant captures only after confirming their risk is covered elsewhere.

Control the environment: fonts, viewport, locale, animation, loading data, and time. Wait for a meaningful ready state rather than an arbitrary long sleep. Diagnose flakes by category. A random data value is different from a late web font, and a layout race is different from antialiasing noise. Fix the cause before loosening comparison thresholds.

Visual tests need reviewable baselines. A baseline update should identify the intended change and the affected states. Do not approve thousands of images blindly or turn off failures globally. Use focused diffs, ownership, and deterministic fixtures so the suite remains a useful signal rather than a recurring cost everyone learns to ignore.

## Prove the regression test detects the defect

When fixing a bug, make sure the new test fails against the old behavior for the intended reason. If the original tabs lack a keyboard handler, an ArrowRight test should fail because focus and selection do not change, not because the fixture has an unrelated missing import. This is the evidence that the test protects the correction.

Avoid assertions that merely mirror the source. Checking that a function assigns a field is weaker than observing the resulting selected panel and focus. Test the public result with realistic input and multiple instances. Where the contract has boundary cases, include the smallest cases that expose them rather than a huge collection of near-duplicate examples.

In the upcoming question, we will replace method-existence checks with host-based interactions and a supported harness. We will explain what the harness hides, what remains part of its public API, and how accessibility and visual checks complement it. The goal is a test suite that tells the library team whether consumers can still perform their tasks.

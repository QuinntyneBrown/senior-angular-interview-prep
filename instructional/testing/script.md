# Testing Angular Libraries Through Consumer Behavior

## Green tests need meaningful assertions

Welcome to the testing lesson. The question shows tabs that shipped without keyboard support and with duplicate identifiers even though the tests were green. A passing test is evidence only for the assertion it actually makes. Checking that a select method exists proves the shape of an object. It does not prove a user can select a tab with the keyboard.

## Green tests need meaningful assertions · 2

A test can even preserve a bug if it expects the wrong result. An assertion that the active class is absent after selection does not validate selection; it blesses that absence. Begin by writing the user-visible contract in plain language. A tab is selected, its panel is visible, focus moves according to the keyboard pattern, and identifiers remain unique across instances.

## Green tests need meaningful assertions · 3

The testing strategy should reflect how the library is consumed. Product teams bind inputs in templates, project content, handle outputs, and connect forms. A component created alone with direct private method calls does not exercise those boundaries. Use a small host that resembles a real consumer, then interact through the rendered interface and assert observable results.

## A host exercises Angular integration

A host template gives Angular the opportunity to bind inputs, create projected children, connect models, and resolve parent-provided injection contexts. This matters for tabs because the group discovers projected tab components. Calling a method on an isolated group cannot prove that discovery or its panel relationships work.

## A host exercises Angular integration · 2

Render more than one instance. Duplicate identifiers are often invisible in a single fixture. A second group also catches selectors that accidentally operate on the entire document instead of the current component. Give the groups different names and labels so a test can locate the intended instance without relying on position.

## A host exercises Angular integration · 3

Change consumer inputs after the initial render. A component may initialize correctly and then ignore a reset or a new set of children. Test removal, empty content, and valid dynamic changes if they are supported. This shifts the test from a constructor snapshot to the contract over time. A shared component lives inside an application that changes.

## Interactions should exercise the event path

Directly calling select skips the event binding, key handling, default prevention, focus movement, and disabled checks. For a click contract, click the real control. For a keyboard contract, focus the relevant element and send the actual key in a browser test. Synthetic dispatch can exercise a handler, but it does not reproduce browser default actions such as Tab traversal.

## Interactions should exercise the event path · 2

Write assertions from the chosen interaction table. In automatic tabs, ArrowRight moves focus and selection, wrapping at the final tab. Home and End reach the edges. Exactly one tab should be in the tab order, and its selected panel should be visible. Manual activation has a different table, so the test must not assume both patterns simultaneously.

## Interactions should exercise the event path · 3

Use roles, accessible names, and supported harness methods to locate behavior. A private class used for styling is a fragile consumer test selector. The library may use internal selectors inside its harness because it owns both, but product tests should not need to know them. Test the result rather than the implementation detail that happened to create it.

## Harnesses are versioned testing interfaces

A component harness exposes meaningful operations such as selectTab and getSelectedTabLabel. It encapsulates queries, interactions, and stabilization. A filter can choose a group by its public label. This creates a boundary between product tests and component internals.

## Harnesses are versioned testing interfaces · 2

Expose the capabilities a consumer needs to verify a task. Do not return internal DOM nodes, private fields, or CSS class names merely to make the current test easy. Those leaks defeat the abstraction. Errors should explain when a requested tab does not exist rather than silently selecting an arbitrary fallback.

## Harnesses are versioned testing interfaces · 3

Publish harnesses through a testing entry point and document supported environments. Keep the harness and component versions compatible. If a component's markup changes, the harness implementation can adapt while its task API stays stable. A harness API change itself can break consumer tests, so review and version it with the same care as an input or output.

## Stabilization must not hide rendering bugs

Angular tests can force a render with detectChanges. That is useful for many assertions, but it can mask a missing change-detection notification. A promise callback that writes a plain field may appear correct when the test manually runs change detection even though the application would not render it.

## Stabilization must not hide rendering bugs · 2

For notification-sensitive behavior, use a zoneless fixture and wait for stability without forcing every update. A signal consumed in the template, setInput, or markForCheck should notify Angular. Test an asynchronous completion and a timer reset through the same path the component uses. This verifies scheduling as well as the final value.

## Stabilization must not hide rendering bugs · 3

Control time where the behavior depends on a deadline. Fake timers or an injected scheduler can make a debounce or timeout deterministic. But do not replace the event or scheduling mechanism that is the subject of the test. Keep at least one browser integration case for layout, focus, and native behavior that an emulated DOM cannot represent accurately.

## Accessibility automation and its limits

An accessibility scanner can detect missing names, invalid ARIA relationships, and many contrast failures in a rendered browser. Run it on relevant component states: initial, selected, invalid, expanded, and disabled where those states change the tree. A single empty fixture tells you little about a composite control.

## Accessibility automation and its limits · 2

Keyboard and focus need explicit behavior tests. A scanner can accept a tablist whose ArrowRight handler does nothing. Live regions need a different kind of evidence: verify that a persistent connected region receives the intended message with the chosen politeness, then manually check supported screen reader combinations. Do not claim a DOM assertion proves that a user heard the exact sentence.

## Accessibility automation and its limits · 3

Combine tests rather than letting one category stand in for all others. Compiler checks prove types and templates. Browser tests prove the exercised behavior. Visual checks prove the reviewed appearance. Manual assistive-technology testing covers interaction and announcements that automation cannot fully certify. Record those boundaries in the release evidence.

## Make visual regression coverage intentional

A large screenshot suite can be noisy when every story is captured in every theme at every viewport. Start by mapping the behaviors each image protects. Keep representative states, themes, density variants, and text-growth cases. Remove redundant captures only after confirming their risk is covered elsewhere.

## Make visual regression coverage intentional · 2

Control the environment: fonts, viewport, locale, animation, loading data, and time. Wait for a meaningful ready state rather than an arbitrary long sleep. Diagnose flakes by category. A random data value is different from a late web font, and a layout race is different from antialiasing noise. Fix the cause before loosening comparison thresholds.

## Make visual regression coverage intentional · 3

Visual tests need reviewable baselines. A baseline update should identify the intended change and the affected states. Do not approve thousands of images blindly or turn off failures globally. Use focused diffs, ownership, and deterministic fixtures so the suite remains a useful signal rather than a recurring cost everyone learns to ignore.

## Prove the regression test detects the defect

When fixing a bug, make sure the new test fails against the old behavior for the intended reason. If the original tabs lack a keyboard handler, an ArrowRight test should fail because focus and selection do not change, not because the fixture has an unrelated missing import. This is the evidence that the test protects the correction.

## Prove the regression test detects the defect · 2

Avoid assertions that merely mirror the source. Checking that a function assigns a field is weaker than observing the resulting selected panel and focus. Test the public result with realistic input and multiple instances. Where the contract has boundary cases, include the smallest cases that expose them rather than a huge collection of near-duplicate examples.

## Prove the regression test detects the defect · 3

In the upcoming question, we will replace method-existence checks with host-based interactions and a supported harness. We will explain what the harness hides, what remains part of its public API, and how accessibility and visual checks complement it. The goal is a test suite that tells the library team whether consumers can still perform their tasks.

## TST-001 · Scenario

We now review TST-001: Tests that pass while the component is broken. Inspect the consumer contract and identify the mechanism behind each reported defect.

## TST-001 · Scenario

The first version of the tabs component in A11Y-003 shipped with keyboard support missing and duplicate ids, yet its tests were green. These are its tests:

## TST-001 · Scenario · block 1 · page 1

This is the original code, part 1 of 2. Read this part in the context of Scenario. Trace which element or value the consumer actually interacts with. We will compare this implementation with the correction after the question.

## TST-001 · Scenario · block 2 · page 2

This is the original code, part 2 of 2. Read this part in the context of Scenario. Trace which element or value the consumer actually interacts with. We will compare this implementation with the correction after the question.

## TST-001 · Scenario

Product teams also test their own screens that contain `ui-tabs`. Their tests query `.ui-tabs__tab--active` and broke when the library renamed that class.

## TST-001 · Interview question

**Interviewer:** Why did these tests not catch the bugs? Rewrite the testing approach for the library, and say what the library should give product teams for their tests.

[pause 5s]

## TST-001 · Why they missed everything

No content. `TestBed.createComponent(TabsComponent)` renders the tabs with nothing projected, so there are no tabs. Someone made the test pass by asserting `toBeNull()`, so it now checks that nothing is selected, which is meaningless. Driving internals. Calling `select(1)` skips what users actually do (click, arrow keys, Home, End), so keyboard support was never exercised. Asserting on private markup. `.ui-tabs__tab--active` is an internal class. The tests say nothing about what users and assistive technology perceive: roles, `aria-selected`, focus. Testing that a method exists checks the TypeScript compiler, not behaviour. One instance only. The duplicate-id bug needs two tab groups on one page.

## TST-001 · The approach: test through a host, like a consumer

Render the component inside a small host component whose template looks like real usage, interact the way users do, and assert on roles, states and focus.

## TST-001 · Answer · block 1 · page 1

This is the answer code, part 1 of 4. Read this part in the context of The approach: test through a host, like a consumer. Follow the declarations and event paths as a single implementation. The adjacent explanation describes the contract; the complete source is available with the lesson so you can inspect the remaining context.

## TST-001 · Answer · block 2 · page 2

This is the answer code, part 2 of 4. Read this part in the context of The approach: test through a host, like a consumer. Follow the declarations and event paths as a single implementation. The adjacent explanation describes the contract; the complete source is available with the lesson so you can inspect the remaining context.

## TST-001 · Answer · block 3 · page 3

This is the answer code, part 3 of 4. Read this part in the context of The approach: test through a host, like a consumer. Follow the declarations and event paths as a single implementation. The adjacent explanation describes the contract; the complete source is available with the lesson so you can inspect the remaining context.

## TST-001 · Answer · block 4 · page 4

This is the answer code, part 4 of 4. Read this part in the context of The approach: test through a host, like a consumer. Follow the declarations and event paths as a single implementation. The adjacent explanation describes the contract; the complete source is available with the lesson so you can inspect the remaining context.

## TST-001 · Ship a harness: the library's testing API

Product teams should never query the library's internal DOM. A component harness is a supported, versioned testing API: it hides the markup, works in unit tests and end-to-end tests, and waits for the component to be stable. When the library changes its markup, it updates its own harness, and consumers' tests keep passing.

## TST-001 · Answer · block 5 · page 1

This is the answer code, part 1 of 4. Focus on TabsHarnessFilters, TabsHarness. Follow the declarations and event paths as a single implementation. The adjacent explanation describes the contract; the complete source is available with the lesson so you can inspect the remaining context.

## TST-001 · Answer · block 6 · page 2

This is the answer code, part 2 of 4. Focus on tablist, tabs, selectedTab. Follow the declarations and event paths as a single implementation. The adjacent explanation describes the contract; the complete source is available with the lesson so you can inspect the remaining context.

## TST-001 · Answer · block 7 · page 3

This is the answer code, part 3 of 4. Read this part in the context of Ship a harness: the library's testing API. Follow the declarations and event paths as a single implementation. The adjacent explanation describes the contract; the complete source is available with the lesson so you can inspect the remaining context.

## TST-001 · Answer · block 8 · page 4

This is the answer code, part 4 of 4. Read this part in the context of Ship a harness: the library's testing API. Follow the declarations and event paths as a single implementation. The adjacent explanation describes the contract; the complete source is available with the lesson so you can inspect the remaining context.

## TST-001 · Ship a harness: the library's testing API

The harness is published from a testing entry point (`@acme/ui/tabs/testing`), documented, and covered by the same versioning rules as the component.

## TST-001 · What else belongs in the library's test strategy

Accessibility checks with axe on every component state. Run them in a real browser (for example Vitest browser mode or Playwright), because DOM emulations cannot compute colour contrast or layout. Visual regression tests for each component in each theme, so token changes are reviewed. Keyboard tests written from the ARIA pattern's keyboard table, one assertion per row. Forms tests with a real `FormControl` for every form control (see API-004).

## TST-001 · Follow-up 1

**Interviewer:** What belongs in a harness's API, and what should never be exposed?

[pause 5s]

Expose task-level operations and observable state: select a tab by label, read the selected label, send a supported key, and inspect focus when that is meaningful. Hide private fields, raw nodes, styling classes, and internal component hierarchy. The harness can use internal selectors because the library owns their maintenance. Publish filters and useful errors, and version the harness API. If consumers still need to query private DOM after obtaining the harness, revisit the missing supported operation.

## TST-001 · Follow-up 2

**Interviewer:** How would you test that a live region announcement happens?

[pause 5s]

Verify a connected persistent live region receives the intended new text with the chosen politeness and timing, or verify the announcer boundary in a focused unit test. Then use real browser integration to ensure the region exists and updates. An automated DOM assertion cannot prove the exact speech emitted by a screen reader. Perform manual checks on supported combinations for repetition, interruption, and rapid changes, and record those limits in the test evidence.

## TST-001 · Follow-up 3

**Interviewer:** Your visual regression suite has 2,000 screenshots and is flaky. What do you do?

[pause 5s]

Classify flakes before changing thresholds: fonts, animation, data, timing, viewport, and actual layout races need different fixes. Freeze irrelevant variability and wait for a deterministic ready condition. Map each screenshot to a risk, keep representative themes and states, and remove redundant captures only when coverage remains. Review baseline changes deliberately. Do not approve all two thousand images blindly or disable the suite; rebuild a smaller reliable signal with clear ownership.

## Final review checklist

Review the lesson by answering each main question and follow-up aloud. For Testing Angular Libraries Through Consumer Behavior, connect each reported symptom to its mechanism, explain the corrected public contract, and name a regression check that exercises the consumer path. State compatibility and accessibility limitations clearly. The linked transcript, complete code, source questions, and verification report let you repeat the exercises at your own pace.
